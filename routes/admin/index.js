const express = require('express');
const router = express.Router();
const createUser = require('../../tasks/createUser');
const deleteUser = require('../../tasks/deleteUser');


const User = require('../../databases/mongodb/models/user');


/* GET help page. */
router.get('/', (req, res, next) => {

    User.find({}, function (err, users) {
        if (err) {
            console.log(err);
        }
        console.log(users);
        res.render('admin/index', {user: req.user, users: users});
    });


});

router.post('/user', (req, res) => {

    let opts = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        admin: req.body.admin,
        localuser: true

    };

    createUser(opts, (err, user) => {
        if(err){
            console.log(err);
        }
        console.log(user);
        res.send('ok');
        //TODO: sonst antworten
    })


});

router.delete('/user/:username', (req, res) => {

    let opts = {
        username: req.params.username,
    };

    if(req.user.username !== opts.username){
        deleteUser(opts, (err) => {
            if(err){
                console.log(err);
            }
            else{
                res.send('ok');

            }
        })
    }
    else {
        res.send('You cant delete yourself');
    }



});

module.exports = router;