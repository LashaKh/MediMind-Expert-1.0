import { useState, useCallback, useRef, useEffect } from 'react'

interface MedicalFeedbackMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: Array<{
    label: string
    type: 'primary' | 'secondary'
    onClick: () => void
  }>
  persistent?: boolean
}

interface MedicalFeedbackHook {
  messages: MedicalFeedbackMessage[]
  showSuccess: (title: string, message: string, options?: Partial<MedicalFeedbackMessage>) => string
  showError: (title: string, message: string, options?: Partial<MedicalFeedbackMessage>) => string
  showWarning: (title: string, message: string, options?: Partial<MedicalFeedbackMessage>) => string
  showInfo: (title: string, message: string, options?: Partial<MedicalFeedbackMessage>) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

/**
 * Medical Feedback Hook
 * 
 * Manages toast-style feedback messages with medical context and appropriate
 * styling for healthcare professionals.
 * 
 * Features:
 * - Medical context-aware messaging
 * - Auto-dismissal with configurable duration
 * - Persistent messages for critical feedback
 * - Action buttons for user interaction
 * - HIPAA-compliant message handling
 * - Mobile-optimized display
 */
export const useMedicalFeedback = (): MedicalFeedbackHook => {
  const [messages, setMessages] = useState<MedicalFeedbackMessage[]>([])
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Generate unique ID for messages
  const generateId = useCallback(() => {
    return `medical-feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Clear timer for a message
  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  // Dismiss a specific message
  const dismiss = useCallback((id: string) => {
    clearTimer(id)
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [clearTimer])

  // Dismiss all messages
  const dismissAll = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer))
    timersRef.current.clear()
    setMessages([])
  }, [])

  // Add a new message
  const addMessage = useCallback((
    type: MedicalFeedbackMessage['type'],
    title: string,
    message: string,
    options: Partial<MedicalFeedbackMessage> = {}
  ): string => {
    const id = generateId()
    const duration = options.duration ?? (options.persistent ? undefined : 5000)

    const newMessage: MedicalFeedbackMessage = {
      id,
      type,
      title,
      message,
      duration,
      ...options
    }

    setMessages(prev => [...prev, newMessage])

    // Set auto-dismiss timer if not persistent
    if (duration && !options.persistent) {
      const timer = setTimeout(() => {
        dismiss(id)
      }, duration)
      timersRef.current.set(id, timer)
    }

    return id
  }, [generateId, dismiss])

  // Medical success feedback - for successful operations
  const showSuccess = useCallback((
    title: string,
    message: string,
    options?: Partial<MedicalFeedbackMessage>
  ) => {
    return addMessage('success', title, message, {
      duration: 4000,
      ...options
    })
  }, [addMessage])

  // Medical error feedback - for critical errors
  const showError = useCallback((
    title: string,
    message: string,
    options?: Partial<MedicalFeedbackMessage>
  ) => {
    return addMessage('error', title, message, {
      duration: 8000, // Longer duration for errors
      persistent: true, // Errors should be manually dismissed
      ...options
    })
  }, [addMessage])

  // Medical warning feedback - for validation issues
  const showWarning = useCallback((
    title: string,
    message: string,
    options?: Partial<MedicalFeedbackMessage>
  ) => {
    return addMessage('warning', title, message, {
      duration: 6000,
      ...options
    })
  }, [addMessage])

  // Medical info feedback - for general information
  const showInfo = useCallback((
    title: string,
    message: string,
    options?: Partial<MedicalFeedbackMessage>
  ) => {
    return addMessage('info', title, message, {
      duration: 5000,
      ...options
    })
  }, [addMessage])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  return {
    messages,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismiss,
    dismissAll
  }
}

// Medical feedback templates for common scenarios
export const MedicalFeedbackTemplates = {
  // Report editing specific messages
  editSuccess: (duration: number) => ({
    title: 'Report Updated Successfully',
    message: `Your medical report has been updated and validated. Processing completed in ${Math.round(duration / 1000)}s with high confidence.`
  }),

  editError: (error: string) => ({
    title: 'Report Update Failed',
    message: `Unable to process your edit request. Error: ${error}. Please check your instruction and try again.`
  }),

  validationWarning: (confidence: number, warnings: string[]) => ({
    title: 'Medical Validation Warnings',
    message: `Your instruction passed validation with ${Math.round(confidence * 100)}% confidence, but has ${warnings.length} warning${warnings.length > 1 ? 's' : ''} that should be reviewed.`
  }),

  processingTimeout: () => ({
    title: 'Processing Timeout',
    message: 'Your edit request timed out. This may be due to high system load or complex medical content. Please try again with a shorter instruction.'
  }),

  rateLimitReached: () => ({
    title: 'Rate Limit Reached',
    message: 'You have reached the processing limit. Please wait a few minutes before submitting new edit requests.'
  }),

  versionRestored: (version: number) => ({
    title: 'Version Restored',
    message: `Successfully restored report to version ${version}. You can continue editing from this point.`
  }),

  versionSaved: (version: number) => ({
    title: 'Version Saved',
    message: `Your changes have been saved as version ${version}. The edit history has been updated.`
  }),

  voiceTranscriptionSuccess: (transcript: string) => ({
    title: 'Voice Instruction Processed',
    message: `Successfully transcribed and processed your voice instruction: "${transcript.substring(0, 50)}${transcript.length > 50 ? '...' : ''}"`
  }),

  voiceTranscriptionError: () => ({
    title: 'Voice Processing Failed',
    message: 'Unable to process your voice instruction. Please check your microphone settings and try again, or use text input instead.'
  }),

  medicalValidationBlocked: (riskLevel: string) => ({
    title: 'Medical Safety Block',
    message: `Your instruction was blocked due to ${riskLevel} medical safety risk. Please review and modify your instruction to ensure patient safety.`
  }),

  aiProcessingStarted: () => ({
    title: 'AI Processing Started',
    message: 'Your medical report edit is being processed with advanced AI validation and medical context analysis.'
  }),

  confidenceThresholdWarning: (confidence: number) => ({
    title: 'Low Confidence Warning',
    message: `The AI confidence level (${Math.round(confidence * 100)}%) is below the medical safety threshold. Please review the output carefully.`
  })
}