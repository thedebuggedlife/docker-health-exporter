import { Gauge } from 'prom-client';

export const containerInfo = new Gauge({
  name: 'docker_container_info',
  help: 'All information about containers to use in tabular form',
  labelNames: ['id', 'name', 'project', 'service', 'status', 'health'],
});

export const containerRunning = new Gauge({
  name: 'docker_container_running',
  help: 'Whether a container is running (1) or not (0)',
  labelNames: ['id', 'name', 'project', 'service'],
});

export const containerHealthy = new Gauge({
  name: 'docker_container_healthy',
  help: 'Whether a container is healthy (1) or not (0)',
  labelNames: ['id', 'name', 'project', 'service'],
});

export const containerUptime = new Gauge({
  name: 'docker_container_uptime_milliseconds',
  help: 'Uptime of the container in milliseconds',
  labelNames: ['id', 'name', 'project', 'service'],
});

export const containerRestartCount = new Gauge({
  name: 'docker_container_restart_count',
  help: 'Restart count of the container',
  labelNames: ['id', 'name', 'project', 'service'],
});
