/*
 * This file is part of The HostLab Software.
 *
 * Copyright 2018
 *     Adrian Beckmann, Denis Paris, Dominic Claßen,
 *     Jan Wystub, Manuel Eder, René Heinen, René Neißer.
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

const User = require('../models/user');
const log = require('debug')('hostlab:route:modules:autostartusercontainer');
const {docker} = require('../common/docker');
const proxy = require('../common/connections').proxy;
const slugify = require('slugify');

/**
 * Retrieves all Users, loops through their containers and boots them up, also registers
 * the starting containers to the proxy
 * @param {Express App} app The current express application
 */

module.exports = function(app) {
  log(app.settings);
  // Retrieve all users
  User.find(function(err, users) {
    if (err) {
      return next(err);
    }
    // loop through the found Users
    users.forEach(user => {
      // loop through each user containers
      user.containers.node.forEach(container => {
        try {
          const containerToInspect = docker.getContainer(container._id);
          const userObj = user.email.split('@');
          const mountPath = container.name;
          if (container.autostart === true) {
            // start the container
            containerToInspect.start(function(err, data) {
              // inspect the container informations
              containerToInspect.inspect(function(err, data) {
                const containerIP = data.NetworkSettings.Networks.hostlab_users.IPAddress;
                // register containers IP address to the proxy
                proxy.register(
                    `${app.settings.host}/${userObj[1]}/${userObj[0]}/${
                        slugify(mountPath)}`, `${containerIP}:8080`);
              });
            });
          }
        } catch (err) {
          log(err);
        }

      });
      // check for existing mongoExpress container
      if (user.containers.mongoExpress.id) {
        // get mongoDB container ID
        const containerToInspectMongo = docker.getContainer(user.containers.mongo.id);
        // get mongoExpress container ID
        const containerToInspectMongoExpress = docker.getContainer(user.containers.mongoExpress.id);
        const userObj = user.email.split('@');
        // start mongoDB container
        containerToInspectMongo.start(function(err, data) {
          // start mongoExpress container
          containerToInspectMongoExpress.start(function(err, data) {
            // inspect the container informations
            containerToInspectMongoExpress.inspect(function(err, data) {
              const containerIP = data.NetworkSettings.Networks.hostlab_users.IPAddress;
              // register mongoExpress IP address to the proxy
              proxy.register(
                  `${app.settings.host}/${userObj[1]}/${userObj[0]}/mongo`,
                  `${containerIP}:8081/${userObj[1]}/${userObj[0]}/mongo/`);
            });
          });
        });
      }
    });
  });
};
