const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('vcs/svn');
});

module.exports = router;
