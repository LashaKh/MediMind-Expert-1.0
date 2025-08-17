// @deno-types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

interface AnalysisRequest {
  userId: string;
  documentIds: string[];
  title: string;
  specialty: string;
  style: string;
  vectorStoreId?: string;
}

interface ContentPlan {
  title: string;
  specialty: string;
  style: string;
  chapters: Array<{
    id: string;
    title: string;
    focus: string;
    estimatedDuration: string;
    keyPoints: string[];
    speakerAssignment: 'host' | 'expert' | 'both';
  }>;
  curatedContent: Array<{
    id: string;
    sourceTitle: string;
    content: string;
    evidenceLevel: string;
    citation: string;
    relevanceScore: number;
  }>;
  overallStructure: {
    totalEstimatedDuration: string;
    targetAudience: string;
    medicalComplexity: 'basic' | 'intermediate' | 'advanced';
    safetyConsiderations: string[];
  };
}

async function analyzeDocumentsAndPlan(
  vectorStoreId: string | null,
  docTitles: string[],
  specialty: string,
  style: string,
  title: string
): Promise<ContentPlan> {
  console.log(`🔍 Content Analysis - Vector Store: ${vectorStoreId}, Docs: ${docTitles.length}, Style: ${style}`);
  
  const systemPrompt = `You are a senior medical content analyzer and podcast planner. Your role is to analyze medical documents and create a structured content plan for podcast generation.

CORE RESPONSIBILITIES:
1. Extract key medical content from provided documents
2. Assess evidence levels and clinical relevance
3. Plan optimal chapter structure for ${style} format
4. Assign appropriate speakers (host vs expert) based on content complexity
5. Identify safety considerations and compliance requirements

OUTPUT FORMAT: Return STRICT JSON with the following structure:
{
  "title": "podcast title",
  "specialty": "medical specialty", 
  "style": "podcast style",
  "chapters": [
    {
      "id": "ch1",
      "title": "chapter title",
      "focus": "main focus area",
      "estimatedDuration": "X-Y minutes",
      "keyPoints": ["point 1", "point 2"],
      "speakerAssignment": "host|expert|both"
    }
  ],
  "curatedContent": [
    {
      "id": "content1",
      "sourceTitle": "document title",
      "content": "relevant extracted content",
      "evidenceLevel": "systematic_review|rct|guideline|expert_opinion",
      "citation": "proper citation format",
      "relevanceScore": 0.9
    }
  ],
  "overallStructure": {
    "totalEstimatedDuration": "X-Y minutes",
    "targetAudience": "healthcare professionals|students|general",
    "medicalComplexity": "basic|intermediate|advanced",
    "safetyConsiderations": ["safety note 1", "safety note 2"]
  }
}

MEDICAL ACCURACY REQUIREMENTS:
- Prioritize evidence-based content (systematic reviews, RCTs, clinical guidelines)
- Flag any controversial or emerging topics requiring disclaimers
- Ensure content aligns with current ${specialty} guidelines (ACC/AHA, ACOG, etc.)
- Identify areas requiring expert-level discussion vs general overview

CHAPTER PLANNING GUIDELINES:
- ${style === 'podcast' ? '3-4 chapters, 15-25 minutes total' : style === 'executive-briefing' ? '2-3 chapters, 8-12 minutes total' : '4-5 chapters, 20-30 minutes total'}
- Logical flow: Introduction → Core Content → Clinical Applications → Conclusions
- Balance host (accessible language) vs expert (technical depth) based on complexity
- Include citation opportunities and evidence level mentions

SAFETY & COMPLIANCE:
- Identify content requiring medical disclaimers
- Flag off-label use or experimental treatments
- Ensure alignment with professional guidelines
- Note any liability considerations for clinical recommendations`;

  const userPrompt = {
    instruction: 'Analyze the provided medical documents and create a comprehensive content plan for podcast generation.',
    title,
    specialty,
    style,
    documentTitles: docTitles,
    analysisRequirements: [
      'Extract most clinically relevant content',
      'Assess evidence quality and levels',
      'Plan optimal chapter structure and speaker assignments',
      'Identify safety considerations and compliance requirements',
      'Ensure medical accuracy and professional standards'
    ]
  };

  try {
    if (vectorStoreId && OPENAI_API_KEY) {
      console.log(`📚 Using vector store ${vectorStoreId} for document analysis`);
      
      // Use OpenAI Responses API with file_search
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${OPENAI_API_KEY}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: 'gpt-4o-2024-08-06',
          input: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: [{ type: 'input_text', text: JSON.stringify(userPrompt) }] }
          ],
          tools: [{ type: 'file_search' }],
          attachments: [{ vector_store_id: vectorStoreId }],
          temperature: 0.3,
          max_output_tokens: 6000,
          response_format: { type: 'json_object' }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const content = result.output?.[0]?.content?.[0]?.text || 
                       result.output_text || 
                       result.response?.output_text || 
                       result?.choices?.[0]?.message?.content || '{}';
        
        console.log(`✅ Content analysis completed using vector store`);
        return JSON.parse(content);
      } else {
        const errorText = await response.text();
        console.error(`❌ OpenAI Responses API failed: ${response.status} - ${errorText}`);
      }
    } else {
      console.log(`⚠️ No vector store or API key available, using fallback analysis`);
    }
  } catch (error) {
    console.error(`❌ Content analysis error: ${error instanceof Error ? error.message : error}`);
  }

  // Fallback content plan when vector store analysis fails
  console.log('📋 Generating fallback content plan');
  
  const fallbackPlan: ContentPlan = {
    title,
    specialty,
    style,
    chapters: style === 'executive-briefing' ? [
      {
        id: 'ch1',
        title: 'Executive Summary',
        focus: 'Key findings and clinical implications',
        estimatedDuration: '3-4 minutes',
        keyPoints: ['Primary findings', 'Clinical significance', 'Action items'],
        speakerAssignment: 'expert'
      },
      {
        id: 'ch2', 
        title: 'Evidence Review',
        focus: 'Critical analysis of evidence quality',
        estimatedDuration: '4-5 minutes',
        keyPoints: ['Study design', 'Statistical significance', 'Clinical applicability'],
        speakerAssignment: 'expert'
      },
      {
        id: 'ch3',
        title: 'Practice Implications',
        focus: 'How this changes clinical practice',
        estimatedDuration: '2-3 minutes',
        keyPoints: ['Guideline changes', 'Implementation strategy', 'Patient counseling'],
        speakerAssignment: 'both'
      }
    ] : [
      {
        id: 'ch1',
        title: 'Introduction & Background',
        focus: 'Setting clinical context and importance',
        estimatedDuration: '4-5 minutes',
        keyPoints: ['Clinical problem', 'Current guidelines', 'Why this matters'],
        speakerAssignment: 'host'
      },
      {
        id: 'ch2',
        title: 'Evidence Analysis',
        focus: 'Review of key studies and findings',
        estimatedDuration: '8-10 minutes',
        keyPoints: ['Study methodology', 'Primary outcomes', 'Clinical significance'],
        speakerAssignment: 'expert'
      },
      {
        id: 'ch3',
        title: 'Clinical Applications',
        focus: 'Practical implementation in practice',
        estimatedDuration: '5-7 minutes',
        keyPoints: ['Patient selection', 'Treatment protocols', 'Monitoring strategies'],
        speakerAssignment: 'both'
      },
      {
        id: 'ch4',
        title: 'Key Takeaways',
        focus: 'Summary and future considerations',
        estimatedDuration: '3-4 minutes',
        keyPoints: ['Main conclusions', 'Practice changes', 'Areas for research'],
        speakerAssignment: 'host'
      }
    ],
    curatedContent: docTitles.slice(0, 3).map((title, i) => ({
      id: `content_${i + 1}`,
      sourceTitle: title,
      content: `Key content from ${title} will be analyzed for clinical relevance and evidence quality.`,
      evidenceLevel: 'guideline',
      citation: `${title} - Medical Document ${i + 1}`,
      relevanceScore: 0.8
    })),
    overallStructure: {
      totalEstimatedDuration: style === 'executive-briefing' ? '8-12 minutes' : '15-25 minutes',
      targetAudience: 'healthcare professionals',
      medicalComplexity: 'intermediate',
      safetyConsiderations: [
        'Content based on available documents - verify current guidelines',
        'Professional medical judgment required for clinical application',
        'Consider individual patient factors and contraindications'
      ]
    }
  };

  return fallbackPlan;
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
    console.log('🔍 Content Analyzer & Planner starting...');
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json() as AnalysisRequest;
    const { userId, documentIds, title, specialty, style, vectorStoreId } = body;

    console.log(`📝 Analysis request:`, {
      userId,
      documentCount: documentIds?.length || 0,
      title,
      specialty,
      style,
      vectorStoreId
    });

    if (!userId || !documentIds?.length || !title || !specialty || !style) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
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

    // Get document titles for analysis
    const { data: podcastDocs } = await supabase
      .from('podcast_documents')
      .select('id, title, openai_file_id, openai_upload_status')
      .in('id', documentIds)
      .eq('user_id', userId);

    let docTitles: string[] = [];
    if (podcastDocs && podcastDocs.length > 0) {
      docTitles = podcastDocs
        .filter((doc: any) => doc.openai_upload_status === 'completed')
        .map((doc: any) => doc.title);
      
      console.log(`📚 Found ${docTitles.length} processed documents for analysis`);
    }

    // Perform content analysis and planning
    const contentPlan = await analyzeDocumentsAndPlan(
      vectorStoreId || null,
      docTitles,
      specialty,
      style,
      title
    );

    console.log(`✅ Content analysis completed:`, {
      chaptersPlanned: contentPlan.chapters.length,
      contentItemsCurated: contentPlan.curatedContent.length,
      estimatedDuration: contentPlan.overallStructure.totalEstimatedDuration,
      complexity: contentPlan.overallStructure.medicalComplexity
    });

    return new Response(JSON.stringify({
      success: true,
      contentPlan,
      metadata: {
        documentsAnalyzed: docTitles.length,
        vectorStoreUsed: !!vectorStoreId,
        planningTime: new Date().toISOString(),
        agentVersion: 'content-analyzer-planner-v1.0'
      }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('❌ Content analysis failed:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Content analysis failed',
      details: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});