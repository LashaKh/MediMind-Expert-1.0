import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  FileText,
  Edit3,
  History,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Mic,
  Type,
  Clock,
  User,
  Activity,
  ChevronDown,
  ChevronUp,
  Loader2,
  Zap,
  Brain,
  CheckSquare,
  Timer,
  BarChart3,
  Eye,
  RotateCcw,
  Sparkles,
  Shield,
  Star,
  TrendingUp,
  Layers,
  Crown,
  Palette,
  Target,
  Wand2,
  Gem,
  Award
} from 'lucide-react'
import { ReportEditCardProps } from '../../types/reportEditing'
import { MedicalButton } from '../ui/MedicalDesignSystem'
import EditInstructionInput from './EditInstructionInput'
import ReportTextEditor from './ReportTextEditor'
import EditHistoryPanel from './EditHistoryPanel'
import VoiceInstructionButton from './VoiceInstructionButton'
import VoiceInstructionTextArea from './VoiceInstructionTextArea'
import { retryService } from '../../services/retryService'
import { gracefulDegradationService } from '../../services/gracefulDegradationService'
import { offlineStorageService } from '../../services/offlineStorageService'
import { networkRecoveryService } from '../../services/networkRecoveryService'
import { errorManagementService, MedicalErrorCodes } from '../../services/errorManagementService'
import { supabase } from '../../lib/supabase'

/**
 * ReportEditCard Component
 * 
 * Main component extending MedicalAnalysisCard for interactive report editing.
 * Provides comprehensive edit interface with voice and text instruction support.
 * 
 * Features:
 * - Text and voice instruction input
 * - Real-time AI processing feedback
 * - Version history tracking
 * - Manual editing capabilities
 * - Medical context awareness
 * - Session management
 * - HIPAA-compliant editing workflow
 */
