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
  firstname: String,
  lastname: String,
  isAdmin: {
    type: Boolean,
    default: false,
    alias: 'isadmin',
  },
  gitlab_id: Number,
  avatar_url: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  containers: [{
    name: String,
    port: Number,
    scriptLoc: String,
    created: {
      type: Date,
      default: Date.now,
    },
    repoName: String,
  }],
});

userSchema.methods.updateLastLogin = function() {
  this.update({lastLogin: new Date()}, function(err, raw) {
    log('updateLastLogin %o', raw);
  });
};

module.exports = mongoose.model('User', userSchema);
