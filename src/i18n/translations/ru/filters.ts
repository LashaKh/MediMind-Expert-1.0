export const filters = {
  // Modal
  modal: {
    title: 'Расширенные медицинские фильтры',
    subtitle: 'Уточните поиск с помощью точных фильтров'
  },

  // Categories
  categories: {
    quickFilters: 'Быстрые фильтры',
    quickFiltersDesc: 'Популярные сочетания для распространённых поисков',
    contentFormat: 'Контент и формат',
    contentFormatDesc: 'Фильтр по типу контента, формату файла и структуре документа',
    authorityQuality: 'Авторитетность и качество',
    authorityQualityDesc: 'Надёжность источника, рецензирование и качество доказательств',
    medicalDomain: 'Медицинская область',
    medicalDomainDesc: 'Специальности, подспециальности и клинические темы',
    publicationAccess: 'Публикация и доступ',
    publicationAccessDesc: 'Дата публикации, тип доступа и доступность',
    geographicContext: 'География и контекст',
    geographicContextDesc: 'Географическая релевантность, условия практики и популяции пациентов',
    advancedOptions: 'Дополнительные параметры',
    advancedOptionsDesc: 'Клинические исследования, параметры исследования и специализированные фильтры'
  },

  // Quick filters
  quickFilters: {
    title: 'Быстрые фильтры',
    subtitle: 'Популярные сочетания для распространённых медицинских поисков'
  },

  // Options
  specialty: {
    label: 'Медицинская специальность',
    all: 'Все специальности',
    cardiology: 'Кардиология',
    obgyn: 'Акушерство и гинекология',
    internalMedicine: 'Внутренние болезни',
    emergencyMedicine: 'Неотложная медицина',
    pediatrics: 'Педиатрия',
    surgery: 'Хирургия',
    radiology: 'Радиология',
    pathology: 'Патология'
  },

  evidenceLevel: {
    label: 'Уровень доказательности',
    all: 'Все уровни',
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
    all: 'Все типы',
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
  },

  // Content format (extended)
  contentFormat: {
    title: 'Тип контента и формат',
    description: 'Фильтруйте по конкретным типам медицинского контента и форматам файлов',
    sections: {
      researchLiterature: {
        title: 'Медицинская литература',
        options: {
          studies: { label: 'Клинические исследования', description: 'Наблюдательные и интервенционные исследования' },
          trials: { label: 'Клинические испытания', description: 'Рандомизированные и интервенционные исследования' },
          metaAnalyses: { label: 'Мета‑анализы', description: 'Статистический анализ нескольких исследований' },
          systematicReviews: { label: 'Систематические обзоры', description: 'Комплексный синтез доказательств' }
        }
      },
      clinicalGuidelines: {
        title: 'Клинические рекомендации',
        options: {
          treatmentGuidelines: { label: 'Рекомендации по лечению', description: 'Рекомендации, основанные на доказательствах' },
          diagnosticProtocols: { label: 'Диагностические протоколы', description: 'Стандартизированные диагностические процедуры' },
          bestPractices: { label: 'Лучшие практики', description: 'Профессиональные стандарты практики' }
        }
      },
      medicalReferences: {
        title: 'Медицинские справочники',
        options: {
          textbooks: { label: 'Медицинские учебники', description: 'Всеобъемлющие справочные издания' },
          handbooks: { label: 'Клинические справочники', description: 'Практические клинические руководства' },
          medicalDictionaries: { label: 'Медицинские словари', description: 'Терминология и определения' }
        }
      },
      educationalContent: {
        title: 'Образовательный контент',
        options: {
          cmeMaterials: { label: 'Материалы CME', description: 'Ресурсы непрерывного медицинского образования' },
          caseStudies: { label: 'Клинические случаи', description: 'Презентации случаев и анализ' },
          learningModules: { label: 'Обучающие модули', description: 'Структурированный учебный контент' }
        }
      },
      regulatoryDocs: {
        title: 'Регуляторные документы',
        options: {
          fdaApprovals: { label: 'Одобрения FDA', description: 'Документы об одобрении лекарств и устройств' },
          drugLabels: { label: 'Инструкции к препаратам', description: 'Официальная информация по применению' },
          safetyCommunications: { label: 'Сообщения по безопасности', description: 'Оповещения и уведомления по безопасности' }
        }
      },
      patientResources: {
        title: 'Ресурсы для пациентов',
        options: {
          patientEducation: { label: 'Обучение пациентов', description: 'Образовательные материалы для пациентов' },
          factSheets: { label: 'Информационные листы', description: 'Краткие информационные материалы' },
          brochures: { label: 'Брошюры', description: 'Информационные брошюры для пациентов' }
        }
      }
    }
  },

  fileFormats: {
    title: 'Форматы файлов',
    options: {
      pdf: { label: 'PDF‑документы', description: 'Файлы формата Portable Document' },
      html: { label: 'Веб‑страницы', description: 'HTML‑контент' },
      doc: { label: 'Документы Word', description: 'Документы Microsoft Word' },
      ppt: { label: 'Презентации', description: 'Презентации PowerPoint' },
      video: { label: 'Видео', description: 'Образовательные и клинические видео' },
      audio: { label: 'Аудио', description: 'Подкасты и аудиоконтент' }
    }
  },

  summary: {
    title: 'Сводка фильтров',
    fileFormatsLabel: 'Форматы файлов:',
    activeFilters: 'Активные фильтры',
    categories: 'Категории',
    none: 'Нет активных фильтров',
    one: '1 активный фильтр',
    many: '{{count}} активных фильтра'
  }
};

export default filters;

