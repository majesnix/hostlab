const router = require('express').Router();
const util = require('util');
const {exec} = require('child_process');

router.post('/', (req, res, next) => {
  let http_url_to_repo = req.body.http_url_to_repo;
  let type = req.body.type;

  exec('mktemp -d', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    exec(util.format('git clone %s %s', http_url_to_repo, stdout),
        (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }

        });

  });
});

module.exports = router;
