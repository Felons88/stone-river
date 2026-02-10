// Security Middleware for StoneRiver Website
// Protects against XSS, SQL Injection, and other attacks

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss');
const validator = require('validator');

// Rate limiting to prevent brute force attacks
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
});

// Different rate limits for different endpoints
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many authentication attempts, please try again later.'
);

const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes  
  100, // 100 requests per window
  'Too many requests, please try again later.'
);

const emailLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 emails per hour
  'Too many emails sent, please try again later.'
);

const smsLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  5, // 5 SMS per hour
  'Too many SMS sent, please try again later.'
);

// XSS Protection - sanitize user input
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return xss(obj, {
        whiteList: {}, // Allow no HTML tags
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
      });
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// SQL Injection Protection - validate and escape inputs
const validateInput = (req, res, next) => {
  const validateValue = (value, type) => {
    switch (type) {
      case 'email':
        return validator.isEmail(value) ? value : null;
      case 'phone':
        return validator.isMobilePhone(value, 'en-US') ? value : null;
      case 'numeric':
        return validator.isNumeric(value) ? value : null;
      case 'alpha':
        return validator.isAlpha(value) ? value : null;
      case 'alphanumeric':
        return validator.isAlphanumeric(value) ? value : null;
      case 'url':
        return validator.isURL(value) ? value : null;
      default:
        // Remove dangerous characters for general strings
        return validator.escape(value);
    }
  };

  // Common validation patterns
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s\-\(\)]+$/,
    name: /^[a-zA-Z\s\-']+$/,
    address: /^[a-zA-Z0-9\s\-\.,#]+$/,
    amount: /^\d+(\.\d{1,2})?$/,
    id: /^[a-zA-Z0-9\-_]{1,50}$/
  };

  // Validate common fields
  if (req.body) {
    ['email', 'phone', 'name', 'address', 'amount', 'id'].forEach(field => {
      if (req.body[field] && patterns[field]) {
        if (!patterns[field].test(req.body[field])) {
          return res.status(400).json({ 
            error: `Invalid ${field} format`,
            field: field 
          });
        }
      }
    });
  }

  next();
};

// CSRF Protection
const csrfProtection = (req, res, next) => {
  // Simple CSRF token validation for API endpoints
  const csrfToken = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;

  // Skip CSRF for GET requests and public endpoints
  if (req.method === 'GET' || req.path.startsWith('/public/')) {
    return next();
  }

  // Validate CSRF token for state-changing requests
  if (!csrfToken || csrfToken !== sessionToken) {
    return res.status(403).json({ 
      error: 'Invalid CSRF token' 
    });
  }

  next();
};

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Hide server information
const hideServerInfo = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('Server', 'StoneRiver');
  next();
};

// Input validation middleware
const validateRequestBody = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const field in schema) {
      const rules = schema[field];
      const value = req.body[field];
      
      // Required field validation
      if (rules.required && (!value || value.trim() === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      
      // Skip validation if field is not provided and not required
      if (!value && !rules.required) {
        continue;
      }
      
      // Type validation
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
      }
      
      // Length validation
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must not exceed ${rules.maxLength} characters`);
      }
      
      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    next();
  };
};

// Common validation schemas
const validationSchemas = {
  booking: {
    name: { required: true, type: 'string', minLength: 2, maxLength: 100, pattern: /^[a-zA-Z\s\-']+$/ },
    email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { required: true, type: 'string', pattern: /^\+?[\d\s\-\(\)]+$/ },
    service_type: { required: true, type: 'string', maxLength: 50 },
    preferred_date: { required: true, type: 'string' },
    preferred_time: { required: true, type: 'string', maxLength: 20 },
    address: { required: true, type: 'string', minLength: 5, maxLength: 200, pattern: /^[a-zA-Z0-9\s\-\.,#]+$/ },
    notes: { required: false, type: 'string', maxLength: 1000 }
  },
  
  invoice: {
    client_id: { required: true, type: 'string', pattern: /^[a-zA-Z0-9\-_]{1,50}$/ },
    service_name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    amount: { required: true, type: 'string', pattern: /^\d+(\.\d{1,2})?$/ },
    due_date: { required: false, type: 'string' }
  },
  
  email: {
    to: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    subject: { required: true, type: 'string', minLength: 1, maxLength: 200 },
    message: { required: true, type: 'string', minLength: 1, maxLength: 5000 }
  },
  
  sms: {
    to: { required: true, type: 'string', pattern: /^\+?[\d\s\-\(\)]+$/ },
    message: { required: true, type: 'string', minLength: 1, maxLength: 160 }
  }
};

module.exports = {
  securityHeaders,
  sanitizeInput,
  validateInput,
  csrfProtection,
  hideServerInfo,
  validateRequestBody,
  validationSchemas,
  authLimiter,
  generalLimiter,
  emailLimiter,
  smsLimiter
};
