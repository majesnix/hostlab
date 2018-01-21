const router = require('express').Router();
const log = require('debug')('hostlab:route:node');
const slugify = require('slugify');
const Converter = require('ansi-to-html');
const ansiConverter = new Converter;
const sanitizeHtml = require('sanitize-html');
const fetchUserRepositories = require('../modules/retrieveUserGitlabProjects');
const { retrieveContainerLogs } = require('../common/docker');

router.get('/:name', async(req, res) => {
    const container = req.user.containers.node.find(e => slugify(e.name) === req.params.name);
    const containerLogs = (await retrieveContainerLogs(container._id)).map(e => sanitizeHtml(ansiConverter.toHtml(e), {
        allowedTags: ['span'],
        allowedAttributes: {
            'span': ['style']
        }
    }));

    res.render('apps/details', { container,containerLogs, headerTitle: container.name + " details" });
});

router.get('/', async (req, res) => {
  try {
    const gitlab_id = req.user.gitlab_id;

    if(gitlab_id) {
      const repositories = await fetchUserRepositories(gitlab_id);
      const branches = Object.assign(...repositories.map(repo => ({[repo.id]: repo.branches})));

      if (repositories.length === 0) {
        res.locals.message.info = 'You got no repositories';
      }

      res.render('apps/overview', { repositories,branches, /*blueprints*/});
    } else {
      res.locals.message.error = '[HOSTLAB] Gitlab ID not found';
      res.render('apps/overview', {});
    }
  } catch (err) {
    if (err.text) {
      res.locals.message.error = `[GITLAB] ${err.text}`;
      res.render('apps/overview', {});
    }
    console.error(err);
  }
});

module.exports = router;
