const login = require('./login');
const logout = require('./logout');
const dashboard = require('./dashboard');
const settings = require('./settings');
const help = require('./help');

const cronjobs = require('./cronjobs');

const mongoExpressConfig = require('../config/mongoExpress');
const mongoExpress = require('mongo-express/lib/middleware');

const node = require('./node');

const admin = require('./admin');
const api = require('./api');

module.exports = (app) => {
  app.use('/login', login);

  /**
   * Ab hier können die Routen nur noch als registrierter Benutzer aufgerufen werden
   */
  app.use(isRegistered);

  app.use('/logout', logout);

  app.use('/api', api);

  app.use(exposeReqInfos);

  app.use('/', dashboard);

  app.use('/cronjobs', cronjobs);

  app.use('/mongo', mongoExpress(mongoExpressConfig));

  app.use('/help', help);

  app.use('/node', node);

  app.use('/settings', settings);

  /**
   * Ab hier können die Routen nur noch als Administrator aufgerufen werden
   */
  app.use(isAdmin);

  app.use('/admin', admin);

};

/**
 * Helferfunktion um registrierte Nutzer zu identifizieren
 */
function isRegistered(req, res, next) {
  if (req.isAuthenticated()) {
    // Reiche das User-Objekt an die nächsten Routen weiter
    res.locals.user = req.user;

    // Weitermachen
    return next();
  }
  res.redirect('/login');
}

/**
 * Helferfunktion um Administrator zu identifizieren
 */
function isAdmin(req, res, next) {
  if (req.user.isAdmin) {
    // Zeige Adminansicht statt Nutzeransicht
    res.locals.layout = 'admin';

    // Weitermachen
    return next();
  }
  res.redirect('/');
}

/**
 * Helferfunktion für Vorverarbeitungen des Requests
 */
function exposeReqInfos(req, res, next) {
  // Damit die Rendering-Engine weiß auf welchem Navigationselement wir uns
  // befinden, stellen wir ihr eine entsprechende Variable zur Verfügung.
  const splitURL = req.path.split('/');
  const navPath = splitURL[splitURL.length - 1] || 'dashboard';
  const activeNav = 'nav-' + navPath;
  res.locals[activeNav] = true;
  next();
}
