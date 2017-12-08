const router = require('express').Router();
const log = require('debug')('hostlab:route:node');
const request = require('request');
const util = require('util');
const gitlab_token = process.env.GITLAB_TOKEN ||
    require('../config/gitlab_token').gitlab_token;

router.get('/', (req, res, next) => {
  const gitlab_id = req.user.gitlab_id;
  request.get({
    url: util.format(
        'http://gitlab.local/api/v4/users/%d/projects?private_token=%s',
        gitlab_id, gitlab_token),
  }, function(err, httpResponse, body) {
    if (err) {
      log('Request failed', err);
      return next(err);
    }
    log(httpResponse);
    log('Request finished');
    log(body);
    projects = JSON.parse(body);
    log(projects);
    const repositories = [];
    for (let project of projects) {
      repositories.push({
        path: project.path_with_namespace,
        repo_url: project.http_url_to_repo,
      });
    }
    res.render('node', {repositories});
  });
});

module.exports = router;
