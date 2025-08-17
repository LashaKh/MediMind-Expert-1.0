import { useState, useCallback } from 'react';
import { fetchAIResponse } from '../../lib/api/chat';
import { APIError } from '../../lib/api/errors';
import { Message, SourceReference, PatientCase, Attachment, KnowledgeBaseType } from '../../types/chat';
import { v4 as uuidv4 } from 'uuid';

interface UseFlowiseChatOptions {
  onMessageReceived?: (message: Message) => void;
  onError?: (error: string) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  sessionId?: string;
  caseContext?: PatientCase | null;
  knowledgeBaseType?: KnowledgeBaseType;
  personalDocumentIds?: string[];
}

interface UseFlowiseChatReturn {
  sendMessage: (content: string, attachments?: Attachment[], caseContext?: PatientCase | null, knowledgeBaseType?: KnowledgeBaseType, personalDocumentIds?: string[], enhancedMessage?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  isRateLimited: boolean;
  clearRateLimit: () => void;
}

export const useFlowiseChat = (options: UseFlowiseChatOptions = {}): UseFlowiseChatReturn => {
  const {
    onMessageReceived,
    onError,
    onTypingStart,
    onTypingEnd,
    sessionId: providedSessionId,
    caseContext: defaultCaseContext,
    knowledgeBaseType,
    personalDocumentIds
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  
  // Use providedSessionId directly, fallback to generated UUID only if none provided
  // This ensures we always use the latest sessionId from ChatContext
  const sessionId = providedSessionId || uuidv4();

  const sendMessage = useCallback(async (content: string, attachments?: Attachment[], caseContext?: PatientCase | null, knowledgeBaseType?: KnowledgeBaseType, personalDocumentIds?: string[], enhancedMessage?: string) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    setIsLoading(true);
    setError(null);
    onTypingStart?.();

    // Use provided case context or default from options
    const activeCaseContext = caseContext !== undefined ? caseContext : defaultCaseContext;

    try {
      // Format message for API - with new attachment support, we primarily use string
      let messageInput: string | { text: string; imageUrl?: string } = content;
      
      // Legacy image handling for backward compatibility
      if (attachments && attachments.length > 0) {
        const imageAttachment = attachments.find(att => att.type?.startsWith('image/') && att.preview && !att.base64Data);
        if (imageAttachment) {
          messageInput = {
            text: content,
            imageUrl: imageAttachment.url || imageAttachment.preview
          };
        }
      }

      // Use enhanced message if available (contains extracted text), otherwise use original
      const finalMessage = enhancedMessage || messageInput;
      
      // If we have an enhanced message, don't send attachments (text already extracted)
      // Otherwise, send attachments for processing
      const finalAttachments = enhancedMessage ? undefined : attachments;
      
      // Send to Flowise API with case context
      const response = await fetchAIResponse(
        finalMessage, 
        sessionId, 
        activeCaseContext || undefined,
        finalAttachments,
        knowledgeBaseType,
        personalDocumentIds
      );
      
      // Process the response and create AI message
      const aiMessage: Message = {
        id: uuidv4(),
        content: response.text || 'I apologize, but I couldn\'t generate a response. Please try again.',
        type: 'ai',
        timestamp: new Date(),
        sources: (response.sources || []).map((source: any) => {
          // Debug log to understand the source structure
          
          return {
            id: uuidv4(),
            title: source.title || source.name || source.metadata?.title || 'Medical Source',
            url: source.url || source.metadata?.url,
            type: source.type || source.metadata?.type || 'document',
            excerpt: source.excerpt || 
                    source.content?.substring(0, 200) + '...' ||
                    source.pageContent?.substring(0, 200) + '...' ||
                    source.text?.substring(0, 200) + '...' ||
                    'No excerpt available'
          } as SourceReference;
        })
      };

      // Add image analysis if present (legacy support)
      if (response.imageAnalysis) {
        aiMessage.content = `${aiMessage.content}\n\n**Image Analysis:**\n${response.imageAnalysis}`;
      }

      onMessageReceived?.(aiMessage);
      
    } catch (err) {

      let errorMessage = 'Failed to send message. Please try again.';
      
      if (err instanceof APIError) {
        // Enhanced handling for rate limiting (429 errors)
        if (err.status === 429) {
          errorMessage = 'Rate limit exceeded. Your AI service has reached its message limit. Please wait a few minutes before trying again.';
          setIsRateLimited(true);
        } else if (err.status === 401) {
          // Special handling for authentication errors
          errorMessage = 'Your session has expired. Please refresh the page or sign in again to continue.';
        } else {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      onError?.(errorMessage);

      // Create error message for display
      const errorAIMessage: Message = {
        id: uuidv4(),
        content: `I'm sorry, I encountered an error: ${errorMessage}. Please try again or contact support if the issue persists.`,
        type: 'ai',
        timestamp: new Date(),
        status: 'error'
      };

      onMessageReceived?.(errorAIMessage);
      
    } finally {
      setIsLoading(false);
      onTypingEnd?.();
    }
  }, [sessionId, onMessageReceived, onError, onTypingStart, onTypingEnd, defaultCaseContext, knowledgeBaseType, personalDocumentIds]);

  const clearRateLimit = useCallback(() => {
    setIsRateLimited(false);
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
    sessionId,
    isRateLimited,
    clearRateLimit
  };
}; 