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
const hostlab_ip = process.env.HOSTNAME;
const mongoose = require('mongoose');
const getPackageJSON = require('../../modules/getpackagejson');

const User = require('../../models/user');

const usersNetwork = 'hostlab_users';

router.post('/', async (req, res, next) => {
  try {
    const mongoID = mongoose.Types.ObjectId();
    const bluePrintID = req.body.blueprintId;
    const mountPath = req.body.path;
    const scriptIndex = req.body.scriptIndex;
    const needsMongo = req.body.needsMongo;

    let mongoContainerID = "";
    if (needsMongo) {
      mongoContainerID = await createAndStartUsersMongoInstance(req);
      const mongoExpressID = await createAndStartUsersMongoExpressInstance(
          req, mongoContainerID);
    }

    var blueprint;

    const blueprints = req.user.blueprints.node;
    for (var i in blueprints) {
      if (blueprints[i]._id == bluePrintID) {
        blueprint = blueprints[i];
      }
    }
    const repositoryID = blueprint.containingRepoID;
    const repositoryBranch = blueprint.containingRepoBranch;
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

      const resUsers = await snek.get(
          `http://localhost:${req.app.settings.port}/api/v1/users`).
          set('cookie', req.headers.cookie);
      users = resUsers.body;

      const createContainerOpts = {
        Image: 'node_' + bluePrintID,
        Cmd: (Object.keys(packageJson.scripts)[scriptIndex] || 'start'),
        name: mongoID.toString(),
        Env: [
          `MONGO=${mongoContainerID}`,
        ],
        ExposedPorts: {
          '8080/tcp': {},
        },
        Hostconfig: {
          NetworkMode: usersNetwork,
        },
      };

      const container = await docker.createContainer(createContainerOpts);

      container.start(async () => {
        const response = await snek.get(
            `${gitlab_url}/api/v4/projects/${repositoryID}?private_token=${gitlab_token}`);
        const projID = JSON.parse(response.text).id;
        const repoName = JSON.parse(response.text).name;
        const userObj = req.user.email.split('@');
        User.findByIdAndUpdate(req.user._id, {
          $push: {
            'containers.node': {
              _id: `${mongoID}`,
              name: `${mountPath}`,
              repoName: `${repoName}`,
              blueprint: blueprint,
              autostart: true,
              needsMongo: needsMongo,
            },
          },
        }, (err, user) => {
          if (err) {
            return next(err);
          }
          container.inspect((err, data) => {
            if (err) {
              return next(err);
            }
            const containerIP = data.NetworkSettings.Networks.hostlab_users.IPAddress;
            proxy.register(
                `${hostlab_ip}/${userObj[1]}/${userObj[0]}/${slugify(
                    mountPath)}`, `${containerIP}:8080`);
            res.send(200);
          });
        });
      });
    });
  } catch (err) {
    log(err);
  }
});

router.post('/:id/start', async (req, res, next) => {
  const applicationID = req.param('id');
  const container = docker.getContainer(applicationID);
  container.inspect(function(err, data) {
    if (data.State.Status == 'running') {
      res.send(400, {message: 'Bad Request: Container is already running.'});
    } else {
      User.findById(req.user._id, function(err, user) {
        user.containers.node.id(applicationID).autostart = true;
        user.save();

        container.start(function(err, data) {
          container.inspect(function(err, data) {
            const userObj = user.email.split('@');
            const containerIP = data.NetworkSettings.Networks.hostlab_users.IPAddress;
            const mountPath = user.containers.node.id(applicationID).name;

            proxy.register(`${hostlab_ip}/${userObj[1]}/${userObj[0]}/${slugify(
                mountPath)}`, `${containerIP}:8080`);
            res.send(200);
          });
        });
      });
    }
  });
});

router.post('/:id/stop', async (req, res, next) => {
  const applicationID = req.param('id');
  const container = docker.getContainer(applicationID);
  container.inspect(function(err, data) {
    if (data.State.Status === 'running') {
      User.findById(req.user._id, function(err, user) {
        user.containers.node.id(applicationID).autostart = false;
        user.save();

        container.stop(function(err, data) {
          res.send(200);
        });
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
      if (data.State.Status === 'running') {
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
