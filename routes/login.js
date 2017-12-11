const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res, next) => {
  res.locals.message = req.flash();
  res.render('login', {message: res.locals.message});
});

router.post('/', passport.authenticate(['ldapauth', 'local'], {
  failureRedirect: '/',
  failureFlash: 'Invalid username or password.'
}), (req, res, next) => {
  if (!req.user.user.active) {
    req.flash('error', 'Invalid username or password');
    req.logout();
    return res.redirect('/');
  }
  req.session.save((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/dashboard');
  });
});

module.exports = router;
