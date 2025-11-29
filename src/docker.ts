import Docker from 'dockerode';

const getDockerOptions = (): Docker.DockerOptions => {
  const socket = process.env.DOCKER_SOCKET;

  if (socket && socket.startsWith('tcp://')) {
    const url = new URL(socket);
    return {
      host: url.hostname,
      port: url.port,
    };
  }

  return {
    socketPath: socket || '/var/run/docker.sock',
  };
};

export const docker = new Docker(getDockerOptions());

export const getContainers = async () => {
  return await docker.listContainers({ all: true });
};
