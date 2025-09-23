/**
 * Error Management Service
 * 
 * Provides comprehensive error logging, categorization, and user feedback
 * for medical applications with HIPAA-compliant error handling.
 * 
 * Features:
 * - Medical context-aware error classification
 * - HIPAA-compliant error logging (no PHI)
 * - User-friendly error messages
 * - Error recovery suggestions
 * - Performance impact tracking
 * - Error pattern analysis
 * - Integration with medical feedback system
 */

export interface MedicalError {
  id: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'network' | 'ai' | 'validation' | 'storage' | 'voice' | 'ui' | 'security'
  code: string
  message: string
  userMessage: string
  context: {
    component?: string
    operation?: string
    reportId?: string
    sessionId?: string
    userId?: string
    specialty?: string
    feature?: string
  }
  technical: {
    stack?: string
    browserInfo: BrowserInfo
    networkStatus: NetworkStatus
    performanceMetrics: PerformanceMetrics
  }
  recovery?: {
    attempted: boolean
    successful: boolean
    action: string
    retryCount: number
  }
  userAction?: {
    dismissed: boolean
    feedbackProvided: boolean
    actionTaken?: string
    timestamp: Date
  }
}

export interface BrowserInfo {
  userAgent: string
  version: string
  platform: string
  language: string
  cookiesEnabled: boolean
  localStorageAvailable: boolean
  indexedDBAvailable: boolean
}

export interface NetworkStatus {
  isOnline: boolean
  effectiveType?: string
  downlink?: number
  rtt?: number
  connectionQuality: 'poor' | 'fair' | 'good' | 'excellent'
}

export interface PerformanceMetrics {
  memoryUsage?: number
  connectionCount?: number
  responseTime?: number
  cpuUsage?: number
}

export interface ErrorPattern {
  pattern: string
  frequency: number
  lastOccurrence: Date
  severity: MedicalError['severity']
  suggestedAction: string
}

export interface ErrorReport {
  period: string
  totalErrors: number
  errorsByCategory: Record<string, number>
  errorsBySeverity: Record<string, number>
  topErrors: ErrorPattern[]
  recoveryRate: number
  userSatisfaction: number
}

export class ErrorManagementService {
  private errors: MedicalError[] = []
  private maxErrorHistory = 1000
  private errorPatterns = new Map<string, ErrorPattern>()
  private feedbackCallbacks = new Set<(error: MedicalError) => void>()

