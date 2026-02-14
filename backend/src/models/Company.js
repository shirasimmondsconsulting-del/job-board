const mongoose = require('mongoose');
const slug = require('slug');
const mongoosePaginate = require('mongoose-paginate-v2');

const companySchema = new mongoose.Schema({
  // Company Information
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Company description is required']
  },
  website: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please provide a valid URL']
  },

  // Logo & Images
  logo: {
    url: String,
    publicId: String
  },
  bannerImage: {
    url: String,
    publicId: String
  },

  // Contact Information
  email: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  phone: String,

  // Company Details
  industry: {
    type: String,
    enum: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Other']
  },
  companySize: {
    type: String,
    enum: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise']
  },
  foundedYear: Number,

  // Location
  headquarters: {
    city: String,
    state: String
  },
  officeLocations: [String],

  // Social Media
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },

  // Admin & Owner
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],

  // Company Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isSuspended: {
    type: Boolean,
    default: false
  },

  // Analytics
  activeJobsCount: {
    type: Number,
    default: 0
  },
  totalApplications: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },

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
companySchema.index({ owner: 1 });
companySchema.index({ slug: 1 });
companySchema.index({ isVerified: 1 });
companySchema.index({ industry: 1 });

// Pre-save middleware to generate slug
companySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slug(this.name, { lower: true });
  }
  next();
});

// Instance method to update job count
companySchema.methods.updateJobCount = function() {
  const Job = mongoose.model('Job');
  return Job.countDocuments({
    companyId: this._id,
    status: 'published'
  }).then(count => {
    this.activeJobsCount = count;
    return this.save();
  });
};

// Instance method to update application count
companySchema.methods.updateApplicationCount = function() {
  const Application = mongoose.model('Application');
  return Application.countDocuments({
    companyId: this._id
  }).then(count => {
    this.totalApplications = count;
    return this.save();
  });
};

// Instance method to update rating
companySchema.methods.updateRating = function() {
  const Review = mongoose.model('Review');
  return Review.aggregate([
    { $match: { companyId: this._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]).then(result => {
    if (result.length > 0) {
      this.averageRating = Math.round(result[0].averageRating * 10) / 10;
      this.reviewCount = result[0].reviewCount;
    } else {
      this.averageRating = 0;
      this.reviewCount = 0;
    }
    return this.save();
  });
};

// Static method to find verified companies
companySchema.statics.findVerified = function() {
  return this.find({ isVerified: true, isSuspended: false });
};

// Add pagination plugin
companySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Company', companySchema);