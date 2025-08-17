import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'GET' && req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const authHeader = req.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Authorization required' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const token = authHeader.replace('Bearer ', '');
    const { data: userCheck } = await supabase.auth.getUser(token);
    if (!userCheck?.user) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    let podcastId: string;
    let userId: string = userCheck.user.id;

    // FIX: Read body only once and store result to avoid "Body already consumed" error
    let requestBody: any = null;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      podcastId = url.searchParams.get('podcastId') || '';
      const userIdParam = url.searchParams.get('userId');
      if (userIdParam) userId = userIdParam;
    } else {
      // POST method - read body only once
      try {
        requestBody = await req.json();
        podcastId = requestBody.podcastId || '';
        if (requestBody.userId) userId = requestBody.userId;
      } catch (error) {
        console.error('Failed to parse request body:', error);
        return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    if (!podcastId) return new Response(JSON.stringify({ error: 'podcastId is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: podcast, error: podcastError } = await supabase
      .from('ai_podcasts')
      .select('*, podcast_queue (id, position, status)')
      .eq('id', podcastId)
      .eq('user_id', userId)
      .single();

    if (podcastError || !podcast) return new Response(JSON.stringify({ error: 'Podcast not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Opportunistically trigger the processor if waiting
    const queue = (podcast as any).podcast_queue?.[0] || null;
    if (queue?.status === 'waiting') {
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/podcast-queue-processor`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      } catch (processorError) {
        console.log('Failed to trigger processor (non-critical):', processorError);
      }
    }

    return new Response(JSON.stringify({
      podcast,
      script: (podcast as any).script || null,
      podcastVectorStoreId: (podcast as any).podcast_vector_store_id || null,
      vectorStoreExpiresAt: (podcast as any).vector_store_expires_at || null,
      queue
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Podcast status error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});