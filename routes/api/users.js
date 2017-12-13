const router = require('express').Router();
const log = require('debug')('hostlab:route:api:users');
const createUser = require('../../tasks/createUser');
const User = require('../../models/user');

/**
 * GET    /api/users
 * POST   /api/users
 * GET    /api/users/:id
 * PUT    /api/users/:id
 * DELETE /api/users/:id
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

router.post('/', (req, res, next) => {
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
    res.status(201).end(user);

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

router.delete('/:id', (req, res, next) => {
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
