export const knowledgeBase = {
  // Main page headers
  title: 'Knowledge Base',
  subtitle: 'Cardiology Resources',
  description: 'Access comprehensive medical literature, evidence-based guidelines, and your personal document collection with AI-powered insights.',
  
  // Root level keys for KnowledgeBaseSelector
  personal: 'Personal',
  curated: 'Curated',
  
  // Feature highlights
  evidenceBased: 'Evidence-Based',
  aiPoweredSearch: 'AI-Powered Search',
  securePrivate: 'Secure & Private',
  
  // Quick stats
  quickStats: 'Quick Stats',
  medicalGuidelines: 'Medical Guidelines',
  researchPapers: 'Research Papers',
  clinicalProtocols: 'Clinical Protocols',
  
  // Tabs
  curatedKnowledge: 'Curated Knowledge',
  curatedKnowledgeDesc: 'Medical literature and guidelines',
  personalLibrary: 'Personal Library',
  personalLibraryDesc: 'Your documents and notes',
  badgeVerified: 'Verified',
  sourcesCount: '2.5M+ sources',
  badgeReady: 'Ready',
  badgeEmpty: 'Empty',
  personalCount: '{{count}} documents',
  uploadToEnable: 'Upload to enable',
  aiVerified: 'AI Verified',
  selectionInfluenceNotice: 'Knowledge base selection influences AI response accuracy and information depth',
  
  // Tooltip content
  curatedTooltipTitle: 'Medical Knowledge Base',
  curatedTooltipDesc: 'AI will answer using established cardiology knowledge from medical experts and trusted sources.',
  personalTooltipTitle: 'Your Documents',
  personalTooltipDesc: 'AI will answer using information from your uploaded documents and personal files.',
  
  // Document management
  documents: {
    totalDocuments: 'Total Documents',
    completed: 'Completed',
    processing: 'Processing',
    storageUsed: 'Storage Used',
    
    // Upload section
    uploadDocument: 'Upload Document',
    refresh: 'Refresh',
    searchDocuments: 'Search documents',
    
    // Filters
    allStatus: 'All Status',
    ready: 'Ready',
    pending: 'Processing',
    error: 'Error',
    
    // Advanced filters
    advanced: 'Advanced',
    allCategories: 'All Categories',
    from: 'From',
    to: 'To',
    
    // Results
    showingResults: 'Showing',
    of: 'of',
    documentsText: 'documents',
    showingAll: 'Showing all',
    
    // Upload process
    dragDropText: 'Drop files here or click to select',
    selectFiles: 'Select Files',
    uploadButton: 'Upload',
    maxFileSize: 'Max file size: {{size}}MB',
    supportedFormats: 'Supported formats',
    
    // File actions
    retry: 'Retry',
    remove: 'Remove',
    preview: 'Preview',
    
    // File metadata
    fileName: 'File Name',
    description: 'Description',
    category: 'Category',
    
    // List view
    uploadFirstButton: 'Upload First Document',
    list: {
      showing: 'Showing',
      of: 'of',
      documents: 'documents',
      uploadFirstButton: 'Upload First Document'
    }
  },
  
  // Curated Knowledge Base Settings
  curatedSettings: {
    searchPlaceholder: 'Search resources, authors, organizations...',
    sortByTitle: 'Sort by Title',
    sortByYear: 'Sort by Year',
    sortByCategory: 'Sort by Category',
    sortByOrganization: 'Sort by Organization',
    
    // View modes
    gridView: 'Grid View',
    listView: 'List View',
    
    // Search results
    searchingFor: 'Searching for:',
    noResultsFound: 'No results found',
    tryDifferentTerms: 'Try different search terms',
    
    // Resource details
    authors: 'Authors',
    organization: 'Organization',
    year: 'Year',
    category: 'Category',
    viewDocument: 'View Document',
    downloadPDF: 'Download PDF',
    
    // Results summary
    resourcesFound: 'Found {{count}} cardiology resources'
  },
  
  // Vector Store Management
  vectorStore: {
    createVectorStore: 'Create Vector Store',
    managingVectorStore: 'Managing Vector Store',
    loading: 'Loading...',
    noVectorStore: 'No vector store found',
    createOne: 'Create one',
    refreshData: 'Refresh Data',
    deleteVectorStore: 'Delete Vector Store',
    delete: 'Delete',
    
    // Creation form
    vectorStoreName: 'Vector Store Name',
    vectorStoreNamePlaceholder: 'My Medical Knowledge Base',
    description: 'Description',
    descriptionPlaceholder: 'Personal collection of medical documents and research papers',
    cancel: 'Cancel',
    create: 'Create',
    
    // Status indicators
    ready: 'Ready',
    processing: 'Processing',
    pending: 'Pending',
    failed: 'Failed',
    unknown: 'Unknown'
  },
  
  // Document Details Modal
  details: {
    documentDetails: 'Document Details',
    close: 'Close',
    fileInformation: 'File Information',
    uploadedOn: 'Uploaded On',
    fileSize: 'File Size',
    processingStatus: 'Processing Status',
    
    // Processing status
    statusReady: 'Ready',
    statusProcessing: 'Processing',
    statusPending: 'Pending',
    statusFailed: 'Failed',
    
    // Actions
    reprocess: 'Reprocess',
    downloadOriginal: 'Download Original',
    deleteDocument: 'Delete Document'
  }
};

export default knowledgeBase; 