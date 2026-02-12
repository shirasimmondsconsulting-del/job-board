module.exports = {
  // User Types
  USER_TYPES: {
    JOB_SEEKER: 'job_seeker',
    EMPLOYER: 'employer',
    ADMIN: 'admin'
  },

  // Job Types
  JOB_TYPES: {
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CONTRACT: 'Contract',
    TEMPORARY: 'Temporary',
    FREELANCE: 'Freelance',
    INTERNSHIP: 'Internship'
  },

  // Experience Levels
  EXPERIENCE_LEVELS: {
    ENTRY: 'Entry Level',
    MID: 'Mid Level',
    SENIOR: 'Senior',
    EXECUTIVE: 'Executive'
  },

  // Job Categories
  JOB_CATEGORIES: {
    IT: 'IT',
    FINANCE: 'Finance',
    HEALTHCARE: 'Healthcare',
    SALES: 'Sales',
    MARKETING: 'Marketing',
    OPERATIONS: 'Operations',
    HR: 'HR',
    OTHER: 'Other'
  },

  // Application Status
  APPLICATION_STATUS: {
    PENDING: 'pending',
    REVIEWED: 'reviewed',
    SHORTLISTED: 'shortlisted',
    REJECTED: 'rejected',
    ACCEPTED: 'accepted',
    WITHDRAWN: 'withdrawn'
  },

  // Job Status
  JOB_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    CLOSED: 'closed',
    EXPIRED: 'expired'
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    APPLICATION_UPDATE: 'application_update',
    JOB_MATCH: 'job_match',
    NEW_MESSAGE: 'new_message',
    PROFILE_UPDATE: 'profile_update',
    COMPANY_UPDATE: 'company_update',
    NEW_APPLICATION: 'new_application',
    SYSTEM: 'system'
  },

  // Email Templates
  EMAIL_TEMPLATES: {
    VERIFICATION: 'verification',
    PASSWORD_RESET: 'password_reset',
    APPLICATION_CONFIRMATION: 'application_confirmation',
    APPLICATION_STATUS_UPDATE: 'application_status_update',
    JOB_MATCHING: 'job_matching'
  },

  // File Upload Limits
  FILE_LIMITS: {
    PROFILE_IMAGE: 2 * 1024 * 1024, // 2MB
    RESUME: 5 * 1024 * 1024, // 5MB
    COMPANY_LOGO: 2 * 1024 * 1024, // 2MB
    COMPANY_BANNER: 3 * 1024 * 1024 // 3MB
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // Rate Limiting
  RATE_LIMITS: {
    GENERAL: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100
    },
    AUTH: {
      WINDOW_MS: 60 * 60 * 1000, // 1 hour
      MAX_REQUESTS: 5
    },
    APPLICATION: {
      WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
      MAX_REQUESTS: 50
    }
  }
};