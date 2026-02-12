const JobService = require('../services/jobService');
const Job = require('../models/Job');
const { PAGINATION } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

class JobController {
  // @desc    Get all jobs
  // @route   GET /api/v1/jobs
  // @access  Public
  static async getJobs(req, res, next) {
    try {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        category,
        jobType,
        experienceLevel,
        location,
        isRemote,
        companyId,
        search,
        minSalary,
        maxSalary,
        datePosted,
        sort
      } = req.query;

      const filters = {
        category,
        jobType,
        experienceLevel,
        location,
        isRemote: isRemote === 'true' ? true : isRemote === 'false' ? false : undefined,
        companyId,
        search,
        minSalary,
        maxSalary,
        datePosted,
        sort
      };

      const userId = req.user ? req.user._id : null;
      const result = await JobService.getJobs(filters, page, limit, userId);

      res.status(200).json({
        success: true,
        data: result.jobs,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get trending jobs
  // @route   GET /api/v1/jobs/trending
  // @access  Public
  static async getTrendingJobs(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const jobs = await JobService.getTrendingJobs(parseInt(limit));

      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Search jobs
  // @route   GET /api/v1/jobs/search
  // @access  Public
  static async searchJobs(req, res, next) {
    try {
      const { q: query, category, location, page = 1, limit = 20 } = req.query;

      if (!query) {
        return next(new AppError('Search query is required', 400));
      }

      const filters = { category, location };
      const result = await JobService.searchJobs(query, filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.jobs,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get single job
  // @route   GET /api/v1/jobs/:id
  // @access  Public
  static async getJob(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user._id : null;

      const job = await JobService.getJobById(id, userId);

      res.status(200).json({
        success: true,
        data: job
      });
    } catch (error) {
      next(new AppError(error.message, 404));
    }
  }

  // @desc    Create job
  // @route   POST /api/v1/jobs
  // @access  Private (Employer only)
  static async createJob(req, res, next) {
    try {
      const jobData = req.body;
      const postedBy = req.user._id;

      // Automatically attach companyId from user if not provided in body
      if (!jobData.companyId && req.user.companyId) {
        jobData.companyId = req.user.companyId;
      }

      // Ensure jobs are published immediately by default
      if (!jobData.status) {
        jobData.status = 'published';
        jobData.publishedAt = new Date();
      }

      console.log('🚀 POSTING JOB:', jobData.title, 'Status:', jobData.status);

      const job = await JobService.createJob(jobData, postedBy);

      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: job
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update job
  // @route   PUT /api/v1/jobs/:id
  // @access  Private (Job owner only)
  static async updateJob(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user._id;

      const job = await JobService.updateJob(id, updateData, userId);

      res.status(200).json({
        success: true,
        message: 'Job updated successfully',
        data: job
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }

  // @desc    Delete job
  // @route   DELETE /api/v1/jobs/:id
  // @access  Private (Job owner only)
  static async deleteJob(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const result = await JobService.deleteJob(id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }

  // @desc    Close job
  // @route   POST /api/v1/jobs/:id/close
  // @access  Private (Job owner only)
  static async closeJob(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const job = await JobService.closeJob(id, userId);

      res.status(200).json({
        success: true,
        message: 'Job closed successfully',
        data: job
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }

  // @desc    Record job view
  // @route   POST /api/v1/jobs/:id/view
  // @access  Public
  static async recordJobView(req, res, next) {
    try {
      const { id } = req.params;

      const job = await Job.findById(id);
      if (!job) {
        return next(new AppError('Job not found', 404));
      }

      await job.incrementViews();

      res.status(200).json({
        success: true,
        message: 'Job view recorded'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get job applications
  // @route   GET /api/v1/jobs/:id/applications
  // @access  Private (Job owner only)
  static async getJobApplications(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const { page = 1, limit = 10, status } = req.query;

      const job = await Job.findById(id);
      if (!job) {
        return next(new AppError('Job not found', 404));
      }

      if (job.postedBy.toString() !== userId.toString()) {
        return next(new AppError('Not authorized to view applications for this job', 403));
      }

      const Application = require('../models/Application');
      const query = { jobId: id };
      if (status) query.status = status;

      const applications = await Application.find(query)
        .populate('userId', 'firstName lastName email profileImage resume')
        .sort({ appliedAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Application.countDocuments(query);

      res.status(200).json({
        success: true,
        data: applications,
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

  // @desc    Get job statistics
  // @route   GET /api/v1/jobs/stats
  // @access  Public
  static async getJobStats(req, res, next) {
    try {
      const totalJobs = await Job.countDocuments({ status: 'published' });
      const Job = require('../models/Job');

      // Get jobs by category
      const categoryStats = await Job.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Get jobs by location
      const locationStats = await Job.aggregate([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: {
              city: '$location.city',
              state: '$location.state',
              country: '$location.country'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalJobs,
          categoryStats,
          locationStats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Publish job
  // @route   POST /api/v1/jobs/:id/publish
  // @access  Private (Employer only)
  static async publishJob(req, res, next) {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return next(new AppError('Job not found', 404));
      }

      if (job.postedBy.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to publish this job', 403));
      }

      if (job.status !== 'draft') {
        return next(new AppError('Job is not in draft status', 400));
      }

      job.status = 'published';
      job.publishedAt = new Date();
      await job.save();

      res.status(200).json({
        success: true,
        message: 'Job published successfully',
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Unpublish job
  // @route   POST /api/v1/jobs/:id/unpublish
  // @access  Private (Employer only)
  static async unpublishJob(req, res, next) {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return next(new AppError('Job not found', 404));
      }

      if (job.postedBy.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to unpublish this job', 403));
      }

      if (job.status !== 'published') {
        return next(new AppError('Job is not published', 400));
      }

      job.status = 'draft';
      await job.save();

      res.status(200).json({
        success: true,
        message: 'Job unpublished successfully',
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get employer's jobs
  // @route   GET /api/v1/jobs/employer/my-jobs
  // @access  Private (Employer only)
  static async getEmployerJobs(req, res, next) {
    try {
      const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, status } = req.query;

      const query = { postedBy: req.user._id };
      if (status) query.status = status;

      const jobs = await Job.find(query)
        .populate('companyId', 'name logo')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Job.countDocuments(query);

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

  // @desc    Get job analytics
  // @route   GET /api/v1/jobs/:id/analytics
  // @access  Private (Employer only)
  static async getJobAnalytics(req, res, next) {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return next(new AppError('Job not found', 404));
      }

      if (job.postedBy.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to view this job analytics', 403));
      }

      const Application = require('../models/Application');

      // Get application stats
      const totalApplications = await Application.countDocuments({ jobId: req.params.id });
      const pendingApplications = await Application.countDocuments({ jobId: req.params.id, status: 'pending' });
      const reviewedApplications = await Application.countDocuments({ jobId: req.params.id, status: 'reviewed' });
      const acceptedApplications = await Application.countDocuments({ jobId: req.params.id, status: 'accepted' });

      // Get applications over time (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const applicationsOverTime = await Application.aggregate([
        { $match: { jobId: require('mongoose').Types.ObjectId(req.params.id), appliedAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      res.status(200).json({
        success: true,
        data: {
          job: {
            id: job._id,
            title: job.title,
            views: job.views,
            applications: job.applications
          },
          stats: {
            totalApplications,
            pendingApplications,
            reviewedApplications,
            acceptedApplications
          },
          applicationsOverTime
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = JobController;