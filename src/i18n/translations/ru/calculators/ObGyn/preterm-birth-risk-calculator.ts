export const pretermBirthRiskCalculator = {
  // Basic Info
  title: "Калькулятор риска преждевременных родов",
  subtitle: "Основанная на доказательствах стратификация риска • Рекомендации ACOG • Оценка длины шейки матки • Поддержка клинических решений",
  
  // Main Interface
  acog_evidence_based: "Основанная на доказательствах ACOG оценка риска преждевременных родов",
  tool_description: "Комплексная стратификация риска спонтанных преждевременных родов с использованием клинических факторов риска, оценки длины шейки матки и биомаркеров. Направляет профилактические вмешательства и протоколы мониторинга.",
  acog_practice_bulletin: "Практический бюллетень ACOG № 234 - Оценка риска преждевременных родов",
  
  // Progress Steps
  clinical_assessment: "Клиническая оценка",
  clinical_assessment_description: "Параметры текущей беременности и оценка шейки матки",
  risk_factors: "Факторы риска", 
  risk_factors_description: "Исторические и анатомические факторы риска преждевременных родов",
  assessment: "Оценка",
  
  // Navigation
  next_risk_factors: "Далее: Факторы риска",
  back: "Назад",
  calculate_risk: "Рассчитать риск",
  
  // Form Labels - Clinical Assessment
  current_pregnancy: "Текущая беременность",
  current_gestational_age: "Текущий гестационный возраст",
  current_gestational_age_help: "Оценка обычно проводится между 16-36 неделями",
  weeks_unit: "недель",
  
  body_mass_index: "Индекс массы тела (ИМТ)",
  bmi_help: "ИМТ до беременности или в начале беременности",
  kg_m2_unit: "кг/м²",
  
  // Cervical Assessment
  cervical_length_assessment: "Оценка длины шейки матки",
  cervical_length: "Длина шейки матки",
  cervical_length_help: "Трансвагинальное ультразвуковое измерение (норма: ≥25мм)",
  mm_unit: "мм",
  
  // Cervical Length Reference Values
  cervical_length_reference: "Референсные значения длины шейки матки",
  normal_length: "Норма: ≥25мм",
  short_length: "Короткая: 15-24мм", 
  very_short_length: "Очень короткая: <15мм",
  
  // Biomarker Assessment
  biomarker_assessment: "Оценка биомаркеров",
  positive_ffn: "Положительный фетальный фибронектин (fFN)",
  ffn_help: "Положительный результат теста fFN (≥50 нг/мл или качественно положительный)",
  
  // Fetal Fibronectin Information
  ffn_information: "Информация о фетальном фибронектине",
  ffn_info_1: "Высокая отрицательная прогностическая ценность (>95%) для родов в течение 7-14 дней",
  ffn_info_2: "Лучше всего использовать в сочетании с оценкой длины шейки матки",
  ffn_info_3: "Оптимальное время: 22-34 недели беременности для симптоматических пациентов",
  
  // Risk Factors Section
  historical_risk_factors: "Исторические факторы риска",
  previous_preterm_birth: "Предыдущие спонтанные преждевременные роды",
  previous_preterm_birth_help: "Предыдущие роды между 16-36+6 неделями беременности",
  multiple_gestation: "Многоплодная беременность",
  multiple_gestation_help: "Текущая беременность с двойней, тройней или беременность более высокого порядка",
  
  // High-Impact Risk Factors
  high_impact_risk_factors: "Факторы риска высокого воздействия",
  high_impact_info_1: "Предыдущие преждевременные роды повышают риск в 2,5 раза",
  high_impact_info_2: "Более ранний гестационный возраст при предыдущих родах = более высокий риск рецидива",
  high_impact_info_3: "Многоплодная беременность составляет ~15% преждевременных родов",
  
  // Anatomical & Lifestyle Factors
  anatomical_lifestyle_factors: "Анатомические факторы и факторы образа жизни",
  uterine_anomalies: "Аномалии матки",
  uterine_anomalies_help: "Врожденные пороки развития матки или приобретенные дефекты",
  smoking: "Курение во время беременности",
  smoking_help: "Активное употребление табака во время текущей беременности",
  
  // Modifiable Risk Factors
  modifiable_risk_factors: "Модифицируемые факторы риска",
  modifiable_info_1: "Отказ от курения снижает риск преждевременных родов",
  modifiable_info_2: "Аномалии матки могут потребовать специализированного мониторинга",
  modifiable_info_3: "Рассмотрите возможность цервикального серкляжа для специфических анатомических рисков",
  
  // Risk Assessment Framework
  risk_assessment_framework: "Структура оценки риска",
  framework_info_1: "Стратификация риска направляет профилактические вмешательства и интенсивность мониторинга",
  framework_info_2: "Сочетает клинические факторы риска с оценкой длины шейки матки и биомаркеров",
  framework_info_3: "Основанный на доказательствах подход к прогестероновой терапии и решениям по усиленному наблюдению",
  framework_info_4: "Индивидуализированные планы ухода на основе комплексной оценки риска",
  
  // Results Section
  preterm_birth_risk_assessment: "Оценка риска преждевременных родов",
  risk_category: "Категория риска:",
  preterm_birth_risk: "Риск преждевременных родов:",
  risk_assessment: "Оценка риска",
  spontaneous_preterm_birth_risk: "Риск спонтанных преждевременных родов",
  monitoring_level: "Уровень мониторинга", 
  recommended_surveillance_intensity: "Рекомендуемая интенсивность наблюдения",
  standard_monitoring: "Стандартный",
  
  // Clinical Recommendations
  clinical_recommendations: "Клинические рекомендации",
  evidence_base: "Доказательная база",
  
  // Risk Categories (these come from the result object)
  low: "Низкий",
  moderate: "Умеренный", 
  high: "Высокий",
  very_high: "Очень высокий",
  
  // Action Buttons
  new_assessment: "Новая оценка",
  modify_inputs: "Изменить входные данные",
  
  // Footer
  acog_guidelines_footer: "На основе Практического бюллетеня ACOG № 234",
  educational_purposes: "Только в образовательных целях",
  acog_2021_guidelines: "Руководящие принципы ACOG 2021",
  
  // About Section
  about_preterm_birth_calculator: "О калькуляторе риска преждевременных родов",
  about_subtitle: "Основанная на доказательствах стратификация риска • Рекомендации ACOG • Клиническая документация",
  about_clinical_purpose: "Клиническое назначение",
  about_clinical_purpose_description: "Калькулятор риска преждевременных родов обеспечивает основанную на доказательствах стратификацию риска спонтанных преждевременных родов с использованием клинических факторов риска, оценки длины шейки матки и биомаркеров. Он направляет профилактические вмешательства и протоколы мониторинга в соответствии с рекомендациями ACOG.",
  
  // Error Messages
  gestational_age_required: "Текущий гестационный возраст обязателен",
  gestational_age_range: "Гестационный возраст должен быть между 16-36 неделями для оценки риска",
  cervical_length_required: "Измерение длины шейки матки обязательно",
  cervical_length_range: "Длина шейки матки должна быть между 5-60мм",
  bmi_required: "ИМТ обязателен",
  bmi_range: "ИМТ должен быть между 15-60 кг/м²",
  calculation_failed: "Расчет не удался"
}; 