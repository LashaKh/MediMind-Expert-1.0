export const endometrialCancerRiskCalculator = {
  title: 'Калькулятор риска рака эндометрия',
  subtitle: 'Оценка пожизненного риска рака эндометрия',
  
  // Tab Labels
  calculate_button: 'Калькулятор',
  about_title: 'О калькуляторе',
  
  // Progress Section
  risk_assessment: 'Оценка риска',
  step_indicator: 'Шаг {{step}} из 3',
  
  // Step Descriptions
  demographics: 'Демография',
  physical_characteristics: 'Физические характеристики',
  medical_history: 'Медицинская история',
  risk_factors: 'Факторы риска',
  risk_factors_analysis: 'Анализ факторов риска',
  calculate_risk: 'Рассчитать риск',
  
  // Step 1: Demographics & Physical Characteristics
  age_label: 'Возраст',
  age_placeholder: 'Введите ваш возраст',
  age_help: 'Текущий возраст в годах (18-100)',
  age_error: 'Введите корректный возраст от 18 до 100 лет',
  
  bmi_label: 'ИМТ (Индекс массы тела)',
  bmi_placeholder: 'Введите ваш ИМТ',
  bmi_help: 'Индекс массы тела в кг/м² (15-60)',
  bmi_error: 'Введите корректный ИМТ от 15 до 60 кг/м²',
  
  // Units
  years: 'лет',
  kg_m2: 'кг/м²',
  
  // BMI Categories
  bmi_categories: 'Категории риска по ИМТ',
  bmi_normal: 'Норма (18.5-24.9)',
  baseline_risk: 'Базовый риск',
  bmi_overweight: 'Избыточный вес (25-29.9)',
  moderate_risk: 'Слегка повышенный риск',
  bmi_obese_i: 'Ожирение I степени (30-34.9)',
  high_risk_2_3x: 'Повышенный риск в 2-3 раза',
  bmi_obese_ii: 'Ожирение II+ степени (≥35)',
  very_high_risk_3_6x: 'Повышенный риск в 3-6 раз',
  
  // Navigation Buttons
  next_medical_history: 'Далее: Медицинская история',
  previous: 'Назад',
  next_calculate_risk: 'Далее: Расчет риска',
  
  // Step 2: Medical History & Risk Factors
  medical_conditions: 'Медицинские состояния',
  reproductive_history: 'Репродуктивная история',
  medication_history: 'История медикаментов',
  
  // Medical Conditions
  diabetes_label: 'Сахарный диабет 2 типа',
  diabetes_description: 'Текущий диагноз сахарного диабета 2 типа',
  lynch_syndrome_label: 'Синдром Линча',
  lynch_syndrome_description: 'Наследственный неполипозный колоректальный рак',
  family_history_label: 'Семейный анамнез рака эндометрия',
  family_history_description: 'Рак эндометрия у родственников первой линии',
  
  // Reproductive History
  nulliparity_label: 'Нерожавшие (Без предыдущих беременностей)',
  nulliparity_description: 'Никогда не была беременна или не доносила до жизнеспособности',
  late_menopause_label: 'Поздняя менопауза (После 52 лет)',
  late_menopause_description: 'Естественная менопауза, наступившая после 52 лет',
  
  // Medication History
  tamoxifen_label: 'Применение тамоксифена',
  tamoxifen_description: 'Текущая или предыдущая терапия тамоксифеном',
  unopposed_estrogen_label: 'Неоппозиционная эстрогенная терапия',
  unopposed_estrogen_description: 'Терапия эстрогенами без прогестерона',
  
  // Step 3: Assessment Review
  risk_assessment_review: 'Обзор оценки риска',
  assessment_summary: 'Сводка оценки',
  
  // Summary Labels (Short forms)
  diabetes_short: 'Диабет',
  nulliparity_short: 'Нерожавшие',
  late_menopause_short: 'Поздняя менопауза',
  tamoxifen_short: 'Тамоксифен',
  unopposed_estrogen_short: 'Неоппозиционный эстроген',
  lynch_syndrome_short: 'Синдром Линча',
  yes: 'Да',
  no: 'Нет',
  
  // Calculation Buttons
  calculating: 'Расчет риска...',
  calculate_risk_assessment: 'Рассчитать оценку риска',
  reset_all_fields: 'Сбросить все поля',
  
  // Results Section
  risk: 'Риск',
  risk_level: 'Уровень риска',
  lifetime_risk: 'Пожизненный риск',
  management_recommendation: 'Рекомендации по ведению',
  management_description: 'Научно-обоснованные стратегии ведения для вашего профиля риска',
  screening_recommendation: 'Рекомендации по скринингу',
  protective_factors: 'Защитные факторы',
  clinical_recommendations: 'Клинические рекомендации',
  
  // About Section
  clinical_purpose: 'Клиническое назначение',
  clinical_purpose_desc: 'Этот калькулятор обеспечивает комплексную оценку риска рака эндометрия на основе установленных клинических факторов риска и эпидемиологических данных.',
  clinical_purpose_details: 'Рак эндометрия является наиболее распространенным гинекологическим злокачественным новообразованием в развитых странах. Оценка на основе риска позволяет персонализированные стратегии скрининга и профилактики.',
  
  // High Risk Factors
  high_risk_factors: 'Факторы высокого риска',
  obesity_risk: 'Ожирение (ИМТ ≥30 кг/м²)',
  diabetes_risk: 'Сахарный диабет 2 типа',
  nulliparity_risk: 'Нерожавшие (никогда не была беременна)',
  late_menopause_risk: 'Поздняя менопауза (>52 лет)',
  lynch_syndrome_risk: 'Синдром Линча (наследственный)',
  unopposed_estrogen_risk: 'Неоппозиционная эстрогенная терапия',
  tamoxifen_risk: 'Терапия тамоксифеном',
  pcos_risk: 'Синдром поликистозных яичников (СПКЯ)',
  irregular_cycles_risk: 'Хроническая ановуляция/нерегулярные циклы',
  hyperplasia_risk: 'Гиперплазия эндометрия',
  family_history_risk: 'Семейный анамнез рака эндометрия',
  breast_ovarian_history_risk: 'Личная история рака молочной железы/яичников',
  
  // Protective Factors
  multiparity_protective: 'Многорожавшие (множественные беременности)',
  oral_contraceptive_protective: 'Длительное применение оральных контрацептивов',
  physical_activity_protective: 'Регулярная физическая активность',
  normal_bmi_protective: 'Нормальный ИМТ (18.5-24.9 кг/м²)',
  combined_hrt_protective: 'Комбинированная эстроген-прогестагенная терапия',
  breastfeeding_protective: 'Длительное грудное вскармливание',
  progestin_iud_protective: 'Прогестин-высвобождающая ВМС',
  smoking_cessation_protective: 'Отказ от курения',
  mediterranean_diet_protective: 'Средиземноморская диета',
  regular_cycles_protective: 'Регулярные овуляторные циклы',
  early_menopause_protective: 'Ранняя менопауза (<45 лет)',
  
  // Risk-Based Management
  risk_based_management: 'Стратегии ведения на основе риска',
  
  // Very High Risk (Lynch Syndrome)
  very_high_risk_lynch: 'Очень высокий риск (Синдром Линча)',
  annual_biopsy_lynch: 'Ежегодная биопсия эндометрия с 35 лет',
  tv_ultrasound_lynch: 'Ежегодное трансвагинальное УЗИ',
  prophylactic_hysterectomy_lynch: 'Рассмотреть профилактическую гистерэктомию после деторождения',
  genetic_counseling_lynch: 'Генетическое консультирование и семейный скрининг',
  enhanced_surveillance_lynch: 'Усиленные протоколы наблюдения',
  
  // High Risk (Multiple Factors)
  high_risk_multiple: 'Высокий риск (Множественные факторы риска)',
  enhanced_surveillance_high: 'Усиленное клиническое наблюдение',
  endometrial_sampling_high: 'Рассмотреть биопсию эндометрия при симптомах',
  weight_management_high: 'Активное консультирование по управлению весом',
  hormonal_risk_reduction_high: 'Гормональные стратегии снижения риска',
  patient_education_high: 'Комплексное обучение пациентов предупреждающим признакам',
  
  // Average Risk (General Population)
  average_risk_general: 'Средний риск (Общая популяция)',
  no_routine_screening_average: 'Рутинный скрининг не рекомендуется',
  prompt_evaluation_average: 'Быстрая оценка аномальных кровотечений',
  annual_pelvic_exam_average: 'Ежегодное гинекологическое обследование',
  lifestyle_counseling_average: 'Консультирование по изменению образа жизни',
  symptom_awareness_average: 'Обучение предупреждающим симптомам',
  
  // Warning Signs
  warning_signs: 'Предупреждающие признаки и симптомы',
  primary_warning_signs: 'Основные предупреждающие признаки',
  postmenopausal_bleeding_warning: 'Постменопаузальное кровотечение (ЛЮБОЕ количество)',
  abnormal_uterine_bleeding_warning: 'Аномальные маточные кровотечения',
  intermenstrual_bleeding_warning: 'Межменструальные кровотечения',
  heavy_prolonged_periods_warning: 'Обильные или длительные менструации',
  unusual_vaginal_discharge_warning: 'Необычные влагалищные выделения',
  
  // Advanced Disease Symptoms
  advanced_disease_symptoms: 'Симптомы распространенного заболевания',
  pelvic_pain_advanced: 'Постоянная тазовая боль',
  abdominal_distension_advanced: 'Вздутие живота',
  early_satiety_advanced: 'Раннее насыщение и вздутие',
  unexplained_weight_loss_advanced: 'Необъяснимая потеря веса',
  urinary_frequency_advanced: 'Учащенное или срочное мочеиспускание',
  bowel_symptoms_advanced: 'Новые кишечные симптомы',
  
  // Clinical Pearl
  clinical_pearl: 'Клиническая жемчужина',
  clinical_pearl_desc: 'Постменопаузальное кровотечение имеет 10-15% риск рака эндометрия и требует немедленной оценки с биопсией эндометрия.',
  
  // Diagnostic Evaluation
  diagnostic_evaluation: 'Диагностическая оценка',
  first_line_diagnostic: 'Диагностические тесты первой линии',
  endometrial_biopsy_diagnostic: 'Биопсия эндометрия (амбулаторная)',
  tv_ultrasound_diagnostic: 'Трансвагинальное УЗИ',
  saline_sonography_diagnostic: 'Соногистерография',
  hysteroscopy_diagnostic: 'Гистероскопия с биопсией',
  
  // Endometrial Thickness Thresholds
  endometrial_thickness_thresholds: 'Пороги толщины эндометрия',
  postmenopausal_threshold: 'Постменопауза: >4мм требует оценки',
  premenopausal_threshold: 'Пременопауза: Варьируется по фазе цикла',
  hrt_threshold: 'Пользователи ЗГТ: >5мм требует оценки',
  tamoxifen_threshold: 'Пользователи тамоксифена: >8мм требует оценки',
  
  // High-Risk Screening Protocols
  high_risk_screening_protocols: 'Протоколы скрининга высокого риска',
  lynch_screening: 'Синдром Линча: Ежегодный скрининг с 35 лет',
  tamoxifen_screening: 'Пользователи тамоксифена: Ежегодное гинекологическое обследование',
  unopposed_estrogen_screening: 'Неоппозиционный эстроген: Минимизировать продолжительность',
  pcos_screening: 'СПКЯ: Регулярная регуляция цикла и скрининг',
  
  // Clinical Guidelines & Evidence
  clinical_guidelines_evidence: 'Клинические руководства и доказательная база',
  nccn_guidelines_v2024: 'Руководство NCCN Версия 2024.1: Новообразования матки',
  sgo_clinical_statement: 'Клиническое заявление SGO по раку эндометрия',
  acog_bulletin_147: 'Бюллетень практики ACOG № 147: Синдром Линча',
  uspstf_2023: 'USPSTF 2023: Скрининг гинекологических состояний',
  esmo_guidelines: 'Клинические руководства ESMO: Рак эндометрия',
  nice_guidelines_ng12: 'Руководство NICE NG12: Распознавание подозреваемого рака',
  rcog_green_top: 'Руководство RCOG Green-top № 67: Рак эндометрия',
  asco_sso_guidelines: 'Руководство ASCO/SSO: Лечение рака эндометрия',
  
  // Service strings for calculations (results, risk factors, recommendations)
  service: {
    // Risk factor descriptions
    peak_incidence_age: 'Возрастная группа пика заболеваемости (55-69 лет)',
    advanced_age: 'Пожилой возраст',
    severe_obesity: 'Тяжелое ожирение (ИМТ ≥35) - повышенный риск в 5-6 раз',
    obesity: 'Ожирение (ИМТ 30-34.9) - повышенный риск в 3 раза',
    overweight: 'Избыточный вес (ИМТ 25-29.9) - умеренно повышенный риск',
    normal_bmi_baseline: 'Нормальный ИМТ (18.5-24.9) - базовый риск',
    type_2_diabetes_risk: 'Сахарный диабет 2 типа - повышенный риск в 2-4 раза',
    lynch_syndrome_risk: 'Синдром Линча - пожизненный риск 40-60%',
    family_history_cancer: 'Семейный анамнез рака эндометрия/яичников/толстой кишки',
    nulliparity_risk: 'Нерожавшие - повышенный риск в 2-3 раза',
    parity_protective: 'Роды - защитный фактор против рака эндометрия',
    late_menopause_estrogen: 'Поздняя менопауза (>52 лет) - длительное воздействие эстрогенов',
    tamoxifen_risk: 'Применение тамоксифена - повышенный риск в 2-7 раз',
    unopposed_estrogen_risk: 'Терапия неконъюгированными эстрогенами - повышенный риск в 8-15 раз',
    pregnancy_history: 'История беременности(ей)',
    normal_body_weight: 'Нормальная масса тела',
    no_risk_factors: 'Значительные факторы риска не выявлены',

    // Interpretation text parts
    lifetime_endometrial_cancer_risk: 'пожизненный риск рака эндометрия',
    population_average: 'средний популяционный',
    primary_risk_factors: 'Основные факторы риска:',

    // Screening recommendations by category
    screening_very_high: 'Ежегодная биопсия эндометрия с 35 лет. Рассмотреть профилактическую гистерэктомию после деторождения.',
    screening_high: 'Усиленное наблюдение с ежегодной оценкой. Рассмотреть забор эндометрия при любом аномальном кровотечении.',
    screening_moderate: 'Повышенная бдительность к симптомам. Срочная оценка любого аномального кровотечения.',
    screening_low: 'Стандартный уход. Срочная оценка любого постменопаузального кровотечения.',

    // Clinical recommendations
    genetic_counseling: 'Генетическое консультирование и семейное каскадное тестирование',
    prophylactic_surgery: 'Рассмотреть профилактическую гистерэктомию и двустороннюю сальпингоофорэктомию после деторождения',
    enhanced_surveillance: 'Усиленное наблюдение за раками, связанными с синдромом Линча',
    weight_management: 'Контроль веса через диету и физические упражнения',
    bariatric_surgery: 'Рассмотреть бариатрическую хирургию при тяжелом ожирении',
    glycemic_control: 'Оптимизировать гликемический контроль с целевым HbA1c <7%',
    metformin_consideration: 'Рассмотреть метформин, который может иметь защитные эффекты',
    progestin_addition: 'Рассмотреть добавление прогестина к эстрогенной терапии',
    hormone_alternatives: 'Оценить альтернативные варианты гормональной терапии',
    healthy_lifestyle: 'Поддерживать здоровый образ жизни: регулярные упражнения, сбалансированная диета',
    postmenopausal_bleeding_evaluation: 'Немедленная оценка любого постменопаузального кровотечения',
    annual_gynecologic_exam: 'Ежегодный гинекологический осмотр с тазовым обследованием',

    // Risk categories (for translation)
    risk_low: 'Низкий',
    risk_moderate: 'Умеренный',  
    risk_high: 'Высокий',
    risk_very_high: 'Очень высокий'
  }
}; 