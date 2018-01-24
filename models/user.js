/*
 * This file is part of The HostLab Software.
 *
 * Copyright 2018
 *     Adrian Beckmann, Denis Paris, Dominic Claßen,
 *     Jan Wystub, Manuel Eder, René Heinen, René Neißer.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const log = require('debug')('hostlab:mongo:user');
const mongoose = require('mongoose');
const Application = require('./application');
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
  containers: {
    mongo: {
      id: String,
    },
    mongoExpress: {
      id: String,
    },
    node: {
      type: [Application]
    },
  },
});

userSchema.methods.updateLastLogin = function() {
  this.update({lastLogin: new Date()}, function(err, raw) {
    log('updateLastLogin %o', raw);
  });
};

module.exports = mongoose.model('User', userSchema);
