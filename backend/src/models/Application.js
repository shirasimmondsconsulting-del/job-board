const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../config/constants');

const applicationSchema = new mongoose.Schema({
  // Application Details
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },

  // Application Content
  coverLetter: String,
  resumeUrl: {
    url: String,
    publicId: String
  },
  portfolioUrl: String,

  // Additional Info
  expectedSalary: String,
  linkedinUrl: String,

  // Status Tracking
  status: {
    type: String,
    enum: Object.values(APPLICATION_STATUS),
    default: APPLICATION_STATUS.PENDING
  },

  // Feedback
  rejectionReason: String,
  internalsNotes: String,

  // Timestamps
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  decisionAt: Date,

  // Status Change Tracking
  statusHistory: [
    {
      status: String,
      changedAt: Date,
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String
    }
  ],

  // Analytics
  isViewed: {
    type: Boolean,
    default: false
  },
  viewedAt: Date
}, { timestamps: true });

// Indexes
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ companyId: 1, status: 1 });
applicationSchema.index({ appliedAt: -1 });
applicationSchema.index({ jobId: 1 });

// Pre-save middleware to track status changes
applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this._changedBy || null,
      reason: this._changeReason || null
    });

    if (this.status !== APPLICATION_STATUS.PENDING) {
      this.reviewedAt = new Date();
    }

    if ([APPLICATION_STATUS.ACCEPTED, APPLICATION_STATUS.REJECTED].includes(this.status)) {
      this.decisionAt = new Date();
    }
  }
  next();
});

// Instance method to update status
applicationSchema.methods.updateStatus = function (newStatus, changedBy, reason) {
  this.status = newStatus;
  this._changedBy = changedBy;
  this._changeReason = reason;
  return this.save();
};

// Instance method to mark as viewed
applicationSchema.methods.markAsViewed = function () {
  this.isViewed = true;
  this.viewedAt = new Date();
  return this.save();
};

// Static method to find applications by user
applicationSchema.statics.findByUser = function (userId) {
  return this.find({ userId }).populate('jobId companyId').sort({ appliedAt: -1 });
};

// Static method to find applications by company
applicationSchema.statics.findByCompany = function (companyId, status = null) {
  const query = { companyId };
  if (status) query.status = status;
  return this.find(query).populate('userId jobId').sort({ appliedAt: -1 });
};

// Static method to find applications by job
applicationSchema.statics.findByJob = function (jobId) {
  return this.find({ jobId }).populate('userId').sort({ appliedAt: -1 });
};

module.exports = mongoose.model('Application', applicationSchema);