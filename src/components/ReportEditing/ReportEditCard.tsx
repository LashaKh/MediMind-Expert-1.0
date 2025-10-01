import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Edit3, Loader2, Brain, 
  Activity, AlertCircle, Clock, Shield
} from 'lucide-react'

import EditInstructionInput from './EditInstructionInput'

interface ReportEditCardProps {
  reportId: string
  initialContent: string
  sessionId: string
  flowiseEndpoint?: string
  onEditComplete: (result: any) => void
  onError: (error: Error) => void
  className?: string
}

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
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Mobile bedside consultation state
  const [isMobileMode, setIsMobileMode] = useState(false)
  
  // Processing metrics state
  const [processingMetrics, setProcessingMetrics] = useState({
    responseTime: 0,
    tokenCount: 0,
    modelUsed: '',
    confidence: 0
  })

  // Medical validation state
  const [validationResults, setValidationResults] = useState<{
    clinicalAccuracy: number
    terminologyCompliance: boolean
    criticalAlerts: string[]
    suggestions: string[]
  } | null>(null)

  // Emergency state management
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'moderate' | 'high' | 'critical'>('low')

  // Session management for emergency scenarios
  const [sessionHandoffs, setSessionHandoffs] = useState<Array<{
    timestamp: number
    fromProvider: string
    toProvider: string
    notes: string
  }>>([])

  // Update content when initialContent changes
  useEffect(() => {
    setCurrentContent(initialContent)
    setHasUnsavedChanges(false)
  }, [initialContent])

  // Cleanup function for processing
  const cleanupProcessing = useCallback(() => {
    setIsProcessing(false)
    setProcessingMetrics({
      responseTime: 0,
      tokenCount: 0,
      modelUsed: '',
      confidence: 0
    })
  }, [])

  // Emergency session handlers
  useEffect(() => {
    const handleSessionRestored = (event: CustomEvent) => {
      console.log('🚨 Emergency session restored:', event.detail)
      setCurrentContent(event.detail.content || initialContent)
      setHasUnsavedChanges(false)
    }

    const handleServiceDegraded = (event: CustomEvent) => {
      console.warn('⚠️ Service degraded, entering emergency mode:', event.detail)
      setEmergencyMode(true)
      setUrgencyLevel('high')
    }

    const handleMedicalError = (event: CustomEvent) => {
      console.error('🏥 Medical error detected:', event.detail)
      onError(new Error(`Medical validation error: ${event.detail.message}`))
    }

    // Add event listeners
    window.addEventListener('session-restored', handleSessionRestored as EventListener)
    window.addEventListener('service-degraded', handleServiceDegraded as EventListener)
    window.addEventListener('medical-error', handleMedicalError as EventListener)

    return () => {
      // Cleanup event listeners
      window.removeEventListener('session-restored', handleSessionRestored as EventListener)
      window.removeEventListener('service-degraded', handleServiceDegraded as EventListener)
      window.removeEventListener('medical-error', handleMedicalError as EventListener)
      
      // Clear any ongoing processing
      cleanupProcessing()
    }
  }, [initialContent, onError, cleanupProcessing])

  const handleInstructionSubmit = async (instruction: string) => {
    if (!instruction.trim() || isProcessing) return

    setIsProcessing(true)
    const startTime = Date.now()
    
    try {
      setProcessingMetrics(prev => ({
        ...prev,
        responseTime: 0,
        modelUsed: 'Processing...'
      }))

      let response
      let responseText = ''

      if (flowiseEndpoint?.includes('localhost:3000')) {
        // Direct Flowise API call
        const flowiseResponse = await fetch(flowiseEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: `Current report content:\n${currentContent}\n\nEdit instruction: ${instruction}`,
            overrideConfig: {
              returnSourceDocuments: false
            }
          }),
        })

        if (!flowiseResponse.ok) {
          throw new Error(`Flowise API error: ${flowiseResponse.status}`)
        }

        response = await flowiseResponse.json()
        
        if (response) {
          // Handle different response formats
          if (typeof response === 'string') {
            responseText = response
          } else if (response.text) {
            // Direct Flowise calls return { text: "response" } or { answer: "response" }
            responseText = response.text
          } else if (response.answer) {
            // Proxy calls return { data: { message: "response" } }
            responseText = response.answer
          } else if (response.data?.message) {
            responseText = response.data.message
          } else {
            responseText = JSON.stringify(response)
          }
        }
      } else {
        // Use proxy endpoint
        const proxyResponse = await fetch('/api/flowise-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: flowiseEndpoint || '/api/v1/prediction/edit-report',
            question: `Current report content:\n${currentContent}\n\nEdit instruction: ${instruction}`,
            sessionId: sessionId,
            overrideConfig: {
              returnSourceDocuments: false
            }
          }),
        })

        if (!proxyResponse.ok) {
          throw new Error(`Proxy API error: ${proxyResponse.status}`)
        }

        response = await proxyResponse.json()
        responseText = response.data?.message || response.answer || response.text || 'No response received'
      }

      const endTime = Date.now()
      const responseTime = endTime - startTime

      // Update processing metrics
      setProcessingMetrics({
        responseTime,
        tokenCount: responseText.length,
        modelUsed: response.model || 'AI Assistant',
        confidence: response.confidence || 0.85
      })

      // Update content
      setCurrentContent(responseText)
      setHasUnsavedChanges(true)
      setLastSaved(new Date())

      // Trigger edit complete callback
      onEditComplete({
        success: true,
        content: responseText,
        instruction,
        responseTime,
        timestamp: Date.now()
      })

    } catch (error) {
      console.error('Error processing edit instruction:', error)
      onError(error as Error)
      
      // Update metrics with error state
      setProcessingMetrics(prev => ({
        ...prev,
        responseTime: Date.now() - startTime,
        modelUsed: 'Error'
      }))
    } finally {
      setIsProcessing(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupProcessing()
    }
  }, [cleanupProcessing])

  // Format time utility
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // Mobile detection
  useEffect(() => {
    const checkMobileMode = () => {
      setIsMobileMode(window.innerWidth < 768)
    }
    
    checkMobileMode()
    window.addEventListener('resize', checkMobileMode)
    return () => window.removeEventListener('resize', checkMobileMode)
  }, [])


  return (
    <div className={`relative group overflow-hidden ${className}`}>
      {/* Premium Background with Advanced Visual Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/80 to-[#90cdf4]/10 dark:from-slate-900 dark:via-slate-800/90 dark:to-[#1a365d]/40" style={{background: 'linear-gradient(to bottom right, rgba(255,255,255,1) 0%, rgba(248,250,252,0.8) 50%, rgba(99,179,237,0.1) 100%)'}} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(43,108,176,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(26,54,93,0.15),transparent_70%)]" />
      
      {/* Animated Border Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2b6cb0]/20 via-[#63b3ed]/10 to-[#1a365d]/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm animate-pulse" />
      
      {/* Main Container */}
      <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-2xl shadow-[#2b6cb0]/10 dark:shadow-[#2b6cb0]/20 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:shadow-[#2b6cb0]/15">
        
        {/* Content starts directly - header removed */}
        <div className="relative p-8">
          <div className="space-y-8">
              
              {/* Unified Edit Interface - AI Voice/Text Input + Manual Editor */}
              <div className="space-y-8">
                
                {/* AI Voice/Text Input Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] rounded-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      AI Assistant
                    </h3>
                    <div className="px-3 py-1 bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 dark:from-[#2b6cb0]/30 dark:to-[#1a365d]/30 rounded-full">
                      <span className="text-sm font-bold text-[#1a365d] dark:text-[#90cdf4]">VOICE & TEXT</span>
                    </div>
                  </div>
                  
                  <EditInstructionInput
                    onTextInstruction={handleInstructionSubmit}
                    onVoiceInstruction={(transcript, audioData) => handleInstructionSubmit(transcript)}
                    disabled={isProcessing}
                  />
                  
                  {/* Medical Validation Results */}
                  {validationResults && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-green-800 dark:text-green-200">Medical Validation</span>
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        Clinical Accuracy: {(validationResults.clinicalAccuracy * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>


                {/* Enhanced Manual Content Editor */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] rounded-lg">
                      <Edit3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Manual Editor
                    </h3>
                    <div className="px-3 py-1 bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 dark:from-[#2b6cb0]/30 dark:to-[#1a365d]/30 rounded-full">
                      <span className="text-sm font-bold text-[#1a365d] dark:text-[#90cdf4]">DIRECT EDIT</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      value={currentContent}
                      onChange={(e) => {
                        setCurrentContent(e.target.value)
                        setHasUnsavedChanges(true)
                      }}
                      className="w-full h-96 p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 focus:border-[#63b3ed] dark:focus:border-[#2b6cb0] focus:ring-2 focus:ring-[#63b3ed]/20 resize-none text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                      placeholder="Report content will appear here..."
                      style={{
                        fontSize: '16px',
                        lineHeight: '1.6'
                      }}
                    />
                    
                    {/* Character count and save status */}
                    <div className="absolute bottom-4 right-4 flex items-center space-x-3">
                      <div className="text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded-lg">
                        {currentContent.length} chars
                      </div>
                      {hasUnsavedChanges && (
                        <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                          <AlertCircle className="w-3 h-3" />
                          <span>Unsaved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Processing Status */}
                {isProcessing && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#90cdf4]/20 to-[#63b3ed]/20 rounded-2xl blur-md animate-pulse" />
                    <div className="relative p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-[#63b3ed]/50 shadow-lg">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="relative">
                          <Loader2 className="w-8 h-8 text-[#2b6cb0] animate-spin" />
                          <div className="absolute inset-0 w-8 h-8 border-2 border-[#63b3ed]/30 rounded-full animate-ping" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-[#1a365d] dark:text-[#90cdf4]">
                            Processing Medical Report
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            AI is analyzing and editing your medical content...
                          </div>
                        </div>
                      </div>
                      
                      {processingMetrics.responseTime > 0 && (
                        <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-[#2b6cb0]" />
                            <span className="text-slate-700 dark:text-slate-300">
                              {formatTime(processingMetrics.responseTime)}
                            </span>
                          </div>
                          {processingMetrics.modelUsed && (
                            <div className="flex items-center space-x-2">
                              <Brain className="w-4 h-4 text-[#2b6cb0]" />
                              <span className="text-slate-700 dark:text-slate-300">
                                {processingMetrics.modelUsed}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Performance Metrics Display */}
                {!isProcessing && processingMetrics.responseTime > 0 && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-blue-800 dark:text-blue-200">Performance Metrics</span>
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        Response: {formatTime(processingMetrics.responseTime)} | 
                        Tokens: {processingMetrics.tokenCount} |
                        Model: {processingMetrics.modelUsed}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}

export default ReportEditCard