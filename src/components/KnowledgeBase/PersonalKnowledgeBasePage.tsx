import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  RefreshCw, 
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
  Tag,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { safeAsync, safe, ErrorSeverity } from '../../lib/utils/errorHandling';
import { useAuth, useSpecialty, MedicalSpecialty, useAppStore } from '../../stores/useAppStore';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { DocumentSearch, SearchFilters } from './DocumentSearch';
import { DocumentDetails } from './DocumentDetails';
import { 
  listUserDocuments, 
  deleteUserDocument,
  getUserDocument
} from '../../lib/api/vectorStore';
import { 
  DocumentListParams,
  DocumentListResponse,
  UserDocument,
  DocumentDeleteRequest
} from '../../types/openai-vector-store';
import { DocumentWithMetadata } from '../../lib/api/knowledgeBase';

// Convert UserDocument to DocumentWithMetadata for compatibility with existing components
const convertUserDocumentToLegacy = (doc: UserDocument): DocumentWithMetadata => {
  const uploadDate = new Date(doc.created_at);
  const size = doc.file_size || 0;
  
  return {
    id: doc.id,
    file_name: doc.file_name,
    title: doc.title,
    description: doc.description || '',
    file_type: doc.file_type,
    file_size: size,
    category: doc.category || 'other',
    tags: doc.tags || [],
    upload_status: doc.upload_status,
    processing_status: doc.processing_status,
    error_message: doc.error_message || null,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    is_private: doc.is_private,
    user_id: doc.user_id,
    vector_store_id: doc.vector_store_id,
    openai_file_id: doc.openai_file_id,
    storage_path: '', // UserDocument doesn't have storage_path, so we'll set empty string
    // Computed properties for compatibility
    formattedSize: formatFileSize(size),
    formattedDate: uploadDate.toLocaleDateString(),
    statusColor: getStatusColor(doc.upload_status),
    canDelete: true,
    canEdit: doc.upload_status === 'completed'
  };
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'green';
    case 'failed': return 'red';
    case 'uploading': 
    case 'pending': return 'yellow';
    default: return 'gray';
  }
};

// Helper function to get file type icon
const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return <FileText className="w-5 h-5" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <FileImage className="w-5 h-5" />;
    case 'xlsx':
    case 'xls':
    case 'csv':
      return <FileSpreadsheet className="w-5 h-5" />;
    default:
      return <File className="w-5 h-5" />;
  }
};

type ViewMode = 'grid' | 'list';

export const PersonalKnowledgeBasePage: React.FC = () => {
  // Import the premium component dynamically to avoid circular imports
  const PersonalLibraryPremium = React.lazy(() => 
    import('./PersonalLibraryPremium').then(module => ({ 
      default: module.PersonalLibraryPremium 
    }))
  );

  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Personal Library...</h3>
          <p className="text-gray-600">Preparing your premium knowledge base experience.</p>
        </div>
      </div>
    }>
      <PersonalLibraryPremium />
    </React.Suspense>
  );
};

