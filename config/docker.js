const log = require('debug')('hostlab:docker');
const Docker = require('dockerode');
const {socketPath, protocol, host, port} = require('./connections').docker;
const docker = !host
    ? new Docker({socketPath})
    : new Docker({protocol, host, port});

log(docker);

const dockerfile = {
  node: file => `\
FROM node:alpine
WORKDIR /app
ADD ${file} .
RUN mv */* .
RUN npm install
ENV PORT=80
EXPOSE 80`,
};

module.exports = {docker, dockerfile};
