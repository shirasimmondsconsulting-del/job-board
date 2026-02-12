const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Related Job (optional)
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },

  // Review Content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  review: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  comment: {
    type: String,
    maxlength: 2000
  },
  pros: {
    type: String,
    maxlength: 1000
  },
  cons: {
    type: String,
    maxlength: 1000
  },
  adviceToManagement: {
    type: String,
    maxlength: 1000
  },

  // Review Details
  workEnvironment: { type: Number, min: 1, max: 5 },
  compensation: { type: Number, min: 1, max: 5 },
  careerGrowth: { type: Number, min: 1, max: 5 },
  managementQuality: { type: Number, min: 1, max: 5 },

  // Social
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    description: String,
    reportedAt: { type: Date, default: Date.now }
  }],

  // Moderation
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isFlagged: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes
reviewSchema.index({ companyId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ rating: -1 });

// Static method to find approved reviews
reviewSchema.statics.findApproved = function (companyId) {
  return this.find({ companyId, isApproved: true }).populate('userId', 'firstName lastName profileImage').sort({ createdAt: -1 });
};

// Static method to calculate average rating
reviewSchema.statics.getAverageRating = function (companyId) {
  return this.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId), isApproved: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
};

// Instance method to approve review
reviewSchema.methods.approve = function () {
  this.isApproved = true;
  return this.save();
};

// Instance method to flag review
reviewSchema.methods.flag = function () {
  this.isFlagged = true;
  return this.save();
};

// Instance method to update company rating stats
reviewSchema.methods.updateCompanyRating = async function () {
  const Company = mongoose.model('Company');
  const company = await Company.findById(this.companyId);
  if (company) {
    return company.updateRating();
  }
};

module.exports = mongoose.model('Review', reviewSchema);