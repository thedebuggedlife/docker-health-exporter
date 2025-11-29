import http from 'http';
import client from 'prom-client';
import { getContainers, docker } from './docker';
import {
  containerInfo,
  containerUptime,
  containerRestartCount,
} from './metrics';

export const collectMetrics = async () => {
  const containers = await getContainers();

  for (const containerData of containers) {
    const container = await docker.getContainer(containerData.Id).inspect();
    const name = container.Name.substring(1);

    const composeProject = container.Config.Labels['com.docker.compose.project'] || '';
    const composeService = container.Config.Labels['com.docker.compose.service'] || '';

    const status = container.State.Status;
    const health = container.State.Health?.Status || '';

    containerInfo.labels(name, status, health, composeProject, composeService).set(1);

    const uptime = status === 'running' ? new Date(container.State.StartedAt).getTime() / 1000 : 0;
    containerUptime.labels(name, composeProject, composeService).set(uptime);

    containerRestartCount.labels(name, composeProject, composeService).set(container.RestartCount);
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
