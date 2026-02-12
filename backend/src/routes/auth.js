const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegistration, validateLogin, validatePasswordReset, validatePasswordResetConfirm } = require('../middleware/validate');
const { resendVerificationLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', validatePasswordResetConfirm, authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', resendVerificationLimiter, authController.resendVerification);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);
router.post('/logout', protect, authController.logout);
router.delete('/delete-account', protect, authController.deleteAccount);

module.exports = router;