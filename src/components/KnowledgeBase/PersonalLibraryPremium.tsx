import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Command,
  AlertCircle,
  Activity,
  Archive,
  CheckCircle,
  Cloud,
  Shield,
  BookOpen,
  X
} from 'lucide-react';
import {
  PremiumLoader,
  FloatingActionButton,
  LiquidLoader,
  FloatingParticles
} from './PremiumAnimations';
import { useAuth, useSpecialty, MedicalSpecialty, useAppStore } from '../../stores/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import { DocumentUpload } from './DocumentUpload';
import { DocumentDetails } from './DocumentDetails';
import { CommandPalette, useCommandPalette } from './CommandPalette';
import { DocumentWithMetadata } from '../../lib/api/knowledgeBase';
import { EmptyState } from './components/EmptyState';

// Import refactored components and hooks
import {
  SearchFilters,
  SpecialtyTheme,
  useLibraryState,
  useDocumentOperations,
  useDocumentFiltering,
  LibraryControls,
  DocumentGrid,
  formatFileSize,
  groupDocuments
} from './PersonalLibrary';

export const PersonalLibraryPremium: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { specialty } = useSpecialty();
  const { setPersonalDocumentCount } = useAppStore();

  // Library state management
  const {
    state,
    setState,
    toggleGroup,
    toggleDocumentSelection,
    clearSelections,
    selectAllDocuments,
    setViewMode,
    setSortBy,
    setSortOrder,
    setDisplayDensity,
    toggleMetadata,
    documentStats,
    getGridClasses
  } = useLibraryState();

  // UI states
  const [showUpload, setShowUpload] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithMetadata | null>(null);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Search filters
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    status: 'all',
    category: 'all',
    tags: [],
    dateRange: { from: '', to: '' },
    fileTypes: [],
    sizeRange: { min: 0, max: 100 },
    favorites: false,
    recent: false
  });

  // Command palette
  const { isOpen: isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useCommandPalette();

  // Document operations hook
  const {
    isLoading,
    error,
    isMonitoring,
    monitoringStatus,
    loadDocuments,
    deleteDocument,
    deleteMultipleDocuments,
    monitorStatus
  } = useDocumentOperations({
    onDocumentsUpdated: (documentGroups, totalCount) => {
      setState(prev => ({ ...prev, documentGroups, documents: documentGroups.flatMap(g => g.documents) }));
      setTotal(totalCount);
    },
    onDocumentCountUpdated: setPersonalDocumentCount
  });

  // Document filtering hook
  const { processedDocumentGroups, processedDocuments } = useDocumentFiltering({
    documentGroups: state.documentGroups,
    filters,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder
  });

  // Get specialty theme
  const getSpecialtyTheme = (): SpecialtyTheme => {
    switch (specialty) {
      case MedicalSpecialty.CARDIOLOGY:
        return {
          primary: 'text-[#1a365d]',
          primaryBg: 'bg-[#1a365d]',
          primaryLight: 'bg-[#63b3ed]/10',
          primaryGradient: 'from-[#1a365d] to-[#2b6cb0]',
          border: 'border-[#63b3ed]/30',
          accent: 'bg-[#63b3ed]/20'
        };
      case MedicalSpecialty.OBGYN:
        return {
          primary: 'text-[#2b6cb0]',
          primaryBg: 'bg-[#2b6cb0]',
          primaryLight: 'bg-[#90cdf4]/10',
          primaryGradient: 'from-[#2b6cb0] to-[#63b3ed]',
          border: 'border-[#90cdf4]/30',
          accent: 'bg-[#90cdf4]/20'
        };
      default:
        return {
          primary: 'text-[#2b6cb0]',
          primaryBg: 'bg-[#2b6cb0]',
          primaryLight: 'bg-[#63b3ed]/10',
          primaryGradient: 'from-[#1a365d] to-[#2b6cb0]',
          border: 'border-[#63b3ed]/30',
          accent: 'bg-[#63b3ed]/20'
        };
    }
  };

  const theme = getSpecialtyTheme();

  // Load documents when filters change
  useEffect(() => {
    loadDocuments(filters, user);
  }, [user, filters]);

  // Available filters for advanced search
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    state.documents.forEach(doc => doc.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [state.documents]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    state.documents.forEach(doc => categories.add(doc.category || 'other'));
    return Array.from(categories);
  }, [state.documents]);

  const availableFileTypes = useMemo(() => {
    const types = new Set<string>();
    state.documents.forEach(doc => types.add(doc.file_type));
    return Array.from(types);
  }, [state.documents]);

  // Event handlers
  const handleUploadSuccess = async () => {
    setShowUpload(false);
    await loadDocuments(filters, user);
  };

  const handleViewDocument = (document: DocumentWithMetadata) => {
    setSelectedDocument(document);
  };

  const handleDeleteDocument = async (documentId: string, title: string) => {
    await deleteDocument(documentId, title, () => loadDocuments(filters, user));
    if (selectedDocument && selectedDocument.id === documentId) {
      setSelectedDocument(null);
    }
  };

  const handleDeleteAllDocuments = async (documentIds: string[], title: string) => {
    await deleteMultipleDocuments(documentIds, title, () => loadDocuments(filters, user));
  };

  const handleDownloadDocument = () => {
    // Implement download functionality
  };

  const handleRefresh = () => {
    loadDocuments(filters, user);
  };

  const handleMonitorStatus = () => {
    monitorStatus(user, () => loadDocuments(filters, user));
  };

  const handleSelectAll = () => {
    if (state.selectedDocuments.size === processedDocuments.length) {
      clearSelections();
    } else {
      selectAllDocuments();
    }
  };

  // Command palette commands
  const commandPaletteCommands = useMemo(() => [
    {
      id: 'upload',
      label: 'Upload Documents',
      description: 'Add new documents to your library',
      icon: <Upload className="w-4 h-4" />,
      action: () => setShowUpload(true),
      keywords: ['upload', 'add', 'new', 'document'],
      category: 'actions' as const,
      shortcut: 'Cmd+U'
    }
  ], []);

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access your personal knowledge base.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {/* Hero Stats Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('knowledgeBase.totalLibrary')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{documentStats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('knowledgeBase.documentsCount')}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${theme.primaryGradient} shadow-lg`}>
                  <Archive className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('knowledgeBase.ready')}</p>
                  <p className="text-3xl font-bold text-[#2b6cb0]">{documentStats.completed}</p>
                  <p className="text-xs text-[#2b6cb0] mt-1">{t('knowledgeBase.processed')}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#2b6cb0] to-[#63b3ed] shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('knowledgeBase.processing')}</p>
                  <p className="text-3xl font-bold text-[#63b3ed]">{documentStats.pending}</p>
                  <p className="text-xs text-[#63b3ed] mt-1">{t('knowledgeBase.inQueue')}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#63b3ed] to-[#90cdf4] shadow-lg">
                  <Activity className="w-6 h-6 text-white animate-pulse" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg backdrop-blur-sm col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('knowledgeBase.storage')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatFileSize(documentStats.totalSize)}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('knowledgeBase.totalUsed')}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#90cdf4] to-[#63b3ed] shadow-lg">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Library Controls */}
          <LibraryControls
            searchFilters={filters}
            viewMode={state.viewMode}
            sortBy={state.sortBy}
            sortOrder={state.sortOrder}
            displayDensity={state.displayDensity}
            showMetadata={state.showMetadata}
            selectedDocumentsCount={state.selectedDocuments.size}
            totalDocuments={total}
            filteredDocuments={processedDocuments.length}
            theme={theme}
            isLoading={isLoading}
            isMonitoring={isMonitoring}
            showAdvancedSearch={showAdvancedSearch}
            showSortOptions={showSortOptions}
            showViewOptions={showViewOptions}
            availableTags={availableTags}
            availableCategories={availableCategories}
            availableFileTypes={availableFileTypes}
            onUploadClick={() => setShowUpload(true)}
            onRefresh={handleRefresh}
            onMonitorStatus={handleMonitorStatus}
            onSearchChange={setFilters}
            onViewModeChange={setViewMode}
            onSortChange={(sortBy, sortOrder) => { setSortBy(sortBy); setSortOrder(sortOrder); }}
            onDisplayDensityChange={setDisplayDensity}
            onShowMetadataToggle={toggleMetadata}
            onToggleAdvancedSearch={() => setShowAdvancedSearch(!showAdvancedSearch)}
            onToggleSortOptions={() => setShowSortOptions(!showSortOptions)}
            onToggleViewOptions={() => setShowViewOptions(!showViewOptions)}
            onSelectAll={handleSelectAll}
            onClearSelection={clearSelections}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">Error Loading Documents</h3>
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {monitoringStatus && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center space-x-3">
            <Activity className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200">File Processing Status</h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">{monitoringStatus}</p>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="mb-8"><PremiumLoader size="lg" /></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Loading your library...</h3>
              <p className="text-gray-600 dark:text-gray-400">Fetching your documents and organizing your knowledge base.</p>
              <div className="mt-6 max-w-xs mx-auto"><LiquidLoader progress={75} color="#3B82F6" /></div>
            </motion.div>
          </div>
        ) : processedDocumentGroups.length === 0 ? (
          <EmptyState
            filters={filters}
            onUploadClick={() => setShowUpload(true)}
            theme={theme}
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {processedDocumentGroups.length} item{processedDocumentGroups.length !== 1 ? 's' : ''}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                    ({processedDocuments.length} document{processedDocuments.length !== 1 ? 's' : ''})
                  </span>
                </h2>
                {total > processedDocuments.length && (
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm rounded-full">
                    {t('knowledgeBase.showingFirst')} {processedDocuments.length} {t('knowledgeBase.of')} {total} {t('knowledgeBase.documentsText')}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            <DocumentGrid
              documentGroups={processedDocumentGroups}
              viewMode={state.viewMode}
              displayDensity={state.displayDensity}
              expandedGroups={state.expandedGroups}
              selectedDocuments={state.selectedDocuments}
              showMetadata={state.showMetadata}
              gridClasses={getGridClasses()}
              onToggleGroup={toggleGroup}
              onViewDocument={handleViewDocument}
              onDeleteDocument={handleDeleteDocument}
              onDeleteAllDocuments={handleDeleteAllDocuments}
              onSelectDocument={toggleDocumentSelection}
              onDownloadDocument={handleDownloadDocument}
            />
          </motion.div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('knowledgeBase.uploadDocuments')}</h2>
                  <button onClick={() => setShowUpload(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <DocumentUpload onClose={() => setShowUpload(false)} onUploadSuccess={handleUploadSuccess} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Details Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <DocumentDetails
                document={selectedDocument}
                isOpen={true}
                onClose={() => setSelectedDocument(null)}
                onDelete={async () => {
                  await handleDeleteDocument(selectedDocument.id, selectedDocument.title);
                }}
                onDownload={handleDownloadDocument}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} commands={commandPaletteCommands} />

      {/* Floating Action Buttons */}
      <FloatingActionButton icon={<Upload className="w-6 h-6" />} onClick={() => setShowUpload(true)} position="bottom-right" variant="primary" tooltip="Upload Documents (⌘+U)" />
      <FloatingActionButton icon={<Command className="w-6 h-6" />} onClick={openCommandPalette} position="bottom-left" variant="secondary" tooltip="Command Palette (⌘+K)" />

      {/* Floating Particles Background */}
      <FloatingParticles count={30} speed={15} color={theme.primaryBg.replace('bg-', '#')} />
    </div>
  );
};
