const router = require('express').Router();
const request = require('request');

const util = require('util');


const gitlab_token = process.env.GITLAB_TOKEN || require('../../config/gitlab_token').gitlab_token;

router.get('/', (req, res, next) => {
  const gitlab_id = req.user.gitlab_id;
  request.get({url:util.format('http://gitlab.local/api/v4/users/%d/projects?private_token=%s', gitlab_id, gitlab_token)}, function (err, httpResponse, body) {
    if (err) {
      return console.error('Git get User Repositries failed', err);
    }
    console.log('Got Git User Repositories');
    console.log(body)
    body = JSON.parse(body);
    let repositories = [];
    body.forEach((project) => {
      repositories.push({path: project.path_with_namespace, repo_url: project.http_url_to_repo});
    });
    res.render('runtimes/nodejs', {repositories:repositories});
  }); 
});

module.exports = router;
