const router = require('express').Router();
const util = require('util');
const {exec} = require('child_process');
const request = require('request');
const fs = require('fs');

router.post('/', (req, res, next) => {
  console.log("Erfolgreich in der Post");
  let http_url_to_repo = req.body.http_url_to_repo;
  let type = req.body.type;
  exec('mktemp -d', (error, tmp_folder, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    tmp_folder = tmp_folder.trim();
    console.log(`stdout: ${tmp_folder}`);
    console.log(`stderr: ${stderr}`);
    /*
    request.get({url:'http://gitlab.local/api/v4/projects/2/repository/archive?private_token='+process.env.GITLAB_TOKEN}, function (err, httpResponse, body) {
      if (err) {
        return console.error('Git get User Repositries failed', err);
      }
      let buff = new Buffer(body);
      fs.writeFile('/home/student/archive', buff,'binary', (err) =>{
        if (err) throw err;
        console.log('File has been saved');
      });
    }); 
    */

    exec(util.format('wget http://gitlab.local/api/v4/projects/2/repository/archive?private_token=%s\
    -O '+tmp_folder+'/archive.tar.gz', process.env.GITLAB_TOKEN), function(error, stdout, stderr){
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`Repo Saved`);
    });
  });
});

module.exports = router;
