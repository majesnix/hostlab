/*
 * This file is part of HostLab.
 *
 * Copyright 2017 Jan Wystub
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
  containers: {
    mongo: {
      id: String,
    },
    node: [
      {
        name: String,
        port: Number,
        scriptLoc: String,
        created: {
          type: Date,
          default: Date.now,
        },
        repoName: String,
        blueprint: {
          name: String,
          containingRepoName: String,
          containingRepoID: Number,
          containingRepoBranch: String,
        },
      },
    ],
  },
  blueprints: {
    node: [
    {
      name: String,
      containingRepoName: String,
      containingRepoID: Number,
      containingRepoBranch: String,
    },
    ],
  },
});

// ```js
// const user = {
//   containers: {
//     mongo: {
//       id: String,
//     },
//     futureStuff: {
//       id: String,
//     },
//     node: [
//       {
//         id: String,
//         mountpath: String,
//         runScript: String,
//       },
//     ],
//   },
//   blueprints: {
//     node: [
//       {
//         imageName: String,
//         containingRepo: String,
//         repoBranch: String,
//       },
//     ],
//     futureStuff: [
//       {
//         imageName: String,
//         containingRepo: String,
//         repoBranch: String,
//       },
//     ],
//   },
// };
// ```

userSchema.methods.updateLastLogin = function() {
  this.update({lastLogin: new Date()}, function(err, raw) {
    log('updateLastLogin %o', raw);
  });
};

module.exports = mongoose.model('User', userSchema);
