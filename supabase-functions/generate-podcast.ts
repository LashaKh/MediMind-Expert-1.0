// @deno-types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Updated with working voice IDs
const MEDICAL_VOICES = {
  host: 'wyWA56cQNU2KqUW4eCsI',    // New working host voice
  expert: 'uYXf8XasLslADfZ2MB4u'   // New working expert voice
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPENAI_API_KEY_BETA') || '';

async function createVectorStore(name: string) {
  console.log(`Creating vector store: ${name}`);
  console.log(`OpenAI API Key present: ${!!OPENAI_API_KEY}`);
  
  const res = await fetch('https://api.openai.com/v1/vector_stores', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Vector store creation failed: ${res.status} - ${errorText}`);
    throw new Error(`Vector store create failed: ${res.status} - ${errorText}`);
  }
  
  const json = await res.json();
  console.log(`Vector store created successfully: ${json.id}`);
  return json.id as string;
}

async function attachFiles(vectorStoreId: string, fileIds: string[]) {
  if (fileIds.length === 0) {
    console.log('No files to attach to vector store');
    return;
  }
  
  console.log(`Attaching ${fileIds.length} files to vector store: ${fileIds}`);
  
  const res = await fetch(`https://api.openai.com/v1/vector_stores/${vectorStoreId}/files/batch`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_ids: fileIds })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`File attachment failed: ${res.status} - ${errorText}`);
    throw new Error(`Vector store attach failed: ${res.status} - ${errorText}`);
  }
  
  console.log(`Files attached successfully to vector store ${vectorStoreId}`);
}

async function planScriptGrounded(vectorStoreId: string | null, docTitles: string[], specialty: string, style: string, title: string) {
  console.log(`Planning script - Vector Store ID: ${vectorStoreId}, Doc Titles: ${docTitles}, Style: ${style}`);
  
  const system = `You are a senior medical scriptwriter. Generate a podcast script grounded ONLY in the provided documents. If uncertain, state uncertainty.
Return STRICT JSON with keys: style, specialty, speakers, chapters, citations.
- speakers: host/expert with displayName and voiceId
- chapters: 3-4 chapters, each with segments: [{id, speaker: 'host'|'expert', text}]
- citations: array referencing sources; include title and a short snippet if retrieved.`;

  const prompt = {
    instruction: 'Create a grounded script with citations.',
    title,
    specialty,
    style,
    notes: 'Keep language clinical but accessible. Avoid markdown in text fields.'
  };

  try {
    if (vectorStoreId) {
      console.log(`Attempting to use vector store ${vectorStoreId} for script generation`);
      
      // Use Responses API with file_search over the vector store
      const res = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-2024-08-06',
          input: [
            { role: 'system', content: system },
            { role: 'user', content: [{ type: 'input_text', text: JSON.stringify(prompt) }] }
          ],
          tools: [{ type: 'file_search' }],
          attachments: [{ vector_store_id: vectorStoreId }],
          temperature: 0.5,
          max_output_tokens: 4000,
          response_format: { type: 'json_object' }
        })
      });
      
      if (res.ok) {
        const json = await res.json();
        const content = json.output?.[0]?.content?.[0]?.text || json.output_text || json.response?.output_text || json?.choices?.[0]?.message?.content || '{}';
        console.log(`Script generated successfully using vector store`);
        return JSON.parse(content);
      } else {
        const errorText = await res.text();
        console.error(`OpenAI Responses API failed: ${res.status} - ${errorText}`);
      }
    } else {
      console.log('No vector store available, using fallback script');
    }
  } catch (error) {
    console.error(`Script generation error: ${error instanceof Error ? error.message : error}`);
  }

  // Fallback (no retrieval) - now with correct voice IDs
  console.log('Using fallback script generation');
  return {
    style,
    specialty,
    speakers: {
      host: { role: 'host', displayName: 'Host', voiceId: MEDICAL_VOICES.host },
      expert: { role: 'expert', displayName: 'Expert', voiceId: MEDICAL_VOICES.expert }
    },
    citations: (docTitles || []).slice(0, 3).map((t, i) => ({ id: `c${i+1}`, sourceId: `src_${i+1}`, title: t })),
    chapters: [
      { id: 'ch1', title: 'Overview', segments: [
        { id: 'u1', speaker: 'host', text: `Welcome to our ${specialty} review: ${title}.` },
        { id: 'u2', speaker: 'expert', text: 'We will summarize the most actionable findings from the selected sources.' }
      ]},
      { id: 'ch2', title: 'Key Evidence', segments: [
        { id: 'u3', speaker: 'expert', text: 'Key evidence points with conservative recommendations and safety checks.' }
      ]},
      { id: 'ch3', title: 'Clinical Takeaways', segments: [
        { id: 'u4', speaker: 'host', text: 'Main takeaways, red flags, and follow-up considerations.' }
      ]}
    ]
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    console.log('🎙️ Enhanced 3-Agent Podcast generation request received');
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { userId, documentIds, title, description, synthesisStyle, specialty, vectorStoreRetentionDays } = body as {
      userId: string; documentIds: string[]; title: string; description?: string; synthesisStyle: string; specialty: string; vectorStoreRetentionDays?: number;
    };

    console.log(`Request details:`, {
      userId,
      documentCount: documentIds?.length || 0,
      documentIds,
      title,
      synthesisStyle,
      specialty
    });

    if (!userId || !documentIds?.length || !title) return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Use 3-agent orchestrator for enhanced podcast generation
    console.log('🎭 Delegating to 3-agent orchestrator...');
    
    try {
      const orchestratorResponse = await fetch(`${SUPABASE_URL}/functions/v1/orchestrate-3-agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          userId,
          documentIds,
          title,
          description,
          synthesisStyle,
          specialty,
          vectorStoreRetentionDays
        })
      });

      if (orchestratorResponse.ok) {
        const orchestratorResult = await orchestratorResponse.json();
        
        console.log('✅ 3-agent orchestration completed successfully:', {
          podcastId: orchestratorResult.podcastId,
          queuePosition: orchestratorResult.queuePosition,
          agentsUsed: orchestratorResult.metadata.agentsUsed,
          qualityScore: orchestratorResult.metadata.qualityScore
        });

        return new Response(JSON.stringify({
          status: 'queued',
          podcastId: orchestratorResult.podcastId,
          queuePosition: orchestratorResult.queuePosition,
          estimatedWaitTime: orchestratorResult.estimatedWaitTime,
          enhancedGeneration: {
            agentsUsed: orchestratorResult.metadata.agentsUsed,
            qualityScore: orchestratorResult.metadata.qualityScore,
            processingTime: orchestratorResult.metadata.totalProcessingTime,
            contentAnalysisCompleted: true,
            scriptWritingCompleted: true,
            finalizationCompleted: true
          },
          debug: {
            method: '3-agent-orchestration',
            agentResults: orchestratorResult.agentResults
          }
        }), { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } else {
        const orchestratorError = await orchestratorResponse.text();
        console.error('❌ 3-agent orchestration failed:', orchestratorResponse.status, orchestratorError);
        
        // Fall back to original single-agent approach
        console.log('⬇️ Falling back to single-agent generation...');
      }
    } catch (orchestratorError) {
      console.error('❌ 3-agent orchestrator error:', orchestratorError);
      console.log('⬇️ Falling back to single-agent generation...');
    }

    // FALLBACK: Original single-agent approach
    console.log('📝 Using fallback single-agent generation');

    // Validate user
    const { data: user } = await supabase.auth.admin.getUserById(userId);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Create podcast row
    const { data: podcast, error: podcastError } = await supabase
      .from('ai_podcasts')
      .insert({ user_id: userId, title, description, synthesis_style: synthesisStyle, specialty, voice_settings: MEDICAL_VOICES, status: 'pending' })
      .select()
      .single();
    if (podcastError || !podcast) return new Response(JSON.stringify({ error: 'Failed to create podcast record' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    console.log(`Podcast record created: ${podcast.id}`);

    // Collect OpenAI file ids from user_documents table
    console.log(`🔍 Looking up user documents for IDs: ${documentIds}`);
    const { data: userDocs } = await supabase
      .from('user_documents')
      .select('id, title, openai_file_id, upload_status')
      .in('id', documentIds)
      .eq('user_id', userId);

    let fileIds: string[] = [];
    let docTitles: string[] = [];
    let processedDocs = 0;
    let pendingDocs = 0;
    let failedDocs = 0;

    if (userDocs && userDocs.length > 0) {
      userDocs.forEach((doc: any) => {
        if (doc.upload_status === 'completed' && doc.openai_file_id) {
          fileIds.push(doc.openai_file_id);
          docTitles.push(doc.title);
          processedDocs++;
        } else if (doc.upload_status === 'processing') {
          pendingDocs++;
        } else if (doc.upload_status === 'failed') {
          failedDocs++;
        }
      });
    }

    console.log(`📊 Document processing status:`, {
      totalDocs: userDocs?.length || 0,
      processedDocs,
      pendingDocs,
      failedDocs,
      readyFileIds: fileIds.length,
      userDocs: userDocs
    });

    // Fallback to user_documents if no documents found
    if (fileIds.length === 0) {
      console.log('📋 No podcast documents found, checking user_documents table as fallback');
      const { data: userDocs } = await supabase
        .from('user_documents')
        .select('id, title, openai_file_id')
        .in('id', documentIds)
        .eq('user_id', userId);
      fileIds = (userDocs || []).map((d: any) => d.openai_file_id).filter((x: string | null) => !!x);
      docTitles = (userDocs || []).map((d: any) => d.title).filter(Boolean);
      
      console.log(`📋 User documents fallback:`, {
        docs: userDocs?.length || 0,
        fileIds: fileIds.length,
        docTitles: docTitles.length,
        userDocs: userDocs
      });
    }

    // Create ephemeral vector store and attach files
    let vectorStoreId: string | null = null;
    let vectorStoreError: string | null = null;
    
    console.log(`OpenAI processing - API Key present: ${!!OPENAI_API_KEY}, File IDs: ${fileIds.length}`);
    
    if (OPENAI_API_KEY) {
      try {
        vectorStoreId = await createVectorStore(`podcast_${podcast.id}_${Date.now()}`);
        if (fileIds.length) {
          await attachFiles(vectorStoreId, fileIds);
        } else {
          console.warn('No OpenAI file IDs found for document processing');
        }
      } catch (error) {
        vectorStoreError = error instanceof Error ? error.message : 'Unknown vector store error';
        console.error(`Vector store creation/attachment failed: ${vectorStoreError}`);
        vectorStoreId = null;
      }
    } else {
      console.error('No OpenAI API key available');
      vectorStoreError = 'No OpenAI API key configured';
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * (vectorStoreRetentionDays || 7)).toISOString();

    // Grounded script via retrieval
    const script = await planScriptGrounded(vectorStoreId, docTitles, specialty, synthesisStyle, title);

    // Ensure voices present with updated IDs
    if (!script.speakers?.host?.voiceId) script.speakers.host = { role: 'host', displayName: script.speakers?.host?.displayName || 'Host', voiceId: MEDICAL_VOICES.host };
    if (!script.speakers?.expert?.voiceId) script.speakers.expert = { role: 'expert', displayName: script.speakers?.expert?.displayName || 'Expert', voiceId: MEDICAL_VOICES.expert };

    // Add debug info to script
    script.debug = {
      vectorStoreId,
      vectorStoreError,
      documentsFound: userDocs?.length || 0,
      fileIdsFound: fileIds.length,
      openaiKeyPresent: !!OPENAI_API_KEY
    };

    await supabase
      .from('ai_podcasts')
      .update({ script, podcast_vector_store_id: vectorStoreId, vector_store_expires_at: expiresAt })
      .eq('id', podcast.id);

    console.log(`Script generated and saved:`, {
      vectorStoreId,
      scriptGenerated: !!script,
      chapters: script.chapters?.length || 0,
      error: vectorStoreError
    });

    // Enqueue
    const { count } = await supabase
      .from('podcast_queue')
      .select('id', { count: 'exact', head: true })
      .in('status', ['waiting', 'processing']);
    const position = (count || 0) + 1;

    await supabase
      .from('podcast_queue')
      .insert({ user_id: userId, podcast_id: podcast.id, position, status: 'waiting', generation_settings: { synthesisStyle, voices: MEDICAL_VOICES } });

    console.log(`Podcast queued successfully - Position: ${position}`);

    return new Response(JSON.stringify({ 
      status: 'queued', 
      podcastId: podcast.id, 
      podcastVectorStoreId: vectorStoreId, 
      queuePosition: position, 
      estimatedWaitTime: Math.max(5, position * 5),
      debug: {
        method: 'single-agent-fallback',
        vectorStoreError,
        documentsProcessed: fileIds.length,
        openaiKeyPresent: !!OPENAI_API_KEY
      }
    }), { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Podcast generation failed:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});