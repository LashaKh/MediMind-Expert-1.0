import { withMedicalSecurity } from './utils/middleware';
import { parseRequest } from './utils/request';
import { successResponse, errorResponse } from './utils/response';
import { handleError, ValidationError } from './utils/errors';
import { logger } from './utils/logger';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// Assistant IDs for different specialties
const ASSISTANT_IDS: Record<string, string> = {
  cardiology: 'asst_ov0Jukmipraw1CHFXir58p9r',
  'ob-gyn': 'asst_9WyiKUGg7eJis2wDuFQwsCjz',
  'obgyn': 'asst_9WyiKUGg7eJis2wDuFQwsCjz' // Alternative spelling
};

// Interface for case context
interface CaseContext {
  id?: string;
  title: string;
  description: string;
  specialty: string;
  anonymizedInfo?: string;
  metadata?: {
    tags?: string[];
    complexity?: string;
  };
}

// Get user's Vector Store ID from database
async function getUserVectorStoreId(userId: string): Promise<string | null> {
  try {
    logger.info('Fetching Vector Store for user', { userId });
    
    const { data: vectorStore, error } = await supabase
      .from('user_vector_stores')
      .select('openai_vector_store_id')
      .eq('user_id', userId)
      .single();

    logger.info('Vector Store query result', {
      userId,
      hasData: !!vectorStore,
      vectorStoreId: vectorStore?.openai_vector_store_id,
      error: error?.message,
      errorCode: error?.code
    });

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info(`No Vector Store found for user ${userId}`);
        return null;
      }
      throw error;
    }

    return vectorStore?.openai_vector_store_id || null;
  } catch (error) {
    logger.error('Error fetching user Vector Store ID', {
      userId,
      error: (error as Error).message
    });
    return null;
  }
}

// Get or create a thread for the conversation
async function getOrCreateThread(conversationId: string, userId: string): Promise<string> {
  try {
    // Try to get existing thread from database
    const { data: existingThread, error: fetchError } = await supabase
      .from('openai_threads')
      .select('thread_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (existingThread && !fetchError) {
      logger.info(`Using existing thread: ${existingThread.thread_id}`);
      return existingThread.thread_id;
    }

    // Create new thread
    const thread = await openai.beta.threads.create();
    
    // Store thread in database
    await supabase
      .from('openai_threads')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        thread_id: thread.id,
        created_at: new Date().toISOString()
      });

    logger.info(`Created new thread: ${thread.id}`);
    return thread.id;
  } catch (error) {
    logger.error('Error getting/creating thread', {
      conversationId,
      userId,
      error: (error as Error).message
    });
    throw error;
  }
}

