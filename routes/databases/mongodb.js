const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('databases/mongodb');
});

router.get('/mongoadmin', (req, res, next) => {
  res.render('databases/mongoadmin');
});

router.get('/mongocollection', (req, res, next) => {
  res.render('databases/mongocollection');
});

module.exports = router;
