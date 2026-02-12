const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validateReviewCreation, validateReviewUpdate } = require('../middleware/validate');

// Public routes
router.get('/company/:companyId', reviewController.getCompanyReviews);
router.get('/company/:companyId/stats', reviewController.getReviewStats);

// Protected routes
router.post('/', protect, validateReviewCreation, reviewController.createReview);
router.put('/:id', protect, validateReviewUpdate, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);
router.get('/my-reviews', protect, reviewController.getUserReviews);
router.post('/:id/like', protect, reviewController.likeReview);
router.post('/:id/report', protect, reviewController.reportReview);

module.exports = router;