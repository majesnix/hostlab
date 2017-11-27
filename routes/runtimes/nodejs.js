const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('runtimes/nodejs');
});

module.exports = router;
