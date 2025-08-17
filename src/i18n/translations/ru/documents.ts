export default {
  uploadTitle: 'Загрузка документов',
  uploadSubtitle: 'Добавьте медицинскую литературу, исследовательские работы и клинические документы в вашу базу знаний',
  dragDropText: 'Перетащите файлы сюда или нажмите для выбора',
  browseFiles: 'Обзор файлов',
  supportedFormats: 'Поддерживаемые форматы: PDF, Word, Text, Markdown, CSV',
  maxFileSize: 'Максимальный размер файла: {size}MB',
  maxFiles: 'Максимум {count} файлов',
  selectFiles: 'Выбрать файлы',
  uploading: 'Загрузка...',
  processing: 'Обработка...',
  complete: 'Завершено',
  error: 'Ошибка',
  success: 'Успешно',
  retry: 'Повторить',
  remove: 'Удалить',
  retryAll: 'Повторить все неудачные',
  clearErrors: 'Очистить ошибки',
  title: 'Заголовок',
  titlePlaceholder: 'Введите заголовок документа',
  description: 'Описание',
  descriptionPlaceholder: 'Введите описание документа',
  tags: 'Теги',
  tagsPlaceholder: 'Добавьте теги (нажмите Enter)',
  category: 'Категория',
  selectCategory: 'Выберите категорию',
  advancedOptions: 'Дополнительные параметры',
  showAdvancedOptions: 'Показать дополнительные параметры',
  hideAdvancedOptions: 'Скрыть дополнительные параметры',
  initializingKnowledgeBase: 'Инициализация личной базы знаний...',
  uploadSuccess: 'Документы успешно загружены!',
  uploadError: 'Не удалось загрузить документы. Пожалуйста, попробуйте снова.',
  fileTypeError: 'Неподдерживаемый тип файла: {type}. Пожалуйста, загружайте PDF, Word, текстовые или CSV файлы.',
  fileSizeError: 'Размер файла превышает лимит {size}MB. Пожалуйста, выберите файл меньшего размера.',
  emptyFileError: 'Файл пустой. Пожалуйста, выберите корректный файл.',
  largeFileWarning: 'Обнаружен большой файл. Обработка может занять больше времени.',
  imageFileWarning: 'Большой файл изображения. Сжатие может ускорить обработку.',
  noFilesSelected: 'Файлы для загрузки не выбраны.',
  allFilesProcessed: 'Все файлы обработаны.',
  
  // Upload Modal - Progressive Steps
  modal: {
    title: 'Загрузка документов',
    subtitle: 'Добавьте медицинскую литературу, исследовательские работы и клинические документы в вашу базу знаний',
    
    // Step indicators
    steps: {
      select: 'Выбор',
      configure: 'Настройка', 
      upload: 'Загрузка',
      complete: 'Завершение'
    },
    
    // Select step
    select: {
      title: 'Перетащите файлы сюда',
      subtitle: 'или нажмите для выбора файлов с вашего компьютера',
      selectFiles: 'Выбрать файлы',
      dropFiles: 'Отпустите файлы здесь',
      supportedTypes: 'Поддерживаемые типы файлов',
      maxSizeNote: 'Максимальный размер файла: {size}MB • Максимум файлов: {maxFiles}'
    },
    
    // Configure step
    configure: {
      title: 'Настройка документов',
      filesSelected: '{count} файл выбран|{count} файла выбрано|{count} файлов выбрано',
      documentTitle: 'Заголовок документа',
      documentTitleRequired: 'Заголовок документа *',
      titlePlaceholder: 'Введите заголовок документа...',
      description: 'Описание',
      descriptionPlaceholder: 'Краткое описание содержимого документа...',
      category: 'Категория',
      tags: 'Теги',
      tagsPlaceholder: 'Добавьте теги через запятую...',
      addMoreFiles: 'Добавить больше файлов',
      startUpload: 'Начать загрузку'
    },
    
    // Upload step
    upload: {
      title: 'Загрузка документов',
      subtitle: 'Обработка ваших файлов и добавление их в базу знаний...',
      uploading: 'Загрузка...',
      complete: 'Завершено',
      failed: 'Неудачно'
    },
    
    // Complete step
    complete: {
      title: 'Загрузка завершена!',
      subtitle: 'Ваши документы успешно добавлены в базу знаний.',
      continueButton: 'Перейти к базе знаний'
    },
    
    // Error handling
    errors: {
      vectorStoreInit: 'Не удалось инициализировать базу знаний. Пожалуйста, попробуйте снова.',
      uploadFailed: '{count} загрузка не удалась|{count} загрузки не удались|{count} загрузок не удалось'
    }
  },

  // Categories
  categories: {
    'research-papers': '🔬 Исследовательские работы',
    'clinical-guidelines': '🏥 Клинические руководства',
    'case-studies': '👤 Клинические случаи',
    'medical-images': '🩻 Медицинские изображения',
    'lab-results': '🧪 Лабораторные результаты',
    'patient-education': '📖 Обучение пациентов',
    'protocols': '📋 Протоколы',
    'reference-materials': '📚 Справочные материалы',
    'personal-notes': '📝 Личные заметки',
    'other': '📄 Другое'
  },
  
  // File types
  fileTypes: {
    'pdf': 'PDF документ',
    'word-doc': 'Word документ (.doc)',
    'word-docx': 'Word документ (.docx)',
    'excel': 'Excel',
    'text': 'Текстовый файл',
    'markdown': 'Markdown файл',
    'csv': 'CSV файл',
    'unknown': 'Неизвестный'
  },
  
  // Status
  status: {
    pending: 'В ожидании',
    uploading: 'Загрузка',
    processing: 'Обработка',
    complete: 'Завершено',
    success: 'Успешно',
    error: 'Ошибка',
    ready: 'Готово'
  },
  
  // DocumentList translations
  list: {
    noDocuments: 'Документы еще не загружены',
    noDocumentsFiltered: 'Документы не найдены',
    uploadFirstDocument: 'Загрузите ваш первый медицинский документ для начала работы с ИИ-анализом и интеллектуальным управлением документами.',
    adjustSearchCriteria: 'Попробуйте изменить критерии поиска или фильтры, чтобы найти то, что ищете.',
    uploadFirstButton: 'Загрузить ваш первый документ',
    showing: 'Показано',
    of: 'из',
    documents: 'документов',
    moreResultsAvailable: 'Доступно больше результатов',
    showingFirst: 'Показано первых {count} документов. Используйте фильтры для сужения результатов.'
  },
  
  // DocumentItem translations
  item: {
    viewDetails: 'Просмотреть детали документа',
    downloadDocument: 'Скачать документ',
    deleteDocument: 'Удалить документ',
    processingError: 'Ошибка обработки',
    moreTagsIndicator: '+{count} еще',
    statusLabels: {
      completed: 'Готово',
      processing: 'Обработка',
      pending: 'В ожидании',
      failed: 'Ошибка'
    }
  },
  
  // Status messages
  statuses: {
    pending: 'Ожидает загрузки',
    uploading: 'Загрузка файла...',
    processing: 'Обработка документа...',
    complete: 'Обработка завершена',
    success: 'Успешно загружено',
    error: 'Загрузка не удалась'
  },
  
  // Action messages
  selectedFiles: '{count} файл выбран|{count} файла выбрано|{count} файлов выбрано',
  filesUploaded: '{count} загружено',
  filesFailed: '{count} не удалось',
  filesSelected: '{count} файл выбран|{count} файла выбрано|{count} файлов выбрано',
  uploadButton: 'Загрузить {count} документ|Загрузить {count} документа|Загрузить {count} документов',
  retryCount: 'Попытка #{count}',
  retryInstruction: 'Нажмите кнопку повтора или попробуйте загрузить снова.',
  uploadSuccessMessage: 'Загрузка успешна! Обработка в фоновом режиме...',
  clearAll: 'Очистить все',
  close: 'Закрыть',
  cancel: 'Отмена',
  dropFiles: 'Отпустите файлы здесь',
  
  // Statistics section
  stats: {
    totalDocuments: 'Всего документов',
    completed: 'Завершено',
    processing: 'Обрабатывается',
    storageUsed: 'Использовано хранилища'
  },
  
  // Actions
  actions: {
    uploadDocument: 'Загрузить документ',
    refresh: 'Обновить',
    searchPlaceholder: 'Поиск документов...'
  },

  // File upload section from hardcoded strings
  fileUpload: {
    types: {
      'medical-images': 'Медицинское изображение',
      'lab-results': 'Лабораторный результат', 
      'referral-letters': 'Направление',
      'discharge-summaries': 'Выписной эпикриз',
      'diagnostic-reports': 'Диагностическое заключение',
      'other': 'Документ'
    },
    messages: {
      dropFiles: 'Отпустите файлы здесь',
      clickOrDrag: 'Нажмите или перетащите файлы для загрузки',
      processingFailed: 'Обработка не удалась'
    }
  }
}; 