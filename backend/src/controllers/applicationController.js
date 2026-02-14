const Application = require('../models/Application');
const Job = require('../models/Job');
const Company = require('../models/Company');
const EmailService = require('../services/emailService');
const JobService = require('../services/jobService');
const Notification = require('../models/Notification');
const { APPLICATION_STATUS, PAGINATION } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

class ApplicationController {
  // @desc    Get user applications
  // @route   GET /api/v1/applications
  // @access  Private
  static async getApplications(req, res, next) {
    try {
      const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, status } = req.query;

      let query = {};
      if (req.user.userType === 'job_seeker') {
        query.userId = req.user._id;
      } else if (req.user.userType === 'employer') {
        // Find all jobs posted by this employer
        const employerJobs = await Job.find({ postedBy: req.user._id }).select('_id');
        const jobIds = employerJobs.map(j => j._id);
        query.jobId = { $in: jobIds };
      } else {
        return next(new AppError('Unauthorized user type', 403));
      }

      if (status) query.status = status;

      const applications = await Application.find(query)
        .populate('jobId', 'title salary location companyId')
        .populate('companyId', 'name logo')
        .populate('userId', 'firstName lastName email profileImage skills location')
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

  // @desc    Submit job application
  // @route   POST /api/v1/applications
  // @access  Private (Job seekers only)
  static async submitApplication(req, res, next) {
    try {
      if (req.user.userType !== 'job_seeker') {
        return next(new AppError('Only job seekers can submit applications', 403));
      }

      const { jobId, coverLetter, portfolioUrl, expectedSalary, linkedinUrl, resumeUrl } = req.body;

      // Validate job exists and is published
      const job = await Job.findById(jobId);
      if (!job || job.status !== 'published') {
        return next(new AppError('Job not found or not available', 404));
      }

      // Check if user already applied
      const existingApplication = await Application.findOne({ jobId, userId: req.user._id });
      if (existingApplication) {
        return next(new AppError('You have already applied for this job', 409));
      }


      // Determine companyId (fallback to employer's company if not on job)
      let companyId = job.companyId;
      if (!companyId) {
        const User = require('../models/User');
        const employer = await User.findById(job.postedBy);
        if (employer && employer.companyId) {
          companyId = employer.companyId;
        }
      }

      // Create application
      const application = new Application({
        jobId,
        userId: req.user._id,
        companyId,
        coverLetter,
        portfolioUrl,
        expectedSalary,
        linkedinUrl,
        resumeUrl
      });

      await application.save();

      // Update job application count
      await job.incrementApplications();

      // Send confirmation email
      try {
        let companyName = 'Company';
        if (companyId) {
          const companyDoc = await Company.findById(companyId).select('name');
          if (companyDoc) companyName = companyDoc.name;
        }
        await EmailService.sendApplicationConfirmation(
          req.user.email,
          job.title,
          companyName
        );
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the application if email fails
      }

      // Create notification for employer
      try {
        await Notification.create({
          userId: job.postedBy,
          type: 'new_application',
          title: 'New Job Application',
          message: `${req.user.firstName} ${req.user.lastName} applied for ${job.title}`,
          relatedJobId: jobId,
          relatedApplicationId: application._id
        });
      } catch (notificationError) {
        console.error('Notification creation failed:', notificationError);
      }

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          application: await Application.findById(application._id)
            .populate('jobId', 'title salary location')
            .populate('companyId', 'name logo')
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get single application
  // @route   GET /api/v1/applications/:id
  // @access  Private (Applicant or Employer only)
  static async getApplication(req, res, next) {
    try {
      const { id } = req.params;

      const application = await Application.findById(id)
        .populate('jobId', 'title description salary location requirements postedBy')
        .populate('companyId', 'name logo description')
        .populate('userId', 'firstName lastName email profileImage resume skills experience');

      if (!application) {
        return next(new AppError('Application not found', 404));
      }

      // Check if user is applicant or employer
      const isApplicant = application.userId._id.toString() === req.user._id.toString();
      const isEmployer = application.jobId.postedBy.toString() === req.user._id.toString();

      if (!isApplicant && !isEmployer) {
        return next(new AppError('Not authorized to view this application', 403));
      }

      // Mark as viewed if employer is viewing
      if (isEmployer && !application.isViewed) {
        await application.markAsViewed();
      }

      res.status(200).json({
        success: true,
        data: { application }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update application status
  // @route   PUT /api/v1/applications/:id/status
  // @access  Private (Employer only)
  static async updateApplicationStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, rejectionReason, internalsNotes } = req.body;

      const application = await Application.findById(id)
        .populate('jobId', 'title postedBy')
        .populate('userId', 'firstName lastName email')
        .populate('companyId', 'name');

      if (!application) {
        return next(new AppError('Application not found', 404));
      }

      // Check if user is the employer
      if (application.jobId.postedBy.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to update this application', 403));
      }

      // Update status
      await application.updateStatus(status, req.user._id, internalsNotes);

      // Add rejection reason if rejected
      if (status === APPLICATION_STATUS.REJECTED && rejectionReason) {
        application.rejectionReason = rejectionReason;
        await application.save();
      }

      // Send email notification to applicant
      try {
        let message = '';
        if (status === APPLICATION_STATUS.REJECTED && rejectionReason) {
          message = rejectionReason;
        }

        await EmailService.sendApplicationStatusUpdate(
          application.userId.email,
          application.jobId.title,
          status,
          message
        );
      } catch (emailError) {
        console.error('Status update email failed:', emailError);
      }

      // Create notification for applicant
      try {
        await Notification.create({
          userId: application.userId._id,
          type: 'application_update',
          title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: `Your application for ${application.jobId.title} has been ${status}`,
          relatedJobId: application.jobId._id,
          relatedApplicationId: application._id
        });
      } catch (notificationError) {
        console.error('Notification creation failed:', notificationError);
      }

      res.status(200).json({
        success: true,
        message: `Application ${status} successfully`,
        data: { application }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Withdraw application
  // @route   DELETE /api/v1/applications/:id
  // @access  Private (Applicant only)
  static async withdrawApplication(req, res, next) {
    try {
      const { id } = req.params;

      const application = await Application.findById(id);
      if (!application) {
        return next(new AppError('Application not found', 404));
      }

      // Check if user is the applicant
      if (application.userId.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to withdraw this application', 403));
      }

      // Only allow withdrawal if not already decided
      if ([APPLICATION_STATUS.ACCEPTED, APPLICATION_STATUS.REJECTED].includes(application.status)) {
        return next(new AppError('Cannot withdraw application that has already been decided', 400));
      }

      await application.updateStatus(APPLICATION_STATUS.WITHDRAWN, req.user._id, 'Withdrawn by applicant');

      res.status(200).json({
        success: true,
        message: 'Application withdrawn successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Shortlist application
  // @route   POST /api/v1/applications/:id/shortlist
  // @access  Private (Employer only)
  static async shortlistApplication(req, res, next) {
    try {
      const { id } = req.params;

      const application = await Application.findById(id).populate('jobId', 'title postedBy');

      if (!application) {
        return next(new AppError('Application not found', 404));
      }

      if (application.jobId.postedBy.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to shortlist this application', 403));
      }

      await application.updateStatus(APPLICATION_STATUS.SHORTLISTED, req.user._id, 'Shortlisted by employer');

      res.status(200).json({
        success: true,
        message: 'Application shortlisted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Accept application
  // @route   POST /api/v1/applications/:id/accept
  // @access  Private (Employer only)
  static async acceptApplication(req, res, next) {
    try {
      const { id } = req.params;

      const application = await Application.findById(id).populate('jobId', 'title postedBy');

      if (!application) {
        return next(new AppError('Application not found', 404));
      }

      if (application.jobId.postedBy.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to accept this application', 403));
      }

      await application.updateStatus(APPLICATION_STATUS.ACCEPTED, req.user._id, 'Accepted by employer');

      // Close the job automatically when an application is accepted
      try {
        await JobService.closeJob(application.jobId._id || application.jobId, req.user._id);
      } catch (closeErr) {
        // Log but don't fail the accept operation if closing the job fails
        console.error('Failed to auto-close job after acceptance:', closeErr);
      }

      res.status(200).json({
        success: true,
        message: 'Application accepted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Reject application
  // @route   POST /api/v1/applications/:id/reject
  // @access  Private (Employer only)
  static async rejectApplication(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const application = await Application.findById(id).populate('jobId', 'title postedBy');

      if (!application) {
        return next(new AppError('Application not found', 404));
      }

      if (application.jobId.postedBy.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to reject this application', 403));
      }

      await application.updateStatus(APPLICATION_STATUS.REJECTED, req.user._id, reason || 'Rejected by employer');

      res.status(200).json({
        success: true,
        message: 'Application rejected successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ApplicationController;