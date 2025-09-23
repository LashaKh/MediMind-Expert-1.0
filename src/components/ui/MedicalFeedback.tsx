import React, { useEffect, useState } from 'react'
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react'
import { useMedicalFeedback } from '../../hooks/useMedicalFeedback'

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

interface MedicalFeedbackProps {
  message: MedicalFeedbackMessage
  onDismiss: (id: string) => void
}

/**
 * MedicalFeedback Component
 * 
 * Individual feedback message component with medical context styling
 * and appropriate visual indicators for healthcare professionals.
 */
const MedicalFeedbackItem: React.FC<MedicalFeedbackProps> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHiding, setIsHiding] = useState(false)
  const [progress, setProgress] = useState(100)

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return CheckCircle
      case 'error':
        return AlertCircle
      case 'warning':
        return AlertTriangle
      case 'info':
        return Info
      default:
        return Info
    }
  }

  const Icon = getIcon()

  const handleDismiss = () => {
    setIsHiding(true)
    setTimeout(() => {
      onDismiss(message.id)
    }, 300) // Match the CSS animation duration
  }

  useEffect(() => {
    // Trigger show animation
    setIsVisible(true)

    // Start progress bar animation if message has duration
    if (message.duration && !message.persistent) {
      const interval = 50 // Update every 50ms
      const steps = message.duration / interval
      let currentStep = 0

      const progressTimer = setInterval(() => {
        currentStep++
        const newProgress = Math.max(0, 100 - (currentStep / steps) * 100)
        setProgress(newProgress)

        if (currentStep >= steps) {
          clearInterval(progressTimer)
          handleDismiss()
        }
      }, interval)

      return () => clearInterval(progressTimer)
    }
  }, [message.duration, message.persistent])

  return (
    <div 
      className={`medical-feedback ${message.type} ${isHiding ? 'hiding' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="medical-feedback-header">
        <div className="medical-feedback-icon">
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="medical-feedback-content">
          <h4 className="medical-feedback-title">
            {message.title}
          </h4>
          <p className="medical-feedback-message">
            {message.message}
          </p>
        </div>
        
        <button
          className="medical-feedback-close"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {message.actions && message.actions.length > 0 && (
        <div className="medical-feedback-actions">
          {message.actions.map((action, index) => (
            <button
              key={index}
              className={`medical-feedback-action ${action.type}`}
              onClick={() => {
                action.onClick()
                if (action.type === 'primary') {
                  handleDismiss()
                }
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {message.duration && !message.persistent && (
        <div className="medical-feedback-progress">
          <div 
            className="medical-feedback-progress-bar"
            style={{ 
              width: `${progress}%`,
              transitionDuration: `${message.duration}ms`
            }}
          />
        </div>
      )}
    </div>
  )
}

/**
 * MedicalFeedbackContainer Component
 * 
 * Container component that renders all active feedback messages
 * in a fixed position overlay.
 */
export const MedicalFeedbackContainer: React.FC = () => {
  const { messages, dismiss } = useMedicalFeedback()

  if (messages.length === 0) {
    return null
  }

  return (
    <div 
      className="fixed top-0 right-0 z-50 p-4 space-y-4 pointer-events-none"
      style={{ zIndex: 1080 }} // Above other medical components
    >
      {messages.map((message) => (
        <div key={message.id} className="pointer-events-auto">
          <MedicalFeedbackItem 
            message={message} 
            onDismiss={dismiss}
          />
        </div>
      ))}
    </div>
  )
}

/**
 * MedicalFeedbackProvider Component
 * 
 * Context provider that should wrap the application to enable
 * medical feedback throughout the app.
 */
const MedicalFeedbackContext = React.createContext<ReturnType<typeof useMedicalFeedback> | null>(null)

export const MedicalFeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const feedbackHook = useMedicalFeedback()

  return (
    <MedicalFeedbackContext.Provider value={feedbackHook}>
      {children}
      <MedicalFeedbackContainer />
    </MedicalFeedbackContext.Provider>
  )
}

/**
 * Hook to access medical feedback from any component
 */
export const useMedicalFeedbackContext = () => {
  const context = React.useContext(MedicalFeedbackContext)
  if (!context) {
    throw new Error('useMedicalFeedbackContext must be used within a MedicalFeedbackProvider')
  }
  return context
}

export default MedicalFeedbackItem