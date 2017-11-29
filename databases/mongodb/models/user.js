const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
  },
  password: String,
  isAdmin: {
    type: Boolean,
    default: false,
  },
  gitlab_id: Number,
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
  }
});

userSchema.methods.generateHash = function(password, callback) {
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

userSchema.methods.validPassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, res) {
    if (err) {
      return callback(err, null);
    }
    return callback(null, res);
  });
};

module.exports = mongoose.model('User', userSchema);