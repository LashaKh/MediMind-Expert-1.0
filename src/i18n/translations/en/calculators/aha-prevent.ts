export default {
  // Core information
  title: 'AHA PREVENT™ Calculator',
  subtitle: 'Next-Generation Cardiovascular Risk Assessment • CKM Health Integration',
  description: 'Revolutionary risk prediction incorporating cardiovascular-kidney-metabolic (CKM) health factors. Enhanced with social determinants of health for comprehensive 10-year and 30-year risk assessment.',
  
  // Alert section
  alert_title: 'American Heart Association PREVENT™',
  alert_description: 'Revolutionary risk prediction incorporating cardiovascular-kidney-metabolic (CKM) health factors. Enhanced with social determinants of health for comprehensive 10-year and 30-year risk assessment.',
  alert_badge: 'AHA 2023 - CKM-Enhanced Prediction',
  
  // Progress steps
  step_demographics: 'Demographics',
  step_clinical: 'Clinical',
  step_lab_values: 'Lab Values',
  step_ckm_e: 'CKM-E',
  
  // Step navigation titles and descriptions
  step_1_title: 'Personal Information',
  step_1_description: 'Basic demographic and anthropometric data',
  step_2_title: 'Laboratory Values',
  step_2_description: 'Cholesterol profile and biomarkers',
  step_3_title: 'Clinical Factors',
  step_3_description: 'Blood pressure and medical history',
  step_4_title: 'Enhanced Factors',
  step_4_description: 'Optional CKM-E parameters (Optional)',
  step_5_title: 'Risk Assessment',
  step_5_description: 'Comprehensive cardiovascular risk analysis',
  
  // Progress indicators
  progress_complete: 'Complete',
  progress_of_steps: 'of 4 steps completed',
  
  // Step 1: Demographics
  demographics_title: 'Patient Demographics',
  demographics_description: 'Basic demographic information for risk assessment',
  age_label: 'Age',
  age_placeholder: '45',
  age_help: 'Age in years (30-79 for PREVENT)',
  sex_label: 'Sex',
  sex_placeholder: 'Select sex...',
  sex_male: 'Male',
  sex_female: 'Female',
  race_label: 'Race/Ethnicity',
  race_placeholder: 'Select race/ethnicity...',
  race_white: 'White',
  race_black: 'Black/African American',
  race_hispanic: 'Hispanic/Latino',
  race_asian: 'Asian',
  race_other: 'Other',
  height_label: 'Height',
  height_placeholder: '170',
  weight_label: 'Weight',
  weight_placeholder: '80',
  
  // Step 2: Clinical Assessment
  clinical_title: 'Clinical Assessment',
  clinical_description: 'Blood pressure and clinical risk factors',
  systolic_bp_label: 'Systolic Blood Pressure',
  systolic_bp_placeholder: '120',
  diastolic_bp_label: 'Diastolic Blood Pressure',
  diastolic_bp_placeholder: '80',
  clinical_risk_factors_title: 'Clinical Risk Factors',
  on_hypertension_meds_label: 'On Hypertension Medications',
  on_hypertension_meds_description: 'Currently taking blood pressure medications',
  antihypertensive_meds_label: 'Antihypertensive Medications',
  antihypertensive_meds_description: 'Currently taking blood pressure medications',
  on_statin_label: 'On Statin Therapy',
  on_statin_description: 'Currently taking statin medications',
  diabetes_label: 'Diabetes Mellitus',
  diabetes_description: 'Type 1 or Type 2 diabetes',
  current_smoker_label: 'Current Smoker',
  current_smoker_description: 'Currently smoking tobacco',
  serum_creatinine_label: 'Serum Creatinine',
  serum_creatinine_placeholder: '1.0',
  
  // Step 3: Laboratory Assessment
  lab_title: 'Laboratory Assessment',
  lab_description: 'Lipid profile and cholesterol measurements',
  total_cholesterol_label: 'Total Cholesterol',
  total_cholesterol_placeholder: '200',
  hdl_cholesterol_label: 'HDL Cholesterol',
  hdl_cholesterol_placeholder: '50',
  ldl_cholesterol_label: 'LDL Cholesterol',
  ldl_cholesterol_placeholder: '130',
  
  // Step 4: CKM-E Enhanced Factors
  ckm_e_title: 'CKM-E Enhanced Factors',
  ckm_e_description: 'Cardiovascular-Kidney-Metabolic health enhancement factors',
  hba1c_label: 'HbA1c',
  hba1c_placeholder: '6.5',
  egfr_label: 'eGFR',
  egfr_placeholder: '90',
  uacr_label: 'UACR',
  uacr_placeholder: '15',
  sdi_label: 'Social Deprivation Index',
  sdi_placeholder: '0.3',
  
  // CKM-E Information
  ckm_e_info_title: 'CKM-E Enhancement Information',
  egfr_info: 'Estimated glomerular filtration rate (kidney function marker)',
  uacr_info: 'Urine albumin-to-creatinine ratio (kidney damage marker)',
  sdi_info: 'Social Deprivation Index (social determinants of health)',
  
  // Navigation buttons
  next_clinical_factors: 'Next: Clinical Factors',
  next_laboratory_values: 'Next: Laboratory Values',
  next_ckm_e_factors: 'Next: CKM-E Factors',
  back_button: 'Back',
  calculate_prevent_risk: 'Calculate PREVENT Risk',
  
  // Results section
  results_title: 'AHA PREVENT™ Risk Analysis',
  ckm_e_enhanced_title: 'CKM-E Enhanced Assessment',
  ckm_e_enhanced_description: 'Enhanced cardiovascular-kidney-metabolic factors detected - comprehensive monitoring recommended',
  
  // Risk predictions
  ten_year_predictions_title: '10-Year Risk Predictions',
  thirty_year_predictions_title: '30-Year Risk Predictions',
  total_cvd: 'Total CVD',
  ascvd: 'ASCVD',
  heart_failure: 'Heart Failure',
  
  // Risk stratification
  risk_stratification_title: 'PREVENT Risk Stratification',
  low_risk: 'Low Risk',
  low_risk_range: '<5% ASCVD',
  borderline_risk: 'Borderline',
  borderline_risk_range: '5-7.5% ASCVD',
  intermediate_risk: 'Intermediate',
  intermediate_risk_range: '7.5-20% ASCVD',
  high_risk: 'High Risk',
  high_risk_range: '≥20% ASCVD',
  
  // Clinical recommendations
  clinical_recommendations_title: 'Clinical Management Recommendations',
  
  // Algorithm validation
  algorithm_title: 'AHA PREVENT™ Model',
  algorithm_description: '✓ AHA 2023 Guidelines • CKM-Enhanced • Machine Learning Validated • 30-Year Predictions',
  algorithm_2023_title: 'AHA PREVENT™ 2023 Algorithm',
  algorithm_implementation_description: 'This calculator implements the official American Heart Association PREVENT™ equations (2023):',
  algorithm_feature_1: 'Derived from over 6 million diverse individuals',
  algorithm_feature_2: 'Calculates 10-year risks for ASCVD, Heart Failure, and Total CVD',
  algorithm_feature_3: 'For ages 30-59: Also provides 30-year risk estimates',
  algorithm_feature_4: 'Includes novel risk factors (HbA1C, UACR, SDI) for enhanced assessment',
  algorithm_feature_5: 'BMI and eGFR calculated using validated equations',
  algorithm_2023_feature_1: 'Derived from over 6 million diverse individuals',
  algorithm_2023_feature_2: 'Calculates 10-year risks for ASCVD, Heart Failure, and Total CVD',
  algorithm_2023_feature_3: 'For ages 30-59: Also provides 30-year risk estimates',
  algorithm_2023_feature_4: 'Includes novel risk factors (HbA1C, UACR, SDI) for enhanced assessment',
  algorithm_2023_feature_5: 'BMI and eGFR calculated using validated equations',
  
  // Action buttons
  new_assessment: 'New Assessment',
  modify_inputs: 'Modify Inputs',
  
  // Footer
  footer_description: 'Based on AHA PREVENT™ equations with CKM health factors • For educational purposes only',
  footer_guidelines: 'AHA 2023 Guidelines',
  
  // Validation messages
  validation_age: 'Age is required',
  validation_age_range: 'Age must be between 30-79 years for PREVENT',
  validation_sex: 'Sex is required',
  validation_race: 'Race/ethnicity is required',
  validation_total_cholesterol: 'Total cholesterol is required',
  validation_total_cholesterol_range: 'Total cholesterol must be between 100-400 mg/dL',
  validation_hdl_cholesterol: 'HDL cholesterol is required',
  validation_hdl_cholesterol_range: 'HDL cholesterol must be between 20-100 mg/dL',
  validation_systolic_bp: 'Systolic BP is required',
  validation_systolic_bp_range: 'Systolic BP must be between 90-200 mmHg',
  
  // Units
  unit_years: 'years',
  unit_mg_dl: 'mg/dL',
  unit_mmhg: 'mmHg',
  unit_ml_min: 'mL/min/1.73m²',
  unit_mg_g: 'mg/g',
  unit_score: 'score',
  unit_cm: 'cm',
  unit_kg: 'kg',
  unit_percent: '%',
  
  // Risk categories and prevention strategies
  risk_category: 'Risk category',
  prevention_strategy: 'Prevention strategy',
  standard_prevention: 'Standard cardiovascular prevention approach',
  comprehensive_ckm: 'Comprehensive CKM health approach with enhanced monitoring',
  
  // Recommendations content
  rec_continue_lifestyle: 'Continue lifestyle optimization',
  rec_reassess: 'Reassess in 4-6 years',
  rec_risk_enhancers: 'Risk enhancers assessment recommended',
  rec_cac_scoring: 'Consider CAC scoring if uncertain',
  rec_lifestyle_therapy: 'Lifestyle therapy essential',
  rec_statin_therapy: 'Statin therapy recommended',
  rec_cac_refinement: 'Consider CAC scoring for refinement',
  rec_high_intensity_statin: 'High-intensity statin therapy recommended',
  rec_additional_therapies: 'Consider additional therapies (ezetimibe, PCSK9i)',
  rec_aggressive_lifestyle: 'Aggressive lifestyle modification',
  rec_ckm_e_monitoring: 'CKM-E factors present - enhanced monitoring needed',
  
  // Chart visualization
  ten_year_risk_estimates: '10-Year Risk Estimates',
  thirty_year_risk_estimates: '30-Year Risk Estimates',
  risk_by_age_description: 'Risk estimates by age for individuals with the same risk factors',
  age_years: 'Age (years)',
  risk_percentage: 'Risk (%)',
  age: 'Age',
  years: 'years',
  risk_insights: 'Risk Insights',
  current_age: 'Current Age',
  year_total_risk: 'Year Total Risk',
  risk_increase_decade: 'Risk Increase/Decade'
}; 