const User = require('../models/User');
const AuthService = require('../services/authService');
const EmailService = require('../services/emailService');
const { AppError } = require('../middleware/errorHandler');

class AuthController {
  // @desc    Register user
  // @route   POST /api/v1/auth/register
  // @access  Public
  static async register(req, res, next) {
    try {
      const { email, userType } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return next(new AppError('User already exists with this email', 409));
      }

      // Validate corporate email for employers
      if (userType === 'employer') {
        const { isCorporateEmail } = require('../utils/validators');
        if (!isCorporateEmail(email)) {
          return next(new AppError('Please use a corporate email address for employer registration', 400));
        }
      }

      // Create user
      const { user, verificationToken } = await AuthService.createUser(req.body);

      // Send verification email
      let emailSent = false;
      try {
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
        await EmailService.sendVerificationEmail(user.email, verificationUrl, user.firstName);
        emailSent = true;
      } catch (emailError) {
        console.error('⚠️ Registration Email Failed:', emailError.message);
        // We don't throw error here so registration finishes
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userType: user.userType,
            isEmailVerified: user.isEmailVerified
          },
          emailSent
        }
      });
    } catch (error) {
      next(error);
    }
  }



  // @desc    Login user
  // @route   POST /api/v1/auth/login
  // @access  Public
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Authenticate user
      const user = await AuthService.authenticateUser(email, password);

      // Generate token
      const token = AuthService.generateToken(user._id, user.userType);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userType: user.userType,
            profileImage: user.profileImage,
            isEmailVerified: user.isEmailVerified
          },
          token
        }
      });
    } catch (error) {
      next(new AppError(error.message, 401));
    }
  }

  // @desc    Logout user
  // @route   POST /api/v1/auth/logout
  // @access  Private
  static async logout(req, res, next) {
    try {
      // In a stateless JWT system, logout is handled on the client side
      // by removing the token from storage
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }




  // @desc    Forgot password request
  // @route   POST /api/v1/auth/forgot-password
  // @access  Public
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const { resetToken } = await AuthService.initiatePasswordReset(email);

      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

      try {
        await EmailService.sendPasswordResetEmail(email, resetUrl);
      } catch (error) {
        console.error('⚠️ Forgot Password Email Failed:', error.message);
      }

      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Reset password
  // @route   POST /api/v1/auth/reset-password
  // @access  Public
  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      await AuthService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }

  // @route   POST /api/v1/auth/verify-email
  // @access  Public
  static async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      const user = await AuthService.verifyEmail(token);
      const authToken = AuthService.generateToken(user._id, user.userType);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: {
          token: authToken,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userType: user.userType,
            isEmailVerified: user.isEmailVerified
          }
        }
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }

  // @desc    Resend verification email
  // @route   POST /api/v1/auth/resend-verification
  // @access  Public
  static async resendVerification(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return next(new AppError('Email is required', 400));
      }

      const user = await User.findByEmail(email);

      // Don't reveal if user exists or not (security best practice)
      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'If an account with that email exists and is not yet verified, a verification email has been sent.'
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'This email is already verified. You can login directly.'
        });
      }

      // Generate new verification token
      const verificationToken = AuthService.generateEmailVerificationToken();
      user.emailVerificationToken = AuthService.hashEmailVerificationToken(verificationToken);
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      await user.save();

      // Send verification email
      try {
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
        await EmailService.sendVerificationEmail(user.email, verificationUrl, user.firstName);
      } catch (emailError) {
        console.error('⚠️ Resend Verification Email Failed:', emailError.message);
      }

      res.status(200).json({
        success: true,
        message: 'If an account with that email exists and is not yet verified, a verification email has been sent.'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get current user
  // @route   GET /api/v1/auth/me
  // @access  Private
  static async getMe(req, res, next) {
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

  // @desc    Refresh token
  // @route   POST /api/v1/auth/refresh-token
  // @access  Private
  static async refreshToken(req, res, next) {
    try {
      // Generate new token
      const token = AuthService.generateToken(req.user._id, req.user.userType);

      res.status(200).json({
        success: true,
        data: { token }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update user profile
  // @route   PUT /api/v1/auth/update-profile
  // @access  Private
  static async updateProfile(req, res, next) {
    try {
      const allowedFields = [
        'firstName', 'lastName', 'bio', 'phone', 'location',
        'skills', 'experience', 'education', 'preferredJobTypes', 'preferredLocations', 'availability', 'linkedinUrl'
      ];

      const updates = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Change password
  // @route   PUT /api/v1/auth/change-password
  // @access  Private
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id).select('+password');
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Check current password
      const isMatch = await AuthService.comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return next(new AppError('Current password is incorrect', 400));
      }

      // Update password (assign plain password; pre-save middleware hashes it)
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete account
  // @route   DELETE /api/v1/auth/delete-account
  // @access  Private
  static async deleteAccount(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Mark as deleted instead of hard delete
      user.isDeleted = true;
      user.deletedAt = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;