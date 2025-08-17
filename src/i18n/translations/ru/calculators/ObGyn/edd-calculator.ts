export const eddCalculator = {
  // Basic Info
  title: "Калькулятор ПДР",
  subtitle: "Калькулятор предполагаемой даты родов",
  
  // Main Interface
  acog_evidence_based: "Датировка на основе данных ACOG",
  tool_description: "Профессиональный калькулятор датировки беременности с использованием нескольких научно обоснованных методов для точного определения гестационного возраста и предполагаемой даты родов.",
  acog_committee_reference: "ACOG Заключение комитета № 700 - Определение даты родов",
  
  // Progress Steps
  dating_methods: "Методы датировки",
  multiple_dating_methods: "Выберите один или несколько методов датировки для наиболее точной оценки",
  next_clinical_review: "Далее: Клинический обзор",
  clinical_data_review: "Клинический обзор данных",
  review_dating_parameters: "Проверьте выбранные параметры датировки и точность расчета",
  back: "Назад",
  calculate_due_date: "Рассчитать дату родов",
  
  // Dating Methods
  lmp_method: "Последняя менструация (ПМ)",
  ultrasound_method: "УЗИ датировка",
  art_method: "ВРТ (вспомогательные репродуктивные технологии)",
  
  // Confidence Levels
  moderate_confidence: "Умеренная достоверность",
  high_confidence: "Высокая достоверность",
  
  // LMP Section
  lmp_date_label: "Дата последней менструации (ПМ)",
  lmp_date_help: "Первый день последней менструации",
  cycle_days_label: "Длина цикла",
  cycle_days_unit: "дней",
  cycle_days_help: "Средняя длина менструального цикла (21-35 дней)",
  
  // Ultrasound Section
  first_trimester_crl_label: "Копчико-теменной размер (КТР)",
  first_trimester_crl_unit: "мм",
  first_trimester_crl_help: "Измерение УЗИ первого триместра (15-95мм, 6-14 недель)",
  
  // ART Section
  art_transfer_date_label: "Дата переноса эмбриона",
  art_transfer_date_help: "Дата процедуры переноса эмбриона",
  art_days_to_transfer_label: "Дни до переноса",
  day_3_cleavage: "3-й день (стадия дробления)",
  day_5_blastocyst: "5-й день (бластоциста)",
  day_6_expanded_blastocyst: "6-й день (расширенная бластоциста)",
  
  // Clinical Review Section
  selected_dating_method: "Выбранный метод датировки",
  expected_accuracy: "Ожидаемая точность",
  
  // Accuracy Information
  ultrasound_crl_accuracy: "±3-5 дней точности в первом триместре",
  art_dating_accuracy: "±1 день точности (наиболее точно)",
  lmp_dating_accuracy: "±1-2 недели точности (зависит от цикла)",
  
  // ACOG Guidelines
  acog_guidelines: "Рекомендации ACOG",
  acog_guideline_1: "УЗИ первого триместра наиболее точно для датировки при КТР 15-95мм",
  acog_guideline_2: "Датировка по ПМ приемлема при надежности и соответствии клинических данных",
  acog_guideline_3: "Датировка ВРТ высокоточна благодаря известному времени зачатия",
  acog_guideline_4: "Расхождения >7 дней должны отдавать предпочтение УЗИ перед ПМ",
  
  // Results Section
  edd_analysis: "Анализ ПДР",
  dating_method_label: "Метод датировки:",
  confidence_label: "Достоверность:",
  estimated_due_date: "Предполагаемая дата родов",
  forty_weeks_gestation: "40 недель беременности",
  current_status: "Текущий статус",
  current_gestational_age: "Текущий гестационный возраст",
  clinical_recommendations: "Клинические рекомендации",
  evidence_base: "Доказательная база",
  
  // Display Labels
  lmp_display: "ПМ",
  crl_display: "КТР",
  art_display: "ВРТ",
  cycle_display: "Цикл",
  mm_unit: "мм",
  days_unit: "дней",
  transfer_suffix: "перенос",
  day_prefix: "День",
  
  // Action Buttons
  new_assessment: "Новая оценка",
  modify_inputs: "Изменить данные",
  
  // Footer
  based_on_acog_700: "На основе ACOG Заключение комитета № 700",
  educational_purposes_only: "Только в образовательных целях",
  acog_2017_guidelines: "Рекомендации ACOG 2017",
  
  // About Section
  about_edd_calculator: "О калькуляторе ПДР",
  about_subtitle: "Научно обоснованные методы датировки беременности",
  clinical_purpose: "Клиническое назначение",
  clinical_purpose_description: "Этот калькулятор предоставляет научно обоснованную оценку гестационного возраста с использованием нескольких проверенных методов датировки. Он следует рекомендациям ACOG № 700 для точной датировки беременности и определения даты родов.",
  
  evidence_based_dating_methods: "Научно обоснованные методы датировки",
  multiple_approaches_accuracy: "Множественные подходы обеспечивают наиболее точную оценку гестационного возраста",
  
  // Method Details
  last_menstrual_period_lmp: "Последняя менструация (ПМ)",
  moderate_accuracy_days: "±7-14 дней точности",
  naegele_rule_description: "Традиционный метод с использованием правила Негеле: ПМ + 280 дней с корректировкой длины цикла.",
  standard_28_day_cycle: "• Предположение стандартного 28-дневного цикла",
  cycle_length_adjustments: "• Применяются корректировки длины цикла",
  requires_accurate_lmp: "• Требует точного воспоминания ПМ",
  
  high_confidence_accuracy: "±3-5 дней точности",
  crl_most_accurate: "Измерение копчико-теменного размера обеспечивает наиболее точную датировку в первом триместре (6-14 недель).",
  crl_range_weeks: "• Диапазон КТР: 15-95мм (6-14 недель)",
  robinson_fleming_formula: "• Формула Робинсона-Флеминга",
  gold_standard_dating: "• Золотой стандарт для первого триместра",
  
  highly_accurate_known_conception: "Высокоточный метод датировки с известным временем зачатия от вспомогательных репродуктивных технологий.",
  transfer_day_options: "• Варианты переноса 3, 5 или 6 день",
  known_conception_timing: "• Известное время зачатия",
  precise_developmental_stage: "• Точная стадия развития",
  
  // Clinical Guidelines Section
  clinical_guidelines_evidence: "Клинические рекомендации и доказательства",
  acog_guidelines_section: "Рекомендации ACOG",
  acog_committee_700: "• ACOG Заключение комитета № 700",
  acog_practice_175: "• ACOG Практический бюллетень № 175",
  first_trimester_preferred: "• УЗИ первого триместра предпочтительно",
  discrepancy_ultrasound: "• Расхождение >7 дней отдает предпочтение УЗИ",
  
  clinical_applications: "Клинические применения",
  prenatal_care_scheduling: "• Планирование дородового ухода",
  screening_test_timing: "• Время скрининговых тестов",
  labor_delivery_planning: "• Планирование родов",
  fetal_growth_baselines: "• Базовые показатели роста плода",
  
  // Important Notes
  important_clinical_considerations: "Важные клинические соображения",
  clinical_calculator_notice: "Этот калькулятор предоставляет научно обоснованные оценки для принятия клинических решений. Всегда учитывайте индивидуальные факторы пациента и клиническое суждение.",
  statistical_reality: "Статистическая реальность",
  five_percent_exact_date: "Только ~5% детей рождаются точно в предполагаемую дату",
  clinical_range: "Клинический диапазон",
  normal_delivery_weeks: "Нормальные роды: 37-42 недели беременности",
  
  // Error Messages
  general_error: "Пожалуйста, выберите хотя бы один метод датировки",
  lmp_date_error: "Дата ПМ не может быть в будущем",
  lmp_date_far_past_error: "Дата ПМ не может быть более 300 дней назад",
  first_trimester_crl_error: "КТР должен быть между 15-95мм",
  art_days_to_transfer_required: "Дни до переноса обязательны для метода ВРТ",
  art_days_to_transfer_error: "Дни до переноса должны быть 3, 5 или 6",
  cycle_days_error: "Длина цикла должна быть между 21-35 днями",
  calculation_failed: "Расчет не удался. Пожалуйста, проверьте ваши данные и попробуйте снова.",
}; 