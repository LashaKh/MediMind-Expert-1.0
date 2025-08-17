export const vbacSuccessCalculator = {
  title: 'VBAC Success Calculator',
  subtitle: 'Vaginal Birth After Cesarean Success Prediction',
  assessment_tool: 'Prediction Tool',
  tool_description: 'Assess the likelihood of successful vaginal birth after cesarean (VBAC) delivery using evidence-based clinical factors and validated prediction models.',
  based_on_acog: 'Based on ACOG Practice Bulletin No. 205',
  obstetric_safety_validated: 'Obstetric Safety Validated',
  about_title: 'About VBAC Success Prediction',
  
  // Form Labels and Help Text
  maternal_age_label: 'Maternal Age',
  maternal_age_unit: 'years',
  maternal_age_help: 'Current maternal age in years',
  maternal_age_error: 'Maternal age must be between 15-55 years',
  maternal_age_placeholder: '25',
  
  bmi_label: 'Body Mass Index (BMI)',
  bmi_unit: 'kg/m²',
  bmi_help: 'Pre-pregnancy or early pregnancy BMI',
  bmi_error: 'BMI must be between 15-60 kg/m²',
  bmi_placeholder: '24.5',
  
  gestational_age_label: 'Gestational Age',
  gestational_age_unit: 'weeks',
  gestational_age_help: 'Current gestational age at delivery',
  gestational_age_error: 'Gestational age must be between 34-42 weeks',
  gestational_age_placeholder: '39',
  
  cervical_dilation_label: 'Cervical Dilation',
  cervical_dilation_unit: 'cm',
  cervical_dilation_help: 'Current cervical dilation if known',
  cervical_dilation_error: 'Cervical dilation must be between 0-10 cm',
  cervical_dilation_placeholder: '3',
  
  estimated_fetal_weight_label: 'Estimated Fetal Weight',
  estimated_fetal_weight_unit: 'g',
  estimated_fetal_weight_help: 'Estimated fetal weight from ultrasound',
  estimated_fetal_weight_error: 'Estimated fetal weight must be between 1000-6000 grams',
  estimated_fetal_weight_placeholder: '3500',
  
  previous_vaginal_delivery_label: 'Previous Vaginal Delivery',
  previous_vaginal_delivery_help: 'History of successful vaginal delivery before or after cesarean',
  
  indication_previous_cd_label: 'Indication for Previous Cesarean',
  indication_previous_cd_help: 'Primary indication for the previous cesarean delivery',
  indication_non_recurring: 'Non-recurring (e.g., breech, fetal distress)',
  indication_recurring: 'Recurring (e.g., cephalopelvic disproportion)',
  indication_unknown: 'Unknown',
  
  // Step Titles
  maternal_demographics: 'Maternal Demographics',
  obstetric_history: 'Obstetric History',
  current_pregnancy: 'Current Pregnancy',
  
  // Results
  vbac_success_analysis: 'VBAC Success Analysis',
  success_probability: 'Success Probability',
  vbac_likelihood: 'VBAC Likelihood',
  clinical_recommendation: 'Clinical Recommendation',
  uterine_rupture_risk: 'Uterine Rupture Risk',
  category: 'Category',
  recommendation: 'Recommendation',
  
  // Categories
  excellent_candidate: 'Excellent VBAC candidate with high success probability',
  good_candidate: 'Good VBAC candidate with favorable success probability',
  moderate_candidate: 'Moderate VBAC candidate requiring careful consideration',
  poor_candidate: 'Poor VBAC candidate - consider elective repeat cesarean',
  
  // Buttons
  calculate_button: 'Calculate VBAC Success',
  new_assessment: 'New Assessment',
  modify_inputs: 'Modify Inputs',
  
  // Risk Categories
  low: 'Low Risk',
  moderate: 'Moderate Risk', 
  high: 'High Risk',
  
  // Recommendation Values
  candidate: 'VBAC Candidate',
  'relative-contraindication': 'Relative Contraindication',
  contraindication: 'Contraindication',
  
  // Interpretation Templates
  interpretation_template: 'VBAC success probability of {successProbability}% indicates {categoryText}. Uterine rupture risk is estimated at {uterineRuptureRisk}%. This prediction is based on validated clinical factors including maternal characteristics, obstetric history, and current labor parameters.',
  interpretation_high_success: 'high likelihood of successful vaginal delivery',
  interpretation_moderate_success: 'moderate success probability requiring careful monitoring',
  interpretation_low_success: 'lower success probability - consider individual factors and patient preference',
  
  // Counseling Points
  counseling_success_probability: 'Success probability: {percentage}%',
  counseling_uterine_rupture_risk: 'Uterine rupture risk: {percentage}%',
  counseling_rupture_signs: 'Signs of uterine rupture: severe abdominal pain, abnormal fetal heart rate',
  counseling_emergency_cesarean: 'Emergency cesarean delivery may be necessary',
  counseling_complications_risk: 'Risk of blood transfusion and hysterectomy if rupture occurs',
  
  // Recommendations
  rec_vbac_strongly_recommended: 'VBAC trial strongly recommended - high probability of success',
  rec_continuous_monitoring: 'Continuous fetal monitoring during labor',
  rec_emergency_access: 'Ensure immediate access to emergency cesarean delivery',
  rec_epidural_anesthesia: 'Consider epidural anesthesia for optimal pain management',
  rec_regular_assessment: 'Regular assessment of labor progress',
  rec_vbac_reasonable: 'VBAC trial is a reasonable option with appropriate counseling',
  rec_detailed_discussion: 'Detailed discussion of risks and benefits with patient',
  rec_close_monitoring: 'Close monitoring of labor progress and fetal status',
  rec_low_threshold: 'Low threshold for repeat cesarean if complications arise',
  rec_operating_room: 'Ensure operating room availability throughout labor',
  rec_elective_repeat: 'Consider elective repeat cesarean delivery',
  rec_enhanced_monitoring: 'Enhanced monitoring required if VBAC attempted',
  rec_informed_consent: 'Detailed informed consent regarding increased risks',
  rec_surgical_team: 'Immediate availability of surgical team',
  rec_tertiary_center: 'Consider transfer to tertiary center if needed',
  rec_type_screen: 'Blood type and screen required',
  rec_iv_access: 'Intravenous access established on admission',
  rec_anesthesia_consult: 'Anesthesia consultation for delivery planning',
  rec_pediatric_team: 'Pediatric team notification for delivery',
  rec_document_counseling: 'Document counseling and patient preferences',
  rec_shoulder_dystocia: 'Enhanced monitoring for shoulder dystocia risk with macrosomia',
  rec_cesarean_macrosomia: 'Consider cesarean delivery for estimated fetal weight ≥4500g',
  rec_obesity_anesthesia: 'Anesthesia consultation for obesity-related considerations',
  rec_obesity_complications: 'Enhanced monitoring for obesity-related complications',
  rec_advanced_age_surveillance: 'Enhanced surveillance for advanced maternal age',
  rec_maternal_monitoring: 'Close maternal monitoring for age-related complications',
  
  clinical_considerations: 'Clinical Considerations',
  consideration_1: 'Individual patient counseling should incorporate personal preferences and risk tolerance',
  consideration_2: 'Trial of labor requires appropriate monitoring and immediate cesarean capability',
  consideration_3: 'Success rates vary based on institutional factors and provider experience',
  consideration_4: 'This tool supports but does not replace comprehensive clinical assessment',
  
  // Professional Guidelines
  professional_guidelines: 'Professional Guidelines',
  acog_practice_bulletin: 'ACOG Practice Bulletin No. 205: Vaginal Birth After Cesarean Delivery',
  maternal_fetal_medicine: 'Society for Maternal-Fetal Medicine consensus statements',
  validation_studies: 'Grobman et al. VBAC prediction model validation studies',
  
  clinical_validation: 'Clinical Validation',
  clinical_validation_description: 'Extensively validated prediction model with demonstrated accuracy across diverse patient populations and clinical settings for VBAC success prediction.',
  
  // References
  ref_acog_bulletin: 'ACOG Practice Bulletin No. 205: Vaginal Birth After Cesarean Delivery',
  ref_grobman_model: 'Grobman WA, et al. Development of a nomogram for prediction of vaginal birth after cesarean delivery. Obstet Gynecol. 2007;109(4):806-12',
  ref_cochrane_review: 'Cochrane Review: Planned caesarean section for women with a caesarean scar',
  ref_who_recommendations: 'WHO Statement on Caesarean Section Rates',
}; 