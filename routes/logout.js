const express = require('express');
const router = express.Router();

/* GET help page. */
router.get('/', (req, res, next) => {
    req.logout();
    res.redirect('/login');
});

module.exports = router;