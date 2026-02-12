const Notification = require('../models/Notification');
const { PAGINATION } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

class NotificationController {
  // @desc    Get user notifications
  // @route   GET /api/v1/notifications
  // @access  Private
  static async getNotifications(req, res, next) {
    try {
      const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, unreadOnly = false } = req.query;

      const query = { userId: req.user._id };
      if (unreadOnly === 'true') {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .populate('relatedJobId', 'title salary location')
        .populate('relatedApplicationId', 'status')
        .populate('relatedCompanyId', 'name logo')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

      res.status(200).json({
        success: true,
        data: notifications,
        meta: {
          unreadCount,
          totalCount: total
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

  // @desc    Mark notification as read
  // @route   PUT /api/v1/notifications/:id/read
  // @access  Private
  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;

      const notification = await Notification.findOne({
        _id: id,
        userId: req.user._id
      });

      if (!notification) {
        return next(new AppError('Notification not found', 404));
      }

      if (notification.isRead) {
        return next(new AppError('Notification is already read', 400));
      }

      await notification.markAsRead();

      res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Mark all notifications as read
  // @route   PUT /api/v1/notifications/mark-all-read
  // @access  Private
  static async markAllAsRead(req, res, next) {
    try {
      const result = await Notification.updateMany(
        { userId: req.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} notifications marked as read`
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete notification
  // @route   DELETE /api/v1/notifications/:id
  // @access  Private
  static async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;

      const notification = await Notification.findOneAndDelete({
        _id: id,
        userId: req.user._id
      });

      if (!notification) {
        return next(new AppError('Notification not found', 404));
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete all notifications
  // @route   DELETE /api/v1/notifications
  // @access  Private
  static async deleteAllNotifications(req, res, next) {
    try {
      const result = await Notification.deleteMany({ userId: req.user._id });

      res.status(200).json({
        success: true,
        message: `${result.deletedCount} notifications deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get notification count
  // @route   GET /api/v1/notifications/count
  // @access  Private
  static async getNotificationCount(req, res, next) {
    try {
      const unreadCount = await Notification.countDocuments({
        userId: req.user._id,
        isRead: false
      });

      const totalCount = await Notification.countDocuments({
        userId: req.user._id
      });

      res.status(200).json({
        success: true,
        data: {
          unreadCount,
          totalCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Create notification (Internal use)
  // @route   POST /api/v1/notifications
  // @access  Private (Admin/Internal)
  static async createNotification(req, res, next) {
    try {
      const { userId, type, title, message, relatedJobId, relatedApplicationId, relatedCompanyId } = req.body;

      // Validate required fields
      if (!userId || !type || !title || !message) {
        return next(new AppError('Missing required fields', 400));
      }

      const notification = new Notification({
        userId,
        type,
        title,
        message,
        relatedJobId,
        relatedApplicationId,
        relatedCompanyId
      });

      await notification.save();

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: { notification }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Bulk create notifications
  // @route   POST /api/v1/notifications/bulk
  // @access  Private (Admin/Internal)
  static async bulkCreateNotifications(req, res, next) {
    try {
      const { notifications } = req.body;

      if (!Array.isArray(notifications) || notifications.length === 0) {
        return next(new AppError('Notifications array is required', 400));
      }

      const createdNotifications = await Notification.insertMany(notifications);

      res.status(201).json({
        success: true,
        message: `${createdNotifications.length} notifications created successfully`,
        data: { notifications: createdNotifications }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get notification types
  // @route   GET /api/v1/notifications/types
  // @access  Public
  static async getNotificationTypes(req, res, next) {
    try {
      const types = [
        {
          type: 'new_application',
          title: 'New Job Application',
          description: 'When someone applies for your job posting'
        },
        {
          type: 'application_update',
          title: 'Application Status Update',
          description: 'When your application status changes'
        },
        {
          type: 'job_expired',
          title: 'Job Posting Expired',
          description: 'When your job posting reaches its deadline'
        },
        {
          type: 'profile_viewed',
          title: 'Profile Viewed',
          description: 'When an employer views your profile'
        },
        {
          type: 'job_saved',
          title: 'Job Saved',
          description: 'When someone saves your job posting'
        },
        {
          type: 'company_review',
          title: 'New Company Review',
          description: 'When someone reviews your company'
        },
        {
          type: 'system_announcement',
          title: 'System Announcement',
          description: 'Important announcements from the platform'
        }
      ];

      res.status(200).json({
        success: true,
        data: types
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update notification preferences
  // @route   PUT /api/v1/notifications/preferences
  // @access  Private
  static async updateNotificationPreferences(req, res, next) {
    try {
      const { emailNotifications, pushNotifications, notificationTypes } = req.body;

      // Update user preferences (assuming User model has these fields)
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, {
        notificationPreferences: {
          emailNotifications: emailNotifications ?? true,
          pushNotifications: pushNotifications ?? true,
          notificationTypes: notificationTypes ?? ['new_application', 'application_update', 'job_expired']
        }
      });

      res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get notification preferences
  // @route   GET /api/v1/notifications/preferences
  // @access  Private
  static async getNotificationPreferences(req, res, next) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user._id).select('notificationPreferences');

      res.status(200).json({
        success: true,
        data: user.notificationPreferences || {
          emailNotifications: true,
          pushNotifications: true,
          notificationTypes: ['new_application', 'application_update', 'job_expired']
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;