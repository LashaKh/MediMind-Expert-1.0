const abg = {
  history: {
    title: 'ABG ისტორია',
    resultsCount: '{{count}} შედეგი',
    filteredByPatient: 'ფილტრი პაციენტით',
    comprehensiveView: 'სრულყოფილი ისტორიის ნახვა',
    updatedAt: 'განახლდა {{time}}',
    select: 'არჩევა',
    newAnalysis: 'ახალი ანალიზი',
    bulk: {
      selectHelp: 'აირჩიეთ ელემენტები წაშლის ან ექსპორტისთვის',
      selectedResults: 'არჩეულია {{count}} შედეგი',
      allSelected: 'ყველა არჩეულია ({{count}})',
      selectAllCount: 'ყველას არჩევა ({{count}})',
      clearSelection: 'არჩევის გასუფთავება',
      exportSelected: 'არჩეულის ექსპორტი',
      deleteSelected: 'არჩეულის წაშლა'
    },
    cards: {
      total: 'სულ',
      recent: 'ახლახან',
      trend: 'ტენდენცია',
      weeklyAvg: 'საშ. კვირაში'
    },
    progress: {
      activity: 'ანალიზის აქტივობა',
      vsAverage: '{{percent}}% საშუალოს მიმართ',
      lastUpdated: 'ბოლოს განახლდა: {{time}}'
    }
  },
  workflow: {
    aria: {
      progress: 'არტერიული სისხლის აირების ანალიზის პროგრესი'
    },
    progressComplete: '{{percent}}% დასრულებულია',
    steps: {
      uploadStep: {
        label: 'ატვირთვა',
        description: 'აირჩიეთ აერგაზების ანგარიში'
      },
      analysis: {
        label: 'ანალიზი',
        description: 'AI-ით ვიზუალური დამუშავება'
      },
      interpretation: {
        label: 'ინტერპრეტაცია',
        description: 'კლინიკური ანალიზი'
      },
      actionPlan: {
        label: 'ქმედების გეგმა (არასავალდებულო)',
        description: 'მკურნალობის რეკომენდაციები'
      }
    },
    subphases: {
      extraction: 'ტექსტის ამოღება',
      interpretation: 'კლინიკური ანალიზი'
    },
    completeTitle: 'ანალიზი დასრულდა!',
    error: 'დამუშავების შეცდომა',
    nextSteps: 'შემდეგი ნაბიჯები'
  },
  delete: {
    titleOne: 'წაშლა ABG შედეგის?',
    titleMany: 'წაშლა {{count}} ABG შედეგის?',
    cannotUndo: 'ეს მოქმედება შეუქცევადია',
    deleting: 'იშლება...',
    complete: 'წაშლა დასრულებულია',
    successMany: 'წარმატებით წაიშალა {{count}} შედეგი',
    failed: 'წაშლა ვერ მოხერხდა',
    errorsTitle: 'შეცდომები:',
    completedIn: 'დასრულდა {{ms}}მწ-ში',
    cannotDelete: 'შეუძლებელია წაშლა',
    pleaseNote: 'გთხოვთ გაითვალისწინოთ',
    previewTitle: 'რა წაიშლება:',
    preview: {
      results: 'შედეგები',
      dataSize: 'მონაცემების ზომა',
      images: 'სურათები',
      daySpan: 'დღეების შუალედი',
      listTitle: 'წასაშლელი შედეგები:',
      imageTag: 'სურათი'
    },
    deleteOne: 'შედეგის წაშლა',
    deleteMany: '{{count}} შედეგის წაშლა'
  }
  ,
  export: {
    title: 'ABG შედეგების ექსპორტი',
    format: 'ექსპორტის ფორმატი',
    dateRange: 'თარიღების შუალედი (არჩევითი)',
    startDate: 'დაწყების თარიღი',
    endDate: 'დასრულების თარიღი',
    clearDateRange: 'თარიღების გასუფთავება',
    include: 'ჩასართავი ველები',
    includeFields: {
      patientInfo: 'პაციენტის ინფორმაცია',
      patientInfoDesc: 'სახელები, დაბ. თარიღი, MRN',
      interpretation: 'კლინიკური ინტერპრეტაცია',
      interpretationDesc: 'AI-ს მიერ გენერირებული კლინიკური ანალიზი',
      actionPlan: 'ქმედების გეგმები',
      actionPlanDesc: 'მკურნალობის რეკომენდაციები',
      images: 'სურათების URL-ები',
      imagesDesc: 'ატვირთული სურათების ბმულები'
    },
    summary: {
      title: 'ექსპორტის შეჯამება',
      results: 'შედეგები',
      resultsOf: '{{filtered}} / {{total}} შედეგი',
      estimatedSize: 'დაახლოებითი ზომა',
      includedFields: 'ჩასმული ველები'
    },
    failed: 'ექსპორტი ვერ მოხერხდა',
    success: 'ექსპორტი წარმატებულია',
    downloaded: 'თქვენი ფაილი ჩამოიტვირთა.',
    exporting: 'ექსპორტი...', 
    export: 'ექსპორტი {{format}}',
    tips: {
      json: 'JSON ფორმატი შეიცავს მთლიან მონაცემებს სტრუქტურის შენარჩუნებით',
      csv: 'CSV ფორმატი გამოსადეგია ცხრილებისთვის',
      large: 'დიდი ექსპორტი შეიძლება რამდენიმე წამი გაგრძელდეს'
    }
  }
  ,
  results: {
    title: 'ABG შედეგები',
    export: 'ექსპორტი',
    searchPlaceholder: 'ძიება შედეგებში...', 
    sort: {
      newestfirst: 'ჯერ ახალი',
      oldestfirst: 'ჯერ ძველი',
       "typea-z": 'ტიპი A-Z',
      highestconfidence: 'უმაღლესი სანდოობა'
    },
    filters: {
      title: 'ფილტრები',
      button: 'ფილტრები',
      type: 'ტიპი',
      allTypes: 'ყველა ტიპი',
      types: {
        arterial: 'არტერიული სისხლის გაზები',
        venous: 'ვენური სისხლის გაზები'
      },
      dateRange: 'თარიღების შუალედი',
      startDate: 'დაწყების თარიღი',
      endDate: 'დასრულების თარიღი',
      hasInterpretation: 'ინტერპრეტაცია აქვს',
      hasActionPlan: 'ქმედების გეგმა აქვს'
    },
    showing: 'ნაჩვენებია {{count}} შედეგი',
    showingMore: 'ნაჩვენებია {{count}} შედეგი (მეტი სანახავად დაასკროლეთ)',
    loadFailed: 'შედეგების ჩატვირთვა ვერ მოხერხდა',
    loadingMore: 'მეტი შედეგის ჩატვირთვა...', 
    badges: {
      interpreted: 'ინტერპრეტირებული',
      actionPlan: 'ქმედების გეგმა'
    },
    empty: {
      title: 'შედეგები ვერ მოიძებნა',
      tips: 'სცადეთ ძიების ან ფილტრების შეცვლა',
      noResults: 'ABG შედეგები ჯერ არ არის შექმნილი'
    },
    end: 'შედეგების ბოლო',
    na: 'N/A'
  }
  ,
  filtersAdvanced: {
    title: 'გაფართოებული ფილტრები',
    activeCount: '{{count}} აქტიური',
    clear: 'წმენდა',
    patient: 'პაციენტი',
    allPatients: 'ყველა პაციენტი',
    analysisType: 'ანალიზის ტიპი',
    quickDates: 'სწრაფი თარიღები',
    selectPeriod: 'აირჩიეთ პერიოდი...', 
    datePresets: {
      1: 'დღეს',
      3: 'ბოლო 3 დღე',
      7: 'ბოლო კვირა',
      30: 'ბოლო თვე',
      90: 'ბოლო 3 თვე'
    },
    statusFilters: 'სტატუსის ფილტრები',
    presets: {
      recent: { name: 'ბოლო ანალიზები' },
      pending: { name: 'გადახედვის მოლოდინში' },
      completed: { name: 'დასრულებული' },
      arterial: { name: 'მხოლოდ არტერიული' },
      thisMonth: { name: 'ეს თვე' }
    },
    saveSearch: {
      title: 'ძიების შენახვა',
      saveCurrent: 'მიმდინარე შენახვა',
      placeholder: 'ძიების სახელი...' 
    },
    savedSearches: 'შენახული ძიებები'
  }
  ,
  analysis: {
    loading: {
      title: 'AI ანალიზი მიმდინარეობს',
      subtitle: 'ჩვენი მოწინავე AI აანალიზებს თქვენს სისხლის გაზების ანგარიშს უახლესი ხედვის ტექნოლოგიით.'
    },
    error: {
      title: 'ანალიზი ვერ შესრულდა'
    },
    empty: 'ანალიზის შედეგები არ არის ხელმისაწვდომი',
    header: {
      title: 'ანალიზი დასრულებულია',
      subtitle: 'AI-ის მიერ შესრულებული სისხლის აირების ანალიზის შედეგები'
    },
    waitingData: 'სისხლის აირების ანალიზის შედეგები გამოჩნდება დამუშავების შემდეგ...', 
    moreValues: '... და კიდევ {{count}} მნიშვნელობა',
    edit: {
      title: 'ანალიზის რედაქტირება',
      reanalyzing: 'გადახედვა მიმდინარეობს...', 
      save: 'შენახვა და გადახედვა',
      placeholder: 'შეიყვანეთ ანალიზის ტექსტი...' 
    },
    raw: {
      title: 'უწყვეტი ანალიზის მონაცემები',
      badge: 'AI მიერ გენერირებული',
      reviewHint: 'გადახედეთ და საჭიროების შემთხვევაში ჩაასწორეთ'
    },
    linesTotal: '{{count}} ხაზი სულ',
    parameters: {
      title: 'სისხლის აირების პარამეტრები'
    },
    complete: {
      title: 'სრული ანალიზი'
    }
    ,
    backToUpload: 'დაბრუნება ატვირთვაზე',
    getInterpretation: 'კლინიკური ინტერპრეტაციის მიღება'
  }
  ,
  common: {
    show: 'ჩვენება',
    hide: 'დამალვა',
    clickToExpand: 'დააჭირეთ გასაფართოებლად'
  }
  ,
  interpretation: {
    title: 'კლინიკური ინტერპრეტაცია',
    subtitle: 'AI-ს მიერ გენერირებული კლინიკური ანალიზი',
    summary: 'კლინიკური შეჯამება:',
    waiting: 'კლინიკური ინტერპრეტაცია გამოჩნდება ანალიზის შემდეგ...' 
  }
  ,
  trends: {
    tabs: {
      volume: 'ანალიზების რაოდენობრივი ტრენდები',
      quality: 'ხარისხის მეტრიკები',
      performance: 'წარმადობის ანალიტიკა',
      distribution: 'ანალიზების განაწილება'
    },
    descriptions: {
      volume: 'დღიური ანალიზების რაოდენობა დროში',
      quality: 'სანდოობის და წარმატების ტენდენციები',
      performance: 'დამუშავების დროის ტენდენციები',
      distribution: 'ტიპებისა და ხარისხის განაწილება'
    },
    volume: {
      dailyTitle: 'დღიური ანალიზების მოცულობა',
      lineTitle: 'დღეში შესრულებული ანალიზების რაოდენობა',
      statsTitle: 'მოცულობის სტატისტიკა',
      peakDaily: 'პიკი დღეში',
      dailyAverage: 'დღიური საშუალო',
      total: '{{count}} სულ',
      subtitle: 'ანალიზები შერჩეულ პერიოდში'
    },
    quality: {
      title: 'ხარისხის ტენდენციები',
      confidenceTitle: 'საშ. სანდოობის ქულა (%)',
      successTitle: 'წარმატების მაჩვენებელი',
      successLine: 'წარმატების მაჩვენებელი (%)'
    },
    performance: {
      title: 'დამუშავების დრო',
      lineTitle: 'საშ. დამუშავების დრო (მმწ)',
      metrics: 'წარმადობის მეტრიკები',
      fastest: 'უადრეს (მმწ)',
      slowest: 'უდროესი (მმწ)'
    },
    distribution: {
      typesTitle: 'ანალიზების ტიპები',
      typeLine: 'ტიპების განაწილება',
      confidenceTitle: 'სანდოობის განაწილება',
      confidenceLine: 'სანდოობის ქულის განაწილება'
    },
    insights: {
      title: 'ძირითადი მიმოხილვა',
      volume: 'მოცულობის ტრენდი',
      increasing: 'ანალიზების მოცულობა დროთა განმავლობაში იზრდება',
      stable: 'ანალიზების მოცულობა სტაბილურია ან მცირდება',
      quality: 'ხარისხის ქულა',
      avgConfidence: 'საშ. სანდოობა: {{val}}%',
      performance: 'წარმადობა',
      avgProcessing: 'საშ. დამუშავება: {{ms}}მმწ'
    }
  }
  ,
  final: {
    comprehensiveInsights: 'თქვენი ABG ანალიზი მზად არის ყოვლისმომცველი ხედვით',
    premium: 'პრემიუმი',
    aiClinicalConsultation: 'AI კლინიკური კონსულტაცია',
    selectActionPlan: 'ქმედების გეგმის არჩევა',
    analysisComplete: 'ანალიზი: დასრულებულია',
    accuracy: 'სიზუსტე: 99.8%',
    backToResults: 'დაბრუნება შედეგებზე'
  }
  ,
  actionPlan: {
    creating: 'ქმედების გეგმის შექმნა',
    generating: 'პერსონალიზებული მკურნალობის რეკომენდაციები და მოვლის პროტოკოლები თქვენი ანალიზის შედეგებზე დაფუძნებით.',
    failed: 'ქმედების გეგმის გენერაცია ვერ შესრულდა',
    retry: 'ხელახლა ცდა',
    none: 'ქმედების გეგმა არ არის ხელმისაწვდომი',
    title: 'ქმედების გეგმა',
    subtitle: 'პერსონალიზებული რეკომენდაციები და მოვლის პროტოკოლები',
    total: 'სულ მოქმედებები',
    priority: 'პრიორიტეტი',
    completed: 'შესრულებულია',
    progress: 'მიმდინარეობა',
    overallProgress: 'საერთო პროგრესი',
    clinicalGoals: 'კლინიკური მიზნები',
    clinicalGoalsSubtitle: 'სამიზნე შედეგები და მკურნალობის ამოცანები'
  }
  ,
  selector: {
    title: 'აირჩიეთ ქმედების გეგმები AI კონსულტაციისთვის',
    subtitle: 'აირჩიეთ რომელი ქმედების გეგმები შევიდეს თქვენს AI კონსულტაციაში',
    selectAll: 'ყველას არჩევა',
    deselectAll: 'არჩევის მოხსნა',
    selectedCount: 'არჩეულია {{selected}} {{total}}-დან',
    noItems: 'ქმედების გეგმის ელემენტები ვერ მოიძებნა',
    selectedForConsult: 'AI კონსულტაციისთვის არჩეულია {{count}} ელემენტი',
    selectForConsult: 'აირჩიეთ ქმედების გეგმები კონსულტაციისთვის',
    aiConsult: 'AI კონსულტაცია ({{count}})'
  }
  ,
  search: {
    intelligentFiltering: 'ჭკვიანური ABG ფილტრაცია AI-ის დახმარებით',
    quickSearches: 'სწრაფი ძიებები:',
    clear: 'ძიების გასუფთავება',
    categories: 'ძიების კატეგორიები',
    categoriesDesc: 'გამოიკვლიეთ თქვენი ABG მონაცემების სხვადასხვა ასპექტები',
    query: 'ძიების შეკითხვა',
    resetAll: 'ყველა ფილტრის განულება',
    filtersActive: 'აქტიური ფილტრი(ები)',
    noFilters: 'ფილტრები არ არის გამოყენებული',
    searching: 'ძებნა...', 
    apply: 'ძიების გამოყენება',
    quick: 'სწრაფი ძიება',
    close: 'ფანჯრის დახურვა',
    aiPowered: 'AI‑ზე დაფუძნებული'
  }
  ,
  header: {
    medicalGradeAI: 'სამედიცინო დონის AI',
    viewHistoryAria: 'ანალიზების ისტორიის ნახვა',
    viewHistory: 'ისტორია',
    title: 'სისხლის აირების ანალიზი',
    subtitle: 'ატვირთეთ სისხლის გაზების ანგარიში მყისიერი AI ანალიზისთვის, დადასტურებული ინტერპრეტაციისა და ქმედების გეგმისთვის.'
  },
  title: 'სისხლის აირების ანალიზი',
  progress: 'სისხლის აირების ანალიზის პროგრესი',
  subtitle: 'AI-ზე დაფუძნებული სისხლის აირების ანალიზის შედეგები',
  waitingData: 'სისხლის აირების ანალიზის შედეგები გამოჩნდება დამუშავების შემდეგ...', 

  // Consolidated upload section (merged from three separate sections)
  upload: {
    // File upload interface
    title: 'არტერიული სისხლის გაზების ანგარიშის ატვირთვა',
    subtitle: 'გადმოათრიეთ სურათი აქ ან აირჩიეთ ფაილი',
    chooseFile: 'ფაილის არჩევა',
    takePhoto: 'ფოტოს გადაღება',
    formats: 'JPEG, PNG, WebP • მაქს. {{size}}MB',
    fileReady: 'ფაილი მზადაა ანალიზისთვის',
    progress: 'ატვირთვის პროგრესი',
    progressSr: '{{percent}} პროცენტი ატვირთულია',
    
    // Drag and drop
    drop: {
      title: 'გადმოუშვით ატვირთვისთვის',
      subtitle: 'გაათავისუფლეთ ატვირთვის დასაწყებად AI ანალიზისთვის'
    },
    
    // Blood gas type selection
    type: {
      title: 'სისხლის აირების ტიპი',
      subtitle: 'აირჩიეთ ანალიზის ტიპი'
    },
    types: {
      arterialDesc: 'სრულყოფილი ანალიზი',
      venousDesc: 'ალტერნატიული ანალიზის მეთოდი'
    },
    
    // Case context
    caseContext: {
      title: 'საქმის კონტექსტი (არასავალდებულო)',
      subtitle: 'დააკავშირეთ BG ანალიზი პაციენტის საქმესთან'
    },
    
    // Processing
    processing: {
      title: 'სურათის დამუშავება…',
      subtitle: 'AI ანალიზს ატარებს არტერიული სისხლის გაზების ანგარიშზე'
    },
    
    // Actions
    actions: {
      startAIAnalysis: 'AI ანალიზის დაწყება'
    },
    
    // Accessibility
    aria: {
      dropzone: 'არტერიული სისხლის აირების ანგარიშის ატვირთვა',
      removeFile: 'ფაილის ამოღება'
    },
    
    // Errors
    errors: {
      invalidType: 'გთხოვთ, აირჩიოთ სწორი სურათის ფაილი ({{types}})',
      maxSize: 'ფაილის ზომა უნდა იყოს {{size}}MB-ზე ნაკლები'
    }
  },
  context: {
    reportHeader: 'სისხლის აირების ანალიზის ანგარიში',
    laboratoryValuesHeader: 'ლაბორატორიული მნიშვნელობები და ანალიზი',
    clinicalInterpretationHeader: 'კლინიკური ინტერპრეტაცია',
    recommendedActionPlanHeader: 'რეკომენდებული ქმედების გეგმა',
    processingTime: 'დამუშავების დრო:',
    reportId: 'ანგარიშის ID:',
    unknownPatient: 'უცნობი პაციენტი',
    casePrefix: 'სისხლის აირების ანალიზის შემთხვევა - ',
    abgAnalysisPrefix: 'ABG ანალიზი - ',
    analysisWithInterpretationAndActionPlan: ' ანალიზი ინტერპრეტაციით და ქმედების გეგმით',
    analysis: ' ანალიზი',
    interpretationFor: 'სისხლის აირების ანალიზის ინტერპრეტაცია - ',
    medicalSpecialtyCardiology: 'კარდიოლოგია',
    priorityHigh: 'მაღალი',
    priorityMedium: 'საშუალო',
    tagBloodGasAnalysis: 'სისხლის-აირების-ანალიზი',
    tagInterpreted: 'ინტერპრეტირებული',
    tagActionPlan: 'ქმედების-გეგმა',
    noResultsAvailable: 'ABG შედეგები არ არის ხელმისაწვდომი.',
    summaryHeader: 'სისხლის აირების ანალიზის შეჯამება',
    totalResults: 'სულ შედეგები:',
    dateRange: 'თარიღების დიაპაზონი:',
    to: 'დან',
    resultOf: '--- შედეგი ',
    of: 'დან',
    clinicalContext: 'კლინიკური კონტექსტი:',
    userQuestion: 'მომხმარებლის შეკითხვა:',
    considerResultsPrompt: 'გთხოვთ, გაითვალისწინოთ ზემოთ მოცემული სისხლის აირების ანალიზის შედეგები ამ სამედიცინო შეკითხვაზე პასუხის გაცემისას. თუ შეკითხვა ეხება ABG შედეგებს, მიაწოდეთ კონკრეტული კლინიკური შეხედულებები ლაბორატორიული მნიშვნელობების, ინტერპრეტაციისა და რეკომენდებული მოქმედებების საფუძველზე.',
    keyValues: 'ძირითადი მნიშვნელობები:',
    interpretation: 'ინტერპრეტაცია:',
    clinicalConsultationRequest: 'კლინიკური კონსულტაციის მოთხოვნა:',
    consultationStagePostInterpretation: 'კონსულტაციის ეტაპი: პოსტ-ინტერპრეტაცია (ქმედების გეგმამდე)',
    availableInformation: 'ხელმისაწვდომი ინფორმაცია:',
    laboratoryValuesCheck: '- ლაბორატორიული მნიშვნელობები: ✓',
    clinicalInterpretationCheck: '- კლინიკური ინტერპრეტაცია: ✓',
    actionPlanNotGenerated: '- ქმედების გეგმა: ❌ (ჯერ არ არის გენერირებული)',
    clinicianRequest: 'კლინიცისტის მოთხოვნა:',
    consultationStageCompleteAnalysis: 'კონსულტაციის ეტაპი: სრული ანალიზი',
    actionPlanCheck: '- ქმედების გეგმა: ✓',
    reportInterpretationStage: 'სისხლის აირების ანალიზის ანგარიში (ინტერპრეტაციის ეტაპი)',
    currentStageInterpretationComplete: 'მიმდინარე ეტაპი: ინტერპრეტაცია დასრულებულია',
    actionPlanStatusNotGenerated: 'ქმედების გეგმის სტატუსი: ჯერ არ არის გენერირებული',
    availableForAIConsultation: 'ხელმისაწვდომია AI კონსულტაციისთვის: ლაბორატორიული მნიშვნელობები + კლინიკური ინტერპრეტაცია',
    selectedContentHeader: '=== შერჩეული კონტენტი AI კონსულტაციისთვის ===',
    selectedIssues: 'შერჩეული საკითხები:',
    selectedActionPlans: 'შერჩეული ქმედების გეგმები:',
    fullActionPlanNote: '(სრული ქმედების გეგმა ხელმისაწვდომია, ნაჩვენებია მხოლოდ შერჩეული კონტენტი AI კონსულტაციისთვის)',
    interpretationStageDescription: 'ინტერპრეტაციის ეტაპი - კლინიკური ინტერპრეტაცია ხელმისაწვდომია, ქმედების გეგმა ჯერ არ არის გენერირებული',
    selectiveActionPlanConsultation: 'შერჩევითი ქმედების გეგმის კონსულტაცია - ',
    selectedItems: 'შერჩეული ელემენტი(ები)',
    completeActionPlanConsultation: 'სრული ქმედების გეგმის კონსულტაცია - ყველა ქმედების გეგმის კონტენტი ჩართულია',
    completeAnalysisConsultation: 'სრული ანალიზის კონსულტაცია - ყველა ხელმისაწვდომი ინფორმაცია ჩართულია',
    consultationType: 'კონსულტაციის ტიპი:',
  },
  vision: {
    unsupportedFormat: 'გთხოვთ, ატვირთოთ JPEG, PNG ან WEBP გამოსახულების ფაილი',
    received: 'მიღებულია:',
    imageTooLarge: 'გამოსახულების ფაილი ძალიან დიდია. გთხოვთ, ატვირთოთ 10MB-ზე ნაკლები ზომის ფაილი',
    fileSize: 'ფაილის ზომა:',
    imageCorruptedOrEmpty: 'გამოსახულების ფაილი დაზიანებული ან ცარიელია',
    geminiApiError: 'Gemini API შეცდომა:',
    unknownError: 'უცნობი შეცდომა',
    noAnalysisResult: 'Gemini Vision API-დან ანალიზის შედეგი არ დაბრუნებულა',
    serviceBusy: 'ანალიზის სერვისი ამჟამად დაკავებულია. გთხოვთ, სცადოთ რამდენიმე წუთში.',
    failedToAnalyze: 'სისხლის აირების გამოსახულების ანალიზი ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა.',
    failedToConvertImage: 'გამოსახულების კონვერტაცია ვერ მოხერხდა:',
    failedToReadFile: 'ფაილის წაკითხვა ვერ მოხერხდა:',
    aiPrompt: `გაანალიზეთ სისხლის აირების ანალიზის ანგარიშის ეს გამოსახულება და ამოიღეთ ყველა შესაბამისი სამედიცინო მონაცემი. ფოკუსირება მოახდინეთ:

1. პაციენტის ინფორმაცია (თუ ხილვადია):
   - პაციენტის ID, სახელი, ასაკი, სქესი
   - ტესტის თარიღი და დრო
   - ნიმუშის ტიპი (არტერიული, ვენური, კაპილარული)

2. სისხლის აირების მნიშვნელობები:
   - pH დონე
   - pCO2 (CO2-ის ნაწილობრივი წნევა)
   - pO2 (O2-ის ნაწილობრივი წნევა)
   - HCO3- (ბიკარბონატი)
   - Base Excess (BE)
   - O2 სატურაცია (SaO2)

3. ელექტროლიტები და სხვა პარამეტრები:
   - ნატრიუმი (Na+)
   - კალიუმი (K+)
   - ქლორიდი (Cl-)
   - გლუკოზა
   - ლაქტატი
   - ჰემოგლობინი
   - ნებისმიერი სხვა ხილვადი პარამეტრი

4. კლინიკური კონტექსტი:
   - ტემპერატურის კორექცია
   - FiO2 პარამეტრები
   - ნებისმიერი დამატებითი შენიშვნა ან დროშა
   - ხარისხის ინდიკატორები ან გაფრთხილებები

გთხოვთ, ამოიღოთ ყველა ხილვადი ტექსტი და რიცხვითი მნიშვნელობა ზუსტად ისე, როგორც ნაჩვენებია, სამედიცინო სიზუსტის შენარჩუნებით. თუ რომელიმე მნიშვნელობა გაუგებარია ან ნაწილობრივ დაფარულია, მიუთითეთ ეს თქვენს პასუხში. დააფორმატეთ თქვენი პასუხი მკაფიო, სტრუქტურირებული სახით, რომლის განხილვაც ჯანდაცვის პროფესიონალს მარტივად შეუძლია.`,
    patientInformation: 'პაციენტის ინფორმაცია (თუ ხილვადია):',
    patientIdNameAgeGender: '- პაციენტის ID, სახელი, ასაკი, სქესი',
    dateAndTimeOfTest: '- ტესტის თარიღი და დრო',
    sampleType: '- ნიმუშის ტიპი (არტერიული, ვენური, კაპილარული)',
    bloodGasValues: 'სისხლის აირების მნიშვნელობები:',
    pHLevel: '- pH დონე',
    pCO2Level: '- pCO2 (CO2-ის ნაწილობრივი წნევა)',
    pO2Level: '- pO2 (O2-ის ნაწილობრივი წნევა)',
    hco3Level: '- HCO3- (ბიკარბონატი)',
    baseExcess: '- Base Excess (BE)',
    o2Saturation: '- O2 სატურაცია (SaO2)',
    electrolytesAndOtherParameters: 'ელექტროლიტები და სხვა პარამეტრები:',
    sodium: '- ნატრიუმი (Na+)',
    potassium: '- კალიუმი (K+)',
    chloride: '- ქლორიდი (Cl-)',
    glucose: '- გლუკოზა',
    lactate: '- ლაქტატი',
    hemoglobin: '- ჰემოგლობინი',
    anyOtherVisibleParameters: '- ნებისმიერი სხვა ხილვადი პარამეტრი',
    clinicalContext: 'კლინიკური კონტექსტი:',
    temperatureCorrection: '- ტემპერატურის კორექცია',
    fiO2Settings: '- FiO2 პარამეტრები',
    anyAdditionalNotesOrFlags: '- ნებისმიერი დამატებითი შენიშვნა ან დროშა',
    qualityIndicatorsOrAlerts: '- ხარისხის ინდიკატორები ან გაფრთხილებები',
    extractAllTextPrompt: `გთხოვთ, ამოიღოთ ყველა ხილვადი ტექსტი და რიცხვითი მნიშვნელობა ზუსტად ისე, როგორც ნაჩვენებია, სამედიცინო სიზუსტის შენარჩუნებით. თუ რომელიმე მნიშვნელობა გაუგებარია ან ნაწილობრივ დაფარულია, მიუთითეთ ეს თქვენს პასუხში. დააფორმატეთ თქვენი პასუხი მკაფიო, სტრუქტურირებული სახით, რომლის განხილვაც ჯანდაცვის პროფესიონალს მარტივად შეუძლია.`,
  }
};
export default abg;
