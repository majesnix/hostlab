const express = require('express');
const router = express.Router();

router.get('/', require('connect-ensure-login').ensureLoggedIn('/'), (req, res, next) => {
  res.locals.message = req.flash();
  res.render('dashboard', {
    title: 'Dashboard',
    user: req.user.user,
    projects: req.user.projects,
    participations: req.user.participations,
    message: res.locals.message
  });
});

module.exports = router;