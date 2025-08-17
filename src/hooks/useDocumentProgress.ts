import { useState, useEffect, useRef, useCallback } from 'react';
import { getDocument, KnowledgeBaseDocument } from '../lib/api/knowledgeBase';

export interface DocumentProgress {
  documentId: string;
  uploadProgress: number; // 0-100
  processingStage: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  estimatedTimeRemaining?: number; // in seconds
}

interface UseDocumentProgressOptions {
  pollingInterval?: number; // milliseconds
  timeout?: number; // milliseconds
}

interface UseDocumentProgressReturn {
  documents: Map<string, DocumentProgress>;
  startTracking: (documentId: string, initialProgress?: Partial<DocumentProgress>) => void;
  stopTracking: (documentId: string) => void;
  updateProgress: (documentId: string, updates: Partial<DocumentProgress>) => void;
  clearCompleted: () => void;
  isTracking: (documentId: string) => boolean;
}

export function useDocumentProgress(
  options: UseDocumentProgressOptions = {}
): UseDocumentProgressReturn {
  const {
    pollingInterval = 2000, // 2 seconds
    timeout = 300000 // 5 minutes
  } = options;

  const [documents, setDocuments] = useState<Map<string, DocumentProgress>>(new Map());
  const pollIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const timeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Start tracking a document's progress
   */
  const startTracking = useCallback((
    documentId: string, 
    initialProgress: Partial<DocumentProgress> = {}
  ) => {
    const progress: DocumentProgress = {
      documentId,
      uploadProgress: 0,
      processingStage: 'Starting upload...',
      status: 'uploading',
      startedAt: new Date(),
      ...initialProgress
    };

    setDocuments(prev => new Map(prev.set(documentId, progress)));

    // Set up polling for this document
    const intervalId = setInterval(async () => {
      try {
        const document = await getDocument(documentId);
        updateDocumentFromAPI(documentId, document);
      } catch (error) {

        updateProgress(documentId, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        });
        stopTracking(documentId);
      }
    }, pollingInterval);

    pollIntervals.current.set(documentId, intervalId);

    // Set up timeout
    const timeoutId = setTimeout(() => {
      updateProgress(documentId, {
        status: 'failed',
        error: 'Upload/processing timeout',
        completedAt: new Date()
      });
      stopTracking(documentId);
    }, timeout);

    timeouts.current.set(documentId, timeoutId);
  }, [pollingInterval, timeout]);

  /**
   * Stop tracking a document
   */
  const stopTracking = useCallback((documentId: string) => {
    const intervalId = pollIntervals.current.get(documentId);
    if (intervalId) {
      clearInterval(intervalId);
      pollIntervals.current.delete(documentId);
    }

    const timeoutId = timeouts.current.get(documentId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeouts.current.delete(documentId);
    }
  }, []);

  /**
   * Update document from API response
   */
  const updateDocumentFromAPI = useCallback((documentId: string, apiDoc: KnowledgeBaseDocument) => {
    setDocuments(prev => {
      const current = prev.get(documentId);
      if (!current) return prev;

      const updated = new Map(prev);
      const progress: DocumentProgress = {
        ...current,
        processingStage: getProcessingStageText(apiDoc.processing_status, apiDoc.upload_status),
        status: mapAPIStatusToProgressStatus(apiDoc.processing_status, apiDoc.upload_status),
        error: apiDoc.error_message || undefined
      };

      // Update upload progress based on upload status
      if (apiDoc.upload_status === 'uploaded' && current.uploadProgress < 100) {
        progress.uploadProgress = 100;
      }

      // Check if completed or failed
      if (apiDoc.processing_status === 'completed') {
        progress.status = 'completed';
        progress.completedAt = new Date();
        progress.processingStage = 'Document ready for use';
        // Stop tracking completed documents after a short delay
        setTimeout(() => stopTracking(documentId), 3000);
      } else if (apiDoc.processing_status === 'failed') {
        progress.status = 'failed';
        progress.completedAt = new Date();
        progress.error = apiDoc.error_message || 'Processing failed';
        stopTracking(documentId);
      }

      updated.set(documentId, progress);
      return updated;
    });
  }, [stopTracking]);

  /**
   * Manually update progress for a document
   */
  const updateProgress = useCallback((documentId: string, updates: Partial<DocumentProgress>) => {
    setDocuments(prev => {
      const current = prev.get(documentId);
      if (!current) return prev;

      const updated = new Map(prev);
      updated.set(documentId, { ...current, ...updates });
      return updated;
    });
  }, []);

  /**
   * Clear all completed documents from tracking
   */
  const clearCompleted = useCallback(() => {
    setDocuments(prev => {
      const updated = new Map();
      for (const [id, progress] of prev.entries()) {
        if (progress.status !== 'completed') {
          updated.set(id, progress);
        } else {
          stopTracking(id);
        }
      }
      return updated;
    });
  }, [stopTracking]);

  /**
   * Check if a document is being tracked
   */
  const isTracking = useCallback((documentId: string) => {
    return documents.has(documentId);
  }, [documents]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const intervalId of pollIntervals.current.values()) {
        clearInterval(intervalId);
      }
      for (const timeoutId of timeouts.current.values()) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return {
    documents,
    startTracking,
    stopTracking,
    updateProgress,
    clearCompleted,
    isTracking
  };
}

/**
 * Helper function to map API status to progress status
 */
function mapAPIStatusToProgressStatus(
  processingStatus: string, 
  uploadStatus: string
): DocumentProgress['status'] {
  if (uploadStatus === 'pending' || uploadStatus === 'uploading') {
    return 'uploading';
  }
  
  if (processingStatus === 'processing') {
    return 'processing';
  }
  
  if (processingStatus === 'completed') {
    return 'completed';
  }
  
  if (processingStatus === 'failed' || uploadStatus === 'failed') {
    return 'failed';
  }
  
  return 'processing';
}

/**
 * Helper function to get user-friendly processing stage text
 */
function getProcessingStageText(processingStatus: string, uploadStatus: string): string {
  if (uploadStatus === 'pending') {
    return 'Preparing upload...';
  }
  
  if (uploadStatus === 'uploading') {
    return 'Uploading file...';
  }
  
  if (uploadStatus === 'failed') {
    return 'Upload failed';
  }
  
  switch (processingStatus) {
    case 'pending':
      return 'Queued for processing...';
    case 'processing':
      return 'Extracting text and creating embeddings...';
    case 'completed':
      return 'Document ready for use';
    case 'failed':
      return 'Processing failed';
    default:
      return 'Processing...';
  }
}

/**
 * Hook for tracking multiple document uploads with batch operations
 */
export function useDocumentBatchProgress() {
  const singleProgress = useDocumentProgress();
  
  const startBatchTracking = useCallback((documentIds: string[]) => {
    documentIds.forEach(id => {
      singleProgress.startTracking(id);
    });
  }, [singleProgress]);

  const getBatchStatus = useCallback(() => {
    const documents = Array.from(singleProgress.documents.values());
    const total = documents.length;
    const completed = documents.filter(d => d.status === 'completed').length;
    const failed = documents.filter(d => d.status === 'failed').length;
    const inProgress = documents.filter(d => 
      d.status === 'uploading' || d.status === 'processing'
    ).length;

    return {
      total,
      completed,
      failed,
      inProgress,
      allCompleted: total > 0 && completed + failed === total,
      hasFailures: failed > 0
    };
  }, [singleProgress.documents]);

  return {
    ...singleProgress,
    startBatchTracking,
    getBatchStatus
  };
} 