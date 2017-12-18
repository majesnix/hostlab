const passport = require('passport');
const log = require('debug')('hostlab:passport');
const LdapStrategy = require('passport-ldapauth').Strategy;
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
      },
      async (user, done) => {
        // Try to create a DB Entry
        try {
          const createUser = require('../tasks/createUser');

          const newUser = await createUser({
            email,
            firstname: user.givenName,
            lastname: user.sn,
          });

          // ONLY needed when pw should be seperate to LDAP account.
          //req.flash('info', 'An Gitlab Account with the same credentials has been created.');

          /**
          * Bei erfolgreichem Login wird das Usermodel geupdated und der letzte Login gespeichert
          */
          newUser.updateLastLogin();
  
          return done(null, newUser);
        } catch (err) {
          req.flash('error', err.message);
          return done(null, false);
        }
      },
  ))};
