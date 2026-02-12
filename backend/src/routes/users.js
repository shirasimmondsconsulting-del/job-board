const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, protectOptional } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validate');
const { uploadResume, uploadProfileImage, handleMulterError } = require('../middleware/fileUpload');

// Public routes (with optional auth for extras)
router.get('/job-seekers', protectOptional, userController.getJobSeekers);

// Protected routes (need to be before /:id)
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, validateProfileUpdate, userController.updateProfile);
router.post('/upload-resume', protect, uploadResume, handleMulterError, userController.uploadResume);
router.post('/upload-profile-image', protect, uploadProfileImage, handleMulterError, userController.uploadProfileImage);
router.get('/dashboard', protect, userController.getDashboard);
router.get('/applications', protect, userController.getUserApplications);
router.get('/saved-jobs', protect, userController.getSavedJobs);
router.get('/job-recommendations', protect, userController.getJobRecommendations);
router.put('/preferences', protect, userController.updatePreferences);

// Dynamic public route (must be last)
router.get('/:id', protectOptional, userController.getPublicProfile);

module.exports = router;