const router = require('express').Router();
const log = require('debug')('hostlab:route:node');
const snek = require('snekfetch');
const {docker, dockerfile} = require('../common/docker');
const stream = require('stream');
const gitlab_token = process.env.GITLAB_TOKEN;
const gitlab_url = process.env.GITLAB_URL;

// WIP: Container Log
let cl = "";
let container_user;
router.get('/', async (req, res, next) => {
  // Example get MongoDB log
  let container = docker.getContainer('e706d86b6f70');
  console.log(container);
 /**
 * Get logs from running container
 */
function containerLogs(container) {

  // create a single stream for stdin and stdout
  const logStream = new stream.PassThrough();
  logStream.on('data', function(chunk){
    cl += chunk.toString('utf8');
    console.log(chunk.toString('utf8'));
  });

  container.logs({
    follow: true,
    stdout: true,
    stderr: true
  }, function(err, stream){
    if(err) {
      //return logger.error(err.message);
        return;
    }
    container.modem.demuxStream(stream, logStream, logStream);
    stream.on('end', function(){
      logStream.end('!stop!');
    });

    setTimeout(function() {
      stream.destroy();
    }, 1000);
  });
}

  try {
    containerLogs(container);
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
            logs: cl,
            path: project.path_with_namespace,
            repo_url: project.http_url_to_repo,
          });
        }
      }
      if (repositories.length === 0) {
        res.locals.message.info = 'You got no repositories';
      }
        snek.get(`http://localhost:${req.app.settings.port}/api/v1/users/${req.user._id}`).set('cookie', req.headers.cookie).then((response) => {
            users = response.body;
            container = users.containers;
            res.render('node', { repositories, container });
        });
    } else {
      res.locals.message.error = '[HOSTLAB] Gitlab ID not found';
      res.render('node', { container});
    }
  } catch (err) {
    if (err.text) {
      res.locals.message.error = `[GITLAB] ${err.text}`;
      res.render('node', { container});
    }
    console.error(err);
    //return next(err);
  }
});

module.exports = router;
