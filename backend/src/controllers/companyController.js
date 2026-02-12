const Company = require('../models/Company');
const User = require('../models/User');
const UploadService = require('../services/uploadService');
const { PAGINATION } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

class CompanyController {
  // @desc    Get all companies
  // @route   GET /api/v1/companies
  // @access  Public
  static async getCompanies(req, res, next) {
    try {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        industry,
        companySize,
        search,
        sort = 'name'
      } = req.query;

      const query = { isVerified: true, isSuspended: false };

      // Apply filters
      if (industry) query.industry = industry;
      if (companySize) query.companySize = companySize;
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') }
        ];
      }

      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), PAGINATION.MAX_LIMIT),
        sort: sort === 'name' ? { name: 1 } : { createdAt: -1 },
        select: 'name slug description logo industry companySize foundedYear averageRating reviewCount activeJobsCount'
      };

      const result = await Company.paginate(query, options);

      res.status(200).json({
        success: true,
        data: result.docs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.totalDocs,
          pages: result.totalPages,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Search companies
  // @route   GET /api/v1/companies/search
  // @access  Public
  static async searchCompanies(req, res, next) {
    try {
      const { q: query, industry, page = 1, limit = 10 } = req.query;

      if (!query) {
        return next(new AppError('Search query is required', 400));
      }

      const searchQuery = {
        isVerified: true,
        isSuspended: false,
        $text: { $search: query }
      };

      if (industry) searchQuery.industry = industry;

      const companies = await Company.find(searchQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, name: 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('name slug description logo industry companySize averageRating reviewCount');

      const total = await Company.countDocuments(searchQuery);

      res.status(200).json({
        success: true,
        data: companies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get single company
  // @route   GET /api/v1/companies/:id
  // @access  Public
  static async getCompany(req, res, next) {
    try {
      const { id } = req.params;

      const company = await Company.findOne({ slug: id })
        .populate('owner', 'firstName lastName profileImage')
        .populate('admins', 'firstName lastName profileImage');

      if (!company) {
        return next(new AppError('Company not found', 404));
      }

      res.status(200).json({
        success: true,
        data: { company }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Create company
  // @route   POST /api/v1/companies
  // @access  Private (Employer only)
  static async createCompany(req, res, next) {
    try {
      if (req.user.userType !== 'employer') {
        return next(new AppError('Only employers can create companies', 403));
      }

      // Check if user already has a company
      const existingCompany = await Company.findOne({ owner: req.user._id });
      if (existingCompany) {
        return next(new AppError('You already have a company registered', 409));
      }

      const companyData = {
        ...req.body,
        owner: req.user._id
      };

      const company = new Company(companyData);
      await company.save();

      // Update user's companyId
      await User.findByIdAndUpdate(req.user._id, { companyId: company._id });

      res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: { company }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update company
  // @route   PUT /api/v1/companies/:id
  // @access  Private (Company owner/admin only)
  static async updateCompany(req, res, next) {
    try {
      const { id } = req.params;

      const company = await Company.findById(id);
      if (!company) {
        return next(new AppError('Company not found', 404));
      }

      // Check if user is owner or admin
      const isOwner = company.owner.toString() === req.user._id.toString();
      const isAdmin = company.admins.some(admin => admin.toString() === req.user._id.toString());

      if (!isOwner && !isAdmin) {
        return next(new AppError('Not authorized to update this company', 403));
      }

      const allowedFields = [
        'name', 'description', 'website', 'email', 'phone',
        'industry', 'companySize', 'foundedYear', 'headquarters',
        'officeLocations', 'socialLinks'
      ];

      const updateData = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const updatedCompany = await Company.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: 'Company updated successfully',
        data: { company: updatedCompany }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Upload company logo
  // @route   PUT /api/v1/companies/:id/logo
  // @access  Private (Company owner/admin only)
  static async uploadLogo(req, res, next) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return next(new AppError('Please upload an image', 400));
      }

      const company = await Company.findById(id);
      if (!company) {
        return next(new AppError('Company not found', 404));
      }

      // Check permissions
      const isOwner = company.owner.toString() === req.user._id.toString();
      const isAdmin = company.admins.some(admin => admin.toString() === req.user._id.toString());

      if (!isOwner && !isAdmin) {
        return next(new AppError('Not authorized to update company logo', 403));
      }

      // Delete old logo if exists
      if (company.logo && company.logo.publicId) {
        await UploadService.deleteFile(company.logo.publicId);
      }

      // Upload new logo
      const uploadResult = await UploadService.uploadCompanyLogo(req.file, id);

      // Update company
      company.logo = uploadResult;
      await company.save();

      res.status(200).json({
        success: true,
        message: 'Company logo uploaded successfully',
        data: {
          logo: uploadResult
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Upload company banner
  // @route   PUT /api/v1/companies/:id/banner
  // @access  Private (Company owner/admin only)
  static async uploadBanner(req, res, next) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return next(new AppError('Please upload an image', 400));
      }

      const company = await Company.findById(id);
      if (!company) {
        return next(new AppError('Company not found', 404));
      }

      // Check permissions
      const isOwner = company.owner.toString() === req.user._id.toString();
      const isAdmin = company.admins.some(admin => admin.toString() === req.user._id.toString());

      if (!isOwner && !isAdmin) {
        return next(new AppError('Not authorized to update company banner', 403));
      }

      // Delete old banner if exists
      if (company.bannerImage && company.bannerImage.publicId) {
        await UploadService.deleteFile(company.bannerImage.publicId);
      }

      // Upload new banner
      const uploadResult = await UploadService.uploadCompanyBanner(req.file, id);

      // Update company
      company.bannerImage = uploadResult;
      await company.save();

      res.status(200).json({
        success: true,
        message: 'Company banner uploaded successfully',
        data: {
          bannerImage: uploadResult
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete company
  // @route   DELETE /api/v1/companies/:id
  // @access  Private (Company owner only)
  static async deleteCompany(req, res, next) {
    try {
      const { id } = req.params;

      const company = await Company.findById(id);
      if (!company) {
        return next(new AppError('Company not found', 404));
      }

      // Only owner can delete company
      if (company.owner.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to delete this company', 403));
      }

      // Remove company reference from users
      await User.updateMany(
        { companyId: id },
        { $unset: { companyId: 1 } }
      );

      await company.deleteOne();

      res.status(200).json({
        success: true,
        message: 'Company deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get company jobs
  // @route   GET /api/v1/companies/:id/jobs
  // @access  Public
  static async getCompanyJobs(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const company = await Company.findOne({ slug: id });
      if (!company) {
        return next(new AppError('Company not found', 404));
      }

      const Job = require('../models/Job');
      const jobs = await Job.find({ companyId: company._id, status: 'published' })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Job.countDocuments({ companyId: company._id, status: 'published' });

      res.status(200).json({
        success: true,
        data: jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get company reviews
  // @route   GET /api/v1/companies/:id/reviews
  // @access  Public
  static async getCompanyReviews(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const company = await Company.findOne({ slug: id });
      if (!company) {
        return next(new AppError('Company not found', 404));
      }

      const Review = require('../models/Review');
      const reviews = await Review.find({ companyId: company._id, isApproved: true })
        .populate('userId', 'firstName lastName profileImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Review.countDocuments({ companyId: company._id, isApproved: true });

      res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get company employees
  // @route   GET /api/v1/companies/:id/employees
  // @access  Private (Company owner/admin only)
  static async getCompanyEmployees(req, res, next) {
    try {
      const { id } = req.params;

      const company = await Company.findById(id);
      if (!company) {
        return next(new AppError('Company not found', 404));
      }

      // Check permissions
      const isOwner = company.owner.toString() === req.user._id.toString();
      const isAdmin = company.admins.some(admin => admin.toString() === req.user._id.toString());

      if (!isOwner && !isAdmin) {
        return next(new AppError('Not authorized to view company employees', 403));
      }

      const employees = await User.find({ companyId: id })
        .select('firstName lastName email profileImage userType createdAt')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: employees
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Request company verification
  // @route   POST /api/v1/companies/:id/verify
  // @access  Private (Employer only)
  static async requestVerification(req, res, next) {
    try {
      const company = await Company.findById(req.params.id);

      if (!company) {
        return next(new AppError('Company not found', 404));
      }

      if (company.owner.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to request verification for this company', 403));
      }

      if (company.isVerified) {
        return next(new AppError('Company is already verified', 400));
      }

      company.verificationRequested = true;
      company.verificationRequestedAt = new Date();
      await company.save();

      // TODO: Send notification to admin for verification

      res.status(200).json({
        success: true,
        message: 'Verification request submitted successfully. We will review your request within 24-48 hours.',
        data: { company }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get employer's companies
  // @route   GET /api/v1/companies/employer/my-companies
  // @access  Private (Employer only)
  static async getEmployerCompanies(req, res, next) {
    try {
      const companies = await Company.find({ owner: req.user._id })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: companies
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get company dashboard
  // @route   GET /api/v1/companies/:id/dashboard
  // @access  Private (Employer only)
  static async getCompanyDashboard(req, res, next) {
    try {
      const company = await Company.findById(req.params.id);

      if (!company) {
        return next(new AppError('Company not found', 404));
      }

      if (company.owner.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to view this company dashboard', 403));
      }

      const Job = require('../models/Job');
      const Application = require('../models/Application');
      const Review = require('../models/Review');

      // Get company stats
      const totalJobs = await Job.countDocuments({ companyId: req.params.id });
      const activeJobs = await Job.countDocuments({ companyId: req.params.id, status: 'published' });
      const totalApplications = await Application.countDocuments({ companyId: req.params.id });
      const totalReviews = await Review.countDocuments({ companyId: req.params.id });

      // Get recent jobs
      const recentJobs = await Job.find({ companyId: req.params.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status createdAt applications');

      // Get recent applications
      const recentApplications = await Application.find({ companyId: req.params.id })
        .populate('jobId', 'title')
        .populate('userId', 'firstName lastName')
        .sort({ appliedAt: -1 })
        .limit(5);

      // Get average rating
      const ratingStats = await Review.aggregate([
        { $match: { companyId: new (require('mongoose').Types.ObjectId)(req.params.id) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);

      const averageRating = ratingStats[0]?.averageRating || 0;

      res.status(200).json({
        success: true,
        data: {
          company: {
            id: company._id,
            name: company.name,
            logo: company.logo,
            isVerified: company.isVerified
          },
          stats: {
            totalJobs,
            activeJobs,
            totalApplications,
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10
          },
          recentJobs,
          recentApplications
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CompanyController;