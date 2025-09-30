const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');

router.get('/login/', AuthController.login);
router.post('/logout/', AuthController.logout);
router.get('/user/', AuthController.user);

module.exports = router;
