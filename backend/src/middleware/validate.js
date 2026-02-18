const Joi = require('joi');

// User validation schemas
const userSchemas = {
  register: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    userType: Joi.string().valid('job_seeker', 'employer').required(),
    phone: Joi.string().when('userType', {
      is: 'job_seeker',
      then: Joi.string().optional(),
      otherwise: Joi.forbidden()
    }),
    location: Joi.string().when('userType', {
      is: 'job_seeker',
      then: Joi.string().optional(),
      otherwise: Joi.forbidden()
    }),
    skills: Joi.array().items(Joi.string()).when('userType', {
      is: 'job_seeker',
      then: Joi.array().optional(),
      otherwise: Joi.forbidden()
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    bio: Joi.string().max(500),
    phone: Joi.string(),
    location: Joi.string(),
    skills: Joi.array().items(Joi.string()),
    experience: Joi.object({
      yearsOfExperience: Joi.number().min(0),
      currentJobTitle: Joi.string(),
      previousCompanies: Joi.array().items(Joi.string())
    }),
    education: Joi.object({
      degree: Joi.string(),
      fieldOfStudy: Joi.string(),
      university: Joi.string(),
      graduationYear: Joi.number().min(1950).max(new Date().getFullYear() + 10)
    }),
    preferredJobTypes: Joi.array().items(Joi.string()),
    preferredLocations: Joi.array().items(Joi.string()),
    availability: Joi.string().valid('now', '3-months', '6-months', '12-months').allow('', null),
    linkedinUrl: Joi.string().allow('', null)
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  })
};

// Job validation schemas
const jobSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(10).required(),
    shortDescription: Joi.string().max(200).allow('', null),
    jobType: Joi.string().valid('Full-time', 'Part-time', 'Contract', 'Temporary', 'Freelance', 'Internship').required(),
    experienceLevel: Joi.string().valid('Entry Level', 'Mid Level', 'Senior', 'Executive').required(),
    category: Joi.string().valid('IT', 'Finance', 'Healthcare', 'Sales', 'Marketing', 'Operations', 'HR', 'Other').required(),
    department: Joi.string().allow('', null),
    location: Joi.object({
      city: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      isRemote: Joi.boolean().default(false)
    }).default(),
    salary: Joi.object({
      minSalary: Joi.number().min(0).allow(null, ''),
      maxSalary: Joi.number().min(0).allow(null, ''),
      currency: Joi.string().valid('ILS').default('ILS'),
      isVisible: Joi.boolean().default(true),
      salaryType: Joi.string().valid('Hourly', 'Annual', 'Contract').default('Annual')
    }).default(),
    requiredSkills: Joi.array().items(Joi.string().allow('', null)).default([]),
    optionalSkills: Joi.array().items(Joi.string().allow('', null)).default([]),
    qualifications: Joi.string().allow('', null),
    responsibilities: Joi.string().allow('', null),
    benefits: Joi.array().items(Joi.string().allow('', null)).default([])
  }),

  update: Joi.object({
    title: Joi.string().min(5).max(100),
    description: Joi.string().min(10),
    shortDescription: Joi.string().max(200).allow('', null),
    jobType: Joi.string().valid('Full-time', 'Part-time', 'Contract', 'Temporary', 'Freelance', 'Internship'),
    experienceLevel: Joi.string().valid('Entry Level', 'Mid Level', 'Senior', 'Executive'),
    category: Joi.string().valid('IT', 'Finance', 'Healthcare', 'Sales', 'Marketing', 'Operations', 'HR', 'Other'),
    department: Joi.string().allow('', null),
    location: Joi.object({
      city: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      isRemote: Joi.boolean()
    }),
    salary: Joi.object({
      minSalary: Joi.number().min(0).allow(null, ''),
      maxSalary: Joi.number().min(0).allow(null, ''),
      currency: Joi.string().valid('ILS'),
      isVisible: Joi.boolean(),
      salaryType: Joi.string().valid('Hourly', 'Annual', 'Contract')
    }),
    requiredSkills: Joi.array().items(Joi.string().allow('', null)),
    optionalSkills: Joi.array().items(Joi.string().allow('', null)),
    qualifications: Joi.string().allow('', null),
    responsibilities: Joi.string().allow('', null),
    benefits: Joi.array().items(Joi.string().allow('', null)),
    status: Joi.string().valid('draft', 'published', 'closed', 'expired')
  })
};

