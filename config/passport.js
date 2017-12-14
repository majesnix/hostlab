const passport = require('passport');
const log = require('debug')('hostlab:passport');
const LdapStrategy = require('passport-ldapauth').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const SamlStrategy = require('passport-saml').Strategy;
const User = require('../models/user');

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

  /*log(process.env.LDAP_URL);
  log(process.env.BINDDN);
  log(process.env.BINDCREDENTIALS);
  log(process.env.SEARCHBASE);
  log(process.env.SEARCHFILTER);*/

  // Strategy LDAP
  /*passport.use(new LdapStrategy({
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
        passReqToCallback: true,
      },
      async (req, user, done) => {
        log('IT WOERKS');
        // Try to create a DB Entry
        try {
          const createUser = require('../tasks/createUser');

          let user;
          createUser({
            email: email,
            firstname: user.givenName,
            lastname: user.sn,
            isLdap: true,
            password: password,
          }, (err, newUser) => {
            if (err) {
              log('Error while creating initial user:', err.message);
              process.exit(err.code);
            }
            user = newUser;
            log('Created initial user: %o', user);
          });
  
          // ONLY needed when pw should be seperate to LDAP account.
          //req.flash('info', 'An Gitlab Account with the same credentials has been created.');
  
          return done(null, user);
        } catch (err) {
          console.error(err);
        }
      },
  ));*/

  /**
   * Strategie für den lokalen Login
   */
  passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        // try to find the user
        try {
          const userCount = await User.count();
          log('Got %d user(s)', userCount);

          let user;
          if (userCount === 0) {
            log('Creating initial user...');

            const createUser = require('../tasks/createUser');
            const newUser = await createUser({
              email: email,
              firstname: 'Administrator',
              lastname: '',
              isAdmin: true,
              password: password,
            });
            log('Created initial user: %o', newUser);
            return done(null, newUser);
            /*, (err, newUser) => {
              if (err) {
                log('Error while creating initial user:', err.stack);
                process.exit(err.code);
              }
              user = newUser;
            });*/
          } else {
            // Search user in db
            user = await User.findOne({email});
            log('found user %o', user);
          

            /**
             * Wenn kein User vorhanden ist schlägt der Login fehl und der Callback
             * wird ohne User aufgerufen
             * Wenn User LDAP User war, aber die LDAP Authentifizierung nicht erfolgreich war,
             * dann darf er sich nicht einloggen
             */
            // if no user was found, return error
            if (!user || user.isLdap) {
              req.flash('error', 'Incorrect credentials');
              return done(null, false);
            }

            /**
             * Passwort in Userdatenbank überprüfen und nur bei korrektem Passwort weiterleiten
             */

            user.validatePassword(password, function(err, valid) {
              if (err) {
                return done(err);
              }
              if (!valid) {
                req.flash('error', 'Incorrect credentials');
                return done(null, false);
              }
              /**
               * Bei erfolgreichem Login wird das Usermodel geupdated und der letzte Login gespeichert
               */
              user.updateLastLogin();

              /**
               * Bei erfolgreichem Login weiterleiten
               */
              return done(null, user);
            
            });
          }
        } catch (err) {
          req.flash('error', err);
          return done(null, false);
        }
      }));

  // Preparations for Shibboleth (maybe)
  passport.use(new SamlStrategy({
        path: '',
        entryPoint: '',
        issuer: 'passport-saml',
      },
      (profile, done) => {
        findByEmail(profile.email, (err, user) => {
          if (err) {
            return done(err);
          }
          return done(null, user);
        });
      }));
};
