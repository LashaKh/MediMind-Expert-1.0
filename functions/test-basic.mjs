export const handler = async (event, context) => {
  console.log('✅ Basic test function called successfully!');

  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    },
    body: JSON.stringify({
      success: true,
      message: 'Basic function working without any dependencies!',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      path: event.path,
      // Don't try to access env vars that might not exist
      testData: {
        functionName: 'test-basic',
        version: '1.0.0',
        netlifyContext: context.clientContext ? 'available' : 'not available'
      }
    })
  };
};