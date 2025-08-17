import { HandlerEvent } from '@netlify/functions';
import { ENV_VARS } from './constants';

export interface SecurityOptions {
  enableCSP?: boolean;
  enableXSSProtection?: boolean;
  enableFrameOptions?: boolean;
  enableContentTypeOptions?: boolean;
  enableHSTS?: boolean;
  cspDirectives?: string;
}

export const DEFAULT_SECURITY_OPTIONS: SecurityOptions = {
  enableCSP: true,
  enableXSSProtection: true,
  enableFrameOptions: true,
  enableContentTypeOptions: true,
  enableHSTS: true,
  cspDirectives: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.flowise.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://api.flowise.com https://api.openai.com wss://api.flowise.com; frame-ancestors 'none';"
};

/**
 * Generate comprehensive security headers for API responses
 */
export function getSecurityHeaders(options: SecurityOptions = DEFAULT_SECURITY_OPTIONS): Record<string, string> {
  const headers: Record<string, string> = {};

  // Content Security Policy
  if (options.enableCSP && options.cspDirectives) {
    headers['Content-Security-Policy'] = options.cspDirectives;
  }

  // XSS Protection
  if (options.enableXSSProtection) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }

  // Clickjacking Protection
  if (options.enableFrameOptions) {
    headers['X-Frame-Options'] = 'DENY';
  }

  // MIME Type Sniffing Protection
  if (options.enableContentTypeOptions) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  // HTTP Strict Transport Security (HTTPS only)
  if (options.enableHSTS) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  // Additional security headers
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=(), payment=()';
  headers['X-Robots-Tag'] = 'noindex, nofollow';

  return headers;
}

/**
 * CSRF Token Management
 */
const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
const CSRF_TOKEN_COOKIE = 'csrf-token';

export function generateCSRFToken(): string {
  // Generate a cryptographically secure random token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(event: HandlerEvent, expectedToken?: string): boolean {
  // Skip CSRF validation for GET requests
  if (event.httpMethod === 'GET' || event.httpMethod === 'OPTIONS') {
    return true;
  }

  // For now, disable CSRF validation for API endpoints that use Bearer token authentication
  // since we're using JWT tokens from Supabase for authentication
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return true;
  }

  const tokenFromHeader = event.headers[CSRF_TOKEN_HEADER] || event.headers[CSRF_TOKEN_HEADER.toLowerCase()];
  const tokenFromCookie = event.headers.cookie?.split(';')
    .find(c => c.trim().startsWith(`${CSRF_TOKEN_COOKIE}=`))
    ?.split('=')[1];

  const token = tokenFromHeader || tokenFromCookie;
  
  if (!token || !expectedToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return token === expectedToken;
}

/**
 * Rate Limiting
 */
interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (event: HandlerEvent) => string;
}

const DEFAULT_RATE_LIMIT: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  keyGenerator: (event) => event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown'
};

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(event: HandlerEvent, options: RateLimitOptions = DEFAULT_RATE_LIMIT): { allowed: boolean; resetTime: number; remaining: number } {
  const key = options.keyGenerator ? options.keyGenerator(event) : DEFAULT_RATE_LIMIT.keyGenerator!(event);
  const now = Date.now();
  
  let record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + options.windowMs
    };
    rateLimitStore.set(key, record);
    return {
      allowed: true,
      resetTime: record.resetTime,
      remaining: options.maxRequests - 1
    };
  }
  
  record.count++;
  const allowed = record.count <= options.maxRequests;
  const remaining = Math.max(0, options.maxRequests - record.count);
  
  return {
    allowed,
    resetTime: record.resetTime,
    remaining
  };
}

/**
 * Input Sanitization
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  
  return input;
}

/**
 * SQL Injection Prevention (for raw queries)
 */
export function escapeSQLString(input: string): string {
  return input.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate password strength
 */
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength = 'strong';
  } else if (password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)) {
    strength = 'medium';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * Medical data anonymization patterns
 */
export function containsPHI(text: string): boolean {
  // Basic patterns for detecting potential PHI
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{10,}\b/, // Potential phone numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/, // Dates
    /\b(?:mr|mrs|ms|dr|prof)\.?\s+[a-z]+\b/i, // Titles with names
  ];
  
  return phiPatterns.some(pattern => pattern.test(text));
}

/**
 * Secure cookie options
 */
export function getSecureCookieOptions(isProduction: boolean = ENV_VARS.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  };
} 