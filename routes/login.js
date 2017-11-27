const router = require('express').Router();
const passport = require('passport');

router.get('/', (req, res, next) => {
  res.render('login', {layout: 'empty'});
});

/**
 * Route für Login: Passport als Middleware verarbeitet den Login und leitet
 * sofern er erfolgreich war an die nächste Funktion weiter.
 * Anderenfalls wird wieder auf /login zurückgeleitet.
 */
router.post('/', passport.authenticate('local-login',
    {
      failureRedirect: '/login',
    }),
    function(req, res) {
      res.redirect('/');
    },
);

module.exports = router;
