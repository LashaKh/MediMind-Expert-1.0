// Form 100 Generation - TypeScript Interfaces
// Medical ER consultation report generation system

export interface DiagnosisCode {
  id: string;
  code: string; // ICD-10 code
  name: string; // Georgian name
  nameEn: string; // English name
  category: string; // Category reference
  description?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'critical';
  isActive: boolean;
  references?: string[]; // Medical literature references
  createdAt: Date;
  updatedAt: Date;
}

export interface DiagnosisCategory {
  id: string;
  name: string; // Georgian category name
  nameEn: string; // English category name
  code: string; // Category identifier
  description?: string;
  parentCategoryId?: string; // For hierarchical categories
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Form100Request {
  id: string;
  sessionId: string; // Links to Georgian transcription session
  userId: string;
  
  // Patient Information (optional for streamlined workflow)
  patientInfo?: {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    weight?: number; // kg
    height?: number; // cm
    allergies?: string[];
    currentMedications?: string[];
  };
  
  // Clinical Data
  primaryDiagnosis: DiagnosisCode;
  secondaryDiagnoses?: DiagnosisCode[];
  symptoms: string[];
  vitalSigns?: {
    bloodPressure?: string; // e.g., "120/80"
    heartRate?: number; // bpm
    temperature?: number; // Celsius
    respiratoryRate?: number; // per minute
    oxygenSaturation?: number; // percentage
  };
  
  // Voice and Analysis Data
  voiceTranscript?: string; // From Georgian transcription (user input)
  angiographyReport?: string; // Free text report
  labResults?: string; // Laboratory results
  additionalNotes?: string;
  existingERReport?: string; // Pre-existing ER report to include in generation
  
  // Form 100 Generation
  generatedForm?: string; // Generated Form 100 content
  generationStatus: 'pending' | 'processing' | 'completed' | 'failed';
  generationError?: string;
  
  // Metadata
  priority: 'low' | 'normal' | 'high' | 'urgent';
  department: string; // e.g., "Emergency", "Cardiology"
  attendingPhysician?: string;
  submissionDeadline?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  generatedAt?: Date;
}

// Flowise Integration Types
export interface FlowiseForm100Payload {
  sessionId: string;
  patientData: {
    demographics: Form100Request['patientInfo'];
    clinicalData: {
      primaryDiagnosis: DiagnosisCode;
      secondaryDiagnoses?: DiagnosisCode[];
      symptoms: string[];
      vitalSigns?: Form100Request['vitalSigns'];
    };
    voiceTranscript?: string;
    angiographyReport?: string;
    labResults?: string;
    additionalNotes?: string;
    existingERReport?: string;
  };
  formParameters: {
    priority: Form100Request['priority'];
    department: string;
    attendingPhysician?: string;
    submissionDeadline?: string; // ISO date string
  };
}

export interface FlowiseForm100Response {
  success: boolean;
  data?: {
    generatedForm: string;
    confidence: number; // 0-1
    processingTime: number; // milliseconds
    recommendations?: string[];
    warnings?: string[];
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Component Props Types
export interface Form100ButtonProps {
  sessionId?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export interface Form100ModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  initialData?: Partial<Form100Request>;
  onSubmit?: (formData: Form100Request) => void;
  onGenerate?: (formData: Form100Request) => Promise<void>;
  reportType?: string; // Analysis type to determine specialized diagnosis lists
}

export interface DiagnosisDropdownProps {
  value?: DiagnosisCode;
  onChange: (diagnosis: DiagnosisCode) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  categories?: DiagnosisCategory[];
  showSearch?: boolean;
  specializedDiagnosisList?: DiagnosisCode[]; // For specialized lists like NSTEMI
}

export interface VoiceTranscriptFieldProps {
  value?: string;
  onChange: (transcript: string) => void;
  sessionId?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showRecordButton?: boolean;
  maxLength?: number;
}

export interface AngiographyReportFieldProps {
  value?: string;
  onChange: (report: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  showFormatting?: boolean;
}

// Hook Return Types
export interface UseForm100GenerationReturn {
  formData: Form100Request | null;
  isGenerating: boolean;
  generationProgress: number; // 0-100
  error: string | null;
  
  // Actions
  setFormData: (data: Partial<Form100Request>) => void;
  generateForm: () => Promise<void>;
  resetForm: () => void;
  saveForm: () => Promise<void>;
  
  // Validation
  isValid: boolean;
  validationErrors: Record<string, string>;
  validateField: (field: keyof Form100Request) => boolean;
}

export interface UseForm100ModalReturn {
  isOpen: boolean;
  openModal: (initialData?: Partial<Form100Request>) => void;
  closeModal: () => void;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  previousStep: () => void;
  canProceed: boolean;
}

export interface UseDiagnosisSelectionReturn {
  categories: DiagnosisCategory[];
  diagnoses: DiagnosisCode[];
  selectedCategory: DiagnosisCategory | null;
  selectedDiagnosis: DiagnosisCode | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCategory: (category: DiagnosisCategory) => void;
  setDiagnosis: (diagnosis: DiagnosisCode) => void;
  searchDiagnoses: (query: string) => Promise<DiagnosisCode[]>;
  refreshData: () => Promise<void>;
}

// Validation Types
export interface ValidationRule {
  field: keyof Form100Request;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationError {
  field: keyof Form100Request;
  message: string;
  code: string;
}

// Service Response Types
export interface Form100ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    processingTime?: number;
  };
}

// Configuration Types
export interface Form100Config {
  flowiseEndpoint: string;
  maxGenerationTime: number; // milliseconds
  retryAttempts: number;
  validationRules: ValidationRule[];
  supportedDepartments: string[];
  defaultPriority: Form100Request['priority'];
}

// Export default configuration
export const FORM100_DEFAULTS: Partial<Form100Config> = {
  maxGenerationTime: 5000, // 5 seconds as per requirements
  retryAttempts: 3,
  defaultPriority: 'normal',
  supportedDepartments: [
    'Emergency',
    'Cardiology', 
    'Internal Medicine',
    'Surgery',
    'Intensive Care'
  ]
};