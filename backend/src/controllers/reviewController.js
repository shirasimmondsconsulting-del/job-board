const Review = require('../models/Review');
const Company = require('../models/Company');
const Job = require('../models/Job');
const { PAGINATION } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

class ReviewController {
  // @desc    Get company reviews
  // @route   GET /api/v1/reviews/company/:companyId
  // @access  Public
  static async getCompanyReviews(req, res, next) {
    try {
      const { companyId } = req.params;
      const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, rating } = req.query;

      const query = { companyId };
      if (rating) query.rating = parseInt(rating);

      const reviews = await Review.find(query)
        .populate('userId', 'firstName lastName profileImage')
        .populate('jobId', 'title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Review.countDocuments(query);

      // Calculate average rating
      const ratingStats = await Review.aggregate([
        { $match: { companyId: new (require('mongoose').Types.ObjectId)(companyId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ]);

      const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0, ratingDistribution: [] };

      // Calculate rating distribution
      const distribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: stats.ratingDistribution.filter(r => r === rating).length,
        percentage: stats.totalReviews > 0 ? (stats.ratingDistribution.filter(r => r === rating).length / stats.totalReviews) * 100 : 0
      }));

      res.status(200).json({
        success: true,
        data: reviews,
        stats: {
          averageRating: Math.round(stats.averageRating * 10) / 10,
          totalReviews: stats.totalReviews,
          ratingDistribution: distribution
        },
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

  // @desc    Create company review
  // @route   POST /api/v1/reviews
  // @access  Private (Job seekers only)
  static async createReview(req, res, next) {
    try {
      if (req.user.userType !== 'job_seeker') {
        return next(new AppError('Only job seekers can write reviews', 403));
      }

      const { companyId, jobId, rating, title, comment, pros, cons, adviceToManagement } = req.body;

      // Validate company exists
      const company = await Company.findById(companyId);
      if (!company) {
        return next(new AppError('Company not found', 404));
      }

      // If jobId provided, validate it exists and user worked there
      if (jobId) {
        const job = await Job.findById(jobId);
        if (!job) {
          return next(new AppError('Job not found', 404));
        }

        // Check if user has an accepted application for this job
        const Application = require('../models/Application');
        const acceptedApplication = await Application.findOne({
          jobId,
          userId: req.user._id,
          status: 'accepted'
        });

        if (!acceptedApplication) {
          return next(new AppError('You can only review companies where you were employed', 403));
        }
      }

      // Check if user already reviewed this company
      const existingReview = await Review.findOne({ companyId, userId: req.user._id });
      if (existingReview) {
        return next(new AppError('You have already reviewed this company', 409));
      }

      // Validate rating
      if (rating < 1 || rating > 5) {
        return next(new AppError('Rating must be between 1 and 5', 400));
      }

      // Create review
      const review = new Review({
        companyId,
        userId: req.user._id,
        jobId,
        rating,
        title,
        comment,
        pros,
        cons,
        adviceToManagement
      });

      await review.save();

      // Populate user and job details
      await review.populate('userId', 'firstName lastName profileImage');
      if (jobId) {
        await review.populate('jobId', 'title');
      }

      // Update company rating stats
      await review.updateCompanyRating();

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: { review }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update review
  // @route   PUT /api/v1/reviews/:id
  // @access  Private (Review author only)
  static async updateReview(req, res, next) {
    try {
      const { id } = req.params;
      const { rating, title, comment, pros, cons, adviceToManagement } = req.body;

      const review = await Review.findById(id);
      if (!review) {
        return next(new AppError('Review not found', 404));
      }

      // Check if user is the author
      if (review.userId.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to update this review', 403));
      }

      // Validate rating
      if (rating && (rating < 1 || rating > 5)) {
        return next(new AppError('Rating must be between 1 and 5', 400));
      }

      // Update review
      const updatedReview = await Review.findByIdAndUpdate(
        id,
        {
          ...(rating && { rating }),
          ...(title && { title }),
          ...(comment && { comment }),
          ...(pros && { pros }),
          ...(cons && { cons }),
          ...(adviceToManagement && { adviceToManagement }),
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      ).populate('userId', 'firstName lastName profileImage')
        .populate('jobId', 'title');

      // Update company rating stats
      await updatedReview.updateCompanyRating();

      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: { review: updatedReview }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete review
  // @route   DELETE /api/v1/reviews/:id
  // @access  Private (Review author only)
  static async deleteReview(req, res, next) {
    try {
      const { id } = req.params;

      const review = await Review.findById(id);
      if (!review) {
        return next(new AppError('Review not found', 404));
      }

      // Check if user is the author
      if (review.userId.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to delete this review', 403));
      }

      await review.deleteOne();

      // Update company rating stats
      await review.updateCompanyRating();

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get user's reviews
  // @route   GET /api/v1/reviews/my-reviews
  // @access  Private
  static async getUserReviews(req, res, next) {
    try {
      const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = req.query;

      const reviews = await Review.find({ userId: req.user._id })
        .populate('companyId', 'name logo industry')
        .populate('jobId', 'title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Review.countDocuments({ userId: req.user._id });

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

  // @desc    Like/Unlike review
  // @route   POST /api/v1/reviews/:id/like
  // @access  Private
  static async likeReview(req, res, next) {
    try {
      const { id } = req.params;

      const review = await Review.findById(id);
      if (!review) {
        return next(new AppError('Review not found', 404));
      }

      // Check if user already liked
      const userIndex = review.likes.indexOf(req.user._id);

      if (userIndex > -1) {
        // Unlike
        review.likes.splice(userIndex, 1);
        await review.save();

        res.status(200).json({
          success: true,
          message: 'Review unliked successfully',
          data: { likesCount: review.likes.length }
        });
      } else {
        // Like
        review.likes.push(req.user._id);
        await review.save();

        res.status(200).json({
          success: true,
          message: 'Review liked successfully',
          data: { likesCount: review.likes.length }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // @desc    Report review
  // @route   POST /api/v1/reviews/:id/report
  // @access  Private
  static async reportReview(req, res, next) {
    try {
      const { id } = req.params;
      const { reason, description } = req.body;

      const review = await Review.findById(id);
      if (!review) {
        return next(new AppError('Review not found', 404));
      }

      // Check if user already reported
      const existingReport = review.reports.find(report => report.reportedBy.toString() === req.user._id.toString());
      if (existingReport) {
        return next(new AppError('You have already reported this review', 409));
      }

      // Add report
      review.reports.push({
        reportedBy: req.user._id,
        reason,
        description,
        reportedAt: new Date()
      });

      await review.save();

      res.status(200).json({
        success: true,
        message: 'Review reported successfully. Our team will review it shortly.'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get review statistics for company
  // @route   GET /api/v1/reviews/company/:companyId/stats
  // @access  Public
  static async getReviewStats(req, res, next) {
    try {
      const { companyId } = req.params;

      const stats = await Review.aggregate([
        { $match: { companyId: new (require('mongoose').Types.ObjectId)(companyId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: '$rating'
            },
            recentReviews: { $push: { rating: '$rating', createdAt: '$createdAt' } }
          }
        }
      ]);

      if (stats.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: [1, 2, 3, 4, 5].map(rating => ({ rating, count: 0, percentage: 0 })),
            recentTrend: []
          }
        });
      }

      const data = stats[0];

      // Calculate rating distribution
      const distribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: data.ratingDistribution.filter(r => r === rating).length,
        percentage: (data.ratingDistribution.filter(r => r === rating).length / data.totalReviews) * 100
      }));

      // Calculate recent trend (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentReviews = data.recentReviews
        .filter(review => new Date(review.createdAt) > thirtyDaysAgo)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      const recentTrend = recentReviews.map(review => ({
        date: review.createdAt,
        rating: review.rating
      }));

      res.status(200).json({
        success: true,
        data: {
          averageRating: Math.round(data.averageRating * 10) / 10,
          totalReviews: data.totalReviews,
          ratingDistribution: distribution,
          recentTrend
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;