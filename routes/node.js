const router = require('express').Router();
const log = require('debug')('hostlab:route:node');
const snek = require('snekfetch');
const {docker, dockerfile} = require('../common/docker');
const stream = require('stream');
const gitlab_token = process.env.GITLAB_TOKEN;
const gitlab_url = process.env.GITLAB_URL;
const ObjectId = require('mongoose').Types.ObjectId;
const slugify = require('slugify');

// WIP: Container Log
let cl = "";
let container_user;

router.get('/:name', async(req, res, next) => {
    const container = req.user.containers.find(e => slugify(e.name) === req.params.name);
    res.render('apps/details', { container, headerTitle: container.name + " details" });
});

router.get('/', async (req, res, next) => {
  // Example get MongoDB log
  let container = docker.getContainer('e706d86b6f70');
  //console.log(container);
  /**
  * Get logs from running container
  */
  function containerLogs(container) {

    // create a single stream for stdin and stdout
    const logStream = new stream.PassThrough();
    logStream.on('data', function(chunk){
      cl += chunk.toString('utf8');
      //console.log(chunk.toString('utf8'));
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
      const branches = {};
      
      for (let project of projects) {

        let packagejson;
        try {
          packagejson = (await snek.head(`${gitlab_url}/api/v4/projects/${project.id}/repository/files/package.json?private_token=${gitlab_token}&ref=master`)) ? true : false;
        } catch (err) {}
        
        if (!project.archived && packagejson) {
          let projBranches = JSON.parse((await snek.get(project._links.repo_branches + `?private_token=${gitlab_token}`)).text);
          branches[project.id] = projBranches.map(e=>e.name);

          repositories.push({
            id: project.id,
            name: project.name,
            logs: cl,
            path: project.path_with_namespace,
            repo_url: project.http_url_to_repo,
            branches: branches[project.id]
          });
        }
      }
      if (repositories.length === 0) {
        res.locals.message.info = 'You got no repositories';
      }
        snek.get(`http://localhost:${req.app.settings.port}/api/v1/users/${req.user._id}`).set('cookie', req.headers.cookie).then((response) => {
            users = response.body;
            applications = users.containers.node;
            blueprints = users.blueprints.node;
            res.render('apps/overview', { repositories, applications, branches, blueprints });
        });
    } else {
      res.locals.message.error = '[HOSTLAB] Gitlab ID not found';
      res.render('apps/overview', { container});
    }
  } catch (err) {
    if (err.text) {
      res.locals.message.error = `[GITLAB] ${err.text}`;
      res.render('apps/overview', { container});
    }
    console.error(err);
    //return next(err);
  }
});

module.exports = router;
