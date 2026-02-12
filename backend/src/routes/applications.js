const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { validateApplicationSubmission } = require('../middleware/validate');

// All routes require authentication
router.get('/', protect, applicationController.getApplications);
router.post('/', protect, validateApplicationSubmission, applicationController.submitApplication);
router.get('/:id', protect, applicationController.getApplication);
router.put('/:id/status', protect, applicationController.updateApplicationStatus);
router.delete('/:id', protect, applicationController.withdrawApplication);

// Employer actions
router.post('/:id/shortlist', protect, applicationController.shortlistApplication);
router.post('/:id/accept', protect, applicationController.acceptApplication);
router.post('/:id/reject', protect, applicationController.rejectApplication);

module.exports = router;