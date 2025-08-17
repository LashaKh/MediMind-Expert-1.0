/**
 * Standardized JWT authentication utilities for all Netlify functions
 * This replaces inconsistent JWT implementations across functions
 */

import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { verifyJWTSecure, UserPayload } from './jwt';
import { AuthenticationError } from './errors';

/**
 * Extract JWT token from various sources (headers, query params, body)
 */
export function extractToken(event: HandlerEvent): string | null {
  // Check Authorization header (Bearer token)
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check custom auth header
  const customAuth = event.headers['x-auth-token'] || event.headers['X-Auth-Token'];
  if (customAuth) {
    return customAuth;
  }

  // Check query parameters
  if (event.queryStringParameters?.token) {
    return event.queryStringParameters.token;
  }

  // Check body for token (for POST requests)
  if (event.body) {
    try {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      if (body.token) {
        return body.token;
      }
    } catch (error) {
      // Ignore JSON parse errors
    }
  }

  return null;
}

/**
 * Validate and decode JWT token using secure implementation
 */
export function validateToken(token: string): UserPayload {
  try {
    return verifyJWTSecure(token);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError('Token validation failed');
  }
}

/**
 * Create standardized error response with secure CORS headers
 */
export function createErrorResponse(
  statusCode: number, 
  message: string, 
  details?: any,
  origin?: string
): HandlerResponse {
  // Import secure CORS utilities
  const { getCorsHeaders } = require('./cors');
  
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin)
    },
    body: JSON.stringify({
      error: message,
      details: details || null,
      timestamp: new Date().toISOString()
    })
  };
}

/**
 * Create standardized success response with secure CORS headers
 */
export function createSuccessResponse(
  data: any, 
  statusCode: number = 200,
  origin?: string
): HandlerResponse {
  // Import secure CORS utilities
  const { getCorsHeaders } = require('./cors');
  
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin)
    },
    body: JSON.stringify(data)
  };
}

/**
 * Standard authentication middleware for Netlify functions
 */
export function withStandardAuth(handler: (event: HandlerEvent, user: UserPayload) => Promise<HandlerResponse>): Handler {
  return async (event: HandlerEvent): Promise<HandlerResponse> => {
    const origin = event.headers.origin || event.headers.Origin;
    
    // Handle CORS preflight requests with secure validation
    if (event.httpMethod === 'OPTIONS') {
      const { handleCorsPreflightRequest } = require('./cors');
      return handleCorsPreflightRequest(event);
    }

    try {
      // Extract token
      const token = extractToken(event);
      if (!token) {
        return createErrorResponse(401, 'Authentication required: No token provided', null, origin);
      }

      // Validate token
      const user = validateToken(token);
      
      // Call the actual handler with validated user
      const response = await handler(event, user);
      
      // Add secure CORS headers to response
      const { getCorsHeaders } = require('./cors');
      return {
        ...response,
        headers: {
          ...response.headers,
          ...getCorsHeaders(origin)
        }
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return createErrorResponse(401, error.message, null, origin);
      }
      
      console.error('Authentication middleware error:', error);
      return createErrorResponse(500, 'Internal server error during authentication', null, origin);
    }
  };
}

/**
 * Optional authentication middleware (allows requests without auth)
 */
export function withOptionalAuth(
  handler: (event: HandlerEvent, user?: UserPayload) => Promise<HandlerResponse>
): Handler {
  return async (event: HandlerEvent): Promise<HandlerResponse> => {
    const origin = event.headers.origin || event.headers.Origin;
    
    // Handle CORS preflight requests with secure validation
    if (event.httpMethod === 'OPTIONS') {
      const { handleCorsPreflightRequest } = require('./cors');
      return handleCorsPreflightRequest(event);
    }

    try {
      // Try to extract and validate token
      const token = extractToken(event);
      let user: UserPayload | undefined;
      
      if (token) {
        try {
          user = validateToken(token);
        } catch (error) {
          // For optional auth, we continue without user if token is invalid
          console.warn('Optional auth: Invalid token provided', error);
        }
      }
      
      // Call handler with optional user
      const response = await handler(event, user);
      
      // Add secure CORS headers to response
      const { getCorsHeaders } = require('./cors');
      return {
        ...response,
        headers: {
          ...response.headers,
          ...getCorsHeaders(origin)
        }
      };
    } catch (error) {
      console.error('Optional authentication middleware error:', error);
      return createErrorResponse(500, 'Internal server error', null, origin);
    }
  };
}

