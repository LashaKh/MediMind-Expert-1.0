// HTTP Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_REQUEST_FORMAT: 'Invalid request format',
  UNAUTHORIZED_ACCESS: 'Unauthorized access',
  INVALID_TOKEN: 'Invalid authentication token',
  TOKEN_EXPIRED: 'Authentication token has expired',
  INTERNAL_ERROR: 'Internal server error',
  METHOD_NOT_ALLOWED: 'Method not allowed',
  INVALID_CREDENTIALS: 'Invalid credentials'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  OPERATION_SUCCESSFUL: 'Operation completed successfully',
  USER_AUTHENTICATED: 'User authenticated successfully',
  DATA_RETRIEVED: 'Data retrieved successfully',
  DATA_CREATED: 'Data created successfully',
  DATA_UPDATED: 'Data updated successfully',
  DATA_DELETED: 'Data deleted successfully'
} as const;

// Environment Variables - Secure access patterns
interface SecureEnvironmentConfig {
  NODE_ENV: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_JWT_SECRET: string;
  JWT_SECRET: string;
  ALLOWED_ORIGINS: string[];
  FLOWISE_CARDIOLOGY_URL: string;
  FLOWISE_OBGYN_URL: string;
  PERPLEXITY_API_KEY: string;
  PERPLEXITY_API_KEYS: string[]; // Multiple keys support
  BRAVE_API_KEY: string;
  BRAVE_API_KEYS: string[]; // Multiple keys support
  EXA_API_KEY: string;
  EXA_API_KEYS: string[]; // Multiple keys support
  OPENAI_API_KEY: string;
  // PlayAI credentials removed - using ElevenLabs
  ELEVENLABS_API_KEY?: string;
  DEFAULT_TTS_MODEL?: string;
  LOW_LATENCY_TTS_MODEL?: string;
  DEFAULT_TTS_FORMAT?: string;
}

// Mark sensitive variables for security awareness
const SENSITIVE_ENV_VARS = new Set([
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET', 
  'JWT_SECRET',
  'OPENAI_API_KEY',
  // 'PLAYAI_API_KEY', // Removed - using ElevenLabs
  // 'PLAYAI_USER_ID', // Removed - using ElevenLabs
  'ELEVENLABS_API_KEY',
  'PERPLEXITY_API_KEY',
  'PERPLEXITY_API_KEYS',
  'VITE_PERPLEXITY_API_KEY',
  'BRAVE_API_KEY',
  'BRAVE_API_KEYS',
  'VITE_BRAVE_API_KEY',
  'EXA_API_KEY',
  'EXA_API_KEYS',
  'VITE_EXA_API_KEY'
]);

/**
 * Parse comma-separated API keys from environment variables
 * Filters out empty strings and trims whitespace
 */
function parseAPIKeys(keysString: string): string[] {
  if (!keysString || keysString.trim().length === 0) {
    return [];
  }
  
  return keysString
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0);
}

// Private environment configuration - not directly exported
// SECURITY: No hardcoded fallback secrets - fail explicitly if missing
const _envConfig: SecureEnvironmentConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(','),
  // Flowise API Configuration - specialty-specific endpoints
  FLOWISE_CARDIOLOGY_URL: process.env.FLOWISE_CARDIOLOGY_URL || 'https://flowise-2-0.onrender.com/api/v1/prediction/f8433523-af63-4c53-8db9-63ed3b923f2e',
  FLOWISE_OBGYN_URL: process.env.FLOWISE_OBGYN_URL || 'https://flowise-2-0.onrender.com/api/v1/prediction/57a1285c-971d-48d4-9519-feb7494afe8b',
  // Search API Configuration - prefer server-side variables, fallback to client-side
  PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || process.env.VITE_PERPLEXITY_API_KEY || '',
  PERPLEXITY_API_KEYS: parseAPIKeys(process.env.PERPLEXITY_API_KEYS || ''),
  BRAVE_API_KEY: process.env.BRAVE_API_KEY || process.env.VITE_BRAVE_API_KEY || '',
  BRAVE_API_KEYS: parseAPIKeys(process.env.BRAVE_API_KEYS || ''),
  EXA_API_KEY: process.env.EXA_API_KEY || process.env.VITE_EXA_API_KEY || '',
  EXA_API_KEYS: parseAPIKeys(process.env.EXA_API_KEYS || ''),
  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  // PlayAI removed - using ElevenLabs
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  DEFAULT_TTS_MODEL: process.env.DEFAULT_TTS_MODEL,
  LOW_LATENCY_TTS_MODEL: process.env.LOW_LATENCY_TTS_MODEL,
  DEFAULT_TTS_FORMAT: process.env.DEFAULT_TTS_FORMAT
};

