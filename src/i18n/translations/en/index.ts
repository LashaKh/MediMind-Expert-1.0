import common from './common';
import navigation from './navigation';
import auth from './auth';
import calculators from './calculators';
import chat from './chat';
import documents from './documents';
import medical from './medical';
import validation from './validation';
import knowledgeBase from './knowledgeBase';
import { podcast } from './podcast';
import search from './search';
import news from './news';
import { filters } from './filters';
import abg from './abg';
import tts from './tts';
import workspace from './workspace';
import diseases from './diseases';
import help from './help';
import mediscribe from './mediscribe';
import profile from './profile';
import caseManagement from './caseManagement';
import caseLibrary from './caseLibrary';

export default {
  common: {
    ...common,
    getStarted: 'Get Started',
    evidenceBased: 'Evidence-based',
    clinicallyValidated: 'Clinically validated',
    hipaaCompliant: 'HIPAA compliant'
  },
  navigation,
  auth,
  calculators,
  chat,
  documents,
  medical,
  validation,
  knowledgeBase,
  'knowledge-base': knowledgeBase, // Alias for kebab-case access
  podcast,
  search,
  news,
  filters,
  abg,
  tts,
  workspace,
  diseases,
  help,
  mediscribe,
  profile,
  caseManagement,
  caseLibrary,

  // Tour/i18n for tour tooltips and selector
  tour: {
    common: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced'
    },
    tooltip: {
      title: 'Medical Tour Guide',
      stepCounter: 'Step {{current}} of {{total}}',
      progressLabel: 'Progress',
      close: 'Close tour',
      previous: 'Previous',
      next: 'Next',
      finish: 'Complete',
      completeTour: 'Complete Tour',
      nextStep: 'Next Step',
      allTours: 'All Tours',
      press: 'Press',
      or: 'or',
      toNavigate: 'to navigate',
      toClose: 'to close',
      skip: 'Skip Tour',
      swipeHint: 'Swipe left/right to navigate',
      debugPortalStep: 'DEBUG PORTAL - Step {{current}} of {{total}}',
      closeTour: 'Close tour',
      percentComplete: '{{percent}}% Complete ({{current}} of {{total}})',
      debugInfo: 'Debug Info:'
    },
    selector: {
      title: 'Choose Your Learning Path',
      subtitle: 'Select a feature to explore in detail with our premium guided tours',
      takeFullTour: 'Take Full Tour',
      startTour: 'Start Tour',
      retakeTour: 'Retake Tour',
      progress: 'Progress: {{percent}}%',
      completed: '{{done}} of {{total}} completed',
      popular: 'Popular',
      new: 'New',
      steps: 'steps',
      moreFeatures: 'more features',
      greatProgress: 'Great Progress! 🎉',
      completedCount: "You've completed {{count}} tours.",
      youAreExpert: "You're a MediMind Expert!",
      moreToGo: '{{remaining}} more to go!'
    },
    cards: {
      'ai-copilot': {
        title: 'AI Medical Co-Pilot',
        subtitle: 'Master Intelligent Medical Assistance',
        description: 'Comprehensive tour of our advanced AI system. Learn to upload medical files, analyze patient data, create cases, and leverage AI for clinical decision support.',
        duration: '8-10 min',
        features: {
          0: 'File Upload & Analysis',
          1: 'Medical Image Processing',
          2: 'Case Management'
        }
      },
      calculators: {
        title: 'Medical Calculators',
        subtitle: 'Clinical Decision Support Tools',
        description: 'Deep dive into our 16+ validated cardiac calculators. Master ASCVD, GRACE, HCM Risk, and more with AI-powered insights and clinical interpretations.',
        duration: '6-8 min',
        features: {
          0: 'Calculator Categories',
          1: 'Result Interpretation',
          2: 'AI Integration'
        }
      },
      'knowledge-base': {
        title: 'Complete Knowledge Base',
        subtitle: 'Curated Literature & Personal Documents',
        description: 'Master both our curated medical literature AND your personal document system. Navigate between both knowledge bases to understand the complete AI-powered medical intelligence platform.',
        duration: '6-8 min',
        features: {
          0: 'Curated Literature',
          1: 'Personal Documents',
          2: 'AI Integration'
        }
      },
      'abg-analysis': {
        title: 'Blood Gas Analysis',
        subtitle: 'AI-Powered ABG Intelligence',
        description: 'Master our advanced blood gas analysis engine. Learn AI interpretation, action plans, and comprehensive workflow management for arterial blood gases.',
        duration: '4-6 min',
        features: {
          0: 'ABG Input Methods',
          1: 'AI Interpretation',
          2: 'Clinical Insights'
        }
      },
      'medical-news': {
        title: 'Medical News Hub',
        subtitle: 'Stay Updated with AI Curation',
        description: 'Explore our intelligent medical news platform. Learn about AI curation, personalized alerts, reading progress tracking, and professional sharing.',
        duration: '3-5 min',
        features: {
          0: 'News Curation',
          1: 'Personalization',
          2: 'Save & Share'
        }
      },
      'disease-guidelines': {
        title: 'Disease Guidelines',
        subtitle: 'Medical Knowledge & Clinical Pathways',
        description: 'Explore our comprehensive medical knowledge base with evidence-based disease guidelines, clinical pathways, and treatment protocols for healthcare professionals.',
        duration: '4-6 min',
        features: {
          0: 'Evidence-Based Guidelines',
          1: 'Clinical Pathways',
          2: 'Disease Categories'
        }
      }
    },
    calculators: {
      hero: {
        title: 'Medical Calculator Excellence',
        subtitle: 'World-class evidence-based calculators with 100% validation and clinical accuracy'
      },
      stats: {
        validated: '100% Validated',
        clinical: 'Clinical Grade',
        evidence: 'Evidence-Based',
        fast: 'Lightning Fast'
      },
      categories: {
        title: 'Calculator Categories',
        description: 'Choose your specialty to access clinical tools'
      }
    },
    steps: {
      'ai-copilot': {
        'ai-welcome': {
          title: '🤖 Welcome to AI Medical Co-Pilot',
          content: '<p>Meet your intelligent medical assistant powered by advanced AI. This tour will show you how to use AI for <strong>evidence-based clinical decision support</strong> and case management.</p><p>✨ <em>Get ready to revolutionize your medical workflow!</em></p>'
        },
        'ai-interface': {
          title: '💬 Chat Interface Overview',
          content: '<p>This is your main communication hub with the AI. The interface is designed for <strong>medical professionals</strong> with intuitive controls and clinical-focused features.</p><p>🎯 <em>Notice the medical-specific UI elements and professional styling</em></p>'
        },
        'ai-message-input': {
          title: '✍️ Advanced Message Input',
          content: '<p>Type your medical questions here. The AI understands <strong>medical terminology</strong>, abbreviations, and clinical contexts. You can ask about symptoms, treatments, drug interactions, and more.</p><p>💡 <em>Try typing "chest pain differential diagnosis"</em></p>'
        },
        'ai-file-upload': {
          title: '📎 Medical File Upload',
          content: '<p>Upload medical files directly into the conversation. Supported formats include:</p><ul><li><strong>Medical Images</strong> (DICOM, PNG, JPG)</li><li><strong>Lab Results</strong> (PDF, CSV)</li><li><strong>ECGs and Reports</strong></li><li><strong>Clinical Documents</strong></li></ul><p>🔬 <em>AI can analyze and interpret these files in context</em></p>'
        },
        'ai-case-creation': {
          title: '📋 Case Study Creation',
          content: '<p>Create detailed patient case studies for <strong>research and documentation</strong>. Features include:</p><ul><li><strong>Anonymized patient information</strong></li><li><strong>Clinical complexity tracking</strong></li><li><strong>Case categorization and tagging</strong></li><li><strong>AI-enhanced case analysis</strong></li></ul><p>📚 <em>Build a comprehensive case library for learning and reference</em></p>'
        },
        'ai-case-management': {
          title: '🗂️ Case Management System',
          content: '<p>Your case studies integrate seamlessly with AI conversations:</p><ul><li><strong>Active case context</strong> in AI responses</li><li><strong>Case-specific recommendations</strong></li><li><strong>Progress tracking</strong> and follow-up</li><li><strong>Historical case analysis</strong></li></ul><p>🔗 <em>AI remembers case details and provides context-aware insights</em></p>'
        },
        'ai-complete': {
          title: '🎉 AI Co-Pilot Mastery Complete!',
          content: `<p>Excellent! You've mastered the AI Medical Co-Pilot. You now know how to:</p><ul><li>Communicate with AI using medical terminology</li><li>Upload and analyze medical files</li><li>Create and manage patient case studies</li><li>Get AI-powered medical insights with case context</li><li>Leverage evidence-based recommendations</li></ul><p>🚀 <em>Ready to revolutionize your medical practice with comprehensive case management!</em></p>`
        }
      },
      'medical-news': {
        'news-welcome': {
          title: '📰 Medical News & Literature Search',
          content: "<p>Discover our comprehensive <strong>medical search platform</strong> that combines AI-curated news, literature search, and clinical trials. Multiple trusted sources provide the latest medical developments.</p><p>🔔 <em>Your complete medical intelligence hub</em></p>"
        }
      },
      'knowledge-base': {
        'kb-welcome': {
          title: '📚 Knowledge Base System Overview',
          content: "<p>Welcome to MediMind's comprehensive <strong>dual knowledge system</strong>! We provide both expertly curated medical literature and your personal document library, all powered by AI.</p><p>🎓 <em>Two powerful sources of knowledge in one unified system</em></p>"
        },
        'kb-curated-overview': {
          title: '🌟 Curated Medical Literature',
          content: "<p>This is our <strong>curated knowledge base</strong>, featuring professionally selected medical literature, clinical guidelines, and evidence-based protocols from trusted professional sources.</p><p>📖 <em>Professional-grade medical knowledge at your fingertips</em></p>"
        },
        'kb-curated-features': {
          title: '🔍 Curated Content Features',
          content: "<p>The curated knowledge base offers:</p><ul><li><strong>Evidence-based filtering</strong> and source credibility</li><li><strong>Categorization by medical specialty</strong></li><li><strong>Clinical guidelines</strong> and protocols</li><li><strong>Professional recommendations</strong></li></ul><p>⚡ <em>Trusted medical information, instantly accessible</em></p>"
        },
        'kb-personal-transition': {
          title: '🗃️ Now Let\'s Explore Personal Knowledge Base',
          content: "<p>Now let's explore the <strong>Personal Library</strong> section, where you can upload and manage your own medical documents, research papers, and protocols for AI-powered search and reference.</p><p>🧠 <em>Your personalized medical intelligence system</em></p>"
        },
        'kb-personal-overview': {
          title: '⚡ Personal Document Processing',
          content: "<p>Your personal knowledge base uses <strong>advanced semantic analysis</strong> that transforms your documents into AI-understandable knowledge through vector embeddings and intelligent processing.</p><p>📚 <em>Making your personal documents accessible to AI</em></p>"
        },
        'kb-personal-features': {
          title: '📁 Personal Knowledge Base Features',
          content: "<p>Your personal knowledge system provides:</p><ul><li><strong>Multi-format document upload</strong> (PDF, Word, PowerPoint)</li><li><strong>OCR processing</strong> for scanned documents</li><li><strong>Semantic search</strong> and AI integration</li><li><strong>Smart organization</strong> and management tools</li></ul><p>⚡ <em>Your personal medical library, supercharged with AI</em></p>"
        },
        'kb-ai-integration': {
          title: '🤖 Unified AI Integration',
          content: "<p>Both knowledge bases integrate seamlessly with our AI system:</p><ul><li><strong>Smart citations</strong> from both curated and personal sources</li><li><strong>Cross-referencing capabilities</strong> between systems</li><li><strong>Contextual recommendations</strong> from all sources</li><li><strong>Unified search</strong> across your entire knowledge base</li></ul><p>🧠 <em>AI understands and references all your medical knowledge</em></p>"
        },
        'kb-complete': {
          title: '🎉 Knowledge Base Mastery Achieved!',
          content: "<p>Excellent! You've fully mastered the Knowledge Base system. You can now:</p><ul><li><strong>Access curated medical literature</strong> and professional guidelines</li><li><strong>Upload and manage</strong> your personal documents</li><li><strong>Search both systems</strong> with AI assistance</li><li><strong>Get unified citations</strong> from all sources</li></ul><p>🚀 <em>Complete medical knowledge at your command!</em></p>"
        }
      },
      'disease-guidelines': {
        'disease-welcome': { title: '🩺 Disease Guidelines', content: 'Knowledge base with evidence-based clinical pathways and protocols.' },
        'disease-header': { title: '🌟 Knowledge Hub', content: 'Categories, protocols, and professional resources.' },
        'disease-search': { title: '🔍 Search', content: 'Find diseases by name, symptoms, and treatment.' },
        'disease-filters': { title: '⚙️ Filters', content: 'Filter by categories and severity levels.' },
        'disease-evidence': { title: '📈 Evidence Levels', content: 'Understand research quality for decision-making.' },
        'disease-cards': { title: '📋 Cards', content: 'Quick access to essential clinical details.' },
        'disease-complete': { title: '🎉 Complete', content: 'Full knowledge base ready to use.' }
      },
      calculators: {
        'calc-welcome': {
          title: '🧮 Medical Calculators Hub',
          content: '<p>Welcome to our comprehensive collection of <strong>16+ validated medical calculators</strong>. Every calculator has been rigorously tested for clinical accuracy and follows current guidelines.</p><p>✅ <em>100% validation success rate across all calculators</em></p>'
        },
        'calc-categories': {
          title: '📊 Calculator Categories & Interface',
          content: '<p>The calculator interface is organized by clinical use:</p><ul><li><strong>Risk Assessment</strong> - ASCVD, GRACE, CHA2DS2-VASc</li><li><strong>Heart Failure</strong> - Staging, MAGGIC, SHFM</li><li><strong>Surgical Risk</strong> - STS, EuroSCORE II</li><li><strong>Specialized</strong> - HCM Risk, DAPT</li></ul><p>🎯 <em>Each category is designed for specific clinical scenarios and provides validated medical calculations</em></p>'
        },
        'calc-features': {
          title: '⚡ Advanced Calculator Features',
          content: '<p>All calculators include <strong>professional medical features</strong>:</p><ul><li><strong>Intelligent input validation</strong> with range checking</li><li><strong>Unit conversion</strong> (metric/imperial)</li><li><strong>Clinical context warnings</strong> and alerts</li><li><strong>Comprehensive results</strong> with interpretations</li><li><strong>Evidence-based recommendations</strong></li></ul><p>🛡️ <em>Designed for accuracy and clinical safety</em></p>'
        },
        'calc-complete': {
          title: '🎯 Calculator Mastery Complete!',
          content: '<p>Excellent! You\'ve learned about our medical calculator system. You now understand:</p><ul><li>How to navigate calculator categories</li><li>The advanced validation and safety features</li><li>How to apply evidence-based medicine</li><li>The clinical accuracy and guideline compliance</li></ul><p>🏆 <em>Ready to use validated medical calculators in your practice!</em></p>'
        }
      },
      'abg-analysis': {
        'abg-welcome': {
          title: '🩸 Blood Gas Analysis Engine',
          content: '<p>Master our <strong>AI-powered ABG analysis system</strong>. Get instant interpretations, comprehensive assessments, and treatment recommendations for arterial blood gas results.</p><p>⚕️ <em>Advanced clinical decision support for critical care medicine</em></p>'
        },
        'abg-header': {
          title: '🎯 ABG Analysis Header',
          content: '<p>Your comprehensive blood gas analysis workspace, featuring:</p><ul><li><strong>Medical-grade AI badge</strong> - Professional certification</li><li><strong>Quick access to history</strong> - View previous analyses</li><li><strong>AI-powered intelligence</strong> - Clinical decision support</li><li><strong>Professional workflow design</strong> - Optimized for healthcare professionals</li></ul><p>👩‍⚕️ <em>Built for rapid clinical decision-making</em></p>'
        },
        'abg-workflow': {
          title: '📊 Workflow Progress System',
          content: '<p>Track your analysis progress through our <strong>4-step workflow</strong>:</p><ul><li><strong>Upload</strong> - Select blood gas report</li><li><strong>Analysis</strong> - AI vision processing</li><li><strong>Interpretation</strong> - Clinical analysis</li><li><strong>Action Plan</strong> - Treatment recommendations</li></ul><p>⚡ <em>Visual progress tracking with real-time updates</em></p>'
        },
        'abg-type-selection': {
          title: '🧪 Blood Gas Type Selection',
          content: '<p>Choose the appropriate analysis type:</p><ul><li><strong>Arterial Blood Gas</strong> - Standard ABG analysis</li><li><strong>Venous Blood Gas</strong> - Venous sample analysis</li><li><strong>Smart selection</strong> - Optimizes AI processing</li><li><strong>Type-specific interpretation</strong> - Tailored clinical insights</li></ul><p>🎯 <em>Accurate type selection ensures optimal AI analysis</em></p>'
        },
        'abg-image-upload': {
          title: '📁 Image Upload Interface',
          content: '<p>Upload your blood gas report using <strong>multiple methods</strong>:</p><ul><li><strong>Drag and drop</strong> - Simply drag files to the upload zone</li><li><strong>File selection</strong> - Click to select from your device</li><li><strong>Camera capture</strong> - Take a photo directly</li><li><strong>Multiple formats</strong> - Supports JPEG, PNG, WebP</li></ul><p>🧠 <em>AI automatically extracts data from uploaded images</em></p>'
        },
        'abg-complete': {
          title: '🎯 ABG Analysis Mastery Complete!',
          content: '<p>Excellent! You\'ve mastered ABG analysis. You can now:</p><ul><li><strong>Upload blood gas reports</strong> via image or camera</li><li><strong>Select appropriate analysis types</strong> for optimal processing</li><li><strong>Track workflow progress</strong> through our 4-step system</li><li><strong>Access complete history</strong> and professional features</li></ul><p>🏆 <em>Ready for expert-level blood gas analysis workflows!</em></p>'
        }
      }
    }
  },
  
  // Case management
  'case-creation': {
    createNewCase: 'Create New Case',
    newCase: 'New Case',
    caseTitle: 'Case Title',
    caseDescription: 'Case Description',
    anonymizedInfo: 'Anonymized Patient Information',
    anonymizedPatientInfo: 'Anonymized Patient Information',
    category: 'Category',
    complexity: 'Complexity',
    complexityLevel: 'Complexity Level',
    tags: 'Tags',
    createCase: 'Create Case',
    creating: 'Creating...',
    creatingCase: 'Creating Case...',
    cancel: 'Cancel',
    save: 'Save',
    // Privacy and validation
    privacyNotice: 'Privacy Notice',
    privacyMessage: 'Please ensure all patient information is completely anonymized. Remove names, dates, specific locations, and any other identifying details.',
    privacyNoticeDetailed: 'Include relevant medical history, symptoms, test results, and other clinical information. Ensure all identifying details are removed.',
    anonymizationHelp: 'Include relevant medical history, symptoms, test results, and other clinical information. Ensure all identifying details are removed.',
    // Form placeholders
    titlePlaceholder: 'Brief descriptive title for this case',
    descriptionPlaceholder: 'Brief overview of the case and what you\'d like to discuss',
    patientInfoPlaceholder: 'Patient age, gender, presenting symptoms, medical history, test results, etc. (completely anonymized)',
    tagsPlaceholder: 'e.g., hypertension, diabetes, follow-up',
    tagsHint: 'Separate multiple tags with commas',
    categoryHint: 'Optional - helps organize your cases',
    // Validation errors
    titleRequired: 'Case title is required',
    descriptionRequired: 'Case description is required',
    patientInfoRequired: 'Patient information is required',
    patientInfoTooShort: 'Please provide more detailed patient information (minimum 50 characters)',
    sensitiveInfoDetected: 'Please remove any names, dates, or identifying numbers from the patient information',
    // Categories
    selectCategory: 'Select category (optional)',
    diagnosis: 'Diagnosis',
    treatment: 'Treatment',
    consultation: 'Consultation',
    // Cardiology specific
    interventionalCardiology: 'Interventional Cardiology',
    electrophysiology: 'Electrophysiology',
    heartFailure: 'Heart Failure',
    preventiveCardiology: 'Preventive Cardiology',
    // OB/GYN specific
    obstetrics: 'Obstetrics',
    gynecology: 'Gynecology',
    reproductiveHealth: 'Reproductive Health',
    maternalFetalMedicine: 'Maternal-Fetal Medicine',
    // Complexity levels
    lowComplexity: 'Low complexity',
    mediumComplexity: 'Medium complexity',
    highComplexity: 'High complexity',
    // Specialty titles
    cardiologySpecialty: 'Cardiology Specialty',
    obgynSpecialty: 'Obstetrics & Gynecology Specialty',
    // Character count
    charactersMinimum: '{{count}}/50 characters minimum',
    // Existing case management
    activeCase: 'Active Case',
    caseDiscussion: 'Case Discussion',
    resetCase: 'Reset Case',
    viewCases: 'View Cases',
    noCases: 'No cases created yet',
    caseCreated: 'Case created successfully',
    caseSaved: 'Case saved',
    caseDeleted: 'Case deleted',
    // Case list and filters
    selectExistingCase: 'Select Existing Case',
    all: 'All',
    active: 'Active',
    archived: 'Archived',
    newestFirst: 'Newest First',
    oldestFirst: 'Oldest First',
    alphabetical: 'Alphabetical',
    noCasesFound: 'No cases found',
    noCasesYet: 'No cases yet',
    adjustFilters: 'Try adjusting your search or filters.',
    createFirstCase: 'Create your first case to get started with case discussions.',
    // Knowledge base additional
    curated: 'Curated',
    personal: 'Personal'
  },
  
  // Conversation management
  conversations: {
    title: 'Conversations',
    newChat: 'New Chat',
    searchPlaceholder: 'Search conversations...', 
    allSpecialties: 'All Specialties',
    cardiology: 'Cardiology',
    obgyn: 'OB/GYN',
    recent: 'Recent',
    byName: 'Name',
    byMessages: 'Messages',
    noConversationsFound: 'No conversations found',
    deleteConversation: 'Delete conversation',
    editTitle: 'Edit title',
    save: 'Save',
    cancel: 'Cancel',
    message: 'message',
    messages: 'messages',
    conversation: 'conversation',
    conversations: 'conversations',
    totalMessages: 'total messages',
    tryAdjustingSearchOrFilters: 'Try adjusting your search or filters',
    deleteConfirmation: 'Are you sure you want to delete this conversation? This action cannot be undone.',
    delete: 'Delete',
    caseStudies: 'Case Studies',
    loadMessages: 'Load messages',
    manageSubtitle: 'View, search, and organize all your conversation history',
    all: 'All',
    noMatchesFound: 'No matches found',
    startNewConversationHint: 'Start a new conversation to begin your chat history',
    createFirstConversation: 'Create your first conversation',
    caseStudy: 'Case Study'
  },
  
  // Landing page
  landing: {
    heroTitle: 'Specialized Medical Intelligence, Instantly.',
    heroSubtitle: 'Empowering Cardiologists and OB/GYNs with rapid access to curated medical literature, AI-driven case discussions, and personalized knowledge bases. Streamline your decision-making and stay ahead with MediMind Expert.',
    getStarted: 'Start Free Trial',
    learnMore: 'Learn More',
    features: {
      title: 'Key Features of MediMind Expert',
      subtitle: 'Empowering medical specialists with AI-driven insights and tailored knowledge.',
      aiCoPilot: {
        title: 'AI Medical Co-Pilot',
        description: 'Engage in contextual case discussions, get instant answers from medical literature, and leverage an AI assistant tailored to your specialty.'
      },
      knowledgeAccess: {
        title: 'Specialized Knowledge Access',
        description: 'Instantly access curated, up-to-date medical literature, guidelines, and treatment plans specific to Cardiology & OB/GYN.'
      },
      knowledgeBase: {
        title: 'Knowledge Base',
        description: 'Integrate your trusted resources. Upload documents to create a secure, searchable knowledge base for your AI Co-Pilot.'
      },
      specialtyTools: {
        title: 'Specialty-Specific Tools',
        description: 'Utilize built-in medical calculators and access common forms relevant to your specialty, streamlining daily tasks.'
      }
    },
    testimonials: 'Testimonials',
    pricing: 'Pricing',
    contact: 'Contact',
    footer: 'Footer'
  },
  
  // UI elements
  ui: {
    openMenu: 'Navigation menu opened',
    closeMenu: 'Navigation menu closed',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    selectAll: 'Select all',
    clearAll: 'Clear all',
    sortBy: 'Sort by',
    filterBy: 'Filter by',
    groupBy: 'Group by',
    viewDetails: 'View details',
    editItem: 'Edit item',
    deleteItem: 'Delete item',
    duplicateItem: 'Duplicate item',
    shareItem: 'Share item',
    exportData: 'Export data',
    importData: 'Import data',
    refresh: 'Refresh',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
    escapeToClose: 'Press Escape to close'
  },
  
  // Notes functionality
  notes: {
    newNote: 'New Note',
    searchNotes: 'Search notes...', 
    save: 'Save',
    delete: 'Delete',
    untitledNote: 'Untitled Note',
    addNote: 'Add Note'
  },
  
  // Patient management
  patients: {
    title: 'Cardiac Patient Table - 9th Floor',
    addPatient: 'Add Patient',
    status: {
      unstable: 'Unstable',
      stable: 'Stable',
      'discharge-ready': 'Ready for Discharge'
    },
    rooms: {
      title: 'Rooms',
      room: 'Room {{number}}',
      bed: 'Bed {{number}}',
      clickToAdd: 'Click to add patient'
    },
    basicInfo: {
      name: 'Name',
      diagnosis: 'Diagnosis',
      comorbidities: 'Comorbidities'
    }
  },
  
  // Onboarding process
  onboarding: {
    welcome: "Welcome to MediMind Expert",
    setupMessage: "Let's set up your personalized medical workspace",
    settingUpWorkspace: "Setting up your workspace...",
    steps: {
      selectSpecialty: "Select Specialty",
      aboutYou: "About You"
    },
    specialty: {
      title: "Choose Your Medical Specialty",
      subtitle: "Select your primary area of practice to get personalized AI assistance and resources",
      featuresTitle: "What you'll get:",
      note: "You can access resources from both specialties, but your workspace will be optimized for your primary choice",
      cardiology: {
        name: "Cardiology",
        description: "Heart and cardiovascular system care",
        features: {
          cardiac: "Cardiac assessment tools",
          ecg: "ECG interpretation guides", 
          heartFailure: "Heart failure protocols",
          interventional: "Interventional cardiology resources"
        }
      },
      obgyn: {
        name: "OB/GYN",
        description: "Obstetrics and Gynecology",
        features: {
          prenatal: "Prenatal care guidelines",
          gynecological: "Gynecological procedures",
          obstetric: "Obstetric calculators",
          reproductive: "Reproductive health resources"
        }
      }
    },
    aboutMe: {
      title: "Tell us about yourself",
      subtitle: "Help us personalize your AI assistant by sharing context about your practice and experience",
      label: "Share your professional story",
      placeholder: "I am a cardiologist with 8 years of experience working in a tertiary care hospital. I specialize in interventional cardiology and have a particular interest in complex coronary interventions. I completed my fellowship at...",
      
      // Progress indicators
      wordCount: "{{count}} words",
      progressMessages: {
        gettingStarted: "Getting started...",
        goodProgress: "Good progress!",
        lookingGreat: "Looking great!",
        perfectDetail: "Perfect detail level!"
      },
      charactersCount: "{{count}} characters",
      recommended: "Recommended: 50-200 words",
      keepConcise: "Consider keeping it concise for best results",
      
      // Suggestions section
      suggestionsTitle: "Quick prompts to get you started",
      suggestionsSubtitle: "Click on any topic below to add it to your profile. These help our AI provide more relevant assistance.",
      
      // Suggestion cards
      suggestions: {
        experience: {
          title: "Your Experience",
          description: "Years of practice, specializations, certifications",
          prompt: "Share your medical experience and background"
        },
        practiceSetting: {
          title: "Practice Setting", 
          description: "Hospital, clinic, private practice, academic",
          prompt: "Describe your current workplace environment"
        },
        clinicalInterests: {
          title: "Clinical Interests",
          description: "Areas of expertise, research interests, subspecialties", 
          prompt: "What are your main clinical focus areas?"
        },
        patientPopulation: {
          title: "Patient Population",
          description: "Demographics, case complexity, patient types",
          prompt: "Tell us about the patients you typically treat"
        },
        clinicalApproach: {
          title: "Clinical Approach", 
          description: "Treatment philosophy, decision-making style",
          prompt: "Describe your approach to patient care"
        },
        education: {
          title: "Education & Training",
          description: "Medical school, residency, fellowships, continuing education",
          prompt: "Share your educational background"
        }
      },
      
      // Example section
      exampleTitle: "Example professional profile",
      exampleText: `"I am a board-certified cardiologist with 10 years of experience practicing at a large academic medical center. I specialize in interventional cardiology with a focus on complex coronary interventions and structural heart disease. I completed my fellowship at Johns Hopkins and have particular expertise in TAVR procedures. I see a high volume of acute coronary syndrome patients and enjoy teaching medical students and residents."`,
      
      // Buttons and actions
      back: "Back",
      skipForNow: "Skip for now", 
      completeSetup: "Complete Setup",
      creatingWorkspace: "Creating workspace...",
      
      // Success animation
      profileCreated: "Profile Created!",
      settingUpPersonalized: "Setting up your personalized workspace...",
      
      // Legacy support
      wordCountLegacy: "{{count}} words • Optional but recommended for better personalization",
      suggestionsLegacyTitle: "Consider including:",
      suggestionsLegacy: {
        experience: "Years of experience in practice",
        workplace: "Current workplace setting (hospital, clinic, private practice)",
        interests: "Areas of special interest within your specialty", 
        cases: "Types of cases you see most frequently",
        approaches: "Preferred treatment approaches or methodologies",
        education: "Continuing education focus areas"
      },
      exampleLegacyTitle: "Example:",
      exampleLegacyText: "\"I'm a cardiologist with 8 years of experience working in a large hospital system. I specialize in interventional cardiology and frequently handle complex PCI cases. I'm particularly interested in the latest evidence on TAVR procedures and managing patients with multiple comorbidities.\""
    }
  },
  
  // Loading states
  loading: {
    loading: "Loading...",
    verifying_specialty: "Verifying specialty access...",
    authenticating: "Authenticating...",
    processing: "Processing...",
    please_wait: "Please wait..."
  },
  
  // Access control
  access: {
    access_denied: "Access denied. This section is restricted to {{specialties}} specialists.",
    unauthorized: "You are not authorized to access this section.",
    invalid_specialty: "Invalid specialty access.",
    redirect_message: "Redirecting to your workspace..."
  },
  
  // Feedback messages
  feedback: {
    saveSuccess: 'Successfully saved',
    updateSuccess: 'Successfully updated',
    deleteSuccess: 'Successfully deleted',
    uploadSuccess: 'Successfully uploaded',
    calculationComplete: 'Calculation complete',
    operationComplete: 'Operation complete',
    changesSaved: 'Changes saved',
    dataSynced: 'Data synced',
    actionCompleted: 'Action completed'
  },
  
  // Theme controls
  theme: {
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode'
  },
  
  // Legacy navigation support
  nav: {
    features: 'Features',
    pricing: 'Pricing',
    about: 'About'
  },

  // Footer
  footer: {
    madeWith: 'Made with',
    forHealthcare: 'for healthcare',
    privacy: 'Privacy',
    terms: 'Terms',
    systemStatus: 'System Status',
    status: 'Status',
    medicalDisclaimer: 'Medical Disclaimer',
    disclaimerText: 'This AI assistant is for educational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions.',
    help: 'Help',
    docs: 'Docs',
    support: 'Support',
    contactSupport: 'Contact Support',
    professionalAssistant: 'AI assistant for {{specialty}} professionals',
    medicalAssistant: 'AI assistant for medical professionals'
  },

  // Medical specialties
  specialties: {
    cardiology: 'cardiology',
    obgyn: 'OB/GYN',
    internalMedicine: 'Internal Medicine',
    emergencyMedicine: 'Emergency Medicine',
    familyMedicine: 'Family Medicine',
    pediatrics: 'Pediatrics',
    surgery: 'Surgery',
    psychiatry: 'Psychiatry',
    radiology: 'Radiology',
    anesthesiology: 'Anesthesiology',
    dermatology: 'Dermatology',
    neurology: 'Neurology',
    oncology: 'Oncology',
    orthopedics: 'Orthopedics',
    pathology: 'Pathology',
    urology: 'Urology',
    other: 'Other'
  }
};
