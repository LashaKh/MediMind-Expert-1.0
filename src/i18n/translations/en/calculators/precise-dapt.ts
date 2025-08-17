export const preciseDaptTranslations = {
  title: 'PRECISE-DAPT Bleeding Risk Calculator',
  subtitle: 'Bleeding Risk Assessment • DAPT Duration Guidance',
  description: 'Prediction of bleeding risk associated with dual antiplatelet therapy to guide optimal duration after PCI.',
  
  // Tool description
  bleeding_assessment_tool: 'Bleeding Risk Assessment Tool',
  tool_description: 'PRECISE-DAPT Calculator predicts bleeding risk associated with dual antiplatelet therapy (DAPT) to guide optimal duration selection after percutaneous coronary intervention. This validated tool balances bleeding safety with ischemic protection.',
  
  // Step navigation
  patient_labs: 'Patient Labs',
  bleeding_history: 'Bleeding History',
  
  // Step 1: Demographics & Lab Values
  demographics_labs_section: 'Patient Demographics and Laboratory Values',
  laboratory_description: 'Enter patient age and key laboratory parameters that influence bleeding risk',
  
  // Form fields
  age_label: 'Age',
  age_error: 'Age must be between 18-120 years',
  
  creatinine_label: 'Serum Creatinine',
  creatinine_unit: 'mg/dL',
  creatinine_error: 'Creatinine must be between 0.5-15.0 mg/dL',
  
  hemoglobin_label: 'Hemoglobin',
  hemoglobin_unit: 'g/dL',
  hemoglobin_error: 'Hemoglobin must be between 5.0-20.0 g/dL',
  
  white_blood_count_label: 'White Blood Cell Count',
  white_blood_count_unit: '×10³/μL',
  white_blood_count_error: 'White blood count must be between 1.0-50.0 ×10³/μL',
  
  // Step 2: Bleeding History
  bleeding_history_section: 'Bleeding History Assessment',
  bleeding_history_description: 'Prior bleeding history is a strong predictor of future bleeding risk',
  
  previous_bleed: 'Previous Bleeding History',
  previous_bleed_desc: 'History of major bleeding requiring hospitalization, transfusion, or surgery',
  
  // Navigation buttons
  next_bleeding_history: 'Next: Bleeding History',
  calculate_button: 'Calculate PRECISE-DAPT Score',
  
  // Results section
  bleeding_risk_analysis: 'PRECISE-DAPT Bleeding Risk Analysis',
  score_points: '{{score}} points',
  
  // Risk categories and interpretations
  bleeding_risk: 'Bleeding Risk',
  major_bleeding: 'Major Bleeding Risk',
  safe_duration: 'Safe Duration',
  annual_major_bleeding: 'Annual major bleeding risk',
  overall_bleeding_risk: 'Overall bleeding risk at 12 months: {{risk}}%',
  recommended_dapt_duration: 'Recommended DAPT duration',
  
  // Risk levels
  low_risk: 'Low Risk',
  intermediate_risk: 'Intermediate Risk',
  high_risk: 'High Risk',
  
  // Interpretation messages
  interpretation_low: 'Low bleeding risk ({{risk}}% at 12 months) - Extended DAPT may be considered',
  interpretation_intermediate: 'Intermediate bleeding risk ({{risk}}% at 12 months) - Standard DAPT with careful monitoring',
  interpretation_high: 'High bleeding risk ({{risk}}% at 12 months) - Consider shortened DAPT duration',
  
  // Risk factors
  contributing_risk_factors: 'Contributing Risk Factors',
  risk_factor_advanced_age: 'Advanced age (≥75 years) - Significantly increased bleeding risk',
  risk_factor_elderly_age: 'Elderly age (65-74 years) - Moderately increased bleeding risk',
  risk_factor_severe_renal: 'Severe renal impairment (Creatinine ≥2.0 mg/dL) - High bleeding risk',
  risk_factor_moderate_renal: 'Moderate renal impairment (Creatinine 1.5-1.9 mg/dL) - Increased bleeding risk',
  risk_factor_mild_renal: 'Mild renal impairment (Creatinine 1.2-1.4 mg/dL) - Mildly increased bleeding risk',
  risk_factor_severe_anemia: 'Severe anemia (Hemoglobin <10 g/dL) - Significantly increased bleeding risk and complications',
  risk_factor_moderate_anemia: 'Moderate anemia (Hemoglobin 10-11.9 g/dL) - Increased bleeding risk',
  risk_factor_low_hemoglobin: 'Low hemoglobin (Hemoglobin 12-12.9 g/dL) - Mildly increased bleeding risk',
  risk_factor_elevated_wbc: 'Elevated white blood count (>12 ×10³/μL) - Inflammation marker, increased bleeding risk',
  risk_factor_low_wbc: 'Low white blood count (<4 ×10³/μL) - Increased bleeding and infection risk',
  risk_factor_previous_bleeding: 'Previous major bleeding - Strongest predictor of future bleeding events',
  
  // Recommendations by risk level
  recommendation_low: 'Extended DAPT (12-30 months) may provide ischemic benefit with acceptable bleeding risk',
  recommendation_intermediate: 'Standard DAPT duration (12 months) with enhanced bleeding monitoring and risk factor modification',
  recommendation_high: 'Consider shortened DAPT duration (3-6 months) due to elevated bleeding risk, but ensure adequate ischemic protection',
  
  // Duration guidance
  duration_low: '12-30 months with monitoring',
  duration_intermediate: '12 months with surveillance',
  duration_high: '3-6 months with assessment',
  
  // Clinical guidance
  guidance_low: 'Low bleeding risk allows consideration of extended DAPT for high ischemic risk patients',
  guidance_intermediate: 'Balance bleeding and ischemic risks with individualized duration assessment',
  guidance_high: 'High bleeding risk warrants consideration of shorter DAPT duration and bleeding risk modification',
  
  // Clinical benefit
  benefit_low: 'Favorable bleeding safety profile supports extended DAPT consideration for ischemic benefit',
  benefit_intermediate: 'Moderate bleeding risk requires careful balance with ischemic protection needs',
  benefit_high: 'Elevated bleeding risk may limit extended DAPT benefit, consider alternative antiplatelet strategies',
  
  // Safe duration recommendations
  safe_duration_low: '12-30 months with monitoring',
  safe_duration_intermediate: '12 months with surveillance',
  safe_duration_high: '3-6 months with assessment',
  
  // Clinical sections
  clinical_recommendation: 'Clinical Recommendation',
  clinical_benefit_analysis: 'Clinical Benefit Analysis',
  
  // Score interpretation guide
  score_interpretation: 'PRECISE-DAPT Score Interpretation Guide',
  score_low_range: 'Low Risk (<25 points)',
  score_low_description: 'Extended DAPT may be beneficial with acceptable bleeding risk',
  score_intermediate_range: 'Intermediate Risk (25-35 points)',
  score_intermediate_description: 'Standard DAPT with enhanced monitoring recommended',
  score_high_range: 'High Risk (≥35 points)',
  score_high_description: 'Consider shortened DAPT due to elevated bleeding risk',
  
  // Algorithm validation
  enhanced_algorithm: 'Enhanced PRECISE-DAPT Algorithm',
  algorithm_validation: '✓ PRECISE-DAPT Study Validated • Enhanced bleeding risk assessment with quantitative safety analysis',
  based_on_precise_dapt: 'Based on PRECISE-DAPT Study • Bleeding risk assessment for DAPT duration guidance',
  bleeding_safety_validated: 'Bleeding Safety Validated',
  
  // Action buttons
  new_assessment: 'New Assessment',
  modify_inputs: 'Modify Inputs'
};

export default preciseDaptTranslations; 