export const knowledgeBase = {
  // Main page headers
  title: 'База знаний',
  subtitle: 'Кардиологические ресурсы',
  description: 'Доступ к комплексной медицинской литературе, основанным на доказательствах руководствам и вашей личной коллекции документов с помощью ИИ.',
  
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
  personalCount: '{count} документ(ов)',
  uploadToEnable: 'Загрузите для активации',
  aiVerified: 'Проверено ИИ',
  selectionInfluenceNotice: 'Выбор базы знаний влияет на точность и глубину ответов ИИ',
  
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
    description: 'Описание',
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
    description: 'Описание',
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
  }
};

export default knowledgeBase; 