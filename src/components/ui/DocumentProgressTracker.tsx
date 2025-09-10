import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Clock, Upload, Zap, Minimize2, Maximize2 } from 'lucide-react';
import { DocumentProgress, useDocumentProgress } from '../../hooks/useDocumentProgress';

interface DocumentProgressTrackerProps {
  onClose?: () => void;
  className?: string;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

export const DocumentProgressTracker: React.FC<DocumentProgressTrackerProps> = ({
  onClose,
  className = '',
  minimized = false,
  onToggleMinimize
}) => {
  const { documents, stopTracking, clearCompleted } = useDocumentProgress();
  const [isMinimized, setIsMinimized] = useState(minimized);

  const documentsArray = Array.from(documents.values());
  const activeDocuments = documentsArray.filter(doc => 
    doc.status === 'uploading' || doc.status === 'processing'
  );
  const completedDocuments = documentsArray.filter(doc => doc.status === 'completed');
  const failedDocuments = documentsArray.filter(doc => doc.status === 'failed');

  const totalDocuments = documentsArray.length;
  const hasActiveUploads = activeDocuments.length > 0;

  if (totalDocuments === 0) {
    return null;
  }

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
    onToggleMinimize?.();
  };

  const handleClearCompleted = () => {
    clearCompleted();
  };

  const handleCancelUpload = (documentId: string) => {
    stopTracking(documentId);
  };

  const getProgressColor = (status: DocumentProgress['status']) => {
    switch (status) {
      case 'uploading': return 'bg-[var(--cardiology-accent-blue)]';
      case 'processing': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-[var(--muted-foreground)]';
    }
  };

  const getStatusIcon = (status: DocumentProgress['status']) => {
    switch (status) {
      case 'uploading': return <Upload className="w-4 h-4" />;
      case 'processing': return <Zap className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const duration = (endTime || new Date()).getTime() - startTime.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-md w-full ${className}`}>
      <div className="bg-[var(--component-card)] dark:bg-[var(--background)] rounded-lg shadow-lg border border-[var(--glass-border-light)] dark:border-[var(--border-strong)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border-light)] dark:border-[var(--border-strong)]">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              {hasActiveUploads && (
                <div className="w-2 h-2 bg-[var(--cardiology-accent-blue)] rounded-full animate-pulse"></div>
              )}
              <h3 className="font-medium text-[var(--foreground)] dark:text-[var(--foreground)]">
                Document Progress
              </h3>
            </div>
            <span className="text-sm text-[var(--foreground-secondary)] dark:text-[var(--foreground-secondary)]">
              ({totalDocuments} {totalDocuments === 1 ? 'document' : 'documents'})
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {onToggleMinimize && (
              <button
                onClick={handleToggleMinimize}
                className="p-1 text-[var(--foreground-secondary)] hover:text-[var(--foreground-tertiary)] dark:hover:text-[var(--foreground-secondary)] transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
            )}
            
            {completedDocuments.length > 0 && (
              <button
                onClick={handleClearCompleted}
                className="text-xs text-[var(--foreground-secondary)] hover:text-[var(--foreground-tertiary)] dark:hover:text-[var(--foreground-secondary)] transition-colors"
                title="Clear completed"
              >
                Clear
              </button>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-[var(--foreground-secondary)] hover:text-[var(--foreground-tertiary)] dark:hover:text-[var(--foreground-secondary)] transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Content */}
        {!isMinimized && (
          <div className="max-h-80 overflow-y-auto">
            {/* Active Uploads */}
            {activeDocuments.map((doc) => (
              <div key={doc.documentId} className="p-4 border-b border-gray-100 dark:border-[var(--border-strong)] last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getStatusIcon(doc.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] dark:text-[var(--foreground)] truncate">
                        Document {doc.documentId.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-[var(--foreground-secondary)] dark:text-[var(--foreground-secondary)]">
                        {doc.processingStage}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleCancelUpload(doc.documentId)}
                    className="ml-2 p-1 text-[var(--foreground-secondary)] hover:text-red-600 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-[var(--foreground-secondary)] dark:text-[var(--foreground-secondary)] mb-1">
                    <span>{doc.status === 'uploading' ? 'Uploading' : 'Processing'}</span>
                    <span>{formatDuration(doc.startedAt)}</span>
                  </div>
                  <div className="w-full bg-[var(--component-surface-tertiary)] dark:bg-[var(--card)] rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(doc.status)}`}
                      style={{ 
                        width: doc.status === 'uploading' 
                          ? `${doc.uploadProgress}%` 
                          : doc.status === 'processing' 
                            ? '100%' 
                            : '0%' 
                      }}
                    >
                      {doc.status === 'processing' && (
                        <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse opacity-30 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Completed Documents */}
            {completedDocuments.map((doc) => (
              <div key={doc.documentId} className="p-4 border-b border-gray-100 dark:border-[var(--border-strong)] last:border-b-0 bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getStatusIcon(doc.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] dark:text-[var(--foreground)] truncate">
                        Document {doc.documentId.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {doc.processingStage}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-[var(--foreground-secondary)] dark:text-[var(--foreground-secondary)]">
                    {doc.completedAt && formatDuration(doc.startedAt, doc.completedAt)}
                  </div>
                </div>
              </div>
            ))}

            {/* Failed Documents */}
            {failedDocuments.map((doc) => (
              <div key={doc.documentId} className="p-4 border-b border-gray-100 dark:border-[var(--border-strong)] last:border-b-0 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getStatusIcon(doc.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] dark:text-[var(--foreground)] truncate">
                        Document {doc.documentId.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {doc.error || 'Upload failed'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => stopTracking(doc.documentId)}
                    className="ml-2 p-1 text-[var(--foreground-secondary)] hover:text-[var(--foreground-tertiary)] transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {documentsArray.length === 0 && (
              <div className="p-4 text-center text-[var(--foreground-secondary)] dark:text-[var(--foreground-secondary)] text-sm">
                No active uploads
              </div>
            )}
          </div>
        )}

        {/* Minimized Summary */}
        {isMinimized && (
          <div className="p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                {hasActiveUploads && (
                  <div className="w-2 h-2 bg-[var(--cardiology-accent-blue)] rounded-full animate-pulse"></div>
                )}
                <span className="text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)]">
                  {activeDocuments.length > 0 
                    ? `${activeDocuments.length} uploading`
                    : `${completedDocuments.length} completed`
                  }
                </span>
              </div>
              
              {failedDocuments.length > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  {failedDocuments.length} failed
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Global progress tracker that can be used throughout the app
 */
export const GlobalDocumentProgressTracker: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const { documents } = useDocumentProgress();

  const hasDocuments = documents.size > 0;

  if (!hasDocuments || !isVisible) {
    return null;
  }

  return (
    <DocumentProgressTracker
      onClose={() => setIsVisible(false)}
      minimized={isMinimized}
      onToggleMinimize={() => setIsMinimized(!isMinimized)}
    />
  );
}; 