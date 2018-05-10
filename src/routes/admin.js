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

const router = require('express').Router();
const log = require('debug')('hostlab:route:admin');
const request = new require('snekfetch');

const User = require('../models/user');

/**
 * GET  /admin
 * GET  /admin/users
 * GET  /admin/users/:id
 */

router.get('/', (req, res) => {
  // Leite weiter auf ersten Navigationspunkt
  res.redirect('/admin/users');
});

router.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    res.render('admin/users', {users});
  });
});

router.get('/users/:id', (req, res) => {
  User.findById(req.params.id, (err, userToEdit) => {
    setTimeout(() => {res.render('admin/usersEdit', {userToEdit});}, 100);
  });
});

module.exports = router;
