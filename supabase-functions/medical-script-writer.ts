// @deno-types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

interface DocumentSection {
  title: string;
  content: string;
  medicalTerms: string[];
}

interface MedicalTopics {
  primaryCondition: string;
  secondaryConditions: string[];
  symptoms: string[];
  treatments: string[];
  diagnostics: string[];
  clinicalFindings: string[];
  keyMedicalTerms: string[];
}

interface ContentOutline {
  title: string;
  chapters: Array<{
    title: string;
    keyPoints: string[];
    medicalDetails: string[];
    discussionPoints: string[];
  }>;
  speakers: {
    host: { role: string; displayName: string; voiceId: string };
    expert: { role: string; displayName: string; voiceId: string };
  };
}

// Step 1: Extract Document Content in Sections with Debug Tracking
async function extractDocumentSectionsWithDebug(vectorStoreId: string, debugInfo: DebugInfo): Promise<DocumentSection[]> {
  console.log('🔍 Step 1: Extracting document sections...');
  console.log(`🔍 Vector Store ID: ${vectorStoreId}`);
  
  // Check vector store status before proceeding
  try {
    const vectorStoreCheck = await fetch(`https://api.openai.com/v1/vector_stores/${vectorStoreId}`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });
    
    if (vectorStoreCheck.ok) {
      const vectorStoreData = await vectorStoreCheck.json();
      console.log(`✅ Vector Store Status: ${vectorStoreData.status}, Files: ${vectorStoreData.file_counts?.total || 0}`);
      
      if (vectorStoreData.file_counts?.total === 0) {
        console.warn('⚠️ Vector store has no files attached!');
      }
    } else {
      console.error(`❌ Vector store check failed: ${vectorStoreCheck.status}`);
    }
  } catch (checkError) {
    console.error('❌ Error checking vector store:', checkError.message);
  }

  const queries = [
    "What is the main medical condition or topic discussed in this document?",
    "What are the symptoms, signs, or clinical presentations mentioned?", 
    "What diagnostic procedures, tests, or criteria are described?",
    "What treatments, medications, or interventions are discussed?",
    "What are the key clinical findings, outcomes, or prognosis mentioned?",
    "What are the important medical terms, definitions, or concepts explained?"
  ];

  debugInfo.step1_extraction.queries = queries;
  const sections: DocumentSection[] = [];

  for (let i = 0; i < queries.length; i++) {
    const queryStart = Date.now();
    try {
      console.log(`🔍 Executing query ${i + 1}/${queries.length}: ${queries[i]}`);
      
      // Use OpenAI Assistant API for robust vector store querying
      let content = '';
      
      try {
        // First, try the Responses API (newer approach)
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
                content: 'You are a medical expert analyzing uploaded documents. Extract specific medical information from the documents. Respond with detailed, accurate information based only on the document content. If the document does not contain information about the query, explicitly state that.' 
              },
              { 
                role: 'user', 
                content: [{ 
                  type: 'input_text', 
                  text: `${queries[i]}\n\nIMPORTANT: Base your response ONLY on the content found in the uploaded document. If the document doesn't contain relevant information, clearly state "The document does not contain information about [topic]."`
                }]
              }
            ],
            tools: [{ type: 'file_search' }],
            attachments: [{ vector_store_id: vectorStoreId }],
            temperature: 0.3,
            max_output_tokens: 1500
          })
        });

        if (response.ok) {
          const result = await response.json();
          content = result.output?.[0]?.content?.[0]?.text || result.output_text || result.response?.output_text || '';
          console.log(`🔄 Responses API succeeded for query ${i + 1}`);
        } else {
          console.log(`⚠️ Responses API failed (${response.status}), trying Assistant API...`);
          throw new Error(`Responses API failed: ${response.status}`);
        }
      } catch (responsesError) {
        console.log(`🔄 Falling back to Assistant API for query ${i + 1}`);
        
        // Fallback: Use Assistant API with thread and run
        try {
          // Create assistant with file search
          const assistantResponse = await fetch('https://api.openai.com/v1/assistants', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
              'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({
              name: 'Medical Document Analyzer',
              instructions: 'You are a medical expert analyzing uploaded documents. Extract specific medical information from the documents. Respond with detailed, accurate information based only on the document content.',
              model: 'gpt-4o',
              tools: [{ type: 'file_search' }],
              tool_resources: {
                file_search: {
                  vector_store_ids: [vectorStoreId]
                }
              }
            })
          });

          if (!assistantResponse.ok) {
            throw new Error(`Assistant creation failed: ${assistantResponse.status}`);
          }

          const assistant = await assistantResponse.json();
          console.log(`✅ Created assistant ${assistant.id} for query ${i + 1}`);

          // Create thread
          const threadResponse = await fetch('https://api.openai.com/v1/threads', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
              'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({})
          });

          const thread = await threadResponse.json();
          console.log(`✅ Created thread ${thread.id} for query ${i + 1}`);

          // Add message to thread
          await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
              'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({
              role: 'user',
              content: `${queries[i]}\n\nIMPORTANT: Base your response ONLY on the content found in the uploaded document. If the document doesn't contain relevant information, clearly state "The document does not contain information about [topic]."`
            })
          });

          // Run assistant
          const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
              'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({
              assistant_id: assistant.id,
              temperature: 0.3
            })
          });

          const run = await runResponse.json();
          console.log(`🏃 Started run ${run.id} for query ${i + 1}`);

          // Poll for completion
          let runStatus = run;
          let attempts = 0;
          while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
            if (attempts > 30) { // 30 second timeout
              throw new Error('Assistant run timeout');
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
              }
            });
            runStatus = await statusResponse.json();
            attempts++;
          }

          if (runStatus.status === 'completed') {
            // Get messages
            const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
              }
            });
            const messages = await messagesResponse.json();
            const lastMessage = messages.data[0];
            content = lastMessage.content[0]?.text?.value || '';
            console.log(`✅ Assistant API succeeded for query ${i + 1}`);
          } else {
            throw new Error(`Assistant run failed with status: ${runStatus.status}`);
          }

          // Cleanup: Delete assistant
          try {
            await fetch(`https://api.openai.com/v1/assistants/${assistant.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
              }
            });
            console.log(`🗑️ Cleaned up assistant ${assistant.id}`);
          } catch (cleanupError) {
            console.warn(`⚠️ Failed to cleanup assistant: ${cleanupError.message}`);
          }

        } catch (assistantError) {
          console.error(`❌ Assistant API also failed for query ${i + 1}:`, assistantError.message);
          content = `Error: Unable to query document - ${assistantError.message}`;
        }
      }

      const queryTiming = Date.now() - queryStart;

      // Process the extracted content
      if (content && content.length > 0) {
        const medicalTerms = extractMedicalTerms(content);
        
        sections.push({
          title: queries[i],
          content: content,
          medicalTerms: medicalTerms
        });

        // Debug tracking for each query
        debugInfo.step1_extraction.responses.push({
          query: queries[i],
          content: content,
          medicalTerms: medicalTerms,
          success: true,
          timing: queryTiming
        });
        
        console.log(`✅ Query ${i + 1} completed (${queryTiming}ms)`);
        console.log(`📄 Content preview: ${content.substring(0, 150)}...`);
        console.log(`📋 Medical terms found: ${medicalTerms.join(', ')}`);
        
        // Debug: Log if content indicates document was found
        const hasValidContent = content.length > 50 && !content.toLowerCase().includes('document does not contain');
        console.log(`🔍 Valid content extracted: ${hasValidContent}`);
      } else {
        console.error(`❌ Failed to extract section ${i + 1}: No content returned`);
        debugInfo.step1_extraction.responses.push({
          query: queries[i],
          content: '',
          medicalTerms: [],
          success: false,
          timing: queryTiming,
          error: 'No content returned from any API'
        });
      }
    } catch (error) {
      console.error(`❌ Error extracting section ${i + 1}:`, error);
      debugInfo.step1_extraction.responses.push({
        query: queries[i],
        content: '',
        medicalTerms: [],
        success: false,
        timing: Date.now() - queryStart
      });
    }
  }

  debugInfo.step1_extraction.totalSections = sections.length;
  console.log(`🔍 Step 1 Summary: ${sections.length}/${queries.length} queries successful`);
  
  return sections;
}

// Step 2: Identify Medical Topics from Extracted Sections with Debug Tracking
async function identifyMedicalTopicsWithDebug(sections: DocumentSection[], debugInfo: DebugInfo): Promise<MedicalTopics> {
  console.log('🏥 Step 2: Identifying medical topics...');

  const allContent = sections.map(s => s.content).join('\n\n');
  debugInfo.step2_topics.rawContent = allContent;
  
  console.log('🏥 Raw content length:', allContent.length);
  console.log('🏥 First 300 chars of content:', allContent.substring(0, 300));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are a medical expert. Analyze the extracted content and identify key medical topics. Focus on the SPECIFIC medical conditions mentioned in the content. Respond with ONLY a valid JSON object with the exact structure requested.' 
        },
        { 
          role: 'user', 
          content: `Analyze this medical content and extract key topics in JSON format:

${allContent}

IMPORTANT: Focus on the SPECIFIC medical conditions and topics mentioned in the content above. Do not add generic medical information.

Respond with ONLY this JSON structure:
{
  "primaryCondition": "main medical condition from the content",
  "secondaryConditions": ["related conditions from the content"],
  "symptoms": ["clinical symptoms from the content"],
  "treatments": ["treatments/interventions from the content"],
  "diagnostics": ["diagnostic procedures from the content"],
  "clinicalFindings": ["key findings from the content"],
  "keyMedicalTerms": ["important medical terms from the content"]
}`
        }
      ],
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    debugInfo.step2_topics.success = false;
    throw new Error(`Failed to identify medical topics: ${response.status}`);
  }

  const result = await response.json();
  const topics = JSON.parse(result.choices[0].message.content);
  
  debugInfo.step2_topics.identifiedTopics = topics;
  debugInfo.step2_topics.success = true;
  
  console.log('✅ Medical topics identified:', topics.primaryCondition);
  console.log('🏥 Topics summary:', {
    primary: topics.primaryCondition,
    secondary: topics.secondaryConditions?.length || 0,
    symptoms: topics.symptoms?.length || 0,
    treatments: topics.treatments?.length || 0
  });
  
  return topics;
}

// Step 3: Generate Content Outline with Debug Tracking
async function generateContentOutlineWithDebug(medicalTopics: MedicalTopics, title: string, style: string, debugInfo: DebugInfo): Promise<ContentOutline> {
  console.log('📋 Step 3: Generating content outline...');
  
  debugInfo.step3_outline.inputTopics = medicalTopics;
  console.log('📋 Input topics:', {
    primary: medicalTopics.primaryCondition,
    secondaryCount: medicalTopics.secondaryConditions?.length || 0,
    symptomsCount: medicalTopics.symptoms?.length || 0,
    treatmentsCount: medicalTopics.treatments?.length || 0
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are a medical content strategist. Create detailed podcast outlines based on medical topics. Focus specifically on the provided medical condition and related information. Respond with ONLY valid JSON.' 
        },
        { 
          role: 'user', 
          content: `Create a detailed ${style} outline for "${title}" based on these SPECIFIC medical topics:

Primary Condition: ${medicalTopics.primaryCondition}
Secondary Conditions: ${medicalTopics.secondaryConditions?.join(', ') || 'None specified'}
Symptoms: ${medicalTopics.symptoms?.join(', ') || 'None specified'}
Treatments: ${medicalTopics.treatments?.join(', ') || 'None specified'}
Diagnostics: ${medicalTopics.diagnostics?.join(', ') || 'None specified'}
Clinical Findings: ${medicalTopics.clinicalFindings?.join(', ') || 'None specified'}

IMPORTANT: Create an outline that focuses specifically on "${medicalTopics.primaryCondition}" and the related information provided above.

Create a comprehensive outline with 3-4 chapters. Each chapter should have:
- Key medical points to discuss about ${medicalTopics.primaryCondition}
- Specific medical details to cover
- Discussion points for host and expert

Respond with ONLY this JSON structure:
{
  "title": "${title}",
  "chapters": [
    {
      "title": "chapter title",
      "keyPoints": ["key medical points"],
      "medicalDetails": ["specific medical details"],
      "discussionPoints": ["discussion topics"]
    }
  ],
  "speakers": {
    "host": {"role": "host", "displayName": "Dr. Host", "voiceId": "wyWA56cQNU2KqUW4eCsI"},
    "expert": {"role": "expert", "displayName": "Dr. Expert", "voiceId": "uYXf8XasLslADfZ2MB4u"}
  }
}`
        }
      ],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    debugInfo.step3_outline.success = false;
    throw new Error(`Failed to generate outline: ${response.status}`);
  }

  const result = await response.json();
  const outline = JSON.parse(result.choices[0].message.content);
  
  debugInfo.step3_outline.generatedOutline = outline;
  debugInfo.step3_outline.success = true;
  
  console.log(`✅ Content outline generated with ${outline.chapters?.length || 0} chapters`);
  console.log('📋 Outline titles:', outline.chapters?.map((ch: any) => ch.title) || []);
  
  return outline;
}

// Step 4: Synthesize Final Script with Debug Tracking
async function synthesizeScriptWithDebug(outline: ContentOutline, specialty: string, debugInfo: DebugInfo): Promise<any> {
  console.log('🎬 Step 4: Synthesizing final script...');
  
  debugInfo.step4_script.inputOutline = outline;
  console.log('🎬 Input outline chapters:', outline.chapters?.length || 0);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are a medical podcast scriptwriter. Create natural, conversational dialogue between medical professionals. Focus on the specific medical condition and topics provided in the outline. Use accurate medical terminology with clear explanations. Respond with ONLY valid JSON.' 
        },
        { 
          role: 'user', 
          content: `Create a medical podcast script based on this detailed outline:

Title: ${outline.title}
Specialty: ${specialty}
Chapters: ${JSON.stringify(outline.chapters, null, 2)}

IMPORTANT: Create dialogue that specifically discusses the medical topics in the outline. Do not add generic medical content.

Create natural dialogue between Dr. Host and Dr. Expert that covers all the medical details in the outline. Each chapter should have 2-4 segments with conversational exchanges.

Respond with ONLY this JSON structure:
{
  "style": "podcast",
  "specialty": "${specialty}",
  "speakers": ${JSON.stringify(outline.speakers)},
  "chapters": [
    {
      "id": "ch1",
      "title": "chapter title",
      "segments": [
        {"id": "s1", "speaker": "host", "text": "dialogue text"},
        {"id": "s2", "speaker": "expert", "text": "dialogue text"}
      ]
    }
  ],
  "citations": []
}`
        }
      ],
      temperature: 0.6,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    debugInfo.step4_script.success = false;
    throw new Error(`Failed to synthesize script: ${response.status}`);
  }

  const result = await response.json();
  const script = JSON.parse(result.choices[0].message.content);
  
  debugInfo.step4_script.finalScript = script;
  debugInfo.step4_script.success = true;
  
  console.log(`✅ Final script synthesized with ${script.chapters?.length || 0} chapters`);
  console.log('🎬 Script segment count:', script.chapters?.reduce((total: number, ch: any) => total + (ch.segments?.length || 0), 0) || 0);
  
  return script;
}

// Helper function to extract medical terms
function extractMedicalTerms(text: string): string[] {
  const medicalPrefixes = ['hypo', 'hyper', 'brady', 'tachy', 'micro', 'macro', 'anti', 'pre', 'post'];
  const words = text.split(/\s+/);
  const terms = words.filter(word => {
    const clean = word.replace(/[^\w]/g, '').toLowerCase();
    return clean.length > 4 && (
      /^[A-Z]/.test(word) || 
      medicalPrefixes.some(prefix => clean.startsWith(prefix)) ||
      clean.includes('emia') || clean.includes('osis') || clean.includes('itis')
    );
  });
  return [...new Set(terms)];
}

// Validation function to check consistency across steps
function performValidationChecks(debugInfo: DebugInfo): void {
  console.log('✅ Running validation checks...');
  
  // Check 1: Document topic match
  const extractedContent = debugInfo.step1_extraction.responses.map(r => r.content).join(' ').toLowerCase();
  const primaryCondition = debugInfo.step2_topics.identifiedTopics.primaryCondition?.toLowerCase() || '';
  
  debugInfo.validation.documentTopicMatch = primaryCondition.length > 0 && 
    (extractedContent.includes(primaryCondition) || 
     primaryCondition.split(' ').some(word => word.length > 3 && extractedContent.includes(word)));
  
  // Check 2: Topic consistency between steps 2 and 3
  const outlineContent = JSON.stringify(debugInfo.step3_outline.generatedOutline).toLowerCase();
  debugInfo.validation.topicConsistency = primaryCondition.length > 0 && 
    (outlineContent.includes(primaryCondition) ||
     primaryCondition.split(' ').some(word => word.length > 3 && outlineContent.includes(word)));
  
  // Check 3: Outline completeness
  const outline = debugInfo.step3_outline.generatedOutline;
  debugInfo.validation.outlineCompleteness = 
    outline.chapters && outline.chapters.length >= 3 && 
    outline.chapters.every((ch: any) => ch.title && ch.keyPoints && ch.medicalDetails);
  
  // Check 4: Script quality
  const script = debugInfo.step4_script.finalScript;
  debugInfo.validation.scriptQuality = 
    script.chapters && script.chapters.length >= 3 &&
    script.chapters.every((ch: any) => ch.segments && ch.segments.length >= 2);
  
  console.log('✅ Validation results:', {
    documentTopicMatch: debugInfo.validation.documentTopicMatch,
    topicConsistency: debugInfo.validation.topicConsistency,
    outlineCompleteness: debugInfo.validation.outlineCompleteness,
    scriptQuality: debugInfo.validation.scriptQuality
  });
}

// Debug interface for tracking each step
interface DebugInfo {
  step1_extraction: {
    queries: string[];
    responses: Array<{
      query: string;
      content: string;
      medicalTerms: string[];
      success: boolean;
      timing: number;
      error?: string;
    }>;
    totalSections: number;
    timing: number;
  };
  step2_topics: {
    rawContent: string;
    identifiedTopics: MedicalTopics;
    timing: number;
    success: boolean;
  };
  step3_outline: {
    inputTopics: MedicalTopics;
    generatedOutline: ContentOutline;
    timing: number;
    success: boolean;
  };
  step4_script: {
    inputOutline: ContentOutline;
    finalScript: any;
    timing: number;
    success: boolean;
  };
  validation: {
    documentTopicMatch: boolean;
    topicConsistency: boolean;
    outlineCompleteness: boolean;
    scriptQuality: boolean;
  };
}

// Main orchestration function with comprehensive debug tracking
async function generateMedicalScript(
  vectorStoreId: string,
  title: string,
  description: string,
  style: string,
  specialty: string
) {
  console.log(`🎭 Starting 4-step medical script generation for: ${title}`);
  
  const debugInfo: DebugInfo = {
    step1_extraction: { queries: [], responses: [], totalSections: 0, timing: 0 },
    step2_topics: { rawContent: '', identifiedTopics: {} as MedicalTopics, timing: 0, success: false },
    step3_outline: { inputTopics: {} as MedicalTopics, generatedOutline: {} as ContentOutline, timing: 0, success: false },
    step4_script: { inputOutline: {} as ContentOutline, finalScript: {}, timing: 0, success: false },
    validation: { documentTopicMatch: false, topicConsistency: false, outlineCompleteness: false, scriptQuality: false }
  };
  
  try {
    // Step 1: Extract document sections with detailed logging
    console.log('🔍 Starting Step 1: Document Section Extraction');
    const step1Start = Date.now();
    const sections = await extractDocumentSectionsWithDebug(vectorStoreId, debugInfo);
    debugInfo.step1_extraction.timing = Date.now() - step1Start;
    console.log(`✅ Step 1 complete: ${sections.length} sections extracted in ${debugInfo.step1_extraction.timing}ms`);
    
    // Step 2: Identify medical topics with detailed logging
    console.log('🏥 Starting Step 2: Medical Topic Identification');
    const step2Start = Date.now();
    const medicalTopics = await identifyMedicalTopicsWithDebug(sections, debugInfo);
    debugInfo.step2_topics.timing = Date.now() - step2Start;
    console.log(`✅ Step 2 complete: Primary condition - ${medicalTopics.primaryCondition} in ${debugInfo.step2_topics.timing}ms`);
    
    // Step 3: Generate content outline with detailed logging
    console.log('📋 Starting Step 3: Content Outline Generation');
    const step3Start = Date.now();
    const outline = await generateContentOutlineWithDebug(medicalTopics, title, style, debugInfo);
    debugInfo.step3_outline.timing = Date.now() - step3Start;
    console.log(`✅ Step 3 complete: ${outline.chapters.length} chapters outlined in ${debugInfo.step3_outline.timing}ms`);
    
    // Step 4: Synthesize final script with detailed logging
    console.log('🎬 Starting Step 4: Final Script Synthesis');
    const step4Start = Date.now();
    const script = await synthesizeScriptWithDebug(outline, specialty, debugInfo);
    debugInfo.step4_script.timing = Date.now() - step4Start;
    console.log(`✅ Step 4 complete: Final script ready in ${debugInfo.step4_script.timing}ms`);
    
    // Validation checks
    console.log('✅ Running validation checks...');
    performValidationChecks(debugInfo);
    
    // Log comprehensive debug summary
    console.log('🎉 4-Step Generation Complete - Debug Summary:');
    console.log(`Total Processing Time: ${debugInfo.step1_extraction.timing + debugInfo.step2_topics.timing + debugInfo.step3_outline.timing + debugInfo.step4_script.timing}ms`);
    console.log(`Primary Condition Identified: ${debugInfo.step2_topics.identifiedTopics.primaryCondition}`);
    console.log(`Chapters Generated: ${debugInfo.step3_outline.generatedOutline.chapters?.length || 0}`);
    console.log(`Script Segments: ${debugInfo.step4_script.finalScript.chapters?.reduce((total: number, ch: any) => total + (ch.segments?.length || 0), 0) || 0}`);
    
    return { script, debugInfo };
    
  } catch (error) {
    console.error(`❌ 4-step generation failed:`, error);
    console.log('📊 Debug Info at Failure:', JSON.stringify(debugInfo, null, 2));
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('🎬 Medical Script Writer - 4-Step Analysis Starting');

    const body = await req.json();
    const { vectorStoreId, title, description, style, specialty } = body;

    console.log('Request payload:', {
      vectorStoreId: vectorStoreId?.substring(0, 10) + '...',
      title,
      style,
      specialty
    });

    if (!vectorStoreId || !title || !style || !specialty) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: vectorStoreId, title, style, specialty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!OPENAI_API_KEY) {
      console.error('No OpenAI API key available');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await generateMedicalScript(vectorStoreId, title, description || '', style, specialty);

    console.log('🎉 4-Step medical script generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        script: result.script,
        debugInfo: result.debugInfo,
        metadata: {
          vectorStoreId,
          style,
          specialty,
          timestamp: new Date().toISOString(),
          method: '4-step-analysis-debug'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ 4-Step medical script writer failed:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});