import React, { useState, useCallback, useEffect } from 'react'
import {
  Mic,
  CheckCircle,
  Volume2,
  FileText
} from 'lucide-react'
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS'

interface VoiceInstructionTextAreaProps {
  onTranscription: (instruction: string, voiceTranscript?: string) => void
  disabled?: boolean
  language?: string
}

const VoiceInstructionTextArea: React.FC<VoiceInstructionTextAreaProps> = ({
  onTranscription,
  disabled = false,
  language = 'ka-GE'
}) => {
  const [lastTranscript, setLastTranscript] = useState<string>('')
  
  // Use the existing Georgian TTS hook
  const {
    recordingState,
    isTranscribing,
    transcriptionResult,
    error,
    isSupported,
    startRecording,
    stopRecording,
    canRecord,
    canStop,
    clearError,
    clearResult
  } = useGeorgianTTS({
    language,
    enableStreaming: true,
    maxDuration: 60000,
    chunkDuration: 20000,
    autocorrect: true,
    punctuation: true,
    digits: true,
    onLiveTranscriptUpdate: (newText, fullText) => {
      if (fullText && fullText !== lastTranscript) {
        setLastTranscript(fullText)
      }
    }
  })

  // Handle transcription completion
  useEffect(() => {
    if (transcriptionResult?.text && transcriptionResult.text !== lastTranscript) {
      setLastTranscript(transcriptionResult.text)
      setTimeout(() => {
        clearResult()
      }, 1000)
    }
  }, [transcriptionResult, lastTranscript, clearResult])

  // Handle recording toggle
  const handleRecordingToggle = useCallback(async () => {
    if (disabled || !isSupported) return
    
    try {
      if (recordingState.isRecording) {
        await stopRecording()
      } else {
        clearError()
        await startRecording()
      }
    } catch (error) {
      console.error('Recording toggle failed:', error)
    }
  }, [disabled, isSupported, recordingState.isRecording, startRecording, stopRecording, clearError])

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (lastTranscript.trim()) {
      onTranscription(lastTranscript.trim(), lastTranscript.trim())
    }
  }, [lastTranscript, onTranscription])

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#2b6cb0] rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Voice Instruction
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Record or type your editing instruction
              </p>
            </div>
          </div>
          
          {/* Recording Button */}
          <button
            onClick={handleRecordingToggle}
            disabled={disabled || !isSupported || isTranscribing}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
              recordingState.isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-[#2b6cb0] hover:bg-[#1a365d]'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
        
        {/* Status */}
        <div className="mt-3 flex items-center space-x-2">
          {recordingState.isRecording && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">Recording...</span>
            </div>
          )}
          
          {isTranscribing && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-[#2b6cb0]/10 dark:bg-[#2b6cb0]/20 rounded-lg border border-[#2b6cb0]/30 dark:border-[#2b6cb0]/50">
              <Volume2 className="w-4 h-4 text-[#2b6cb0] dark:text-[#63b3ed] animate-pulse" />
              <span className="text-sm font-medium text-[#2b6cb0] dark:text-[#63b3ed]">Processing...</span>
            </div>
          )}
          
          {lastTranscript && !recordingState.isRecording && !isTranscribing && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">Ready to submit</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Textarea Content */}
      <div className="p-6">
        <div className="relative">
          <textarea
            value={lastTranscript || ''}
            onChange={(e) => setLastTranscript(e.target.value)}
            placeholder={recordingState.isRecording 
              ? 'Recording your voice instruction...' 
              : 'Your voice instruction will appear here. You can also type directly to provide editing instructions for the medical report.'
            }
            className="w-full h-48 p-4 text-base leading-relaxed
                      bg-slate-50 dark:bg-slate-800/50 rounded-lg
                      border border-slate-200 dark:border-slate-600
                      text-slate-900 dark:text-slate-100 
                      placeholder-slate-500 dark:placeholder-slate-400
                      focus:ring-2 focus:ring-[#2b6cb0]/50 focus:border-[#2b6cb0] focus:outline-none
                      hover:border-slate-300 dark:hover:border-slate-500
                      resize-vertical transition-all duration-200
                      font-medium"
            disabled={recordingState.isRecording || isTranscribing}
            rows={6}
          />
          
          {/* Character Count */}
          <div className="absolute bottom-3 right-3 text-sm text-slate-500 dark:text-slate-400">
            {lastTranscript?.length || 0} characters
          </div>
        </div>
        
        {/* Submit Button */}
        {lastTranscript && !recordingState.isRecording && !isTranscribing && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-[#2b6cb0] hover:bg-[#1a365d] text-white font-medium rounded-lg
                        focus:ring-2 focus:ring-[#2b6cb0]/50 focus:ring-offset-2 focus:outline-none
                        transform hover:scale-105 transition-all duration-200
                        flex items-center space-x-2 shadow-lg"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Submit Instruction</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VoiceInstructionTextArea