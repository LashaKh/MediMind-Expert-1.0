const gwtgHfRiskTranslations = {
  title: 'GWTG-HF Risk Calculator',
  subtitle: 'Get With The Guidelines - Heart Failure Risk Assessment',
  description: 'Evidence-based risk prediction tool for in-hospital mortality in heart failure patients.',
  
  // Alert section
  alert_title: 'GWTG-HF Risk Assessment',
  alert_description: 'Validated risk calculator for in-hospital mortality prediction in heart failure patients based on the Get With The Guidelines-Heart Failure registry. This tool helps stratify patients and guide clinical decision-making during hospitalization.',
  
  // Section headers
  section_demographics: 'Demographics & Comorbidities',
  section_demographics_description: 'Patient demographic information and cardiovascular comorbidities',
  vital_signs_section: 'Vital Signs Assessment', 
  vital_signs_description: 'Current hemodynamic status and cardiovascular vital signs',
  laboratory_section: 'Laboratory Values',
  laboratory_description: 'Key laboratory markers affecting heart failure prognosis',
  
  // Demographics fields
  field_age: 'Age',
  field_age_placeholder: 'Enter age in years',
  field_race: 'Race/Ethnicity',
  field_race_select: 'Select race/ethnicity',
  field_race_black: 'Black or African American',
  field_race_other: 'Other',
  field_copd: 'Chronic Obstructive Pulmonary Disease (COPD)',
  field_copd_description: 'History of chronic obstructive pulmonary disease',
  
  // Vital signs fields
  systolic_bp_label: 'Systolic Blood Pressure',
  systolic_bp_placeholder: 'Enter systolic BP',
  heart_rate_label: 'Heart Rate',
  heart_rate_placeholder: 'Enter heart rate',
  
  // Laboratory fields
  bun_label: 'Blood Urea Nitrogen (BUN)',
  bun_placeholder: 'Enter BUN value',
  sodium_label: 'Serum Sodium',
  sodium_placeholder: 'Enter sodium level',
  
  // Button labels
  button_next_vital_signs: 'Next: Vital Signs',
  next_laboratory: 'Next: Laboratory',
  back_button: 'Back',
  calculate_button: 'Calculate Risk',
  
  // Results section
  results_title: 'GWTG-HF Risk Assessment Results',
  gwtg_points: 'GWTG Points',
  risk_score_label: 'Risk Score',
  mortality_risk_label: 'Mortality Risk',
  in_hospital_mortality: 'In-hospital mortality',
  risk_category_label: 'Risk Category',
  risk_stratification: 'Risk stratification',
  
  // Risk factor breakdown
  risk_factor_contribution: 'Risk Factor Contribution',
  age_factor: 'Age',
  systolic_bp_factor: 'SBP',
  bun_factor: 'BUN',
  sodium_factor: 'Sodium',
  race_factor: 'Race',
  copd_factor: 'COPD',
  heart_rate_factor: 'HR',
  
  // Clinical management
  clinical_management: 'Clinical Management Recommendations',
  
  // Risk interpretations
  interpretation_template: 'GWTG-HF Risk Score: {{score}} points. {{interpretation}} Estimated in-hospital mortality: {{mortality}}%.',
  interpretation_low: 'Low risk for in-hospital mortality',
  interpretation_intermediate: 'Intermediate risk for in-hospital mortality',
  interpretation_high: 'High risk for in-hospital mortality',
  interpretation_very_high: 'Very high risk for in-hospital mortality',
  
  // Clinical recommendations - Base
  recommendation_guideline_therapy: 'Guideline-directed medical therapy optimization',
  recommendation_fluid_monitoring: 'Close monitoring of fluid balance and daily weights',
  recommendation_vital_assessment: 'Regular assessment of vital signs and oxygen saturation',
  recommendation_precipitating_factors: 'Evaluation for precipitating factors and triggers',
  
  // Clinical recommendations - Low risk
  recommendation_standard_protocols: 'Standard heart failure management protocols',
  recommendation_early_discharge: 'Consider early discharge planning with HF education',
  recommendation_outpatient_followup: 'Outpatient cardiology follow-up within 7-14 days',
  recommendation_medication_reconciliation: 'Medication reconciliation and optimization',
  
  // Clinical recommendations - Intermediate risk
  recommendation_enhanced_monitoring: 'Enhanced inpatient monitoring with frequent assessments',
  recommendation_telemetry_consideration: 'Consider telemetry monitoring for arrhythmias',
  recommendation_nurse_navigator: 'HF nurse navigator involvement for care coordination',
  recommendation_close_followup: 'Discharge planning with close follow-up within 3-7 days',
  recommendation_biomarker_monitoring: 'Consider BNP/NT-proBNP trend monitoring',
  
  // Clinical recommendations - High risk
  recommendation_intensive_monitoring: 'Intensive monitoring with continuous telemetry',
  recommendation_early_consultation: 'Early cardiology consultation and co-management',
  recommendation_icu_consideration: 'Consider ICU monitoring if clinically indicated',
  recommendation_palliative_consult: 'Palliative care consultation for symptom management',
  recommendation_advance_directive: 'Advanced directive discussions with patient/family',
  recommendation_inotropic_support: 'Consider inotropic support if appropriate',
  
  // Clinical recommendations - Very high risk
  recommendation_icu_level_care: 'ICU-level monitoring and care recommended',
  recommendation_immediate_hf_consult: 'Immediate advanced heart failure consultation',
  recommendation_mechanical_support: 'Consider mechanical circulatory support evaluation',
  recommendation_goals_of_care: 'Palliative care consultation for goals of care',
  recommendation_family_meetings: 'Family meetings for end-of-life planning',
  recommendation_hospice_consideration: 'Consider hospice consultation if appropriate',
  recommendation_multidisciplinary_team: 'Multidisciplinary team involvement',
  
  // Algorithm validation
  algorithm_title: 'Enhanced GWTG-HF Algorithm',
  algorithm_description: '✓ AHA Get With The Guidelines Validated • Enhanced risk stratification with comprehensive clinical recommendations',
  
  // Risk reference ranges
  risk_reference_title: 'GWTG-HF Risk Score Reference',
  low_risk_range: 'Low Risk (≤25 points)',
  low_mortality: '<2% mortality risk',
  intermediate_risk_range: 'Intermediate Risk (26-35 points)',
  intermediate_mortality: '2-4% mortality risk',
  high_risk_range: 'High Risk (36-45 points)',
  high_mortality: '4-8% mortality risk',
  very_high_risk_range: 'Very High Risk (>45 points)',
  very_high_mortality: '>8% mortality risk',
  
  // Enhanced alert section
  enhanced_alert_title: 'Enhanced GWTG-HF Risk Assessment',
  enhanced_alert_description: 'Evidence-based in-hospital mortality risk prediction for heart failure patients. Validates risk stratification and guides intensive care decisions for optimal patient outcomes.',
  enhanced_alert_badge: 'AHA Get With The Guidelines Validated - Enhanced Risk Analysis',
  
  // Progress step labels
  progress_demographics: 'Demographics',
  progress_vital_signs: 'Vital Signs',
  progress_laboratory: 'Laboratory',
  
  // Action buttons
  new_assessment: 'New Assessment',
  modify_inputs: 'Modify Inputs',
  
  // Footer validation text
  footer_validation_text: '✓ AHA Get With The Guidelines Validated • Enhanced risk stratification with comprehensive clinical recommendations',
  footer_based_on: 'Based on AHA Get With The Guidelines-Heart Failure (GWTG-HF) Registry • Enhanced risk assessment',
  footer_guidelines_validated: 'Guidelines Validated',
  
  // Validation messages
  validation: {
    age_required: 'Age is required',
    age_range: 'Age must be between 18-120 years',
    race_required: 'Race is required',
    sbp_required: 'Systolic blood pressure is required',
    sbp_range: 'Systolic BP must be between 60-300 mmHg',
    bun_required: 'Blood urea nitrogen is required',
    bun_range: 'BUN must be between 5-200 mg/dL',
    sodium_required: 'Serum sodium is required',
    sodium_range: 'Sodium must be between 115-160 mEq/L',
    heart_rate_required: 'Heart rate is required',
    heart_rate_range: 'Heart rate must be between 30-200 bpm'
  },
  
  // From the Creator section
  from_creator_title: 'From the Creator',
  creator_name: 'Dr. Gregg C. Fonarow, MD',
  creator_title_role: 'Professor of Medicine & Director, Ahmanson-UCLA Cardiomyopathy Center',
  why_developed: 'Why GWTG-HF Was Developed',
  why_developed_text: 'Risk models help inform patient triage and treatment decisions. The GWTG-HF Score was developed using data from almost 200 US hospitals to provide objective prognostic information that guides appropriate monitoring and treatment for heart failure patients.',
  clinical_application: 'Clinical Application',
  clinical_application_text: 'The GWTG-HF risk score quantifies patient risk at the point of care, facilitating patient triage and encouraging evidence-based therapy in highest-risk patients. It helps increase use of recommended medical therapy in high-risk patients while reducing resource utilization in low-risk patients.',
  view_publications: 'View Dr. Fonarow\'s Publications',
  pubmed_link_text: 'PubMed',
  
  // Evidence section
  evidence_title: 'Evidence & Validation',
  formula_title: 'Formula',
  formula_description: 'Addition of lab and demographic values assigned point values.',
  score_interpretation_title: 'Score Interpretation',
  score_interpretation_ranges: [
    { range: '0-33', mortality: '<1%' },
    { range: '34-50', mortality: '1-5%' },
    { range: '51-57', mortality: '5-10%' },
    { range: '58-61', mortality: '10-15%' },
    { range: '62-65', mortality: '15-20%' },
    { range: '66-70', mortality: '20-30%' },
    { range: '71-74', mortality: '30-40%' },
    { range: '75-78', mortality: '40-50%' },
    { range: '≥79', mortality: '>50%' }
  ],
  validation_cohort: 'Validated in 39,783 patients from 198 hospitals in the GWTG-HF registry (2005-2007)',
  key_predictors: 'Key predictors: age, systolic blood pressure, BUN at admission, with additional contributions from heart rate, serum sodium, COPD presence, and race',
  ehealthrecords_validation: 'Further validated in 13,163 patients using electronic health record data',
  funding_note: 'GWTG-HF was supported in part by GlaxoSmithKline',
  original_reference: 'Original Reference',
  validation_reference: 'Validation Study'
};

export default gwtgHfRiskTranslations; 