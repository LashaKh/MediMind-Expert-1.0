export const bishopScoreCalculator = {
  title: 'Калькулятор шкалы Бишопа',
  subtitle: 'Оценка готовности шейки матки к индукции родов',
  assessment_tool: 'Инструмент оценки',
  tool_description: 'Шкала Бишопа является стандартизированным методом оценки готовности шейки матки к индукции родов, оценивающим пять ключевых параметров шейки матки и плода для прогнозирования вероятности успешной индукции.',
  based_on_bishop: 'Основано на модифицированной системе оценки Бишопа (1964)',
  obstetric_safety_validated: 'Проверено на акушерскую безопасность',
  about_title: 'О шкале Бишопа',
  
  // Form Labels and Help Text
  cervical_dilation_label: 'Раскрытие шейки матки',
  cervical_dilation_unit: 'см',
  cervical_dilation_help: 'Измерьте раскрытие шейки матки в сантиметрах (0-10 см)',
  cervical_dilation_error: 'Пожалуйста, введите корректное раскрытие от 0-10 см',
  
  cervical_effacement_label: 'Сглаживание шейки матки',
  cervical_effacement_unit: '%',
  cervical_effacement_help: 'Процент истончения шейки матки (0-100%)',
  cervical_effacement_error: 'Пожалуйста, введите корректное сглаживание от 0-100%',
  
  cervical_consistency_label: 'Консистенция шейки матки',
  cervical_consistency_help: 'Оценка плотности шейки матки при пальпации',
  cervical_consistency_firm: 'Плотная',
  cervical_consistency_medium: 'Средняя',
  cervical_consistency_soft: 'Мягкая',
  
  cervical_position_label: 'Положение шейки матки',
  cervical_position_help: 'Анатомическое положение шейки матки относительно головки плода',
  cervical_position_posterior: 'Заднее',
  cervical_position_mid: 'Среднее положение',
  cervical_position_anterior: 'Переднее',
  
  fetal_station_label: 'Высота стояния',
  fetal_station_help: 'Положение головки плода относительно седалищных остей (-3 до +3)',
  fetal_station_error: 'Пожалуйста, введите корректную высоту стояния от -3 до +3',
  
  // Sections
  cervical_assessment: 'Оценка шейки матки',
  cervical_parameters_section: 'Параметры шейки матки',
  cervical_parameters_description: 'Оцените раскрытие, сглаживание, консистенцию и положение шейки матки',
  
  // Scoring System
  scoring_system: 'Система оценки',
  clinical_assessment: 'Клиническая оценка',
  position_assessment: 'Оценка положения',
  
  // Results
  bishop_score_analysis: 'Анализ шкалы Бишопа',
  total_score: 'Общий балл',
  induction_success: 'Успех индукции',
  labor_likelihood: 'Вероятность родов',
  cesarean_risk: 'Риск кесарева сечения',
  clinical_recommendation: 'Клиническая рекомендация',
  evidence_base: 'Доказательная база',
  
  // Buttons
  calculate_button: 'Рассчитать шкалу Бишопа',
  new_assessment: 'Новая оценка',
  modify_inputs: 'Изменить данные',
  
  // Hardcoded text replacements
  reference_text: 'Справочная информация',
  high_station: 'Высокое стояние',
  high_station_description_1: '-3, -2: 0 баллов',
  high_station_description_2: 'Головка выше остей',
  high_station_description_3: 'Более сложные роды',
  
  mid_station: 'Среднее стояние',
  mid_station_description_1: '-1: 1 балл',
  mid_station_description_2: 'Головка приближается к остям',
  mid_station_description_3: 'Благоприятное положение',
  
  low_station: 'Низкое стояние',
  low_station_description_1: '0, +1, +2, +3: 2-3 балла',
  low_station_description_2: 'Головка на уровне или ниже остей',
  low_station_description_3: 'Очень благоприятно',
  
  // Scoring descriptions
  dilation_score_0: 'Закрыта (0 см): 0 баллов',
  dilation_score_1: '1-2 см: 1 балл',
  dilation_score_2: '3-4 см: 2 балла',
  dilation_score_3: '≥5 см: 3 балла',
  
  effacement_score_0: '0-30%: 0 баллов',
  effacement_score_1: '40-50%: 1 балл',
  effacement_score_2: '60-70%: 2 балла',
  effacement_score_3: '≥80%: 3 балла',
  
  consistency_descriptions_firm: 'Плотная: Как кончик носа',
  consistency_descriptions_medium: 'Средняя: Как подбородок',
  consistency_descriptions_soft: 'Мягкая: Как губы или мочка уха',
  
  position_descriptions_posterior: 'Заднее: Шейка направлена к крестцу',
  position_descriptions_mid: 'Среднее положение: Шейка в нейтральном положении',
  position_descriptions_anterior: 'Переднее: Шейка направлена к лобку',
  
  cesarean_delivery_risk: 'Риск кесарева сечения',
  
  // About page content
  scoring_parameters: 'Параметры оценки',
  five_assessment_parameters: 'Пять параметров оценки:',
  cervical_dilation_points: 'Раскрытие шейки матки (0-3 балла)',
  cervical_effacement_points: 'Сглаживание шейки матки (0-3 балла)',
  cervical_consistency_points: 'Консистенция шейки матки (0-2 балла)',
  cervical_position_points: 'Положение шейки матки (0-2 балла)',
  fetal_station_points: 'Высота стояния плода (0-3 балла)',
  
  score_interpretation: 'Интерпретация баллов',
  induction_success_prediction: 'Прогноз успеха индукции:',
  score_unfavorable: 'Балл ≤3: Неблагоприятная шейка',
  score_intermediate: 'Балл 4-6: Промежуточный успех',
  score_favorable: 'Балл 7-8: Благоприятная шейка',
  score_very_favorable: 'Балл ≥9: Очень благоприятная шейка',
  
  clinical_applications: 'Клинические применения',
  labor_induction_planning: 'Планирование индукции родов',
  labor_induction_description: 'Определяет оптимальное время и метод индукции родов на основе готовности шейки матки',
  delivery_planning: 'Планирование родов',
  delivery_planning_description: 'Помогает консультировать пациенток о вероятности успешных вагинальных родов',
  clinical_documentation: 'Клиническая документация',
  clinical_documentation_description: 'Стандартизированный инструмент оценки для медицинской документации и показателей качества',
  
  professional_guidelines: 'Профессиональные рекомендации',
  acog_practice_bulletin: 'Практический бюллетень ACOG № 107: Индукция родов',
  maternal_fetal_medicine: 'Рекомендации Общества материнско-фетальной медицины',
  validation_studies: 'Исследования валидации модифицированной шкалы Бишопа',
  
  clinical_validation: 'Клиническая валидация',
  clinical_validation_description: 'Всесторонне валидированная система оценки с доказанной прогностической точностью для успеха индукции родов в различных группах пациенток и клинических условиях.',
  
  clinical_considerations: 'Клинические соображения',
  consideration_1: 'Оценка должна выполняться опытными клиницистами, знакомыми с техникой исследования шейки матки',
  consideration_2: 'Интерпретация баллов должна учитывать индивидуальные факторы пациентки и клинический контекст',
  consideration_3: 'Может потребоваться множественная оценка, поскольку состояние шейки матки может быстро изменяться',
  consideration_4: 'Этот инструмент поддерживает, но не заменяет клиническое суждение и комплексную оценку пациентки',
  
  // Station option labels
  station_high_label: 'Высокое',
  station_mid_label: 'Среднее',
  station_low_label: 'Низкое',
  station_at_spines: 'На уровне остей',
  
  // Points indicators
  zero_points: '0 баллов',
  one_point: '1 балл',
  two_points: '2 балла',
  three_points: '3 балла',

  // Service layer interpretations and recommendations
  interpretation_unfavorable: 'неблагоприятная шейка с высоким риском неудачной индукции',
  interpretation_partially_favorable: 'частично благоприятная шейка с умеренной вероятностью успешной индукции',
  interpretation_favorable: 'благоприятная шейка с хорошей вероятностью успешной индукции',
  interpretation_very_favorable: 'очень благоприятная шейка с отличной вероятностью успешной индукции',
  
  // Detailed Analysis label
  detailed_analysis: 'Детальный анализ',
  
  // Induction recommendations by score
  induction_recommendation_unfavorable: 'Неблагоприятная шейка - рассмотрите созревание шейки или альтернативный метод родоразрешения',
  induction_recommendation_partially: 'Частично благоприятная - действуйте с осторожностью и тщательным мониторингом',
  induction_recommendation_favorable: 'Благоприятная шейка - стандартный протокол индукции вероятно будет успешным',
  induction_recommendation_very_favorable: 'Очень благоприятная шейка - высокая вероятность успешных вагинальных родов',
  
  // Individual recommendations
  rec_cervical_ripening_agents: 'Рассмотрите препараты для созревания шейки матки перед индукцией',
  rec_alternative_methods: 'Альтернативные методы: механическое расширение или простагландины',
  rec_discuss_risks_benefits: 'Обсудите риски и преимущества индукции против кесарева сечения',
  rec_induction_caution: 'Индукция может быть предпринята с осторожностью',
  rec_cervical_ripening_unfavorable: 'Рассмотрите созревание шейки при наличии неблагоприятных признаков',
  rec_monitor_failed_induction: 'Тщательно наблюдайте за признаками неудачной индукции',
  rec_favorable_conditions: 'Благоприятные условия для индукции родов',
  rec_standard_protocols: 'Стандартные протоколы индукции вероятно будут успешными',
  rec_institutional_guidelines: 'Мониторинг прогресса согласно институциональным рекомендациям',
  rec_continuous_monitoring: 'Непрерывный мониторинг плода во время индукции',
  rec_pain_management: 'Адекватные варианты обезболивания',
  rec_delivery_plan: 'Четкий план родов и резервный план кесарева сечения',
  
  // References
  ref_acog_bulletin: 'Практический бюллетень ACOG № 107: Индукция родов',
  ref_bishop_original: 'Bishop EH. Оценка таза для плановой индукции. Obstet Gynecol. 1964;24:266-8',
  ref_who_recommendations: 'Рекомендации ВОЗ: Индукция родов в срок или после срока',
  ref_cochrane_review: 'Кокрейновский обзор: Механические методы индукции родов',
  
  // Result field labels (for UI display)
  bishop_score_label: 'Оценка Бишопа',
  induction_success_label: 'Успех Индукции',
  cesarean_risk_label: 'Риск Кесарева',
  
  // Induction success values
  unlikely: 'Маловероятно',
  possible: 'Возможно', 
  likely: 'Вероятно',
  very_likely: 'Очень Вероятно',
}; 