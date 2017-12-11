const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const LdapStrategy = require('passport-ldapauth').Strategy;
const SamlStrategy = require('passport-saml').Strategy;
const { url, bindDn, bindCredentials, searchBase, searchFilter, dbURL, gitlabURL, gitlabAdmin, gitlabToken } = require('../config');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbURL, { logging: false, operatorsAliases: Sequelize.Op } );
const snek = require('snekfetch');
const passwordgen = require('password-generator');

const bcrypt = require('bcrypt');
const { User, Project, Application, Database } = require('./db');

module.exports = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LdapStrategy({
    server: {
      url: url,
      bindDn: bindDn,
      bindCredentials: bindCredentials,
      searchBase: searchBase,
      searchFilter: searchFilter
    },
    handleErrorsAsFailures: true,
    usernameField: 'email',
    passReqToCallback: true,
  },
  async (req, user, done) => {
    // Try to create a DB Entry
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);
      const dbUser = await User.create({ matrnr: user.userPrincipalName.split('@')[0], email: user.userPrincipalName, firstname: user.givenName, lastname: user.sn, password: hashedPassword, salt: salt});
      // CREATE new password for gitlab user
      //const pass = passwordgen(8, false);
      //const salt = bcrypt.genSaltSync(10);
      //const hashedPassword = bcrypt.hashSync(pass, salt);

      //const { text } = await snek.post(`${gitlabURL}/api/v4/users?private_token=${gitlabToken}&sudo=${gitlabAdmin}&email=${dbUser.email}&password=${pass}&username=${dbUser.matrnr}&name=${dbUser.firstname}&skip_confirmation=true&projects_limit=0&can_create_group=false`);
      
      //use req.body.password for gitlab password creation (could fail if password is to simple)
      const { text } = await snek.post(`${gitlabURL}/api/v4/users?private_token=${gitlabToken}&sudo=${gitlabAdmin}&email=${dbUser.email}&password=${req.body.password}&username=${dbUser.matrnr}&name=${dbUser.firstname}&skip_confirmation=true&projects_limit=5&can_create_group=false`);
      const parsedRes = JSON.parse(text);

      dbUser.update({ gitlabid: parsedRes.id });
      
      const userinfo = {
        user: dbUser,
        projects: [],
        participations: []
      };
              
      userinfo.projects.dbs = [];
      userinfo.projects.apps = [];
      userinfo.participations.dbs = [];
      userinfo.participations.apps = [];

      // ONLY needed when pw should be seperate to LDAP account.
      //req.flash('info', `Your Gitlab Account password will be ${pass}. Please copy it to a safe place NOW!`);
      req.flash('info', 'An Gitlab Account with the same credentials has been created.');

      return done(null, userinfo);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        const user = await User.findOne({ where: { matrnr: user.userPrincipalName.split('@')[0] } });
        const projects = await Project.findAll({ where: { userid: user.matrnr }});
        const participations = await sequelize.query(`SELECT projectparticipants.projectid, projectparticipants.userid, projects.name \
        FROM projectparticipants \
        INNER JOIN projects ON projects.id=projectparticipants.projectid \
        WHERE projectparticipants.userid = '${user.matrnr}'`);
        const apps = await Application.findAll();
        const dbs = await Database.findAll();

        const userinfo = {
          user: user,
          projects: projects,
          participations: participations[0]
        };

        userinfo.projects.map(p => p.dbs = []);
        userinfo.projects.map(p => p.apps = []);
        userinfo.participations.map(p => p.dbs = []);
        userinfo.participations.map(p => p.apps = []);
      
        projects.map(p => {
          const projIndex = projects.indexOf(p);
          const app = apps.filter(app => p.id === app.projectid);
          const db = dbs.filter(db => p.id === db.projectid);
          if (app.length !== 0) {
            app.map(a => userinfo.projects[projIndex].apps.push(a));
          }
          if (db.length !== 0) {
            db.map(d => userinfo.projects[projIndex].dbs.push(d));
          }
        });

        participations.map(p => {
          const projIndex = participations.indexOf(p);
          if (p[0]) {
            const app = apps.filter(app => p[0].projectid === app.projectid);
            const db = dbs.filter(db => p[0].projectid === db.projectid);
            if (app.length !== 0) {
              app.map(a => userinfo.participations[projIndex].apps.push(a));
            }
            if (db.length !== 0) {
              db.map(d => userinfo.participations[projIndex].dbs.push(d));
            }
          }
        });

        return done(null, userinfo);
      } else {
        console.error(err);
      }
    }
  }
  ));
  
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true,
  },
  async (req, username, password, done) => {
    // try to find the user
    try {
      const allUsers = await User.findAll();

      let user;
      if (allUsers.length < 1) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);
        user = await User.create({ matrnr: req.body.email.split('@')[0], firstname: 'Administrator', lastname:'', email: req.body.email, password: hashedPassword, salt, isadmin: true, ldap: false,  });
      } else {
        user = await User.findOne({ where: { email: username } });
      }
      
      // if no user was found, return error
      if (!user || user.ldap) {
        return done(null, false, { message: 'Incorrect credentials.' });
      }
    
      const hashedPassword = bcrypt.hashSync(password, user.salt);
    
      // when passwords match, return user
      if (user.password === hashedPassword) {
        //search projects
        /*const projects = await Project.findAll({ where: { userid: user.matrnr }});
        const participations = await sequelize.query(`SELECT projectparticipants.projectid, projectparticipants.userid, projects.name \
                FROM projectparticipants \
                INNER JOIN projects ON projects.id=projectparticipants.projectid \
                WHERE projectparticipants.userid = '${user.matrnr}'`);
        const apps = await Application.findAll();
        const dbs = await Database.findAll();
                            
        const userinfo = {
          user: user,
          projects: projects,
          participations: participations[0]
        };

        userinfo.projects.map(p => p.dbs = []);
        userinfo.projects.map(p => p.apps = []);
        userinfo.participations.map(p => p.dbs = []);
        userinfo.participations.map(p => p.apps = []);
      
        projects.map(p => {
          const projIndex = projects.indexOf(p);
          const app = apps.filter(app => p.id === app.projectid);
          const db = dbs.filter(db => p.id === db.projectid);
          if (app.length !== 0) {
            app.map(a => userinfo.projects[projIndex].apps.push(a));
          }
          if (db.length !== 0) {
            db.map(d => userinfo.projects[projIndex].dbs.push(d));
          }
        });

        participations.map(p => {
          const projIndex = participations.indexOf(p);
          if (p[0]) {
            const app = apps.filter(app => p[0].projectid === app.projectid);
            const db = dbs.filter(db => p[0].projectid === db.projectid);
            if (app.length !== 0) {
              app.map(a => userinfo.participations[projIndex].apps.push(a));
            }
            if (db.length !== 0) {
              db.map(d => userinfo.participations[projIndex].dbs.push(d));
            }
          }
        });*/

        const bla = snek.post(`${gitlabURL}/api/v4/projects/${dbProject.gitlabid}/members?private_token=${gitlabToken}&sudo=${gitlabAdmin}&user_id=${dbUser.gitlabid}&access_level=30`)

        return done(null, userinfo);
      } else {
      // return false when passwords dont match
        return done(null, false, { message: 'Incorrect credentials.' });
      }
    } catch (err) {
      console.error(err);
    }
  }));

  // preparation for Shibboleth (maybe)

  passport.use(new SamlStrategy({
    path: '',
    entryPoint: '',
    issuer: 'passport-saml'
  },
  (profile, done) => {
    findByEmail(profile.email, (err, user) => {
      if (err) {
        return done(err);
      }
      return done(null, user);
    });
  }));

  // Defines which data will be kept in the session
  passport.serializeUser((userinfo, done) => {
    const data = {
      matrnr: userinfo.user.matrnr
    };
    done(null, data);
  });

  // Gets all data from the stored User
  passport.deserializeUser(async (user, done) => {
    try {
      const userData = await User.findOne({ where: { matrnr: user.matrnr } });
      const projects = await Project.findAll({ where: { userid: user.matrnr }});
      const participations = await sequelize.query(`SELECT projectparticipants.projectid, projectparticipants.userid, projects.name \
            FROM projectparticipants \
            INNER JOIN projects ON projects.id=projectparticipants.projectid \
            WHERE projectparticipants.userid = '${user.matrnr}'`);
      const apps = await Application.findAll();          
      const dbs = await Database.findAll();
      const userinfo = {
        user: userData,
        projects: projects,
        participations: participations[0]
      };

      userinfo.projects.map(p => p.dbs = []);
      userinfo.projects.map(p => p.apps = []);
      userinfo.participations.map(p => p.dbs = []);
      userinfo.participations.map(p => p.apps = []);
    
      projects.map(p => {
        const projIndex = projects.indexOf(p);
        const app = apps.filter(app => p.id === app.projectid);
        const db = dbs.filter(db => p.id === db.projectid);
        if (app.length !== 0) {
          app.map(a => {
            userinfo.projects[projIndex].apps.push(a);
          });
        }
        if (db.length !== 0) {
          db.map(d => {
            userinfo.projects[projIndex].dbs.push(d);
          });
        }
      });

      participations.map(p => {
        const projIndex = participations.indexOf(p);
        if (p[0]) {
          const app = apps.filter(app => p[0].projectid === app.projectid);
          const db = dbs.filter(db => p[0].projectid === db.projectid);
          if (app.length !== 0) {
            app.map(a => userinfo.participations[projIndex].apps.push(a));
          }
          if (db.length !== 0) {
            db.map(d => userinfo.participations[projIndex].dbs.push(d));
          }
        }
      });
      return done(null, userinfo);
    } catch (err) {
      console.error(err);
    }
  });
};