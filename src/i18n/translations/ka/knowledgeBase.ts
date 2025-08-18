export const knowledgeBase = {
  // Main page headers
  title: 'ცოდნის ბაზა',
  subtitle: 'კარდიოლოგიის რესურსები',
  description: 'მიაწვდოთ კომპლექსური სამედიცინო ლიტერატურა, მტკიცებულებაზე დაფუძნებული წესები და თქვენი პირადი დოკუმენტების კოლექცია AI-ზე დაფუძნებული ინსაიტებით.',
  
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
    description: 'აღწერა',
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
  
  // Curated Knowledge Base Settings
  curatedSettings: {
    searchPlaceholder: 'ძიება რესურსებში, ავტორებში, ორგანიზაციებში...',
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
    description: 'აღწერა',
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
  }
};

export default knowledgeBase; 