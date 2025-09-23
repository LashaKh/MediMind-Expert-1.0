// Simple health check for API endpoints
export const handler = async (event, _context) => {
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
    const functionStatus = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      functions: {
        'flowise-simple': 'deployed',
        'api-health': 'deployed'
      },
      supabase: {
        url: process.env.VITE_SUPABASE_URL ? 'configured' : 'missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing'
      },
      flowise: {
        cardiology: process.env.FLOWISE_CARDIOLOGY_URL ? 'configured' : 'missing',
        obgyn: process.env.FLOWISE_OBGYN_URL ? 'configured' : 'missing'
      }
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({
        status: 'healthy',
        data: functionStatus
      })
    };

  } catch (error) {
    console.error('Health check error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({ 
        status: 'error',
        error: error instanceof Error ? error.message : 'Health check failed'
      })
    };
  }
};