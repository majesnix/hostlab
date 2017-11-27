const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('help');
});

module.exports = router;
