const express = require('express');
const router = express.Router();

/* GET help page. */
router.get('/', (req, res, next) => {
    res.render('help/index', {username: req.user.username});
});

module.exports = router;