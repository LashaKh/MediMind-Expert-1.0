// Type definitions for MediVoice transcription service

export interface TranscriptionResult {
  results?: {
    transcripts: Array<{
      transcript: string;
    }>;
    items?: Array<{
      start_time?: number;
      end_time?: number;
      content: string;
      type: 'pronunciation' | 'punctuation';
    }>;
  };
  transcription?: string;
  transcription_result?: {
    transcript: string;
  };
  transcript?: string;
}

export interface ClinicalSummary {
  summary?: string;
  clinical_summary?: string;
  clinicalSummary?: string;
  medical_summary?: string;
  error?: string;
  sections?: {
    chief_complaint?: string;
    history_of_present_illness?: string;
    review_of_systems?: string;
    physical_examination?: string;
    assessment_and_plan?: string;
    medications?: string[];
    allergies?: string[];
  };
}

export interface DiagnosticInfo {
  s3Uri: string;
  formattedUri: string;
  bucket: string;
  key: string;
  alternativeKeys: string[];
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface TranscriptionJobStatus {
  status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | 'QUEUED';
  error?: string;
  transcript_uri?: string;
  clinical_document_uri?: string;
  transcript?: TranscriptionResult;
  clinical_summary?: ClinicalSummary;
  transcription?: string;
  transcription_result?: TranscriptionResult;
  results?: TranscriptionResult['results'];
}

export interface OngoingTranscription {
  jobName: string;
  fileName: string;
  fileUrl: string;
  status: 'processing' | 'completed' | 'error';
  startTime: Date;
}

export interface MediVoiceResult {
  job_name: string;
  file_name: string;
  transcript: TranscriptionResult;
  clinical_summary: ClinicalSummary;
  media_url?: string;
  created_at?: string;
}

export interface ProcessAudioTranscriptionResponse {
  jobName: string;
  s3Uri: string;
  bucket: string;
  key: string;
}

export interface FetchTranscriptionResultsResponse {
  transcriptData: TranscriptionResult;
  summaryData: ClinicalSummary;
}