// Send message to OpenAI Assistant
async function sendToAssistant(
  message: string, 
  assistantId: string, 
  threadId: string, 
  vectorStoreId: string | null, 
  caseContext: CaseContext | null = null
) {
  try {
    // Prepare the message content
    let messageContent = message;
    
    // Add case context if provided
    if (caseContext) {
      const caseContextText = `
**ACTIVE CASE CONTEXT:**
Case Title: ${caseContext.title}
Case Description: ${caseContext.description}
Specialty: ${caseContext.specialty}
${caseContext.anonymizedInfo ? `Patient Info: ${caseContext.anonymizedInfo}` : ''}
${caseContext.metadata?.tags ? `Tags: ${caseContext.metadata.tags.join(', ')}` : ''}
${caseContext.metadata?.complexity ? `Complexity: ${caseContext.metadata.complexity}` : ''}

**USER QUESTION:**
${message}`;
      
      messageContent = caseContextText;
    }

    // Add message to thread
    logger.info('📝 Adding message to thread', { threadId, messageLength: messageContent.length });
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: messageContent
    });

    // Create run with the assistant
    logger.info('🚀 Creating assistant run', { assistantId, hasVectorStore: !!vectorStoreId });
    const runParams: any = {
      assistant_id: assistantId
    };

    // If user has a Vector Store, configure the assistant to use it
    if (vectorStoreId) {
      runParams.tools = [
        {
          type: 'file_search'
        }
      ];
      runParams.tool_resources = {
        file_search: {
          vector_store_ids: [vectorStoreId]
        }
      };
    }

    const run = await openai.beta.threads.runs.create(threadId, runParams);

    // Poll for completion
    logger.info('🔍 Starting run polling', { threadId, runId: run.id, threadIdType: typeof threadId });
    
    // Debug: Log exact values before API call
    logger.info('🔍 Pre-API call debug', {
      threadId,
      runId: run.id,
      threadIdType: typeof threadId,
      runIdType: typeof run.id,
      threadIdLength: threadId?.length,
      runIdLength: run.id?.length
    });
    
    // FIX: Use correct OpenAI SDK v5+ API structure - runId first, threadId as named parameter
    let runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: threadId });
    
    // Adjust timeout based on environment
    const isDevelopment = process.env.NETLIFY_DEV === 'true';
    const maxWaitTime = isDevelopment ? 25000 : 180000; // 25s in dev, 3 minutes in production
    const startTime = Date.now();
    
    logger.info('⏱️ Starting assistant polling', {
      isDevelopment,
      maxWaitTimeSeconds: maxWaitTime / 1000,
      environment: process.env.NODE_ENV || 'unknown'
    });
    
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      if (Date.now() - startTime > maxWaitTime) {
        logger.error('Assistant response timeout', {
          threadId,
          runId: run.id,
          elapsedTime: Date.now() - startTime,
          maxWaitTime,
          lastStatus: runStatus.status,
          isDevelopment
        });
        
        if (isDevelopment) {
          // In development, provide helpful guidance
          throw new Error(`Development timeout after ${maxWaitTime / 1000}s. The query is processing but may take longer. In production, this will complete successfully with a 5-minute timeout.`);
        } else {
          throw new Error(`Assistant response timeout after ${maxWaitTime / 1000} seconds. Please try asking a simpler question or break it into smaller parts.`);
        }
      }
      
      // Optimized polling: faster initial checks, then progressive backoff
      const elapsed = Date.now() - startTime;
      const delayMs = elapsed < 10000 ? 500 : elapsed < 30000 ? 1000 : elapsed < 60000 ? 2000 : 3000;
      
      // Debug: Log polling status with timing
      logger.info('🔄 Polling assistant run', {
        runId: run.id,
        threadId,
        status: runStatus.status,
        elapsedMs: elapsed,
        elapsedSeconds: Math.round(elapsed / 1000),
        nextDelayMs: delayMs
      });
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      // FIX: Use correct OpenAI SDK v5+ API structure - runId first, threadId as named parameter
      runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: threadId });
    }

    if (runStatus.status === 'failed') {
      throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
    }

    if (runStatus.status !== 'completed') {
      throw new Error(`Assistant run ended with status: ${runStatus.status}`);
    }

    // Get the response messages
    const messages = await openai.beta.threads.messages.list(threadId, {
      order: 'desc',
      limit: 1
    });

    const assistantMessage = messages.data[0];
    if (!assistantMessage || assistantMessage.role !== 'assistant') {
      throw new Error('No assistant response found');
    }

    // Extract text content
    const textContent = assistantMessage.content
      .filter(content => content.type === 'text')
      .map(content => (content as any).text.value)
      .join('\n');

    // Extract sources from annotations
    const sources: any[] = [];
    assistantMessage.content.forEach(content => {
      if (content.type === 'text' && (content as any).text.annotations) {
        (content as any).text.annotations.forEach((annotation: any) => {
          if (annotation.type === 'file_citation') {
            sources.push({
              type: 'document',
              title: annotation.file_citation.file_id,
              content: annotation.text,
              page: null
            });
          }
        });
      }
    });

    return {
      message: textContent,
      sources: sources,
      threadId: threadId,
      runId: run.id
    };

  } catch (error) {
    logger.error('Error sending message to assistant', {
      assistantId,
      threadId,
      error: (error as Error).message
    });
    throw error;
  }
}

