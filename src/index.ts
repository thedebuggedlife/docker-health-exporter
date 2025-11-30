import http from 'http';
import client from 'prom-client';
import { getContainers, docker } from './docker';
import {
  containerInfo,
  containerUptime,
  containerRestartCount,
  containerHealth,
} from './metrics';

export const collectMetrics = async () => {
  const containers = await getContainers();

  for (const containerData of containers) {
    const container = await docker.getContainer(containerData.Id).inspect();
    const name = container.Name.substring(1);

    const composeProject = container.Config.Labels['com.docker.compose.project'] || '';
    const composeService = container.Config.Labels['com.docker.compose.service'] || '';

    const status = container.State.Status;
    containerInfo.labels(containerData.Id, name, status, composeProject, composeService).set(1);

    const health = container.State.Health?.Status;
    if (health) {
      containerHealth.labels(containerData.Id, health).set(1);
    }

    const uptime = status === 'running' ? new Date(container.State.StartedAt).getTime() : 0;
    containerUptime.labels(containerData.Id).set(uptime);

    containerRestartCount.labels(containerData.Id).set(container.RestartCount);
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
