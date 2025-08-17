import { APIError } from './errors';

// Extended API Error classes
export class NetworkError extends APIError {
  constructor(message: string = 'Network connection failed') {
    super(message, 0); // 0 status for network errors
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends APIError {
  constructor(message: string = 'Request timeout') {
    super(message, 408);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends APIError {
  public fields?: string[];
  
  constructor(message: string = 'Validation failed', fields?: string[]) {
    super(message, 400);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export class ServerError extends APIError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
    this.name = 'ServerError';
  }
}

// Error types for classification
export type ErrorType = 
  | 'network'
  | 'timeout'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'not-found'
  | 'server'
  | 'unknown';

// Error context interface
export interface ErrorContext {
  url?: string;
  method?: string;
  requestId?: string;
  timestamp: string;
  userAgent: string;
}

// Standardized error response
export interface StandardErrorResponse {
  type: ErrorType;
  message: string;
  userMessage: string;
  statusCode: number;
  context: ErrorContext;
  retryable: boolean;
  details?: Record<string, unknown>;
}

// Error classification utility
export const classifyError = (error: Error & {
  status?: number;
  statusCode?: number;
  code?: string;
}): ErrorType => {
  // Network errors
  if (!navigator.onLine || error.code === 'NETWORK_ERROR') {
    return 'network';
  }
  
  // Timeout errors
  if (error.code === 'TIMEOUT' || error.name === 'TimeoutError') {
    return 'timeout';
  }
  
  // HTTP status code classification
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode;
    
    if (status === 401) return 'authentication';
    if (status === 403) return 'authorization';
    if (status >= 400 && status < 500) return 'validation';
    if (status === 404) return 'not-found';
    if (status >= 500) return 'server';
  }
  
  // Instance-based classification
  if (error instanceof NetworkError) return 'network';
  if (error instanceof TimeoutError) return 'timeout';
  if (error instanceof ValidationError) return 'validation';
  if (error instanceof ServerError) return 'server';
  
  return 'unknown';
};

// User-friendly error messages
export const getUserFriendlyMessage = (errorType: ErrorType, originalMessage?: string): string => {
  const messages: Record<ErrorType, string> = {
    network: 'Please check your internet connection and try again.',
    timeout: 'The request is taking longer than expected. Please try again.',
    authentication: 'Please sign in to continue.',
    authorization: 'You don\'t have permission to access this resource.',
    validation: 'Please check your input and try again.',
    'not-found': 'The requested resource was not found.',
    server: 'Our servers are experiencing issues. Please try again later.',
    unknown: 'An unexpected error occurred. Please try again.'
  };
  
  return messages[errorType];
};

// Determine if error is retryable
export const isRetryable = (errorType: ErrorType): boolean => {
  const retryableTypes: ErrorType[] = ['network', 'timeout', 'server'];
  return retryableTypes.includes(errorType);
};

// Main error handler
export const handleAPIError = (
  error: Error & {
    status?: number;
    statusCode?: number;
    details?: Record<string, unknown>;
  },
  context: Partial<ErrorContext> = {}
): StandardErrorResponse => {
  const errorType = classifyError(error);
  const userMessage = getUserFriendlyMessage(errorType, error.message);
  const retryable = isRetryable(errorType);
  
  const fullContext: ErrorContext = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ...context
  };
  
  const standardError: StandardErrorResponse = {
    type: errorType,
    message: error.message || 'Unknown error',
    userMessage,
    statusCode: error.status || error.statusCode || 0,
    context: fullContext,
    retryable,
    details: error.details || null
  };
  
  // Log error for debugging

  return standardError;
};

// Toast notification helper (will integrate with toast library)
export const showErrorToast = (error: StandardErrorResponse) => {
  // TODO: Integrate with actual toast notification library

  // For now, we'll use a simple notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Error', {
      body: error.userMessage,
      icon: '/icons/error.png'
    });
  }
};

