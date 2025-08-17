export const ovarianReserveCalculator = {
  // Tab labels
  calculatorTab: 'Калькулятор',
  aboutTab: 'О калькуляторе',
  
  // Main content
  title: 'Оценка овариального резерва',
  description: 'Комплексная оценка фертильности и планирование лечения',
  
  // Form fields
  ageLabel: 'Возраст (лет)',
  agePlaceholder: 'например, 32',
  ageDescription: 'Самый важный фактор, влияющий на качество и количество ооцитов',
  
  amhLabel: 'АМГ (нг/мл)',
  amhPlaceholder: 'например, 2.5',
  amhDescription: 'Антимюллеров гормон - прямой показатель фолликулярного пула',
  
  antralFollicleCountLabel: 'Количество антральных фолликулов (КАФ)',
  antralFollicleCountPlaceholder: 'например, 12',
  antralFollicleCountDescription: 'Сонографический маркер овариального резерва',
  
  fshLabel: 'ФСГ (мМЕ/мл)',
  fshPlaceholder: 'например, 7.5',
  fshDescription: 'Фолликулостимулирующий гормон на 3-й день цикла',
  
  estradiolLabel: 'Эстрадиол (пг/мл)',
  estradiolPlaceholder: 'например, 50',
  estradiolDescription: 'Базальный уровень эстрадиола на 3-й день цикла',
  
  inhibinBLabel: 'Ингибин B (пг/мл)',
  inhibinBPlaceholder: 'например, 45',
  inhibinBDescription: 'Дополнительный маркер функции яичников',
  
  // Section titles
  primaryMarkersTitle: 'Основные маркеры',
  secondaryMarkersTitle: 'Дополнительные маркеры',
  
  // Buttons
  calculateButton: 'Рассчитать',
  resetButton: 'Сброс',
  calculating: 'Рассчитываем...',
  
  // Validation errors
  validationErrors: 'Ошибки валидации',
  errorAge: 'Введите возраст',
  errorAgeRange: 'Возраст должен быть от 18 до 50 лет',
  errorAmh: 'Введите уровень АМГ',
  errorAmhRange: 'АМГ должен быть от 0 до 50 нг/мл',
  calculationError: 'Ошибка при расчете. Попробуйте еще раз.',
  
  // Results
  resultsTitle: 'Результаты оценки',
  amhLevel: 'Уровень АМГ',
  reserveCategory: 'Категория резерва',
  reproductivePotential: 'Репродуктивный потенциал',
  interpretationTitle: 'Интерпретация',
  treatmentOptionsTitle: 'Варианты лечения',
  recommendationsTitle: 'Рекомендации',
  
  // Reserve categories
  low: 'Низкий',
  normal: 'Нормальный',  
  high: 'Высокий',
  
  // Interpretations
  lowInterpretation: 'Сниженный овариальный резерв указывает на уменьшение количества и качества ооцитов',
  normalInterpretation: 'Нормальный овариальный резерв соответствует возрастным нормам',
  highInterpretation: 'Повышенный овариальный резерв может указывать на СПКЯ или другие состояния',
  
  // Treatment options and details arrays
  lowReserveDetails: [
    'Рассмотрите экстракорпоральное оплодотворение (ЭКО)',
    'Консультация репродуктолога в кратчайшие сроки',
    'Возможность криоконсервации ооцитов',
    'Оценка протоколов стимуляции'
  ],
  
  normalReserveDetails: [
    'Естественная беременность вероятна',
    'Плановые попытки зачатия',
    'Стандартный мониторинг',
    'Общие рекомендации по планированию'
  ],
  
  highReserveDetails: [
    'Исключение синдрома поликистозных яичников',
    'Мониторинг на предмет гиперстимуляции',
    'Контролируемая стимуляция при ЭКО',
    'Профилактика синдрома гиперстимуляции'
  ],
  
  // Recommendations
  lowRecommendations: [
    'Срочная консультация репродуктолога',
    'Рассмотрение протоколов ЭКО',
    'Обследование партнера',
    'Генетическое консультирование'
  ],
  
  normalRecommendations: [
    'Планирование беременности в течение года',
    'Здоровый образ жизни',
    'Фолиевая кислота 400 мкг/день',
    'Регулярное наблюдение'
  ],
  
  highRecommendations: [
    'Исключение СПКЯ',
    'Контроль метаболических параметров',
    'Специализированные протоколы ЭКО',
    'Профилактика осложнений'
  ],
  
  // About section
  aboutTitle: 'О калькуляторе овариального резерва',
  purposeTitle: 'Назначение',
  purposeText: 'Данный калькулятор предназначен для оценки овариального резерва у женщин репродуктивного возраста с целью планирования лечения бесплодия и прогнозирования репродуктивного потенциала.',
  
  parametersTitle: 'Оцениваемые параметры',
  parameters: [
    'Возраст - основной фактор, влияющий на овариальный резерв',
    'АМГ (антимюллеров гормон) - наиболее точный маркер',
    'Количество антральных фолликулов - сонографический показатель',
    'ФСГ - гормональный маркер функции яичников',
    'Эстрадиол - базальный уровень на 3-й день цикла',
    'Ингибин B - дополнительный маркер'
  ],
  
  interpretationGuideTitle: 'Руководство по интерпретации',
  
  lowReserveTitle: 'Низкий резерв',
  lowReserveDescription: 'АМГ < 1.0 нг/мл, КАФ < 7, ФСГ > 10 мМЕ/мл. Требуется срочная консультация специалиста.',
  
  normalReserveTitle: 'Нормальный резерв', 
  normalReserveDescription: 'АМГ 1.0-3.0 нг/мл, КАФ 7-15, ФСГ 5-10 мМЕ/мл. Благоприятный прогноз для естественного зачатия.',
  
  highReserveTitle: 'Высокий резерв',
  highReserveDescription: 'АМГ > 3.0 нг/мл, КАФ > 15. Исключить СПКЯ, контролировать риск гиперстимуляции.',
  
  limitationsTitle: 'Ограничения',
  limitations: [
    'Калькулятор не заменяет консультацию врача',
    'Результаты должны интерпретироваться в контексте клинической картины',
    'Необходимо учитывать другие факторы фертильности',
    'Только для женщин репродуктивного возраста'
  ],
  
  referencesTitle: 'Литература',
  references: [
    'ASRM Practice Committee. Testing and interpreting measures of ovarian reserve. Fertil Steril 2015;103:e9-e17',
    'La Marca A, et al. Anti-Müllerian hormone (AMH) as a predictive marker in ART. Hum Reprod Update 2010;16:113-130',
    'Broer SL, et al. AMH and AFC as predictors of excessive response in COS. Hum Reprod 2011;26:2648-2653',
    'ESHRE Working Group. Revised 2003 consensus on diagnostic criteria and long-term health risks related to PCOS'
  ]
}; 