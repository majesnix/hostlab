const express = require('express');
const router = express.Router();
const passport = require('passport');

/* GET help page. */
router.get('/', (req, res, next) => {
    res.render('login', {layout: 'empty', test: "Dummyinhalt"});
});

router.post('/', passport.authenticate('local-login',
    {
        failureRedirect: '/login'
    }),
    function (req, res) {
        // Redirect to originalUrl if set before login
        res.redirect(req.app.locals.originalUrl || '/');
    }
);

module.exports = router;