const router = require('express').Router();
const log = require('debug')('hostlab:route:node');
const snek = require('snekfetch');
const gitlab_token = process.env.GITLAB_TOKEN ||
    require('../config/gitlab_token').gitlab_token;
const gitlab_url = process.env.GITLAB_URL;

router.get('/', async (req, res, next) => {
  try {
    const gitlab_id = req.user.gitlab_id;

    if (gitlab_id) {
      const { text } = await snek.get(`${gitlab_url}/api/v4/users/${gitlab_id}/projects?private_token=${gitlab_token}`);

      const projects = JSON.parse(text);
      
      const repositories = [];
      for (let project of projects) {
        if (!project.archived) {
          repositories.push({
            id: project.id,
            name: project.name,
            path: project.path_with_namespace,
            repo_url: project.http_url_to_repo,
          });
        }
      }
      if (repositories.length === 0) {
        res.locals.message.info = 'You got no repositories';
      }
      res.render('node', { repositories });
    } else {
      res.locals.message.error = '[HOSTLAB] Gitlab ID not found';
      res.render('node');
    }
  } catch (err) {
    if (err.text) {
      res.locals.message.error = `[GITLAB] ${err.text}`;
      res.render('node');
    }
    console.error(err);
    //return next(err);
  }
});

module.exports = router;
