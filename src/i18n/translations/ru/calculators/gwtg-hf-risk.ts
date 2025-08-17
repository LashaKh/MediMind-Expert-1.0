const gwtgHfRiskTranslations = {
  title: 'Калькулятор риска GWTG-HF',
  subtitle: 'Инструкции по лечению - Оценка риска при сердечной недостаточности',
  description: 'Основанный на доказательствах инструмент прогнозирования риска внутрибольничной смертности пациентов с сердечной недостаточностью.',
  alert_title: 'Оценка риска GWTG-HF',
  alert_description: 'Валидированный калькулятор риска для прогнозирования внутрибольничной смертности пациентов с сердечной недостаточностью на основе реестра Get With The Guidelines-Heart Failure. Этот инструмент помогает стратифицировать пациентов и руководить клиническими решениями во время госпитализации.',
  section_demographics: 'Демография и сопутствующие заболевания',
  section_demographics_description: 'Демографическая информация пациента и сердечно-сосудистые сопутствующие заболевания',
  vital_signs_section: 'Оценка жизненных показателей',
  vital_signs_description: 'Текущий гемодинамический статус и сердечно-сосудистые жизненные показатели',
  laboratory_section: 'Лабораторные показатели',
  laboratory_description: 'Ключевые лабораторные маркеры, влияющие на прогноз сердечной недостаточности',
  // Demographics fields
  field_age: 'Возраст',
  field_age_placeholder: 'Введите возраст в годах',
  field_race: 'Раса/Этническая принадлежность',
  field_race_select: 'Выберите расу/этническую принадлежность',
  field_race_black: 'Чернокожий или афроамериканец',
  field_race_other: 'Другая',
  field_copd: 'Хроническая обструктивная болезнь легких (ХОБЛ)',
  field_copd_description: 'История хронической обструктивной болезни легких',
  // Vital signs fields
  systolic_bp_label: 'Систолическое артериальное давление',
  systolic_bp_placeholder: 'Введите систолическое АД',
  heart_rate_label: 'Частота сердечных сокращений',
  heart_rate_placeholder: 'Введите ЧСС',
  // Laboratory fields
  bun_label: 'Мочевина крови (BUN)',
  bun_placeholder: 'Введите значение BUN',
  sodium_label: 'Натрий сыворотки',
  sodium_placeholder: 'Введите уровень натрия',
  button_next_vital_signs: 'Далее: Жизненные показатели',
  next_laboratory: 'Далее: Лабораторные',
  back_button: 'Назад',
  calculate_button: 'Рассчитать риск',
  results_title: 'Результаты оценки риска GWTG-HF',
  gwtg_points: 'Баллы GWTG',
  risk_score_label: 'Показатель риска',
  mortality_risk_label: 'Риск смертности',
  in_hospital_mortality: 'Внутрибольничная смертность',
  risk_category_label: 'Категория риска',
  risk_stratification: 'Стратификация риска',
  // Risk factor breakdown
  risk_factor_contribution: 'Вклад факторов риска',
  age_factor: 'Возраст',
  systolic_bp_factor: 'САД',
  bun_factor: 'Мочевина',
  sodium_factor: 'Натрий',
  race_factor: 'Раса',
  copd_factor: 'ХОБЛ',
  heart_rate_factor: 'ЧСС',
  // Clinical management
  clinical_management: 'Рекомендации по клиническому ведению',
  
  // Risk interpretations
  interpretation_template: 'Шкала риска GWTG-HF: {{score}} баллов. {{interpretation}} Предполагаемая внутрибольничная смертность: {{mortality}}%.',
  interpretation_low: 'Низкий риск внутрибольничной смертности',
  interpretation_intermediate: 'Промежуточный риск внутрибольничной смертности',
  interpretation_high: 'Высокий риск внутрибольничной смертности',
  interpretation_very_high: 'Очень высокий риск внутрибольничной смертности',
  
  // Clinical recommendations - Base
  recommendation_guideline_therapy: 'Оптимизация терапии в соответствии с рекомендациями',
  recommendation_fluid_monitoring: 'Тщательный мониторинг баланса жидкости и ежедневного веса',
  recommendation_vital_assessment: 'Регулярная оценка жизненных показателей и насыщения кислородом',
  recommendation_precipitating_factors: 'Оценка провоцирующих факторов и триггеров',
  
  // Clinical recommendations - Low risk
  recommendation_standard_protocols: 'Стандартные протоколы лечения сердечной недостаточности',
  recommendation_early_discharge: 'Рассмотреть раннюю выписку с обучением по СН',
  recommendation_outpatient_followup: 'Амбулаторное кардиологическое наблюдение через 7-14 дней',
  recommendation_medication_reconciliation: 'Согласование и оптимизация медикаментов',
  
  // Clinical recommendations - Intermediate risk
  recommendation_enhanced_monitoring: 'Расширенный стационарный мониторинг с частыми оценками',
  recommendation_telemetry_consideration: 'Рассмотреть телеметрический мониторинг на аритмии',
  recommendation_nurse_navigator: 'Участие медсестры-навигатора по СН для координации ухода',
  recommendation_close_followup: 'Планирование выписки с тесным наблюдением через 3-7 дней',
  recommendation_biomarker_monitoring: 'Рассмотреть мониторинг динамики BNP/NT-proBNP',
  
  // Clinical recommendations - High risk
  recommendation_intensive_monitoring: 'Интенсивный мониторинг с непрерывной телеметрией',
  recommendation_early_consultation: 'Ранняя кардиологическая консультация и совместное ведение',
  recommendation_icu_consideration: 'Рассмотреть мониторинг в ОРИТ при клинических показаниях',
  recommendation_palliative_consult: 'Консультация паллиативной помощи для управления симптомами',
  recommendation_advance_directive: 'Обсуждение предварительных распоряжений с пациентом/семьей',
  recommendation_inotropic_support: 'Рассмотреть инотропную поддержку при необходимости',
  
  // Clinical recommendations - Very high risk
  recommendation_icu_level_care: 'Рекомендуется мониторинг и уход уровня ОРИТ',
  recommendation_immediate_hf_consult: 'Немедленная консультация по продвинутой сердечной недостаточности',
  recommendation_mechanical_support: 'Рассмотреть оценку механической поддержки кровообращения',
  recommendation_goals_of_care: 'Консультация паллиативной помощи по целям ухода',
  recommendation_family_meetings: 'Семейные встречи для планирования конца жизни',
  recommendation_hospice_consideration: 'Рассмотреть консультацию хосписа при необходимости',
  recommendation_multidisciplinary_team: 'Участие мультидисциплинарной команды',
  
  // Algorithm validation
  algorithm_title: 'Расширенный алгоритм GWTG-HF',
  algorithm_description: '✓ Валидирован AHA Get With The Guidelines • Расширенная стратификация риска с комплексными клиническими рекомендациями',
  // Risk reference ranges
  risk_reference_title: 'Справочник по оценке риска GWTG-HF',
  low_risk_range: 'Низкий риск (≤25 баллов)',
  low_mortality: '<2% риск смертности',
  intermediate_risk_range: 'Промежуточный риск (26-35 баллов)',
  intermediate_mortality: '2-4% риск смертности',
  high_risk_range: 'Высокий риск (36-45 баллов)',
  high_mortality: '4-8% риск смертности',
  very_high_risk_range: 'Очень высокий риск (>45 баллов)',
  very_high_mortality: '>8% риск смертности',
  
  // From the Creator section
  from_creator_title: 'От создателя',
  creator_name: 'Д-р Грегг К. Фонаров, MD',
  creator_title_role: 'Профессор медицины и директор Центра кардиомиопатии Ахмансона-UCLA',
  why_developed: 'Почему был разработан GWTG-HF',
  why_developed_text: 'Модели риска помогают информировать о сортировке пациентов и решениях о лечении. Оценка GWTG-HF была разработана с использованием данных почти 200 больниц США для предоставления объективной прогностической информации, которая направляет соответствующий мониторинг и лечение пациентов с сердечной недостаточностью.',
  clinical_application: 'Клиническое применение',
  clinical_application_text: 'Шкала риска GWTG-HF количественно определяет риск пациента в точке оказания помощи, облегчая сортировку пациентов и поощряя доказательную терапию у пациентов с самым высоким риском. Это помогает увеличить использование рекомендованной медицинской терапии у пациентов высокого риска при одновременном снижении использования ресурсов у пациентов низкого риска.',
  view_publications: 'Просмотреть публикации д-ра Фонарова',
  pubmed_link_text: 'PubMed',
  
  // Evidence section
  evidence_title: 'Доказательства и валидация',
  formula_title: 'Формула',
  formula_description: 'Сложение лабораторных и демографических значений с присвоенными баллами.',
  score_interpretation_title: 'Интерпретация баллов',
  score_interpretation_ranges: [
    { range: '0-33', mortality: '<1%' },
    { range: '34-50', mortality: '1-5%' },
    { range: '51-57', mortality: '5-10%' },
    { range: '58-61', mortality: '10-15%' },
    { range: '62-65', mortality: '15-20%' },
    { range: '66-70', mortality: '20-30%' },
    { range: '71-74', mortality: '30-40%' },
    { range: '75-78', mortality: '40-50%' },
    { range: '≥79', mortality: '>50%' }
  ],
  validation_cohort: 'Валидировано на 39 783 пациентах из 198 больниц в реестре GWTG-HF (2005-2007)',
  key_predictors: 'Ключевые предикторы: возраст, систолическое артериальное давление, BUN при поступлении, с дополнительным вкладом частоты сердечных сокращений, натрия сыворотки, наличия ХОБЛ и расы',
  ehealthrecords_validation: 'Дополнительно валидировано на 13 163 пациентах с использованием данных электронных медицинских записей',
  funding_note: 'GWTG-HF был частично поддержан GlaxoSmithKline',
  original_reference: 'Оригинальная ссылка',
  validation_reference: 'Исследование валидации',
  
  // Enhanced alert section
  enhanced_alert_title: 'Расширенная оценка риска GWTG-HF',
  enhanced_alert_description: 'Доказательное прогнозирование внутрибольничной смертности для пациентов с сердечной недостаточностью. Валидирует стратификацию риска и направляет решения по интенсивной терапии для оптимальных результатов пациентов.',
  enhanced_alert_badge: 'AHA Get With The Guidelines Валидировано - Расширенный анализ риска',
  
  // Progress step labels  
  progress_demographics: 'Демография',
  progress_vital_signs: 'Витальные показатели',
  progress_laboratory: 'Лаборатория',
  
  // Action buttons
  new_assessment: 'Новая оценка',
  modify_inputs: 'Изменить данные',
  
  // Footer validation text
  footer_validation_text: '✓ AHA Get With The Guidelines Валидировано • Расширенная стратификация риска с комплексными клиническими рекомендациями',
  footer_based_on: 'Основано на реестре AHA Get With The Guidelines-Heart Failure (GWTG-HF) • Расширенная оценка риска',
  footer_guidelines_validated: 'Валидировано рекомендациями',
  
  // Validation messages
  validation: {
    age_required: 'Возраст обязателен',
    age_range: 'Возраст должен быть от 18 до 120 лет',
    race_required: 'Раса обязательна',
    sbp_required: 'Систолическое артериальное давление обязательно',
    sbp_range: 'Систолическое АД должно быть от 60 до 300 мм рт.ст.',
    bun_required: 'Мочевина крови обязательна',
    bun_range: 'BUN должен быть от 5 до 200 мг/дл',
    sodium_required: 'Натрий сыворотки обязателен',
    sodium_range: 'Натрий должен быть от 115 до 160 мЭкв/л',
    heart_rate_required: 'Частота сердечных сокращений обязательна',
    heart_rate_range: 'ЧСС должна быть от 30 до 200 уд/мин'
  }
};

export default gwtgHfRiskTranslations; 