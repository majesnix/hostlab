const passport = require('passport');
const log = require('debug')('hostlab:passport');
const LdapStrategy = require('passport-ldapauth').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const SamlStrategy = require('passport-saml').Strategy;
// const {url, bindDn, bindCredentials, searchBase, searchFilter, dbURL, gitlabURL, gitlabAdmin, gitlabToken} = require('../config');
const snek = require('snekfetch');
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
  // passport.use(new LdapStrategy({
  //       server: {
  //         url: url,
  //         bindDn: bindDn,
  //         bindCredentials: bindCredentials,
  //         searchBase: searchBase,
  //         searchFilter: searchFilter,
  //       },
  //       handleErrorsAsFailures: true,
  //       usernameField: 'email',
  //       passReqToCallback: true,
  //     },
  //     async (req, user, done) => {
  //       // Try to create a DB Entry
  //       try {
  //         const salt = bcrypt.genSaltSync(10);
  //         const hashedPassword = bcrypt.hashSync(req.body.password, salt);
  //         const dbUser = await User.create({
  //           matrnr: user.userPrincipalName.split('@')[0],
  //           email: user.userPrincipalName,
  //           firstname: user.givenName,
  //           lastname: user.sn,
  //           password: hashedPassword,
  //           salt: salt,
  //         });
  //         // CREATE new password for gitlab user
  //         //const pass = passwordgen(8, false);
  //         //const salt = bcrypt.genSaltSync(10);
  //         //const hashedPassword = bcrypt.hashSync(pass, salt);
  //
  //         //const { text } = await snek.post(`${gitlabURL}/api/v4/users?private_token=${gitlabToken}&sudo=${gitlabAdmin}&email=${dbUser.email}&password=${pass}&username=${dbUser.matrnr}&name=${dbUser.firstname}&skip_confirmation=true&projects_limit=0&can_create_group=false`);
  //
  //         //use req.body.password for gitlab password creation (could fail if password is to simple)
  //         const {text} = await snek.post(
  //             `${gitlabURL}/api/v4/users?private_token=${gitlabToken}&sudo=${gitlabAdmin}&email=${dbUser.email}&password=${req.body.password}&username=${dbUser.matrnr}&name=${dbUser.firstname}&skip_confirmation=true&projects_limit=5&can_create_group=false`);
  //         const parsedRes = JSON.parse(text);
  //
  //         dbUser.update({gitlabid: parsedRes.id});
  //
  //         const userinfo = {
  //           user: dbUser,
  //           projects: [],
  //           participations: [],
  //         };
  //
  //         userinfo.projects.dbs = [];
  //         userinfo.projects.apps = [];
  //         userinfo.participations.dbs = [];
  //         userinfo.participations.apps = [];
  //
  //         // ONLY needed when pw should be seperate to LDAP account.
  //         //req.flash('info', `Your Gitlab Account password will be ${pass}. Please copy it to a safe place NOW!`);
  //         req.flash('info',
  //             'An Gitlab Account with the same credentials has been created.');
  //
  //         return done(null, userinfo);
  //       } catch (err) {
  //         if (err.name === 'SequelizeUniqueConstraintError') {
  //           const user = await User.findOne(
  //               {where: {matrnr: user.userPrincipalName.split('@')[0]}});
  //           const projects = await Project.findAll(
  //               {where: {userid: user.matrnr}});
  //           const participations = await sequelize.query(`SELECT projectparticipants.projectid, projectparticipants.userid, projects.name \
  //       FROM projectparticipants \
  //       INNER JOIN projects ON projects.id=projectparticipants.projectid \
  //       WHERE projectparticipants.userid = '${user.matrnr}'`);
  //           const apps = await Application.findAll();
  //           const dbs = await Database.findAll();
  //
  //           const userinfo = {
  //             user: user,
  //             projects: projects,
  //             participations: participations[0],
  //           };
  //
  //           userinfo.projects.map(p => p.dbs = []);
  //           userinfo.projects.map(p => p.apps = []);
  //           userinfo.participations.map(p => p.dbs = []);
  //           userinfo.participations.map(p => p.apps = []);
  //
  //           projects.map(p => {
  //             const projIndex = projects.indexOf(p);
  //             const app = apps.filter(app => p.id === app.projectid);
  //             const db = dbs.filter(db => p.id === db.projectid);
  //             if (app.length !== 0) {
  //               app.map(a => userinfo.projects[projIndex].apps.push(a));
  //             }
  //             if (db.length !== 0) {
  //               db.map(d => userinfo.projects[projIndex].dbs.push(d));
  //             }
  //           });
  //
  //           participations.map(p => {
  //             const projIndex = participations.indexOf(p);
  //             if (p[0]) {
  //               const app = apps.filter(
  //                   app => p[0].projectid === app.projectid);
  //               const db = dbs.filter(db => p[0].projectid === db.projectid);
  //               if (app.length !== 0) {
  //                 app.map(a => userinfo.participations[projIndex].apps.push(a));
  //               }
  //               if (db.length !== 0) {
  //                 db.map(d => userinfo.participations[projIndex].dbs.push(d));
  //               }
  //             }
  //           });
  //
  //           return done(null, userinfo);
  //         } else {
  //           console.error(err);
  //         }
  //       }
  //     },
  // ));

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
            await createUser({
              email: email,
              firstname: 'Administrator',
              lastname: '',
              isAdmin: true,
              password: password,
              initialGitlabCreation: true,
            }, (err, newUser) => {
              if (err) {
                log('Error while creating initial user:', err.message);
                process.exit(err.code);
              }
              user = newUser;
              log('Created initial user: %o', user);
            });
          } else {
            // Search user in db
            user = await User.findOne({email});
            log('found user %o', user);
          }

          /**
           * Wenn kein User vorhanden ist schlägt der Login fehl und der Callback
           * wird ohne User aufgerufen
           * Wenn User LDAP User war, aber die LDAP Authentifizierung nicht erfolgreich war,
           * dann darf er sich nicht einloggen
           */
          // if no user was found, return error
          if (!user || user.isLdap) {
            return done(null, false, {message: 'Incorrect credentials.'});
          }

          /**
           * Passwort in Userdatenbank überprüfen und nur bei korrektem Passwort weiterleiten
           */
          user.validatePassword(password, function(err, valid) {
            if (err) {
              return done(err);
            }
            if (!valid) {
              return done(null, false, {message: 'Incorrect credentials.'});
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
        } catch (err) {
          console.error(err);
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
