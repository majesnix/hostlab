const express = require('express');
const router = express.Router();

/* GET help page. */
router.get('/', function(req, res, next) {
    res.render('login', {layout: 'empty'});
});

router.post('/', function(req, res, next){
    res.redirect('/');

    // TODO: Prüfen, ob user existiert, falls nicht registerUser.js requiren und User anlegen

 /*   var user = false;
    if(!user){
        require('../tasks/registerUser')(user);
        // TODO: vielleicht mit promises checken, ob anlegen fertig ist und dann aufs dashboard leiten
    }
    else{
        // TODO: sonst aufs Dashboard weiterleiten
        res.redirect('/');
    }
*/

});

module.exports = router;