import { Gauge } from 'prom-client';

export const containerInfo = new Gauge({
  name: 'docker_container_info',
  help: 'Information about a docker container. Value is always 1.',
  labelNames: ['id', 'name', 'status', 'project', 'service'],
});

export const containerHealth = new Gauge({
  name: 'docker_container_health',
  help: 'Uptime of the container in seconds',
  labelNames: ['id', 'health'],
});

export const containerUptime = new Gauge({
  name: 'docker_container_uptime_milliseconds',
  help: 'Uptime of the container in milliseconds',
  labelNames: ['id'],
});

export const containerRestartCount = new Gauge({
  name: 'docker_container_restart_count',
  help: 'Restart count of the container',
  labelNames: ['id'],
});
