import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import OpenAI from 'https://deno.land/x/openai@v4.33.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// CORS configuration for MediMind Expert
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-auth-token, x-csrf-token, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Origin'
};

console.log('Edge function `openai-assistant` initializing...');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request (CORS preflight)');
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    console.log('OpenAI Assistant function starting');

    // Validate environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error('CRITICAL: Required environment variables not set.');
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing environment variables.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Parse JSON request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { 
      message, 
      conversationId, 
      caseContext = null, 
      imageAnalysis = null 
    } = requestData;

    if (!message) {
      return new Response(JSON.stringify({ 
        error: 'Message is required' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Initialize clients
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Authentication failed:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    console.log(`Processing assistant request for user: ${user.id}`);

    // Get user's vector store
    const { data: vectorStore, error: vectorStoreError } = await supabase
      .from('user_vector_stores')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (vectorStoreError || !vectorStore) {
      return new Response(JSON.stringify({ 
        error: 'No personal knowledge base found. Please upload some documents first.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const openaiVectorStoreId = vectorStore.openai_vector_store_id;

    // Get or create assistant with vector store
    let assistantId;
    
    if (vectorStore.openai_assistant_id) {
      assistantId = vectorStore.openai_assistant_id;
      console.log(`Using existing assistant: ${assistantId}`);
    } else {
      // Create new assistant
      console.log('Creating new assistant with vector store');
      const assistant = await openai.beta.assistants.create({
        model: "gpt-4-turbo-preview",
        name: "Personal Medical Knowledge Assistant",
        description: "AI assistant with access to your personal medical knowledge base",
        instructions: `You are a helpful medical AI assistant with access to the user's personal knowledge base. 
        
        Use the knowledge from the user's uploaded documents to provide informed responses. 
        Always cite specific documents when referencing information from the knowledge base.
        
        If you cannot find relevant information in the knowledge base, clearly state this and provide general medical knowledge while emphasizing the need to consult healthcare professionals for specific medical advice.
        
        Important: Always maintain medical ethics and remind users that this information is for educational purposes and should not replace professional medical consultation.`,
        tools: [{ type: "file_search" }],
        tool_resources: {
          file_search: {
            vector_store_ids: [openaiVectorStoreId]
          }
        }
      });

      assistantId = assistant.id;

      // Save assistant ID to database
      await supabase
        .from('user_vector_stores')
        .update({ 
          openai_assistant_id: assistantId,
          updated_at: new Date().toISOString()
        })
        .eq('id', vectorStore.id);

      console.log(`Created new assistant: ${assistantId}`);
    }

    // Get or create thread for this conversation
    let threadId;
    
    if (conversationId) {
      // Check if we have a stored thread for this conversation
      const { data: conversation } = await supabase
        .from('chat_conversations')
        .select('openai_thread_id')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (conversation?.openai_thread_id) {
        threadId = conversation.openai_thread_id;
        console.log(`Using existing thread: ${threadId}`);
      }
    }

    if (!threadId) {
      // Create new thread
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      console.log(`Created new thread: ${threadId}`);

      // Save thread ID if we have a conversation ID
      if (conversationId) {
        await supabase
          .from('chat_conversations')
          .update({ openai_thread_id: threadId })
          .eq('id', conversationId)
          .eq('user_id', user.id);
      }
    }

    // Prepare message content
    let messageContent = message;

    // Add case context if provided
    if (caseContext && caseContext.trim()) {
      messageContent = `Context: ${caseContext}\n\nQuestion: ${message}`;
    }

    // Add image analysis if provided
    if (imageAnalysis && imageAnalysis.trim()) {
      messageContent = `Image Analysis Context: ${imageAnalysis}\n\nMessage: ${messageContent}`;
    }

    // Add message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: messageContent
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });

    console.log(`Started run: ${run.id}`);

    // Poll for completion
    let runStatus = run;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds maximum wait time

    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      if (attempts >= maxAttempts) {
        console.error('Run timeout after 60 seconds');
        return new Response(JSON.stringify({ 
          error: 'Request timeout. Please try again.' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 408,
        });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      attempts++;
    }

    console.log(`Run completed with status: ${runStatus.status}`);

    if (runStatus.status === 'completed') {
      // Get the assistant's response
      const messages = await openai.beta.threads.messages.list(threadId, {
        order: 'desc',
        limit: 1
      });

      const lastMessage = messages.data[0];
      if (lastMessage && lastMessage.role === 'assistant') {
        const messageContent = lastMessage.content[0];
        
        if (messageContent.type === 'text') {
          let responseText = messageContent.text.value;
          let sources: string[] = [];

          // Extract file citations if any
          if (messageContent.text.annotations && messageContent.text.annotations.length > 0) {
            const fileIds = new Set<string>();
            
            for (const annotation of messageContent.text.annotations) {
              if (annotation.type === 'file_citation' && annotation.file_citation?.file_id) {
                fileIds.add(annotation.file_citation.file_id);
              }
            }

            // Get document names for the cited files
            if (fileIds.size > 0) {
              const { data: documents } = await supabase
                .from('user_documents')
                .select('title, openai_file_id')
                .eq('user_id', user.id)
                .in('openai_file_id', Array.from(fileIds));

              if (documents) {
                sources = documents.map(doc => doc.title);
              }
            }
          }

          return new Response(JSON.stringify({
            message: responseText,
            sources: sources,
            threadId: threadId,
            runId: run.id
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
      }
    }

    // Handle failed runs
    if (runStatus.status === 'failed') {
      console.error('Assistant run failed:', runStatus.last_error);
      return new Response(JSON.stringify({ 
        error: 'Assistant processing failed. Please try again.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Fallback for other statuses
    return new Response(JSON.stringify({ 
      error: 'Unexpected assistant status. Please try again.' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });

  } catch (error) {
    console.error('OpenAI Assistant error:', error);
    
    return new Response(JSON.stringify({
      error: 'Assistant request failed',
      details: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

console.log('Edge function `openai-assistant` is ready to serve requests.');