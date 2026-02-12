const User = require('../models/User');
const AuthService = require('../services/authService');
const UploadService = require('../services/uploadService');
const { PAGINATION } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

class UserController {
  // @desc    Get user profile
  // @route   GET /api/v1/users
  // @access  Private
  static async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user._id)
        .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
        .populate('companyId', 'name slug logo');

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get public user profile by ID
  // @route   GET /api/v1/users/:id
  // @access  Public (with conditional access to contact info for employers)
  static async getPublicProfile(req, res, next) {
    try {
      const userId = req.params.id;

      // Basic public fields
      let fields = 'firstName lastName profileImage bio skills experience education location userType createdAt linkedinUrl portfolioUrl';

      // If the requesting user is an employer, include contact info
      if (req.user && req.user.userType === 'employer') {
        fields += ' email phone resume';
      }

      const user = await User.findById(userId)
        .select(fields)
        .populate('companyId', 'name slug logo');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update user profile
  // @route   PUT /api/v1/users
  // @access  Private
  static async updateProfile(req, res, next) {
    try {
      const allowedFields = [
        'firstName', 'lastName', 'bio', 'phone', 'location',
        'skills', 'experience', 'education', 'preferredJobTypes',
        'preferredLocations', 'availability'
      ];

      const updateData = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      ).populate('companyId', 'name slug logo');

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Upload profile image
  // @route   PUT /api/v1/users/profile-image
  // @access  Private
  static async uploadProfileImage(req, res, next) {
    try {
      if (!req.file) {
        return next(new AppError('Please upload an image', 400));
      }

      // Delete old profile image if exists
      const user = await User.findById(req.user._id);
      if (user.profileImage && user.profileImage.publicId) {
        await UploadService.deleteFile(user.profileImage.publicId);
      }

      // Upload new image
      const uploadResult = await UploadService.uploadProfileImage(req.file, req.user._id);

      // Update user
      user.profileImage = uploadResult;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          profileImage: uploadResult
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Upload resume
  // @route   PUT /api/v1/users/resume
  // @access  Private (Job seekers only)
  static async uploadResume(req, res, next) {
    try {
      if (!req.file) {
        return next(new AppError('Please upload a resume', 400));
      }

      if (req.user.userType !== 'job_seeker') {
        return next(new AppError('Only job seekers can upload resumes', 403));
      }

      // Delete old resume if exists
      const user = await User.findById(req.user._id);
      if (user.resume && user.resume.publicId) {
        await UploadService.deleteFile(user.resume.publicId);
      }

      // Upload new resume
      const uploadResult = await UploadService.uploadResume(req.file, req.user._id);

      // Update user
      user.resume = {
        ...uploadResult,
        uploadedAt: new Date()
      };
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Resume uploaded successfully',
        data: {
          resume: user.resume
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Download resume
  // @route   GET /api/v1/users/resume
  // @access  Private
  static async downloadResume(req, res, next) {
    try {
      const user = await User.findById(req.user._id);

      if (!user.resume || !user.resume.url) {
        return next(new AppError('Resume not found', 404));
      }

      res.redirect(user.resume.url);
    } catch (error) {
      next(error);
    }
  }

  // @desc    Change password
  // @route   PUT /api/v1/users/password
  // @access  Private
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      await AuthService.changePassword(req.user._id, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }

  // @desc    Update user settings
  // @route   PUT /api/v1/users/settings
  // @access  Private
  static async updateSettings(req, res, next) {
    try {
      const { emailNotifications, smsNotifications, marketingEmails } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          preferences: {
            emailNotifications: emailNotifications ?? true,
            smsNotifications: smsNotifications ?? false,
            marketingEmails: marketingEmails ?? true
          }
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: {
          preferences: user.preferences
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete account
  // @route   DELETE /api/v1/users
  // @access  Private
  static async deleteAccount(req, res, next) {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Soft delete - mark as deleted
      user.deletedAt = new Date();
      await user.save();

      // Note: In a production app, you might want to:
      // 1. Anonymize user data
      // 2. Delete associated files from cloud storage
      // 3. Cancel any subscriptions
      // 4. Send confirmation email

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }


  // @desc    Get user's posted jobs
  // @route   GET /api/v1/users/:id/jobs
  // @access  Public
  static async getUserJobs(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const user = await User.findById(id);
      if (!user || user.userType !== 'employer') {
        return next(new AppError('User not found or not an employer', 404));
      }

      const Job = require('../models/Job');
      const jobs = await Job.find({ postedBy: id, status: 'published' })
        .populate('companyId', 'name logo slug')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Job.countDocuments({ postedBy: id, status: 'published' });

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

  // @desc    Get user's applications
  // @route   GET /api/v1/users/:id/applications
  // @access  Private (Own applications only)
  static async getUserApplications(req, res, next) {
    try {
      const { id } = req.params;

      // Only allow users to view their own applications
      if (id !== req.user._id.toString()) {
        return next(new AppError('Not authorized to view these applications', 403));
      }

      const Application = require('../models/Application');
      const applications = await Application.find({ userId: id })
        .populate('jobId', 'title companyId salary location')
        .populate('companyId', 'name logo')
        .sort({ appliedAt: -1 });

      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get user dashboard data
  // @route   GET /api/v1/users/dashboard
  // @access  Private
  static async getDashboard(req, res, next) {
    try {
      const user = await User.findById(req.user._id);

      // Get recent applications
      const Application = require('../models/Application');
      const recentApplications = await Application.find({ userId: req.user._id })
        .populate('jobId', 'title companyId')
        .populate('companyId', 'name')
        .sort({ appliedAt: -1 })
        .limit(5);

      // Get saved jobs count
      const SavedJob = require('../models/SavedJob');
      const savedJobsCount = await SavedJob.countDocuments({ userId: req.user._id });

      // Get recommended jobs (simple implementation)
      const Job = require('../models/Job');
      const recommendedJobs = await Job.find({
        status: 'published',
        'location.isRemote': user.preferences?.preferredLocations?.includes('Remote') || false
      })
        .populate('companyId', 'name logo')
        .sort({ createdAt: -1 })
        .limit(5);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImage,
            userType: user.userType
          },
          stats: {
            applicationsCount: recentApplications.length,
            savedJobsCount
          },
          recentApplications,
          recommendedJobs
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get saved jobs for user
  // @route   GET /api/v1/users/saved-jobs
  // @access  Private
  static async getSavedJobs(req, res, next) {
    try {
      const SavedJob = require('../models/SavedJob');
      const savedJobs = await SavedJob.find({ userId: req.user._id })
        .populate({
          path: 'jobId',
          select: 'title salary location jobType companyId status',
          populate: {
            path: 'companyId',
            select: 'name logo'
          }
        })
        .sort({ savedAt: -1 });

      res.status(200).json({
        success: true,
        data: savedJobs.filter(savedJob => savedJob.jobId) // Filter out deleted jobs
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get job recommendations
  // @route   GET /api/v1/users/job-recommendations
  // @access  Private
  static async getJobRecommendations(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      const Job = require('../models/Job');

      // Simple recommendation logic based on user preferences
      let query = { status: 'published' };

      if (user.skills && user.skills.length > 0) {
        query.requiredSkills = { $in: user.skills };
      }

      if (user.location) {
        query.$or = [
          { 'location.city': new RegExp(user.location.city, 'i') },
          { 'location.state': new RegExp(user.location.state, 'i') },
          { 'location.isRemote': true }
        ];
      }

      const recommendations = await Job.find(query)
        .populate('companyId', 'name logo industry')
        .sort({ createdAt: -1 })
        .limit(10);

      res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update user preferences
  // @route   PUT /api/v1/users/preferences
  // @access  Private
  static async updatePreferences(req, res, next) {
    try {
      const { preferredJobTypes, preferredLocations, salaryRange, availability } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          preferences: {
            preferredJobTypes,
            preferredLocations,
            salaryRange,
            availability
          }
        },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: { preferences: user.preferences }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get all job seekers
  // @route   GET /api/v1/users/job-seekers
  // @access  Public
  static async getJobSeekers(req, res, next) {
    try {
      const { search } = req.query;
      const query = { userType: 'job_seeker' };

      if (search) {
        query.$or = [
          { firstName: new RegExp(search, 'i') },
          { lastName: new RegExp(search, 'i') },
          { skills: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      let selectFields = 'firstName lastName profileImage bio skills experience education location createdAt availability';

      // Include email for employers so mailto link works
      if (req.user && req.user.userType === 'employer') {
        selectFields += ' email';
      }

      const users = await User.find(query)
        .select(selectFields)
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;