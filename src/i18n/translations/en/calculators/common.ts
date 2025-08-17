export default {
  // Keys for Calculators.tsx main page
  title: 'Medical Calculators',
  back_to: 'Back to Calculators',
  categories_label: 'Categories',
  tools_count: '{{count}} Tool | {{count}} Tools',
  
  // Common UI elements (these are the missing keys)
  about: 'About',
  calculator: 'Calculator',
  validated: 'Validated',
  new_calculation: 'New Calculation',
  modify_inputs: 'Modify Inputs',

  specialty: {
    cardiology: {
      title: 'Cardiology Calculators',
      description: 'A suite of specialized calculators for cardiology practice.',
      message: 'Cardiology specialty selected'
    },
    obgyn: {
      title: 'OB/GYN Calculators',
      description: 'A suite of specialized calculators for obstetrics and gynecology.',
      message: 'OB/GYN specialty selected'
    }
  },
  stats: {
    calculators: 'Calculators',
    validated: 'Validated',
    categories: 'Categories'
  },
  categories: {
    risk_assessment: 'Risk Assessment',
    acute_care: 'Acute Care',
    therapy_management: 'Therapy Management',
    heart_failure: 'Heart Failure',
    surgical_risk: 'Surgical Risk',
    cardiomyopathy: 'Cardiomyopathy',
    // OB/GYN Categories (add as needed, e.g., prenatal, labor_delivery, gynecological_oncology)
    prenatal_screening: 'Prenatal Screening',
    labor_delivery: 'Labor & Delivery',
    gynecological_health: 'Gynecological Health'
  },

  // General calculator terms (merged from previous structure)
  calculate: 'Calculate',
  calculating: 'Calculating...',
  result: 'Result',
  results: 'Results',
  interpretation: 'Interpretation',
  recommendations: 'Recommendations',
  riskLevel: 'Risk Level', // Or simply 'risk' if preferred
  points: 'points',
  score: 'Score',
  lifetime_risk: 'Lifetime Risk',
  annual_risk: 'Annual Risk',
  risk_multiplier: 'Risk Multiplier',
  screening_recommendation: 'Screening Recommendation',
  protective_factors: 'Protective Factors',
  prophylactic_surgery_discussion: 'Prophylactic Surgery Discussion',
  lowRisk: 'Low Risk',
  moderateRisk: 'Moderate Risk',
  highRisk: 'High Risk',
  veryHighRisk: 'Very High Risk',
  riskFactors: 'Risk Factors',
  inputs: 'Inputs',
  clearInputs: 'Clear Inputs',
  shareResult: 'Share Result',
  downloadPDF: 'Download PDF',
  printResult: 'Print Result',
  enterValue: 'Enter value',
  selectOption: 'Select option',
  required: 'Required',
  optional: 'Optional',
  invalidValue: 'Invalid value',
  valueOutOfRange: 'Value out of range',
  coming_soon: "Coming Soon",
  coming_soon_description: "This calculator will be available in the next development phase. Implementation follows ACC/AHA guidelines for clinical accuracy.",
  reset: "Reset",
  back: "Back",
  next: "Next",
  demographic: "Demographics",
  lab_values: "Lab Values",
  // risk_factors: "Risk Factors", // Duplicate, already above as riskFactors
  // results: "Results", // Duplicate
  // interpretation: "Interpretation", // Duplicate
  // recommendations: "Recommendations", // Duplicate
  // high_risk: "High Risk", // Duplicate
  intermediate_risk: "Intermediate Risk", // Note: different from moderateRisk, keep if distinct
  // low_risk: "Low Risk", // Duplicate
  borderline_risk: "Borderline Risk",

  // Missing translation keys used by CalculatorResultShare
  ten_year_risk: "10-Year Risk",
  ascvd_risk: "ASCVD Risk",
  risk_category: "Risk Category",

  // Medical Terms (can be a sub-object if preferred, or flattened)
  // For simplicity with t('calculators.age'), keeping them somewhat flat here by prefixing if needed
  // Or, if Calculator.tsx uses t('calculators.medical_terms.age'), then nested is fine.
  // Assuming Calculators.tsx might use simpler keys directly from the calculator's own translations for specific fields.
  // These are general terms if needed at the common level.
  age: 'Age',
  weight: 'Weight',
  height: 'Height',
  bmi: 'BMI',
  bloodPressure: 'Blood Pressure',
  systolic: 'Systolic',
  diastolic: 'Diastolic',
  heartRate: 'Heart Rate',
  cholesterol: 'Cholesterol',
  glucose: 'Glucose',
  creatinine: 'Creatinine',
  hemoglobin: 'Hemoglobin',
  pregnancy: 'Pregnancy',
  menopause: 'Menopause',
  smoking: 'Smoking',
  diabetes: 'Diabetes',
  hypertension: 'Hypertension',
  familyHistory: 'Family History',
  medications: 'Medications',
  allergies: 'Allergies',
  symptoms: 'Symptoms',
  diagnosis: 'Diagnosis',
  treatment: 'Treatment',
  prognosis: 'Prognosis',
  followUp: 'Follow-up',

  miscellaneous: "Other",
  
  // Calculator Result Share Component
  calculator_results_summary: "Calculator Results Summary",
  shared: "Shared",
  sharing: "Sharing...",
  share_with_ai: "Share with AI",
  key_results: "Key Results:",
  clinical_interpretation_label: "Clinical Interpretation:",
  recommendations_label: "Recommendations:",
  more_recommendations: "more recommendations",
  universal_recommendations: "Universal Recommendations",
  share_results_description: "Share these results with your AI Co-Pilot for detailed analysis and next steps",

  // Common risk levels
  risk_levels: {
    low: 'Low',
    moderate: 'Moderate',
    intermediate: 'Intermediate',
    high: 'High',
    very_high: 'Very High'
  },
}; 