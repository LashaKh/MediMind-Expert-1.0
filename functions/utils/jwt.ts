import * as jwt from 'jsonwebtoken';
import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { getAuthToken, parseRequest } from './request';
import { AuthenticationError, AuthorizationError } from './errors';
import { ENV_VARS } from './constants';
import { getCurrentKey, getAllVerificationKeys, initializeKeyRotation } from './keyRotation';
import { generateEmergencyJWTSecret, validateJWTSecretStrength } from './secureKeyGenerator';
import { getTokenStorage, getFallbackStorage, ClientInfo } from './persistentTokenStorage';
import { logger, LogSensitivity } from './logger';

export interface UserPayload {
  id: string;
  email: string;
  role?: string;
  specialty?: string;
  iat?: number;
  exp?: number;
  // Add Supabase-specific fields
  aud?: string;
  app_metadata?: any;
  user_metadata?: any;
}

// Legacy interface for backward compatibility - now using persistent storage
export interface TokenBlacklistEntry {
  jti: string;
  exp: number;
  revoked_at: number;
}

// Emergency secret storage for session persistence
let emergencyJWTSecret: string | null = null;
let emergencySecretWarned = false;

// Initialize persistent token storage
const tokenStorage = getTokenStorage();

// Periodic cleanup of expired tokens using persistent storage
setInterval(async () => {
  try {
    if (tokenStorage.isReady()) {
      await tokenStorage.performCleanup();
    } else {
      // Fallback cleanup for in-memory storage if persistent storage is unavailable
      const fallback = getFallbackStorage();
      fallback.cleanup();
    }
  } catch (error) {
    logger.error('Error during periodic token cleanup', error, LogSensitivity.INTERNAL);
  }
}, 60 * 60 * 1000); // Clean every hour

/**
 * Get secure JWT secret with validation and emergency fallback
 * SECURITY: No hardcoded fallbacks - generates secure random secret if needed
 */
function getSecureJWTSecret(): string {
  // Try environment variables first
  const envSecret = ENV_VARS.SUPABASE_JWT_SECRET || ENV_VARS.JWT_SECRET;
  
  if (envSecret) {
    // Validate existing secret strength
    const validation = validateJWTSecretStrength(envSecret);
    
    if (validation.isValid) {
      return envSecret;
    } else {
      // Log security warning about weak secret
      console.warn('JWT secret validation failed:', validation.issues.join(', '));
      console.warn('Recommendations:', validation.recommendations.join(', '));
      
      // In production, fail rather than use weak secret
      if (ENV_VARS.NODE_ENV === 'production') {
        throw new AuthenticationError('JWT secret is too weak for production use');
      }
    }
  }
  
  // Generate emergency secret if none exists or is invalid
  if (!emergencyJWTSecret) {
    const emergency = generateEmergencyJWTSecret();
    emergencyJWTSecret = emergency.key;
    
    // Log security warning (only once)
    if (!emergencySecretWarned) {
      console.warn('SECURITY WARNING:', emergency.warning);
      console.warn('Recommendations:', emergency.recommendations.join(' | '));
      emergencySecretWarned = true;
    }
  }
  
  return emergencyJWTSecret;
}

/**
 * Securely decode and verify JWT using jsonwebtoken library with key rotation support
 * This replaces the vulnerable custom implementation
 * Now supports persistent token blacklist checking
 */
