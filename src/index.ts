import http from 'http';
import client from 'prom-client';
import { getContainers, docker } from './docker';
import {
  containerRunning,
  containerUptime,
  containerRestartCount,
  containerHealthy,
  containerInfo,
} from './metrics';

export const collectMetrics = async () => {
  // 1. Reset all gauges to remove data from containers that no longer exist
  containerInfo.reset();
  containerRunning.reset();
  containerUptime.reset();
  containerRestartCount.reset();
  containerHealthy.reset();

  const containers = await getContainers();

  // 2. Optimization: Use Promise.all to inspect containers in parallel
  // This prevents the scrape from timing out if you have many containers.
  await Promise.all(containers.map(async (containerData) => {
    try {
      // Note: inspect() might fail if the container is removed 
      // between listContainers() and inspect()
      const container = await docker.getContainer(containerData.Id).inspect();
      
      const id = containerData.Id;
      const labels = {
        id,
        name: container.Name.substring(1), // Removes the leading '/'
        project: container.Config.Labels['com.docker.compose.project'] || '',
        service: container.Config.Labels['com.docker.compose.service'] || '',
      };

      containerInfo.set({
        ...labels,
        status: container.State.Status,
        health: container.State.Health?.Status || '',
      }, 1);

      const running = container.State.Status === 'running';
      containerRunning.set(labels, running ? 1 : 0);

      // Only set healthy metric if healthcheck is configured
      if (container.State.Health?.Status) {
        const healthy = container.State.Health?.Status === 'healthy';
        containerHealthy.set(labels, healthy ? 1 : 0);
      }

      if (running) {
        const uptime = new Date(container.State.StartedAt).getTime();
        containerUptime.set(labels, uptime);
      }

      containerRestartCount.set(labels, container.RestartCount);
    } catch (error) {
      // Handle race condition where container dies during scrape
      console.warn(`Could not inspect container ${containerData.Id}:`, error);
    }
  }));
};

const server = http.createServer(async (req, res) => {
  if (req.url === '/metrics') {
    try {
      await collectMetrics();
      res.setHeader('Content-Type', client.register.contentType);
      res.end(await client.register.metrics());
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.end('Error collecting metrics');
    }
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

const port = process.env.PORT || 9090;

if (require.main === module) {
  server.listen(port, () => {
    console.log(`Exporter listening on port ${port}`);
  });
}

const shutdown = () => {
  console.log('Shutting down exporter');
  server.close(() => {
    console.log('Exporter shut down');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
