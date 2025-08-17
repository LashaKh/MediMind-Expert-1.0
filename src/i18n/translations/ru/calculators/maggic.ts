export default {
  title: 'Калькулятор риска MAGGIC',
  subtitle: 'Мета-анализ глобальной группы по хронической сердечной недостаточности • Риск смертности 1-3 года',
  description: 'Основанный на доказательствах прогностический инструмент для оценки риска смертности при хронической сердечной недостаточности с использованием данных крупномасштабного мета-анализа.',
  
  // Alert section
  alert_title: 'Инструмент оценки риска MAGGIC',
  alert_description: 'Калькулятор риска Мета-анализ глобальной группы по хронической сердечной недостаточности (MAGGIC) предоставляет основанное на доказательствах прогнозирование смертности для пациентов с хронической сердечной недостаточностью. Этот инструмент валидирован в разнообразных популяциях пациентов и помогает руководить клиническими решениями и обсуждениями прогноза.',
  
  // Step labels
  demographics_step: 'Демография',
  clinical_step: 'Клиническая оценка',
  therapy_step: 'Оценка терапии',
  
  // Demographics section
  patient_demographics: 'Демография пациента',
  demographics_description: 'Основные демографические и клинические характеристики пациента',
  age_label: 'Возраст',
  age_placeholder: 'Введите возраст в годах',
  gender_label: 'Пол',
  gender_placeholder: 'Выберите пол',
  gender_male: 'Мужской',
  gender_female: 'Женский',
  lvef_label: 'Фракция выброса левого желудочка (ФВЛЖ)',
  lvef_placeholder: 'Введите ФВЛЖ в процентах',
  nyha_class_label: 'Функциональный класс по NYHA',
  nyha_class_placeholder: 'Выберите класс NYHA',
  nyha_class_1: 'Класс I - Без ограничений',
  nyha_class_2: 'Класс II - Легкое ограничение',
  nyha_class_3: 'Класс III - Выраженное ограничение',
  nyha_class_4: 'Класс IV - Тяжелое ограничение',
  
  // Clinical assessment section
  clinical_assessment: 'Клиническая оценка',
  clinical_description: 'Текущие жизненные показатели, лабораторные значения и статус сопутствующих заболеваний',
  systolic_bp_label: 'Систолическое артериальное давление',
  systolic_bp_placeholder: 'Введите систолическое АД',
  bmi_label: 'Индекс массы тела (ИМТ)',
  bmi_placeholder: 'Введите ИМТ',
  creatinine_label: 'Креатинин сыворотки',
  creatinine_placeholder: 'Введите уровень креатинина',
  comorbidities_section: 'Сопутствующие заболевания',
  diabetes_label: 'Сахарный диабет',
  copd_label: 'Хроническая обструктивная болезнь легких (ХОБЛ)',
  first_diagnosis_label: 'Первый диагноз СН (в течение 18 месяцев)',
  
  // Therapy assessment section
  therapy_assessment: 'Оценка текущей терапии',
  therapy_description: 'Статус текущей медикаментозной терапии согласно руководящим принципам',
  gdmt_section: 'Медикаментозная терапия согласно рекомендациям',
  beta_blocker_label: 'Терапия бета-блокаторами',
  ace_inhibitor_label: 'Терапия ингибиторами АПФ или БРА',
  
  // Button labels
  next_clinical_assessment: 'Далее: Клиническая оценка',
  next_therapy_assessment: 'Далее: Оценка терапии',
  calculate_maggic_risk: 'Рассчитать риск MAGGIC',
  new_assessment_button: 'Новая оценка',
  
  // Validation messages
  validation_age: 'Пожалуйста, введите действительный возраст от 18 до 100 лет',
  validation_gender: 'Пожалуйста, выберите пол',
  validation_nyha_class: 'Пожалуйста, выберите функциональный класс NYHA',
  validation_lvef: 'Пожалуйста, введите действительную ФВЛЖ от 10% до 80%',
  validation_systolic_bp: 'Пожалуйста, введите действительное систолическое АД от 70 до 250 мм рт.ст.',
  validation_bmi: 'Пожалуйста, введите действительный ИМТ от 15 до 50 кг/м²',
  validation_creatinine: 'Пожалуйста, введите действительный креатинин от 0,5 до 10,0 мг/дл',
  
  // Results section
  results_title: 'Результаты оценки риска MAGGIC',
  one_year_mortality: 'Риск смертности в течение 1 года',
  three_year_mortality: 'Риск смертности в течение 3 лет',
  risk_stratification_title: 'Категории стратификации риска',
  low_risk_category: 'Низкий риск (<10% 1 год)',
  intermediate_risk_category: 'Промежуточный риск (10-20% 1 год)',
  high_risk_category: 'Высокий риск (20-35% 1 год)',
  very_high_risk_category: 'Очень высокий риск (>35% 1 год)',
  mortality_rates_note: '* Показатели смертности основаны на мета-анализе консорциума MAGGIC >39,000 пациентов',
  recommendations_title: 'Рекомендации по клиническому ведению',
  algorithm_validation_title: 'Валидация алгоритма MAGGIC',
  algorithm_validation_text: '✓ Валидирован на >39,000 пациентов с СН • Получен из мета-анализа • Комплексная оценка риска',
  
  // About Creator section
  about_creator_title: 'О создателе',
  creator_name: 'Д-р Стюарт Покок',
  creator_description: 'Стюарт Покок, PhD, является профессором медицинской статистики в Лондонской школе гигиены и тропической медицины. Д-р Покок является директором нескольких исследовательских групп, изучающих эпидемиологию и фармакоэпидемиологию. Он опубликовал множество статей по крупным клиническим исследованиям, которые он проводил, особенно в области сердечно-сосудистых заболеваний.',
  view_publications: 'Посмотреть публикации д-ра Стюарта Покока',
  pubmed_link_text: 'PubMed',
  
  // Evidence section
  evidence_title: 'Доказательства',
  formula_title: 'Формула',
  formula_description: 'Сложение выбранных баллов.',
  facts_figures_title: 'Факты и цифры',
  
  // Risk factor tables
  risk_factor_title: 'Фактор риска',
  points_title: 'Баллы',
  
  // Basic risk factors
  male_factor: 'Мужской пол',
  smoker_factor: 'Курящий',
  diabetic_factor: 'Диабетик',
  copd_factor: 'ХОБЛ',
  heart_failure_18_months: 'Первый диагноз СН ≥18 месяцев назад',
  not_on_beta_blocker: 'Не принимает бета-блокатор',
  not_on_ace_arb: 'Не принимает АПФ-и/БРА',
  
  // Ejection fraction ranges
  ejection_fraction_title: 'Фракция выброса (ФВ)',
  ef_less_than_20: '<20',
  ef_20_24: '20-24',
  ef_25_29: '25-29',
  ef_30_34: '30-34',
  ef_35_39: '35-39',
  ef_40_plus: '≥40',
  
  // NYHA class
  nyha_class_title: 'Класс NYHA',
  nyha_1: '1',
  nyha_2: '2',
  nyha_3: '3',
  nyha_4: '4',
  
  // Creatinine ranges
  creatinine_title: 'Креатинин*',
  creatinine_less_90: '<90',
  creatinine_90_109: '90-109',
  creatinine_110_129: '110-129',
  creatinine_130_149: '130-149',
  creatinine_150_169: '150-169',
  creatinine_170_209: '170-209',
  creatinine_210_249: '210-249',
  creatinine_250_plus: '≥250',
  
  // BMI ranges
  bmi_title: 'ИМТ',
  bmi_less_15: '<15',
  bmi_15_19: '15-19',
  bmi_20_24: '20-24',
  bmi_25_29: '25-29',
  bmi_30_plus: '≥30',
  
  // Systolic BP extra points for different EF ranges
  systolic_bp_ef_less_30_title: 'Дополнительные баллы для систолического АД (мм рт.ст.) если ФВ <30',
  systolic_bp_ef_30_39_title: 'Дополнительные баллы для систолического АД (мм рт.ст.) если ФВ 30-39',
  systolic_bp_ef_40_plus_title: 'Дополнительные баллы для систолического АД (мм рт.ст.) если ФВ ≥40',
  
  // BP ranges
  bp_less_110: '<110',
  bp_110_119: '110-119',
  bp_120_129: '120-129',
  bp_130_139: '130-139',
  bp_140_149: '140-149',
  bp_150_plus: '≥150',
  
  // Age extra points for different EF ranges
  age_ef_less_30_title: 'Дополнительные баллы для возраста (лет) если ФВ <30',
  age_ef_30_39_title: 'Дополнительные баллы для возраста (лет) если ФВ 30-39',
  age_ef_40_plus_title: 'Дополнительные баллы для возраста (лет) если ФВ ≥40',
  
  // Age ranges
  age_less_55: '<55',
  age_55_59: '55-59',
  age_60_64: '60-64',
  age_65_69: '65-69',
  age_70_74: '70-74',
  age_75_79: '75-79',
  age_80_plus: '≥80',
  
  // Creatinine note
  creatinine_note: '*Примечание: хотя эта шкала использует креатинин как показатель функции почек, рСКФ обычно считается более точным индикатором.',
  
  // Evidence Appraisal section
  evidence_appraisal_title: 'Оценка доказательств',
  evidence_appraisal_description: 'Калькулятор риска Мета-анализа Глобальной группы по хронической сердечной недостаточности (MAGGIC) был разработан международной группой исследователей под руководством Покока и др. на основе базы данных 39,372 пациентов из 30 когортных исследований (из которых 6 были рандомизированными клиническими исследованиями, включавшими приблизительно 24,000 пациентов).',
  poisson_regression_description: 'Модель пуассоновской регрессии была построена для выявления 13 факторов риска, способствующих смертности у пациентов с сердечной недостаточностью. Сравнения наблюдаемых и ожидаемых показателей 3-летней смертности во всех 30 исследованиях показали приемлемое соответствие. Две отдельные модели использовались для сохраненной против сниженной фракции выброса (ФВ).',
  subsequent_study_description: 'Последующее исследование Freed и др. (2016) показало, что для 308 пациентов с сердечной недостаточностью с сохраненной ФВ, более высокий балл риска MAGGIC был связан с большим количеством неблагоприятных событий.',
  validation_note: 'Данные еще не были внешне валидированы для сниженной ФВ.',
  
  // Literature section
  literature_title: 'Литература',
  original_reference_title: 'Оригинальный/Первичный источник',
  validation_title: 'Валидация',
  other_references_title: 'Другие источники',
  
  // Primary reference
  primary_reference_title: 'Исследовательская работа',
  primary_reference_citation: 'Pocock SJ et al. Predicting survival in heart failure: a risk score based on 39 372 patients from 30 studies. Eur Heart J. 2013 May;34(19):1404-13. doi: 10.1093/eurheartj/ehs337. Epub 2012 Oct 24.',
  
  // Validation reference
  validation_reference_title: 'Исследовательская работа',
  validation_reference_citation: 'Freed BH, Daruwalla V, Cheng JY, Aguilar FG, Beussink L, Choi A, Klein DA, Dixon D, Baldridge A, Rasmussen-Torvik LJ, Maganti K, Shah SJ. Prognostic Utility and Clinical Significance of Cardiac Mechanics in Heart Failure With Preserved Ejection Fraction: Importance of Left Atrial Strain. Circ Cardiovasc Imaging. 2016 Mar;9(3). pii: e003754. doi: 10.1161/CIRCIMAGING.115.003754.',
  
  // Other references
  other_reference_1_title: 'Исследовательская работа',
  other_reference_1_citation: 'Meta-analysis Global Group in Chronic Heart Failure (MAGGIC). The survival of patients with heart failure with preserved or reduced left ventricular ejection fraction: an individual patient data meta-analysis. Eur Heart J. 2012 Jul;33(14):1750-7. doi: 10.1093/eurheartj/ehr254. Epub 2011 Aug 6.',
  
  other_reference_2_title: 'Исследовательская работа',
  other_reference_2_citation: 'Nanayakkara S, Kaye DM. Management of heart failure with preserved ejection fraction: a review. Clin Ther. 2015 Oct 1;37(10):2186-98. doi: 10.1016/j.clinthera.2015.08.005. Epub 2015 Sep 16.',
  
  other_reference_3_title: 'Исследовательская работа',
  other_reference_3_citation: 'Chapter 1: Definition and classification of CKD. Kidney Int Suppl (2011). 2013;3(1):19-62.',
  
  // Additional UI elements
  reset_calculator: 'Сбросить калькулятор',
  about_title: 'О калькуляторе MAGGIC',
  about_subtitle: 'Понимание модели риска MAGGIC',
  about_description: 'Калькулятор риска MAGGIC является валидированным инструментом для прогнозирования риска смертности у пациентов с хронической сердечной недостаточностью. Этот калькулятор основан на комплексном мета-анализе более 39,000 пациентов из 30 исследований.',
  feature_1: 'Валидирован на 39,372 пациентах из 30 исследований',
  feature_2: 'Прогнозирует 1-летний и 3-летний риск смертности',
  feature_3: 'Комплексная оценка факторов риска',
  feature_4: 'Основанные на доказательствах клинические рекомендации',
  tables_title: 'Таблицы факторов риска',
  formula_note: 'Формула основана на сумме баллов от факторов риска и характеристик пациента',
  secondary_reference_title: 'Дополнительная справка',
  
  // Step labels
  step_1_label: 'Этап 1',
  step_2_label: 'Этап 2',
  step_3_label: 'Этап 3',
  
  // UI labels
  diabetes_label_description: 'История сахарного диабета',
  copd_label_description: 'ХОБЛ или тяжелое заболевание легких',
  smoker_label_text: 'Курящий',
  smoker_label_description: 'Курящий в настоящее время или бывший курильщик',
  first_diagnosis_label_description: 'Хроническая сердечная недостаточность (>18 месяцев назад)',
  
  // Ejection Fraction Table
  ef_title: 'Фракция выброса (%)',
  ef_less_20: '<20',
  
  // NYHA Class descriptions
  nyha_1_description: 'Без ограничений',
  nyha_2_description: 'Легкое ограничение',
  nyha_3_description: 'Выраженное ограничение',
  nyha_4_description: 'Тяжелое ограничение',
  
  // Research validation texts
  foundational_research: 'Фундаментальные исследования и исследования валидации.',
  rigorous_validation: 'Строгая валидация по множественным когортам'
}; 