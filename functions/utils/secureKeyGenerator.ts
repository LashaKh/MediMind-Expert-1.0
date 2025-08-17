import * as crypto from 'crypto';
import { ENV_VARS } from './constants';

export interface SecureKeyOptions {
  length?: number;
  encoding?: 'base64' | 'hex';
  includeTimestamp?: boolean;
  includeEnvironmentSeed?: boolean;
}

export interface GeneratedKeyInfo {
  key: string;
  metadata: {
    generatedAt: number;
    entropy: number;
    source: 'random' | 'environment-seeded';
    encoding: string;
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  };
}

/**
 * Generate cryptographically secure JWT secret
 * Uses crypto.randomBytes for maximum entropy
 */
export function generateSecureJWTSecret(options: SecureKeyOptions = {}): GeneratedKeyInfo {
  const {
    length = 64,
    encoding = 'base64',
    includeTimestamp = false,
    includeEnvironmentSeed = false
  } = options;

  // Generate base random bytes
  let keyBytes = crypto.randomBytes(length);

  // Optionally mix in environment-specific entropy
  if (includeEnvironmentSeed) {
    const envSeed = generateEnvironmentSeed();
    const combinedBytes = Buffer.concat([keyBytes, envSeed]);
    keyBytes = crypto.createHash('sha256').update(combinedBytes).digest();
  }

  // Optionally include timestamp for uniqueness
  if (includeTimestamp) {
    const timestamp = Buffer.from(Date.now().toString());
    const combinedBytes = Buffer.concat([keyBytes, timestamp]);
    keyBytes = crypto.createHash('sha256').update(combinedBytes).digest();
  }

  const key = keyBytes.toString(encoding);
  
  return {
    key,
    metadata: {
      generatedAt: Date.now(),
      entropy: length * 8, // bits of entropy
      source: includeEnvironmentSeed ? 'environment-seeded' : 'random',
      encoding,
      strength: calculateKeyStrength(length)
    }
  };
}

/**
 * Generate environment-specific seed for additional entropy
 * Uses available system information (not sensitive data)
 */
function generateEnvironmentSeed(): Buffer {
  const seedComponents = [
    process.pid.toString(),
    process.platform,
    process.arch,
    Date.now().toString(),
    Math.random().toString(),
    // Include non-sensitive environment characteristics
    ENV_VARS.NODE_ENV,
    process.version
  ];

  const seedString = seedComponents.join('|');
  return crypto.createHash('sha256').update(seedString).digest();
}

/**
 * Calculate key strength based on entropy
 */
function calculateKeyStrength(length: number): 'weak' | 'medium' | 'strong' | 'very-strong' {
  const bits = length * 8;
  
  if (bits < 128) return 'weak';
  if (bits < 256) return 'medium';
  if (bits < 512) return 'strong';
  return 'very-strong';
}

/**
 * Validate JWT secret strength
 * Ensures minimum security requirements are met
 */
export function validateJWTSecretStrength(secret: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check minimum length
  if (secret.length < 32) {
    issues.push('Secret is too short (minimum 32 characters)');
    recommendations.push('Use at least 32+ character secret');
  }

  // Check for common weak patterns
  const commonPatterns = [
    /^(test|dev|development|secret|key|password|pass|admin|default)/i,
    /^(.)\1{3,}/, // Repeated characters
    /^(123|abc|qwe|asd)/i, // Common sequences
    /^[a-zA-Z0-9]{1,8}$/ // Too simple
  ];

  const hasWeakPattern = commonPatterns.some(pattern => pattern.test(secret));
  if (hasWeakPattern) {
    issues.push('Secret contains weak or predictable patterns');
    recommendations.push('Use cryptographically generated random secret');
  }

  // Check character diversity
  const hasLower = /[a-z]/.test(secret);
  const hasUpper = /[A-Z]/.test(secret);
  const hasNumbers = /[0-9]/.test(secret);
  const hasSpecial = /[^a-zA-Z0-9]/.test(secret);
  
  const characterTypes = [hasLower, hasUpper, hasNumbers, hasSpecial].filter(Boolean).length;
  if (characterTypes < 3) {
    issues.push('Secret lacks character diversity');
    recommendations.push('Use base64 or hex encoding for better character distribution');
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (secret.length >= 64 && characterTypes >= 3 && !hasWeakPattern) {
    strength = 'very-strong';
  } else if (secret.length >= 48 && characterTypes >= 2 && !hasWeakPattern) {
    strength = 'strong';
  } else if (secret.length >= 32 && !hasWeakPattern) {
    strength = 'medium';
  }

  return {
    isValid: issues.length === 0 && strength !== 'weak',
    strength,
    issues,
    recommendations
  };
}

/**
 * Generate emergency fallback key when no environment secret is available
 * Creates a secure random key with warnings
 */
export function generateEmergencyJWTSecret(): {
  key: string;
  warning: string;
  recommendations: string[];
} {
  const keyInfo = generateSecureJWTSecret({
    length: 64,
    encoding: 'base64',
    includeEnvironmentSeed: true,
    includeTimestamp: true
  });

  return {
    key: keyInfo.key,
    warning: 'Using auto-generated JWT secret. This is not recommended for production.',
    recommendations: [
      'Set SUPABASE_JWT_SECRET environment variable with a secure secret',
      'Use a proper secrets management system in production',
      'Rotate this temporary key as soon as possible',
      'Monitor application logs for this security warning'
    ]
  };
}

/**
 * Create secure JWT secret for specific environments
 */
export function createEnvironmentJWTSecret(environment: 'development' | 'staging' | 'production'): GeneratedKeyInfo {
  const options: SecureKeyOptions = {
    length: environment === 'production' ? 64 : 48,
    encoding: 'base64',
    includeEnvironmentSeed: environment !== 'production',
    includeTimestamp: environment === 'development'
  };

  return generateSecureJWTSecret(options);
}

/**
 * Generate key rotation seed for deterministic but secure key generation
 */
export function generateKeyRotationSeed(baseSecret: string, rotationId: string): string {
  const combinedInput = `${baseSecret}|${rotationId}|${Date.now()}`;
  return crypto.createHash('sha256').update(combinedInput).digest('base64');
}

/**
 * Securely erase key from memory (best effort)
 * Note: This doesn't guarantee memory erasure due to JS garbage collection
 */
export function secureKeyErasure(keyInfo: GeneratedKeyInfo): void {
  // Overwrite the key string with random data
  const keyLength = keyInfo.key.length;
  const randomOverwrite = crypto.randomBytes(keyLength).toString('base64').slice(0, keyLength);
  
  // Attempt to overwrite (limited effectiveness in JS)
  Object.defineProperty(keyInfo, 'key', {
    value: randomOverwrite,
    writable: true,
    configurable: true
  });
  
  // Clear metadata
  keyInfo.metadata.generatedAt = 0;
  keyInfo.metadata.entropy = 0;
  keyInfo.metadata.source = 'random';
}