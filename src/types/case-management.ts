// Type definitions for Case Management and Attachments

export interface CaseAttachmentData {
  id: string;
  name: string;
  type: AttachmentType;
  content: string;
  metadata?: AttachmentMetadata;
  createdAt: Date;
  updatedAt?: Date;
}

export type AttachmentType = 
  | 'lab_result'
  | 'imaging'
  | 'clinical_note'
  | 'prescription'
  | 'referral'
  | 'discharge_summary'
  | 'consultation'
  | 'other';

export interface AttachmentMetadata {
  fileSize?: number;
  mimeType?: string;
  source?: 'upload' | 'scan' | 'import' | 'manual';
  tags?: string[];
  relatedCaseId?: string;
  patientId?: string;
  specialty?: string;
}

export interface AttachmentUpload {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  result?: CaseAttachmentData;
  startedAt: Date;
  completedAt?: Date;
}

export interface CaseContext {
  id?: string;
  patientInfo?: PatientInfo;
  chiefComplaint?: string;
  presentingSymptoms?: string[];
  medicalHistory?: string;
  currentMedications?: Medication[];
  allergies?: Allergy[];
  vitalSigns?: VitalSigns;
  attachments?: CaseAttachmentData[];
  specialty: 'cardiology' | 'obgyn';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatientInfo {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  weight?: number;
  height?: number;
  bmi?: number;
  ethnicity?: string;
  smokingStatus?: 'never' | 'former' | 'current';
}

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: Date;
  endDate?: Date;
  prescribedBy?: string;
}

export interface Allergy {
  allergen: string;
  reaction?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  onsetDate?: Date;
}

export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  temperatureUnit?: 'celsius' | 'fahrenheit';
  respiratoryRate?: number;
  oxygenSaturation?: number;
  recordedAt?: Date;
}

export interface CaseContextState {
  caseData: CaseContext | null;
  attachments: CaseAttachmentData[];
  attachmentUploads: AttachmentUpload[];
  isLoading: boolean;
  error: string | null;
}

export interface CaseContextActions {
  updateCaseData: (data: Partial<CaseContext>) => void;
  addAttachment: (attachment: CaseAttachmentData) => void;
  removeAttachment: (id: string) => void;
  uploadAttachment: (file: File, type: AttachmentType) => Promise<void>;
  clearCase: () => void;
  loadCase: (caseId: string) => Promise<void>;
  saveCase: () => Promise<string>;
}