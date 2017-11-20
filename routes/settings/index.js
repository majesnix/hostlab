const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('settings/index', {user: req.user});
});

router.put('/changePassword', (req, res, next) => {
      const pw = req.body.password;
});


module.exports = router;