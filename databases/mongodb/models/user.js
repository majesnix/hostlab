const log = require('debug')('hostlab:mongo:user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isLdapUser: {
    type: Boolean,
    default: true,
  },
  registeredDate: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  mongodb: {
    maxNumDBs: {
      type: Number,
      default: 5,
    },
    urls: [
      {
        type: String,
      }],
  },
  gitlab: {
    url: String,
    repositorys: [
      {
        type: String,
      }],
  },
  gitlab_id: Number,
  nodeJS: {
    maxNumServer: {
      type: Number,
      default: 5
    },
    serverRunning: {
      type: Number,
      default: 0
    }
  }

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
