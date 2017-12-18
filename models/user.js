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
  created: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  gitlab_id: Number,
  avatar_url: {
    type: String,
  },
});

userSchema.methods.updateLastLogin = function() {
  this.update({lastLogin: new Date()}, function(err, raw) {
    log('updateLastLogin %o', raw);
  });
};

module.exports = mongoose.model('User', userSchema);
