const LdapStrategy = require('passport-ldapauth').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../databases/mongodb/models/user');

module.exports = (passport) => {

    passport.serializeUser(function (user, done) {
        console.log("Serialize User ", user);
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });


    passport.use('local-login', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true,
        },
        function (req, username, password, done) {
            User.findOne({'username': username}, function (err, user) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                if (!user)
                    return done(null, false);

                // Wenn User LDAP User war, aber die LDAP Authentifizierung nicht erfolgreich war,
                // dann darf er sich nicht einloggen
                if (!user.localuser) {
                    return done(null, false);
                }

                user.validPassword(password, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    if (res === false) {
                        return done(null, false);
                    }
                    return done(null, user);
                });
            });
        }));


    passport.use('ldapauth', new LdapStrategy({
            server: {
                url: 'ldap://localhost:389',
                bindDN: 'cn=root',
                bindCredentials: 'secret',
                searchBase: 'ou=passport-ldapauth',
                searchFilter: '(uid={{username}})'
            }
        },
        function (req, user, done) {

            User.findOne({'username': user}, function (err, user) {
                console.log(user);
                if (err) {
                    console.log(err);
                    return done(err);
                }
                if (!user){
                    // TODO: Konto anlegen und LDAP Tag einfügen
                    // TODO: Dann weiterleiten mit "done"
                }



                return done(null, user);

            });

        })
    );

};