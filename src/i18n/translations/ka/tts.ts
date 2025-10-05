export const tts = {
  // Page title and headers
  pageTitle: 'Georgian TTS Test',
  pageDescription: 'Test Georgian speech recognition with Enagramm.com API',
  
  // Recording section
  realTimeRecording: 'Real-time Recording (Max 25 seconds)',
  clickToRecord: 'Click to start recording Georgian speech',
  recording: 'Recording...',
  recordingPaused: 'Recording Paused',
  processing: 'Processing speech...',
  
  // Controls
  record: 'Record',
  stop: 'Stop',
  pause: 'Pause',
  resume: 'Resume',
  
  // File upload
  fileUploadRecognition: 'File Upload Recognition',
  selectMP3File: 'Select MP3 File',
  processFile: 'Process File',
  onlyMP3Supported: 'Please select an MP3 file',
  
  // Results
  transcriptionResult: 'Transcription Result',
  noTextRecognized: 'No text recognized',
  copyToClipboard: 'Copy to clipboard',
  downloadAsText: 'Download as text file',
  clearResult: 'Clear result',
  
  // Status and info
  connected: 'Connected',
  disconnected: 'Disconnected',
  tokenExpiresIn: 'Token expires in',
  minutes: 'min',
  processed: 'Processed',
  duration: 'Duration',
  characters: 'Characters',
  remaining: 'Remaining',
  
  // Instructions
  instructions: 'Instructions',
  instructionsList: [
    'Click the red record button to start recording Georgian speech',
    'Maximum recording duration is 25 seconds per session',
    'Speak clearly and close to the microphone for best results',
    'Alternatively, upload an MP3 file for recognition with speaker separation',
    'The system supports automatic punctuation and text correction',
    'Results can be copied to clipboard or downloaded as text files'
  ],
  
  // Errors
  browserNotSupported: 'Browser Not Supported',
  browserNotSupportedDesc: 'Your browser doesn\'t support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.',
  microphoneAccessFailed: 'Failed to access microphone',
  recordingFailed: 'Recording failed',
  transcriptionFailed: 'Transcription failed',
  error: 'Error',
  
  // File info
  fileSize: 'File size',
  fileType: 'File type'
};

export default tts;