const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('vcs/gitlab');
});

module.exports = router;