/**
 * Role-based authentication middleware
 */
export function withRoleAuth(
  requiredRoles: string[],
  handler: (event: HandlerEvent, user: UserPayload) => Promise<HandlerResponse>
): Handler {
  return withStandardAuth(async (event: HandlerEvent, user: UserPayload) => {
    const origin = event.headers.origin || event.headers.Origin;
    
    // Check if user has required role
    if (!user.role || !requiredRoles.includes(user.role)) {
      return createErrorResponse(403, `Access denied. Required roles: ${requiredRoles.join(', ')}`, null, origin);
    }
    
    return await handler(event, user);
  });
}

/**
 * Rate limiting middleware (basic implementation)
 * In production, use a proper rate limiting service
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(
  maxRequests: number,
  windowMs: number,
  handler: Handler
): Handler {
  return async (event: HandlerEvent): Promise<HandlerResponse> => {
    const clientId = event.headers['x-forwarded-for'] || event.headers['X-Forwarded-For'] || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
    
    // Check current client
    const clientData = rateLimitMap.get(clientId);
    if (clientData) {
      if (now < clientData.resetTime) {
        if (clientData.count >= maxRequests) {
          return createErrorResponse(429, 'Rate limit exceeded');
        }
        clientData.count++;
      } else {
        // Reset window
        rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
      }
    } else {
      // New client
      rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
    }
    
    return await handler(event);
  };
}

/**
 * Input validation middleware
 */
export function withValidation<T>(
  validator: (input: any) => T,
  handler: (event: HandlerEvent, validatedInput: T, user?: UserPayload) => Promise<HandlerResponse>
): Handler {
  return async (event: HandlerEvent): Promise<HandlerResponse> => {
    try {
      // Parse input
      let input: any;
      if (event.body) {
        input = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      } else {
        input = event.queryStringParameters || {};
      }
      
      // Validate input
      const validatedInput = validator(input);
      
      // Extract user if token present
      const token = extractToken(event);
      let user: UserPayload | undefined;
      if (token) {
        try {
          user = validateToken(token);
        } catch (error) {
          // Continue without user for validation-only middleware
        }
      }
      
      return await handler(event, validatedInput, user);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return createErrorResponse(400, 'Invalid JSON in request body');
      }
      return createErrorResponse(400, 'Input validation failed', error.message);
    }
  };
}

/**
 * Logging middleware for security events
 */
export function withSecurityLogging(handler: Handler): Handler {
  return async (event: HandlerEvent): Promise<HandlerResponse> => {
    const startTime = Date.now();
    const clientId = event.headers['x-forwarded-for'] || event.headers['X-Forwarded-For'] || 'unknown';
    
    try {
      const response = await handler(event);
      
      // Log security-relevant events
      if (response.statusCode === 401 || response.statusCode === 403) {
        console.log('SECURITY_EVENT', {
          type: 'UNAUTHORIZED_ACCESS',
          timestamp: new Date().toISOString(),
          clientId,
          path: event.path,
          method: event.httpMethod,
          statusCode: response.statusCode,
          duration: Date.now() - startTime
        });
      }
      
      return response;
    } catch (error) {
      console.error('SECURITY_EVENT', {
        type: 'HANDLER_ERROR',
        timestamp: new Date().toISOString(),
        clientId,
        path: event.path,
        method: event.httpMethod,
        error: error.message,
        duration: Date.now() - startTime
      });
      
      throw error;
    }
  };
}