const User = require('../databases/mongodb/models/user');
const linuxUser = require('linux-user');


const deleteUserinDB = (opts, callback) => {

    User.findOneAndRemove({'username': opts.username}, function (err) {
        if (err) {
            console.log(err);
            return callback(err);
        }

        linuxUser.removeUser(opts.username, (err) => {
            if(err){
                return callback(err);
            }
            return callback(false);
        })
    });

};

module.exports = deleteUserinDB;