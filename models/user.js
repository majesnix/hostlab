const log = require('debug')('hostlab:mongo:user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
// Fixes deprecation warning
mongoose.Promise = Promise;

const userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    alias: 'username',
  },
  password: {
    type: String,
  },
  firstname: String,
  lastname: String,
  isAdmin: {
    type: Boolean,
    default: false,
    alias: 'isadmin',
  },
  isLdap: {
    type: Boolean,
    default: false,
    alias: 'isldap',
  },
  created: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  gitlab_id: Number,
  avatar: {
    type: String,
    default: 'avatar.png',
  },
});

userSchema.methods.hashPassword = function(password, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return callback(err, null);
    }
    bcrypt.hash(password, salt, null, function(err, hash) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, hash);
    });
  });
};

userSchema.methods.validatePassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, valid) {
    if (err) {
      return callback(err, null);
    }
    return callback(null, valid);
  });
};

userSchema.methods.updateLastLogin = function() {
  this.update({lastLogin: new Date()}, function(err, raw) {
    log('updateLastLogin %o', raw);
  });
};

module.exports = mongoose.model('User', userSchema);
