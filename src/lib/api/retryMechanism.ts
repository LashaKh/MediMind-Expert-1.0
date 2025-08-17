import { ErrorType, isRetryable } from './errorHandler';

// Retry configuration interface
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: ErrorType[];
  timeoutMs?: number;
}

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: ['network', 'timeout', 'server'],
  timeoutMs: 30000
};

// Retry state interface
export interface RetryState {
  attempt: number;
  totalAttempts: number;
  lastError: Error;
  isRetrying: boolean;
  nextRetryAt?: number;
}

// Retry result interface
export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

// Calculate delay with exponential backoff
export const calculateDelay = (attempt: number, config: RetryConfig): number => {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
};

// Add jitter to prevent thundering herd
export const addJitter = (delay: number, jitterFactor: number = 0.1): number => {
  const jitter = delay * jitterFactor * Math.random();
  return delay + jitter;
};

// Check if error should be retried
export const shouldRetry = (error: Error, attempt: number, config: RetryConfig): boolean => {
  if (attempt >= config.maxAttempts) {
    return false;
  }

  // Check if error type is retryable
  const errorType = getErrorType(error);
  return config.retryableErrors.includes(errorType);
};

// Get error type for retry logic
const getErrorType = (error: Error & { status?: number; statusCode?: number; code?: string }): ErrorType => {
  if (error.code === 'NETWORK_ERROR' || !navigator.onLine) return 'network';
  if (error.code === 'TIMEOUT' || error.name === 'TimeoutError') return 'timeout';
  
  const status = error.status || error.statusCode;
  if (status >= 500) return 'server';
  if (status === 408 || status === 429) return 'timeout';
  if (status >= 400) return 'validation';
  
  return 'unknown';
};

// Sleep utility
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Main retry utility with exponential backoff
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  onRetry?: (state: RetryState) => void
): Promise<RetryResult<T>> => {
  const startTime = Date.now();
  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const data = await operation();
      
      return {
        success: true,
        data,
        attempts: attempt,
        totalTime: Date.now() - startTime
      };
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (!shouldRetry(error, attempt, config)) {
        break;
      }
      
      // Don't delay after the last attempt
      if (attempt < config.maxAttempts) {
        const delay = calculateDelay(attempt, config);
        const jitteredDelay = addJitter(delay);
        
        // Notify about retry
        if (onRetry) {
          onRetry({
            attempt,
            totalAttempts: config.maxAttempts,
            lastError: error,
            isRetrying: true,
            nextRetryAt: Date.now() + jitteredDelay
          });
        }
        
        console.warn(`Retrying request (attempt ${attempt}/${config.maxAttempts}) after ${jitteredDelay}ms delay`, error);
        
        await sleep(jitteredDelay);
      }
    }
  }
  
  return {
    success: false,
    error: lastError,
    attempts: config.maxAttempts,
    totalTime: Date.now() - startTime
  };
};

// Enhanced API client with retry capabilities
export class RetryableAPIClient {
  private baseURL: string;
  private defaultConfig: RetryConfig;
  
  constructor(baseURL: string, config: Partial<RetryConfig> = {}) {
    this.baseURL = baseURL;
    this.defaultConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  }
  
  async request<T>(
    url: string,
    options: RequestInit & { retryConfig?: Partial<RetryConfig> } = {}
  ): Promise<T> {
    const { retryConfig, ...fetchOptions } = options;
    const finalConfig = { ...this.defaultConfig, ...retryConfig };
    
    const operation = async (): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeoutMs || 30000);
      
      try {
        const response = await fetch(`${this.baseURL}${url}`, {
          ...fetchOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as Error & { status: number; statusText: string };
          error.status = response.status;
          error.statusText = response.statusText;
          throw error;
        }
        
        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };
    
    const result = await retryWithBackoff(operation, finalConfig);
    
    if (result.success) {
      return result.data!;
    } else {
      throw result.error;
    }
  }
  
  async get<T>(url: string, options?: RequestInit & { retryConfig?: Partial<RetryConfig> }): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }
  
  async post<T>(url: string, data?: unknown, options?: RequestInit & { retryConfig?: Partial<RetryConfig> }): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
  }
  
  async put<T>(url: string, data?: unknown, options?: RequestInit & { retryConfig?: Partial<RetryConfig> }): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
  }
  
  async delete<T>(url: string, options?: RequestInit & { retryConfig?: Partial<RetryConfig> }): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

// Default retryable API client instance
export const apiClient = new RetryableAPIClient(
  process.env.VITE_API_BASE_URL || '',
  {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000
  }
);

export default retryWithBackoff; 