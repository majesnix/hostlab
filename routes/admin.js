const router = require('express').Router();
const log = require('debug')('hostlab:route:admin');
const createUser = require('../tasks/createUser');
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

/**
 * POST   /admin/users
 * PUT    /admin/users/:id
 * DELETE /admin/users/:id
 */
router.post('/users', (req, res, next) => {
  // Verarbeite nur JSON-Objekte
  if (!req.is('json')) {
    return res.sendStatus(415);
  }
  // Hole Nutzerdaten
  log(req.body);
  const {email, password, isAdmin} = req.body;
  // Fehler falls email oder password leer
  if (!email || !password) {
    return res.sendStatus(422);
  }
  // Erstelle neuen Nutzer
  createUser({email, password, isAdmin},
      function(err, user) {
        if (err) {
          log(err.errmsg);
          if (err.name === 'MongoError' && err.code === 11000) {
            return res.status(409).end('There was a duplicate key error');
          }
          return next(err);
        }// else
        log(user);
        // Erfolgreich erstellt --> 201 Created
        res.status(201).end(user);
      });
});

router.put('/users/:id', (req, res, next) => {
  // Verarbeite nur JSON-Objekte
  if (!req.is('json')) {
    return res.sendStatus(415);
  }
  // Hole Nutzerdaten
  log(req.params);
  const {id} = req.params;
  log(req.body);
  const update = req.body;
  // Ändere bestehenden Nutzer in der DB
  User.findByIdAndUpdate(id, update, {new: true}, function(err, user) {
    if (err) {
      return next(err);
    }
    log(user);
    // Erfolgreich geändert --> 200 OK
    res.status(200).end(user);
  });
});

router.delete('/users/:id', (req, res, next) => {
  // Verarbeite nur JSON-Objekte
  if (!req.is('json')) {
    return res.sendStatus(415);
  }
  // Hole Nutzerdaten
  const {id} = req.params;
  // Prüfe ob Admin sich selbst löschen möchte
  if (id === req.user.id) {
    return res.sendStatus(405);
  }
  // Lösche bestehenden Nutzer
  User.findByIdAndDelete(id, function(err) {
    if (err) {
      return next(err);
    }// else
    // Erfolgreich gelöscht --> 204 No Content
    res.sendStatus(204);
  });
});

module.exports = router;
