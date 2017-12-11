const router = require('express').Router();
const passport = require('passport');

router.get('/', (req, res, next) => {
  res.render('login');
});

/**
 * Route für Login: Passport als Middleware verarbeitet den Login und leitet
 * sofern er erfolgreich war an die nächste Funktion weiter.
 * Anderenfalls wird wieder auf /login zurückgeleitet.
 */
router.post('/', passport.authenticate(['local'], {
  failureRedirect: '/login',
  failureFlash: 'Invalid username or password.',
}), (req, res) => {
  res.redirect('/dashboard');
});

module.exports = router;
