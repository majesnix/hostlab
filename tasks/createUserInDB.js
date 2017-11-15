const User = require('../databases/mongodb/models/user');

const createUserOnServer = require('./createUserOnServer');


module.exports = (opts, callback) => {


    let newUser = new User();
    newUser.username = opts.username;
    newUser.email = opts.email;
    newUser.generateHash(opts.password, function (err, hash) {
        if (err) {
            callback(err);
            return;
        }
        newUser.password = hash;
    });
    newUser.admin = opts.admin;
    newUser.localuser = opts.localuser;
    newUser.save(function (err) {
        if (err) {
            callback(err);
            throw err;
        }

        createUserOnServer({
            username: opts.username,
            password: opts.password
        }, (err) => {
            if (err) {
                callback(err);
            }
            else {
                callback(err, newUser);
            }

        })
    });

};