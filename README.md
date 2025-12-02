# Docker Health Exporter

[![Latest Version](https://img.shields.io/github/v/release/thedebuggedlife/docker-health-exporter)](https://github.com/thedebuggedlife/docker-health-exporter/releases)
[![CI](https://github.com/thedebuggedlife/docker-health-exporter/actions/workflows/ci.yml/badge.svg)](https://github.com/thedebuggedlife/docker-health-exporter/actions/workflows/ci.yml)
[![Code Coverage](https://img.shields.io/codecov/c/github/thedebuggedlife/docker-health-exporter)](https://codecov.io/gh/thedebuggedlife/docker-health-exporter)

A Prometheus exporter that tracks the health of Docker containers.

## Metrics

The exporter exposes the following metrics:

| Metric                                 | Description                                  | Labels                                          |
| -------------------------------------- | -------------------------------------------- | ----------------------------------------------- |
| `docker_container_info`                | Container metadata in tabular form            | `id`, `name`, `project`, `service`, `status`, `health` |
| `docker_container_running`             | Whether a container is running (1) or not (0)| `id`, `name`, `project`, `service`              |
| `docker_container_healthy`             | Whether a container is healthy (1) or not (0)| `id`, `name`, `project`, `service`              |
| `docker_container_uptime_milliseconds` | Container start time in milliseconds since epoch | `id`, `name`, `project`, `service`           |
| `docker_container_restart_count`       | Restart count of the container               | `id`, `name`, `project`, `service`              |

**Note:** The `docker_container_healthy` metric is only exposed for containers that have a healthcheck configured. All metrics are reset on each collection cycle to ensure stale container data is removed.

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