const router = require('express').Router();
const log = require('debug')('hostlab:route:admin');
const createUser = require('../tasks/createUser');
const deleteUser = require('../tasks/deleteUser');
const User = require('../models/user');

/**
 * GET  /admin
 * GET  /admin/users
 * GET  /admin/users/new
 * GET  /admin/users/:username
 * GET  /admin/users/:username/edit
 */
router.get('/', (req, res, next) => {
  // Leite weiter auf ersten Navigationspunkt
  res.redirect('/admin/users');
});

router.get('/users', (req, res, next) => {
  // Hole alle Nutzer
  User.find(function(err, users) {
    if (err) {
      return next(err);
    }
    log(users);
    // Zeige alle Nutzer
    res.render('users', {users});
  });

});

router.get('/users/new', (req, res, next) => {
  // Zeige Erstellungsseite für Nutzer
  res.render('usersNew');
});

router.get('/users/:username', (req, res, next) => {
  const {username} = req.params;
  // Hole bestimmten Nutzer
  User.findOne({username}, function(err, user) {
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

router.get('/users/:username/edit', (req, res, next) => {
  const {username} = req.params;
  // Hole bestimmten Nutzer
  User.findOne({username}, function(err, user) {
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

/**
 * POST   /admin/users
 * PUT    /admin/users/:username
 * DELETE /admin/users/:username
 */
router.post('/users', (req, res, next) => {
  // Verarbeite nur JSON-Objekte
  if (!req.is('json')) {
    return res.status(415).send();
  }
  // Hole Nutzerdaten
  log(req.body);
  const {username, password, email, isAdmin} = req.body;
  // Fehler falls username oder password leer
  if (!username || !password) {
    return res.status(422).send();
  }
  // Erstelle neuen Nutzer
  createUser({username, password, email, isAdmin, isLdapUser: false},
      function(err, user) {
        if (err) {
          log(err.errmsg);
          if (err.errmsg.includes('username_1 dup key')) {
            return res.status(409).send('Please try another username');
          }
          return next(err);
        }// else
        log(user);
        // Erfolgreich erstellt --> 201 Created
        res.status(201).send(user);
      });
});

router.put('/users/:username', (req, res, next) => {
  // Verarbeite nur JSON-Objekte
  if (!req.is('json')) {
    return res.status(415).send();
  }
  // Hole Nutzerdaten
  log(req.params);
  const {username} = req.params;
  log(req.body);
  const update = req.body;
  // Ändere bestehenden Nutzer in der DB
  User.findOneAndUpdate({username}, update, {new: true}, function(err, user) {
    if (err) {
      return next(err);
    }
    log(user);
    // Erfolgreich geändert --> 200 OK
    res.status(200).send(user);
  });
});

router.delete('/users/:username', (req, res, next) => {
  // Verarbeite nur JSON-Objekte
  if (!req.is('json')) {
    return res.status(415).send();
  }
  // Hole Nutzerdaten
  const {username} = req.params;
  // Prüfe ob Admin sich selbst löschen möchte
  if (username === req.user.username) {
    res.status(405).send();
  } else {
    // Lösche bestehenden Nutzer
    deleteUser({username}, function(err) {
      if (err) {
        return next(err);
      }// else
      // Erfolgreich gelöscht --> 204 No Content
      res.status(204).send();
    });
  }
});

module.exports = router;
