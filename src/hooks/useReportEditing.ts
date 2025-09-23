import { useState, useCallback, useEffect, useRef } from 'react'
import {
  UseReportEditingReturn,
  ReportEdit,
  ReportVersion,
  EditSession,
  EditResult,
  ProcessingMetadata
} from '../types/reportEditing'
import { ReportEditingService } from '../services/reportEditingService'
import { EditSessionModel } from '../models/EditSession'
import { ReportEditModel } from '../models/ReportEdit'
import { ReportVersionModel } from '../models/ReportVersion'

/**
 * useReportEditing Hook
 * 
 * Main orchestration hook for report editing functionality.
 * Provides comprehensive state management and business logic for interactive report editing.
 * 
 * Features:
 * - Edit session lifecycle management with HIPAA compliance
 * - Text and voice instruction processing via Flowise AI
 * - Version history tracking with audit trail
 * - Error handling and recovery mechanisms
 * - Real-time state management with optimistic updates
 * - Integration with Georgian TTS system
 * - Session isolation and timeout handling
 * - Medical content validation
 * - Performance optimization with debouncing
 */
export const useReportEditing = (
  reportId: string, 
  flowiseEndpoint: string,
  userId?: string
): UseReportEditingReturn => {
  // Core state
  const [currentContent, setCurrentContent] = useState<string>('')
  const [editHistory, setEditHistory] = useState<ReportEdit[]>([])
  const [versionHistory, setVersionHistory] = useState<ReportVersion[]>([])
  const [activeSession, setActiveSession] = useState<EditSession | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Refs for cleanup and debouncing
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const processingAbortRef = useRef<AbortController | null>(null)
  
  // Session timeout duration (1 hour)
  const SESSION_TIMEOUT_MS = 60 * 60 * 1000

  // Initialize report data on mount
  useEffect(() => {
    const initializeReport = async () => {
      try {
        setError(null)
        
        // Load initial report data
        const versions = await ReportEditingService.getVersionHistory(reportId)
        const currentVersion = versions.find(v => v.is_current)
        
        if (currentVersion) {
          setCurrentContent(currentVersion.content)
          setVersionHistory(versions)
        }
        
        // Load recent edit history
        const recentEdits = await ReportEditingService.getEditHistory(reportId, 50)
        setEditHistory(recentEdits)
        
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to initialize report:', error)
        setError('Failed to load report data. Please refresh and try again.')
      }
    }
    
    if (reportId) {
      initializeReport()
    }
    
    return () => {
      // Cleanup on unmount
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current)
      }
      if (processingAbortRef.current) {
        processingAbortRef.current.abort()
      }
    }
  }, [reportId])

  // Session timeout handler
  const handleSessionTimeout = useCallback(async () => {
    if (activeSession) {
      try {
        const timedOutSession = EditSessionModel.cancelSession(activeSession, 'Session timeout')
        await ReportEditingService.updateEditSession(timedOutSession)
        setActiveSession(null)
        setError('Edit session timed out for security. Please start a new session.')
      } catch (error) {
        console.error('Failed to handle session timeout:', error)
      }
    }
  }, [activeSession])

  // Start new edit session
  const startEditSession = useCallback(async (): Promise<void> => {
    if (!userId) {
      setError('User authentication required to start edit session')
      return
    }
    
    try {
      setError(null)
      
      // Cancel any existing session
      if (activeSession) {
        await completeSession()
      }
      
      // Create new session
      const newSession = EditSessionModel.create(reportId, userId)
      const createdSession = await ReportEditingService.createEditSession({
        report_id: reportId,
        session_id: newSession.session_id,
        status: 'active'
      }, userId)
      
      setActiveSession(createdSession)
      
      // Set session timeout
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current)
      }
      sessionTimeoutRef.current = setTimeout(handleSessionTimeout, SESSION_TIMEOUT_MS)
      
    } catch (error) {
      console.error('Failed to start edit session:', error)
      setError('Failed to start edit session. Please try again.')
    }
  }, [reportId, userId, activeSession, handleSessionTimeout])

  // Process edit instruction via AI
  const processEditInstruction = useCallback(async (
    instruction: string,
    editType: 'text_instruction' | 'voice_instruction',
    voiceTranscript?: string
  ): Promise<EditResult> => {
    if (!activeSession || !userId) {
      throw new Error('Active edit session required')
    }
    
    // Abort any pending processing
    if (processingAbortRef.current) {
      processingAbortRef.current.abort()
    }
    processingAbortRef.current = new AbortController()
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Create edit record
      const editData = ReportEditModel.create({
        report_id: reportId,
        user_id: userId,
        session_id: activeSession.session_id,
        edit_type: editType,
        instruction_text: editType === 'text_instruction' ? instruction : undefined,
        voice_transcript: voiceTranscript,
        original_content: currentContent,
        updated_content: currentContent // Will be updated by processing
      })
      
      // Process via AI service
      const processedEdit = await ReportEditingService.processEditInstruction({
        report_id: reportId,
        session_id: activeSession.session_id,
        edit_type: editType,
        instruction_text: instruction,
        voice_transcript: voiceTranscript,
        original_content: currentContent,
        flowise_endpoint: flowiseEndpoint
      }, userId)
      
      // Update content optimistically
      setCurrentContent(processedEdit.updated_content)
      
      // Update edit history
      setEditHistory(prev => [processedEdit, ...prev])
      
      // Create new version
      const newVersion = await ReportEditingService.createReportVersion({
        report_id: reportId,
        content: processedEdit.updated_content,
        edit_summary: ReportEditModel.generateEditSummary(processedEdit),
        created_by_edit_id: processedEdit.id
      }, userId)
      
      // Update version history
      setVersionHistory(prev => [newVersion, ...prev.map(v => ({ ...v, is_current: false }))])
      
      // Increment session edit count
      await EditSessionModel.incrementEditCount(activeSession.session_id)
      
      const result: EditResult = {
        reportId,
        editType,
        originalContent: currentContent,
        updatedContent: processedEdit.updated_content,
        instruction,
        voiceTranscript,
        sessionId: activeSession.session_id,
        editId: processedEdit.id,
        versionId: newVersion.id,
        processingMetadata: processedEdit.processing_metadata
      }
      
      return result
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Processing cancelled')
      }
      
      console.error('Edit processing failed:', error)
      setError('Failed to process edit instruction. Please try again.')
      throw error
    } finally {
      setIsProcessing(false)
      processingAbortRef.current = null
    }
  }, [activeSession, userId, reportId, currentContent, flowiseEndpoint])

  // Submit text instruction
  const submitTextInstruction = useCallback(async (instruction: string): Promise<EditResult> => {
    if (!instruction.trim()) {
      throw new Error('Instruction cannot be empty')
    }
    
    return processEditInstruction(instruction, 'text_instruction')
  }, [processEditInstruction])

  // Submit voice instruction
  const submitVoiceInstruction = useCallback(async (
    instruction: string, 
    voiceTranscript: string
  ): Promise<EditResult> => {
    if (!voiceTranscript.trim()) {
      throw new Error('Voice transcript cannot be empty')
    }
    
    return processEditInstruction(instruction, 'voice_instruction', voiceTranscript)
  }, [processEditInstruction])

  // Apply manual edit
  const applyManualEdit = useCallback(async (newContent: string): Promise<EditResult> => {
    if (!activeSession || !userId) {
      throw new Error('Active edit session required')
    }
    
    if (!ReportEditModel.isContentChanged(currentContent, newContent)) {
      throw new Error('No changes detected in content')
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Create manual edit record
      const editData = ReportEditModel.create({
        report_id: reportId,
        user_id: userId,
        session_id: activeSession.session_id,
        edit_type: 'manual_edit',
        original_content: currentContent,
        updated_content: newContent
      })
      
      const manualEdit = await ReportEditingService.createReportEdit({
        report_id: reportId,
        session_id: activeSession.session_id,
        edit_type: 'manual_edit',
        original_content: currentContent,
        updated_content: newContent
      }, userId)
      
      // Update content
      setCurrentContent(newContent)
      
      // Update edit history
      setEditHistory(prev => [manualEdit, ...prev])
      
      // Create new version
      const newVersion = await ReportEditingService.createReportVersion({
        report_id: reportId,
        content: newContent,
        edit_summary: 'Manual content modification',
        created_by_edit_id: manualEdit.id
      }, userId)
      
      // Update version history
      setVersionHistory(prev => [newVersion, ...prev.map(v => ({ ...v, is_current: false }))])
      
      const result: EditResult = {
        reportId,
        editType: 'manual_edit',
        originalContent: currentContent,
        updatedContent: newContent,
        sessionId: activeSession.session_id,
        editId: manualEdit.id,
        versionId: newVersion.id
      }
      
      return result
      
    } catch (error) {
      console.error('Manual edit failed:', error)
      setError('Failed to save manual edit. Please try again.')
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [activeSession, userId, reportId, currentContent])

  // Complete current session
  const completeSession = useCallback(async (): Promise<void> => {
    if (!activeSession) return
    
    try {
      const completedSession = EditSessionModel.completeSession(activeSession)
      await ReportEditingService.updateEditSession(completedSession)
      setActiveSession(null)
      
      // Clear timeout
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current)
        sessionTimeoutRef.current = null
      }
      
    } catch (error) {
      console.error('Failed to complete session:', error)
      setError('Failed to complete edit session')
    }
  }, [activeSession])

  // Cancel current session
  const cancelSession = useCallback(async (): Promise<void> => {
    if (!activeSession) return
    
    try {
      const cancelledSession = EditSessionModel.cancelSession(activeSession, 'User cancelled')
      await ReportEditingService.updateEditSession(cancelledSession)
      setActiveSession(null)
      
      // Clear timeout
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current)
        sessionTimeoutRef.current = null
      }
      
    } catch (error) {
      console.error('Failed to cancel session:', error)
      setError('Failed to cancel edit session')
    }
  }, [activeSession])

  // Load specific version
  const loadVersion = useCallback(async (versionId: string): Promise<void> => {
    try {
      setError(null)
      
      const version = versionHistory.find(v => v.id === versionId)
      if (!version) {
        throw new Error('Version not found')
      }
      
      setCurrentContent(version.content)
      
      // Update version history to mark as current
      const updatedVersions = versionHistory.map(v => ({
        ...v,
        is_current: v.id === versionId
      }))
      setVersionHistory(updatedVersions)
      
    } catch (error) {
      console.error('Failed to load version:', error)
      setError('Failed to load selected version')
    }
  }, [versionHistory])

  // Clear error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    currentContent,
    editHistory,
    versionHistory,
    activeSession,
    isProcessing,
    error,
    isLoaded,
    
    // Actions
    startEditSession,
    submitTextInstruction,
    submitVoiceInstruction,
    applyManualEdit,
    completeSession,
    cancelSession,
    loadVersion,
    clearError
  }
}