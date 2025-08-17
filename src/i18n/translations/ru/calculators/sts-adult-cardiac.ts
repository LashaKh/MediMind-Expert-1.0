export const stsAdultCardiacTranslations = {
  title: 'STS Калькулятор рисков кардиохирургии взрослых',
  subtitle: 'Оценка периоперационного риска • Доказательное хирургическое планирование',
  description: 'Оценка риска Общества торакальных хирургов для периоперационной смертности и заболеваемости в кардиохирургии.',
  
  // Alert section
  alert_title: 'Национальная база данных STS - Доказательная оценка риска',
  alert_description: 'Валидированная модель прогнозирования риска, основанная на >4 миллионах кардиохирургических процедур из Национальной базы данных STS.',
  
  // Step navigation
  step1_title: 'Шаг 1: Общая информация',
  step2_title: 'Шаг 2: Сопутствующие заболевания',
  step3_title: 'Шаг 3: Лабораторные',
  step4_title: 'Шаг 4: Процедура',
  step5_title: 'Шаг 5: Результаты',
  
  // Step 1: General Information
  step1: {
    age: 'Возраст',
    age_help: 'Возраст пациента во время операции (годы)',
    gender: 'Пол',
    gender_help: 'Пол пациента',
    male: 'Мужской',
    female: 'Женский',
    race: 'Раса',
    race_help: 'Расовая этническая принадлежность пациента',
    white: 'Белая',
    black: 'Чёрная',
    hispanic: 'Испанская',
    asian: 'Азиатская',
    other: 'Другая',
    height: 'Рост (см)',
    height_help: 'Рост пациента в сантиметрах',
    weight: 'Вес (кг)',
    weight_help: 'Вес пациента в килограммах',
    bmi: 'Индекс массы тела',
    bmi_calculated: 'Рассчитанный ИМТ: {{bmi}}',
    bmi_help: 'Индекс массы тела (автоматически рассчитывается)'
  },
  
  // Step 2: Comorbidities
  step2: {
    diabetes: 'Диабет',
    diabetes_help: 'У пациента сахарный диабет',
    hypertension: 'Гипертензия',
    hypertension_help: 'У пациента высокое артериальное давление',
    dyslipidemia: 'Дислипидемия',
    dyslipidemia_help: 'У пациента нарушение липидов',
    cerebrovascular_disease: 'Цереброваскулярное заболевание',
    cerebrovascular_disease_help: 'История инсульта или ТИА',
    peripheral_vascular_disease: 'Заболевание периферических сосудов',
    peripheral_vascular_disease_help: 'Заболевание периферических артерий',
    chronic_lung_disease: 'Хроническое заболевание лёгких',
    chronic_lung_disease_help: 'ХОБЛ или хроническое заболевание лёгких',
    dialysis: 'Диализ',
    dialysis_help: 'Хроническое лечение диализом',
    immunocompromised: 'Иммунокомпрометированный',
    immunocompromised_help: 'Иммуносупрессированное состояние',
    endocarditis: 'Эндокардит',
    endocarditis_help: 'Активный или лечившийся в течение месяцев',
    previous_cardiac_surgery: 'Предыдущая кардиохирургия',
    previous_cardiac_surgery_help: 'Предыдущие кардиохирургические операции',
    none: 'Нет',
    one: 'Одна',
    two_or_more: 'Две или более'
  },
  
  // Step 3: Laboratory
  step3: {
    creatinine: 'Креатинин (мг/дл)',
    creatinine_help: 'Уровень креатинина в сыворотке',
    hematocrit: 'Гематокрит (%)',
    hematocrit_help: 'Процент гематокрита',
    albumin: 'Альбумин (г/дл)',
    albumin_help: 'Уровень альбумина в сыворотке (необязательно)',
    bun: 'Мочевина (мг/дл)',
    bun_help: 'Азот мочевины крови (необязательно)',
    wbc: 'Лейкоциты (×10³/мкл)',
    wbc_help: 'Количество белых кровяных клеток (необязательно)',
    platelets: 'Тромбоциты (×10³/мкл)',
    platelets_help: 'Количество тромбоцитов (необязательно)'
  },
  
  // Step 4: Procedure
  step4: {
    procedure_type: 'Тип процедуры',
    procedure_type_help: 'Тип хирургической процедуры',
    isolated_cabg: 'Изолированная АКШ',
    isolated_valve: 'Изолированный клапан',
    cabg_valve: 'АКШ + клапан',
    two_valve: 'Два клапана',
    other_cardiac: 'Другая кардиальная',
    urgency: 'Срочность',
    urgency_help: 'Срочность хирургического заболевания',
    elective: 'Плановая',
    urgent: 'Срочная',
    emergent: 'Экстренная',
    emergent_salvage: 'Экстренная спасательная',
    incidence_endocarditis: 'Случай эндокардита',
    incidence_endocarditis_help: 'Активный эндокардит во время операции',
    cardiogenic_shock: 'Кардиогенный шок',
    cardiogenic_shock_help: 'Кардиогенный шок в течение 24 часов',
    mechanical_support: 'Механическая поддержка',
    mechanical_support_help: 'Поддержка ВАБК, ЭКМО или ВВУ'
  },
  
  // Step 5: Results
  step5: {
    results_title: 'Результаты оценки риска STS',
    mortality_risk: 'Риск смертности',
    morbidity_risk: 'Риск заболеваемости',
    predicted_mortality: 'Прогнозируемая смертность',
    predicted_morbidity: 'Прогнозируемая заболеваемость',
    risk_interpretation: 'Интерпретация риска',
    low_risk: 'Низкий риск',
    moderate_risk: 'Умеренный риск',
    high_risk: 'Высокий риск',
    very_high_risk: 'Очень высокий риск',
    risk_factors: 'Основные факторы риска',
    recommendations: 'Рекомендации',
    low_risk_rec: 'Стандартная периоперационная поддержка подходит.',
    moderate_risk_rec: 'Рассмотрите усиленный мониторинг и оптимизацию.',
    high_risk_rec: 'Необходим мультидисциплинарный командный подход и особая осторожность.',
    very_high_risk_rec: 'Следует рассмотреть альтернативные варианты лечения.'
  },
  
  // Common buttons and actions
  calculate: 'Рассчитать',
  reset: 'Сброс',
  next: 'Далее',
  previous: 'Назад',
  
  // Validation messages
  validation: {
    age_required: 'Возраст обязателен',
    age_range: 'Возраст должен быть от 18 до 120 лет',
    height_required: 'Рост обязателен',
    height_range: 'Рост должен быть от 100 до 250 см',
    weight_required: 'Вес обязателен',
    weight_range: 'Вес должен быть от 30 до 300 кг',
    creatinine_required: 'Креатинин обязателен',
    creatinine_range: 'Креатинин должен быть от 0.3 до 15.0 мг/дл',
    hematocrit_required: 'Гематокрит обязателен',
    hematocrit_range: 'Гематокрит должен быть от 15 до 65%'
  },
  
  // Risk categories
  risk_categories: {
    very_low: 'Очень низкий (<1%)',
    low: 'Низкий (1-3%)',
    moderate: 'Умеренный (3-8%)',
    high: 'Высокий (8-15%)',
    very_high: 'Очень высокий (>15%)'
  },
  
  // Clinical notes
  clinical_notes: {
    note_title: 'Клинические заметки',
    database_info: 'Национальная база данных STS включает >4 миллионов процедур из более чем 1000 центров.',
    validation_info: 'Модель валидирована в нескольких центрах и регулярно обновляется.',
    limitations: 'Ограничения: локальные факторы центра и особые случаи могут быть не полностью отражены.'
  }
}; 