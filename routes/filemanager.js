const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('filemanager');
});

module.exports = router;
