const express = require('express');
const router = express.Router();
const { registerHOD, createUser, login, getMe, forgotPassword } = require('../controllers/authController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

// HOD self-registration (public, secret-code-gated)
router.post('/register-hod', registerHOD);

// HOD creates accounts for other roles (protected)
router.post('/create-user', auth, authorize('admin'), createUser);

// Login & session
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/forgot-password', forgotPassword);

module.exports = router;
