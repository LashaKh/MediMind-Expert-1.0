// @deno-types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

// Step 1: Document Overview
async function getDocumentOverview(vectorStoreId: string): Promise<any> {
  console.log('🔍 Step 1: Getting comprehensive document overview...');
  
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
    
    Return as structured JSON with clear sections for each analysis area.
  `;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-2024-08-06',
      input: [
        { 
          role: 'system', 
          content: 'You are an expert medical document analyst. Provide comprehensive document overviews by analyzing entire documents systematically. Focus on structure, content scope, and academic context. Always return valid JSON.' 
        },
        { 
          role: 'user', 
          content: [{ type: 'input_text', text: overviewQuery }]
        }
      ],
      tools: [{ type: 'file_search' }],
      attachments: [{ vector_store_id: vectorStoreId }],
      temperature: 0.2,
      max_output_tokens: 4000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Document overview API error: ${response.status} - ${errorText}`);
    throw new Error(`OpenAI API error in document overview: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const content = result.output?.[0]?.content?.[0]?.text || result.output_text || '{}';
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse overview JSON, returning raw text:', parseError);
    return { rawOverview: content };
  }
}

// Step 2: Content Mapping
async function mapAllContent(vectorStoreId: string, overview: any): Promise<any> {
  console.log('📋 Step 2: Mapping all document content...');
  
  const contentMappingQuery = `
    Based on this comprehensive document overview:
    ${JSON.stringify(overview)}
    
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
    
    Return as structured JSON with clear organization of all extracted content.
  `;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-2024-08-06',
      input: [
        { 
          role: 'system', 
          content: 'You are a medical content extraction specialist. Systematically extract all medical content from documents, ensuring comprehensive coverage of every section. Focus on clinical relevance and educational value. Always return valid JSON.' 
        },
        { 
          role: 'user', 
          content: [{ type: 'input_text', text: contentMappingQuery }]
        }
      ],
      tools: [{ type: 'file_search' }],
      attachments: [{ vector_store_id: vectorStoreId }],
      temperature: 0.1,
      max_output_tokens: 4000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Content mapping API error: ${response.status} - ${errorText}`);
    throw new Error(`OpenAI API error in content mapping: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const content = result.output?.[0]?.content?.[0]?.text || result.output_text || '{}';
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse content map JSON, returning raw text:', parseError);
    return { rawContentMap: content };
  }
}

// Step 3: Outline Generation
async function createCompleteOutline(
  overview: any, 
  contentMap: any, 
  specialty: string, 
  title: string, 
  style: string,
  targetDuration?: number
): Promise<any> {
  console.log('🎯 Step 3: Creating complete outline...');
  
  const outlinePrompt = `
    Create a comprehensive ${style} podcast outline for "${title}" in ${specialty} specialty.
    
    COMPREHENSIVE DOCUMENT ANALYSIS:
    Document Overview: ${JSON.stringify(overview)}
    
    Complete Content Map: ${JSON.stringify(contentMap)}
    
    OUTLINE REQUIREMENTS:
    1. Create 3-5 logical chapters that organize ALL the medical content identified
    2. Each chapter should have 2-4 segments covering specific medical aspects
    3. Ensure COMPLETE coverage of all medical topics from the content map
    4. Include speaker role assignments (host vs expert) for dynamic conversation
    5. Maintain clinical accuracy and logical educational flow
    6. Target duration: ${targetDuration || 25} minutes total
    7. Balance accessibility with medical depth appropriate for ${specialty}
    
    REQUIRED JSON STRUCTURE:
    {
      "title": "${title}",
      "specialty": "${specialty}",
      "style": "${style}",
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
      ],
      "metadata": {
        "totalDuration": ${targetDuration || 25},
        "segmentCount": 0,
        "qualityScore": 0.95,
        "medicalAccuracy": 0.98,
        "readabilityScore": 85
      }
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
    const errorText = await response.text();
    console.error(`Outline generation API error: ${response.status} - ${errorText}`);
    throw new Error(`OpenAI API error in outline generation: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse outline JSON, returning fallback:', parseError);
    // Return basic fallback structure
    return {
      title,
      specialty,
      style,
      speakers: {
        host: { role: 'host', displayName: `Dr. ${specialty} Host`, voiceId: 'wyWA56cQNU2KqUW4eCsI' },
        expert: { role: 'expert', displayName: `Dr. ${specialty} Expert`, voiceId: 'uYXf8XasLslADfZ2MB4u' }
      },
      chapters: [
        {
          id: 'chapter_1',
          title: 'Introduction',
          segments: [
            { id: 'segment_1_1', speaker: 'host', text: `Welcome to our ${specialty} discussion on ${title}.` },
            { id: 'segment_1_2', speaker: 'expert', text: 'Thank you for having me. Let\'s explore this important topic.' }
          ]
        }
      ],
      citations: [],
      metadata: {
        totalDuration: targetDuration || 25,
        segmentCount: 2,
        qualityScore: 0.75,
        medicalAccuracy: 0.80,
        readabilityScore: 75
      }
    };
  }
}

// Main comprehensive outline generation function
async function generateComprehensiveOutline(
  vectorStoreId: string, 
  specialty: string, 
  title: string, 
  style: string,
  targetDuration?: number
): Promise<any> {
  console.log('🎬 Starting comprehensive 3-step outline generation...');
  
  const startTime = Date.now();
  const timing = { step1: 0, step2: 0, step3: 0 };
  
  try {
    // Step 1: Document Overview
    const step1Start = Date.now();
    const overview = await getDocumentOverview(vectorStoreId);
    timing.step1 = Date.now() - step1Start;
    console.log(`✅ Step 1 completed in ${timing.step1}ms`);
    
    // Step 2: Content Mapping
    const step2Start = Date.now();
    const contentMap = await mapAllContent(vectorStoreId, overview);
    timing.step2 = Date.now() - step2Start;
    console.log(`✅ Step 2 completed in ${timing.step2}ms`);
    
    // Step 3: Outline Generation
    const step3Start = Date.now();
    const outline = await createCompleteOutline(overview, contentMap, specialty, title, style, targetDuration);
    timing.step3 = Date.now() - step3Start;
    console.log(`✅ Step 3 completed in ${timing.step3}ms`);
    
    const totalTime = Date.now() - startTime;
    console.log(`🎉 Comprehensive outline generation completed in ${totalTime}ms`);
    
    return {
      outline,
      debug: {
        overview,
        contentMap,
        timing,
        totalTime,
        queriesUsed: 2,
        coverageApproach: "comprehensive"
      }
    };
    
  } catch (error) {
    console.error('❌ Comprehensive outline generation failed:', error);
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
    console.log('🎯 Comprehensive Outline Generator starting...');
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { userId, podcastId, specialty, title, style, targetDuration = 25, overview, contentMap } = body;

    console.log(`🔧 Comprehensive outline request:`, {
      userId,
      podcastId,
      specialty,
      title,
      style,
      targetDuration
    });

    if (!userId || !specialty || !title || !style) {
      return new Response(JSON.stringify({ error: 'Missing required fields: userId, specialty, title, style' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Validate user
    const { data: user } = await supabase.auth.admin.getUserById(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Get podcast record to find vector store
    const { data: podcast } = await supabase
      .from('ai_podcasts')
      .select('podcast_vector_store_id')
      .eq('id', podcastId)
      .single();

    if (!podcast?.podcast_vector_store_id) {
      return new Response(JSON.stringify({ error: 'No vector store found for podcast' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Generate comprehensive outline
    const result = await generateComprehensiveOutline(
      podcast.podcast_vector_store_id,
      specialty,
      title,
      style,
      targetDuration
    );

    console.log(`✅ Comprehensive outline generation completed:`, {
      title: result.outline.title,
      chapters: result.outline.chapters?.length || 0,
      segments: result.outline.chapters?.reduce((sum: number, ch: any) => sum + (ch.segments?.length || 0), 0) || 0,
      totalTime: result.debug.totalTime,
      queriesUsed: result.debug.queriesUsed
    });

    return new Response(JSON.stringify({
      success: true,
      outline: {
        overview: {
          timing: result.debug.timing.step1,
          success: true,
          overview: result.debug.overview
        },
        contentMap: {
          timing: result.debug.timing.step2,
          success: true,
          contentMap: result.debug.contentMap
        },
        outline: {
          timing: result.debug.timing.step3,
          success: true,
          outline: result.outline
        }
      },
      metadata: {
        approach: 'comprehensive-3-step',
        totalTime: result.debug.totalTime,
        queriesUsed: result.debug.queriesUsed,
        coverageApproach: result.debug.coverageApproach,
        timestamp: new Date().toISOString()
      }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('❌ Comprehensive outline generation failed:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Comprehensive outline generation failed',
      details: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});