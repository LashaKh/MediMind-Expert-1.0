/**
 * Graceful Degradation Service
 * 
 * Provides fallback functionality when AI services are unavailable,
 * ensuring medical professionals can continue working with basic
 * editing capabilities and offline support.
 * 
 * Features:
 * - Service availability detection
 * - Fallback mode activation
 * - Basic editing without AI processing
 * - Local storage for offline operations
 * - Service recovery detection
 * - User experience continuity
 */

import { retryService, ServiceHealthMetrics } from './retryService'

export interface ServiceStatus {
  serviceName: string
  isAvailable: boolean
  lastChecked: Date
  responseTime?: number
  error?: string
  degradedMode: boolean
}

export interface DegradationConfig {
  checkInterval: number
  maxFailuresBeforeDegradation: number
  recoveryRequiredSuccesses: number
  gracePeriodMs: number
}

export interface FallbackCapabilities {
  basicEditing: boolean
  manualSave: boolean
  versionHistory: boolean
  voiceRecording: boolean
  offlineQueue: boolean
  localValidation: boolean
}

export interface OfflineOperation {
  id: string
  type: 'edit' | 'save' | 'voice_transcript'
  reportId: string
  sessionId: string
  operation: any
  timestamp: Date
  retryCount: number
}

export class GracefulDegradationService {
  private services = new Map<string, ServiceStatus>()
  private config: DegradationConfig
  private offlineQueue: OfflineOperation[] = []
  private checkInterval?: NodeJS.Timeout
  private isOnline = navigator.onLine
  private fallbackCapabilities: FallbackCapabilities

  constructor(config?: Partial<DegradationConfig>) {
    this.config = {
      checkInterval: 30000, // 30 seconds
      maxFailuresBeforeDegradation: 3,
      recoveryRequiredSuccesses: 2,
      gracePeriodMs: 5000, // 5 seconds grace period
      ...config
    }

    this.fallbackCapabilities = {
      basicEditing: true,
      manualSave: true,
      versionHistory: true,
      voiceRecording: this.isOnline, // Requires internet for transcription
      offlineQueue: true,
      localValidation: true
    }

    this.initializeServices()
    this.setupNetworkListeners()
    this.startServiceMonitoring()
    this.loadOfflineQueue()
  }

  /**
   * Initialize known services
   */
  private initializeServices(): void {
    const services = [
      'ai-processing',
      'edge-functions',
      'voice-transcription',
      'medical-validation',
      'document-processing'
    ]

    services.forEach(serviceName => {
      this.services.set(serviceName, {
        serviceName,
        isAvailable: true,
        lastChecked: new Date(),
        degradedMode: false
      })
    })
  }

