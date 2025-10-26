/**
 * TypeScript type definitions for Blood Gas Analysis feature
 * Includes complete type definitions for ABG workflow, components, and integrations
 */

// Core ABG Types
export interface ABGResult {
  id: string;
  user_id: string;
  patient_id?: string;
  raw_analysis: string;
  interpretation?: string;
  action_plan?: string;
  identified_issues?: string; // JSON stringified FlowiseIdentifiedIssue[]
  image_url?: string;
  type: ABGType;
  processing_time_ms?: number;
  gemini_confidence?: number;
  created_at: string;
  updated_at: string;
  patient?: PatientInfo;
}

export interface CreateABGResult {
  patient_id?: string;
  raw_analysis: string;
  interpretation?: string;
  action_plan?: string;
  image_url?: string;
  type: ABGType;
  processing_time_ms?: number;
  gemini_confidence?: number;
}

export interface UpdateABGResult {
  interpretation?: string;
  action_plan?: string;
  image_url?: string;
  type?: ABGType;
  processing_time_ms?: number;
  gemini_confidence?: number;
}

// ABG Types and Enums
export type ABGType = 'Arterial Blood Gas' | 'Venous Blood Gas';

export enum WorkflowStep {
  UPLOAD = 'upload',
  ANALYSIS = 'analysis',
  INTERPRETATION = 'interpretation',
  ACTION_PLAN = 'action_plan',
  COMPLETED = 'completed'
}

export enum ProcessingStatus {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  ANALYZING = 'analyzing',
  INTERPRETING = 'interpreting',
  GENERATING_PLAN = 'generating_plan',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// Patient Information
export interface PatientInfo {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  medical_record_number?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatient {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  medical_record_number?: string;
}

export interface PatientContext {
  id?: string;
  age?: number;
  gender?: string;
  clinicalContext?: string;
}

// Flowise Identified Issues (from structured BG analysis response)
export interface FlowiseIdentifiedIssue {
  issue: string;           // Issue title (e.g., "Critically Severe Hyperglycemia")
  description: string;     // Clinical description with context
  question: string;        // Specific clinical question for action plan generation
}

// Action Plan Result for parallel generation
export interface ActionPlanResult {
  issue: string;           // Issue title
  plan: string;            // Generated action plan text
  status: 'pending' | 'loading' | 'success' | 'error';  // Processing status
  error?: string;          // Error message if status is 'error'
}

// Workflow and Processing
export interface ABGWorkflowState {
  currentStep: WorkflowStep;
  processingStatus: ProcessingStatus;
  progress: number; // 0-100
  canProceed: boolean;
  error?: string;
  sessionId?: string; // For workflow persistence

