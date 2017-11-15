const User = require('../databases/mongodb/models/user');
const linuxUser = require('linux-user');


const createUserinDB = (opts, callback) => {


    let newUser = new User();
    newUser.username = opts.username;
    newUser.email = opts.email;
    newUser.generateHash(opts.password, function (err, hash) {
        if (err) {
            return callback(err);

        }
        newUser.password = hash;
    });
    newUser.admin = opts.admin;
    newUser.localuser = opts.localuser;
    newUser.save(function (err) {
        if (err) {
            return callback(err);
        }
        linuxUser.addUser(opts.username, (err, user) => {
            if(err){
                return callback(err);
            }
            return callback(false, user);
        })

    });

};

module.exports = createUserinDB;