const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const limitLogin = require('../middleware/limit-login-config');

router.post('/signup', userCtrl.signup);
router.post('/login', limitLogin, userCtrl.login);

module.exports = router;