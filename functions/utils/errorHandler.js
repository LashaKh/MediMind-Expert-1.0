/**
 * Centralized Error Handler for MediMind Expert
 * Addresses LOW-002: Error Message Information Disclosure
 * 
 * Provides secure, consistent error responses that prevent
 * internal system information disclosure while maintaining
 * user-friendly error messages
 */

const { ERROR_CODES, getErrorByCode } = require('./errorCodes');
const { getCorsHeaders } = require('./cors');
const { logger } = require('./logger');
const { isDevelopment } = require('./env');

/**
 * Standard error response format
 * @typedef {Object} ErrorResponse
 * @property {number} statusCode - HTTP status code
 * @property {Object} headers - Response headers including CORS
 * @property {string} body - JSON stringified response body
 */

/**
 * Internal error data for logging
 * @typedef {Object} ErrorContext
 * @property {string} userId - User ID if available
 * @property {string} requestId - Request ID for tracing
 * @property {string} operation - Operation being performed
 * @property {Object} additionalData - Additional context data
 */

/**
 * Create a standardized error response
 * @param {string} errorCode - Error code from ERROR_CODES
 * @param {string} origin - Request origin for CORS headers
 * @param {ErrorContext} context - Additional context for logging
 * @param {Object} overrides - Optional overrides for error details
 * @returns {ErrorResponse} Standardized error response
 */
function createErrorResponse(errorCode, origin = null, context = {}, overrides = {}) {
  const errorDef = getErrorByCode(errorCode);
  
  if (!errorDef) {
    // Fallback for invalid error codes
    return createGenericErrorResponse(
      500,
      'Internal server error',
      'UNKNOWN_ERROR',
      origin,
      context
    );
  }

  // Log error for internal monitoring
  logError(errorDef, context, overrides);

  // Prepare user-facing response
  const userMessage = overrides.userMessage || errorDef.userMessage;
  const httpStatus = overrides.httpStatus || errorDef.httpStatus;
  
  const responseBody = {
    error: {
      code: errorDef.code,
      message: userMessage,
      category: errorDef.category,
      severity: errorDef.severity
    }
  };

  // Add development-specific details if in development mode
  if (isDevelopment() && overrides.developmentDetails) {
    responseBody.debug = {
      internalMessage: errorDef.internalMessage,
      details: overrides.developmentDetails,
      timestamp: new Date().toISOString(),
      requestId: context.requestId
    };
  }

  // Add retry information for applicable errors
  if (shouldIncludeRetryInfo(errorDef)) {
    responseBody.retry = {
      retryable: true,
      retryAfter: getRetryDelay(errorDef)
    };
  }

  // Add user guidance for specific error types
  const userGuidance = getUserGuidance(errorDef);
  if (userGuidance) {
    responseBody.guidance = userGuidance;
  }

  return {
    statusCode: httpStatus,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin)
    },
    body: JSON.stringify(responseBody)
  };
}

/**
 * Create a generic error response for unhandled cases
 */
function createGenericErrorResponse(statusCode, message, fallbackCode, origin, context) {
  logError({
    code: fallbackCode,
    severity: 'error',
    internalMessage: message
  }, context, { isGeneric: true });

  const responseBody = {
    error: {
      code: fallbackCode,
      message: isDevelopment() ? message : 'An unexpected error occurred. Please try again.',
      category: 'UNKNOWN',
      severity: 'error'
    }
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin)
    },
    body: JSON.stringify(responseBody)
  };
}

/**
 * Log error details for monitoring and debugging
 */
function logError(errorDef, context, overrides) {
  const logData = {
    errorCode: errorDef.code,
    category: errorDef.category,
    severity: errorDef.severity,
    operation: context.operation,
    userId: context.userId,
    requestId: context.requestId,
    internalMessage: errorDef.internalMessage,
    ...(overrides.logData || {})
  };

  // Use appropriate log level based on severity
  switch (errorDef.severity) {
    case 'critical':
      logger.error(`Critical Error: ${errorDef.code}`, logData);
      break;
    case 'error':
      logger.error(`Error: ${errorDef.code}`, logData);
      break;
    case 'warn':
      logger.warn(`Warning: ${errorDef.code}`, logData);
      break;
    case 'info':
    default:
      logger.info(`Info: ${errorDef.code}`, logData);
      break;
  }
}

