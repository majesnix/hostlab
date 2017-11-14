const express = require('express');
const router = express.Router();

/* GET help page. */
router.get('/', (req, res, next) => {
    res.render('runtimes/php', {username: req.user.username});
});

module.exports = router;