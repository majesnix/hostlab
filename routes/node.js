const router = require('express').Router();
const log = require('debug')('hostlab:route:node');
const snek = require('snekfetch');
const {docker, dockerfile, retrieveContainerLogs} = require('../common/docker');
const stream = require('stream');
const gitlab_token = process.env.GITLAB_TOKEN;
const gitlab_url = process.env.GITLAB_URL;
const ObjectId = require('mongoose').Types.ObjectId;
const slugify = require('slugify');
const Converter = require('ansi-to-html');
const ansiConverter = new Converter;
const sanitizeHtml = require('sanitize-html');
const {getPackageJSON} = require('../modules/getpackagejson');
const { generateMountPath } = require('../modules/generatemountpath');

// WIP: Container Log
let cl = "";
let container_user;


router.get('/:name', async(req, res, next) => {
    const container = req.user.containers.node.find(e => slugify(e.name) === req.params.name);
    container.isRunning = getStatusOfApplication(container._id);
    containerLogs = (await retrieveContainerLogs(container._id)).map(e => sanitizeHtml(ansiConverter.toHtml(e), {
        allowedTags: ['span'],
        allowedAttributes: {
            'span': ['style']
        }
    }));
    res.render('apps/details', { container, containerLogs, headerTitle: container.name + " details" });
});

router.get('/', async (req, res, next) => {
  // Example get MongoDB log
  let container = docker.getContainer('e706d86b6f70');

  try {
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
        const user = await snek.get(`http://localhost:${req.app.settings.port}/api/v1/users/${req.user._id}`).set('cookie', req.headers.cookie);
        const parsedUser = JSON.parse(user.text);
        applications = parsedUser.containers.node;
        let blueprints = [];

        for(blueprint of parsedUser.blueprints.node) {
            let packageJson = await getPackageJSON(blueprint.containingRepoID, blueprint.containingRepoBranch);

            if(typeof packageJson.scripts === 'object' && Object.keys(packageJson.scripts).length > 0) {
                blueprint.scripts = Object.keys(packageJson.scripts);
            } else {
                blueprint.scripts = [];
            }

            log(blueprint);

            blueprints.push(blueprint);
        }

        for(let i=0; i<applications.length; i++){
            let status = await getStatusOfApplication(applications[i]._id);
            applications[i]["isRunning"] = status === "running";
        }

        res.render('apps/overview', { repositories, applications, branches, blueprints, generateMountPath });
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

function getStatusOfApplication(applicationName){
    return new Promise(function(resolve, reject) {
        const containerToInspect = docker.getContainer(applicationName);
        containerToInspect.inspect(function (err, data) {
            resolve(data.State.Status);
        });
    })

}

module.exports = router;
