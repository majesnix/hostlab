const express = require('express');
const router = express.Router();

/* GET help page. */
router.get('/', (req, res, next) => {
    res.render('databases/mongodb', {user: req.user});
});

router.get('/mongoadmin', (req, res, next) => {
    res.render('databases/mongoadmin', {user: req.user});
});


router.get('/mongocollection', (req, res, next) => {
    res.render('databases/mongocollection', {user: req.user});
});


module.exports = router;