import { useState, useCallback, useMemo } from 'react';
import { fetchAIResponse, fetchAIResponseStreaming } from '../../lib/api/chat';
import { isStreamingEnabled } from '../../lib/api/streamingService';
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
  // Streaming options
  enableStreaming?: boolean;
  onStreamStart?: (messageId: string) => void;
  onStreamToken?: (messageId: string, token: string) => void;
  onStreamComplete?: (messageId: string, sources?: SourceReference[]) => void;
  onStreamError?: (messageId: string, error: string) => void;
}

interface UseFlowiseChatReturn {
  sendMessage: (content: string, attachments?: Attachment[], caseContext?: PatientCase | null, knowledgeBaseType?: KnowledgeBaseType, personalDocumentIds?: string[], enhancedMessage?: string) => Promise<void>;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sessionId: string;
  isRateLimited: boolean;
  clearRateLimit: () => void;
  streamingMessageId: string | null;
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
    personalDocumentIds,
    enableStreaming,
    onStreamStart,
    onStreamToken,
    onStreamComplete,
    onStreamError
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Use providedSessionId directly, fallback to generated UUID only if none provided
  // Memoize to prevent regeneration on every render
  const sessionId = useMemo(() => {
    return providedSessionId || uuidv4();
  }, [providedSessionId]);

  // Determine if streaming should be used
  const useStreaming = useMemo(() => {
    return (enableStreaming !== false) && isStreamingEnabled();
  }, [enableStreaming]);

