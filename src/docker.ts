import Docker from 'dockerode';

export const docker = new Docker({
  socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
});

export const getContainers = async () => {
  return await docker.listContainers({ all: true });
};
