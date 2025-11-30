import http from 'http';
import client from 'prom-client';
import { getContainers, docker } from './docker';
import {
  containerRunning,
  containerUptime,
  containerRestartCount,
  containerHealthy,
} from './metrics';

export const collectMetrics = async () => {
  const containers = await getContainers();

  for (const containerData of containers) {
    const container = await docker.getContainer(containerData.Id).inspect();
    const id = containerData.Id;
    const labels = {
      id,
      name: container.Name.substring(1),
      project: container.Config.Labels['com.docker.compose.project'] || '',
      service: container.Config.Labels['com.docker.compose.service'] || '',
    }

    const running = container.State.Status === 'running';
    containerRunning.set(labels, running ? 1 : 0);

    if (container.State.Health?.Status) {
      const healthy = container.State.Health?.Status === 'healthy';
      containerHealthy.set(labels, healthy ? 1 : 0);;  
    }

    const uptime = running ? new Date(container.State.StartedAt).getTime() : 0;
    containerUptime.set(labels, uptime);

    containerRestartCount.set(labels, container.RestartCount);
  }
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
