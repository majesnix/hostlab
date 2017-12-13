const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('adminsettings');
});

module.exports = router;
