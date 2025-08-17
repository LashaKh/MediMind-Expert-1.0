export default {
  uploadTitle: 'დოკუმენტების ატვირთვა',
  uploadSubtitle: 'დაამატეთ სამედიცინო ლიტერატურა, კვლევითი ნაშრომები და კლინიკური დოკუმენტები თქვენს ცოდნის ბაზაში',
  dragDropText: 'გადმოიტანეთ ფაილები აქ, ან დააწკაპუნეთ არჩევისთვის',
  browseFiles: 'ფაილების დათვალიერება',
  supportedFormats: 'მხარდაჭერილი ფორმატები: PDF, Word, Text, Markdown, CSV',
  maxFileSize: 'მაქსიმალური ფაილის ზომა: {size}MB',
  maxFiles: 'მაქსიმუმ {count} ფაილი',
  selectFiles: 'ფაილების არჩევა',
  uploading: 'იტვირთება...',
  processing: 'მუშავდება...',
  complete: 'დასრულდა',
  error: 'შეცდომა',
  success: 'წარმატება',
  retry: 'ხელახლა ცდა',
  remove: 'წაშლა',
  retryAll: 'ყველა წარუმატებლის ხელახლა ცდა',
  clearErrors: 'შეცდომების გასუფთავება',
  title: 'სათაური',
  titlePlaceholder: 'შეიყვანეთ დოკუმენტის სათაური',
  description: 'აღწერა',
  descriptionPlaceholder: 'შეიყვანეთ დოკუმენტის აღწერა',
  tags: 'ტეგები',
  tagsPlaceholder: 'დაამატეთ ტეგები (დააჭირეთ Enter)',
  category: 'კატეგორია',
  selectCategory: 'აირჩიეთ კატეგორია',
  advancedOptions: 'დამატებითი პარამეტრები',
  showAdvancedOptions: 'დამატებითი პარამეტრების ჩვენება',
  hideAdvancedOptions: 'დამატებითი პარამეტრების დამალვა',
  initializingKnowledgeBase: 'პირადი ცოდნის ბაზის ინიციალიზაცია...',
  uploadSuccess: 'დოკუმენტები წარმატებით აიტვირთა!',
  uploadError: 'დოკუმენტების ატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა.',
  fileTypeError: 'ფაილის ტიპი არ არის მხარდაჭერილი: {type}. გთხოვთ, ატვირთოთ PDF, Word, ტექსტური ან CSV ფაილები.',
  fileSizeError: 'ფაილის ზომა აღემატება {size}MB ლიმიტს. გთხოვთ, აირჩიოთ უფრო პატარა ფაილი.',
  emptyFileError: 'ფაილი ცარიელია. გთხოვთ, აირჩიოთ სწორი ფაილი.',
  largeFileWarning: 'დიდი ფაილი აღმოჩენილია. მუშავება შეიძლება უფრო დიდხანს გაგრძელდეს.',
  imageFileWarning: 'დიდი სურათის ფაილი. შეკუმშვა შეიძლება დააჩქაროს მუშავება.',
  noFilesSelected: 'ფაილები არ არის არჩეული ატვირთვისთვის.',
  allFilesProcessed: 'ყველა ფაილი დამუშავებულია.',
  
  // Upload Modal - Progressive Steps
  modal: {
    title: 'დოკუმენტების ატვირთვა',
    subtitle: 'დაამატეთ სამედიცინო ლიტერატურა, კვლევითი ნაშრომები და კლინიკური დოკუმენტები თქვენს ცოდნის ბაზაში',
    
    // Step indicators
    steps: {
      select: 'არჩევა',
      configure: 'კონფიგურაცია', 
      upload: 'ატვირთვა',
      complete: 'დასრულება'
    },
    
    // Select step
    select: {
      title: 'გადმოიტანეთ ფაილები აქ',
      subtitle: 'ან დააწკაპუნეთ ფაილების არჩევისთვის თქვენი კომპიუტერიდან',
      selectFiles: 'ფაილების არჩევა',
      dropFiles: 'ჩაუშვით ფაილები აქ',
      supportedTypes: 'მხარდაჭერილი ფაილების ტიპები',
      maxSizeNote: 'მაქსიმალური ფაილის ზომა: {size}MB • მაქსიმალური ფაილები: {maxFiles}'
    },
    
    // Configure step
    configure: {
      title: 'დოკუმენტების კონფიგურაცია',
      filesSelected: '{count} ფაილი არჩეულია|{count} ფაილი არჩეულია',
      documentTitle: 'დოკუმენტის სათაური',
      documentTitleRequired: 'დოკუმენტის სათაური *',
      titlePlaceholder: 'შეიყვანეთ დოკუმენტის სათაური...',
      description: 'აღწერა',
      descriptionPlaceholder: 'დოკუმენტის შინაარსის მოკლე აღწერა...',
      category: 'კატეგორია',
      tags: 'ტეგები',
      tagsPlaceholder: 'დაამატეთ ტეგები მძიმით გამოყოფილი...',
      addMoreFiles: 'მეტი ფაილის დამატება',
      startUpload: 'ატვირთვის დაწყება'
    },
    
    // Upload step
    upload: {
      title: 'დოკუმენტების ატვირთვა',
      subtitle: 'თქვენი ფაილების მუშავება და ცოდნის ბაზაში დამატება...',
      uploading: 'იტვირთება...',
      complete: 'დასრულდა',
      failed: 'ვერ მოხერხდა'
    },
    
    // Complete step
    complete: {
      title: 'ატვირთვა დასრულდა!',
      subtitle: 'თქვენი დოკუმენტები წარმატებით დაემატა ცოდნის ბაზაში.',
      continueButton: 'ცოდნის ბაზაზე გადასვლა'
    },
    
    // Error handling
    errors: {
      vectorStoreInit: 'ცოდნის ბაზის ინიციალიზაცია ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა.',
      uploadFailed: '{count} ატვირთვა ვერ მოხერხდა|{count} ატვირთვა ვერ მოხერხდა'
    }
  },

  // Categories
  categories: {
    'research-papers': '🔬 კვლევითი ნაშრომები',
    'clinical-guidelines': '🏥 კლინიკური სახელმძღვანელოები',
    'case-studies': '👤 შემთხვევის კვლევები',
    'medical-images': '🩻 სამედიცინო სურათები',
    'lab-results': '🧪 ლაბორატორიული შედეგები',
    'patient-education': '📖 პაციენტის განათლება',
    'protocols': '📋 პროტოკოლები',
    'reference-materials': '📚 საცნობარო მასალები',
    'personal-notes': '📝 პირადი ჩანაწერები',
    'other': '📄 სხვა'
  },
  
  // File types
  fileTypes: {
    'pdf': 'PDF დოკუმენტი',
    'word-doc': 'Word დოკუმენტი (.doc)',
    'word-docx': 'Word დოკუმენტი (.docx)',
    'excel': 'Excel',
    'text': 'ტექსტური ფაილი',
    'markdown': 'Markdown ფაილი',
    'csv': 'CSV ფაილი',
    'unknown': 'უცნობი'
  },
  
  // Status
  status: {
    pending: 'მოლოდინში',
    uploading: 'იტვირთება',
    processing: 'მუშავდება',
    complete: 'დასრულდა',
    success: 'წარმატება',
    error: 'შეცდომა',
    ready: 'მზად არის'
  },
  
  // DocumentList translations
  list: {
    noDocuments: 'დოკუმენტები ჯერ არ არის ატვირთული',
    noDocumentsFiltered: 'დოკუმენტები ვერ მოიძებნა',
    uploadFirstDocument: 'ატვირთეთ თქვენი პირველი სამედიცინო დოკუმენტი AI-ზე დაფუძნებული ანალიზისა და ინტელექტუალური დოკუმენტების მართვისთვის.',
    adjustSearchCriteria: 'სცადეთ საძიებო კრიტერიუმების ან ფილტრების შეცვლა რომ იპოვოთ ის, რასაც ეძებთ.',
    uploadFirstButton: 'ატვირთეთ თქვენი პირველი დოკუმენტი',
    showing: 'ნაჩვენებია',
    of: '-დან',
    documents: 'დოკუმენტები',
    moreResultsAvailable: 'მეტი შედეგი ხელმისაწვდომია',
    showingFirst: 'ნაჩვენებია პირველი {count} დოკუმენტი. გამოიყენეთ ფილტრები შედეგების შესაზღუდად.'
  },
  
  // DocumentItem translations
  item: {
    viewDetails: 'დოკუმენტის დეტალების ნახვა',
    downloadDocument: 'დოკუმენტის ჩამოტვირთვა',
    deleteDocument: 'დოკუმენტის წაშლა',
    processingError: 'მუშავების შეცდომა',
    moreTagsIndicator: '+{count} მეტი',
    statusLabels: {
      completed: 'მზად არის',
      processing: 'მუშავდება',
      pending: 'მოლოდინში',
      failed: 'შეცდომა'
    }
  },
  
  // Status messages
  statuses: {
    pending: 'ატვირთვის მოლოდინში',
    uploading: 'ფაილი იტვირთება...',
    processing: 'დოკუმენტი მუშავდება...',
    complete: 'მუშავება დასრულდა',
    success: 'წარმატებით აიტვირთა',
    error: 'ატვირთვა ვერ მოხერხდა'
  },
  
  // Action messages
  selectedFiles: '{count} ფაილი არჩეულია|{count} ფაილი არჩეულია',
  filesUploaded: '{count} აიტვირთა',
  filesFailed: '{count} ვერ მოხერხდა',
  filesSelected: '{count} ფაილი არჩეულია|{count} ფაილი არჩეულია',
  uploadButton: '{count} დოკუმენტის ატვირთვა|{count} დოკუმენტის ატვირთვა',
  retryCount: 'ხელახლა ცდა #{count}',
  retryInstruction: 'დააწკაპუნეთ ხელახლა ცდის ღილაკზე ან სცადეთ ხელახლა ატვირთვა.',
  uploadSuccessMessage: 'ატვირთვა წარმატებული! დამუშავება მიმდინარეობს ფონურ რეჟიმში...',
  clearAll: 'ყველას გასუფთავება',
  close: 'დახურვა',
  cancel: 'გაუქმება',
  dropFiles: 'ჩააგდეთ ფაილები აქ',
  
  // Statistics section
  stats: {
    totalDocuments: 'ჯამური დოკუმენტები',
    completed: 'დასრულებული',
    processing: 'მუშავდება',
    storageUsed: 'გამოყენებული საცავი'
  },
  
  // Actions
  actions: {
    uploadDocument: 'დოკუმენტის ატვირთვა',
    refresh: 'განახლება',
    searchPlaceholder: 'დოკუმენტების ძიება...'
  },

  // File upload section from hardcoded strings
  fileUpload: {
    types: {
      'medical-images': 'სამედიცინო სურათი',
      'lab-results': 'ლაბორატორიული შედეგი', 
      'referral-letters': 'მიმართვის წერილი',
      'discharge-summaries': 'გამწერი ეპიკრიზი',
      'diagnostic-reports': 'დიაგნოსტიკური დასკვნა',
      'other': 'დოკუმენტი'
    },
    messages: {
      dropFiles: 'ჩაურთეთ ფაილები აქ',
      clickOrDrag: 'დააჭირეთ ან გადმოიტანეთ ფაილები ასატვირთად',
      processingFailed: 'მუშავება ვერ მოხერხდა'
    }
  }
}; 