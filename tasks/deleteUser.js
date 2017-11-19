const User = require('../databases/mongodb/models/user');

const deleteUserinDB = (opts, callback) => {

  User.deleteOne({'username': opts.username}, function(err) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    /**
     * Skip system user operations while testing on other OS than Linux
     */
    const linuxUser = process.platform === 'linux'
        ? require('linux-user')
        : {
          removeUser: function() {
            console.info('Not running on linux, did not delete system user');
            return callback(false);
          },
        };

    linuxUser.removeUser(opts.username, (err) => {
      if (err) {
        return callback(err);
      }

      return callback(false);
    });

  });

};

module.exports = deleteUserinDB;
