import { logger } from '../logger';

/**
 * Token buffer for debounced rendering
 * Accumulates tokens and releases them in batches for performance
 */
export class TokenBuffer {
  private buffer: string[] = [];
  private timeoutId: NodeJS.Timeout | null = null;
  private callback: (tokens: string) => void;
  private debounceMs: number;

  constructor(callback: (tokens: string) => void, debounceMs: number = 50) {
    this.callback = callback;
    this.debounceMs = debounceMs;
  }

  add(token: string) {
    this.buffer.push(token);

    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Set new timeout to flush buffer
    this.timeoutId = setTimeout(() => {
      this.flush();
    }, this.debounceMs);
  }

  flush() {
    if (this.buffer.length === 0) return;

    const accumulated = this.buffer.join('');
    this.buffer = [];
    this.callback(accumulated);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  clear() {
    this.buffer = [];
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * Exponential backoff calculator for retry logic
 */
export function calculateBackoff(attempt: number, baseDelay: number = 1000, maxDelay: number = 10000): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter to avoid thundering herd
  const jitter = Math.random() * delay * 0.1;
  return Math.floor(delay + jitter);
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Server errors (5xx)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // Rate limiting (429)
  if (error.status === 429) {
    return true;
  }

  // Timeout errors
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return true;
  }

  // Connection errors
  if (error.message?.includes('connection') || error.message?.includes('ECONNREFUSED')) {
    return true;
  }

  return false;
}

/**
 * Classify error severity for logging and handling
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export function classifyErrorSeverity(error: any): ErrorSeverity {
  // Authentication errors (critical)
  if (error.status === 401 || error.status === 403) {
    return ErrorSeverity.CRITICAL;
  }

  // Server errors (high)
  if (error.status >= 500) {
    return ErrorSeverity.HIGH;
  }

  // Rate limiting (medium)
  if (error.status === 429) {
    return ErrorSeverity.MEDIUM;
  }

  // Client errors (low)
  if (error.status >= 400 && error.status < 500) {
    return ErrorSeverity.LOW;
  }

  // Network errors (medium)
  if (error instanceof TypeError) {
    return ErrorSeverity.MEDIUM;
  }

  return ErrorSeverity.LOW;
}

/**
 * Format streaming error for user display
 */
export function formatStreamingError(error: any): string {
  // Rate limiting
  if (error.status === 429 || error.message?.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Authentication
  if (error.status === 401) {
    return 'Your session has expired. Please refresh the page and sign in again.';
  }

  // Permission
  if (error.status === 403) {
    return 'You do not have permission to access this feature.';
  }

  // Timeout
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return 'The request took too long to complete. Please try a simpler query or try again later.';
  }

  // Server errors
  if (error.status >= 500) {
    return 'The AI service is temporarily unavailable. Please try again in a few moments.';
  }

  // Network errors
  if (error instanceof TypeError && error.message?.includes('fetch')) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Wait for a complete sentence before releasing content
 * Used for medical safety to avoid showing partial critical information
 */
export function waitForCompleteSentence(content: string): { complete: string; pending: string } {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  const complete = sentences.join(' ');
  const pending = content.slice(complete.length);

  return { complete, pending };
}

/**
 * Track streaming performance metrics
 */
export class StreamingMetrics {
  private startTime: number | null = null;
  private firstTokenTime: number | null = null;
  private tokenCount: number = 0;
  private errorCount: number = 0;

  start() {
    this.startTime = Date.now();
    this.firstTokenTime = null;
    this.tokenCount = 0;
    this.errorCount = 0;
  }

  recordToken() {
    if (!this.firstTokenTime && this.startTime) {
      this.firstTokenTime = Date.now();
    }
    this.tokenCount++;
  }

  recordError() {
    this.errorCount++;
  }

  getMetrics() {
    if (!this.startTime) {
      return null;
    }

    const now = Date.now();
    const totalTime = now - this.startTime;
    const timeToFirstToken = this.firstTokenTime ? this.firstTokenTime - this.startTime : null;
    const tokensPerSecond = totalTime > 0 ? (this.tokenCount / totalTime) * 1000 : 0;

    return {
      totalTime,
      timeToFirstToken,
      tokenCount: this.tokenCount,
      tokensPerSecond: Math.round(tokensPerSecond * 100) / 100,
      errorCount: this.errorCount
    };
  }

  log() {
    const metrics = this.getMetrics();
    if (metrics) {
      logger.debug('Streaming metrics', metrics, {
        component: 'streamingHelpers',
        action: 'metrics'
      });
    }
  }

  reset() {
    this.startTime = null;
    this.firstTokenTime = null;
    this.tokenCount = 0;
    this.errorCount = 0;
  }
}

/**
 * Debounce function for UI updates
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function for performance-critical updates
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Circuit breaker for handling repeated failures
 */
export class CircuitBreaker {
  private failureCount: number = 0;
  private lastFailureTime: number | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly threshold: number;
  private readonly timeout: number;

  constructor(threshold: number = 5, timeout: number = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = 'closed';
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'open';
      logger.warn('Circuit breaker opened', {
        failureCount: this.failureCount,
        threshold: this.threshold
      });
    }
  }

  canAttempt(): boolean {
    if (this.state === 'closed') {
      return true;
    }

    if (this.state === 'open' && this.lastFailureTime) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.timeout) {
        this.state = 'half-open';
        logger.debug('Circuit breaker entering half-open state');
        return true;
      }
      return false;
    }

    // half-open state
    return true;
  }

  reset() {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'closed';
  }
}
