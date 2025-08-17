/**
 * CSRF (Cross-Site Request Forgery) protection utilities
 * Addresses CRIT-005: Insecure CORS Configuration - CSRF protection requirement
 * Implements double-submit cookie pattern for CSRF protection
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { createHash, randomBytes } from 'crypto';
import { getTokenStorage, getFallbackStorage, ClientInfo } from './persistentTokenStorage';
import { logger, LogSensitivity } from './logger';

// CSRF token configuration
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_COOKIE_NAME = 'csrf-token';

// Initialize persistent token storage
const tokenStorage = getTokenStorage();

/**
 * Generate a cryptographically secure CSRF token with persistent storage
 */
export async function generateCsrfToken(
  userId?: string, 
  sessionId?: string,
  clientInfo?: ClientInfo
): Promise<string> {
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  const expiresAt = new Date(Date.now() + CSRF_TOKEN_EXPIRY);
  
  try {
    // Try persistent storage first
    if (tokenStorage.isReady()) {
      const success = await tokenStorage.storeCsrfToken(
        token,
        expiresAt,
        userId,
        sessionId,
        1, // Single use by default
        clientInfo
      );
      
      if (success) {
        logger.debug('CSRF token generated with persistent storage', {
          userId,
          sessionId,
          expiresAt: expiresAt.toISOString()
        }, LogSensitivity.SENSITIVE);
        return token;
      }
    }

    // Fallback to in-memory storage
    const fallback = getFallbackStorage();
    const success = fallback.storeCsrfToken(token, expiresAt, userId);
    
    if (success) {
      logger.warn('CSRF token generated with fallback storage - not persistent', {
        userId,
        sessionId
      }, LogSensitivity.SENSITIVE);
    } else {
      logger.error('Failed to store CSRF token in fallback storage', LogSensitivity.SENSITIVE);
    }

    return token;
  } catch (error) {
    logger.error('Error generating CSRF token', error, LogSensitivity.SENSITIVE);
    // Return token anyway - better to have some protection than none
    return token;
  }
}

/**
 * Validate CSRF token with persistent storage
 */
export async function validateCsrfToken(
  token: string, 
  userId?: string,
  markAsUsed: boolean = true
): Promise<boolean> {
  if (!token) {
    return false;
  }
  
  try {
    // Try persistent storage first
    if (tokenStorage.isReady()) {
      const isValid = await tokenStorage.validateCsrfToken(token, userId, markAsUsed);
      
      if (isValid) {
        logger.debug('CSRF token validated with persistent storage', {
          userId,
          markAsUsed
        }, LogSensitivity.SENSITIVE);
      } else {
        logger.debug('CSRF token validation failed with persistent storage', {
          userId
        }, LogSensitivity.SENSITIVE);
      }
      
      return isValid;
    }

    // Fallback to in-memory storage
    const fallback = getFallbackStorage();
    const isValid = fallback.validateCsrfToken(token, userId, markAsUsed);
    
    if (isValid) {
      logger.debug('CSRF token validated with fallback storage', {
        userId,
        markAsUsed
      }, LogSensitivity.SENSITIVE);
    } else {
      logger.debug('CSRF token validation failed with fallback storage', {
        userId
      }, LogSensitivity.SENSITIVE);
    }

    return isValid;
  } catch (error) {
    logger.error('Error validating CSRF token', error, LogSensitivity.SENSITIVE);
    return false; // Fail closed on errors for security
  }
}

/**
 * Clean up expired CSRF tokens using persistent storage
 */
async function cleanupExpiredTokens(): Promise<number> {
  try {
    if (tokenStorage.isReady()) {
      return await tokenStorage.cleanupExpiredCsrfTokens();
    } else {
      const fallback = getFallbackStorage();
      const result = fallback.cleanup();
      return result.csrfTokens;
    }
  } catch (error) {
    logger.error('Error cleaning up expired CSRF tokens', error, LogSensitivity.INTERNAL);
    return 0;
  }
}

/**
 * Extract CSRF token from request
 */
export function extractCsrfToken(event: HandlerEvent): string | null {
  // Check header first (primary method)
  const headerToken = event.headers[CSRF_HEADER_NAME.toLowerCase()] || 
                     event.headers[CSRF_HEADER_NAME];
  
  if (headerToken) {
    return headerToken;
  }
  
  // Check body for token (form submissions)
  if (event.body) {
    try {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      if (body.csrfToken) {
        return body.csrfToken;
      }
    } catch (error) {
      // Ignore JSON parse errors
    }
  }
  
  // Check query parameters (least preferred)
  if (event.queryStringParameters?.csrfToken) {
    return event.queryStringParameters.csrfToken;
  }
  
  return null;
}

/**
 * Check if request method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  return protectedMethods.includes(method.toUpperCase());
}

/**
 * Create CSRF error response
 */
export function createCsrfErrorResponse(): HandlerResponse {
  return {
    statusCode: 403,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      error: 'CSRF token validation failed',
      message: 'Invalid or missing CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    })
  };
}

/**
 * Add CSRF token to response headers
 */
