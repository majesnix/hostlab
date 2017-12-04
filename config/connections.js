module.exports = {
  mongo: {
    url: process.env.MONGO_URL || 'mongodb://hostlab.local/hostlab',
  },
  docker: {
    socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
    host: process.env.DOCKER_HOST,
    port: process.env.DOCKER_PORT || 2375,
    protocol: process.env.DOCKER_PROTOCOL || 'http',
  },
};
