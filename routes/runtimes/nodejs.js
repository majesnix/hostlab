const router = require('express').Router();
const request = require('request');

router.get('/', (req, res, next) => {
  const gitlab_id = req.user.gitlab_id;
  request.get({url:'http://gitlab.local/api/v4/users/'+gitlab_id+'/projects?private_token='+process.env.GITLAB_TOKEN}, function (err, httpResponse, body) {
    if (err) {
      return console.error('Git get User Repositries failed', err);
    }
    console.log('Got Git User Repositories');
    body = JSON.parse(body);
    let repositories = [];
    body.forEach((project) => {
      repositories.push(project.name);
    });
    res.render('runtimes/nodejs', {repositories:repositories});
  }); 
});

module.exports = router;
