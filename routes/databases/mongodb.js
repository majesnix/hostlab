const express = require('express');
const router = express.Router();

/* GET help page. */
router.get('/', (req, res, next) => {
    res.render('databases/mongodb', {username: req.user.username});
});

router.get('/mongoadmin', (req, res, next) => {
    res.render('databases/mongoadmin', {username: req.user.username});
});


router.get('/mongocollection', (req, res, next) => {
    res.render('databases/mongocollection', {username: req.user.username});
});


module.exports = router;