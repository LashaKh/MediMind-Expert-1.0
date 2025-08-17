export const grace2Translations = {
  title: "GRACE 2.0 Risk Calculator",
  subtitle: "Acute Coronary Syndrome Risk Assessment",
  description: "Global Registry of Acute Coronary Events - risk stratification for patients with NSTEMI/UA and STEMI.",
  calculate_button: "Calculate GRACE Score",
  risk_category: "Risk category",
  recommendations: "Clinical recommendations",
  low_risk: "Low risk (<109)",
  high_risk: "High risk (>140)",
  intermediate_risk: "Intermediate risk (109-140)",
  
  // Patient demographics
  age_label: "Age (years)",
  age_placeholder: "Enter patient age",
  heart_rate_label: "Heart rate (bpm)",
  heart_rate_placeholder: "Enter heart rate",
  systolic_bp_label: "Systolic blood pressure (mmHg)",
  systolic_bp_placeholder: "Enter systolic pressure",
  creatinine_label: "Serum creatinine (mg/dL)",
  creatinine_placeholder: "Enter creatinine level",
  
  // Clinical characteristics
  killip_class_label: "Killip classification",
  killip_class_1: "Class I (no heart failure)",
  killip_class_2: "Class II (mild heart failure, rales)",
  killip_class_3: "Class III (pulmonary edema)",
  killip_class_4: "Class IV (cardiogenic shock)",
  
  cardiac_arrest_label: "Cardiac arrest at admission",
  st_deviation_label: "ST segment deviation",
  elevated_markers_label: "Elevated cardiac markers",
  
  // Section headers
  demographics_section: "Patient Demographics",
  clinical_section: "Clinical Presentation",
  labs_section: "Laboratory Values",
  
  // Results
  in_hospital_mortality: "In-hospital mortality",
  one_year_mortality: "1-year mortality",
  invasive_strategy: "Invasive strategy",
  recommendation: "Treatment recommendation",
  
  // Validation messages
  age_error: "Age must be between 18-120 years",
  heart_rate_error: "Heart rate must be between 30-300 bpm",
  systolic_bp_error: "Systolic blood pressure must be between 60-300 mmHg",
  creatinine_error: "Creatinine must be between 0.3-15.0 mg/dL",
  
  // Strategy and recommendation texts
  strategy_conservative: "Conservative management appropriate",
  strategy_early_invasive: "Early invasive strategy within 24-72 hours",
  strategy_urgent_invasive: "Urgent invasive strategy within 2-24 hours",
  recommendation_low: "Medical therapy, consider invasive if refractory symptoms",
  recommendation_intermediate: "Consider early catheterization and revascularization",
  recommendation_high: "Immediate catheterization and revascularization if indicated",
  
  // Results section labels
  results_title: "GRACE 2.0 Results",
  results_description: "Advanced cardiovascular risk assessment complete",
  grace_score: "GRACE Score",
  short_term_risk: "Short-term risk assessment",
  long_term_prognosis: "Long-term prognosis",
  risk_category_label: "Risk Category",
  clinical_risk_stratification: "Clinical risk stratification",
  clinical_recommendations_title: "Clinical Recommendations",
  intervention_window: "Intervention window",
  
  // NEW - Missing translation keys for hardcoded text
  baseline_patient_info: "Enter baseline patient information",
  high_risk_features: "High-Risk Features",
  at_presentation: "At presentation",
  on_initial_ecg: "On initial ECG",
  troponin_ck_mb: "Troponin/CK-MB",
  back_to_demographics: "Back to Demographics",
  calculate_risk_score: "Calculate Risk Score",
  review_data_assessment: "Review data and generate GRACE 2.0 assessment",
  patient_summary: "Patient Summary",
  demographics: "Demographics",
  vital_signs: "Vital Signs",
  hr_label: "HR:",
  sbp_label: "SBP:",
  labs_clinical: "Labs & Clinical",
  creatinine_short: "Creatinine:",
  killip_short: "Killip:",
  high_risk_features_present: "High-Risk Features Present",
  cardiac_arrest: "Cardiac Arrest",
  st_deviation: "ST Deviation",
  elevated_markers: "Elevated Markers",
  no_additional_risk_factors: "No additional risk factors",
  back_to_clinical: "Back to Clinical",
  reset: "Reset",
  calculating: "Calculating...",
  continue_to_clinical_data: "Continue to Clinical Data",
  
  // Expert insights section
  expert_insights_title: "Expert Insights from the Creators",
  expert_insights_subtitle: "From Dr. Joel Gore and Dr. Keith A. A. Fox",
  dr_joel_gore: "Dr. Joel Gore",
  dr_joel_gore_title: "Director, Anticoagulation Clinic, UMass Memorial",
  dr_keith_fox: "Dr. Keith A. A. Fox",
  dr_keith_fox_title: "Professor of Cardiology, University of Edinburgh",
  
  // Facts and figures section
  facts_figures_title: "Facts & Figures",
  facts_figures_subtitle: "GRACE Score Interpretation",
  grace_score_range: "GRACE Score Range",
  mortality_risk: "Mortality Risk",
  risk_category_column: "Risk Category",
  
  // Evidence and validation section
  evidence_validation_title: "Evidence & Validation",
  evidence_validation_subtitle: "Scientific Foundation",
  database_scale: "Database Scale",
  
  // Clinical pearls section
  clinical_pearls_title: "Clinical Pearls & Pitfalls",
  
  // Score interpretation table rows
  score_0_87: "0-87",
  score_88_128: "88-128",
  score_129_149: "129-149",
  score_150_173: "150-173",
  score_174_182: "174-182",
  score_183_190: "183-190",
  score_191_199: "191-199",
  score_200_207: "200-207",
  score_208_218: "208-218",
  score_219_284: "219-284",
  score_285_plus: "285+",
  
  mortality_0_2: "0-2%",
  mortality_3_10: "3-10%",
  mortality_10_20: "10-20%",
  mortality_20_30: "20-30%",
  mortality_40: "40%",
  mortality_50: "50%",
  mortality_60: "60%",
  mortality_70: "70%",
  mortality_80: "80%",
  mortality_90: "90%",
  mortality_99: "99%",
  
  risk_low: "Low",
  risk_moderate: "Moderate",
  risk_high: "High",
  risk_very_high: "Very High",
  
  // PubMed links
  joel_gore_publications: "Dr. Joel Gore's Publications",
  keith_fox_publications: "Dr. Keith A. A. Fox's Publications",
  
  // Expert quotes and detailed content
  gore_grace_quote: "GRACE 2.0 is an improved and refined list of outcomes from GRACE; instead of using score ranges to calculate outcomes like in-hospital mortality, we can actually calculate a mortality for every score. People should use GRACE 2.0.",
  gore_clinical_usage: "We use the in-hospital mortality outcome with the GRACE score. It helps us determine disposition in our STEMI patients; those with a score of 130 or higher go to the ICU after catheterization, and those with lower scores can go to our step down unit.",
  gore_nstemi_quote: "We'll also occasionally use the GRACE score on our high risk NSTEMI patients to consider doing early invasive management as opposed to delayed intervention.",
  fox_development_purpose: "We developed the GRACE ACS risk score because we saw the need for better risk stratification to guide treatment of ACS and to help address the 'Treatment-Risk' paradox.",
  fox_clinical_pearl: "It is important to consider not only total risk, but also risk that can be modified (MI risk helps with this).",
  fox_current_research: "We are currently working on developing models to identify modifiable risk and long term risk in ACS patients.",
  
  // Section labels for expert content
  on_grace_vs_grace_2: "On GRACE vs GRACE 2.0:",
  clinical_usage: "Clinical Usage:",
  on_nstemi_patients: "On NSTEMI Patients:",
  development_purpose: "Development Purpose:",
  clinical_pearl: "Clinical Pearl:",
  current_research: "Current Research:",
  
  // Facts and figures table content
  grace_score_range_header: "GRACE Score Range",
  mortality_risk_header: "Mortality Risk",
  risk_category_header: "Risk Category",
  
  // Evidence and validation content
  database_scale_title: "Database Scale",
  database_scale_description: "The GRACE (Global Registry of Acute Coronary Events) is a massive, international database of ACS in 94 hospitals in 14 countries which gives it excellent external validity.",
  patient_population_title: "Patient Population",
  patient_population_description: "11,389 ACS patients studied with 98.1% in-hospital mortality status available. 22% of in-hospital deaths occurred within 24 hours of admission, suggesting a very sick cohort.",
  grace_2_improvements_title: "GRACE 2.0 Improvements",
  grace_2_improvements_description: "GRACE 2.0 evaluated variables for non-linear mortality associations, providing more accurate estimates. Includes mortality estimates up to 3 years after ACS event.",
  validation_status_title: "Validation Status",
  validation_status_description: "Validated in >20,000 patients in multiple databases and is extremely well studied. NICE guidelines recommend the GRACE Score for ACS risk stratification.",
  
  // Clinical pearls content
  essential_clinical_insights: "Essential Clinical Insights",
  purpose_limitations_title: "Purpose & Limitations",
  purpose_limitations_description: "The GRACE Score is a prospectively studied scoring system to risk stratify patients with diagnosed ACS to estimate their in-hospital and 6-month to 3-year mortality. Like the TIMI Score, it was not designed to assess which patients' anginal symptoms are due to ACS.",
  score_version_title: "Score Version",
  score_version_description: "The GRACE Score was recently improved (GRACE 2.0); this calculator uses the GRACE 2.0 scoring system, which has been shown to be more accurate than the original score.",
  clinical_validation_title: "Clinical Validation",
  clinical_validation_description: "This score has been validated in >20,000 patients in multiple databases and is extremely well studied and supported. The NICE guidelines recommend the GRACE Score for risk stratification of patients with ACS.",
  mini_grace_title: "Mini-GRACE Alternative",
  mini_grace_description: "An alternative version, the mini-GRACE, allows substitutions of Killip class with diuretic usage and/or serum creatinine with a history of renal dysfunction. However, this platform uses the full version requiring both Killip class and serum creatinine."
};

export default grace2Translations; 