const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/container', require('./container'));
router.use('/blueprint', require('./blueprint'));

module.exports = router;