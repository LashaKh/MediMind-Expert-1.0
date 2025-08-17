// Type definitions for standardized API responses and errors

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
  timestamp?: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
  constraints?: Record<string, string>;
}

export interface ProcessingError extends Error {
  code: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  retryable?: boolean;
  retryAfter?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  url?: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface CacheableResponse<T> {
  data: T;
  timestamp: number;
  ttl: number;
  cacheKey?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  version: string;
  uptime: number;
  services: {
    [key: string]: {
      status: 'up' | 'down' | 'degraded';
      responseTime?: number;
      error?: string;
    };
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Type guards
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as ApiError).code === 'string' &&
    typeof (error as ApiError).message === 'string'
  );
}

export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'field' in error &&
    'message' in error &&
    typeof (error as ValidationError).field === 'string' &&
    typeof (error as ValidationError).message === 'string'
  );
}

export function isProcessingError(error: unknown): error is ProcessingError {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as ProcessingError).code === 'string'
  );
}

// Generic error handler
export function handleApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      details: {
        name: error.name,
        stack: error.stack,
      },
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: { error },
  };
}