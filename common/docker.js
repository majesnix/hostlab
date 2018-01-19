/*
 * This file is part of HostLab.
 *
 * Copyright 2017 Jan Wystub
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const log = require('debug')('hostlab:docker');
const Docker = require('dockerode');
const {socketPath, protocol, host, port} = require('./connections').docker;
const docker = !host
    ? new Docker({socketPath})
    : new Docker({protocol, host, port});
const stream = require('stream');
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
const usersNetwork = 'hostlab_users';

/**
 * Creates and starts a mongoDB instance for the user if not already owns one.
 *
 * @param user      The user object, i.e. req.user
 * @param callback  The callback function
 */
function createAndStartUsersMongoInstance(user, callback) {
  // Check if user already owns a mongoDB instance
  if (user.containers.mongo.id) {
    return callback(new Error('User already owns a mongoDB instance.'));
  }
  docker.createContainer({
        Image: 'mvertes/alpine-mongo:latest',
        Hostconfig: {
          NetworkMode: usersNetwork,
        },
      },
      function createdContainer(err, container) {
        if (err) {
          return callback(err);
        }
        container.start(function startedContainer(err, data) {
          if (err) {
            return callback(err);
          }
          log(data);
          user.update({'containers.mongo.id': container.id},
              function updatedUser(err, raw) {
                if (err) {
                  return callback(err);
                }
                log(raw);
                callback(null, container.id);
              });
        });
      });
}

function retrieveContainerLogs(containerId) {
  return new Promise(function(resolve, reject) {
    let container = docker.getContainer(containerId);
    let logOpts = {
      stdout: 1,
      stderr: 1,
      tail: 100,
      follow: 0,
    };

    let containerLogs = [];

    var logStream = new stream.PassThrough();
    logStream.on('data', function(chunk) {
      containerLogs.push(chunk.toString('utf8'));
    });

    container.logs(logOpts, function(err, stream) {
      if (err) {
        reject(err);
      }
      container.modem.demuxStream(stream, logStream, logStream);
      stream.on('end', function() {
        logStream.end();
        resolve(containerLogs);
      });

      setTimeout(function() {
        stream.destroy();
      }, 2000);
    });
  });
}

module.exports = {
  docker,
  dockerfile,
  createAndStartUsersMongoInstance,
  retrieveContainerLogs,
};
