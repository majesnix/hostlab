const router = require('express').Router();
const log = require('debug')('hostlab:route:node');
const snek = require('snekfetch');
const gitlab_token = process.env.GITLAB_TOKEN;
const gitlab_url = process.env.GITLAB_URL;

router.get('/', async (req, response, next) => {
  snek.get(`http://localhost:${req.app.settings.port}/api/v1/users/${req.user._id}`).set('cookie', req.headers.cookie).then((res) => {
    users = res.body;
    let container = users.containers;
    response.render('runningCont', { container });
  });
});

module.exports = router;
