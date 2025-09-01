import React from 'react';
import { Upload, FileAudio, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface AudioUploadProgressProps {
  isVisible: boolean;
  stage: 'idle' | 'validating' | 'chunking' | 'transcribing' | 'completed' | 'error';
  progress: number;
  currentChunk: number;
  totalChunks: number;
  fileName?: string;
  error?: string;
  onCancel?: () => void;
}

export const AudioUploadProgress: React.FC<AudioUploadProgressProps> = ({
  isVisible,
  stage,
  progress,
  currentChunk,
  totalChunks,
  fileName,
  error,
  onCancel
}) => {
  if (!isVisible) return null;

  const getStageIcon = () => {
    switch (stage) {
      case 'validating':
        return <Upload className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'chunking':
        return <FileAudio className="w-5 h-5 text-indigo-600 animate-pulse" />;
      case 'transcribing':
        return <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStageMessage = () => {
    switch (stage) {
      case 'validating':
        return 'Validating audio file...';
      case 'chunking':
        return 'Preparing audio chunks...';
      case 'transcribing':
        return totalChunks > 0 
          ? `Transcribing chunk ${currentChunk} of ${totalChunks}...`
          : 'Transcribing audio...';
      case 'completed':
        return 'Upload completed successfully!';
      case 'error':
        return error || 'Upload failed';
      default:
        return 'Ready to upload';
    }
  };

  const getStageColor = () => {
    switch (stage) {
      case 'validating':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'chunking':
        return 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20';
      case 'transcribing':
        return 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20';
      case 'completed':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/20';
    }
  };

  const estimatedTimeRemaining = totalChunks > 0 && currentChunk > 0 
    ? Math.ceil((totalChunks - currentChunk) * 4) // ~4 seconds per chunk
    : null;

  return (
    <div className="fixed top-20 right-6 z-50 w-80 max-w-sm">
      <div className={`border rounded-2xl shadow-xl backdrop-blur-xl p-4 transition-all duration-300 ${getStageColor()}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getStageIcon()}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                Audio Upload
              </h3>
              {fileName && (
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={fileName}>
                  {fileName}
                </p>
              )}
            </div>
          </div>
          
          {/* Cancel button - only show during processing */}
          {(stage === 'validating' || stage === 'chunking' || stage === 'transcribing') && onCancel && (
            <button
              onClick={onCancel}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
              title="Cancel upload"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {(stage === 'chunking' || stage === 'transcribing') && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>{Math.round(progress)}%</span>
              {estimatedTimeRemaining && (
                <span>{estimatedTimeRemaining}s remaining</span>
              )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Chunk Progress */}
        {stage === 'transcribing' && totalChunks > 0 && (
          <div className="mb-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                Chunk Progress
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {currentChunk} / {totalChunks}
              </span>
            </div>
            <div className="mt-1 flex space-x-1">
              {Array.from({ length: Math.min(totalChunks, 10) }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i < Math.floor((currentChunk / totalChunks) * 10)
                      ? 'bg-emerald-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
              {totalChunks > 10 && (
                <span className="text-xs text-gray-500 ml-1">...</span>
              )}
            </div>
          </div>
        )}

        {/* Status Message */}
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {getStageMessage()}
        </p>

        {/* Error Details */}
        {stage === 'error' && error && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-xs text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        )}

        {/* Success Actions */}
        {stage === 'completed' && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {/* This could trigger a close action */}}
              className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};