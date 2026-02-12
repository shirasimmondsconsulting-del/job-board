const express = require('express');
const router = express.Router();
const savedJobController = require('../controllers/savedJobController');
const { protect } = require('../middleware/auth');

// Static routes MUST come before dynamic /:jobId routes
router.get('/', protect, savedJobController.getSavedJobs);
router.post('/', protect, savedJobController.saveJob);
router.get('/count', protect, savedJobController.getSavedJobsCount);
router.delete('/bulk', protect, savedJobController.bulkRemoveSavedJobs);

// Dynamic routes
router.get('/check/:jobId', protect, savedJobController.checkSavedJob);
router.delete('/:jobId', protect, savedJobController.removeSavedJob);

module.exports = router;