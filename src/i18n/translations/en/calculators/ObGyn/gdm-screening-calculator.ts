export const gdmScreeningCalculator = {
  // Basic Info
  title: "Gestational Diabetes Mellitus (GDM) Screening",
  subtitle: "Evidence-Based Risk Assessment • ACOG Guidelines • Personalized Screening Protocol • Clinical Decision Support",
  
  // Main Interface
  calculator: "Calculator",
  about: "About",
  
  // ACOG Alert Section
  acog_evidence_based_title: "ACOG Evidence-Based GDM Screening Protocol",
  acog_description: "Comprehensive risk-based screening strategy for gestational diabetes mellitus using clinical risk factors and evidence-based guidelines. Provides personalized screening timing and methodology recommendations.",
  acog_reference: "ACOG Practice Bulletin No. 230 - GDM Screening",
  
  // Progress Steps
  risk_assessment: "Risk Assessment",
  demographics_history: "Demographics & History",
  screening_recommendations: "Screening Recommendations",
  
  // Step 1: Patient Demographics
  patient_demographics: "Patient Demographics",
  basic_demographics_description: "Basic maternal characteristics and anthropometric data",
  basic_demographics: "Basic Demographics",
  
  // Input Fields
  maternal_age: "Maternal Age",
  maternal_age_placeholder: "28",
  maternal_age_unit: "years",
  maternal_age_help: "Age ≥35 increases GDM risk",
  maternal_age_required: "Maternal age is required",
  maternal_age_range_error: "Maternal age must be between 15-55 years",
  
  pre_pregnancy_bmi: "Pre-pregnancy BMI",
  pre_pregnancy_bmi_placeholder: "24.5",
  pre_pregnancy_bmi_unit: "kg/m²",
  pre_pregnancy_bmi_help: "BMI ≥25 increases GDM risk",
  pre_pregnancy_bmi_required: "Pre-pregnancy BMI is required",
  pre_pregnancy_bmi_range_error: "BMI must be between 15-60 kg/m²",
  
  // Race/Ethnicity Section
  race_ethnicity: "Race/Ethnicity",
  race_ethnicity_label: "Race/Ethnicity",
  race_ethnicity_help: "Certain ethnic groups have higher GDM prevalence",
  
  // Race Options
  white_caucasian: "White/Caucasian",
  hispanic_latino: "Hispanic/Latino",
  african_american: "African American",
  asian: "Asian",
  native_american: "Native American",
  other_mixed: "Other/Mixed",
  
  // High-Risk Ethnic Groups
  high_risk_ethnic_groups: "High-Risk Ethnic Groups",
  hispanic_risk: "• Hispanic/Latino: 2-3x increased risk",
  asian_risk: "• Asian: 2-4x increased risk (especially South Asian)",
  african_american_risk: "• African American: 1.5-2x increased risk",
  native_american_risk: "• Native American: 3-5x increased risk",
  
  // Step Navigation
  next_clinical_history: "Next: Clinical History",
  
  // Step 2: Clinical History
  clinical_history: "Clinical History",
  clinical_history_description: "Medical and obstetric history assessment",
  
  // Family History Section
  family_history: "Family History",
  family_history_diabetes: "Family history of diabetes",
  family_history_description: "First-degree relative (parent, sibling) with Type 1 or Type 2 diabetes",
  
  family_history_impact: "Family History Impact",
  family_history_first_degree: "• First-degree relative with DM: 2-3x increased risk",
  family_history_type2_parents: "• Type 2 diabetes in parents: strongest predictor",
  family_history_multiple: "• Multiple affected relatives: additive risk",
  
  // Obstetric History Section
  obstetric_history: "Obstetric History",
  previous_gdm: "Previous gestational diabetes",
  previous_gdm_description: "GDM diagnosis in prior pregnancy",
  
  previous_macrosomia: "Previous macrosomic infant",
  previous_macrosomia_description: "Prior baby weighing ≥4000g (8 lbs 13 oz) or ≥4500g (9 lbs 15 oz)",
  
  major_risk_factors: "Major Risk Factors",
  previous_gdm_recurrence: "• Previous GDM: 35-70% recurrence risk",
  macrosomic_association: "• Macrosomic infant: Strong GDM association",
  combined_factors: "• Combined factors: Multiplicative risk increase",
  
  // Medical History Section
  medical_history: "Medical History",
  pcos_label: "Polycystic Ovary Syndrome (PCOS)",
  pcos_description: "Diagnosed PCOS or clinical features suggestive of PCOS",
  
  pcos_gdm_risk: "PCOS and GDM Risk",
  pcos_increased_risk: "• PCOS increases GDM risk 2-4 fold",
  pcos_insulin_resistance: "• Insulin resistance mechanism",
  pcos_early_screening: "• Consider early screening if PCOS present",
  
  // Navigation Buttons
  back: "Back",
  generate_screening_plan: "Generate Screening Plan",
  
  // Results Section
  gdm_screening_assessment: "GDM Screening Assessment",
  risk_level: "Risk Level:",
  screening: "Screening:",
  
  // Screening Assessment Summary
  screening_timing: "Screening Timing",
  recommended_timing: "Recommended timing",
  testing_protocol: "Testing Protocol",
  recommended_approach: "Recommended approach",
  
  // Clinical Recommendations
  clinical_recommendations: "Clinical Recommendations",
  
  // Evidence References
  evidence_base: "Evidence Base",
  
  // Action Buttons
  new_assessment: "New Assessment",
  modify_inputs: "Modify Inputs",
  
  // Footer
  footer_info: "Based on ACOG Practice Bulletin No. 230 • For educational purposes only",
  acog_2022_guidelines: "ACOG 2022 Guidelines",
  
  // About Section
  about_title: "About the GDM Screening Calculator",
  about_subtitle: "Evidence-Based Risk Assessment • ACOG Guidelines • Clinical Documentation",
  clinical_purpose: "Clinical Purpose",
  clinical_purpose_description: "The GDM Screening Calculator provides evidence-based risk assessment for gestational diabetes mellitus using clinical risk factors and patient characteristics. It guides personalized screening timing and methodology per ACOG guidelines and international recommendations.",
  
  // Error Messages
  calculation_failed: "Calculation failed",
  
  // Result Values
  result_values: {
    risk_levels: {
      low: "Low",
      moderate: "Moderate", 
      high: "High"
    },
    screening_recommendations: {
      early: "Early",
      standard: "Standard",
      enhanced: "Enhanced"
    },
    testing_protocols: {
      "one-step": "One-step",
      "two-step": "Two-step", 
      either: "Either"
    }
  },

  // Clinical Interpretations and Recommendations (NEW)
  interpretations: {
    low: "Low risk for gestational diabetes mellitus (Risk Score: {score}). Standard screening protocols are appropriate.",
    moderate: "Moderate risk for gestational diabetes mellitus (Risk Score: {score}). Standard screening with enhanced counseling recommended.",
    high: "High risk for gestational diabetes mellitus (Risk Score: {score}). Early screening and intensive management protocols recommended."
  },

  recommendations: {
    low: {
      0: "Standard screening at 24-28 weeks gestation",
      1: "Either one-step (75g OGTT) or two-step (50g GCT followed by 100g OGTT if abnormal) approach acceptable",
      2: "Maintain healthy diet and regular physical activity",
      3: "Weight management within recommended gestational weight gain guidelines"
    },
    moderate: {
      0: "Standard screening at 24-28 weeks gestation",
      1: "Consider early screening if additional risk factors develop",
      2: "Enhanced dietary counseling and exercise guidance",
      3: "Monitor weight gain closely according to IOM guidelines",
      4: "Patient education on GDM symptoms and risks"
    },
    high: {
      0: "Early screening recommended at first prenatal visit or before 24 weeks",
      1: "If early screening negative, repeat screening at 24-28 weeks",
      2: "One-step approach (75g OGTT) preferred for high-risk patients",
      3: "Comprehensive nutritional counseling with registered dietitian",
      4: "Structured exercise program if not contraindicated",
      5: "Close monitoring of maternal weight gain",
      6: "Enhanced prenatal care schedule",
      7: "Consider continuous glucose monitoring if GDM diagnosed"
    },
    universal: {
      0: "Folic acid supplementation 400-800 mcg daily",
      1: "Avoid simple sugars and refined carbohydrates",
      2: "Postpartum screening for type 2 diabetes at 6-12 weeks"
    }
  },

  // Clinical References
  references: {
    0: "ACOG Practice Bulletin No. 190: Gestational Diabetes Mellitus",
    1: "ADA Standards of Care: Diabetes in Pregnancy",
    2: "IADPSG Consensus Panel: International Association of Diabetes and Pregnancy Study Groups",
    3: "WHO Guidelines: Diagnosis and management of gestational diabetes mellitus",
    4: "SMFM Consult Series: Gestational diabetes mellitus screening and management"
  }
}; 