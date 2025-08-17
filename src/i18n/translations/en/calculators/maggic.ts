export default {
  title: 'MAGGIC Risk Calculator',
  subtitle: 'Meta-Analysis Global Group In Chronic Heart Failure • 1-3 Year Mortality Risk',
  description: 'Evidence-based prognostic tool for chronic heart failure mortality risk using large-scale meta-analysis data.',
  
  // Alert section
  alert_title: 'MAGGIC Risk Assessment Tool',
  alert_description: 'Meta-Analysis Global Group in Chronic Heart Failure (MAGGIC) risk calculator provides evidence-based mortality prediction for patients with chronic heart failure. This tool is validated across diverse patient populations and helps guide clinical decision-making and prognosis discussions.',
  
  // Step labels
  demographics_step: 'Demographics',
  clinical_step: 'Clinical Assessment',
  therapy_step: 'Therapy Assessment',
  
  // Demographics section
  patient_demographics: 'Patient Demographics',
  demographics_description: 'Basic patient demographic and clinical characteristics',
  age_label: 'Age',
  age_placeholder: 'Enter age in years',
  gender_label: 'Gender',
  gender_placeholder: 'Select gender',
  gender_male: 'Male',
  gender_female: 'Female',
  lvef_label: 'Left Ventricular Ejection Fraction (LVEF)',
  lvef_placeholder: 'Enter LVEF percentage',
  nyha_class_label: 'NYHA Functional Class',
  nyha_class_placeholder: 'Select NYHA class',
  nyha_class_1: 'Class I - No limitation',
  nyha_class_2: 'Class II - Slight limitation',
  nyha_class_3: 'Class III - Marked limitation',
  nyha_class_4: 'Class IV - Severe limitation',
  
  // Clinical assessment section
  clinical_assessment: 'Clinical Assessment',
  clinical_description: 'Current vital signs, laboratory values, and comorbidity status',
  systolic_bp_label: 'Systolic Blood Pressure',
  systolic_bp_placeholder: 'Enter systolic BP',
  bmi_label: 'Body Mass Index (BMI)',
  bmi_placeholder: 'Enter BMI',
  creatinine_label: 'Serum Creatinine',
  creatinine_placeholder: 'Enter creatinine level',
  comorbidities_section: 'Comorbidities',
  diabetes_label: 'Diabetes Mellitus',
  copd_label: 'Chronic Obstructive Pulmonary Disease (COPD)',
  first_diagnosis_label: 'Heart failure first diagnosed >18 months ago',
  
  // Therapy assessment section
  therapy_assessment: 'Current Therapy Assessment',
  therapy_description: 'Current guideline-directed medical therapy status',
  gdmt_section: 'Guideline-Directed Medical Therapy',
  beta_blocker_label: 'Beta-blocker therapy',
  ace_inhibitor_label: 'ACE inhibitor or ARB therapy',
  
  // Button labels
  next_clinical_assessment: 'Next: Clinical Assessment',
  next_therapy_assessment: 'Next: Therapy Assessment',
  calculate_maggic_risk: 'Calculate MAGGIC Risk',
  new_assessment_button: 'New Assessment',
  
  // Validation messages
  validation_age: 'Please enter a valid age between 18 and 100 years',
  validation_gender: 'Please select gender',
  validation_nyha_class: 'Please select NYHA functional class',
  validation_lvef: 'Please enter a valid LVEF between 10% and 80%',
  validation_systolic_bp: 'Please enter a valid systolic BP between 70 and 250 mmHg',
  validation_bmi: 'Please enter a valid BMI between 15 and 50 kg/m²',
  validation_creatinine: 'Please enter a valid creatinine between 0.5 and 10.0 mg/dL',
  
  // Results section
  results_title: 'MAGGIC Risk Assessment Results',
  one_year_mortality: '1-Year Mortality Risk',
  three_year_mortality: '3-Year Mortality Risk',
  risk_stratification_title: 'Risk Stratification Categories',
  low_risk_category: 'Low Risk (<10% 1-year)',
  intermediate_risk_category: 'Intermediate Risk (10-19% 1-year)',
  high_risk_category: 'High Risk (20-34% 1-year)',
  very_high_risk_category: 'Very High Risk (≥35% 1-year)',
  mortality_rates_note: '* Mortality rates based on MAGGIC consortium meta-analysis of >39,000 patients',
  recommendations_title: 'Clinical Management Recommendations',
  algorithm_validation_title: 'MAGGIC Algorithm Validation',
  algorithm_validation_text: '✓ Validated in >39,000 HF patients • Meta-analysis derived • Comprehensive risk assessment',
  
  // About Creator section
  about_creator_title: 'About the Creator',
  creator_name: 'Dr. Stuart Pocock',
  creator_description: 'Stuart Pocock, PhD, is a professor of medical statistics at the London School of Hygiene and Tropical Medicine. Dr. Pocock is a director of multiple research groups investigating epidemiology and pharmacoepidemiology. He has published many papers on major trials he has conducted, especially in cardiovascular disease.',
  view_publications: 'View Dr. Stuart Pocock\'s Publications',
  pubmed_link_text: 'PubMed',
  
  // Evidence section
  evidence_title: 'Evidence',
  formula_title: 'Formula',
  formula_description: 'Addition of selected points.',
  facts_figures_title: 'Facts & Figures',
  
  // Risk factor tables
  risk_factor_title: 'Risk Factor',
  points_title: 'Points',
  
  // Basic risk factors
  male_factor: 'Male',
  smoker_factor: 'Smoker',
  diabetic_factor: 'Diabetic',
  copd_factor: 'COPD',
  heart_failure_18_months: 'Heart failure first diagnosed ≥18 months ago',
  not_on_beta_blocker: 'Not on beta blocker',
  not_on_ace_arb: 'Not on ACE-I/ARB',
  
  // Ejection fraction ranges
  ejection_fraction_title: 'Ejection fraction (EF)',
  ef_less_than_20: '<20',
  ef_20_24: '20-24',
  ef_25_29: '25-29',
  ef_30_34: '30-34',
  ef_35_39: '35-39',
  ef_40_plus: '≥40',
  
  // NYHA class
  nyha_class_title: 'NYHA class',
  nyha_1: '1',
  nyha_2: '2',
  nyha_3: '3',
  nyha_4: '4',
  
  // Creatinine ranges
  creatinine_title: 'Creatinine*',
  creatinine_less_90: '<90',
  creatinine_90_109: '90-109',
  creatinine_110_129: '110-129',
  creatinine_130_149: '130-149',
  creatinine_150_169: '150-169',
  creatinine_170_209: '170-209',
  creatinine_210_249: '210-249',
  creatinine_250_plus: '≥250',
  
  // BMI ranges
  bmi_title: 'BMI',
  bmi_less_15: '<15',
  bmi_15_19: '15-19',
  bmi_20_24: '20-24',
  bmi_25_29: '25-29',
  bmi_30_plus: '≥30',
  
  // Systolic BP extra points for different EF ranges
  systolic_bp_ef_less_30_title: 'Extra for systolic BP (mm Hg) if EF <30',
  systolic_bp_ef_30_39_title: 'Extra for systolic BP (mm Hg) if EF 30-39',
  systolic_bp_ef_40_plus_title: 'Extra for systolic BP (mm Hg) if EF ≥40',
  
  // BP ranges
  bp_less_110: '<110',
  bp_110_119: '110-119',
  bp_120_129: '120-129',
  bp_130_139: '130-139',
  bp_140_149: '140-149',
  bp_150_plus: '≥150',
  
  // Age extra points for different EF ranges
  age_ef_less_30_title: 'Extra for age (years) if EF <30',
  age_ef_30_39_title: 'Extra for age (years) if EF 30-39',
  age_ef_40_plus_title: 'Extra for age (years) if EF ≥40',
  
  // Age ranges
  age_less_55: '<55',
  age_55_59: '55-59',
  age_60_64: '60-64',
  age_65_69: '65-69',
  age_70_74: '70-74',
  age_75_79: '75-79',
  age_80_plus: '≥80',
  
  // Creatinine note
  creatinine_note: '*Note: while this score uses creatinine as a proxy for renal function, eGFR is generally considered a more accurate indicator.',
  
  // Evidence Appraisal section
  evidence_appraisal_title: 'Evidence Appraisal',
  evidence_appraisal_description: 'The Meta-Analysis Global Group in Chronic Heart Failure (MAGGIC) Risk Calculator was developed by an international group of researchers led by Pocock et al based on a database of 39,372 patients from 30 cohort studies (of which 6 were randomized clinical trials, accounting for approximately 24,000 patients).',
  poisson_regression_description: 'A Poisson regression model was built to identify 13 risk factors contributing to mortality in patients with heart failure. Comparisons of observed and expected 3-year mortality rates across all 30 studies showed acceptable goodness-of-fit. Two separate models were used for preserved versus reduced ejection fraction (EF).',
  subsequent_study_description: 'A subsequent study by Freed et al (2016) showed that for 308 patients with heart failure with preserved EF, a higher MAGGIC risk score was associated with more adverse events.',
  validation_note: 'The data have not yet been externally validated for reduced EF.',
  
  // Literature section
  literature_title: 'Literature',
  original_reference_title: 'Original/Primary Reference',
  validation_title: 'Validation',
  other_references_title: 'Other References',
  
  // Primary reference
  primary_reference_title: 'Research Paper',
  primary_reference_citation: 'Pocock SJ et al. Predicting survival in heart failure: a risk score based on 39 372 patients from 30 studies. Eur Heart J. 2013 May;34(19):1404-13. doi: 10.1093/eurheartj/ehs337. Epub 2012 Oct 24.',
  
  // Validation reference
  validation_reference_title: 'Research Paper',
  validation_reference_citation: 'Freed BH, Daruwalla V, Cheng JY, Aguilar FG, Beussink L, Choi A, Klein DA, Dixon D, Baldridge A, Rasmussen-Torvik LJ, Maganti K, Shah SJ. Prognostic Utility and Clinical Significance of Cardiac Mechanics in Heart Failure With Preserved Ejection Fraction: Importance of Left Atrial Strain. Circ Cardiovasc Imaging. 2016 Mar;9(3). pii: e003754. doi: 10.1161/CIRCIMAGING.115.003754.',
  
  // Other references
  other_reference_1_title: 'Research Paper',
  other_reference_1_citation: 'Meta-analysis Global Group in Chronic Heart Failure (MAGGIC). The survival of patients with heart failure with preserved or reduced left ventricular ejection fraction: an individual patient data meta-analysis. Eur Heart J. 2012 Jul;33(14):1750-7. doi: 10.1093/eurheartj/ehr254. Epub 2011 Aug 6.',
  
  other_reference_2_title: 'Research Paper',
  other_reference_2_citation: 'Nanayakkara S, Kaye DM. Management of heart failure with preserved ejection fraction: a review. Clin Ther. 2015 Oct 1;37(10):2186-98. doi: 10.1016/j.clinthera.2015.08.005. Epub 2015 Sep 16.',
  
  other_reference_3_title: 'Research Paper',
  other_reference_3_citation: 'Chapter 1: Definition and classification of CKD. Kidney Int Suppl (2011). 2013;3(1):19-62.',
  
  // Missing UI translations
  reset_calculator: 'Reset Calculator',
  about_title: 'About MAGGIC Calculator',
  about_subtitle: 'Understanding the MAGGIC Risk Model',
  about_description: 'The MAGGIC Risk Calculator is a validated tool for predicting mortality risk in patients with chronic heart failure. This calculator is based on a comprehensive meta-analysis of over 39,000 patients from 30 studies.',
  feature_1: 'Validated in 39,372 patients from 30 studies',
  feature_2: 'Predicts 1-year and 3-year mortality risk',
  feature_3: 'Comprehensive risk factor assessment',
  feature_4: 'Evidence-based clinical recommendations',
  tables_title: 'Risk Factor Tables',
  formula_note: 'Formula based on addition of points from risk factors and patient characteristics',
  secondary_reference_title: 'Secondary Reference',
  
  // Step labels
  step_1_label: 'Step 1',
  step_2_label: 'Step 2',
  step_3_label: 'Step 3',
  
  // UI labels
  diabetes_label_description: 'History of diabetes mellitus',
  copd_label_description: 'COPD or severe lung disease',
  smoker_label_text: 'Smoker',
  smoker_label_description: 'Current or former smoker',
  first_diagnosis_label_description: 'Chronic heart failure (>18 months ago)',
  
  // Ejection Fraction Table
  ef_title: 'Ejection Fraction (%)',
  ef_less_20: '<20',
  
  // NYHA Class descriptions
  nyha_1_description: 'No limitation',
  nyha_2_description: 'Slight limitation',
  nyha_3_description: 'Marked limitation',
  nyha_4_description: 'Severe limitation',
  
  // Research validation texts
  foundational_research: 'Foundational research and validation studies.',
  rigorous_validation: 'Rigorous validation across multiple cohorts'
}; 