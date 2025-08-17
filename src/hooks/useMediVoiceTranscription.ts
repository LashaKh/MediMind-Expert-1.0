import { useState, useCallback, useEffect } from 'react';
import { useMediVoiceStore } from '../store/useMediVoiceStore';
import { 
  processAudioTranscription, 
  checkTranscriptionStatus, 
  fetchTranscriptionResults
} from '../lib/api/medivoiceService';
import { deleteAudioFile } from '../lib/api/medivoice';
import { formatS3UriForAWS, generateAlternativeKeys } from '../utils/s3Utils';
import type {
  TranscriptionResult,
  ClinicalSummary,
  DiagnosticInfo,
  TranscriptionJobStatus,
  OngoingTranscription,
  MediVoiceResult
} from '../types/medivoice';

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 
  'audio/x-wav', 'audio/webm', 'audio/ogg'
];

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export type TranscriptionStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export const useMediVoiceTranscription = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [jobName, setJobName] = useState<string>('');
  const [transcript, setTranscript] = useState<TranscriptionResult | null>(null);
  const [clinicalSummary, setClinicalSummary] = useState<ClinicalSummary | null>(null);
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [diagnosticInfo, setDiagnosticInfo] = useState<DiagnosticInfo | null>(null);
  
  const { 
    addResult, 
    addOngoingTranscription, 
    updateOngoingTranscription, 
    removeOngoingTranscription, 
    ongoingTranscriptions
  } = useMediVoiceStore();

  // Check for ongoing transcriptions on initialization
  useEffect(() => {
    if (ongoingTranscriptions.length > 0 && status === 'idle') {
      // Use the most recent ongoing transcription
      const latestTranscription = ongoingTranscriptions.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )[0];

      // Create a placeholder File object
      const placeholderFile = new File(
        [new ArrayBuffer(1)],
        latestTranscription.fileName,
        { type: 'audio/mpeg' }
      );
      
      // Restore the state
      setFile(placeholderFile);
      setFileUrl(latestTranscription.fileUrl);
      setJobName(latestTranscription.jobName);
      setStatus(latestTranscription.status);
      
      // Continue checking the job status
      setTimeout(() => checkJobStatus(latestTranscription.jobName), RETRY_DELAY);
    }
  }, [ongoingTranscriptions]);

  // Reset hook state
  const resetState = useCallback(() => {
    setStatus('idle');
    setError(null);
    setRetryCount(0);
    setUploadProgress(0);
    setDiagnosticInfo(null);
  }, []);

  // Validate file type
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload an audio file (MP3, WAV, OGG, or WebM).';
    }
    return null;
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((selectedFile: File) => {
      name: selectedFile.name,
      type: selectedFile.type || 'unknown',
      size: selectedFile.size
    });
    
    // Check if file type is empty or incorrect
    if (!selectedFile.type || selectedFile.type === 'application/octet-stream') {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      
      // Map extensions to MIME types
      const mimeTypeMap: {[key: string]: string} = {
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'webm': 'audio/webm'
      };
      
      if (extension && mimeTypeMap[extension]) {
        // Create a new file with the correct MIME type
        const newFile = new File(
          [selectedFile], 
          selectedFile.name, 
          { type: mimeTypeMap[extension], lastModified: selectedFile.lastModified }
        );
        setFile(newFile);
      } else {
        setError(`Unsupported file extension: .${extension}`);
        return;
      }
    } else {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(selectedFile);
    }
    
    resetState();
    setFileUrl(null);
  }, [validateFile, resetState]);

  // Start transcription
  const startTranscription = useCallback(async () => {
    if (!file) {
      setError('Please upload or record an audio file first!');
      return;
    }

    try {
      setStatus('uploading');
      setError(null);
      setTranscript(null);
      setClinicalSummary(null);
      setRetryCount(0);
      setDiagnosticInfo(null);

      // Process the audio transcription
      const { jobName: newJobName, s3Uri, bucket, key } = await processAudioTranscription(
        file,
        setUploadProgress,
        (uri) => setFileUrl(uri)
      );

      // Store diagnostic information for potential error troubleshooting
      setDiagnosticInfo({
        s3Uri: s3Uri,
        formattedUri: formatS3UriForAWS(s3Uri, bucket, key),
        bucket: bucket,
        key: key,
        alternativeKeys: generateAlternativeKeys(key || ''),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });

      setJobName(newJobName);
      setStatus('processing');
      
      // Register as ongoing transcription
      addOngoingTranscription({
        jobName: newJobName,
        fileName: file.name,
        fileUrl: s3Uri,
        status: 'processing',
        startTime: new Date()
      });
      
      setTimeout(() => checkJobStatus(newJobName), 2000);
    } catch (error) {

      // Extract error message and add diagnostic information
      let errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Provide more helpful error message for S3 URI issues
      if (errorMessage.includes("doesn't point to an S3 object")) {
        errorMessage = `S3 URI Error: The file could not be found in the S3 bucket. Please try a different file or check the S3 configuration.`;
        
        // If we have diagnostic info, add extra details
        if (diagnosticInfo) {
        }
      }
      
      setError(errorMessage);
      setStatus('error');

      // Clean up uploaded file if transcription fails
      if (fileUrl) {
        try {
          await deleteAudioFile(fileUrl);
          setFileUrl(null);
        } catch (deleteError) {

        }
      }
    }
  }, [file, fileUrl, diagnosticInfo, addOngoingTranscription]);

  // Check job status
  const checkJobStatus = useCallback(async (jobId: string) => {
    if (retryCount >= MAX_RETRIES) {
      setError('Maximum retry attempts reached. Please start a new transcription.');
      setStatus('error');
      removeOngoingTranscription(jobId);
      return;
    }

    try {
      const data = await checkTranscriptionStatus(jobId);
      
      if (!data || !data.status) {
        throw new Error('Server error: Invalid status response format');
      }

      switch (data.status.toUpperCase()) {
        case 'COMPLETED':
          // Handle completed job
          removeOngoingTranscription(jobId);
          handleCompletedJob(data, jobId);
          break;
          
        case 'FAILED':
          setError(`Transcription failed: ${data.error || 'Unknown error'}`);
          setStatus('error');
          removeOngoingTranscription(jobId);
          break;
          
        case 'IN_PROGRESS':
        case 'QUEUED':
          setStatus('processing');
          updateOngoingTranscription(jobId, { status: 'processing' });
          setRetryCount((prevCount) => prevCount + 1);
          setTimeout(() => checkJobStatus(jobId), RETRY_DELAY);
          break;
          
        default:
          setError(`Unknown status: ${data.status}`);
          setStatus('error');
          removeOngoingTranscription(jobId);
      }
    } catch (error) {

      setRetryCount((prevCount) => prevCount + 1);
      setTimeout(() => checkJobStatus(jobId), RETRY_DELAY);
    }
  }, [retryCount, fileUrl, file, addResult, removeOngoingTranscription, updateOngoingTranscription]);

  // Handle completed transcription job
  const handleCompletedJob = async (data: TranscriptionJobStatus, jobId: string) => {
    // Check if transcript_uri and clinical_document_uri are available
    if (data.transcript_uri && data.clinical_document_uri) {
      try {
        const { transcriptData, summaryData } = await fetchTranscriptionResults(
          data.transcript_uri,
          data.clinical_document_uri
        );
        
        setTranscript(transcriptData);
        setClinicalSummary(summaryData);
        setStatus('completed');
        setRetryCount(0);
        
        // Save result to history
        if (file) {
          saveResultToHistory(jobId, transcriptData, summaryData);
        }
        return;
      } catch (fetchError) {

        throw new Error('Failed to fetch transcription results. Please try again.');
      }
    }
    
    // Fallback to direct content in response
    processDirectResponse(data, jobId);
  };

  // Process direct response data
  const processDirectResponse = (data: TranscriptionJobStatus, jobId: string) => {
    // Extract transcript data
    const transcriptData = data.transcript || data.transcription || data.transcription_result || 
      (data.results ? data : { 
        results: { 
          transcripts: [{ 
            transcript: file ? `Transcription for ${file.name}` : 'Medical transcription' 
          }]
        }
      });
    
    // Extract clinical summary data
    let clinicalSummaryData;
    if (data.clinical_summary) clinicalSummaryData = data.clinical_summary;
    else if (data.clinicalSummary) clinicalSummaryData = data.clinicalSummary;
    else if (data.summary) clinicalSummaryData = data.summary;
    else if (data.medical_summary) clinicalSummaryData = data.medical_summary;
    else {
      clinicalSummaryData = { 
        summary: "No clinical summary was generated. This might be due to the audio quality or content.",
        error: "The backend service did not return a clinical summary. Please check server logs."
      };
    }
    
    setTranscript(transcriptData);
    setClinicalSummary(clinicalSummaryData);
    setStatus('completed');
    setRetryCount(0);

    // Save result to history
    if (file && transcriptData) {
      saveResultToHistory(jobId, transcriptData, clinicalSummaryData);
    }
  };

  // Save result to history store
  const saveResultToHistory = async (jobId: string, transcriptData: TranscriptionResult, summaryData: ClinicalSummary) => {
    try {
      await addResult({
        job_name: jobId,
        file_name: file?.name || 'Unknown file',
        transcript: transcriptData,
        clinical_summary: summaryData,
        media_url: fileUrl || undefined
      });
    } catch (saveError) {

    }
  };

  // Handle retry
  const handleRetry = useCallback(() => {
    resetState();
    if (jobName) startTranscription();
  }, [jobName, resetState, startTranscription]);

  return {
    file, fileUrl, transcript, clinicalSummary, status, 
    error, uploadProgress, handleFileUpload, setFile,
    startTranscription, handleRetry, diagnosticInfo
  };
}; 