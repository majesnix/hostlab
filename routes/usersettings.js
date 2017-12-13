const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('usersettings', {sidebar: true});
});

module.exports = router;
