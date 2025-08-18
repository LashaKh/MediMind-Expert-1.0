const { createClient } = require('@supabase/supabase-js');
// SECURITY FIX: Import secure CORS utilities
const { getCorsHeaders, isOriginAllowed, DEFAULT_CORS_OPTIONS } = require('./utils/cors');
// Import enhanced error handling system
const { createErrorResponse, withErrorHandling } = require('./utils/errorHandler');

// Using secure CORS implementation from utils/cors

// Environment variables
const ENV_VARS = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  FLOWISE_CARDIOLOGY_URL: process.env.FLOWISE_CARDIOLOGY_URL || "https://flowise-2-0.onrender.com/api/v1/prediction/f8433523-af63-4c53-8db9-63ed3b923f2e",
  FLOWISE_OBGYN_URL: process.env.FLOWISE_OBGYN_URL || "https://flowise-2-0.onrender.com/api/v1/prediction/57a1285c-971d-48d4-9519-feb7494afe8b"
};

// Initialize Supabase client
const supabase = createClient(
  ENV_VARS.SUPABASE_URL,
  ENV_VARS.SUPABASE_SERVICE_ROLE_KEY
);

// Specialty-specific Flowise endpoints
const FLOWISE_ENDPOINTS = {
  cardiology: ENV_VARS.FLOWISE_CARDIOLOGY_URL,
  'ob-gyn': ENV_VARS.FLOWISE_OBGYN_URL,
  'obgyn': ENV_VARS.FLOWISE_OBGYN_URL,
  default: ENV_VARS.FLOWISE_CARDIOLOGY_URL
};

// Simple JWT token decoder for Supabase tokens
function decodeSupabaseJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
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
async function getUserProfile(userId) {
  try {
    // Try multiple possible table names
    const possibleTables = ['profiles', 'users', 'user_profiles'];
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('medical_specialty, role, specialty')
          .eq('id', userId)
          .single();

        if (!error && data) {
          console.log(`Found user profile in table: ${tableName}`);
          return {
            specialty: data?.medical_specialty || data?.specialty,
            role: data?.role
          };
        }
      } catch (tableError) {
        console.log(`Table ${tableName} not found or error:`, tableError.message);
        continue;
      }
    }
    
    console.log('No profile table found, using default values');
    return {};
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return {};
  }
}

// Get Flowise endpoint based on specialty
function getFlowiseEndpoint(specialty) {
  const normalizedSpecialty = specialty?.toLowerCase().replace(/[^a-z-]/g, '');
  return FLOWISE_ENDPOINTS[normalizedSpecialty] || FLOWISE_ENDPOINTS.default;
}

// Get user's Vector Store ID
async function getUserVectorStoreId(userId) {
  try {
    const { data, error } = await supabase
      .from('user_vector_stores')
      .select('openai_vector_store_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`No Vector Store found for user ${userId}`);
        return null;
      }
      throw error;
    }

    return data?.openai_vector_store_id || null;
  } catch (error) {
    console.error('Error fetching Vector Store ID:', error);
    return null;
  }
}

