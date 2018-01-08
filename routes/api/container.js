const router = require('express').Router();
const tmp = require('tmp');
const snek = require('snekfetch');
const fs = require('fs');
const path = require('path');
const {docker, dockerfile} = require('../../config/docker');
const log = require('debug')('hostlab:route:api:container');
const gitlab_token = process.env.GITLAB_TOKEN;
const gitlab_url = process.env.GITLAB_URL;
const hostlab_ip = process.env.VM_HOSTLAB_IP;
const proxy_port = process.env.PROXY_PORT;
const proxy = require('../../config/connections').proxy;
const User = require('../../models/user');



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
                                        let freePort=5000;

                                        snek.get(`http://localhost:${req.app.settings.port}/api/v1/users`).
                                            set('cookie', req.headers.cookie).
                                            then((res) => {
                                                users = res.body;
                                                let usedPortFound=false;

                                                do {
                                                    usedPortFound=false;
                                                    for (var i in users) {
                                                        for (var j in users[i].containers) {
                                                            if (users[i].containers[j].port == freePort.toString()) {
                                                                freePort++;
                                                                usedPortFound = true;
                                                            }
                                                        }
                                                    }
                                                } while (usedPortFound);

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
                                                                    HostPort: freePort.toString(),
                                                                    HostIP: hostlab_ip,
                                                                }],
                                                        },
                                                    },
                                                }, function(err, container) {
                                                    if (err) {
                                                        log(err);
                                                        return;
                                                    }
                                                    container.start(function(err, data) {
                                                        if (err) {
                                                            log(err);
                                                            return;
                                                        }


                                                        snek.get(`${gitlab_url}/api/v4/projects/${repositoryID}?private_token=${gitlab_token}`)
                                                            .then((response) => {
                                                                log(response);
                                                                const appName = JSON.parse(response.text).path;
                                                                const projID = JSON.parse(response.text).id;
                                                                proxy.register(`${hostlab_ip}:${proxy_port}/apps/${appName}-${projID}`, `${hostlab_ip}:${freePort}`);

                                                                User.findByIdAndUpdate(req.user._id, {$push: {containers: {name: `${appName}-${projID}`, port: freePort, scriptLoc: '/a/path/'}}}, function(err, user) {
                                                                    if (err) {
                                                                        return next(err);
                                                                    }
                                                                });
                                                            });
                                                    });
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