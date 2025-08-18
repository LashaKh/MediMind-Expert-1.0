const abg = {
  history: {
    title: 'История ABG',
    resultsCount: '{{count}} результатов',
    filteredByPatient: 'Фильтр по пациенту',
    comprehensiveView: 'Расширенный просмотр истории',
    updatedAt: 'Обновлено {{time}}',
    select: 'Выбрать',
    newAnalysis: 'Новый анализ',
    bulk: {
      selectHelp: 'Выберите элементы для удаления или экспорта',
      selectedResults: 'Выбрано {{count}} результат(ов)',
      allSelected: 'Выбраны все ({{count}})',
      selectAllCount: 'Выбрать все ({{count}})',
      clearSelection: 'Снять выделение',
      exportSelected: 'Экспорт выбранного',
      deleteSelected: 'Удалить выбранное'
    },
    cards: {
      total: 'Итого',
      recent: 'Недавно',
      trend: 'Тренд',
      weeklyAvg: 'Ср. за неделю'
    },
    progress: {
      activity: 'Активность анализа',
      vsAverage: '{{percent}}% vs ср.',
      lastUpdated: 'Последнее обновление: {{time}}'
    }
  },
  workflow: {
    aria: {
      progress: 'Прогресс анализа газов крови'
    },
    progressComplete: '{{percent}}% выполнено',
    steps: {
      uploadStep: {
        label: 'Загрузка',
        description: 'Выберите отчёт газов крови'
      },
      analysis: {
        label: 'Анализ',
        description: 'Визуальная обработка ИИ'
      },
      interpretation: {
        label: 'Интерпретация',
        description: 'Клинический анализ'
      },
      actionPlan: {
        label: 'План действий (по желанию)',
        description: 'Необязательные рекомендации по лечению'
      }
    },
    subphases: {
      extraction: 'Извлечение текста',
      interpretation: 'Клинический анализ'
    },
    completeTitle: 'Анализ завершён!',
    error: 'Ошибка обработки'
  },
  delete: {
    titleOne: 'Удалить результат ABG?',
    titleMany: 'Удалить {{count}} результатов ABG?',
    cannotUndo: 'Это действие нельзя отменить',
    deleting: 'Удаление...',
    complete: 'Удаление завершено',
    successMany: 'Успешно удалено {{count}} результатов',
    failed: 'Не удалось удалить',
    errorsTitle: 'Возникли ошибки:',
    completedIn: 'Завершено за {{ms}} мс',
    cannotDelete: 'Невозможно удалить',
    pleaseNote: 'Обратите внимание',
    previewTitle: 'Будет удалено:',
    preview: {
      results: 'Результаты',
      dataSize: 'Размер данных',
      images: 'Изображения',
      daySpan: 'Диапазон дней',
      listTitle: 'Результаты к удалению:',
      imageTag: 'Изображение'
    },
    deleteOne: 'Удалить результат',
    deleteMany: 'Удалить {{count}} результатов'
  }
  ,
  export: {
    title: 'Экспорт результатов ABG',
    format: 'Формат экспорта',
    dateRange: 'Диапазон дат (опционально)',
    startDate: 'Дата начала',
    endDate: 'Дата окончания',
    clearDateRange: 'Очистить диапазон дат',
    include: 'Включить в экспорт',
    includeFields: {
      patientInfo: 'Информация о пациенте',
      patientInfoDesc: 'Имя, дата рождения, MRN',
      interpretation: 'Клиническая интерпретация',
      interpretationDesc: 'Клинический анализ, сгенерированный ИИ',
      actionPlan: 'Планы действий',
      actionPlanDesc: 'Рекомендации по лечению',
      images: 'Ссылки на изображения',
      imagesDesc: 'Ссылки на загруженные изображения'
    },
    summary: {
      title: 'Сводка экспорта',
      results: 'Результаты',
      resultsOf: '{{filtered}} из {{total}}',
      estimatedSize: 'Оценочный размер',
      includedFields: 'Включённые поля'
    },
    failed: 'Не удалось экспортировать',
    success: 'Экспорт успешно выполнен',
    downloaded: 'Ваш файл загружен.',
    exporting: 'Экспорт...',
    export: 'Экспорт {{format}}',
    tips: {
      json: 'Формат JSON включает все данные с сохранением структуры',
      csv: 'CSV подходит для табличных приложений',
      large: 'Большие выгрузки могут занять некоторое время'
    }
  }
  ,
  results: {
    title: 'Результаты ABG',
    export: 'Экспорт',
    searchPlaceholder: 'Поиск по результатам...',
    sort: {
      newestfirst: 'Сначала новые',
      oldestfirst: 'Сначала старые',
      "typea-z": 'Тип A-Z',
      highestconfidence: 'Наивысшая уверенность'
    },
    filters: {
      title: 'Фильтры',
      button: 'Фильтры',
      type: 'Тип',
      allTypes: 'Все типы',
      types: {
        arterial: 'Артериальные газы крови',
        venous: 'Венозные газы крови'
      },
      dateRange: 'Диапазон дат',
      startDate: 'Дата начала',
      endDate: 'Дата окончания',
      hasInterpretation: 'Есть интерпретация',
      hasActionPlan: 'Есть план действий'
    },
    showing: 'Показано {{count}} результатов',
    showingMore: 'Показано {{count}} результатов (прокрутите для дополнительных)',
    loadFailed: 'Не удалось загрузить результаты',
    loadingMore: 'Загрузка дополнительных результатов...',
    badges: {
      interpreted: 'Интерпретировано',
      actionPlan: 'План действий'
    },
    empty: {
      title: 'Результаты не найдены',
      tips: 'Попробуйте изменить параметры поиска или фильтры',
      noResults: 'Результаты ABG ещё не созданы'
    },
    end: 'Конец результатов',
    na: 'Н/Д'
  }
  ,
  filtersAdvanced: {
    title: 'Расширенные фильтры',
    activeCount: '{{count}} активно',
    clear: 'Очистить',
    patient: 'Пациент',
    allPatients: 'Все пациенты',
    analysisType: 'Тип анализа',
    quickDates: 'Быстрые даты',
    selectPeriod: 'Выберите период...',
    datePresets: {
      1: 'Сегодня',
      3: 'Последние 3 дня',
      7: 'Последняя неделя',
      30: 'Последний месяц',
      90: 'Последние 3 месяца'
    },
    statusFilters: 'Фильтры статуса',
    presets: {
      recent: { name: 'Недавние анализы' },
      pending: { name: 'Ожидают проверки' },
      completed: { name: 'Завершено' },
      arterial: { name: 'Только артериальные' },
      thisMonth: { name: 'Этот месяц' }
    },
    saveSearch: {
      title: 'Сохранить поиск',
      saveCurrent: 'Сохранить текущий',
      placeholder: 'Название поиска...'
    },
    savedSearches: 'Сохранённые поиски'
  }
  ,
  analysis: {
    loading: {
      title: 'Идёт анализ ИИ',
      subtitle: 'Наш продвинутый ИИ анализирует ваш отчёт газов крови с использованием современных технологий компьютерного зрения.'
    },
    error: {
      title: 'Сбой анализа'
    },
    empty: 'Результаты анализа отсутствуют',
    header: {
      title: 'Анализ завершён',
      subtitle: 'Результаты анализа газов крови с помощью ИИ'
    },
    waitingData: 'Результаты анализа появятся после обработки...',
    moreValues: '... и ещё {{count}} значений',
    edit: {
      title: 'Редактировать анализ',
      reanalyzing: 'Повторный анализ...',
      save: 'Сохранить и повторно проанализировать',
      placeholder: 'Введите текст анализа...'
    },
    raw: {
      title: 'Исходные данные анализа',
      badge: 'Сгенерировано ИИ',
      reviewHint: 'Проверьте и при необходимости отредактируйте'
    },
    linesTotal: '{{count}} строк всего',
    parameters: {
      title: 'Параметры газов крови'
    },
    complete: {
      title: 'Полный анализ'
    }
    ,
    backToUpload: 'Назад к загрузке',
    getInterpretation: 'Получить клиническую интерпретацию'
  }
  ,
  common: {
    show: 'Показать',
    hide: 'Скрыть',
    clickToExpand: 'Нажмите, чтобы развернуть'
  }
  ,
  interpretation: {
    title: 'Клиническая интерпретация',
    subtitle: 'Клинический анализ, сгенерированный ИИ',
    summary: 'Клиническое резюме:',
    waiting: 'Клиническая интерпретация появится после анализа...'
  }
  ,
  trends: {
    tabs: {
      volume: 'Тренды объёма анализов',
      quality: 'Показатели качества',
      performance: 'Аналитика производительности',
      distribution: 'Распределение анализов'
    },
    descriptions: {
      volume: 'Ежедневное количество анализов во времени',
      quality: 'Тренды уверенности и успеха',
      performance: 'Тренды времени обработки',
      distribution: 'Распределение по типам и качеству'
    },
    volume: {
      dailyTitle: 'Ежедневный объём анализов',
      lineTitle: 'Количество анализов в день',
      statsTitle: 'Статистика объёма',
      peakDaily: 'Пиковый день',
      dailyAverage: 'Среднее за день',
      total: '{{count}} всего',
      subtitle: 'Анализы за выбранный период'
    },
    quality: {
      title: 'Тренды качества',
      confidenceTitle: 'Средняя оценка уверенности (%)',
      successTitle: 'Доля успеха',
      successLine: 'Доля успеха (%)'
    },
    performance: {
      title: 'Время обработки',
      lineTitle: 'Среднее время обработки (мс)',
      metrics: 'Метрики производительности',
      fastest: 'Самое быстрое (мс)',
      slowest: 'Самое медленное (мс)'
    },
    distribution: {
      typesTitle: 'Типы анализов',
      typeLine: 'Распределение типов анализов',
      confidenceTitle: 'Распределение уверенности',
      confidenceLine: 'Распределение оценок уверенности'
    },
    insights: {
      title: 'Ключевые выводы',
      volume: 'Тренд объёма',
      increasing: 'Объём анализов растёт со временем',
      stable: 'Объём анализов стабилен или снижается',
      quality: 'Оценка качества',
      avgConfidence: 'Средняя уверенность: {{val}}%',
      performance: 'Производительность',
      avgProcessing: 'Среднее время: {{ms}} мс'
    }
  }
  ,
  final: {
    comprehensiveInsights: 'Ваш анализ ABG готов с подробными выводами',
    premium: 'Премиум',
    aiClinicalConsultation: 'Клиническая консультация ИИ',
    selectActionPlan: 'Выбрать план действий',
    analysisComplete: 'Анализ: завершён',
    accuracy: 'Точность: 99,8%',
    backToResults: 'Назад к результатам'
  }
  ,
  actionPlan: {
    creating: 'Создание плана действий',
    generating: 'Формирование персонализированных рекомендаций по лечению и протоколов ухода на основе результатов анализа.',
    failed: 'Не удалось сформировать план действий',
    retry: 'Повторить генерацию',
    none: 'План действий отсутствует',
    title: 'План действий',
    subtitle: 'Персональные рекомендации по лечению и протоколы ухода',
    total: 'Всего действий',
    priority: 'Приоритет',
    completed: 'Выполнено',
    progress: 'Прогресс',
    overallProgress: 'Общий прогресс',
    clinicalGoals: 'Клинические цели',
    clinicalGoalsSubtitle: 'Целевые результаты и задачи лечения'
  }
  ,
  selector: {
    title: 'Выберите планы действий для консультации ИИ',
    subtitle: 'Выберите, какие планы действий включить в консультацию с ИИ',
    selectAll: 'Выбрать все',
    deselectAll: 'Снять выделение',
    selectedCount: 'Выбрано {{selected}} из {{total}}',
    noItems: 'Пункты плана действий не найдены',
    selectedForConsult: 'Для консультации ИИ выбрано {{count}} пункт(ов)',
    selectForConsult: 'აირჩიეთ გეგმები კონსულტაციისთვის',
    aiConsult: 'Консультация ИИ ({{count}})'
  }
  ,
  search: {
    intelligentFiltering: 'Интеллектуальная фильтрация ABG с помощью ИИ',
    quickSearches: 'Быстрый поиск:',
    clear: 'Очистить поиск',
    categories: 'Категории поиска',
    categoriesDesc: 'Изучите различные аспекты ваших данных ABG',
    query: 'Поисковый запрос',
    resetAll: 'Сбросить все фильтры',
    filtersActive: 'активных фильтров',
    noFilters: 'Фильтры не применены',
    searching: 'Поиск...',
    apply: 'Применить поиск',
    quick: 'Быстрый поиск',
    close: 'Закрыть окно',
    aiPowered: 'На базе ИИ'
  }
  ,
  header: {
    medicalGradeAI: 'Медицинский ИИ',
    viewHistoryAria: 'Просмотр истории анализа',
    viewHistory: 'История',
    title: 'Анализ газов крови',
    subtitle: 'Загрузите отчёт газов крови для мгновенного анализа ИИ, проверенной интерпретации и плана действий.'
  },

  // Consolidated upload section (merged from three separate sections)
  upload: {
    // File upload interface
    title: 'Загрузка отчёта газов крови',
    subtitle: 'Перетащите изображение сюда или выберите файл',
    chooseFile: 'Выбрать файл',
    takePhoto: 'Сделать фото',
    formats: 'JPEG, PNG, WebP • до {{size}}MB',
    fileReady: 'Файл готов к анализу',
    progress: 'Прогресс загрузки',
    progressSr: '{{percent}} процентов загружено',
    
    // Drag and drop
    drop: {
      title: 'Отпустите для загрузки',
      subtitle: 'Отпустите для загрузки и анализа ИИ'
    },
    
    // Blood gas type selection
    type: {
      title: 'Тип анализа газов крови',
      subtitle: 'Выберите тип анализа'
    },
    types: {
      arterialDesc: 'Наиболее полный анализ',
      venousDesc: 'Альтернативный метод анализа'
    },
    
    // Case context
    caseContext: {
      title: 'Контекст случая (необязательно)',
      subtitle: 'Свяжите анализ с клиническим случаем'
    },
    
    // Processing
    processing: {
      title: 'Обработка изображения…',
      subtitle: 'ИИ анализирует отчёт газов крови'
    },
    
    // Actions
    actions: {
      startAIAnalysis: 'Начать AI-анализ'
    },
    
    // Accessibility
    aria: {
      dropzone: 'Загрузить отчёт газов крови',
      removeFile: 'Удалить файл'
    },
    
    // Errors
    errors: {
      invalidType: 'Пожалуйста, выберите корректный файл изображения ({{types}})',
      maxSize: 'Размер файла должен быть меньше {{size}}MB'
    }
  }
};

export default abg;


