const router = require('express').Router();
const log = require('debug')('hostlab:route:admin');
const request = new require('snekfetch');

const User = require('../models/user');

/**
 * GET  /admin
 * GET  /admin/users
 * GET  /admin/users/create
 * GET  /admin/users/:id
 * GET  /admin/users/:id/edit
 */

router.get('/', (req, res, next) => {
  // Leite weiter auf ersten Navigationspunkt
  res.redirect('/admin/users');
});

router.get('/users', (req, res, next) => {
  let users;
  // Hole alle Nutzer
  log(req.headers)
  request.get(`http://localhost:${req.app.settings.port}/api/v1/users`).
      set('cookie', req.headers.cookie).
      then((r) => {
        log(r.body);
        users = r.body;
        // Zeige alle Nutzer
        res.render('users', {users});
      });

});

router.get('/users/create', (req, res, next) => {
  // Zeige Erstellungsseite für Nutzer
  res.render('usersCreate');
});

router.get('/users/:id', (req, res, next) => {
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
    // Zeige Nutzerdaten
    res.render('usersShow', {user});

  });
});

router.get('/users/:id/edit', (req, res, next) => {
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
    // Zeige Editierseite für bestimmten Nutzer
    res.render('usersEdit', {user});
  });
});

module.exports = router;
