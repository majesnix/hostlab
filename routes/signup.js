const express = require('express');
const router = express.Router();
const { show, createUser } = require('../app/controller/userController');

router.get('/', show);
router.post('/', createUser);

module.exports = router;