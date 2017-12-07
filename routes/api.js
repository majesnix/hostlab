const router = require('express').Router();
const log = require('debug')('hostlab:route:api');
const util = require('util');
const {exec} = require('child_process');
const request = require('request');
const fs = require('fs');
const path = require('path');
const {docker, dockerfile} = require('../config/docker');

router.post('/container', (req, res, next) => {
  log('Erfolgreich in der Post');
  log(req.body);
  const {http_url_to_repo, type} = req.body;

  exec('mktemp -d', (error, tmp_folder, stderr) => {
    if (error) {
      log(`exec error: ${error}`);
      return next(error);
    }
    tmp_folder = tmp_folder.trim();
    log(`stdout: ${tmp_folder}`);
    log(`stderr: ${stderr}`);
    /*
    request.get({url:'http://gitlab.local/api/v4/projects/2/repository/archive?private_token='+process.env.GITLAB_TOKEN}, function (err, httpResponse, body) {
      if (err) {
        return console.error('Git get User Repositries failed', err);
      }
      let buff = new Buffer(body);
      fs.writeFile('/home/student/archive', buff,'binary', (err) =>{
        if (err) throw err;
        log('File has been saved');
      });
    });
    */

    if (type.includes('node')) {
      const archive = 'archive.tar.gz';
      exec(util.format(
          'wget http://gitlab.local/api/v4/projects/2/repository/archive?' +
          'private_token=%s -O %s',
          process.env.GITLAB_TOKEN, path.join(tmp_folder, archive)),
          function(error, stdout, stderr) {
            if (error) {
              console.error(`exec error: ${error}`);
              return next(error);
            }
            log(`Repo Saved`);
            fs.writeFile(path.join(tmp_folder, 'Dockerfile'),
                dockerfile.node(archive), 'utf-8', function(err) {
                  if (err) {
                    log('writeFile:', err);
                    return next(err);
                  }// Kein Fehler beim Schreiben
                  docker.buildImage({
                    context: tmp_folder,
                    src: ['Dockerfile', archive],
                  }, {t: 'nodeimage'}, function(err, output) {
                    if (err) {
                      log('buildImage', err);
                      return next(err);
                    }// Kein Fehler beim Image erstellen
                    output.pipe(process.stdout);
                    // Erfolgreich erstellt --> 201 Created
                    res.status(201).end();
                  });
                });
          });
    }// else
  });
});

module.exports = router;
