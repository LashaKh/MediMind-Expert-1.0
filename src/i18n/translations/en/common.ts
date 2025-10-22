export const common = {
  account: 'Account',
  medicalAssistant: 'Medical Assistant',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  close: 'Close',
  open: 'Open',
  add: 'Add',
  remove: 'Remove',
  create: 'Create',
  update: 'Update',
  submit: 'Submit',
  reset: 'Reset',
  clear: 'Clear',
  search: 'Search',
  filter: 'Filter',
  sort: 'Sort',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  info: 'Information',
  
  // Error handling
  errors: {
    generic: {
      title: 'Something went wrong',
      message: 'An unexpected error has occurred. Please try again.',
      applicationError: 'Application Error',
      applicationMessage: 'The application encountered an unexpected error. Our team has been notified.'
    },
    network: {
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection and try again.'
    },
    authentication: {
      title: 'Authentication Required',
      message: 'Your session has expired. Please sign in again to continue.'
    },
    permission: {
      title: 'Access Denied',
      message: 'You don\'t have permission to access this resource. Please contact support if you believe this is an error.'
    },
    actions: {
      tryAgain: 'Try Again',
      reloadPage: 'Reload Page',
      errorDetails: 'Error Details (Development Only)'
    }
  },
  yes: 'Yes',
  no: 'No',
  or: 'or',
  ok: 'OK',
  confirm: 'Confirm',
  next: 'Next',
  previous: 'Previous',
  back: 'Back',
  forward: 'Forward',
  home: 'Home',
  dashboard: 'Dashboard',
  profile: 'Profile',
  settings: 'Settings',
  help: 'Help',
  about: 'About',
  contact: 'Contact',
  privacy: 'Privacy',
  terms: 'Terms',
  medical: 'Medical',
  aiAssistant: 'AI Assistant',
  // Status messages
  processing: 'Processing...',
  complete: 'Complete',
  pending: 'Pending',
  failed: 'Failed',
  retry: 'Retry',
  calculation_failed: 'Calculation failed',
  indicates: 'indicates',
  detailed_analysis: 'Detailed Analysis',
  // Common UI elements
  title: 'Title',
  description: 'Description',
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  date: 'Date',
  time: 'Time',
  // File operations
  upload: 'Upload',
  download: 'Download',
  file: 'File',
  files: 'Files',
  image: 'Image',
  document: 'Document',
  // Common actions
  view: 'View',
  preview: 'Preview',
  share: 'Share',
  copy: 'Copy',
  paste: 'Paste',
  cut: 'Cut',
  // Navigation
  menu: 'Menu',
  sidebar: 'Sidebar',
  navbar: 'Navigation bar',
  breadcrumb: 'Breadcrumb',
  // Pagination
  page: 'Page',
  pageOf: 'Page {{current}} of {{total}}',
  itemsPerPage: 'Items per page',
  showingItems: 'Showing {{start}}-{{end}} of {{total}}',
  // Time and dates
  today: 'Today',
  yesterday: 'Yesterday',
  tomorrow: 'Tomorrow',
  thisWeek: 'This week',
  thisMonth: 'This month',
  thisYear: 'This year',
  // Common validation
  required: 'Required',
  optional: 'Optional',
  invalid: 'Invalid',
  valid: 'Valid',
  selectOption: 'Select option',
  // Medical Units
  units: {
    // Weight and Mass
    kg: 'kg',
    lbs: 'lbs',
    g: 'g',
    mg: 'mg',
    
    // Length and Height
    cm: 'cm',
    m: 'm',
    ft: 'ft',
    in: 'in',
    mm: 'mm',
    
    // Blood Pressure
    mmHg: 'mmHg',
    
    // Laboratory Values
    mgdL: 'mg/dL',
    mmolL: 'mmol/L',
    gdL: 'g/dL',
    IUL: 'IU/L',
    mEqL: 'mEq/L',
    ngmL: 'ng/mL',
    pgmL: 'pg/mL',
    mIUmL: 'mIU/mL',
    
    // Time
    years: 'years',
    months: 'months',
    weeks: 'weeks',
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    
    // Percentage
    percent: '%',
    
    // Volume
    mL: 'mL',
    L: 'L',
    
    // Frequency
    bpm: 'bpm', // beats per minute
    perMin: '/min',
    perHour: '/hour',
    perDay: '/day'
  },
  // Risk Categories
  risk: {
    low: 'Low Risk',
    moderate: 'Moderate Risk',
    high: 'High Risk',
    veryHigh: 'Very High Risk',
    borderline: 'Borderline Risk',
    intermediate: 'Intermediate Risk',
    elevated: 'Elevated Risk',
    normal: 'Normal',
    optimal: 'Optimal',
    nearOptimal: 'Near Optimal',
    
    // Risk descriptions
    minimal: 'Minimal Risk',
    negligible: 'Negligible Risk',
    significant: 'Significant Risk',
    substantial: 'Substantial Risk',
    
    // Categories for specific conditions
    cardiovascular: {
      low: 'Low Cardiovascular Risk',
      moderate: 'Moderate Cardiovascular Risk',
      high: 'High Cardiovascular Risk',
      veryHigh: 'Very High Cardiovascular Risk'
    }
  },
  // Medical Calculator Common Terms
  points: 'points',
  point: 'point',
  outOf: 'out of',
  total: 'total',
  
  // Clinical Recommendations
  recommendations: {
    // General recommendations
    consultPhysician: 'Consult with your physician',
    seekMedicalAttention: 'Seek immediate medical attention',
    routineFollowUp: 'Schedule routine follow-up',
    urgentReferral: 'Urgent referral recommended',
    lifestyleModification: 'Lifestyle modification recommended',
    medicationReview: 'Medication review recommended',
    
    // Monitoring recommendations
    regularMonitoring: 'Regular monitoring required',
    closeMonitoring: 'Close monitoring required',
    annualCheckup: 'Annual checkup recommended',
    frequentMonitoring: 'Frequent monitoring recommended',
    
    // Treatment recommendations
    considerTreatment: 'Consider treatment initiation',
    optimizeTreatment: 'Optimize current treatment',
    reassessRisk: 'Reassess risk factors',
    
    // Lifestyle recommendations
    dietModification: 'Diet modification recommended',
    exerciseProgram: 'Exercise program recommended',
    smokingCessation: 'Smoking cessation recommended',
    weightManagement: 'Weight management recommended',
    stressReduction: 'Stress reduction recommended',
    
    // Emergency recommendations
    emergencyRoom: 'Go to emergency room immediately',
    call911: 'Call emergency services (911)',
    hospitalAdmission: 'Hospital admission may be required'
  },
  // Calculator-specific shared terms
  calculatorTerms: {
    // Input labels
    enterValue: 'Enter value',
    selectValue: 'Select value',
    chooseOption: 'Choose option',
    inputRequired: 'This field is required',
    
    // Results
    result: 'Result',
    score: 'Score',
    risk: 'Risk',
    recommendation: 'Recommendation',
    interpretation: 'Interpretation',
    
    // Actions
    calculate: 'Calculate',
    recalculate: 'Recalculate',
    clearAll: 'Clear All',
    printResult: 'Print Result',
    shareResult: 'Share Result',
    
    // Status
    calculating: 'Calculating...',
    calculated: 'Calculated',
    
    // Validation
    invalidInput: 'Invalid input',
    outOfRange: 'Value out of range',
    pleaseEnter: 'Please enter',
    
    // Common calculator fields
    age: 'Age',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    weight: 'Weight',
    height: 'Height',
    
    // Yes/No options
    yesNo: {
      yes: 'Yes',
      no: 'No',
      unknown: 'Unknown',
      notApplicable: 'Not Applicable'
    }
  },
  // Clinical terminology
  clinical: {
    // Patient demographics
    patient: 'Patient',
    demographics: 'Demographics',
    
    // Medical history
    medicalHistory: 'Medical History',
    familyHistory: 'Family History',
    currentMedications: 'Current Medications',
    allergies: 'Allergies',
    
    // Assessment
    assessment: 'Assessment',
    diagnosis: 'Diagnosis',
    workup: 'Workup',
    evaluation: 'Evaluation',
    
    // Treatment
    treatment: 'Treatment',
    therapy: 'Therapy',
    management: 'Management',
    intervention: 'Intervention',
    
    // Follow-up
    followUp: 'Follow-up',
    monitoring: 'Monitoring',
    surveillance: 'Surveillance',
    
    // Guidelines
    guidelines: 'Guidelines',
    protocol: 'Protocol',
    standard: 'Standard',
    evidenceBased: 'Evidence-based'
  },
  // Additional common translations
  evidenceBased: 'Evidence-based',
  clinicallyValidated: 'Clinically Validated',
  hipaaCompliant: 'HIPAA Compliant',
  signedIn: 'Signed In',
  unsavedChanges: 'Unsaved changes',
  // UI Components
  calculator: 'Calculator',
  results: 'Results',
  clinical_purpose: 'Clinical Purpose',
  about_calculator: 'About Calculator',
  
  // Filters
  filters: {
    categories: {
      // Quick Filters
      quickFilters: 'Quick Filters',
      quickFiltersDesc: 'Popular filter combinations for common searches',
      
      // Content & Format
      contentFormat: 'Content & Format',
      contentFormatDesc: 'Filter by content type, file format, and document structure',
      
      // Authority & Quality
      authorityQuality: 'Authority & Quality',
      authorityQualityDesc: 'Source credibility, peer review status, and evidence quality',
      
      // Medical Domain
      medicalDomain: 'Medical Domain',
      medicalDomainDesc: 'Medical specialties, subspecialties, and clinical topics',
      
      // Audience & Complexity
      audienceComplexity: 'Audience & Level',
      audienceComplexityDesc: 'Target audience, complexity level, and reading difficulty',
      
      // Publication & Access
      publicationAccess: 'Publication & Access',
      publicationAccessDesc: 'Publication date, access type, and availability',
      
      // Geographic & Context
      geographicContext: 'Geographic & Context',
      geographicContextDesc: 'Geographic relevance, practice settings, and patient populations',
      
      // Advanced Options
      advancedOptions: 'Advanced Options',
      advancedOptionsDesc: 'Clinical trials, research parameters, and specialized filters'
    }
  },

  // Workspace status messages
  workspace: {
    status: {
      allSystemsOperational: 'All Systems Operational',
      emergencyReady: 'Emergency Ready'
    }
  },
  
  // Service Layer Error Messages
  serviceErrors: {
    // Authentication errors
    userNotAuthenticated: 'User not authenticated',
    
    // Validation errors
    rawAnalysisRequired: 'Raw analysis is required',
    validABGTypeRequired: 'Valid ABG type is required',
    abgResultIdRequired: 'ABG result ID is required',
    geminiConfidenceRange: 'Gemini confidence must be between 0 and 1',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    invalidDateOfBirth: 'Invalid date of birth format',
    dateOfBirthFuture: 'Date of birth cannot be in the future',
    
    // Database errors
    failedToCreateABGResult: 'Failed to create ABG result',
    failedToUpdateABGResult: 'Failed to update ABG result',
    failedToGetABGResult: 'Failed to get ABG result',
    failedToGetABGResults: 'Failed to get ABG results',
    failedToDeleteABGResult: 'Failed to delete ABG result',
    failedToCreatePatient: 'Failed to create patient',
    failedToGetPatients: 'Failed to get patients',
    failedToSearchPatients: 'Failed to search patients',
    noIdReturned: 'No ID returned after creating record',
    
    // Not found errors
    patientNotFound: 'Patient not found or access denied',
    abgResultNotFound: 'ABG result not found or access denied',
    
    // Export errors
    jsonExportFailed: 'JSON export failed',
    csvExportFailed: 'CSV export failed',
    downloadFailed: 'Download failed',
    exportFailed: 'Export failed',
    unsupportedExportFormat: 'Unsupported export format',
    failedToExportABGResults: 'Failed to export and download ABG results',
    failedToGetExportSummary: 'Failed to get export summary',
    invalidExportFormat: 'Invalid export format. Must be json, csv, or pdf.',
    invalidStartDate: 'Invalid start date in date range.',
    invalidEndDate: 'Invalid end date in date range.',
    startDateAfterEndDate: 'Start date must be before end date.',
    
    // ABG types
    arterialBloodGas: 'Arterial Blood Gas',
    venousBloodGas: 'Venous Blood Gas',
    
    // Export sections and headers
    basicInfo: 'Basic Info',
    analysisResults: 'Analysis Results',
    patientInformation: 'Patient Information',
    clinicalInterpretation: 'Clinical Interpretation',
    actionPlans: 'Action Plans',
    imageUrls: 'Image URLs',
    
    // CSV headers
    csvHeaders: {
      id: 'ID',
      type: 'Type',
      rawAnalysis: 'Raw Analysis',
      processingTimeMs: 'Processing Time (ms)',
      confidence: 'Confidence',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      patientId: 'Patient ID',
      patientName: 'Patient Name',
      interpretation: 'Interpretation',
      actionPlan: 'Action Plan',
      imageUrl: 'Image URL'
    },
    
    // Gender options
    genderOptions: {
      male: 'Male',
      female: 'Female'
    },
    
    // File size units
    fileSizes: {
      bytes: 'Bytes',
      kb: 'KB',
      mb: 'MB',
      gb: 'GB'
    }
  }
};

export default common; 