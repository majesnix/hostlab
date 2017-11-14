const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    password: String,
    username: {
        type: String,
        unique: true
    },
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


module.exports = mongoose.model('User', userSchema);