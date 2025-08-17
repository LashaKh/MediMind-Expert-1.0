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
  const res = await fetch('https://api.openai.com/v1/vector_stores', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error(`Vector store create failed: ${res.status}`);
  const json = await res.json();
  return json.id as string;
}

async function attachFiles(vectorStoreId: string, fileIds: string[]) {
  if (fileIds.length === 0) return;
  const res = await fetch(`https://api.openai.com/v1/vector_stores/${vectorStoreId}/files/batch`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_ids: fileIds })
  });
  if (!res.ok) throw new Error(`Vector store attach failed: ${res.status}`);
}

// Comprehensive 3-step outline generation
async function generateComprehensiveOutline(vectorStoreId: string, specialty: string, title: string, style: string) {
  console.log('🔍 Step 1: Getting comprehensive document overview...');
  const overview = await getDocumentOverview(vectorStoreId);
  
  console.log('📋 Step 2: Mapping all document content...');
  const contentMap = await mapAllContent(vectorStoreId, overview);
  
  console.log('🎯 Step 3: Creating complete outline...');
  const outline = await createCompleteOutline(overview, contentMap, specialty, title, style);
  
  return {
    overview,
    contentMap,
    outline,
    queriesUsed: 2,
    coverageApproach: "comprehensive"
  };
}

