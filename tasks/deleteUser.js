const User = require('../databases/mongodb/models/user');

/**
 * Skip system user operations while testing on other OS than Linux
 */
const linuxUser = process.platform === 'linux'
    ? require('linux-user')
    : {
      removeUser: function() {
        console.info('Not running on linux, did not delete system user');
      },
    };

const deleteUser = (opts, callback) => {

  /**
   * Nutzer wird in Datenbank gesucht und gelöscht
   */
  User.deleteOne({'username': opts.username}, function(err) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    /**
     * Nutzer wird vom System entfernt(inklusive Home Verzeichnis)
     */
    linuxUser.removeUser(opts.username, (err) => {
      if (err) {
        return callback(err);
      }

      return callback(false);
    });

  });

};

module.exports = deleteUser;
