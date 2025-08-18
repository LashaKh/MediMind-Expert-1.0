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
      progress: 'არტერიული სისხლის გაზების ანალიზის პროგრესი'
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
      subtitle: 'AI-ის მიერ შესრულებული სისხლის გაზების ანალიზის შედეგები'
    },
    waitingData: 'სისხლის გაზების ანალიზის შედეგები გამოჩნდება დამუშავების შემდეგ...',
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
      title: 'სისხლის გაზების პარამეტრები'
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
    title: 'სისხლის გაზების ანალიზი',
    subtitle: 'ატვირთეთ სისხლის გაზების ანგარიში მყისიერი AI ანალიზისთვის, დადასტურებული ინტერპრეტაციისა და ქმედების გეგმისთვის.'
  },

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
      title: 'სისხლის გაზების ტიპი',
      subtitle: 'აირჩიეთ ანალიზის ტიპი'
    },
    types: {
      arterialDesc: 'ყველაზე სრულყოფილი ანალიზი',
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
      dropzone: 'არტერიული სისხლის გაზების ანგარიშის ატვირთვა',
      removeFile: 'ფაილის ამოღება'
    },
    
    // Errors
    errors: {
      invalidType: 'გთხოვთ, აირჩიოთ სწორი სურათის ფაილი ({{types}})',
      maxSize: 'ფაილის ზომა უნდა იყოს {{size}}MB-ზე ნაკლები'
    }
  }
};

export default abg;


