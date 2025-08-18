import { createClient } from '@supabase/supabase-js';

// Simple CORS headers (no external dependencies)
function getCorsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };
}

// Environment variables
const ENV_VARS = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  FLOWISE_CARDIOLOGY_URL: process.env.FLOWISE_CARDIOLOGY_URL || "https://flowise-2-0.onrender.com/api/v1/prediction/f8433523-af63-4c53-8db9-63ed3b923f2e",
  FLOWISE_OBGYN_URL: process.env.FLOWISE_OBGYN_URL || "https://flowise-2-0.onrender.com/api/v1/prediction/57a1285c-971d-48d4-9519-feb7494afe8b"
};

// Initialize Supabase client safely
let supabase;
try {
  if (ENV_VARS.SUPABASE_URL && ENV_VARS.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(ENV_VARS.SUPABASE_URL, ENV_VARS.SUPABASE_SERVICE_ROLE_KEY);
  }
} catch (error) {
  console.error('Failed to initialize Supabase:', error);
}

// Specialty endpoints
const FLOWISE_ENDPOINTS = {
  cardiology: ENV_VARS.FLOWISE_CARDIOLOGY_URL,
  'ob-gyn': ENV_VARS.FLOWISE_OBGYN_URL,
  'obgyn': ENV_VARS.FLOWISE_OBGYN_URL,
  default: ENV_VARS.FLOWISE_CARDIOLOGY_URL
};

// JWT decoder
function decodeSupabaseJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.app_metadata?.role || payload.user_metadata?.role,
      specialty: payload.app_metadata?.specialty || payload.user_metadata?.specialty,
      exp: payload.exp
    };
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

// Get user profile
async function getUserProfile(userId) {
  if (!supabase) return {};

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('medical_specialty, role, specialty')
      .eq('id', userId)
      .single();

    if (!error && data) {
      return {
        specialty: data?.medical_specialty || data?.specialty,
        role: data?.role
      };
    }
    return {};
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {};
  }
}

// Get Flowise config
function getFlowiseConfig(specialty) {
  const normalizedSpecialty = specialty?.toLowerCase().replace(/[^a-z-]/g, '');
  const url = FLOWISE_ENDPOINTS[normalizedSpecialty] || FLOWISE_ENDPOINTS.default;
  
  return {
    url,
    specialty: normalizedSpecialty || 'cardiology'
  };
}

// Main handler
export const handler = async (event, context) => {
  const origin = event.headers.origin || event.headers.Origin;
  
  console.log('🚀 Simple flowise function called:', {
    path: event.path,
    method: event.httpMethod,
    hasAuth: !!(event.headers.authorization),
    timestamp: new Date().toISOString()
  });

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: ''
    };
  }

  try {
    // Check if this is an auth request
    const isAuthRequest = (event.headers['x-request-type'] === 'auth') ||
                         (event.body && event.body.includes('"requestType":"auth"')) ||
                         (event.path && event.path.includes('/auth'));

    if (isAuthRequest) {
      console.log('🔐 Processing auth request');

      // Check authentication
      const authHeader = event.headers.authorization || event.headers.Authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin)
          },
          body: JSON.stringify({ error: 'Authentication required' })
        };
      }

      // Decode JWT token
      const token = authHeader.replace('Bearer ', '');
      const jwtPayload = decodeSupabaseJWT(token);
      
      if (!jwtPayload) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin)
          },
          body: JSON.stringify({ error: 'Invalid token' })
        };
      }

      // Check token expiration
      if (jwtPayload.exp && Date.now() >= jwtPayload.exp * 1000) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin)
          },
          body: JSON.stringify({ error: 'Token expired' })
        };
      }

      // Get user profile
      const profile = await getUserProfile(jwtPayload.id);
      const user = {
        ...jwtPayload,
        specialty: profile.specialty || jwtPayload.specialty,
        role: profile.role || jwtPayload.role
      };

      // Get Flowise configuration
      const flowiseConfig = getFlowiseConfig(user.specialty);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin)
        },
        body: JSON.stringify({
          success: true,
          data: {
            flowiseUrl: flowiseConfig.url,
            specialty: flowiseConfig.specialty,
            userId: user.id,
            vectorStoreId: null, // Simplified for now
            openaiApiKey: process.env.OPENAI_API_KEY
          }
        })
      };
    }

    // Handle chat requests (simplified)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
      body: JSON.stringify({
        success: false,
        error: 'Chat functionality temporarily simplified',
        message: 'Please use auth requests only for now'
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};