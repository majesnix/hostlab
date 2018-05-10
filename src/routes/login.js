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
const passport = require('passport');

router.get('/', (req, res, next) => {
  res.render('login');
});

/**
 * Route für Login: Passport als Middleware verarbeitet den Login und leitet
 * sofern er erfolgreich war an die nächste Funktion weiter.
 * Anderenfalls wird wieder auf /login zurückgeleitet.
 */
router.post('/', passport.authenticate('ldapauth', {
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {
  res.redirect('/');
});

module.exports = router;
