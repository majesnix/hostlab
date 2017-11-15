const express = require('express');
const router = express.Router();
const createUser = require('../../tasks/createUserInDB');


/* GET help page. */
router.get('/', (req, res, next) => {
    res.render('admin/index', {user: req.user});
});

router.post('/newLocalUser', (req, res) => {

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

module.exports = router;