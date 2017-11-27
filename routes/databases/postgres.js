const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('databases/postgres');
});

module.exports = router;
