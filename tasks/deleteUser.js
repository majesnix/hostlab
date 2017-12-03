const log = require('debug')('hostlab:task:deleteUser');
const User = require('../databases/mongodb/models/user');

module.exports = (opts, callback) => {
  // Extrahiere Nutzernamen
  const {username} = opts;

  User.deleteOne({username}, function(err) {
    if (err) {
      log(err);
      return callback(err);
    }

    /**
     * Wenn kein Linux-System, dann Systemnutzerverwaltung überspringen
     */
    const linuxUser = process.platform === 'linux'
        ? require('linux-user')
        : {
          removeUser: function() {
            log('Kein Linux-System, überspringe Systemnutzerverwaltung');
            return callback(null);
          },
        };

    /**
     * Entferne Systemuser mit Homeverzeichnis
     */
    linuxUser.removeUser(username, (err) => {
      if (err) {
        return callback(err);
      }
      return callback(null);
    });
  });
};
