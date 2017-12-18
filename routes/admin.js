const router = require('express').Router();
const log = require('debug')('hostlab:route:admin');
const request = new require('snekfetch');

const User = require('../models/user');

/**
 * GET  /admin
 * GET  /admin/users
 * GET  /admin/users/:id
 */

router.get('/', (req, res, next) => {
  // Leite weiter auf ersten Navigationspunkt
  res.redirect('/admin/users');
});

router.get('/users', (req, res, next) => {
  let users;
  // Hole alle Nutzer
  request.get(`http://localhost:${req.app.settings.port}/api/v1/users`).
      set('cookie', req.headers.cookie).
      then((r) => {
        log(r.body);
        users = r.body;
        // Zeige alle Nutzer
        res.render('users', {users});
      });

});

router.get('/users/:id', (req, res, next) => {
  const {id} = req.params;
  // Hole bestimmten Nutzer
  request.get(`http://localhost:${req.app.settings.port}/api/v1/users/${id}`).
      set('cookie', req.headers.cookie).
      then((r) => {
        log(r.body);
        const user = r.body;
        // Zeige alle Nutzer
        res.render('usersShow', {user});
      });
});

module.exports = router;
