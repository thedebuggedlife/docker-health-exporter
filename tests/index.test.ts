const mockLabels = jest.fn();
const mockSet = jest.fn();
mockLabels.mockReturnValue({ set: mockSet });

jest.doMock('../src/metrics', () => ({
  containerInfo: {
    labels: mockLabels,
  },
  containerHealth: {
    labels: mockLabels,
  },
  containerUptime: {
    labels: mockLabels,
  },
  containerRestartCount: {
    labels: mockLabels,
  },
}));

import { getContainers, docker } from '../src/docker';
import { collectMetrics } from '../src/index';
import { containerHealth } from '../src/metrics';

jest.mock('../src/docker');

describe('collectMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should collect metrics from containers', async () => {
    const mockContainers = [{ Id: 'test-container-id' }];
    const mockContainerInspect = {
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
    (getContainers as jest.Mock).mockResolvedValue(mockContainers);
    (docker.getContainer as jest.Mock).mockReturnValue({
      inspect: jest.fn().mockResolvedValue(mockContainerInspect),
    });

    await collectMetrics();

    // Verify containerInfo metric
    expect(mockLabels).toHaveBeenCalledWith(
      'test-container-id',
      'test-container',
      'running',
      'test-project',
      'test-service',
    );
    expect(mockSet).toHaveBeenCalledWith(1);

    // Verify containerHealth metric
    expect(mockLabels).toHaveBeenCalledWith(
      'test-container-id',
      'healthy',
    );
    expect(mockSet).toHaveBeenCalledWith(1);

    // Verify containerUptime metric
    expect(mockLabels).toHaveBeenCalledWith(
      'test-container-id',
    );
    expect(mockSet).toHaveBeenCalledWith(expect.any(Number));
    
    // Verify containerRestartCount metric
    expect(mockLabels).toHaveBeenCalledWith(
      'test-container-id',
    );
    expect(mockSet).toHaveBeenCalledWith(3);
  });
});
