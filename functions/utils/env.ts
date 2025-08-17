import { ENV_VARS, validateEnvironmentVariables as validateEnvVars, getEnvironmentInfo } from './constants';
import { bootstrapApplication, quickBootstrapCheck, validateProductionReadiness } from './appBootstrap';

export interface EnvironmentConfig {
  nodeEnv: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  jwtSecret: string;
  allowedOrigins: string[];
}

// Secure environment loading - uses getter functions
export function loadEnvironmentVariables(): EnvironmentConfig {
  return {
    nodeEnv: ENV_VARS.NODE_ENV,
    supabaseUrl: ENV_VARS.SUPABASE_URL,
    supabaseAnonKey: ENV_VARS.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: ENV_VARS.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: ENV_VARS.JWT_SECRET,
    allowedOrigins: ENV_VARS.ALLOWED_ORIGINS
  };
}

// Use the enhanced validation from constants.ts
export function validateEnvironmentVariables(): { 
  isValid: boolean; 
  missingVars: string[];
  hasSecrets: boolean;
  securityReport: string;
  criticalMissing: string[];
  optionalMissing: string[];
} {
  return validateEnvVars();
}

// Safe environment debugging
export function getSecureEnvironmentInfo() {
  return getEnvironmentInfo();
}

export function isDevelopment(): boolean {
  return ENV_VARS.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return ENV_VARS.NODE_ENV === 'production';
}

/**
 * Comprehensive application startup validation
 * Integrates all security checks and validation
 */
export async function validateApplicationStartup(options?: {
  strictMode?: boolean;
  allowEmergencyGeneration?: boolean;
}): Promise<{
  success: boolean;
  securityLevel: 'secure' | 'degraded' | 'critical';
  errors: string[];
  warnings: string[];
  recommendations: string[];
  shouldBlock: boolean;
}> {
  const strictMode = options?.strictMode ?? isProduction();
  const allowEmergencyGeneration = options?.allowEmergencyGeneration ?? isDevelopment();

  try {
    const bootstrap = await bootstrapApplication({
      allowEmergencyKeyGeneration: allowEmergencyGeneration,
      strictMode,
      skipKeyRotationInit: false
    });

    // Determine if application should be blocked
    const shouldBlock = strictMode && (
      !bootstrap.success || 
      bootstrap.securityLevel === 'critical' ||
      bootstrap.errors.length > 0
    );

    return {
      success: bootstrap.success,
      securityLevel: bootstrap.securityLevel,
      errors: bootstrap.errors,
      warnings: bootstrap.warnings,
      recommendations: bootstrap.recommendations,
      shouldBlock
    };
  } catch (error) {
    return {
      success: false,
      securityLevel: 'critical',
      errors: [`Startup validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      recommendations: ['Check application configuration and environment variables'],
      shouldBlock: strictMode
    };
  }
}

/**
 * Quick health check for monitoring endpoints
 */
export async function quickHealthCheck(): Promise<{
  healthy: boolean;
  securityLevel: 'secure' | 'degraded' | 'critical';
  issues: string[];
}> {
  try {
    const check = await quickBootstrapCheck();
    return {
      healthy: check.healthy,
      securityLevel: check.securityLevel,
      issues: check.criticalIssues
    };
  } catch (error) {
    return {
      healthy: false,
      securityLevel: 'critical',
      issues: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Production readiness validation
 */
export function validateForProduction(): {
  ready: boolean;
  blockers: string[];
  recommendations: string[];
  securityReport: string;
} {
  const envValidation = validateEnvVars();
  const prodValidation = validateProductionReadiness();
  
  const allBlockers = [...prodValidation.blockers];
  const allRecommendations = [...prodValidation.warnings, ...prodValidation.warnings];
  
  // Add environment-specific blockers
  if (envValidation.criticalMissing.length > 0) {
    allBlockers.push(...envValidation.criticalMissing.map(v => `Missing critical environment variable: ${v}`));
  }
  
  const securityReport = envValidation.securityReport + 
    ` | Production Ready: ${prodValidation.ready ? 'YES' : 'NO'}` +
    ` | Blockers: ${allBlockers.length}`;

  return {
    ready: prodValidation.ready && envValidation.isValid,
    blockers: allBlockers,
    recommendations: allRecommendations,
    securityReport
  };
}

/**
 * Initialize secure environment with comprehensive validation
 * Call this early in application startup
 */
export async function initializeSecureEnvironment(): Promise<{
  success: boolean;
  canContinue: boolean;
  warnings: string[];
  emergencyKeys?: string[];
}> {
  console.log('Initializing secure environment...');
  
  try {
    const validation = await validateApplicationStartup();
    
    // Log security status
    console.log(`Security Level: ${validation.securityLevel.toUpperCase()}`);
    
    if (validation.warnings.length > 0) {
      console.warn('Security Warnings:');
      validation.warnings.forEach(warning => console.warn(`- ${warning}`));
    }
    
    if (validation.errors.length > 0) {
      console.error('Security Errors:');
      validation.errors.forEach(error => console.error(`- ${error}`));
    }
    
    if (validation.recommendations.length > 0) {
      console.log('Recommendations:');
      validation.recommendations.forEach(rec => console.log(`- ${rec}`));
    }

    return {
      success: validation.success,
      canContinue: !validation.shouldBlock,
      warnings: validation.warnings,
      emergencyKeys: validation.warnings.filter(w => w.includes('auto-generated'))
    };
  } catch (error) {
    console.error('Failed to initialize secure environment:', error);
    
    return {
      success: false,
      canContinue: !isProduction(), // Allow development to continue with errors
      warnings: [`Environment initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Get comprehensive environment status for debugging
 */
export function getEnvironmentStatus(): {
  environment: string;
  securityLevel: 'secure' | 'degraded' | 'critical';
  configuration: {
    hasSupabaseConfig: boolean;
    hasJWTSecret: boolean;
    hasOptionalServices: boolean;
  };
  issues: {
    critical: string[];
    warnings: string[];
  };
} {
  const envInfo = getEnvironmentInfo();
  const envValidation = validateEnvVars();
  
  return {
    environment: ENV_VARS.NODE_ENV,
    securityLevel: envValidation.criticalMissing.length === 0 ? 
      (envValidation.hasSecrets ? 'secure' : 'degraded') : 'critical',
    configuration: {
      hasSupabaseConfig: envInfo.hasSupabaseConfig,
      hasJWTSecret: !!(ENV_VARS.SUPABASE_JWT_SECRET || ENV_VARS.JWT_SECRET),
      hasOptionalServices: envValidation.optionalMissing.length === 0
    },
    issues: {
      critical: envValidation.criticalMissing,
      warnings: envValidation.optionalMissing
    }
  };
} 