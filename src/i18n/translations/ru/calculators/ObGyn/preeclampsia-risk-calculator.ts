export const preeclampsiaRiskCalculator = {
  // Basic Information
  title: "Калькулятор риска преэклампсии",
  subtitle: "Оценка риска преэклампсии в раннем периоде беременности",
  description: "Доказательная оценка риска преэклампсии с использованием материнского анамнеза, клинических факторов и биомаркеров для ранней идентификации и стратегий профилактики",
  acog_evidence_based: "Доказательная оценка риска ACOG",
  tool_description: "Профессиональный калькулятор риска преэклампсии, использующий валидированные алгоритмы скрининга для выявления беременностей высокого риска и целевой профилактики и мониторинга.",
  acog_committee_reference: "Мнение комитета ACOG #743 - Использование аспирина в низких дозах во время беременности",
  
  // Clinical Purpose
  clinical_purpose: "Клиническая цель",
  clinical_purpose_description: "Этот калькулятор обеспечивает доказательную оценку риска преэклампсии с использованием валидированных алгоритмов скрининга. Он следует мнению комитета ACOG #743 и международным рекомендациям для ранней идентификации беременностей высокого риска и целевой профилактики аспирином в низких дозах.",
  
  // Risk Assessment Methods
  risk_methods: "Методы оценки риска",
  multiple_risk_factors: "Выберите все применимые факторы риска для комплексной оценки",
  next_clinical_review: "Далее: Клиническая оценка",
  clinical_data_review: "Обзор клинических данных",
  review_risk_parameters: "Просмотрите выбранные параметры и рассчитанную оценку риска",
  back: "Назад",
  calculate_risk: "Рассчитать риск преэклампсии",
  
  // Risk Categories
  high_risk_factors: "Факторы высокого риска",
  moderate_risk_factors: "Факторы умеренного риска",
  low_risk_baseline: "Низкий риск (базовый)",
  
  // High Risk Factors
  previous_preeclampsia: "Предыдущая преэклампсия",
  chronic_hypertension: "Хроническая гипертензия",
  diabetes_pregestational: "Прегестационный диабет (тип 1 или 2)",
  chronic_kidney_disease: "Хроническая болезнь почек",
  autoimmune_disease: "Аутоиммунное заболевание (СКВ, АФС)",
  multiple_gestation: "Многоплодная беременность (двойня/тройня)",
  
  // Moderate Risk Factors
  nulliparity: "Нерожавшая (первая беременность)",
  maternal_age_35: "Возраст матери ≥35 лет",
  family_history_preeclampsia: "Семейный анамнез преэклампсии",
  obesity_bmi_30: "Ожирение (ИМТ ≥30 кг/м²)",
  previous_adverse_outcome: "Предыдущий неблагоприятный исход беременности",
  interpregnancy_interval: "Интервал между беременностями >10 лет",
  ivf_pregnancy: "ЭКО/вспомогательная репродукция",
  
  // Maternal Characteristics
  maternal_characteristics: "Характеристики матери",
  maternal_age_label: "Возраст матери",
  maternal_age_unit: "лет",
  maternal_age_help: "Текущий возраст матери (15-50 лет)",
  
  maternal_bmi_label: "ИМТ до беременности",
  maternal_bmi_unit: "кг/м²",
  maternal_bmi_help: "Индекс массы тела до беременности (15-50 кг/м²)",
  
  gestational_age_label: "Текущий срок беременности",
  gestational_age_unit: "недель",
  gestational_age_help: "Текущий срок беременности для оценки времени (6-20 недель)",
  
  // Medical History
  medical_history: "Медицинский анамнез",
  obstetric_history: "Акушерский анамнез",
  current_pregnancy: "Факторы текущей беременности",
  
  // Risk Assessment Results
  selected_risk_factors: "Выбранные факторы риска",
  calculated_risk_level: "Рассчитанный уровень риска",
  high_risk_category: "Высокий риск",
  moderate_risk_category: "Умеренный риск", 
  low_risk_category: "Низкий риск",
  
  risk_percentage: "Предполагаемый риск",
  aspirin_recommendation: "Рекомендация аспирина в низких дозах",
  monitoring_recommendations: "Рекомендации по мониторингу",
  
  // Clinical Recommendations
  clinical_recommendations: "Клинические рекомендации",
  evidence_base: "База доказательств",
  
  // Risk Level Descriptions
  high_risk_description: "Высокий риск развития преэклампсии. Настоятельная рекомендация профилактики аспирином в низких дозах и усиленного мониторинга.",
  moderate_risk_description: "Умеренный риск на основе множественных факторов. Рассмотрите профилактику аспирином в низких дозах и стандартный усиленный мониторинг.",
  low_risk_description: "Низкий базовый риск. Стандартная антенатальная помощь с рутинным мониторингом.",
  
  // Aspirin Recommendations
  aspirin_indicated: "Аспирин в низких дозах (81мг в день) РЕКОМЕНДУЕТСЯ",
  aspirin_consider: "Рассмотрите аспирин в низких дозах (81мг в день)",
  aspirin_not_indicated: "Аспирин в низких дозах рутинно не показан",
  
  aspirin_timing: "Начинайте между 12-28 неделями (идеально до 16 недель)",
  aspirin_continuation: "Продолжайте до родов",
  aspirin_contraindications: "Учитывайте противопоказания и риски кровотечения",
  
  // Monitoring Recommendations
  enhanced_monitoring: "Усиленный мониторинг",
  standard_monitoring: "Стандартный мониторинг",
  
  enhanced_monitoring_details: "Более частые визиты, мониторинг артериального давления, оценка протеинурии и наблюдение за плодом",
  standard_monitoring_details: "Рутинная антенатальная помощь со стандартным скринингом преэклампсии",
  
  // ACOG Guidelines
  acog_guidelines: "Рекомендации ACOG",
  acog_guideline_1: "Один фактор высокого риска ИЛИ два фактора умеренного риска указывают на профилактику аспирином",
  acog_guideline_2: "Аспирин в низких дозах (81мг в день) следует начинать между 12-28 неделями",
  acog_guideline_3: "Продолжайте аспирин до родов для максимальной пользы",
  acog_guideline_4: "Усиленный мониторинг рекомендуется для беременностей высокого риска",
  
  // Evidence Base
  evidence_based_medicine: "Доказательная медицина",
  uspstf_recommendation: "Рекомендация USPSTF класса A для профилактики аспирином",
  cochrane_review: "Кокрейновский обзор: 24% снижение преэклампсии при аспирине",
  meta_analysis_data: "Мета-анализ показывает значительное снижение тяжелой преэклампсии",
  
  // Risk Analysis
  risk_analysis: "Анализ риска",
  risk_factors_count: "Выявленные факторы риска:",
  high_risk_count: "Факторы высокого риска:",
  moderate_risk_count: "Факторы умеренного риска:",
  
  // Assessment Summary
  assessment_summary: "Резюме оценки",
  recommendation_strength: "Сила рекомендации:",
  strong_recommendation: "Настоятельная рекомендация",
  moderate_recommendation: "Умеренная рекомендация", 
  no_specific_recommendation: "Нет специфической рекомендации",
  
  // Buttons
  new_assessment: "Новая оценка",
  modify_inputs: "Изменить данные",
  
  // Footer
  based_on_acog_743: "Основано на мнении комитета ACOG #743",
  educational_purposes_only: "Только в образовательных целях",
  acog_2018_guidelines: "Рекомендации ACOG 2018",
  
  // About Section
  about_preeclampsia_calculator: "О калькуляторе риска преэклампсии",
  about_subtitle: "Доказательное скрининговое исследование осложнений беременности",
  
  // Clinical Parameters Section
  clinical_parameters: "Клинические параметры",
  clinical_parameters_subtitle: "Дополнительные биомаркеры и клинические измерения (11-13+6 недель)",
  clinical_measurements: "Клинические измерения",
  biochemical_markers: "Биохимические маркеры",
  clinical_parameters_information: "Информация о клинических параметрах",
  
  // Clinical Measurements Labels
  mean_arterial_pressure: "Среднее артериальное давление (САД)",
  mean_arterial_pressure_help: "Дополнительно: измерение САД в первом триместре",
  uterine_artery_pi: "Пульсационный индекс маточной артерии",
  uterine_artery_pi_help: "Дополнительно: допплерометрическая оценка на 11-13+6 неделях",
  
  // Biochemical Markers Labels
  plgf_label: "PlGF (плацентарный фактор роста)",
  plgf_help: "Дополнительно: уровень PlGF в первом триместре",
  papp_a_label: "PAPP-A",
  papp_a_help: "Дополнительно: уровень PAPP-A (кратность медианы)",
  
  // Clinical Parameters Information
  clinical_info_1: "Эти параметры являются дополнительными, но могут улучшить точность оценки риска",
  clinical_info_2: "Оптимальное время для оценки - 11-13+6 недель беременности",
  clinical_info_3: "Комбинированные скрининговые алгоритмы используют эти параметры для улучшенной стратификации риска",
  clinical_info_4: "Одних клинических факторов риска достаточно для базовой оценки риска",
  
  // About Page Content
  about_clinical_purpose: "Клиническое назначение",
  about_clinical_purpose_description: "Калькулятор риска преэклампсии обеспечивает доказательную оценку риска преэклампсии с использованием клинических факторов риска и дополнительных биомаркеров. Он помогает принимать решения о профилактике аспирином согласно рекомендациям USPSTF и ACOG.",
  about_evidence_subtitle: "Доказательная оценка риска • Рекомендации ACOG • Клиническая документация",
  
  evidence_based_screening: "Доказательные методы скрининга",
  
  prevention_strategies: "Стратегии профилактики",
  aspirin_prophylaxis_effective: "Профилактика аспирином в низких дозах снижает риск преэклампсии на 24% при беременностях высокого риска",
  
  // Clinical Applications
  clinical_applications: "Клиническое применение",
  early_risk_identification: "• Ранняя идентификация риска (12-20 недель)",
  targeted_prophylaxis: "• Целевая профилактика аспирином",
  enhanced_surveillance: "• Усиленное антенатальное наблюдение",
  resource_allocation: "• Соответствующее распределение ресурсов",
  
  // Important Considerations
  important_clinical_considerations: "Важные клинические соображения",
  clinical_calculator_notice: "Этот калькулятор обеспечивает доказательную оценку риска для принятия клинических решений. Всегда учитывайте индивидуальные факторы пациента, противопоказания и клиническое суждение.",
  
  // Validation and Errors
  general_error: "Пожалуйста, выберите хотя бы один фактор риска или введите материнские характеристики",
  maternal_age_error: "Возраст матери должен быть от 15 до 50 лет",
  maternal_bmi_error: "ИМТ должен быть от 15 до 50 кг/м²",
  gestational_age_error: "Гестационный возраст должен быть от 6 до 20 недель",
  mean_arterial_pressure_error: "Среднее артериальное давление должно быть от 60 до 150 мм рт.ст.",
  uterine_artery_pi_error: "Пульсационный индекс маточной артерии должен быть от 0,5 до 3,0",
  calculation_failed: "Не удалось рассчитать риск. Пожалуйста, проверьте свои данные и попробуйте снова.",
  
  // Progress Steps
  progress: {
    step_1: "Факторы риска",
    step_2: "Данные матери",
    step_3: "Результаты"
  },
  
  // Display Labels
  high_risk_display: "ВЫСОКИЙ",
  moderate_risk_display: "УМЕРЕННЫЙ",
  low_risk_display: "НИЗКИЙ",
  
  // Units
  years_unit: "лет",
  weeks_unit: "недель",
  kg_m2_unit: "кг/м²",
  mg_unit: "мг",
  daily_unit: "в день",
  
  // Risk Statistics
  baseline_risk: "Базовый популяционный риск: 2-8%",
  high_risk_statistics: "Беременности высокого риска: 15-25% риск",
  aspirin_efficacy: "Аспирин снижает риск на 24% (95% ДИ: 18-28%)",
  
  // Results Display Labels
  risk_category_label: "Категория риска",
  estimated_risk_label: "Расчетный риск",
  risk_assessment_title: "Оценка риска",
  risk_assessment_subtitle: "Оценка риска преэклампсии",
  aspirin_recommendation_title: "Рекомендация по аспирину",
  aspirin_recommendation_subtitle: "Профилактика низкими дозами аспирина",
  aspirin_recommended: "Рекомендуется",
  aspirin_not_recommended: "Не рекомендуется",
  clinical_recommendations_title: "Клинические рекомендации",
  evidence_base_title: "Доказательная база"
}; 