// Main handler function
async function handleAssistantRequest(event: HandlerEvent, user: any) {
  try {
    logger.info('🎯 Starting OpenAI Assistant Request Handler', {
      userId: user?.id,
      userSpecialty: user?.specialty,
      method: event.httpMethod,
      path: event.path,
      hasBody: !!event.body
    });

    // Parse request with detailed debugging
    const { body, method } = parseRequest(event);
    
    // ENHANCED DEBUGGING
    logger.info('📝 OpenAI Assistant Request - Full Debug', {
      method,
      hasBody: !!body,
      bodyType: typeof body,
      bodyContent: body,
      rawBody: event.body,
      headers: event.headers,
      userId: user?.id,
      userSpecialty: user?.specialty
    });

    if (method !== 'POST') {
      throw new ValidationError('Only POST method is allowed');
    }

    if (!body) {
      throw new ValidationError('Request body is required');
    }

    const { message, conversationId, caseContext, threadId: requestThreadId } = body;
    
    // ENHANCED MESSAGE VALIDATION WITH DEBUGGING
    logger.info('🔍 Message Validation Debug', {
      message,
      messageType: typeof message,
      messageLength: message?.length,
      messageValue: JSON.stringify(message),
      conversationId,
      caseContext,
      threadId: requestThreadId,
      fullBody: JSON.stringify(body)
    });

    // Special case: if message is '__GET_MESSAGES__', return existing messages from thread
    if (message === '__GET_MESSAGES__' && requestThreadId) {
      logger.info('📨 Special request: Retrieving messages from thread', { threadId: requestThreadId });
      
      try {
        // Get messages from the thread
        const messages = await openai.beta.threads.messages.list(requestThreadId, {
          order: 'asc',
          limit: 100
        });

        // Convert OpenAI messages to our format
        const formattedMessages = messages.data.map((msg: any, index: number) => {
          const textContent = msg.content
            .filter((content: any) => content.type === 'text')
            .map((content: any) => content.text.value)
            .join('\n');

          return {
            id: `msg-${index}-${Date.now()}`,
            content: textContent,
            role: msg.role === 'assistant' ? 'ai' : 'user',
            timestamp: new Date(msg.created_at * 1000),
            sources: [] // We could extract sources from annotations if needed
          };
        });

        logger.info('✅ Successfully retrieved messages', { 
          threadId: requestThreadId, 
          messageCount: formattedMessages.length 
        });

        return successResponse({
          messages: formattedMessages,
          metadata: {
            threadId: requestThreadId,
            messageCount: formattedMessages.length
          }
        });
      } catch (error) {
        logger.error('❌ Error retrieving messages from thread', {
          threadId: requestThreadId,
          error: (error as Error).message
        });
        return errorResponse(`Failed to retrieve messages: ${(error as Error).message}`, 500);
      }
    }

    if (!message || typeof message !== 'string') {
      logger.error('❌ Message validation failed', {
        message,
        messageType: typeof message,
        messageIsString: typeof message === 'string',
        messageExists: !!message,
        messageLength: message?.length
      });
      throw new ValidationError('Message is required and must be a string');
    }

    logger.info('✅ Message validation passed, proceeding with assistant request');

    // Get assistant ID based on user's specialty
    const normalizedSpecialty = user.specialty?.toLowerCase().replace(/[^a-z-]/g, '');
    const assistantId = ASSISTANT_IDS[normalizedSpecialty] || ASSISTANT_IDS.cardiology;

    logger.info('🤖 OpenAI Assistant configuration', {
      userId: user.id,
      specialty: user.specialty,
      normalizedSpecialty,
      assistantId: assistantId,
      hasConversationId: !!conversationId,
      hasCaseContext: !!caseContext
    });

    // Get user's Vector Store ID
    logger.info('🔍 Fetching Vector Store for user...');
    const vectorStoreId = await getUserVectorStoreId(user.id);
    logger.info('📦 Vector Store result', { vectorStoreId, userId: user.id });
    
    // DEBUG: Let's also check what Vector Stores exist in the database
    try {
      const { data: allVectorStores, error: debugError } = await supabase
        .from('user_vector_stores')
        .select('user_id, openai_vector_store_id, name, created_at')
        .limit(10);
        
      logger.info('DEBUG: All Vector Stores in database', {
        allVectorStores,
        debugError: debugError?.message,
        lookingForUserId: user.id
      });
    } catch (debugError) {
      logger.error('DEBUG: Failed to query all Vector Stores', {
        error: (debugError as Error).message
      });
    }
    
    // Vector Store is optional - assistant can work without personal documents
    if (vectorStoreId) {
      logger.info('✅ Using personal Vector Store', { vectorStoreId });
    } else {
      logger.info('ℹ️ No personal Vector Store found - using base assistant without personal documents');
    }

    // Get or create thread for this conversation
    logger.info('🧵 Getting or creating thread...');
    const threadId = await getOrCreateThread(conversationId || `default-${user.id}`, user.id);
    logger.info('🧵 Thread ready', { threadId });

    // Send message to assistant (vectorStoreId can be null)
    logger.info('🚀 Sending message to OpenAI Assistant...');
    const response = await sendToAssistant(message, assistantId, threadId, vectorStoreId, caseContext);
    logger.info('✅ OpenAI Assistant response received', { 
      messageLength: response.message?.length,
      sourcesCount: response.sources?.length,
      threadId: response.threadId,
      runId: response.runId
    });

    const result = successResponse({
      message: response.message,
      sources: response.sources,
      metadata: {
        assistantId: assistantId,
        threadId: response.threadId,
        runId: response.runId,
        vectorStoreId: vectorStoreId
      }
    });

    logger.info('🎉 OpenAI Assistant request completed successfully');
    return result;

  } catch (error) {
    logger.error('💥 Assistant request failed', {
      userId: user?.id,
      error: (error as Error).message,
      stack: (error as Error).stack,
      errorType: error.constructor.name,
      errorDetails: error
    });

    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }

    // Return more specific error message for debugging
    const errorMessage = (error as Error).message || 'Unknown error occurred';
    return errorResponse(`Assistant error: ${errorMessage}`, 500);
  }
}

// Export the handler with security middleware
export const handler: Handler = withMedicalSecurity(async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const { user } = context as any;
    
    // TEMPORARY DEBUG: If query param debug=true, return user info
    if (event.queryStringParameters?.debug === 'true') {
      return successResponse({
        debugInfo: {
          userId: user.id,
          userEmail: user.email,
          userSpecialty: user.specialty,
          fullUser: user
        }
      });
    }
    
    // TEMPORARY DEBUG: If query param test=true, return success without calling OpenAI
    if (event.queryStringParameters?.test === 'true') {
      return successResponse({
        message: "Test successful - function is working",
        sources: [],
        metadata: {
          assistantId: "test",
          threadId: "test-thread",
          runId: "test-run",
          vectorStoreId: null
        }
      });
    }
    
    return await handleAssistantRequest(event, user);
  } catch (error) {
    logger.error('OpenAI Assistant handler error', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      errorType: error.constructor.name,
      fullError: error
    });
    
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }
    
    // Return more detailed error for debugging
    const errorMessage = (error as Error).message || 'Unknown handler error';
    return errorResponse(`Handler error: ${errorMessage}`, 500);
  }
}); 