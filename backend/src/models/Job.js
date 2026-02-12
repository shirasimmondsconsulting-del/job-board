const mongoose = require('mongoose');
const slug = require('slug');
const mongoosePaginate = require('mongoose-paginate-v2');
const { JOB_TYPES, EXPERIENCE_LEVELS, JOB_CATEGORIES, JOB_STATUS } = require('../config/constants');

const jobSchema = new mongoose.Schema({
  // Job Details
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    minlength: [10, 'Description must be at least 10 characters']
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },

  // Company & Posting Details
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Job Specifications
  jobType: {
    type: String,
    enum: Object.values(JOB_TYPES),
    required: true
  },
  experienceLevel: {
    type: String,
    enum: Object.values(EXPERIENCE_LEVELS),
    required: true
  },
  department: String,
  category: {
    type: String,
    enum: Object.values(JOB_CATEGORIES),
    required: true
  },

  // Location
  location: {
    city: String,
    state: String,
    country: String,
    isRemote: { type: Boolean, default: false }
  },

  // Salary Information
  salary: {
    minSalary: Number,
    maxSalary: Number,
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'ILS']
    },
    isVisible: { type: Boolean, default: true },
    salaryType: {
      type: String,
      enum: ['Hourly', 'Annual', 'Contract'],
      default: 'Annual'
    }
  },

  // Requirements
  requiredSkills: [String],
  optionalSkills: [String],
  qualifications: String,
  responsibilities: String,

  // Benefits
  benefits: [String],

  // Job Status
  status: {
    type: String,
    enum: Object.values(JOB_STATUS),
    default: JOB_STATUS.PUBLISHED
  },
  applicationDeadline: Date,
  publishedAt: Date,
  closedAt: Date,

  // Analytics
  views: {
    type: Number,
    default: 0
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  saveCount: {
    type: Number,
    default: 0
  },

  // SEO & Metadata
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  keywords: [String],

  // Timestamps
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
jobSchema.index({ companyId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ slug: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });
jobSchema.index({ 'location.city': 1 });
jobSchema.index({ 'location.isRemote': 1 });

// Pre-save middleware to generate slug
jobSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slug(this.title, { lower: true });
  }
  next();
});

// Virtual for formatted salary
jobSchema.virtual('formattedSalary').get(function () {
  if (!this.salary.minSalary && !this.salary.maxSalary) return null;

  const currency = this.salary.currency;
  const min = this.salary.minSalary;
  const max = this.salary.maxSalary;

  if (min && max) {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  } else if (min) {
    return `${currency} ${min.toLocaleString()}+`;
  } else if (max) {
    return `Up to ${currency} ${max.toLocaleString()}`;
  }
  return null;
});

// Instance method to increment views
jobSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Instance method to increment applications
jobSchema.methods.incrementApplications = function () {
  this.applicationCount += 1;
  return this.save();
};

// Instance method to increment saves
jobSchema.methods.incrementSaves = function () {
  this.saveCount += 1;
  return this.save();
};

// Static method to find active jobs
jobSchema.statics.findActive = function () {
  return this.find({
    status: JOB_STATUS.PUBLISHED,
    $or: [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gte: new Date() } }
    ]
  });
};

// Add pagination plugin
jobSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Job', jobSchema);