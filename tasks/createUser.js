const User = require('../databases/mongodb/models/user');

/**
 * Skip system user operations while testing on other OS than Linux
 */
const linuxUser = process.platform === 'linux'
    ? require('linux-user')
    : {
      addUser: () => {
        console.info('Not running on linux, did not create system user');
      },
    };

const createUser = (opts, callback) => {

  let newUser = new User();
  newUser.username = opts.username;
  newUser.email = opts.email;

  /**
   * Passwort des Nutzers wird gehasht abgespeichert
   */
  newUser.generateHash(opts.password, function(err, hash) {
    if (err) {
      return callback(err);
    }
    newUser.password = hash;
  });

  newUser.admin = opts.admin;
  newUser.localuser = opts.localuser;

  newUser.save(function(err) {
    if (err) {
      return callback(err);
    }

    /**
     * Systemnutzer wird erstellt
     */
    linuxUser.addUser(opts.username, (err, user) => {
      if (err) {
        return callback(err);
      }

      /**
       * Passwort des Systemnutzers wird gesetzt
       */
      linuxUser.setPassword(opts.username, opts.password, (err) => {
        if (err) {
          return callback(err);
        }

        return callback(false, newUser);
      });

    });

  });

};

module.exports = createUser;
