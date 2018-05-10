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

const admin = require('./admin');
const api = require('./api');
const dashboard = require('./dashboard');
const help = require('./help');
const login = require('./login');
const logout = require('./logout');
const mongoExpress = require('mongo-express/lib/middleware');
const mongoExpressConfig = require('../common/mongoExpress');
const node = require('./node');
const postgres = require('./postgres');

const databases = require('./databases');

module.exports = (app) => {
  app.use(exposeFlashMessages);
  app.use('/login', login);

  app.use(ensureAuthentication);
  app.use('/logout', logout);
  app.use('/api/v1', api);

  app.use(addCurrentPathToLocals);
  app.use('/', dashboard);
  app.use('/help', help);
  app.use('/mongo', mongoExpress(mongoExpressConfig));
  app.use('/node', node);
  app.use('/postgres', postgres);
  app.use('/databases', databases);

  /**
   * Ab hier können die Routen nur noch als Administrator aufgerufen werden
   */
  app.use(ensureBeingAdmin);
  app.use('/admin', admin);

};

function ensureAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    // Reiche das User-Objekt an die nächsten Routen weiter
    res.locals.user = req.user;
    res.locals.gitlab_url = process.env.GITLAB_URL ||
        require('../config/gitlab').gitlab_url;
    return next();
  }
  res.redirect('/login');
}

function ensureBeingAdmin(req, res, next) {
  if (req.user.isAdmin) {
    // Zeige Adminansicht statt Nutzeransicht
    res.locals.layout = 'admin';
    return next();
  }
  res.redirect('/');
}

function addCurrentPathToLocals(req, res, next) {
  res.locals.currentPath = req.path;
  next();
}

function exposeFlashMessages(req, res, next) {
  res.locals['message'] = req.flash();
  next();
}
