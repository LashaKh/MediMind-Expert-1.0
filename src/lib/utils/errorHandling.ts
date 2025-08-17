/**
 * Centralized Error Handling Utilities
 * 
 * This module provides consistent error handling patterns across the application.
 * Usage examples:
 * 
 * // For async operations:
 * const [data, error] = await safeAsync(() => fetchData());
 * if (error) return handleError(error, { context: 'fetchData' });
 * 
 * // For sync operations:
 * const [result, error] = safe(() => processData(data));
 * if (error) return handleError(error, { showToast: true });
 */

import { APIError } from '../api/errors';
import { 
  NetworkError, 
  TimeoutError, 
  ValidationError, 
  ServerError,
  handleAPIError,
  StandardErrorResponse,
  ErrorContext,
  showErrorToast
} from '../api/errorHandler';
import { errorLogger, ErrorSeverity, LoggedErrorType } from '../api/errorLogger';

// Type for safe operation results
export type SafeResult<T> = [T, null] | [null, StandardErrorResponse];

// Options for error handling
export interface ErrorHandlingOptions {
  context?: string;
  showToast?: boolean;
  logError?: boolean;
  severity?: ErrorSeverity;
  retryable?: boolean;
  fallbackValue?: unknown;
}

/**
 * Safe async operation wrapper
 * Returns [data, null] on success or [null, error] on failure
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  options: ErrorHandlingOptions = {}
): Promise<SafeResult<T>> {
  try {
    const result = await operation();
    return [result, null];
  } catch (error) {
    const standardError = handleError(error, options);
    return [null, standardError];
  }
}

/**
 * Safe synchronous operation wrapper
 * Returns [data, null] on success or [null, error] on failure
 */
export function safe<T>(
  operation: () => T,
  options: ErrorHandlingOptions = {}
): SafeResult<T> {
  try {
    const result = operation();
    return [result, null];
  } catch (error) {
    const standardError = handleError(error, options);
    return [null, standardError];
  }
}

/**
 * Main error handler - processes any error into a standardized format
 */
export function handleError(
  error: unknown,
  options: ErrorHandlingOptions = {}
): StandardErrorResponse {
  const {
    context = 'Unknown operation',
    showToast = false,
    logError: shouldLogError = true,
    severity = ErrorSeverity.MEDIUM,
    retryable
  } = options;

  // Convert unknown error to Error object
  const errorObj = normalizeError(error);
  
  // Create error context
  const errorContext: Partial<ErrorContext> = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };

  // Process error using existing handler
  const standardError = handleAPIError(errorObj, errorContext);
  
  // Override retryable if specified
  if (retryable !== undefined) {
    standardError.retryable = retryable;
  }

  // Log error if requested
  if (shouldLogError) {
    errorLogger.logError({
      type: LoggedErrorType.JAVASCRIPT,
      severity,
      message: `${context}: ${standardError.message}`,
      stack: errorObj.stack,
      url: window.location.href,
      additionalData: {
        context,
        errorType: standardError.type,
        retryable: standardError.retryable
      }
    });
  }

  // Show toast notification if requested
  if (showToast) {
    showErrorToast(standardError);
  }

  return standardError;
}

/**
 * Convert unknown error to Error object
 */
function normalizeError(error: unknown): Error & { status?: number; statusCode?: number } {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    const message = obj.message || obj.error || 'Unknown error';
    const errorObj = new Error(String(message));
    
    // Preserve status codes
    if (typeof obj.status === 'number') {
      (errorObj as any).status = obj.status;
    }
    if (typeof obj.statusCode === 'number') {
      (errorObj as any).statusCode = obj.statusCode;
    }
    
    return errorObj;
  }
  
  return new Error('Unknown error occurred');
}

/**
 * Generate session ID for error tracking
 */
function generateSessionId(): string {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    let sessionId = sessionStorage.getItem('error-session-id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('error-session-id', sessionId);
    }
    return sessionId;
  }
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Generate error fingerprint for deduplication
 */
function generateErrorFingerprint(error: Error, context: string): string {
  const message = error.message || 'unknown';
  const stack = error.stack?.split('\n')[0] || 'no-stack';
  return btoa(`${context}-${message}-${stack}`).substring(0, 16);
}

/**
 * Utility for API calls with automatic error handling
 */
export async function apiCall<T>(
  operation: () => Promise<T>,
  context: string,
  options: Omit<ErrorHandlingOptions, 'context'> = {}
): Promise<SafeResult<T>> {
  return safeAsync(operation, { ...options, context: `API: ${context}` });
}

/**
 * Utility for React component error handling
 */
export function componentError(
  error: unknown,
  componentName: string,
  options: Omit<ErrorHandlingOptions, 'context'> = {}
): StandardErrorResponse {
  return handleError(error, {
    ...options,
    context: `Component: ${componentName}`,
    severity: ErrorSeverity.HIGH,
    showToast: true
  });
}

/**
 * Hook for form validation errors
 */
export function validationError(
  fields: string[],
  message = 'Please check your input'
): StandardErrorResponse {
  const error = new ValidationError(message, fields);
  return handleError(error, {
    context: 'Form validation',
    severity: ErrorSeverity.LOW,
    showToast: true,
    retryable: false
  });
}

/**
 * Utility for network operation errors
 */
export function networkError(
  operation: string,
  originalError?: unknown
): StandardErrorResponse {
  const error = originalError 
    ? normalizeError(originalError)
    : new NetworkError(`Network error during ${operation}`);
    
  return handleError(error, {
    context: `Network: ${operation}`,
    severity: ErrorSeverity.HIGH,
    showToast: true,
    retryable: true
  });
}

/**
 * Export common error types for easy access
 */
export {
  APIError,
  NetworkError,
  TimeoutError,
  ValidationError,
  ServerError,
  ErrorSeverity,
  LoggedErrorType
};

/**
 * Export default error handler for simple usage
 */
export default handleError; 