export const endometrialCancerRiskCalculator = {
  title: 'Endometrial Cancer Risk Calculator',
  subtitle: 'Lifetime Risk Assessment for Endometrial Cancer',
  
  // Tab Labels
  calculate_button: 'Calculate Risk',
  about_title: 'About This Calculator',
  
  // Progress Section
  risk_assessment: 'Risk Assessment',
  step_indicator: 'Step {{step}} of 3',
  
  // Step Descriptions
  demographics: 'Demographics',
  physical_characteristics: 'Physical Characteristics',
  medical_history: 'Medical History',
  risk_factors: 'Risk Factors',
  risk_factors_analysis: 'Risk Factors Analysis',
  calculate_risk: 'Calculate Risk',
  
  // Step 1: Demographics & Physical Characteristics
  age_label: 'Age',
  age_placeholder: 'Enter age',
  age_help: 'Patient age in years (18-100)',
  age_error: 'Age must be between 18 and 100 years',
  
  bmi_label: 'BMI',
  bmi_placeholder: 'Enter BMI',
  bmi_help: 'Body Mass Index (kg/m²)',
  bmi_error: 'BMI must be between 15 and 60 kg/m²',
  
  // Units
  years: 'years',
  kg_m2: 'kg/m²',
  
  // BMI Categories
  bmi_categories: 'BMI Risk Categories',
  bmi_normal: 'Normal (18.5-24.9)',
  baseline_risk: 'Baseline risk',
  bmi_overweight: 'Overweight (25-29.9)',
  moderate_risk: '1.5-2x increased risk',
  bmi_obese_i: 'Obese Class I (30-34.9)',
  high_risk_2_3x: '2-3x increased risk',
  bmi_obese_ii: 'Obese Class II+ (≥35)',
  very_high_risk_3_6x: '3-6x increased risk',
  
  // Navigation Buttons
  next_medical_history: 'Next: Medical History',
  previous: 'Previous',
  next_calculate_risk: 'Next: Calculate Risk',
  
  // Step 2: Medical History & Risk Factors
  medical_conditions: 'Medical Conditions',
  reproductive_history: 'Reproductive History',
  medication_history: 'Medication History',
  
  // Medical Conditions
  diabetes_label: 'Type 2 Diabetes',
  diabetes_description: 'Current or previous diagnosis of type 2 diabetes mellitus',
  lynch_syndrome_label: 'Lynch Syndrome',
  lynch_syndrome_description: 'Hereditary nonpolyposis colorectal cancer syndrome',
  family_history_label: 'Family History',
  family_history_description: 'Family history of endometrial or colorectal cancer in first-degree relatives',
  
  // Reproductive History
  nulliparity_label: 'Nulliparity',
  nulliparity_description: 'Never had children (no pregnancies carried to viability)',
  late_menopause_label: 'Late Menopause',
  late_menopause_description: 'Menopause after age 52',
  
  // Medication History
  tamoxifen_label: 'Tamoxifen Use',
  tamoxifen_description: 'Current or previous use of tamoxifen therapy',
  unopposed_estrogen_label: 'Unopposed Estrogen',
  unopposed_estrogen_description: 'Estrogen therapy without progesterone',
  
  // Step 3: Assessment Review
  risk_assessment_review: 'Risk Assessment Review',
  assessment_summary: 'Assessment Summary',
  
  // Summary Labels (Short forms)
  diabetes_short: 'Diabetes',
  nulliparity_short: 'Nulliparity',
  late_menopause_short: 'Late Menopause',
  tamoxifen_short: 'Tamoxifen',
  unopposed_estrogen_short: 'Unopposed Estrogen',
  lynch_syndrome_short: 'Lynch Syndrome',
  yes: 'Yes',
  no: 'No',
  
  // Calculation Buttons
  calculating: 'Calculating...',
  calculate_risk_assessment: 'Calculate Risk Assessment',
  reset_all_fields: 'Reset All Fields',
  
  // Results Section
  risk: 'Risk',
  risk_level: 'Risk Level',
  lifetime_risk: 'Lifetime Risk',
  management_recommendation: 'Management Recommendation',
  management_description: 'Based on risk assessment and clinical guidelines',
  screening_recommendation: 'Screening Recommendation',
  protective_factors: 'Protective Factors',
  clinical_recommendations: 'Clinical Recommendations',
  
  // About Section
  clinical_purpose: 'Clinical Purpose',
  clinical_purpose_desc: 'This calculator provides comprehensive endometrial cancer risk assessment based on established clinical risk factors and epidemiological data.',
  clinical_purpose_details: 'Endometrial cancer is the most common gynecologic malignancy in developed countries. Risk-based assessment enables personalized screening and prevention strategies.',
  
  // High Risk Factors
  high_risk_factors: 'High-Risk Factors',
  obesity_risk: 'Obesity (BMI ≥30 kg/m²)',
  diabetes_risk: 'Type 2 diabetes mellitus',
  nulliparity_risk: 'Nulliparity (never pregnant)',
  late_menopause_risk: 'Late menopause (>52 years)',
  lynch_syndrome_risk: 'Lynch syndrome (hereditary)',
  unopposed_estrogen_risk: 'Unopposed estrogen therapy',
  tamoxifen_risk: 'Tamoxifen therapy',
  pcos_risk: 'Polycystic ovary syndrome (PCOS)',
  irregular_cycles_risk: 'Chronic anovulation/irregular cycles',
  hyperplasia_risk: 'Endometrial hyperplasia',
  family_history_risk: 'Family history of endometrial cancer',
  breast_ovarian_history_risk: 'Personal history of breast/ovarian cancer',
  
  // Protective Factors
  multiparity_protective: 'Multiparity (multiple pregnancies)',
  oral_contraceptive_protective: 'Long-term oral contraceptive use',
  physical_activity_protective: 'Regular physical activity',
  normal_bmi_protective: 'Normal BMI (18.5-24.9 kg/m²)',
  combined_hrt_protective: 'Combined estrogen-progestogen therapy',
  breastfeeding_protective: 'Prolonged breastfeeding',
  progestin_iud_protective: 'Progestin-releasing IUD',
  smoking_cessation_protective: 'Smoking cessation',
  mediterranean_diet_protective: 'Mediterranean diet pattern',
  regular_cycles_protective: 'Regular ovulatory cycles',
  early_menopause_protective: 'Early menopause (<45 years)',
  
  // Risk-Based Management
  risk_based_management: 'Risk-Based Management Strategies',
  
  // Very High Risk (Lynch Syndrome)
  very_high_risk_lynch: 'Very High Risk (Lynch Syndrome)',
  annual_biopsy_lynch: 'Annual endometrial biopsy starting at age 35',
  tv_ultrasound_lynch: 'Annual transvaginal ultrasound',
  prophylactic_hysterectomy_lynch: 'Consider prophylactic hysterectomy after childbearing',
  genetic_counseling_lynch: 'Genetic counseling and family screening',
  enhanced_surveillance_lynch: 'Enhanced surveillance protocols',
  
  // High Risk (Multiple Factors)
  high_risk_multiple: 'High Risk (Multiple Risk Factors)',
  enhanced_surveillance_high: 'Enhanced clinical surveillance',
  endometrial_sampling_high: 'Consider endometrial sampling if symptomatic',
  weight_management_high: 'Aggressive weight management counseling',
  hormonal_risk_reduction_high: 'Hormonal risk reduction strategies',
  patient_education_high: 'Comprehensive patient education on warning signs',
  
  // Average Risk (General Population)
  average_risk_general: 'Average Risk (General Population)',
  no_routine_screening_average: 'No routine screening recommended',
  prompt_evaluation_average: 'Prompt evaluation of abnormal bleeding',
  annual_pelvic_exam_average: 'Annual pelvic examination',
  lifestyle_counseling_average: 'Lifestyle modification counseling',
  symptom_awareness_average: 'Education on warning symptoms',
  
  // Warning Signs
  warning_signs: 'Warning Signs & Symptoms',
  primary_warning_signs: 'Primary Warning Signs',
  postmenopausal_bleeding_warning: 'Postmenopausal bleeding (ANY amount)',
  abnormal_uterine_bleeding_warning: 'Abnormal uterine bleeding patterns',
  intermenstrual_bleeding_warning: 'Intermenstrual bleeding',
  heavy_prolonged_periods_warning: 'Heavy or prolonged menstrual periods',
  unusual_vaginal_discharge_warning: 'Unusual vaginal discharge',
  
  // Advanced Disease Symptoms
  advanced_disease_symptoms: 'Advanced Disease Symptoms',
  pelvic_pain_advanced: 'Persistent pelvic pain',
  abdominal_distension_advanced: 'Abdominal distension',
  early_satiety_advanced: 'Early satiety and bloating',
  unexplained_weight_loss_advanced: 'Unexplained weight loss',
  urinary_frequency_advanced: 'Urinary frequency or urgency',
  bowel_symptoms_advanced: 'New bowel symptoms',
  
  // Clinical Pearl
  clinical_pearl: 'Clinical Pearl',
  clinical_pearl_desc: 'Postmenopausal bleeding has a 10-15% risk of endometrial cancer and requires immediate evaluation with endometrial sampling.',
  
  // Diagnostic Evaluation
  diagnostic_evaluation: 'Diagnostic Evaluation',
  first_line_diagnostic: 'First-Line Diagnostic Tests',
  endometrial_biopsy_diagnostic: 'Endometrial biopsy (office-based)',
  tv_ultrasound_diagnostic: 'Transvaginal ultrasound',
  saline_sonography_diagnostic: 'Saline infusion sonography',
  hysteroscopy_diagnostic: 'Hysteroscopy with biopsy',
  
  // Endometrial Thickness Thresholds
  endometrial_thickness_thresholds: 'Endometrial Thickness Thresholds',
  postmenopausal_threshold: 'Postmenopausal: >4mm requires evaluation',
  premenopausal_threshold: 'Premenopausal: Variable by cycle phase',
  hrt_threshold: 'HRT users: >5mm requires evaluation',
  tamoxifen_threshold: 'Tamoxifen users: >8mm requires evaluation',
  
  // High-Risk Screening Protocols
  high_risk_screening_protocols: 'High-Risk Screening Protocols',
  lynch_screening: 'Lynch syndrome: Annual screening from age 35',
  tamoxifen_screening: 'Tamoxifen users: Annual gynecologic evaluation',
  unopposed_estrogen_screening: 'Unopposed estrogen: Minimize duration',
  pcos_screening: 'PCOS: Regular cycle regulation and screening',
  
  // Clinical Guidelines & Evidence
  clinical_guidelines_evidence: 'Clinical Guidelines & Evidence Base',
  nccn_guidelines_v2024: 'NCCN Guidelines Version 2024.1: Uterine Neoplasms',
  sgo_clinical_statement: 'SGO Clinical Practice Statement on Endometrial Cancer',
  acog_bulletin_147: 'ACOG Practice Bulletin No. 147: Lynch Syndrome',
  uspstf_2023: 'USPSTF 2023: Screening for Gynecologic Conditions',
  esmo_guidelines: 'ESMO Clinical Practice Guidelines: Endometrial Cancer',
  nice_guidelines_ng12: 'NICE Guidelines NG12: Suspected Cancer Recognition',
  rcog_green_top: 'RCOG Green-top Guideline No. 67: Endometrial Cancer',
  asco_sso_guidelines: 'ASCO/SSO Guidelines: Endometrial Cancer Management',
  
  // Service strings for calculations (results, risk factors, recommendations)
  service: {
    // Risk factor descriptions
    peak_incidence_age: 'Peak incidence age group (55-69 years)',
    advanced_age: 'Advanced age',
    severe_obesity: 'Severe obesity (BMI ≥35) - 5-6x increased risk',
    obesity: 'Obesity (BMI 30-34.9) - 3x increased risk',
    overweight: 'Overweight (BMI 25-29.9) - moderately increased risk',
    normal_bmi_baseline: 'Normal BMI (18.5-24.9) - baseline risk',
    type_2_diabetes_risk: 'Type 2 diabetes mellitus - 2-4x increased risk',
    lynch_syndrome_risk: 'Lynch syndrome - 40-60% lifetime risk',
    family_history_cancer: 'Family history of endometrial/ovarian/colon cancer',
    nulliparity_risk: 'Nulliparity - 2-3x increased risk',
    parity_protective: 'Parity - protective against endometrial cancer',
    late_menopause_estrogen: 'Late menopause (>52 years) - prolonged estrogen exposure',
    tamoxifen_risk: 'Tamoxifen use - 2-7x increased risk',
    unopposed_estrogen_risk: 'Unopposed estrogen therapy - 8-15x increased risk',
    pregnancy_history: 'History of pregnancy(ies)',
    normal_body_weight: 'Normal body weight',
    no_risk_factors: 'No significant risk factors identified',

    // Interpretation text parts
    lifetime_endometrial_cancer_risk: 'lifetime endometrial cancer risk',
    population_average: 'population average',
    primary_risk_factors: 'Primary risk factors:',

    // Screening recommendations by category
    screening_very_high: 'Annual endometrial biopsy starting at age 35. Consider prophylactic hysterectomy after childbearing.',
    screening_high: 'Enhanced surveillance with annual evaluation. Consider endometrial sampling for any abnormal bleeding.',
    screening_moderate: 'Increased vigilance for symptoms. Prompt evaluation of any abnormal bleeding.',
    screening_low: 'Standard care. Evaluate any postmenopausal bleeding promptly.',

    // Clinical recommendations
    genetic_counseling: 'Genetic counseling and family cascade testing',
    prophylactic_surgery: 'Consider prophylactic hysterectomy and bilateral salpingo-oophorectomy after childbearing',
    enhanced_surveillance: 'Enhanced surveillance for Lynch syndrome-associated cancers',
    weight_management: 'Weight management through diet and exercise',
    bariatric_surgery: 'Consider bariatric surgery for severe obesity',
    glycemic_control: 'Optimize glycemic control with HbA1c target <7%',
    metformin_consideration: 'Consider metformin which may have protective effects',
    progestin_addition: 'Consider adding progestin to estrogen therapy',
    hormone_alternatives: 'Evaluate alternative hormone therapy options',
    healthy_lifestyle: 'Maintain healthy lifestyle: regular exercise, balanced diet',
    postmenopausal_bleeding_evaluation: 'Immediate evaluation for any postmenopausal bleeding',
    annual_gynecologic_exam: 'Annual gynecologic examination with pelvic exam',

    // Risk categories (for translation)
    risk_low: 'Low',
    risk_moderate: 'Moderate',  
    risk_high: 'High',
    risk_very_high: 'Very-high'
  }
}; 