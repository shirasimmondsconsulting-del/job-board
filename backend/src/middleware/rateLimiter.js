const rateLimit = require('express-rate-limit');
const { RATE_LIMITS } = require('../config/constants');

// General API rate limiter
const limiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.WINDOW_MS,
  max: RATE_LIMITS.GENERAL.MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth rate limiter (stricter for login/signup)
const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

// Application submission rate limiter
const applicationLimiter = rateLimit({
  windowMs: RATE_LIMITS.APPLICATION.WINDOW_MS,
  max: RATE_LIMITS.APPLICATION.MAX_REQUESTS,
  message: {
    success: false,
    message: 'You have reached the maximum number of applications per day.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Job creation rate limiter (for employers)
const jobCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 jobs per hour
  message: {
    success: false,
    message: 'You have reached the maximum number of job postings per hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Review creation rate limiter
const reviewLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 reviews per day
  message: {
    success: false,
    message: 'You have reached the maximum number of reviews per day.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Resend verification email rate limiter
const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // max 3 attempts per 15 min
  message: {
    success: false,
    message: 'Too many verification email requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  limiter,
  authLimiter,
  applicationLimiter,
  jobCreationLimiter,
  reviewLimiter,
  resendVerificationLimiter
};