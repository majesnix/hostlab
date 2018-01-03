const log = require('debug')('hostlab:docker');
const Docker = require('dockerode');
const {socketPath, protocol, host, port} = require('./connections').docker;
const docker = !host
    ? new Docker({socketPath})
    : new Docker({protocol, host, port});

log(docker);

const dockerfile = {
  node: file => `\
FROM node:carbon-alpine
WORKDIR /app
ADD ${file} .
RUN mv */* .
RUN npm install
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]`,
};

module.exports = {docker, dockerfile};
