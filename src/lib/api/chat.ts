import { API_ENDPOINTS } from './constants';
import { APIResponse } from './types';
import { APIError } from './errors';
import { analyzeImage } from './vision';
import { supabase } from '../supabase';
import { PatientCase, Attachment, KnowledgeBaseType } from '../../types/chat';
import { convertAttachmentsToUploads } from '../../utils/fileUpload';
import { buildAttachmentTextContext, convertEnhancedAttachmentsToUploads } from '../../utils/chatFileProcessor';
import { buildEnhancedCaseContext } from '../../utils/caseAttachmentIntegration';
import { logger } from '../logger';
import { sessionManager } from '../auth/sessionManager';

// Retry utility for handling rate limiting and transient errors
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Don't retry on the last attempt or for non-retryable errors
      if (attempt === maxRetries || 
          (error instanceof APIError && error.status !== 429 && error.status !== 500 && error.status !== 502 && error.status !== 503)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      logger.debug(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, { attempt, delay, error }, { component: 'chat-api', action: 'retry' });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Direct Flowise call function for long-running queries (CURATED KNOWLEDGE BASE ONLY)
async function fetchAIResponseDirect(
  message: string,
  sessionId: string,
  caseContext?: PatientCase,
  attachments?: Attachment[],
  knowledgeBaseType?: KnowledgeBaseType,
  personalDocumentIds?: string[]
): Promise<APIResponse> {
  try {
    // GUARD: This function should NEVER be used for personal knowledge base
    if (knowledgeBaseType === 'personal') {
      throw new APIError('Personal knowledge base should use OpenAI Assistant endpoint, not Flowise direct', 500);
    }
    // Get authentication and Flowise config using session manager
    const session = await sessionManager.getValidSession();
    if (!session) {
      throw new APIError('Authentication required', 401);
    }

    logger.debug('Getting Flowise configuration...', undefined, { component: 'chat-api', action: 'getFlowiseConfig' });
    
    // Get Flowise configuration from Supabase Edge Function
    const authResponse = await retryWithBackoff(async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/flowise-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 404) {
          throw new APIError('Flowise auth endpoint not found - deployment issue', 404);
        }
        if (response.status === 409) {
          throw new APIError('Resource conflict during authentication', 409);
        }
        throw new APIError(`Failed to get Flowise configuration: ${response.status}`, response.status);
      }

      return response;
    }, 2, 1000); // Max 2 retries with 1 second base delay

    const authData = await authResponse.json();
    const { flowiseUrl, specialty, userId, vectorStoreId, openaiApiKey } = authData.data;

    logger.debug('Direct Flowise call', {
      url: flowiseUrl,
      specialty,
      hasVectorStore: !!vectorStoreId
    }, { component: 'chat-api', action: 'directFlowiseCall' });

    // Prepare request payload for Flowise
    const requestPayload: any = {
      question: message,
      overrideConfig: { sessionId }
    };

    logger.debug('Flowise API: Using session ID in overrideConfig', { sessionId }, { component: 'chat-api', action: 'directFlowiseCall' });

    // Add attachments/uploads if any
    if (attachments && attachments.length > 0) {
      const uploads = await convertAttachmentsToUploads(attachments);
      if (uploads && uploads.length > 0) {
        requestPayload.uploads = uploads;
      }
    }

    // Handle knowledge base configuration - CURATED ONLY
    requestPayload.knowledgeBase = {
      type: knowledgeBaseType || 'curated'
    };

    // Add case context if provided
    if (caseContext) {
      let caseString: string;
      
      // Check if enhanced context is available (includes attachment content)
      if ((caseContext as any).enhancedContext) {
        caseString = `Patient Case Context:
${(caseContext as any).enhancedContext}
- Current Question Context: This question relates to the above patient case.`;
      } else {
        // Generate enhanced context using buildEnhancedCaseContext
        const enhancedContext = buildEnhancedCaseContext(caseContext);
        caseString = `Patient Case Context:
${enhancedContext}
- Current Question Context: This question relates to the above patient case.`;
      }
      
      requestPayload.question = `${caseString}\n\nQuestion: ${message}`;
    }

    logger.debug('Making direct Flowise request...', undefined, { component: 'chat-api', action: 'directFlowiseCall' });

    // Make direct call to Flowise with retry logic for rate limiting
    const response = await retryWithBackoff(async () => {
      const fetchResponse = await fetch(flowiseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        logger.error('Direct Flowise error', {
          status: fetchResponse.status,
          error: errorText
        }, { component: 'chat-api', action: 'directFlowiseCall' });
        
        // Enhanced error handling for rate limiting
        if (fetchResponse.status === 429) {
          const isRateLimited = errorText.includes('message limit') || 
                               errorText.includes('rate limit') || 
                               errorText.includes('too many requests');
          
          if (isRateLimited) {
            throw new APIError(
              'Rate limit exceeded. Your Flowise instance has reached its message limit. Please wait a few minutes before trying again, or consider upgrading your Flowise plan.',
              429
            );
          }
        }
        
        throw new APIError(`Flowise error: ${fetchResponse.status} - ${errorText}`, fetchResponse.status);
      }

      return fetchResponse;
    }, 2, 2000); // Max 2 retries with 2 second base delay for rate limiting

    const result = await response.json();
    
    logger.debug('✅ Direct Flowise response received:', {
      hasText: !!result.text,
      hasResponse: !!result.response,
      hasSources: !!(result.sourceDocuments && result.sourceDocuments.length > 0),
      fullResult: result
    });

    // Extract the actual message text
    const messageText = result.text || result.response || result.answer || 'No response text found';
    
    logger.debug('🔍 Direct Flowise message extraction:', {
      text: result.text,
      response: result.response, 
      answer: result.answer,
      extractedMessage: messageText,
      messageLength: messageText?.length
    });

    // Format response to match expected APIResponse structure
    const formattedResponse = {
      text: messageText,
      sources: result.sourceDocuments || [],
      timestamp: new Date().toISOString(),
      chatId: sessionId,
      specialty: specialty
    };
    
    logger.debug('📤 Returning formatted response:', formattedResponse);
    
    return formattedResponse;

  } catch (error) {
    logger.error('Direct Flowise call failed:', error);
    throw error instanceof APIError ? error : new APIError(
      error instanceof Error ? error.message : 'Direct Flowise call failed', 
      500
    );
  }
}

