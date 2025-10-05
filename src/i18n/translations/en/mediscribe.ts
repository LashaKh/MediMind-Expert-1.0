export default {
  transcriptPlaceholder: {
    default: 'Your transcript will appear here...',
    titleRequired: 'Please enter a session title above to start...',
    startTyping: 'Start typing, paste text, or begin recording...',
  },
  uploadButton: {
    title: 'Upload audio file',
    disabledTitle: 'Cannot upload during recording',
    label: 'Upload',
    sublabel: 'Audio file',
  },
  attachButton: {
    title: 'Attach files & documents',
    disabledTitle: 'Cannot attach during recording',
    label: 'Attach',
    sublabel: 'Files & docs',
  },
  recordButton: {
    startRecording: 'Start recording',
    stopRecording: 'Stop recording',
    record: 'Record',
    stop: 'Stop',
    endRecording: 'End recording',
    titleRequired: 'Please enter a session title first',
  },
  drawer: {
    title: 'Medical History',
    subtitle: 'Patient consultation transcripts',
    newSession: 'New Session',
    searchPlaceholder: 'Search sessions...',
    noHistory: 'No History Yet',
    noHistoryDescription: 'Create your first medical transcription session to begin capturing patient consultations.',
    createFirstSession: 'Create First Session',
    loading: 'Loading sessions...',
    editTitle: 'Edit title',
    saveTitle: 'Save title',
    cancelEdit: 'Cancel edit',
    transcribed: 'Transcribed',
  },
  tabs: {
    record: {
      label: 'Record',
      sublabel: 'Live transcription',
    },
    aiProcessing: {
      label: 'AI Processing',
      sublabel: 'Smart analysis',
    },
  },
  historyButton: {
    title: 'Session History',
    label: 'History',
    sublabel: 'View all sessions',
  },
  securityWarning: {
    title: 'Security Protocol Required',
    description: 'Medical transcription requires secure HTTPS connection for patient privacy protection and microphone access.',
    action: 'Please ensure secure connection before proceeding',
  },
  unsupported: {
    title: 'Browser Not Supported',
    description: 'Your browser doesn\'t support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.',
  },
  attachedFiles: {
    title: {
      mobile: 'Files ({count})',
      desktop: 'Attached Files ({count})',
    },
    readyForAnalysis: 'Ready for analysis',
  },
  emptyFields: '{count} fields incomplete',
};
