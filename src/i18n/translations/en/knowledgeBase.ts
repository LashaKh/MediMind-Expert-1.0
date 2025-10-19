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
  
  // Filters
  filters: {
    all: 'All',
    featured: 'Featured',
    trending: 'Trending',
    bookmarked: 'Bookmarked',
    recent: 'Recent'
  },

  // Sorting
  sorting: {
    relevance: 'Relevance',
    rating: 'Rating',
    citations: 'Citations',
    views: 'Views',
    year: 'Year',
    trending: 'Trending'
  },

  // Resource metadata
  resourcesFound: '{{count}} resources found',
  avg: 'avg',
  min: 'min',
  updated: 'Updated',

  // Difficulty levels
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',

  // Resource types
  clinicalGuideline: 'Clinical Guideline',
  medicalBook: 'Medical Book',
  authors: 'Authors',

  // Loading states
  loadingKnowledgeBase: 'Loading Knowledge Base',
  preparingResources: 'Preparing Resources',

  // Curated Knowledge Base Settings
  curatedSettings: {
    searchPlaceholder: 'Search {{specialty}} resources, authors, organizations...',
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
  },

  // Curated page texts
  book: 'Book',
  guideline: 'Guideline',
  featured: 'Featured',
  trending: 'Trending',
  medicalBook: 'Medical Book',
  clinicalGuideline: 'Clinical Guideline',
  authors: 'Authors',
  citations: 'Citations',
  views: 'Views',
  more: 'More',
  min: 'min',
  updated: 'Updated',
  loadingKnowledgeBase: 'Loading Knowledge Base',
  preparingResources: 'Preparing your medical resources...',
  avg: 'avg',
  noResourcesFound: 'No resources found',
  couldntFindResources: 'Couldn\'t find resources matching',
  clearSearchBrowseAll: 'Clear search and browse all resources',
  trySearchingFor: 'Try searching for',
  noResourcesMatchFilters: 'No resources match your filters. Try adjusting your search criteria.',
  topics: 'Topics',
  resourceStats: 'Resource Stats',
  rating: 'Rating',
  difficulty: 'Difficulty',
  readTime: 'Read Time',
  openResource: 'Open Resource',
  save: 'Save',
  share: 'Share',
  lastUpdated: 'Last Updated',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',

  // Personal Library Premium texts
  totalLibrary: 'Total Library',
  documentsCount: 'documents',
  ready: 'Ready',
  processed: 'Processed',
  processing: 'Processing',
  inQueue: 'In Queue',
  storage: 'Storage',
  totalUsed: 'Total Used',
  uploadDocuments: 'Upload Documents',
  refresh: 'Refresh',
  monitor: 'Monitor',
  searchYourKnowledgeBase: 'Search your knowledge base...',
  sortBy: 'Sort by',
  name: 'Name',
  date: 'Date',
  size: 'Size',
  type: 'Type',
  advancedFilters: 'Advanced Filters',
  quickFilters: 'Quick Filters',
  favorites: 'Favorites',
  recent: 'Recent',
  completed: 'Completed',
  researchPapers: 'Research Papers',
  clinicalGuidelines: 'Clinical Guidelines',
  caseStudies: 'Case Studies',
  protocols: 'Protocols',
  referenceMaterials: 'Reference Materials',
  personalNotes: 'Personal Notes',
  other: 'Other',
  pdf: 'PDF',
  images: 'Images',
  documentsType: 'Documents',
  spreadsheets: 'Spreadsheets',
  yourKnowledgeBaseAwaits: 'Your Knowledge Base Awaits',
  startBuildingLibrary: 'Start building your personal medical knowledge library by uploading your first document',
  uploadYourFirstDocument: 'Upload Your First Document',
  of: 'of',
  documentsText: 'documents',
  showingFirst: 'Showing first',
  tags: 'Tags',
  addTagsToFilter: 'Add tags to filter...',
  dateRange: 'Date Range',
  from: 'From',
  to: 'To',
  fileSize: 'File Size',
  selectAll: 'Select All',
  deselectAll: 'Deselect All',
  clearSelection: 'Clear Selection',
  documentsSelected: 'documents selected',
  noDocumentsMatchSearch: 'No documents match your search',
  tryAdjustingCriteria: 'Try adjusting your search criteria or filters to find what you\'re looking for.'
};

export default knowledgeBase; 