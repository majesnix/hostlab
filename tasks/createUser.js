const log = require('debug')('hostlab:task:createUser');
const User = require('../databases/mongodb/models/user');
const request = require('request');  // Request-Modul ermöglicht das POSTen an den Gitlab-Server

module.exports = (opts, callback) => {
  // Erstelle neuen Nutzer aus Schema
  let newUser = new User();
  newUser.username = opts.username;
  newUser.email = opts.email;
  newUser.isAdmin = opts.isAdmin;
  newUser.isLdapUser = opts.isLdapUser;

  newUser.hashPassword(opts.password, function(err, hash) {
    if (err) {
      return callback(err);
    }
    newUser.password = hash;
  });

  // Gitlab-Optionen, die zur Nutzererstellung benötigt werden
  const gitlabopts = {
    email: opts.email,
    username: opts.username,
    name: opts.username,
    password: opts.password,
    admin: String(opts.isAdmin),
    skip_confirmation: 'true',  // E-Mail-Überprüfung überspringen
  };
  log(gitlabopts);

  // POST-Request zur Erstellung eines Gitlab-Nutzers
  // Token wird aus der Env-Variable "GITLAB_TOKEN" gelesen
  request.post({
    url: 'http://gitlab.local/api/v4/users?private_token=' +
    process.env.GITLAB_TOKEN,
    formData: gitlabopts,
  }, function(err, httpResponse, body) {
    if (err) {
      log('Gitlab-Nutzererstellung fehlgeschlagen:', err);
      return callback(err);
    }
    log('Gitlab-Nutzer erstellt:', JSON.parse(body));

    // Gitlab-Nutzer-ID an Nutzer anhängen
    newUser.gitlab_id = JSON.parse(body).id;

    // Nutzer in die Datenbank schreiben
    newUser.save(function(err) {
      if (err) {
        log(err);
        return callback(err);
      }

      /**
       * Wenn kein Linux-System, dann Systemnutzerverwaltung überspringen
       */
      const linuxUser = process.platform === 'linux'
          ? require('linux-user')
          : {
            addUser: () => {
              log('Kein Linux-System, überspringe Systemnutzerverwaltung');
              return callback(null, newUser);
            },
          };

      /**
       * Erstelle Systemuser mit Homeverzeichnis
       */
      linuxUser.addUser(opts.username, (err, user) => {
        if (err) {
          return callback(err);
        }

        /**
         * Setze Userpasswort
         */
        linuxUser.setPassword(opts.username, opts.password, (err) => {
          if (err) {
            return callback(err);
          }
          return callback(null, newUser);
        });
      });
    });
  });
};
