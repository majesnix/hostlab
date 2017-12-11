const express = require('express');
const router = express.Router();

router.get('/', require('connect-ensure-login').ensureLoggedIn('/'), (req, res, next) => {
  res.render('node', {
    user: req.user.user,
    projects: req.user.projects,
    participations: req.user.participations,
    activeProject: req.query.project,
    activeApp: req.query.id
  });
});

module.exports = router;