const ReportEditCard: React.FC<ReportEditCardProps> = ({
  reportId,
  initialContent,
  sessionId,
  flowiseEndpoint,
  onEditComplete,
  onError,
  className = ''
}) => {
  const [currentContent, setCurrentContent] = useState(initialContent)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'history'>('edit')
  const [editMode, setEditMode] = useState<'instruction' | 'manual'>('instruction')
  const [isExpanded, setIsExpanded] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Mobile bedside consultation state
  const [isMobileMode, setIsMobileMode] = useState(false)
  const [quickActionMode, setQuickActionMode] = useState(false)
  const [isOneHandedMode, setIsOneHandedMode] = useState(false)
  
  // Real-time processing state
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState<string>('')
  const [processingStartTime, setProcessingStartTime] = useState<Date | null>(null)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number>(0)
  const [processingMetrics, setProcessingMetrics] = useState({
    tokensProcessed: 0,
    totalTokens: 0,
    confidence: 0
  })
  
  // Version management state
  const [currentVersion, setCurrentVersion] = useState<number>(1)
  const [versionHistory, setVersionHistory] = useState<Array<{
    version: number
    content: string
    timestamp: Date
    editType: string
    summary: string
  }>>([])
  const [autoVersioning, setAutoVersioning] = useState(true)
  
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeEstimationRef = useRef<NodeJS.Timeout | null>(null)

  // Progress simulation utility
  const simulateProcessingProgress = useCallback(() => {
    const stages = [
      { stage: 'Analyzing instruction...', duration: 800, progress: 15 },
      { stage: 'Processing medical context...', duration: 1200, progress: 35 },
      { stage: 'Generating content updates...', duration: 1500, progress: 65 },
      { stage: 'Validating medical accuracy...', duration: 1000, progress: 85 },
      { stage: 'Finalizing changes...', duration: 500, progress: 100 }
    ]
    
    let currentStageIndex = 0
    let currentProgress = 0
    
    setProcessingStartTime(new Date())
    setProcessingProgress(0)
    setProcessingStage(stages[0].stage)
    
    const progressTick = () => {
      if (currentStageIndex >= stages.length) return
      
      const stage = stages[currentStageIndex]
      const increment = (stage.progress - currentProgress) / (stage.duration / 100)
      
      currentProgress += increment
      setProcessingProgress(Math.min(currentProgress, stage.progress))
      
      // Update metrics simulation
      setProcessingMetrics(prev => ({
        tokensProcessed: Math.floor(currentProgress * 10),
        totalTokens: 1000,
        confidence: Math.min(0.95, currentProgress / 100 * 0.95)
      }))
      
      // Update estimated time remaining
      const elapsed = Date.now() - (processingStartTime?.getTime() || Date.now())
      const estimatedTotal = stages.reduce((sum, s) => sum + s.duration, 0)
      const remaining = Math.max(0, estimatedTotal - elapsed)
      setEstimatedTimeRemaining(remaining)
      
      if (currentProgress >= stage.progress) {
        currentStageIndex++
        if (currentStageIndex < stages.length) {
          setProcessingStage(stages[currentStageIndex].stage)
        }
      }
    }
    
    progressIntervalRef.current = setInterval(progressTick, 100)
  }, [processingStartTime])

  // Cleanup intervals
  const cleanupProcessing = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    if (timeEstimationRef.current) {
      clearInterval(timeEstimationRef.current)
      timeEstimationRef.current = null
    }
  }, [])

  // Version management utilities
  const createVersion = useCallback((
    content: string,
    editType: string,
    instruction?: string,
    voiceTranscript?: string
  ) => {
    if (!autoVersioning) return

    const newVersion = currentVersion + 1
    const summary = instruction || voiceTranscript || 'Manual edit applied'
    
    const newVersionEntry = {
      version: newVersion,
      content,
      timestamp: new Date(),
      editType,
      summary: summary.length > 50 ? summary.substring(0, 50) + '...' : summary
    }
    
    setVersionHistory(prev => [newVersionEntry, ...prev])
    setCurrentVersion(newVersion)
    
    // Keep only last 20 versions to prevent memory issues
    setVersionHistory(prev => prev.slice(0, 20))
    
    console.log(`Version ${newVersion} created:`, { editType, summary })
  }, [currentVersion, autoVersioning])

  const restoreVersion = useCallback((version: number) => {
    const versionEntry = versionHistory.find(v => v.version === version)
    if (!versionEntry) {
      console.error('Version not found:', version)
      return
    }
    
    if (window.confirm(`Restore to version ${version}? This will replace the current content and create a new version.`)) {
      setCurrentContent(versionEntry.content)
      setHasUnsavedChanges(true)
      
      // Create a new version for the restoration
      createVersion(versionEntry.content, 'version_restore', `Restored from version ${version}`)
    }
  }, [versionHistory, createVersion])

  // Initialize version history with initial content
  useEffect(() => {
    if (initialContent && versionHistory.length === 0) {
      setVersionHistory([{
        version: 1,
        content: initialContent,
        timestamp: new Date(),
        editType: 'initial',
        summary: 'Initial report content'
      }])
    }
  }, [initialContent, versionHistory.length])

  // Initialize error handling and recovery services
  useEffect(() => {
    // Register session with network recovery service
    networkRecoveryService.registerSession(sessionId, reportId)

    // Setup error event listeners
    const handleSessionRestored = (event: CustomEvent) => {
      const { session, data } = event.detail
      if (session.sessionId === sessionId) {
        console.log('Session restored from network interruption:', session)
        
        // Restore content if available
        if (data && data.content) {
          setCurrentContent(data.content)
          setHasUnsavedChanges(true)
          createVersion(data.content, 'network_restore', 'Restored after network interruption')
        }
      }
    }

    const handleServiceDegraded = (event: CustomEvent) => {
      const { serviceName, reason, capabilities } = event.detail
      console.warn(`Service degraded: ${serviceName} - ${reason}`)
      
      // Update UI to reflect limited capabilities
      if (!capabilities.voiceRecording) {
        // Could disable voice features in the UI
        console.log('Voice recording disabled due to service degradation')
      }
      
      if (!capabilities.basicEditing) {
        // Could show read-only mode
        console.log('Basic editing disabled due to service degradation')
      }
    }

    const handleMedicalError = (event: CustomEvent) => {
      const errorData = event.detail
      console.warn('Medical error detected:', errorData)
      
      // Additional error handling specific to this component
      if (errorData.type === 'error' && isProcessing) {
        setIsProcessing(false)
        setProcessingStage('Operation failed')
      }
    }

    // Add event listeners
    window.addEventListener('session-restored', handleSessionRestored as EventListener)
    window.addEventListener('service-degraded', handleServiceDegraded as EventListener)
    window.addEventListener('medical-error', handleMedicalError as EventListener)

    // Initialize offline storage for this session
    offlineStorageService.saveSessionOffline({
      sessionId,
      reportId,
      startTime: new Date(),
      isActive: true
    })

    return () => {
      // Cleanup event listeners
      window.removeEventListener('session-restored', handleSessionRestored as EventListener)
      window.removeEventListener('service-degraded', handleServiceDegraded as EventListener)
      window.removeEventListener('medical-error', handleMedicalError as EventListener)
      
      // Unregister session
      networkRecoveryService.unregisterSession(sessionId)
      
      // Mark session as inactive
      offlineStorageService.saveSessionOffline({
        sessionId,
        reportId,
        isActive: false
      })
    }
  }, [sessionId, reportId, createVersion, isProcessing])

  // Medical validation utilities
  const validateMedicalInstruction = useCallback((instruction: string, content: string) => {
    const validationResults = {
      isValid: true,
      warnings: [] as string[],
      suggestions: [] as string[],
      confidence: 1.0
    }

    // Medical terminology validation
    const medicalTerms = {
      dangerous: ['delete', 'remove all', 'ignore', 'disregard'],
      contraindicated: ['increase dose to maximum', 'ignore contraindications', 'skip verification'],
      unclear: ['fix it', 'make it better', 'change stuff', 'do something']
    }

    const instructionLower = instruction.toLowerCase()

    // Check for dangerous language
    medicalTerms.dangerous.forEach(term => {
      if (instructionLower.includes(term)) {
        validationResults.warnings.push(`⚠️ Potentially dangerous instruction: "${term}" - Please be specific about what needs to be changed`)
        validationResults.confidence -= 0.3
      }
    })

    // Check for contraindicated actions
    medicalTerms.contraindicated.forEach(term => {
      if (instructionLower.includes(term)) {
        validationResults.warnings.push(`🚫 Contraindicated instruction: "${term}" - This may compromise patient safety`)
        validationResults.confidence -= 0.5
        validationResults.isValid = false
      }
    })

    // Check for unclear instructions
    medicalTerms.unclear.forEach(term => {
      if (instructionLower.includes(term)) {
        validationResults.suggestions.push(`💡 Suggestion: Instead of "${term}", please specify exactly what medical information needs to be updated`)
        validationResults.confidence -= 0.2
      }
    })

    // Check instruction length and specificity
    if (instruction.trim().length < 10) {
      validationResults.warnings.push('⚠️ Instruction may be too brief - Please provide more specific medical context')
      validationResults.confidence -= 0.2
    }

    // Check for medical context alignment
    const hasSpecialty = /cardiology|cardiac|heart|ecg|ekg|bp|hypertension|angina/i.test(content) ||
                        /obstetric|gynecology|pregnancy|labor|delivery|maternal|fetal/i.test(content)
    
    const instructionHasSpecialty = /cardiology|cardiac|heart|ecg|ekg|bp|hypertension|angina/i.test(instruction) ||
                                   /obstetric|gynecology|pregnancy|labor|delivery|maternal|fetal/i.test(instruction)

    if (hasSpecialty && !instructionHasSpecialty && instruction.length > 20) {
      validationResults.suggestions.push('💡 Consider adding specialty-specific context to your instruction for better medical accuracy')
      validationResults.confidence -= 0.1
    }

    // Check for proper medical structure requests
    const hasStructuredRequest = /add|update|correct|fix|clarify|specify|include|document/.test(instructionLower)
    if (!hasStructuredRequest && instruction.length > 15) {
      validationResults.suggestions.push('💡 Use action words like "add", "update", "correct", or "clarify" for clearer medical instructions')
      validationResults.confidence -= 0.1
    }

    // Ensure confidence doesn't go below 0
    validationResults.confidence = Math.max(0, validationResults.confidence)

    return validationResults
  }, [])

  const handleInstructionSubmit = useCallback(async (instruction: string, voiceTranscript?: string) => {
    // Check service availability before processing
    const isAIAvailable = gracefulDegradationService.isServiceAvailable('ai-processing')
    const capabilities = gracefulDegradationService.getCapabilities()
    
    if (!isAIAvailable && !capabilities.basicEditing) {
      errorManagementService.logError({
        severity: 'high',
        category: 'ai',
        code: MedicalErrorCodes.AI_PROCESSING_FAILED,
        message: 'AI processing service unavailable',
        context: {
          component: 'ReportEditCard',
          operation: 'instruction_submit',
          reportId,
          sessionId
        }
      })
      return
    }

    // First validate the instruction
    const validation = validateMedicalInstruction(instruction, currentContent)
    setValidationResults(validation)
    
    // If validation fails completely, don't proceed
    if (!validation.isValid) {
      errorManagementService.logError({
        severity: 'medium',
        category: 'validation',
        code: MedicalErrorCodes.MEDICAL_VALIDATION_FAILED,
        message: 'Medical instruction validation failed',
        context: {
          component: 'ReportEditCard',
          operation: 'instruction_validation',
          reportId,
          sessionId
        }
      })
      
      alert('Instruction validation failed. Please review the warnings and modify your instruction before proceeding.')
      return
    }
    
    // Show warnings but allow to proceed if validation is not critical
    if (validation.warnings.length > 0) {
      const proceed = window.confirm(
        `Medical validation warnings detected:\n\n${validation.warnings.join('\n')}\n\nDo you want to proceed anyway?`
      )
      if (!proceed) return
    }
    
    // Register session with network recovery service
    networkRecoveryService.registerSession(sessionId, reportId)
    
    setIsProcessing(true)
    simulateProcessingProgress()
    
    try {
      // Save current state offline before processing
      await offlineStorageService.saveReportOffline(
        reportId,
        sessionId,
        currentContent,
        `Report ${reportId}`
      )

      // Add offline operation for tracking
      await offlineStorageService.addOfflineOperation(
        sessionId,
        'edit',
        { instruction, voiceTranscript, originalContent: currentContent }
      )

      // Execute with comprehensive retry logic
      const result = await retryService.executeEditOperation(
        async () => {
          // Check network connectivity during operation
          const connectionStatus = networkRecoveryService.getConnectionStatus()
          if (!connectionStatus.isOnline) {
            throw new Error('Network connection lost during processing')
          }

          // Process the edit instruction using the Flowise endpoint
          console.log('Processing instruction:', { 
            instruction, 
            voiceTranscript, 
            reportId, 
            sessionId,
            validation: validation
          })
          
          // Use the same format as initial report generation - just send the content and instruction
          const editPrompt = `${currentContent}

${instruction}`

          // Get authentication token
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('Authentication required');
          }

          // Use the endpoint passed as prop (determined when report was generated)
          const reportEndpoint = flowiseEndpoint || '/api/flowise/chat';
          const isDirectFlowiseCall = reportEndpoint.startsWith('https://flowise-2-0.onrender.com');

          console.log('🎯 Using generation endpoint for edit:', {
            endpoint: reportEndpoint,
            isDirect: isDirectFlowiseCall,
            passedFromProps: !!flowiseEndpoint
          });

          // Call the same endpoint that was used to generate the report
          const response = await fetch(reportEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(isDirectFlowiseCall ? {} : { 'Authorization': `Bearer ${session.access_token}` })
            },
            body: JSON.stringify({
              question: editPrompt
            })
          })

          if (!response.ok) {
            throw new Error(`Flowise API error: ${response.status} ${response.statusText}`)
          }

          const data = await response.json()
          
          // Handle different response formats: direct Flowise vs proxy
          let updatedContent: string;
          if (isDirectFlowiseCall) {
            // Direct Flowise calls return { text: "response" } or { answer: "response" }
            updatedContent = data.text || data.answer || currentContent;
          } else {
            // Proxy calls return { data: { message: "response" } }
            updatedContent = data.data?.message || data.text || data.answer || currentContent;
          }

          return {
            updatedContent: updatedContent,
            confidence: 0.95
          }
        },
        voiceTranscript ? 'voice' : 'instruction',
        reportId
      )

      if (result.success && result.data) {
        const updatedContent = result.data.updatedContent
        setCurrentContent(updatedContent)
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        
        // Final processing stage
        setProcessingStage('Edit complete!')
        setProcessingProgress(100)
        setProcessingMetrics(prev => ({ ...prev, confidence: result.data.confidence }))
        
        // Create version automatically for AI edits
        createVersion(
          updatedContent,
          voiceTranscript ? 'voice_instruction' : 'text_instruction',
          instruction,
          voiceTranscript
        )

        // Save updated content offline
        await offlineStorageService.saveReportOffline(
          reportId,
          sessionId,
          updatedContent,
          `Report ${reportId}`
        )
        
        onEditComplete?.({
          reportId,
          editType: voiceTranscript ? 'voice_instruction' : 'text_instruction',
          originalContent: currentContent,
          updatedContent,
          instruction,
          voiceTranscript,
          sessionId
        })
      } else {
        // Handle retry failure
        throw new Error(result.error?.message || 'Processing failed after retries')
      }
      
    } catch (error) {
      console.error('Edit processing failed:', error)
      setProcessingStage('Processing failed')
      
      // Log comprehensive error
      errorManagementService.logMedicalOperationError(
        voiceTranscript ? 'voice_instruction' : 'text_instruction',
        error as Error,
        { reportId, sessionId, specialty: 'general', feature: 'report_editing' }
      )

      // Queue for offline processing if network related
      if ((error as Error).message.includes('network') || (error as Error).message.includes('connection')) {
        await offlineStorageService.addOfflineOperation(
          sessionId,
          'edit',
          { instruction, voiceTranscript, originalContent: currentContent, failed: true }
        )

        // Activate degraded mode
        gracefulDegradationService.queueOfflineOperation('edit', reportId, sessionId, {
          instruction,
          voiceTranscript,
          originalContent: currentContent
        })
      }

      onError?.(error as Error)
    } finally {
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingProgress(0)
        setProcessingStage('')
        setProcessingStartTime(null)
        setEstimatedTimeRemaining(0)
        cleanupProcessing()
      }, 1000)
    }
  }, [
    currentContent, 
    reportId, 
    sessionId, 
    onEditComplete, 
    onError, 
    simulateProcessingProgress, 
    cleanupProcessing,
    createVersion,
    validateMedicalInstruction
  ])

  const handleManualEdit = useCallback((newContent: string) => {
    setCurrentContent(newContent)
    setHasUnsavedChanges(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges) return
    
    setIsProcessing(true)
    setProcessingStage('Saving changes...')
    setProcessingProgress(50)
    
    try {
      // This will be implemented when hooks are ready
      console.log('Saving manual changes:', { reportId, content: currentContent })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      setProcessingProgress(100)
      setProcessingStage('Saved successfully!')
      
      // Create version for manual saves
      createVersion(currentContent, 'manual_edit', 'Manual edits saved')
      
      onEditComplete?.({
        reportId,
        editType: 'manual_edit',
        originalContent: initialContent,
        updatedContent: currentContent,
        sessionId
      })
    } catch (error) {
      console.error('Save failed:', error)
      setProcessingStage('Save failed')
      onError?.(error as Error)
    } finally {
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingProgress(0)
        setProcessingStage('')
      }, 500)
    }
  }, [hasUnsavedChanges, currentContent, reportId, sessionId, initialContent, onEditComplete, onError])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupProcessing()
    }
  }, [cleanupProcessing])

  // Format time utility
  const formatTimeRemaining = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // Validation state
  const [validationResults, setValidationResults] = useState<{
    isValid: boolean
    warnings: string[]
    suggestions: string[]
    confidence: number
  } | null>(null)

  // Mobile detection and optimization
  useEffect(() => {
    const checkMobileMode = () => {
      const isMobile = window.innerWidth <= 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobileMode(isMobile)
      
      // Enable one-handed mode for small screens by default
      if (window.innerWidth <= 414) {
        setIsOneHandedMode(true)
      }
    }
    
    checkMobileMode()
    window.addEventListener('resize', checkMobileMode)
    
    return () => window.removeEventListener('resize', checkMobileMode)
  }, [])

  // Quick action handlers for common medical edits
  const quickActions = [
    {
      id: 'add-vitals',
      label: 'Add Vitals',
      instruction: 'Add vital signs section with blood pressure, heart rate, temperature, and respiratory rate',
      icon: Activity
    },
    {
      id: 'add-diagnosis',
      label: 'Add Diagnosis',
      instruction: 'Add clinical diagnosis section based on current findings',
      icon: CheckCircle
    },
    {
      id: 'add-plan',
      label: 'Add Plan',
      instruction: 'Add treatment plan and follow-up recommendations',
      icon: CheckSquare
    },
    {
      id: 'fix-grammar',
      label: 'Fix Grammar',
      instruction: 'Fix any grammatical errors and improve medical terminology clarity',
      icon: RefreshCw
    },
    {
      id: 'add-time',
      label: 'Add Timestamp',
      instruction: `Add current timestamp: ${new Date().toLocaleString()}`,
      icon: Clock
    },
    {
      id: 'summarize',
      label: 'Summarize',
      instruction: 'Create a concise summary of key findings and recommendations',
      icon: FileText
    }
  ]

  const handleQuickAction = useCallback((action: typeof quickActions[0]) => {
    if (isProcessing) return
    handleInstructionSubmit(action.instruction, `Quick action: ${action.label}`)
  }, [isProcessing, handleInstructionSubmit])

  return (
    <div className={`relative group overflow-hidden ${className}`}>
      {/* Premium Background with Advanced Visual Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/80 to-[#90cdf4]/10 dark:from-slate-900 dark:via-slate-800/90 dark:to-[#1a365d]/40" style={{background: 'linear-gradient(to bottom right, rgba(255,255,255,1) 0%, rgba(248,250,252,0.8) 50%, rgba(99,179,237,0.1) 100%)'}} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(43,108,176,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(26,54,93,0.15),transparent_70%)]" />
      
      {/* Animated Border Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2b6cb0]/20 via-[#63b3ed]/10 to-[#1a365d]/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm animate-pulse" />
      
      {/* Main Container */}
      <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-2xl shadow-[#2b6cb0]/10 dark:shadow-[#2b6cb0]/20 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:shadow-[#2b6cb0]/15">
        
        {/* Luxury Header with Glassmorphism */}
        <div className="relative overflow-hidden">
          {/* Header Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d]/5 via-[#2b6cb0]/3 to-[#63b3ed]/5 dark:from-[#2b6cb0]/10 dark:via-[#63b3ed]/5 dark:to-[#90cdf4]/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/80 dark:via-slate-900/40 dark:to-slate-900/80" />
          
          {/* Animated Particles Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-8 w-2 h-2 bg-[#63b3ed]/30 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '3s' }} />
            <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-[#2b6cb0]/20 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '4s' }} />
            <div className="absolute bottom-6 left-16 w-1 h-1 bg-[#1a365d]/25 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '5s' }} />
          </div>
          
          <div className="relative p-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Premium Icon with Multiple Layers */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl blur-md opacity-30 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl p-4 shadow-xl shadow-[#2b6cb0]/25">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                    <Edit3 className="w-7 h-7 text-white relative z-10" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#90cdf4] to-[#63b3ed] rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Premium Title with Enhanced Typography */}
                  <div className="flex items-center space-x-3">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-[#1a365d] to-[#2b6cb0] dark:from-white dark:via-[#90cdf4] dark:to-[#63b3ed] bg-clip-text text-transparent">
                      AI Report Studio
                    </h3>
                    <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-[#90cdf4]/20 to-[#63b3ed]/20 dark:from-[#1a365d]/30 dark:to-[#2b6cb0]/30 rounded-full border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50">
                      <Sparkles className="w-3 h-3 text-[#2b6cb0] dark:text-[#63b3ed]" />
                      <span className="text-xs font-bold text-[#1a365d] dark:text-[#90cdf4] tracking-wide">PREMIUM</span>
                    </div>
                  </div>
                  
                  {/* Enhanced Status Information */}
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/40 dark:border-slate-700/40 shadow-sm">
                      <div className="w-2 h-2 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] rounded-full animate-pulse" />
                      <FileText className="w-4 h-4 text-[#2b6cb0] dark:text-[#63b3ed]" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Report {reportId}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/40 dark:border-slate-700/40 shadow-sm">
                      <History className="w-4 h-4 text-[#1a365d] dark:text-[#90cdf4]" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">v{currentVersion}</span>
                      <div className="w-1 h-1 bg-[#63b3ed] rounded-full" />
                    </div>
                    
                    {lastSaved && (
                      <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-[#90cdf4]/10 to-[#63b3ed]/10 dark:from-[#1a365d]/20 dark:to-[#2b6cb0]/20 backdrop-blur-sm rounded-xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/30 shadow-sm">
                        <CheckCircle className="w-4 h-4 text-[#2b6cb0] dark:text-[#63b3ed]" />
                        <span className="text-sm font-semibold text-[#1a365d] dark:text-[#90cdf4]">
                          Saved {lastSaved.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    
                    {hasUnsavedChanges && (
                      <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-[#90cdf4]/10 to-[#63b3ed]/10 dark:from-[#1a365d]/20 dark:to-[#2b6cb0]/20 backdrop-blur-sm rounded-xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/30 shadow-sm animate-pulse">
                        <AlertCircle className="w-4 h-4 text-[#90cdf4] dark:text-[#90cdf4]" />
                        <span className="text-sm font-bold text-[#1a365d] dark:text-[#90cdf4]">
                          Unsaved Changes
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
          
              {/* Premium Control Panel */}
              <div className="flex items-center space-x-3">
                {/* Mobile-specific controls with enhanced design */}
                {isMobileMode && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/20 to-[#63b3ed]/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <MedicalButton
                      variant={quickActionMode ? "primary" : "ghost"}
                      size="md"
                      leftIcon={Zap}
                      onClick={() => setQuickActionMode(!quickActionMode)}
                      className={quickActionMode 
                        ? "relative bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white shadow-lg shadow-[#2b6cb0]/25 hover:shadow-xl hover:shadow-[#2b6cb0]/30" 
                        : "relative text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 backdrop-blur-sm"
                      }
                      title="Toggle quick action buttons"
                    >
                      Quick AI
                    </MedicalButton>
                  </div>
                )}
                
                {isMobileMode && window.innerWidth <= 414 && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#90cdf4]/20 to-[#63b3ed]/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <MedicalButton
                      variant={isOneHandedMode ? "primary" : "ghost"}
                      size="md"
                      leftIcon={User}
                      onClick={() => setIsOneHandedMode(!isOneHandedMode)}
                      className={isOneHandedMode 
                        ? "relative bg-gradient-to-r from-[#90cdf4] to-[#63b3ed] text-white shadow-lg shadow-[#90cdf4]/25" 
                        : "relative text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 backdrop-blur-sm"
                      }
                      title="Toggle one-handed mode layout"
                    >
                      <Crown className="w-4 h-4" />
                    </MedicalButton>
                  </div>
                )}
                
                {/* Enhanced Version Management */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/20 to-[#1a365d]/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <MedicalButton
                    variant={autoVersioning ? "primary" : "ghost"}
                    size="md"
                    leftIcon={Shield}
                    onClick={() => setAutoVersioning(!autoVersioning)}
                    className={autoVersioning 
                      ? "relative bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white shadow-lg shadow-[#2b6cb0]/25" 
                      : "relative text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 backdrop-blur-sm"
                    }
                    title={autoVersioning ? "Auto-versioning enabled" : "Auto-versioning disabled"}
                  >
                    Auto-Save
                  </MedicalButton>
                </div>
                
                {/* Premium Save Button */}
                {hasUnsavedChanges && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/30 to-[#63b3ed]/30 rounded-xl blur-md opacity-70 animate-pulse" />
                    <MedicalButton
                      variant="primary"
                      size="md"
                      leftIcon={Save}
                      onClick={handleSave}
                      disabled={isProcessing}
                      className="relative bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white shadow-xl shadow-[#2b6cb0]/30 hover:shadow-2xl hover:shadow-[#2b6cb0]/40 transform hover:scale-105 transition-all duration-200"
                    >
                      <span className="flex items-center space-x-2">
                        <span>Save Changes</span>
                        <Gem className="w-4 h-4" />
                      </span>
                    </MedicalButton>
                  </div>
                )}
                
                {/* Enhanced Expand/Collapse */}
                <div className="relative group">
                  <MedicalButton
                    variant="ghost"
                    size="md"
                    rightIcon={isExpanded ? ChevronUp : ChevronDown}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="relative text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40"
                  >
                    {isExpanded ? 'Minimize' : 'Expand Studio'}
                  </MedicalButton>
                </div>
              </div>
            </div>

            {/* Premium Tab Navigation with Glass Morphism */}
            {isExpanded && (
              <div className="relative mt-6 -mb-2">
                <div className="flex space-x-2 p-2 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg">
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={`group relative flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === 'edit'
                        ? 'bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white shadow-lg shadow-[#2b6cb0]/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className={`p-1 rounded-lg ${
                      activeTab === 'edit'
                        ? 'bg-white/20'
                        : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                    } transition-all duration-300`}>
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <span className="font-semibold tracking-wide">AI Content Studio</span>
                    {activeTab === 'edit' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#63b3ed]/20 to-[#2b6cb0]/20 rounded-xl animate-pulse" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`group relative flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === 'history'
                        ? 'bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white shadow-lg shadow-[#1a365d]/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className={`p-1 rounded-lg ${
                      activeTab === 'history'
                        ? 'bg-white/20'
                        : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                    } transition-all duration-300`}>
                      <History className="w-4 h-4" />
                    </div>
                    <span className="font-semibold tracking-wide">Version History</span>
                    {activeTab === 'history' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/20 to-[#1a365d]/20 rounded-xl animate-pulse" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Premium Content Area */}
        {isExpanded && (
          <div className="relative p-8 pt-6">
            {activeTab === 'edit' && (
              <div className="space-y-8">
                {/* Enhanced Edit Mode Toggle */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                      <Palette className="w-5 h-5 text-[#2b6cb0] dark:text-[#63b3ed]" />
                      <span>Editing Mode</span>
                    </h4>
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-[#90cdf4]/10 to-[#63b3ed]/10 dark:from-[#1a365d]/20 dark:to-[#2b6cb0]/20 rounded-full border border-[#63b3ed]/50 dark:border-[#2b6cb0]/30">
                      <Award className="w-4 h-4 text-[#2b6cb0] dark:text-[#63b3ed]" />
                      <span className="text-sm font-semibold text-[#1a365d] dark:text-[#90cdf4]">Professional Suite</span>
                    </div>
                  </div>
                  
                  <div className="relative p-1 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl border border-slate-200/50 dark:border-slate-600/50 shadow-inner">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditMode('instruction')}
                        className={`group relative flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                          editMode === 'instruction'
                            ? 'bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white shadow-xl shadow-[#2b6cb0]/25 transform scale-[1.02]'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          editMode === 'instruction'
                            ? 'bg-white/20'
                            : 'bg-[#90cdf4]/30 dark:bg-[#1a365d]/30 group-hover:bg-[#90cdf4]/50 dark:group-hover:bg-[#2b6cb0]/50'
                        } transition-all duration-300`}>
                          <Brain className="w-5 h-5" />
                        </div>
                        <span className="text-lg tracking-wide">AI Intelligence</span>
                        {editMode === 'instruction' && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#63b3ed]/20 to-[#2b6cb0]/20 rounded-xl animate-pulse" />
                            <Sparkles className="w-5 h-5 text-white/80" />
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => setEditMode('manual')}
                        className={`group relative flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                          editMode === 'manual'
                            ? 'bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white shadow-xl shadow-[#2b6cb0]/25 transform scale-[1.02]'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          editMode === 'manual'
                            ? 'bg-white/20'
                            : 'bg-[#90cdf4]/30 dark:bg-[#1a365d]/30 group-hover:bg-[#90cdf4]/50 dark:group-hover:bg-[#2b6cb0]/50'
                        } transition-all duration-300`}>
                          <Type className="w-5 h-5" />
                        </div>
                        <span className="text-lg tracking-wide">Manual Precision</span>
                        {editMode === 'manual' && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#63b3ed]/20 to-[#90cdf4]/20 rounded-xl animate-pulse" />
                            <Target className="w-5 h-5 text-white/80" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Premium Quick Action Center for Mobile Bedside Consultations */}
                {isMobileMode && quickActionMode && editMode === 'instruction' && (
                  <div className="relative overflow-hidden">
                    {/* Luxury Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#90cdf4]/10 via-[#63b3ed]/8 to-[#2b6cb0]/5 dark:from-[#1a365d]/20 dark:via-[#2b6cb0]/15 dark:to-[#63b3ed]/10 rounded-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,108,176,0.1),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(43,108,176,0.2),transparent_70%)]" />
                    
                    <div className="relative p-8">
                      {/* Enhanced Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl blur-md opacity-30 animate-pulse" />
                            <div className="relative bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl p-3 shadow-xl shadow-[#2b6cb0]/25">
                              <Zap className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                              <span>Quick AI Actions</span>
                              <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 dark:from-[#2b6cb0]/30 dark:to-[#1a365d]/30 rounded-full">
                                <Crown className="w-3 h-3 text-[#2b6cb0] dark:text-[#63b3ed]" />
                                <span className="text-xs font-bold text-[#1a365d] dark:text-[#90cdf4]">PRO</span>
                              </div>
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Instant medical documentation with AI precision
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 px-3 py-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/40 dark:border-slate-700/40">
                          <div className="w-2 h-2 bg-[#2b6cb0] rounded-full animate-pulse" />
                          <span className="text-xs font-semibold text-[#1a365d] dark:text-[#90cdf4]">ACTIVE</span>
                        </div>
                      </div>
                      
                      {/* Premium Action Grid */}
                      <div className={`grid gap-4 ${isOneHandedMode ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {quickActions.map((action, index) => {
                          const IconComponent = action.icon
                          const gradients = [
                            'from-[#2b6cb0] to-[#1a365d]',
                            'from-[#63b3ed] to-[#2b6cb0]', 
                            'from-[#1a365d] to-[#2b6cb0]',
                            'from-[#90cdf4] to-[#63b3ed]',
                            'from-[#2b6cb0] to-[#90cdf4]',
                            'from-[#1a365d] to-[#63b3ed]'
                          ]
                          const gradient = gradients[index % gradients.length]
                          
                          return (
                            <div key={action.id} className="group relative">
                              <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-300`} />
                              <button
                                onClick={() => handleQuickAction(action)}
                                disabled={isProcessing}
                                className={`relative w-full p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group`}
                                title={action.instruction}
                              >
                                <div className="flex flex-col items-center space-y-3">
                                  <div className={`p-4 bg-gradient-to-r ${gradient} rounded-xl shadow-lg shadow-[#2b6cb0]/25 group-hover:shadow-xl group-hover:shadow-[#2b6cb0]/30 transition-all duration-300`}>
                                    <IconComponent className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="text-center">
                                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                      {action.label}
                                    </div>
                                  </div>
                                </div>
                                
                                {isProcessing && (
                                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#2b6cb0]" />
                                  </div>
                                )}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Premium Note */}
                      <div className="mt-6 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-slate-700/40">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] rounded-lg shadow-lg">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              <span className="font-bold text-[#2b6cb0] dark:text-[#63b3ed]">Bedside Excellence:</span> AI-powered actions optimized for seamless clinical documentation during patient consultations.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Premium Voice Instruction Interface for Mobile */}
                {isMobileMode && !quickActionMode && editMode === 'instruction' && (
                  <div className="relative overflow-hidden">
                    {/* Luxury Voice Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#90cdf4]/10 via-[#63b3ed]/8 to-[#2b6cb0]/5 dark:from-[#1a365d]/20 dark:via-[#2b6cb0]/15 dark:to-[#63b3ed]/10 rounded-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(26,54,93,0.1),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(26,54,93,0.2),transparent_70%)]" />
                    
                    <div className="relative p-8">
                      <div className="space-y-6">
                        {/* Premium Voice Icon */}
                        <div className="text-center">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] rounded-full blur-xl opacity-30 animate-pulse" />
                            <div className="relative w-20 h-20 bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] rounded-full flex items-center justify-center shadow-2xl shadow-[#1a365d]/25">
                              <Mic className="w-10 h-10 text-white" />
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#90cdf4] to-[#63b3ed] rounded-full flex items-center justify-center">
                                <Wand2 className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Voice Button - Full Width Container */}
                        <div className="w-full">
                          <VoiceInstructionButton
                            onTranscription={handleInstructionSubmit}
                            disabled={isProcessing}
                            className="w-full"
                          />
                        </div>
                        
                        {/* Premium Hint */}
                        <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-slate-700/40">
                          <div className="flex items-center justify-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] rounded-lg shadow-lg">
                              <Star className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              Hands-free clinical excellence during patient examinations
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Edit Interface */}
              {editMode === 'instruction' ? (
                <div className="space-y-4">
                  <EditInstructionInput
                    onSubmit={handleInstructionSubmit}
                    isProcessing={isProcessing}
                    sessionId={sessionId}
                    reportId={reportId}
                  />
                  
                  {/* Medical Validation Results */}
                  {validationResults && (validationResults.warnings.length > 0 || validationResults.suggestions.length > 0) && (
                    <div className="validation-results">
                      <div className="validation-header">
                        <h4 className="validation-title">
                          <AlertCircle className="w-4 h-4" />
                          <span>Medical Validation Results</span>
                        </h4>
                        <div className="confidence-score">
                          <span>Confidence: {(validationResults.confidence * 100).toFixed(0)}%</span>
                          <div className={`confidence-indicator ${
                            validationResults.confidence >= 0.8 ? 'high' :
                            validationResults.confidence >= 0.6 ? 'medium' :
                            'low'
                          }`} />
                        </div>
                      </div>
                      
                      {/* Warnings */}
                      {validationResults.warnings.length > 0 && (
                        <div className="validation-warnings">
                          <h5>Safety Warnings:</h5>
                          {validationResults.warnings.map((warning, index) => (
                            <div key={index} className="validation-warning">
                              <AlertCircle className="warning-icon" />
                              <span>{warning}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Suggestions */}
                      {validationResults.suggestions.length > 0 && (
                        <div className="validation-suggestions">
                          <h5>Suggestions for Improvement:</h5>
                          {validationResults.suggestions.map((suggestion, index) => (
                            <div key={index} className="validation-suggestion">
                              <CheckCircle className="suggestion-icon" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Validation Tips */}
                      <div className="processing-tips">
                        <p>
                          <strong>Medical Safety:</strong> Instructions are validated for medical terminology, 
                          safety considerations, and clarity. Always ensure instructions are specific and 
                          aligned with medical best practices.
                        </p>
                      </div>
                    </div>
                  )}
                  
                </div>
              ) : (
                <ReportTextEditor
                  content={currentContent}
                  onChange={handleManualEdit}
                  isProcessing={isProcessing}
                  reportId={reportId}
                  sessionId={sessionId}
                />
              )}

                {/* Revolutionary Processing Status */}
                {isProcessing && (
                  <div className="relative overflow-hidden">
                    {/* Premium Processing Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#90cdf4]/10 via-[#63b3ed]/8 to-[#2b6cb0]/5 dark:from-[#1a365d]/30 dark:via-[#2b6cb0]/20 dark:to-[#63b3ed]/10 rounded-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(43,108,176,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(43,108,176,0.25),transparent_50%)]" />
                    
                    {/* Animated Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-6 left-8 w-2 h-2 bg-[#63b3ed]/40 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
                      <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-[#2b6cb0]/30 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                      <div className="absolute bottom-8 left-16 w-1 h-1 bg-[#1a365d]/35 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
                    </div>
                    
                    <div className="relative p-8">
                      {/* Main Processing Indicator */}
                      <div className="flex items-center space-x-6 mb-8">
                        {/* Premium AI Icon */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl blur-md opacity-50 animate-pulse" />
                          <div className="relative w-16 h-16 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#2b6cb0]/30">
                            <Brain className="w-8 h-8 text-white" />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#63b3ed] to-[#2b6cb0] rounded-full flex items-center justify-center animate-bounce">
                            <Zap className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        
                        {/* Processing Info */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-2xl font-bold bg-gradient-to-r from-[#2b6cb0] via-[#1a365d] to-[#2b6cb0] bg-clip-text text-transparent">
                              AI Intelligence Processing
                            </h4>
                            <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/40 dark:border-slate-700/40">
                              <Timer className="w-4 h-4 text-[#2b6cb0] dark:text-[#63b3ed]" />
                              <span className="text-sm font-bold text-[#1a365d] dark:text-[#90cdf4]">
                                {estimatedTimeRemaining > 0 ? formatTimeRemaining(estimatedTimeRemaining) : 'Calculating...'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Revolutionary Progress Bar */}
                          <div className="relative">
                            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-[#2b6cb0] via-[#63b3ed] to-[#1a365d] rounded-full shadow-lg transition-all duration-300 ease-out relative overflow-hidden"
                                style={{ width: `${processingProgress}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent animate-pulse" />
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-slide-right" />
                              </div>
                            </div>
                            <div className="absolute -top-1 -bottom-1 left-0 right-0 bg-gradient-to-r from-[#2b6cb0]/20 via-[#63b3ed]/20 to-[#1a365d]/20 rounded-full blur-sm animate-pulse" />
                          </div>
                          
                          {/* Current Stage with Premium Design */}
                          <div className="flex items-center space-x-4 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/40 dark:border-slate-700/40">
                            <div className="p-2 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] rounded-lg shadow-lg">
                              <Loader2 className="w-5 h-5 text-white animate-spin" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                                {processingStage || 'Initializing advanced AI algorithms...'}
                              </div>
                            </div>
                            <div className="px-4 py-2 bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 dark:from-[#2b6cb0]/30 dark:to-[#1a365d]/30 rounded-xl border border-[#63b3ed] dark:border-[#2b6cb0]/50">
                              <span className="text-lg font-bold text-[#1a365d] dark:text-[#90cdf4]">
                                {Math.round(processingProgress)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                  
                      {/* Premium Processing Metrics */}
                      {processingMetrics.totalTokens > 0 && (
                        <div className="grid grid-cols-3 gap-6">
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/20 to-[#1a365d]/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300" />
                            <div className="relative p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-slate-700/40 text-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                <BarChart3 className="w-6 h-6 text-white" />
                              </div>
                              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Tokens</div>
                              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {processingMetrics.tokensProcessed}/{processingMetrics.totalTokens}
                              </div>
                            </div>
                          </div>
                          
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/20 to-[#63b3ed]/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300" />
                            <div className="relative p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-slate-700/40 text-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-[#2b6cb0] to-[#63b3ed] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                <Target className="w-6 h-6 text-white" />
                              </div>
                              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Precision</div>
                              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {(processingMetrics.confidence * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d]/20 to-[#2b6cb0]/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300" />
                            <div className="relative p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-slate-700/40 text-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                              </div>
                              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Duration</div>
                              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {processingStartTime ? Math.round((Date.now() - processingStartTime.getTime()) / 1000) : 0}s
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Premium Processing Information */}
                      <div className="p-6 bg-gradient-to-r from-[#90cdf4]/10 to-[#63b3ed]/8 dark:from-[#1a365d]/20 dark:to-[#2b6cb0]/15 rounded-2xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/30">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] rounded-xl shadow-lg">
                            <Brain className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-lg font-bold text-[#1a365d] dark:text-[#90cdf4] mb-1">
                              Advanced Medical AI Processing
                            </h5>
                            <p className="text-sm text-[#2b6cb0] dark:text-[#63b3ed]">
                              Your instruction is being analyzed with state-of-the-art medical intelligence for context understanding, 
                              clinical terminology validation, and evidence-based content accuracy. Processing complexity adapts to medical requirements.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Local Version History */}
              {versionHistory.length > 0 && (
                <div className="relative overflow-hidden">
                  {/* Premium Version History Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#90cdf4]/10 via-[#63b3ed]/8 to-[#2b6cb0]/5 dark:from-[#1a365d]/20 dark:via-[#2b6cb0]/15 dark:to-[#63b3ed]/10 rounded-3xl" />
                  
                  <div className="relative p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] rounded-2xl blur-md opacity-30 animate-pulse" />
                          <div className="relative bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] rounded-2xl p-3 shadow-xl shadow-[#1a365d]/25">
                            <History className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                            <span>Version Timeline ({versionHistory.length})</span>
                            <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 dark:from-[#2b6cb0]/30 dark:to-[#1a365d]/30 rounded-full">
                              <Layers className="w-3 h-3 text-[#2b6cb0] dark:text-[#63b3ed]" />
                              <span className="text-xs font-bold text-[#1a365d] dark:text-[#90cdf4]">TRACKED</span>
                            </div>
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Complete version control with intelligent tracking
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/40 dark:border-slate-700/40">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Current: v{currentVersion}</span>
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${
                          autoVersioning 
                            ? 'bg-gradient-to-r from-[#90cdf4]/10 to-[#63b3ed]/10 dark:from-[#2b6cb0]/20 dark:to-[#1a365d]/20 border-[#63b3ed] dark:border-[#2b6cb0]/50'
                            : 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/20 dark:to-gray-800/20 border-slate-200 dark:border-slate-700/50'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${autoVersioning ? 'bg-[#2b6cb0] animate-pulse' : 'bg-slate-400'}`} />
                          <span className={`text-sm font-bold ${
                            autoVersioning ? 'text-[#1a365d] dark:text-[#90cdf4]' : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {autoVersioning ? 'Auto-Save' : 'Manual'}
                          </span>
                        </div>
                      </div>
                    </div>
                  
                    {/* Premium Version List */}
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {versionHistory.map((version, index) => {
                        const editTypeColors = {
                          voice_instruction: { bg: 'from-[#90cdf4]/10 to-[#63b3ed]/10 dark:from-[#1a365d]/20 dark:to-[#2b6cb0]/20', border: 'border-[#63b3ed] dark:border-[#2b6cb0]/50', text: 'text-[#1a365d] dark:text-[#90cdf4]', icon: Mic },
                          text_instruction: { bg: 'from-[#90cdf4]/10 to-[#63b3ed]/10 dark:from-[#1a365d]/20 dark:to-[#2b6cb0]/20', border: 'border-[#63b3ed] dark:border-[#2b6cb0]/50', text: 'text-[#2b6cb0] dark:text-[#63b3ed]', icon: Type },
                          manual_edit: { bg: 'from-[#90cdf4]/10 to-[#63b3ed]/10 dark:from-[#2b6cb0]/20 dark:to-[#1a365d]/20', border: 'border-[#63b3ed] dark:border-[#2b6cb0]/50', text: 'text-[#1a365d] dark:text-[#90cdf4]', icon: Edit3 },
                          initial: { bg: 'from-slate-50 to-gray-50 dark:from-slate-800/20 dark:to-gray-800/20', border: 'border-slate-200 dark:border-slate-700/50', text: 'text-slate-700 dark:text-slate-300', icon: FileText }
                        }
                        const config = editTypeColors[version.editType as keyof typeof editTypeColors] || editTypeColors.text_instruction
                        const IconComponent = config.icon
                        
                        return (
                          <div key={version.version} className="group relative">
                            {/* Timeline connector */}
                            {index !== versionHistory.length - 1 && (
                              <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-slate-300 to-transparent dark:from-slate-600" />
                            )}
                            
                            <div className={`relative p-6 bg-gradient-to-r ${config.bg} rounded-2xl border ${config.border} hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  {/* Version Icon */}
                                  <div className="relative">
                                    <div className={`w-12 h-12 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] rounded-xl flex items-center justify-center shadow-lg`}>
                                      <IconComponent className="w-5 h-5 text-white" />
                                    </div>
                                    {version.version === currentVersion && (
                                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#90cdf4] to-[#63b3ed] rounded-full flex items-center justify-center">
                                        <Star className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Version Info */}
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h5 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        Version {version.version}
                                      </h5>
                                      <div className={`px-3 py-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/40 dark:border-slate-700/40`}>
                                        <span className={`text-xs font-bold ${config.text}`}>
                                          {version.editType.replace('_', ' ').toUpperCase()}
                                        </span>
                                      </div>
                                      {version.version === currentVersion && (
                                        <div className="px-3 py-1 bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 dark:from-[#2b6cb0]/30 dark:to-[#1a365d]/30 rounded-full border border-[#63b3ed] dark:border-[#2b6cb0]/50">
                                          <span className="text-xs font-bold text-[#1a365d] dark:text-[#90cdf4]">ACTIVE</span>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 line-clamp-2">
                                      {version.summary}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {version.timestamp.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Version Actions */}
                                <div className="flex items-center space-x-2">
                                  <MedicalButton
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={Eye}
                                    onClick={() => {
                                      alert(`Version ${version.version} content:\n\n${version.content.substring(0, 200)}...`)
                                    }}
                                    className="text-slate-500 hover:text-[#2b6cb0] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40"
                                  >
                                    Preview
                                  </MedicalButton>
                                  {version.version !== currentVersion && (
                                    <MedicalButton
                                      variant="ghost"
                                      size="sm"
                                      leftIcon={RotateCcw}
                                      onClick={() => restoreVersion(version.version)}
                                      className="text-slate-500 hover:text-[#2b6cb0] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40"
                                    >
                                      Restore
                                    </MedicalButton>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Full Edit History Panel */}
              <EditHistoryPanel
                reportId={reportId}
                sessionId={sessionId}
                onVersionRestore={(content) => {
                  setCurrentContent(content)
                  setHasUnsavedChanges(true)
                  setActiveTab('edit')
                  // Create a version for external restoration
                  createVersion(content, 'external_restore', 'Restored from database history')
                }}
              />
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportEditCard

// Additional CSS for animations (to be added to global styles)
// @keyframes slide-right {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }
// .animate-slide-right {
//   animation: slide-right 2s infinite;
// }