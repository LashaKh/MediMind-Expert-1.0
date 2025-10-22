export const knowledgeBase = {
  // Main page headers
  title: 'ცოდნის ბაზა',
  subtitle: 'კარდიოლოგიის რესურსები',
  description: 'მიიღეთ წვდომა ყოვლისმომცველ სამედიცინო ლიტერატურაზე, მტკიცებულებებზე დაფუძნებულ სახელმძღვანელოებზე და თქვენს პირად დოკუმენტების კოლექციაზე AI-ის მიერ გაძლიერებული ინსაიტებით.',
  
  // Root level keys for KnowledgeBaseSelector
  personal: 'პირადი',
  curated: 'კურირებული',
  
  // Feature highlights
  evidenceBased: 'მტკიცებულებაზე დაფუძნებული',
  aiPoweredSearch: 'AI-ზე დაფუძნებული ძიება',
  securePrivate: 'უსაფრთხო და პირადი',
  
  // Quick stats
  quickStats: 'სწრაფი სტატისტიკა',
  medicalGuidelines: 'სამედიცინო სახელმძღვანელოები',
  researchPapers: 'კვლევითი ნაშრომები',
  clinicalProtocols: 'კლინიკური პროტოკოლები',
  
  // Tabs
  curatedKnowledge: 'კურირებული ცოდნა',
  curatedKnowledgeDesc: 'სამედიცინო ლიტერატურა და სახელმძღვანელოები',
  personalLibrary: 'პირადი ბიბლიოთეკა',
  personalLibraryDesc: 'თქვენი დოკუმენტები და ჩანაწერები',
  badgeVerified: 'დამოწმებული',
  sourcesCount: '2.5მლნ+ წყარო',
  badgeReady: 'მზადაა',
  badgeEmpty: 'ცარიელია',
  personalCount: '{{count}} დოკუმენტი',
  uploadToEnable: 'ატვირთეთ გასააქტიურებლად',
  aiVerified: 'AI დამოწმება',
  selectionInfluenceNotice: 'ცოდნის ბაზის არჩევანი გავლენას ახდენს AI პასუხების სიზუსტესა და სიღრმეზე',

  // Tooltip content
  curatedTooltipTitle: 'სამედიცინო ცოდნის ბაზა',
  curatedTooltipDesc: 'AI უპასუხებს კარდიოლოგიის დადგენილი ცოდნის გამოყენებით, რომელიც მიღებულია სამედიცინო ექსპერტებისა და სანდო წყაროებისგან.',
  personalTooltipTitle: 'თქვენი დოკუმენტები',
  personalTooltipDesc: 'AI უპასუხებს თქვენ მიერ ატვირთული დოკუმენტებისა და პირადი ფაილების ინფორმაციის გამოყენებით.',
  
  // Document management
  documents: {
    totalDocuments: 'სულ დოკუმენტები',
    completed: 'დასრულებული',
    processing: 'მუშავდება',
    storageUsed: 'გამოყენებული მეხსიერება',
    
    // Upload section
    uploadDocument: 'დოკუმენტის ატვირთვა',
    refresh: 'განახლება',
    searchDocuments: 'დოკუმენტების ძიება',
    
    // Filters
    allStatus: 'ყველა სტატუსი',
    ready: 'მზად არის',
    pending: 'მუშავდება',
    error: 'შეცდომა',
    
    // Advanced filters
    advanced: 'დამატებითი',
    allCategories: 'ყველა კატეგორია',
    from: 'დან',
    to: 'მდე',
    
    // Results
    showingResults: 'ნაჩვენებია',
    of: '-დან',
    documentsText: 'დოკუმენტები',
    showingAll: 'ყველას ჩვენება',
    
    // Upload process
    dragDropText: 'ჩაუშვით ფაილები აქ ან დააწკაპუნეთ არჩევისთვის',
    selectFiles: 'ფაილების არჩევა',
    uploadButton: 'ატვირთვა',
    maxFileSize: 'მაქს. ფაილის ზომა: {size}MB',
    supportedFormats: 'მხარდაჭერილი ფორმატები',
    
    // File actions
    retry: 'ხელახლა ცდა',
    remove: 'წაშლა',
    preview: 'წინასწარი ნახვა',
    
    // File metadata
    fileName: 'ფაილის სახელი',
    description: 'დოკუმენტის აღწერა',
    category: 'კატეგორია',
    
    // List view
    uploadFirstButton: 'პირველი დოკუმენტის ატვირთვა',
    list: {
      showing: 'ნაჩვენებია',
      of: '-დან',
      documents: 'დოკუმენტები',
      uploadFirstButton: 'პირველი დოკუმენტის ატვირთვა'
    }
  },
  
  // Filters and sorting
  filters: {
    all: 'ყველა',
    featured: 'გამორჩეული',
    trending: 'ტრენდული',
    bookmarked: 'ნიშნული',
    recent: 'ბოლოდროინდელი',
  },

  sorting: {
    relevance: 'მნიშვნელობა',
    rating: 'უმაღლესი რეიტინგი',
    citations: 'ყველაზე ციტირებული',
    views: 'ყველაზე ნანახი',
    year: 'უახლესი',
    trending: 'ტრენდული',
  },

  resourcesFound: 'რესურსი ნაპოვნია',

  // Curated Knowledge Base Settings
  curatedSettings: {
    searchPlaceholder: 'მოძებნეთ რესურსები, ავტორები, ორგანიზაციები...',
    sortByTitle: 'დალაგება სათაურით',
    sortByYear: 'დალაგება წლით',
    sortByCategory: 'დალაგება კატეგორიით',
    sortByOrganization: 'დალაგება ორგანიზაციით',
    
    // View modes
    gridView: 'ქსელის ხედი',
    listView: 'სიის ხედი',
    
    // Search results
    searchingFor: 'ძიება:',
    noResultsFound: 'შედეგები ვერ მოიძებნა',
    tryDifferentTerms: 'სცადეთ განსხვავებული საძიებო ტერმინები',
    
    // Resource details
    authors: 'ავტორები',
    organization: 'ორგანიზაცია',
    year: 'წელი',
    category: 'კატეგორია',
    viewDocument: 'დოკუმენტის ნახვა',
    downloadPDF: 'PDF-ის ჩამოტვირთვა',
    
    // Results summary
    resourcesFound: 'ნაპოვნია {count} კარდიოლოგიის რესურსი'
  },
  
  // Vector Store Management
  vectorStore: {
    createVectorStore: 'ვექტორული მეხსიერების შექმნა',
    managingVectorStore: 'ვექტორული მეხსიერების მართვა',
    loading: 'იტვირთება...',
    noVectorStore: 'ვექტორული მეხსიერება ვერ მოიძებნა',
    createOne: 'შექმენით',
    refreshData: 'მონაცემების განახლება',
    deleteVectorStore: 'ვექტორული მეხსიერების წაშლა',
    delete: 'წაშლა',
    
    // Creation form
    vectorStoreName: 'ვექტორული მეხსიერების სახელი',
    vectorStoreNamePlaceholder: 'ჩემი სამედიცინო ცოდნის ბაზა',
    description: 'ვექტორული მეხსიერების აღწერა',
    descriptionPlaceholder: 'სამედიცინო დოკუმენტებისა და კვლევითი ნაშრომების პირადი კოლექცია',
    cancel: 'გაუქმება',
    create: 'შექმნა',
    
    // Status indicators
    ready: 'მზად არის',
    processing: 'მუშავდება',
    pending: 'მოლოდინში',
    failed: 'ვერ მოხერხდა',
    unknown: 'უცნობი'
  },
  
  // Document Details Modal
  details: {
    documentDetails: 'დოკუმენტის დეტალები',
    close: 'დახურვა',
    fileInformation: 'ფაილის ინფორმაცია',
    uploadedOn: 'ატვირთვის თარიღი',
    fileSize: 'ფაილის ზომა',
    processingStatus: 'მუშავების სტატუსი',

    // Processing status
    statusReady: 'მზად არის',
    statusProcessing: 'მუშავდება',
    statusPending: 'მოლოდინში',
    statusFailed: 'ვერ მოხერხდა',

    // Actions
    reprocess: 'ხელახლა მუშავება',
    downloadOriginal: 'ორიგინალის ჩამოტვირთვა',
    deleteDocument: 'დოკუმენტის წაშლა'
  },

  // Curated page texts
  book: 'წიგნი',
  guideline: 'სახელმძღვანელო',
  featured: 'გამორჩეული',
  trending: 'ტრენდული',
  medicalBook: 'სამედიცინო წიგნი',
  clinicalGuideline: 'კლინიკური სახელმძღვანელო',
  authors: 'ავტორები',
  citations: 'ციტირებები',
  views: 'ნახვები',
  more: 'მეტი',
  min: 'წთ',
  updated: 'განახლებულია',
  loadingKnowledgeBase: 'ცოდნის ბაზა იტვირთება',
  preparingResources: 'თქვენი სამედიცინო რესურსები მზადდება...',
  avg: 'საშუალო',
  noResourcesFound: 'რესურსები ვერ მოიძებნა',
  couldntFindResources: 'ვერ მოვიძიეთ რესურსები რომლებიც შეესაბამება',
  clearSearchBrowseAll: 'ძიების გასუფთავება და ყველა რესურსის დათვალიერება',
  trySearchingFor: 'სცადეთ ძიება',
  noResourcesMatchFilters: 'არცერთი რესურსი არ შეესაბამება თქვენს ფილტრებს. სცადეთ ძიების კრიტერიუმების შეცვლა.',
  topics: 'თემები',
  resourceStats: 'რესურსის სტატისტიკა',
  rating: 'რეიტინგი',
  difficulty: 'სირთულე',
  readTime: 'წაკითხვის დრო',
  openResource: 'რესურსის გახსნა',
  save: 'შენახვა',
  share: 'გაზიარება',
  lastUpdated: 'ბოლოს განახლებულია',
  beginner: 'დამწყები',
  intermediate: 'საშუალო',
  advanced: 'მაღალი',

  // Personal Library Premium texts
  totalLibrary: 'სულ ბიბლიოთეკაში',
  documentsCount: 'დოკუმენტი',
  ready: 'მზადაა',
  processed: 'დამუშავებული',
  processing: 'მუშავდება',
  inQueue: 'რიგში',
  storage: 'მეხსიერება',
  totalUsed: 'გამოყენებული',
  uploadDocuments: 'დოკუმენტების ატვირთვა',
  refresh: 'განახლება',
  monitor: 'მონიტორინგი',
  searchYourKnowledgeBase: 'მოძებნეთ თქვენს ცოდნის ბაზაში...',
  sortBy: 'დალაგება',
  name: 'სახელი',
  date: 'თარიღი',
  size: 'ზომა',
  type: 'ტიპი',
  advancedFilters: 'დამატებითი ფილტრები',
  quickFilters: 'სწრაფი ფილტრები',
  favorites: 'რჩეულები',
  recent: 'ბოლოდროინდელი',
  completed: 'დასრულებული',
  researchPapers: 'კვლევითი ნაშრომები',
  clinicalGuidelines: 'კლინიკური სახელმძღვანელოები',
  caseStudies: 'კლინიკური შემთხვევები',
  protocols: 'პროტოკოლები',
  referenceMaterials: 'სამითითო მასალები',
  personalNotes: 'პირადი ჩანაწერები',
  other: 'სხვა',
  pdf: 'PDF',
  images: 'სურათები',
  documentsType: 'დოკუმენტები',
  spreadsheets: 'ცხრილები',
  yourKnowledgeBaseAwaits: 'თქვენი ცოდნის ბაზა გელოდებათ',
  startBuildingLibrary: 'დაიწყეთ თქვენი პირადი სამედიცინო ცოდნის ბიბლიოთეკის შექმნა პირველი დოკუმენტის ატვირთვით',
  uploadYourFirstDocument: 'ატვირთეთ პირველი დოკუმენტი',
  of: '-დან',
  documentsText: 'დოკუმენტები',
  showingFirst: 'ნაჩვენებია პირველი',
  tags: 'თეგები',
  addTagsToFilter: 'დაამატეთ თეგები ფილტრაციისთვის...',
  dateRange: 'თარიღის დიაპაზონი',
  from: 'დან',
  to: 'მდე',
  fileSize: 'ფაილის ზომა',
  selectAll: 'ყველას არჩევა',
  deselectAll: 'ყველას მოხსნა',
  clearSelection: 'არჩევანის გასუფთავება',
  documentsSelected: 'დოკუმენტი არჩეულია',
  noDocumentsMatchSearch: 'არცერთი დოკუმენტი არ შეესაბამება თქვენს ძიებას',
  tryAdjustingCriteria: 'სცადეთ ძიების კრიტერიუმების ან ფილტრების შეცვლა იმისთვის, რომ იპოვოთ რასაც ეძებთ.'
};

export default knowledgeBase; 