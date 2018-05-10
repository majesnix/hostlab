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
const log = require('debug')('hostlab:route:api:users');
const User = require('../../models/user');

/**
 * GET    /api/users
 * GET    /api/users/:id
 * PUT    /api/users/:id
 */

router.get('/', (req, res, next) => {
  // Hole alle Nutzer
  User.find(function(err, users) {
    if (err) {
      return next(err);
    }
    log(users);
    // Zeige alle Nutzer
    res.status(200).json(users);
  });
});

router.get('/:id', (req, res, next) => {
  const {id} = req.params;
  // Hole bestimmten Nutzer
  User.findById(id, function(err, user) {
    if (err) {
      return next(err);
    }
    log(user);
    if (!user) {
      return next();
    }
    // Sende Nutzerdaten
    res.status(200).json(user);
  });
});

router.put('/:id', (req, res, next) => {
  // Verarbeite nur JSON-Objekte
  if (!req.is('json')) {
    return res.sendStatus(415);
  }
  // Hole Nutzerdaten
  log(req.params);
  const {id} = req.params;
  log(req.body);
  const update = req.body;
  // Ändere den Nutzer nur, wenn er sich nicht selbst editiert
  if(req.user._id.toString() === id) {
    res.status(403).json({
      message: "Unable to edit own user."
    });
  } else {
    // Ändere bestehenden Nutzer in der DB
    User.findByIdAndUpdate(id, update, {new: true}, function(err, user) {
      if (err) {
        log(err);
        return next(err);
      }
      // Erfolgreich geändert --> 200 OK
      res.status(200).json(user);
    });
  }
});

module.exports = router;
