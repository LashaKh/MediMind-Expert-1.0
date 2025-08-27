import React, { useState, useRef, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import { GeorgianSession } from '../../hooks/useSessionManagement';

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
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 h-96 flex flex-col">
          {/* Live Streaming Indicator */}
          {recordingState.isRecording && (
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-700 dark:text-green-400 font-medium">Live transcription</span>
                {error && error.includes('experiencing issues') && (
                  <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
                    <div className="w-1 h-1 bg-amber-500 rounded-full" />
                    <span>Service degraded</span>
                  </div>
                )}
              </div>
              {recordingState.isProcessingChunks && (
                <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
                  <div className="w-3 h-3 border border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>
          )}
          
          {/* Scrollable Transcript Content */}
          <div 
            ref={transcriptRef}
            className="flex-1 overflow-y-auto p-6 scroll-smooth"
          >
            <div 
              className="text-gray-900 dark:text-white text-lg leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: 'Georgia, serif' }}
              dir="auto"
            >
              {currentTranscript}
              {/* Typing indicator while processing */}
              {recordingState.isRecording && recordingState.isProcessingChunks && (
                <span className="inline-flex items-center ml-2">
                  <span className="animate-pulse text-blue-500">●</span>
                  <span className="animate-pulse text-blue-500 delay-75">●</span>
                  <span className="animate-pulse text-blue-500 delay-150">●</span>
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Transcription not started
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm">
            Your live transcription will stream here in real-time as you speak
          </p>
          <button
            onClick={canRecord ? onStartRecording : undefined}
            disabled={!canRecord}
            className="mt-6 px-6 py-3 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <Mic className="w-5 h-5" />
            <span>Start transcribing</span>
          </button>
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

  const handleContextVoiceRecord = () => {
    if (isRecordingContext) {
      setIsRecordingContext(false);
      // In a real implementation, this would stop the recording
      // and add the transcribed text to the context text area
      // For now, we'll simulate adding some text
      const voiceNoteText = '[Voice note transcribed text would appear here]';
      setContextText(prev => prev + (prev ? '\n\n' : '') + voiceNoteText);
      
      // Also append to the main transcript if there's a current session
      if (currentSession && onAppendTranscript) {
        onAppendTranscript(`Context Note: ${voiceNoteText}`);
      }
    } else {
      setIsRecordingContext(true);
      // In a real implementation, this would start recording audio
      // and use the same TTS service as the main transcript
    }
  };

  const copyContextText = () => {
    navigator.clipboard.writeText(contextText);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContextText(prev => prev + text);
    } catch (err) {
      console.error('Failed to paste from clipboard:', err);
    }
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

            {/* Main Text Area */}
            <div className="flex-1 relative">
              <textarea
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                placeholder="Add any additional context about the patient or paste files here"
                className="w-full h-full p-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 text-base leading-relaxed"
                style={{ minHeight: '300px' }}
              />
              
              {/* Recording Indicator */}
              {isRecordingContext && (
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-red-600 dark:text-red-400">Recording...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Past Sessions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Past sessions</h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <FileIcon className="w-4 h-4" />
                    <span className="text-sm">Not linked to a profile</span>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <Paperclip className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {attachedFiles.length === 0 ? 'No attachments' : `${attachedFiles.length} attachment${attachedFiles.length > 1 ? 's' : ''}`}
                </h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 min-h-[80px]">
                  {attachedFiles.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
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
                        className="flex items-center space-x-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Add files</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {attachedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-600 rounded p-2">
                          <div className="flex items-center space-x-2">
                            <FileIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-900 dark:text-white truncate">
                              {file.name}
                            </span>
                          </div>
                          <button
                            onClick={() => removeAttachedFile(index)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors duration-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => contextFileInputRef.current?.click()}
                        className="w-full p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 text-sm"
                      >
                        + Add more files
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Actions</h3>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={pasteFromClipboard}
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">Paste from clipboard</span>
                  </button>
                  <button className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Create note from context</span>
                  </button>
                </div>
              </div>
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
      {/* Header with Record Button */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                MediScribe
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentSession ? currentSession.title : 'Georgian Medical Transcription'}
              </div>
            </div>
          </div>

          {/* Record Button - Top Right */}
          <div className="flex items-center space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors duration-200 text-sm"
            >
              Upload
            </button>
            
            <button
              onClick={canRecord ? onStartRecording : canStop ? onStopRecording : undefined}
              disabled={isTranscribing}
              className={`
                px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2
                ${canRecord 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : canStop
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-400 cursor-not-allowed text-white'
                }
              `}
            >
              <Mic className="w-4 h-4" />
              <span>{recordingState.isRecording ? 'Stop Recording' : 'Start transcribing'}</span>
            </button>
          </div>
        </div>

        {/* Recording Status */}
        {recordingState.isRecording && (
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>Recording</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(recordingState.duration)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Volume2 className="w-4 h-4" />
              <span>{Math.round(recordingState.audioLevel)}%</span>
            </div>
          </div>
        )}

        {/* Smart Segmentation Status */}
        {recordingState.isProcessingChunks && (
          <div className="flex items-center justify-center space-x-3 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
              <span className="text-green-700 dark:text-green-300 font-medium">
                Auto-restart in progress...
              </span>
            </div>
            <div className="text-green-600 dark:text-green-400 text-xs">
              Seamless continuation (23s segments)
            </div>
          </div>
        )}
        
        {/* Legacy Chunked Processing Status - keep for compatibility */}
        {recordingState.isProcessingChunks && recordingState.totalChunks > 0 && (
          <div className="flex items-center space-x-4 text-sm text-blue-600 dark:text-blue-400 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <span>Processing chunks: {recordingState.processedChunks}/{recordingState.totalChunks}</span>
            </div>
            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${recordingState.totalChunks > 0 ? (recordingState.processedChunks / recordingState.totalChunks) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        )}

        {isTranscribing && (
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-4">
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm">Processing audio...</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons for Active Tab */}
        {activeTab === 'transcript' && hasTranscript && (
          <div className="flex items-center space-x-2 mt-3">
            <button
              onClick={copyToClipboard}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors duration-200"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={downloadTranscription}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors duration-200"
              title="Download transcript"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleEditStart}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors duration-200"
              title="Edit transcript"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h4>
                <button
                  onClick={onClearError}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
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