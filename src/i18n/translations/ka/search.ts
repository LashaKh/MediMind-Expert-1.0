export const search = {
  // Main Search Interface
  title: 'სამედიცინო ლიტერატურის ძიება',
  subtitle: 'მტკიცებულებაზე დაფუძნებული სამედიცინო ლიტერატურისა და კლინიკური რეკომენდაციების ძიება',
  placeholder: 'სამედიცინო ლიტერატურის, რეკომენდაციების, კალკულატორების ძიება...',
  searchButton: 'ძიება',
  clearSearch: 'ძიების გაწმენდა',
  advancedFilters: 'გაფართოებული ფილტრები',
  hideFilters: 'ფილტრების დამალვა',
  
  // Search Status
  searching: 'მიმდინარეობს ძიება...',
  searchingBio: 'სამედიცინო ლიტერატურის ანალიზი',
  loadingInterface: 'იტვირთება რევოლუციური ინტერფეისი...',
  searchComplete: 'ძიება დასრულდა',
  searchFailed: 'ძიება ვერ შესრულდა',
  noResults: 'შედეგები ვერ მოიძებნა',
  resultsFound: 'ნაპოვნია {count} შედეგი',
  showingResults: 'ნაჩვენებია {start}-{end} {total}-დან',
  loadMore: 'მეტის ჩატვირთვა',
  
  // Filters
  filters: {
    title: 'ძიების ფილტრები',
    specialty: {
      label: 'სამედიცინო სპეციალობა',
      all: 'ყველა სპეციალობა',
      cardiology: 'კარდიოლოგია',
      obgyn: 'გინეკოლოგია და მედდეობა',
      internalMedicine: 'შინაგანი მედიცინა',
      emergencyMedicine: 'გადაუდებელი მედიცინა',
      pediatrics: 'პედიატრია',
      surgery: 'ქირურგია',
      radiology: 'რადიოლოგია',
      pathology: 'პათოლოგია'
    },
    evidenceLevel: {
      label: 'მტკიცებულების დონე',
      all: 'მტკიცებულების ყველა დონე',
      systematicReview: 'სისტემური მიმოხილვები',
      rct: 'რანდომიზებული კონტროლირებადი კვლევები',
      cohortStudy: 'კოჰორტის კვლევები',
      caseControl: 'შემთხვევა-კონტროლის კვლევები',
      caseSeries: 'შემთხვევების სერიები',
      expertOpinion: 'ექსპერტის მოსაზრება',
      guideline: 'კლინიკური რეკომენდაციები',
      reviewArticle: 'მიმოხილვითი სტატიები'
    },
    contentType: {
      label: 'კონტენტის ტიპი',
      all: 'კონტენტის ყველა ტიპი',
      researchPaper: 'კვლევითი სტატიები',
      clinicalGuideline: 'კლინიკური რეკომენდაციები',
      caseReport: 'შემთხვევების აღწერა',
      medicalNews: 'სამედიცინო სიახლეები',
      educationalMaterial: 'საგანმანათლებლო მასალები',
      drugInformation: 'ინფორმაცია მედიკამენტებზე',
      calculator: 'სამედიცინო კალკულატორები'
    },
    recency: {
      label: 'გამოქვეყნების თარიღი',
      all: 'ყველა თარიღი',
      pastWeek: 'ბოლო კვირა',
      pastMonth: 'ბოლო თვე',
      past3Months: 'ბოლო 3 თვე',
      pastYear: 'ბოლო წელი',
      past5Years: 'ბოლო 5 წელი'
    },
    source: {
      label: 'წყარო',
      all: 'ყველა წყარო',
      pubmed: 'PubMed',
      cochrane: 'კოქრეინის ბიბლიოთეკა',
      uptodate: 'UpToDate',
      guidelines: 'კლინიკური რეკომენდაციები',
      journals: 'სამედიცინო ჟურნალები'
    }
  },
  
  // Search Results
  results: {
    defaultSource: 'სამედიცინო ჟურნალი',
    noDescription: 'აღწერა მიუწვდომელია.',
    title: 'ძიების შედეგები',
    relevance: 'რელევანტურობა',
    date: 'გამოქვეყნების თარიღი',
    evidenceLevel: 'მტკიცებულების დონე',
    source: 'წყარო',
    viewDetails: 'დეტალების ნახვა',
    openExternal: 'გარე ბმულის გახსნა',
    saveResult: 'შედეგის შენახვა',
    shareResult: 'შედეგის გაზიარება',
    citationCopied: 'ციტირება კოპირებულია',
    
    // Result metadata
    publishedOn: 'გამოქვეყნებულია',
    lastUpdated: 'ბოლო განახლება',
    authors: 'ავტორები',
    journal: 'ჟურნალი',
    doi: 'DOI',
    pmid: 'PMID',
    
    // Evidence quality indicators
    evidenceQuality: {
      high: 'მაღალი ხარისხის მტკიცებულება',
      moderate: 'ზომიერი ხარისხის მტკიცებულება',
      low: 'დაბალი ხარისხის მტკიცებულება',
      veryLow: 'ძალიან დაბალი ხარისხის მტკიცებულება'
    }
  },
  badges: {
    revolutionary: 'რევოლუციური'
  },
  hero: {
    subtitle: 'აღმოაჩინეთ რევოლუციური სამედიცინო კვლევები და კლინიკური კვლევები AI-ს სიზუსტით. ისარგებლეთ მსოფლიოს ყველაზე განვითარებული სამედიცინო საძიებო სისტემით.'
  },

  // Stats
  stats: {
    researchPapers: 'კვლევითი სტატიები',
    searchSpeed: 'ძიების სიჩქარე',
    activeProviders: 'აქტიური მომწოდებლები',
    successRate: 'წარმატების მაჩვენებელი'
  },

  // Loading steps
  loadingSteps: {
    scanningDatabases: 'ბაზების სკანირება',
    processingResults: 'შედეგების დამუშავება',
    rankingRelevance: 'რელევანტობის დალაგება'
  },

  // Discovery banners
  banners: {
    readyForDiscovery: 'მზად აღმოჩენებისთვის',
    papersReady: '50მლნ+ სტატია მზადაა',
    aiPoweredSearch: 'AI-ძრავით ძიება'
  },
  
  // Detail Panel
  detail: {
    title: 'სტატიის დეტალები',
    abstract: 'აბსტრაქტი',
    fullText: 'სრული ტექსტი',
    citation: 'ციტირება',
    metrics: 'მეტრიკები',
    relatedArticles: 'მსგავსი სტატიები',
    closePanel: 'პანელის დახურვა',
    
    // Evidence analysis
    evidenceAnalysis: {
      title: 'მტკიცებულების ანალიზი',
      studyType: 'კვლევის ტიპი',
      sampleSize: 'ნიმუშის ზომა',
      followUpPeriod: 'თვალყურის დევნების პერიოდი',
      primaryOutcome: 'ძირითადი შედეგი',
      limitations: 'შეზღუდვები',
      clinicalRelevance: 'კლინიკური მნიშვნელობა'
    },
    
    // Source validation
    sourceValidation: {
      title: 'წყაროს ვალიდაცია',
      peerReviewed: 'რეცენზირებული',
      impactFactor: 'ზემოქმედების ფაქტორი',
      citationCount: 'ციტირების რაოდენობა',
      authorCredentials: 'ავტორების კვალიფიკაცია',
      institutionalAffiliation: 'ინსტიტუციური კუთვნილება'
    }
  },
  
  // Search History
  history: {
    title: 'ძიების ისტორია',
    recent: 'ბოლო ძიებები',
    saved: 'შენახული ძიებები',
    clear: 'ისტორიის გაწმენდა',
    searchAgain: 'ხელახლა ძიება',
    saveSearch: 'ძიების შენახვა',
    deleteSearch: 'ძიების წაშლა',
    noHistory: 'ძიების ისტორია ცარიელია'
  },
  
  // Quick Suggestions
  suggestions: {
    title: 'სწრაფი შეთავაზებები',
    popular: 'პოპულარული ძიებები',
    trending: 'აქტუალური თემები',
    specialty: 'სპეციალობის მიხედვით',
    recent: 'ახალი რეკომენდაციები',
    calculators: 'სამედიცინო კალკულატორები'
  },
  
  // Search Tips
  tips: {
    title: 'ძიების რჩევები',
    useQuotes: 'გამოიყენეთ ბრჭყალები ზუსტი ფრაზებისთვის: "მიოკარდის ინფარქტი"',
    combineTerms: 'შეუერთეთ ტერმინები ДА, ან-ით: დიაბეტი და ორსულობა',
    useFilters: 'გამოიყენეთ ფილტრები სპეციალობისა და მტკიცებულების დონის მიხედვით',
    synonyms: 'სცადეთ სამედიცინო სინონიმები: მი, გულის შეტევა, მიოკარდის ინფარქტი',
    wildcards: 'გამოიყენეთ * ნაწილობრივი დამთხვევისთვის: კარდი* პოვის კარდიოლოგია, კარდიული და ა.შ.'
  },
  
  // Error Messages
  errors: {
    searchFailed: 'ძიება ვერ შესრულდა. სცადეთ ხელახლა.',
    networkError: 'ქსელის შეცდომა. შეამოწმეთ ინტერნეტ კავშირი.',
    serverError: 'სერვერის შეცდომა. სცადეთ მოგვიანებით.',
    invalidQuery: 'არასწორი ძიების მოთხოვნა. გააუმჯობესეთ ძიება.',
    rateLimited: 'მეტისმეტად ბევრი მოთხოვნა. დაელოდეთ შემდეგ ძიებამდე.',
    noApiKey: 'ძიების სერვისი მიუწვდომელია. მიმართეთ მხარდაჭერას.'
  },
  
  // Empty States
  emptyStates: {
    noResults: {
      title: 'შედეგები ვერ მოიძებნა',
      subtitle: 'სცადეთ ძიების ტერმინების ან ფილტრების შეცვლა',
      suggestions: [
        'შეამოწმეთ სამედიცინო ტერმინების მართლწერა',
        'გამოიყენეთ უფრო ფართო ძიების ტერმინები',
        'სცადეთ სხვადასხვა სინონიმები',
        'ამოიღეთ ზოგიერთი ფილტრი',
        'მოძებნეთ დაკავშირებული პირობები'
      ]
    },
    startSearch: {
      title: 'დაიწყეთ სამედიცინო ლიტერატურის ძიება',
      subtitle: 'მოძებნეთ მტკიცებულებაზე დაფუძნებული სამედიცინო კონტენტი კლინიკური გადაწყვეტილებების მისაღებად',
      examples: [
        'ASCVD რისკის შეფასება',
        'პრეეკლამფსიის სკრინინგის რეკომენდაციები',
        'გულის უკმარისობის მკურნალობა',
        'დიაბეტის მკურნალობის პროტოკოლები'
      ]
    }
  },
  
  // Accessibility
  accessibility: {
    searchInput: 'სამედიცინო ლიტერატურის ძიების ველი',
    filterButton: 'გააღეთ გაფართოებული ძიების ფილტრები',
    resultsList: 'ძიების შედეგების სია',
    resultItem: 'ძიების შედეგის ელემენტი',
    detailPanel: 'სტატიის დეტალების პანელი',
    closeDetail: 'სტატიის დეტალების დახურვა',
    loadingResults: 'ძიების შედეგების ჩატვირთვა'
  },

  // Missing keys from components
  ariaLabel: 'სამედიცინო ლიტერატურის ძიება',
  clear: 'ძიების გაწმენდა',
  voiceSearch: 'ხმოვანი ძიება',
  toggleFilters: 'გაფართოებული ფილტრების გადართვა',
  noResultsDescription: 'სცადეთ ძიების ტერმინების ან ფილტრების შეცვლა',
  searchedFor: 'ძიებული:',
  resultsText: 'შედეგები',
  loading: 'ჩატვირთვა...',
  viewDetails: 'დეტალების ნახვა',
  searchTime: 'ძიება დასრულდა',
  tryDifferent: 'სცადეთ ძიების ტერმინების ან ფილტრების შეცვლა',
  noResultsInTab: 'ვერ მოიძებნა {{type}}',
  checkOtherTabs: 'შეამოწმეთ სხვა ჩანართები დამატებითი შედეგებისთვის',
  discoveryFound: 'აღმოჩენილი რევოლუციური აღმოჩენები',
  discovery: {
    noDiscoveriesTitle: 'ჯერ არ არის რევოლუციური აღმოჩენები',
    tipsTitle: 'აღმოჩენის გაუმჯობესების რჩევები',
    tips: {
      broaderTerms: 'სცადეთ უფრო ფართო სამედიცინო ტერმინები',
      clinicalTerms: 'გამოიყენეთ კლინიკური ტერმინოლოგია',
      abbreviations: 'შეამოწმეთ სამედიცინო აბრევიატურები',
      adjustFilters: 'შეასწორეთ ფილტრები'
    }
  },
  newsFilters: 'სიახლეების ფილტრები',
  selectProvider: 'გთხოვთ, აირჩიოთ მინიმუმ ერთი მომწოდებელი გაგრძელებისთვის.',
  selectProvidersPlaceholder: 'აირჩიეთ ძიების მომწოდებლები ქვემოთ საძიებლად...',

  // Tabs
  tabs: {
    all: 'ყველა შედეგი',
    allDesc: 'ყველა ძიების შედეგი',
    papers: 'კვლევითი სტატიები',
    papersDesc: 'ჟურნალის სტატიები და კვლევები',
    trials: 'კლინიკური კვლევები',
    trialsDesc: 'აქტიური და მონაწილეების მიღების კვლევები',
    guidelines: 'რეკომენდაციები',
    guidelinesDesc: 'კლინიკური რეკომენდაციები და პროტოკოლები',
    liked: 'შენახული შედეგები',
    likedDesc: 'თქვენი შენახული სამედიცინო კვლევები'
  },

  // Saved results
  saved: {
    title: 'შენახული ძიების შედეგები',
    countLabel: '{count} შენახული შედეგი ხელმისაწვდომია',
    loading: 'თქვენი შენახული შედეგების ჩატვირთვა...',
    emptyTitle: 'ჯერ არ გაქვთ შენახული შედეგები',
    emptyDesc: 'დაიწყეთ საინტერესო შედეგების შენახვა გულის ღილაკზე დაჭერით',
    show: 'ჩვენება',
    hide: 'დამალვა',
    showingOf: 'ნაჩვენებია {shown} {total}-დან',
    removeFromFavorites: 'ფავორიტებიდან ამოშლა'
  },

  // Search Providers
  providers: {
    title: 'ძიების მომწოდებლები',
    summary: 'შერჩეული მომწოდებლები შეასრულებენ ძიებას პარალელურად სრული შედეგებისთვის',
    of: 'დან',
    selected: 'არჩეულია',
    expand: 'ძიების მომწოდებლების გაშლა',
    collapse: 'ძიების მომწოდებლების ჩაკეცვა',
    metrics: {
      success: 'წარმატება',
      searches: 'ძიება',
      recentIssue: 'უახლესი პრობლემა'
    },
    requireOne: 'უნდობლად უნდა იყოს არჩეული მინიმუმ ერთი მომწოდებელი',
    noneSelected: 'მომწოდებლები არჩეული არ არის. გთხოვთ, აირჩიოთ მინიმუმ ერთი მომწოდებელი.',
    active: 'აქტიური'
  },

  auth: {
    loginToSave: 'შედეგების შესანახად გთხოვთ შეხვიდეთ სისტემაში'
  },
  actions: {
    addToFavorites: 'ფავორიტებში დამატება',
    removeFromFavorites: 'ფავორიტებიდან ამოშლა'
  },

  // Clinical Trials
  clinicalTrials: {
    status: {
      recruiting: 'მონაწილეების მიღება',
      active: 'აქტიური',
      completed: 'დასრულებული',
      terminated: 'შეწყვეტილი',
      suspended: 'შეჩერებული',
      withdrawn: 'გაუქმებული'
    },
    phase: 'ფაზა',
    enrollment: 'მიღება',
    participants: 'მონაწილეები',
    startDate: 'დაწყების თარიღი',
    locations: 'ადგილმდებარეობები',
    sites: 'ცენტრები',
    eligibility: 'შესაბამისობის კრიტერიუმები',
    gender: 'სქესი',
    minAge: 'მინ. ასაკი',
    maxAge: 'მაქს. ასაკი',
    acceptsHealthy: 'იღებს ჯანმრთელ მოხალისეებს',
    patientsOnly: 'მხოლოდ პაციენტები',
    nearestLocation: 'უახლოესი ადგილმდებარეობა',
    miles: 'მილი',
    checkEligibility: 'კრიტერიუმების შემოწმება',
    viewDetails: 'დეტალების ნახვა',
    lastUpdated: 'ბოლო განახლება'
  }
};

export default search;