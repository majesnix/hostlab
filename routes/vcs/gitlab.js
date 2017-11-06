const express = require('express');
const router = express.Router();

/* GET help page. */
router.get('/', function(req, res, next) {
    res.render('vcs/gitlab');
});

module.exports = router;