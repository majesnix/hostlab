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

const dockerfile = {
  node: file => `\
FROM node:carbon-alpine
WORKDIR /app
ADD ${file} .
RUN mv */* .
RUN npm install
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/npm", "run-script"]
CMD {"start"]`,
};
const usersNetwork = 'hostlab_users';

/**
 * Creates and starts a mongoDB instance for the user if not already owns one.
 *
 * @param req       The req object
 * @param callback  The callback function
 */
function createAndStartUsersMongoInstance(req, callback) {
  // Check if user already owns a mongoDB instance
  if (req.user.containers.mongo.id) {
    return callback(null);
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
          req.user.update({'containers.mongo.id': container.id},
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

function createAndStartUsersMongoExpressInstance(req, callback) {

  docker.getContainer(req.user.containers.mongo.id).inspect((err, data) => {
        if (err) {
          return callback(err);
        }
        const containerIP = data.NetworkSettings.Networks.hostlab_users.IPAddress;
        log(containerIP);
        docker.createContainer({
              Image: 'mongo-express',
              Env: [
                'ME_CONFIG_MONGODB_ENABLE_ADMIN=true',
                `ME_CONFIG_MONGODB_SERVER=${containerIP}`,
              ],
              ExposedPorts: {
                '8081/tcp': {},
              },
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
                req.user.update({'containers.mongoExpress.id': container.id},
                    function updatedUser(err, raw) {
                      if (err) {
                        return callback(err);
                      }
                      callback(null, container.id);
                    });
              });
            });
      },
  )
  ;

}

function getStatusOfApplication(applicationName){
    return new Promise(function(resolve, reject) {
        const containerToInspect = docker.getContainer(applicationName);
        containerToInspect.inspect(function (err, data) {
            resolve(data.State.Status);
        });
    })
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
  createAndStartUsersMongoExpressInstance,
  retrieveContainerLogs,
  getStatusOfApplication
};
