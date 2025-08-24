import React, { useState, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Volume2,
  FileAudio,
  Trash2,
  Copy,
  Download
} from 'lucide-react';
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS';
import { useTranslation } from '../../hooks/useTranslation';

export const TTSTestPage: React.FC = () => {
  const { t } = useTranslation();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    recordingState,
    isTranscribing,
    transcriptionResult,
    error,
    authStatus,
    isSupported,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    processFileUpload,
    clearError,
    clearResult,
    canRecord,
    canStop,
    canPause,
    canResume,
    remainingTime,
    isNearMaxDuration
  } = useGeorgianTTS({
    language: 'ka-GE',
    autocorrect: true,
    punctuation: true,
    digits: true,
    maxDuration: 25000 // 25 seconds
  });

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'audio/mp3' || file.type === 'audio/mpeg') {
        setUploadedFile(file);
        clearError();
      } else {
        alert('Please select an MP3 file');
      }
    }
  };

  const handleFileUpload = async () => {
    if (uploadedFile) {
      await processFileUpload(uploadedFile);
    }
  };

  const copyToClipboard = () => {
    if (transcriptionResult?.text) {
      navigator.clipboard.writeText(transcriptionResult.text);
    }
  };

  const downloadTranscription = () => {
    if (transcriptionResult?.text) {
      const blob = new Blob([transcriptionResult.text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `georgian-transcription-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Browser Not Supported
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your browser doesn't support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/30">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Georgian TTS Test
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Test Georgian speech recognition with Enagramm.com API
              </p>
            </div>
          </div>

          {/* Auth Status */}
          <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${authStatus.isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {authStatus.isAuthenticated ? 'Connected' : 'Disconnected'}
                </span>
                {authStatus.email && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({authStatus.email})
                  </span>
                )}
              </div>
              {authStatus.isAuthenticated && authStatus.tokenExpiresIn && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Token expires in {Math.floor(authStatus.tokenExpiresIn / 60000)} min
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Browser Compatibility Warning */}
        {(!isSupported || window.location.protocol !== 'https:') && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  Microphone Access Requirements
                </h3>
                <div className="text-yellow-700 dark:text-yellow-300 space-y-2">
                  {window.location.protocol !== 'https:' && (
                    <p className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0" />
                      <span>
                        <strong>HTTPS Required:</strong> For security, microphone access requires a secure connection. 
                        <br />
                        <span className="text-sm">
                          Run <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">npm run dev:https</code> and access via <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">https://localhost:5173/tts-test</code>
                        </span>
                      </span>
                    </p>
                  )}
                  {!isSupported && (
                    <p className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0" />
                      <span>
                        <strong>Browser Support:</strong> Your browser may not support microphone recording. 
                        Try Chrome, Firefox, Safari, or Edge.
                      </span>
                    </p>
                  )}
                  <p className="text-sm">
                    You can still test file upload functionality below, which doesn't require microphone access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recording Section */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/30">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Real-time Recording (Max 25 seconds)
          </h2>

          {/* Recording Controls */}
          <div className="flex flex-col items-center space-y-6">
            {/* Main Record Button */}
            <div className="relative">
              <button
                onClick={canRecord ? startRecording : canStop ? stopRecording : undefined}
                disabled={isTranscribing || !authStatus.isAuthenticated}
                className={`
                  w-24 h-24 rounded-full flex items-center justify-center text-white font-semibold text-sm
                  transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95
                  ${canRecord 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
                    : canStop
                      ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }
                  ${recordingState.isRecording ? 'animate-pulse' : ''}
                `}
                style={{
                  boxShadow: recordingState.isRecording ? '0 0 30px rgba(239, 68, 68, 0.5)' : undefined
                }}
              >
                {recordingState.isRecording ? (
                  <Square className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>

              {/* Audio Level Indicator */}
              {recordingState.isRecording && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div 
                    className="w-2 h-2 bg-white rounded-full transition-all duration-75"
                    style={{ 
                      transform: `scale(${1 + recordingState.audioLevel / 100})` 
                    }}
                  />
                </div>
              )}
            </div>

            {/* Recording State */}
            <div className="text-center">
              {recordingState.isRecording ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {recordingState.isPaused ? 'Recording Paused' : 'Recording...'}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(recordingState.duration)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Volume2 className="w-4 h-4" />
                      <span>{Math.round(recordingState.audioLevel)}%</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${isNearMaxDuration ? 'text-red-500' : ''}`}>
                      <span>Remaining: {formatTime(remainingTime)}</span>
                    </span>
                  </div>
                </div>
              ) : isTranscribing ? (
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Processing speech...
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click to start recording Georgian speech
                </p>
              )}
            </div>

            {/* Pause/Resume Controls */}
            {recordingState.isRecording && (
              <div className="flex space-x-3">
                {canPause && (
                  <button
                    onClick={pauseRecording}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </button>
                )}
                {canResume && (
                  <button
                    onClick={resumeRecording}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Resume</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/30">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            File Upload Recognition
          </h2>

          <div className="space-y-4">
            {/* File Input */}
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/mp3,audio/mpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Select MP3 File</span>
              </button>

              {uploadedFile && (
                <button
                  onClick={handleFileUpload}
                  disabled={isTranscribing || !authStatus.isAuthenticated}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <FileAudio className="w-4 h-4" />
                  <span>Process File</span>
                </button>
              )}
            </div>

            {/* Selected File Info */}
            {uploadedFile && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(uploadedFile.size)} • MP3
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Error
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {error}
                </p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Results Display */}
        {transcriptionResult && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                  Transcription Result
                </h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadTranscription}
                  className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200"
                  title="Download as text file"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={clearResult}
                  className="p-2 text-green-400 hover:text-red-500 transition-colors duration-200"
                  title="Clear result"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Georgian Text Display */}
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-gray-900 dark:text-white text-lg leading-relaxed font-medium">
                  {transcriptionResult.text || 'No text recognized'}
                </p>
              </div>

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Processed: {new Date(transcriptionResult.timestamp).toLocaleString()}
                </span>
                {transcriptionResult.duration > 0 && (
                  <span>
                    Duration: {formatTime(transcriptionResult.duration)}
                  </span>
                )}
                <span>
                  Characters: {transcriptionResult.text.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
            Instructions
          </h3>
          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
            <p>• Click the red record button to start recording Georgian speech</p>
            <p>• Maximum recording duration is 25 seconds per session</p>
            <p>• Speak clearly and close to the microphone for best results</p>
            <p>• Alternatively, upload an MP3 file for recognition with speaker separation</p>
            <p>• The system supports automatic punctuation and text correction</p>
            <p>• Results can be copied to clipboard or downloaded as text files</p>
          </div>
        </div>
      </div>
    </div>
  );
};