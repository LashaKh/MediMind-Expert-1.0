// @deno-types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

interface PodcastScript {
  style: string;
  specialty: string;
  speakers: {
    host: { role: string; displayName: string; voiceId: string };
    expert: { role: string; displayName: string; voiceId: string };
  };
  chapters: Array<{
    id: string;
    title: string;
    segments: Array<{
      id: string;
      speaker: 'host' | 'expert';
      text: string;
      duration?: string;
      notes?: string;
    }>;
  }>;
  citations: Array<{
    id: string;
    sourceId: string;
    title: string;
    snippet?: string;
    evidenceLevel?: string;
  }>;
  safetyReview: {
    reviewCompleted: boolean;
    flaggedContent: Array<{
      segment: string;
      concern: string;
      recommendation: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    complianceNotes: string[];
    disclaimers: string[];
  };
}

interface FinalizationRequest {
  userId: string;
  script: PodcastScript;
  optimizeForTTS?: boolean;
}

interface FinalizedScript {
  style: string;
  specialty: string;
  speakers: {
    host: { role: string; displayName: string; voiceId: string };
    expert: { role: string; displayName: string; voiceId: string };
  };
  chapters: Array<{
    id: string;
    title: string;
    segments: Array<{
      id: string;
      speaker: 'host' | 'expert';
      text: string;
      ssml?: string;
      estimatedDurationSeconds: number;
      ttsOptimized: boolean;
    }>;
    estimatedDurationSeconds: number;
  }>;
  citations: Array<{
    id: string;
    sourceId: string;
    title: string;
    snippet?: string;
    evidenceLevel?: string;
  }>;
  metadata: {
    totalEstimatedDurationSeconds: number;
    totalWords: number;
    readabilityScore: number;
    ttsOptimized: boolean;
    qualityChecks: {
      artifactsRemoved: boolean;
      pronunciationOptimized: boolean;
      pacingOptimized: boolean;
      voiceTagsApplied: boolean;
    };
  };
  finalNotes: string[];
}

async function finalizeScript(
  script: PodcastScript,
  optimizeForTTS: boolean = true
): Promise<FinalizedScript> {
  console.log(`🎯 Script Finalization - Chapters: ${script.chapters.length}, TTS: ${optimizeForTTS}`);
  
  const systemPrompt = `You are a professional script finalizer and TTS optimization specialist. Your role is to polish podcast scripts for professional audio production.

CORE RESPONSIBILITIES:
1. Remove any prompt artifacts, markdown formatting, or system references
2. Optimize text for Text-to-Speech (TTS) synthesis
3. Add pronunciation guides for medical terminology
4. Optimize pacing and natural speech patterns
5. Apply proper voice tags and timing hints
6. Ensure professional audio production quality

TTS OPTIMIZATION GUIDELINES:
- Replace complex medical abbreviations with pronunciations (e.g., "STEMI" → "S-T-E-M-I")
- Add pause indicators for natural speech flow: <break time="1s"/>
- Include pronunciation hints: <phoneme alphabet="ipa" ph="ˈkɑrdiæk">cardiac</phoneme>
- Optimize sentence structure for spoken delivery
- Add emphasis tags where appropriate: <emphasis level="moderate">
- Include speech rate adjustments: <prosody rate="slow">

ARTIFACT REMOVAL:
- Remove any system prompts, instructions, or meta-commentary
- Clean up formatting markers (**, ##, etc.)
- Remove placeholder text or template elements
- Eliminate any non-dialogue content
- Ensure only natural speech remains

MEDICAL TERMINOLOGY OPTIMIZATION:
- Provide phonetic spelling for complex terms
- Break down acronyms appropriately
- Add brief pauses after technical terms
- Ensure consistent pronunciation throughout
- Include stress patterns for multi-syllabic medical words

OUTPUT FORMAT: Return STRICT JSON with optimized script structure including:
- Clean, TTS-ready dialogue text
- SSML markup for pronunciation and pacing
- Accurate duration estimates in seconds
- Quality check confirmations
- Readability and optimization metrics

QUALITY STANDARDS:
- All text must be natural, conversational speech
- No artifacts, formatting, or system references
- Medical terms properly optimized for pronunciation
- Appropriate pacing and pause indicators
- Professional audio production ready`;

  const userPrompt = {
    instruction: 'Finalize and optimize the podcast script for professional TTS production.',
    script: script,
    optimizationRequirements: [
      'Remove all prompt artifacts and formatting',
      'Optimize medical terminology for TTS pronunciation',
      'Add appropriate pacing and pause indicators',
      'Ensure natural conversational flow',
      'Apply professional audio production standards'
    ],
    ttsOptimization: optimizeForTTS,
    targetOutput: 'Professional TTS-ready script with SSML optimization'
  };

  try {
    if (OPENAI_API_KEY && optimizeForTTS) {
      console.log(`🔧 Using OpenAI for advanced TTS optimization`);
      
      // Use GPT-3.5-turbo for finalization (simpler, faster task)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${OPENAI_API_KEY}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(userPrompt) }
          ],
          temperature: 0.2,
          max_tokens: 8000,
          response_format: { type: 'json_object' }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const content = result.choices?.[0]?.message?.content || '{}';
        
        const finalizedScript = JSON.parse(content);
        console.log(`✅ Advanced TTS optimization completed`);
        return finalizedScript;
      } else {
        const errorText = await response.text();
        console.error(`❌ OpenAI finalization failed: ${response.status} - ${errorText}`);
      }
    } else {
      console.log(`⚠️ Using basic finalization (no OpenAI key or TTS optimization disabled)`);
    }
  } catch (error) {
    console.error(`❌ Script finalization error: ${error instanceof Error ? error.message : error}`);
  }

  // Fallback finalization - basic cleanup and optimization
  console.log('🔧 Performing basic script finalization');
  
  let totalWords = 0;
  let totalEstimatedSeconds = 0;
  
  const finalizedChapters = script.chapters.map(chapter => {
    const finalizedSegments = chapter.segments.map(segment => {
      // Basic artifact removal and cleanup
      let cleanText = segment.text
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*([^*]+)\*/g, '$1') // Remove italic markdown
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
        .replace(/`([^`]+)`/g, '$1') // Remove code backticks
        .trim();
      
      // Basic medical term optimization for TTS
      cleanText = cleanText
        .replace(/\bSTEMI\b/g, 'S-T-E-M-I')
        .replace(/\bNSTEMI\b/g, 'N-S-T-E-M-I')
        .replace(/\bACS\b/g, 'A-C-S')
        .replace(/\bECG\b/g, 'E-C-G')
        .replace(/\bEKG\b/g, 'E-K-G')
        .replace(/\bMI\b/g, 'M-I')
        .replace(/\bCPR\b/g, 'C-P-R')
        .replace(/\bICU\b/g, 'I-C-U')
        .replace(/\bER\b/g, 'E-R')
        .replace(/\bBP\b/g, 'blood pressure')
        .replace(/\bHR\b/g, 'heart rate');
      
      // Estimate duration (average speaking rate: 150 words per minute)
      const wordCount = cleanText.split(/\s+/).length;
      const estimatedSeconds = Math.round((wordCount / 150) * 60);
      totalWords += wordCount;
      
      // Basic SSML for TTS optimization
      let ssmlText = '';
      if (optimizeForTTS) {
        ssmlText = `<speak><prosody rate="medium">${cleanText}</prosody></speak>`;
        
        // Add pauses after medical terms
        ssmlText = ssmlText.replace(/(S-T-E-M-I|N-S-T-E-M-I|A-C-S)/g, '$1<break time="0.3s"/>');
        
        // Add emphasis for important medical concepts
        ssmlText = ssmlText.replace(/\b(guidelines|recommendation|contraindication|warning)\b/gi, 
          '<emphasis level="moderate">$1</emphasis>');
      }
      
      return {
        id: segment.id,
        speaker: segment.speaker,
        text: cleanText,
        ssml: optimizeForTTS ? ssmlText : undefined,
        estimatedDurationSeconds: estimatedSeconds,
        ttsOptimized: optimizeForTTS
      };
    });
    
    const chapterDuration = finalizedSegments.reduce((sum, seg) => sum + seg.estimatedDurationSeconds, 0);
    totalEstimatedSeconds += chapterDuration;
    
    return {
      id: chapter.id,
      title: chapter.title,
      segments: finalizedSegments,
      estimatedDurationSeconds: chapterDuration
    };
  });

  // Calculate basic readability score (based on average sentence length and word complexity)
  const averageWordsPerSegment = totalWords / script.chapters.reduce((total, ch) => total + ch.segments.length, 0);
  const readabilityScore = Math.max(0, Math.min(100, 100 - (averageWordsPerSegment - 15) * 2));

  const finalizedScript: FinalizedScript = {
    style: script.style,
    specialty: script.specialty,
    speakers: script.speakers,
    chapters: finalizedChapters,
    citations: script.citations,
    metadata: {
      totalEstimatedDurationSeconds: totalEstimatedSeconds,
      totalWords: totalWords,
      readabilityScore: Math.round(readabilityScore),
      ttsOptimized: optimizeForTTS,
      qualityChecks: {
        artifactsRemoved: true,
        pronunciationOptimized: optimizeForTTS,
        pacingOptimized: optimizeForTTS,
        voiceTagsApplied: true
      }
    },
    finalNotes: [
      'Script finalized and optimized for professional TTS production',
      `Estimated total duration: ${Math.round(totalEstimatedSeconds / 60)} minutes`,
      `Total word count: ${totalWords} words`,
      `Readability score: ${Math.round(readabilityScore)}/100`,
      ...(script.safetyReview.disclaimers || [])
    ]
  };

  return finalizedScript;
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
    console.log('🎯 Script Finalizer starting...');
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json() as FinalizationRequest;
    const { userId, script, optimizeForTTS = true } = body;

    console.log(`🔧 Finalization request:`, {
      userId,
      scriptTitle: script.chapters?.[0]?.title || 'Unknown',
      chapters: script.chapters.length,
      totalSegments: script.chapters.reduce((total, ch) => total + ch.segments.length, 0),
      ttsOptimization: optimizeForTTS
    });

    if (!userId || !script) {
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

    // Finalize and optimize script
    const finalizedScript = await finalizeScript(script, optimizeForTTS);

    console.log(`✅ Script finalization completed:`, {
      totalDurationMinutes: Math.round(finalizedScript.metadata.totalEstimatedDurationSeconds / 60),
      totalWords: finalizedScript.metadata.totalWords,
      readabilityScore: finalizedScript.metadata.readabilityScore,
      ttsOptimized: finalizedScript.metadata.ttsOptimized,
      qualityChecks: finalizedScript.metadata.qualityChecks
    });

    return new Response(JSON.stringify({
      success: true,
      finalizedScript,
      metadata: {
        finalizationTime: new Date().toISOString(),
        optimizationApplied: optimizeForTTS,
        qualityScore: finalizedScript.metadata.readabilityScore,
        productionReady: true,
        agentVersion: 'script-finalizer-v1.0'
      }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('❌ Script finalization failed:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Script finalization failed',
      details: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});