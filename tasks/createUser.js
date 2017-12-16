const log = require('debug')('hostlab:task:createUser');
const User = require('../models/user');
const snek = require('snekfetch'); // Handles all http requests

const gitlab_token = process.env.GITLAB_TOKEN ||
    require('../config/gitlab_token').gitlab_token;
const gitlab_url = process.env.GITLAB_URL;

module.exports = async (opts) => {
  // Create new Promise
  return new Promise( async (resolve,reject) => {

    try {
      // Erstelle neuen Nutzer aus Schema
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
      const {text} = await snek.get(`${gitlab_url}/api/v4/users?private_token=${gitlab_token}`);

      // parse Gitlab response to json
      const users = JSON.parse(text);

      // filter users by email (should return the wanted user, because emails should be unique)
      const foundUser = users.filter(u => u.email === opts.email);

      log(foundUser);

      if (foundUser.length === 0) {
        return reject(new Error(`You need to have an active Account at ${gitlab_url} to use this service`));
      }

      // save gitlab_id to database
      newUser.gitlab_id = foundUser[0].id;

      newUser.save(err => {
        if (err) {
          log(err);
          return reject(err);
        }
        // Resolve Promise and return created User
        return resolve(newUser);
      });
    } catch (err) {
      log(err);
      if (err.message.includes('getaddrinfo ENOTFOUND')) {
        return reject(new Error('Gitlab is temporarily not available, please try again later'));
      } else {
        return reject(err);
      }
    }
  });
};
