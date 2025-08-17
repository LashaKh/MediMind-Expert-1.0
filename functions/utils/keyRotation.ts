import * as crypto from 'crypto';
import { ENV_VARS } from './constants';
import { generateSecureJWTSecret, validateJWTSecretStrength } from './secureKeyGenerator';

export interface KeyRotationConfig {
  currentKeyId: string;
  previousKeyId?: string;
  rotationSchedule: number; // in milliseconds
  lastRotation: number;
  nextRotation: number;
}

export interface JWTKey {
  id: string;
  secret: string;
  createdAt: number;
  expiresAt: number;
  status: 'active' | 'deprecated' | 'revoked';
}

// In-memory key store (in production, use secure key management service)
const keyStore = new Map<string, JWTKey>();
let rotationConfig: KeyRotationConfig;

/**
 * Initialize key rotation system with secure key validation
 */
export function initializeKeyRotation(): void {
  const rotationInterval = 7 * 24 * 60 * 60 * 1000; // 7 days
  const now = Date.now();

  // Try to get secure key from environment
  const envSecret = ENV_VARS.SUPABASE_JWT_SECRET || ENV_VARS.JWT_SECRET;
  let currentSecret: string;
  let isEmergencyKey = false;

  if (envSecret) {
    // Validate existing secret strength
    const validation = validateJWTSecretStrength(envSecret);
    
    if (validation.isValid) {
      currentSecret = envSecret;
    } else {
      console.warn('Environment JWT secret failed validation:', validation.issues.join(', '));
      
      // In production, fail rather than use weak secret
      if (ENV_VARS.NODE_ENV === 'production') {
        throw new Error('JWT secret is too weak for production use');
      }
      
      // Generate emergency key for development
      const emergencyKey = generateSecureJWTSecret({ length: 64, encoding: 'base64' });
      currentSecret = emergencyKey.key;
      isEmergencyKey = true;
      
      console.warn('Using emergency generated key due to weak environment secret');
    }
  } else {
    // No environment secret - generate emergency key
    const emergencyKey = generateSecureJWTSecret({ 
      length: 64, 
      encoding: 'base64',
      includeEnvironmentSeed: true 
    });
    currentSecret = emergencyKey.key;
    isEmergencyKey = true;
    
    if (ENV_VARS.NODE_ENV === 'production') {
      console.error('CRITICAL: No JWT secret configured in production environment');
      console.error('Configure SUPABASE_JWT_SECRET environment variable immediately');
    } else {
      console.warn('No JWT secret configured - using emergency generated key');
    }
  }

  // Create key ID (different approach for emergency keys)
  const keyIdPrefix = isEmergencyKey ? 'emergency-' : 'env-';
  const currentKeyId = keyIdPrefix + crypto.createHash('sha256').update(currentSecret).digest('hex').slice(0, 8);
  
  keyStore.set(currentKeyId, {
    id: currentKeyId,
    secret: currentSecret,
    createdAt: now,
    expiresAt: now + rotationInterval,
    status: 'active'
  });

  rotationConfig = {
    currentKeyId,
    rotationSchedule: rotationInterval,
    lastRotation: now,
    nextRotation: now + rotationInterval
  };
}

/**
 * Generate a new secure key using our secure key generator
 */
function generateSecureKey(): string {
  const keyInfo = generateSecureJWTSecret({ 
    length: 64, 
    encoding: 'base64',
    includeEnvironmentSeed: true,
    includeTimestamp: true
  });
  return keyInfo.key;
}

/**
 * Generate unique key ID
 */
