import { useState, useCallback } from 'react';
import { safeAsync, ErrorSeverity } from '../../../../lib/utils/errorHandling';
import {
  listUserDocuments,
  deleteUserDocument,
  monitorVectorStoreStatus
} from '../../../../lib/api/vectorStore';
import { DocumentListParams } from '../../../../types/openai-vector-store';
import { DocumentCategory } from '../../../../lib/api/knowledgeBase';
import { SearchFilters } from '../types';
import { convertUserDocumentToLegacy, groupDocuments } from '../documentUtils';

interface UseDocumentOperationsProps {
  onDocumentsUpdated: (documents: any[], total: number) => void;
  onDocumentCountUpdated: (count: number) => void;
}

export const useDocumentOperations = ({
  onDocumentsUpdated,
  onDocumentCountUpdated
}: UseDocumentOperationsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState<string>('');

  // Load documents from API
  const loadDocuments = useCallback(async (filters: SearchFilters, user: any) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const queryOptions: DocumentListParams = {
        limit: 50,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      if (filters.searchTerm.trim()) {
        queryOptions.search = filters.searchTerm.trim();
      }

      if (filters.category !== 'all') {
        queryOptions.category = filters.category as DocumentCategory;
      }

      if (filters.tags.length > 0) {
        queryOptions.tags = filters.tags;
      }

      const [result, loadError] = await safeAsync(async () => {
        return await listUserDocuments(queryOptions);
      }, {
        context: 'loading user documents from knowledge base',
        severity: ErrorSeverity.MEDIUM,
        showToast: true
      });

      if (loadError) {
        setError(loadError.userMessage || 'Failed to load documents');
      } else {
        const convertedDocs = result.documents.map(convertUserDocumentToLegacy);
        const documentGroups = groupDocuments(convertedDocs);

        onDocumentsUpdated(documentGroups, result.total);
        onDocumentCountUpdated(result.total);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onDocumentsUpdated, onDocumentCountUpdated]);

  // Delete a single document
  const deleteDocument = useCallback(async (
    documentId: string,
    title: string,
    onSuccess?: () => void
  ) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    const [result, deleteError] = await safeAsync(async () => {
      return await deleteUserDocument({ documentId, deleteFromOpenAI: true });
    }, {
      context: `deleting document "${title}" from knowledge base`,
      severity: ErrorSeverity.HIGH,
      showToast: true
    });

    if (deleteError) {
      setError(deleteError.userMessage || 'Failed to delete document');
      return;
    }

    if (result.partialSuccess) {
      const warningDetails = [];
      if (result.cleanupResults?.openaiCleanup && !result.cleanupResults.openaiCleanup.success) {
        warningDetails.push('- Failed to remove from OpenAI Vector Store');
      }
      if (result.cleanupResults?.supabaseCleanup && !result.cleanupResults.supabaseCleanup.success) {
        warningDetails.push('- Failed to delete from Supabase');
      }
      if (result.cleanupResults?.storageCleanup && !result.cleanupResults.storageCleanup.success) {
        warningDetails.push('- Failed to remove from storage');
      }

      const warningMessage = `Document "${title}" was removed, but some cleanup operations failed:\n\n${warningDetails.join('\n')}`;
      alert(warningMessage);
    }

    if (onSuccess) onSuccess();
  }, []);

  // Delete multiple documents (all parts of a chunked document)
  const deleteMultipleDocuments = useCallback(async (
    documentIds: string[],
    title: string,
    onSuccess?: () => void
  ) => {
    const confirmMessage = `Are you sure you want to delete all ${documentIds.length} parts of "${title}"? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const [, deleteError] = await safeAsync(async () => {
      // Delete all documents in parallel
      const deletePromises = documentIds.map(documentId =>
        deleteUserDocument({ documentId, deleteFromOpenAI: true })
      );
      return await Promise.all(deletePromises);
    }, {
      context: `deleting all ${documentIds.length} parts of "${title}"`,
      severity: ErrorSeverity.HIGH,
      showToast: true
    });

    if (deleteError) {
      setError(deleteError.userMessage || 'Failed to delete all document parts');
      return;
    }

    if (onSuccess) onSuccess();
  }, []);

  // Monitor vector store processing status
  const monitorStatus = useCallback(async (user: any, onRefresh?: () => void) => {
    if (!user) return;

    setIsMonitoring(true);
    setMonitoringStatus('Checking file processing status...');

    try {
      const result = await monitorVectorStoreStatus({
        checkAll: false, // Only check recent uploads
        hoursBack: 24
      });

      const { summary } = result;
      if (summary.updated > 0) {
        setMonitoringStatus(`✅ Updated ${summary.updated} documents. ${summary.failed} failed, ${summary.completed} completed`);
        // Reload documents to show updated statuses
        if (onRefresh) onRefresh();
      } else {
        setMonitoringStatus(`✅ All ${summary.total} documents are in sync`);
      }

      // Clear status after 5 seconds
      setTimeout(() => setMonitoringStatus(''), 5000);
    } catch (error) {
      setMonitoringStatus('❌ Failed to check file status');
      setTimeout(() => setMonitoringStatus(''), 5000);
    } finally {
      setIsMonitoring(false);
    }
  }, []);

  return {
    isLoading,
    error,
    isMonitoring,
    monitoringStatus,
    loadDocuments,
    deleteDocument,
    deleteMultipleDocuments,
    monitorStatus
  };
};
