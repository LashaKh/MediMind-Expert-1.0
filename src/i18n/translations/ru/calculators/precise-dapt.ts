export const preciseDaptTranslations = {
  title: 'Калькулятор PRECISE-DAPT',
  subtitle: 'Оценка Риска Кровотечения • Руководство по Длительности DAPT',
  description: 'Прогнозирование риска кровотечения, связанного с двойной антитромбоцитарной терапией для выбора оптимальной длительности после ЧКВ.',
  
  // Tool description
  bleeding_assessment_tool: 'Инструмент Оценки Риска Кровотечения',
  tool_description: 'Калькулятор PRECISE-DAPT прогнозирует риск кровотечения, связанный с двойной антитромбоцитарной терапией (DAPT) для выбора оптимальной длительности после чрескожного коронарного вмешательства. Этот валидированный инструмент балансирует безопасность кровотечения с ишемической защитой.',
  
  // Step navigation
  patient_labs: 'Лабораторные Пациента',
  bleeding_history: 'Анамнез Кровотечений',
  
  // Step 1: Demographics & Lab Values
  demographics_labs_section: 'Демографические Данные и Лабораторные Показатели Пациента',
  laboratory_description: 'Введите возраст пациента и ключевые лабораторные параметры, влияющие на риск кровотечения',
  
  // Form fields
  age_label: 'Возраст',
  age_error: 'Возраст должен быть от 18 до 120 лет',
  
  creatinine_label: 'Креатинин Сыворотки',
  creatinine_unit: 'мг/дл',
  creatinine_error: 'Креатинин должен быть от 0,5 до 15,0 мг/дл',
  
  hemoglobin_label: 'Гемоглобин',
  hemoglobin_unit: 'г/дл',
  hemoglobin_error: 'Гемоглобин должен быть от 5,0 до 20,0 г/дл',
  
  white_blood_count_label: 'Количество Лейкоцитов',
  white_blood_count_unit: '×10³/мкл',
  white_blood_count_error: 'Количество лейкоцитов должно быть от 1,0 до 50,0 ×10³/мкл',
  
  // Step 2: Bleeding History
  bleeding_history_section: 'Оценка Анамнеза Кровотечений',
  bleeding_history_description: 'Предыдущие кровотечения являются сильным предиктором будущего риска кровотечений',
  
  previous_bleed: 'Анамнез Предыдущих Кровотечений',
  previous_bleed_desc: 'История больших кровотечений, требовавших госпитализации, переливания крови или хирургического вмешательства',
  
  // Navigation buttons
  next_bleeding_history: 'Далее: Анамнез Кровотечений',
  calculate_button: 'Рассчитать Балл PRECISE-DAPT',
  
  // Results section
  bleeding_risk_analysis: 'Анализ Риска Кровотечения PRECISE-DAPT',
  score_points: '{{score}} баллов',
  
  // Risk categories and interpretations
  bleeding_risk: 'Риск Кровотечения',
  major_bleeding: 'Риск Больших Кровотечений',
  safe_duration: 'Безопасная Длительность',
  annual_major_bleeding: 'Годовой риск больших кровотечений',
  overall_bleeding_risk: 'Общий риск кровотечения через 12 месяцев: {{risk}}%',
  recommended_dapt_duration: 'Рекомендуемая длительность DAPT',
  
  // Risk levels
  low_risk: 'Низкий Риск',
  intermediate_risk: 'Промежуточный Риск',
  high_risk: 'Высокий Риск',
  
  // Interpretation messages
  interpretation_low: 'Низкий риск кровотечения ({{risk}}% через 12 месяцев) - Может рассматриваться продленная DAPT',
  interpretation_intermediate: 'Промежуточный риск кровотечения ({{risk}}% через 12 месяцев) - Стандартная DAPT с тщательным мониторингом',
  interpretation_high: 'Высокий риск кровотечения ({{risk}}% через 12 месяцев) - Рассмотреть сокращенную длительность DAPT',
  
  // Risk factors
  contributing_risk_factors: 'Способствующие Факторы Риска',
  risk_factor_advanced_age: 'Пожилой возраст (≥75 лет) - Значительно повышенный риск кровотечения',
  risk_factor_elderly_age: 'Средний возраст (65-74 года) - Умеренно повышенный риск кровотечения',
  risk_factor_severe_renal: 'Тяжелая почечная недостаточность (Креатинин ≥2,0 мг/дл) - Высокий риск кровотечения',
  risk_factor_moderate_renal: 'Умеренная почечная недостаточность (Креатинин 1,5-1,9 мг/дл) - Повышенный риск кровотечения',
  risk_factor_mild_renal: 'Легкая почечная недостаточность (Креатинин 1,2-1,4 мг/дл) - Слегка повышенный риск кровотечения',
  risk_factor_severe_anemia: 'Тяжелая анемия (Гемоглобин <10 г/дл) - Значительно повышенный риск кровотечения и осложнений',
  risk_factor_moderate_anemia: 'Умеренная анемия (Гемоглобин 10-11,9 г/дл) - Повышенный риск кровотечения',
  risk_factor_low_hemoglobin: 'Низкий гемоглобин (Гемоглобин 12-12,9 г/дл) - Слегка повышенный риск кровотечения',
  risk_factor_elevated_wbc: 'Повышенное количество лейкоцитов (>12 ×10³/мкл) - Маркер воспаления, повышенный риск кровотечения',
  risk_factor_low_wbc: 'Низкое количество лейкоцитов (<4 ×10³/мкл) - Повышенный риск кровотечения и инфекции',
  risk_factor_previous_bleeding: 'Предыдущие большие кровотечения - Сильнейший предиктор будущих кровотечений',
  
  // Recommendations by risk level
  recommendation_low: 'Продленная DAPT (12-30 месяцев) может обеспечить ишемическую пользу с приемлемым риском кровотечения',
  recommendation_intermediate: 'Стандартная длительность DAPT (12 месяцев) с усиленным мониторингом кровотечений и модификацией факторов риска',
  recommendation_high: 'Рассмотреть сокращенную длительность DAPT (3-6 месяцев) из-за повышенного риска кровотечения, но обеспечить адекватную ишемическую защиту',
  
  // Duration guidance
  duration_low: '12-30 месяцев с мониторингом',
  duration_intermediate: '12 месяцев с наблюдением',
  duration_high: '3-6 месяцев с оценкой',
  
  // Clinical guidance
  guidance_low: 'Низкий риск кровотечения позволяет рассмотреть продленную DAPT для пациентов с высоким ишемическим риском',
  guidance_intermediate: 'Баланс риска кровотечения и ишемического риска с индивидуализированной оценкой длительности',
  guidance_high: 'Высокий риск кровотечения требует рассмотрения более короткой длительности DAPT и модификации риска кровотечения',
  
  // Clinical benefit
  benefit_low: 'Благоприятный профиль безопасности кровотечения поддерживает рассмотрение продленной DAPT для ишемической пользы',
  benefit_intermediate: 'Умеренный риск кровотечения требует тщательного баланса с потребностями ишемической защиты',
  benefit_high: 'Повышенный риск кровотечения может ограничить пользу продленной DAPT, рассмотреть альтернативные антитромбоцитарные стратегии',
  
  // Safe duration recommendations
  safe_duration_low: '12-30 месяцев с мониторингом',
  safe_duration_intermediate: '12 месяцев с наблюдением',
  safe_duration_high: '3-6 месяцев с оценкой',
  
  // Clinical sections
  clinical_recommendation: 'Клиническая Рекомендация',
  clinical_benefit_analysis: 'Анализ Клинической Пользы',
  
  // Score interpretation guide
  score_interpretation: 'Руководство по Интерпретации Балла PRECISE-DAPT',
  score_low_range: 'Низкий Риск (<25 баллов)',
  score_low_description: 'Продленная DAPT может быть полезной с приемлемым риском кровотечения',
  score_intermediate_range: 'Промежуточный Риск (25-35 баллов)',
  score_intermediate_description: 'Рекомендуется стандартная DAPT с усиленным мониторингом',
  score_high_range: 'Высокий Риск (≥35 баллов)',
  score_high_description: 'Рассмотреть сокращенную DAPT из-за повышенного риска кровотечения',
  
  // Algorithm validation
  enhanced_algorithm: 'Усовершенствованный Алгоритм PRECISE-DAPT',
  algorithm_validation: '✓ Валидирован исследованием PRECISE-DAPT • Усовершенствованная оценка риска кровотечения с количественным анализом безопасности',
  based_on_precise_dapt: 'Основан на исследовании PRECISE-DAPT • Оценка риска кровотечения для руководства длительностью DAPT',
  bleeding_safety_validated: 'Безопасность Кровотечения Валидирована',
  
  // Action buttons
  new_assessment: 'Новая Оценка',
  modify_inputs: 'Изменить Данные'
};

export default preciseDaptTranslations; 