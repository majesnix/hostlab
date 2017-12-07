const LdapStrategy = require('passport-ldapauth').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = (passport) => {
  /**
   * Diese Funktion wird bei erfolgreichem Login mit dem user Objekt aufgerufen
   * Der Callback done(null, user.id) gibt an, welche Daten des Nutzers im Cookie gespeichert werden
   * um ihn später wieder zu identifizieren
   */
  passport.serializeUser(function(user, done) {
    console.log('Serialize User ', user);
    done(null, user.id);
  });

  /**
   * User wird bei einem Request mit der in serializeUser definierten Paramater in der Datenbank
   * gesucht und als Objekt in req.user gespeichert.
   */
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  /**
   * Strategie für den lokalen Login
   */
  passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
      },
      function(req, username, password, done) {
        /**
         * User in der Datenbank suchen
         */
        User.findOne({'username': username}, function(err, user) {
          if (err) {
            console.error(err);
            return done(err);
          }
          /**
           * Wenn kein User vorhanden ist schlägt der Login fehl und der Callback
           * wird ohne User aufgerufen
           */
          if (!user)
            return done(null, false);

          /**
           * Wenn User LDAP User war, aber die LDAP Authentifizierung nicht erfolgreich war,
           * dann darf er sich nicht einloggen
           */
          if (user.isLdapUser) {
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
        });
      },
  ));

  passport.use('ldapauth', new LdapStrategy({
        server: {
          url: 'ldap://localhost:389',
          bindDN: 'cn=root',
          bindCredentials: 'secret',
          searchBase: 'ou=passport-ldapauth',
          searchFilter: '(uid={{username}})',
        },
      },
      function(req, user, done) {
        User.findOne({'username': user}, function(err, user) {
          console.log(user);
          if (err) {
            console.error(err);
            return done(err);
          }
          if (!user) {
            // TODO: Konto anlegen und LDAP Tag einfügen
            // TODO: Dann weiterleiten mit "done"
          }
          return done(null, user);
        });
      },
  ));
};
