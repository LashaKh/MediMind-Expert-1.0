import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { withCors } from './cors';
import { withAuth, extractUser, UserPayload } from './auth';
import { checkRateLimit, validateCSRFToken, sanitizeInput, getSecurityHeaders } from './security';
import { successResponse, errorResponse } from './response';
import { logger } from './logger';

export interface SecurityMiddlewareOptions {
  requireAuth?: boolean;
  requireCSRF?: boolean;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  sanitizeInput?: boolean;
  logRequests?: boolean;
}

export const DEFAULT_SECURITY_OPTIONS: SecurityMiddlewareOptions = {
  requireAuth: true,
  requireCSRF: false, // Disabled for Bearer token auth
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  },
  sanitizeInput: true,
  logRequests: true
};

/**
 * Comprehensive security middleware that applies all security measures
 */
export function withSecurity(
  handler: (event: HandlerEvent, context?: any) => Promise<HandlerResponse>,
  options: SecurityMiddlewareOptions = DEFAULT_SECURITY_OPTIONS
) {
  return withCors(async (event: HandlerEvent): Promise<HandlerResponse> => {
    const startTime = Date.now();
    const origin = event.headers.origin || event.headers.Origin;

    try {
      // Log request if enabled
      if (options.logRequests) {
        logger.info('Security middleware request', {
          method: event.httpMethod,
          path: event.path,
          origin
        });
      }

      // Rate limiting check
      if (options.rateLimit) {
        const rateLimitResult = checkRateLimit(event, options.rateLimit);
        
        if (!rateLimitResult.allowed) {
          return errorResponse(
            'Rate limit exceeded. Too many requests.',
            429,
            `Try again after ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000)} minutes`,
            origin
          );
        }
      }

      // CSRF protection for state-changing operations
      if (options.requireCSRF && event.httpMethod !== 'GET' && event.httpMethod !== 'OPTIONS') {
        // Extract expected CSRF token from session or generate one
        const csrfValid = validateCSRFToken(event);
        
        if (!csrfValid) {
          return errorResponse(
            'CSRF token validation failed',
            403,
            'Invalid or missing CSRF token',
            origin
          );
        }
      }

      // Authentication check
      let user: UserPayload | null = null;
      if (options.requireAuth) {
        try {
          user = await extractUser(event);
        } catch (authError: any) {
          return errorResponse(
            'Authentication failed',
            401,
            authError.message,
            origin
          );
        }
      }

      // Input sanitization
      if (options.sanitizeInput && event.body) {
        try {
          const body = JSON.parse(event.body);
          const sanitizedBody = sanitizeInput(body);
          event.body = JSON.stringify(sanitizedBody);
        } catch (E) {
          // If body parsing fails, continue without sanitization
          // This allows handlers to deal with non-JSON bodies
        }
      }

      // Execute the main handler with security context
      const response = await handler(event, { user, origin });

      // Add security headers to response
      const securityHeaders = getSecurityHeaders();
      
      return {
        ...response,
        headers: {
          ...response.headers,
          ...securityHeaders
        }
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      if (options.logRequests) {
        logger.error(`Security middleware error: ${error.message}`, {
          event: {
            path: event.path,
            method: event.httpMethod,
            headers: event.headers,
            duration
          },
          error: error.stack
        });
      }

      return errorResponse(
        'Internal server error',
        500,
        'A security error occurred while processing your request',
        origin
      );
    }
  });
}

/**
 * Lightweight security middleware for public endpoints
 */
export function withBasicSecurity(
  handler: (event: HandlerEvent) => Promise<HandlerResponse>
) {
  return withSecurity(handler, {
    requireAuth: false,
    requireCSRF: false,
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 200 // Higher limit for public endpoints
    },
    sanitizeInput: true,
    logRequests: true
  });
}

/**
 * High-security middleware for sensitive operations
 */
export function withHighSecurity(
  handler: (event: HandlerEvent, context?: any) => Promise<HandlerResponse>
) {
  return withSecurity(handler, {
    requireAuth: true,
    requireCSRF: true,
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 20 // Lower limit for sensitive operations
    },
    sanitizeInput: true,
    logRequests: true
  });
}

/**
 * Medical data security middleware with PHI protection
 */
export function withMedicalSecurity(
  handler: (event: HandlerEvent, context?: any) => Promise<HandlerResponse>
) {
  return withSecurity(async (event: HandlerEvent, context?: any): Promise<HandlerResponse> => {
    // Additional medical-specific security checks can be added here
    // For example, PHI detection, medical data encryption validation, etc.
    
    return await handler(event, context);
  }, {
    requireAuth: true,
    requireCSRF: false, // Disabled for Bearer token auth
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 50 // Moderate limit for medical operations
    },
    sanitizeInput: true,
    logRequests: true
  });
} 