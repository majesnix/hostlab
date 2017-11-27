const router = require('express').Router();

const User = require('../../databases/mongodb/models/user');

router.get('/', (req, res, next) => {
  res.render('settings', {feedback: req.flash('feedback')});
});

router.post('/password', (req, res, next) => {
      const oldPassword = req.body.oldPassword;
      const newPassword = req.body.newPassword;
      const newPasswordConfirm = req.body.newPasswordConfirm;
      console.log(req.user.username);

      if (newPassword === newPasswordConfirm) {
        User.findOne({'username': req.user.username}, function(err, user) {
          if (err) {
            console.error(err);
          }
          else if (!user) {
            req.flash('feedback', 'No user found.');
            res.redirect('/settings');
          }
          else if (!user.localuser) {
            req.flash('feedback',
                'Only local users can change their password here.');
            res.redirect('/settings');
          }
          else {
            user.validPassword(oldPassword, function(err, response) {
              if (err) {
                console.error(err);
                req.flash('feedback', 'Error on updating your password.');
                res.redirect('/settings');
              }
              else if (response === false) {
                req.flash('feedback', 'Old password did not match.');
                res.redirect('/settings');
              }
              else {
                user.generateHash(newPassword, (err, hash) => {
                  if (err) {
                    console.error(err);
                    req.flash('feedback', 'Error on updating your password.');
                    res.redirect('/settings');
                  }
                  else {
                    user.password = hash;

                    user.save((err) => {
                      if (err) {
                        req.flash('feedback', 'Error on updating your password.');
                        res.redirect('/settings');
                      }
                      else {
                        req.flash('feedback', 'Password changed successfully.');
                        res.redirect('/settings');
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
      else {
        req.flash('feedback', 'New passwords did not match.');
        res.redirect('/settings');
      }
    },
);

module.exports = router;
