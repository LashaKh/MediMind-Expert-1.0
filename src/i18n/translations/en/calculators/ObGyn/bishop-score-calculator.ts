export const bishopScoreCalculator = {
  title: 'Bishop Score Calculator',
  subtitle: 'Cervical Readiness Assessment for Labor Induction',
  assessment_tool: 'Assessment Tool',
  tool_description: 'The Bishop Score is a standardized method for assessing cervical readiness for labor induction, evaluating five key cervical and fetal parameters to predict induction success likelihood.',
  based_on_bishop: 'Based on Bishop (1964) Modified Scoring System',
  obstetric_safety_validated: 'Obstetric Safety Validated',
  about_title: 'About Bishop Score',
  
  // Form Labels and Help Text
  cervical_dilation_label: 'Cervical Dilation',
  cervical_dilation_unit: 'cm',
  cervical_dilation_help: 'Measure cervical opening in centimeters (0-10 cm)',
  cervical_dilation_error: 'Please enter a valid dilation between 0-10 cm',
  
  cervical_effacement_label: 'Cervical Effacement',
  cervical_effacement_unit: '%',
  cervical_effacement_help: 'Percentage of cervical thinning (0-100%)',
  cervical_effacement_error: 'Please enter a valid effacement between 0-100%',
  
  cervical_consistency_label: 'Cervical Consistency',
  cervical_consistency_help: 'Assessment of cervical firmness on palpation',
  cervical_consistency_firm: 'Firm',
  cervical_consistency_medium: 'Medium',
  cervical_consistency_soft: 'Soft',
  
  cervical_position_label: 'Cervical Position',
  cervical_position_help: 'Anatomical position of cervix relative to fetal head',
  cervical_position_posterior: 'Posterior',
  cervical_position_mid: 'Mid-position',
  cervical_position_anterior: 'Anterior',
  
  fetal_station_label: 'Fetal Station',
  fetal_station_help: 'Fetal head position relative to ischial spines (-3 to +3)',
  fetal_station_error: 'Please enter a valid station between -3 and +3',
  
  // Sections
  cervical_assessment: 'Cervical Assessment',
  cervical_parameters_section: 'Cervical Parameters',
  cervical_parameters_description: 'Assess cervical dilation, effacement, consistency, and position',
  
  // Scoring System
  scoring_system: 'Scoring System',
  clinical_assessment: 'Clinical Assessment',
  position_assessment: 'Position Assessment',
  
  // Results
  bishop_score_analysis: 'Bishop Score Analysis',
  total_score: 'Total Score',
  induction_success: 'Induction Success',
  labor_likelihood: 'Labor likelihood',
  cesarean_risk: 'Cesarean Risk',
  clinical_recommendation: 'Clinical Recommendation',
  evidence_base: 'Evidence Base',
  
  // Buttons
  calculate_button: 'Calculate Bishop Score',
  new_assessment: 'New Assessment',
  modify_inputs: 'Modify Inputs',
  
  // Hardcoded text replacements
  reference_text: 'Reference',
  high_station: 'High Station',
  high_station_description_1: '-3, -2: 0 points',
  high_station_description_2: 'Head above spines',
  high_station_description_3: 'More difficult delivery',
  
  mid_station: 'Mid Station',
  mid_station_description_1: '-1: 1 point',
  mid_station_description_2: 'Head approaching spines',
  mid_station_description_3: 'Favorable position',
  
  low_station: 'Low Station',
  low_station_description_1: '0, +1, +2, +3: 2-3 points',
  low_station_description_2: 'Head at or below spines',
  low_station_description_3: 'Very favorable',
  
  // Scoring descriptions
  dilation_score_0: 'Closed (0 cm): 0 points',
  dilation_score_1: '1-2 cm: 1 point',
  dilation_score_2: '3-4 cm: 2 points',
  dilation_score_3: '≥5 cm: 3 points',
  
  effacement_score_0: '0-30%: 0 points',
  effacement_score_1: '40-50%: 1 point',
  effacement_score_2: '60-70%: 2 points',
  effacement_score_3: '≥80%: 3 points',
  
  consistency_descriptions_firm: 'Firm: Like tip of nose',
  consistency_descriptions_medium: 'Medium: Like chin consistency',
  consistency_descriptions_soft: 'Soft: Like lips or earlobe',
  
  position_descriptions_posterior: 'Posterior: Cervix points toward sacrum',
  position_descriptions_mid: 'Mid-position: Cervix in neutral position',
  position_descriptions_anterior: 'Anterior: Cervix points toward pubis',
  
  cesarean_delivery_risk: 'Risk of cesarean delivery',
  
  // About page content
  scoring_parameters: 'Scoring Parameters',
  five_assessment_parameters: 'Five Assessment Parameters:',
  cervical_dilation_points: 'Cervical dilation (0-3 points)',
  cervical_effacement_points: 'Cervical effacement (0-3 points)',
  cervical_consistency_points: 'Cervical consistency (0-2 points)',
  cervical_position_points: 'Cervical position (0-2 points)',
  fetal_station_points: 'Fetal station (0-3 points)',
  
  score_interpretation: 'Score Interpretation',
  induction_success_prediction: 'Induction Success Prediction:',
  score_unfavorable: 'Score ≤3: Unfavorable cervix',
  score_intermediate: 'Score 4-6: Intermediate success',
  score_favorable: 'Score 7-8: Favorable cervix',
  score_very_favorable: 'Score ≥9: Very favorable cervix',
  
  clinical_applications: 'Clinical Applications',
  labor_induction_planning: 'Labor Induction Planning',
  labor_induction_description: 'Determines optimal timing and method for labor induction based on cervical readiness',
  delivery_planning: 'Delivery Planning',
  delivery_planning_description: 'Assists in counseling patients about likelihood of vaginal delivery success',
  clinical_documentation: 'Clinical Documentation',
  clinical_documentation_description: 'Standardized assessment tool for medical record documentation and quality metrics',
  
  professional_guidelines: 'Professional Guidelines',
  acog_practice_bulletin: 'ACOG Practice Bulletin No. 107: Induction of Labor',
  maternal_fetal_medicine: 'Society for Maternal-Fetal Medicine recommendations',
  validation_studies: 'Modified Bishop Score validation studies',
  
  clinical_validation: 'Clinical Validation',
  clinical_validation_description: 'Extensively validated scoring system with demonstrated predictive accuracy for labor induction success across diverse patient populations and clinical settings.',
  
  clinical_considerations: 'Clinical Considerations',
  consideration_1: 'Assessment should be performed by experienced clinicians familiar with cervical examination techniques',
  consideration_2: 'Score interpretation should consider individual patient factors and clinical context',
  consideration_3: 'Multiple assessments may be needed as cervical status can change rapidly',
  consideration_4: 'This tool supports but does not replace clinical judgment and comprehensive patient evaluation',
  
  // Station option labels
  station_high_label: 'High',
  station_mid_label: 'Mid',
  station_low_label: 'Low',
  station_at_spines: 'At spines',
  
  // Points indicators
  zero_points: '0 points',
  one_point: '1 point',
  two_points: '2 points',
  three_points: '3 points',

  // Service layer interpretations and recommendations
  interpretation_unfavorable: 'an unfavorable cervix with high risk of failed induction',
  interpretation_partially_favorable: 'a partially favorable cervix with moderate induction success rate',
  interpretation_favorable: 'a favorable cervix with good induction success rate',
  interpretation_very_favorable: 'a very favorable cervix with excellent induction success rate',
  
  // Detailed Analysis label
  detailed_analysis: 'Detailed Analysis',
  
  // Induction recommendations by score
  induction_recommendation_unfavorable: 'Unfavorable cervix - consider cervical ripening or alternative delivery method',
  induction_recommendation_partially: 'Partially favorable - proceed with caution and close monitoring',
  induction_recommendation_favorable: 'Favorable cervix - standard induction protocol likely successful',
  induction_recommendation_very_favorable: 'Very favorable cervix - high likelihood of successful vaginal delivery',
  
  // Individual recommendations
  rec_cervical_ripening_agents: 'Consider cervical ripening agents before induction',
  rec_alternative_methods: 'Alternative methods: mechanical dilation or prostaglandins',
  rec_discuss_risks_benefits: 'Discuss risks and benefits of induction vs. cesarean delivery',
  rec_induction_caution: 'Induction may be attempted with caution',
  rec_cervical_ripening_unfavorable: 'Consider cervical ripening if unfavorable features present',
  rec_monitor_failed_induction: 'Monitor closely for signs of failed induction',
  rec_favorable_conditions: 'Favorable conditions for labor induction',
  rec_standard_protocols: 'Standard induction protocols likely successful',
  rec_institutional_guidelines: 'Monitor progress according to institutional guidelines',
  rec_continuous_monitoring: 'Continuous fetal monitoring during induction',
  rec_pain_management: 'Adequate pain management options',
  rec_delivery_plan: 'Clear delivery plan and cesarean backup available',
  
  // References
  ref_acog_bulletin: 'ACOG Practice Bulletin No. 107: Induction of Labor',
  ref_bishop_original: 'Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol. 1964;24:266-8',
  ref_who_recommendations: 'WHO Recommendations: Induction of Labour at or beyond Term',
  ref_cochrane_review: 'Cochrane Review: Mechanical methods for induction of labour',
  
  // Result field labels (for UI display)
  bishop_score_label: 'Bishop Score',
  induction_success_label: 'Induction Success',
  cesarean_risk_label: 'Cesarean Risk',
  
  // Induction success values
  unlikely: 'Unlikely',
  possible: 'Possible', 
  likely: 'Likely',
  very_likely: 'Very Likely',
}; 