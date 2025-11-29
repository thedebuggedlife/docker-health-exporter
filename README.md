# Docker Health Exporter

[![Latest Version](https://img.shields.io/github/v/release/thedebuggedlife/docker-health-exporter)](https://github.com/thedebuggedlife/docker-health-exporter/releases)
[![CI](https://github.com/thedebuggedlife/docker-health-exporter/actions/workflows/ci.yml/badge.svg)](https://github.com/thedebuggedlife/docker-health-exporter/actions/workflows/ci.yml)
[![Code Coverage](https://img.shields.io/codecov/c/github/thedebuggedlife/docker-health-exporter)](https://codecov.io/gh/thedebuggedlife/docker-health-exporter)

A Prometheus exporter that tracks the health of Docker containers.

## Metrics

The exporter exposes the following metrics:

| Metric                               | Description                               | Labels                        |
| ------------------------------------ | ----------------------------------------- | ----------------------------- |
| `docker_container_status`            | Status of the container                   | `name`, `status`              |
| `docker_container_uptime_seconds`    | Uptime of the container in seconds        | `name`                        |
| `docker_container_restart_count`     | Restart count of the container            | `name`                        |
| `docker_compose_health_status`       | Health status of the compose service      | `project`, `service`, `status`|

## Usage

### Docker

To run the exporter as a Docker container, use the following command:

```bash
docker run -d \
  --name docker-health-exporter \
  -p 9090:9090 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/thedebuggedlife/docker-health-exporter:latest
```

### Docker Compose

To run the exporter with Docker Compose, add the following service to your `docker-compose.yml` file:

```yaml
services:
  exporter:
    image: ghcr.io/thedebuggedlife/docker-health-exporter:latest
    ports:
      - "9090:9090"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

## Configuration

The exporter can be configured using the following environment variables:

| Variable        | Description                               | Default           |
| --------------- | ----------------------------------------- | ----------------- |
| `PORT`          | The port that the metrics handler listens at | `9090`            |
| `DOCKER_SOCKET` | The address of the docker socket          | `/var/run/docker.sock` |

```