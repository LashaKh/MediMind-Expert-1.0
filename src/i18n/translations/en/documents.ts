export default {
  uploadTitle: 'Upload Documents',
  uploadSubtitle: 'Add medical literature, research papers, and clinical documents to your knowledge base',
  dragDropText: 'Drag and drop files here, or click to select',
  browseFiles: 'Browse Files',
  supportedFormats: 'Supported formats: PDF, Word, Text, Markdown, CSV',
  maxFileSize: 'Maximum file size: {size}MB',
  maxFiles: 'Maximum {count} files',
  selectFiles: 'Select Files',
  uploading: 'Uploading...',
  processing: 'Processing...',
  complete: 'Complete',
  error: 'Error',
  success: 'Success',
  retry: 'Retry',
  remove: 'Remove',
  retryAll: 'Retry All Failed',
  clearErrors: 'Clear Errors',
  title: 'Title',
  titlePlaceholder: 'Enter document title',
  description: 'Description',
  descriptionPlaceholder: 'Enter document description',
  tags: 'Tags',
  tagsPlaceholder: 'Add tags (press Enter)',
  category: 'Category',
  selectCategory: 'Select category',
  advancedOptions: 'Advanced Options',
  showAdvancedOptions: 'Show Advanced Options',
  hideAdvancedOptions: 'Hide Advanced Options',
  initializingKnowledgeBase: 'Initializing personal knowledge base...',
  uploadSuccess: 'Documents uploaded successfully!',
  uploadError: 'Failed to upload documents. Please try again.',
  fileTypeError: 'Unsupported file type: {type}. Please upload PDF, Word, text, or CSV files.',
  fileSizeError: 'File size exceeds {size}MB limit. Please choose a smaller file.',
  emptyFileError: 'File appears to be empty. Please select a valid file.',
  largeFileWarning: 'Large file detected. Processing may take longer.',
  imageFileWarning: 'Large image file. Consider compressing for faster processing.',
  noFilesSelected: 'No files selected for upload.',
  allFilesProcessed: 'All files have been processed.',
  
  // Upload Modal - Progressive Steps
  modal: {
    title: 'Upload Documents',
    subtitle: 'Add medical literature, research papers, and clinical documents to your knowledge base',
    
    // Step indicators
    steps: {
      select: 'Select',
      configure: 'Configure', 
      upload: 'Upload',
      complete: 'Complete'
    },
    
    // Select step
    select: {
      title: 'Drag and drop files here',
      subtitle: 'or click to select files from your computer',
      selectFiles: 'Select Files',
      dropFiles: 'Drop files here',
      supportedTypes: 'Supported file types',
      maxSizeNote: 'Maximum file size: {size}MB • Maximum files: {maxFiles}'
    },
    
    // Configure step
    configure: {
      title: 'Configure Documents',
      filesSelected: '{count} file selected|{count} files selected',
      documentTitle: 'Document Title',
      documentTitleRequired: 'Document Title *',
      titlePlaceholder: 'Enter document title...',
      description: 'Description',
      descriptionPlaceholder: 'Brief description of the document content...',
      category: 'Category',
      tags: 'Tags',
      tagsPlaceholder: 'Add tags separated by commas...',
      addMoreFiles: 'Add More Files',
      startUpload: 'Start Upload'
    },
    
    // Upload step
    upload: {
      title: 'Uploading Documents',
      subtitle: 'Processing your files and adding them to your knowledge base...',
      uploading: 'Uploading...',
      complete: 'Complete',
      failed: 'Failed'
    },
    
    // Complete step
    complete: {
      title: 'Upload Complete!',
      subtitle: 'Your documents have been successfully added to your knowledge base.',
      continueButton: 'Continue to Knowledge Base'
    },
    
    // Error handling
    errors: {
      vectorStoreInit: 'Failed to initialize knowledge base. Please try again.',
      uploadFailed: '{count} upload failed|{count} uploads failed'
    }
  },

  // Categories
  categories: {
    'research-papers': 'Research Papers',
    'clinical-guidelines': 'Clinical Guidelines',
    'case-studies': 'Case Studies',
    'medical-images': 'Medical Images',
    'lab-results': 'Lab Results',
    'patient-education': 'Patient Education',
    'protocols': 'Protocols',
    'reference-materials': 'Reference Materials',
    'personal-notes': 'Personal Notes',
    'other': 'Other'
  },
  
  // File types
  fileTypes: {
    'pdf': 'PDF Document',
    'word-doc': 'Word Document (.doc)',
    'word-docx': 'Word Document (.docx)',
    'excel': 'Excel',
    'text': 'Text File',
    'markdown': 'Markdown File',
    'csv': 'CSV File',
    'unknown': 'Unknown'
  },
  
  // Status
  status: {
    pending: 'Pending',
    uploading: 'Uploading',
    processing: 'Processing',
    complete: 'Complete',
    success: 'Success',
    error: 'Error',
    ready: 'Ready'
  },
  
  // DocumentList translations
  list: {
    noDocuments: 'No documents uploaded yet',
    noDocumentsFiltered: 'No documents found',
    uploadFirstDocument: 'Upload your first medical document to get started with AI-powered analysis and intelligent document management.',
    adjustSearchCriteria: 'Try adjusting your search criteria or filters to find what you\'re looking for.',
    uploadFirstButton: 'Upload Your First Document',
    showing: 'Showing',
    of: 'of',
    documents: 'documents',
    moreResultsAvailable: 'More results available',
    showingFirst: 'Showing first {count} documents. Use filters to narrow down results.'
  },
  
  // DocumentItem translations
  item: {
    viewDetails: 'View Document Details',
    downloadDocument: 'Download Document',
    deleteDocument: 'Delete Document',
    processingError: 'Processing Error',
    moreTagsIndicator: '+{count} more',
    statusLabels: {
      completed: 'Ready',
      processing: 'Processing',
      pending: 'Pending',
      failed: 'Error'
    }
  },
  
  // Status messages
  statuses: {
    pending: 'Pending upload',
    uploading: 'Uploading file...',
    processing: 'Processing document...',
    complete: 'Processing complete',
    success: 'Successfully uploaded',
    error: 'Upload failed'
  },
  
  // Action messages
  selectedFiles: '{count} file selected|{count} files selected',
  filesUploaded: '{count} uploaded',
  filesFailed: '{count} failed',
  filesSelected: '{count} file selected|{count} files selected',
  uploadButton: 'Upload {count} Document|Upload {count} Documents',
  retryCount: 'Retry #{count}',
  retryInstruction: 'Click the retry button or try uploading again.',
  uploadSuccessMessage: 'Upload successful! Processing in background...',
  clearAll: 'Clear All',
  close: 'Close',
  cancel: 'Cancel',
  dropFiles: 'Drop files here',
  
  // Statistics section
  stats: {
    totalDocuments: 'Total Documents',
    completed: 'Completed',
    processing: 'Processing',
    storageUsed: 'Storage Used'
  },
  
  // Actions
  actions: {
    uploadDocument: 'Upload Document',
    refresh: 'Refresh',
    searchPlaceholder: 'Search documents...'
  }
}; 