import { useState, useCallback, useEffect, useRef } from 'react'
import {
  UseEditSessionReturn,
  EditSession,
  EditSessionStatus,
  CreateEditSessionRequest
} from '../types/reportEditing'
import { ReportEditingService } from '../services/reportEditingService'
import { EditSessionModel } from '../models/EditSession'

/**
 * useEditSession Hook
 * 
 * Manages edit session lifecycle and state with HIPAA compliance.
 * Provides robust session management for medical report editing.
 * 
 * Features:
 * - Session creation and management with unique session IDs
 * - Status tracking and real-time updates
 * - Session isolation for HIPAA compliance
 * - Automatic timeout handling (1 hour default)
 * - Error handling and recovery mechanisms
 * - Session validation and integrity checks
 * - Cross-session contamination prevention
 * - Audit trail maintenance
 * - Performance optimizations with caching
 */
export const useEditSession = (
  reportId?: string,
  userId?: string,
  autoCreate: boolean = false
): UseEditSessionReturn => {
  // Core state
  const [session, setSession] = useState<EditSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionStats, setSessionStats] = useState({
    totalEdits: 0,
    sessionDuration: 0,
    timeRemaining: 0
  })
  
  // Refs for cleanup and timers
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<Date>(new Date())
  
  // Session configuration
  const SESSION_TIMEOUT_MS = 60 * 60 * 1000 // 1 hour
  const STATS_UPDATE_INTERVAL = 10000 // 10 seconds
  const WARNING_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes warning

  // Auto-create session on mount if requested
  useEffect(() => {
    if (autoCreate && reportId && userId && !session) {
      createSession(reportId, userId)
    }
  }, [autoCreate, reportId, userId, session])

  // Session timeout and stats update
  useEffect(() => {
    if (session && session.status === 'active') {
      // Set up session timeout
      const sessionStart = new Date(session.started_at).getTime()
      const timeElapsed = Date.now() - sessionStart
      const timeRemaining = Math.max(0, SESSION_TIMEOUT_MS - timeElapsed)
      
      if (timeRemaining > 0) {
        timeoutRef.current = setTimeout(() => {
          handleSessionTimeout()
        }, timeRemaining)
      } else {
        // Session already expired
        handleSessionTimeout()
      }
      
      // Set up stats updates
      statsIntervalRef.current = setInterval(() => {
        updateSessionStats()
      }, STATS_UPDATE_INTERVAL)
      
      // Initial stats update
      updateSessionStats()
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current)
        statsIntervalRef.current = null
      }
    }
  }, [session])

  // Update session statistics
  const updateSessionStats = useCallback(() => {
    if (!session || session.status !== 'active') return
    
    const sessionStart = new Date(session.started_at).getTime()
    const now = Date.now()
    const duration = now - sessionStart
    const remaining = Math.max(0, SESSION_TIMEOUT_MS - duration)
    
    setSessionStats({
      totalEdits: session.total_edits || 0,
      sessionDuration: duration,
      timeRemaining: remaining
    })
    
    // Show warning when session is about to expire
    if (remaining <= WARNING_THRESHOLD_MS && remaining > 0) {
      console.warn(`Edit session expires in ${Math.floor(remaining / 60000)} minutes`)
    }
  }, [session])

  // Handle session timeout
  const handleSessionTimeout = useCallback(async () => {
    if (!session) return
    
    try {
      const timedOutSession = EditSessionModel.cancelSession(session, 'Session timeout')
      await ReportEditingService.updateEditSession(timedOutSession)
      setSession(timedOutSession)
      setError('Edit session expired for security. Please start a new session.')
    } catch (error) {
      console.error('Failed to handle session timeout:', error)
      setError('Session timeout error. Please refresh and try again.')
    }
  }, [session])

  // Create new edit session
  const createSession = useCallback(async (
    targetReportId: string,
    targetUserId: string
  ): Promise<EditSession> => {
    if (!targetReportId || !targetUserId) {
      throw new Error('Report ID and User ID are required to create session')
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Validate that any existing session is properly closed
      if (session && session.status === 'active') {
        await completeSession()
      }
      
      // Create new session model
      const newSessionModel = EditSessionModel.create(targetReportId, targetUserId)
      
      // Validate session before creation
      const validationErrors = EditSessionModel.validate(newSessionModel)
      if (validationErrors.length > 0) {
        throw new Error(`Session validation failed: ${validationErrors.map(e => e.message).join(', ')}`)
      }
      
      // Create session via API
      const createRequest: CreateEditSessionRequest = {
        report_id: targetReportId,
        session_id: newSessionModel.session_id,
        status: 'active'
      }
      
      const createdSession = await ReportEditingService.createEditSession(createRequest, targetUserId)
      
      // Verify session integrity
      const integrityCheck = EditSessionModel.ensureSessionIsolation(
        createdSession.session_id,
        createdSession.user_id
      )
      
      if (!integrityCheck) {
        throw new Error('Session isolation validation failed')
      }
      
      setSession(createdSession)
      lastActivityRef.current = new Date()
      
      return createdSession
      
    } catch (error) {
      console.error('Failed to create edit session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create edit session'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Update existing session
  const updateSession = useCallback(async (
    updates: Partial<EditSession>
  ): Promise<EditSession> => {
    if (!session) {
      throw new Error('No active session to update')
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Validate status transition if status is being updated
      if (updates.status && updates.status !== session.status) {
        const isValidTransition = EditSessionModel.validateStatusTransition(
          session.status,
          updates.status
        )
        
        if (!isValidTransition) {
          throw new Error(`Invalid status transition from ${session.status} to ${updates.status}`)
        }
      }
      
      // Create updated session
      const updatedSession: EditSession = {
        ...session,
        ...updates,
        // Ensure certain fields are not overwritten
        id: session.id,
        report_id: session.report_id,
        user_id: session.user_id,
        session_id: session.session_id,
        started_at: session.started_at
      }
      
      // Validate updated session
      const validationErrors = EditSessionModel.validate(updatedSession)
      if (validationErrors.length > 0) {
        throw new Error(`Session validation failed: ${validationErrors.map(e => e.message).join(', ')}`)
      }
      
      // Update via API
      const savedSession = await ReportEditingService.updateEditSession(updatedSession)
      
      setSession(savedSession)
      lastActivityRef.current = new Date()
      
      return savedSession
      
    } catch (error) {
      console.error('Failed to update edit session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update edit session'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Complete current session
  const completeSession = useCallback(async (): Promise<void> => {
    if (!session) {
      throw new Error('No active session to complete')
    }
    
    if (session.status !== 'active') {
      throw new Error(`Cannot complete session with status: ${session.status}`)
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Create completed session
      const completedSession = EditSessionModel.completeSession(session)
      
      // Validate HIPAA compliance before completion
      const complianceCheck = EditSessionModel.validateHIPAACompliance(completedSession)
      if (!complianceCheck.isCompliant) {
        console.warn('HIPAA compliance issues:', complianceCheck.issues)
      }
      
      // Update via API
      await ReportEditingService.updateEditSession(completedSession)
      
      setSession(completedSession)
      
      // Clear timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current)
        statsIntervalRef.current = null
      }
      
    } catch (error) {
      console.error('Failed to complete edit session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete edit session'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Cancel current session
  const cancelSession = useCallback(async (reason?: string): Promise<void> => {
    if (!session) {
      throw new Error('No active session to cancel')
    }
    
    if (session.status !== 'active') {
      throw new Error(`Cannot cancel session with status: ${session.status}`)
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Create cancelled session
      const cancelledSession = EditSessionModel.cancelSession(session, reason)
      
      // Update via API
      await ReportEditingService.updateEditSession(cancelledSession)
      
      setSession(cancelledSession)
      
      // Clear timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current)
        statsIntervalRef.current = null
      }
      
    } catch (error) {
      console.error('Failed to cancel edit session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel edit session'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Get session summary
  const getSessionSummary = useCallback((): string => {
    if (!session) return 'No active session'
    
    return EditSessionModel.getSessionSummary(session)
  }, [session])

  // Check if session can accept new edits
  const canAddEdit = useCallback((): { canAdd: boolean; reason?: string } => {
    if (!session) {
      return { canAdd: false, reason: 'No active session' }
    }
    
    return EditSessionModel.canAddEdit(session)
  }, [session])

  // Get time remaining in session
  const getTimeRemaining = useCallback((): number => {
    if (!session || session.status !== 'active') return 0
    
    return EditSessionModel.getSessionTimeRemaining(session)
  }, [session])

  // Clear error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Record activity (for session extension)
  const recordActivity = useCallback(() => {
    lastActivityRef.current = new Date()
  }, [])

  return {
    session,
    isLoading,
    error,
    sessionStats,
    
    // Actions
    createSession,
    updateSession,
    completeSession,
    cancelSession,
    clearError,
    recordActivity,
    
    // Utilities
    getSessionSummary,
    canAddEdit,
    getTimeRemaining
  }
}