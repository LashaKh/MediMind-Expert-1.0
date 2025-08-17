export const preeclampsiaRiskCalculator = {
  // Basic Information
  title: "Preeclampsia Risk Calculator",
  subtitle: "Early Pregnancy Risk Assessment for Preeclampsia",
  description: "Evidence-based preeclampsia risk assessment using maternal history, clinical factors, and biomarkers for early identification and prevention strategies",
  acog_evidence_based: "ACOG Evidence-Based Risk Assessment",
  tool_description: "Professional preeclampsia risk calculator using validated screening algorithms to identify high-risk pregnancies for targeted prevention and monitoring.",
  acog_committee_reference: "ACOG Committee Opinion #743 - Low-Dose Aspirin Use During Pregnancy",
  
  // Clinical Purpose
  clinical_purpose: "Clinical Purpose",
  clinical_purpose_description: "This calculator provides evidence-based preeclampsia risk assessment using validated screening algorithms. It follows ACOG Committee Opinion #743 and international guidelines for early identification of high-risk pregnancies and targeted low-dose aspirin prophylaxis.",
  
  // Risk Assessment Methods
  risk_methods: "Risk Assessment Methods",
  multiple_risk_factors: "Select all applicable risk factors for comprehensive assessment",
  next_clinical_review: "Next: Clinical Assessment",
  clinical_data_review: "Clinical Data Review",
  review_risk_parameters: "Review your selected parameters and calculated risk assessment",
  back: "Back",
  calculate_risk: "Calculate Preeclampsia Risk",
  
  // Risk Categories
  high_risk_factors: "High Risk Factors",
  moderate_risk_factors: "Moderate Risk Factors",
  low_risk_baseline: "Low Risk (Baseline)",
  
  // High Risk Factors
  previous_preeclampsia: "Previous preeclampsia",
  chronic_hypertension: "Chronic hypertension",
  diabetes_pregestational: "Pre-gestational diabetes (Type 1 or 2)",
  chronic_kidney_disease: "Chronic kidney disease",
  autoimmune_disease: "Autoimmune disease (SLE, APS)",
  multiple_gestation: "Multiple gestation (twins/triplets)",
  
  // Moderate Risk Factors
  nulliparity: "Nulliparity (first pregnancy)",
  maternal_age_35: "Maternal age ≥35 years",
  family_history_preeclampsia: "Family history of preeclampsia",
  obesity_bmi_30: "Obesity (BMI ≥30 kg/m²)",
  previous_adverse_outcome: "Previous adverse pregnancy outcome",
  interpregnancy_interval: "Interpregnancy interval >10 years",
  ivf_pregnancy: "IVF/assisted reproduction",
  
  // Maternal Characteristics
  maternal_characteristics: "Maternal Characteristics",
  maternal_age_label: "Maternal age",
  maternal_age_unit: "years",
  maternal_age_help: "Current maternal age (15-50 years)",
  
  maternal_bmi_label: "Pre-pregnancy BMI",
  maternal_bmi_unit: "kg/m²",
  maternal_bmi_help: "Pre-pregnancy body mass index (15-50 kg/m²)",
  
  gestational_age_label: "Current gestational age",
  gestational_age_unit: "weeks",
  gestational_age_help: "Current gestational age for timing assessment (6-20 weeks)",
  
  // Medical History
  medical_history: "Medical History",
  obstetric_history: "Obstetric History",
  current_pregnancy: "Current Pregnancy Factors",
  
  // Risk Assessment Results
  selected_risk_factors: "Selected Risk Factors",
  calculated_risk_level: "Calculated Risk Level",
  high_risk_category: "High Risk",
  moderate_risk_category: "Moderate Risk", 
  low_risk_category: "Low Risk",
  
  risk_percentage: "Estimated Risk",
  aspirin_recommendation: "Low-dose Aspirin Recommendation",
  monitoring_recommendations: "Monitoring Recommendations",
  
  // Clinical Recommendations
  clinical_recommendations: "Clinical Recommendations",
  evidence_base: "Evidence Base",
  
  // Risk Level Descriptions
  high_risk_description: "High risk for preeclampsia development. Strong recommendation for low-dose aspirin prophylaxis and enhanced monitoring.",
  moderate_risk_description: "Moderate risk based on multiple factors. Consider low-dose aspirin prophylaxis and standard enhanced monitoring.",
  low_risk_description: "Low baseline risk. Standard prenatal care with routine monitoring appropriate.",
  
  // Aspirin Recommendations
  aspirin_indicated: "Low-dose aspirin (81mg daily) RECOMMENDED",
  aspirin_consider: "Consider low-dose aspirin (81mg daily)",
  aspirin_not_indicated: "Low-dose aspirin not routinely indicated",
  
  aspirin_timing: "Initiate between 12-28 weeks (ideally before 16 weeks)",
  aspirin_continuation: "Continue until delivery",
  aspirin_contraindications: "Consider contraindications and bleeding risks",
  
  // Monitoring Recommendations
  enhanced_monitoring: "Enhanced Monitoring",
  standard_monitoring: "Standard Monitoring",
  
  enhanced_monitoring_details: "More frequent visits, blood pressure monitoring, proteinuria assessment, and fetal surveillance",
  standard_monitoring_details: "Routine prenatal care with standard preeclampsia screening",
  
  // ACOG Guidelines
  acog_guidelines: "ACOG Guidelines",
  acog_guideline_1: "One high-risk factor OR two moderate-risk factors indicates aspirin prophylaxis",
  acog_guideline_2: "Low-dose aspirin (81mg daily) should be initiated between 12-28 weeks",
  acog_guideline_3: "Continue aspirin until delivery for maximum benefit",
  acog_guideline_4: "Enhanced monitoring recommended for high-risk pregnancies",
  
  // Evidence Base
  evidence_based_medicine: "Evidence-Based Medicine",
  uspstf_recommendation: "USPSTF Grade A Recommendation for aspirin prophylaxis",
  cochrane_review: "Cochrane Review: 24% reduction in preeclampsia with aspirin",
  meta_analysis_data: "Meta-analysis shows significant reduction in severe preeclampsia",
  
  // Risk Analysis
  risk_analysis: "Risk Analysis",
  risk_factors_count: "Risk Factors Identified:",
  high_risk_count: "High-risk factors:",
  moderate_risk_count: "Moderate-risk factors:",
  
  // Assessment Summary
  assessment_summary: "Assessment Summary",
  recommendation_strength: "Recommendation Strength:",
  strong_recommendation: "Strong Recommendation",
  moderate_recommendation: "Moderate Recommendation", 
  no_specific_recommendation: "No Specific Recommendation",
  
  // Buttons
  new_assessment: "New Assessment",
  modify_inputs: "Modify Inputs",
  
  // Footer
  based_on_acog_743: "Based on ACOG Committee Opinion #743",
  educational_purposes_only: "For educational purposes only",
  acog_2018_guidelines: "ACOG 2018 Guidelines",
  
  // About Section
  about_preeclampsia_calculator: "About Preeclampsia Risk Calculator",
  about_subtitle: "Evidence-based screening for pregnancy complications",
  
  // Clinical Parameters Section
  clinical_parameters: "Clinical Parameters",
  clinical_parameters_subtitle: "Optional biomarkers and clinical measurements (11-13+6 weeks)",
  clinical_measurements: "Clinical Measurements",
  biochemical_markers: "Biochemical Markers",
  clinical_parameters_information: "Clinical Parameters Information",
  
  // Clinical Measurements Labels
  mean_arterial_pressure: "Mean Arterial Pressure (MAP)",
  mean_arterial_pressure_help: "Optional: First trimester MAP measurement",
  uterine_artery_pi: "Uterine Artery Pulsatility Index",
  uterine_artery_pi_help: "Optional: Doppler assessment at 11-13+6 weeks",
  
  // Biochemical Markers Labels
  plgf_label: "PlGF (Placental Growth Factor)",
  plgf_help: "Optional: First trimester PlGF level",
  papp_a_label: "PAPP-A",
  papp_a_help: "Optional: PAPP-A level (multiples of median)",
  
  // Clinical Parameters Information
  clinical_info_1: "These parameters are optional but can improve risk assessment accuracy",
  clinical_info_2: "Optimal timing for assessment is 11-13+6 weeks gestation",
  clinical_info_3: "Combined screening algorithms use these parameters for enhanced risk stratification",
  clinical_info_4: "Clinical risk factors alone are sufficient for basic risk assessment",
  
  // About Page Content
  about_clinical_purpose: "Clinical Purpose",
  about_clinical_purpose_description: "The Preeclampsia Risk Calculator provides evidence-based risk assessment for preeclampsia using clinical risk factors and optional biomarkers. It guides aspirin prophylaxis decisions per USPSTF and ACOG recommendations.",
  about_evidence_subtitle: "Evidence-Based Risk Assessment • ACOG Guidelines • Clinical Documentation",
  
  evidence_based_screening: "Evidence-Based Screening Methods",
  
  // Clinical Applications
  clinical_applications: "Clinical Applications",
  early_risk_identification: "• Early risk identification (12-20 weeks)",
  targeted_prophylaxis: "• Targeted aspirin prophylaxis",
  enhanced_surveillance: "• Enhanced antenatal surveillance",
  resource_allocation: "• Appropriate resource allocation",
  
  // Important Considerations
  important_clinical_considerations: "Important Clinical Considerations",
  clinical_calculator_notice: "This calculator provides evidence-based risk assessment for clinical decision-making. Always consider individual patient factors, contraindications, and clinical judgment.",
  
  // Validation and Errors
  general_error: "Please select at least one risk factor or enter maternal characteristics",
  maternal_age_error: "Maternal age must be between 15-50 years",
  maternal_bmi_error: "BMI must be between 15-50 kg/m²",
  gestational_age_error: "Gestational age must be between 6-20 weeks",
  mean_arterial_pressure_error: "Mean arterial pressure must be between 60-150 mmHg",
  uterine_artery_pi_error: "Uterine artery PI must be between 0.5-3.0",
  calculation_failed: "Risk calculation failed. Please check your inputs and try again.",
  
  // Progress Steps
  progress: {
    step_1: "Risk Factors",
    step_2: "Maternal Data",
    step_3: "Results"
  },
  
  // Display Labels
  high_risk_display: "HIGH",
  moderate_risk_display: "MODERATE",
  low_risk_display: "LOW",
  
  // Units
  years_unit: "years",
  weeks_unit: "weeks",
  kg_m2_unit: "kg/m²",
  mg_unit: "mg",
  daily_unit: "daily",
  
  // Risk Statistics
  baseline_risk: "Baseline population risk: 2-8%",
  high_risk_statistics: "High-risk pregnancies: 15-25% risk",
  aspirin_efficacy: "Aspirin reduces risk by 24% (95% CI: 18-28%)",
  
  // Results Display Labels
  risk_category_label: "Risk Category",
  estimated_risk_label: "Estimated Risk",
  risk_assessment_title: "Risk Assessment",
  risk_assessment_subtitle: "Preeclampsia risk estimate",
  aspirin_recommendation_title: "Aspirin Recommendation",
  aspirin_recommendation_subtitle: "Low-dose aspirin prophylaxis",
  aspirin_recommended: "Recommended",
  aspirin_not_recommended: "Not Recommended",
  clinical_recommendations_title: "Clinical Recommendations",
  evidence_base_title: "Evidence Base"
}; 