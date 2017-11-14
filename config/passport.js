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
                console.log(user);
                if (err){
                    console.log(err);
                    return done(err);
                }
                if (!user)
                    return done(null, false);
                user.validPassword(password, function(err, res){
                    if(err){
                        return done(err);
                    }
                    if(res === false){
                        return done(null, false);
                    }
                    return done(null, user);
                });
            });
        }));

};