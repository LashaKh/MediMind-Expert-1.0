/**
 * Custom SSE Client using native fetch + ReadableStream + eventsource-parser
 *
 * This replaces @microsoft/fetch-event-source to fix duplicate connection issues.
 * Uses the industry-standard eventsource-parser library for SSE parsing.
 *
 * Benefits:
 * - Full control over connection lifecycle
 * - No hidden retry logic
 * - Predictable behavior
 * - Smaller bundle size (~5KB vs ~15KB)
 * - Production-proven pattern (used by OpenAI, Azure, LangChain)
 */

import { createParser, type EventSourceMessage } from 'eventsource-parser';
import { logger } from '../logger';
import { APIError } from './errors';

export interface SSECallbacks {
  onToken: (token: string) => void;
  onSource: (sources: any[]) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
  onStart?: () => void;
  onMetadata?: (metadata: any) => void;
}

export interface SSERequestOptions {
  method: 'POST' | 'GET';
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

/**
 * Fetch and process SSE stream using native fetch + ReadableStream
 *
 * @param url - API endpoint URL
 * @param options - Request options (method, headers, body, signal)
 * @param callbacks - Event callbacks for handling streaming data
 */
export async function fetchSSE(
  url: string,
  options: SSERequestOptions,
  callbacks: SSECallbacks
): Promise<void> {
  const { onToken, onSource, onComplete, onError, onStart, onMetadata } = callbacks;

  let isStreamActive = true;
  let accumulatedContent = '';

  try {
    logger.debug('🌊 Starting custom SSE connection', {
      url,
      method: options.method,
      hasSignal: !!options.signal
    });

    // Make fetch request
    const response = await fetch(url, {
      method: options.method,
      headers: {
        ...options.headers,
        'Accept': 'text/event-stream'
      },
      body: options.body,
      signal: options.signal
    });

    // Check response status
    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status;

      logger.error('❌ SSE request failed', { status, errorText });

      // Determine if error is retryable
      if (status >= 400 && status < 500 && status !== 429) {
        // Client error (non-retryable)
        throw new APIError(`Client error: ${status} - ${errorText}`, status);
      } else {
        // Server error or rate limit (retryable)
        throw new APIError(`Server error: ${status} - ${errorText}`, status);
      }
    }

    // Check if response is SSE
    const contentType = response.headers.get('content-type') || '';
    const isSSE = contentType.includes('text/event-stream');

    if (!isSSE) {
      // Handle non-SSE response (backend doesn't support streaming)
      logger.warn('⚠️ Backend returned non-streaming response, using fallback', {
        contentType
      });

      try {
        const text = await response.text();
        const data = JSON.parse(text);

        // Extract message from response
        const message = data.data?.message || data.message || data.text || data.response || '';
        const sources = data.data?.sources || data.sourceDocuments || [];

        if (message) {
          isStreamActive = false;

          // Call onStart if provided
          onStart?.();

          // Simulate streaming by sending complete message
          onToken(message);

          if (sources.length > 0) {
            onSource(sources);
          }

          onComplete();

          logger.debug('✅ Fallback non-streaming response handled');
          return; // Exit cleanly
        } else {
          throw new Error('No message in response');
        }
      } catch (parseError) {
        logger.error('❌ Failed to parse non-streaming response', { error: parseError });
        throw new APIError('Backend returned invalid non-streaming response', 500);
      }
    }

    // SSE stream detected - process it
    logger.debug('✅ SSE stream detected, processing...');

    // Call onStart callback
    onStart?.();

    // Create eventsource-parser parser (v3 API)
    const parser = createParser({
      onEvent(event: EventSourceMessage) {
        if (!isStreamActive) {
          return;
        }

        // v3 API: onEvent only receives SSE events, no type filtering needed
        const eventType = event.event || 'message';
        const eventData = event.data;

        try {
        switch (eventType) {
          case 'start':
            logger.debug('🚀 Stream started', { data: eventData });
            try {
              const startData = JSON.parse(eventData);
              onMetadata?.(startData);
            } catch (e) {
              logger.warn('Failed to parse start event data', { error: e });
            }
            break;

          case 'token':
            // Progressive token streaming
            // Backend JSON-encodes tokens to properly escape newlines for SSE protocol
            let token = eventData;
            try {
              // Parse JSON-encoded token to restore newlines and special characters
              token = JSON.parse(eventData);
            } catch (e) {
              // Fallback: if not JSON-encoded, use as-is (backward compatibility)
              token = eventData;
            }
            // IMPORTANT: Don't filter out whitespace-only tokens (newlines are critical for markdown!)
            if (token && token !== 'undefined') {
              accumulatedContent += token;
              onToken(token);
            }
            break;

          case 'sourceDocuments':
            // Source references from knowledge base
            try {
              const sources = JSON.parse(eventData);
              if (Array.isArray(sources) && sources.length > 0) {
                logger.debug('📚 Received source documents', { count: sources.length });
                onSource(sources);
              }
            } catch (e) {
              logger.warn('Failed to parse source documents', { error: e });
            }
            break;

          case 'metadata':
            // Additional metadata from Flowise
            try {
              const metadata = JSON.parse(eventData);
              onMetadata?.(metadata);
            } catch (e) {
              logger.warn('Failed to parse metadata', { error: e });
            }
            break;

          case 'end':
            // Stream completion
            logger.debug('🏁 Stream ended successfully', {
              contentLength: accumulatedContent.length
            });
            isStreamActive = false;
            onComplete();
            break;

          case 'error':
            // Error from backend
            logger.error('❌ Stream error event', { data: eventData });
            throw new Error(eventData || 'Streaming error');

          case 'message':
          default:
            // Handle default message events (Flowise may send data without event type)
            if (eventData) {
              try {
                const data = JSON.parse(eventData);

                // Check if this is a complete response (non-streaming fallback)
                if (data.text || data.response) {
                  const fullText = data.text || data.response;
                  logger.debug('📦 Received complete response', {
                    length: fullText.length
                  });

                  // Send entire response as one token
                  onToken(fullText);

                  // Handle sources if present
                  if (data.sourceDocuments && Array.isArray(data.sourceDocuments)) {
                    onSource(data.sourceDocuments);
                  }

                  // Complete the stream
                  isStreamActive = false;
                  onComplete();
                }
              } catch (e) {
                // If not JSON, treat as token (unless it's [DONE] marker)
                if (eventData !== '[DONE]') {
                  accumulatedContent += eventData;
                  onToken(eventData);
                }
              }
            }
        }
      } catch (error) {
        logger.error('❌ Error processing SSE event', {
          error,
          eventType,
          dataPreview: eventData?.substring(0, 100)
        });
        onError(error instanceof Error ? error : new Error('Unknown streaming error'));
      }
    },

    onError(error) {
      // Suppress "unknown-field" errors - these are bare content lines from malformed SSE
      // We'll handle them in the preprocessing step
      if (error?.type !== 'unknown-field') {
        logger.error('❌ Parser error', {
          error,
          errorMessage: error?.message || 'Unknown parser error',
          errorType: error?.type || 'unknown'
        });
      }
    }
  });

    // Get ReadableStream reader
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body stream available');
    }

