const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/application', require('./application'));
router.use('/repository', require('./repository'));

module.exports = router;