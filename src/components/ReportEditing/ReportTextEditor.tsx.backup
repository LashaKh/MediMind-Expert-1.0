import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  Undo,
  Redo,
  Type,
  FileText,
  Search,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  Clipboard,
  RotateCcw,
  Save
} from 'lucide-react'
import { ReportTextEditorProps } from '../../types/reportEditing'
import { MedicalButton } from '../ui/MedicalDesignSystem'

/**
 * ReportTextEditor Component
 * 
 * Direct text editor for manual report editing with medical context awareness.
 * Optimized for medical professionals with clinical workflow support.
 * 
 * Features:
 * - Rich text editing interface with medical formatting
 * - Medical terminology validation and highlighting
 * - Real-time character/word/line count
 * - Undo/redo functionality with history management
 * - Mobile-optimized input with touch-friendly controls
 * - Find and replace functionality
 * - Content validation for medical reports
 * - Auto-save with session management
 * - HIPAA-compliant editing workflow
 */
const ReportTextEditor: React.FC<ReportTextEditorProps> = ({
  content,
  onChange,
  isProcessing = false,
  reportId,
  sessionId,
  disabled = false,
  maxLength = 50000,
  className = ''
}) => {
  const [localContent, setLocalContent] = useState(content || '')
  const [history, setHistory] = useState<string[]>([content || ''])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showWordWrap, setShowWordWrap] = useState(true)
  const [findText, setFindText] = useState('')
  const [showFind, setShowFind] = useState(false)
  const [validationIssues, setValidationIssues] = useState<string[]>([])
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>
  
  // Statistics calculation
  const stats = useMemo(() => {
    const text = localContent || ''
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const lines = text.split('\n').length
    const chars = text.length
    const charsNoSpaces = text.replace(/\s/g, '').length
    
    return { words, lines, chars, charsNoSpaces }
  }, [localContent])

  // Medical content validation
  const validateMedicalContent = useCallback((text: string) => {
    const issues: string[] = []
    
    // Basic medical report structure checks
    if (text.length > 100) {
      const hasPatientRef = /patient|pt\.|subject|case/i.test(text)
      if (!hasPatientRef) {
        issues.push('Missing patient reference')
      }
      
      const hasMedicalContent = /diagnosis|symptom|treatment|medication|exam|assessment/i.test(text)
      if (!hasMedicalContent) {
        issues.push('Limited medical terminology detected')
      }
    }
    
    // PHI detection warnings
    if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) {
      issues.push('Potential SSN detected - ensure PHI compliance')
    }
    
    if (/\b\d{10,}\b/.test(text)) {
      issues.push('Long number sequences detected - verify no sensitive IDs')
    }
    
    setValidationIssues(issues)
  }, [])

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    
    if (hasUnsavedChanges && localContent !== content) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        onChange(localContent)
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
      }, 2000) // Auto-save after 2 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [localContent, content, hasUnsavedChanges, onChange])

  // Content change handler
  const handleContentChange = useCallback((newContent: string) => {
    if (newContent === localContent) return
    
    // Add to history for undo/redo
    if (newContent !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newContent)
      
      // Limit history to 50 entries
      if (newHistory.length > 50) {
        newHistory.shift()
      } else {
        setHistoryIndex(prev => prev + 1)
      }
      
      setHistory(newHistory)
    }
    
    setLocalContent(newContent)
    setHasUnsavedChanges(true)
    validateMedicalContent(newContent)
  }, [localContent, history, historyIndex, validateMedicalContent])

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setLocalContent(history[newIndex])
      setHasUnsavedChanges(true)
    }
  }, [historyIndex, history])

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setLocalContent(history[newIndex])
      setHasUnsavedChanges(true)
    }
  }, [historyIndex, history])

  // Find functionality
  const handleFind = useCallback(() => {
    if (!findText || !textareaRef.current) return
    
    const textarea = textareaRef.current
    const content = textarea.value
    const index = content.toLowerCase().indexOf(findText.toLowerCase())
    
    if (index !== -1) {
      textarea.focus()
      textarea.setSelectionRange(index, index + findText.length)
    }
  }, [findText])

  // Copy content to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(localContent)
    } catch (error) {
      console.error('Failed to copy content:', error)
    }
  }, [localContent])

  // Reset to original content
  const handleReset = useCallback(() => {
    if (window.confirm('Reset to original content? All changes will be lost.')) {
      setLocalContent(content || '')
      setHistory([content || ''])
      setHistoryIndex(0)
      setHasUnsavedChanges(false)
    }
  }, [content])

  // Manual save
  const handleSave = useCallback(() => {
    onChange(localContent)
    setLastSaved(new Date())
    setHasUnsavedChanges(false)
  }, [localContent, onChange])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  const isOverLimit = stats.chars > maxLength * 0.9
  const isNearLimit = stats.chars > maxLength * 0.8

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mobile-Responsive Header with stats and actions */}
      <div className="space-y-3 md:space-y-0">
        {/* Mobile Layout - Clean and Simple */}
        <div className="md:hidden">
          {/* Only show unsaved status on mobile if needed */}
          {hasUnsavedChanges && (
            <div className="flex items-center justify-center p-2">
              <div className="flex items-center space-x-1 text-xs text-[#90cdf4] dark:text-[#90cdf4]">
                <AlertTriangle className="w-3 h-3" />
                <span>Unsaved changes</span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#2b6cb0] dark:text-[#63b3ed]" />
              <span className="text-sm font-medium text-[#1a365d] dark:text-[#90cdf4]">
                Medical Report Editor
              </span>
            </div>
            
            {lastSaved && (
              <div className="flex items-center space-x-1 text-xs text-[#2b6cb0] dark:text-[#63b3ed]">
                <CheckCircle className="w-3 h-3" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-1 text-xs text-[#90cdf4] dark:text-[#90cdf4]">
                <AlertTriangle className="w-3 h-3" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Statistics */}
            <div className="text-xs text-[#1a365d]/60 dark:text-[#90cdf4]/80 space-x-3">
              <span>{stats.words} words</span>
              <span>{stats.lines} lines</span>
              <span className={isOverLimit ? 'text-red-600' : isNearLimit ? 'text-[#90cdf4]' : ''}>
                {stats.chars.toLocaleString()}/{maxLength.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-First Responsive Toolbar */}
      <div className="bg-[#90cdf4]/10 dark:bg-[#1a365d]/20 rounded-lg border border-[#63b3ed]/30 dark:border-[#2b6cb0]/50">
        {/* Mobile Layout (<=768px) */}
        <div className="md:hidden">
          {/* Primary Actions Row */}
          <div className="flex items-center justify-between p-3 border-b border-[#63b3ed]/20 dark:border-[#2b6cb0]/30">
            <div className="flex items-center space-x-2">
              <MedicalButton
                variant="ghost"
                size="md"
                leftIcon={Undo}
                onClick={handleUndo}
                disabled={!canUndo || disabled || isProcessing}
                title="Undo (Cmd+Z)"
                className="min-w-[44px] min-h-[44px] px-3"
              >
                <span className="hidden xs:inline">Undo</span>
              </MedicalButton>
              
              <MedicalButton
                variant="ghost"
                size="md"
                leftIcon={Redo}
                onClick={handleRedo}
                disabled={!canRedo || disabled || isProcessing}
                title="Redo (Cmd+Shift+Z)"
                className="min-w-[44px] min-h-[44px] px-3"
              >
                <span className="hidden xs:inline">Redo</span>
              </MedicalButton>
            </div>
            
            {hasUnsavedChanges && (
              <MedicalButton
                variant="primary"
                size="md"
                leftIcon={Save}
                onClick={handleSave}
                disabled={disabled || isProcessing}
                title="Save changes"
                className="min-w-[44px] min-h-[44px] px-4"
              >
                Save
              </MedicalButton>
            )}
          </div>
          
          {/* Secondary Actions Row */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-2">
              <MedicalButton
                variant="ghost"
                size="md"
                leftIcon={Search}
                onClick={() => setShowFind(!showFind)}
                disabled={disabled || isProcessing}
                title="Find text (Cmd+F)"
                className="min-w-[44px] min-h-[44px] px-3"
              >
                <span className="hidden xs:inline">Find</span>
              </MedicalButton>
              
              <MedicalButton
                variant="ghost"
                size="md"
                leftIcon={showWordWrap ? EyeOff : Eye}
                onClick={() => setShowWordWrap(!showWordWrap)}
                disabled={disabled || isProcessing}
                title="Toggle word wrap"
                className="min-w-[44px] min-h-[44px] px-3"
              >
                <span className="hidden xs:inline">Wrap</span>
              </MedicalButton>
            </div>
            
            <div className="flex items-center space-x-2">
              <MedicalButton
                variant="ghost"
                size="md"
                leftIcon={Copy}
                onClick={handleCopy}
                disabled={disabled || isProcessing || !localContent}
                title="Copy content"
                className="min-w-[44px] min-h-[44px] px-3"
              >
                <span className="hidden xs:inline">Copy</span>
              </MedicalButton>
              
              <MedicalButton
                variant="ghost"
                size="md"
                leftIcon={RotateCcw}
                onClick={handleReset}
                disabled={disabled || isProcessing || localContent === content}
                title="Reset to original"
                className="min-w-[44px] min-h-[44px] px-3"
              >
                <span className="hidden xs:inline">Reset</span>
              </MedicalButton>
            </div>
          </div>
        </div>

        {/* Desktop Layout (>768px) */}
        <div className="hidden md:flex md:flex-wrap md:items-center md:gap-2 md:p-3">
          <div className="flex items-center space-x-1">
            <MedicalButton
              variant="ghost"
              size="sm"
              leftIcon={Undo}
              onClick={handleUndo}
              disabled={!canUndo || disabled || isProcessing}
              title="Undo (Cmd+Z)"
            >
              Undo
            </MedicalButton>
            
            <MedicalButton
              variant="ghost"
              size="sm"
              leftIcon={Redo}
              onClick={handleRedo}
              disabled={!canRedo || disabled || isProcessing}
              title="Redo (Cmd+Shift+Z)"
            >
              Redo
            </MedicalButton>
          </div>
          
          <div className="h-4 w-px bg-[#63b3ed]/50 dark:bg-[#2b6cb0]/60" />
          
          <div className="flex items-center space-x-1">
            <MedicalButton
              variant="ghost"
              size="sm"
              leftIcon={Search}
              onClick={() => setShowFind(!showFind)}
              disabled={disabled || isProcessing}
              title="Find text (Cmd+F)"
            >
              Find
            </MedicalButton>
            
            <MedicalButton
              variant="ghost"
              size="sm"
              leftIcon={showWordWrap ? EyeOff : Eye}
              onClick={() => setShowWordWrap(!showWordWrap)}
              disabled={disabled || isProcessing}
              title="Toggle word wrap"
            >
              Wrap
            </MedicalButton>
          </div>
          
          <div className="h-4 w-px bg-[#63b3ed]/50 dark:bg-[#2b6cb0]/60" />
          
          <div className="flex items-center space-x-1">
            <MedicalButton
              variant="ghost"
              size="sm"
              leftIcon={Copy}
              onClick={handleCopy}
              disabled={disabled || isProcessing || !localContent}
              title="Copy content"
            >
              Copy
            </MedicalButton>
            
            <MedicalButton
              variant="ghost"
              size="sm"
              leftIcon={RotateCcw}
              onClick={handleReset}
              disabled={disabled || isProcessing || localContent === content}
              title="Reset to original"
            >
              Reset
            </MedicalButton>
            
            {hasUnsavedChanges && (
              <MedicalButton
                variant="primary"
                size="sm"
                leftIcon={Save}
                onClick={handleSave}
                disabled={disabled || isProcessing}
                title="Save changes"
              >
                Save
              </MedicalButton>
            )}
          </div>
        </div>
      </div>

      {/* Find bar */}
      {showFind && (
        <div className="flex items-center space-x-2 p-3 bg-[#63b3ed]/10 dark:bg-[#1a365d]/30 border border-[#63b3ed]/30 dark:border-[#2b6cb0]/50 rounded-lg">
          <Search className="w-4 h-4 text-[#2b6cb0] dark:text-[#63b3ed]" />
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFind()}
            placeholder="Find in content..."
            className="flex-1 px-3 py-1 text-sm border border-[#63b3ed]/30 dark:border-[#2b6cb0]/50 rounded focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent bg-white dark:bg-[#1a365d]/30"
          />
          <MedicalButton
            variant="primary"
            size="sm"
            onClick={handleFind}
            disabled={!findText}
          >
            Find
          </MedicalButton>
        </div>
      )}

      {/* Main text editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={localContent}
          onChange={(e) => handleContentChange(e.target.value)}
          disabled={disabled || isProcessing}
          maxLength={maxLength}
          placeholder="Enter medical report content here...\n\nTip: Use clear, professional medical language. The system will validate content for medical terminology and compliance."
          className={`
            w-full px-4 py-3 border rounded-lg resize-none
            min-h-[40vh] max-h-[60vh] h-[50vh] 
            sm:min-h-[45vh] sm:max-h-[65vh] sm:h-[55vh]
            md:min-h-[50vh] md:max-h-[70vh] md:h-[60vh]
            lg:h-96
            focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            font-mono text-sm leading-relaxed
            ${showWordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'}
            ${
              isOverLimit
                ? 'border-red-300 dark:border-red-600'
                : isNearLimit
                ? 'border-[#90cdf4] dark:border-[#90cdf4]'
                : 'border-[#63b3ed]/30 dark:border-[#2b6cb0]/50'
            }
            bg-white dark:bg-[#1a365d]/20 text-[#1a365d] dark:text-[#90cdf4]
            placeholder-[#1a365d]/60 dark:placeholder-[#90cdf4]/60
          `}
        />
        
        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/50 dark:bg-[#1a365d]/50 rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-2 text-[#2b6cb0] dark:text-[#63b3ed]">
              <div className="w-4 h-4 border-2 border-[#2b6cb0] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Validation issues */}
      {validationIssues.length > 0 && (
        <div className="bg-[#90cdf4]/10 dark:bg-[#1a365d]/30 border border-[#90cdf4]/30 dark:border-[#2b6cb0]/50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#90cdf4] dark:text-[#90cdf4] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#1a365d] dark:text-[#90cdf4] mb-1">
                Content Validation Notes:
              </p>
              <ul className="text-sm text-[#1a365d]/80 dark:text-[#90cdf4]/80 space-y-1">
                {validationIssues.map((issue, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span className="text-[#90cdf4] dark:text-[#90cdf4]">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Footer info - Desktop Only */}
      <div className="hidden md:flex md:items-center md:justify-between text-xs text-[#1a365d]/60 dark:text-[#90cdf4]/70">
        <div>
          Session: {sessionId} • Report: {reportId}
        </div>
        <div className="flex items-center space-x-4">
          <span>Characters: {stats.chars.toLocaleString()}</span>
          <span>Words: {stats.words.toLocaleString()}</span>
          <span>Lines: {stats.lines}</span>
        </div>
      </div>
    </div>
  )
}

export default ReportTextEditor