// Step 1: Document Overview
async function getDocumentOverview(vectorStoreId: string): Promise<any> {
  const overviewQuery = `
    Analyze this ENTIRE medical document and provide a comprehensive structural overview:
    
    1. DOCUMENT METADATA:
       - Document type (research paper, clinical guidelines, textbook chapter, review article, etc.)
       - Approximate length/page count
       - Main medical specialty and sub-specialties covered
       - Intended audience (clinicians, researchers, students, patients)
       - Publication type and evidence level
       - Author credentials and institutional affiliations
    
    2. STRUCTURAL ANALYSIS:
       - Complete table of contents or section listing
       - Chapter/section titles in hierarchical order
       - Page number ranges or location markers for each section
       - Document organization flow (introduction → methods → results → discussion, etc.)
       - Any appendices, glossaries, reference sections, or supplementary material
       - Figures, tables, charts, or visual content distribution
    
    3. CONTENT SCOPE IDENTIFICATION:
       - Primary medical conditions/diseases discussed
       - Secondary or related conditions mentioned
       - Diagnostic approaches and methodologies covered
       - Treatment modalities and interventions presented
       - Clinical guidelines, recommendations, or protocols referenced
       - Patient populations or demographics addressed
       - Geographic or institutional context (if applicable)
    
    4. ACADEMIC/CLINICAL CONTEXT:
       - Research methodology (if applicable)
       - Evidence levels and study types referenced
       - Clinical trial data or case studies included
       - Guideline organizations or medical societies cited
       - Publication date and currency of information
       - Conflicts of interest or funding sources mentioned
    
    5. CONTENT COMPLEXITY ASSESSMENT:
       - Technical difficulty level (basic, intermediate, advanced)
       - Medical terminology density
       - Prerequisite knowledge requirements
       - Target knowledge level for different audience segments
       - Areas requiring specialized expertise to understand
    
    Scan the COMPLETE document from beginning to end to ensure nothing is overlooked.
    Provide a comprehensive structural map that captures the document's full scope and organization.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-2024-08-06',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert medical document analyst. Provide comprehensive document overviews by analyzing entire documents systematically. Focus on structure, content scope, and academic context.' 
        },
        { 
          role: 'user', 
          content: overviewQuery
        }
      ],
      tools: [{
        type: 'file_search',
        file_search: {
          vector_store_ids: [vectorStoreId]
        }
      }],
      temperature: 0.2,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error in document overview: ${response.status}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || '';
}

// Step 2: Content Mapping
async function mapAllContent(vectorStoreId: string, overview: any): Promise<any> {
  const contentMappingQuery = `
    Based on this comprehensive document overview:
    ${typeof overview === 'string' ? overview : JSON.stringify(overview)}
    
    Now perform SYSTEMATIC CONTENT EXTRACTION from the entire document:
    
    1. SECTION-BY-SECTION CONTENT ANALYSIS:
       For EACH major section identified in the overview, extract:
       
       A. MEDICAL CONDITIONS & DISEASES:
          - Primary conditions/diseases discussed in this section
          - Secondary or comorbid conditions mentioned
          - Disease classifications, staging, or severity levels
          - Epidemiological data or prevalence information
          - Risk factors and predisposing conditions
          - Pathophysiology or disease mechanisms explained
       
       B. DIAGNOSTIC INFORMATION:
          - Diagnostic criteria and clinical definitions
          - Laboratory tests, biomarkers, or diagnostic markers
          - Imaging studies or diagnostic procedures
          - Physical examination findings or clinical signs
          - Differential diagnosis considerations
          - Diagnostic algorithms or decision trees
       
       C. TREATMENT & MANAGEMENT:
          - Pharmacological treatments and medications
          - Surgical procedures or interventions
          - Non-pharmacological therapies
          - Lifestyle modifications or preventive measures
          - Monitoring and follow-up protocols
          - Treatment algorithms or clinical pathways
       
       D. CLINICAL EVIDENCE & GUIDELINES:
          - Clinical practice guidelines referenced
          - Research studies or clinical trials cited
          - Evidence levels and recommendation grades
          - Expert consensus statements
          - Quality metrics or performance indicators
          - Outcome measures and endpoints
       
       E. PATIENT CARE CONSIDERATIONS:
          - Special populations (pediatric, elderly, pregnant)
          - Contraindications and precautions
          - Adverse effects or complications
          - Patient education and counseling points
          - Shared decision-making considerations
          - Cultural or social factors affecting care
    
    2. CROSS-SECTION CONTENT THEMES:
       - Medical concepts that span multiple sections
       - Recurring clinical themes or principles
       - Progressive complexity or learning pathways
       - Connections between different medical domains
       - Integrated care approaches or multidisciplinary concepts
    
    3. SPECIALIZED CONTENT IDENTIFICATION:
       - Advanced or specialized medical concepts
       - Cutting-edge research or emerging therapies
       - Controversial or debated topics
       - Areas requiring specialist consultation
       - Novel diagnostic or treatment approaches
    
    4. EDUCATIONAL & CLINICAL PEARLS:
       - Key learning objectives or takeaways
       - Clinical pearls or practical tips
       - Common pitfalls or errors to avoid
       - Memory aids or clinical mnemonics
       - Best practice recommendations
    
    5. SUPPORTING MATERIALS:
       - Important figures, charts, or diagrams
       - Tables with clinical data or reference values
       - Case studies, scenarios, or clinical vignettes
       - Appendices with supplementary information
       - Reference materials or additional resources
    
    COMPREHENSIVE EXTRACTION REQUIREMENTS:
    - Analyze EVERY section identified in the document overview
    - Include content from introduction through conclusion
    - Capture information from figures, tables, and captions
    - Extract content from appendices and supplementary sections
    - Note any region-specific or institution-specific information
    - Identify content suitable for different expertise levels
    
    Ensure NO section of the document is overlooked. Create a complete content map that could be used to reconstruct the document's clinical and educational value.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-2024-08-06',
      messages: [
        { 
          role: 'system', 
          content: 'You are a medical content extraction specialist. Systematically extract all medical content from documents, ensuring comprehensive coverage of every section. Focus on clinical relevance and educational value.' 
        },
        { 
          role: 'user', 
          content: contentMappingQuery
        }
      ],
      tools: [{
        type: 'file_search',
        file_search: {
          vector_store_ids: [vectorStoreId]
        }
      }],
      temperature: 0.1,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error in content mapping: ${response.status}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || '';
}

