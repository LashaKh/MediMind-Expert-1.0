/**
 * Rate Limiting Utility for Netlify Functions
 * Implements intelligent rate limiting with medical professional considerations
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { logInfo, logWarning, logError } from './logger';
import { createErrorResponse } from './response';

interface RateLimitConfig {
  windowMs: number;          // Time window in milliseconds
  maxRequests: number;       // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (event: HandlerEvent) => string;
  onLimitReached?: (key: string, event: HandlerEvent) => void;
  medicalProfessionalBonus?: number; // Additional requests for verified medical professionals
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
  userType?: 'medical_professional' | 'standard' | 'admin';
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Medical professional rate limit configurations
const RATE_LIMIT_CONFIGS = {
  // Search API - generous limits for medical professionals
  search: {
    standard: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 per minute
    medical_professional: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute
    admin: { windowMs: 60 * 1000, maxRequests: 200 } // 200 per minute
  },
  
  // Document upload - moderate limits due to processing costs
  document: {
    standard: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
    medical_professional: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 per minute
    admin: { windowMs: 60 * 1000, maxRequests: 50 } // 50 per minute
  },
  
  // AI chat - balanced limits for conversational flow
  chat: {
    standard: { windowMs: 60 * 1000, maxRequests: 50 }, // 50 per minute
    medical_professional: { windowMs: 60 * 1000, maxRequests: 150 }, // 150 per minute
    admin: { windowMs: 60 * 1000, maxRequests: 300 } // 300 per minute
  },
  
  // Calculator API - high limits as calculations are lightweight
  calculator: {
    standard: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 per minute
    medical_professional: { windowMs: 60 * 1000, maxRequests: 500 }, // 500 per minute
    admin: { windowMs: 60 * 1000, maxRequests: 1000 } // 1000 per minute
  }
};

// Default key generator - combines IP and user ID if available
function defaultKeyGenerator(event: HandlerEvent): string {
  const ip = event.headers['x-forwarded-for'] || 
            event.headers['x-real-ip'] || 
            event.requestContext?.identity?.sourceIp || 
            'unknown';
  
  // Try to extract user ID from Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;
  let userId = 'anonymous';
  
  if (authHeader) {
    try {
      // Basic JWT parsing without verification (just for rate limiting key)
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userId = payload.sub || payload.id || 'authenticated';
    } catch {
      userId = 'authenticated';
    }
  }
  
  return `${ip}:${userId}`;
}

// Determine user type from JWT token
function getUserType(event: HandlerEvent): 'medical_professional' | 'standard' | 'admin' {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  
  if (!authHeader) {
    return 'standard';
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    // Check for admin role
    if (payload.role === 'admin' || payload.user_metadata?.role === 'admin') {
      return 'admin';
    }
    
    // Check for medical professional indicators
    const specialty = payload.specialty || payload.user_metadata?.medical_specialty;
    const role = payload.role || payload.user_metadata?.role;
    
    if (specialty || role === 'doctor' || role === 'medical_professional') {
      return 'medical_professional';
    }
    
    return 'standard';
  } catch {
    return 'standard';
  }
}

// Clean up expired entries
function cleanupExpiredEntries(): void {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    logInfo('Rate limit cleanup', { 
      cleanedEntries: cleanedCount, 
      remainingEntries: rateLimitStore.size 
    });
  }
}

// Get or create rate limit entry
function getRateLimitEntry(key: string, windowMs: number, userType: string): RateLimitEntry {
  const now = Date.now();
  const existing = rateLimitStore.get(key);
  
  if (existing && now < existing.resetTime) {
    return existing;
  }
  
  // Create new entry
  const newEntry: RateLimitEntry = {
    count: 0,
    resetTime: now + windowMs,
    firstRequest: now,
    userType: userType as any
  };
  
  rateLimitStore.set(key, newEntry);
  return newEntry;
}

// Check if request should be rate limited
function shouldRateLimit(
  key: string, 
  config: RateLimitConfig, 
  userType: 'medical_professional' | 'standard' | 'admin'
): { limited: boolean; entry: RateLimitEntry; resetTime: number } {
  const entry = getRateLimitEntry(key, config.windowMs, userType);
  const now = Date.now();
  
  // Reset if window has expired
  if (now >= entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + config.windowMs;  
    entry.firstRequest = now;
  }
  
  // Determine effective limit based on user type
  let effectiveLimit = config.maxRequests;
  if (config.medicalProfessionalBonus && userType === 'medical_professional') {
    effectiveLimit += config.medicalProfessionalBonus;
  } else if (userType === 'admin') {
    effectiveLimit *= 2; // Admins get 2x limits
  }
  
  const limited = entry.count >= effectiveLimit;
  
  return {
    limited,
    entry,
    resetTime: entry.resetTime
  };
}

// Create rate limit headers
function createRateLimitHeaders(
  entry: RateLimitEntry, 
  limit: number, 
  resetTime: number
): Record<string, string> {
  const remaining = Math.max(0, limit - entry.count);
  const resetTimeSeconds = Math.ceil(resetTime / 1000);
  
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTimeSeconds.toString(),
    'X-RateLimit-Window': '60', // 1 minute windows
    'X-RateLimit-Policy': 'medical-professional-aware'
  };
}

// Main rate limiting middleware factory
export function createRateLimit(configType: keyof typeof RATE_LIMIT_CONFIGS) {
  return function rateLimitMiddleware(
    handler: (event: HandlerEvent, context: any) => Promise<HandlerResponse>
  ) {
    return async (event: HandlerEvent, context: any): Promise<HandlerResponse> => {
      try {
        // Clean up expired entries periodically
        if (Math.random() < 0.1) { // 10% chance
          cleanupExpiredEntries();
        }
        
        const userType = getUserType(event);
        const rateLimitConfig = RATE_LIMIT_CONFIGS[configType][userType];
        
        const config: RateLimitConfig = {
          windowMs: rateLimitConfig.windowMs,
          maxRequests: rateLimitConfig.maxRequests,
          keyGenerator: defaultKeyGenerator,
          medicalProfessionalBonus: userType === 'medical_professional' ? 50 : 0
        };
        
        const key = config.keyGenerator!(event);
        const { limited, entry, resetTime } = shouldRateLimit(key, config, userType);
        
        if (limited) {
          const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
          
          logWarning('Rate limit exceeded', {
            key: key.substring(0, 20) + '...', // Partial key for privacy
            userType,
            count: entry.count,
            limit: config.maxRequests,
            resetTime: new Date(resetTime).toISOString(),
            function: event.path,
            retryAfter
          });
          
          if (config.onLimitReached) {
            config.onLimitReached(key, event);
          }
          
          const headers = {
            ...createRateLimitHeaders(entry, config.maxRequests, resetTime),
            'Retry-After': retryAfter.toString(),
            'Content-Type': 'application/json'
          };
          
          return {
            statusCode: 429,
            headers,
            body: JSON.stringify({
              error: 'Rate limit exceeded',
              message: `Too many requests. Please try again in ${retryAfter} seconds.`,
              retryAfter: retryAfter,
              userType: userType,
              limit: config.maxRequests,
              resetTime: new Date(resetTime).toISOString()
            })
          };
        }
        
        // Increment counter
        entry.count++;
        
        // Execute the handler
        const response = await handler(event, context);
        
        // Add rate limit headers to successful responses
        const rateLimitHeaders = createRateLimitHeaders(entry, config.maxRequests, resetTime);
        
        return {
          ...response,
          headers: {
            ...response.headers,
            ...rateLimitHeaders
          }
        };
        
      } catch (error) {
        logError('Rate limiting error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          path: event.path,
          method: event.httpMethod
        });
        
        // On rate limiting errors, allow the request through
        return handler(event, context);
      }
    };
  };
}

// Specialized rate limiters for different function types
export const searchRateLimit = createRateLimit('search');
export const documentRateLimit = createRateLimit('document'); 
export const chatRateLimit = createRateLimit('chat');
export const calculatorRateLimit = createRateLimit('calculator');

// Manual rate limit check (for internal use)
export function checkRateLimit(
  event: HandlerEvent, 
  configType: keyof typeof RATE_LIMIT_CONFIGS
): { allowed: boolean; remaining: number; resetTime: number } {
  const userType = getUserType(event);
  const rateLimitConfig = RATE_LIMIT_CONFIGS[configType][userType];
  
  const config: RateLimitConfig = {
    windowMs: rateLimitConfig.windowMs,
    maxRequests: rateLimitConfig.maxRequests,
    keyGenerator: defaultKeyGenerator
  };
  
  const key = config.keyGenerator!(event);
  const { limited, entry, resetTime } = shouldRateLimit(key, config, userType);
  
  return {
    allowed: !limited,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime
  };
}

// Get current rate limit status
export function getRateLimitStatus(event: HandlerEvent): {
  search: { remaining: number; resetTime: number };
  document: { remaining: number; resetTime: number };
  chat: { remaining: number; resetTime: number };
  calculator: { remaining: number; resetTime: number };
} {
  const userType = getUserType(event);
  const key = defaultKeyGenerator(event);
  
  const getStatus = (configType: keyof typeof RATE_LIMIT_CONFIGS) => {
    const rateLimitConfig = RATE_LIMIT_CONFIGS[configType][userType];
    const entry = rateLimitStore.get(key);
    
    if (!entry || Date.now() >= entry.resetTime) {
      return {
        remaining: rateLimitConfig.maxRequests,
        resetTime: Date.now() + rateLimitConfig.windowMs
      };
    }
    
    return {
      remaining: Math.max(0, rateLimitConfig.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  };
  
  return {
    search: getStatus('search'),
    document: getStatus('document'), 
    chat: getStatus('chat'),
    calculator: getStatus('calculator')
  };
}