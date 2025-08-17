export default {
  title: 'EuroSCORE II Risk Calculator',
  subtitle: 'European System for Cardiac Operative Risk Evaluation • Version 2 • 30-Day Mortality Prediction',
  description: 'Updated European system for cardiac operative risk evaluation providing 30-day mortality predictions. Validated across European centers with improved calibration over the original EuroSCORE model.',
  
  // Validation messages
  validation: {
    age_required: 'Age is required',
    age_range: 'Age must be between 18-120 years',
    gender_required: 'Gender is required',
    urgency_required: 'Urgency is required',
    nyha_required: 'NYHA class is required',
    procedure_weight_required: 'Procedure weight/complexity is required',
    creatinine_required: 'Creatinine is required',
    creatinine_range: 'Creatinine must be between 0.5-15 mg/dL',
    creatinine_clearance_required: 'Creatinine clearance is required',
    lv_function_required: 'LV function is required',
    pa_pressure_required: 'Pulmonary artery pressure is required'
  },
  
  // Alert section
  alert_title: 'EuroSCORE II - European Cardiac Surgery Risk Model',
  alert_description: 'Updated European system for cardiac operative risk evaluation providing 30-day mortality predictions. Validated across European centers with improved calibration over the original EuroSCORE model.',
  alert_validation: 'Nashef et al. - European Validation - Updated Algorithm',
  
  // Progress steps
  step_patient_factors: 'Patient Factors',
  step_cardiac_status: 'Cardiac Status',
  step_operative_factors: 'Operative Factors',
  step_procedures: 'Procedures',
  
  // Section headers
  section_patient_demographics: 'Patient Demographics & Basic Factors',
  section_patient_description: 'Basic patient characteristics and laboratory values',
  section_cardiac_factors: 'Cardiac-Related Factors',
  section_cardiac_description: 'Cardiac history, symptoms, and functional status',
  section_operative_factors: 'Operative Factors',
  section_operative_description: 'Procedure complexity and critical preoperative conditions',
  section_valve_procedures: 'Valve Procedures',
  section_specific_cardiac_procedures: 'Specific Cardiac Procedures',
  section_specific_procedures_description: 'Individual valve and surgical procedure specifications',
  
  // Demographics fields
  age_label: 'Age',
  age_placeholder: '65',
  age_unit: 'years',
  gender_label: 'Gender',
  gender_placeholder: 'Select gender...',
  gender_male: 'Male',
  gender_female: 'Female',
  gender_description: 'Select patient gender',
  gender_male_description: 'Male patient',
  gender_female_description: 'Female patient',
  creatinine_label: 'Serum Creatinine',
  creatinine_placeholder: '1.0',
  creatinine_unit: 'mg/dL',
  
  // Additional risk factors section
  additional_risk_factors: 'Additional Patient Risk Factors',
  poor_mobility_label: 'Poor Mobility',
  poor_mobility_description: 'Impaired mobility affecting daily activities',
  diabetes_insulin_label: 'Diabetes on Insulin',
  diabetes_insulin_description: 'Diabetes mellitus requiring insulin therapy',
  chronic_pulmonary_label: 'Chronic Pulmonary Disease',
  chronic_pulmonary_description: 'COPD or other chronic lung conditions',
  pvd_label: 'Peripheral Vascular Disease',
  pvd_description: 'Peripheral arterial disease or claudication',
  
  // NYHA and cardiac factors
  nyha_label: 'NYHA Functional Class',
  nyha_placeholder: 'Select NYHA class...',
  nyha_description: 'New York Heart Association functional classification',
  nyha_class_1: 'Class I - No symptoms',
  nyha_class_2: 'Class II - Slight limitation',
  nyha_class_3: 'Class III - Marked limitation',
  nyha_class_4: 'Class IV - Severe limitation',
  nyha_class_1_full: 'Class I: no symptoms on moderate exertion',
  nyha_class_2_full: 'Class II: symptoms on moderate exertion',
  nyha_class_3_full: 'Class III: symptoms on light exertion',
  nyha_class_4_full: 'Class IV: symptoms at rest',
  nyha_class_1_description: 'No limitation of physical activity',
  nyha_class_2_description: 'Slight limitation of physical activity',
  nyha_class_3_description: 'Marked limitation of physical activity',
  nyha_class_4_description: 'Unable to carry out any physical activity without discomfort',
  
  urgency_label: 'Urgency',
  urgency_placeholder: 'Select urgency...',
  urgency_elective: 'Elective',
  urgency_urgent: 'Urgent',
  urgency_emergency: 'Emergency',
  
  // Cardiac conditions
  cardiac_history_title: 'Cardiac History & Conditions',
  recent_mi_label: 'Recent MI (within 90 days)',
  recent_mi_description: 'Myocardial infarction within 90 days',
  unstable_angina_label: 'Unstable Angina',
  unstable_angina_description: 'Rest angina requiring IV nitrates',
  pulmonary_hypertension_label: 'Pulmonary Hypertension',
  pulmonary_hypertension_description: 'Systolic PA pressure > 60 mmHg',
  extracardiac_arteriopathy_label: 'Extracardiac Arteriopathy',
  extracardiac_arteriopathy_description: 'Claudication, carotid occlusion, or stroke',
  neurological_dysfunction_label: 'Neurological Dysfunction',
  neurological_dysfunction_description: 'Disease severely affecting ambulation or day-to-day functioning',
  previous_cardiac_surgery_label: 'Previous Cardiac Surgery',
  previous_cardiac_surgery_description: 'Prior cardiac surgical procedure',
  active_endocarditis_label: 'Active Endocarditis',
  active_endocarditis_description: 'Patient still under antibiotic treatment for endocarditis',
  
  // Operative factors
  procedure_weight_label: 'Procedure Weight/Complexity',
  procedure_weight_placeholder: 'Select procedure complexity...',
  procedure_weight_low: 'Low complexity (CABG only, single valve)',
  procedure_weight_medium: 'Medium complexity (CABG + valve, double valve)',
  procedure_weight_high: 'High complexity (multiple procedures, complex repairs)',
  
  critical_preoperative_label: 'Critical Preoperative State',
  critical_preoperative_description: 'Ventricular tachycardia or ventricular fibrillation or aborted sudden death, preoperative cardiac massage, preoperative ventilation before anesthetic room, preoperative inotropic support, intra-aortic balloon counterpulsation or preoperative acute renal failure (anuria or oliguria < 10 ml/hour)',
  
  critical_conditions_header: 'Critical Preoperative Conditions',
  
  // Procedure complexity info box
  complexity_info_title: 'EuroSCORE II Procedure Complexity',
  complexity_low_info: '• Low: Single valve replacement, CABG only',
  complexity_medium_info: '• Medium: CABG + valve, double valve procedures',
  complexity_high_info: '• High: Multiple valve + CABG, complex aortic surgery, salvage procedures',
  
  // Valve procedures
  aortic_surgery_label: 'Aortic Surgery',
  aortic_surgery_description: 'Aortic valve replacement or repair',
  mitral_surgery_label: 'Mitral Surgery',
  mitral_surgery_description: 'Mitral valve replacement or repair',
  tricuspid_surgery_label: 'Tricuspid Surgery',
  tricuspid_surgery_description: 'Tricuspid valve replacement or repair',
  pulmonary_surgery_label: 'Pulmonary Surgery',
  pulmonary_surgery_description: 'Pulmonary valve replacement or repair',
  
  // Risk assessment info
  risk_assessment_title: 'EuroSCORE II Risk Assessment',
  risk_assessment_complexity: '• Each specific procedure adds to the overall surgical complexity',
  risk_assessment_multiple: '• Multiple valve procedures significantly increase operative risk',
  risk_assessment_combined: '• Consider combined procedures when calculating final risk',
  
  // Navigation buttons
  next_cardiac_status: 'Next: Cardiac Status',
  next_operative_factors: 'Next: Operative Factors',
  next_specific_procedures: 'Next: Specific Procedures',
  back_button: 'Back',
  calculate_euroscore_ii: 'Calculate EuroSCORE II',
  
  // Results section
  results_title: 'EuroSCORE II Assessment Results',
  mortality_risk_30day: '30-Day Mortality Risk',
  predicted_mortality: 'Predicted 30-Day Mortality',
  risk_stratification: 'EuroSCORE II Risk Stratification',
  
  // Risk categories and interpretations
  risk_low: 'Low Risk',
  risk_intermediate: 'Intermediate',
  risk_high: 'High Risk',
  risk_very_high: 'Very High',
  
  // Risk category full labels
  risk_low_full: 'Low Risk',
  risk_intermediate_full: 'Intermediate Risk',
  risk_high_full: 'High Risk',
  risk_very_high_full: 'Very High Risk',
  
  // Risk level descriptions
  good_surgical_candidate: 'Good surgical candidate',
  requires_careful_evaluation: 'Requires careful evaluation',
  extensive_risk_benefit_analysis: 'Extensive risk-benefit analysis needed',
  
  mortality_low: '< 2% Mortality',
  mortality_intermediate: '2-5% Mortality',
  mortality_high: '5-10% Mortality',
  mortality_very_high: '> 10% Mortality',
  
  interpretation_low: 'Low operative risk (EuroSCORE II <2%)',
  interpretation_intermediate: 'Intermediate operative risk (EuroSCORE II 2-5%)',
  interpretation_high: 'High operative risk (EuroSCORE II 5-10%)',
  interpretation_very_high: 'Very high operative risk (EuroSCORE II >10%)',
  
  // STS Comparison
  sts_comparison_title: 'Comparison with STS Risk Models',
  sts_comparison_low: 'Generally correlates with STS low risk (<2%). Both models support standard surgical approach.',
  sts_comparison_intermediate: 'Similar to STS intermediate risk (2-5%). Enhanced monitoring and optimization recommended.',
  sts_comparison_high: 'Comparable to STS high risk (5-10%). Consider heart team evaluation and alternatives.',
  sts_comparison_very_high: 'Aligns with STS very high risk (>10%). Strong consideration for non-surgical options.',
  sts_comparison_default: 'Risk assessment comparison with STS models recommended.',
  
  // Clinical recommendations
  clinical_recommendations: 'Clinical Management Recommendations',
  
  // Base recommendations
  recommendation_team_evaluation: 'Multidisciplinary heart team evaluation',
  recommendation_preop_optimization: 'Pre-operative optimization as indicated',
  recommendation_counseling: 'Patient and family counseling on risks',
  
  // Low risk recommendations
  recommendation_standard_approach: 'Standard surgical approach appropriate',
  recommendation_fast_track: 'Consider fast-track protocols',
  recommendation_routine_care: 'Routine post-operative care',
  
  // Intermediate risk recommendations
  recommendation_enhanced_assessment: 'Enhanced pre-operative assessment',
  recommendation_additional_imaging: 'Consider additional imaging studies',
  recommendation_standard_icu: 'Standard ICU monitoring',
  recommendation_risk_modification: 'Review for risk factor modification',
  
  // High risk recommendations
  recommendation_alternative_approaches: 'Consider alternative approaches (TAVI, medical therapy)',
  recommendation_extensive_optimization: 'Extensive pre-operative optimization',
  recommendation_extended_icu: 'Extended ICU monitoring planned',
  recommendation_informed_consent: 'Detailed informed consent discussion',
  recommendation_less_invasive: 'Consider less invasive alternatives',
  
  // Very high risk recommendations
  recommendation_non_surgical: 'Strongly consider non-surgical alternatives',
  recommendation_palliative_care: 'Palliative care consultation',
  recommendation_goals_care: 'Goals of care discussion',
  recommendation_high_risk_protocols: 'If surgery pursued, high-risk protocols',
  recommendation_transcatheter: 'Consider transcatheter approaches',
  recommendation_family_meeting: 'Family meeting essential',
  
  // Validation status
  validation_status_title: 'EuroSCORE II Validation Status',
  validation_status_text: '✓ European Validation • Nashef et al. 2012 • Updated Algorithm • Improved Calibration',
  
  // Action buttons
  new_assessment: 'New Assessment',
  modify_inputs: 'Modify Inputs',
  calculate_button: 'Calculate EuroSCORE II',
  new_assessment_button: 'New Assessment',
  modify_inputs_button: 'Modify Inputs',
  
  // Results display labels
  mortality_risk_title: '30-Day Mortality Risk',
  risk_stratification_title: 'EuroSCORE II Risk Stratification',
  clinical_recommendations_title: 'Clinical Management Recommendations',
  predicted_mortality_label: 'Predicted 30-Day Mortality',
  risk_label: 'Risk',
  
  // Risk category labels for display
  low_risk_label: 'Low Risk',
  intermediate_risk_label: 'Intermediate Risk', 
  high_risk_label: 'High Risk',
  very_high_risk_label: 'Very High Risk',
  
  // Risk category ranges
  low_risk_range: '< 2%',
  intermediate_risk_range: '2-5%',
  high_risk_range: '5-10%',
  very_high_risk_range: '> 10%',
  
  // Validation status
  validation_badge: 'European Validation',
  footer_info: 'Based on EuroSCORE II by Nashef et al. • For educational purposes only',
  
  // Footer
  footer_text: 'Based on EuroSCORE II by Nashef et al. • For educational purposes only',
  european_validation: 'European Validation',
  
  // Creator section
  creator: {
    title: 'About the Creator',
    name: 'Dr. Samer A. M. Nashef',
    about: 'Dr. Samer A. M. Nashef, MB ChB, FRCS, PhD, is a cardiothoracic surgeon at the Papworth Hospital in Cambridge, UK.',
    research: 'Dr. Nashef\'s primary research is focused on atrial fibrillation and risk stratification in cardiac surgery.',
    view_publications: 'View Publications on PubMed'
  },
  
  // Evidence section
  evidence: {
    title: 'Evidence',
    formula_title: 'FORMULA',
    coefficients_note: 'Coefficients Table',
    coefficients_description: 'The EuroSCORE II model uses multiple patient, cardiac, and procedural factors with specific coefficients to calculate predicted mortality risk.',
    literature_title: 'Literature',
    original_reference: 'Original/Primary Reference',
    validation_studies: 'Validation'
  },
  
  // Live Risk Preview
  live_risk_preview: 'Live Risk Preview',
  updates_as_complete: 'Updates as you complete the form',
  
  // Progress indicators
  completion_progress: 'Completion Progress',
  sections_completed: 'sections completed',
  patient_section: 'Patient',
  cardiac_section: 'Cardiac',
  operative_section: 'Operative',
  
  // Specific form labels that were hardcoded
  creatinine_clearance_label: 'Creatinine Clearance (Cockcroft-Gault)',
  creatinine_clearance_placeholder: 'Select creatinine clearance...',
  creatinine_clearance_description: 'Kidney function assessment using Cockcroft-Gault formula',
  creatinine_normal: 'Normal kidney function',
  creatinine_mild: 'Mildly reduced kidney function',
  creatinine_moderate: 'Moderately to severely reduced kidney function',
  creatinine_dialysis: 'Patient requiring dialysis treatment',
  creatinine_clearance_gt85: '>85 mL/min',
  creatinine_clearance_51_85: '51-85 mL/min',
  creatinine_clearance_le50: '≤50 mL/min',
  creatinine_clearance_dialysis: 'On dialysis (regardless of serum creatinine)',
  
  lv_function_label: 'LV Function or LVEF',
  lv_function_placeholder: 'Select LV function...',
  lv_function_description: 'Choose left ventricular ejection fraction category',
  lv_function_good: 'Good (LVEF ≥51%)',
  lv_function_good_description: 'Normal left ventricular systolic function',
  lv_function_moderate: 'Moderate (LVEF 31-50%)',
  lv_function_moderate_description: 'Mildly reduced left ventricular function',
  lv_function_poor: 'Poor (LVEF 21-30%)',
  lv_function_poor_description: 'Moderately reduced left ventricular function',
  lv_function_very_poor: 'Very poor (LVEF ≤20%)',
  lv_function_very_poor_description: 'Severely reduced left ventricular function',
  
  // Pulmonary artery pressure
  pa_pressure_label: 'Pulmonary Artery Systolic Pressure',
  pa_pressure_placeholder: 'Select PA pressure...',
  pa_pressure_description: 'Pulmonary artery systolic pressure measurement',
  pa_pressure_normal: 'Normal pulmonary artery pressure',
  pa_pressure_mild: 'Mildly elevated pulmonary artery pressure',
  pa_pressure_severe: 'Severely elevated pulmonary artery pressure',
  pa_pressure_lt31: '<31 mmHg',
  pa_pressure_31_54: '31-54 mmHg',
  pa_pressure_ge55: '≥55 mmHg',
  
  // CCS and other cardiac conditions
  ccs_class4_label: 'CCS Class 4 Angina',
  ccs_class4_description: 'Inability to perform any activity without angina or angina at rest',
  extracardiac_arteriopathy_description_detailed: '≥1 of: claudication; carotid occlusion or >50% stenosis; amputation for arterial disease; previous/planned intervention on abdominal aorta, limb arteries, or carotids',
  previous_cardiac_surgery_description_detailed: '≥1 previous major cardiac operation involving opening the pericardium',
  active_endocarditis_description_detailed: 'On antibiotics for endocarditis at time of surgery',
  recent_mi_description_detailed: 'Myocardial infarction ≤90 days before operation',
  
  // Urgency levels
  urgency_description: 'Classification of surgical urgency',
  urgency_elective_description: 'Planned surgery with optimal timing',
  urgency_urgent_description: 'Surgery required during current hospitalization',
  urgency_emergency_description: 'Surgery required within 24 hours',
  urgency_salvage_description: 'Patients requiring CPR immediately before or during surgery',
  urgency_elective_full: 'Elective: routine admission for operation',
  urgency_urgent_full: 'Urgent: not electively admitted but require surgery on current admission',
  urgency_emergency_full: 'Emergency: operation before the beginning of the next working day',
  urgency_salvage_full: 'Salvage: patients requiring CPR en route to OR or before induction',
  
  // Procedure weight
  weight_of_procedure_label: 'Weight of Procedure',
  weight_of_procedure_placeholder: 'Select procedure weight...',
  procedure_complexity_classification: 'Classification of surgical complexity',
  isolated_cabg: 'Isolated CABG',
  isolated_cabg_description: 'Coronary artery bypass grafting only',
  isolated_non_cabg: 'Isolated non-CABG major procedure (e.g. single valve)',
  isolated_non_cabg_description: 'Single major cardiac procedure excluding CABG',
  two_major: '2 major procedures (e.g. CABG and AVR)',
  two_major_description: 'Two major cardiac procedures combined',
  three_plus_major: '≥3 major procedures (e.g. AVR, MVR, and CABG)',
  three_plus_major_description: 'Three or more major cardiac procedures',
  
  // Critical preoperative state
  critical_preoperative_state_label: 'Critical Preoperative State',
  critical_preoperative_state_description_detailed: '≥1 of: ventricular tachycardia or fibrillation or aborted sudden death; cardiac massage; ventilation before arrival to OR; inotropes; IABP or VAD before arrival to OR; acute renal failure (anuria or oliguria <10 mL/hr)',
  
  // Thoracic aorta
  thoracic_aorta_label: 'Thoracic Aorta Surgery',
  thoracic_aorta_description: 'Surgery involving the thoracic aorta',
  
  // Progress steps detailed
  patient_factors: 'Patient Factors',
  cardiac_factors: 'Cardiac Factors',
  operative_factors: 'Operative Factors',
  
  // Next button text
  next_operative_factors_full: 'Next: Operative Factors',
  
  // Calculation messages
  calculating: 'Calculating Risk Assessment',
  analyzing_patient_factors: 'Analyzing patient risk factors...',
  calculating_cardiac_indices: 'Calculating cardiac risk indices...',
  applying_euroscore_algorithm: 'Applying EuroSCORE II algorithm...',
  generating_recommendations: 'Generating clinical recommendations...',
  initializing_assessment: 'Initializing assessment...',
  
  // Results section detailed
  clinical_grade_assessment: 'Clinical Grade Assessment',
  risk_stratification_analysis: 'Risk Stratification Analysis',
  population_based_categorization: 'Population-based risk categorization',
  excellent_surgical_candidate: 'Excellent surgical candidate',
  moderate_surgical_risk: 'Moderate surgical risk',
  enhanced_perioperative_care: 'Enhanced perioperative care',
  multidisciplinary_evaluation: 'Multidisciplinary evaluation',
  
  // Comparative analysis
  comparative_risk_analysis: 'Comparative Risk Analysis',
  euroscore_vs_population: 'EuroSCORE II vs Population Benchmarks',
  risk_comparison_chart: 'Risk Comparison Chart',
  mortality_risk_percent: '30-Day Mortality Risk (%)',
  population_average: 'Population Average',
  your_patient: 'Your Patient',
  low_risk_cohort: 'Low Risk Cohort',
  high_risk_cohort: 'High Risk Cohort',
  
  // Risk model comparison
  risk_model_comparison: 'Risk Model Comparison',
  euroscore_ii_current: 'EuroSCORE II',
  current_label: 'Current',
  sts_risk_score: 'STS Risk Score',
  reference_label: 'Reference',
  mortality_risk_result: '30-day mortality risk',
  latest_european_algorithm: 'Latest European algorithm (2012), validated on 22,381 patients',
  north_american_standard: 'North American standard, Society of Thoracic Surgeons database',
  
  // Clinical significance
  clinical_significance: 'Clinical Significance',
  excellent_surgical_candidate_full: 'Excellent surgical candidate with minimal perioperative risk',
  standard_surgical_risk: 'Standard surgical risk requiring routine perioperative monitoring',
  elevated_risk_enhanced_care: 'Elevated risk requiring enhanced perioperative care and monitoring',
  high_risk_specialized_care: 'High-risk patient requiring specialized multidisciplinary care',
  
  // Scientific foundation
  scientific_foundation: 'Scientific Foundation',
  evidence_based_validation: 'Evidence-based algorithm validation',
  algorithm_validation: 'Algorithm Validation',
  validated_on_patients: 'Validated on 22,381 patients',
  c_index_excellent: 'C-index: 0.8095 (excellent discrimination)',
  multiple_international_validations: 'Multiple international validations',
  key_validation_studies: 'Key Validation Studies',
  original_development: 'Original Development (2012)',
  international_validation: 'International Validation (2013)',
  nashef_reference: 'Nashef SA, et al. EuroSCORE II. Eur J Cardiothorac Surg. 2012;41(4):734-44.',
  chalmers_reference: 'Chalmers J, et al. Validation of EuroSCORE II in a modern cohort. Eur J Cardiothorac Surg. 2013;43(4):688-94.',
  
  // Professional actions
  new_assessment_action: 'New Assessment',
  print_results: 'Print Results',
  
  // Results subtitle
  results_subtitle: 'EuroSCORE II Risk Assessment • Professional Clinical Analysis',
  
  // Formula text
  formula_prediction: 'Predicted mortality = e^y / (1 + e^y)',
  formula_where_y: 'Where y = -5.324537 + Σ βᵢxᵢ',
  
  validation_status_description: '✓ European Validation • Nashef et al. 2012 • Updated Algorithm • Improved Calibration'
}; 