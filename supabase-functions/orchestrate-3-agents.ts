// @deno-types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface OrchestrationRequest {
  userId: string;
  documentIds: string[];
  title: string;
  description?: string;
  synthesisStyle: string;
  specialty: string;
  vectorStoreRetentionDays?: number;
}

interface OrchestrationResult {
  success: boolean;
  podcastId: string;
  queuePosition: number;
  estimatedWaitTime: number;
  agentResults: {
    contentAnalysis: any;
    scriptGeneration: any;
    finalization: any;
  };
  metadata: {
    orchestrationTime: string;
    agentsUsed: string[];
    totalProcessingTime: number;
    qualityScore: number;
  };
}

// Voice IDs for ElevenLabs TTS
const MEDICAL_VOICES = {
  host: 'wyWA56cQNU2KqUW4eCsI',
  expert: 'uYXf8XasLslADfZ2MB4u'
};

async function createVectorStore(name: string): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  
  console.log(`Creating vector store: ${name}`);
  
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

async function attachFiles(vectorStoreId: string, fileIds: string[]): Promise<void> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  
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

async function orchestrate3AgentPipeline(request: OrchestrationRequest): Promise<OrchestrationResult> {
  const startTime = Date.now();
  console.log(`🚀 Starting 3-agent podcast orchestration for: ${request.title}`);
  
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Validate user
  const { data: user } = await supabase.auth.admin.getUserById(request.userId);
  if (!user) {
    throw new Error('Unauthorized user');
  }

  // Create podcast record
  const { data: podcast, error: podcastError } = await supabase
    .from('ai_podcasts')
    .insert({ 
      user_id: request.userId, 
      title: request.title, 
      description: request.description, 
      synthesis_style: request.synthesisStyle, 
      specialty: request.specialty, 
      voice_settings: MEDICAL_VOICES, 
      status: 'processing' 
    })
    .select()
    .single();
  
  if (podcastError || !podcast) {
    throw new Error('Failed to create podcast record');
  }

  console.log(`📝 Podcast record created: ${podcast.id}`);

  try {
    // Get processed documents from both podcast_documents and user_documents tables
    // First try podcast_documents (podcast-specific uploads)
    const { data: podcastDocs } = await supabase
      .from('podcast_documents')
      .select('id, title, openai_file_id, openai_upload_status')
      .in('id', request.documentIds)
      .eq('user_id', request.userId);

    const fileIds: string[] = [];
    const docTitles: string[] = [];
    
    // Process podcast documents
    if (podcastDocs && podcastDocs.length > 0) {
      podcastDocs.forEach((doc: any) => {
        if (doc.openai_upload_status === 'completed' && doc.openai_file_id) {
          fileIds.push(doc.openai_file_id);
          docTitles.push(doc.title);
        }
      });
    }

    // Fallback: Check user_documents for any IDs not found in podcast_documents
    const missingIds = request.documentIds.filter(id => !podcastDocs?.some(doc => doc.id === id));
    
    if (missingIds.length > 0) {
      const { data: userDocs } = await supabase
        .from('user_documents')
        .select('id, title, openai_file_id, upload_status')
        .in('id', missingIds)
        .eq('user_id', request.userId);
      
      if (userDocs && userDocs.length > 0) {
        userDocs.forEach((doc: any) => {
          if (doc.upload_status === 'completed' && doc.openai_file_id) {
            fileIds.push(doc.openai_file_id);
            docTitles.push(doc.title);
          }
        });
      }
    }

    console.log(`📚 Found ${fileIds.length} processed documents for pipeline`);

    // Create ephemeral vector store and attach files
    let vectorStoreId: string | null = null;
    
    try {
      vectorStoreId = await createVectorStore(`3agent_podcast_${podcast.id}_${Date.now()}`);
      if (fileIds.length > 0) {
        await attachFiles(vectorStoreId, fileIds);
      }
    } catch (error) {
      console.error(`Vector store creation failed: ${error instanceof Error ? error.message : error}`);
      vectorStoreId = null;
    }

    // AGENT 1: Enhanced Content Analysis using Comprehensive Approach
    console.log(`🔍 AGENT 1: Enhanced Content Analysis using 3-step comprehensive approach...`);
    
    // Step 1a: Document Overview  
    console.log(`🔍 Step 1a: Document Overview Analysis...`);
    const overviewResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/document-overview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        userId: request.userId,
        vectorStoreId: vectorStoreId,
        podcastId: podcast.id
      })
    });

    if (!overviewResponse.ok) {
      const errorText = await overviewResponse.text();
      throw new Error(`Document overview failed: ${overviewResponse.status} - ${errorText}`);
    }

    const overviewResult = await overviewResponse.json();
    console.log(`✅ Step 1a completed: Document overview generated`);

    // Step 1b: Content Mapping
    console.log(`📋 Step 1b: Content Mapping Analysis...`);
    const mappingResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/content-mapping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        userId: request.userId,
        vectorStoreId: vectorStoreId,
        podcastId: podcast.id,
        overview: overviewResult.overview
      })
    });

    if (!mappingResponse.ok) {
      const errorText = await mappingResponse.text();
      throw new Error(`Content mapping failed: ${mappingResponse.status} - ${errorText}`);
    }

    const mappingResult = await mappingResponse.json();
    console.log(`✅ Step 1b completed: Content mapping generated`);

    // Combine results for legacy compatibility
    const analysisResult = {
      contentPlan: {
        overview: overviewResult.overview,
        contentMap: mappingResult.contentMap,
        chapters: mappingResult.contentMap?.chapters || [],
        metadata: {
          documentOverview: overviewResult.overview,
          comprehensiveMapping: mappingResult.contentMap,
          analysisApproach: 'comprehensive-3-step'
        }
      }
    };
    
    console.log(`✅ AGENT 1 completed: Enhanced analysis with ${analysisResult.contentPlan.chapters?.length || 0} chapters planned`);

    // AGENT 2: Comprehensive Outline Generation
    console.log(`🎯 AGENT 2: Comprehensive Outline Generation...`);
    const outlineResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/comprehensive-outline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        userId: request.userId,
        podcastId: podcast.id,
        specialty: request.specialty,
        title: request.title,
        style: request.synthesisStyle,
        targetDuration: 25,
        overview: overviewResult.overview,
        contentMap: mappingResult.contentMap
      })
    });

    if (!outlineResponse.ok) {
      const errorText = await outlineResponse.text();
      throw new Error(`Comprehensive outline generation failed: ${outlineResponse.status} - ${errorText}`);
    }

    const outlineResult = await outlineResponse.json();
    
    // Convert comprehensive outline to script format for compatibility
    const scriptResult = {
      script: outlineResult.outline,
      metadata: {
        totalSegments: outlineResult.outline?.chapters?.reduce((total: number, chapter: any) => 
          total + (chapter.segments?.length || 0), 0) || 0,
        generationApproach: 'comprehensive-outline',
        originalOutline: outlineResult
      }
    };
    
    console.log(`✅ AGENT 2 completed: ${scriptResult.script.chapters?.length || 0} chapters with ${scriptResult.metadata.totalSegments} segments using comprehensive approach`);

    // AGENT 3: Script Finalizer
    console.log(`🎯 AGENT 3: Script Finalization...`);
    const finalizationResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/script-finalizer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        userId: request.userId,
        script: scriptResult.script,
        optimizeForTTS: true
      })
    });

    if (!finalizationResponse.ok) {
      const errorText = await finalizationResponse.text();
      throw new Error(`Script finalization failed: ${finalizationResponse.status} - ${errorText}`);
    }

    const finalizationResult = await finalizationResponse.json();
    console.log(`✅ AGENT 3 completed: ${Math.round(finalizationResult.finalizedScript.metadata.totalEstimatedDurationSeconds / 60)} min duration, ${finalizationResult.finalizedScript.metadata.readabilityScore} readability score`);

    // Save final script to podcast record
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * (request.vectorStoreRetentionDays || 7)).toISOString();
    
    await supabase
      .from('ai_podcasts')
      .update({ 
        script: finalizationResult.finalizedScript,
        podcast_vector_store_id: vectorStoreId,
        vector_store_expires_at: expiresAt,
        status: 'script_ready',
        outline_generation_approach: 'comprehensive-3-agent',
        document_overview: overviewResult.overview,
        content_map: mappingResult.contentMap,
        comprehensive_outline: outlineResult.outline,
        outline_metadata: {
          approach: 'comprehensive-3-agent',
          agentsUsed: ['document-overview', 'content-mapping', 'comprehensive-outline', 'script-finalizer'],
          totalProcessingSteps: 4
        }
      })
      .eq('id', podcast.id);

    // Add to podcast queue for audio generation
    const { count } = await supabase
      .from('podcast_queue')
      .select('id', { count: 'exact', head: true })
      .in('status', ['waiting', 'processing']);
    
    const position = (count || 0) + 1;

    await supabase
      .from('podcast_queue')
      .insert({ 
        user_id: request.userId, 
        podcast_id: podcast.id, 
        position, 
        status: 'waiting', 
        generation_settings: { 
          synthesisStyle: request.synthesisStyle, 
          voices: MEDICAL_VOICES,
          agents: ['content-analyzer-planner', 'medical-script-writer', 'script-finalizer']
        } 
      });

    const totalProcessingTime = Date.now() - startTime;
    console.log(`🎉 3-Agent orchestration completed in ${totalProcessingTime}ms`);

    return {
      success: true,
      podcastId: podcast.id,
      queuePosition: position,
      estimatedWaitTime: Math.max(5, position * 5),
      agentResults: {
        contentAnalysis: analysisResult.contentPlan,
        scriptGeneration: scriptResult.script,
        finalization: finalizationResult.finalizedScript
      },
      metadata: {
        orchestrationTime: new Date().toISOString(),
        agentsUsed: ['content-analyzer-planner', 'medical-script-writer', 'script-finalizer'],
        totalProcessingTime,
        qualityScore: finalizationResult.finalizedScript.metadata.readabilityScore
      }
    };

  } catch (error) {
    // Update podcast status to failed
    await supabase
      .from('ai_podcasts')
      .update({ status: 'failed', error_message: error instanceof Error ? error.message : 'Unknown error' })
      .eq('id', podcast.id);
    
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  try {
    console.log('🎭 3-Agent Orchestrator starting...');
    
    const body = await req.json() as OrchestrationRequest;
    const { userId, documentIds, title, description, synthesisStyle, specialty, vectorStoreRetentionDays } = body;

    console.log(`🎬 Orchestration request:`, {
      userId,
      documentCount: documentIds?.length || 0,
      title,
      synthesisStyle,
      specialty
    });

    if (!userId || !documentIds?.length || !title || !synthesisStyle || !specialty) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Execute 3-agent pipeline
    const result = await orchestrate3AgentPipeline({
      userId,
      documentIds,
      title,
      description,
      synthesisStyle,
      specialty,
      vectorStoreRetentionDays
    });

    console.log(`✅ 3-Agent orchestration successful:`, {
      podcastId: result.podcastId,
      queuePosition: result.queuePosition,
      qualityScore: result.metadata.qualityScore,
      processingTime: result.metadata.totalProcessingTime
    });

    return new Response(JSON.stringify(result), { 
      status: 202, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('❌ 3-Agent orchestration failed:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : '3-Agent orchestration failed',
      details: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});