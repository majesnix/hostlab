const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: String,
    admin: {
        type: Boolean,
        default: false
    },
    registeredDate: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    mongodb: {
        maxNumDBs: {
            type: Number,
            default: 5
        },
        urls: [{
            type: String
        }]
    },
    postgres: {
        maxNumDBs: {
            type: Number,
            default: 5
        },
        urls: [{
            type: String
        }]
    },
    gitlab: {
        url: String,
        repositorys: [{
            type: String
        }]
    },
    svn: {
        url: String,
        repositorys: [{
            type: String
        }]
    },
    nodeJS: {
        directories: [{
            type: String
        }]
    }


});


userSchema.methods.generateHash = function (password, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return callback(err, null)
        }
        bcrypt.hash(password, salt, null, function (err, hash) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, hash);
        });
    });
};

userSchema.methods.validPassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (err, res) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, res);
    });
};

module.exports = mongoose.model('User', userSchema);