const log = require('debug')('hostlab:task:createUser');
const User = require('../models/user');
//const request = require('request');  // Request-Modul ermöglicht das POSTen an den Gitlab-Server
//const util = require('util');
const snek = require('snekfetch');

const gitlab_token = process.env.GITLAB_TOKEN ||
    require('../config/gitlab_token').gitlab_token;
const gitlab_url = process.env.GITLAB_URL;

module.exports = async (opts) => {
  // Erstelle neuen Nutzer aus Schema
  // Erstellt ein neues Promise
  return new Promise( async (resolve,reject) => {
    const newUser = new User();
    newUser.email = opts.email;
    newUser.firstname = opts.firstname;
    newUser.lastname = opts.lastname;
    newUser.isAdmin = opts.isAdmin;
    newUser.isLdap = opts.isLdap;

    newUser.hashPassword(opts.password, (err, hash) => {
      if (err) {
        return reject(err);
      }
      newUser.password = hash;
    });

    // POST-Request zur Erstellung eines Gitlab-Nutzers
    // Token wird aus der Env-Variable "GITLAB_TOKEN" gelesen
    // GitlabURL wird aus der Env-Variable "GITLAB_URL" gelesen

    // gets ALL gitlab users
    const {text} = await snek.get(`https://${gitlab_url}/api/v4/users?private_token=${gitlab_token}`);

    // parse Gitlab response to json
    const users = JSON.parse(text);

    // filter users by email (should return the wanted user, because emails should be unique)
    const foundUser = users.filter(u => u.email === opts.email);

    log(foundUser);

    if (foundUser.length === 0) {
      return reject(`You need to have a valid Gitlab account at https://${gitlab_url} to use this service`);
    }

    // save gitlab_id to database
    newUser.gitlab_id = foundUser.id;

    newUser.save(err => {
      if (err) {
        log(err);
        return reject(err);
      }
      // Resolve Promise and return created User
      return resolve(newUser);
    });
  });
};
