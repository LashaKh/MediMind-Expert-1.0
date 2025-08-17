/**
 * Comprehensive Error Handling and Resilience System for Medical News
 * Implements graceful degradation, retry mechanisms, and medical safety protocols
 */

import React from 'react';

export interface ErrorConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  enableLogging: boolean;
  medicalSafetyMode: boolean;
  gracefulDegradation: boolean;
  circuitBreakerEnabled: boolean;
  errorThreshold: number;
}

export interface ErrorContext {
  component: string;
  action: string;
  medicalContent: boolean;
  specialty?: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  userAgent: string;
  url: string;
  additionalData?: Record<string, any>;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByComponent: Record<string, number>;
  medicalErrorCount: number;
  criticalErrorCount: number;
  lastError?: Date;
  errorRate: number;
  mttr: number; // Mean Time To Recovery
}

export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoff: 'linear' | 'exponential' | 'fixed';
  condition?: (error: Error, attempt: number) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  halfOpenAttempts: number;
}

class ErrorHandlingManager {
  private config: ErrorConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    enableLogging: true,
    medicalSafetyMode: true,
    gracefulDegradation: true,
    circuitBreakerEnabled: true,
    errorThreshold: 5
  };

  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByType: {},
    errorsByComponent: {},
    medicalErrorCount: 0,
    criticalErrorCount: 0,
    errorRate: 0,
    mttr: 0
  };

  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private errorQueue: Array<{ context: ErrorContext; error: Error }> = [];
  private recoveryStrategies = new Map<string, () => Promise<any>>();

  /**
   * Register a recovery strategy for a specific component/action
   */
  registerRecoveryStrategy(key: string, strategy: () => Promise<any>): void {
    this.recoveryStrategies.set(key, strategy);
  }

  /**
   * Enhanced error reporting with medical context
   */
  reportError(error: Error, context: ErrorContext): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      timestamp: Date.now(),
      severity: this.calculateErrorSeverity(error, context)
    };

    // Update metrics
    this.updateErrorMetrics(error, context);

    // Log error
    if (this.config.enableLogging) {
      this.logError(errorData);
    }

    // Queue for batch reporting
    this.errorQueue.push({ context, error });

    // Update circuit breaker state
    if (this.config.circuitBreakerEnabled) {
      this.updateCircuitBreaker(context.component, error);
    }

    // Send to monitoring service
    this.sendToMonitoring(errorData);
  }

  /**
   * Calculate error severity with medical safety considerations
   */
  private calculateErrorSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
    // Medical content errors are automatically high severity
    if (context.medicalContent && this.config.medicalSafetyMode) {
      // Critical medical safety scenarios
      if (context.action.includes('calculator') || 
          context.action.includes('dosage') ||
          context.action.includes('diagnosis')) {
        return 'critical';
      }
      return 'high';
    }

    // Network and API errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return context.medicalContent ? 'high' : 'medium';
    }

    // Authentication errors in medical context
    if (error.message.includes('auth') && context.medicalContent) {
      return 'high';
    }

    // Default severity
    return 'medium';
  }

  /**
   * Update error metrics
   */
  private updateErrorMetrics(error: Error, context: ErrorContext): void {
    this.metrics.totalErrors++;
    
    const errorType = error.name || 'UnknownError';
    this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1;
    this.metrics.errorsByComponent[context.component] = (this.metrics.errorsByComponent[context.component] || 0) + 1;
    
    if (context.medicalContent) {
      this.metrics.medicalErrorCount++;
    }
    
    const severity = this.calculateErrorSeverity(error, context);
    if (severity === 'critical') {
      this.metrics.criticalErrorCount++;
    }
    
    this.metrics.lastError = new Date();
    
    // Calculate error rate (errors per minute)
    const timeWindow = 60 * 1000; // 1 minute
    const recentErrors = this.errorQueue.filter(
      item => Date.now() - item.context.timestamp < timeWindow
    ).length;
    this.metrics.errorRate = recentErrors;
  }

  /**
   * Update circuit breaker state
   */
  private updateCircuitBreaker(component: string, error: Error): void {
    const breaker = this.circuitBreakers.get(component) || {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      halfOpenAttempts: 0
    };

    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();

    // Open circuit breaker if threshold exceeded
    if (breaker.failureCount >= this.config.errorThreshold) {
      breaker.isOpen = true;
      console.warn(`[ErrorHandler] Circuit breaker opened for component: ${component}`);
    }

    this.circuitBreakers.set(component, breaker);
  }

  /**
   * Check if circuit breaker allows request
   */
  isCircuitBreakerOpen(component: string): boolean {
    const breaker = this.circuitBreakers.get(component);
    if (!breaker || !this.config.circuitBreakerEnabled) return false;

    // If circuit is open, check if it should be half-open
    if (breaker.isOpen) {
      const timeSinceLastFailure = Date.now() - breaker.lastFailureTime;
      const cooldownPeriod = 30000; // 30 seconds

      if (timeSinceLastFailure > cooldownPeriod) {
        breaker.isOpen = false;
        breaker.halfOpenAttempts = 0;
        this.circuitBreakers.set(component, breaker);
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Retry mechanism with exponential backoff
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const retryOptions: RetryOptions = {
      maxAttempts: options.maxAttempts || this.config.maxRetries,
      delay: options.delay || this.config.retryDelay,
      backoff: options.backoff || 'exponential',
      condition: options.condition,
      onRetry: options.onRetry
    };

    let lastError: Error;
    let attempt = 0;

    while (attempt < retryOptions.maxAttempts) {
      try {
        // Check circuit breaker
        if (this.isCircuitBreakerOpen(context.component)) {
          throw new Error(`Circuit breaker open for ${context.component}`);
        }

        const result = await operation();
        
        // Reset circuit breaker on success
        if (this.circuitBreakers.has(context.component)) {
          this.circuitBreakers.set(context.component, {
            isOpen: false,
            failureCount: 0,
            lastFailureTime: 0,
            halfOpenAttempts: 0
          });
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        attempt++;

        // Check if we should retry
        if (attempt >= retryOptions.maxAttempts || 
            (retryOptions.condition && !retryOptions.condition(lastError, attempt))) {
          break;
        }

        // Calculate delay
        let delay = retryOptions.delay;
        if (retryOptions.backoff === 'exponential') {
          delay = retryOptions.delay * Math.pow(this.config.backoffMultiplier, attempt - 1);
        }

        // Medical content gets faster retries
        if (context.medicalContent && this.config.medicalSafetyMode) {
          delay = Math.min(delay, 2000); // Max 2 second delay for medical content
        }

        // Call retry callback
        if (retryOptions.onRetry) {
          retryOptions.onRetry(attempt, lastError);
        }

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    // All retries failed
    this.reportError(lastError!, context);
    throw lastError!;
  }

  /**
   * Graceful degradation helper
   */
  async withGracefulDegradation<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>,
    context: ErrorContext
  ): Promise<T> {
    try {
      return await primary();
    } catch (error) {
      if (this.config.gracefulDegradation) {
        console.warn(`[ErrorHandler] Primary operation failed, falling back for ${context.component}:`, error);
        
        try {
          return await fallback();
        } catch (fallbackError) {
          this.reportError(fallbackError as Error, {
            ...context,
            action: `${context.action}_fallback_failed`
          });
          throw fallbackError;
        }
      }
      
      this.reportError(error as Error, context);
      throw error;
    }
  }

  /**
   * Medical safety wrapper for critical operations
   */
  async withMedicalSafety<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    safetyCallback?: () => Promise<T>
  ): Promise<T> {
    if (!this.config.medicalSafetyMode) {
      return await operation();
    }

    try {
      return await this.withRetry(operation, {
        ...context,
        medicalContent: true
      }, {
        maxAttempts: 2, // Fewer retries for medical safety
        delay: 500,
        backoff: 'fixed'
      });
    } catch (error) {
      // Medical safety fallback
      if (safetyCallback) {
        console.warn('[ErrorHandler] Medical operation failed, using safety callback');
        return await safetyCallback();
      }
      
      // Critical medical error
      this.reportError(error as Error, {
        ...context,
        medicalContent: true,
        action: `critical_medical_${context.action}`
      });
      
      throw new Error(`Medical operation failed: ${error.message}. Please consult primary medical sources.`);
    }
  }

  /**
   * Network error handler with offline detection
   */
  async handleNetworkError(
    operation: () => Promise<Response>,
    context: ErrorContext,
    cachedFallback?: () => Promise<any>
  ): Promise<Response> {
    try {
      const response = await this.withRetry(operation, context, {
        maxAttempts: 3,
        delay: 1000,
        condition: (error, attempt) => {
          // Don't retry 4xx errors
          if (error.message.includes('4')) return false;
          return true;
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      // Check if offline
      if (!navigator.onLine) {
        console.warn('[ErrorHandler] Offline detected, attempting cached fallback');
        
        if (cachedFallback) {
          try {
            const cachedData = await cachedFallback();
            return new Response(JSON.stringify(cachedData), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (cacheError) {
            console.error('[ErrorHandler] Cached fallback failed:', cacheError);
          }
        }
        
        // Return offline response
        return new Response(JSON.stringify({
          error: 'offline',
          message: 'You are currently offline. Some medical content may be cached.',
          offline: true
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Network error while online
      this.reportError(error as Error, context);
      throw error;
    }
  }

  /**
   * Log error with medical context
   */
  private logError(errorData: any): void {
    const logLevel = errorData.severity === 'critical' ? 'error' : 'warn';
    const medicalFlag = errorData.context.medicalContent ? '[MEDICAL]' : '';
    
    console[logLevel](`[ErrorHandler] ${medicalFlag} ${errorData.context.component}:`, {
      message: errorData.message,
      action: errorData.context.action,
      specialty: errorData.context.specialty,
      timestamp: new Date(errorData.timestamp).toISOString(),
      stack: errorData.stack
    });
  }

  /**
   * Send error to monitoring service
   */
  private async sendToMonitoring(errorData: any): Promise<void> {
    try {
      // In production, send to monitoring service
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      });
    } catch (monitoringError) {
      console.error('[ErrorHandler] Failed to send error to monitoring:', monitoringError);
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get error metrics
   */
  getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(component: string): CircuitBreakerState | null {
    return this.circuitBreakers.get(component) || null;
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(component: string): void {
    this.circuitBreakers.set(component, {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      halfOpenAttempts: 0
    });
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ErrorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.metrics = {
      totalErrors: 0,
      errorsByType: {},
      errorsByComponent: {},
      medicalErrorCount: 0,
      criticalErrorCount: 0,
      errorRate: 0,
      mttr: 0
    };
    this.errorQueue = [];
  }
}

// Singleton instance
export const errorHandler = new ErrorHandlingManager();

/**
 * React Error Boundary with medical safety features
 */

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
  medicalSafetyTriggered: boolean;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  medicalContent?: boolean;
  specialty?: string;
  maxRetries?: number;
}

export class MedicalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      medicalSafetyTriggered: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const context: ErrorContext = {
      component: 'ErrorBoundary',
      action: 'component_error',
      medicalContent: this.props.medicalContent || false,
      specialty: this.props.specialty,
      timestamp: Date.now(),
      sessionId: `session_${Date.now()}`,
      userAgent: navigator.userAgent,
      url: window.location.href,
      additionalData: {
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount
      }
    };

    errorHandler.reportError(error, context);

    this.setState({
      error,
      errorInfo,
      medicalSafetyTriggered: this.props.medicalContent || false
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    const maxRetries = this.props.maxRetries || 2;
    
    if (this.state.retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1
      });
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            resetError={this.handleRetry}
          />
        );
      }

      // Medical safety fallback
      if (this.state.medicalSafetyTriggered) {
        return (
          <div className="min-h-[200px] flex items-center justify-center bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-center max-w-md">
              <div className="text-red-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Medical Content Error</h3>
              <p className="text-red-700 text-sm mb-4">
                There was an error loading medical content. For your safety, please verify any medical information with primary sources.
              </p>
              {this.state.retryCount < (this.props.maxRetries || 2) && (
                <button
                  onClick={this.handleRetry}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Retry ({this.state.retryCount + 1}/{this.props.maxRetries || 2})
                </button>
              )}
            </div>
          </div>
        );
      }

      // Standard error fallback
      return (
        <div className="min-h-[200px] flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center max-w-md">
            <div className="text-gray-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
            <p className="text-gray-600 text-sm mb-4">
              We encountered an unexpected error. Please try again.
            </p>
            {this.state.retryCount < (this.props.maxRetries || 2) && (
              <button
                onClick={this.handleRetry}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Retry ({this.state.retryCount + 1}/{this.props.maxRetries || 2})
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for handling errors in functional components
 */
export function useErrorHandler(medicalContent = false, specialty?: string) {
  const [error, setError] = React.useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleError = React.useCallback((error: Error, action: string) => {
    const context: ErrorContext = {
      component: 'useErrorHandler',
      action,
      medicalContent,
      specialty,
      timestamp: Date.now(),
      sessionId: `session_${Date.now()}`,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    errorHandler.reportError(error, context);
    setError(error);
  }, [medicalContent, specialty]);

  const retry = React.useCallback(async (operation: () => Promise<any>) => {
    setIsRetrying(true);
    setError(null);

    try {
      const result = await operation();
      setIsRetrying(false);
      return result;
    } catch (retryError) {
      setError(retryError as Error);
      setIsRetrying(false);
      throw retryError;
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isRetrying,
    handleError,
    retry,
    clearError
  };
}

/**
 * Network request wrapper with error handling
 */
export async function safeRequest(
  url: string,
  options: RequestInit = {},
  context: Partial<ErrorContext> = {}
): Promise<Response> {
  const fullContext: ErrorContext = {
    component: 'NetworkRequest',
    action: 'api_call',
    medicalContent: false,
    timestamp: Date.now(),
    sessionId: `session_${Date.now()}`,
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...context
  };

  return await errorHandler.withRetry(
    () => fetch(url, options),
    fullContext,
    {
      condition: (error, attempt) => {
        // Don't retry client errors (4xx)
        if (error.message.includes('4')) return false;
        // Don't retry if offline and no cache available
        if (!navigator.onLine && !context.medicalContent) return false;
        return true;
      },
      onRetry: (attempt, error) => {
        console.log(`[SafeRequest] Retrying ${url} (attempt ${attempt}):`, error.message);
      }
    }
  );
}

/**
 * Medical API wrapper with safety protocols
 */
export async function safeMedicalRequest(
  url: string,
  options: RequestInit = {},
  specialty?: string
): Promise<Response> {
  const context: ErrorContext = {
    component: 'MedicalAPI',
    action: 'medical_api_call',
    medicalContent: true,
    specialty,
    timestamp: Date.now(),
    sessionId: `session_${Date.now()}`,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  return await errorHandler.withMedicalSafety(
    () => safeRequest(url, options, context),
    context,
    // Safety callback returns empty but valid response
    async () => new Response(JSON.stringify({
      data: [],
      error: 'medical_safety_mode',
      message: 'Medical content temporarily unavailable for safety. Please consult primary sources.',
      cached: false
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  );
}

export default errorHandler;