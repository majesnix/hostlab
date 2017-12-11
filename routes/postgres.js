const router = require('express').Router();

router.get('/', (req, res, next) => {
  next(new Error('not implemented yet'));
});

module.exports = router;
