const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../config/constants');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Notification Details
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPES),
    required: true
  },
  title: String,
  message: {
    type: String,
    required: true
  },

  // Related Entities
  relatedJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  relatedApplicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  relatedCompanyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },

  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,

  createdAt: {
    type: Date,
    default: Date.now,
    expire: 2592000 // TTL: 30 days
  }
}, { timestamps: true });

// Indexes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// Static method to find unread notifications
notificationSchema.statics.findUnread = function(userId) {
  return this.find({ userId, isRead: false }).sort({ createdAt: -1 });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);