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
  });
};
