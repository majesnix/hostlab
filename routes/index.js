const admin = require('./admin');
const api = require('./api');
const dashboard = require('./dashboard');
const help = require('./help');
const login = require('./login');
const logout = require('./logout');
const mongoExpress = require('mongo-express/lib/middleware');
const mongoExpressConfig = require('../config/mongoExpress');
const node = require('./node');
const postgres = require('./postgres');
const settings = require('./settings');

const adminsettings = require('./adminsettings');
const databases = require('./databases');
const usersettings = require('./usersettings');

module.exports = (app) => {
  app.use('/login', login);

  app.use(ensureAuthentication);
  app.use('/logout', logout);
  app.use('/api', api);

  app.use(activateNavElems);
  app.use(passFlashMessages);
  app.use('/', dashboard);
  app.use('/help', help);
  app.use('/mongo', mongoExpress(mongoExpressConfig));
  app.use('/node', node);
  app.use('/postgres', postgres);
  app.use('/settings', settings);

  app.use('/databases', databases);
  app.use('/usersettings', usersettings);

  /**
   * Ab hier können die Routen nur noch als Administrator aufgerufen werden
   */
  app.use(ensureBeingAdmin);
  app.use('/admin', admin);
  app.use('/adminsettings', adminsettings);
};

function ensureAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    // Reiche das User-Objekt an die nächsten Routen weiter
    res.locals.user = req.user;
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

function activateNavElems(req, res, next) {
  // Damit die Rendering-Engine weiß auf welchem Navigationselement wir uns
  // befinden, stellen wir ihr eine entsprechende Variable zur Verfügung.
  const splitURL = req.path.split('/');
  const navPath = splitURL[splitURL.length - 1] || 'dashboard';
  const activeNav = 'nav-' + navPath;
  res.locals[activeNav] = true;
  next();
}

function passFlashMessages(req, res, next) {
  res.locals['message'] = req.flash();
  next();
}
