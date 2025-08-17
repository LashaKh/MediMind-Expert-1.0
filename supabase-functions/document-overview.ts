// @deno-types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

async function getDocumentOverview(vectorStoreId: string): Promise<any> {
  console.log('🔍 Getting comprehensive document overview...');
  
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
    
    Return as structured data that can be used for content mapping.
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
          content: 'You are an expert medical document analyst. Provide comprehensive document overviews by analyzing entire documents systematically. Focus on structure, content scope, and academic context.' 
        },
        { 
          role: 'user', 
          content: [{ type: 'input_text', text: overviewQuery }]
        }
      ],
      tools: [{
        type: 'file_search',
        vector_store_ids: [vectorStoreId]
      }],
      temperature: 0.2,
      max_output_tokens: 4000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Document overview API error: ${response.status} - ${errorText}`);
    throw new Error(`OpenAI API error in document overview: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const content = result.output?.[0]?.content?.[0]?.text || result.output_text || '';
  
  // Structure the overview data for the debug tracker
  return {
    documents: [
      {
        title: "Medical Document",
        type: "clinical",
        structure: ["Introduction", "Clinical Content", "Conclusions"],
        keyTopics: ["Medical Analysis", "Clinical Findings"],
        medicalSpecialty: "General Medicine",
        evidenceLevel: "High"
      }
    ],
    globalAnalysis: {
      primaryFocus: "Medical Content Analysis",
      secondaryTopics: ["Clinical Guidelines", "Treatment Options"],
      medicalContext: "Professional Healthcare",
      targetAudience: "Healthcare Professionals",
      complexity: "intermediate" as const
    },
    contentReadiness: {
      totalDocuments: 1,
      processedSections: 5,
      extractedTopics: 10,
      qualityScore: 0.85
    },
    rawContent: content
  };
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
    console.log('🔍 Document Overview starting...');
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { userId, vectorStoreId, podcastId } = body;

    console.log(`📋 Document overview request:`, {
      userId,
      vectorStoreId,
      podcastId
    });

    if (!userId || !vectorStoreId) {
      return new Response(JSON.stringify({ error: 'Missing required fields: userId, vectorStoreId' }), { 
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

    const startTime = Date.now();
    
    // Generate document overview
    const overviewData = await getDocumentOverview(vectorStoreId);
    
    const timing = Date.now() - startTime;
    console.log(`✅ Document overview completed in ${timing}ms`);

    return new Response(JSON.stringify({
      success: true,
      overview: {
        timing,
        success: true,
        overview: overviewData
      }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('❌ Document overview failed:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Document overview failed',
      details: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});