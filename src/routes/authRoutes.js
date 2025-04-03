// routes/auth.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin,forgotPassword,resetPassword } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;