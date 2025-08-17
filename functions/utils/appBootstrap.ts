import { ENV_VARS, validateEnvironmentVariables } from './constants';
import { validateKeyConfiguration, initializeKeyRotation } from './keyRotation';
import { generateEmergencyJWTSecret, validateJWTSecretStrength } from './secureKeyGenerator';

export interface BootstrapResult {
  success: boolean;
  securityLevel: 'secure' | 'degraded' | 'critical';
  errors: string[];
  warnings: string[];
  recommendations: string[];
  generatedKeys: {
    jwtSecret?: string;
    keyRotationInitialized: boolean;
  };
  environmentStatus: {
    hasRequiredSecrets: boolean;
    hasOptionalSecrets: boolean;
    missingCritical: string[];
    missingOptional: string[];
  };
}

export interface BootstrapOptions {
  allowEmergencyKeyGeneration?: boolean;
  strictMode?: boolean; // Fail on any missing environment variables
  skipKeyRotationInit?: boolean;
}

/**
 * Comprehensive application bootstrap with security validation
 * Ensures secure operation or fails fast with clear error messages
 */
export async function bootstrapApplication(options: BootstrapOptions = {}): Promise<BootstrapResult> {
  const {
    allowEmergencyKeyGeneration = ENV_VARS.NODE_ENV === 'development',
    strictMode = ENV_VARS.NODE_ENV === 'production',
    skipKeyRotationInit = false
  } = options;

  const result: BootstrapResult = {
    success: false,
    securityLevel: 'critical',
    errors: [],
    warnings: [],
    recommendations: [],
    generatedKeys: {
      keyRotationInitialized: false
    },
    environmentStatus: {
      hasRequiredSecrets: false,
      hasOptionalSecrets: false,
      missingCritical: [],
      missingOptional: []
    }
  };

  try {
    // Phase 1: Environment Variable Validation
    const envValidation = await validateEnvironment();
    result.environmentStatus = envValidation;

    if (envValidation.criticalFailure && strictMode) {
      result.errors.push('Critical environment variables missing in strict mode');
      result.errors.push(...envValidation.missingCritical);
      return result;
    }

    // Phase 2: JWT Secret Validation and Generation
    const jwtValidation = await validateOrGenerateJWTSecret(allowEmergencyKeyGeneration);
    if (!jwtValidation.success) {
      result.errors.push(...jwtValidation.errors);
      if (strictMode) {
        return result;
      }
    }

    if (jwtValidation.generatedKey) {
      result.generatedKeys.jwtSecret = jwtValidation.generatedKey;
      result.warnings.push('Using auto-generated JWT secret');
      result.recommendations.push(...jwtValidation.recommendations);
    }

    result.warnings.push(...jwtValidation.warnings);

    // Phase 3: Key Rotation System Initialization
    if (!skipKeyRotationInit) {
      const keyRotationValidation = await initializeSecureKeyRotation();
      result.generatedKeys.keyRotationInitialized = keyRotationValidation.success;
      
      if (!keyRotationValidation.success) {
        result.warnings.push('Key rotation system failed to initialize');
        result.warnings.push(...keyRotationValidation.warnings);
      }
    }

    // Phase 4: Security Level Assessment
    result.securityLevel = assessSecurityLevel(envValidation, jwtValidation, result.generatedKeys);

    // Phase 5: Generate Recommendations
    result.recommendations.push(...generateSecurityRecommendations(result.securityLevel, envValidation));

    // Success criteria
    result.success = result.errors.length === 0 && result.securityLevel !== 'critical';

    return result;

  } catch (error) {
    result.errors.push(`Bootstrap failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.securityLevel = 'critical';
    return result;
  }
}

/**
 * Validate environment variables with categorized importance
 */
async function validateEnvironment(): Promise<{
  hasRequiredSecrets: boolean;
  hasOptionalSecrets: boolean;
  missingCritical: string[];
  missingOptional: string[];
  criticalFailure: boolean;
}> {
  const envValidation = validateEnvironmentVariables();
  
  // Categorize missing variables by importance
  const criticalVars = ['SUPABASE_JWT_SECRET', 'JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const optionalVars = ['SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY', 'ELEVENLABS_API_KEY'];

  const missingCritical = envValidation.missingVars.filter(v => 
    criticalVars.some(cv => v.includes(cv))
  );
  
  const missingOptional = envValidation.missingVars.filter(v => 
    optionalVars.some(ov => v.includes(ov))
  );

  return {
    hasRequiredSecrets: missingCritical.length === 0,
    hasOptionalSecrets: missingOptional.length === 0,
    missingCritical,
    missingOptional,
    criticalFailure: missingCritical.length > 0
  };
}

/**
 * Validate existing JWT secret or generate secure emergency fallback
 */
async function validateOrGenerateJWTSecret(allowGeneration: boolean): Promise<{
  success: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  generatedKey?: string;
}> {
  const result: {
    success: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
    generatedKey?: string;
  } = {
    success: false,
    errors: [] as string[],
    warnings: [] as string[],
    recommendations: [] as string[]
  };

  // Check if we have an existing JWT secret
  const existingSecret = ENV_VARS.SUPABASE_JWT_SECRET || ENV_VARS.JWT_SECRET;
  
  if (existingSecret && existingSecret !== 'fallback-secret-key') {
    // Validate existing secret strength
    const validation = validateJWTSecretStrength(existingSecret);
    
    if (validation.isValid) {
      result.success = true;
      if (validation.strength === 'medium') {
        result.warnings.push('JWT secret strength is medium - consider using a stronger secret');
      }
    } else {
      result.warnings.push('Existing JWT secret has security issues');
      result.warnings.push(...validation.issues);
      result.recommendations.push(...validation.recommendations);
      
      if (allowGeneration) {
        // Generate emergency replacement
        const emergency = generateEmergencyJWTSecret();
        result.generatedKey = emergency.key;
        result.warnings.push(emergency.warning);
        result.recommendations.push(...emergency.recommendations);
        result.success = true;
      } else {
        result.errors.push('JWT secret validation failed and emergency generation is disabled');
      }
    }
  } else {
    // No valid secret found
    if (allowGeneration) {
      const emergency = generateEmergencyJWTSecret();
      result.generatedKey = emergency.key;
      result.warnings.push(emergency.warning);
      result.recommendations.push(...emergency.recommendations);
      result.success = true;
    } else {
      result.errors.push('No valid JWT secret found and emergency generation is disabled');
    }
  }

  return result;
}

/**
 * Initialize key rotation with secure defaults
 */
async function initializeSecureKeyRotation(): Promise<{
  success: boolean;
  warnings: string[];
}> {
  try {
    initializeKeyRotation();
    
    const validation = validateKeyConfiguration();
    
    return {
      success: validation.isValid,
      warnings: validation.warnings
    };
  } catch (error) {
    return {
      success: false,
      warnings: [`Key rotation initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Assess overall security level based on validation results
 */
function assessSecurityLevel(
  envValidation: any,
  jwtValidation: any,
  generatedKeys: any
): 'secure' | 'degraded' | 'critical' {
  // Critical: Missing critical secrets and no fallbacks
  if (!envValidation.hasRequiredSecrets && !jwtValidation.success) {
    return 'critical';
  }

  // Degraded: Using generated keys or missing optional secrets
  if (generatedKeys.jwtSecret || !envValidation.hasOptionalSecrets || !envValidation.hasRequiredSecrets) {
    return 'degraded';
  }

  // Secure: All secrets present and validated
  return 'secure';
}

/**
 * Generate environment-specific security recommendations
 */
function generateSecurityRecommendations(
  securityLevel: string,
  envValidation: any
): string[] {
  const recommendations: string[] = [];

  if (securityLevel === 'critical') {
    recommendations.push('URGENT: Configure required environment variables immediately');
    recommendations.push('Application is running in an insecure state');
  }

  if (securityLevel === 'degraded') {
    recommendations.push('Configure missing environment variables for full security');
    recommendations.push('Replace auto-generated secrets with properly managed ones');
  }

  if (ENV_VARS.NODE_ENV === 'production' && securityLevel !== 'secure') {
    recommendations.push('PRODUCTION WARNING: Security level is not optimal for production');
    recommendations.push('Use a proper secrets management system');
  }

  if (envValidation.missingOptional.length > 0) {
    recommendations.push(`Consider configuring optional services: ${envValidation.missingOptional.join(', ')}`);
  }

  return recommendations;
}

/**
 * Quick bootstrap check for health endpoints
 */
export async function quickBootstrapCheck(): Promise<{
  healthy: boolean;
  securityLevel: 'secure' | 'degraded' | 'critical';
  criticalIssues: string[];
}> {
  try {
    const result = await bootstrapApplication({
      allowEmergencyKeyGeneration: true,
      strictMode: false,
      skipKeyRotationInit: true
    });

    return {
      healthy: result.success,
      securityLevel: result.securityLevel,
      criticalIssues: result.errors
    };
  } catch (error) {
    return {
      healthy: false,
      securityLevel: 'critical',
      criticalIssues: [`Bootstrap check failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Enhanced environment validation for development vs production
 */
export function validateProductionReadiness(): {
  ready: boolean;
  blockers: string[];
  warnings: string[];
} {
  const blockers: string[] = [];
  const warnings: string[] = [];

  // Check critical production requirements
  if (!ENV_VARS.SUPABASE_JWT_SECRET && !ENV_VARS.JWT_SECRET) {
    blockers.push('JWT secret must be configured for production');
  }

  if (!ENV_VARS.SUPABASE_URL) {
    blockers.push('Supabase URL must be configured');
  }

  if (!ENV_VARS.SUPABASE_ANON_KEY) {
    blockers.push('Supabase anonymous key must be configured');
  }

  // Check JWT secret strength for production
  const jwtSecret = ENV_VARS.SUPABASE_JWT_SECRET || ENV_VARS.JWT_SECRET;
  if (jwtSecret) {
    const validation = validateJWTSecretStrength(jwtSecret);
    if (!validation.isValid || validation.strength === 'weak') {
      blockers.push('JWT secret is too weak for production use');
    }
    if (validation.strength === 'medium') {
      warnings.push('Consider using a stronger JWT secret for production');
    }
  }

  // Check for development-only configurations
  if (ENV_VARS.NODE_ENV !== 'production') {
    warnings.push('NODE_ENV should be set to "production"');
  }

  return {
    ready: blockers.length === 0,
    blockers,
    warnings
  };
}