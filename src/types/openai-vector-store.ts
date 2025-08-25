// Types for OpenAI Vector Store integration

export interface UserVectorStore {
  id: string;
  user_id: string;
  openai_vector_store_id: string; // e.g., vs_abc123
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error' | 'deleting';
  document_count: number;
  total_size_bytes: number;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
  openai_metadata?: any; // Store OpenAI Vector Store metadata
}

export interface UserDocument {
  id: string;
  user_id: string;
  vector_store_id: string;
  
  // OpenAI identifiers
  openai_file_id: string; // e.g., file_xyz789
  openai_vector_store_file_id?: string; // ID of the file within the vector store
  
  // Document metadata
  title: string;
  description?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  
  // Categories and organization
  category: DocumentCategory;
  tags: string[];
  is_private: boolean;
  
  // Processing status
  upload_status: UploadStatus;
  processing_status: ProcessingStatus;
  error_message?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  uploaded_at?: string;
  processed_at?: string;
  
  // OpenAI metadata
  openai_metadata?: any; // Store additional OpenAI file metadata
}

export type DocumentCategory = 
  | 'research-papers'
  | 'clinical-guidelines'
  | 'case-studies'
  | 'medical-images'
  | 'lab-results'
  | 'patient-education'
  | 'protocols'
  | 'reference-materials'
  | 'personal-notes'
  | 'other';

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DocumentUploadRequest {
  file: File;
  vectorStoreId: string;
  title: string;
  description?: string;
  category?: DocumentCategory;
  tags?: string[];
}

export interface DocumentUploadResponse {
  message: string;
  documentId: string;
  uploadedFileId: string;
  vectorStoreFileId?: string;
  vectorStoreFileAssociation?: any;
}

export interface VectorStoreCreateRequest {
  name: string;
  description?: string;
}

export interface VectorStoreCreateResponse {
  message: string;
  vectorStore: {
    id: string;
    openai_vector_store_id: string;
    name: string;
    description?: string;
    status: string;
    document_count: number;
    created_at: string;
  };
}

export interface VectorStoreGetResponse {
  vectorStore: UserVectorStore & {
    openai_status?: string;
    openai_file_counts?: any;
    openai_error?: string;
  } | null;
}

export interface VectorStoreDeleteResponse {
  message: string;
  deletedVectorStoreId: string;
}

export interface OpenAIError {
  error: {
    message: string;
    type?: string;
    code?: string;
  };
}

// Utility types for API responses
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface DocumentListParams {
  category?: DocumentCategory;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'file_size';
  sortOrder?: 'asc' | 'desc';
}

export interface DocumentListResponse {
  documents: UserDocument[];
  total: number;
  hasMore: boolean;
}

// Document management operations
export interface DocumentDeleteRequest {
  documentId: string;
  deleteFromOpenAI?: boolean; // Whether to also delete from OpenAI
}

export interface DocumentUpdateRequest {
  documentId: string;
  title?: string;
  description?: string;
  category?: DocumentCategory;
  tags?: string[];
  is_private?: boolean;
}

// Vector Store status and health
export interface VectorStoreStatus {
  status: 'active' | 'inactive' | 'error' | 'deleting';
  document_count: number;
  total_size_bytes: number;
  openai_status?: string;
  openai_file_counts?: {
    in_progress: number;
    completed: number;
    failed: number;
    cancelled: number;
    total: number;
  };
  last_sync_at?: string;
  error_message?: string;
}

// Chat integration types
export interface ChatContextWithVectorStore {
  selectedKnowledgeBase: 'curated' | 'personal';
  personalVectorStoreId?: string;
  personalDocumentCount: number;
}

export interface FlowiseChatRequest {
  message: string;
  chatHistory?: Array<{ role: string; content: string }>;
  knowledgeBaseContext?: {
    type: 'curated' | 'personal';
    vectorStoreId?: string;
    documentIds?: string[];
  };
}

// File upload validation
export interface FileValidationRules {
  maxSizeBytes: number;
  allowedTypes: string[];
  allowedExtensions: string[];
}

export const SUPPORTED_FILE_TYPES: Record<string, { ext: string; maxSize: number }> = {
  'application/pdf': { ext: 'pdf', maxSize: 500 * 1024 * 1024 }, // 500MB
  'application/msword': { ext: 'doc', maxSize: 25 * 1024 * 1024 }, // 25MB
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', maxSize: 25 * 1024 * 1024 },
  'text/plain': { ext: 'txt', maxSize: 10 * 1024 * 1024 }, // 10MB
  'text/markdown': { ext: 'md', maxSize: 10 * 1024 * 1024 },
};

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'research-papers', label: 'Research Papers' },
  { value: 'clinical-guidelines', label: 'Clinical Guidelines' },
  { value: 'case-studies', label: 'Case Studies' },
  { value: 'medical-images', label: 'Medical Images' },
  { value: 'lab-results', label: 'Lab Results' },
  { value: 'patient-education', label: 'Patient Education' },
  { value: 'protocols', label: 'Protocols' },
  { value: 'reference-materials', label: 'Reference Materials' },
  { value: 'personal-notes', label: 'Personal Notes' },
  { value: 'other', label: 'Other' },
];

// Error handling
export class VectorStoreError extends Error {
  constructor(
    message: string,
    public code?: string,
    public openaiError?: any
  ) {
    super(message);
    this.name = 'VectorStoreError';
  }
}

export class DocumentUploadError extends Error {
  constructor(
    message: string,
    public documentId?: string,
    public openaiFileId?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DocumentUploadError';
  }
} 