    const decoder = new TextDecoder();

    // Read stream chunks
    try {
      let chunkCount = 0;
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          logger.debug('📭 Stream reading complete', { totalChunks: chunkCount });
          break;
        }

        if (value) {
          chunkCount++;
          // Decode chunk and feed to parser
          let chunk = decoder.decode(value, { stream: true });

          // Preprocess: Convert bare content lines to proper SSE format
          // Backend may send malformed SSE without "event:" and "data:" prefixes
          const lines = chunk.split('\n');
          const processedLines = lines.map(line => {
            // Skip empty lines and lines that already have SSE fields
            if (!line.trim() || line.includes(':')) {
              return line;
            }

            // This is a bare content line - wrap it in proper SSE format
            return `event: token\ndata: ${line}\n`;
          });

          chunk = processedLines.join('\n');
          parser.feed(chunk);
        }
      }
    } finally {
      // Flush any remaining data in parser
      parser.reset({ consume: true });
      reader.releaseLock();
    }

    // If stream closed without completion signal, complete it now
    if (isStreamActive && accumulatedContent.length > 0) {
      logger.debug('⚠️ Stream closed without end event, completing with accumulated content');
      onComplete();
    }

    logger.debug('✅ Custom SSE connection completed successfully');

  } catch (error) {
    logger.error('❌ Custom SSE connection failed', { error });

    // Check if this was an intentional abort
    if (error instanceof Error && error.name === 'AbortError') {
      logger.debug('🛑 Connection aborted intentionally');
      throw error;
    }

    // Handle timeout
    if (error instanceof Error && error.name === 'TimeoutError') {
      onError(new APIError('Streaming request timed out', 408));
      throw error;
    }

    // Call error callback
    onError(error instanceof Error ? error : new Error('Unknown streaming error'));
    throw error;

  } finally {
    // Cleanup
    isStreamActive = false;
    logger.debug('🧹 Custom SSE connection cleanup complete');
  }
}

/**
 * Parse SSE event data format
 *
 * SSE format:
 * event: token
 * data: hello
 *
 * or just:
 * data: {"message": "hello"}
 */
export function parseSSEData(data: string): any {
  try {
    return JSON.parse(data);
  } catch {
    // Not JSON, return as-is
    return data;
  }
}
