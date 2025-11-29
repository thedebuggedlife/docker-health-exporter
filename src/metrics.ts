import { Gauge } from 'prom-client';

export const containerInfo = new Gauge({
  name: 'docker_container_info',
  help: 'Information about a docker container. Value is always 1.',
  labelNames: ['name', 'status', 'health', 'project', 'service'],
});

export const containerUptime = new Gauge({
  name: 'docker_container_uptime_seconds',
  help: 'Uptime of the container in seconds',
  labelNames: ['name', 'project', 'service'],
});

export const containerRestartCount = new Gauge({
  name: 'docker_container_restart_count',
  help: 'Restart count of the container',
  labelNames: ['name', 'project', 'service'],
});