/**
 * Determine if retry information should be included
 */
function shouldIncludeRetryInfo(errorDef) {
  const retryableCategories = ['NETWORK', 'RATE', 'PROCESSING'];
  const retryableCodes = ['UPLOAD_005', 'DB_001', 'CONFIG_001'];
  
  return retryableCategories.includes(errorDef.category) || 
         retryableCodes.includes(errorDef.code);
}

/**
 * Get appropriate retry delay for error type
 */
function getRetryDelay(errorDef) {
  switch (errorDef.category) {
    case 'RATE':
      return 15 * 60; // 15 minutes for rate limiting
    case 'NETWORK':
      return 30; // 30 seconds for network issues
    case 'PROCESSING':
      return 60; // 1 minute for processing issues
    default:
      return 5; // 5 seconds default
  }
}

/**
 * Get user guidance for specific error types
 */
function getUserGuidance(errorDef) {
  const guidance = {
    'UPLOAD_001': 'Supported formats: PDF, Word documents, text files, and CSV files.',
    'UPLOAD_002': 'Try compressing your file or splitting large documents into smaller parts.',
    'AUTH_002': 'Please log out and log back in to refresh your session.',
    'AUTH_003': 'Your session has expired. Please log in again to continue.',
    'RATE_001': 'Please wait a few minutes before making another request.',
    'NET_001': 'The issue is temporary. Please try again in a few moments.',
    'CONTENT_001': 'Your document was uploaded successfully. Please review any sensitive content warnings in your document list.'
  };

  return guidance[errorDef.code] || null;
}

/**
 * Handle JavaScript errors and convert to standardized responses
 */
function handleJavaScriptError(error, operation, origin, context = {}) {
  let errorCode = 'CONFIG_001'; // Default to configuration error
  let overrides = {};

  // Map common JavaScript errors to appropriate error codes
  if (error.message?.includes('out of memory') || error.message?.includes('heap')) {
    errorCode = 'UPLOAD_002';
    overrides.userMessage = 'File too large to process. Please try a smaller file.';
  } else if (error.message?.includes('timeout')) {
    errorCode = 'NET_002';
  } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
    errorCode = 'NET_001';
  } else if (error.message?.includes('authentication') || error.message?.includes('auth')) {
    errorCode = 'AUTH_002';
  } else if (error.message?.includes('permission') || error.message?.includes('forbidden')) {
    errorCode = 'AUTHZ_001';
  } else if (error.message?.includes('not found')) {
    errorCode = 'DB_002';
  } else if (error.message?.includes('validation') || error.message?.includes('invalid')) {
    errorCode = 'VALID_001';
  }

  // Add development details if in development mode
  if (isDevelopment()) {
    overrides.developmentDetails = {
      originalError: error.message,
      stack: error.stack,
      operation
    };
  }

  overrides.logData = {
    originalError: error.message,
    errorType: error.constructor.name,
    operation,
    stack: isDevelopment() ? error.stack : '[REDACTED]'
  };

  return createErrorResponse(errorCode, origin, context, overrides);
}

/**
 * Create success response with optional warnings
 */
function createSuccessResponse(data, origin = null, warnings = []) {
  const responseBody = {
    success: true,
    data,
    ...(warnings.length > 0 && { warnings })
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin)
    },
    body: JSON.stringify(responseBody)
  };
}

/**
 * Validate and sanitize error context to prevent information disclosure
 */
function sanitizeContext(context) {
  const sanitized = { ...context };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'key', 'secret', 'credential'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  // Sanitize nested objects
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeContext(sanitized[key]);
    }
  });

  return sanitized;
}

/**
 * Middleware wrapper for consistent error handling in Lambda functions
 */
function withErrorHandling(handler, operation) {
  return async (event, context) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const origin = event.headers.origin || event.headers.Origin;
    
    try {
      return await handler(event, context);
    } catch (error) {
      console.error(`Error in ${operation}:`, error);
      
      const errorContext = {
        requestId,
        operation,
        path: event.path,
        method: event.httpMethod,
        userAgent: event.headers['user-agent']
      };

      return handleJavaScriptError(error, operation, origin, errorContext);
    }
  };
}

module.exports = {
  createErrorResponse,
  createGenericErrorResponse,
  handleJavaScriptError,
  createSuccessResponse,
  sanitizeContext,
  withErrorHandling
};