export function addCsrfTokenToResponse(
  response: HandlerResponse, 
  token: string
): HandlerResponse {
  return {
    ...response,
    headers: {
      ...response.headers,
      [CSRF_HEADER_NAME]: token,
      'Set-Cookie': `${CSRF_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
    }
  };
}

/**
 * CSRF protection middleware
 */
export function withCsrfProtection(
  handler: (event: HandlerEvent) => Promise<HandlerResponse>,
  options: { skipMethods?: string[]; userId?: (event: HandlerEvent) => string | undefined } = {}
): (event: HandlerEvent) => Promise<HandlerResponse> {
  return async (event: HandlerEvent): Promise<HandlerResponse> => {
    const method = event.httpMethod;
    const skipMethods = options.skipMethods || ['GET', 'HEAD', 'OPTIONS'];
    
    // Skip CSRF protection for safe methods and specified methods
    if (skipMethods.includes(method)) {
      const response = await handler(event);
      
      // For GET requests, optionally provide a new CSRF token
      if (method === 'GET') {
        const userId = options.userId?.(event);
        const clientInfo: ClientInfo = {
          ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'],
          userAgent: event.headers['user-agent'],
          origin: event.headers.origin,
          method: method,
          path: event.path
        };
        const newToken = await generateCsrfToken(userId, undefined, clientInfo);
        return addCsrfTokenToResponse(response, newToken);
      }
      
      return response;
    }
    
    // Extract and validate CSRF token for state-changing operations
    const csrfToken = extractCsrfToken(event);
    const userId = options.userId?.(event);
    const clientInfo: ClientInfo = {
      ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'],
      userAgent: event.headers['user-agent'],
      origin: event.headers.origin,
      method: method,
      path: event.path
    };
    
    const isValidToken = csrfToken ? await validateCsrfToken(csrfToken, userId, true) : false;
    
    if (!csrfToken || !isValidToken) {
      logger.error('CSRF token validation failed', {
        type: 'CSRF_VIOLATION',
        method: method,
        path: event.path,
        origin: event.headers.origin,
        userAgent: event.headers['user-agent'],
        hasToken: !!csrfToken,
        userId: userId
      }, LogSensitivity.SENSITIVE);
      
      return createCsrfErrorResponse();
    }
    
    // Token is valid, proceed with request  
    const response = await handler(event);
    
    // Generate new token for next request (token rotation)
    const newToken = await generateCsrfToken(userId, undefined, clientInfo);
    return addCsrfTokenToResponse(response, newToken);
  };
}

/**
 * Combined CORS + CSRF protection middleware
 */
export function withCorsAndCsrf(
  handler: (event: HandlerEvent) => Promise<HandlerResponse>,
  corsOptions?: any,
  csrfOptions?: { skipMethods?: string[]; userId?: (event: HandlerEvent) => string | undefined }
): (event: HandlerEvent) => Promise<HandlerResponse> {
  // Import CORS utilities dynamically to avoid circular dependencies
  const { withCors } = require('./cors');
  
  // Combine CORS and CSRF protection
  const corsProtectedHandler = withCors(handler, corsOptions);
  const fullProtectedHandler = withCsrfProtection(corsProtectedHandler, csrfOptions);
  
  return fullProtectedHandler;
}

/**
 * Create a CSRF token endpoint for frontend initialization
 */
export async function createCsrfTokenEndpoint(event: HandlerEvent): Promise<HandlerResponse> {
  // Generate new token with client info
  const clientInfo: ClientInfo = {
    ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'],
    userAgent: event.headers['user-agent'],
    origin: event.headers.origin,
    method: event.httpMethod,
    path: event.path
  };
  
  const token = await generateCsrfToken(undefined, undefined, clientInfo);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      [CSRF_HEADER_NAME]: token,
      'Set-Cookie': `${CSRF_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
    },
    body: JSON.stringify({
      csrfToken: token,
      expiresIn: CSRF_TOKEN_EXPIRY
    })
  };
}

/**
 * Get CSRF protection statistics for monitoring with persistent storage support
 */
export async function getCsrfStats(): Promise<{
  activeTokens: number;
  expiredTokens: number;
  totalTokens: number;
  tokenExpiry: number;
  source: 'persistent' | 'fallback';
  detailed?: any;
}> {
  try {
    // Try to get comprehensive stats from persistent storage
    if (tokenStorage.isReady()) {
      const stats = await tokenStorage.getTokenStorageStats();
      if (stats) {
        return {
          activeTokens: stats.csrf_tokens.active_tokens,
          expiredTokens: stats.csrf_tokens.expired_tokens,
          totalTokens: stats.csrf_tokens.total_csrf_tokens,
          tokenExpiry: CSRF_TOKEN_EXPIRY,
          source: 'persistent',
          detailed: stats.csrf_tokens
        };
      }
    }

    // Fallback to in-memory storage stats
    const fallback = getFallbackStorage();
    const cleanupResult = fallback.cleanup();
    
    return {
      activeTokens: 0, // Fallback doesn't track active/expired separately
      expiredTokens: cleanupResult.csrfTokens,
      totalTokens: cleanupResult.csrfTokens,
      tokenExpiry: CSRF_TOKEN_EXPIRY,
      source: 'fallback'
    };
  } catch (error) {
    logger.error('Error getting CSRF statistics', error, LogSensitivity.INTERNAL);
    return {
      activeTokens: 0,
      expiredTokens: 0,
      totalTokens: 0,
      tokenExpiry: CSRF_TOKEN_EXPIRY,
      source: 'fallback'
    };
  }
}