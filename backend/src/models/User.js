const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_TYPES } = require('../config/constants');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't return password by default
  },

  // Profile Information
  userType: {
    type: String,
    enum: Object.values(USER_TYPES),
    required: true
  },
  profileImage: {
    url: String,
    publicId: String  // For Cloudinary deletion
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },

  // Job Seeker Specific
  phone: String,
  location: String,
  skills: [String],
  experience: {
    yearsOfExperience: Number,
    currentJobTitle: String,
    previousCompanies: [String]
  },
  education: {
    degree: String,
    fieldOfStudy: String,
    university: String,
    graduationYear: Number
  },
  resume: {
    url: String,
    publicId: String,
    uploadedAt: Date
  },
  preferredJobTypes: [String],
  preferredLocations: [String],
  availability: {
    type: String,
    enum: ['Immediate', '1-2 weeks', '2-4 weeks', 'Not available']
  },

  // Employer Specific
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },

  // Account Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Security & Settings
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspensionReason: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    marketingEmails: { type: Boolean, default: true }
  },

  // Metadata
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: Date
}, { timestamps: true });

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ userType: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ firstName: 'text', lastName: 'text', skills: 'text' });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate auth token
userSchema.methods.generateAuthToken = function () {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId: this._id, userType: this.userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Static method to find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', userSchema);