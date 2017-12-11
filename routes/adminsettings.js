const express = require('express');
const router = express.Router();

router.get('/', require('connect-ensure-login').ensureLoggedIn('/'), (req, res, next) => {
  res.locals.message = req.flash();
  
  if (req.user.user.isadmin) {
    res.render('adminsettings', {
      user: req.user.user,
      projects: req.user.projects,
      participations: req.user.participations,
      message: res.locals.message
    });
  } else {
    res.redirect('/dashboard');
  }
});

module.exports = router;