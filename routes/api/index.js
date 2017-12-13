const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/container', require('./container'));

module.exports = router;