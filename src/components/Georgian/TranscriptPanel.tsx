import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Square,
  Upload,
  Copy,
  Download,
  Edit3,
  X,
  Save,
  AlertCircle,
  Stethoscope,
  Clock,
  Volume2,
  FileText,
  User,
  Brain,
  Send,
  Loader2,
  History,
  Trash2,
  MessageSquare,
  Hash,
  Lightbulb,
  ChevronDown,
  Undo,
  Redo,
  Paperclip,
  FileIcon,
  Shield,
  Activity
} from 'lucide-react';
import { GeorgianSession } from '../../hooks/useSessionManagement';
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS';

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface TranscriptPanelProps {
  currentSession: GeorgianSession | null;
  recordingState: {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    audioLevel: number;
    isProcessingChunks: boolean;
    processedChunks: number;
    totalChunks: number;
  };
  isTranscribing: boolean;
  transcriptionResult: {
    text: string;
    timestamp: number;
    duration: number;
  } | null;
  error: string | null;
  isSupported: boolean;
  canRecord: boolean;
  canStop: boolean;
  canPause: boolean;
  canResume: boolean;
  remainingTime: number;
  isNearMaxDuration: boolean;
  
  // Recording actions
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onFileUpload: (file: File) => void;
  onClearError: () => void;
  onClearResult: () => void;
  
  // Session actions
  onUpdateTranscript: (transcript: string, duration?: number) => void;
  onAppendTranscript?: (newText: string, duration?: number) => void;
  
  // AI Processing props
  processing?: boolean;
  aiError?: string | null;
  processingHistory?: ProcessingHistory[];
  onProcessText?: (instruction: string) => void;
  onClearAIError?: () => void;
  onClearHistory?: () => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  currentSession,
  recordingState,
  isTranscribing,
  transcriptionResult,
  error,
  canRecord,
  canStop,
  onStartRecording,
  onStopRecording,
  onFileUpload,
  onClearError,
  onUpdateTranscript,
  onAppendTranscript,
  processing = false,
  aiError = null,
  processingHistory = [],
  onProcessText,
  onClearAIError,
  onClearHistory
}) => {
  const [activeTab, setActiveTab] = useState<'transcript' | 'context' | 'ai'>('transcript');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [contextText, setContextText] = useState('');
  const [isRecordingContext, setIsRecordingContext] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  // Context recording TTS - separate instance with 5-second chunks
  const {
    recordingState: contextRecordingState,
    isTranscribing: isContextTranscribing,
    transcriptionResult: contextTranscriptionResult,
    error: contextTTSError,
    startRecording: startContextRecording,
    stopRecording: stopContextRecording,
    clearError: clearContextTTSError,
    clearResult: clearContextTTSResult,
    canRecord: canContextRecord,
    canStop: canContextStop
  } = useGeorgianTTS({
    language: 'ka-GE',
    autocorrect: true,
    punctuation: true,
    digits: true,
    maxDuration: 0,
    chunkDuration: 5000, // 5 second chunks for context notes
    sessionId: `context_${currentSession?.id}`, // Separate session for context
    onLiveTranscriptUpdate: (newText: string) => {
      // Add transcribed text to context area
      if (newText.trim()) {
        setContextText(prev => prev + (prev ? '\n\n' : '') + newText.trim());
      }
    }
  });
  
  // Ref for auto-scrolling transcript
  const transcriptRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contextFileInputRef = useRef<HTMLInputElement>(null);
  
  // Get current transcript text
  const currentTranscript = currentSession?.transcript || transcriptionResult?.text || '';
  const hasTranscript = currentTranscript.trim().length > 0;
  
  // Auto-scroll transcript when new content appears during recording
  useEffect(() => {
    if (recordingState.isRecording && transcriptRef.current && currentTranscript) {
      // Smooth scroll to bottom to show latest transcript
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [currentTranscript, recordingState.isRecording]);

  // Sync context recording state with actual recording state
  useEffect(() => {
    setIsRecordingContext(contextRecordingState.isRecording);
  }, [contextRecordingState.isRecording]);

  // Handle context transcription results
  useEffect(() => {
    if (contextTranscriptionResult && !contextRecordingState.isRecording) {
      // Add final transcription result to context if not already added via live updates
      const newText = contextTranscriptionResult.text.trim();
      if (newText && !contextText.includes(newText)) {
        setContextText(prev => prev + (prev ? '\n\n' : '') + newText);
      }
      
      // Also append to main transcript if there's a current session
      if (currentSession && onAppendTranscript && newText) {
        onAppendTranscript(`Context Note: ${newText}`);
      }
      
      // Clear the result
      clearContextTTSResult();
    }
  }, [contextTranscriptionResult, contextRecordingState.isRecording, currentSession, onAppendTranscript, contextText, clearContextTTSResult]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleEditStart = () => {
    setEditedTranscript(currentSession?.transcript || transcriptionResult?.text || '');
    setIsEditing(true);
  };

  const handleEditSave = () => {
    if (currentSession && editedTranscript.trim()) {
      onUpdateTranscript(editedTranscript.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedTranscript('');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'audio/mp3' || file.type === 'audio/mpeg' || file.type === 'audio/wav') {
        onFileUpload(file);
      } else {
        alert('Please select an MP3 or WAV audio file');
      }
    }
  };

  const copyToClipboard = () => {
    const text = currentSession?.transcript || transcriptionResult?.text || '';
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  const downloadTranscription = () => {
    const text = currentSession?.transcript || transcriptionResult?.text || '';
    if (text) {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `georgian-transcript-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };


  const tabs = [
    { id: 'transcript', label: 'Transcript', icon: FileText },
    { id: 'context', label: 'Context', icon: User },
    { id: 'ai', label: 'AI Processing', icon: Brain }
  ] as const;

  const renderTranscriptContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Transcript
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEditSave}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center space-x-1"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleEditCancel}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
          
          <textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            className="w-full h-80 p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-base leading-relaxed"
            placeholder="Enter Georgian medical transcript here..."
            dir="auto"
          />
        </div>
      );
    }

    if (hasTranscript) {
      return (
        <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-gray-600/50 shadow-sm h-96 flex flex-col">
          {/* Enhanced Live Streaming Indicator */}
          {recordingState.isRecording && (
            <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-gray-600/50 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                </div>
                <span className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">Live Transcription</span>
                {error && error.includes('experiencing issues') && (
                  <div className="flex items-center space-x-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    <span>Service Degraded</span>
                  </div>
                )}
              </div>
              {recordingState.isProcessingChunks && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                  <div className="w-3 h-3 border border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <span>Processing</span>
                </div>
              )}
            </div>
          )}
          
          {/* Enhanced Medical Transcript Content */}
          <div 
            ref={transcriptRef}
            className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth"
          >
            <div 
              className="text-gray-900 dark:text-white text-lg lg:text-xl leading-relaxed whitespace-pre-wrap selection:bg-blue-200 dark:selection:bg-blue-800 selection:text-blue-900 dark:selection:text-blue-100"
              style={{ 
                fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                lineHeight: '1.8'
              }}
              dir="auto"
            >
              {currentTranscript}
              {/* Enhanced Typing Indicator */}
              {recordingState.isRecording && recordingState.isProcessingChunks && (
                <span className="inline-flex items-center ml-3 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75 mr-1"></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></span>
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Ready for Medical Transcription
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-8">
            Begin your Georgian medical transcription session. Your speech will be converted to text in real-time with medical terminology recognition.
          </p>
        </div>
      </div>
    );
  };

  const handleContextFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleContextVoiceRecord = useCallback(() => {
    if (contextRecordingState.isRecording) {
      // Stop recording
      stopContextRecording();
      setIsRecordingContext(false);
    } else if (canContextRecord) {
      // Start recording
      startContextRecording();
      setIsRecordingContext(true);
    }
  }, [contextRecordingState.isRecording, canContextRecord, startContextRecording, stopContextRecording]);

  const copyContextText = () => {
    navigator.clipboard.writeText(contextText);
  };


  const renderContextContent = () => {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-800">
        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {/* Text Area with Toolbar */}
          <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {/* Voice Record Button */}
                <button
                  onClick={handleContextVoiceRecord}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isRecordingContext 
                      ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                  title="Record voice note"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                <div className="relative">
                  <button className="flex items-center space-x-1 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors duration-200">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Undo/Redo */}
                <button
                  className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors duration-200"
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors duration-200"
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {/* Copy Dropdown */}
                <div className="relative">
                  <button
                    onClick={copyContextText}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors duration-200"
                  >
                    <span className="text-sm">Copy</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Attached Files Display */}
            {attachedFiles.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full text-sm">
                      <FileIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-900 dark:text-blue-100 truncate max-w-32">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeAttachedFile(index)}
                        className="p-0.5 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Text Area */}
            <div className="flex-1 relative">
              <textarea
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                placeholder="Add any additional context about the patient or paste files here"
                className="w-full h-full p-4 pr-12 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 text-base leading-relaxed"
                style={{ minHeight: '300px' }}
              />
              
              {/* Attachment Upload Icon */}
              <div className="absolute bottom-4 right-4">
                <input
                  ref={contextFileInputRef}
                  type="file"
                  multiple
                  onChange={handleContextFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp3,.wav"
                />
                <button
                  onClick={() => contextFileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  title="Attach files"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
              
              {/* Recording Indicator */}
              {isRecordingContext && (
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Recording... {formatTime(contextRecordingState.duration)}
                  </span>
                </div>
              )}
              
              {/* Context Transcribing Indicator */}
              {isContextTranscribing && !isRecordingContext && (
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Processing...
                  </span>
                </div>
              )}
              
              {/* Context Recording Error */}
              {contextTTSError && (
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Recording failed
                  </span>
                  <button
                    onClick={clearContextTTSError}
                    className="text-red-500 hover:text-red-700 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    );
  };

  const [instruction, setInstruction] = useState('');

  const SAMPLE_INSTRUCTIONS = [
    'Summarize this medical consultation in English',
    'Extract patient symptoms and complaints',
    'Identify medical diagnoses mentioned',
    'List all medications discussed',
    'Create medical notes from this consultation',
    'Extract vital signs and measurements',
    'Identify any treatment plans or recommendations',
    'Translate medical terms to English'
  ];

  const handleProcessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instruction.trim() && onProcessText) {
      onProcessText(instruction.trim());
      setInstruction('');
    }
  };

  const formatProcessingTime = (ms: number) => {
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const renderAIContent = () => {
    const transcript = currentSession?.transcript || transcriptionResult?.text || '';
    const hasTranscript = transcript.length > 0;

    return (
      <div className="h-full flex flex-col">
        {/* AI Processing Header */}
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Medical Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered medical transcript processing
              </p>
            </div>
          </div>

          {/* Processing Form */}
          {hasTranscript && (
            <form onSubmit={handleProcessSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="Describe what you want to extract or analyze from the transcript..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  rows={3}
                  disabled={processing}
                />
                <button
                  type="submit"
                  disabled={processing || !instruction.trim()}
                  className="absolute bottom-3 right-3 p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Sample Instructions */}
          {hasTranscript && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Instructions:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_INSTRUCTIONS.slice(0, 4).map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => setInstruction(sample)}
                    disabled={processing}
                    className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors duration-200 disabled:opacity-50"
                  >
                    {sample.length > 25 ? sample.substring(0, 25) + '...' : sample}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History Controls */}
          {processingHistory && processingHistory.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <History className="w-4 h-4" />
                <span>{processingHistory.length} analysis{processingHistory.length !== 1 ? 'es' : ''}</span>
              </div>
              {onClearHistory && (
                <button
                  onClick={onClearHistory}
                  className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* AI Error Display */}
        {aiError && (
          <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">AI Processing Error</h4>
                  {onClearAIError && (
                    <button
                      onClick={onClearAIError}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{aiError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {!hasTranscript ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Transcript Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm">
                  Start recording or upload an audio file to enable AI-powered medical analysis.
                </p>
              </div>
            </div>
          ) : processingHistory && processingHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready for AI Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm mb-4">
                  Use the form above to analyze your medical transcript with AI. You can extract symptoms, diagnoses, medications, and more.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {processingHistory && processingHistory.map((item, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4"
                >
                  {/* Analysis Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-3 h-3 text-white" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        AI Analysis #{processingHistory.length - index}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatProcessingTime(item.processingTime)}</span>
                      {item.tokensUsed && (
                        <>
                          <Hash className="w-3 h-3" />
                          <span>{item.tokensUsed}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* User Instruction */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Instruction:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/20 rounded-md p-2">
                      {item.userInstruction}
                    </p>
                  </div>

                  {/* AI Response */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-green-600 dark:text-green-400">AI Response:</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(item.aiResponse)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                        title="Copy response"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20 rounded-md p-3 whitespace-pre-wrap">
                      {item.aiResponse}
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Model: {item.model} • {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Enhanced Medical Professional Header - Responsive */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 sm:p-4 lg:p-6 border-b border-slate-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
              </div>
              {recordingState.isRecording && (
                <div className="absolute -top-1 -right-1 w-3 sm:w-4 h-3 sm:h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm">
                  <div className="w-full h-full bg-red-400 rounded-full animate-ping" />
                </div>
              )}
            </div>
          </div>

          {/* Desktop Control Buttons - Hidden on Mobile */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* Upload Button - Medical Style */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">Upload</span>
            </button>
            
            {/* Enhanced Recording Button - Desktop Only */}
            <button
              onClick={canRecord ? onStartRecording : canStop ? onStopRecording : undefined}
              disabled={isTranscribing}
              className={`
                flex items-center space-x-2 lg:space-x-3 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 min-h-[44px] lg:min-h-[52px]
                ${canRecord 
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-green-500/25' 
                  : canStop
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-500/25'
                    : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400 shadow-none'
                }
              `}
            >
              <Mic className="w-5 h-5" />
              <span className="text-sm lg:text-base">
                {recordingState.isRecording ? 'Stop Recording' : 'Start Transcribing'}
              </span>
            </button>
          </div>
          
          {/* Mobile: Compact Upload Button Only */}
          <div className="sm:hidden">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-all duration-200 shadow-sm"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Enhanced Recording Status - Medical Professional Style */}
        {recordingState.isRecording && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 border border-red-200/50 dark:border-red-700/30 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping" />
                  </div>
                  <span className="text-red-700 dark:text-red-300 font-semibold">Live Recording</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-semibold">{formatTime(recordingState.duration)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-slate-500" />
                <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-200 rounded-full"
                    style={{ width: `${Math.round(recordingState.audioLevel)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500 min-w-[32px]">
                  {Math.round(recordingState.audioLevel)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Smart Segmentation Status */}
        {recordingState.isProcessingChunks && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 border border-emerald-200/50 dark:border-emerald-700/30 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                <div>
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold block">
                    Auto-Processing Active
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs">
                    Continuous 23-second segments
                  </span>
                </div>
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 text-xs font-medium px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                Seamless Mode
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced Legacy Chunked Processing Status */}
        {recordingState.isProcessingChunks && recordingState.totalChunks > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200/50 dark:border-blue-700/30 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-blue-700 dark:text-blue-300 font-semibold">
                  Processing: {recordingState.processedChunks}/{recordingState.totalChunks} chunks
                </span>
              </div>
              <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                {Math.round((recordingState.processedChunks / recordingState.totalChunks) * 100)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800/30 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ 
                  width: `${recordingState.totalChunks > 0 ? (recordingState.processedChunks / recordingState.totalChunks) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Enhanced Transcription Processing Status */}
        {isTranscribing && (
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10 border border-purple-200/50 dark:border-purple-700/30 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <div>
                <span className="text-purple-700 dark:text-purple-300 font-semibold block">Processing Audio</span>
                <span className="text-purple-600 dark:text-purple-400 text-xs">AI transcription in progress...</span>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Medical Tab Navigation */}
        <div className="flex space-x-1 bg-slate-100/80 dark:bg-slate-700/50 p-1.5 rounded-xl backdrop-blur-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 min-h-[48px]
                  ${isActive
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/10 border border-blue-200/50 dark:border-blue-700/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-600/50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Enhanced Professional Action Buttons */}
        {activeTab === 'transcript' && hasTranscript && (
          <div className="flex items-center space-x-2 mt-4">
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md min-h-[44px]"
              title="Copy transcript to clipboard"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Copy</span>
            </button>
            <button
              onClick={downloadTranscription}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md min-h-[44px]"
              title="Download transcript as file"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Download</span>
            </button>
            <button
              onClick={handleEditStart}
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-700/30 dark:hover:bg-blue-600/40 text-blue-700 dark:text-blue-200 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md min-h-[44px]"
              title="Edit transcript content"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Edit</span>
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Medical Error Display */}
      {error && (
        <div className="mx-4 lg:mx-6 mt-4 p-5 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200/50 dark:border-red-700/50 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base font-semibold text-red-800 dark:text-red-200">System Alert</h4>
                <button
                  onClick={onClearError}
                  className="text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'transcript' && (
          <div className="p-6">
            {renderTranscriptContent()}
          </div>
        )}
        {activeTab === 'context' && renderContextContent()}
        {activeTab === 'ai' && renderAIContent()}
      </div>
    </div>
  );
};