// Send request to Flowise with reduced timeout for development
async function sendToFlowise(message, user, conversationId, uploads, knowledgeBase) {
  const flowiseUrl = getFlowiseEndpoint(user.specialty);
  
  console.log('Sending to Flowise:', {
    url: flowiseUrl,
    userId: user.id,
    specialty: user.specialty,
    hasUploads: !!(uploads && uploads.length > 0)
  });

  const requestPayload = {
    question: message,
    ...(conversationId && {
      overrideConfig: { sessionId: conversationId }
    }),
    ...(uploads && uploads.length > 0 && { uploads })
  };

  // Handle knowledge base
  if (knowledgeBase && knowledgeBase.type === 'personal') {
    try {
      const vectorStoreId = await getUserVectorStoreId(user.id);
      if (vectorStoreId) {
        requestPayload.vectorStore = {
          type: 'openai',
          id: vectorStoreId,
          namespace: user.id
        };
        requestPayload.openaiConfig = {
          apiKey: ENV_VARS.OPENAI_API_KEY
        };
      } else {
        requestPayload.knowledgeBase = {
          type: 'curated',
          useDefaultKnowledgeBase: true
        };
      }
    } catch (error) {
      console.error('Vector Store error:', error);
      requestPayload.knowledgeBase = {
        type: 'curated',
        useDefaultKnowledgeBase: true
      };
    }
  } else {
    requestPayload.knowledgeBase = {
      type: knowledgeBase?.type || 'curated'
    };
  }

  // Reduced timeout for Netlify Function limits (development: 10s, production: 26s)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Flowise request timeout after 25 seconds')), 25000);
  });

  // Make the fetch request with timeout
  const fetchPromise = fetch(flowiseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(requestPayload.vectorStore && {
        'X-OpenAI-Key': ENV_VARS.OPENAI_API_KEY
      })
    },
    body: JSON.stringify(requestPayload)
  });

  const response = await Promise.race([fetchPromise, timeoutPromise]);

  console.log('Flowise response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Flowise API error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      url: flowiseUrl
    });
    throw new Error(`Flowise API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Flowise response received:', {
    hasText: !!result.text,
    hasResponse: !!result.response,
    hasSources: !!(result.sourceDocuments && result.sourceDocuments.length > 0)
  });
  
  return result;
}

exports.handler = async (event, context) => {
  const origin = event.headers.origin || event.headers.Origin;
  
  // Handle auth requests (workaround for deployment issues)
  if (event.path && event.path.includes('/auth')) {
    console.log('🔐 Auth request detected, handling directly');
    
    // Handle OPTIONS for CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: getCorsHeaders(origin, DEFAULT_CORS_OPTIONS),
        body: ''
      };
    }

    // Only allow POST requests for auth
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Allow': 'POST, OPTIONS',
          ...getCorsHeaders(origin, DEFAULT_CORS_OPTIONS)
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
            ...getCorsHeaders(origin, DEFAULT_CORS_OPTIONS)
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
            ...getCorsHeaders(origin, DEFAULT_CORS_OPTIONS)
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
            ...getCorsHeaders(origin, DEFAULT_CORS_OPTIONS)
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
      
      // Get user's Vector Store ID
      const vectorStoreId = await getUserVectorStoreId(user.id);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin, DEFAULT_CORS_OPTIONS)
        },
        body: JSON.stringify({
          success: true,
          data: {
            flowiseUrl: flowiseConfig.url,
            specialty: flowiseConfig.specialty,
            userId: user.id,
            vectorStoreId: vectorStoreId,
            openaiApiKey: process.env.OPENAI_API_KEY
          }
        })
      };

    } catch (error) {
      console.error('❌ Auth handler error:', error);
      
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin, DEFAULT_CORS_OPTIONS)
        },
        body: JSON.stringify({ 
          error: 'Internal server error',
          details: error.message 
        })
      };
    }
  }
  
  // SECURITY: Validate origin before processing chat requests
  if (origin && !isOriginAllowed(origin, DEFAULT_CORS_OPTIONS.allowedOrigins)) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'CORS policy violation',
        message: 'Origin not allowed for Flowise API'
      })
    };
  }
  
  console.log('Flowise handler called:', {
    method: event.httpMethod,
    path: event.path,
    hasBody: !!event.body
  });

  // Handle OPTIONS for CORS with secure validation
  if (event.httpMethod === 'OPTIONS') {
    const { handleCorsPreflightRequest } = require('./utils/cors');
    return handleCorsPreflightRequest(event);
  }

  try {
    // Check authentication
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('AUTH_001', origin, {
        operation: 'flowise-chat',
        requestId: `flowise_${Date.now()}`
      });
    }

    // Decode JWT token
    const token = authHeader.replace('Bearer ', '');
    const jwtPayload = decodeSupabaseJWT(token);
    
    if (!jwtPayload) {
      return createErrorResponse('AUTH_002', origin, {
        operation: 'flowise-chat',
        requestId: `flowise_${Date.now()}`
      });
    }

    // Check token expiration
    if (jwtPayload.exp && Date.now() >= jwtPayload.exp * 1000) {
      return createErrorResponse('AUTH_003', origin, {
        operation: 'flowise-chat',
        requestId: `flowise_${Date.now()}`
      });
    }

    // Get user profile to get specialty
    const profile = await getUserProfile(jwtPayload.id);
    const user = {
      ...jwtPayload,
      specialty: profile.specialty || jwtPayload.specialty,
      role: profile.role || jwtPayload.role
    };

    console.log('Authenticated user:', {
      id: user.id,
      email: user.email,
      specialty: user.specialty
    });

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin)
        },
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { message, conversationId, uploads, knowledgeBase } = body;

    if (!message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin)
        },
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Send to Flowise
    const result = await sendToFlowise(message, user, conversationId, uploads, knowledgeBase);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
      body: JSON.stringify({
        success: true,
        data: {
          message: result.text || result.response || 'Response received',
          sources: result.sourceDocuments || [],
          timestamp: new Date().toISOString(),
          chatId: conversationId || `${user.id}-${Date.now()}`,
          specialty: user.specialty
        }
      })
    };

  } catch (error) {
    console.error('Flowise handler error:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      timestamp: new Date().toISOString()
    });
    
    // If it's a timeout error, provide a simple message
    if (error.message.includes('timeout')) {
      console.log('Timeout occurred, but Flowise may still be processing...');
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin)
        },
        body: JSON.stringify({
          success: true,
          data: {
            message: `⏳ Your medical query is taking longer than expected to process. The AI system is working on complex medical analysis. Please try asking a simpler version of your question or break it into smaller parts.`,
            sources: [],
            timestamp: new Date().toISOString(),
            chatId: `processing-${Date.now()}`,
            specialty: 'general',
            note: 'Processing in background - check Flowise dashboard for full response.',
            isProcessing: true
          }
        })
      };
    }
    
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