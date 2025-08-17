import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

console.log('Edge function `check-playai-status` initializing...');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request (CORS preflight)');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const playaiApiKey = Deno.env.get('PLAYAI_API_KEY');
    const playaiUserId = Deno.env.get('PLAYAI_USER_ID');

    if (!supabaseUrl || !supabaseServiceKey || !playaiApiKey || !playaiUserId) {
      console.error('CRITICAL: Required environment variables not set.');
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Authentication failed:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Parse request body
    const body = await req.json();
    const { playnoteId } = body;

    if (!playnoteId) {
      return new Response(JSON.stringify({ error: 'playnoteId is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`Checking PlayAI status for playnote: ${playnoteId}`);

    try {
      // Call PlayAI API to check status
      const playaiResponse = await fetch(`https://api.play.ai/api/v1/playnotes/${playnoteId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${playaiApiKey}`, // Already correct
          'X-USER-ID': playaiUserId,
          'accept': 'application/json'
        }
      });

      if (!playaiResponse.ok) {
        console.error(`PlayAI API error: ${playaiResponse.status} - ${playaiResponse.statusText}`);
        const errorText = await playaiResponse.text();
        console.error('PlayAI error response:', errorText);
        
        return new Response(JSON.stringify({
          status: 'failed',
          error: `PlayAI API error: ${playaiResponse.status} - ${errorText}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 with error status to continue polling
        });
      }

      const playaiResult = await playaiResponse.json();
      console.log('PlayAI response:', playaiResult);

      // Map PlayAI status to our status format
      let mappedStatus: 'generating' | 'completed' | 'failed';
      let audioUrl: string | undefined;
      let duration: number | undefined;
      let progress: number | undefined;
      let detailedError: string | undefined;

      if (playaiResult.status === 'completed' && playaiResult.audioUrl) {
        mappedStatus = 'completed';
        audioUrl = playaiResult.audioUrl;
        duration = playaiResult.duration;
      } else if (playaiResult.status === 'failed' || playaiResult.status === 'error') {
        mappedStatus = 'failed';
        
        // Enhanced error detection and logging
        console.error('PlayAI generation failed:', {
          status: playaiResult.status,
          error: playaiResult.error,
          errorMessage: playaiResult.errorMessage,
          message: playaiResult.message,
          details: playaiResult.details,
          fullResponse: playaiResult
        });
        
        // Collect all available error information
        const errorParts = [];
        if (playaiResult.error) errorParts.push(`Error: ${playaiResult.error}`);
        if (playaiResult.errorMessage) errorParts.push(`Message: ${playaiResult.errorMessage}`);
        if (playaiResult.message) errorParts.push(`Info: ${playaiResult.message}`);
        if (playaiResult.details) errorParts.push(`Details: ${JSON.stringify(playaiResult.details)}`);
        
        detailedError = errorParts.length > 0 
          ? errorParts.join(' | ') 
          : `PlayAI generation failed with status: ${playaiResult.status}`;
          
        console.log('PlayAI generation failed:', {
          status: mappedStatus,
          error: detailedError,
          fullResponse: playaiResult
        });
      } else {
        mappedStatus = 'generating';
        progress = playaiResult.progress;
      }

      return new Response(JSON.stringify({
        status: mappedStatus,
        audioUrl,
        duration,
        progress,
        error: mappedStatus === 'failed' ? detailedError : undefined,
        playaiStatus: playaiResult.status,
        playaiResult: playaiResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (playaiError) {
      console.error('Error calling PlayAI API:', playaiError);
      return new Response(JSON.stringify({
        status: 'failed',
        error: `Failed to check PlayAI status: ${playaiError instanceof Error ? playaiError.message : 'Unknown error'}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 with error status to continue polling
      });
    }

  } catch (error) {
    console.error('Error in check-playai-status function:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal server error.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

console.log('Edge function `check-playai-status` is ready to serve requests.');