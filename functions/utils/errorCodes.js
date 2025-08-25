/**
 * Standardized Error Code System for MediMind Expert
 * Addresses LOW-002: Error Message Information Disclosure
 * 
 * Provides consistent error codes and user-friendly messages
 * while preventing internal system information disclosure
 */

// Error Categories with prefixes
const ERROR_CATEGORIES = {
  AUTHENTICATION: 'AUTH',
  AUTHORIZATION: 'AUTHZ', 
  UPLOAD: 'UPLOAD',
  PROCESSING: 'PROC',
  VALIDATION: 'VALID',
  NETWORK: 'NET',
  DATABASE: 'DB',
  CONFIGURATION: 'CONFIG',
  RATE_LIMIT: 'RATE',
  CONTENT: 'CONTENT',
  SECURITY: 'SEC'
};

// Error severity levels
const ERROR_SEVERITY = {
  INFO: 'info',
  WARN: 'warn', 
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Standardized error codes with user-friendly messages
const ERROR_CODES = {
  // Authentication errors (AUTH_xxx)
  AUTH_001: {
    code: 'AUTH_001',
    category: ERROR_CATEGORIES.AUTHENTICATION,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 401,
    userMessage: 'Authentication required. Please log in.',
    internalMessage: 'Missing authorization header',
    i18nKey: 'errors.auth.required'
  },
  AUTH_002: {
    code: 'AUTH_002',
    category: ERROR_CATEGORIES.AUTHENTICATION, 
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 401,
    userMessage: 'Invalid or expired session. Please log in again.',
    internalMessage: 'JWT token validation failed',
    i18nKey: 'errors.auth.invalid'
  },
  AUTH_003: {
    code: 'AUTH_003',
    category: ERROR_CATEGORIES.AUTHENTICATION,
    severity: ERROR_SEVERITY.ERROR, 
    httpStatus: 401,
    userMessage: 'Session expired. Please log in again.',
    internalMessage: 'JWT token expired',
    i18nKey: 'errors.auth.expired'
  },

  // Authorization errors (AUTHZ_xxx)
  AUTHZ_001: {
    code: 'AUTHZ_001',
    category: ERROR_CATEGORIES.AUTHORIZATION,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 403,
    userMessage: 'Access denied. You do not have permission to perform this action.',
    internalMessage: 'User lacks required permissions',
    i18nKey: 'errors.authz.denied'
  },
  AUTHZ_002: {
    code: 'AUTHZ_002',
    category: ERROR_CATEGORIES.AUTHORIZATION,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 403,
    userMessage: 'Access denied. Vector store access not permitted.',
    internalMessage: 'Vector store ownership validation failed',
    i18nKey: 'errors.authz.vectorStore'
  },
  AUTHZ_003: {
    code: 'AUTHZ_003',
    category: ERROR_CATEGORIES.AUTHORIZATION,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 403,
    userMessage: 'Access denied. Document access not permitted.',
    internalMessage: 'Document ownership validation failed',
    i18nKey: 'errors.authz.document'
  },

  // Upload errors (UPLOAD_xxx)
  UPLOAD_001: {
    code: 'UPLOAD_001',
    category: ERROR_CATEGORIES.UPLOAD,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 400,
    userMessage: 'Invalid file type. Please upload a supported document format.',
    internalMessage: 'File type not in ALLOWED_MIME_TYPES',
    i18nKey: 'errors.upload.fileType'
  },
  UPLOAD_002: {
    code: 'UPLOAD_002',
    category: ERROR_CATEGORIES.UPLOAD,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 413,
    userMessage: 'File too large. Maximum size allowed is 500MB for PDFs, 25MB for other file types.',
    internalMessage: 'File size exceeds MAX_FILE_SIZE limit',
    i18nKey: 'errors.upload.fileSize'
  },
  UPLOAD_003: {
    code: 'UPLOAD_003',
    category: ERROR_CATEGORIES.UPLOAD,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 400,
    userMessage: 'File appears corrupted or invalid. Please try uploading a different file.',
    internalMessage: 'File signature validation failed',
    i18nKey: 'errors.upload.corruption'
  },
  UPLOAD_004: {
    code: 'UPLOAD_004',
    category: ERROR_CATEGORIES.UPLOAD,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 400,
    userMessage: 'Required information missing. Please provide all required fields.',
    internalMessage: 'Missing required upload parameters',
    i18nKey: 'errors.upload.missingFields'
  },
  UPLOAD_005: {
    code: 'UPLOAD_005',
    category: ERROR_CATEGORIES.UPLOAD,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 500,
    userMessage: 'Upload failed. Please try again.',
    internalMessage: 'OpenAI file upload failed',
    i18nKey: 'errors.upload.failed'
  },

  // Processing errors (PROC_xxx)
  PROC_001: {
    code: 'PROC_001',
    category: ERROR_CATEGORIES.PROCESSING,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 500,
    userMessage: 'Document processing failed. Please try uploading again.',
    internalMessage: 'Text extraction failed',
    i18nKey: 'errors.processing.extraction'
  },
  PROC_002: {
    code: 'PROC_002',
    category: ERROR_CATEGORIES.PROCESSING,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 500,
    userMessage: 'Vector store processing failed. Please try again.',
    internalMessage: 'Vector store association failed',
    i18nKey: 'errors.processing.vectorStore'
  },
  PROC_003: {
    code: 'PROC_003',
    category: ERROR_CATEGORIES.PROCESSING,
    severity: ERROR_SEVERITY.WARN,
    httpStatus: 200,
    userMessage: 'Document uploaded successfully but content scanning was limited.',
    internalMessage: 'OCR processing failed, basic scanning only',
    i18nKey: 'errors.processing.ocrFailed'
  },

  // Validation errors (VALID_xxx)
  VALID_001: {
    code: 'VALID_001',
    category: ERROR_CATEGORIES.VALIDATION,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 400,
    userMessage: 'Invalid request format. Please check your input.',
    internalMessage: 'Request body validation failed',
    i18nKey: 'errors.validation.format'
  },
  VALID_002: {
    code: 'VALID_002',
    category: ERROR_CATEGORIES.VALIDATION,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 400,
    userMessage: 'Invalid content type. Expected multipart/form-data.',
    internalMessage: 'Content-Type header validation failed',
    i18nKey: 'errors.validation.contentType'
  },
  VALID_003: {
    code: 'VALID_003',
    category: ERROR_CATEGORIES.VALIDATION,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 405,
    userMessage: 'Method not allowed.',
    internalMessage: 'HTTP method not supported for this endpoint',
    i18nKey: 'errors.validation.method'
  },

  // Network errors (NET_xxx)
  NET_001: {
    code: 'NET_001',
    category: ERROR_CATEGORIES.NETWORK,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 502,
    userMessage: 'External service temporarily unavailable. Please try again.',
    internalMessage: 'OpenAI API request failed',
    i18nKey: 'errors.network.external'
  },
  NET_002: {
    code: 'NET_002',
    category: ERROR_CATEGORIES.NETWORK,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 408,
    userMessage: 'Request timed out. Please try again with a smaller file.',
    internalMessage: 'Request timeout exceeded',
    i18nKey: 'errors.network.timeout'
  },
  NET_003: {
    code: 'NET_003',
    category: ERROR_CATEGORIES.NETWORK,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 503,
    userMessage: 'AI service temporarily unavailable. Please try again later.',
    internalMessage: 'Flowise API connection failed',
    i18nKey: 'errors.network.aiService'
  },

  // Database errors (DB_xxx)
  DB_001: {
    code: 'DB_001',
    category: ERROR_CATEGORIES.DATABASE,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 500,
    userMessage: 'Database operation failed. Please try again.',
    internalMessage: 'Supabase query failed',
    i18nKey: 'errors.database.operation'
  },
  DB_002: {
    code: 'DB_002',
    category: ERROR_CATEGORIES.DATABASE,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 404,
    userMessage: 'Document not found.',
    internalMessage: 'Document record not found in database',
    i18nKey: 'errors.database.notFound'
  },
  DB_003: {
    code: 'DB_003',
    category: ERROR_CATEGORIES.DATABASE,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 500,
    userMessage: 'Failed to save document information. Please try again.',
    internalMessage: 'Database record creation failed',
    i18nKey: 'errors.database.creation'
  },

  // Configuration errors (CONFIG_xxx)
  CONFIG_001: {
    code: 'CONFIG_001',
    category: ERROR_CATEGORIES.CONFIGURATION,
    severity: ERROR_SEVERITY.CRITICAL,
    httpStatus: 500,
    userMessage: 'Service temporarily unavailable. Please try again later.',
    internalMessage: 'Missing required environment variables',
    i18nKey: 'errors.config.environment'
  },
  CONFIG_002: {
    code: 'CONFIG_002',
    category: ERROR_CATEGORIES.CONFIGURATION,
    severity: ERROR_SEVERITY.CRITICAL,
    httpStatus: 503,
    userMessage: 'Service initialization failed. Please contact support.',
    internalMessage: 'Service configuration validation failed',
    i18nKey: 'errors.config.service'
  },

  // Rate limiting errors (RATE_xxx)
  RATE_001: {
    code: 'RATE_001',
    category: ERROR_CATEGORIES.RATE_LIMIT,
    severity: ERROR_SEVERITY.WARN,
    httpStatus: 429,
    userMessage: 'Too many requests. Please wait before trying again.',
    internalMessage: 'Rate limit exceeded for user/IP',
    i18nKey: 'errors.rate.exceeded'
  },
  RATE_002: {
    code: 'RATE_002',
    category: ERROR_CATEGORIES.RATE_LIMIT,
    severity: ERROR_SEVERITY.WARN,
    httpStatus: 429,
    userMessage: 'Upload limit reached. Please wait before uploading more files.',
    internalMessage: 'Upload rate limit exceeded',
    i18nKey: 'errors.rate.upload'
  },

  // Content scanning errors (CONTENT_xxx)
  CONTENT_001: {
    code: 'CONTENT_001',
    category: ERROR_CATEGORIES.CONTENT,
    severity: ERROR_SEVERITY.WARN,
    httpStatus: 200,
    userMessage: 'Document uploaded successfully. Sensitive content detected and flagged.',
    internalMessage: 'Content scanning found potential PHI/PII',
    i18nKey: 'errors.content.sensitive'
  },
  CONTENT_002: {
    code: 'CONTENT_002',
    category: ERROR_CATEGORIES.CONTENT,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 400,
    userMessage: 'Document contains prohibited content and cannot be uploaded.',
    internalMessage: 'Content policy violation detected',
    i18nKey: 'errors.content.prohibited'
  },
  CONTENT_003: {
    code: 'CONTENT_003',
    category: ERROR_CATEGORIES.CONTENT,
    severity: ERROR_SEVERITY.INFO,
    httpStatus: 200,
    userMessage: 'Document processing completed with limited content analysis.',
    internalMessage: 'Content scanning partially failed',
    i18nKey: 'errors.content.partial'
  },

  // Security errors (SEC_xxx)
  SEC_001: {
    code: 'SEC_001',
    category: ERROR_CATEGORIES.SECURITY,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 403,
    userMessage: 'Request blocked for security reasons.',
    internalMessage: 'CORS policy violation',
    i18nKey: 'errors.security.cors'
  },
  SEC_002: {
    code: 'SEC_002',
    category: ERROR_CATEGORIES.SECURITY,
    severity: ERROR_SEVERITY.ERROR,
    httpStatus: 400,
    userMessage: 'File security validation failed.',
    internalMessage: 'File tampering detected during processing',
    i18nKey: 'errors.security.tampering'
  },
  SEC_003: {
    code: 'SEC_003',
    category: ERROR_CATEGORIES.SECURITY,
    severity: ERROR_SEVERITY.CRITICAL,
    httpStatus: 400,
    userMessage: 'Upload blocked for security reasons.',
    internalMessage: 'Potential security threat detected in file',
    i18nKey: 'errors.security.threat'
  }
};

// Helper functions
function getErrorByCode(code) {
  return ERROR_CODES[code] || null;
}

function getErrorsByCategory(category) {
  return Object.values(ERROR_CODES).filter(error => error.category === category);
}

function getErrorsBySeverity(severity) {
  return Object.values(ERROR_CODES).filter(error => error.severity === severity);
}

// Error code validation
function isValidErrorCode(code) {
  return ERROR_CODES.hasOwnProperty(code);
}

// Get all error codes for a category
function getCategoryErrorCodes(category) {
  return Object.values(ERROR_CODES)
    .filter(error => error.category === category)
    .map(error => error.code);
}

module.exports = {
  ERROR_CATEGORIES,
  ERROR_SEVERITY,
  ERROR_CODES,
  getErrorByCode,
  getErrorsByCategory,
  getErrorsBySeverity,
  isValidErrorCode,
  getCategoryErrorCodes
};