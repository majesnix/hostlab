const express = require('express');
const router = express.Router();

router.get('/', require('connect-ensure-login').ensureLoggedIn('/'), (req, res, next) => {
  res.locals.message = req.flash();
  const projects = req.user.projects;
  const participations = req.user.participations;
  const activeProject = projects.find(el => el.id == req.query.id) || participations.find(el => el.projectid == req.query.id);

  res.render('project', {
    user: req.user.user,
    projects: projects,
    participations: participations,
    apps: activeProject.apps,
    dbs: activeProject.dbs,
    message: res.locals.message,
    activeProject: activeProject,
  });
});

module.exports = router;