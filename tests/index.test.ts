jest.mock('../src/metrics');
jest.mock('../src/docker');

import * as metrics from '../src/metrics';
import { getContainers, docker } from '../src/docker';
import { collectMetrics } from '../src/index';
import _ from 'lodash';
import { ContainerInspectInfo } from 'dockerode';

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

const mockContainers = [{ Id: 'test-container-id' }];
const mockContainerInspect: DeepPartial<ContainerInspectInfo> = {
  Name: '/test-container',
  State: {
    Status: 'running',
    StartedAt: '2023-03-15T12:00:00Z',
    Health: {
      Status: 'healthy',
    },
  },
  RestartCount: 3,
  Config: {
    Labels: {
      'com.docker.compose.project': 'test-project',
      'com.docker.compose.service': 'test-service',
    },
  },
};

const mockLabels = {
  id: 'test-container-id',
  name: 'test-container',
  project: 'test-project',
  service: 'test-service',
};

// Use different set functions, otherwise all inherit from the same Gauge mock
metrics.containerRunning.set = jest.fn();
metrics.containerHealthy.set = jest.fn();
metrics.containerUptime.set = jest.fn();
metrics.containerRestartCount.set = jest.fn();

describe('collectMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should collect metrics from containers', async () => {
    const thisContainerInspect = _.cloneDeep(mockContainerInspect);

    (getContainers as jest.Mock).mockResolvedValue(mockContainers);
    (docker.getContainer as jest.Mock).mockReturnValue({
      inspect: jest.fn().mockResolvedValue(thisContainerInspect),
    });

    await collectMetrics();

    // Verify containerInfo metric
    expect(metrics.containerRunning.set).toHaveBeenCalledWith(mockLabels, 1);
    expect(metrics.containerHealthy.set).toHaveBeenCalledWith(mockLabels, 1);
    expect(metrics.containerUptime.set).toHaveBeenCalledWith(mockLabels, 1678881600000);
    expect(metrics.containerRestartCount.set).toHaveBeenCalledWith(mockLabels, 3)
  });

  it('should report containers that are not running', async () => {
    const thisContainerInspect = _.cloneDeep(mockContainerInspect);
    thisContainerInspect.State!.Status = 'stopped';

    (getContainers as jest.Mock).mockResolvedValue(mockContainers);
    (docker.getContainer as jest.Mock).mockReturnValue({
      inspect: jest.fn().mockResolvedValue(thisContainerInspect),
    });

    await collectMetrics();

    // Verify containerInfo metric
    expect(metrics.containerRunning.set).toHaveBeenCalledWith(mockLabels, 0);
    expect(metrics.containerUptime.set).toHaveBeenCalledWith(mockLabels, 0);
  });

  it('should report containers that are not healthy', async () => {
    const thisContainerInspect = _.cloneDeep(mockContainerInspect);
    thisContainerInspect.State!.Health!.Status = 'unhealthy';

    (getContainers as jest.Mock).mockResolvedValue(mockContainers);
    (docker.getContainer as jest.Mock).mockReturnValue({
      inspect: jest.fn().mockResolvedValue(thisContainerInspect),
    });

    await collectMetrics();

    // Verify containerInfo metric
    expect(metrics.containerHealthy.set).toHaveBeenCalledWith(mockLabels, 0);
  });

  it('should not report containers that do not have health', async () => {
    const thisContainerInspect = _.cloneDeep(mockContainerInspect);
    delete thisContainerInspect.State!.Health;

    (getContainers as jest.Mock).mockResolvedValue(mockContainers);
    (docker.getContainer as jest.Mock).mockReturnValue({
      inspect: jest.fn().mockResolvedValue(thisContainerInspect),
    });

    await collectMetrics();

    // Verify containerInfo metric
    expect(metrics.containerHealthy.set).toHaveBeenCalledTimes(0);
  });
});