  const sendMessage = useCallback(async (content: string, attachments?: Attachment[], caseContext?: PatientCase | null, knowledgeBaseType?: KnowledgeBaseType, personalDocumentIds?: string[], enhancedMessage?: string) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    setIsLoading(true);
    setError(null);
    onTypingStart?.();

    // Use provided case context or default from options
    const activeCaseContext = caseContext !== undefined ? caseContext : defaultCaseContext;

    try {
      // STREAMING PATH
      if (useStreaming) {
        const messageId = uuidv4();
        setStreamingMessageId(messageId);
        setIsStreaming(true);
        onStreamStart?.(messageId);

        // Format message for API
        let messageInput: string | { text: string; imageUrl?: string } = content;

        // Legacy image handling
        if (attachments && attachments.length > 0) {
          const imageAttachment = attachments.find(att => att.type?.startsWith('image/') && att.preview && !att.base64Data);
          if (imageAttachment) {
            messageInput = {
              text: content,
              imageUrl: imageAttachment.url || imageAttachment.preview
            };
          }
        }

        const finalMessage = enhancedMessage || messageInput;
        const finalAttachments = enhancedMessage ? undefined : attachments;

        let accumulatedContent = '';
        let sources: any[] = [];

        await fetchAIResponseStreaming(
          finalMessage,
          sessionId,
          {
            onToken: (token: string) => {
              accumulatedContent += token;
              onStreamToken?.(messageId, token);
            },
            onSource: (receivedSources: any[]) => {
              sources = receivedSources;
            },
            onComplete: () => {
              // Process sources for streaming completion
              const processedSources = sources.map((source: any) => {
                const checkAndExtract = (value: any) => {
                  if (!value) return '';
                  const str = String(value);
                  if (
                    str === 'undefined...' ||
                    str === 'undefined' ||
                    str === 'null' ||
                    str.startsWith('undefined') ||
                    str.includes('undefined') ||
                    str.trim() === '' ||
                    str === '[object Object]' ||
                    str.length < 3
                  ) {
                    return '';
                  }
                  return str.trim();
                };

                let extractedText = '';
                extractedText = checkAndExtract(source.pageContent) ||
                               checkAndExtract(source.metadata?.pageContent) ||
                               checkAndExtract(source.content) ||
                               checkAndExtract(source.text) ||
                               checkAndExtract(source.excerpt) ||
                               checkAndExtract(source.metadata?.text) ||
                               checkAndExtract(source.metadata?.content) ||
                               (typeof source === 'string' ? checkAndExtract(source) : '');

                if (extractedText && extractedText.length > 5000) {
                  extractedText = extractedText.substring(0, 5000) + '...';
                }

                const finalExcerpt = extractedText && extractedText !== 'undefined...' && extractedText !== 'undefined'
                  ? extractedText
                  : 'No text content available';

                return {
                  id: uuidv4(),
                  title: source.title || source.name || source.metadata?.title || source.metadata?.source || 'Medical Source',
                  url: source.url || source.metadata?.url,
                  type: source.type || source.metadata?.type || 'document',
                  excerpt: finalExcerpt
                } as SourceReference;
              });

              // Pass sources to streaming completion (NO duplicate message creation!)
              onStreamComplete?.(messageId, processedSources);
              setIsStreaming(false);
              setStreamingMessageId(null);
              setIsLoading(false); // Clear loading state (finally block won't run due to early return)
              // Note: Typing indicator cleared in handleStreamStart, not here
              console.log('✅ Streaming complete');
            },
            onError: (error: Error) => {
              const errorMessage = error.message || 'Streaming failed';
              // Update the existing streaming message with error (no duplicate!)
              onStreamError?.(messageId, errorMessage);
              setError(errorMessage);
              onError?.(errorMessage);
              setIsStreaming(false);
              setStreamingMessageId(null);
              setIsLoading(false); // Clear loading state (finally block won't run due to early return)
              // Note: Typing indicator cleared in handleStreamStart, not here
              // NOTE: Don't call onMessageReceived - error already set on streaming message
            }
          },
          activeCaseContext || undefined,
          finalAttachments,
          knowledgeBaseType || 'curated',
          personalDocumentIds
        );

        return; // Exit after streaming completes
      }

      // NON-STREAMING PATH (fallback)
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
      
      // Send to Flowise API with case context - ensure curated KB is default
      const response = await fetchAIResponse(
        finalMessage, 
        sessionId, 
        activeCaseContext || undefined,
        finalAttachments,
        knowledgeBaseType || 'curated',
        personalDocumentIds
      );
      
      // Process the response and create AI message
      const aiMessage: Message = {
        id: uuidv4(),
        content: response.text || 'I apologize, but I couldn\'t generate a response. Please try again.',
        type: 'ai',
        timestamp: new Date(),
        sources: (response.sources || []).map((source: any) => {
          // Check each possible field for text content, but skip if it's "undefined..." or similar
          const checkAndExtract = (value: any) => {
            if (!value) return '';
            const str = String(value);
            
            // More comprehensive filtering for invalid values
            if (
              str === 'undefined...' || 
              str === 'undefined' || 
              str === 'null' || 
              str.startsWith('undefined') ||
              str.includes('undefined') ||
              str.trim() === '' ||
              str === '[object Object]' ||
              str.length < 3  // Very short strings are likely not useful content
            ) {
              return '';
            }
            return str.trim();
          };

          // Try to extract text content from various possible fields, prioritizing pageContent
          let extractedText = '';
          
          // PRIORITIZE pageContent from vector store sources
          extractedText = checkAndExtract(source.pageContent) ||
                         checkAndExtract(source.metadata?.pageContent) ||
                         checkAndExtract(source.content) ||
                         checkAndExtract(source.text) ||
                         checkAndExtract(source.excerpt) ||
                         checkAndExtract(source.metadata?.text) ||
                         checkAndExtract(source.metadata?.content) ||
                         (typeof source === 'string' ? checkAndExtract(source) : '');
          
          // Don't truncate for modal viewing - let users see full content
          // Only truncate for preview if text is extremely long
          if (extractedText && extractedText.length > 5000) {
            extractedText = extractedText.substring(0, 5000) + '...';
          }
          
          // Final fallback check to ensure we never show undefined text
          const finalExcerpt = extractedText && extractedText !== 'undefined...' && extractedText !== 'undefined' 
            ? extractedText 
            : 'No text content available';

          return {
            id: uuidv4(),
            title: source.title || source.name || source.metadata?.title || source.metadata?.source || 'Medical Source',
            url: source.url || source.metadata?.url,
            type: source.type || source.metadata?.type || 'document',
            excerpt: finalExcerpt
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
    }
    } finally {
      setIsLoading(false);
      onTypingEnd?.();
    }
  }, [sessionId, onMessageReceived, onError, onTypingStart, onTypingEnd, defaultCaseContext, knowledgeBaseType, personalDocumentIds, useStreaming, onStreamStart, onStreamToken, onStreamComplete, onStreamError]);

  const clearRateLimit = useCallback(() => {
    setIsRateLimited(false);
  }, []);

  return {
    sendMessage,
    isLoading,
    isStreaming,
    error,
    sessionId,
    isRateLimited,
    clearRateLimit,
    streamingMessageId
  };
}; 