// Axios interceptor setup
export const setupAPIInterceptors = (axiosInstance: {
  interceptors: {
    request: { use: (onFulfilled: (config: unknown) => unknown, onRejected: (error: unknown) => unknown) => void };
    response: { use: (onFulfilled: (response: unknown) => unknown, onRejected: (error: unknown) => unknown) => void };
  };
}) => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config: Record<string, unknown>) => {
      // Add request ID for tracking
      config.metadata = {
        requestId: Math.random().toString(36).substr(2, 9),
        startTime: Date.now()
      };
      
      return config;
    },
    (error: unknown) => {
      return Promise.reject(error);
    }
  );
  
  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response: Record<string, unknown>) => {
      // Log successful requests in development
      if (process.env.NODE_ENV === 'development') {
        const config = response.config as Record<string, unknown>;
        const metadata = config.metadata as { startTime: number };
        const duration = Date.now() - metadata.startTime;
      }
      
      return response;
    },
    (error: Error & {
      config?: {
        url?: string;
        method?: string;
        metadata?: { requestId?: string };
      };
    }) => {
      const context: Partial<ErrorContext> = {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        requestId: error.config?.metadata?.requestId
      };
      
      const standardError = handleAPIError(error, context);
      
      // Show toast notification for user-facing errors
      if (!error.config?.skipToast) {
        showErrorToast(standardError);
      }
      
      // Throw standardized error
      const apiError = new APIError(standardError.userMessage, standardError.statusCode);
      (apiError as Error & { standardError?: StandardErrorResponse }).standardError = standardError;
      
      return Promise.reject(apiError);
    }
  );
  
  return axiosInstance;
};

// Utility to extract error message from different sources
export const extractErrorMessage = (error: Error & {
  message?: string;
  response?: { data?: { message?: string } };
}): string => {
  // Try different error message locations
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.statusText) return error.response.statusText;
  if (error.message) return error.message;
  
  return 'An unknown error occurred';
};

// Format validation errors
export const formatValidationErrors = (errors: Record<string, string[]> | string[]): string => {
  if (Array.isArray(errors)) {
    return errors.join(', ');
  }
  
  if (typeof errors === 'object' && errors !== null) {
    return Object.values(errors).join(', ');
  }
  
  return String(errors);
};

// Context-aware error messages
export const getContextualErrorMessage = (
  errorType: ErrorType,
  requestType: string
): string => {
  const contextMessages: Record<string, Record<ErrorType, string>> = {
    login: {
      authentication: 'Invalid email or password. Please try again.',
      network: 'Unable to connect to login servers. Please check your connection.',
      server: 'Login servers are temporarily unavailable. Please try again later.',
      validation: 'Please enter a valid email and password.',
      timeout: 'Login is taking longer than expected. Please try again.',
      authorization: 'Access denied. Please contact support.',
      'not-found': 'Login service not found. Please contact support.',
      unknown: 'Login failed. Please try again.'
    },
    upload: {
      network: 'Upload failed due to connection issues. Please try again.',
      server: 'Upload servers are busy. Please try again later.',
      validation: 'Please check your file and try again.',
      timeout: 'Upload is taking longer than expected. Please try again.',
      authentication: 'Please sign in to upload files.',
      authorization: 'You don\'t have permission to upload files.',
      'not-found': 'Upload service not found.',
      unknown: 'Upload failed. Please try again.'
    },
    calculator: {
      validation: 'Please check your input values and try again.',
      server: 'Calculator service is temporarily unavailable.',
      network: 'Unable to process calculation. Please check your connection.',
      timeout: 'Calculation is taking longer than expected.',
      authentication: 'Please sign in to use calculators.',
      authorization: 'You don\'t have access to this calculator.',
      'not-found': 'Calculator not found.',
      unknown: 'Calculation failed. Please try again.'
    }
  };
  
  return contextMessages[requestType]?.[errorType] || getUserFriendlyMessage(errorType);
};

export default handleAPIError; 