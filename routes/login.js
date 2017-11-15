const express = require('express');
const router = express.Router();
const passport = require('passport');

/* GET help page. */
router.get('/', (req, res, next) => {
    res.render('login', {layout: 'empty'});
});

router.post('/', passport.authenticate('local-login',
    {
        failureRedirect: '/login'
    }),
    function (req, res) {
        res.redirect('/');
    }
);

module.exports = router;