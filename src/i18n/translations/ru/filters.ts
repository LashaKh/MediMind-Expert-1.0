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
    subtitle: 'Популярные сочетания для распространённых медицинских поисков',

    // Quick filter presets
    presets: {
      // Medical Specialty Filters
      cardiologyGuidelines: {
        name: 'Кардиологические рекомендации',
        description: 'Новейшие рекомендации по лечению и протоколы в кардиологии'
      },
      cancerResearch: {
        name: 'Исследования рака',
        description: 'Новейшие онкологические статьи и клинические исследования'
      },
      neurologyReferences: {
        name: 'Справочники по неврологии',
        description: 'Всеобъемлющие учебники и справочники по неврологии'
      },

      // Content Type Filters
      systematicReviews: {
        name: 'Систематические обзоры',
        description: 'Высококачественные систематические обзоры и мета-анализы'
      },
      clinicalGuidelines: {
        name: 'Клинические рекомендации',
        description: 'Клинические рекомендации, основанные на доказательствах'
      },
      medicalEducation: {
        name: 'Медицинское образование',
        description: 'Материалы CME, клинические случаи и обучающие ресурсы'
      },

      // Quality & Authority Filters
      highImpactStudies: {
        name: 'Высокоцитируемые исследования',
        description: 'Часто цитируемые исследования из ведущих журналов'
      },
      governmentSources: {
        name: 'Государственные источники',
        description: 'Официальная государственная медицинская информация'
      },

      // Audience-Specific Filters
      patientEducation: {
        name: 'Обучение пациентов',
        description: 'Понятная пациентам медицинская информация и ресурсы'
      },
      medicalStudents: {
        name: 'Для студентов-медиков',
        description: 'Образовательный контент для студентов-медиков'
      },

      // Recent & Access Filters
      latestResearch: {
        name: 'Новейшие исследования',
        description: 'Самые свежие медицинские исследования и открытия'
      },
      openAccess: {
        name: 'Открытый доступ',
        description: 'Свободно доступная медицинская литература'
      },

      // Advanced Combinations
      breakthroughResearch: {
        name: 'Прорывные исследования',
        description: 'Революционные медицинские открытия и инновации'
      }
    },

    // Badges
    badges: {
      premium: 'Премиум',
      popular: 'Популярно'
    },

    // Save dialog
    saveDialog: {
      title: 'Сохранить комбинацию фильтров',
      placeholder: 'Введите название фильтра...'
    },

    empty: 'Не найдено быстрых фильтров для этой категории',
    saveCurrent: 'Сохранить текущие'
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
  },

  // Button labels and actions
  button: {
    label: 'Фильтры'
  },

  clearAll: 'Очистить все фильтры',

  // Filter preview
  preview: {
    results: 'Предпросмотр результатов',
    previewShort: 'Предпросмотр'
  },
  changesNotApplied: 'Изменения ещё не применены',
  save: 'Сохранить фильтры',
  filterCategories: {
    all: 'Все фильтры',
    specialty: 'Медицинские специальности',
    content: 'Типы контента',
    quality: 'Качество и авторитетность',
    audience: 'Аудитория',
    recent: 'Недавние',
    access: 'Доступ'
  },
  active: 'фильтр активен',

  // Authority & Quality Filters
  authorityQuality: {
    title: 'Авторитетность и качество',
    description: 'Фильтруйте по надёжности источника, статусу рецензирования и качеству доказательств',

    sections: {
      government: 'Государственные источники',
      professionalSocieties: 'Профессиональные общества',
      academicInstitutions: 'Академические учреждения',
      publishers: 'Издатели и журналы',
      medicalOrganizations: 'Медицинские организации'
    },

    // Государственные источники
    authorities: {
      government: {
        cdc: {
          name: 'CDC',
          description: 'Центры по контролю и профилактике заболеваний',
          examples: ['Эпиднадзор за заболеваниями', 'Рекомендации общественного здравоохранения']
        },
        fda: {
          name: 'FDA',
          description: 'Управление по санитарному надзору за качеством пищевых продуктов и медикаментов',
          examples: ['Одобрение лекарств', 'Сообщения о безопасности']
        },
        nih: {
          name: 'NIH',
          description: 'Национальные институты здравоохранения',
          examples: ['Финансирование исследований', 'Клинические рекомендации']
        },
        who: {
          name: 'ВОЗ',
          description: 'Всемирная организация здравоохранения',
          examples: ['Глобальные рекомендации по здравоохранению', 'Классификация заболеваний']
        }
      },
      professionalSocieties: {
        aha: {
          name: 'AHA',
          description: 'Американская ассоциация сердца',
          examples: ['Кардиологические рекомендации', 'Протоколы СЛР']
        },
        acs: {
          name: 'ACS',
          description: 'Американское онкологическое общество',
          examples: ['Скрининг рака', 'Рекомендации по лечению']
        },
        asco: {
          name: 'ASCO',
          description: 'Американское общество клинической онкологии',
          examples: ['Онкологические рекомендации', 'Рекомендации по лечению']
        },
        acp: {
          name: 'ACP',
          description: 'Американская коллегия врачей',
          examples: ['Рекомендации по внутренним болезням', 'Лучшие практики']
        }
      },
      academicInstitutions: {
        harvard: {
          name: 'Гарвардская медицинская школа',
          description: 'Ведущий центр медицинского образования и исследований',
          examples: ['Медицинские исследования', 'Клинические исследования']
        },
        mayo: {
          name: 'Клиника Мэйо',
          description: 'Интегрированная клиническая практика и исследования',
          examples: ['Клинические рекомендации', 'Протоколы ухода за пациентами']
        },
        hopkins: {
          name: 'Джонс Хопкинс',
          description: 'Лидер медицинских исследований и образования',
          examples: ['Исследовательские публикации', 'Клинические протоколы']
        }
      },
      publishers: {
        nejm: {
          name: 'Медицинский журнал Новой Англии',
          description: 'Премьер-журнал медицины',
          examples: ['Высокоцитируемые исследования', 'Клинические испытания']
        },
        lancet: {
          name: 'Ланцет',
          description: 'Ведущий международный медицинский журнал',
          examples: ['Исследования глобального здравоохранения', 'Клинические исследования']
        },
        bmj: {
          name: 'BMJ',
          description: 'Британский медицинский журнал',
          examples: ['Доказательная медицина', 'Клинические исследования']
        },
        jama: {
          name: 'JAMA',
          description: 'Журнал Американской медицинской ассоциации',
          examples: ['Клинические исследования', 'Медицинские рекомендации']
        }
      },
      medicalOrganizations: {
        uptodate: {
          name: 'UpToDate',
          description: 'Ресурс поддержки клинических решений',
          examples: ['Клинические рекомендации', 'Информация в месте оказания помощи']
        },
        cochrane: {
          name: 'Кокрейновская библиотека',
          description: 'Систематические обзоры и синтез доказательств',
          examples: ['Систематические обзоры', 'Мета-анализы']
        },
        medscape: {
          name: 'Medscape',
          description: 'Медицинская информация и образование',
          examples: ['Медицинские новости', 'Непрерывное образование']
        }
      }
    },

    // Варианты рецензирования
    peerReviewOptions: {
      peerReviewed: {
        label: 'Рецензируемый',
        description: 'Проверено независимыми экспертами'
      },
      editorialReview: {
        label: 'Редакционная проверка',
        description: 'Проверено редакционным персоналом'
      },
      expertConsensus: {
        label: 'Консенсус экспертов',
        description: 'На основе согласия экспертной комиссии'
      }
    },

    // Уровни цитирования
    citationTiers: {
      highlyCited: {
        label: 'Высокоцитируемые',
        impact: 'Высокое влияние',
        description: 'Статьи с высоким количеством цитирований (>100 цитирований)'
      },
      moderatelyCited: {
        label: 'Умеренно цитируемые',
        impact: 'Хорошее влияние',
        description: 'Статьи с умеренным количеством цитирований (10-100 цитирований)'
      }
    },

    peerReview: 'Статус рецензирования',
    peerReviewLabel: 'Рецензирование:',
    citationImpact: 'Влияние цитирования',
    citationTierLabel: 'Уровень цитирования:',

    tips: {
      title: 'Советы по оценке качества',
      gov: 'Государственные источники и крупные профессиональные общества обеспечивают наивысший авторитет',
      peer: 'Рецензируемый контент прошёл независимую экспертную оценку',
      cited: 'Высокоцитируемые статьи указывают на значительное влияние в медицинском сообществе',
      combine: 'Рассмотрите комбинацию нескольких показателей качества для лучших результатов'
    },

    summary: 'Сводка авторитетности и качества'
  },

  // Publication & Access Filters
  publicationAccess: {
    title: 'Публикация и доступ',
    description: 'Фильтруйте по дате публикации, типу доступа и доступности',

    publicationDate: 'Дата публикации',
    accessType: 'Тип доступа',
    language: 'Язык',

    // Диапазоны дат
    dateRanges: {
      lastMonth: {
        label: 'Последний месяц',
        description: 'Опубликовано за последние 30 дней'
      },
      last3Months: {
        label: 'Последние 3 месяца',
        description: 'Опубликовано за последние 90 дней'
      },
      last6Months: {
        label: 'Последние 6 месяцев',
        description: 'Опубликовано за последние 6 месяцев'
      },
      lastYear: {
        label: 'Последний год',
        description: 'Опубликовано за последние 12 месяцев'
      },
      last2Years: {
        label: 'Последние 2 года',
        description: 'Опубликовано за последние 2 года'
      },
      last5Years: {
        label: 'Последние 5 лет',
        description: 'Опубликовано за последние 5 лет'
      }
    },

    // Типы доступа
    accessTypes: {
      openAccess: {
        label: 'Открытый доступ',
        description: 'Свободно доступно для всех',
        badge: 'Бесплатно'
      },
      subscription: {
        label: 'Требуется подписка',
        description: 'Требуется институциональная или личная подписка',
        badge: 'Подписка'
      },
      payPerView: {
        label: 'Индивидуальная покупка',
        description: 'Доступно для индивидуальной покупки',
        badge: 'Платно'
      },
      freeWithRegistration: {
        label: 'Бесплатно с регистрацией',
        description: 'Бесплатный доступ после регистрации пользователя',
        badge: 'Регистрация'
      }
    },

    // Языки
    languages: {
      en: 'Английский',
      es: 'Испанский',
      fr: 'Французский',
      de: 'Немецкий',
      it: 'Итальянский',
      pt: 'Португальский',
      ja: 'Японский',
      zh: 'Китайский',
      ru: 'Русский',
      ar: 'Арабский',
      ka: 'Грузинский'
    },

    tips: {
      title: 'Советы по доступу и публикациям',
      open: 'Контент открытого доступа немедленно доступен без ограничений',
      recent: 'Недавние публикации могут содержать самые современные рекомендации по лечению',
      access: 'Некоторый качественный контент может требовать институционального доступа',
      ranges: 'Рассмотрите несколько диапазонов дат для всестороннего охвата'
    },

    summary: 'Сводка публикаций и доступа',
    summaryRanges: 'Диапазоны дат:',
    summaryAccess: 'Типы доступа:',
    summaryLang: 'Языки:'
  },

  // Geographic & Context Filters
  geographicContext: {
    title: 'География и контекст',
    description: 'Фильтруйте по географической релевантности, условиям практики и популяциям пациентов',

    regions: 'Географические регионы',
    practice: 'Условия практики',
    populations: 'Популяции пациентов',

    // Географические регионы
    geographicRegions: {
      northAmerica: {
        label: 'Северная Америка',
        description: 'США, Канада, Мексика'
      },
      europe: {
        label: 'Европа',
        description: 'Европейский союз и ассоциированные страны'
      },
      asiaPacific: {
        label: 'Азиатско-Тихоокеанский регион',
        description: 'Восточная Азия, Юго-Восточная Азия, Океания'
      },
      latinAmerica: {
        label: 'Латинская Америка',
        description: 'Южная и Центральная Америка'
      },
      middleEastAfrica: {
        label: 'Ближний Восток и Африка',
        description: 'Регион MENA и Африка к югу от Сахары'
      }
    },

    // Условия практики
    practiceSettings: {
      hospitalInpatient: {
        label: 'Стационар больницы',
        description: 'Неотложная помощь, отделения скорой помощи, интенсивная терапия'
      },
      hospitalOutpatient: {
        label: 'Амбулатория больницы',
        description: 'Амбулаторная хирургия, специализированные клиники'
      },
      primaryCare: {
        label: 'Первичная помощь',
        description: 'Семейная медицина, внутренние болезни, педиатрия'
      },
      specialtyClinic: {
        label: 'Специализированная клиника',
        description: 'Специализированные амбулаторные практики'
      },
      homeCare: {
        label: 'Домашний уход',
        description: 'Телемедицина, домашние визиты, дистанционный мониторинг'
      },
      longTermCare: {
        label: 'Долгосрочный уход',
        description: 'Дома престарелых, вспомогательное проживание, реабилитация'
      }
    },

    // Популяции пациентов
    patientPopulations: {
      pediatric: {
        label: 'Педиатрическая',
        ageRange: '0-18',
        description: 'Дети и подростки (0-18 лет)'
      },
      adult: {
        label: 'Взрослые',
        ageRange: '18-65',
        description: 'Взрослые (18-65 лет)'
      },
      geriatric: {
        label: 'Гериатрическая',
        ageRange: '65+',
        description: 'Пожилые пациенты (65+ лет)'
      },
      pregnantWomen: {
        label: 'Беременные женщины',
        ageRange: 'репродуктивный',
        description: 'Пренатальный, перинатальный и постнатальный уход'
      },
      immunocompromised: {
        label: 'Иммунокомпрометированные',
        ageRange: 'все',
        description: 'Пациенты с ослабленной иммунной системой'
      },
      chronicConditions: {
        label: 'Хронические состояния',
        ageRange: 'все',
        description: 'Диабет, гипертония, ХОБЛ и т.д.'
      }
    },

    tips: {
      title: 'Советы по географии и контексту',
      regions: 'Географические фильтры помогают найти региональные рекомендации и практики',
      practice: 'Условия практики определяют протоколы ухода и доступность ресурсов',
      populations: 'Популяции пациентов влияют на подходы к лечению и соображения безопасности',
      combine: 'Рассмотрите комбинацию нескольких контекстов для всестороннего руководства по уходу'
    },

    summary: 'Сводка географии и контекста',
    summaryRegions: 'Географические регионы:',
    summaryPractice: 'Условия практики:',
    summaryPopulations: 'Популяции пациентов:'
  },

  // Medical Domain Filters
  medicalDomain: {
    title: 'Медицинская область и специальности',
    description: 'Фильтруйте по медицинским специальностям, подспециальностям и клиническим темам',

    comingSoon: {
      title: 'Скоро появится',
      body: 'Фильтрация по медицинским специальностям с 25+ специальностями и подспециальностями будет доступна в следующем обновлении.'
    }
  },

  // Audience & Complexity Filters
  audienceComplexity: {
    title: 'Аудитория и уровень сложности',
    description: 'Фильтруйте по целевой аудитории, уровню сложности и сложности чтения'
  },

  // Advanced Options Filters
  advancedOptions: {
    title: 'Дополнительные параметры',
    description: 'Клинические исследования, параметры исследований и специализированные параметры фильтрации',

    trials: 'Фильтрация клинических исследований',

    comingSoon: {
      title: 'Скоро больше дополнительных параметров',
      body: 'Дополнительные специализированные параметры фильтрации для параметров исследований, дизайна исследований и расширенных поисковых операторов будут доступны в будущих обновлениях.'
    }
  }
};

export default filters;

