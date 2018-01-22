const User = require('../models/user');
const log = require('debug')('hostlab:route:modules:autostartusercontainer');
const {docker} = require('../common/docker');
const proxy = require('../common/connections').proxy;
const slugify = require('slugify');

module.exports = function(app) {
  log(app.settings);
  User.find(function(err, users) {
    if (err) {
      return next(err);
    }
    users.forEach(user => {
      user.containers.node.forEach(container => {
        try {
          const containerToInspect = docker.getContainer(container._id);
          const userObj = user.email.split('@');
          const mountPath = container.name;
          if (container.autostart === true) {
            containerToInspect.start(function(err, data) {
              containerToInspect.inspect(function(err, data) {
                const containerIP = data.NetworkSettings.Networks.hostlab_users.IPAddress;
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
      if (user.containers.mongoExpress.id) {
        const containerToInspect = docker.getContainer(
            user.containers.mongoExpress.id);
        const userObj = user.email.split('@');
        containerToInspect.start(function(err, data) {
          containerToInspect.inspect(function(err, data) {
            const containerIP = data.NetworkSettings.Networks.hostlab_users.IPAddress;
            proxy.register(
                `${app.settings.host}/${userObj[1]}/${userObj[0]}/mongo`,
                `${containerIP}:8081/${userObj[1]}/${userObj[0]}/mongo/`);
          });
        });
      }
    });
  });
};
