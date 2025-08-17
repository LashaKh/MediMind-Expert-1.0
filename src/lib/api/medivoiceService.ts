import { API_ENDPOINTS } from './constants';
import { formatS3UriForAWS } from '../../utils/s3Utils';
import { uploadAudioFile } from './medivoice';

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Helper for delaying execution
export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Makes a request to the API with timeout and proper headers
 */
export async function makeRequest(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      mode: 'cors',
      headers: {
        ...options.headers,
        'Accept': 'application/json',
        'Origin': window.location.origin
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // For debugging, log the full error content
      const errorText = await response.text();

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        errorData = { error: errorText };
      }
      
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to reach transcription service. Please check your connection and try again.');
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout: The server took too long to respond. Please try again.');
    }
    throw error;
  }
}

/**
 * Starts a transcription job
 */
export const startTranscriptionJob = async (
  s3Uri: string, 
  file: File | null,
  bucket?: string, 
  key?: string
): Promise<{ job_name: string }> => {
  // Validate S3 URI format
  if (!s3Uri || !s3Uri.startsWith('s3://')) {
    throw new Error('Invalid S3 URI format: ' + s3Uri);
  }

  // Don't modify the S3 URI format - use it exactly as provided

  // Create unique job name
  const uniqueJobName = `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Prepare request payload - match the exact format that worked prior to refactoring
  const requestPayload = {
    action: 'start',
    job_name: uniqueJobName,
    media_url: s3Uri,
    metadata: {
      fileName: file ? file.name : 'audio_file.mp3',
      fileType: file ? file.type : 'audio/mpeg',
      fileSize: file ? file.size : 0,
      bucket,
      key,
      timestamp: new Date().toISOString()
    }
  };

  const response = await makeRequest(API_ENDPOINTS.MEDIVOICE_TRANSCRIPTION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestPayload)
  });

  // Log the raw response
  const rawResponseText = await response.clone().text();
  
  let data;
  try {
    data = JSON.parse(rawResponseText);
  } catch (parseError) {

    throw new Error(`Invalid JSON response: ${rawResponseText.substring(0, 100)}...`);
  }
  
  if (!data.job_name) {

    throw new Error('Server error: Invalid response format (missing job name)');
  }

  return { job_name: data.job_name };
};

/**
 * Special case handling for known files
 */
export const startSpecialCaseTranscription = async (
  fileName: string, 
  file: File | null
): Promise<{ job_name: string }> => {
  
  // Use the exact values that worked before refactoring
  const bucket = 'healthscribe-output-medi-mind';
  const key = fileName; // Use the original filename without modifications
  
  // Create a direct S3 URI in the exact format that worked previously
  const directS3Uri = `s3://${bucket}/${key}`;
  
  try {
    // Call the transcription job with the exact URI format that worked before
    const response = await startTranscriptionJob(directS3Uri, file, bucket, key);
    return response;
  } catch (err) {

    throw err;
  }
};

interface TranscriptionStatusResponse {
  JobStatus?: string;
  TranscriptFileUri?: string;
  ClinicalDocumentUri?: string;
  FailureReason?: string;
  CompletionTime?: string;
  [key: string]: unknown;
}

/**
 * Checks the status of a transcription job
 */
export const checkTranscriptionStatus = async (jobId: string): Promise<TranscriptionStatusResponse> => {

  const response = await makeRequest(API_ENDPOINTS.MEDIVOICE_TRANSCRIPTION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'status',
      job_name: jobId
    })
  });

  // Log the raw response for debugging
  const rawData = await response.clone().text();

  return response.json();
};

interface TranscriptionResult {
  results?: {
    transcripts?: Array<{
      transcript?: string;
    }>;
    items?: Array<{
      start_time?: string;
      end_time?: string;
      alternatives?: Array<{
        confidence?: string;
        content?: string;
      }>;
      type?: string;
    }>;
    speaker_labels?: {
      speakers?: number;
      segments?: Array<{
        start_time?: string;
        end_time?: string;
        speaker_label?: string;
        items?: Array<{
          start_time?: string;
          end_time?: string;
          speaker_label?: string;
        }>;
      }>;
    };
  };
  [key: string]: unknown;
}

interface ClinicalDocument {
  ClinicalDocumentation?: {
    Sections?: Array<{
      SectionName?: string;
      Summary?: Array<{
        Evidence?: Array<{
          BeginOffset?: number;
          EndOffset?: number;
          Segment?: string;
          Score?: number;
        }>;
        SummaryText?: string;
      }>;
    }>;
  };
  [key: string]: unknown;
}

/**
 * Fetches transcription results from provided URIs
 */
export const fetchTranscriptionResults = async (
  transcriptUri: string, 
  clinicalDocumentUri: string
): Promise<{ transcriptData: TranscriptionResult, summaryData: ClinicalDocument }> => {
  const [transcriptResponse, summaryResponse] = await Promise.all([
    fetch(transcriptUri),
    fetch(clinicalDocumentUri)
  ]);

  if (!transcriptResponse.ok || !summaryResponse.ok) {

    throw new Error('Failed to fetch transcription results');
  }

  const transcriptData = await transcriptResponse.json();
  const summaryData = await summaryResponse.json();
  
  return { transcriptData, summaryData };
};

/**
 * Handles the full transcription process
 */
export const processAudioTranscription = async (
  file: File,
  setUploadProgress: (progress: number) => void,
  onS3UriGenerated?: (uri: string) => void
) => {
  
  // Special case handling for the specific file we know exists in S3
  if (file.name === "Doctor-Patient Cost of Care Conversation.mp3") {
    try {
      const { job_name } = await startSpecialCaseTranscription(file.name, file);
      
      // Use the exact URI format that worked before
      const s3Uri = `s3://healthscribe-output-medi-mind/${file.name}`;
      
      return { 
        jobName: job_name, 
        s3Uri,
        bucket: 'healthscribe-output-medi-mind',
        key: file.name
      };
    } catch (error) {

      // Fall through to regular upload if special case fails
    }
  }
  
  // Regular upload flow
  const { s3Uri, bucket, key } = await uploadAudioFile(file, setUploadProgress);
  if (onS3UriGenerated) {
    onS3UriGenerated(s3Uri);
  }
  
  const { job_name } = await startTranscriptionJob(s3Uri, file, bucket, key);
  return { jobName: job_name, s3Uri, bucket, key };
}; 