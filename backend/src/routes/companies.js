const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect } = require('../middleware/auth');
const { validateCompanyProfile, validateCompanyUpdate } = require('../middleware/validate');
const { uploadCompanyLogo, uploadCompanyBanner, handleMulterError } = require('../middleware/fileUpload');

// Public routes (static routes BEFORE dynamic :id)
router.get('/', companyController.getCompanies);
router.get('/search', companyController.searchCompanies);

// Protected routes (static routes BEFORE dynamic :id)
router.get('/employer/my-companies', protect, companyController.getEmployerCompanies);
router.post('/', protect, validateCompanyProfile, companyController.createCompany);

// Dynamic :id routes
router.get('/:id', companyController.getCompany);
router.get('/:id/jobs', companyController.getCompanyJobs);
router.get('/:id/reviews', companyController.getCompanyReviews);
router.put('/:id', protect, validateCompanyUpdate, companyController.updateCompany);
router.delete('/:id', protect, companyController.deleteCompany);
router.post('/:id/verify', protect, companyController.requestVerification);
router.post('/:id/upload-logo', protect, uploadCompanyLogo, handleMulterError, companyController.uploadLogo);
router.post('/:id/upload-banner', protect, uploadCompanyBanner, handleMulterError, companyController.uploadBanner);
router.get('/:id/dashboard', protect, companyController.getCompanyDashboard);

module.exports = router;