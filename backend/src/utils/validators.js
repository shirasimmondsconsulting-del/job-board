const Joi = require('joi');

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

// Phone number validation
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// URL validation
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Company email validation (corporate domains)
const isCorporateEmail = (email) => {
  if (!isValidEmail(email)) return false;

  const domain = email.split('@')[1].toLowerCase();

  // Common personal email domains to exclude
  const personalDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'mail.com',
    'yandex.com',
    'protonmail.com',
    'zoho.com'
  ];

  return !personalDomains.includes(domain);
};

// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 10000); // Limit length
};

// Validate file type
const isValidFileType = (mimetype, allowedTypes) => {
  return allowedTypes.includes(mimetype);
};

// Validate file size
const isValidFileSize = (size, maxSize) => {
  return size <= maxSize;
};

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Capitalize first letter
const capitalize = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Format salary
const formatSalary = (min, max, currency = 'USD') => {
  if (!min && !max) return null;

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  });

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  } else if (min) {
    return `${formatter.format(min)}+`;
  } else if (max) {
    return `Up to ${formatter.format(max)}`;
  }
};

// Calculate age from date
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

// Pagination helper
const getPaginationInfo = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / itemsPerPage);

  return {
    currentPage,
    itemsPerPage,
    totalItems: total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null
  };
};

// Search query builder
const buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};

  const searchRegex = new RegExp(searchTerm, 'i');
  const orConditions = fields.map(field => ({ [field]: searchRegex }));

  return { $or: orConditions };
};

// Date range filter
const buildDateRangeFilter = (dateFrom, dateTo, field = 'createdAt') => {
  const filter = {};

  if (dateFrom) {
    filter[field] = { $gte: new Date(dateFrom) };
  }

  if (dateTo) {
    filter[field] = filter[field] || {};
    filter[field].$lte = new Date(dateTo);
  }

  return filter;
};

module.exports = {
  isValidEmail,
  isStrongPassword,
  isValidPhone,
  isValidUrl,
  isCorporateEmail,
  sanitizeInput,
  isValidFileType,
  isValidFileSize,
  generateSlug,
  capitalize,
  formatSalary,
  calculateAge,
  getPaginationInfo,
  buildSearchQuery,
  buildDateRangeFilter
};