function generateKeyId(): string {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Rotate JWT signing key
 */
export function rotateJWTKey(): { newKeyId: string; deprecatedKeyId?: string } {
  if (!rotationConfig) {
    initializeKeyRotation();
  }

  const now = Date.now();
  const newKeyId = generateKeyId();
  const newSecret = generateSecureKey();
  const rotationInterval = rotationConfig.rotationSchedule;

  // Create new key
  keyStore.set(newKeyId, {
    id: newKeyId,
    secret: newSecret,
    createdAt: now,
    expiresAt: now + rotationInterval,
    status: 'active'
  });

  // Deprecate current key (keep it for verification of existing tokens)
  const previousKeyId = rotationConfig.currentKeyId;
  const previousKey = keyStore.get(previousKeyId);
  if (previousKey) {
    previousKey.status = 'deprecated';
    // Set expiration to allow existing tokens to remain valid
    previousKey.expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours grace period
  }

  // Revoke old deprecated key if exists
  let revokedKeyId: string | undefined;
  if (rotationConfig.previousKeyId) {
    const oldKey = keyStore.get(rotationConfig.previousKeyId);
    if (oldKey) {
      oldKey.status = 'revoked';
      revokedKeyId = oldKey.id;
    }
  }

  // Update rotation config
  rotationConfig = {
    currentKeyId: newKeyId,
    previousKeyId,
    rotationSchedule: rotationInterval,
    lastRotation: now,
    nextRotation: now + rotationInterval
  };

  // Clean up revoked keys older than 30 days
  cleanupOldKeys();

  return { newKeyId, deprecatedKeyId: previousKeyId };
}

/**
 * Get current active key for signing
 */
export function getCurrentKey(): JWTKey | null {
  if (!rotationConfig) {
    initializeKeyRotation();
  }

  return keyStore.get(rotationConfig.currentKeyId) || null;
}

/**
 * Get key for verification (includes current and deprecated keys)
 */
export function getVerificationKey(keyId?: string): JWTKey | null {
  if (!rotationConfig) {
    initializeKeyRotation();
  }

  // If no keyId provided, use current key
  if (!keyId) {
    return getCurrentKey();
  }

  const key = keyStore.get(keyId);
  
  // Only return active or deprecated keys for verification
  if (key && (key.status === 'active' || key.status === 'deprecated')) {
    return key;
  }

  return null;
}

/**
 * Get all available keys for verification
 */
export function getAllVerificationKeys(): JWTKey[] {
  return Array.from(keyStore.values()).filter(
    key => key.status === 'active' || key.status === 'deprecated'
  );
}

/**
 * Check if key rotation is needed
 */
export function shouldRotateKey(): boolean {
  if (!rotationConfig) {
    return false;
  }

  return Date.now() >= rotationConfig.nextRotation;
}

/**
 * Schedule automatic key rotation
 */
export function scheduleKeyRotation(): void {
  if (!rotationConfig) {
    initializeKeyRotation();
  }

  // Check every hour if rotation is needed
  setInterval(() => {
    if (shouldRotateKey()) {
      const result = rotateJWTKey();
      console.log(`JWT key rotated: new key ${result.newKeyId}, deprecated key ${result.deprecatedKeyId}`);
      
      // Log security event
      console.log('JWT_KEY_ROTATION', {
        timestamp: new Date().toISOString(),
        newKeyId: result.newKeyId,
        deprecatedKeyId: result.deprecatedKeyId,
        nextRotation: new Date(rotationConfig.nextRotation).toISOString()
      });
    }
  }, 60 * 60 * 1000); // Check every hour
}

/**
 * Clean up old revoked keys
 */
function cleanupOldKeys(): void {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  for (const [keyId, key] of keyStore.entries()) {
    if (key.status === 'revoked' && key.expiresAt < thirtyDaysAgo) {
      keyStore.delete(keyId);
    }
  }
}

/**
 * Get key rotation status and statistics
 */
export function getKeyRotationStatus(): {
  currentKeyId: string;
  previousKeyId?: string;
  totalKeys: number;
  activeKeys: number;
  deprecatedKeys: number;
  revokedKeys: number;
  lastRotation: Date;
  nextRotation: Date;
  rotationOverdue: boolean;
} {
  if (!rotationConfig) {
    initializeKeyRotation();
  }

  const keys = Array.from(keyStore.values());
  const now = Date.now();

  return {
    currentKeyId: rotationConfig.currentKeyId,
    previousKeyId: rotationConfig.previousKeyId,
    totalKeys: keys.length,
    activeKeys: keys.filter(k => k.status === 'active').length,
    deprecatedKeys: keys.filter(k => k.status === 'deprecated').length,
    revokedKeys: keys.filter(k => k.status === 'revoked').length,
    lastRotation: new Date(rotationConfig.lastRotation),
    nextRotation: new Date(rotationConfig.nextRotation),
    rotationOverdue: now > rotationConfig.nextRotation
  };
}

/**
 * Force key rotation (for emergency situations)
 */
export function forceKeyRotation(reason: string): { newKeyId: string; reason: string } {
  const result = rotateJWTKey();
  
  console.log('EMERGENCY_KEY_ROTATION', {
    timestamp: new Date().toISOString(),
    reason,
    newKeyId: result.newKeyId,
    deprecatedKeyId: result.deprecatedKeyId
  });

  return {
    newKeyId: result.newKeyId,
    reason
  };
}

/**
 * Generate emergency key for critical situations
 */
export function generateEmergencyKey(reason: string): { keyId: string; reason: string; warnings: string[] } {
  const warnings: string[] = [];
  const now = Date.now();
  const emergencyKeyId = 'emergency-' + generateKeyId();
  
  // Generate highly secure emergency key
  const emergencySecret = generateSecureKey();
  
  keyStore.set(emergencyKeyId, {
    id: emergencyKeyId,
    secret: emergencySecret,
    createdAt: now,
    expiresAt: now + (24 * 60 * 60 * 1000), // 24 hours
    status: 'active'
  });

  // Update rotation config if none exists
  if (!rotationConfig) {
    rotationConfig = {
      currentKeyId: emergencyKeyId,
      rotationSchedule: 7 * 24 * 60 * 60 * 1000,
      lastRotation: now,
      nextRotation: now + (7 * 24 * 60 * 60 * 1000)
    };
  }

  warnings.push('Emergency key generated - replace with proper environment configuration');
  warnings.push('Emergency keys expire in 24 hours');
  
  console.log('EMERGENCY_KEY_GENERATED', {
    timestamp: new Date().toISOString(),
    reason,
    keyId: emergencyKeyId,
    expiresAt: new Date(now + (24 * 60 * 60 * 1000)).toISOString()
  });

  return {
    keyId: emergencyKeyId,
    reason,
    warnings
  };
}

/**
 * Validate key configuration with enhanced security checks
 */
export function validateKeyConfiguration(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  securityLevel: 'secure' | 'degraded' | 'critical';
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!rotationConfig) {
    errors.push('Key rotation not initialized');
    return { isValid: false, errors, warnings, securityLevel: 'critical' };
  }

  const currentKey = getCurrentKey();
  if (!currentKey) {
    errors.push('No current active key found');
  }

  // Check environment configuration
  const envSecret = ENV_VARS.SUPABASE_JWT_SECRET || ENV_VARS.JWT_SECRET;
  let hasSecureEnvSecret = false;
  
  if (envSecret) {
    const validation = validateJWTSecretStrength(envSecret);
    if (validation.isValid) {
      hasSecureEnvSecret = true;
    } else {
      warnings.push('Environment JWT secret is weak');
      warnings.push(...validation.issues);
    }
  } else {
    warnings.push('No JWT secret configured in environment - using generated keys');
  }

  // Check for emergency keys
  const keys = Array.from(keyStore.values());
  const emergencyKeys = keys.filter(k => k.id.startsWith('emergency-'));
  if (emergencyKeys.length > 0) {
    warnings.push(`${emergencyKeys.length} emergency keys in use - configure proper secrets`);
  }

  // Check key rotation schedule
  const now = Date.now();
  if (rotationConfig.nextRotation < now) {
    warnings.push('Key rotation is overdue');
  }

  if (rotationConfig.rotationSchedule < 24 * 60 * 60 * 1000) {
    warnings.push('Key rotation schedule is less than 24 hours (not recommended)');
  }

  // Check for expired keys
  const expiredKeys = keys.filter(k => k.expiresAt < now && k.status !== 'revoked');
  if (expiredKeys.length > 0) {
    warnings.push(`${expiredKeys.length} keys are expired but not revoked`);
  }

  // Determine security level
  let securityLevel: 'secure' | 'degraded' | 'critical' = 'secure';
  
  if (errors.length > 0) {
    securityLevel = 'critical';
  } else if (!hasSecureEnvSecret || emergencyKeys.length > 0 || warnings.length > 0) {
    securityLevel = 'degraded';
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    securityLevel
  };
}

// Initialize key rotation on module load
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  scheduleKeyRotation();
}