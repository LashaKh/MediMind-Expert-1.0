import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessTextRequest {
  transcript: string;
  userInstruction: string;
  sessionId?: string;
  model?: string;
}

interface ProcessTextResponse {
  result: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcript, userInstruction, sessionId, model = 'gpt-4o-mini' }: ProcessTextRequest = await req.json();

    if (!transcript || !userInstruction) {
      return new Response(
        JSON.stringify({ error: 'Missing transcript or userInstruction' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const startTime = Date.now();

    // Construct the prompt for GPT-4 mini
    const systemPrompt = `You are an AI assistant that helps users process Georgian text according to their specific instructions. You will receive:

1. A Georgian transcript (speech-to-text output)
2. User instructions on what to do with this transcript

Your task is to:
- Follow the user's instructions precisely
- Handle Georgian text correctly and maintain proper encoding
- Provide clear, helpful responses in the language requested by the user
- If translation is requested, provide accurate translations
- If analysis is requested, provide thorough analysis
- If summarization is requested, provide concise summaries
- Maintain the context and meaning of the original Georgian text

Respond in a clear, professional manner.`;

    const userPrompt = `Georgian transcript:
"""
${transcript}
"""

User instruction:
"""
${userInstruction}
"""

Please process the Georgian transcript according to the user's instruction above.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to process text with OpenAI', details: errorData }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const processingTime = Date.now() - startTime;

    if (!data.choices || data.choices.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No response from OpenAI' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result: ProcessTextResponse = {
      result: data.choices[0].message.content.trim(),
      model: data.model,
      tokensUsed: data.usage?.total_tokens,
      processingTime
    };

    // Log processing for analytics (optional)
    console.log(`Processed Georgian text: ${transcript.length} chars, ${userInstruction.length} instruction chars, took ${processingTime}ms`);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Process Georgian text error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});