// Secure getter functions for environment variables
export const ENV_VARS = {
  get NODE_ENV() { return _envConfig.NODE_ENV; },
  get SUPABASE_URL() { return _envConfig.SUPABASE_URL; },
  get SUPABASE_ANON_KEY() { return _envConfig.SUPABASE_ANON_KEY; },
  get SUPABASE_SERVICE_ROLE_KEY() { return _envConfig.SUPABASE_SERVICE_ROLE_KEY; },
  get SUPABASE_JWT_SECRET() { return _envConfig.SUPABASE_JWT_SECRET; },
  get JWT_SECRET() { return _envConfig.JWT_SECRET; },
  get ALLOWED_ORIGINS() { return _envConfig.ALLOWED_ORIGINS; },
  get FLOWISE_CARDIOLOGY_URL() { return _envConfig.FLOWISE_CARDIOLOGY_URL; },
  get FLOWISE_OBGYN_URL() { return _envConfig.FLOWISE_OBGYN_URL; },
  get PERPLEXITY_API_KEY() { return _envConfig.PERPLEXITY_API_KEY; },
  get PERPLEXITY_API_KEYS() { return _envConfig.PERPLEXITY_API_KEYS; },
  get BRAVE_API_KEY() { return _envConfig.BRAVE_API_KEY; },
  get BRAVE_API_KEYS() { return _envConfig.BRAVE_API_KEYS; },
  get EXA_API_KEY() { return _envConfig.EXA_API_KEY; },
  get EXA_API_KEYS() { return _envConfig.EXA_API_KEYS; },
  get OPENAI_API_KEY() { return _envConfig.OPENAI_API_KEY; },
  // PlayAI getters removed - using ElevenLabs
} as const;

// Secure environment variable validation
export function validateEnvironmentVariables(): { 
  isValid: boolean; 
  missingVars: string[]; 
  hasSecrets: boolean;
  securityReport: string; 
  criticalMissing: string[];
  optionalMissing: string[];
} {
  const missingVars: string[] = [];
  const criticalMissing: string[] = [];
  const optionalMissing: string[] = [];
  let hasSecrets = false;
  
  // Check critical variables
  if (!_envConfig.SUPABASE_URL) {
    missingVars.push('VITE_SUPABASE_URL');
    criticalMissing.push('VITE_SUPABASE_URL');
  }
  if (!_envConfig.SUPABASE_ANON_KEY) {
    missingVars.push('VITE_SUPABASE_ANON_KEY');
    criticalMissing.push('VITE_SUPABASE_ANON_KEY');
  }
  
  // Check JWT secrets (critical for security)
  if (!_envConfig.SUPABASE_JWT_SECRET && !_envConfig.JWT_SECRET) {
    missingVars.push('SUPABASE_JWT_SECRET or JWT_SECRET');
    criticalMissing.push('SUPABASE_JWT_SECRET or JWT_SECRET');
  } else if (_envConfig.SUPABASE_JWT_SECRET || _envConfig.JWT_SECRET) {
    hasSecrets = true;
  }
  
  // Check optional but recommended variables
  if (!_envConfig.SUPABASE_SERVICE_ROLE_KEY) {
    missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
    optionalMissing.push('SUPABASE_SERVICE_ROLE_KEY');
  }
  
  // Additional API keys check (without exposing values)
  if (process.env.OPENAI_API_KEY) hasSecrets = true;
  // PlayAI check removed - using ElevenLabs
  if (process.env.BRAVE_API_KEY || process.env.VITE_BRAVE_API_KEY) hasSecrets = true;
  if (process.env.PERPLEXITY_API_KEY || process.env.VITE_PERPLEXITY_API_KEY) hasSecrets = true;
  if (process.env.EXA_API_KEY || process.env.VITE_EXA_API_KEY) hasSecrets = true;
  
  if (!process.env.OPENAI_API_KEY) optionalMissing.push('OPENAI_API_KEY');
  // PlayAI validation removed - using ElevenLabs
  if (!process.env.BRAVE_API_KEY && !process.env.VITE_BRAVE_API_KEY) optionalMissing.push('BRAVE_API_KEY');
  if (!process.env.PERPLEXITY_API_KEY && !process.env.VITE_PERPLEXITY_API_KEY) optionalMissing.push('PERPLEXITY_API_KEY');
  if (!process.env.EXA_API_KEY && !process.env.VITE_EXA_API_KEY) optionalMissing.push('EXA_API_KEY');
  
  const securityLevel = criticalMissing.length === 0 ? 
    (hasSecrets ? 'SECURED' : 'DEGRADED') : 'CRITICAL';
  
  const securityReport = `Environment security: ${securityLevel} | Critical missing: ${criticalMissing.length} | Optional missing: ${optionalMissing.length}`;
  
  return {
    isValid: criticalMissing.length === 0,
    missingVars,
    hasSecrets,
    securityReport,
    criticalMissing,
    optionalMissing
  };
}

