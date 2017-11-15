const express = require('express');
const router = express.Router();
const createUser = require('../../tasks/createUserInDB');


/* GET help page. */
router.get('/', (req, res, next) => {
    res.render('admin/index', {user: req.user});
});

router.post('/newLocalUser', (req, res) => {
   let username = req.body.username;
   let password = req.body.password;
   let admin = req.body.admin;

    createUser(username, 'user123@user123.de', password, admin, true)

});

module.exports = router;