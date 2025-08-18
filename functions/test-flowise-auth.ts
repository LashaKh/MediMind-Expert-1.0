import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const origin = event.headers.origin || event.headers.Origin;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Handle OPTIONS for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({
        status: 'success',
        message: 'Flowise auth function is deployed and working',
        timestamp: new Date().toISOString(),
        method: event.httpMethod,
        path: event.path,
        environment: {
          supabaseUrl: process.env.VITE_SUPABASE_URL ? 'configured' : 'missing',
          serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing',
          flowiseCardiology: process.env.FLOWISE_CARDIOLOGY_URL ? 'configured' : 'missing',
          flowiseObgyn: process.env.FLOWISE_OBGYN_URL ? 'configured' : 'missing'
        }
      })
    };

  } catch (error) {
    console.error('Test endpoint error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({ 
        status: 'error',
        error: error instanceof Error ? error.message : 'Test failed'
      })
    };
  }
};