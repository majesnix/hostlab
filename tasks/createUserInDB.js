const User = require('../databases/mongodb/models/user');

const createUserOnServer = require('./createUserOnServer');


module.exports = (username, email, password, isAdmin, localuser) => {


    let newUser = new User();
    newUser.username = username;
    newUser.email = email;
    newUser.generateHash(password, function (err, hash) {
        if (err) {
            return;
        }
        newUser.password = hash;
    });
    newUser.admin = isAdmin;
    newUser.localuser = localuser;
    newUser.save(function (err) {
        if (err)
            throw err;
        createUserOnServer(username,password)
    });

};