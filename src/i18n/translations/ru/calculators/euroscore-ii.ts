export default {
  title: 'Калькулятор риска EuroSCORE II',
  subtitle: 'Европейская система оценки кардиохирургического риска • Версия 2 • Прогнозирование 30-дневной смертности',
  description: 'Обновленная европейская система оценки кардиохирургического риска, обеспечивающая прогнозирование 30-дневной смертности. Валидирована в европейских центрах с улучшенной калибровкой по сравнению с оригинальной моделью EuroSCORE.',
  
  validation: {
    age_required: 'Возраст обязателен',
    age_range: 'Возраст должен быть от 18 до 120 лет',
    gender_required: 'Пол обязателен',
    urgency_required: 'Срочность обязательна',
    nyha_required: 'Класс NYHA обязателен',
    procedure_weight_required: 'Вес/сложность процедуры обязательны',
    creatinine_required: 'Креатинин обязателен',
    creatinine_range: 'Креатинин должен быть от 0.5 до 15 мг/дл'
  },
  
  alert_title: 'EuroSCORE II - Европейская модель кардиохирургического риска',
  alert_description: 'Обновленная европейская система оценки кардиохирургического риска, обеспечивающая прогнозирование 30-дневной смертности. Валидирована в европейских центрах с улучшенной калибровкой по сравнению с оригинальной моделью EuroSCORE.',
  alert_validation: 'Nashef и соавт. - Европейская валидация - Обновленный алгоритм',
  
  step_patient_factors: 'Факторы пациента',
  step_cardiac_status: 'Кардиальный статус',
  step_operative_factors: 'Операционные факторы',
  step_procedures: 'Процедуры',
  
  section_patient_demographics: 'Демография пациента и основные факторы',
  section_patient_description: 'Основные характеристики пациента и лабораторные показатели',
  section_cardiac_factors: 'Кардиальные факторы',
  section_cardiac_description: 'Кардиальный анамнез, симптомы и функциональный статус',
  section_operative_factors: 'Операционные факторы',
  section_operative_description: 'Сложность процедуры и критические предоперационные состояния',
  section_valve_procedures: 'Клапанные процедуры',
  section_specific_cardiac_procedures: 'Специфические кардиальные процедуры',
  section_specific_procedures_description: 'Индивидуальные клапанные и хирургические процедуры',
  
  age_label: 'Возраст',
  age_placeholder: '65',
  age_unit: 'лет',
  gender_label: 'Пол',
  gender_placeholder: 'Выберите пол...',
  gender_male: 'Мужской',
  gender_female: 'Женский',
  creatinine_label: 'Креатинин сыворотки',
  creatinine_placeholder: '1.0',
  creatinine_unit: 'мг/дл',
  
  additional_risk_factors: 'Дополнительные факторы риска пациента',
  poor_mobility_label: 'Ограниченная подвижность',
  poor_mobility_description: 'Нарушенная подвижность, влияющая на повседневную активность',
  diabetes_insulin_label: 'Диабет на инсулине',
  diabetes_insulin_description: 'Сахарный диабет, требующий инсулинотерапии',
  chronic_pulmonary_label: 'Хроническое заболевание легких',
  chronic_pulmonary_description: 'ХОБЛ или другие хронические заболевания легких',
  pvd_label: 'Заболевание периферических сосудов',
  pvd_description: 'Заболевание периферических артерий или перемежающаяся хромота',
  
  nyha_label: 'Функциональный класс по NYHA',
  nyha_placeholder: 'Выберите класс NYHA...',
  nyha_class_1: 'Класс I - Без симптомов',
  nyha_class_2: 'Класс II - Легкие ограничения',
  nyha_class_3: 'Класс III - Выраженные ограничения',
  nyha_class_4: 'Класс IV - Тяжелые ограничения',
  
  urgency_label: 'Срочность',
  urgency_placeholder: 'Выберите уровень срочности...',
  urgency_elective: 'Плановая',
  urgency_urgent: 'Срочная',
  urgency_emergency: 'Экстренная',
  
  cardiac_history_title: 'Кардиальный анамнез и состояния',
  recent_mi_label: 'Недавний ИМ (в течение 90 дней)',
  recent_mi_description: 'Инфаркт миокарда в течение 90 дней',
  unstable_angina_label: 'Нестабильная стенокардия',
  unstable_angina_description: 'Стенокардия покоя, требующая в/в нитратов',
  pulmonary_hypertension_label: 'Легочная гипертензия',
  pulmonary_hypertension_description: 'Систолическое давление в ЛА > 60 мм рт.ст.',
  extracardiac_arteriopathy_label: 'Внесердечная артериопатия',
  extracardiac_arteriopathy_description: 'Перемежающаяся хромота, окклюзия сонной артерии или инсульт',
  neurological_dysfunction_label: 'Неврологическая дисфункция',
  neurological_dysfunction_description: 'Заболевание, серьезно влияющее на передвижение или повседневную активность',
  previous_cardiac_surgery_label: 'Предыдущая кардиохирургия',
  previous_cardiac_surgery_description: 'Предшествующая кардиохирургическая операция',
  active_endocarditis_label: 'Активный эндокардит',
  active_endocarditis_description: 'Пациент все еще получает антибиотикотерапию по поводу эндокардита',
  
  procedure_weight_label: 'Вес/сложность процедуры',
  procedure_weight_placeholder: 'Выберите сложность процедуры...',
  procedure_weight_low: 'Низкая сложность (только АКШ, одна клапан)',
  procedure_weight_medium: 'Средняя сложность (АКШ + клапан, два клапана)',
  procedure_weight_high: 'Высокая сложность (множественные процедуры, сложные пластики)',
  
  critical_preoperative_label: 'Критическое предоперационное состояние',
  critical_preoperative_description: 'Желудочковая тахикардия или фибрилляция желудочков или остановленная внезапная смерть, предоперационный массаж сердца, предоперационная ИВЛ до операционной, предоперационная инотропная поддержка, внутриаортальная баллонная контрпульсация или предоперационная острая почечная недостаточность (анурия или олигурия < 10 мл/час)',
  
  critical_conditions_header: 'Критические предоперационные состояния',
  
  complexity_info_title: 'Сложность процедуры EuroSCORE II',
  complexity_low_info: '• Низкая: Протезирование одного клапана, только АКШ',
  complexity_medium_info: '• Средняя: АКШ + клапан, процедуры на двух клапанах',
  complexity_high_info: '• Высокая: Множественные клапаны + АКШ, сложная хирургия аорты, спасательные процедуры',
  
  aortic_surgery_label: 'Хирургия аортального клапана',
  aortic_surgery_description: 'Протезирование или пластика аортального клапана',
  mitral_surgery_label: 'Хирургия митрального клапана',
  mitral_surgery_description: 'Протезирование или пластика митрального клапана',
  tricuspid_surgery_label: 'Хирургия трикуспидального клапана',
  tricuspid_surgery_description: 'Протезирование или пластика трикуспидального клапана',
  pulmonary_surgery_label: 'Хирургия легочного клапана',
  pulmonary_surgery_description: 'Протезирование или пластика легочного клапана',
  
  risk_assessment_title: 'Оценка риска EuroSCORE II',
  risk_assessment_complexity: '• Каждая специфическая процедура добавляет к общей хирургической сложности',
  risk_assessment_multiple: '• Множественные клапанные процедуры значительно увеличивают операционный риск',
  risk_assessment_combined: '• Учитывайте комбинированные процедуры при расчете финального риска',
  
  next_cardiac_status: 'Далее: Кардиальный статус',
  next_operative_factors: 'Далее: Операционные факторы',
  next_specific_procedures: 'Далее: Специфические процедуры',
  back_button: 'Назад',
  calculate_euroscore_ii: 'Рассчитать EuroSCORE II',
  
  results_title: 'Результаты оценки EuroSCORE II',
  mortality_risk_30day: 'Риск 30-дневной смертности',
  predicted_mortality: 'Прогнозируемая 30-дневная смертность',
  risk_stratification: 'Стратификация риска EuroSCORE II',
  
  risk_low: 'Низкий риск',
  risk_intermediate: 'Промежуточный',
  risk_high: 'Высокий риск',
  risk_very_high: 'Очень высокий',
  
  mortality_low: '< 2% смертность',
  mortality_intermediate: '2-5% смертность',
  mortality_high: '5-10% смертность',
  mortality_very_high: '> 10% смертность',
  
  interpretation_low: 'Низкий операционный риск (EuroSCORE II <2%)',
  interpretation_intermediate: 'Промежуточный операционный риск (EuroSCORE II 2-5%)',
  interpretation_high: 'Высокий операционный риск (EuroSCORE II 5-10%)',
  interpretation_very_high: 'Очень высокий операционный риск (EuroSCORE II >10%)',
  
  sts_comparison_title: 'Сравнение с моделями риска STS',
  sts_comparison_low: 'Обычно коррелирует с низким риском STS (<2%). Обе модели поддерживают стандартный хирургический подход.',
  sts_comparison_intermediate: 'Аналогично промежуточному риску STS (2-5%). Рекомендуется усиленный мониторинг и оптимизация.',
  sts_comparison_high: 'Сопоставимо с высоким риском STS (5-10%). Рассмотреть оценку кардиокоманды и альтернативы.',
  sts_comparison_very_high: 'Соответствует очень высокому риску STS (>10%). Серьезное рассмотрение нехирургических вариантов.',
  sts_comparison_default: 'Рекомендуется сравнение оценки риска с моделями STS.',
  
  clinical_recommendations: 'Рекомендации по клиническому ведению',
  
  recommendation_team_evaluation: 'Мультидисциплинарная оценка кардиокоманды',
  recommendation_preop_optimization: 'Предоперационная оптимизация по показаниям',
  recommendation_counseling: 'Консультирование пациента и семьи о рисках',
  
  recommendation_standard_approach: 'Стандартный хирургический подход подходящий',
  recommendation_fast_track: 'Рассмотреть быстрые протоколы',
  recommendation_routine_care: 'Рутинный послеоперационный уход',
  
  recommendation_enhanced_assessment: 'Расширенная предоперационная оценка',
  recommendation_additional_imaging: 'Рассмотреть дополнительные исследования визуализации',
  recommendation_standard_icu: 'Стандартный мониторинг в ОИТ',
  recommendation_risk_modification: 'Пересмотреть факторы риска для модификации',
  
  recommendation_alternative_approaches: 'Рассмотреть альтернативные подходы (TAVI, медикаментозная терапия)',
  recommendation_extensive_optimization: 'Обширная предоперационная оптимизация',
  recommendation_extended_icu: 'Запланированный расширенный мониторинг в ОИТ',
  recommendation_informed_consent: 'Детальное обсуждение информированного согласия',
  recommendation_less_invasive: 'Рассмотреть менее инвазивные альтернативы',
  
  recommendation_non_surgical: 'Серьезно рассмотреть нехирургические альтернативы',
  recommendation_palliative_care: 'Консультация паллиативной помощи',
  recommendation_goals_care: 'Обсуждение целей лечения',
  recommendation_high_risk_protocols: 'При проведении операции - протоколы высокого риска',
  recommendation_transcatheter: 'Рассмотреть транскатетерные подходы',
  recommendation_family_meeting: 'Семейное собрание обязательно',
  
  validation_status_title: 'Статус валидации EuroSCORE II',
  validation_status_text: '✓ Европейская валидация • Nashef и соавт. 2012 • Обновленный алгоритм • Улучшенная калибровка',
  
  new_assessment: 'Новая оценка',
  modify_inputs: 'Изменить входные данные',
  calculate_button: 'Рассчитать EuroSCORE II',
  new_assessment_button: 'Новая оценка',
  modify_inputs_button: 'Изменить входные данные',
  
  mortality_risk_title: 'Риск 30-дневной смертности',
  risk_stratification_title: 'Стратификация риска EuroSCORE II',
  clinical_recommendations_title: 'Рекомендации по клиническому ведению',
  predicted_mortality_label: 'Прогнозируемая 30-дневная смертность',
  risk_label: 'Риск',
  
  low_risk_label: 'Низкий риск',
  intermediate_risk_label: 'Промежуточный риск',
  high_risk_label: 'Высокий риск',
  very_high_risk_label: 'Очень высокий риск',
  
  low_risk_range: '< 2%',
  intermediate_risk_range: '2-5%',
  high_risk_range: '5-10%',
  very_high_risk_range: '> 10%',
  
  validation_badge: 'Европейская валидация',
  footer_info: 'Основано на EuroSCORE II Nashef и соавт. • Только для образовательных целей',
  
  footer_text: 'Основано на EuroSCORE II Nashef и соавт. • Только для образовательных целей',
  european_validation: 'Европейская валидация',
  
  // Creator section
  creator: {
    title: 'О создателе',
    name: 'Д-р Самер А. М. Нашеф',
    about: 'Д-р Самер А. М. Нашеф, MB ChB, FRCS, PhD, является кардиоторакальным хирургом в больнице Папворт в Кембридже, Великобритания.',
    research: 'Основные исследования д-ра Нашефа сосредоточены на фибрилляции предсердий и стратификации рисков в кардиохирургии.',
    view_publications: 'Посмотреть публикации на PubMed'
  },
  
  // Evidence section
  evidence: {
    title: 'Доказательная база',
    formula_title: 'ФОРМУЛА',
    coefficients_note: 'Таблица коэффициентов',
    coefficients_description: 'Модель EuroSCORE II использует множественные факторы пациента, сердечные и процедурные факторы с конкретными коэффициентами для расчета прогнозируемого риска смертности.',
    literature_title: 'Литература',
    original_reference: 'Оригинальная/Первичная ссылка',
    validation_studies: 'Валидация'
  },
  
  validation_status_description: '✓ Европейская валидация • Nashef и соавт. 2012 • Обновленный алгоритм • Улучшенная калибровка',

  // Missing validation keys
  creatinine_clearance_required: 'Клиренс креатинина обязателен',
  lv_function_required: 'Функция ЛЖ обязательна',
  pa_pressure_required: 'Давление в лёгочной артерии обязательно',

  // Missing gender descriptions
  gender_description: 'Выберите пол пациента',
  gender_male_description: 'Пациент мужского пола',
  gender_female_description: 'Пациент женского пола',

  // Missing NYHA detailed descriptions
  nyha_description: 'Функциональная классификация Нью-Йоркской ассоциации сердца',
  nyha_class_1_full: 'Класс I: отсутствие симптомов при умеренной нагрузке',
  nyha_class_2_full: 'Класс II: симптомы при умеренной нагрузке',
  nyha_class_3_full: 'Класс III: симптомы при легкой нагрузке',
  nyha_class_4_full: 'Класс IV: симптомы в покое',
  nyha_class_1_description: 'Нет ограничения физической активности',
  nyha_class_2_description: 'Легкое ограничение физической активности',
  nyha_class_3_description: 'Значительное ограничение физической активности',
  nyha_class_4_description: 'Невозможность выполнения любой физической активности без дискомфорта',

  // Missing creatinine clearance fields
  creatinine_clearance_label: 'Клиренс креатинина (Cockcroft-Gault)',
  creatinine_clearance_placeholder: 'Выберите клиренс креатинина...',
  creatinine_clearance_description: 'Оценка функции почек по формуле Cockcroft-Gault',
  creatinine_normal: 'Нормальная функция почек',
  creatinine_mild: 'Легко сниженная функция почек',
  creatinine_moderate: 'Умеренно или тяжело сниженная функция почек',
  creatinine_dialysis: 'Пациент требует диализной терапии',
  creatinine_clearance_gt85: '>85 мл/мин',
  creatinine_clearance_51_85: '51-85 мл/мин',
  creatinine_clearance_le50: '≤50 мл/мин',
  creatinine_clearance_dialysis: 'На диализе (независимо от уровня креатинина)',

  // Missing LV function fields
  lv_function_label: 'Функция ЛЖ или ФВЛЖ',
  lv_function_placeholder: 'Выберите функцию ЛЖ...',
  lv_function_description: 'Выберите категорию фракции выброса левого желудочка',
  lv_function_good: 'Хорошая (ФВЛЖ ≥51%)',
  lv_function_good_description: 'Нормальная систолическая функция левого желудочка',
  lv_function_moderate: 'Умеренная (ФВЛЖ 31-50%)',
  lv_function_moderate_description: 'Легко сниженная функция левого желудочка',
  lv_function_poor: 'Плохая (ФВЛЖ 21-30%)',
  lv_function_poor_description: 'Умеренно сниженная функция левого желудочка',
  lv_function_very_poor: 'Очень плохая (ФВЛЖ ≤20%)',
  lv_function_very_poor_description: 'Тяжело сниженная функция левого желудочка',

  // Missing pulmonary artery pressure keys
  pa_pressure_label: 'Систолическое давление в лёгочной артерии',
  pa_pressure_placeholder: 'Выберите давление в ЛА...',
  pa_pressure_description: 'Измерение систолического давления в лёгочной артерии',
  pa_pressure_normal: 'Нормальное давление в лёгочной артерии',
  pa_pressure_mild: 'Легко повышенное давление в лёгочной артерии',
  pa_pressure_severe: 'Значительно повышенное давление в лёгочной артерии',
  pa_pressure_lt31: '<31 мм рт.ст.',
  pa_pressure_31_54: '31-54 мм рт.ст.',
  pa_pressure_ge55: '≥55 мм рт.ст.',

  // Missing CCS and detailed cardiac descriptions
  ccs_class4_label: 'ХКС класс 4 стенокардия',
  ccs_class4_description: 'Невозможность выполнения любой активности без стенокардии или стенокардия в покое',
  extracardiac_arteriopathy_description_detailed: '≥1 из: перемежающаяся хромота; окклюзия сонной артерии или >50% стеноз; ампутация по поводу артериального заболевания; предшествующее/планируемое вмешательство на брюшной аорте, артериях конечностей или сонных артериях',
  previous_cardiac_surgery_description_detailed: '≥1 предшествующая крупная кардиальная операция с вскрытием перикарда',
  active_endocarditis_description_detailed: 'На антибиотиках по поводу эндокардита во время операции',
  recent_mi_description_detailed: 'Инфаркт миокарда ≤90 дней до операции',

  // Missing urgency detailed descriptions
  urgency_description: 'Классификация хирургической срочности',
  urgency_elective_description: 'Плановая операция с оптимальным временем',
  urgency_urgent_description: 'Операция требуется во время текущей госпитализации',
  urgency_emergency_description: 'Операция требуется в течение 24 часов',
  urgency_salvage_description: 'Пациенты, требующие СЛР до или во время операции',
  urgency_elective_full: 'Плановая: рутинная госпитализация для операции',
  urgency_urgent_full: 'Срочная: не плановая госпитализация, но требует операции во время текущей госпитализации',
  urgency_emergency_full: 'Экстренная: операция до начала следующего рабочего дня',
  urgency_salvage_full: 'Спасательная: пациенты, требующие СЛР по пути в ОР или до индукции',

  // Missing procedure weight fields
  weight_of_procedure_label: 'Вес процедуры',
  weight_of_procedure_placeholder: 'Выберите вес процедуры...',
  procedure_complexity_classification: 'Классификация хирургической сложности',
  isolated_cabg: 'Изолированное АКШ',
  isolated_cabg_description: 'Только аортокоронарное шунтирование',
  isolated_non_cabg: 'Изолированная не-АКШ крупная процедура (напр. один клапан)',
  isolated_non_cabg_description: 'Одна крупная кардиальная процедура исключая АКШ',
  two_major: '2 крупные процедуры (напр. АКШ и протезирование АК)',
  two_major_description: 'Две крупные кардиальные процедуры вместе',
  three_plus_major: '≥3 крупные процедуры (напр. протезирование АК, МК и АКШ)',
  three_plus_major_description: 'Три или более крупных кардиальных процедур',

  // Missing critical preoperative state
  critical_preoperative_state_label: 'Критическое предоперационное состояние',
  critical_preoperative_state_description_detailed: '≥1 из: желудочковая тахикардия или фибрилляция или прерванная внезапная смерть; массаж сердца; вентиляция до прибытия в ОР; инотропы; ВАБК или ВСУ до прибытия в ОР; острая почечная недостаточность (анурия или олигурия <10 мл/час)',

  // Missing thoracic aorta
  thoracic_aorta_label: 'Операция на грудной аорте',
  thoracic_aorta_description: 'Операция с вовлечением грудной аорты',

  // Missing live risk preview
  live_risk_preview: 'Предварительный просмотр риска',
  updates_as_complete: 'Обновляется по мере заполнения формы',

  // Missing progress indicators
  completion_progress: 'Прогресс заполнения',
  sections_completed: 'разделов завершено',
  patient_section: 'Пациент',
  cardiac_section: 'Сердце',
  operative_section: 'Операционный',

  // Missing progress steps detailed
  patient_factors: 'Факторы пациента',
  cardiac_factors: 'Кардиальные факторы',
  operative_factors: 'Операционные факторы',
  next_operative_factors_full: 'Далее: Операционные факторы',

  // Missing calculation messages
  calculating: 'Расчет оценки риска',
  analyzing_patient_factors: 'Анализ факторов риска пациента...',
  calculating_cardiac_indices: 'Расчет кардиальных индексов риска...',
  applying_euroscore_algorithm: 'Применение алгоритма EuroSCORE II...',
  generating_recommendations: 'Генерация клинических рекомендаций...',
  initializing_assessment: 'Инициализация оценки...',

  // Missing risk category full labels
  risk_low_full: 'Низкий риск',
  risk_intermediate_full: 'Промежуточный риск',
  risk_high_full: 'Высокий риск',
  risk_very_high_full: 'Очень высокий риск',

  // Missing risk level descriptions
  good_surgical_candidate: 'Хороший хирургический кандидат',
  requires_careful_evaluation: 'Требует тщательной оценки',
  extensive_risk_benefit_analysis: 'Требует обширного анализа риск-польза',

  // Missing results section detailed
  clinical_grade_assessment: 'Клиническая оценка степени',
  risk_stratification_analysis: 'Анализ стратификации риска',
  population_based_categorization: 'Популяционная категоризация',
  excellent_surgical_candidate: 'Отличный хирургический кандидат',
  moderate_surgical_risk: 'Умеренный хирургический риск',
  enhanced_perioperative_care: 'Усиленная периоперационная помощь',
  multidisciplinary_evaluation: 'Мультидисциплинарная оценка',

  // Missing results subtitle
  results_subtitle: 'Оценка риска EuroSCORE II • Профессиональный клинический анализ',

  // Missing comparative analysis
  comparative_risk_analysis: 'Сравнительный анализ риска',
  euroscore_vs_population: 'EuroSCORE II против популяционных показателей',
  risk_comparison_chart: 'Диаграмма сравнения риска',
  mortality_risk_percent: '30-дневный риск смертности (%)',
  population_average: 'Популяционное среднее',
  your_patient: 'Ваш пациент',
  low_risk_cohort: 'Когорта низкого риска',
  high_risk_cohort: 'Когорта высокого риска',

  // Missing risk model comparison
  risk_model_comparison: 'Сравнение моделей риска',
  euroscore_ii_current: 'EuroSCORE II',
  current_label: 'Текущий',
  sts_risk_score: 'Шкала риска STS',
  reference_label: 'Референс',
  mortality_risk_result: '30-дневный риск смертности',
  latest_european_algorithm: 'Последний европейский алгоритм (2012), валидированный на 22,381 пациентах',
  north_american_standard: 'Североамериканский стандарт, база данных Общества торакальных хирургов',

  // Missing clinical significance
  clinical_significance: 'Клиническое значение',
  excellent_surgical_candidate_full: 'Отличный хирургический кандидат с минимальным периоперационным риском',
  standard_surgical_risk: 'Стандартный хирургический риск, требующий рутинного периоперационного мониторинга',
  elevated_risk_enhanced_care: 'Повышенный риск, требующий усиленного периоперационного ухода и мониторинга',
  high_risk_specialized_care: 'Пациент высокого риска, требующий специализированной мультидисциплинарной помощи',

  // Missing scientific foundation
  scientific_foundation: 'Научная основа',
  evidence_based_validation: 'Доказательная валидация алгоритма',
  algorithm_validation: 'Валидация алгоритма',
  validated_on_patients: 'Валидировано на 22,381 пациентах',
  c_index_excellent: 'C-индекс: 0.8095 (отличная дискриминация)',
  multiple_international_validations: 'Множественные международные валидации',
  key_validation_studies: 'Ключевые валидационные исследования',
  original_development: 'Оригинальная разработка (2012)',
  international_validation: 'Международная валидация (2013)',
  nashef_reference: 'Nashef SA, et al. EuroSCORE II. Eur J Cardiothorac Surg. 2012;41(4):734-44.',
  chalmers_reference: 'Chalmers J, et al. Validation of EuroSCORE II in a modern cohort. Eur J Cardiothorac Surg. 2013;43(4):688-94.',

  // Missing professional actions
  new_assessment_action: 'Новая оценка',
  print_results: 'Печать результатов',

  // Missing formula text
  formula_prediction: 'Прогнозируемая смертность = e^y / (1 + e^y)',
  formula_where_y: 'Где y = -5.324537 + Σ βᵢxᵢ'
}; 