// Step 3: Complete Outline Generation
async function createCompleteOutline(
  overview: any, 
  contentMap: any, 
  specialty: string, 
  title: string, 
  style: string
): Promise<any> {
  
  const outlinePrompt = `
    Create a comprehensive ${style} podcast outline for "${title}" in ${specialty} specialty.
    
    COMPREHENSIVE DOCUMENT ANALYSIS:
    Document Overview: ${typeof overview === 'string' ? overview : JSON.stringify(overview)}
    
    Complete Content Map: ${typeof contentMap === 'string' ? contentMap : JSON.stringify(contentMap)}
    
    OUTLINE REQUIREMENTS:
    1. Create 3-5 logical chapters that organize ALL the medical content identified
    2. Each chapter should have 2-4 segments covering specific medical aspects
    3. Ensure COMPLETE coverage of all medical topics from the content map
    4. Include speaker role assignments (host vs expert) for dynamic conversation
    5. Maintain clinical accuracy and logical educational flow
    6. Target duration: 25 minutes total
    7. Balance accessibility with medical depth appropriate for ${specialty}
    
    PODCAST STRUCTURE REQUIREMENTS:
    {
      "title": "${title}",
      "style": "${style}",
      "specialty": "${specialty}",
      "speakers": {
        "host": {
          "role": "host",
          "displayName": "Dr. ${specialty} Host",
          "voiceId": "wyWA56cQNU2KqUW4eCsI"
        },
        "expert": {
          "role": "expert", 
          "displayName": "Dr. ${specialty} Expert",
          "voiceId": "uYXf8XasLslADfZ2MB4u"
        }
      },
      "chapters": [
        {
          "id": "chapter_1",
          "title": "Introduction and Clinical Context",
          "segments": [
            {
              "id": "segment_1_1",
              "speaker": "host",
              "text": "Natural conversational text for TTS generation"
            },
            {
              "id": "segment_1_2", 
              "speaker": "expert",
              "text": "Expert response with medical content"
            }
          ]
        }
      ],
      "citations": [
        {
          "id": "citation_1",
          "sourceId": "document_1",
          "title": "Primary source document"
        }
      ]
    }
    
    CONTENT INTEGRATION REQUIREMENTS:
    - Every major medical topic from the content map MUST be included
    - Organize content to follow logical clinical reasoning
    - Balance foundational concepts with advanced applications
    - Include practical clinical pearls and takeaways
    - Ensure smooth transitions between complex medical topics
    - Maintain engagement while preserving medical accuracy
    
    QUALITY STANDARDS:
    - Medical terminology must be accurate and current
    - Clinical recommendations must align with evidence-based guidelines
    - Content progression must support learning objectives
    - Speaker assignments must optimize content delivery
    - Time allocation must allow adequate coverage of all topics
    
    Focus on creating a podcast that would be valuable for ${specialty} professionals and comprehensively covers all content identified in the document analysis.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-2024-08-06',
      messages: [
        { 
          role: 'system', 
          content: `You are a medical education specialist and podcast producer. Create detailed, medically accurate podcast outlines that ensure comprehensive coverage of all document content. Always respond with valid JSON that includes complete content coverage from the provided analysis. Focus on ${specialty} specialty content and clinical relevance.` 
        },
        { 
          role: 'user', 
          content: outlinePrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error in outline generation: ${response.status}`);
  }

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}