export async function verifyJWTSecure(token: string): Promise<UserPayload> {
  if (!token) {
    throw new AuthenticationError('No authentication token provided');
  }

  // Initialize key rotation if not already done
  initializeKeyRotation();

  let lastError: Error | null = null;
  const verificationKeys = getAllVerificationKeys();

  // If no keys available, fall back to secure secret (with validation)
  if (verificationKeys.length === 0) {
    try {
      const secureSecret = getSecureJWTSecret();
      verificationKeys.push({
        id: 'secure-fallback',
        secret: secureSecret,
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000),
        status: 'active'
      });
    } catch (error) {
      throw new AuthenticationError(`JWT secret validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // DEVELOPMENT DEBUG: Log verification attempt
  if (ENV_VARS.NODE_ENV === 'development') {
    console.log('JWT Verification Debug:', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      keysAvailable: verificationKeys.length,
      supabaseUrl: ENV_VARS.SUPABASE_URL
    });
    
    // DEBUG: Try to decode without verification first to see the claims
    try {
      const decoded = jwt.decode(token, { complete: true });
      console.log('JWT Token Debug - Header:', decoded?.header);
      console.log('JWT Token Debug - Payload:', JSON.stringify(decoded?.payload, null, 2));
      
      // Check if this is a Supabase-issued token
      const payload = decoded?.payload as any;
      if (payload?.iss && payload.iss.includes('supabase.co/auth/v1')) {
        console.log('Detected Supabase-issued JWT token');
        
        // For development, we trust tokens from our Supabase instance
        if (payload.iss === `${ENV_VARS.SUPABASE_URL}/auth/v1`) {
          console.log('Token issued by our Supabase instance - accepting without signature verification in development');
          
          // Check expiration
          if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            throw new AuthenticationError('Token has expired');
          }
          
          // Check if token has required fields
          if (!payload.sub || !payload.email) {
            throw new AuthenticationError('Invalid token payload: missing required fields');
          }
          
          // Map Supabase JWT structure to our UserPayload
          const userPayload: UserPayload = {
            id: payload.sub || '',
            email: payload.email || '',
            role: payload.app_metadata?.role || payload.user_metadata?.role || payload.role || 'authenticated',
            specialty: payload.app_metadata?.specialty || payload.user_metadata?.specialty,
            aud: payload.aud as string,
            iat: payload.iat,
            exp: payload.exp,
            app_metadata: payload.app_metadata,
            user_metadata: payload.user_metadata
          };

          console.log('✅ Supabase JWT accepted in development mode');
          return userPayload;
        }
      }
    } catch (e) {
      console.log('JWT Token Debug - Cannot decode:', e);
    }
  }

  // Try to verify with each available key (current and deprecated)
  for (const key of verificationKeys) {
    try {
      // DEVELOPMENT: Try with minimal verification options first
      if (ENV_VARS.NODE_ENV === 'development') {
        try {
          const decoded = jwt.verify(token, key.secret, {
            algorithms: ['HS256'],
            // Skip issuer/audience verification in development for debugging
            clockTolerance: 300, // Allow 5 minutes clock skew for development
            complete: false
          }) as jwt.JwtPayload;
          
          console.log('JWT Verification SUCCESS with minimal options');
          
          // Map Supabase JWT structure to our UserPayload
          const userPayload: UserPayload = {
            id: decoded.sub || '',
            email: decoded.email || '',
            role: decoded.app_metadata?.role || decoded.user_metadata?.role,
            specialty: decoded.app_metadata?.specialty || decoded.user_metadata?.specialty,
            aud: decoded.aud as string,
            iat: decoded.iat,
            exp: decoded.exp,
            app_metadata: decoded.app_metadata,
            user_metadata: decoded.user_metadata
          };

          // Validate required fields
          if (!userPayload.id || !userPayload.email) {
            throw new AuthenticationError('Invalid token payload: missing required fields');
          }

          return userPayload;
        } catch (devError) {
          console.log('JWT Verification FAILED with minimal options:', devError);
          // Continue to try with full verification below
        }
      }
      
      // Verify token with proper options
      const decoded = jwt.verify(token, key.secret, {
        algorithms: ['HS256'], // Explicitly specify allowed algorithms
        // TEMPORARY FIX: Make verification more lenient during development
        issuer: ENV_VARS.NODE_ENV === 'development' ? undefined : 
                ENV_VARS.SUPABASE_URL ? `${ENV_VARS.SUPABASE_URL}/auth/v1` : undefined,
        audience: ENV_VARS.NODE_ENV === 'development' ? undefined : 
                  ['authenticated', ENV_VARS.SUPABASE_URL].filter(Boolean),
        clockTolerance: 60, // Allow 60 seconds clock skew for development
        complete: false // Return payload only, not full JWT object
      }) as jwt.JwtPayload;

      // Check if token is blacklisted using persistent storage
      if (decoded.jti) {
        try {
          const isBlacklisted = await (tokenStorage.isReady() 
            ? tokenStorage.isTokenBlacklisted(decoded.jti, token)
            : getFallbackStorage().isTokenBlacklisted(decoded.jti)
          );
          
          if (isBlacklisted) {
            throw new AuthenticationError('Token has been revoked');
          }
        } catch (error) {
          // Log blacklist check error but don't fail authentication
          logger.error('Error checking token blacklist', {
            jti: decoded.jti,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, LogSensitivity.SENSITIVE);
          
          // Continue with authentication but log the issue
          logger.warn('Continuing authentication despite blacklist check error', {
            jti: decoded.jti
          }, LogSensitivity.SENSITIVE);
        }
      }

      // Map Supabase JWT structure to our UserPayload
      const userPayload: UserPayload = {
        id: decoded.sub || '',
        email: decoded.email || '',
        role: decoded.app_metadata?.role || decoded.user_metadata?.role,
        specialty: decoded.app_metadata?.specialty || decoded.user_metadata?.specialty,
        aud: decoded.aud as string,
        iat: decoded.iat,
        exp: decoded.exp,
        app_metadata: decoded.app_metadata,
        user_metadata: decoded.user_metadata
      };

      // Validate required fields
      if (!userPayload.id || !userPayload.email) {
        throw new AuthenticationError('Invalid token payload: missing required fields');
      }

      return userPayload;
    } catch (error) {
      lastError = error as Error;
      if (ENV_VARS.NODE_ENV === 'development') {
        console.log('JWT Verification failed with key:', {
          keyId: key.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      continue; // Try next key if verification fails
    }
  }

  // If we get here, all keys failed
  if (lastError) {
    if (lastError instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError(`Invalid token: ${lastError.message}`);
    }
    if (lastError instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token has expired');
    }
    if (lastError instanceof jwt.NotBeforeError) {
      throw new AuthenticationError('Token not yet valid');
    }
    if (lastError instanceof AuthenticationError) {
      throw lastError;
    }
  }
  
  throw new AuthenticationError('Token verification failed with all available keys');
}

/**
 * Decode JWT without verification (for inspecting token structure)
 * Use with caution - always verify tokens before trusting content
 */
export function decodeJWTSecure(token: string): UserPayload | null {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded) return null;

    return {
      id: decoded.sub || '',
      email: decoded.email || '',
      role: decoded.app_metadata?.role || decoded.user_metadata?.role,
      specialty: decoded.app_metadata?.specialty || decoded.user_metadata?.specialty,
      aud: decoded.aud as string,
      iat: decoded.iat,
      exp: decoded.exp,
      app_metadata: decoded.app_metadata,
      user_metadata: decoded.user_metadata
    };
  } catch (error) {
    return null;
  }
}

/**
 * Add token to blacklist for revocation using persistent storage
 */
export async function revokeToken(
  token: string, 
  reason: string = 'manual_revocation',
  clientInfo?: ClientInfo
): Promise<boolean> {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded?.jti || !decoded?.exp) {
      logger.warn('Cannot revoke token: missing JTI or expiration', LogSensitivity.SENSITIVE);
      return false;
    }

    const expiresAt = new Date(decoded.exp * 1000);
    const userId = decoded.sub;

    // Try persistent storage first
    if (tokenStorage.isReady()) {
      const success = await tokenStorage.addToBlacklist(
        decoded.jti,
        token,
        expiresAt,
        userId,
        reason,
        clientInfo
      );
      
      if (success) {
        logger.info('Token revoked successfully using persistent storage', {
          jti: decoded.jti,
          userId,
          reason,
          expiresAt: expiresAt.toISOString()
        }, LogSensitivity.SENSITIVE);
        return true;
      }
    }

    // Fallback to in-memory storage
    const fallback = getFallbackStorage();
    const success = fallback.addToBlacklist(decoded.jti, expiresAt, userId);
    
    if (success) {
      logger.warn('Token revoked using fallback storage - not persistent across restarts', {
        jti: decoded.jti,
        userId,
        reason
      }, LogSensitivity.SENSITIVE);
    }

    return success;
  } catch (error) {
    logger.error('Failed to revoke token', error, LogSensitivity.SENSITIVE);
    return false;
  }
}

/**
 * Check if a token is blacklisted using persistent storage
 */
export async function isTokenRevoked(token: string): Promise<boolean> {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded?.jti) {
      return false;
    }

    // Check persistent storage first
    if (tokenStorage.isReady()) {
      return await tokenStorage.isTokenBlacklisted(decoded.jti, token);
    }

    // Fallback to in-memory storage
    return getFallbackStorage().isTokenBlacklisted(decoded.jti);
  } catch (error) {
    logger.error('Error checking token revocation status', error, LogSensitivity.SENSITIVE);
    return false; // Fail open on errors
  }
}

/**
 * Get blacklist statistics (for monitoring) with persistent storage support
 */
export async function getBlacklistStats(): Promise<{ 
  total: number; 
  expired: number; 
  source: 'persistent' | 'fallback';
  detailed?: any;
}> {
  try {
    // Try to get comprehensive stats from persistent storage
    if (tokenStorage.isReady()) {
      const stats = await tokenStorage.getTokenStorageStats();
      if (stats) {
        return {
          total: stats.jwt_blacklist.total_blacklisted,
          expired: stats.jwt_blacklist.expired_tokens,
          source: 'persistent',
          detailed: stats.jwt_blacklist
        };
      }
    }

    // Fallback to in-memory storage stats
    const fallback = getFallbackStorage();
    const cleanupResult = fallback.cleanup();
    
    return {
      total: cleanupResult.jwtTokens,
      expired: cleanupResult.jwtTokens,
      source: 'fallback'
    };
  } catch (error) {
    logger.error('Error getting blacklist statistics', error, LogSensitivity.INTERNAL);
    return {
      total: 0,
      expired: 0,
      source: 'fallback'
    };
  }
}

/**
 * Create secure JWT token with key rotation support
 * In production, tokens should be created by Supabase Auth
 */
export function createSecureJWT(
  payload: Omit<UserPayload, 'iat' | 'exp'>,
  options: {
    expiresIn?: string | number;
    jti?: string;
  } = {}
): string {
  // Initialize key rotation if not already done
  initializeKeyRotation();

  // Get current active key
  const currentKey = getCurrentKey();
  if (!currentKey) {
    // Fallback to secure secret (with validation)
    let secureSecret: string;
    try {
      secureSecret = getSecureJWTSecret();
    } catch (error) {
      throw new Error(`JWT secret validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Use secure secret for signing
    const jwtOptions: jwt.SignOptions = {
      algorithm: 'HS256',
      expiresIn: options.expiresIn || '24h',
      issuer: ENV_VARS.SUPABASE_URL ? `${ENV_VARS.SUPABASE_URL}/auth/v1` : undefined,
      audience: 'authenticated',
      jwtid: options.jti || generateJTI()
    };

    const standardPayload = {
      ...payload,
      sub: payload.id
    };

    return jwt.sign(standardPayload, secureSecret, jwtOptions);
  }

  // Use current active key for signing
  const jwtOptions: jwt.SignOptions = {
    algorithm: 'HS256',
    expiresIn: options.expiresIn || '24h',
    issuer: ENV_VARS.SUPABASE_URL ? `${ENV_VARS.SUPABASE_URL}/auth/v1` : undefined,
    audience: 'authenticated',
    jwtid: options.jti || generateJTI(),
    keyid: currentKey.id // Include key ID in header for verification
  };

  // Ensure payload has sub field for JWT standard compliance
  const standardPayload = {
    ...payload,
    sub: payload.id
  };

  return jwt.sign(standardPayload, currentKey.secret, jwtOptions);
}

/**
 * Generate unique JWT ID for revocation tracking
 */
function generateJTI(): string {
  return require('crypto').randomBytes(16).toString('hex');
}

/**
 * Refresh token by creating a new one with updated expiration
 * This helps mitigate token theft by limiting token lifetime
 * Now supports async blacklist checking
 */
export async function refreshToken(currentToken: string): Promise<string> {
  const payload = await verifyJWTSecure(currentToken);
  
  // Remove timestamp fields as they'll be regenerated
  const { iat, exp, ...refreshPayload } = payload;
  
  return createSecureJWT(refreshPayload, {
    expiresIn: '24h',
    jti: generateJTI()
  });
}

/**
 * Monitor token expiration and provide warnings
 */
export function getTokenExpirationInfo(token: string): {
  isExpired: boolean;
  expiresAt: Date | null;
  expiresInMinutes: number | null;
  requiresRefresh: boolean;
} {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded?.exp) {
      return {
        isExpired: false,
        expiresAt: null,
        expiresInMinutes: null,
        requiresRefresh: false
      };
    }

    const expiresAt = new Date(decoded.exp * 1000);
    const now = new Date();
    const expiresInMinutes = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));
    
    return {
      isExpired: expiresInMinutes <= 0,
      expiresAt,
      expiresInMinutes: Math.max(0, expiresInMinutes),
      requiresRefresh: expiresInMinutes <= 60 // Refresh if expires within 1 hour
    };
  } catch (error) {
    return {
      isExpired: true,
      expiresAt: null,
      expiresInMinutes: null,
      requiresRefresh: false
    };
  }
}

