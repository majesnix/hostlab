const express = require('express');
const router = express.Router();

router.get('/', require('connect-ensure-login').ensureLoggedIn('/'), (req, res, next) => {
  res.render('newService', {
    user: req.user.user,
    projects: req.user.projects,
    participations: req.user.participations,
  });
});

module.exports = router;