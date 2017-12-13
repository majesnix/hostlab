const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('databases');
});

module.exports = router;
