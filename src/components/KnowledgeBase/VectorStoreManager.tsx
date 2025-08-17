import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Settings, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Trash2,
  FileText,
  Users,
  Clock,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../../stores/useAppStore';
import { safeAsync, safe, ErrorSeverity } from '../../lib/utils/errorHandling';
import { 
  getUserVectorStore,
  createVectorStore,
  deleteVectorStore,
  getVectorStoreStatus,
  initializeUserVectorStore,
  getUserDocumentStats
} from '../../lib/api/vectorStore';
import type { 
  UserVectorStore,
  VectorStoreStatus
} from '../../types/openai-vector-store';

interface VectorStoreStats {
  totalDocuments: number;
  categoryCounts: Record<string, number>;
  totalSize: number;
}

export const VectorStoreManager: React.FC = () => {
  const { user } = useAuth();
  const [vectorStore, setVectorStore] = useState<UserVectorStore | null>(null);
  const [status, setStatus] = useState<VectorStoreStatus | null>(null);
  const [stats, setStats] = useState<VectorStoreStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });

  // Load Vector Store data
  const loadVectorStore = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    const [apiResponses, loadError] = await safeAsync(async () => {
      return await Promise.allSettled([
        getUserVectorStore(),
        getVectorStoreStatus().catch(() => null),
        getUserDocumentStats().catch(() => null)
      ]);
    }, {
      context: 'loading vector store data and status',
      severity: ErrorSeverity.MEDIUM,
      showToast: true
    });

    if (loadError) {
      setError(loadError.userMessage || 'Failed to load Vector Store data');
      setIsLoading(false);
      return;
    }

    const [vectorStoreResponse, statusResponse, statsResponse] = apiResponses;

    // Handle Vector Store response
    if (vectorStoreResponse.status === 'fulfilled') {
      setVectorStore(vectorStoreResponse.value.vectorStore);
    }

    // Handle status response
    if (statusResponse.status === 'fulfilled' && statusResponse.value) {
      // Convert the API response to VectorStoreStatus format
      const statusData = statusResponse.value;
      setStatus({
        status: statusData.status as 'active' | 'inactive' | 'error' | 'deleting',
        document_count: statusData.documentCount,
        total_size_bytes: statusData.totalSize,
        openai_status: statusData.openaiStatus,
        openai_file_counts: statusData.openaiFileCounts,
        error_message: statusData.errorMessage
      });
    }

    // Handle stats response
    if (statsResponse.status === 'fulfilled' && statsResponse.value) {
      setStats(statsResponse.value);
    }

    setIsLoading(false);
  };

  // Create new Vector Store
  const handleCreateVectorStore = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.name.trim()) {
      setError('Vector Store name is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    const [response, createError] = await safeAsync(async () => {
      return await createVectorStore({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined
      });
    }, {
      context: 'creating new vector store',
      severity: ErrorSeverity.HIGH,
      showToast: true
    });

    if (createError) {
      setError(createError.userMessage || 'Failed to create Vector Store');
      setIsCreating(false);
      return;
    }

    // Reload data to get the new Vector Store
    await loadVectorStore();
    
    // Reset form and close modal
    setCreateForm({ name: '', description: '' });
    setShowCreateForm(false);
    setIsCreating(false);
  };

  // Initialize with default Vector Store
  const handleInitializeDefault = async () => {
    setIsCreating(true);
    setError(null);

    const [, initError] = await safeAsync(async () => {
      await initializeUserVectorStore();
      await loadVectorStore();
    }, {
      context: 'initializing default vector store',
      severity: ErrorSeverity.HIGH,
      showToast: true
    });

    if (initError) {
      setError(initError.userMessage || 'Failed to initialize Vector Store');
    }

    setIsCreating(false);
  };

  // Delete Vector Store
  const handleDeleteVectorStore = async () => {
    if (!vectorStore) return;

    const confirmMessage = `Are you sure you want to delete your Vector Store "${vectorStore.name}"? This will permanently delete all uploaded documents and cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const [, deleteError] = await safeAsync(async () => {
      await deleteVectorStore();
    }, {
      context: 'deleting vector store',
      severity: ErrorSeverity.HIGH,
      showToast: true
    });

    if (deleteError) {
      setError(deleteError.userMessage || 'Failed to delete Vector Store');
    } else {
      // Clear local state only on successful deletion
      setVectorStore(null);
      setStatus(null);
      setStats(null);
    }

    setIsDeleting(false);
  };

  // Refresh data
  const handleRefresh = () => {
    loadVectorStore();
  };

  // Load data on component mount
  useEffect(() => {
    loadVectorStore();
  }, [user]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'deleting': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
            <div className="h-6 bg-gray-300 rounded w-32 sm:w-48"></div>
          </div>
          <div className="bg-gray-300 rounded-xl h-48 sm:h-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className="p-2 bg-primary/10 rounded-xl flex-shrink-0">
            <Database className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Vector Store Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              Manage your OpenAI Vector Store for document storage and AI search
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-end">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 touch-manipulation"
            title="Refresh Vector Store data"
            aria-label="Refresh Vector Store data"
          >
            <RefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="ml-2 text-sm font-medium hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Message - Mobile Optimized */}
      {error && (
        <div className="mb-6 p-4 sm:p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="p-1.5 bg-red-100 dark:bg-red-800/30 rounded-lg flex-shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-red-800 dark:text-red-200 font-semibold text-sm sm:text-base">Error</p>
              <p className="text-red-700 dark:text-red-300 text-sm sm:text-base mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Vector Store Status */}
      {vectorStore ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Vector Store Info Card - Mobile Optimized */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 break-words">
                  {vectorStore.name}
                </h2>
                {vectorStore.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm sm:text-base leading-relaxed">
                    {vectorStore.description}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(vectorStore.status)} self-start`}>
                    {vectorStore.status.charAt(0).toUpperCase() + vectorStore.status.slice(1)}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono break-all">
                    ID: {vectorStore.openai_vector_store_id}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-end sm:justify-start">
                <button
                  onClick={handleDeleteVectorStore}
                  disabled={isDeleting}
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 touch-manipulation"
                  title="Delete Vector Store"
                  aria-label="Delete Vector Store"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm font-medium ml-2">Delete</span>
                </button>
              </div>
            </div>

            {/* Stats Grid - Mobile First */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Documents</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                      {vectorStore.document_count}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg flex-shrink-0">
                    <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Storage Used</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate" title={formatFileSize(vectorStore.total_size_bytes)}>
                      {formatFileSize(vectorStore.total_size_bytes)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg flex-shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Created</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">
                      {new Date(vectorStore.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-800/30 rounded-lg flex-shrink-0">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Last Updated</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">
                      {new Date(vectorStore.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OpenAI Status Card - Mobile Optimized */}
          {status && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                OpenAI Vector Store Status
              </h3>
              
              {status.openai_file_counts && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{status.openai_file_counts.total || 0}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Total Files</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{status.openai_file_counts.completed || 0}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600">{status.openai_file_counts.in_progress || 0}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Processing</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-xl sm:text-2xl font-bold text-red-600">{status.openai_file_counts.failed || 0}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Failed</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg col-span-2 sm:col-span-1">
                    <p className="text-xl sm:text-2xl font-bold text-gray-600">{status.openai_file_counts.cancelled || 0}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Cancelled</p>
                  </div>
                </div>
              )}

              {status.error_message && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-800 dark:text-red-200 text-sm sm:text-base leading-relaxed">{status.error_message}</p>
                </div>
              )}
            </div>
          )}

          {/* Document Categories - Mobile Optimized */}
          {stats && stats.categoryCounts && Object.keys(stats.categoryCounts).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Document Categories
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Object.entries(stats.categoryCounts).map(([category, count]) => (
                  <div key={category} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize font-medium mb-1">
                      {category.replace('-', ' ')}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                      {count} {count === 1 ? 'doc' : 'docs'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // No Vector Store - Show creation options (Mobile Optimized)
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-6">
            <Database className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            No Vector Store Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            Create a Vector Store to upload and manage your documents for AI-powered search and analysis.
          </p>
          
          <div className="flex flex-col space-y-4 max-w-sm mx-auto">
            <button
              onClick={handleInitializeDefault}
              disabled={isCreating}
              className="inline-flex items-center justify-center min-h-[52px] space-x-3 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 font-semibold touch-manipulation"
            >
              <Plus className="w-5 h-5" />
              <span>{isCreating ? 'Creating...' : 'Create Default Vector Store'}</span>
            </button>
            
            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">or</div>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center justify-center min-h-[52px] space-x-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors font-semibold touch-manipulation"
            >
              <Settings className="w-5 h-5" />
              <span>Create Custom Vector Store</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Vector Store Modal - Mobile Optimized */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                Create Vector Store
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateVectorStore} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-base"
                  placeholder="My Medical Knowledge Base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100 resize-none text-base"
                  placeholder="Personal collection of medical documents and research papers"
                  rows={3}
                />
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 min-h-[48px] px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl transition-colors font-semibold touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 min-h-[48px] px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 font-semibold touch-manipulation"
                >
                  {isCreating ? 'Creating...' : 'Create Vector Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 