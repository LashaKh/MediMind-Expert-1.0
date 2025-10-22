export const knowledgeBase = {
  // Main page headers
  title: 'База знаний',
  subtitle: 'Кардиологические ресурсы',
  description: 'Получите доступ к всеобъемлющей медицинской литературе, руководствам, основанным на доказательствах, и вашей личной коллекции документов с помощью аналитических данных на базе ИИ.',
  
  // Root level keys for KnowledgeBaseSelector
  personal: 'Личные',
  curated: 'Курированные',
  
  // Feature highlights
  evidenceBased: 'Основано на доказательствах',
  aiPoweredSearch: 'Поиск с ИИ',
  securePrivate: 'Безопасно и приватно',
  
  // Quick stats
  quickStats: 'Быстрая статистика',
  medicalGuidelines: 'Медицинские руководства',
  researchPapers: 'Исследовательские работы',
  clinicalProtocols: 'Клинические протоколы',
  
  // Tabs
  curatedKnowledge: 'Кураторские знания',
  curatedKnowledgeDesc: 'Медицинская литература и руководства',
  personalLibrary: 'Личная библиотека',
  personalLibraryDesc: 'Ваши документы и записи',
  badgeVerified: 'Проверено',
  sourcesCount: '2.5М+ источников',
  badgeReady: 'Готово',
  badgeEmpty: 'Пусто',
  personalCount: '{{count}} документ(ов)',
  uploadToEnable: 'Загрузите для активации',
  aiVerified: 'Проверено ИИ',
  selectionInfluenceNotice: 'Выбор базы знаний влияет на точность и глубину ответов ИИ',

  // Tooltip content
  curatedTooltipTitle: 'Медицинская база знаний',
  curatedTooltipDesc: 'ИИ будет отвечать, используя установленные кардиологические знания от медицинских экспертов и надежных источников.',
  personalTooltipTitle: 'Ваши документы',
  personalTooltipDesc: 'ИИ будет отвечать, используя информацию из ваших загруженных документов и личных файлов.',

  // Document management
  documents: {
    totalDocuments: 'Всего документов',
    completed: 'Завершено',
    processing: 'Обрабатывается',
    storageUsed: 'Использовано места',
    
    // Upload section
    uploadDocument: 'Загрузить документ',
    refresh: 'Обновить',
    searchDocuments: 'Поиск документов',
    
    // Filters
    allStatus: 'Все статусы',
    ready: 'Готово',
    pending: 'Обрабатывается',
    error: 'Ошибка',
    
    // Advanced filters
    advanced: 'Расширенные',
    allCategories: 'Все категории',
    from: 'С',
    to: 'По',
    
    // Results
    showingResults: 'Показано',
    of: 'из',
    documentsText: 'документов',
    showingAll: 'Показаны все',
    
    // Upload process
    dragDropText: 'Перетащите файлы сюда или нажмите',
    selectFiles: 'Выбрать файлы',
    uploadButton: 'Загрузить',
    maxFileSize: 'Макс. размер файла: {size}МБ',
    supportedFormats: 'Поддерживаемые форматы',
    
    // File actions
    retry: 'Повторить',
    remove: 'Удалить',
    preview: 'Предпросмотр',
    
    // File metadata
    fileName: 'Имя файла',
    description: 'Описание документа',
    category: 'Категория',
    
    // List view
    uploadFirstButton: 'Загрузить первый документ',
    list: {
      showing: 'Показано',
      of: 'из',
      documents: 'документов',
      uploadFirstButton: 'Загрузить первый документ'
    }
  },

  // Filters and sorting
  filters: {
    all: 'Все',
    featured: 'Избранные',
    trending: 'В тренде',
    bookmarked: 'Закладки',
    recent: 'Недавние',
  },

  sorting: {
    relevance: 'Релевантность',
    rating: 'Наивысший рейтинг',
    citations: 'Самые цитируемые',
    views: 'Самые просматриваемые',
    year: 'Новейшие',
    trending: 'В тренде',
  },

  resourcesFound: 'Ресурсов найдено',

  // Curated Knowledge Base Settings
  curatedSettings: {
    searchPlaceholder: 'Поиск ресурсов, авторов, организаций...',
    sortByTitle: 'Сортировать по названию',
    sortByYear: 'Сортировать по году',
    sortByCategory: 'Сортировать по категории',
    sortByOrganization: 'Сортировать по организации',
    
    // View modes
    gridView: 'Вид сетки',
    listView: 'Вид списка',
    
    // Search results
    searchingFor: 'Поиск:',
    noResultsFound: 'Результаты не найдены',
    tryDifferentTerms: 'Попробуйте другие поисковые термины',
    
    // Resource details
    authors: 'Авторы',
    organization: 'Организация',
    year: 'Год',
    category: 'Категория',
    viewDocument: 'Просмотр документа',
    downloadPDF: 'Скачать PDF',
    
    // Results summary
    resourcesFound: 'Найдено {count} кардиологических ресурсов'
  },
  
  // Vector Store Management
  vectorStore: {
    createVectorStore: 'Создать векторное хранилище',
    managingVectorStore: 'Управление векторным хранилищем',
    loading: 'Загрузка...',
    noVectorStore: 'Векторное хранилище не найдено',
    createOne: 'Создать новое',
    refreshData: 'Обновить данные',
    deleteVectorStore: 'Удалить векторное хранилище',
    delete: 'Удалить',
    
    // Creation form
    vectorStoreName: 'Название векторного хранилища',
    vectorStoreNamePlaceholder: 'Моя медицинская база знаний',
    description: 'Описание векторного хранилища',
    descriptionPlaceholder: 'Личная коллекция медицинских документов и исследований',
    cancel: 'Отмена',
    create: 'Создать',
    
    // Status indicators
    ready: 'Готово',
    processing: 'Обрабатывается',
    pending: 'В ожидании',
    failed: 'Неудачно',
    unknown: 'Неизвестно'
  },
  
  // Document Details Modal
  details: {
    documentDetails: 'Детали документа',
    close: 'Закрыть',
    fileInformation: 'Информация о файле',
    uploadedOn: 'Загружен',
    fileSize: 'Размер файла',
    processingStatus: 'Статус обработки',

    // Processing status
    statusReady: 'Готово',
    statusProcessing: 'Обрабатывается',
    statusPending: 'В ожидании',
    statusFailed: 'Неудачно',

    // Actions
    reprocess: 'Переобработать',
    downloadOriginal: 'Скачать оригинал',
    deleteDocument: 'Удалить документ'
  },

  // Curated page texts
  book: 'Книга',
  guideline: 'Руководство',
  featured: 'Избранное',
  trending: 'В тренде',
  medicalBook: 'Медицинская книга',
  clinicalGuideline: 'Клиническое руководство',
  authors: 'Авторы',
  citations: 'Цитирования',
  views: 'Просмотры',
  more: 'Ещё',
  min: 'мин',
  updated: 'Обновлено',
  loadingKnowledgeBase: 'Загрузка базы знаний',
  preparingResources: 'Подготовка ваших медицинских ресурсов...',
  avg: 'Средн.',
  noResourcesFound: 'Ресурсы не найдены',
  couldntFindResources: 'Не удалось найти ресурсы, соответствующие',
  clearSearchBrowseAll: 'Очистить поиск и просмотреть все ресурсы',
  trySearchingFor: 'Попробуйте искать',
  noResourcesMatchFilters: 'Ни один ресурс не соответствует вашим фильтрам. Попробуйте изменить критерии поиска.',
  topics: 'Темы',
  resourceStats: 'Статистика ресурса',
  rating: 'Рейтинг',
  difficulty: 'Сложность',
  readTime: 'Время чтения',
  openResource: 'Открыть ресурс',
  save: 'Сохранить',
  share: 'Поделиться',
  lastUpdated: 'Последнее обновление',
  beginner: 'Начинающий',
  intermediate: 'Средний',
  advanced: 'Продвинутый',

  // Personal Library Premium texts
  totalLibrary: 'Всего в библиотеке',
  documentsCount: 'документов',
  ready: 'Готово',
  processed: 'обработано',
  processing: 'Обрабатывается',
  inQueue: 'в очереди',
  storage: 'Хранилище',
  totalUsed: 'использовано',
  uploadDocuments: 'Загрузить документы',
  refresh: 'Обновить',
  monitor: 'Мониторинг',
  searchYourKnowledgeBase: 'Поиск в вашей базе знаний...',
  sortBy: 'Сортировка',
  name: 'Название',
  date: 'Дата',
  size: 'Размер',
  type: 'Тип',
  advancedFilters: 'Расширенные фильтры',
  quickFilters: 'Быстрые фильтры',
  favorites: 'Избранное',
  recent: 'Недавние',
  completed: 'Завершенные',
  researchPapers: 'Исследовательские работы',
  clinicalGuidelines: 'Клинические руководства',
  caseStudies: 'Клинические случаи',
  protocols: 'Протоколы',
  referenceMaterials: 'Справочные материалы',
  personalNotes: 'Личные заметки',
  other: 'Другое',
  pdf: 'PDF',
  images: 'Изображения',
  documentsType: 'Документы',
  spreadsheets: 'Таблицы',
  yourKnowledgeBaseAwaits: 'Ваша база знаний ждет',
  startBuildingLibrary: 'Начните создание вашей личной медицинской библиотеки, загрузив первый документ',
  uploadYourFirstDocument: 'Загрузите первый документ',
  of: 'из',
  documentsText: 'документов',
  showingFirst: 'Показано первых',
  tags: 'Теги',
  addTagsToFilter: 'Добавьте теги для фильтрации...',
  dateRange: 'Диапазон дат',
  from: 'С',
  to: 'По',
  fileSize: 'Размер файла',
  selectAll: 'Выбрать все',
  deselectAll: 'Снять выбор',
  clearSelection: 'Очистить выбор',
  documentsSelected: 'документов выбрано',
  noDocumentsMatchSearch: 'Ни один документ не соответствует вашему поиску',
  tryAdjustingCriteria: 'Попробуйте изменить критерии поиска или фильтры, чтобы найти то, что вы ищете.'
};

export default knowledgeBase; 