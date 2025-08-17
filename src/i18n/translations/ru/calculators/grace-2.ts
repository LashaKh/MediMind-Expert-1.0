export const grace2Translations = {
  title: "Калькулятор риска GRACE 2.0",
  subtitle: "Оценка риска при остром коронарном синдроме",
  description: "Глобальный регистр острых коронарных событий - стратификация риска для пациентов с NSTEMI/НС и STEMI.",
  calculate_button: "Рассчитать шкалу GRACE",
  low_risk: "Низкий риск (<109)",
  high_risk: "Высокий риск (>140)",
  intermediate_risk: "Промежуточный риск (109-140)",
  // Patient demographics
  age_label: "Возраст (лет)",
  age_placeholder: "Введите возраст пациента",
  heart_rate_label: "ЧСС (уд/мин)",
  heart_rate_placeholder: "Введите частоту сердечных сокращений",
  systolic_bp_label: "Систолическое АД (мм рт.ст.)",
  systolic_bp_placeholder: "Введите систолическое давление",
  creatinine_label: "Креатинин сыворотки (мг/дл)",
  creatinine_placeholder: "Введите уровень креатинина",
  // Clinical characteristics
  killip_class_label: "Классификация Killip",
  killip_class_1: "Класс I (нет сердечной недостаточности)",
  killip_class_2: "Класс II (умеренная СН, хрипы)",
  killip_class_3: "Класс III (отек легких)",
  killip_class_4: "Класс IV (кардиогенный шок)",
  cardiac_arrest_label: "Остановка сердца при поступлении",
  st_deviation_label: "Отклонение сегмента ST",
  elevated_markers_label: "Повышенные кардиальные маркеры",
  // Section headers
  demographics_section: "Демография пациента",
  clinical_section: "Клиническая картина",
  labs_section: "Лабораторные показатели",
  // Results
  in_hospital_mortality: "Госпитальная летальность",
  one_year_mortality: "1-годичная летальность",
  invasive_strategy: "Инвазивная стратегия",
  recommendation: "Рекомендация по лечению",
  // Validation messages
  age_error: "Возраст должен быть от 18 до 120 лет",
  heart_rate_error: "ЧСС должна быть от 30 до 300 уд/мин",
  systolic_bp_error: "Систолическое АД должно быть от 60 до 300 мм рт.ст.",
  creatinine_error: "Креатинин должен быть от 0,3 до 15,0 мг/дл",
  
  // Strategy and recommendation texts
  strategy_conservative: "Консервативное лечение подходящее",
  strategy_early_invasive: "Ранняя инвазивная стратегия в течение 24-72 часов",
  strategy_urgent_invasive: "Неотложная инвазивная стратегия в течение 2-24 часов",
  recommendation_low: "Медикаментозная терапия, рассмотрите инвазивную при рефрактерных симптомах",
  recommendation_intermediate: "Рассмотрите раннюю катетеризацию и реваскуляризацию",
  recommendation_high: "Немедленная катетеризация и реваскуляризация при показаниях",
  
  // Results section labels
  results_title: "Результаты GRACE 2.0",
  results_description: "Расширенная оценка сердечно-сосудистого риска завершена",
  grace_score: "Балл GRACE",
  short_term_risk: "Краткосрочная оценка риска",
  long_term_prognosis: "Долгосрочный прогноз",
  risk_category_label: "Категория риска",
  clinical_risk_stratification: "Клиническая стратификация риска",
  clinical_recommendations_title: "Клинические рекомендации",
  intervention_window: "Окно вмешательства",
  
  // NEW - Missing translation keys for hardcoded text
  baseline_patient_info: "Введите базовую информацию о пациенте",
  high_risk_features: "Признаки высокого риска",
  at_presentation: "При поступлении",
  on_initial_ecg: "На исходной ЭКГ",
  troponin_ck_mb: "Тропонин/КК-МВ",
  back_to_demographics: "Назад к демографии",
  calculate_risk_score: "Рассчитать балл риска",
  review_data_assessment: "Просмотрите данные и создайте оценку GRACE 2.0",
  patient_summary: "Резюме пациента",
  demographics: "Демография",
  vital_signs: "Жизненные показатели",
  hr_label: "ЧСС:",
  sbp_label: "САД:",
  labs_clinical: "Лаб. и клин.",
  creatinine_short: "Креатинин:",
  killip_short: "Killip:",
  high_risk_features_present: "Присутствуют признаки высокого риска",
  cardiac_arrest: "Остановка сердца",
  st_deviation: "Отклонение ST",
  elevated_markers: "Повышенные маркеры",
  no_additional_risk_factors: "Дополнительные факторы риска отсутствуют",
  back_to_clinical: "Назад к клиническим",
  reset: "Сброс",
  calculating: "Вычисление...",
  continue_to_clinical_data: "Продолжить к клиническим данным",
  
  // Expert insights section
  expert_insights_title: "Экспертные мнения создателей",
  expert_insights_subtitle: "От д-ра Джоэла Гора и д-ра Кита А. А. Фокса",
  dr_joel_gore: "Д-р Джоэл Гор",
  dr_joel_gore_title: "Директор, клиника антикоагуляции, UMass Memorial",
  dr_keith_fox: "Д-р Кит А. А. Фокс",
  dr_keith_fox_title: "Профессор кардиологии, Эдинбургский университет",
  
  // Facts and figures section
  facts_figures_title: "Факты и цифры",
  facts_figures_subtitle: "Интерпретация баллов GRACE",
  grace_score_range: "Диапазон баллов GRACE",
  mortality_risk: "Риск смертности",
  risk_category_column: "Категория риска",
  
  // Evidence and validation section
  evidence_validation_title: "Доказательства и валидация",
  evidence_validation_subtitle: "Научная основа",
  database_scale: "Масштаб базы данных",
  
  // Clinical pearls section
  clinical_pearls_title: "Клинические жемчужины и подводные камни",
  
  // Score interpretation table rows
  score_0_87: "0-87",
  score_88_128: "88-128",
  score_129_149: "129-149",
  score_150_173: "150-173",
  score_174_182: "174-182",
  score_183_190: "183-190",
  score_191_199: "191-199",
  score_200_207: "200-207",
  score_208_218: "208-218",
  score_219_284: "219-284",
  score_285_plus: "285+",
  
  mortality_0_2: "0-2%",
  mortality_3_10: "3-10%",
  mortality_10_20: "10-20%",
  mortality_20_30: "20-30%",
  mortality_40: "40%",
  mortality_50: "50%",
  mortality_60: "60%",
  mortality_70: "70%",
  mortality_80: "80%",
  mortality_90: "90%",
  mortality_99: "99%",
  
  risk_low: "Низкий",
  risk_moderate: "Умеренный",
  risk_high: "Высокий",
  risk_very_high: "Очень высокий",
  
  // PubMed links
  joel_gore_publications: "Публикации д-ра Джоэла Гора",
  keith_fox_publications: "Публикации д-ра Кита А. А. Фокса",
  
  // Expert quotes and detailed content
  gore_grace_quote: "GRACE 2.0 представляет собой улучшенный и уточненный список исходов GRACE; вместо использования диапазонов баллов для расчета исходов, таких как госпитальная смертность, мы можем фактически рассчитать смертность для каждого балла. Следует использовать GRACE 2.0.",
  gore_clinical_usage: "Мы используем исход госпитальной смертности с баллами GRACE. Это помогает нам определить размещение наших пациентов с STEMI; те, у кого балл 130 или выше, идут в отделение интенсивной терапии после катетеризации, а те, у кого баллы ниже, могут пойти в наше пошаговое отделение.",
  gore_nstemi_quote: "Мы также иногда используем балл GRACE для наших пациентов с NSTEMI высокого риска, чтобы рассмотреть раннее инвазивное лечение в отличие от отложенного вмешательства.",
  fox_development_purpose: "Мы разработали балл риска GRACE ACS, потому что увидели потребность в лучшей стратификации риска для руководства лечением ACS и для помощи в решении парадокса 'Лечение-Риск'.",
  fox_clinical_pearl: "Важно учитывать не только общий риск, но и риск, который можно изменить (риск ИМ помогает в этом).",
  fox_current_research: "В настоящее время мы работаем над разработкой моделей для выявления изменяемого риска и долгосрочного риска у пациентов с ACS.",
  
  // Section labels for expert content
  on_grace_vs_grace_2: "О GRACE против GRACE 2.0:",
  clinical_usage: "Клиническое использование:",
  on_nstemi_patients: "О пациентах с NSTEMI:",
  development_purpose: "Цель разработки:",
  clinical_pearl: "Клиническая жемчужина:",
  current_research: "Текущие исследования:",
  
  // Facts and figures table content
  grace_score_range_header: "Диапазон баллов GRACE",
  mortality_risk_header: "Риск смертности",
  risk_category_header: "Категория риска",
  
  // Evidence and validation content
  database_scale_title: "Масштаб базы данных",
  database_scale_description: "GRACE (Глобальный реестр острых коронарных событий) представляет собой массивную международную базу данных ACS в 94 больницах в 14 странах, что обеспечивает отличную внешнюю валидность.",
  patient_population_title: "Популяция пациентов",
  patient_population_description: "Изучено 11,389 пациентов с ACS с доступным статусом госпитальной смертности в 98.1%. 22% госпитальных смертей произошло в течение 24 часов после поступления, что говорит о очень тяжелой когорте.",
  grace_2_improvements_title: "Улучшения GRACE 2.0",
  grace_2_improvements_description: "GRACE 2.0 оценил переменные на нелинейные ассоциации смертности, обеспечивая более точные оценки. Включает оценки смертности до 3 лет после события ACS.",
  validation_status_title: "Статус валидации",
  validation_status_description: "Валидирован на >20,000 пациентах в нескольких базах данных и чрезвычайно хорошо изучен. Руководящие принципы NICE рекомендуют балл GRACE для стратификации риска ACS.",
  
  // Clinical pearls content
  essential_clinical_insights: "Основные клинические инсайты",
  purpose_limitations_title: "Цель и ограничения",
  purpose_limitations_description: "Балл GRACE является проспективно изученной системой подсчета баллов для стратификации риска пациентов с диагностированным ACS для оценки их госпитальной и от 6 месяцев до 3 лет смертности. Как и балл TIMI, он не был разработан для оценки того, какие ангинальные симптомы пациентов вызваны ACS.",
  score_version_title: "Версия балла",
  score_version_description: "Балл GRACE был недавно улучшен (GRACE 2.0); этот калькулятор использует систему подсчета баллов GRACE 2.0, которая показала себя более точной, чем оригинальный балл.",
  clinical_validation_title: "Клиническая валидация",
  clinical_validation_description: "Этот балл был валидирован на >20,000 пациентах в нескольких базах данных и чрезвычайно хорошо изучен и поддержан. Руководящие принципы NICE рекомендуют балл GRACE для стратификации риска пациентов с ACS.",
  mini_grace_title: "Альтернатива Mini-GRACE",
  mini_grace_description: "Альтернативная версия, mini-GRACE, позволяет заменить класс Killip на использование диуретиков и/или сывороточный креатинин на историю почечной дисфункции. Однако эта платформа использует полную версию, требующую как класса Killip, так и сывороточного креатинина."
};

export default grace2Translations; 