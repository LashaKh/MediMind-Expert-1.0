export default {
  // Risk Assessment Category
  riskAssessment: 'Risk Assessment',
  ascvdTitle: 'ASCVD Risk Calculator',
  framinghamTitle: 'Framingham Risk Score',
  reyonldsTitle: 'Reynolds Risk Score',

  // ASCVD Risk Calculator
  ascvd: {
    title: 'ASCVD Risk Calculator',
    subtitle: '10-Year Atherosclerotic Cardiovascular Disease Risk Assessment',
    description: 'ACC/AHA Pooled Cohort Equations to calculate 10-year risk of first major ASCVD event (MI, CHD death, or stroke).',
    calculate_button: "Calculate ASCVD Risk",
    risk_category: "Risk category",
    recommendations: "Clinical recommendations",
    low_risk: "Low risk (<5%)",
    high_risk: "High risk (≥20%)",
    intermediate_risk: "Intermediate risk (5-20%)",
    
    age_label: 'Age (years)',
    age_placeholder: '20-79',
    sex_label: 'Sex',
    sex_placeholder: 'Select sex...',
    sex_male: 'Male',
    sex_female: 'Female',
    race_label: 'Race/Ethnicity',
    race_placeholder: 'Select race...',
    race_white: 'White',
    race_african_american: 'African American',
    race_other: 'Other',
    total_cholesterol_label: 'Total cholesterol (mg/dL)',
    total_cholesterol_placeholder: '130-320',
    hdl_cholesterol_label: 'HDL cholesterol (mg/dL)',
    hdl_cholesterol_placeholder: '20-100',
    systolic_bp_label: 'Systolic blood pressure (mmHg)',
    systolic_bp_placeholder: '90-200',
    on_htn_meds_label: 'Currently on blood pressure medication',
    diabetes_label: 'Diabetes mellitus',
    smoker_label: 'Current smoker',
    validation_age: 'Age must be 20-79 years for ASCVD risk calculation',
    validation_sex: 'Sex is required',
    validation_race: 'Race is required for accurate risk calculation',
    validation_total_cholesterol: 'Total cholesterol must be between 130-320 mg/dL',
    validation_hdl_cholesterol: 'HDL cholesterol must be between 20-100 mg/dL',
    validation_systolic_bp: 'Systolic blood pressure must be between 90-200 mmHg',
    ten_year_risk: '10-Year ASCVD Risk',
    lifetime_risk: 'Lifetime risk',
    statin_benefit: 'Statin therapy benefit',
    bp_control_benefit: 'Blood pressure control benefit',
    smoking_cessation_benefit: 'Smoking cessation benefit',
    aspirin_benefit: 'Aspirin therapy benefit',
    demographics_section: "Demographics",
    lab_values_section: "Lab Values",
    risk_factors_section: "Risk Factors",
    evidence_title: "Evidence",
    evidence_description: "This calculator is based on the 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk and the Pooled Cohort Equations.",
    evidence_link_text: "View Original Research Publication",
    about_creator_title: "About the Creator",
    creator_name: "Dr. David C. Goff, Jr., MD, PhD",
    creator_bio: "David C. Goff, Jr., MD, PhD, is a professor of epidemiology at the University of Colorado and is the dean of the Colorado School of Public Health. He is a former recipient of the Public Policy Award from the National Forum for Heart Disease and Stroke Prevention, and he is currently the Interim Chair of the ASPPH accreditation and credentialing committee. His research interests include the prevention and understanding of heart disease and stroke.",
    // Detailed Analysis Section
    lifetime_risk_title: "Lifetime Risk",
    lifetime_risk_description: "Estimated lifetime cardiovascular risk for patients aged 20-59",
    risk_classification_title: "Risk Classification",
    risk_classification_low: "Risk < 5% - Focus on lifestyle modifications",
    risk_classification_borderline: "Risk 5-7.4% - Consider risk enhancing factors",
    risk_classification_intermediate: "Risk 7.5-19.9% - Statin therapy reasonable",
    risk_classification_high: "Risk ≥ 20% - High-intensity statin recommended",
    therapy_reduction_title: "Estimated Risk Reduction with Therapy",
    statin_therapy: "Statin Therapy",
    bp_control: "BP Control",
    smoking_cessation: "Smoking Cessation",
    aspirin_therapy: "Aspirin (if appropriate)",
    // Interpretation messages
    interpretation_low: "Low cardiovascular risk. Focus on lifestyle modifications and routine preventive care.",
    interpretation_borderline: "Borderline risk. Consider risk enhancing factors and shared decision-making for preventive therapy.",
    interpretation_intermediate: "Intermediate risk. Moderate-intensity statin therapy is reasonable along with lifestyle modifications.",
    interpretation_high: "High cardiovascular risk. High-intensity statin therapy recommended unless contraindicated.",
    // Validation message
    calibration_applied: "Calibration Applied",
    // Footer text
    footer_guidelines: "Based on ACC/AHA 2019 Primary Prevention Guideline and Pooled Cohort Equations",
    footer_validated: "100% Validated"
  },

  // Atrial Fibrillation Risk Assessment
  atrial_fibrillation: {
    title: 'Atrial Fibrillation Risk Assessment',
    subtitle: 'CHA₂DS₂-VASc stroke risk and HAS-BLED bleeding risk • Comprehensive AF management',
    
    // Component header and description
    component_title: 'Atrial Fibrillation Risk Assessment',
    component_subtitle: 'CHA₂DS₂-VASc stroke risk and HAS-BLED bleeding risk • Comprehensive AF management',
    
    // Alert section
    alert_title: 'Comprehensive Atrial Fibrillation Risk Assessment',
    alert_description: 'Evidence-based stroke and bleeding risk assessment for patients with non-valvular atrial fibrillation. Guide anticoagulation therapy decisions with balanced benefit-risk analysis.',
    alert_badge: 'Validated by ACC/AHA/ESC Guidelines - Advanced Risk Analysis',
    
    // Tab labels
    tab_cha2ds2vasc: 'CHA₂DS₂-VASc',
    tab_cha2ds2vasc_subtitle: '(Stroke Risk)',
    tab_hasbled: 'HAS-BLED',
    tab_hasbled_subtitle: '(Bleeding Risk)',
    
    // CHA₂DS₂-VASc section
    cha2ds2vasc: {
      title: 'CHA₂DS₂-VASc Score',
      description: 'Stroke risk assessment in non-valvular atrial fibrillation',
      
      // Form fields
      age_label: 'Age (years)',
      age_placeholder: '65',
      age_tooltip: 'Age 65-74 = 1 point, Age ≥75 = 2 points',
      
      sex_label: 'Sex',
      sex_placeholder: 'Select...',
      sex_tooltip: 'Female sex = 1 point',
      sex_male: 'Male',
      sex_female: 'Female',
      
      // Risk factors
      risk_factors_title: 'Risk Factors (1 point each)',
      chf_label: 'Congestive heart failure/LV dysfunction',
      hypertension_label: 'Hypertension',
      diabetes_label: 'Diabetes mellitus',
      vascular_disease_label: 'Vascular disease (MI, PAD, aortic plaques)',
      
      // High-risk factors
      high_risk_title: 'High-Risk Factor (2 points)',
      stroke_tia_label: 'Previous stroke, TIA, or thromboembolism',
      
      // Buttons
      calculate_button: 'Calculate Score',
      reset_button: 'Reset',
      
      // Results
      score_label: 'CHA₂DS₂-VASc Score',
      annual_stroke_risk: 'Annual stroke risk',
      risk_category: 'Risk category',
      recommendation: 'Recommendation',
      
      // Evidence section
      evidence_title: 'Evidence & Validation',
      evidence_origin_title: 'Score Development',
      evidence_origin_description: 'The CHA₂DS₂-VASc score was developed in 2010 as a refinement of the CHADS₂ score, incorporating additional stroke risk factors. It was derived from the Euro Heart Survey cohort of 5,333 patients with atrial fibrillation.',
      evidence_validation_title: 'Validation Studies',
      evidence_validation_description: 'The score has been extensively validated in multiple large cohorts worldwide, consistently demonstrating superior performance to CHADS₂ in identifying truly low-risk patients and providing better stroke risk stratification.',
      evidence_guidelines_title: 'Guideline Recommendations',
      evidence_guidelines_description: 'The CHA₂DS₂-VASc score is recommended by major international guidelines including the 2023 ACC/AHA/ACCP/HRS, 2020 ESC, and 2021 NICE guidelines for stroke risk assessment in non-valvular atrial fibrillation.',
      evidence_link_guidelines: '2023 ACC/AHA/ACCP/HRS Guideline for AF Management',
      evidence_link_original: 'Original CHA₂DS₂-VASc Validation Study (Lip et al., 2010)',
      
      // Clinical pearls
      clinical_pearls_title: 'Clinical Pearls',
      clinical_pearl_1: 'Female sex confers stroke risk only in the presence of ≥1 other stroke risk factor. A CHA₂DS₂-VASc score of 1 in women (sex category only) is considered low risk.',
      clinical_pearl_2: 'The score performs best for identifying truly low-risk patients (score 0 in men, 1 in women) who may not require anticoagulation.',
      clinical_pearl_3: 'Annual stroke risk increases progressively with higher scores, from 0.2% at score 0 to >10% at scores ≥7.',
      clinical_pearl_4: 'Direct oral anticoagulants (DOACs) are preferred over warfarin for most patients with AF requiring anticoagulation, unless contraindicated.'
    },
    
    // HAS-BLED section
    hasbled: {
      title: 'HAS-BLED Score',
      description: 'Bleeding risk assessment during anticoagulation therapy',
      
      // Risk factors
      risk_factors_title: 'Bleeding Risk Factors (1 point each)',
      hypertension_label: 'Uncontrolled hypertension (systolic BP >160 mmHg)',
      abnormal_renal_label: 'Abnormal renal function (dialysis, transplant, creatinine >200 μmol/L)',
      abnormal_liver_label: 'Abnormal liver function (cirrhosis, bilirubin >2x normal, ALT/AST >3x normal)',
      stroke_label: 'Stroke history',
      bleeding_label: 'Bleeding history or predisposition',
      labile_inr_label: 'Labile INR (unstable/high INR, <60% time in therapeutic range)',
      elderly_label: 'Elderly (>65 years)',
      drugs_label: 'Drugs or alcohol (antiplatelet agents, NSAIDs)',
      alcohol_label: 'Alcohol (≥8 drinks per week)',
      
      // Buttons
      calculate_button: 'Calculate Score',
      reset_button: 'Reset',
      
      // Results
      score_label: 'HAS-BLED Score',
      annual_bleeding_risk: 'Annual bleeding risk',
      risk_category: 'Risk category',
      recommendation: 'Recommendation',

      // Author Information
      author_title: 'From the Creator',
      author_name: 'Dr. Ron Pisters, MD, PhD',
      author_bio: 'Dr. Ron Pisters is a cardiologist at Rijnstate Hospital, Netherlands, specializing in atrial fibrillation and antithrombotic management.',
      author_key_message_title: 'Key Clinical Message',
      author_key_message: 'HAS-BLED should be used as a clinical tool to identify and address modifiable bleeding risk factors, not as an absolute contraindication to anticoagulation. Remember: in most AF patients, stroke risk outweighs bleeding risk.',
      author_pubmed_link: 'View Dr. Ron Pisters\' publications on PubMed',
      
      // Formula Section
      formula_title: 'FORMULA',
      formula_description: 'Addition of the selected points:',
      formula_note: 'HAS-BLED is an acronym for Hypertension, Abnormal liver/renal function, Stroke history, Bleeding predisposition, Labile INR, Elderly, Drug/alcohol usage.',
      
      // Risk Table
      facts_figures_title: 'Facts & Figures',
      risk_table_title: 'HAS-BLED Score Risk Assessment',
      risk_table_score: 'Score',
      risk_table_group: 'Risk Group',
      risk_table_major_bleeding: 'Risk of Major Bleeding**',
      risk_table_bleeds_per_100: 'Bleeds per 100 Patient-Years***',
      risk_table_recommendation: 'Recommendation',
      
      // Risk Groups
      risk_low: 'Low',
      risk_moderate: 'Moderate', 
      risk_high: 'High',
      risk_very_high: 'Very High',
      
      // Risk Recommendations
      risk_rec_0_1: 'Anticoagulation should be considered',
      risk_rec_2: 'Anticoagulation can be considered',
      risk_rec_3_4: 'Alternatives to anticoagulation should be considered',
      risk_rec_5_plus: 'Scores greater than 5 were too rare to determine risk, but are likely over 10%',
      
      // Evidence Section
      evidence_title: 'Evidence Appraisal',
      evidence_development: 'The HAS-BLED Score was developed in 2010 as a practical risk score to estimate the 1-year risk of major bleeding in patients with atrial fibrillation (AF). The original study used data from the prospective Euro Heart Survey on AF, and included 3456 ambulatory and hospitalized patients with AF and one-year follow-up status regarding major bleeding, and without mitral valve stenosis or valvular surgery.',
      evidence_validation: 'Many external validations of the HAS-BLED score have been published. A 2020 network meta-analysis of 18 studies found HAS-BLED to be the most balanced predictive score for major bleeding in terms of sensitivity and specificity, compared to other contemporary scores including the ABC‐bleeding score, ATRIA, European score, GARFIELD‐AF, HEMORR₂HAGES, ORBIT, Shireman, and mOBRI.',
      evidence_guidelines: 'The simplicity of the HAS-BLED score and the extensive external validations have led to widespread clinical adoption, with the 2020 ESC guidelines specifically recommending HAS-BLED for the assessment of bleeding risk in patients with AF. However, the more recent 2024 ESC guidelines and the 2023 ACC/AHA/ACCP/HRS guidelines both did not recommend a specific predictive score for major bleeding, citing uncertainties over accuracy and potential harms of not anticoagulating appropriately.',
      evidence_limitations: 'Such reservation at least partly stemmed from the fact that HAS-BLED was derived when DOAC were only starting to become available, which casts doubt on the predictive accuracy of HAS-BLED in truly contemporary cohorts with DOAC use. Additionally, even though clinicians are advised to balance the risks of bleeding and thromboembolism in patients with AF when considering anticoagulation, the real-life implications of these events may not be equivalent.',
      
      // Reference Links
      reference_original: 'Original Research: Pisters et al. (2010)',
      reference_validation: 'Validation Study: Lip et al. (2011)',
      reference_guidelines_2020: '2020 ESC Guidelines',
      reference_guidelines_2023: '2023 ACC/AHA/ACCP/HRS Guidelines'
    },
    
    // Common labels
    score_points: '{{score}} point(s)',
    risk_percentage: '{{risk}}% per year',
    
    // Validation messages
    validation: {
      age_required: 'Age is required',
      age_range: 'Age must be between 18-120 years',
      sex_required: 'Sex selection is required'
    }
  },

  // CHA2DS2-VASc Calculator - UPDATED TO PATTERN COMPLIANCE
  chads_vasc: {
    title: "CHA2DS2-VASc Calculator",
    subtitle: "Stroke risk assessment in atrial fibrillation",
    description: "Risk stratification for stroke in patients with non-valvular atrial fibrillation.",
    calculate_button: "Calculate CHA2DS2-VASc",
    risk_category: "Risk category",
    recommendations: "Clinical recommendations",
    low_risk: "Low risk (0 points)",
    high_risk: "High risk (≥2 points)",
    
    // Risk factors
    congestive_heart_failure_label: "Congestive heart failure",
    hypertension_label: "Hypertension",
    age_75_label: "Age ≥75 years",
    diabetes_label: "Diabetes mellitus",
    stroke_tia_label: "Previous stroke/TIA",
    vascular_disease_label: "Vascular disease",
    age_65_74_label: "Age 65-74 years",
    female_sex_label: "Female sex",
    
    // Section headers
    risk_factors: "Risk Factors",
    
    // Results
    chads_vasc_score: "CHA2DS2-VASc Score",
    annual_stroke_risk: "Annual stroke risk",
    anticoagulation_recommendation: "Anticoagulation recommendation",
    
    // Recommendations
    no_anticoagulation: "No anticoagulation indicated. Continue to monitor risk factors annually.",
    consider_anticoagulation: "Consider oral anticoagulation based on individual patient characteristics and shared decision-making.",
    anticoagulation_recommended: "Oral anticoagulation is recommended unless contraindicated. Prefer DOACs over warfarin in most patients."
  },

  // HAS-BLED Calculator - UPDATED TO PATTERN COMPLIANCE
  has_bled: {
    title: "HAS-BLED Calculator",
    subtitle: "Bleeding risk assessment during anticoagulation therapy",
    description: "Assessment of major bleeding risk in AF patients receiving anticoagulants.",
    calculate_button: "Calculate HAS-BLED",
    risk_category: "Risk category",
    recommendations: "Clinical recommendations",
    low_risk: "Low risk (0-2 points)",
    high_risk: "High risk (≥3 points)",
    
    // Risk factors
    hypertension_label: "Uncontrolled hypertension",
    abnormal_renal_function_label: "Abnormal renal function",
    abnormal_liver_function_label: "Abnormal liver function",
    stroke_label: "Previous stroke",
    bleeding_history_label: "Bleeding history",
    labile_inr_label: "Labile INR",
    elderly_label: "Elderly (>65 years)",
    drugs_alcohol_label: "Drugs/alcohol",
    
    // Section headers
    risk_factors: "Risk Factors",
    
    // Results
    has_bled_score: "HAS-BLED Score",
    annual_bleeding_risk: "Annual bleeding risk",
    clinical_recommendation: "Clinical recommendations"
  },

  // CHADS2 Calculator - UPDATED TO PATTERN COMPLIANCE
  chads2: {
    title: "CHADS2 Calculator",
    subtitle: "Classic stroke risk assessment in atrial fibrillation",
    description: "Original stroke risk stratification scale for non-valvular AF.",
    calculate_button: "Calculate CHADS2",
    risk_category: "Risk category",
    recommendations: "Clinical recommendations",
    low_risk: "Low risk (0 points)",
    high_risk: "High risk (≥2 points)",
    
    // Risk factors
    congestive_heart_failure_label: "Congestive heart failure",
    hypertension_label: "Hypertension",
    age_75_label: "Age ≥75 years",
    diabetes_label: "Diabetes mellitus",
    stroke_tia_label: "Previous stroke/TIA",
    
    // Section headers
    risk_factors: "Risk Factors",
    
    // Results
    chads2_score: "CHADS2 Score",
    annual_stroke_risk: "Annual stroke risk",
    anticoagulation_recommendation: "Anticoagulation recommendation"
  }
}; 