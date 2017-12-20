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
          url: process.env.LDAP_URL || require('./ldap').url,
          bindDn: process.env.BINDDN || require('./ldap').bindDn,
          bindCredentials: process.env.BINDCREDENTIALS || require('./ldap').bindCredentials,
          searchBase: process.env.SEARCHBASE || require('./ldap').searchBase,
          searchFilter: process.env.SEARCHFILTER || require('./ldap').searchFilter,
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

          // Check if a account with this email exists
          const hostlabUser = await User.findOne({email: user.mail});

          if (!hostlabUser) {
            const createUser = require('../tasks/createUser');

            // Create a new account
            const newUser = await createUser({
              email: user.mail,
              firstname: user.cn,
              lastname: user.sn,
              isAdmin: (user.ou) ? (user.ou.includes('administrator')) : false
            });

            /**
            * Bei erfolgreichem Login wird das Usermodel geupdated und der letzte Login gespeichert
            */
            newUser.updateLastLogin();
    
            return done(null, newUser);
          } else {
            // DISCUSS: Or check for Unique key constraint error
            hostlabUser.updateLastLogin();
            return done(null, hostlabUser);
          }
        } catch (err) {

          return done(null, false, {message: err.message});
        }
      },
  ))};
