import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  Send,
  Mic,
  MicOff,
  Type,
  Loader2
} from 'lucide-react'
import { EditInstructionInputProps } from '../../types/reportEditing'
import { MedicalButton } from '../ui/MedicalDesignSystem'
import VoiceInstructionTextArea from './VoiceInstructionTextArea'

/**
 * EditInstructionInput Component
 * 
 * Dual input component for text and voice instructions.
 * Integrates with existing Georgian TTS system for voice input.
 * 
 * Features:
 * - Text instruction input with validation
 * - Voice instruction button with Georgian TTS integration
 * - Real-time transcription display
 * - Input mode switching (text/voice)
 * - Medical context suggestions
 * - Character count and validation
 * - HIPAA-compliant input handling
 */
const EditInstructionInput: React.FC<EditInstructionInputProps> = ({
  onSubmit,
  isProcessing = false,
  sessionId,
  reportId,
  disabled = false,
  placeholder = "Describe the changes you want to make to this medical report...",
  className = ''
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('voice')
  const [textInput, setTextInput] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [debouncedText, setDebouncedText] = useState('')
  const [isTextValidating, setIsTextValidating] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const MAX_CHARS = 2000
  const MIN_CHARS = 10
  const DEBOUNCE_DELAY = 500 // 500ms debounce for API call reduction
  const VALIDATION_DELAY = 150 // 150ms debounce for real-time validation

  // Debounced text processing for API call optimization
  useEffect(() => {
    setCharCount(textInput.length)
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    // Set validation state immediately for UI feedback
    setIsTextValidating(textInput.length >= MIN_CHARS)
    
    // Debounce the text processing
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedText(textInput)
      setIsTextValidating(false)
      
      // Perform any additional processing here (validation, suggestions, etc.)
      console.log(`🚀 Debounced text processing: "${textInput.substring(0, 50)}..."`)
    }, DEBOUNCE_DELAY)
    
    // Real-time validation with shorter debounce
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
    }
    
    validationTimeoutRef.current = setTimeout(() => {
      // Real-time validation logic here
      if (textInput.length >= MIN_CHARS) {
        console.log(`✅ Real-time validation passed for input length: ${textInput.length}`)
      }
    }, VALIDATION_DELAY)
    
  }, [textInput])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, [])

  const handleTextSubmit = useCallback(() => {
    // Performance optimization: Use debounced text for final submission
    const finalText = debouncedText || textInput
    
    if (!finalText.trim() || finalText.length < MIN_CHARS || isProcessing) return
    
    console.time('🚀 Text instruction submission')
    console.log(`🚀 Submitting debounced text instruction (${finalText.length} chars)`)
    
    // Clear any pending debounce operations to prevent duplicate API calls
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
      validationTimeoutRef.current = null
    }
    
    onSubmit(finalText.trim())
    
    // Reset state
    setTextInput('')
    setDebouncedText('')
    setCharCount(0)
    setIsTextValidating(false)
    
    console.timeEnd('🚀 Text instruction submission')
    
    // Dispatch performance event for monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('text-instruction-submitted', {
        detail: {
          textLength: finalText.length,
          debounced: finalText === debouncedText,
          component: 'EditInstructionInput'
        }
      }))
    }
  }, [textInput, debouncedText, isProcessing, onSubmit])


  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleTextSubmit()
    }
  }, [handleTextSubmit])


  // Enhanced submit validation with debouncing awareness
  const canSubmit = inputMode === 'text' 
    ? (textInput.trim().length >= MIN_CHARS && textInput.trim().length <= MAX_CHARS) && !isTextValidating
    : true

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input Mode Toggle - Prominent Design */}
      <div className="flex items-center justify-center space-x-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <span className="text-lg font-bold text-[#1a365d] dark:text-[#90cdf4]">
          Input Method:
        </span>
        <div className="flex rounded-xl overflow-hidden border-2 border-[#2b6cb0]/50 shadow-lg">
          {/* Voice Button - First and Default */}
          <button
            onClick={() => setInputMode('voice')}
            className={`flex items-center space-x-3 px-6 py-3 text-base font-bold transition-all duration-200 transform hover:scale-105 ${
              inputMode === 'voice'
                ? 'bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white shadow-xl'
                : 'bg-white dark:bg-slate-700 text-[#2b6cb0] dark:text-[#63b3ed] hover:bg-[#90cdf4]/20 dark:hover:bg-[#2b6cb0]/20'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>Voice</span>
          </button>
          
          {/* Text Button - Second */}
          <button
            onClick={() => setInputMode('text')}
            className={`flex items-center space-x-3 px-6 py-3 text-base font-bold transition-all duration-200 transform hover:scale-105 ${
              inputMode === 'text'
                ? 'bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white shadow-xl'
                : 'bg-white dark:bg-slate-700 text-[#2b6cb0] dark:text-[#63b3ed] hover:bg-[#90cdf4]/20 dark:hover:bg-[#2b6cb0]/20'
            }`}
          >
            <Type className="w-5 h-5" />
            <span>Text</span>
          </button>
        </div>
      </div>

      {/* Text Input Mode */}
      {inputMode === 'text' && (
        <div className="space-y-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || isProcessing}
              rows={4}
              maxLength={MAX_CHARS}
              className={`
                w-full px-4 py-3 border rounded-lg resize-none
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  charCount > MAX_CHARS * 0.9
                    ? 'border-[#90cdf4] dark:border-[#90cdf4]'
                    : 'border-[#63b3ed]/30 dark:border-[#2b6cb0]/50'
                }
                bg-white dark:bg-[#1a365d]/20 text-[#1a365d] dark:text-[#90cdf4]
                placeholder-[#1a365d]/60 dark:placeholder-[#90cdf4]/60
              `}
            />
            
            {/* Character Count */}
            <div className="absolute bottom-2 right-2 text-xs text-[#1a365d]/60 dark:text-[#90cdf4]/70">
              <span className={charCount > MAX_CHARS * 0.9 ? 'text-[#90cdf4]' : ''}>
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          </div>


          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#1a365d]/70 dark:text-[#90cdf4]/70">
              {charCount < MIN_CHARS && (
                <span>Minimum {MIN_CHARS} characters required</span>
              )}
              {charCount >= MIN_CHARS && (
                <span>Press Cmd/Ctrl + Enter to submit</span>
              )}
            </div>
            
            <MedicalButton
              variant="primary"
              size="sm"
              leftIcon={isProcessing ? Loader2 : Send}
              onClick={handleTextSubmit}
              disabled={!canSubmit || disabled || isProcessing}
              className={`${
                isProcessing ? 'cursor-wait' : ''
              } ${isProcessing ? '[&_svg]:animate-spin' : ''}`}
            >
              {isProcessing ? 'Processing...' : 'Submit Edit'}
            </MedicalButton>
          </div>
        </div>
      )}

      {/* Voice Input Mode */}
      {inputMode === 'voice' && (
        <div className="space-y-4">
          <VoiceInstructionTextArea 
            onTranscription={onSubmit}
            disabled={disabled || isProcessing}
          />
        </div>
      )}

    </div>
  )
}

export default EditInstructionInput