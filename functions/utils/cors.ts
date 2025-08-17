/**
 * Secure CORS configuration for MediMind Expert
 * Addresses CRIT-005: Insecure CORS Configuration security vulnerability
 * Implements OWASP CORS Security Cheat Sheet recommendations
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ENV_VARS } from './constants';
import { successResponse } from './response';

export interface CorsOptions {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  credentials?: boolean;
  maxAge?: number;
}

// Environment-aware secure origins configuration
const SECURE_ORIGINS = {
  production: [
    'https://medimindexpert.netlify.app',
    'https://www.medimindexpert.netlify.app'
  ],
  development: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8888',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8888'
  ],
  staging: [
    // Add staging URLs when available
  ]
} as const;

// Get current environment
function getCurrentEnvironment(): 'production' | 'development' | 'staging' {
  const netlifyContext = process.env.CONTEXT;
  const nodeEnv = process.env.NODE_ENV;
  
  if (netlifyContext === 'production' || nodeEnv === 'production') {
    return 'production';
  }
  
  if (netlifyContext === 'branch-deploy' || netlifyContext === 'deploy-preview') {
    return 'staging';
  }
  
  return 'development';
}

// Get secure origins for current environment
function getSecureOrigins(): string[] {
  const env = getCurrentEnvironment();
  const envOrigins = SECURE_ORIGINS[env];
  
  // Always include development origins in non-production environments
  if (env !== 'production') {
    return [...envOrigins, ...SECURE_ORIGINS.development];
  }
  
  return envOrigins;
}

export const DEFAULT_CORS_OPTIONS: CorsOptions = {
  allowedOrigins: getSecureOrigins(),
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token', 'X-CSRF-Token', 'X-Requested-With'],
  credentials: true,
  maxAge: 3600 // 1 hour cache for security
};

/**
 * Validate origin against whitelist - SECURE VERSION
 */
export function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) {
    // Allow requests without origin header (server-to-server, mobile apps)
    return true;
  }
  
  // Exact match validation - NO wildcards or fallbacks
  const isAllowed = allowedOrigins.includes(origin);
  
  // Log security events for monitoring
  if (!isAllowed) {
    console.log('SECURITY_EVENT', {
      type: 'CORS_VIOLATION',
      timestamp: new Date().toISOString(),
      origin: origin,
      environment: getCurrentEnvironment(),
      allowedOrigins: allowedOrigins
    });
  }
  
  return isAllowed;
}

/**
 * Get secure CORS headers - NO fallback to wildcards
 */
export function getCorsHeaders(
  origin: string | undefined,
  options: CorsOptions = DEFAULT_CORS_OPTIONS
): Record<string, string> {
  const headers: Record<string, string> = {};

  // SECURITY FIX: Only set origin if it's explicitly allowed
  if (origin && isOriginAllowed(origin, options.allowedOrigins)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (!origin) {
    // For requests without origin header, don't set the header
    // This allows server-to-server requests but blocks unauthorized browser requests
  } else {
    // Explicitly deny unauthorized origins by not setting the header
    console.warn('CORS: Unauthorized origin denied', { origin, allowedOrigins: options.allowedOrigins });
    return headers; // Return empty headers to deny access
  }

  headers['Access-Control-Allow-Methods'] = options.allowedMethods.join(', ');
  headers['Access-Control-Allow-Headers'] = options.allowedHeaders.join(', ');
  headers['Vary'] = 'Origin'; // Important for proper caching
  
  if (options.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  if (options.maxAge) {
    headers['Access-Control-Max-Age'] = options.maxAge.toString();
  }

  return headers;
}

/**
 * Handle CORS preflight requests securely
 */
export function handleCorsPreflightRequest(
  event: HandlerEvent,
  options: CorsOptions = DEFAULT_CORS_OPTIONS
): HandlerResponse {
  const origin = event.headers.origin || event.headers.Origin;
  const requestMethod = event.headers['access-control-request-method'];
  const requestHeaders = event.headers['access-control-request-headers'];
  
  // SECURITY: Validate origin first
  if (origin && !isOriginAllowed(origin, options.allowedOrigins)) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'CORS policy violation',
        message: 'Origin not allowed'
      })
    };
  }
  
  // SECURITY: Validate requested method
  if (requestMethod && !options.allowedMethods.includes(requestMethod.toUpperCase())) {
    return {
      statusCode: 405,
      headers: getCorsHeaders(origin, options),
      body: JSON.stringify({
        error: 'Method not allowed',
        allowedMethods: options.allowedMethods
      })
    };
  }
  
  // SECURITY: Validate requested headers
  if (requestHeaders) {
    const requestedHeaders = requestHeaders.toLowerCase().split(',').map(h => h.trim());
    const unauthorizedHeaders = requestedHeaders.filter(h => 
      !options.allowedHeaders.map(ah => ah.toLowerCase()).includes(h)
    );
    
    if (unauthorizedHeaders.length > 0) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(origin, options),
        body: JSON.stringify({
          error: 'Unauthorized headers requested',
          unauthorizedHeaders,
          allowedHeaders: options.allowedHeaders
        })
      };
    }
  }

  const corsHeaders = getCorsHeaders(origin, options);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: ''
  };
}

/**
 * Secure CORS middleware wrapper
 */
export function withCors<T>(
  handler: (event: HandlerEvent) => Promise<HandlerResponse>,
  options: CorsOptions = DEFAULT_CORS_OPTIONS
) {
  return async (event: HandlerEvent): Promise<HandlerResponse> => {
    const origin = event.headers.origin || event.headers.Origin;
    
    // Handle preflight requests with security validation
    if (event.httpMethod === 'OPTIONS') {
      return handleCorsPreflightRequest(event, options);
    }

    // SECURITY: Validate origin for all requests
    if (origin && !isOriginAllowed(origin, options.allowedOrigins)) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'CORS policy violation',
          message: 'Origin not allowed for this resource'
        })
      };
    }

    try {
      // Execute the main handler
      const response = await handler(event);
      
      // Add secure CORS headers to the response
      const corsHeaders = getCorsHeaders(origin, options);
      
      return {
        ...response,
        headers: {
          ...response.headers,
          ...corsHeaders
        }
      };
    } catch (error) {
      // Handle errors with secure CORS headers
      const corsHeaders = getCorsHeaders(origin, options);
      
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify({
          success: false,
          error: 'Internal server error',
          statusCode: 500,
          timestamp: new Date().toISOString()
        })
      };
    }
  };
}

/**
 * Get environment debug info for troubleshooting
 */
export function getCorsDebugInfo() {
  return {
    environment: getCurrentEnvironment(),
    allowedOrigins: getSecureOrigins(),
    netlifyContext: process.env.CONTEXT,
    nodeEnv: process.env.NODE_ENV
  };
}

// Export simple headers for functions that need basic CORS
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Vary': 'Origin'
}; 