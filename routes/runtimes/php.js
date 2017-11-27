const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('runtimes/php');
});

module.exports = router;
