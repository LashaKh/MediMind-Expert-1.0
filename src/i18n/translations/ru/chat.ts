export const chat = {
  title: 'ИИ Чат',
  placeholder: 'Введите ваше сообщение...',
  send: 'Отправить',
  sendMessage: 'Отправить сообщение',
  typing: 'Набирает...',
  connecting: 'Подключение...',
  connected: 'Подключено',
  disconnected: 'Отключено',
  reconnecting: 'Переподключение...',
  error: 'Ошибка чата',
  retry: 'Повторить',
  clear: 'Очистить чат',
  newChat: 'Новый чат',
  attachFile: 'Прикрепить файл',
  uploadImage: 'Загрузить изображение',
  recordAudio: 'Записать аудио',
  stopRecording: 'Остановить запись',
  playAudio: 'Воспроизвести аудио',
  pauseAudio: 'Приостановить аудио',
  deleteMessage: 'Удалить сообщение',
  editMessage: 'Редактировать сообщение',
  copyMessage: 'Копировать сообщение',
  shareMessage: 'Поделиться сообщением',
  timestamp: 'Время',
  assistant: 'Ассистент',
  user: 'Пользователь',
  system: 'Система',
  
  // Basic chat functionality from English version
  searchPlaceholder: 'Поиск разговоров...',
  noConversations: 'Пока нет разговоров',
  noConversationsFound: 'Разговоры не найдены',
  selectConversation: 'Выберите разговор или начните новый',
  typeMessage: 'Введите ваше сообщение...',
  startConversation: 'Начните разговор с MediMind AI',
  processing: 'Обработка...',
  chatWindow: 'Окно чата',
  messageHistory: 'История сообщений',
  welcomeTitle: 'Добро пожаловать в ИИ Ко-пилот',
  welcomeMessage: 'Спросите меня о медицинских случаях, руководствах или получите помощь в клинических решениях.',
  aiTyping: 'ИИ печатает...',
  
  // Status indicators
  online: 'Онлайн',
  offline: 'Офлайн',
  
  // Specialty titles
  cardiologyAICoPilot: 'ИИ Ко-пилот по кардиологии',
  obgynAICoPilot: 'ИИ Ко-пилот по акушерству-гинекологии',
  medicalAICoPilot: 'Медицинский ИИ Ко-пилот',
  
  // Personal knowledge base guidance
  usingPersonalDocs: 'Используются ваши {count} личных документов',
  uploadDocsForKB: 'Загрузите документы для создания личной базы знаний',
  
  // Welcome screen content
  welcomeToMediMind: 'Добро пожаловать в MediMind Expert',
  welcomeDescription: 'Ваш медицинский ИИ ко-пилот готов помочь с клиническими решениями, руководствами, анализом случаев и основанными на доказательствах рекомендациями.',
  
  // Feature cards
  clinicalGuidelines: 'Клинические руководства',
  clinicalGuidelinesExample: '"Каковы рекомендации ACC/AHA по лечению гипертонии?"',
  caseAnalysis: 'Анализ случая',
  caseAnalysisExample: '"Помогите мне проанализировать этого 65-летнего пациента с болью в груди"',
  drugInformation: 'Информация о лекарствах',
  drugInformationExample: '"Каковы противопоказания для бета-блокаторов?"',
  
  // Knowledge base status
  usingGeneralMedicalKnowledge: 'Используется общая медицинская база знаний',
  generalMedicalKnowledge: 'Общая медицинская база знаний',
  
  // Button tooltips
  viewAllCases: 'Просмотреть все случаи',
  viewConversationHistory: 'Просмотреть историю разговоров',
  startNewConversation: 'Начать новый разговор',
  
  // Error messages
  connectToStartChatting: 'Подключитесь, чтобы начать чат...',
  dismiss: 'Закрыть',
  
  // Loading states
  loadingConversationHistory: 'Загрузка истории разговоров...',
  analyzingQuery: 'Анализ вашего запроса...',
  
  // Default conversation title
  defaultChatTitle: 'Чат',
  
  // Case management
  caseReceived: 'Я получил случай "{{title}}". Я готов помочь вам проанализировать этот случай и предоставить клинические рекомендации.',
  caseSummary: 'Краткое описание случая:',
  caseDiscussionPrompt: 'Какой конкретный аспект этого случая вы хотели бы обсудить в первую очередь?',
  
  // File upload additional
  personalDocsAvailable: '{count} личных документов доступно',
  noPersonalDocs: 'Личные документы не загружены',
  maxFilesError: 'Максимум {maxFiles} файлов разрешено',
  
  sources: {
    title: 'Источники',
    viewAll: 'Посмотреть все',
    hide: 'Скрыть',
    citation: 'Цитата',
    reference: 'Ссылка'
  },
  suggestions: {
    title: 'Предложения',
    calculators: 'Рекомендуемые калькуляторы',
    tryThis: 'Попробуйте это'
  },
  fileUpload: {
    dragDrop: 'Перетащите файлы сюда или нажмите для выбора',
    selectFile: 'Выбрать файл',
    uploading: 'Загрузка...',
    uploaded: 'Загружено',
    failed: 'Ошибка загрузки',
    maxSize: 'Максимальный размер файла: {{size}}',
    allowedTypes: 'Разрешенные типы: {{types}}'
  },
  selectFiles: 'Выбрать файлы',
  // Newly added keys
  processingFile: 'Обработка {fileName}',
  textExtracted: '✓ Текст извлечен ({count} символов)',
  largeDocumentsSummarized: 'Крупные документы будут суммированы для соблюдения ограничений контекста',
  textExtractedFromCount: 'Текст извлечен из {count} файла(ов)',
  extractedContentIncluded: 'Извлеченное содержимое будет включено в ваше сообщение для лучшего контекста для ИИ',
  selectCaseDocuments: 'Выбрать документы случая',
  selectFromCaseDocuments: 'Выберите из {count} документов случая',
  fileProcessFailed: 'Не удалось обработать файлы. Повторите попытку.',
  analyzeAttachedDocuments: 'Пожалуйста, проанализируйте прикрепленные документы:',
  messageSendFailed: 'Не удалось отправить сообщение. Повторите попытку.',
  actionPlan: {
    noActionPlan: 'План действий недоступен',
    noActionPlanDesc: 'Клинические рекомендации появятся здесь после генерации.',
    title: 'Клинический план действий',
    aiEnhanced: 'С улучшением ИИ',
    subtitle: 'Рекомендации по лечению и протоколы ухода, основанные на доказательствах',
    copy: 'Копировать',
    copied: 'Скопировано!',
    export: 'Экспорт',
    showRaw: 'Показать исходный текст',
    hideRaw: 'Скрыть исходный текст',
    rawContentTitle: 'Исходное содержимое плана действий',
    priority: {
      critical: 'Критический',
      high: 'Высокий',
      medium: 'Средний',
      low: 'Низкий'
    },
    issueAddressed: 'Проблема решена',
    clickToViewDetails: 'Нажмите, чтобы посмотреть детали лечения'
  },
  abg: {
    active: 'Анализ газов крови активен',
    contextActive: 'Контекст анализа газов крови активен',
    loading: 'Контекст загружается...',
    loaded: 'Контекст загружен! Задавайте вопросы по анализу, интерпретации или рекомендациям по лечению.',
    placeholder: 'Спросите об анализе газов крови, интерпретации или рекомендациях по лечению...'
  },
  patient: 'Пациент',
  connectionIssue: 'Проблема соединения',
  conversationHistory: 'История разговоров',
  createCaseStudy: 'Создать клинический случай',
  specialtyTitles: {
    cardiologyExpert: 'Эксперт ИИ по кардиологии',
    obgynExpert: 'Эксперт ИИ по акушерству и гинекологии',
    medicalExpert: 'Медицинский эксперт ИИ'
  },
  specialtySubtitles: {
    cardiology: 'Расширенная помощь в области сердечно-сосудистой системы',
    obgyn: 'Здоровье женщин и репродуктивная медицина',
    medical: 'Комплексная медицинская помощь'
  },
  quickActions: {
    caseDesc: 'Начните анализ клинического случая с помощью ИИ',
    calculatorsDesc: 'Доступ к клиническим калькуляторам и оценке рисков',
    guidelinesDesc: 'Поиск медицинских протоколов, основанных на доказательствах',
    discussionDesc: 'Начните медицинскую консультацию с ИИ'
  },
  features: {
    aiPoweredAnalysis: 'Продвинутая медицинская логика и поддержка принятия решений',
    evidenceBasedDesc: 'Курируется из 2,5 млн+ медицинских источников и руководств',
    realTimeDesc: 'Мгновенные ответы для клинического принятия решений',
    specialtyFocusedDesc: 'Экспертиза, адаптированная под вашу специальность'
  },
  welcomeTo: 'Добро пожаловать в',
  liveAt: 'Время',
  aiReady: 'ИИ готов',
  recentCases: 'Недавние случаи',
  startTypingOrSelectAction: 'Начните с ввода сообщения ниже или выберите действие выше',
  aiAssistantReady: 'ИИ-помощник готов'
};

export default chat; 