// Company validation schemas
const companySchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().allow("", null),
    website: Joi.string().allow("", null),
    email: Joi.string().email().allow("", null),
    phone: Joi.string().allow("", null),
    industry: Joi.string().allow("", null),
    companySize: Joi.string()
      .valid("Startup", "Small", "Medium", "Large", "Enterprise")
      .allow("", null),
    foundedYear: Joi.number().min(1800).max(new Date().getFullYear()),
    headquarters: Joi.object({
      city: Joi.string(),
      state: Joi.string(),
    }),
    officeLocations: Joi.array().items(Joi.string()),
    socialLinks: Joi.object({
      linkedin: Joi.string().allow("", null),
      twitter: Joi.string().allow("", null),
      facebook: Joi.string().allow("", null),
      instagram: Joi.string().allow("", null),
    }),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().allow("", null),
    website: Joi.string().allow("", null),
    email: Joi.string().email().allow("", null),
    phone: Joi.string().allow("", null),
    industry: Joi.string().allow("", null),
    companySize: Joi.string()
      .valid("Startup", "Small", "Medium", "Large", "Enterprise")
      .allow("", null),
    foundedYear: Joi.number().min(1800).max(new Date().getFullYear()),
    headquarters: Joi.object({
      city: Joi.string(),
      state: Joi.string(),
    }),
    officeLocations: Joi.array().items(Joi.string()),
    socialLinks: Joi.object({
      linkedin: Joi.string().allow("", null),
      twitter: Joi.string().allow("", null),
      facebook: Joi.string().allow("", null),
      instagram: Joi.string().allow("", null),
    }),
  }),
};

// Application validation schemas
const applicationSchemas = {
  create: Joi.object({
    jobId: Joi.string().required(),
    coverLetter: Joi.string().max(2000),
    portfolioUrl: Joi.string().allow('', null),
    linkedinUrl: Joi.string().allow('', null),
    expectedSalary: Joi.string().allow('', null),
    resumeUrl: Joi.alternatives().try(
      Joi.string().allow('', null),
      Joi.object({
        url: Joi.string().allow('', null),
        publicId: Joi.string()
      })
    ).allow(null)
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted', 'withdrawn').required(),
    rejectionReason: Joi.string().when('status', {
      is: 'rejected',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    internalsNotes: Joi.string()
  })
};

// Review validation schemas
const reviewSchemas = {
  create: Joi.object({
    companyId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    title: Joi.string().min(5).max(100).required(),
    review: Joi.string().min(10).max(1000).required(),
    workEnvironment: Joi.number().min(1).max(5),
    compensation: Joi.number().min(1).max(5),
    careerGrowth: Joi.number().min(1).max(5),
    managementQuality: Joi.number().min(1).max(5)
  }),

  update: Joi.object({
    rating: Joi.number().min(1).max(5),
    title: Joi.string().min(5).max(100),
    review: Joi.string().min(10).max(1000),
    workEnvironment: Joi.number().min(1).max(5),
    compensation: Joi.number().min(1).max(5),
    careerGrowth: Joi.number().min(1).max(5),
    managementQuality: Joi.number().min(1).max(5)
  })
};

// Middleware function
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      // Log the actual error for the developer to see in CWD
      console.log('❌ VALIDATION ERROR:', JSON.stringify(errors, null, 2));
      console.log('📦 REQUEST BODY:', JSON.stringify(req.body, null, 2));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req.body = value;
    next();
  };
};

// Validation middleware functions
const validateRegistration = validate(userSchemas.register);
const validateLogin = validate(userSchemas.login);
const validateEmailVerification = validate(Joi.object({
  token: Joi.string().required()
}));
const validateResendVerification = validate(Joi.object({
  email: Joi.string().email().required()
}));
const validatePasswordReset = validate(userSchemas.forgotPassword);
const validatePasswordResetConfirm = validate(userSchemas.resetPassword);
const validateProfileUpdate = validate(userSchemas.updateProfile);
const validateJobCreation = validate(jobSchemas.create);
const validateJobUpdate = validate(jobSchemas.update);
const validateCompanyProfile = validate(companySchemas.create);
const validateCompanyUpdate = validate(companySchemas.update);
const validateApplicationSubmission = validate(applicationSchemas.create);
const validateReviewCreation = validate(reviewSchemas.create);
const validateReviewUpdate = validate(reviewSchemas.update);

module.exports = {
  validate,
  validateRegistration,
  validateLogin,
  validateEmailVerification,
  validateResendVerification,
  validatePasswordReset,
  validatePasswordResetConfirm,
  validateProfileUpdate,
  validateJobCreation,
  validateJobUpdate,
  validateCompanyProfile,
  validateCompanyUpdate,
  validateApplicationSubmission,
  validateReviewCreation,
  validateReviewUpdate,
  userSchemas,
  jobSchemas,
  companySchemas,
  applicationSchemas,
  reviewSchemas
};