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
      setTimeout(() => {res.render('admin/usersEdit', {userToEdit})}, 100);
  });
});

module.exports = router;