// Safe environment info for debugging (no sensitive values)
export function getEnvironmentInfo(): { 
  nodeEnv: string;
  hasSupabaseConfig: boolean;
  hasFlowiseConfig: boolean;
  allowedOriginsCount: number;
} {
  return {
    nodeEnv: _envConfig.NODE_ENV,
    hasSupabaseConfig: !!(_envConfig.SUPABASE_URL && _envConfig.SUPABASE_ANON_KEY),
    hasFlowiseConfig: !!(_envConfig.FLOWISE_CARDIOLOGY_URL && _envConfig.FLOWISE_OBGYN_URL),
    allowedOriginsCount: _envConfig.ALLOWED_ORIGINS.length
  };
}

/**
 * Get API keys for a provider - supports both single key and multiple key pools
 * Returns array of keys with fallback to single key if pool not configured
 */
export function getAPIKeys(provider: 'exa' | 'brave' | 'perplexity'): string[] {
  switch (provider) {
    case 'exa':
      // Prefer multiple keys if available, fallback to single key
      if (_envConfig.EXA_API_KEYS.length > 0) {
        return _envConfig.EXA_API_KEYS;
      }
      return _envConfig.EXA_API_KEY ? [_envConfig.EXA_API_KEY] : [];
      
    case 'brave':
      if (_envConfig.BRAVE_API_KEYS.length > 0) {
        return _envConfig.BRAVE_API_KEYS;
      }
      return _envConfig.BRAVE_API_KEY ? [_envConfig.BRAVE_API_KEY] : [];
      
    case 'perplexity':
      if (_envConfig.PERPLEXITY_API_KEYS.length > 0) {
        return _envConfig.PERPLEXITY_API_KEYS;
      }
      return _envConfig.PERPLEXITY_API_KEY ? [_envConfig.PERPLEXITY_API_KEY] : [];
      
    default:
      return [];
  }
}

/**
 * Check if a provider has multiple API keys configured
 */
export function hasAPIKeyPool(provider: 'exa' | 'brave' | 'perplexity'): boolean {
  const keys = getAPIKeys(provider);
  return keys.length > 1;
}

/**
 * Get API key configuration info for debugging (no sensitive values)
 */
export function getAPIKeyInfo(): {
  exa: { hasPool: boolean; keyCount: number; hasSingle: boolean };
  brave: { hasPool: boolean; keyCount: number; hasSingle: boolean };
  perplexity: { hasPool: boolean; keyCount: number; hasSingle: boolean };
} {
  return {
    exa: {
      hasPool: _envConfig.EXA_API_KEYS.length > 1,
      keyCount: _envConfig.EXA_API_KEYS.length,
      hasSingle: !!_envConfig.EXA_API_KEY
    },
    brave: {
      hasPool: _envConfig.BRAVE_API_KEYS.length > 1,
      keyCount: _envConfig.BRAVE_API_KEYS.length,
      hasSingle: !!_envConfig.BRAVE_API_KEY
    },
    perplexity: {
      hasPool: _envConfig.PERPLEXITY_API_KEYS.length > 1,
      keyCount: _envConfig.PERPLEXITY_API_KEYS.length,
      hasSingle: !!_envConfig.PERPLEXITY_API_KEY
    }
  };
}

// API Endpoints
export const API_ROUTES = {
  HEALTH: '/.netlify/functions/health',
  AUTH: '/.netlify/functions/auth',
  USERS: '/.netlify/functions/users',
  CHAT: '/.netlify/functions/chat',
  FLOWISE_PROXY: '/.netlify/functions/flowise-proxy'
} as const; 