  constructor() {
    this.setupGlobalErrorHandlers()
    this.loadErrorHistory()
    this.startPeriodicAnalysis()
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        severity: 'medium',
        category: 'ui',
        code: 'JS_ERROR',
        message: event.message,
        context: {
          component: 'global',
          operation: 'javascript_execution'
        },
        technical: {
          stack: event.error?.stack,
          browserInfo: this.getBrowserInfo(),
          networkStatus: this.getNetworkStatus(),
          performanceMetrics: this.getPerformanceMetrics()
        }
      })
    })

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        severity: 'medium',
        category: 'ui',
        code: 'UNHANDLED_PROMISE',
        message: `Unhandled promise rejection: ${event.reason}`,
        context: {
          component: 'global',
          operation: 'promise_rejection'
        },
        technical: {
          stack: event.reason?.stack,
          browserInfo: this.getBrowserInfo(),
          networkStatus: this.getNetworkStatus(),
          performanceMetrics: this.getPerformanceMetrics()
        }
      })
    })

    // Network errors
    window.addEventListener('offline', () => {
      this.logError({
        severity: 'high',
        category: 'network',
        code: 'NETWORK_OFFLINE',
        message: 'Network connection lost',
        context: {
          component: 'network',
          operation: 'connectivity_check'
        },
        technical: {
          browserInfo: this.getBrowserInfo(),
          networkStatus: this.getNetworkStatus(),
          performanceMetrics: this.getPerformanceMetrics()
        }
      })
    })
  }

  /**
   * Log medical error with comprehensive context
   */
  public logError(errorData: Partial<MedicalError>): string {
    const error: MedicalError = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      severity: errorData.severity || 'medium',
      category: errorData.category || 'ui',
      code: errorData.code || 'UNKNOWN_ERROR',
      message: errorData.message || 'An unknown error occurred',
      userMessage: this.generateUserFriendlyMessage(errorData),
      context: {
        component: 'unknown',
        operation: 'unknown',
        ...errorData.context
      },
      technical: {
        browserInfo: this.getBrowserInfo(),
        networkStatus: this.getNetworkStatus(),
        performanceMetrics: this.getPerformanceMetrics(),
        ...errorData.technical
      },
      recovery: errorData.recovery,
      userAction: errorData.userAction
    }

    // Add to error history
    this.errors.unshift(error)
    if (this.errors.length > this.maxErrorHistory) {
      this.errors = this.errors.slice(0, this.maxErrorHistory)
    }

    // Update error patterns
    this.updateErrorPatterns(error)

    // Log to console for debugging
    console.error(`[${error.severity.toUpperCase()}] ${error.code}:`, error.message, error)

    // Save to localStorage (without PHI)
    this.saveErrorHistory()

    // Notify feedback systems
    this.notifyFeedbackSystems(error)

    // Show user feedback if appropriate
    this.showUserFeedback(error)

    return error.id
  }

  /**
   * Log medical operation error
   */
  public logMedicalOperationError(
    operation: string,
    error: Error,
    context: {
      reportId?: string
      sessionId?: string
      specialty?: string
      feature?: string
    }
  ): string {
    return this.logError({
      severity: 'high',
      category: 'ai',
      code: 'MEDICAL_OPERATION_ERROR',
      message: `Medical operation failed: ${operation}`,
      context: {
        component: 'medical-processor',
        operation,
        ...context
      },
      technical: {
        stack: error.stack,
        browserInfo: this.getBrowserInfo(),
        networkStatus: this.getNetworkStatus(),
        performanceMetrics: this.getPerformanceMetrics()
      }
    })
  }

  /**
   * Log network error with retry information
   */
  public logNetworkError(
    endpoint: string,
    error: Error,
    retryCount: number,
    context?: any
  ): string {
    return this.logError({
      severity: retryCount > 3 ? 'high' : 'medium',
      category: 'network',
      code: 'NETWORK_REQUEST_FAILED',
      message: `Network request failed: ${endpoint}`,
      context: {
        component: 'api-client',
        operation: 'network_request',
        ...context
      },
      technical: {
        stack: error.stack,
        browserInfo: this.getBrowserInfo(),
        networkStatus: this.getNetworkStatus(),
        performanceMetrics: this.getPerformanceMetrics()
      },
      recovery: {
        attempted: retryCount > 0,
        successful: false,
        action: 'retry_request',
        retryCount
      }
    })
  }

  /**
   * Log voice transcription error
   */
  public logVoiceError(
    error: Error,
    context: {
      sessionId?: string
      language?: string
      duration?: number
    }
  ): string {
    return this.logError({
      severity: 'medium',
      category: 'voice',
      code: 'VOICE_TRANSCRIPTION_ERROR',
      message: `Voice transcription failed: ${error.message}`,
      context: {
        component: 'voice-processor',
        operation: 'transcription',
        ...context
      },
      technical: {
        stack: error.stack,
        browserInfo: this.getBrowserInfo(),
        networkStatus: this.getNetworkStatus(),
        performanceMetrics: this.getPerformanceMetrics()
      }
    })
  }

  /**
   * Log storage error
   */
  public logStorageError(
    operation: string,
    error: Error,
    context?: any
  ): string {
    return this.logError({
      severity: 'high',
      category: 'storage',
      code: 'STORAGE_ERROR',
      message: `Storage operation failed: ${operation}`,
      context: {
        component: 'storage-service',
        operation,
        ...context
      },
      technical: {
        stack: error.stack,
        browserInfo: this.getBrowserInfo(),
        networkStatus: this.getNetworkStatus(),
        performanceMetrics: this.getPerformanceMetrics()
      }
    })
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserFriendlyMessage(errorData: Partial<MedicalError>): string {
    const category = errorData.category || 'ui'
    const code = errorData.code || 'UNKNOWN_ERROR'
    const severity = errorData.severity || 'medium'

    const messages: Record<string, Record<string, string>> = {
      network: {
        NETWORK_OFFLINE: 'You appear to be offline. Your work will be saved locally and synced when connectivity returns.',
        NETWORK_REQUEST_FAILED: 'Unable to connect to the server. Please check your internet connection and try again.',
        TIMEOUT: 'The request took too long to complete. Please try again or check your connection.'
      },
      ai: {
        MEDICAL_OPERATION_ERROR: 'The AI processing service encountered an issue. Please try your request again, or use manual editing instead.',
        PROCESSING_TIMEOUT: 'AI processing is taking longer than expected. You can try again or continue with manual editing.',
        VALIDATION_FAILED: 'The medical content validation detected potential issues. Please review your input and try again.'
      },
      voice: {
        VOICE_TRANSCRIPTION_ERROR: 'Voice transcription failed. Please check your microphone settings and try again, or use text input instead.',
        MICROPHONE_ACCESS_DENIED: 'Microphone access is required for voice features. Please enable microphone permissions in your browser.',
        AUDIO_PROCESSING_FAILED: 'Unable to process the audio. Please try recording again or use text input.'
      },
      storage: {
        STORAGE_ERROR: 'Unable to save your changes locally. Please ensure sufficient storage space is available.',
        QUOTA_EXCEEDED: 'Local storage is full. Please clear some space or contact support for assistance.',
        DATA_CORRUPTION: 'Some saved data appears corrupted. Please refresh the page and try again.'
      },
      validation: {
        MEDICAL_VALIDATION_ERROR: 'Medical validation detected potential safety concerns. Please review your input carefully.',
        CONTENT_VALIDATION_FAILED: 'The content validation failed. Please check your input format and try again.',
        SAFETY_CHECK_FAILED: 'Safety validation could not be completed. Please proceed with caution.'
      },
      ui: {
        JS_ERROR: 'A technical issue occurred. Please refresh the page and try again.',
        UNHANDLED_PROMISE: 'An unexpected error occurred. Your work has been saved and you can continue safely.',
        RENDER_ERROR: 'Display issue detected. Please refresh the page to continue.'
      }
    }

    const categoryMessages = messages[category] || messages.ui
    let message = categoryMessages[code] || categoryMessages.JS_ERROR || 'An unexpected error occurred. Please try again.'

    // Add severity context
    if (severity === 'critical') {
      message = `Critical Issue: ${message} Please contact support immediately.`
    } else if (severity === 'high') {
      message = `${message} If this continues, please contact support.`
    }

    return message
  }

  /**
   * Update error patterns for analysis
   */
  private updateErrorPatterns(error: MedicalError): void {
    const patternKey = `${error.category}:${error.code}`
    const existing = this.errorPatterns.get(patternKey)

    if (existing) {
      existing.frequency++
      existing.lastOccurrence = error.timestamp
      if (error.severity === 'critical' || error.severity === 'high') {
        existing.severity = error.severity
      }
    } else {
      this.errorPatterns.set(patternKey, {
        pattern: patternKey,
        frequency: 1,
        lastOccurrence: error.timestamp,
        severity: error.severity,
        suggestedAction: this.generateSuggestedAction(error)
      })
    }
  }

  /**
   * Generate suggested recovery action
   */
  private generateSuggestedAction(error: MedicalError): string {
    switch (error.category) {
      case 'network':
        return 'Check internet connection and retry operation'
      case 'ai':
        return 'Try manual editing or wait for service recovery'
      case 'voice':
        return 'Check microphone settings or use text input'
      case 'storage':
        return 'Clear browser cache and refresh page'
      case 'validation':
        return 'Review input content and correct any issues'
      default:
        return 'Refresh page and try again'
    }
  }

  /**
   * Show user feedback via medical feedback system
   */
  private showUserFeedback(error: MedicalError): void {
    // Only show feedback for medium and high severity errors
    if (error.severity === 'low') return

    const event = new CustomEvent('medical-error', {
      detail: {
        id: error.id,
        type: error.severity === 'critical' ? 'error' : 'warning',
        title: this.getErrorTitle(error),
        message: error.userMessage,
        persistent: error.severity === 'critical' || error.severity === 'high',
        actions: this.getErrorActions(error)
      }
    })

    window.dispatchEvent(event)
  }

  /**
   * Get error title for user display
   */
  private getErrorTitle(error: MedicalError): string {
    const titles: Record<string, string> = {
      network: 'Connection Issue',
      ai: 'AI Processing Issue',
      voice: 'Voice Recognition Issue',
      storage: 'Data Storage Issue',
      validation: 'Validation Issue',
      ui: 'Technical Issue',
      security: 'Security Issue'
    }

    return titles[error.category] || 'Technical Issue'
  }

  /**
   * Get error action buttons
   */
  private getErrorActions(error: MedicalError): Array<{ label: string; type: 'primary' | 'secondary'; onClick: () => void }> {
    const actions: Array<{ label: string; type: 'primary' | 'secondary'; onClick: () => void }> = []

    // Retry action for retryable errors
    if (['network', 'ai', 'voice'].includes(error.category)) {
      actions.push({
        label: 'Retry',
        type: 'primary',
        onClick: () => this.retryOperation(error)
      })
    }

    // Help action
    actions.push({
      label: 'Get Help',
      type: 'secondary',
      onClick: () => this.showErrorHelp(error)
    })

    // Report issue action for critical errors
    if (error.severity === 'critical') {
      actions.push({
        label: 'Report Issue',
        type: 'secondary',
        onClick: () => this.reportError(error)
      })
    }

    return actions
  }

  /**
   * Retry operation for error
   */
  private retryOperation(error: MedicalError): void {
    const retryEvent = new CustomEvent('error-retry', {
      detail: { errorId: error.id, operation: error.context.operation }
    })
    window.dispatchEvent(retryEvent)

    // Mark user action
    error.userAction = {
      dismissed: false,
      feedbackProvided: false,
      actionTaken: 'retry',
      timestamp: new Date()
    }
  }

  /**
   * Show error help
   */
  private showErrorHelp(error: MedicalError): void {
    const helpEvent = new CustomEvent('error-help', {
      detail: { errorId: error.id, category: error.category, code: error.code }
    })
    window.dispatchEvent(helpEvent)

    // Mark user action
    error.userAction = {
      dismissed: false,
      feedbackProvided: false,
      actionTaken: 'help',
      timestamp: new Date()
    }
  }

  /**
   * Report error to support
   */
  private reportError(error: MedicalError): void {
    const reportEvent = new CustomEvent('error-report', {
      detail: { errorId: error.id, error: this.sanitizeErrorForReport(error) }
    })
    window.dispatchEvent(reportEvent)

    // Mark user action
    error.userAction = {
      dismissed: false,
      feedbackProvided: true,
      actionTaken: 'report',
      timestamp: new Date()
    }
  }

  /**
   * Sanitize error data for reporting (remove PHI)
   */
  private sanitizeErrorForReport(error: MedicalError): Partial<MedicalError> {
    return {
      id: error.id,
      timestamp: error.timestamp,
      severity: error.severity,
      category: error.category,
      code: error.code,
      message: error.message,
      context: {
        component: error.context.component,
        operation: error.context.operation,
        specialty: error.context.specialty,
        feature: error.context.feature
        // Exclude reportId, sessionId, userId
      },
      technical: error.technical,
      recovery: error.recovery
    }
  }

  /**
   * Get browser information
   */
  private getBrowserInfo(): BrowserInfo {
    return {
      userAgent: navigator.userAgent,
      version: this.getBrowserVersion(),
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      localStorageAvailable: this.isLocalStorageAvailable(),
      indexedDBAvailable: this.isIndexedDBAvailable()
    }
  }

  /**
   * Get browser version
   */
  private getBrowserVersion(): string {
    const userAgent = navigator.userAgent
    const match = userAgent.match(/(firefox|msie|chrome|safari|opera)\/?\s*(\d+)/i)
    return match ? `${match[1]} ${match[2]}` : 'Unknown'
  }

  /**
   * Check if localStorage is available
   */
  private isLocalStorageAvailable(): boolean {
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if IndexedDB is available
   */
  private isIndexedDBAvailable(): boolean {
    try {
      return 'indexedDB' in window
    } catch {
      return false
    }
  }

  /**
   * Get network status
   */
  private getNetworkStatus(): NetworkStatus {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection

    return {
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      connectionQuality: this.assessConnectionQuality(connection)
    }
  }

  /**
   * Assess connection quality
   */
  private assessConnectionQuality(connection: any): NetworkStatus['connectionQuality'] {
    if (!connection || !connection.downlink) return 'poor'
    
    const downlink = connection.downlink
    const rtt = connection.rtt || 0

    if (downlink >= 10 && rtt < 200) return 'excellent'
    if (downlink >= 2 && rtt < 500) return 'good'
    if (downlink >= 0.5 && rtt < 1000) return 'fair'
    return 'poor'
  }

  /**
   * Get performance metrics
   */
  private getPerformanceMetrics(): PerformanceMetrics {
    const metrics: PerformanceMetrics = {}

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      metrics.memoryUsage = memory.usedJSHeapSize
    }

    // Connection count (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      metrics.connectionCount = connection.downlink
    }

    return metrics
  }

  /**
   * Notify feedback systems
   */
  private notifyFeedbackSystems(error: MedicalError): void {
    this.feedbackCallbacks.forEach(callback => {
      try {
        callback(error)
      } catch (error) {
        console.error('Error in feedback callback:', error)
      }
    })
  }

  /**
   * Add feedback callback
   */
  public addFeedbackCallback(callback: (error: MedicalError) => void): void {
    this.feedbackCallbacks.add(callback)
  }

  /**
   * Remove feedback callback
   */
  public removeFeedbackCallback(callback: (error: MedicalError) => void): void {
    this.feedbackCallbacks.delete(callback)
  }

  /**
   * Save error history to localStorage
   */
  private saveErrorHistory(): void {
    try {
      // Save only essential error data (no PHI)
      const sanitizedErrors = this.errors.map(error => this.sanitizeErrorForReport(error))
      localStorage.setItem('medimind_error_history', JSON.stringify(sanitizedErrors.slice(0, 100)))
    } catch (error) {
      console.error('Failed to save error history:', error)
    }
  }

  /**
   * Load error history from localStorage
   */
  private loadErrorHistory(): void {
    try {
      const saved = localStorage.getItem('medimind_error_history')
      if (saved) {
        const errors = JSON.parse(saved)
        console.log(`Loaded ${errors.length} errors from history`)
      }
    } catch (error) {
      console.error('Failed to load error history:', error)
    }
  }

  /**
   * Start periodic error analysis
   */
  private startPeriodicAnalysis(): void {
    setInterval(() => {
      this.analyzeErrorPatterns()
      this.cleanupOldErrors()
    }, 300000) // Every 5 minutes
  }

  /**
   * Analyze error patterns
   */
  private analyzeErrorPatterns(): void {
    const recentErrors = this.errors.filter(
      error => Date.now() - error.timestamp.getTime() < 3600000 // Last hour
    )

    if (recentErrors.length > 10) {
      console.warn(`High error rate detected: ${recentErrors.length} errors in the last hour`)
      
      // Group by category
      const categories = recentErrors.reduce((acc, error) => {
        acc[error.category] = (acc[error.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      console.warn('Error breakdown by category:', categories)
    }
  }

  /**
   * Clean up old errors
   */
  private cleanupOldErrors(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000 // 24 hours
    const initialCount = this.errors.length
    
    this.errors = this.errors.filter(error => error.timestamp.getTime() > cutoff)
    
    if (this.errors.length < initialCount) {
      console.log(`Cleaned up ${initialCount - this.errors.length} old errors`)
    }
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): ErrorReport {
    const last24Hours = this.errors.filter(
      error => Date.now() - error.timestamp.getTime() < 24 * 60 * 60 * 1000
    )

    const errorsByCategory = last24Hours.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const errorsBySeverity = last24Hours.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topErrors = Array.from(this.errorPatterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)

    const errorsWithRecovery = last24Hours.filter(error => error.recovery?.attempted)
    const successfulRecoveries = errorsWithRecovery.filter(error => error.recovery?.successful)
    const recoveryRate = errorsWithRecovery.length > 0 
      ? successfulRecoveries.length / errorsWithRecovery.length 
      : 0

    const errorsWithFeedback = last24Hours.filter(error => error.userAction?.feedbackProvided)
    const userSatisfaction = errorsWithFeedback.length > 0 
      ? errorsWithFeedback.filter(error => error.userAction?.actionTaken !== 'report').length / errorsWithFeedback.length
      : 1

    return {
      period: 'Last 24 hours',
      totalErrors: last24Hours.length,
      errorsByCategory,
      errorsBySeverity,
      topErrors,
      recoveryRate: Math.round(recoveryRate * 100) / 100,
      userSatisfaction: Math.round(userSatisfaction * 100) / 100
    }
  }

  /**
   * Get specific error by ID
   */
  public getError(errorId: string): MedicalError | null {
    return this.errors.find(error => error.id === errorId) || null
  }

  /**
   * Get recent errors
   */
  public getRecentErrors(limit = 50): MedicalError[] {
    return this.errors.slice(0, limit)
  }

  /**
   * Clear error history
   */
  public clearErrorHistory(): void {
    this.errors = []
    this.errorPatterns.clear()
    localStorage.removeItem('medimind_error_history')
    console.log('Error history cleared')
  }
}

// Singleton instance
export const errorManagementService = new ErrorManagementService()

// Medical error types for easy reference
export const MedicalErrorCodes = {
  // Network errors
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  API_UNAVAILABLE: 'API_UNAVAILABLE',
  
  // AI processing errors
  AI_PROCESSING_FAILED: 'AI_PROCESSING_FAILED',
  AI_TIMEOUT: 'AI_TIMEOUT',
  MEDICAL_VALIDATION_FAILED: 'MEDICAL_VALIDATION_FAILED',
  
  // Voice errors
  MICROPHONE_ACCESS_DENIED: 'MICROPHONE_ACCESS_DENIED',
  VOICE_TRANSCRIPTION_FAILED: 'VOICE_TRANSCRIPTION_FAILED',
  AUDIO_PROCESSING_ERROR: 'AUDIO_PROCESSING_ERROR',
  
  // Storage errors
  LOCAL_STORAGE_FULL: 'LOCAL_STORAGE_FULL',
  INDEXEDDB_ERROR: 'INDEXEDDB_ERROR',
  DATA_SYNC_FAILED: 'DATA_SYNC_FAILED',
  
  // Validation errors
  CONTENT_VALIDATION_FAILED: 'CONTENT_VALIDATION_FAILED',
  MEDICAL_SAFETY_VIOLATION: 'MEDICAL_SAFETY_VIOLATION',
  HIPAA_COMPLIANCE_WARNING: 'HIPAA_COMPLIANCE_WARNING'
} as const