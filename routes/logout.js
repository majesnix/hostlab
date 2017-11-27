const router = require('express').Router();

router.get('/', (req, res, next) => {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
