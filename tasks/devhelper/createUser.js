const User = require('../../databases/mongodb/models/user');


module.exports = (username, email, password, isAdmin) => {


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
    newUser.save(function (err) {
        if (err)
            throw err;
        //return done(null, newUser);
    });

};