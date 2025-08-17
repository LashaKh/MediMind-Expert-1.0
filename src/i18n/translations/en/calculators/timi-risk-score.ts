// TIMI Risk Score Calculator - English Translations
// Extracted from cardiology.ts for improved maintainability

export const timiRiskScoreTranslations = {
  title: "TIMI Risk Score Calculator",
  subtitle: "Unstable Angina/NSTEMI Risk Assessment",
  description: "Thrombolysis in Myocardial Infarction risk score for patients with unstable angina or NSTEMI.",
  
  // Emergency alert
  emergency_tool: "Emergency Risk Assessment Tool",
  tool_description: "TIMI Risk Score for rapid evaluation of patients with unstable angina or NSTEMI. This validated tool helps stratify risk and guide management decisions in the emergency setting.",
  
  // Step labels
  patient_info: "Patient Info",
  clinical_factors: "Clinical Factors",
  
  // Section headers
  demographics_section: "Demographics",
  clinical_assessment: "Clinical Assessment",
  clinical_assessment_description: "Select all clinical factors that apply to this patient:",
  risk_factors_section: "Risk Factors",
  clinical_section: "Clinical Presentation",
  
  // Demographics
  age_label: "Age ≥65 years",
  age_help: "Patients 65 years or older receive 1 point",
  age_error: "Age must be between 18-120 years",
  
  // Risk factors
  coronary_risk_factors: "Coronary artery disease risk factors",
  risk_factors_help: "Number of CAD risk factors (0-3+)",
  risk_factors_detail: "Risk factors include: family history of CAD, hypertension, hypercholesterolemia, diabetes mellitus, current smoking",
  
  cad_risk_factors_label: "≥3 CAD risk factors",
  known_cad_label: "Known CAD (stenosis ≥50%)",
  known_cad: "Known coronary artery disease",
  
  aspirin_use_label: "Aspirin use in prior 7 days",
  aspirin_use: "Aspirin use in prior 7 days",
  
  severe_angina_label: "Severe angina (≥2 episodes in 24h)",
  severe_angina: "Severe anginal symptoms",
  
  st_deviation_label: "ST deviation ≥0.5mm",
  st_deviation: "ST segment deviation ≥0.5mm",
  
  elevated_markers_label: "Elevated cardiac markers",
  elevated_biomarkers: "Elevated cardiac biomarkers",
  
  // Navigation
  next_clinical_factors: "Next: Clinical Factors",
  
  // Results
  score_analysis: "TIMI Risk Score Analysis",
  timi_score: "TIMI Score",
  fourteen_day_breakdown: "14-Day Risk Breakdown",
  fourteen_day_risk: "14-day risk",
  mortality: "Mortality",
  myocardial_infarction: "Myocardial Infarction",
  urgent_revascularization: "Urgent Revascularization",
  
  composite_endpoint: "Composite endpoint",
  death_mi_revascularization: "Death, MI, or urgent revascularization",
  risk_category: "Risk category",
  management_strategy: "Management strategy",
  management_urgency: "Management Urgency",
  recommended_timeframe: "Recommended timeframe:",
  
  // Time frames
  timeframe_under_24: "< 24 hours",
  timeframe_24_48: "24-48 hours",
  timeframe_24_72: "24-72 hours",
  
  // Risk categories
  low_risk: "Low risk (0-2 points)",
  intermediate_risk: "Intermediate risk (3-4 points)",
  high_risk: "High risk (5-7 points)",
  
  // Management recommendations
  conservative_management: "Conservative management",
  routine_management: "Routine Management",
  early_invasive_strategy: "Early invasive strategy",
  early_intervention: "Early Intervention",
  urgent_invasive_strategy: "Urgent invasive strategy",
  urgent_management: "Urgent Management",
  
  // Score components
  score_components: "Score Components",
  age_component: "Age ≥65 years",
  cad_risk_factors_component: "≥3 CAD risk factors",
  known_cad_component: "Known CAD (≥50% stenosis)",
  aspirin_component: "Aspirin use (prior 7 days)",
  angina_component: "Severe angina (≥2 episodes/24h)",
  st_component: "ST deviation ≥0.5mm",
  biomarkers_component: "Elevated cardiac markers",
  
  // Clinical strategy
  clinical_strategy: "Clinical Management Strategy",
  
  // Action buttons
  calculate_button: "Calculate TIMI Score",
  new_assessment: "New Assessment",
  modify_inputs: "Modify Inputs",
  
  // Footer
  based_on_timi: "Based on TIMI Risk Score",
  clinically_validated: "Clinically validated risk assessment tool",
  
  // Interpretations (dynamic)
  interpretation_low: "Low risk patient with {{risk}}% 14-day risk of adverse outcomes",
  interpretation_intermediate: "Intermediate risk patient with {{risk}}% 14-day risk of adverse outcomes",
  interpretation_high: "High risk patient with {{risk}}% 14-day risk of adverse outcomes",
  
  // Recommendations (dynamic)
  recommendation_low_0: "Conservative management with medical therapy",
  recommendation_low_1: "Conservative management with medical therapy",
  recommendation_low_2: "Conservative management with close monitoring",
  recommendation_intermediate_3: "Consider early invasive strategy within 24-48 hours",
  recommendation_intermediate_4: "Early invasive strategy recommended within 24 hours",
  recommendation_high_5: "Urgent invasive strategy within 24 hours",
  recommendation_high_6: "Urgent invasive strategy within 12-24 hours",
  recommendation_high_7: "Immediate invasive strategy - highest risk",
  
  // Simplified category recommendations
  recommendation_low: "Conservative management with medical therapy and close monitoring. Consider early discharge with outpatient follow-up.",
  recommendation_intermediate: "Early invasive strategy within 24-48 hours recommended. Hospitalization with cardiology consultation advised.",
  recommendation_high: "Urgent invasive strategy within 24 hours required. Immediate cardiology consultation and aggressive medical therapy indicated.",
  
  // Risk factor descriptions
  known_cad_desc: "Prior catheterization showing ≥50% stenosis in any major coronary vessel",
  aspirin_use_desc: "Aspirin use within 7 days before hospital presentation",
  severe_angina_desc: "Two or more anginal episodes within 24 hours before presentation",
  st_deviation_desc: "ST segment changes ≥0.5mm on admission ECG",
  elevated_biomarkers_desc: "Elevated troponin, CK-MB, or other cardiac markers",
  
  // About the Creator
  about_creator_title: "About the Creator",
  creator_name: "Dr. Elliott M. Antman",
  creator_description: "Elliott M. Antman, MD, is a professor and associate dean for Clinical/Translational Research at Harvard Medical School. He is also a senior physician in the Cardiovascular Division of the Brigham and Women's Hospital in Massachusetts and President of the American Heart Association (2014-2015). As a senior investigator in the TIMI Study Group, Dr. Antman has published on the use of serum cardiac markers for diagnosis and prognosis of patients with unstable angina and acute myocardial infarction, cyclooxygenase and cardiovascular risk, and antithrombotic therapy for acute coronary syndromes.",
  creator_publications: "To view Dr. Elliott M. Antman's publications, visit",
  
  // Evidence Section
  evidence_title: "Evidence",
  formula_title: "FORMULA",
  formula_description: "Addition of the selected points:",
  variable_age: "Age ≥65",
  variable_risk_factors: "≥3 CAD risk factors*",
  variable_known_cad: "Known CAD (stenosis ≥50%)",
  variable_aspirin: "ASA use in past 7 days",
  variable_angina: "Severe angina (≥2 episodes in 24 hrs)",
  variable_st_changes: "EKG ST changes ≥0.5mm",
  variable_st_deviation: "ST deviation ≥0.5mm",
  variable_biomarkers: "Positive cardiac marker",
  risk_factors_note: "*Risk factors for CAD: Family history of CAD, hypertension, hypercholesterolemia, diabetes, or current smoker",
  
  // Evidence Appraisal
  evidence_appraisal_title: "Evidence Appraisal",
  evidence_appraisal_description: "Antman et al (2000) used a merged database of 7,081 UA/NSTEMI patients in the TIMI 11B and ESSENCE trails for the original derivation and validation of this TIMI risk score for UA/NSTEMI. The risk score was originally derived from 1,957 UA/NSTEMI patients receiving unfractionated heparin in the TIMI 11B trial and internally validated in 3 cohorts of patients from the rest of the merged data: 1,953 patients receiving enoxaparin in the TIMI 11B trial, 1,564 patient receiving unfractionated heparin in the ESSENCE trial, and 1,607 receiving enoxaparin in the ESSENCE trial.",
  validation_studies: "By the end of the 14 days, 16.7% of the derivation group died, had a myocardial infarction, or needed urgent revascularization. An increase of the TIMI Score correlated with an increase in all-cause mortality, MI, or urgent revascularization. The same pattern was seen in the internally validated groups. There have been many external validation studies since its derivation.",
  validation_studies_title: "Validation Studies",
  external_validation: "External validation studies by Scirica et al (2002), Pollack et al (2006), and Chase et al (2006) have consistently demonstrated the prognostic value of the TIMI Risk Score across diverse patient populations, including undifferentiated chest pain patients in emergency department settings.",
  
  // Literature
  literature_title: "Literature",
  original_reference_title: "Original/Primary Reference",
  original_reference: "Antman EM, Cohen M, Bernink PJLM, McCabe CH, Hoacek T, Papuchis G, Mautner B, Corbalan R, Radley D, Braunwald E. The TIMI risk score for unstable angina/non-ST elevation MI: a method for prognostication and therapeutic decision making JAMA. 2000;284(7):835-42.",
  validation_title: "Validation",
  validation_pollack: "Pollack CV, Sites FD, Shofer FS, Sease KL, Hollander JE. Application of the TIMI risk score for unstable angina and non-ST elevation acute coronary syndrome to an unselected emergency department chest pain population. Acad Emerg Med. 2006;13(1):13-18.",
  validation_scirica: "Scirica BM, Cannon CP, Antman EM, Murphy SA, Morrow DA, Sabatine MS, McCabe CH, Gibson CM, Braunwald E. Validation of the thrombolysis in myocardial infarction (TIMI) risk score for unstable angina pectoris and non-ST-elevation myocardial infarction in the TIMI III registry. Am J Cardiol. 2002;90(3):303-5.",
  validation_chase: "Chase M, Robey JL, Zogby KE, Sease KL, Shofer FS, Hollander JE. Prospective validation of the thrombolysis in myocardial infarction risk score in the emergency department chest pain population. Ann Emerg Med. 2006;48(3):252-9.",
  other_references_title: "Other References",
  other_reference: "Than M, Cullen L, Aldous S, et al. 2-Hour accelerated diagnostic protocol to assess patients with chest pain symptoms using contemporary troponins as the only biomarker: the ADAPT trial. J Am Coll Cardiol. 2012;59(23):2091-8."
}; 