  // Step-specific data
  uploadedFile?: File;
  analysisResult?: ABGAnalysisResult;
  interpretationResult?: LocalABGResponse;
  actionPlanResult?: LocalABGResponse;
  identifiedIssues?: FlowiseIdentifiedIssue[]; // Issues extracted from Flowise response
}

export interface ABGProcessingProgress {
  step: WorkflowStep;
  status: ProcessingStatus;
  progress: number;
  message: string;
  timeElapsed?: number;
  estimatedTimeRemaining?: number;
}

// Vision API Types
export interface ABGAnalysisResult {
  rawAnalysis: string;
  processingTimeMs: number;
  confidence: number;
  imageProcessed: boolean;
}

export interface ABGAnalysisError {
  code: 'INVALID_FILE' | 'PROCESSING_FAILED' | 'API_ERROR' | 'UNSUPPORTED_FORMAT';
  message: string;
  details?: string;
}

export interface ParsedABGAnalysis {
  patientInfo: Record<string, string>;
  bloodGasValues: Record<string, string>;
  electrolytes: Record<string, string>;
  clinicalContext: Record<string, string>;
  rawLines: string[];
}

// Local ABG Response Types
export interface LocalABGResponse {
  success: boolean;
  data: string;
  processingTimeMs: number;
  requestId: string;
}

export interface WebhookResponse {
  success: boolean;
  data: string;
  processingTimeMs: number;
  requestId: string;
}

export interface WebhookError {
  code: 'NETWORK_ERROR' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'WEBHOOK_ERROR' | 'RATE_LIMITED';
  message: string;
  details?: string;
  retryable: boolean;
}

export interface InterpretationRequest {
  analysis: string;
  type: ABGType;
  timestamp: string;
  requestId: string;
  patient?: PatientContext;
}

export interface ActionPlanRequest {
  interpretation: string;
  rawAnalysis: string;
  type: ABGType;
  timestamp: string;
  requestId: string;
  patient?: PatientContext;
}

export interface ABGWorkflowResult {
  interpretation: WebhookResponse;
  actionPlan: WebhookResponse;
}

// Database Service Types
export interface ABGFilters {
  patientId?: string;
  type?: ABGType;
  startDate?: string;
  endDate?: string;
  hasInterpretation?: boolean;
  hasActionPlan?: boolean;
  limit?: number;
  offset?: number;
}

export interface ABGServiceError {
  code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'DATABASE_ERROR' | 'NETWORK_ERROR';
  message: string;
  details?: string;
}

// UI Component Types
export interface ABGImageUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File;
  isProcessing?: boolean;
  error?: string;
  accept?: string;
  maxSizeMB?: number;
}

export interface ABGAnalysisDisplayProps {
  result?: ABGResult;
  isLoading?: boolean;
  error?: string;
  onEdit?: (field: keyof ABGResult, value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  editable?: boolean;
}

export interface ABGWorkflowProps {
  onComplete?: (result: ABGResult) => void;
  onError?: (error: ABGServiceError) => void;
  initialPatient?: PatientInfo;
  initialType?: ABGType;
}

export interface ABGHistoryProps {
  filters?: ABGFilters;
  onResultSelect?: (result: ABGResult) => void;
  onFiltersChange?: (filters: ABGFilters) => void;
  compact?: boolean;
}

// Form and Validation Types
export interface ABGFormData {
  type: ABGType;
  patientId?: string;
  clinicalNotes?: string;
  urgency?: 'routine' | 'urgent' | 'stat';
}

export interface ABGValidationErrors {
  file?: string;
  type?: string;
  patientId?: string;
  clinicalNotes?: string;
  general?: string;
}

export interface FormFieldState<T> {
  value: T;
  error?: string;
  touched: boolean;
  valid: boolean;
}

// Search and Filter Types
export interface ABGSearchFilters {
  query?: string;
  type?: ABGType;
  dateRange?: {
    start: string;
    end: string;
  };
  patientId?: string;
  hasInterpretation?: boolean;
  hasActionPlan?: boolean;
  confidenceRange?: {
    min: number;
    max: number;
  };
  processingTimeRange?: {
    min: number;
    max: number;
  };
}

export interface ABGSearchResult {
  results: ABGResult[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface ABGSortOption {
  field: keyof ABGResult;
  direction: 'asc' | 'desc';
  label: string;
}

// Export and Sharing Types
export interface ABGExportOptions {
  format: 'json' | 'pdf' | 'csv';
  includeImages?: boolean;
  includePatientInfo?: boolean;
  includeInterpretation?: boolean;
  includeActionPlan?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ABGShareOptions {
  recipients: string[];
  message?: string;
  includeImages?: boolean;
  expiresAt?: string;
  accessLevel: 'view' | 'comment' | 'edit';
}

// Analytics and Reporting Types
export interface ABGAnalytics {
  totalResults: number;
  averageProcessingTime: number;
  averageConfidence: number;
  typeDistribution: Record<ABGType, number>;
  completionRate: number;
  errorRate: number;
  trendsOverTime: Array<{
    date: string;
    count: number;
    averageConfidence: number;
  }>;
}

export interface ABGPerformanceMetrics {
  analysisTime: number;
  interpretationTime: number;
  actionPlanTime: number;
  totalWorkflowTime: number;
  confidence: number;
  success: boolean;
  errorCode?: string;
}

// Configuration Types
export interface ABGConfiguration {
  geminiApiKey: string;
  webhookUrls: {
    interpretation: string;
    actionPlan: string;
  };
  timeouts: {
    analysis: number;
    interpretation: number;
    actionPlan: number;
  };
  retries: {
    analysis: number;
    interpretation: number;
    actionPlan: number;
  };
  validation: {
    maxFileSizeMB: number;
    allowedFileTypes: string[];
    requirePatient: boolean;
  };
  ui: {
    showProgressIndicator: boolean;
    autoSaveInterval: number;
    defaultABGType: ABGType;
    enableRealTimeUpdates: boolean;
  };
}

// State Management Types (for Zustand store)
export interface ABGStoreState {
  // Current workflow state
  currentWorkflow?: ABGWorkflowState;
  
  // ABG results cache
  results: ABGResult[];
  currentResult?: ABGResult;
  
  // Patients cache
  patients: PatientInfo[];
  
  // UI state
  loading: boolean;
  error?: string;
  filters: ABGFilters;
  searchQuery: string;
  
  // Configuration
  configuration: Partial<ABGConfiguration>;
}

export interface ABGStoreActions {
  // Workflow actions
  startWorkflow: (initialData?: Partial<ABGWorkflowState>) => void;
  updateWorkflowStep: (step: WorkflowStep, data?: Partial<ABGWorkflowState>) => void;
  setProcessingStatus: (status: ProcessingStatus, message?: string) => void;
  completeWorkflow: (result: ABGResult) => void;
  resetWorkflow: () => void;
  
  // ABG result actions
  loadResults: (filters?: ABGFilters) => Promise<void>;
  loadResult: (id: string) => Promise<ABGResult>;
  createResult: (result: CreateABGResult) => Promise<string>;
  updateResult: (id: string, updates: UpdateABGResult) => Promise<void>;
  deleteResult: (id: string) => Promise<void>;
  
  // Patient actions
  loadPatients: () => Promise<void>;
  searchPatients: (query: string) => Promise<PatientInfo[]>;
  createPatient: (patient: CreatePatient) => Promise<string>;
  
  // UI actions
  setCurrentResult: (result?: ABGResult) => void;
  setFilters: (filters: Partial<ABGFilters>) => void;
  setSearchQuery: (query: string) => void;
  setError: (error?: string) => void;
  clearError: () => void;
  
  // Configuration actions
  updateConfiguration: (config: Partial<ABGConfiguration>) => void;
}

// Utility Types
export type ABGStore = ABGStoreState & ABGStoreActions;

export type ABGResultWithoutDates = Omit<ABGResult, 'created_at' | 'updated_at'>;

export type CreateABGResultInput = Omit<CreateABGResult, 'user_id'>;

export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event Types for Real-time Updates
export interface ABGRealtimeEvent {
  type: 'RESULT_CREATED' | 'RESULT_UPDATED' | 'RESULT_DELETED' | 'WORKFLOW_PROGRESS';
  payload: {
    resultId?: string;
    userId: string;
    result?: ABGResult;
    workflowState?: ABGWorkflowState;
    timestamp: string;
  };
}

// Testing and Mock Types
export interface MockABGData {
  results: ABGResult[];
  patients: PatientInfo[];
  workflows: ABGWorkflowState[];
}

export interface ABGTestScenario {
  name: string;
  description: string;
  setup: MockABGData;
  expectedOutcome: {
    workflowCompleted: boolean;
    resultsCreated: number;
    patientsCreated: number;
    averageProcessingTime?: number;
    averageConfidence?: number;
  };
}

// Integration Types
export interface ABGIntegrationConfig {
  enabledFeatures: {
    geminiVision: boolean;
    makeComWebhooks: boolean;
    realTimeUpdates: boolean;
    patientIntegration: boolean;
    analyticsTracking: boolean;
  };
  apiEndpoints: {
    gemini: string;
    interpretation: string;
    actionPlan: string;
  };
  fallbackBehavior: {
    onVisionFailure: 'manual' | 'retry' | 'skip';
    onWebhookFailure: 'manual' | 'retry' | 'skip';
    onDatabaseFailure: 'cache' | 'retry' | 'fail';
  };
}

// Workflow Persistence Types
export interface WorkflowRecoveryInfo {
  sessionId: string;
  timestamp: string;
  currentStep: WorkflowStep;
  progress: number;
  abgType?: string;
  patientId?: string;
  imageFileName?: string;
  recoveryCount: number;
  canRecover: boolean;
}

export interface ABGWorkflowPersistenceData {
  workflow: ABGWorkflowState;
  metadata: {
    imageFile?: {
      name: string;
      type: string;
      size: number;
      lastModified: number;
    };
    patientId?: string;
    abgType?: string;
    processingStartTime?: string;
    sessionId: string;
    timestamp: string;
    recoveryCount: number;
  };
}

// Data Export Types
export interface ABGExportData {
  results: ABGResult[];
  metadata: {
    exportedAt: string;
    exportedBy: string;
    totalResults: number;
    dateRange?: {
      start: string;
      end: string;
    };
    filters?: ABGFilters;
    version: string;
  };
}

export interface ABGPDFExportOptions extends ABGExportOptions {
  template?: 'standard' | 'detailed' | 'summary';
  logoUrl?: string;
  organizationName?: string;
  contactInfo?: string;
  customFooter?: string;
  pageSize?: 'letter' | 'a4';
  orientation?: 'portrait' | 'landscape';
}

export interface ABGJSONExportData {
  version: string;
  exportedAt: string;
  results: ABGResult[];
  patients?: PatientInfo[];
  metadata: {
    totalCount: number;
    dateRange?: { start: string; end: string };
    filters?: ABGFilters;
  };
}

// Performance Optimization Types
export interface ABGImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1-1.0
  format?: 'jpeg' | 'png' | 'webp';
  preserveExif?: boolean;
}

export interface ABGOptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  processingTime: number;
  optimizedFile: File;
}

export interface ABGLazyLoadingConfig {
  pageSize: number;
  preloadCount: number;
  threshold: number; // pixels before triggering load
  debounceMs: number;
}

// Advanced Search and History Types
export interface ABGSearchFilters extends ABGFilters {
  keyword?: string;
  severity?: 'normal' | 'warning' | 'critical';
  confidenceMin?: number;
  confidenceMax?: number;
  processingTimeMax?: number;
}

export interface ABGSortOption {
  field: keyof ABGResult;
  direction: 'asc' | 'desc';
  label: string;
}

export interface ABGHistoryStats {
  totalResults: number;
  thisWeek: number;
  thisMonth: number;
  avgProcessingTime: number;
  avgConfidence?: number;
  successRate?: number;
}

export interface ABGComparisonData {
  selectedResults: ABGResult[];
  comparisonMetrics: {
    parameterTrends: Record<string, number[]>;
    timeSeriesData: { date: string; value: number }[];
    qualityIndicators: {
      confidence: number[];
      processingTime: number[];
    };
  };
}

export interface ABGBulkOperation {
  type: 'export' | 'delete' | 'archive';
  resultIds: string[];
  options?: {
    exportFormat?: 'json' | 'csv' | 'pdf';
    confirmationRequired?: boolean;
    batchSize?: number;
  };
}

// Export all types
export default ABGStoreState;