async function planScriptGrounded(vectorStoreId: string | null, docTitles: string[], specialty: string, style: string, title: string) {
  try {
    if (vectorStoreId && OPENAI_API_KEY) {
      // Use comprehensive 3-step approach
      console.log('🔍 Using comprehensive 3-step outline generation...');
      const comprehensiveResult = await generateComprehensiveOutline(vectorStoreId, specialty, title, style);
      
      // Ensure voices are set correctly
      if (!comprehensiveResult.outline.speakers?.host?.voiceId) {
        comprehensiveResult.outline.speakers.host = { 
          role: 'host', 
          displayName: comprehensiveResult.outline.speakers?.host?.displayName || 'Host', 
          voiceId: MEDICAL_VOICES.host 
        };
      }
      if (!comprehensiveResult.outline.speakers?.expert?.voiceId) {
        comprehensiveResult.outline.speakers.expert = { 
          role: 'expert', 
          displayName: comprehensiveResult.outline.speakers?.expert?.displayName || 'Expert', 
          voiceId: MEDICAL_VOICES.expert 
        };
      }

      return comprehensiveResult.outline;
    }
  } catch (error) {
    console.error('Comprehensive outline generation failed, using fallback:', error);
  }

  // Fallback (no retrieval) - now with correct voice IDs
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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { userId, documentIds, title, description, synthesisStyle, specialty, vectorStoreRetentionDays } = body as {
      userId: string; documentIds: string[]; title: string; description?: string; synthesisStyle: string; specialty: string; vectorStoreRetentionDays?: number;
    };

    if (!userId || !documentIds?.length || !title) return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

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

    // Collect OpenAI file ids
    const { data: userDocs } = await supabase
      .from('user_documents')
      .select('id, title, openai_file_id')
      .in('id', documentIds)
      .eq('user_id', userId);

    let fileIds: string[] = (userDocs || []).map((d: any) => d.openai_file_id).filter((x: string | null) => !!x);
    let docTitles: string[] = (userDocs || []).map((d: any) => d.title).filter(Boolean);

    if (fileIds.length === 0) {
      const { data: podDocs } = await supabase
        .from('podcast_documents')
        .select('id, title, openai_file_id')
        .in('id', documentIds)
        .eq('user_id', userId);
      fileIds = (podDocs || []).map((d: any) => d.openai_file_id).filter((x: string | null) => !!x);
      docTitles = (podDocs || []).map((d: any) => d.title).filter(Boolean);
    }

    // Create ephemeral vector store and attach files
    let vectorStoreId: string | null = null;
    if (OPENAI_API_KEY) {
      vectorStoreId = await createVectorStore(`podcast_${podcast.id}_${Date.now()}`);
      if (fileIds.length) await attachFiles(vectorStoreId, fileIds);
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * (vectorStoreRetentionDays || 7)).toISOString();

    // Use comprehensive outline generation approach
    let script;
    try {
      // Step 1: Document Overview
      console.log('🔍 Step 1: Starting comprehensive document overview...');
      const overviewResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/document-overview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          vectorStoreId,
          podcastId: podcast.id
        })
      });

      if (!overviewResponse.ok) {
        throw new Error('Document overview step failed');
      }

      const overviewResult = await overviewResponse.json();
      console.log('✅ Step 1 completed: Document overview generated');

      // Step 2: Content Mapping
      console.log('📋 Step 2: Starting content mapping...');
      const mappingResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/content-mapping`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          vectorStoreId,
          podcastId: podcast.id,
          overview: overviewResult.overview
        })
      });

      if (!mappingResponse.ok) {
        throw new Error('Content mapping step failed');
      }

      const mappingResult = await mappingResponse.json();
      console.log('✅ Step 2 completed: Content mapping generated');

      // Step 3: Comprehensive Outline
      console.log('🎯 Step 3: Starting comprehensive outline generation...');
      const outlineResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/comprehensive-outline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          podcastId: podcast.id,
          specialty,
          title,
          style: synthesisStyle,
          targetDuration: 25,
          overview: overviewResult.overview,
          contentMap: mappingResult.contentMap
        })
      });

      if (!outlineResponse.ok) {
        throw new Error('Comprehensive outline step failed');
      }

      const outlineResult = await outlineResponse.json();
      script = outlineResult.outline;
      console.log('✅ Step 3 completed: Comprehensive outline generated');

    } catch (error) {
      console.error('Comprehensive outline generation failed, falling back to basic approach:', error);
      // Fallback to original approach
      script = await planScriptGrounded(vectorStoreId, docTitles, specialty, synthesisStyle, title);
    }

    // Ensure voices present with updated IDs
    if (!script.speakers?.host?.voiceId) script.speakers.host = { role: 'host', displayName: script.speakers?.host?.displayName || 'Host', voiceId: MEDICAL_VOICES.host };
    if (!script.speakers?.expert?.voiceId) script.speakers.expert = { role: 'expert', displayName: script.speakers?.expert?.displayName || 'Expert', voiceId: MEDICAL_VOICES.expert };

    await supabase
      .from('ai_podcasts')
      .update({ 
        script, 
        podcast_vector_store_id: vectorStoreId, 
        vector_store_expires_at: expiresAt,
        outline_generation_approach: 'comprehensive'
      })
      .eq('id', podcast.id);

    // Enqueue
    const { count } = await supabase
      .from('podcast_queue')
      .select('id', { count: 'exact', head: true })
      .in('status', ['waiting', 'processing']);
    const position = (count || 0) + 1;

    await supabase
      .from('podcast_queue')
      .insert({ user_id: userId, podcast_id: podcast.id, position, status: 'waiting', generation_settings: { synthesisStyle, voices: MEDICAL_VOICES } });

    return new Response(JSON.stringify({ status: 'queued', podcastId: podcast.id, podcastVectorStoreId: vectorStoreId, queuePosition: position, estimatedWaitTime: Math.max(5, position * 5) }), { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});