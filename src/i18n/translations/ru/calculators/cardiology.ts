import maggicTranslations from './maggic';
import { riskAssessmentTranslations } from './risk-assessment';
import { timiRiskScoreTranslations } from './timi-risk-score';
import grace2Translations from './grace-2';
import daptTranslations from './dapt';
import preciseDaptTranslations from './precise-dapt';
import ahaPreventTranslations from './aha-prevent';
import shfmTranslations from './shfm';
import gwtgHfRiskTranslations from './gwtg-hf-risk';
import { heartFailureStagingTranslations } from './heart-failure-staging';

export default {
  ...riskAssessmentTranslations,
  // Calculator titles for navigation
  graceTitle: 'Калькулятор GRACE 2.0',
  hcmRiskScdTitle: 'Калькулятор риска ВСС при ГКМП',
  maggicTitle: maggicTranslations.title,
  gwtgHfTitle: 'Калькулятор GWTG-HF',
  heartFailureStagingTitle: 'Стадии сердечной недостаточности',
  shfmTitle: 'Калькулятор риска SHFM',
  stsTitle: 'Калькулятор риска STS',
  euroScoreTitle: 'Калькулятор EuroSCORE II',
  timiTitle: 'Калькулятор риска TIMI',
  preventTitle: 'Калькулятор AHA PREVENT',
  hcmAfTitle: 'Калькулятор HCM-AF',
  chadsVascTitle: 'Калькулятор CHA2DS2-VASc',
  hasBleedTitle: 'Калькулятор HAS-BLED',
  chads2Title: 'Калькулятор CHADS2',

  // Calculator references used by main calculator list
  timi_risk: {
    title: 'Калькулятор TIMI риска',
    subtitle: 'Оценка риска нестабильной стенокардии/ИМ без подъема ST'
  },
  
  grace_acs: {
    title: 'Калькулятор GRACE ACS',
    subtitle: 'Риск смертности при остром коронарном синдроме'
  },
  // Entries for Calculators.tsx card display
  // Make sure each calculator ID used in Calculators.tsx has a title and subtitle here.
  // ASCVD section moved to risk-assessment.ts
  // GRACE section moved to grace-2.ts
  grace: grace2Translations,
  dapt: daptTranslations,
  precise_dapt: preciseDaptTranslations,

  // MAGGIC Risk Calculator - Extracted to standalone file
  maggic: maggicTranslations,

  // AHA PREVENT™ Calculator - Extracted to standalone file
  prevent: ahaPreventTranslations,

  // SHFM Risk Calculator - Extracted to standalone file
  shfm: shfmTranslations,
  // GWTG-HF Risk Calculator - Extracted to standalone file
  gwtgHf: gwtgHfRiskTranslations,
  sts: {
    title: 'Калькулятор риска взрослой кардиохирургии STS',
    subtitle: 'Оценка периоперационного риска • Доказательное хирургическое планирование',
    description: 'Оценка риска Общества торакальных хирургов для периоперационной смертности и заболеваемости при кардиохирургии.',
    alert_title: 'Национальная база данных STS - Доказательная оценка риска',
    alert_description: 'Валидированная модель прогнозирования риска на основе >4 миллионов кардиохирургических процедур из Национальной базы данных STS.',
    // Навигация по шагам
    demographics_step: 'Демография',
    procedure_step: 'Процедура',
    clinical_step: 'Клинический статус',
    comorbidities_step: 'Сопутствующие заболевания',
    // Шаг 1: Демография и антропометрия
    patient_demographics: 'Демография пациента и антропометрия',
    demographics_description: 'Основные характеристики пациента для оценки хирургического риска',
    age_label: 'Возраст',
    age_placeholder: '65',
    age_unit: 'лет',
    gender_label: 'Пол',
    gender_placeholder: 'Выберите пол...',
    gender_male: 'Мужской',
    gender_female: 'Женский',
    race_label: 'Раса/этническая принадлежность',
    race_placeholder: 'Выберите расу/этническую принадлежность...',
    race_white: 'Белая',
    race_black: 'Черная/афроамериканская',
    race_hispanic: 'Испанская/латиноамериканская',
    race_asian: 'Азиатская',
    race_other: 'Другая',
    height_label: 'Рост',
    height_placeholder: '170',
    height_unit: 'см',
    weight_label: 'Вес',
    weight_placeholder: '70',
    weight_unit: 'кг',
    // Шаг 2: Детали процедуры и срочность
    procedure_details: 'Детали процедуры и срочность',
    procedure_description: 'Тип кардиохирургической процедуры и статус срочности',
    procedure_type_label: 'Тип процедуры',
    procedure_placeholder: 'Выберите процедуру...',
    cabg_only: 'Только АКШ',
    valve_only: 'Только клапан',
    cabg_valve: 'АКШ + клапан',
    urgency_label: 'Срочность',
    urgency_placeholder: 'Выберите срочность...',
    elective: 'Плановая',
    urgent: 'Срочная',
    emergent: 'Экстренная',
    // Оценка клапанов
    valve_assessment: 'Оценка клапанов (если применимо)',
    mitral_insufficiency_label: 'Митральная недостаточность',
    mitral_insufficiency_placeholder: 'Выберите степень...',
    tricuspid_insufficiency_label: 'Трикуспидальная недостаточность',
    tricuspid_insufficiency_placeholder: 'Выберите степень...',
    severity_none: 'Нет (0)',
    severity_mild: 'Легкая (1+)',
    severity_moderate: 'Умеренная (2+)',
    severity_moderate_severe: 'Умеренно-тяжелая (3+)',
    severity_severe: 'Тяжелая (4+)',
    aortic_stenosis_label: 'Аортальный стеноз',
    mitral_stenosis_label: 'Митральный стеноз',
    previous_cardiac_surgery_label: 'Предыдущая кардиохирургия',
    // Шаг 3: Клинический статус и лабораторные данные
    clinical_status: 'Клинический статус и лабораторные показатели',
    clinical_description: 'Функция сердца и ключевые лабораторные параметры',
    ejection_fraction_label: 'Фракция выброса левого желудочка',
    ejection_fraction_placeholder: '55',
    ejection_fraction_unit: '%',
    nyha_class_label: 'Функциональный класс NYHA',
    nyha_class_placeholder: 'Выберите класс NYHA...',
    nyha_class_1: 'Класс I - Без ограничений',
    nyha_class_2: 'Класс II - Легкие ограничения',
    nyha_class_3: 'Класс III - Выраженные ограничения',
    nyha_class_4: 'Класс IV - Тяжелые ограничения',
    creatinine_label: 'Креатинин сыворотки',
    creatinine_placeholder: '1.0',
    creatinine_unit: 'мг/дл',
    hematocrit_label: 'Гематокрит',
    hematocrit_placeholder: '40',
    hematocrit_unit: '%',
    cardiogenic_shock_label: 'Кардиогенный шок',
    dialysis_label: 'Диализ',
    // Шаг 4: Сопутствующие заболевания
    comorbidities_title: 'Сопутствующие заболевания и факторы риска',
    comorbidities_description: 'Дополнительные медицинские состояния, влияющие на хирургический риск',
    diabetes_label: 'Сахарный диабет',
    hypertension_label: 'Артериальная гипертензия',
    immunosuppression_label: 'Иммуносупрессия',
    pvd_label: 'Заболевание периферических сосудов',
    cerebrovascular_disease_label: 'Цереброваскулярное заболевание',
    chronic_lung_disease_label: 'Хроническое заболевание легких',
    // Кнопки навигации
    next_procedure: 'Далее: Детали процедуры',
    next_clinical: 'Далее: Клинический статус',
    next_comorbidities: 'Далее: Сопутствующие заболевания',
    back_button: 'Назад',
    calculate_button: 'Рассчитать риск STS',
    reset_button: 'Сбросить калькулятор',
    // Раздел результатов
    results_title: 'Результаты оценки риска STS',
    risk_analysis: 'Комплексный анализ риска',
    predicted_outcomes: 'Прогнозируемые исходы',
    mortality_risk: 'Операционная смертность',
    morbidity_combined: 'Основная заболеваемость',
    stroke_risk: 'Риск инсульта',
    renal_failure_risk: 'Риск почечной недостаточности',
    reoperation_risk: 'Риск повторной операции',
    prolonged_ventilation: 'Длительная ИВЛ',
    sternal_infection: 'Глубокая инфекция грудины',
    // Категории риска
    risk_category: 'Категория риска',
    low_risk: 'Низкий риск',
    intermediate_risk: 'Промежуточный риск',
    high_risk: 'Высокий риск',
    very_high_risk: 'Очень высокий риск',
    // Примечания раздела оповещений
    comorbidity_impact_note: 'Сопутствующие заболевания значительно влияют на прогнозирование хирургического риска',
    validation_note: 'Модели валидированы на более чем 4 миллионах кардиохирургических процедур',
    risk_management_note: 'Категории риска определяют решения по периоперационному ведению',
    // Основные ключи опций для калькулятора STS
    male: 'Мужской',
    female: 'Женский',
    white: 'Белая',
    black: 'Черная/афроамериканская',
    hispanic: 'Испанская/латиноамериканская',
    asian: 'Азиатская',
    other: 'Другая'
  },

  // Atrial Fibrillation section moved to risk-assessment.ts

  timi: timiRiskScoreTranslations,

  heartFailureStaging: heartFailureStagingTranslations,
};
