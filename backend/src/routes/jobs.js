const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect, protectOptional } = require('../middleware/auth');
const { validateJobCreation, validateJobUpdate } = require('../middleware/validate');

// Public routes (specific routes before generic ones)
router.get('/search', jobController.searchJobs);
router.get('/stats', jobController.getJobStats);
router.get('/trending', jobController.getTrendingJobs);
router.get('/', protectOptional, jobController.getJobs);

// Protected employer routes (need to come before /:id)
router.get('/employer/my-jobs', protect, jobController.getEmployerJobs);

// Job management (protected)
router.post('/', protect, validateJobCreation, jobController.createJob);

// Single job public route
router.get('/:id', protectOptional, jobController.getJob);

// Protected routes for job modification
router.put('/:id', protect, validateJobUpdate, jobController.updateJob);
router.delete('/:id', protect, jobController.deleteJob);
router.post('/:id/publish', protect, jobController.publishJob);
router.post('/:id/unpublish', protect, jobController.unpublishJob);
router.post('/:id/close', protect, jobController.closeJob);
router.post('/:id/view', jobController.recordJobView);

// Analytics and applications (Employers only)
router.get('/:id/analytics', protect, jobController.getJobAnalytics);
router.get('/:id/applications', protect, jobController.getJobApplications);

module.exports = router;