export const caseManagement = {
  // Modal Header
  createNewCase: 'Create New Case',
  editCaseStudy: 'Edit Case Study',
  cardiologyCase: 'Cardiology Case',
  obgynCase: 'OB/GYN Case',
  medicalCase: 'Medical Case',

  // Step Headers
  caseOverview: 'Case Overview',
  caseOverviewDesc: 'Basic information',
  patientDetails: 'Patient Details',
  patientDetailsDesc: 'Anonymized patient data',
  attachments: 'Attachments',
  attachmentsDesc: 'Medical files and images',
  classification: 'Classification',
  classificationDesc: 'Category and complexity',

  // Step 1: Case Overview
  letsStartBasics: 'Let\'s Start with the Basics',
  provideOverview: 'Provide a clear case title and brief overview',
  caseTitle: 'Case Title',
  caseTitleRequired: 'Case Title *',
  caseTitlePlaceholder: 'Brief descriptive title for the case',
  briefDescription: 'Brief Description',
  briefDescriptionRequired: 'Brief Description *',
  briefDescriptionPlaceholder: 'Provide a comprehensive overview of the case including: chief complaint, relevant history, examination findings, initial impression, key questions to discuss, and what specific guidance you need...',
  charactersCount: '({{count}}/1000 characters)',
  charactersCountMin: '({count} characters, minimum 50)',
  makeDescriptionEffective: 'Make your case description more effective:',
  includeChiefComplaint: '• Include chief complaint and symptoms',
  mentionHistory: '• Mention relevant medical history and medications',
  describeFindings: '• Describe examination or diagnostic findings',
  stateWorkingDiagnosis: '• State your working diagnosis or differential',
  specifyGuidance: '• Specify what guidance or discussion you need',

  // Step 2: Patient Details
  patientInformation: 'Patient Information',
  provideAnonymizedDetails: 'Provide anonymized patient details for discussion',
  privacyProtectionRequired: 'Privacy Protection Required',
  ensureAnonymized: 'Please ensure all patient information is fully anonymized.',
  removeNames: '• Remove all names, dates, and specific locations',
  useGeneralTerms: '• Use general terms (e.g., "50-year-old female")',
  removeIdentifyingNumbers: '• Remove any identifying numbers or codes',
  anonymizedPatientInfo: 'Anonymized Patient Information',
  anonymizedPatientInfoRequired: 'Anonymized Patient Information *',
  anonymizedPatientInfoPlaceholder: 'Patient age, gender, presenting symptoms, medical history, test results, etc. (fully anonymized)',
  minimumLengthMet: '✓ Minimum length met',
  needMoreCharacters: 'Need {count} more characters',

  // Step 3: Attachments
  medicalDocuments: 'Medical Documents',
  attachRelevantFiles: 'Attach relevant medical files, images, and reports',
  filesAttached: '{count} files attached',
  fileAttached: '{count} file attached',
  filesWillBeAnalyzed: 'These files will be analyzed to provide better context for your case',

  // Step 4: Classification
  caseClassification: 'Case Classification',
  helpOrganize: 'Help organize and prioritize your case',
  category: 'Category',
  complexityLevel: 'Complexity Level',
  complexityLevelRequired: 'Complexity Level *',

  // Complexity Levels
  lowComplexity: 'Low Complexity',
  lowComplexityDesc: 'Routine case, clear presentation',
  mediumComplexity: 'Medium Complexity',
  mediumComplexityDesc: 'Some complexity, multiple factors',
  highComplexity: 'High Complexity',
  highComplexityDesc: 'Complex case, multiple specialties',

  // Tags
  tags: 'Tags',
  tagsOptional: 'Tags (Optional)',
  tagsPlaceholder: 'hypertension, diabetes, emergency (comma separated)',
  tagsHelp: 'Add relevant keywords to help organize and find this case later',

  // Categories - Cardiology
  diagnosisAssessment: 'Diagnosis & Assessment',
  interventionalCardiology: 'Interventional Cardiology',
  electrophysiology: 'Electrophysiology',
  heartFailure: 'Heart Failure',
  preventiveCardiology: 'Preventive Cardiology',
  acuteCardiacCare: 'Acute Cardiac Care',

  // Categories - OB/GYN
  obstetrics: 'Obstetrics',
  gynecology: 'Gynecology',
  reproductiveHealth: 'Reproductive Health',
  maternalFetal: 'Maternal-Fetal Medicine',
  gynecologicOncology: 'Gynecologic Oncology',
  fertilityEndocrinology: 'Fertility & Reproductive Endocrinology',

  // Categories - General
  diagnosis: 'Diagnosis',
  treatment: 'Treatment',
  consultation: 'Consultation',

  // Buttons
  previous: 'Previous',
  next: 'Next',
  createCase: 'Create Case',
  updateCase: 'Update Case',
  creatingCase: 'Creating case...',
  updatingCase: 'Updating case...',

  // Validation Errors
  caseTitleRequired: 'Case title is required',
  briefDescriptionRequired: 'Brief description is required',
  patientInfoRequired: 'Patient information is required',
  provideDetailedInfo: 'Please provide more detailed information (minimum 50 characters)',
  selectComplexity: 'Please select a complexity level'
};

export default caseManagement;
