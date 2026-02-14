const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const { PAGINATION } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

class SavedJobController {
  // @desc    Get user's saved jobs
  // @route   GET /api/v1/saved-jobs
  // @access  Private
  static async getSavedJobs(req, res, next) {
    try {
      const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = req.query;

      const savedJobs = await SavedJob.find({ userId: req.user._id })
        .populate({
          path: 'jobId',
          select: 'title salary location jobType companyId status',
          populate: {
            path: 'companyId',
            select: 'name logo industry'
          }
        })
        .sort({ savedAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      // Filter out jobs that are no longer available
      const availableJobs = savedJobs.filter(savedJob => savedJob.jobId && savedJob.jobId.status === 'published');

      const total = await SavedJob.countDocuments({ userId: req.user._id });

      res.status(200).json({
        success: true,
        data: availableJobs,
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

  // @desc    Save a job
  // @route   POST /api/v1/saved-jobs
  // @access  Private (Job seekers only)
  static async saveJob(req, res, next) {
    try {
      if (req.user.userType !== 'job_seeker') {
        return next(new AppError('Only job seekers can save jobs', 403));
      }

      const { jobId } = req.body;

      // Validate job exists and is published
      const job = await Job.findById(jobId);
      if (!job || job.status !== 'published') {
        return next(new AppError('Job not found or not available', 404));
      }

      // Check if already saved
      const existingSavedJob = await SavedJob.findOne({ jobId, userId: req.user._id });
      if (existingSavedJob) {
        return next(new AppError('Job already saved', 409));
      }

      // Create saved job
      const savedJob = new SavedJob({
        jobId,
        userId: req.user._id
      });

      await savedJob.save();

      // Populate job details for response
      await savedJob.populate({
        path: 'jobId',
        select: 'title salary location jobType companyId',
        populate: {
          path: 'companyId',
          select: 'name logo'
        }
      });

      res.status(201).json({
        success: true,
        message: 'Job saved successfully',
        data: { savedJob }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Remove saved job
  // @route   DELETE /api/v1/saved-jobs/:jobId
  // @access  Private
  static async removeSavedJob(req, res, next) {
    try {
      const { jobId } = req.params;

      const savedJob = await SavedJob.findOneAndDelete({
        jobId,
        userId: req.user._id
      });

      if (!savedJob) {
        return next(new AppError('Saved job not found', 404));
      }

      res.status(200).json({
        success: true,
        message: 'Job removed from saved jobs successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Check if job is saved
  // @route   GET /api/v1/saved-jobs/check/:jobId
  // @access  Private
  static async checkSavedJob(req, res, next) {
    try {
      const { jobId } = req.params;

      const savedJob = await SavedJob.findOne({
        jobId,
        userId: req.user._id
      });

      res.status(200).json({
        success: true,
        data: {
          isSaved: !!savedJob,
          savedAt: savedJob ? savedJob.savedAt : null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get saved jobs count
  // @route   GET /api/v1/saved-jobs/count
  // @access  Private
  static async getSavedJobsCount(req, res, next) {
    try {
      const count = await SavedJob.countDocuments({ userId: req.user._id });

      res.status(200).json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Bulk remove saved jobs
  // @route   DELETE /api/v1/saved-jobs/bulk
  // @access  Private
  static async bulkRemoveSavedJobs(req, res, next) {
    try {
      const { jobIds } = req.body;

      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        return next(new AppError('Job IDs array is required', 400));
      }

      const result = await SavedJob.deleteMany({
        jobId: { $in: jobIds },
        userId: req.user._id
      });

      res.status(200).json({
        success: true,
        message: `${result.deletedCount} saved jobs removed successfully`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SavedJobController;