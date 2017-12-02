const router = require('express').Router();
const debug = require('debug')('hostlab:route:admin');
const createUser = require('../../tasks/createUser');
const deleteUser = require('../../tasks/deleteUser');
const User = require('../../databases/mongodb/models/user');

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
    debug(users);
    // Zeige alle Nutzer
    res.render('admin/users', {users});
  });

});

router.get('/users/new', (req, res, next) => {
  // Zeige Erstellungsseite für Nutzer
  res.render('admin/usersNew');
});

router.get('/users/:username', (req, res, next) => {
  const username = req.params.username;
  // Hole bestimmten Nutzer
  User.findOne({username}, function(err, user) {
    if (err) {
      return next(err);
    }
    debug(user);
    if (!user) {
      return next();
    }
    // Zeige Nutzerdaten
    res.render('admin/usersShow', {user});

  });
});

router.get('/users/:username/edit', (req, res, next) => {
  const username = req.params.username;
  // Hole bestimmten Nutzer
  User.findOne({username}, function(err, user) {
    if (err) {
      return next(err);
    }
    debug(user);
    if (!user) {
      return next();
    }
    // Zeige Editierseite für bestimmten Nutzer
    res.render('admin/usersEdit', {user});
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
  // Erhalte Nutzer-Objekt
  const user = req.body;
  user.isLdapUser = false;
  if (!user.username || !user.password) {
    return res.status(422).send();
  }
  // Erstelle neuen Nutzer in der DB
  User.create(user, function(err, user) {
    if (err) {
      debug(err.toString());
      if (err.errmsg.includes('duplicate key error')) {
        return res.status(409).send();
      }
      return next(err);
    }
    debug(user);
    res.status(201).send(user);
  });
});

router.put('/users/:username', (req, res, next) => {
  // Verarbeite nur JSON-Objekte
  if (!req.is('json')) {
    return res.status(415).send();
  }
  // Erhalte Nutzer-Objekt
  const username = req.params.username;
  const update = req.body;
  // Ändere bestehenden Nutzer in der DB
  User.findOneAndUpdate({username}, update, {new: true}, function(err, user) {
    if (err) {
      return next(err);
    }
    debug(user);
    debug(req.params);
    debug(req.body);
    res.status(200).send(user);
  });
});

router.delete('/users/:username', (req, res, next) => {
  // Verarbeite nur JSON-Objekte
  if (!req.is('json')) {
    return res.status(415).send();
  }
  // Erhalte Nutzer-Objekt
  const username = req.params.username;
  // Prüfe ob Admin sich selbst löschen möchte
  if (username === req.user.username) {
    res.status(405).send();
  } else {
    // Lösche bestehenden Nutzer aus der DB
    User.remove({username}, function(err, doc) {
      if (err) {
        return next(err);
      }
      debug(doc);
      res.status(200).send();
    });
  }
});

module.exports = router;
