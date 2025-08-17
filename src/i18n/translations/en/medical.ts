export const medical = {
  // Medical Specialties
  specialty: {
    cardiology: 'Cardiology',
    obgyn: 'Obstetrics and Gynecology',
    neurology: 'Neurology',
    endocrinology: 'Endocrinology',
    general: 'General Medicine'
  },

  // Patient Demographics
  patient: {
    age: 'Age',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    weight: 'Weight',
    height: 'Height',
    bmi: 'BMI',
    bloodPressure: 'Blood Pressure',
    systolic: 'Systolic',
    diastolic: 'Diastolic',
    heartRate: 'Heart Rate',
    temperature: 'Temperature'
  },

  // Symptoms
  symptoms: {
    chestPain: 'Chest Pain',
    shortnessOfBreath: 'Shortness of Breath',
    palpitations: 'Palpitations',
    dizziness: 'Dizziness',
    fatigue: 'Fatigue',
    syncope: 'Syncope',
    nausea: 'Nausea',
    vomiting: 'Vomiting',
    headache: 'Headache',
    abdominalPain: 'Abdominal Pain',
    backPain: 'Back Pain',
    jointPain: 'Joint Pain',
    muscleWeakness: 'Muscle Weakness',
    fever: 'Fever',
    cough: 'Cough',
    wheezing: 'Wheezing'
  },

  // Diagnosis
  diagnosis: {
    primary: 'Primary Diagnosis',
    secondary: 'Secondary Diagnosis',
    differential: 'Differential Diagnosis',
    provisional: 'Provisional Diagnosis',
    final: 'Final Diagnosis',
    ruleOut: 'Rule Out',
    suspected: 'Suspected',
    confirmed: 'Confirmed',
    probable: 'Probable',
    possible: 'Possible'
  },

  // Treatment
  treatment: {
    medication: 'Medication',
    dosage: 'Dosage',
    frequency: 'Frequency',
    duration: 'Duration',
    instructions: 'Instructions',
    contraindications: 'Contraindications',
    sideEffects: 'Side Effects',
    monitoring: 'Monitoring',
    followUp: 'Follow-up',
    therapy: 'Therapy',
    intervention: 'Intervention',
    management: 'Management'
  },

  // Medical Units
  units: {
    // Weight
    kg: 'kg',
    g: 'g',
    mg: 'mg',
    lbs: 'lbs',
    
    // Length
    cm: 'cm',
    m: 'm',
    mm: 'mm',
    ft: 'ft',
    in: 'in',
    
    // Pressure
    mmHg: 'mmHg',
    kPa: 'kPa',
    
    // Laboratory
    mgdL: 'mg/dL',
    mmolL: 'mmol/L',
    gdL: 'g/dL',
    IUL: 'IU/L',
    mEqL: 'mEq/L',
    ngmL: 'ng/mL',
    pgmL: 'pg/mL',
    mIUmL: 'mIU/mL',
    
    // Time
    years: 'years',
    months: 'months',
    weeks: 'weeks',
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    
    // Volume
    mL: 'mL',
    L: 'L',
    
    // Frequency
    bpm: 'bpm',
    perMin: '/min',
    perHour: '/hour',
    perDay: '/day',
    
    // Temperature
    celsius: '°C',
    fahrenheit: '°F',
    
    // Percentage
    percent: '%'
  },

  // Medical Conditions
  conditions: {
    diabetes: 'Diabetes',
    hypertension: 'Hypertension',
    hyperlipidemia: 'Hyperlipidemia',
    coronaryArteryDisease: 'Coronary Artery Disease',
    heartFailure: 'Heart Failure',
    atrialFibrillation: 'Atrial Fibrillation',
    myocardialInfarction: 'Myocardial Infarction',
    stroke: 'Stroke',
    obesity: 'Obesity',
    metabolicSyndrome: 'Metabolic Syndrome',
    chronicKidneyDisease: 'Chronic Kidney Disease',
    copd: 'COPD',
    asthma: 'Asthma',
    depression: 'Depression',
    anxiety: 'Anxiety'
  },

  // Medical Procedures
  procedures: {
    ecg: 'ECG',
    echocardiogram: 'Echocardiogram',
    stressTest: 'Stress Test',
    catheterization: 'Catheterization',
    angioplasty: 'Angioplasty',
    surgery: 'Surgery',
    biopsy: 'Biopsy',
    bloodTest: 'Blood Test',
    imaging: 'Imaging',
    xray: 'X-ray',
    ct: 'CT Scan',
    mri: 'MRI',
    ultrasound: 'Ultrasound',
    colonoscopy: 'Colonoscopy',
    endoscopy: 'Endoscopy'
  },

  // Risk Assessment
  risk: {
    factors: {
      age: 'Age',
      gender: 'Gender',
      smoking: 'Smoking',
      diabetes: 'Diabetes',
      hypertension: 'Hypertension',
      familyHistory: 'Family History',
      obesity: 'Obesity',
      inactivity: 'Physical Inactivity',
      cholesterol: 'High Cholesterol',
      alcohol: 'Alcohol Use',
      stress: 'Stress'
    },
    levels: {
      low: 'Low Risk',
      moderate: 'Moderate Risk',
      high: 'High Risk',
      veryHigh: 'Very High Risk',
      borderline: 'Borderline Risk',
      intermediate: 'Intermediate Risk'
    },
    cardiovascular: {
      low: 'Low Cardiovascular Risk',
      moderate: 'Moderate Cardiovascular Risk',
      high: 'High Cardiovascular Risk',
      veryHigh: 'Very High Cardiovascular Risk'
    }
  },

  // Laboratory Values
  laboratory: {
    cholesterol: {
      total: 'Total Cholesterol',
      ldl: 'LDL Cholesterol',
      hdl: 'HDL Cholesterol',
      triglycerides: 'Triglycerides',
      nonHdl: 'Non-HDL Cholesterol'
    },
    glucose: {
      fasting: 'Fasting Glucose',
      random: 'Random Glucose',
      hba1c: 'HbA1c',
      ogtt: 'Oral Glucose Tolerance Test',
      postprandial: 'Postprandial Glucose'
    },
    cardiac: {
      troponin: 'Troponin',
      bnp: 'BNP',
      ck: 'Creatine Kinase',
      ldh: 'LDH',
      ckMb: 'CK-MB',
      myoglobin: 'Myoglobin'
    },
    renal: {
      creatinine: 'Creatinine',
      bun: 'BUN',
      egfr: 'eGFR',
      albumin: 'Albumin',
      protein: 'Protein',
      urea: 'Urea'
    },
    liver: {
      alt: 'ALT',
      ast: 'AST',
      bilirubin: 'Bilirubin',
      alkalinePhosphatase: 'Alkaline Phosphatase',
      albumin: 'Albumin',
      ggt: 'GGT'
    },
    hematology: {
      hemoglobin: 'Hemoglobin',
      hematocrit: 'Hematocrit',
      wbc: 'White Blood Cells',
      rbc: 'Red Blood Cells',
      platelets: 'Platelets',
      mcv: 'MCV',
      mch: 'MCH',
      mchc: 'MCHC'
    }
  },

  // Medical History
  history: {
    medical: 'Medical History',
    family: 'Family History',
    social: 'Social History',
    surgical: 'Surgical History',
    medications: 'Current Medications',
    allergies: 'Allergies',
    immunizations: 'Immunizations',
    hospitalizations: 'Previous Hospitalizations'
  },

  // Pregnancy and Obstetrics
  pregnancy: {
    trimester: 'Trimester',
    gestationalAge: 'Gestational Age',
    prenatal: 'Prenatal',
    postnatal: 'Postnatal',
    delivery: 'Delivery',
    cesarean: 'Cesarean Section',
    vaginal: 'Vaginal Delivery',
    fetal: 'Fetal',
    maternal: 'Maternal',
    gravida: 'Gravida',
    para: 'Para',
    preeclampsia: 'Preeclampsia',
    gestationalDiabetes: 'Gestational Diabetes'
  },

  // General Medical Terms
  general: {
    assessment: 'Assessment',
    evaluation: 'Evaluation',
    examination: 'Examination',
    consultation: 'Consultation',
    referral: 'Referral',
    recommendation: 'Recommendation',
    prognosis: 'Prognosis',
    etiology: 'Etiology',
    pathophysiology: 'Pathophysiology',
    epidemiology: 'Epidemiology'
  }
};

export default medical; 