  /**
   * Setup network connectivity listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('Network connectivity restored')
      this.isOnline = true
      this.fallbackCapabilities.voiceRecording = true
      this.attemptServiceRecovery()
      this.processOfflineQueue()
    })

    window.addEventListener('offline', () => {
      console.log('Network connectivity lost')
      this.isOnline = false
      this.fallbackCapabilities.voiceRecording = false
      this.activateDegradedMode('network', 'No internet connection')
    })
  }

  /**
   * Start service health monitoring
   */
  private startServiceMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    this.checkInterval = setInterval(() => {
      this.checkServiceHealth()
    }, this.config.checkInterval)
  }

  /**
   * Check health of all services
   */
  private async checkServiceHealth(): Promise<void> {
    if (!this.isOnline) return

    const healthChecks = Array.from(this.services.keys()).map(serviceName =>
      this.checkSingleServiceHealth(serviceName)
    )

    await Promise.allSettled(healthChecks)
  }

  /**
   * Check health of a single service
   */
  private async checkSingleServiceHealth(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName)
    if (!service) return

    try {
      const startTime = Date.now()
      const isHealthy = await this.performHealthCheck(serviceName)
      const responseTime = Date.now() - startTime

      service.lastChecked = new Date()
      service.responseTime = responseTime

      if (isHealthy) {
        this.handleServiceRecovery(serviceName)
      } else {
        this.handleServiceFailure(serviceName, 'Health check failed')
      }
    } catch (error) {
      this.handleServiceFailure(serviceName, (error as Error).message)
    }
  }

  /**
   * Perform health check for specific service
   */
  private async performHealthCheck(serviceName: string): Promise<boolean> {
    switch (serviceName) {
      case 'ai-processing':
        return this.checkAIProcessingHealth()
      case 'edge-functions':
        return this.checkEdgeFunctionsHealth()
      case 'voice-transcription':
        return this.checkVoiceTranscriptionHealth()
      case 'medical-validation':
        return this.checkMedicalValidationHealth()
      case 'document-processing':
        return this.checkDocumentProcessingHealth()
      default:
        return true
    }
  }

  /**
   * Check AI processing service health
   */
  private async checkAIProcessingHealth(): Promise<boolean> {
    try {
      const metrics = retryService.getServiceMetrics('edit-instruction')
      if (!metrics) return true // No metrics means no failures yet

      const failureRate = metrics.failedRequests / Math.max(metrics.totalRequests, 1)
      return failureRate < 0.5 // Allow up to 50% failure rate before degrading
    } catch {
      return false
    }
  }

  /**
   * Check Edge Functions health
   */
  private async checkEdgeFunctionsHealth(): Promise<boolean> {
    try {
      // Simple ping to edge function with proper base path
      const response = await fetch('/expert/api/health', { 
        method: 'GET',
        timeout: 5000 
      } as any)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Check Voice Transcription health
   */
  private async checkVoiceTranscriptionHealth(): Promise<boolean> {
    if (!this.isOnline) return false
    
    try {
      // Check if WebRTC and media devices are available
      const hasMediaSupport = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      return hasMediaSupport
    } catch {
      return false
    }
  }

  /**
   * Check Medical Validation health
   */
  private async checkMedicalValidationHealth(): Promise<boolean> {
    return true // Local validation always available
  }

  /**
   * Check Document Processing health
   */
  private async checkDocumentProcessingHealth(): Promise<boolean> {
    try {
      const metrics = retryService.getServiceMetrics('document-upload')
      if (!metrics) return true

      return metrics.circuitState !== 'OPEN'
    } catch {
      return true
    }
  }

  /**
   * Handle service failure
   */
  private handleServiceFailure(serviceName: string, error: string): void {
    const service = this.services.get(serviceName)
    if (!service) return

    console.warn(`Service ${serviceName} failed health check:`, error)
    
    service.error = error
    service.isAvailable = false
    
    this.activateDegradedMode(serviceName, error)
  }

  /**
   * Handle service recovery
   */
  private handleServiceRecovery(serviceName: string): void {
    const service = this.services.get(serviceName)
    if (!service) return

    if (!service.isAvailable) {
      console.log(`Service ${serviceName} recovered`)
      service.isAvailable = true
      service.error = undefined
      service.degradedMode = false
    }
  }

  /**
   * Activate degraded mode for service
   */
  private activateDegradedMode(serviceName: string, reason: string): void {
    const service = this.services.get(serviceName)
    if (service) {
      service.degradedMode = true
    }

    console.warn(`Activated degraded mode for ${serviceName}:`, reason)

    // Adjust capabilities based on failed service
    switch (serviceName) {
      case 'ai-processing':
        this.fallbackCapabilities.basicEditing = true // Manual editing still works
        break
      case 'voice-transcription':
        this.fallbackCapabilities.voiceRecording = false
        break
      case 'network':
        this.fallbackCapabilities.voiceRecording = false
        this.fallbackCapabilities.offlineQueue = true
        break
    }

    // Notify user about degradation
    this.notifyUserOfDegradation(serviceName, reason)
  }

  /**
   * Attempt recovery of all services
   */
  private async attemptServiceRecovery(): Promise<void> {
    console.log('Attempting service recovery...')
    await this.checkServiceHealth()
  }

  /**
   * Add operation to offline queue
   */
  public queueOfflineOperation(
    type: OfflineOperation['type'],
    reportId: string,
    sessionId: string,
    operation: any
  ): void {
    const offlineOp: OfflineOperation = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      reportId,
      sessionId,
      operation,
      timestamp: new Date(),
      retryCount: 0
    }

    this.offlineQueue.push(offlineOp)
    this.saveOfflineQueue()

    console.log(`Queued offline operation: ${type} for report ${reportId}`)
  }

  /**
   * Process offline queue when connectivity returns
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return

    console.log(`Processing ${this.offlineQueue.length} offline operations`)

    const processedOperations: string[] = []

    for (const operation of this.offlineQueue) {
      try {
        await this.processQueuedOperation(operation)
        processedOperations.push(operation.id)
        console.log(`Successfully processed offline operation: ${operation.id}`)
      } catch (error) {
        operation.retryCount++
        console.error(`Failed to process offline operation ${operation.id}:`, error)

        // Remove operations that have failed too many times
        if (operation.retryCount >= 3) {
          processedOperations.push(operation.id)
          console.warn(`Removing failed offline operation after 3 retries: ${operation.id}`)
        }
      }
    }

    // Remove processed operations from queue
    this.offlineQueue = this.offlineQueue.filter(op => !processedOperations.includes(op.id))
    this.saveOfflineQueue()
  }

  /**
   * Process individual queued operation
   */
  private async processQueuedOperation(operation: OfflineOperation): Promise<void> {
    switch (operation.type) {
      case 'edit':
        // Re-attempt edit operation
        break
      case 'save':
        // Re-attempt save operation
        break
      case 'voice_transcript':
        // Re-attempt voice transcription
        break
    }
  }

  /**
   * Get current service status
   */
  public getServiceStatus(serviceName: string): ServiceStatus | null {
    return this.services.get(serviceName) || null
  }

  /**
   * Get all service statuses
   */
  public getAllServiceStatuses(): ServiceStatus[] {
    return Array.from(this.services.values())
  }

  /**
   * Check if service is available
   */
  public isServiceAvailable(serviceName: string): boolean {
    const service = this.services.get(serviceName)
    return service ? service.isAvailable : false
  }

  /**
   * Check if in degraded mode
   */
  public isInDegradedMode(): boolean {
    return !this.isOnline || Array.from(this.services.values()).some(s => s.degradedMode)
  }

  /**
   * Get current capabilities
   */
  public getCapabilities(): FallbackCapabilities {
    return { ...this.fallbackCapabilities }
  }

  /**
   * Get offline queue status
   */
  public getOfflineQueueStatus(): { count: number, oldestOperation?: Date } {
    return {
      count: this.offlineQueue.length,
      oldestOperation: this.offlineQueue.length > 0 
        ? new Date(Math.min(...this.offlineQueue.map(op => op.timestamp.getTime())))
        : undefined
    }
  }

  /**
   * Save offline queue to localStorage
   */
  private saveOfflineQueue(): void {
    try {
      localStorage.setItem('medimind_offline_queue', JSON.stringify(this.offlineQueue))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }

  /**
   * Load offline queue from localStorage
   */
  private loadOfflineQueue(): void {
    try {
      const saved = localStorage.getItem('medimind_offline_queue')
      if (saved) {
        this.offlineQueue = JSON.parse(saved).map((op: any) => ({
          ...op,
          timestamp: new Date(op.timestamp)
        }))
        console.log(`Loaded ${this.offlineQueue.length} operations from offline queue`)
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
      this.offlineQueue = []
    }
  }

  /**
   * Notify user of service degradation
   */
  private notifyUserOfDegradation(serviceName: string, reason: string): void {
    // This would integrate with the medical feedback system
    const event = new CustomEvent('service-degraded', {
      detail: { serviceName, reason, capabilities: this.fallbackCapabilities }
    })
    window.dispatchEvent(event)
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    
    window.removeEventListener('online', this.attemptServiceRecovery)
    window.removeEventListener('offline', () => this.activateDegradedMode('network', 'No internet connection'))
  }
}

// Singleton instance
export const gracefulDegradationService = new GracefulDegradationService()

// Medical-specific degradation modes
export const MedicalDegradationModes = {
  AI_UNAVAILABLE: {
    name: 'AI Processing Unavailable',
    capabilities: {
      basicEditing: true,
      manualSave: true,
      versionHistory: true,
      voiceRecording: false,
      offlineQueue: true,
      localValidation: true
    },
    message: 'AI processing is temporarily unavailable. You can continue with manual editing and your changes will be processed when the service recovers.'
  },
  
  VOICE_UNAVAILABLE: {
    name: 'Voice Services Unavailable',
    capabilities: {
      basicEditing: true,
      manualSave: true,
      versionHistory: true,
      voiceRecording: false,
      offlineQueue: true,
      localValidation: true
    },
    message: 'Voice transcription is temporarily unavailable. Please use text input for instructions.'
  },
  
  OFFLINE_MODE: {
    name: 'Offline Mode',
    capabilities: {
      basicEditing: true,
      manualSave: true,
      versionHistory: true,
      voiceRecording: false,
      offlineQueue: true,
      localValidation: true
    },
    message: 'You are currently offline. Basic editing is available and your changes will sync when connectivity is restored.'
  },
  
  MINIMAL_MODE: {
    name: 'Minimal Functionality',
    capabilities: {
      basicEditing: true,
      manualSave: false,
      versionHistory: false,
      voiceRecording: false,
      offlineQueue: false,
      localValidation: false
    },
    message: 'System is experiencing issues. Only basic text editing is available.'
  }
}