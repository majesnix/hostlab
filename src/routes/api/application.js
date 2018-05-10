/*
 * This file is part of The HostLab Software.
 *
 * Copyright 2018
 *     Adrian Beckmann, Denis Paris, Dominic Claßen,
 *     Jan Wystub, Manuel Eder, René Heinen, René Neißer.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
const mongoose = require('mongoose');
const getPackageJSON = require('../../modules/getpackagejson');

const User = require('../../models/user');

const usersNetwork = 'hostlab_users';

router.post('/', async (req, res, next) => {
  try {
    const mongoID = mongoose.Types.ObjectId();
    const repositoryID = req.body.repo[0];
    const repositoryBranch = req.body.repo[1];
    const scriptIndex = req.body.scriptIndex;
    const mountPath = req.body.path;
    const needsMongo = req.body.needsMongo;

    const packageJson = await getPackageJSON(repositoryID, repositoryBranch);

    let mongoContainerID = '';
    if (needsMongo) {
      mongoContainerID = await createAndStartUsersMongoInstance(req);
      const mongoExpressID = await createAndStartUsersMongoExpressInstance(
          req, mongoContainerID);
    }

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
    }, {t: 'node_' + mongoID});
    out.pipe(process.stdout, {
      end: true,
    });
    out.on('end', async () => {

      const resUsers = await snek.get(
          `http://localhost:${req.app.settings.port}/api/v1/users`).
          set('cookie', req.headers.cookie);
      users = resUsers.body;

      const createContainerOpts = {
        Image: 'node_' + mongoID,
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
        const response = await snek.get(`${gitlab_url}/api/v4/projects/${repositoryID}?private_token=${gitlab_token}`);
        const responseCommit = await snek.get(`${gitlab_url}/api/v4/projects/${repositoryID}/repository/commits?private_token=${gitlab_token}&ref_name=${repositoryBranch}`);
        const projID = JSON.parse(response.text).id;
        const repoName = JSON.parse(response.text).name;
        const commitHash = JSON.parse(responseCommit.text)[0].short_id;
        const userObj = req.user.email.split('@');
        User.findByIdAndUpdate(req.user._id, {
          $push: {
            'containers.node': {
              _id: `${mongoID}`,
              name: `${mountPath}`,
              repoName: `${repoName}`,
              repoBranch: `${repositoryBranch}`,
              autostart: true,
              needsMongo: needsMongo,
              commitHash: `${commitHash}`
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
                `${req.app.get('host')}/${userObj[1]}/${userObj[0]}/${
                    slugify(mountPath)}`, `${containerIP}:8080`);
            res.sendStatus(200);
          });
        });
      });
    });
  } catch (err) {
    log(err);
    // Timeout to prevent abuse of resources in case of errors
    setTimeout(() => res.send(500, {message: 'Unable to create application'}),
        5000);
  }
});

router.post('/:id/start', async (req, res, next) => {
  const applicationID = req.param('id');
  const container = docker.getContainer(applicationID);
  container.inspect(function(err, data) {
    if (data.State.Status === 'running') {
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

            proxy.register(
                `${req.app.get('host')}/${userObj[1]}/${userObj[0]}/${
                    slugify(mountPath)}`, `${containerIP}:8080`);
            res.sendStatus(200);
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
          res.sendStatus(200);
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
            res.sendStatus(200);
          });
        });
      } else {
        container.remove(function(err, data) {
          res.sendStatus(200);
        });
      }
    });
  });
});

module.exports = router;
