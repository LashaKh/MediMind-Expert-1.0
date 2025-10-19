export const search = {
  // Main Search Interface
  title: 'Поиск медицинской литературы',
  subtitle: 'Поиск доказательной медицинской литературы и клинических рекомендаций',
  placeholder: 'Поиск медицинской литературы, рекомендаций, калькуляторов...',
  searchButton: 'Поиск',
  clearSearch: 'Очистить поиск',
  advancedFilters: 'Расширенные фильтры',
  hideFilters: 'Скрыть фильтры',
  
  // Search Status
  searching: 'Поиск...',
  searchingBio: 'Анализ медицинской литературы',
  loadingInterface: 'Загрузка революционного интерфейса...',
  searchComplete: 'Поиск завершён',
  searchFailed: 'Ошибка поиска',
  noResults: 'Результаты не найдены',
  resultsFound: 'Найдено результатов: {count}',
  showingResults: 'Показано {start}-{end} из {total} результатов',
  loadMore: 'Загрузить ещё',
  
  // Filters
  filters: {
    title: 'Фильтры поиска',

    // Modal
    modal: {
      title: 'Расширенные медицинские фильтры',
      subtitle: 'Уточните поиск с помощью точной фильтрации'
    },

    // Filter Categories
    categories: {
      quickFilters: 'Быстрые фильтры',
      quickFiltersDesc: 'Популярные комбинации фильтров для общих поисков',
      contentFormat: 'Контент и формат',
      contentFormatDesc: 'Фильтрация по типу контента, формату файла и структуре документа',
      authorityQuality: 'Авторитетность и качество',
      authorityQualityDesc: 'Надёжность источника, статус рецензирования и качество доказательств',
      medicalDomain: 'Медицинская область',
      medicalDomainDesc: 'Медицинские специальности, подспециальности и клинические темы',
      publicationAccess: 'Публикация и доступ',
      publicationAccessDesc: 'Дата публикации, тип доступа и доступность',
      geographicContext: 'География и контекст',
      geographicContextDesc: 'Географическая релевантность, условия практики и популяции пациентов',
      advancedOptions: 'Расширенные опции',
      advancedOptionsDesc: 'Клинические испытания, параметры исследований и специализированные фильтры'
    },

    // Quick Filters
    quickFilters: {
      title: 'Быстрые фильтры',
      subtitle: 'Популярные комбинации фильтров для общих медицинских поисков'
    },
    specialty: {
      label: 'Медицинская специальность',
      all: 'Все специальности',
      cardiology: 'Кардиология',
      obgyn: 'Акушерство и гинекология',
      internalMedicine: 'Терапия',
      emergencyMedicine: 'Неотложная медицина',
      pediatrics: 'Педиатрия',
      surgery: 'Хирургия',
      radiology: 'Радиология',
      pathology: 'Патология'
    },
    evidenceLevel: {
      label: 'Уровень доказательности',
      all: 'Все уровни доказательности',
      systematicReview: 'Систематические обзоры',
      rct: 'Рандомизированные контролируемые исследования',
      cohortStudy: 'Когортные исследования',
      caseControl: 'Исследования случай-контроль',
      caseSeries: 'Серии случаев',
      expertOpinion: 'Мнение экспертов',
      guideline: 'Клинические рекомендации',
      reviewArticle: 'Обзорные статьи'
    },
    contentType: {
      label: 'Тип контента',
      all: 'Все типы контента',
      researchPaper: 'Научные статьи',
      clinicalGuideline: 'Клинические рекомендации',
      caseReport: 'Описания случаев',
      medicalNews: 'Медицинские новости',
      educationalMaterial: 'Образовательные материалы',
      drugInformation: 'Информация о препаратах',
      calculator: 'Медицинские калькуляторы'
    },
    recency: {
      label: 'Дата публикации',
      all: 'Все даты',
      pastWeek: 'За неделю',
      pastMonth: 'За месяц',
      past3Months: 'За 3 месяца',
      pastYear: 'За год',
      past5Years: 'За 5 лет'
    },
    source: {
      label: 'Источник',
      all: 'Все источники',
      pubmed: 'PubMed',
      cochrane: 'Кокрейновская библиотека',
      uptodate: 'UpToDate',
      guidelines: 'Клинические рекомендации',
      journals: 'Медицинские журналы'
    }
  },
  
  // Search Results
  results: {
    defaultSource: 'Медицинский журнал',
    noDescription: 'Описание отсутствует.',
    title: 'Результаты поиска',
    relevance: 'Релевантность',
    date: 'Дата публикации',
    evidenceLevel: 'Уровень доказательности',
    source: 'Источник',
    viewDetails: 'Подробнее',
    openExternal: 'Открыть внешнюю ссылку',
    saveResult: 'Сохранить результат',
    shareResult: 'Поделиться результатом',
    citationCopied: 'Цитата скопирована в буфер обмена',
    
    // Result metadata
    publishedOn: 'Опубликовано',
    lastUpdated: 'Последнее обновление',
    authors: 'Авторы',
    journal: 'Журнал',
    doi: 'DOI',
    pmid: 'PMID',
    
    // Evidence quality indicators
    evidenceQuality: {
      high: 'Высокий уровень доказательности',
      moderate: 'Умеренный уровень доказательности',
      low: 'Низкий уровень доказательности',
      veryLow: 'Очень низкий уровень доказательности'
    }
  },
  badges: {
    revolutionary: 'Революционно'
  },
  hero: {
    subtitle: 'Откройте революционные медицинские исследования и клинические испытания с точностью ИИ. Доступ к самой продвинутой поисковой системе медицинской литературы.'
  },

  // Stats
  stats: {
    researchPapers: 'Научные статьи',
    searchSpeed: 'Скорость поиска',
    activeProviders: 'Активные поставщики',
    successRate: 'Успешность'
  },

  // Loading steps
  loadingSteps: {
    scanningDatabases: 'Сканирование баз данных',
    processingResults: 'Обработка результатов',
    rankingRelevance: 'Оценка релевантности'
  },

  // Discovery banners
  banners: {
    readyForDiscovery: 'Готовы к открытиям',
    papersReady: '50 млн+ статей готово',
    aiPoweredSearch: 'Поиск на базе ИИ'
  },
  
  // Detail Panel
  detail: {
    title: 'Детали статьи',
    abstract: 'Аннотация',
    fullText: 'Полный текст',
    citation: 'Цитирование',
    metrics: 'Метрики',
    relatedArticles: 'Похожие статьи',
    closePanel: 'Закрыть панель',
    
    // Evidence analysis
    evidenceAnalysis: {
      title: 'Анализ доказательности',
      studyType: 'Тип исследования',
      sampleSize: 'Размер выборки',
      followUpPeriod: 'Период наблюдения',
      primaryOutcome: 'Первичная конечная точка',
      limitations: 'Ограничения',
      clinicalRelevance: 'Клиническая значимость'
    },
    
    // Source validation
    sourceValidation: {
      title: 'Валидация источника',
      peerReviewed: 'Рецензируемый',
      impactFactor: 'Импакт-фактор',
      citationCount: 'Количество цитирований',
      authorCredentials: 'Квалификация авторов',
      institutionalAffiliation: 'Институциональная принадлежность'
    }
  },
  
  // Search History
  history: {
    title: 'История поиска',
    recent: 'Недавние поиски',
    saved: 'Сохранённые поиски',
    clear: 'Очистить историю',
    searchAgain: 'Найти снова',
    saveSearch: 'Сохранить поиск',
    deleteSearch: 'Удалить поиск',
    noHistory: 'История поиска пуста'
  },
  
  // Quick Suggestions
  suggestions: {
    title: 'Быстрые предложения',
    popular: 'Популярные поиски',
    trending: 'Актуальные темы',
    specialty: 'По специальности',
    recent: 'Новые рекомендации',
    calculators: 'Медицинские калькуляторы'
  },
  
  // Search Tips
  tips: {
    title: 'Советы по поиску',
    useQuotes: 'Используйте кавычки для точных фраз: "инфаркт миокарда"',
    combineTerms: 'Объединяйте термины с И, ИЛИ: диабет И беременность',
    useFilters: 'Используйте фильтры для уточнения по специальности и уровню доказательности',
    synonyms: 'Попробуйте медицинские синонимы: ИМ, инфаркт сердца, инфаркт миокарда',
    wildcards: 'Используйте * для частичного совпадения: карди* найдёт кардиология, кардиальный и т.д.'
  },
  
  // Error Messages
  errors: {
    searchFailed: 'Ошибка поиска. Попробуйте ещё раз.',
    networkError: 'Ошибка сети. Проверьте подключение к интернету.',
    serverError: 'Ошибка сервера. Попробуйте позже.',
    invalidQuery: 'Неверный запрос. Уточните поисковую фразу.',
    rateLimited: 'Слишком много запросов. Подождите перед следующим поиском.',
    noApiKey: 'Сервис поиска недоступен. Обратитесь в поддержку.'
  },
  
  // Empty States
  emptyStates: {
    noResults: {
      title: 'Результаты не найдены',
      subtitle: 'Попробуйте изменить поисковые термины или фильтры',
      suggestions: [
        'Проверьте правописание медицинских терминов',
        'Используйте более широкие поисковые термины',
        'Попробуйте разные синонимы',
        'Уберите некоторые фильтры',
        'Ищите связанные состояния'
      ]
    },
    startSearch: {
      title: 'Начните поиск медицинской литературы',
      subtitle: 'Ищите доказательный медицинский контент для поддержки клинических решений',
      examples: [
        'Оценка сердечно-сосудистого риска',
        'Рекомендации по скринингу преэклампсии',
        'Лечение сердечной недостаточности',
        'Протоколы лечения диабета'
      ]
    }
  },
  
  // Accessibility
  accessibility: {
    searchInput: 'Поле поиска медицинской литературы',
    filterButton: 'Открыть расширенные фильтры поиска',
    resultsList: 'Список результатов поиска',
    resultItem: 'Элемент результата поиска',
    detailPanel: 'Панель деталей статьи',
    closeDetail: 'Закрыть детали статьи',
    loadingResults: 'Загрузка результатов поиска'
  },

  // Missing keys from components
  ariaLabel: 'Поиск медицинской литературы',
  clear: 'Очистить поиск',
  voiceSearch: 'Голосовой поиск',
  toggleFilters: 'Переключить расширенные фильтры',
  noResultsDescription: 'Попробуйте изменить поисковые термины или фильтры',
  searchedFor: 'Искали:',
  resultsText: 'результатов',
  loading: 'Загрузка...',
  viewDetails: 'Подробнее',
  searchTime: 'Поиск завершён за',
  tryDifferent: 'Попробуйте изменить поисковые термины или фильтры',
  noResultsInTab: 'Не найдено {{type}}',
  checkOtherTabs: 'Проверьте другие вкладки для дополнительных результатов',
  discoveryFound: 'Найдены революционные открытия',
  discovery: {
    noDiscoveriesTitle: 'Пока нет революционных открытий',
    tipsTitle: 'Советы для улучшения поиска',
    tips: {
      broaderTerms: 'Попробуйте более широкие медицинские термины',
      clinicalTerms: 'Используйте клиническую терминологию',
      abbreviations: 'Проверьте медицинские аббревиатуры',
      adjustFilters: 'Настройте фильтры'
    }
  },
  newsFilters: 'Фильтры новостей',
  selectProvider: 'Пожалуйста, выберите хотя бы одного поставщика поиска для продолжения.',
  selectProvidersPlaceholder: 'Выберите поставщиков ниже, чтобы начать поиск...',

  // Tabs
  tabs: {
    all: 'Все результаты',
    allDesc: 'Все результаты поиска',
    papers: 'Научные статьи',
    papersDesc: 'Журнальные статьи и исследования',
    trials: 'Клинические исследования',
    trialsDesc: 'Активные и набирающие участников исследования',
    guidelines: 'Рекомендации',
    guidelinesDesc: 'Клинические рекомендации и протоколы',
    liked: 'Сохранённые результаты',
    likedDesc: 'Ваши сохранённые медицинские исследования'
  },

  // Saved results
  saved: {
    title: 'Сохранённые результаты поиска',
    countLabel: 'Доступно сохранённых результатов: {count}',
    loading: 'Загрузка ваших сохранённых результатов...',
    emptyTitle: 'Сохранённых результатов пока нет',
    emptyDesc: 'Начните сохранять интересные результаты, нажимая на иконку сердца',
    show: 'Показать',
    hide: 'Скрыть',
    showingOf: 'Показано {shown} из {total} сохранённых результатов',
    removeFromFavorites: 'Убрать из избранного'
  },

  // Search Providers
  providers: {
    title: 'Поставщики поиска',
    summary: 'Выбранные поставщики будут выполнять поиск параллельно для получения полных результатов',
    of: 'из',
    selected: 'выбрано',
    expand: 'Развернуть список поставщиков поиска',
    collapse: 'Свернуть список поставщиков поиска',
    metrics: {
      success: 'успешность',
      searches: 'поисков',
      recentIssue: 'Недавняя проблема'
    },
    requireOne: 'Необходимо выбрать как минимум одного поставщика',
    noneSelected: 'Поставщики не выбраны. Пожалуйста, выберите хотя бы одного поставщика.',
    active: 'активно'
  },

  auth: {
    loginToSave: 'Пожалуйста, войдите, чтобы сохранять результаты'
  },
  actions: {
    addToFavorites: 'Добавить в избранное',
    removeFromFavorites: 'Убрать из избранного'
  },

  // Clinical Trials
  clinicalTrials: {
    status: {
      recruiting: 'Набор участников',
      active: 'Активно',
      completed: 'Завершено',
      terminated: 'Прекращено',
      suspended: 'Приостановлено',
      withdrawn: 'Отозвано'
    },
    phase: 'Фаза',
    enrollment: 'Набор',
    participants: 'участников',
    startDate: 'Дата начала',
    locations: 'Места проведения',
    sites: 'центров',
    eligibility: 'Критерии участия',
    gender: 'Пол',
    minAge: 'Мин. возраст',
    maxAge: 'Макс. возраст',
    ageRange: 'Возрастной диапазон',
    acceptsHealthy: 'Принимает здоровых добровольцев',
    patientsOnly: 'Только пациенты',
    nearestLocation: 'Ближайшее место',
    miles: 'миль',
    checkEligibility: 'Проверить соответствие критериям',
    viewDetails: 'Подробнее',
    lastUpdated: 'Последнее обновление',
    filters: 'Фильтры клинических исследований',
    clearFilters: 'Очистить фильтры',
    recruitmentStatus: 'Статус набора',
    locationFilter: 'Местоположение',
    locationPlaceholder: 'Введите город или страну...'
  }
};

export default search;