const router = require('express').Router();
const tmp = require('tmp');
const snek = require('snekfetch');
const fs = require('fs');
const path = require('path');
const {docker, dockerfile} = require('../../config/docker');
const log = require('debug')('hostlab:route:api:container');
const gitlab_token = process.env.GITLAB_TOKEN;
const gitlab_url = process.env.GITLAB_URL;

router.post('/:repositoryID', (req, res, next) => {
  const {repositoryID} = req.params;
  log('Creating Container with Repository ID:', repositoryID);
  const archive = 'archive.tar.gz';
  tmp.dir({
    template: '/tmp/tmp-XXXXXX',
    unsafeCleanup: true,
  }, function(err, tempPath, removeCallback) {
    if (err) {
      throw err;
    }
    console.log('Dir: ', tempPath);
    snek.get(
        `${gitlab_url}/api/v4/projects/${repositoryID}/repository/archive?private_token=${gitlab_token}`).
        then((response) => {
          fs.writeFile(path.join(tempPath, archive), response.body,
              (err) => {
                if (err) {
                  log(err);
                }
                log('File Saved.');
                fs.writeFile(path.join(tempPath, 'Dockerfile'),
                    dockerfile.node(archive), 'utf-8', function(err) {
                      if (err) {
                        log('writeFile:', err);
                        return next(err);
                      }// Kein Fehler beim Schreiben
                      docker.buildImage({
                        context: tempPath,
                        src: ['Dockerfile', archive],
                      }, {t: 'nodeimage'}, function(err, output) {
                        if (err) {
                          log('buildImage', err);
                          return next(err);
                        }// Kein Fehler beim Image erstellen
                        output.pipe(process.stdout, {
                          end: true,
                        });
                        output.on('end', function() {
                          docker.createContainer({
                            Image: 'nodeimage',
                            ExposedPorts: {
                              '8080/tcp': {},
                            },
                            Hostconfig: {
                              Privileged: true,
                              PortBindings: {
                                '8080/tcp': [
                                  {
                                    HostPort: '5000',
                                  }],
                              },
                            },
                          }, function(err, container) {
                            container.start(function(err, data) {
                              if (err) return;
                            });
                          });
                        });
                      });
                    });
              });
        });
  });
});

router.delete('/:repositoryID', (req, res, next) => {
  const {repositoryID} = req.params;
  log('Deleting Container with Repository ID:', repositoryID);
  res.send(repositoryID);
});

module.exports = router;