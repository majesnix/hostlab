const router = require('express').Router();
const {promisify} = require('util');
const tmp = require('tmp-promise');
const snek = require('snekfetch');
const write = promisify(require('fs').writeFile);
const {docker, dockerfile} = require('../../common/docker');
const proxy = require('../../common/connections').proxy;
const log = require('debug')('hostlab:route:api:container');
const slugify = require('slugify');
const gitlab_token = process.env.GITLAB_TOKEN;
const gitlab_url = process.env.GITLAB_URL;
const hostlab_ip = process.env.VM_HOSTLAB_IP;
const proxy_port = process.env.PROXY_PORT;
const mongoose = require('mongoose');

const User = require('../../models/user');

router.post('/:repositoryID', async (req, res, next) => {
  try {
    const mongoID = mongoose.Types.ObjectId();
    const {repositoryID} = req.params;
    log('Creating Container with Repository ID:', repositoryID);
    const archive = 'archive.tar.gz';
    const {path} = await tmp.dir({
      template: '/tmp/tmp-XXXXXX',
      unsafeCleanup: true,
    });
    const response = await snek.get(
        `${gitlab_url}/api/v4/projects/${repositoryID}/repository/archive?private_token=${gitlab_token}`);
    await write(`${path}/${archive}`, response.body);
    log('File Saved.');
    await write(`${path}/Dockerfile`, dockerfile.node(archive), 'utf-8');
    // Kein Fehler beim Schreiben
    const out = await docker.buildImage({
      context: path,
      src: ['Dockerfile', archive],
    }, {t: 'nodeimage'});
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
        Image: 'nodeimage',
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
        },
      });
      container.start(async () => {
        const response = await snek.get(
            `${gitlab_url}/api/v4/projects/${repositoryID}?private_token=${gitlab_token}`);
        const appName = req.body.name;
        const projID = JSON.parse(response.text).id;
        const repoName = JSON.parse(response.text).name;

        User.findById(req.user._id, (err, user) => {
          if (err) {
            return next(err);
          }
          const userObj = user.email.split('@');
          const proxyLink = `${hostlab_ip}:${proxy_port}/${userObj[1]}/${userObj[0]}/${slugify(
              appName)}`;

          User.findByIdAndUpdate(req.user._id, {
            $push: {
              'containers.node': {
                _id: `${mongoID}`,
                name: `${appName}`,
                port: freePort,
                scriptLoc: '/a/path/',
                repoName: `${repoName}`,
                proxyLink: `${proxyLink}`,
              },
            },
          }, (err, user) => {
            if (err) {
              return next(err);
            }
            proxy.register(
                `${hostlab_ip}:${proxy_port}/${userObj[1]}/${userObj[0]}/${slugify(
                    appName)}`, `${hostlab_ip}:${freePort}`);
            res.send(200);
          });
        });
      });
    });
  } catch (err) {
    console.error;
  }
});

router.delete('/:repositoryID', (req, res, next) => {
  const {repositoryID} = req.params;
  log('Deleting Container with Repository ID:', repositoryID);
  res.send(repositoryID);
});

module.exports = router;