// Keep the original as fallback
export const PersonalKnowledgeBasePageOriginal: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { specialty } = useSpecialty();
  const { setPersonalDocumentCount } = useAppStore();
  const [documents, setDocuments] = useState<DocumentWithMetadata[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithMetadata | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Advanced search filters
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    status: 'all',
    category: 'all',
    tags: [],
    dateRange: { from: '', to: '' }
  });

  // Get specialty theme
  const getSpecialtyTheme = () => {
    switch (specialty) {
      case MedicalSpecialty.CARDIOLOGY:
        return {
          primary: 'text-red-600',
          primaryBg: 'bg-red-600',
          primaryLight: 'bg-red-50',
          border: 'border-red-200'
        };
      case MedicalSpecialty.OBGYN:
        return {
          primary: 'text-pink-600',
          primaryBg: 'bg-pink-600',
          primaryLight: 'bg-pink-50',
          border: 'border-pink-200'
        };
      default:
        return {
          primary: 'text-emerald-600',
          primaryBg: 'bg-emerald-600',
          primaryLight: 'bg-emerald-50',
          border: 'border-emerald-200'
        };
    }
  };

  const theme = getSpecialtyTheme();

  // Load documents from database
  const loadDocuments = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const queryOptions: DocumentListParams = {
        limit: 50,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      // Apply filters to API query
      if (filters.searchTerm.trim()) {
        queryOptions.search = filters.searchTerm.trim();
      }

      if (filters.status !== 'all') {
        // Convert ProcessingStatus to match the expected API
        if (filters.status === 'processing' || filters.status === 'pending' || filters.status === 'completed' || filters.status === 'failed') {
          // The API doesn't have a direct status filter, so we'll handle this client-side
        }
      }

      if (filters.category !== 'all') {
        queryOptions.category = filters.category;
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
        
        setDocuments(convertedDocs);
        setTotal(result.total);
        setHasMore(result.hasMore);
        // Update the global personal document count
        setPersonalDocumentCount(result.total);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load documents when filters change
  useEffect(() => {
    loadDocuments();
  }, [user, filters]);

  // Apply client-side filtering for date range and additional filtering
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Date range filter (client-side since it's complex for the API)
      if (filters.dateRange.from) {
        const docDate = new Date(doc.created_at).toISOString().split('T')[0];
        if (docDate < filters.dateRange.from) return false;
      }
      
      if (filters.dateRange.to) {
        const docDate = new Date(doc.created_at).toISOString().split('T')[0];
        if (docDate > filters.dateRange.to) return false;
      }

      return true;
    });
  }, [documents, filters.dateRange]);

  // Extract available tags from all documents
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    documents.forEach(doc => {
      doc.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [documents]);

  // Document stats
  const documentStats = useMemo(() => {
    const stats = {
      total: filteredDocuments.length,
      completed: filteredDocuments.filter(doc => doc.upload_status === 'completed').length,
      pending: filteredDocuments.filter(doc => doc.upload_status === 'pending' || doc.upload_status === 'uploading').length,
      failed: filteredDocuments.filter(doc => doc.upload_status === 'failed').length,
      totalSize: filteredDocuments.reduce((acc, doc) => acc + (doc.file_size || 0), 0)
    };
    
    return stats;
  }, [filteredDocuments]);

  // Handle document upload success
  const handleUploadSuccess = async () => {
    setShowUpload(false);
    await loadDocuments(); // Reload the list
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    const [result, deleteError] = await safeAsync(async () => {

      const deleteResult = await deleteUserDocument({ documentId, deleteFromOpenAI: true });

      return deleteResult;
    }, {
      context: `deleting document "${title}" from knowledge base`,
      severity: ErrorSeverity.HIGH,
      showToast: true
    });

    if (deleteError) {
      setError(deleteError.userMessage || 'Failed to delete document');
      return;
    }
      
    // Show detailed feedback to user for partial success
    if (result.partialSuccess) {
      // Create detailed warning message
      const warningDetails = [];
      if (result.cleanupResults?.vectorStoreRemoval?.attempted && !result.cleanupResults.vectorStoreRemoval.success) {
        warningDetails.push('- Failed to remove from OpenAI Vector Store');
      }
      if (result.cleanupResults?.openaiFileDeletion?.attempted && !result.cleanupResults.openaiFileDeletion.success) {
        warningDetails.push('- Failed to delete from OpenAI Files (may still appear in OpenAI dashboard)');
      }
      if (result.cleanupResults?.storageDeletion?.attempted && !result.cleanupResults.storageDeletion.success) {
        warningDetails.push('- Failed to remove from storage');
      }
      
      const warningMessage = `Document "${title}" was removed from your library, but some cleanup operations failed:\n\n${warningDetails.join('\n')}\n\nThe document may still appear in your OpenAI dashboard. You may need to manually clean it up there.`;
      
      // Show warning alert
      alert(warningMessage);
    }
    
    await loadDocuments(); // Reload the list
    // Close details modal if the deleted document was being viewed
    if (selectedDocument && selectedDocument.id === documentId) {
      setSelectedDocument(null);
    }
  };

  const handleViewDocument = async (document: DocumentWithMetadata) => {
    setSelectedDocument(document);
  };

  const handleDownloadDocument = (document: DocumentWithMetadata) => {
    // Implement download functionality
  };

  const handleDeleteFromDetails = async () => {
    if (selectedDocument) {
      await handleDeleteDocument(selectedDocument.id, selectedDocument.title);
    }
  };

  const handleDownloadFromDetails = () => {
    if (selectedDocument) {
      handleDownloadDocument(selectedDocument);
    }
  };

  const handleRefresh = () => {
    loadDocuments();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access your personal knowledge base.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {/* Top Stats Row - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-h-[80px]">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm text-gray-600 truncate">{t('documents.stats.totalDocuments')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{documentStats.total}</p>
                </div>
                <File className={`w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 ${theme.primary}`} />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-h-[80px]">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm text-gray-600 truncate">{t('documents.stats.completed')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{documentStats.completed}</p>
                </div>
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-h-[80px]">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm text-gray-600 truncate">{t('documents.stats.processing')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{documentStats.pending}</p>
                </div>
                <Loader className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-h-[80px] sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm text-gray-600 truncate">{t('documents.stats.storageUsed')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatFileSize(documentStats.totalSize)}</p>
                </div>
                <TrendingUp className={`w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 ${theme.primary}`} />
              </div>
            </div>
          </div>

          {/* Actions and Search Row - Mobile Optimized */}
          <div className="flex flex-col gap-4">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowUpload(true)}
                className={`${theme.primaryBg} text-white px-6 py-4 min-h-[48px] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 font-medium transform hover:scale-105`}
              >
                <Upload className="w-5 h-5" />
                <span>{t('documents.actions.uploadDocument')}</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-white text-gray-700 border border-gray-300 px-4 py-4 min-h-[48px] rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{t('documents.actions.refresh')}</span>
              </button>
            </div>

            {/* Search and Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('documents.actions.searchPlaceholder')}
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="w-full pl-10 pr-4 py-4 min-h-[48px] border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>

              {/* Filter and View Controls */}
              <div className="flex gap-2">
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-4 min-h-[48px] min-w-[48px] rounded-xl border transition-all duration-200 flex items-center justify-center ${
                    showFilters 
                      ? `${theme.primaryBg} text-white border-transparent` 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-white border border-gray-300 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 min-h-[44px] min-w-[44px] rounded-lg transition-all duration-200 flex items-center justify-center ${
                      viewMode === 'grid'
                        ? `${theme.primaryBg} text-white`
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 min-h-[44px] min-w-[44px] rounded-lg transition-all duration-200 flex items-center justify-center ${
                      viewMode === 'list'
                        ? `${theme.primaryBg} text-white`
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <DocumentSearch
                filters={filters}
                onFiltersChange={setFilters}
                availableTags={availableTags}
                totalDocuments={total}
                filteredDocuments={filteredDocuments.length}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">Error Loading Documents</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Loading your documents...</h3>
              <p className="text-sm sm:text-base text-gray-500">Please wait while we fetch your knowledge base.</p>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Documents Found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
              {filters.searchTerm || filters.category !== 'all' || filters.tags.length > 0
                ? 'No documents match your current filters. Try adjusting your search criteria.'
                : 'Start building your personal knowledge base by uploading your first document.'
              }
            </p>
            {(!filters.searchTerm && filters.category === 'all' && filters.tags.length === 0) && (
              <button
                onClick={() => setShowUpload(true)}
                className={`${theme.primaryBg} text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium transform hover:scale-105`}
              >
                Upload Your First Document
              </button>
            )}
          </div>
        ) : (
          <DocumentList
            documents={filteredDocuments}
            isLoading={false}
            searchTerm={filters.searchTerm}
            filterStatus={filters.status}
            total={total}
            viewMode={viewMode}
            onDeleteDocument={handleDeleteDocument}
            onViewDocument={handleViewDocument}
            onDownloadDocument={handleDownloadDocument}
            onUpload={() => setShowUpload(true)}
          />
        )}
      </div>

      {/* Upload Modal - Mobile Optimized */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[96vh] sm:h-[92vh] max-h-[96vh] sm:max-h-[92vh] overflow-hidden flex flex-col">
            <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upload Document</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-400 hover:text-gray-600 p-3 min-h-[44px] min-w-[44px] rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <DocumentUpload 
                onClose={() => setShowUpload(false)}
                onUploadSuccess={(document: any) => {
                  handleUploadSuccess();
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Document Details Modal - Mobile Optimized */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[96vh] sm:h-[92vh] max-h-[96vh] sm:max-h-[92vh] overflow-hidden">
            <DocumentDetails
              document={selectedDocument}
              isOpen={true}
              onClose={() => setSelectedDocument(null)}
              onDelete={handleDeleteFromDetails}
              onDownload={handleDownloadFromDetails}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 