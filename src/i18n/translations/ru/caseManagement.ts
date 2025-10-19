export const caseManagement = {
  // Modal Header
  createNewCase: 'Создать новый случай',
  editCaseStudy: 'Редактировать случай',
  cardiologyCase: 'Кардиологический случай',
  obgynCase: 'Акушерско-гинекологический случай',
  medicalCase: 'Медицинский случай',

  // Step Headers
  caseOverview: 'Обзор случая',
  caseOverviewDesc: 'Основная информация о случае',
  patientDetails: 'Детали пациента',
  patientDetailsDesc: 'Анонимные данные пациента',
  attachments: 'Вложения',
  attachmentsDesc: 'Медицинские файлы и изображения',
  classification: 'Классификация',
  classificationDesc: 'Категория и сложность',

  // Step 1: Case Overview
  letsStartBasics: 'Начнем с основ',
  provideOverview: 'Укажите четкий заголовок и краткий обзор вашего случая',
  caseTitle: 'Заголовок случая',
  caseTitleRequired: 'Заголовок случая *',
  caseTitlePlaceholder: 'Краткое описательное название для этого случая',
  briefDescription: 'Краткое описание',
  briefDescriptionRequired: 'Краткое описание *',
  briefDescriptionPlaceholder: 'Предоставьте комплексный обзор случая, включая: основную жалобу, соответствующий анамнез, данные обследования, первоначальное впечатление, ключевые вопросы для обсуждения и какие конкретные рекомендации вы ищете...',
  charactersCount: '({count}/1000 символов)',
  charactersCountMin: '({count} символов, минимум 50)',
  makeDescriptionEffective: 'Сделайте описание вашего случая более эффективным:',
  includeChiefComplaint: '• Включите основную жалобу и симптомы',
  mentionHistory: '• Укажите соответствующий медицинский анамнез и лекарства',
  describeFindings: '• Опишите ключевые данные обследования или диагностики',
  stateWorkingDiagnosis: '• Укажите ваш рабочий диагноз или дифференциальный',
  specifyGuidance: '• Укажите, какие рекомендации или обсуждения вам нужны',

  // Step 2: Patient Details
  patientInformation: 'Информация о пациенте',
  provideAnonymizedDetails: 'Укажите анонимизированные данные пациента для обсуждения случая',
  privacyProtectionRequired: 'Требуется защита конфиденциальности',
  ensureAnonymized: 'Пожалуйста, убедитесь, что вся информация о пациенте полностью анонимизирована.',
  removeNames: '• Удалите все имена, даты и конкретные местоположения',
  useGeneralTerms: '• Используйте общие термины (например, "50-летняя женщина")',
  removeIdentifyingNumbers: '• Удалите любые идентифицирующие номера или коды',
  anonymizedPatientInfo: 'Анонимизированная информация о пациенте',
  anonymizedPatientInfoRequired: 'Анонимизированная информация о пациенте *',
  anonymizedPatientInfoPlaceholder: 'Возраст пациента, пол, симптомы, медицинский анамнез, результаты анализов и т.д. (полностью анонимизировано)',
  minimumLengthMet: '✓ Минимальная длина соблюдена',
  needMoreCharacters: 'Нужно еще {count} символов',

  // Step 3: Attachments
  medicalDocuments: 'Медицинские документы',
  attachRelevantFiles: 'Прикрепите соответствующие медицинские файлы, изображения и отчеты',
  filesAttached: '{count} файлов прикреплено',
  fileAttached: '{count} файл прикреплен',
  filesWillBeAnalyzed: 'Эти файлы будут проанализированы для обеспечения лучшего контекста вашего случая',

  // Step 4: Classification
  caseClassification: 'Классификация случая',
  helpOrganize: 'Помогите организовать и расставить приоритеты вашего случая',
  category: 'Категория',
  complexityLevel: 'Уровень сложности',
  complexityLevelRequired: 'Уровень сложности *',

  // Complexity Levels
  lowComplexity: 'Низкая сложность',
  lowComplexityDesc: 'Рутинный случай, четкая презентация',
  mediumComplexity: 'Средняя сложность',
  mediumComplexityDesc: 'Некоторая сложность, несколько факторов',
  highComplexity: 'Высокая сложность',
  highComplexityDesc: 'Сложный случай, несколько специальностей',

  // Tags
  tags: 'Теги',
  tagsOptional: 'Теги (необязательно)',
  tagsPlaceholder: 'гипертония, диабет, экстренный (через запятую)',
  tagsHelp: 'Добавьте соответствующие ключевые слова, чтобы помочь организовать и найти этот случай позже',

  // Categories - Cardiology
  diagnosisAssessment: 'Диагностика и оценка',
  interventionalCardiology: 'Интервенционная кардиология',
  electrophysiology: 'Электрофизиология',
  heartFailure: 'Сердечная недостаточность',
  preventiveCardiology: 'Профилактическая кардиология',
  acuteCardiacCare: 'Острая кардиальная помощь',

  // Categories - OB/GYN
  obstetrics: 'Акушерство',
  gynecology: 'Гинекология',
  reproductiveHealth: 'Репродуктивное здоровье',
  maternalFetal: 'Медицина матери и плода',
  gynecologicOncology: 'Гинекологическая онкология',
  fertilityEndocrinology: 'Фертильность и репродуктивная эндокринология',

  // Categories - General
  diagnosis: 'Диагностика',
  treatment: 'Лечение',
  consultation: 'Консультация',

  // Buttons
  previous: 'Назад',
  next: 'Далее',
  createCase: 'Создать случай',
  updateCase: 'Обновить случай',
  creatingCase: 'Создание случая...',
  updatingCase: 'Обновление случая...',

  // Validation Errors
  caseTitleRequired: 'Заголовок случая обязателен',
  briefDescriptionRequired: 'Краткое описание обязательно',
  patientInfoRequired: 'Информация о пациенте обязательна',
  provideDetailedInfo: 'Пожалуйста, предоставьте более подробную информацию (минимум 50 символов)',
  selectComplexity: 'Пожалуйста, выберите уровень сложности'
};

export default caseManagement;