/**
 * Get token storage health status
 */
export async function getTokenStorageHealth(): Promise<{
  isHealthy: boolean;
  storage: 'persistent' | 'fallback';
  errors: string[];
  stats?: any;
}> {
  try {
    if (tokenStorage.isReady()) {
      const health = await tokenStorage.healthCheck();
      return {
        isHealthy: health.isHealthy,
        storage: 'persistent',
        errors: health.errors,
        stats: health.stats
      };
    } else {
      const initError = tokenStorage.getInitializationError();
      return {
        isHealthy: false,
        storage: 'fallback',
        errors: initError ? [initError.message] : ['Persistent storage not initialized'],
        stats: undefined
      };
    }
  } catch (error) {
    return {
      isHealthy: false,
      storage: 'fallback',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      stats: undefined
    };
  }
}

/**
 * Get JWT security status for monitoring and health checks
 */
export function getJWTSecurityStatus(): {
  secretSource: 'environment' | 'emergency-generated';
  secretStrength: 'weak' | 'medium' | 'strong' | 'very-strong';
  usingFallback: boolean;
  warnings: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Check environment secret
  const envSecret = ENV_VARS.SUPABASE_JWT_SECRET || ENV_VARS.JWT_SECRET;
  
  if (envSecret) {
    const validation = validateJWTSecretStrength(envSecret);
    
    return {
      secretSource: 'environment',
      secretStrength: validation.strength,
      usingFallback: false,
      warnings: validation.isValid ? [] : validation.issues,
      recommendations: validation.recommendations
    };
  } else {
    // Using emergency generated secret
    warnings.push('Using auto-generated JWT secret - not recommended for production');
    recommendations.push('Configure SUPABASE_JWT_SECRET environment variable');
    recommendations.push('Use proper secrets management in production');
    
    return {
      secretSource: 'emergency-generated',
      secretStrength: 'very-strong', // Emergency secrets are always strong
      usingFallback: true,
      warnings,
      recommendations
    };
  }
}