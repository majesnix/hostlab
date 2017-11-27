const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('cronjobs');
});

module.exports = router;
