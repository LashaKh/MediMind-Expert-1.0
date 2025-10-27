// MIGRATION NOTE: Replaced @microsoft/fetch-event-source with custom SSE client
// to fix duplicate connection issues. The custom client uses native fetch +
// ReadableStream + eventsource-parser for full connection lifecycle control.
import { fetchSSE, type SSECallbacks } from './customSSEClient';
import { logger } from '../logger';
import { sessionManager } from '../auth/sessionManager';
import { APIError } from './errors';

// Global tracker to prevent duplicate streaming connections
const activeConnections = new Map<string, AbortController>();

export interface StreamingCallbacks {
  onToken: (token: string) => void;
  onSource: (sources: any[]) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
  onStart?: () => void;
  onMetadata?: (metadata: any) => void;
}

interface StreamingConfig {
  enabled: boolean;
  maxRetries: number;
  timeout: number;
  debounceMs: number;
  fallbackOnError: boolean;
}

// Get streaming configuration from environment
export const getStreamingConfig = (): StreamingConfig => ({
  enabled: import.meta.env.VITE_ENABLE_STREAMING === 'true',
  maxRetries: parseInt(import.meta.env.VITE_STREAMING_MAX_RETRIES || '3', 10),
  timeout: parseInt(import.meta.env.VITE_STREAMING_TIMEOUT || '180000', 10),
  debounceMs: parseInt(import.meta.env.VITE_STREAMING_DEBOUNCE_MS || '50', 10),
  fallbackOnError: import.meta.env.VITE_STREAMING_FALLBACK === 'true'
});

/**
 * Core streaming service using Server-Sent Events (SSE)
 * Handles real-time token-by-token AI response streaming
 *
 * UPDATED: Now uses custom SSE client (native fetch + eventsource-parser)
 * instead of @microsoft/fetch-event-source to fix duplicate connection issues.
 */
export async function fetchStreamingResponse(
  endpoint: string,
  payload: any,
  callbacks: StreamingCallbacks,
  config: StreamingConfig = getStreamingConfig()
): Promise<void> {
  const { onToken, onSource, onComplete, onError, onStart, onMetadata } = callbacks;

  // Check for and abort any existing connection to this endpoint
  const connectionKey = `${endpoint}-${payload.question || 'chat'}`;
  if (activeConnections.has(connectionKey)) {
    logger.warn('⚠️ Aborting existing connection before starting new one', { connectionKey });
    const existingController = activeConnections.get(connectionKey);
    existingController?.abort();
    activeConnections.delete(connectionKey);
  }

  let ctrl: AbortController | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  // Get authentication session
  const session = await sessionManager.getValidSession();
  if (!session) {
    throw new APIError('Authentication required', 401);
  }

  logger.debug('🌊 Starting streaming request (custom SSE client)', {
    endpoint,
    connectionKey
  }, {
    component: 'streamingService',
    action: 'fetchStreamingResponse'
  });

  try {
    // Create abort controller for timeout and cancellation
    ctrl = new AbortController();

    // Register this connection in the global tracker
    activeConnections.set(connectionKey, ctrl);
    logger.debug('✅ Registered streaming connection', { connectionKey });

    // Set timeout
    timeoutId = setTimeout(() => {
      logger.warn('⏱️ Streaming timeout reached', { timeout: config.timeout });
      ctrl?.abort();
      activeConnections.delete(connectionKey);
    }, config.timeout);

    // Use custom SSE client (no duplicate connection issues!)
    await fetchSSE(
      endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...payload,
          streaming: true // Enable streaming in Flowise
        }),
        signal: ctrl.signal
      },
      {
        onStart: () => {
          if (timeoutId) clearTimeout(timeoutId);
          onStart?.();
          logger.debug('✅ Stream started successfully');
        },
        onToken: (token: string) => {
          onToken(token);
        },
        onSource: (sources: any[]) => {
          onSource(sources);
        },
        onMetadata: (metadata: any) => {
          onMetadata?.(metadata);
        },
        onComplete: () => {
          if (timeoutId) clearTimeout(timeoutId);
          onComplete();
          logger.debug('✅ Stream completed successfully');
        },
        onError: (error: Error) => {
          if (timeoutId) clearTimeout(timeoutId);
          onError(error);
        }
      }
    );

  } catch (error) {
    logger.error('❌ Streaming request failed', { error, connectionKey });

    // Clean timeout
    if (timeoutId) clearTimeout(timeoutId);

    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      onError(new APIError('Streaming request timed out', 408));
    } else {
      onError(error instanceof Error ? error : new Error('Unknown streaming error'));
    }

    throw error;

  } finally {
    // Cleanup
    if (timeoutId) clearTimeout(timeoutId);
    ctrl?.abort();

    // Remove connection from global tracker
    activeConnections.delete(connectionKey);

    logger.debug('🧹 Cleaned up streaming connection', { connectionKey });
  }
}

/**
 * Check if streaming is enabled and supported
 */
export function isStreamingEnabled(): boolean {
  const config = getStreamingConfig();
  return config.enabled;
}

/**
 * Check if endpoint supports streaming
 */
export async function checkStreamingSupport(endpoint: string): Promise<boolean> {
  try {
    const session = await sessionManager.getValidSession();
    if (!session) return false;

    const response = await fetch(endpoint, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const supportsSSE = response.headers.get('accept')?.includes('text/event-stream') ||
                       response.headers.get('content-type')?.includes('text/event-stream');

    logger.debug('Streaming support check', { endpoint, supportsSSE });
    return supportsSSE;
  } catch (error) {
    logger.warn('Failed to check streaming support', { endpoint, error });
    return false; // Assume no support on error
  }
}
