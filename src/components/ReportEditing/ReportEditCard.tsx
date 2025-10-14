import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Edit3, Loader2, Brain,
  Activity, AlertCircle, Clock, Shield, Save, CheckCircle, HeartHandshake
} from 'lucide-react'

import EditInstructionInput from './EditInstructionInput'
import {
  HEART_FAILURE_DIAGNOSIS,
  ACUTE_ISCHAEMIC_DIAGNOSIS,
  PULMONARY_EMBOLISM_DIAGNOSIS,
  STEMI_DIAGNOSIS,
  ANGINA_PECTORIS_DIAGNOSIS,
  AV_BLOCK_DIAGNOSIS,
  type DiagnosisContext
} from '../../services/diagnosisFlowiseService'

interface ReportMetadata {
  cardTitle: string
  reportType: string
  diagnosisCode?: string
  diagnosisName?: string
  originalSessionId?: string
}

interface ReportEditCardProps {
  reportId: string
  initialContent: string
  sessionId: string
  flowiseEndpoint?: string
  onEditComplete: (result: any) => void
  onError: (error: Error) => void
  className?: string
  reportMetadata?: ReportMetadata
}

const ReportEditCard: React.FC<ReportEditCardProps> = ({
  reportId,
  initialContent,
  sessionId,
  flowiseEndpoint,
  onEditComplete,
  onError,
  className = '',
  reportMetadata
}) => {
  const [currentContent, setCurrentContent] = useState(initialContent)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Auto-save state
  const [isSaving, setIsSaving] = useState(false)
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

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

  // UNIFIED ENDPOINT - Same as Form 100 generation (exact pattern)
  const UNIFIED_FORM100_ENDPOINT = "https://flowise-2-0.onrender.com/api/v1/prediction/0dfbbc44-76d0-451f-b7ca-92a96f862924";

  // Diagnosis mapping - Convert ICD codes to Georgian diagnosis names
  const getDiagnosisMapping = useCallback((icdCode: string): DiagnosisContext | null => {
    const diagnoses = [
      HEART_FAILURE_DIAGNOSIS,       // I50.0
      ACUTE_ISCHAEMIC_DIAGNOSIS,     // I24.9
      PULMONARY_EMBOLISM_DIAGNOSIS,  // I26.0
      STEMI_DIAGNOSIS,               // I21.0
      ANGINA_PECTORIS_DIAGNOSIS,     // I20.8
      AV_BLOCK_DIAGNOSIS             // I44.(-)
    ];

    return diagnoses.find(d => d.icdCode === icdCode || d.icdCode.startsWith(icdCode.split('.')[0])) || null;
  }, []);

  // Unified request formatter using EXACT same pattern as original generation
  const formatEditRequest = useCallback((content: string, instruction: string, metadata?: ReportMetadata) => {
    // Parse diagnosis info from existing card title if not provided in metadata
    let diagnosisCode = metadata?.diagnosisCode;
    let diagnosisName = metadata?.diagnosisName;

    // If diagnosis info not in metadata, try to parse from cardTitle
    if (!diagnosisCode || !diagnosisName) {
      const originalTitle = metadata?.cardTitle || '';
      // Extract ICD code from patterns like "Heart Failure ER Report (I50.0)" or "Initial Diagnosis - (I21.0) ST ელევაციური მიოკარდიუმის ინფარქტი"
      const codeMatch = originalTitle.match(/\(([^)]+)\)/); // Extract (I50.0)

      if (codeMatch) {
        diagnosisCode = codeMatch[1]; // I50.0

        // Use Georgian diagnosis mapping to get the correct Georgian name
        const diagnosisMapping = getDiagnosisMapping(diagnosisCode);
        if (diagnosisMapping) {
          diagnosisName = diagnosisMapping.diagnosisGeorgian; // Use Georgian name from mapping
          console.log('🔍 Mapped ICD code to Georgian:', {
            code: diagnosisCode,
            georgian: diagnosisName,
            english: diagnosisMapping.diagnosisEnglish
          });
        } else {
          // Fallback: extract name from title and clean it up
          const nameMatch = originalTitle.replace(/\s*\([^)]*\).*$/, '').trim();
          diagnosisName = nameMatch
            .replace(/^Form 100 -\s*/, '')
            .replace(/\s*ER Report$/, '')
            .replace(/^Initial Diagnosis -\s*/, '')
            .trim();
          console.log('⚠️ No mapping found for ICD code, using fallback:', diagnosisCode, diagnosisName);
        }
      }
    }

    // Reconstruct EXACT same card title format as original generation
    let cardTitle: string;
    let reportType: string;

    // Determine if this is Form 100 or Initial Consult based on metadata
    if (metadata?.reportType === 'form 100' || metadata?.cardTitle?.startsWith('Form 100 -')) {
      // Form 100 format: "Form 100 - (CODE) GEORGIAN_NAME" (from form100Service.ts:232)
      cardTitle = (diagnosisCode && diagnosisName)
        ? `Form 100 - (${diagnosisCode}) ${diagnosisName}`
        : 'Form 100 - Emergency Report';
      reportType = 'form 100';
    } else {
      // Initial Consult format: "Initial Diagnosis - (CODE) NAME" (from GeorgianSTTApp.tsx:478)
      cardTitle = (diagnosisCode && diagnosisName)
        ? `Initial Diagnosis - (${diagnosisCode}) ${diagnosisName}`
        : metadata?.cardTitle || 'Medical Report';
      reportType = 'Initial Consult';
    }

    console.log('🔧 Reconstructed card title:', {
      original: metadata?.cardTitle,
      parsed: { diagnosisCode, diagnosisName },
      final: cardTitle,
      type: reportType
    });

    // Use EXACT same question format as original generation but with edit instruction
    const questionContent = `Card Title: ${cardTitle}
Type: ${reportType}

Generated Initial Consult:
${content}

User Edit Instruction:
${instruction}`;

    // Use EXACT same request format as form100Service.ts (lines 244-249)
    return {
      question: questionContent,
      overrideConfig: {
        sessionId: metadata?.originalSessionId || sessionId
      }
    };
  }, [sessionId]);

  // Update content when initialContent changes
  useEffect(() => {
    setCurrentContent(initialContent)
    setHasUnsavedChanges(false)
  }, [initialContent])

  // Auto-save functionality
  useEffect(() => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Don't auto-save if content hasn't changed or if processing
    if (!hasUnsavedChanges || isProcessing || currentContent === initialContent) {
      return
    }

    // Set saving state immediately
    setIsSaving(true)

    // Auto-save after 2 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        // Trigger edit complete callback with the updated content
        onEditComplete({
          success: true,
          content: currentContent,
          instruction: 'Manual edit auto-saved',
          timestamp: Date.now(),
          autoSaved: true
        })

        // Update save status
        const now = new Date()
        setLastAutoSaved(now)
        setLastSaved(now)
        setHasUnsavedChanges(false)
        setIsSaving(false)
      } catch (error) {
        setIsSaving(false)
        onError(error as Error)
      }
    }, 2000)

    // Cleanup timeout on unmount or content change
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [currentContent, hasUnsavedChanges, isProcessing, initialContent, onEditComplete, onError])

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
      setCurrentContent(event.detail.content || initialContent)
      setHasUnsavedChanges(false)
    }

    const handleServiceDegraded = (event: CustomEvent) => {
      setEmergencyMode(true)
      setUrgencyLevel('high')
    }

    const handleMedicalError = (event: CustomEvent) => {
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

    console.log('🚀 Starting edit instruction processing...', { instruction });
    setIsProcessing(true)
    const startTime = Date.now()

    try {
      setProcessingMetrics(prev => ({
        ...prev,
        responseTime: 0,
        modelUsed: 'Processing Medical Report Edit...'
      }))

      console.log('⏳ Processing state set, UI should show loading...');

      let response
      let responseText = ''

      // Use EXACT same direct Flowise call as form100Service.ts (lines 256-262)
      const requestPayload = formatEditRequest(currentContent, instruction, reportMetadata);

      console.log('📡 Sending request to Flowise...', {
        endpoint: UNIFIED_FORM100_ENDPOINT,
        payloadPreview: {
          question: requestPayload.question.substring(0, 200) + '...',
          sessionId: requestPayload.overrideConfig.sessionId
        }
      });

      const flowiseResponse = await fetch(UNIFIED_FORM100_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      console.log('📨 Flowise response status:', flowiseResponse.status);

      if (!flowiseResponse.ok) {
        throw new Error(`Flowise error: ${flowiseResponse.status}`)
      }

      response = await flowiseResponse.json()
      console.log('📄 Flowise response received, length:', response?.text?.length || 0);

      // Use EXACT same response parsing as form100Service.ts (line 277)
      responseText = response.text || response.response || response.answer || 'No response from AI'

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

      console.log('✅ Edit processing completed successfully!', {
        processingTime: responseTime,
        contentLength: responseText.length
      });

    } catch (error) {
      console.error('❌ Edit processing failed:', error);
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


  // Processing Modal Component (rendered via portal)
  const ProcessingModal = () => {
    if (!isProcessing) return null

    return createPortal(
      <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center animate-in fade-in duration-300">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 shadow-2xl p-8 mx-4 max-w-sm w-full text-center animate-in slide-in-from-bottom-4 duration-500">
          {/* Animated medical icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse">
            <HeartHandshake className="w-8 h-8 text-white animate-bounce" />
          </div>

          {/* Processing text */}
          <h3 className="text-lg font-bold text-[#1a365d] dark:text-[#90cdf4] mb-2">
            Editing Medical Report
          </h3>
          <p className="text-sm text-[#2b6cb0] dark:text-[#63b3ed] mb-4">
            Our specialized AI is analyzing your edit instructions and updating the medical report...
          </p>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 text-xs text-[#2b6cb0]/60 dark:text-[#63b3ed]/60">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[#2b6cb0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#2b6cb0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#2b6cb0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="ml-2">Processing...</span>
          </div>

          {/* Estimated time */}
          <div className="mt-3 text-xs text-[#2b6cb0]/60 dark:text-[#63b3ed]/60">
            Applying edit instructions...
          </div>
        </div>
      </div>,
      document.body
    )
  }

  return (
    <>
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

                      {/* Auto-save status indicators */}
                      {isSaving && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Saving...</span>
                        </div>
                      )}

                      {!isSaving && lastAutoSaved && !hasUnsavedChanges && (
                        <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                          <CheckCircle className="w-3 h-3" />
                          <span>Saved {lastAutoSaved.toLocaleTimeString()}</span>
                        </div>
                      )}

                      {!isSaving && hasUnsavedChanges && (
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

      {/* Portal-based Processing Modal */}
      <ProcessingModal />
    </>
  )
}

export default ReportEditCard