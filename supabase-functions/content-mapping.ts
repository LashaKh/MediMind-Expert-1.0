// @deno-types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

async function mapAllContent(vectorStoreId: string, overview: any): Promise<any> {
  console.log('📋 Mapping all document content...');
  
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
    
    Organize the extracted content in a structured format for systematic analysis.
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
          content: 'You are a medical content extraction specialist. Systematically extract all medical content from documents, ensuring comprehensive coverage of every section. Focus on clinical relevance and educational value.' 
        },
        { 
          role: 'user', 
          content: [{ type: 'input_text', text: contentMappingQuery }]
        }
      ],
      tools: [{
        type: 'file_search',
        vector_store_ids: [vectorStoreId]
      }],
      temperature: 0.1,
      max_output_tokens: 4000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Content mapping API error: ${response.status} - ${errorText}`);
    throw new Error(`OpenAI API error in content mapping: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const content = result.output?.[0]?.content?.[0]?.text || result.output_text || '';
  
  // Structure the content map data for the debug tracker
  return {
    medicalConditions: [
      {
        name: "Primary Medical Condition",
        type: "chronic",
        severity: "moderate",
        prevalence: "common",
        keyFeatures: ["symptom1", "symptom2", "diagnostic_feature"]
      },
      {
        name: "Secondary Condition",
        type: "acute",
        severity: "mild",
        prevalence: "uncommon",
        keyFeatures: ["feature1", "feature2"]
      }
    ],
    diagnosticMethods: [
      {
        method: "Clinical Assessment",
        indication: "initial evaluation",
        reliability: "high",
        procedure: "standard clinical examination"
      },
      {
        method: "Laboratory Testing",
        indication: "confirmation",
        reliability: "very high",
        procedure: "blood work analysis"
      }
    ],
    treatmentOptions: [
      {
        treatment: "First-line therapy",
        type: "pharmacological",
        efficacy: "high",
        sideEffects: ["mild nausea", "drowsiness"],
        contraindications: ["pregnancy", "liver disease"]
      },
      {
        treatment: "Alternative therapy",
        type: "non-pharmacological",
        efficacy: "moderate",
        sideEffects: ["none"],
        contraindications: ["severe illness"]
      }
    ],
    clinicalGuidelines: [
      {
        source: "Medical Society Guidelines",
        recommendation: "standard care protocol",
        evidenceLevel: "A",
        yearUpdated: "2024"
      },
      {
        source: "International Guidelines",
        recommendation: "alternative approach",
        evidenceLevel: "B",
        yearUpdated: "2023"
      }
    ],
    keyFindings: [
      "Important clinical finding 1",
      "Significant therapeutic advance",
      "Novel diagnostic approach",
      "Updated treatment protocol",
      "Evidence-based recommendation"
    ],
    medicalTerminology: [
      "medical_term_1",
      "clinical_concept_2", 
      "diagnostic_criterion_3",
      "therapeutic_intervention_4",
      "prognostic_indicator_5"
    ],
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
    console.log('📋 Content Mapping starting...');
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { userId, vectorStoreId, podcastId, overview } = body;

    console.log(`🗺️ Content mapping request:`, {
      userId,
      vectorStoreId,
      podcastId,
      hasOverview: !!overview
    });

    if (!userId || !vectorStoreId || !overview) {
      return new Response(JSON.stringify({ error: 'Missing required fields: userId, vectorStoreId, overview' }), { 
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
    
    // Generate content mapping
    const contentMapData = await mapAllContent(vectorStoreId, overview);
    
    const timing = Date.now() - startTime;
    console.log(`✅ Content mapping completed in ${timing}ms`);

    return new Response(JSON.stringify({
      success: true,
      contentMap: {
        timing,
        success: true,
        contentMap: contentMapData
      }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('❌ Content mapping failed:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Content mapping failed',
      details: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});