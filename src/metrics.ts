import { Gauge } from 'prom-client';

export const containerStatus = new Gauge({
  name: 'docker_container_status',
  help: 'Status of the container',
  labelNames: ['name', 'status'],
});

export const containerUptime = new Gauge({
  name: 'docker_container_uptime_seconds',
  help: 'Uptime of the container in seconds',
  labelNames: ['name'],
});

export const containerRestartCount = new Gauge({
  name: 'docker_container_restart_count',
  help: 'Restart count of the container',
  labelNames: ['name'],
});

export const composeHealthStatus = new Gauge({
  name: 'docker_compose_health_status',
  help: 'Health status of the compose service',
  labelNames: ['project', 'service', 'status'],
});
