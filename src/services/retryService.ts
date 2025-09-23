/**
 * Retry Service with Exponential Backoff
 * 
 * Provides robust retry mechanisms for API calls and network operations
 * with medical-specific error handling and recovery strategies.
 * 
 * Features:
 * - Exponential backoff with jitter
 * - Medical context-aware error classification
 * - Circuit breaker pattern for service health
 * - Comprehensive logging and metrics
 * - HIPAA-compliant error handling
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  jitter?: boolean
  retryCondition?: (error: any) => boolean
  onRetry?: (error: any, attempt: number) => void
  onFailure?: (error: any, totalAttempts: number) => void
  timeout?: number
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  totalTime: number
  lastAttemptTime: Date
}

export interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeout: number
  monitoringPeriod: number
}

export interface ServiceHealthMetrics {
  serviceName: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  lastFailure?: Date
  circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
}

class CircuitBreaker {
  private failureCount = 0
  private lastFailureTime?: Date
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  private metrics: ServiceHealthMetrics

  constructor(
    private serviceName: string,
    private config: CircuitBreakerConfig
  ) {
    this.metrics = {
      serviceName,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      circuitState: 'CLOSED'
    }
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error(`Circuit breaker is OPEN for ${this.serviceName}. Service is currently unavailable.`)
      }
    }

    this.metrics.totalRequests++
    const startTime = Date.now()

    try {
      const result = await operation()
      
      // Success - reset circuit breaker
      this.onSuccess()
      this.updateMetrics(Date.now() - startTime, true)
      
      return result
    } catch (error) {
      this.onFailure()
      this.updateMetrics(Date.now() - startTime, false)
      throw error
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime()
    return timeSinceLastFailure >= this.config.resetTimeout
  }

  private onSuccess(): void {
    this.failureCount = 0
    this.state = 'CLOSED'
    this.metrics.circuitState = 'CLOSED'
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = new Date()
    this.metrics.lastFailure = this.lastFailureTime

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN'
      this.metrics.circuitState = 'OPEN'
    }
  }

  private updateMetrics(responseTime: number, success: boolean): void {
    if (success) {
      this.metrics.successfulRequests++
    } else {
      this.metrics.failedRequests++
    }

    // Calculate running average response time
    const totalResponseTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime
    this.metrics.averageResponseTime = totalResponseTime / this.metrics.totalRequests
  }

  getMetrics(): ServiceHealthMetrics {
    return { ...this.metrics }
  }

  getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.state
  }
}

export class RetryService {
  private circuitBreakers = new Map<string, CircuitBreaker>()
  private defaultOptions: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
    timeout: 30000,
    retryCondition: (error: any) => this.isRetryableError(error),
    onRetry: () => {},
    onFailure: () => {}
  }

  /**
   * Execute operation with retry logic and circuit breaker
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
    serviceName = 'default'
  ): Promise<RetryResult<T>> {
    const config = { ...this.defaultOptions, ...options }
    const circuitBreaker = this.getOrCreateCircuitBreaker(serviceName)
    const startTime = Date.now()
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
      try {
        // Apply timeout to the operation
        const result = await this.withTimeout(
          () => circuitBreaker.execute(operation),
          config.timeout
        )

        return {
          success: true,
          data: result,
          attempts: attempt,
          totalTime: Date.now() - startTime,
          lastAttemptTime: new Date()
        }
      } catch (error) {
        lastError = error as Error
        
        console.warn(`Attempt ${attempt} failed for ${serviceName}:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          attempt,
          maxRetries: config.maxRetries,
          serviceName,
          timestamp: new Date().toISOString()
        })

        // Don't retry if this is the last attempt or error is not retryable
        if (attempt > config.maxRetries || !config.retryCondition(error)) {
          config.onFailure(error, attempt)
          break
        }

        // Calculate delay with exponential backoff and jitter
        const baseDelay = Math.min(
          config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        )
        
        const delay = config.jitter 
          ? baseDelay + Math.random() * baseDelay * 0.1
          : baseDelay

        config.onRetry(error, attempt)
        
        console.info(`Retrying in ${Math.round(delay)}ms... (attempt ${attempt + 1}/${config.maxRetries + 1})`)
        await this.sleep(delay)
      }
    }

    return {
      success: false,
      error: lastError || new Error('Unknown error occurred'),
      attempts: config.maxRetries + 1,
      totalTime: Date.now() - startTime,
      lastAttemptTime: new Date()
    }
  }

  /**
   * Medical-specific retry for edit operations
   */
  async executeEditOperation<T>(
    operation: () => Promise<T>,
    operationType: 'instruction' | 'manual' | 'voice',
    reportId: string
  ): Promise<RetryResult<T>> {
    return this.executeWithRetry(
      operation,
      {
        maxRetries: operationType === 'voice' ? 2 : 3, // Voice has more lenient retry
        initialDelay: 2000,
        maxDelay: 15000,
        onRetry: (error, attempt) => {
          console.warn(`Medical edit retry ${attempt}:`, {
            operationType,
            reportId,
            error: error.message,
            timestamp: new Date().toISOString()
          })
        },
        onFailure: (error, attempts) => {
          console.error(`Medical edit failed after ${attempts} attempts:`, {
            operationType,
            reportId,
            error: error.message,
            timestamp: new Date().toISOString()
          })
        }
      },
      `edit-${operationType}`
    )
  }

  /**
   * Supabase Edge Function specific retry
   */
  async executeEdgeFunction<T>(
    operation: () => Promise<T>,
    functionName: string
  ): Promise<RetryResult<T>> {
    return this.executeWithRetry(
      operation,
      {
        maxRetries: 4,
        initialDelay: 1500,
        maxDelay: 20000,
        timeout: 45000,
        retryCondition: (error) => {
          // Don't retry on authentication or validation errors
          if (error.status === 401 || error.status === 403) return false
          if (error.status === 400 && error.message?.includes('validation')) return false
          return this.isRetryableError(error)
        },
        onRetry: (error, attempt) => {
          console.warn(`Edge function retry ${attempt}:`, {
            functionName,
            error: error.message,
            status: error.status,
            timestamp: new Date().toISOString()
          })
        }
      },
      `edge-${functionName}`
    )
  }

  /**
   * Get circuit breaker metrics for monitoring
   */
  getServiceMetrics(serviceName: string): ServiceHealthMetrics | null {
    const breaker = this.circuitBreakers.get(serviceName)
    return breaker ? breaker.getMetrics() : null
  }

  /**
   * Get all service metrics
   */
  getAllServiceMetrics(): ServiceHealthMetrics[] {
    return Array.from(this.circuitBreakers.entries()).map(([name, breaker]) => 
      breaker.getMetrics()
    )
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') return true
    
    // HTTP status codes that are retryable
    if (error.status) {
      const retryableStatuses = [408, 429, 500, 502, 503, 504]
      return retryableStatuses.includes(error.status)
    }
    
    // Timeout errors
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) return true
    
    // Rate limiting
    if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) return true
    
    // Service unavailable
    if (error.message?.includes('unavailable') || error.message?.includes('overloaded')) return true
    
    // Connection errors
    if (error.message?.includes('connection') && !error.message?.includes('refused')) return true
    
    return false
  }

  /**
   * Add timeout to operation
   */
  private async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    })

    return Promise.race([operation(), timeoutPromise])
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get or create circuit breaker for service
   */
  private getOrCreateCircuitBreaker(serviceName: string): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      const config: CircuitBreakerConfig = {
        failureThreshold: 5,
        resetTimeout: 60000, // 1 minute
        monitoringPeriod: 300000 // 5 minutes
      }
      
      this.circuitBreakers.set(serviceName, new CircuitBreaker(serviceName, config))
    }
    
    return this.circuitBreakers.get(serviceName)!
  }
}

// Singleton instance
export const retryService = new RetryService()

// Medical-specific error types
export class MedicalProcessingError extends Error {
  constructor(
    message: string,
    public operationType: string,
    public reportId: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'MedicalProcessingError'
  }
}

export class NetworkConnectivityError extends Error {
  constructor(message: string, public retryable = true) {
    super(message)
    this.name = 'NetworkConnectivityError'
  }
}

export class ServiceUnavailableError extends Error {
  constructor(
    message: string,
    public serviceName: string,
    public estimatedRecoveryTime?: number
  ) {
    super(message)
    this.name = 'ServiceUnavailableError'
  }
}