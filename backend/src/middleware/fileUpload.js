const multer = require('multer');
const path = require('path');
const { FILE_LIMITS } = require('../config/constants');

// Memory storage for Cloudinary upload
const memoryStorage = multer.memoryStorage();

// Disk storage for local development (optional)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'), false);
  }
};

// Profile image upload
const uploadProfileImage = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: FILE_LIMITS.PROFILE_IMAGE
  }
}).single('profileImage');

// Resume upload
const uploadResume = multer({
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    // PDFs, DOC, DOCX for resume
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Only PDF, DOC, and DOCX files are allowed for resume"),
        false,
      );
    }
  },
  limits: {
    fileSize: FILE_LIMITS.RESUME
  }
}).single('resume');

// Company logo upload
const uploadCompanyLogo = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: FILE_LIMITS.COMPANY_LOGO
  }
}).single('logo');

// Company banner upload
const uploadCompanyBanner = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: FILE_LIMITS.COMPANY_BANNER
  }
}).single('banner');

// Multiple file upload for portfolio (optional)
const uploadPortfolio = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Max 5 files
  }
}).array('portfolio', 5);

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files'
      });
    }
  }

  if (error.message.includes('Only')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

module.exports = {
  uploadProfileImage,
  uploadResume,
  uploadCompanyLogo,
  uploadCompanyBanner,
  uploadPortfolio,
  handleMulterError
};