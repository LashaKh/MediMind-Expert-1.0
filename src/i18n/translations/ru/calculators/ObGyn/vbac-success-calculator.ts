export const vbacSuccessCalculator = {
  title: 'Калькулятор успеха VBAC',
  subtitle: 'Прогноз успеха вагинальных родов после кесарева сечения',
  assessment_tool: 'Прогностический инструмент',
  tool_description: 'Оцените вероятность успешных вагинальных родов после кесарева сечения (VBAC) с использованием основанных на доказательствах клинических факторов и валидированных прогностических моделей.',
  based_on_acog: 'Основано на Практическом бюллетене ACOG № 205',
  obstetric_safety_validated: 'Акушерская безопасность валидирована',
  about_title: 'О прогнозировании успеха VBAC',
  
  // Form Labels and Help Text
  maternal_age_label: 'Возраст матери',
  maternal_age_unit: 'лет',
  maternal_age_help: 'Текущий возраст матери в годах',
  maternal_age_error: 'Возраст матери должен быть в пределах 15-55 лет',
  maternal_age_placeholder: '25',
  
  bmi_label: 'Индекс массы тела (ИМТ)',
  bmi_unit: 'кг/м²',
  bmi_help: 'ИМТ до беременности или в ранней беременности',
  bmi_error: 'ИМТ должен быть в пределах 15-60 кг/м²',
  bmi_placeholder: '24.5',
  
  gestational_age_label: 'Срок беременности',
  gestational_age_unit: 'недель',
  gestational_age_help: 'Текущий срок беременности на момент родов',
  gestational_age_error: 'Срок беременности должен быть в пределах 34-42 недель',
  gestational_age_placeholder: '39',
  
  cervical_dilation_label: 'Раскрытие шейки матки',
  cervical_dilation_unit: 'см',
  cervical_dilation_help: 'Текущее раскрытие шейки матки, если известно',
  cervical_dilation_error: 'Раскрытие шейки матки должно быть в пределах 0-10 см',
  cervical_dilation_placeholder: '3',
  
  estimated_fetal_weight_label: 'Предполагаемая масса плода',
  estimated_fetal_weight_unit: 'г',
  estimated_fetal_weight_help: 'Предполагаемая масса плода по данным УЗИ',
  estimated_fetal_weight_error: 'Предполагаемая масса плода должна быть в пределах 1000-6000 граммов',
  estimated_fetal_weight_placeholder: '3500',
  
  previous_vaginal_delivery_label: 'Предыдущие вагинальные роды',
  previous_vaginal_delivery_help: 'История успешных вагинальных родов до или после кесарева сечения',
  
  indication_previous_cd_label: 'Показание для предыдущего кесарева сечения',
  indication_previous_cd_help: 'Основное показание для предыдущего кесарева сечения',
  indication_non_recurring: 'Неповторяющееся (например, тазовое предлежание, дистресс плода)',
  indication_recurring: 'Повторяющееся (например, клинически узкий таз)',
  indication_unknown: 'Неизвестно',
  
  // Step Titles
  maternal_demographics: 'Демографические данные матери',
  obstetric_history: 'Акушерский анамнез',
  current_pregnancy: 'Текущая беременность',
  
  // Results
  vbac_success_analysis: 'Анализ успеха VBAC',
  success_probability: 'Вероятность успеха',
  vbac_likelihood: 'Вероятность VBAC',
  clinical_recommendation: 'Клиническая рекомендация',
  
  // Add missing UI labels
  uterine_rupture_risk: 'Риск разрыва матки',
  category: 'Категория',
  recommendation: 'Рекомендация',
  
  // Categories
  excellent_candidate: 'Отличный кандидат для VBAC с высокой вероятностью успеха',
  good_candidate: 'Хороший кандидат для VBAC с благоприятной вероятностью успеха',
  moderate_candidate: 'Умеренный кандидат для VBAC, требующий тщательного рассмотрения',
  poor_candidate: 'Плохой кандидат для VBAC - рассмотрите плановое повторное кесарево сечение',
  
  // Risk categories
  'Low Risk': 'Низкий риск',
  'Moderate Risk': 'Умеренный риск', 
  'High Risk': 'Высокий риск',
  
  // Recommendation values
  candidate: 'Кандидат',
  'relative-contraindication': 'Относительное противопоказание',
  contraindication: 'Противопоказание',
  
  // Interpretation templates
  interpretation_template: 'Вероятность успеха VBAC составляет {successProbability}%, что указывает на {categoryText}. Риск разрыва матки оценивается в {uterineRuptureRisk}%.',
  interpretation_high_success: 'высокую вероятность успешных вагинальных родов',
  interpretation_moderate_success: 'умеренную вероятность успеха, требующую тщательного мониторинга',
  interpretation_low_success: 'низкую вероятность успеха - рассмотрите индивидуальные факторы и предпочтения пациентки',
  
  // Counseling points
  counseling_success_probability: 'Ваша расчетная вероятность успешных вагинальных родов составляет {percentage}%',
  counseling_uterine_rupture_risk: 'Риск разрыва матки составляет приблизительно {percentage}%',
  counseling_rupture_signs: 'Важно немедленно сообщать о любой внезапной сильной боли в животе, кровотечении или изменениях в движениях плода',
  counseling_emergency_cesarean: 'Экстренное кесарево сечение может потребоваться в случае осложнений во время попытки VBAC',
  counseling_complications_risk: 'Хотя серьезные осложнения редки, важно понимать все риски и преимущества',
  
  // Buttons
  calculate_button: 'Рассчитать успех VBAC',
  new_assessment: 'Новая оценка',
  modify_inputs: 'Изменить параметры',
  
  // Risk Categories
  low: 'низкий',
  moderate: 'умеренный', 
  high: 'высокий',
  
  // Recommendations
  rec_vbac_strongly_recommended: 'Попытка VBAC настоятельно рекомендуется - высокая вероятность успеха',
  rec_continuous_monitoring: 'Непрерывный мониторинг плода во время родов',
  rec_emergency_access: 'Обеспечьте немедленный доступ к экстренному кесареву сечению',
  rec_epidural_anesthesia: 'Рассмотрите эпидуральную анестезию для оптимального обезболивания',
  rec_regular_assessment: 'Регулярная оценка прогресса родов',
  rec_vbac_reasonable: 'Попытка VBAC является разумным вариантом при соответствующем консультировании',
  rec_detailed_discussion: 'Подробное обсуждение рисков и преимуществ с пациенткой',
  rec_close_monitoring: 'Тщательный мониторинг прогресса родов и состояния плода',
  rec_low_threshold: 'Низкий порог для повторного кесарева сечения при возникновении осложнений',
  rec_operating_room: 'Обеспечьте доступность операционной в течение всех родов',
  rec_elective_repeat: 'Рассмотрите плановое повторное кесарево сечение',
  rec_enhanced_monitoring: 'При попытке VBAC требуется усиленный мониторинг',
  rec_informed_consent: 'Подробное информированное согласие относительно повышенных рисков',
  rec_surgical_team: 'Немедленная доступность хирургической бригады',
  rec_tertiary_center: 'Рассмотрите перевод в центр третичного уровня при необходимости',
  rec_type_screen: 'Требуется определение группы крови и скрининг',
  rec_iv_access: 'Венозный доступ устанавливается при поступлении',
  rec_anesthesia_consult: 'Консультация анестезиолога для планирования родов',
  rec_pediatric_team: 'Уведомление педиатрической бригады о родах',
  rec_document_counseling: 'Документирование консультирования и предпочтений пациентки',
  rec_shoulder_dystocia: 'Усиленный мониторинг риска дистоции плечиков при макросомии',
  rec_cesarean_macrosomia: 'Рассмотрите кесарево сечение при предполагаемом весе плода ≥4500г',
  rec_obesity_anesthesia: 'Рассмотрите консультацию анестезиолога по поводу ожирения',
  rec_obesity_complications: 'Усиленный мониторинг хирургических осложнений',
  rec_advanced_age_surveillance: 'Усиленное наблюдение за плодом из-за позднего материнского возраста',
  rec_maternal_monitoring: 'Рассмотрите дополнительный мониторинг матери',
  
  // About content
  clinical_applications: 'Клинические применения',
  application_1: 'Консультирование пациенток о вероятности успеха VBAC',
  application_2: 'Совместное принятие решений для планирования родов',
  application_3: 'Стратификация риска для подходящих кандидатов',
  application_4: 'Распределение ресурсов и кадровые решения',
  
  evidence_base: 'База доказательств',
  evidence_description: 'Этот калькулятор основан на валидированных прогностических моделях и клинических рекомендациях, включая Практический бюллетень ACOG № 205 о вагинальных родах после кесарева сечения.',
  
  clinical_considerations: 'Клинические соображения',
  consideration_1: 'Индивидуальное консультирование пациенток должно включать личные предпочтения и толерантность к риску',
  consideration_2: 'Пробные роды требуют соответствующего мониторинга и возможности немедленного кесарева сечения',
  consideration_3: 'Показатели успеха варьируются в зависимости от институциональных факторов и опыта врача',
  consideration_4: 'Этот инструмент поддерживает, но не заменяет комплексную клиническую оценку',
  
  // Professional Guidelines
  professional_guidelines: 'Профессиональные рекомендации',
  acog_practice_bulletin: 'Практический бюллетень ACOG № 205: Вагинальные роды после кесарева сечения',
  maternal_fetal_medicine: 'Консенсусные заявления Общества материнско-фетальной медицины',
  validation_studies: 'Исследования валидации прогностической модели VBAC Гробмана и др.',
  
  clinical_validation: 'Клиническая валидация',
  clinical_validation_description: 'Широко валидированная прогностическая модель с доказанной точностью для различных популяций пациенток и клинических условий для прогнозирования успеха VBAC.',
  
  // References
  ref_acog_bulletin: 'Практический бюллетень ACOG № 205: Вагинальные роды после кесарева сечения',
  ref_grobman_model: 'Grobman WA, et al. Разработка номограммы для прогнозирования вагинальных родов после кесарева сечения. Obstet Gynecol. 2007;109(4):806-12',
  ref_cochrane_review: 'Кокрановский обзор: Плановое кесарево сечение для женщин с рубцом на матке',
  ref_who_recommendations: 'Заявление ВОЗ о частоте кесарева сечения',
}; 