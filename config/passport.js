const passport = require('passport');
const log = require('debug')('hostlab:passport');
const LdapStrategy = require('passport-ldapauth').Strategy;
const User = require('../models/user');
const snek = require('snekfetch'); // Handles all http requests
const passwordgen = require('passwordgen');
const gitlab_token = process.env.GITLAB_TOKEN;
const gitlab_url = process.env.GITLAB_URL;

module.exports = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());

  /**
   * Diese Funktion wird bei erfolgreichem Login mit dem user Objekt aufgerufen
   * Der Callback done(null, user.id) gibt an, welche Daten des Nutzers im Cookie gespeichert werden
   * um ihn später wieder zu identifizieren
   */
  passport.serializeUser((user, done) => {
    log('Serialize User ', user);
    done(null, user.id);
  });

  /**
   * User wird bei einem Request mit der in serializeUser definierten Paramater in der Datenbank
   * gesucht und als Objekt in req.user gespeichert.
   */
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // Strategy LDAP
  passport.use(new LdapStrategy({
        server: {
          url: process.env.LDAP_URL,
          bindDn: process.env.BINDDN,
          bindCredentials: process.env.BINDCREDENTIALS,
          searchBase: process.env.SEARCHBASE,
          searchFilter: process.env.SEARCHFILTER,
        },
        handleErrorsAsFailures: true,
        usernameField: 'email',
        passwordField: 'password',
        // Req is needed for req.flash()
        passReqToCallback: true,
      },
      async (req, user, done) => {
        // Try to create a DB Entry
        try {
          log(user);

          // Check if a HOSTLAB account with this email exists
          const hostlabUser = await User.findOne({email: user.mail});

          // If user has no hostlab account
          if (!hostlabUser) {
            // gets ALL gitlab users
            const {text} = await snek.get(
                `${gitlab_url}/api/v4/users?private_token=${gitlab_token}`);

            // parse Gitlab response to json
            const users = JSON.parse(text);

            // filter users by email (should return the wanted user, because emails should be unique)
            const foundUser = users.filter(u => u.email === user.mail);

            // Erstelle neuen Nutzer aus Schema
            const newUser = new User();
            newUser.email = user.email;
            newUser.firstname = user.cn;
            newUser.lastname = user.sn;
            newUser.isAdmin = (user.ou)
                ? (user.ou.includes('administrator'))
                : false;
            // User has a gitlab account
            if (foundUser.length === 1) {
              newUser.gitlab_id = foundUser[0].id;
              newUser.avatar_url = foundUser[0].avatar_url
                  ? foundUser[0].avatar_url
                  : '/vendor/assets/default.png';

              await newUser.save();
              /**
               * Bei erfolgreichem Login wird das Usermodel geupdated und der letzte Login gespeichert
               */
              newUser.updateLastLogin();

              done(null, newUser, req.flash('message','Hostlab account created'));
            }
            // user has NO Gitlab account
            else {
              // CREATE new password for gitlab user
              const pass = passwordgen(8, false);

              // CREATE Gitlab account with random pass
              const { text } = await snek.post(`${gitlab_url}/api/v4/users?private_token=${gitlab_token}&email=${user.mail}&password=${pass}&username=${user.cn}&name=${user.cn}&skip_confirmation=true&can_create_group=false`);
              const parsedRes = JSON.parse(text);

              newUser.gitlab_id = parsedRes.id;
              newUser.avatar_url = parsedRes.avatar_url
                  ? parsedRes.avatar_url
                  : '/vendor/assets/default.png';

              await newUser.save();

              newUser.updateLastLogin();

              done(null, newUser, req.flash('message', `Hostlab account created. We also created a Gitlab account at ${gitlab_url} for you!`));
            }
          }
          // user has a hostlab account
          else {
            // DISCUSS: Or check for Unique key constraint error
            hostlabUser.updateLastLogin();
            return done(null, hostlabUser);
          }
        }
            // Errorhandling
        catch (err) {
          if (err.message.includes('getaddrinfo ENOTFOUND')) {
            return done(null, false,
                {message: 'Gitlab is temporarily not available, please try again later'});
          } else {
            return done(null, false, {message: err.message});
          }
        }

      },
  ));
};
