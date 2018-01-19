const router = require('express').Router();
const {promisify} = require('util');
const tmp = require('tmp-promise');
const snek = require('snekfetch');
const write = promisify(require('fs').writeFile);
const {docker, dockerfile, createAndStartUsersMongoInstance, createAndStartUsersMongoExpressInstance} = require(
    '../../common/docker');
const proxy = require('../../common/connections').proxy;
const log = require('debug')('hostlab:route:api:application');
const slugify = require('slugify');
const gitlab_token = process.env.GITLAB_TOKEN;
const gitlab_url = process.env.GITLAB_URL;
const hostlab_ip = process.env.VM_HOSTLAB_IP;
const proxy_port = process.env.PROXY_PORT;
const mongoose = require('mongoose');
const { getPackageJSON } = require('../../modules/getpackagejson');

const User = require('../../models/user');

router.post('/', async (req, res, next) => {
  try {
    const mongoID = mongoose.Types.ObjectId();
    const bluePrintID = req.body.blueprintId;
    const mountPath = req.body.path;
    const scriptIndex = req.body.scriptIndex;

    var blueprint;

    User.findById(req.user._id, async function(err, user) {
      if (err) {
        return next(err);
      }
      const blueprints = user.blueprints.node;
      for (var i in blueprints) {
        if (blueprints[i]._id == bluePrintID) {
          blueprint = blueprints[i];
        }
      }
      repositoryID = blueprint.containingRepoID;
      repositoryBranch = blueprint.containingRepoBranch;
      const packageJson = await getPackageJSON(repositoryID, repositoryBranch);

      log('Creating Container with Repository ID:', repositoryID);
      const archive = 'archive.tar.gz';
      const {path} = await tmp.dir({
        template: '/tmp/tmp-XXXXXX',
        unsafeCleanup: true,
      });
      const response = await snek.get(
          `${gitlab_url}/api/v4/projects/${repositoryID}/repository/archive?private_token=${gitlab_token}&sha=${repositoryBranch}`);
      await write(`${path}/${archive}`, response.body);
      log('File Saved.');
      await write(`${path}/Dockerfile`, dockerfile.node(archive), 'utf-8');
      // Kein Fehler beim Schreiben
      const out = await docker.buildImage({
        context: path,
        src: ['Dockerfile', archive],
      }, {t: 'node_' + bluePrintID});
      out.pipe(process.stdout, {
        end: true,
      });
      out.on('end', async () => {
        let freePort = 5000;

        const resUsers = await snek.get(
            `http://localhost:${req.app.settings.port}/api/v1/users`).
            set('cookie', req.headers.cookie);
        users = resUsers.body;
        let usedPortFound = false;

        do {
          usedPortFound = false;
          for (var i in users) {
            for (var j in users[i].containers.node) {
              if (users[i].containers.node[j].port == freePort.toString()) {
                freePort++;
                usedPortFound = true;
              }
            }
          }
        } while (usedPortFound);

        const container = await docker.createContainer({
          Image: 'node_' + bluePrintID,
          Cmd: (Object.keys(packageJson.scripts)[scriptIndex] || 'start'),
          name: mongoID.toString(),
          ExposedPorts: {
            [(process.env.CONTAINER_USER_PORT || '8080') + '/tcp']: {},
          },
          Hostconfig: {
            Privileged: true,
            PortBindings: {
              [(process.env.CONTAINER_USER_PORT || '8080') + '/tcp']: [
                {
                  HostPort: freePort.toString(),
                  HostIP: hostlab_ip,
                }],
            },
            RestartPolicy: {
              Name: 'unless-stopped',
              MaximumRetryCount: 0,
            },
          },
        });
        container.start(async () => {
          const response = await snek.get(
              `${gitlab_url}/api/v4/projects/${repositoryID}?private_token=${gitlab_token}`);
          const projID = JSON.parse(response.text).id;
          const repoName = JSON.parse(response.text).name;
          const userObj = user.email.split('@');
          User.findByIdAndUpdate(req.user._id, {
            $push: {
              'containers.node': {
                _id: `${mongoID}`,
                name: `${mountPath}`,
                port: freePort,
                repoName: `${repoName}`,
                blueprint: blueprint,
              },
            },
          }, (err, user) => {
            if (err) {
              return next(err);
            }
            proxy.register(
                `${hostlab_ip}:${proxy_port}/${userObj[1]}/${userObj[0]}/${slugify(
                    mountPath)}`, `${hostlab_ip}:${freePort}`);
            res.send(200);
            log('done');
          });
        });
      });
    });
  } catch (err) {
    console.error;
  }
});

router.post('/:id/start', async (req, res, next) => {
  const applicationID = req.param('id');
  log('nice');
  const container = docker.getContainer(applicationID);
  container.inspect(function(err, data) {
    if (data.State.Status == 'running') {
      res.send(400, {message: 'Bad Request: Container is already running.'});
    } else {
      container.start(function(err, data) {
        res.send(200);
      });
    }
  });
});

router.post('/:id/stop', async (req, res, next) => {
  const applicationID = req.param('id');
  log('nice');
  const container = docker.getContainer(applicationID);
  container.inspect(function(err, data) {
    if(data.State.Status === "running") {
      container.stop(function(err, data) {
        res.send(200);
      });
    } else {
      res.send(400, {message: 'Bad Request: Container is not running.'});
    }
  });
});

router.delete('/:id', async (req, res, next) => {
  const applicationID = req.param('id');
  User.findById(req.user._id, function(err, user) {
    user.containers.node.id(applicationID).remove();
    user.save();
    const container = docker.getContainer(applicationID);
    container.inspect(function(err, data) {
      if(data.State.Status === "running") {
        container.stop(function(err, data) {
          container.remove(function(err, data) {
            res.send(200);
          });
        });
      } else {
        container.remove(function(err, data) {
          res.send(200);
        });
      }
    });
  });
});

module.exports = router;
