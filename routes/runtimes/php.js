const express = require('express');
const router = express.Router();

/* GET help page. */
router.get('/', (req, res, next) => {
    res.render('runtimes/php', {user: req.user});
});

module.exports = router;