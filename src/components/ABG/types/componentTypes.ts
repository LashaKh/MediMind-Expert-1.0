import { ABGType, WorkflowStep } from '../../../types/abg';

/**
 * Enhanced interface for ABG analysis component props
 */
export interface ABGAnalysisProps {
  /** Callback when analysis is completed */
  onComplete?: (resultId: string) => void;
  /** Initial blood gas type selection */
  initialType?: ABGType;
  /** Optional CSS class name */
  className?: string;
  /** Optional patient context */
  initialPatientId?: string;
  /** Whether to auto-start from a specific step */
  startFromStep?: WorkflowStep;
  /** Configuration overrides */
  config?: Partial<ABGAnalysisConfig>;
}

/**
 * Configuration options for ABG analysis
 */
export interface ABGAnalysisConfig {
  /** Enable automatic file validation */
  autoValidateFiles: boolean;
  /** Maximum file size in MB */
  maxFileSizeMB: number;
  /** Accepted file types */
  acceptedFileTypes: string[];
  /** Enable progress tracking */
  showProgress: boolean;
  /** Enable case management integration */
  enableCaseManagement: boolean;
  /** Auto-collapse sections by default */
  defaultCollapsedSections: string[];
}

/**
 * Props for workflow step components
 */
export interface BaseStepProps {
  /** Current workflow state */
  workflow: any;
  /** Whether step is currently processing */
  isProcessing: boolean;
  /** Any error from the workflow */
  error?: string;
  /** Navigation callback */
  onGoToStep: (step: WorkflowStep) => void;
}

/**
 * Props for file upload handling
 */
export interface FileUploadProps {
  /** Currently selected file */
  selectedFile: File | null;
  /** File selection callback */
  onFileSelect: (file: File) => void;
  /** File removal callback */
  onFileRemove: () => void;
  /** Whether upload is processing */
  isProcessing?: boolean;
  /** Upload error message */
  error?: string;
  /** Accepted file types */
  accept?: string;
  /** Maximum file size in MB */
  maxSizeMB?: number;
}

/**
 * Props for camera capture
 */
export interface CameraProps {
  /** Whether camera is visible */
  showCamera: boolean;
  /** Show camera callback */
  onShowCamera: (show: boolean) => void;
  /** Camera capture callback */
  onCameraCapture: (file: File) => void;
}

/**
 * Props for ABG type selection
 */
export interface ABGTypeSelectionProps {
  /** Currently selected type */
  abgType: ABGType;
  /** Type change callback */
  onAbgTypeChange: (type: ABGType) => void;
  /** Available types */
  availableTypes?: ABGType[];
  /** Whether selection is disabled */
  disabled?: boolean;
}

/**
 * Props for results display
 */
export interface ResultsDisplayProps {
  /** Extracted text from analysis */
  extractedText: string;
  /** Clinical interpretation */
  interpretation: string;
  /** Whether to show results */
  showResults: boolean;
  /** ABG type for context */
  abgType: ABGType;
  /** Completed result data */
  completedResult?: any;
}

/**
 * Props for collapsible UI sections
 */
export interface CollapsibleSectionProps {
  /** Section title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Section icon */
  icon?: React.ReactNode;
  /** Whether section is collapsed */
  isCollapsed: boolean;
  /** Toggle collapse callback */
  onToggle: () => void;
  /** Section content */
  children: React.ReactNode;
  /** Optional preview when collapsed */
  collapsedPreview?: React.ReactNode;
  /** CSS classes */
  className?: string;
}

/**
 * Props for progress display
 */
export interface ProgressProps {
  /** Current task description */
  currentTask?: string;
  /** Stage description */
  stageDescription: string;
  /** Overall progress percentage */
  overallProgress: number;
  /** Current processing phase */
  phase: string;
  /** Optional CSS class */
  className?: string;
}

/**
 * Navigation props for workflow steps
 */
export interface NavigationProps {
  /** Whether can navigate back */
  canGoBack: boolean;
  /** Whether can proceed to next step */
  canProceed: boolean;
  /** Back navigation callback */
  onGoBack: () => void;
  /** Next navigation callback */
  onGoNext: () => void;
  /** Custom navigation actions */
  customActions?: React.ReactNode;
}

/**
 * Case management integration props
 */
export interface CaseManagementProps {
  /** Active case data */
  activeCase?: any;
  /** Available cases */
  caseHistory: any[];
  /** Case selection callback */
  onCaseSelect: (caseData: any) => void;
  /** Case creation callback */
  onCaseCreate: (data: any) => Promise<any>;
  /** Whether case list is open */
  isCaseListOpen: boolean;
  /** Whether case creation is open */
  isCaseCreateOpen: boolean;
  /** Case list toggle */
  onToggleCaseList: (open: boolean) => void;
  /** Case creation toggle */
  onToggleCaseCreate: (open: boolean) => void;
}

/**
 * Error handling props
 */
export interface ErrorProps {
  /** Error message */
  error?: string;
  /** Error recovery callback */
  onRetry?: () => void;
  /** Error dismissal callback */
  onDismiss?: () => void;
  /** Error severity level */
  severity?: 'low' | 'medium' | 'high';
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation error messages */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Field-specific errors */
  fieldErrors: Record<string, string>;
}