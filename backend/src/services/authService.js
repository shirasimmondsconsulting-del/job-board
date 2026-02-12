const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');

class AuthService {
  // Generate JWT token
  static generateToken(userId, userType) {
    return jwt.sign(
      { userId, userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }

  // Generate refresh token
  static generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
    );
  }

  // Hash password
  static async hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare passwords
  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  // Verify JWT token
  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  // Generate email verification token
  static generateEmailVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash email verification token
  static hashEmailVerificationToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Generate password reset token
  static generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash password reset token
  static hashPasswordResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }


  // Create user
  static async createUser(userData) {
    const user = new User(userData);

    // Generate verification token
    const verificationToken = this.generateEmailVerificationToken();
    user.emailVerificationToken = this.hashEmailVerificationToken(verificationToken);
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();
    return { user, verificationToken };
  }

  // Verify email
  static async verifyEmail(token) {
    const hashedToken = this.hashEmailVerificationToken(token);

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    // Send welcome email (fire and forget)
    try {
      const EmailService = require('./emailService');
      await EmailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (e) {
      console.error('⚠️ Welcome email failed:', e.message);
    }

    return user;
  }


  // Change password
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new Error('User not found');
    }

    const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    user.password = await this.hashPassword(newPassword);
    await user.save();

    return user;
  }

  // Initiate password reset
  static async initiatePasswordReset(email) {
    const user = await User.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = this.generatePasswordResetToken();
    user.passwordResetToken = this.hashPasswordResetToken(resetToken);
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    return { user, resetToken };
  }

  // Reset password
  static async resetPassword(token, newPassword) {
    const hashedToken = this.hashPasswordResetToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    user.password = await this.hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return user;
  }

  // Authenticate user
  static async authenticateUser(email, password) {
    const user = await User.findByEmail(email).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Email verification check
    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    if (user.isSuspended) {
      throw new Error('Account is suspended');
    }

    const isPasswordValid = await this.comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return user;
  }
}

module.exports = AuthService;