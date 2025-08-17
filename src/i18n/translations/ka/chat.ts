export const chat = {
  title: 'AI ჩატი',
  placeholder: 'შეიყვანეთ თქვენი შეტყობინება...',
  send: 'გაგზავნა',
  sendMessage: 'შეტყობინების გაგზავნა',
  typing: 'იწერს...',
  connecting: 'დაკავშირება...',
  connected: 'დაკავშირებულია',
  disconnected: 'გათიშულია',
  reconnecting: 'ხელახალი დაკავშირება...',
  error: 'ჩატის შეცდომა',
  retry: 'ხელახლა ცდა',
  clear: 'ჩატის გასუფთავება',
  newChat: 'ახალი ჩატი',
  attachFile: 'ფაილის მიმაგრება',
  uploadImage: 'სურათის ატვირთვა',
  recordAudio: 'აუდიოს ჩაწერა',
  stopRecording: 'ჩაწერის შეწყვეტა',
  playAudio: 'აუდიოს დაკვრა',
  pauseAudio: 'აუდიოს პაუზა',
  deleteMessage: 'შეტყობინების წაშლა',
  editMessage: 'შეტყობინების რედაქტირება',
  copyMessage: 'შეტყობინების კოპირება',
  shareMessage: 'შეტყობინების გაზიარება',
  timestamp: 'დრო',
  assistant: 'ასისტენტი',
  user: 'მომხმარებელი',
  system: 'სისტემა',
  
  // Basic chat functionality
  searchPlaceholder: 'საუბრების ძებნა...',
  noConversations: 'ჯერ არ არის საუბრები',
  noConversationsFound: 'საუბრები ვერ მოიძებნა',
  selectConversation: 'აირჩიეთ საუბარი ან დაიწყეთ ახალი',
  typeMessage: 'შეიყვანეთ თქვენი შეტყობინება...',
  startConversation: 'დაიწყეთ საუბარი MediMind AI-თან',
  processing: 'დამუშავება...',
  chatWindow: 'ჩატის ფანჯარა',
  messageHistory: 'შეტყობინებების ისტორია',
  welcomeTitle: 'კეთილი იყოს თქვენი მობრძანება AI თანაპილოტთან',
  welcomeMessage: 'მკითხეთ ნებისმიერი სამედიცინო შემთხვევების, სახელმძღვანელოების შესახებ ან მიიღეთ დახმარება კლინიკურ გადაწყვეტილებებში.',
  aiTyping: 'AI იწერს...',
  
  // Status indicators
  online: 'ონლაინ',
  offline: 'ოფლაინ',
  
  // Specialty titles
  cardiologyAICoPilot: 'კარდიოლოგიის AI თანაპილოტი',
  obgynAICoPilot: 'მეანობა-გინეკოლოგიის AI თანაპილოტი',
  medicalAICoPilot: 'სამედიცინო AI თანაპილოტი',
  
  // Personal knowledge base guidance
  usingPersonalDocs: 'იყენებს თქვენს {count} პირად დოკუმენტს',
  uploadDocsForKB: 'ატვირთეთ დოკუმენტები პირადი ცოდნის ბაზის შესაქმნელად',
  
  // Welcome screen content
  welcomeToMediMind: 'კეთილი იყოს თქვენი მობრძანება MediMind Expert-ში',
  welcomeDescription: 'თქვენი AI-ით აღჭურვილი სამედიცინო თანაპილოტი მზადაა დაგეხმაროთ კლინიკურ გადაწყვეტილებებში, სახელმძღვანელოებში, შემთხვევების ანალიზში და მტკიცებულებებზე დაფუძნებულ რეკომენდაციებში.',
  
  // Feature cards
  clinicalGuidelines: 'კლინიკური სახელმძღვანელოები',
  clinicalGuidelinesExample: '"რა არის ACC/AHA სახელმძღვანელოები ჰიპერტენზიის მართვისთვის?"',
  caseAnalysis: 'შემთხვევის ანალიზი',
  caseAnalysisExample: '"დამეხმარეთ ამ 65 წლის პაციენტის გულმკერდის ტკივილის ანალიზში"',
  drugInformation: 'წამლების ინფორმაცია',
  drugInformationExample: '"რა არის ბეტა-ბლოკატორების უკუჩვენებები?"',
  
  // Knowledge base status
  usingGeneralMedicalKnowledge: 'იყენებს ზოგად სამედიცინო ცოდნას',
  generalMedicalKnowledge: 'ზოგადი სამედიცინო ცოდნის ბაზა',
  
  // Button tooltips
  viewAllCases: 'ყველა შემთხვევის ნახვა',
  viewConversationHistory: 'საუბრების ისტორიის ნახვა',
  startNewConversation: 'ახალი საუბრის დაწყება',
  
  // Error messages
  connectToStartChatting: 'დაუკავშირდით ჩატის დასაწყებად...',
  dismiss: 'დახურვა',
  
  // Loading states
  loadingConversationHistory: 'იტვირთება საუბრების ისტორია...',
  analyzingQuery: 'თქვენი მოთხოვნის ანალიზი...',
  
  // Default conversation title
  defaultChatTitle: 'ჩატი',
  
  // Case management
  caseReceived: 'მე მივიღე შემთხვევა "{{title}}". მზად ვარ დაგეხმაროთ ამ შემთხვევის ანალიზში და კლინიკური რეკომენდაციების მიწოდებაში.',
  caseSummary: 'შემთხვევის მოკლე აღწერა:',
  caseDiscussionPrompt: 'ამ შემთხვევის რომელი კონკრეტული ასპექტი გსურთ ჯერ განიხილოთ?',
  
  // File upload additional
  personalDocsAvailable: '{count} პირადი დოკუმენტი ხელმისაწვდომია',
  noPersonalDocs: 'პირადი დოკუმენტები არ არის ატვირთული',
  maxFilesError: 'მაქსიმუმ {maxFiles} ფაილი არის ნებადართული',
  
  sources: {
    title: 'წყაროები',
    showSources: 'წყაროების ჩვენება',
    hideSources: 'წყაროების დამალვა',
    viewSource: 'წყაროს ნახვა',
    citation: 'ციტირება {index}',
    documentSource: 'დოკუმენტის წყარო',
    webSource: 'ვებ წყარო'
  },
  suggestions: {
    title: 'შემოთავაზებები',
    quickActions: 'სწრაფი ქმედებები',
    calculators: 'კალკულატორები',
    askAbout: 'იკითხეთ შესახებ...',
    examples: [
      'რისკის შეფასების გამოსაყენებელი კალკულატორი',
      'გულის ქირურგიული ჩარევის შესახებ',
      'ორსულობის გართულებების მართვა',
      'მედიკამენტური ინტერაქციების შემოწმება'
    ]
  },
  fileUpload: {
    selectFile: 'ფაილის არჩევა',
    dragDrop: 'გადმოიტანეთ ფაილები აქ',
    uploading: 'იტვირთება...',
    uploadSuccess: 'ფაილი წარმატებით აიტვირთა',
    uploadError: 'ფაილის ატვირთვა ვერ მოხერხდა',
    fileSizeLimit: 'ფაილის ზომა არ უნდა აღემატებოდეს {size}MB',
    supportedFormats: 'მხარდაჭერილი ფორმატები: {formats}',
    removeFile: 'ფაილის ამოღება'
  },
  conversation: {
    history: 'საუბრის ისტორია',
    clearHistory: 'ისტორიის გასუფთავება',
    exportChat: 'ჩატის ექსპორტი',
    importChat: 'ჩატის იმპორტი',
    saveConversation: 'საუბრის შენახვა',
    loadConversation: 'საუბრის ჩატვირთვა'
  },
  voice: {
    startListening: 'მოსმენის დაწყება',
    stopListening: 'მოსმენის შეწყვეტა',
    speechNotSupported: 'მეტყველების ამოცნობა არ არის მხარდაჭერილი',
    microphonePermission: 'მიკროფონის ნებართვა საჭიროა',
    listeningActive: 'მოსმენა აქტიურია...',
    speechDetected: 'მეტყველება ამოცნობილია'
  },
  settings: {
    title: 'ჩატის პარამეტრები',
    fontSize: 'ფონტის ზომა',
    theme: 'თემა',
    notifications: 'შეტყობინებები',
    autoScroll: 'ავტომატური გადახვევა',
    showTimestamps: 'დროის შტამპების ჩვენება',
    enableSound: 'ხმის ჩართვა'
  },
  errors: {
    connectionLost: 'კავშირი დაიკარგა',
    messageNotSent: 'შეტყობინება არ გაიგზავნა',
    invalidMessage: 'არასწორი შეტყობინება',
    rateLimitExceeded: 'შეტყობინებების ლიმიტი ამოწურულია',
    serverError: 'სერვერის შეცდომა',
    networkError: 'ქსელის შეცდომა'
  },
  selectFiles: 'ფაილების არჩევა',
  // Newly added keys
  processingFile: 'მუშავდება {fileName}',
  textExtracted: '✓ ტექსტი ამოღებულია ({count} სიმბოლო)',
  largeDocumentsSummarized: 'დიდი დოკუმენტები შეჯამდება კონტექსტის ლიმიტების შესანარჩუნებლად',
  textExtractedFromCount: 'ტექსტი ამოღებულია {count} ფაილიდან',
  extractedContentIncluded: 'ამოღებული კონტენტი დაემატება თქვენს შეტყობინებას უკეთესი კონტექსტისთვის',
  selectCaseDocuments: 'შემთხვევის დოკუმენტების არჩევა',
  selectFromCaseDocuments: '{count} შემთხვევის დოკუმენტიდან არჩევა',
  fileProcessFailed: 'ფაილების დამუშავება ვერ მოხერხდა. სცადეთ თავიდან.',
  analyzeAttachedDocuments: 'გთხოვთ, გაანალიზოთ მიმაგრებული დოკუმენტები:',
  messageSendFailed: 'შეტყობინების გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან.',
  actionPlan: {
    noActionPlan: 'საგეგმო გეგმა მიუწვდომელია',
    noActionPlanDesc: 'კლინიკური რეკომენდაციები გამოჩნდება გენერირების შემდეგ.',
    title: 'კლინიკური მოქმედების გეგმა',
    aiEnhanced: 'AI-ით გაძლიერებული',
    subtitle: 'მტკიცებულებებზე დაფუძნებული მკურნალობის რეკომენდაციები და მოვლის პროტოკოლები',
    copy: 'კოპირება',
    copied: 'კოპირებულია!',
    export: 'ექსპორტი',
    showRaw: 'ნედლი ტექსტის ჩვენება',
    hideRaw: 'ნედლი ტექსტის დამალვა',
    rawContentTitle: 'მოქმედების გეგმის ნედლი კონტენტი',
    priority: {
      critical: 'კრიტიკული',
      high: 'მაღალი',
      medium: 'საშუალო',
      low: 'დაბალი'
    },
    issueAddressed: 'პრობლემა მოგვარდება',
    clickToViewDetails: 'დააკლიკეთ დეტალების სანახავად'
  },
  specialtyTitles: {
    cardiologyExpert: 'კარდიოლოგიის AI ექსპერტი',
    obgynExpert: 'მეანობა-გინეკოლოგიის AI ექსპერტი',
    medicalExpert: 'სამედიცინო AI ექსპერტი'
  },
  specialtySubtitles: {
    cardiology: 'გულ-სისხლძარღვთა მოვლის მოწინავე დახმარება',
    obgyn: 'ქალთა ჯანმრთელობა და რეპროდუქციული მედიცინა',
    medical: 'სამედიცინო დახმარება ფართო სპექტრისთვის'
  },
  quickActions: {
    caseDesc: 'დაიწყეთ პაციენტის შემთხვევის ანალიზი AI-ის დახმარებით',
    calculatorsDesc: 'მოიპოვეთ წვდომა კლინიკურ კალკულატორებსა და რისკის შეფასებებზე',
    guidelinesDesc: 'მოძებნეთ მტკიცებულებაზე დაფუძნებული სამედიცინო პროტოკოლები',
    discussionDesc: 'დაიწყეთ სამედიცინო კონსულტაცია AI-თან'
  },
  features: {
    aiPoweredAnalysis: 'გაძლიერებული სამედიცინო მსჯელობა და გადაწყვეტილების მხარდაჭერა',
    evidenceBasedDesc: 'კურირებულია 2.5 მილიონზე მეტი სამედიცინო წყაროსა და სახელმძღვანელოდან',
    realTimeDesc: 'მყისიერი პასუხები კლინიკური გადაწყვეტილებების მისაღებად',
    specialtyFocusedDesc: 'მორგებული ექსპერტიზა თქვენი სპეციალობისთვის'
  },
  welcomeTo: 'კეთილი იყოს თქვენი მობრძანება',
  liveAt: 'თარიღი/დრო',
  aiReady: 'AI მზადაა',
  recentCases: 'ბოლოდროინდელი შემთხვევები',
  startTypingOrSelectAction: 'დაიწყეთ ქვევით შეტყობინების აკრეფით ან აირჩიეთ მოქმედება ზემოთ',
  aiAssistantReady: 'AI ასისტენტი მზადაა',
  abg: {
    active: 'ABG ანალიზი აქტიურია',
    contextActive: 'დააზოტისა და სისხლის გაზების ანალიზის კონტექსტი აქტიურია',
    loading: 'კონტექსტი იტვირთება...',
    loaded: 'კონტექსტი ჩაიტვირთა! დასვით კითხვები ამ ABG ანალიზზე, ინტერპრეტაციაზე ან მკურნალობის რეკომენდაციებზე.',
    placeholder: 'იკითხეთ სისხლის გაზების ანალიზზე, ინტერპრეტაციაზე ან მკურნალობის რეკომენდაციებზე...'
  },
  patient: 'პაციენტი',
  connectionIssue: 'კავშირის პრობლემა',
  conversationHistory: 'საუბრის ისტორია',
  createCaseStudy: 'კეისის შექმნა'
};

export default chat; 