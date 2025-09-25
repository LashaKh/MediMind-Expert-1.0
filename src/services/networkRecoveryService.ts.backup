/**
 * Network Recovery Service
 * 
 * Provides automatic recovery mechanisms for network interruptions,
 * ensuring seamless continuation of medical documentation work.
 * 
 * Features:
 * - Network connectivity monitoring
 * - Automatic reconnection attempts
 * - Session restoration after interruptions
 * - Bandwidth adaptation
 * - Connection quality assessment
 * - Smart retry strategies
 * - Medical workflow continuity
 */

import { retryService } from './retryService'
import { offlineStorageService } from './offlineStorageService'
import { gracefulDegradationService } from './gracefulDegradationService'

export interface ConnectionStatus {
  isOnline: boolean
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'
  downlink: number // Mbps
  rtt: number // milliseconds
  saveData: boolean
  lastChanged: Date
  quality: 'poor' | 'fair' | 'good' | 'excellent'
}

export interface NetworkRecoveryConfig {
  maxReconnectionAttempts: number
  reconnectionInterval: number
  connectionTimeoutMs: number
  qualityCheckInterval: number
  bandwidthThresholds: {
    poor: number
    fair: number
    good: number
  }
}

export interface RecoverySession {
  sessionId: string
  reportId: string
  lastActivity: Date
  networkInterruptions: NetworkInterruption[]
  isRecovering: boolean
  recoveryAttempts: number
}

export interface NetworkInterruption {
  startTime: Date
  endTime?: Date
  duration?: number
  reason: 'connection_lost' | 'timeout' | 'quality_degraded' | 'rate_limited'
  impactedOperations: string[]
  recoveryAction: string
}

export class NetworkRecoveryService {
  private connectionStatus: ConnectionStatus
  private config: NetworkRecoveryConfig
  private recoverySessions = new Map<string, RecoverySession>()
  private reconnectionTimer?: NodeJS.Timeout
  private qualityCheckTimer?: NodeJS.Timeout
  private isRecovering = false
  private listeners: Array<(status: ConnectionStatus) => void> = []

  constructor(config?: Partial<NetworkRecoveryConfig>) {
    this.config = {
      maxReconnectionAttempts: 5,
      reconnectionInterval: 10000, // 10 seconds
      connectionTimeoutMs: 15000, // 15 seconds
      qualityCheckInterval: 30000, // 30 seconds
      bandwidthThresholds: {
        poor: 0.5, // < 0.5 Mbps
        fair: 2.0, // 0.5-2 Mbps
        good: 10.0 // 2-10 Mbps, >10 = excellent
      },
      ...config
    }

    this.connectionStatus = this.initializeConnectionStatus()
    this.setupNetworkMonitoring()
    this.startQualityMonitoring()
  }

  /**
   * Initialize connection status
   */
  private initializeConnectionStatus(): ConnectionStatus {
    const connection = this.getNetworkInformation()
    
    return {
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false,
      lastChanged: new Date(),
      quality: this.assessConnectionQuality(connection?.downlink || 0, connection?.rtt || 0)
    }
  }

  /**
   * Setup network monitoring listeners
   */
  private setupNetworkMonitoring(): void {
    // Online/offline events
    window.addEventListener('online', () => this.handleConnectionRestored())
    window.addEventListener('offline', () => this.handleConnectionLost('connection_lost'))

    // Network information changes
    const connection = this.getNetworkInformation()
    if (connection) {
      connection.addEventListener('change', () => this.handleNetworkChange())
    }
  }

  /**
   * Get network information API
   */
  private getNetworkInformation(): any {
    return (navigator as any).connection || 
           (navigator as any).mozConnection || 
           (navigator as any).webkitConnection
  }

