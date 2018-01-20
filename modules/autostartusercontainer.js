const User = require('../models/user');
const log = require('debug')('hostlab:route:modules:autostartusercontainer');
const {docker} = require('../common/docker');
const proxy = require('../common/connections').proxy;
const slugify = require('slugify');
const hostlab_ip = process.env.HOSTNAME;


module.exports = function() {
  User.find(function(err, users) {
    if (err) {
     return next(err);
    }
    users.forEach(user => {
      user.containers.node.forEach(container => {
        if (container.autostart == true) {
          try {
            const containerToInspect = docker.getContainer(container._id);
            containerToInspect.start(function(err, data) {
              containerToInspect.inspect(function(err, data) {
                const containerIP = data.NetworkSettings.Networks.hostlab_users.IPAddress;
                const userObj = user.email.split('@');
                const mountPath = container.name;
                proxy.register(`${hostlab_ip}/${userObj[1]}/${userObj[0]}/${slugify(mountPath)}`, `${containerIP}:8080`);
              });
            });
          }catch (err) {
            log(err);
          }
        }
      });
    });
  });
};