export async function fetchAIResponse(
  message: string | { text: string; imageUrl?: string },
  sessionId: string,
  caseContext?: PatientCase,
  attachments?: Attachment[],
  knowledgeBaseType?: KnowledgeBaseType,
  personalDocumentIds?: string[]
): Promise<APIResponse> {
  try {
    let messageText = typeof message === 'string' ? message : message.text;
    let imageAnalysis = '';

    // If there's an image, analyze it first (legacy support)
    if (typeof message === 'object' && message.imageUrl) {
      try {
        // Convert base64 image URL to blob
        const base64Data = message.imageUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(I);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });

        // Analyze the image
        imageAnalysis = await analyzeImage(imageFile);
        messageText = `${messageText}\n\nImage Analysis: ${imageAnalysis}`;
      } catch (error) {
        logger.error('Failed to analyze image:', error);
      }
    }

    // If we have case context, prepend it to the message
    if (caseContext) {
      let caseContextText: string;
      
      // Check if enhanced context is available (includes attachment content)
      if ((caseContext as any).enhancedContext) {
        caseContextText = `
**ACTIVE CASE CONTEXT:**
${(caseContext as any).enhancedContext}

**USER QUESTION:**
${messageText}`;
      } else {
        // Generate enhanced context using buildEnhancedCaseContext
        const enhancedContext = buildEnhancedCaseContext(caseContext);
        caseContextText = `
**ACTIVE CASE CONTEXT:**
${enhancedContext}

**USER QUESTION:**
${messageText}`;
      }
      
      messageText = caseContextText;
    }

    // Note: Enhanced attachments with extracted text are already processed by MessageInput
    // The messageText already includes the extracted content via buildAttachmentTextContext

    // Get the current user session for authentication using session manager
    const session = await sessionManager.getValidSession();
    
    if (!session) {
      throw new APIError('Authentication required', 401);
    }

    // DEBUG: Log token information
    logger.debug('🔑 Using session token:', {
      hasAccessToken: !!session.access_token,
      tokenLength: session.access_token?.length,
      tokenPrefix: session.access_token?.substring(0, 20) + '...',
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A',
      currentTime: new Date().toISOString(),
      isValid: session.expires_at ? new Date(session.expires_at * 1000) > new Date() : false
    });

    // Prepare request body
    let requestBody: any = {
      message: messageText,
      conversationId: sessionId,
      caseContext: caseContext ? {
        id: caseContext.id,
        title: caseContext.title,
        specialty: caseContext.specialty
      } : undefined
    };

    // Add uploads if attachments are provided
    if (attachments && attachments.length > 0) {
      const uploads = convertAttachmentsToUploads(attachments);
      if (uploads.length > 0) {
        requestBody.uploads = uploads;
        logger.debug(`Including ${uploads.length} file uploads in request:`, uploads.map(u => `${u.name} (${u.type})`));
      }
    }

    // ROUTE BASED ON KNOWLEDGE BASE TYPE
    let apiEndpoint: string;
    const isPersonalKB = knowledgeBaseType === 'personal';
    
    logger.debug('🔍 KNOWLEDGE BASE ROUTING DEBUG:', {
      knowledgeBaseType,
      isPersonalKB,
      sessionId,
      hasCaseContext: !!caseContext
    });
    
    if (isPersonalKB) {
      // Route to OpenAI Assistants for personal knowledge base
      apiEndpoint = '/api/openai-assistant';
      logger.debug('🤖 Routing to OpenAI Assistants for personal knowledge base');
      
      // Format request body specifically for OpenAI Assistant endpoint
      requestBody = {
        message: messageText,
        conversationId: sessionId,
        caseContext: caseContext || null // Send full case object or null
      };
      
      logger.debug('🔍 OpenAI Assistant Request Body:', {
        message: messageText,
        messageType: typeof messageText,
        messageLength: messageText?.length,
        conversationId: sessionId,
        caseContext: caseContext,
        fullRequestBody: requestBody
      });
      
      // Remove uploads field for OpenAI Assistant (not supported yet)
      if (requestBody.uploads) {
        logger.warn('File uploads not yet supported for personal knowledge base');
        delete requestBody.uploads;
      }
    } else {
      // Use direct Flowise call for curated knowledge base (no timeout limits!)
      logger.debug('🌊 Using direct Flowise call for curated knowledge base');
      
      return await fetchAIResponseDirect(
        messageText,
        sessionId,
        caseContext,
        attachments,
        knowledgeBaseType,
        personalDocumentIds
      );
    }

    logger.debug(`📡 Sending ${knowledgeBaseType || 'personal'} KB request to:`, apiEndpoint);

    // Make the API request (for personal KB only now) with retry logic
    const response = await retryWithBackoff(async () => {
      const fetchResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json().catch(() => null);
        
        // Handle specific error cases
        if (fetchResponse.status === 409) {
          throw new APIError('Resource conflict - retrying...', 409);
        }
        
        throw new APIError(
          errorData?.error || `HTTP error! status: ${fetchResponse.status}`, 
          fetchResponse.status
        );
      }

      return fetchResponse;
    }, 2, 1000); // Max 2 retries with 1 second base delay

    const data = await response.json();
    
    // Extract the response data from our standardized API response
    const responseData = data.data || data;
    
    return { 
      text: responseData.message || '',
      sources: responseData.sources || [],
      imageAnalysis: imageAnalysis || undefined
    };
  } catch (error) {
    logger.error('Failed to fetch AI response:', error);
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to fetch AI response'
    );
  }
}