  /**
   * Handle connection restored
   */
  private async handleConnectionRestored(): Promise<void> {
    console.log('Network connection restored')
    
    const oldStatus = { ...this.connectionStatus }
    this.connectionStatus.isOnline = true
    this.connectionStatus.lastChanged = new Date()

    // Update connection details
    const connection = this.getNetworkInformation()
    if (connection) {
      this.connectionStatus.effectiveType = connection.effectiveType || 'unknown'
      this.connectionStatus.downlink = connection.downlink || 0
      this.connectionStatus.rtt = connection.rtt || 0
      this.connectionStatus.quality = this.assessConnectionQuality(
        connection.downlink, 
        connection.rtt
      )
    }

    // Notify listeners
    this.notifyListeners()

    // Stop reconnection attempts
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer)
      this.reconnectionTimer = undefined
    }

    // Start recovery process
    await this.startRecoveryProcess()
  }

  /**
   * Handle connection lost
   */
  private handleConnectionLost(reason: NetworkInterruption['reason']): void {
    console.warn('Network connection lost:', reason)
    
    this.connectionStatus.isOnline = false
    this.connectionStatus.lastChanged = new Date()
    this.connectionStatus.quality = 'poor'

    // Record interruption for active sessions
    this.recordNetworkInterruption(reason)

    // Notify listeners
    this.notifyListeners()

    // Start reconnection attempts
    this.startReconnectionAttempts()

    // Activate degraded mode
    gracefulDegradationService.activateDegradedMode?.('network', `Connection lost: ${reason}`)
  }

  /**
   * Handle network information changes
   */
  private handleNetworkChange(): void {
    const connection = this.getNetworkInformation()
    if (!connection) return

    const oldQuality = this.connectionStatus.quality
    const newQuality = this.assessConnectionQuality(connection.downlink, connection.rtt)

    this.connectionStatus.effectiveType = connection.effectiveType || 'unknown'
    this.connectionStatus.downlink = connection.downlink || 0
    this.connectionStatus.rtt = connection.rtt || 0
    this.connectionStatus.quality = newQuality
    this.connectionStatus.lastChanged = new Date()

    // If quality significantly degraded, take action
    if (this.isSignificantQualityChange(oldQuality, newQuality)) {
      console.warn(`Network quality changed: ${oldQuality} → ${newQuality}`)
      
      if (newQuality === 'poor') {
        this.handleConnectionLost('quality_degraded')
      } else if (oldQuality === 'poor' && newQuality !== 'poor') {
        this.handleConnectionRestored()
      }
    }

    this.notifyListeners()
  }

  /**
   * Assess connection quality based on bandwidth and latency
   */
  private assessConnectionQuality(downlink: number, rtt: number): ConnectionStatus['quality'] {
    if (downlink === 0 || rtt === 0) return 'poor'
    
    // Poor: Low bandwidth or high latency
    if (downlink < this.config.bandwidthThresholds.poor || rtt > 1000) {
      return 'poor'
    }
    
    // Fair: Medium bandwidth, acceptable latency
    if (downlink < this.config.bandwidthThresholds.fair || rtt > 500) {
      return 'fair'
    }
    
    // Good: Good bandwidth, low latency
    if (downlink < this.config.bandwidthThresholds.good || rtt > 200) {
      return 'good'
    }
    
    // Excellent: High bandwidth, very low latency
    return 'excellent'
  }

  /**
   * Check if quality change is significant enough to act upon
   */
  private isSignificantQualityChange(
    oldQuality: ConnectionStatus['quality'],
    newQuality: ConnectionStatus['quality']
  ): boolean {
    const qualityLevels = { poor: 0, fair: 1, good: 2, excellent: 3 }
    const oldLevel = qualityLevels[oldQuality]
    const newLevel = qualityLevels[newQuality]
    
    return Math.abs(oldLevel - newLevel) >= 2 // 2+ level change
  }

  /**
   * Start reconnection attempts
   */
  private startReconnectionAttempts(): void {
    if (this.reconnectionTimer || this.connectionStatus.isOnline) return

    let attempts = 0
    
    const attemptReconnection = async () => {
      if (attempts >= this.config.maxReconnectionAttempts) {
        console.error('Maximum reconnection attempts exceeded')
        return
      }

      attempts++
      console.log(`Reconnection attempt ${attempts}/${this.config.maxReconnectionAttempts}`)

      try {
        const isConnected = await this.testConnectivity()
        
        if (isConnected) {
          console.log('Connectivity test successful - connection restored')
          this.handleConnectionRestored()
          return
        }
      } catch (error) {
        console.warn(`Reconnection attempt ${attempts} failed:`, error)
      }

      // Schedule next attempt with exponential backoff
      const delay = this.config.reconnectionInterval * Math.pow(2, attempts - 1)
      this.reconnectionTimer = setTimeout(attemptReconnection, Math.min(delay, 60000))
    }

    // Start first attempt immediately
    attemptReconnection()
  }

  /**
   * Test connectivity with a lightweight request
   */
  private async testConnectivity(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.connectionTimeoutMs)

      const response = await fetch('/expert/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      return false
    }
  }

  /**
   * Start recovery process for interrupted sessions
   */
  private async startRecoveryProcess(): Promise<void> {
    if (this.isRecovering) return

    this.isRecovering = true
    console.log('Starting network recovery process...')

    try {
      // Restore interrupted sessions
      await this.restoreInterruptedSessions()

      // Sync offline data
      await offlineStorageService.syncWithServer()

      // Resume pending operations
      await this.resumePendingOperations()

      console.log('Network recovery process completed')
    } catch (error) {
      console.error('Recovery process failed:', error)
    } finally {
      this.isRecovering = false
    }
  }

  /**
   * Restore interrupted sessions
   */
  private async restoreInterruptedSessions(): Promise<void> {
    for (const [sessionId, session] of this.recoverySessions) {
      if (session.isRecovering) continue

      session.isRecovering = true
      session.recoveryAttempts++

      try {
        console.log(`Restoring session ${sessionId}...`)
        
        // Load session data from offline storage
        const offlineData = await offlineStorageService.loadReportOffline(session.reportId)
        
        if (offlineData) {
          // Notify the application about session restoration
          this.notifySessionRestored(session, offlineData)
        }

        // Mark session as recovered
        session.isRecovering = false
        
        // End network interruption tracking
        const lastInterruption = session.networkInterruptions[session.networkInterruptions.length - 1]
        if (lastInterruption && !lastInterruption.endTime) {
          lastInterruption.endTime = new Date()
          lastInterruption.duration = lastInterruption.endTime.getTime() - lastInterruption.startTime.getTime()
          lastInterruption.recoveryAction = 'session_restored'
        }

      } catch (error) {
        console.error(`Failed to restore session ${sessionId}:`, error)
        session.isRecovering = false
      }
    }
  }

  /**
   * Resume pending operations
   */
  private async resumePendingOperations(): Promise<void> {
    try {
      const pendingOps = await offlineStorageService.getPendingOperations()
      
      for (const operation of pendingOps) {
        try {
          // Use retry service to resume operation
          const result = await retryService.executeWithRetry(
            () => this.resumeOperation(operation),
            {
              maxRetries: 2,
              initialDelay: 1000,
              onRetry: (error, attempt) => {
                console.warn(`Retrying operation ${operation.id} (attempt ${attempt}):`, error)
              }
            },
            'network-recovery'
          )

          if (result.success) {
            await offlineStorageService.markOperationSynced(operation.id)
            console.log(`Successfully resumed operation ${operation.id}`)
          } else {
            console.error(`Failed to resume operation ${operation.id}:`, result.error)
          }
        } catch (error) {
          console.error(`Error resuming operation ${operation.id}:`, error)
        }
      }
    } catch (error) {
      console.error('Failed to resume pending operations:', error)
    }
  }

  /**
   * Resume individual operation
   */
  private async resumeOperation(operation: any): Promise<any> {
    // This would integrate with the specific operation handlers
    console.log(`Resuming operation: ${operation.type}`)
    
    switch (operation.type) {
      case 'edit':
        // Resume edit operation
        return this.resumeEditOperation(operation)
      case 'save':
        // Resume save operation
        return this.resumeSaveOperation(operation)
      case 'voice':
        // Resume voice operation
        return this.resumeVoiceOperation(operation)
      default:
        throw new Error(`Unknown operation type: ${operation.type}`)
    }
  }

  /**
   * Resume edit operation
   */
  private async resumeEditOperation(operation: any): Promise<any> {
    // Placeholder for edit operation resumption
    return { success: true }
  }

  /**
   * Resume save operation
   */
  private async resumeSaveOperation(operation: any): Promise<any> {
    // Placeholder for save operation resumption
    return { success: true }
  }

  /**
   * Resume voice operation
   */
  private async resumeVoiceOperation(operation: any): Promise<any> {
    // Placeholder for voice operation resumption
    return { success: true }
  }

  /**
   * Record network interruption for active sessions
   */
  private recordNetworkInterruption(reason: NetworkInterruption['reason']): void {
    for (const [sessionId, session] of this.recoverySessions) {
      const interruption: NetworkInterruption = {
        startTime: new Date(),
        reason,
        impactedOperations: [],
        recoveryAction: 'pending'
      }

      session.networkInterruptions.push(interruption)
    }
  }

  /**
   * Start quality monitoring
   */
  private startQualityMonitoring(): void {
    this.qualityCheckTimer = setInterval(() => {
      if (this.connectionStatus.isOnline) {
        this.performQualityCheck()
      }
    }, this.config.qualityCheckInterval)
  }

  /**
   * Perform periodic quality check
   */
  private async performQualityCheck(): Promise<void> {
    try {
      const startTime = Date.now()
      await this.testConnectivity()
      const rtt = Date.now() - startTime

      // Update RTT if significantly different
      if (Math.abs(this.connectionStatus.rtt - rtt) > 100) {
        this.connectionStatus.rtt = rtt
        this.connectionStatus.quality = this.assessConnectionQuality(
          this.connectionStatus.downlink,
          rtt
        )
        this.connectionStatus.lastChanged = new Date()
        this.notifyListeners()
      }
    } catch (error) {
      // Quality check failed - might indicate connection issues
      if (this.connectionStatus.isOnline) {
        this.handleConnectionLost('quality_degraded')
      }
    }
  }

  /**
   * Register session for recovery tracking
   */
  public registerSession(sessionId: string, reportId: string): void {
    this.recoverySessions.set(sessionId, {
      sessionId,
      reportId,
      lastActivity: new Date(),
      networkInterruptions: [],
      isRecovering: false,
      recoveryAttempts: 0
    })

    console.log(`Registered session ${sessionId} for network recovery`)
  }

  /**
   * Unregister session from recovery tracking
   */
  public unregisterSession(sessionId: string): void {
    this.recoverySessions.delete(sessionId)
    console.log(`Unregistered session ${sessionId} from network recovery`)
  }

  /**
   * Add connection status listener
   */
  public addConnectionListener(listener: (status: ConnectionStatus) => void): void {
    this.listeners.push(listener)
  }

  /**
   * Remove connection status listener
   */
  public removeConnectionListener(listener: (status: ConnectionStatus) => void): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.connectionStatus)
      } catch (error) {
        console.error('Error in connection listener:', error)
      }
    })
  }

  /**
   * Notify about session restoration
   */
  private notifySessionRestored(session: RecoverySession, data: any): void {
    const event = new CustomEvent('session-restored', {
      detail: { session, data }
    })
    window.dispatchEvent(event)
  }

  /**
   * Get current connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus }
  }

  /**
   * Get recovery session info
   */
  public getRecoverySession(sessionId: string): RecoverySession | null {
    return this.recoverySessions.get(sessionId) || null
  }

  /**
   * Get all recovery sessions
   */
  public getAllRecoverySessions(): RecoverySession[] {
    return Array.from(this.recoverySessions.values())
  }

  /**
   * Force connectivity test
   */
  public async testConnection(): Promise<boolean> {
    return this.testConnectivity()
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer)
    }
    
    if (this.qualityCheckTimer) {
      clearInterval(this.qualityCheckTimer)
    }

    window.removeEventListener('online', () => this.handleConnectionRestored())
    window.removeEventListener('offline', () => this.handleConnectionLost('connection_lost'))

    const connection = this.getNetworkInformation()
    if (connection) {
      connection.removeEventListener('change', () => this.handleNetworkChange())
    }
  }
}

// Singleton instance
export const networkRecoveryService = new NetworkRecoveryService()

// Medical-specific recovery strategies
export const MedicalRecoveryStrategies = {
  CRITICAL_SESSION: {
    maxRetries: 10,
    retryInterval: 5000,
    priorityLevel: 'critical',
    description: 'For active medical consultations'
  },
  
  DOCUMENTATION_SESSION: {
    maxRetries: 5,
    retryInterval: 10000,
    priorityLevel: 'high',
    description: 'For medical documentation work'
  },
  
  BACKGROUND_SYNC: {
    maxRetries: 3,
    retryInterval: 30000,
    priorityLevel: 'normal',
    description: 'For background data synchronization'
  }
}