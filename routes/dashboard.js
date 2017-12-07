const router = require('express').Router();

router.get('/', (req, res, next) => {
  // Leite weiter auf dashboard
  res.redirect('/dashboard');
});

router.get('/dashboard', (req, res, next) => {
  res.render('dashboard');
});

module.exports = router;
