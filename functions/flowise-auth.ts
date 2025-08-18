import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Basic CORS headers
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

// Initialize Supabase client
const supabase = createClient(
  ENV_VARS.SUPABASE_URL!,
  ENV_VARS.SUPABASE_SERVICE_ROLE_KEY!
);

// Specialty-specific Flowise endpoints
const FLOWISE_ENDPOINTS: Record<string, string> = {
  cardiology: ENV_VARS.FLOWISE_CARDIOLOGY_URL,
  'ob-gyn': ENV_VARS.FLOWISE_OBGYN_URL,
  'obgyn': ENV_VARS.FLOWISE_OBGYN_URL,
  default: ENV_VARS.FLOWISE_CARDIOLOGY_URL
};

// Simple JWT token decoder for Supabase tokens
function decodeSupabaseJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.app_metadata?.role || payload.user_metadata?.role,
      specialty: payload.app_metadata?.specialty || payload.user_metadata?.specialty,
      aud: payload.aud,
      iat: payload.iat,
      exp: payload.exp
    };
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

// Get user profile from database
async function getUserProfile(userId: string) {
  try {
    const possibleTables = ['profiles', 'users', 'user_profiles'];
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('medical_specialty, role, specialty')
          .eq('id', userId)
          .single();

        if (!error && data) {
          return {
            specialty: data?.medical_specialty || data?.specialty,
            role: data?.role
          };
        }
      } catch (tableError) {
        continue;
      }
    }
    
    return {};
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return {};
  }
}

// Get Flowise endpoint based on specialty
function getFlowiseConfig(specialty?: string) {
  const normalizedSpecialty = specialty?.toLowerCase().replace(/[^a-z-]/g, '');
  const url = FLOWISE_ENDPOINTS[normalizedSpecialty || 'default'] || FLOWISE_ENDPOINTS.default;
  
  return {
    url,
    specialty: normalizedSpecialty || 'cardiology'
  };
}

// Get user's Vector Store ID
async function getUserVectorStoreId(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_vector_stores')
      .select('openai_vector_store_id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data?.openai_vector_store_id || null;
  } catch (error) {
    console.error('Error fetching Vector Store ID:', error);
    return null;
  }
}

export const handler: Handler = async (event, context) => {
  const origin = event.headers.origin || event.headers.Origin;
  
  console.log('Flowise auth endpoint called:', {
    method: event.httpMethod,
    path: event.path,
    timestamp: new Date().toISOString()
  });

  // Handle OPTIONS for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST, OPTIONS',
        ...getCorsHeaders(origin)
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
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
        body: JSON.stringify({ error: 'Invalid authentication token' })
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

    // Get user profile to get specialty
    const profile = await getUserProfile(jwtPayload.id);
    const user = {
      ...jwtPayload,
      specialty: profile.specialty || jwtPayload.specialty,
      role: profile.role || jwtPayload.role
    };

    console.log('Authenticated user for Flowise config:', {
      id: user.id,
      email: user.email,
      specialty: user.specialty
    });

    // Get Flowise configuration
    const flowiseConfig = getFlowiseConfig(user.specialty);
    
    // Get user's Vector Store ID for personal knowledge base
    const vectorStoreId = await getUserVectorStoreId(user.id);

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
          vectorStoreId: vectorStoreId,
          openaiApiKey: process.env.OPENAI_API_KEY // Only for vector store usage
        }
      })
    };

  } catch (error) {
    console.error('Flowise auth handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};