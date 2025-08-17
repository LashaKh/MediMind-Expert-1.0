export const heartFailureStagingTranslations = {
  title: 'Heart Failure Staging',
  subtitle: 'ACC/AHA Heart Failure Stages A-D • Risk Assessment & Management',
  description: 'ACC/AHA heart failure staging system for risk assessment and management guidance.',
  
  // UI Button texts
  calculateButton: 'Calculate Heart Failure Stage',
  calculatingButton: 'Analyzing Heart Failure Stage...',
  resetButton: 'New Assessment',
  calculate_button: 'Determine HF Stage',
  
  // Sections structure
  sections: {
    stageA: {
      title: 'Stage A - Risk Factors Assessment',
      description: 'At high risk for HF but without structural heart disease or symptoms'
    },
    stageB: {
      title: 'Stage B - Structural Disease Assessment', 
      description: 'Structural heart disease without signs or symptoms of HF'
    },
    stageC: {
      title: 'Stage C - Symptomatic HF Assessment',
      description: 'Structural heart disease with prior or current symptoms of HF'
    },
    stageD: {
      title: 'Stage D - Advanced HF Assessment',
      description: 'Refractory HF requiring specialized interventions'
    }
  },
  
  // Questions structure
  questions: {
    stageA_riskFactors: {
      label: 'Patient with history of hypertension, cardiovascular disease, diabetes, or obesity',
      description: 'Common cardiovascular risk factors that predispose to heart failure development'
    },
    stageA_cardiotoxins: {
      label: 'Patient using cardiotoxins',
      description: 'Chemotherapy agents or radiation therapy with known cardiotoxic effects'
    },
    stageA_genetic: {
      label: 'Patient with genetic variant for cardiomyopathy or family history of cardiomyopathy',
      description: 'Hereditary predisposition to heart failure and cardiomyopathy'
    },
    stageB_structural: {
      label: 'Patient with structural heart disease',
      description: 'Reduced LVEF, wall motion abnormalities, LV hypertrophy, or significant valvular disease'
    },
    stageB_filling: {
      label: 'Patient with evidence of increased filling pressures',
      description: 'Invasive hemodynamic measurements or noninvasive imaging evidence of elevated pressures'
    },
    stageB_biomarkers: {
      label: 'Patient with increased natriuretic peptide levels or persistently elevated cardiac troponin',
      description: 'Elevated BNP/NT-proBNP or persistent troponin elevation in absence of competing diagnoses'
    },
    stageC_symptoms: {
      label: 'Patient with current or previous signs/symptoms of heart failure',
      description: 'Shortness of breath, dyspnea on exertion, fatigue, reduced exercise tolerance, or fluid retention'
    },
    stageD_advanced: {
      label: 'Patient with marked heart failure symptoms that interfere with daily life and with recurrent hospitalizations despite attempts to optimize guideline-directed medical therapy',
      description: 'Advanced heart failure requiring specialized care, mechanical support, or transplant evaluation'
    }
  },
  
  // Evidence section
  evidence: {
    title: 'Evidence & Formula',
    description: '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. Circulation. 2022;145(18):e895-e1032. This classification system enables early intervention and risk stratification to prevent progression and improve outcomes.',
    link: 'View Full Guidelines'
  },
  risk_category: 'Heart failure stage',
  recommendations: 'Management recommendations',
  low_risk: 'Stage A (At risk)',
  high_risk: 'Stage D (Advanced HF)',

  // Alert section
  alert_title: 'ACC/AHA Heart Failure Staging',
  alert_description: 'Comprehensive staging system for heart failure from risk factors to advanced disease. This validated classification guides evidence-based management and helps predict prognosis.',

  // Step navigation
  step_risk_factors: 'Risk Factors',
  step_structural_disease: 'Structural Disease',
  step_symptoms: 'Symptoms',
  step_advanced_hf: 'Advanced HF',

  // Section headers
  section_stage_a: 'Stage A - Risk Factors Assessment',
  section_stage_a_description: 'At high risk for HF but without structural heart disease or symptoms',
  section_stage_b: 'Stage B - Structural Disease Assessment', 
  section_stage_b_description: 'Structural heart disease without signs or symptoms of HF',
  section_stage_c: 'Stage C - Symptomatic HF Assessment',
  section_stage_c_description: 'Structural heart disease with prior or current symptoms of HF',
  section_stage_d: 'Stage D - Advanced HF Assessment',
  section_stage_d_description: 'Refractory HF requiring specialized interventions',

  // Stage A fields
  field_hypertension: 'Hypertension',
  field_hypertension_description: 'History of high blood pressure',
  field_diabetes: 'Diabetes mellitus',
  field_diabetes_description: 'Type 1 or Type 2 diabetes',
  field_cad: 'Coronary artery disease',
  field_cad_description: 'History of coronary artery disease',
  field_metabolic_syndrome: 'Metabolic syndrome',
  field_metabolic_syndrome_description: 'Cluster of metabolic risk factors',
  field_family_history_hf: 'Family history of heart failure',
  field_family_history_hf_description: 'Family history of cardiomyopathy',
  field_cardiotoxic_therapy: 'History of cardiotoxic therapy',
  field_cardiotoxic_therapy_description: 'Chemotherapy or radiation therapy',
  field_alcohol_abuse: 'History of alcohol abuse',
  field_alcohol_abuse_description: 'Chronic alcohol consumption',

  // Stage B fields
  field_lvef_reduced: 'Reduced left ventricular ejection fraction',
  field_lvef_reduced_description: 'LVEF <50% without symptoms',
  field_wall_motion_abnormalities: 'Regional wall motion abnormalities',
  field_wall_motion_abnormalities_description: 'Segmental wall motion defects',
  field_lv_hypertrophy: 'Left ventricular hypertrophy',
  field_lv_hypertrophy_description: 'Increased LV wall thickness',
  field_valvular_disease: 'Significant valvular disease',
  field_valvular_disease_description: 'Moderate to severe valve disease',

  // Stage C fields
  field_current_hf_symptoms: 'Current heart failure symptoms',
  field_current_hf_symptoms_description: 'Active dyspnea, fatigue, or edema',
  field_previous_hf_symptoms: 'Previous heart failure symptoms',
  field_previous_hf_symptoms_description: 'Prior HF symptoms now resolved',
  field_hf_hospitalizations: 'Prior heart failure hospitalizations',
  field_hf_hospitalizations_description: 'Previous admissions for HF',

  // Stage D fields
  field_refractory_symptoms: 'Refractory symptoms despite optimal therapy',
  field_refractory_symptoms_description: 'Symptoms persist despite maximum medical therapy',
  field_recurrent_hospitalizations: 'Recurrent hospitalizations',
  field_recurrent_hospitalizations_description: 'Multiple recent HF admissions',
  field_chronic_inotropic_support: 'Chronic inotropic support',
  field_chronic_inotropic_support_description: 'Ongoing inotropic medication requirement',
  field_mechanical_support: 'Mechanical circulatory support',
  field_mechanical_support_description: 'LVAD, ECMO, or balloon pump',
  field_transplant_evaluation: 'Heart transplant evaluation',
  field_transplant_evaluation_description: 'Listed or being evaluated for transplant',

  // Button labels
  button_next_structural: 'Next: Structural Disease',
  button_next_symptoms: 'Next: Symptoms',
  button_next_advanced_hf: 'Next: Advanced HF',
  button_back: 'Back',
  button_new_assessment: 'New Assessment',
  button_modify_inputs: 'Modify Inputs',

  // Results section
  results_title: 'Heart Failure Stage Analysis',
  results_stage: 'Stage',
  results_stage_classification: 'Stage Classification',
  results_risk_level: 'Risk Level',
  results_current_progression_risk: 'Current progression risk assessment',
  results_management_focus: 'Management Focus',
  results_prevention: 'Prevention strategies',
  results_monitoring: 'Monitoring and early intervention',
  results_treatment: 'Guideline-directed medical therapy',
  results_advanced_care: 'Advanced heart failure care',
  results_primary_management_approach: 'Primary management approach',
  results_management_recommendations: 'Management Recommendations',
  results_next_steps: 'Next Steps',
  results_staging_system_reference: 'ACC/AHA Heart Failure Staging Reference',

  // Results nested structure for stages
  results: {
    recommendations: {
      title: 'Management Recommendations'
    },
    nextSteps: {
      title: 'Next Steps'
    },
    stageA: {
      title: 'Stage A - At Risk',
      description: 'At high risk for heart failure development but without structural heart disease or symptoms',
      recommendations: [
        'Optimal hypertension management per current guidelines',
        'Comprehensive diabetes management with target HbA1c <7%',
        'Evidence-based lipid management and statin therapy',
        'Smoking cessation counseling and support programs',
        'Regular aerobic exercise and weight management',
        'Alcohol moderation and dietary sodium restriction'
      ],
      nextSteps: [
        'Primary care optimization with cardiovascular risk focus',
        'Comprehensive risk factor modification program',
        'Patient education on cardiovascular health',
        'Regular monitoring with annual assessments',
        'Baseline echocardiogram if multiple high-risk factors present'
      ]
    },
    stageB: {
      title: 'Stage B - Structural Disease',
      description: 'Structural heart disease without signs or symptoms of heart failure requiring preventive therapy',
      recommendations: [
        'ACE inhibitor or ARB therapy for cardiac protection',
        'Beta-blocker therapy if prior MI or reduced ejection fraction',
        'Treatment of underlying cardiovascular conditions',
        'Comprehensive risk factor modification program',
        'Regular echocardiographic monitoring for progression',
        'Symptom surveillance and patient education'
      ],
      nextSteps: [
        'Cardiology evaluation for structural heart disease management',
        'Annual or biannual echocardiogram monitoring',
        'Optimal medical therapy initiation and titration',
        'Patient education on heart failure symptoms recognition',
        'Aggressive risk factor management and lifestyle modification'
      ]
    },
    stageC: {
      title: 'Stage C - Symptomatic HF',
      description: 'Symptomatic heart failure with structural heart disease requiring guideline-directed medical therapy',
      recommendations: [
        'Comprehensive guideline-directed medical therapy optimization',
        'ACE inhibitor/ARB/ARNI therapy at maximum tolerated dose',
        'Evidence-based beta-blocker therapy initiation and titration',
        'Diuretics for optimal volume management and symptom control',
        'Device therapy evaluation (ICD/CRT) per current guidelines',
        'Regular monitoring and medication optimization'
      ],
      nextSteps: [
        'Cardiology referral for specialized heart failure management',
        'Comprehensive echocardiographic evaluation and monitoring',
        'Laboratory monitoring and medication adjustment',
        'Patient education and self-care management training',
        'Device therapy consideration and electrophysiology consultation'
      ]
    },
    stageD: {
      title: 'Stage D - Advanced HF',
      description: 'Advanced heart failure with refractory symptoms despite guideline-directed medical therapy requiring specialized interventions',
      recommendations: [
        'Advanced heart failure therapies and specialized care coordination',
        'Mechanical circulatory support evaluation with heart team consultation',
        'Heart transplantation evaluation at qualified center',
        'Palliative care consultation for symptom management',
        'Specialized heart failure center referral for comprehensive care',
        'Clinical trial consideration for experimental therapies'
      ],
      nextSteps: [
        'Immediate advanced heart failure specialist consultation',
        'Comprehensive hemodynamic and functional assessment',
        'Multidisciplinary heart team evaluation',
        'End-of-life planning and advanced directive discussions'
      ]
    }
  },
  
  // Stage reference results
  results_stage_a_reference: 'Stage A - At Risk',
  results_stage_a_description_reference: 'Risk factor modification and prevention',
  results_stage_b_reference: 'Stage B - Structural Disease',
  results_stage_b_description_reference: 'Structural heart disease without symptoms',
  results_stage_c_reference: 'Stage C - Symptomatic HF',
  results_stage_c_description_reference: 'Structural disease with HF symptoms',
  results_stage_d_reference: 'Stage D - Advanced HF',
  results_stage_d_description_reference: 'Refractory HF requiring specialized care',

  // Footer
  results_algorithm_validation_title: 'ACC/AHA Heart Failure Staging',
  results_algorithm_validation_description: '✓ ACC/AHA Guidelines Validated • Evidence-based staging system',
  footer_info: 'Based on ACC/AHA Heart Failure Guidelines • Evidence-based staging system',
  footer_validated: 'ACC/AHA Validated',

  // Creator Section
  creator_insights_title: 'About the Creator',
  creator_name: 'Dr. Sharon Hunt',
  creator_bio: 'Sharon Hunt, MD, is a professor of medicine at Stanford University as well as the Med Center Line. She is a member of the Cardiovascular Institute. Dr. Hunt\'s research focuses on cardiovascular diseases including heart failure and myocardial infarction and is a co-author on many ACC/AHA guidelines.',
  creator_publications_link: 'To view Dr. Sharon Hunt\'s publications, visit',

  // Evidence Section
  evidence_title: 'Evidence & Formula',
  evidence_formula_title: 'FORMULA',
  evidence_stage_a_title: 'Stage A (at risk for heart failure)',
  evidence_stage_a_definition: 'is defined as a patient without symptoms, structural heart disease, or cardiac biomarkers of stretch or injury but who has chronic condition(s) that put them at increased risk. These conditions include HTN, DM, atherosclerotic CVD, metabolic syndrome and obesity, exposure to cardiotoxic drugs, genetic variant carrier for cardiomyopathy, or a positive family history of cardiomyopathy.',
  
  evidence_stage_b_title: 'Stage B (pre-heart failure)',
  evidence_stage_b_definition: 'is defined as evidence of one of the following AND no symptoms or signs of heart failure.',
  evidence_stage_b_structural: '1. Structural heart disease includes:',
  evidence_stage_b_structural_items: 'Reduced left or right ventricular systolic function (ie reduced ejection fraction or reduced strain)\nVentricular hypertrophy\nChamber enlargement\nWall motion abnormalities\nValvular heart disease',
  evidence_stage_b_filling: '2. Evidence of increased filling pressures can be confirmed with:',
  evidence_stage_b_filling_items: 'Invasive hemodynamic measurements or\nNoninvasive imaging such as echocardiography',
  evidence_stage_b_biomarkers: '3. Patients with risk factors AND either',
  evidence_stage_b_biomarkers_items: 'Increased BNP or\nPersistently elevated cardiac troponin',

  evidence_stage_c_title: 'Stage C (symptomatic heart failure)',
  evidence_stage_c_definition: 'is defined as structural heart disease with current or previous symptoms of heart failure.',

  evidence_stage_d_title: 'Stage D (advanced heart failure)',
  evidence_stage_d_definition: 'is defined as marked symptoms of heart failure that interfere with daily life and lead to recurrent hospitalizations, despite goal directed medical therapy (GDMT).',

  evidence_appraisal_title: 'Evidence Appraisal',
  evidence_appraisal_text: 'The ACC/AHA Heart Failure Stages were developed jointly by the American College of Cardiology (ACC) and American Heart Association (AHA) by expert consensus. They were intended to complement, but not replace, the more widely-used New York Heart Association (NYHA) functional classification, since contemporary treatment recommendations did not vary by class.',

  evidence_literature_title: 'Literature',
  evidence_guidelines_title: 'Clinical Practice Guidelines',
  evidence_research_title: 'Research Paper',
  evidence_research_citation: 'Heidenreich PA, Bozkurt B, Aguilar D, et al. 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure: A Report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines. Circulation. 2022;145(18):e895-e1032.',

  // New fields for component
  main_title: 'Heart Failure Staging Calculator',
  main_subtitle: 'Advanced ACC/AHA classification system for precise heart failure staging with comprehensive clinical guidance',
  calculate_stage: 'Calculate Heart Failure Stage',
  analyzing_stage: 'Analyzing Heart Failure Stage...',
  
  // Stage A checkbox fields
  stage_a_risk_factors_label: 'Patient with history of hypertension, cardiovascular disease, diabetes, or obesity',
  stage_a_risk_factors_desc: 'Common cardiovascular risk factors that predispose to heart failure development',
  stage_a_cardiotoxins_label: 'Patient using cardiotoxins',
  stage_a_cardiotoxins_desc: 'Chemotherapy agents or radiation therapy with known cardiotoxic effects',
  stage_a_genetic_label: 'Patient with genetic variant for cardiomyopathy or family history of cardiomyopathy',
  stage_a_genetic_desc: 'Hereditary predisposition to heart failure and cardiomyopathy',
  
  // Stage B checkbox fields
  stage_b_structural_label: 'Patient with structural heart disease',
  stage_b_structural_desc: 'Reduced LVEF, wall motion abnormalities, LV hypertrophy, or significant valvular disease',
  stage_b_filling_label: 'Patient with evidence of increased filling pressures',
  stage_b_filling_desc: 'Invasive hemodynamic measurements or noninvasive imaging evidence of elevated pressures',
  stage_b_biomarkers_label: 'Patient with increased natriuretic peptide levels or persistently elevated cardiac troponin',
  stage_b_biomarkers_desc: 'Elevated BNP/NT-proBNP or persistent troponin elevation in absence of competing diagnoses',
  
  // Stage C checkbox field
  stage_c_symptoms_label: 'Patient with current or previous signs/symptoms of heart failure',
  stage_c_symptoms_desc: 'Shortness of breath, dyspnea on exertion, fatigue, reduced exercise tolerance, or fluid retention',
  
  // Stage D checkbox field
  stage_d_advanced_label: 'Patient with marked heart failure symptoms that interfere with daily life and with recurrent hospitalizations despite attempts to optimize guideline-directed medical therapy',
  stage_d_advanced_desc: 'Advanced heart failure requiring specialized care, mechanical support, or transplant evaluation',
  
  // Result descriptions
  stage_a_result_desc: 'At high risk for heart failure development but without structural heart disease or symptoms',
  stage_a_result_desc_low: 'Low risk for heart failure development with focus on primary prevention',
  stage_b_result_desc: 'Structural heart disease without signs or symptoms of heart failure requiring preventive therapy',
  stage_c_result_desc: 'Symptomatic heart failure with structural heart disease requiring guideline-directed medical therapy',
  stage_d_result_desc: 'Advanced heart failure with refractory symptoms despite guideline-directed medical therapy requiring specialized interventions',
  
  // Stage A recommendations
  stage_a_rec_1: 'Optimal hypertension management per current guidelines',
  stage_a_rec_2: 'Comprehensive diabetes management with target HbA1c <7%',
  stage_a_rec_3: 'Evidence-based lipid management and statin therapy',
  stage_a_rec_4: 'Smoking cessation counseling and support programs',
  stage_a_rec_5: 'Regular aerobic exercise and weight management',
  stage_a_rec_6: 'Alcohol moderation and dietary sodium restriction',
  stage_a_rec_low_1: 'Maintain healthy lifestyle with regular physical activity',
  stage_a_rec_low_2: 'Regular cardiovascular health screening and monitoring',
  stage_a_rec_low_3: 'Blood pressure monitoring and management',
  stage_a_rec_low_4: 'Healthy diet with emphasis on fruits, vegetables, and whole grains',
  
  // Stage B recommendations
  stage_b_rec_1: 'ACE inhibitor or ARB therapy for cardiac protection',
  stage_b_rec_2: 'Beta-blocker therapy if prior MI or reduced ejection fraction',
  stage_b_rec_3: 'Treatment of underlying cardiovascular conditions',
  stage_b_rec_4: 'Comprehensive risk factor modification program',
  stage_b_rec_5: 'Regular echocardiographic monitoring for progression',
  stage_b_rec_6: 'Symptom surveillance and patient education',
  
  // Stage C recommendations
  stage_c_rec_1: 'Comprehensive guideline-directed medical therapy optimization',
  stage_c_rec_2: 'ACE inhibitor/ARB/ARNI therapy at maximum tolerated dose',
  stage_c_rec_3: 'Evidence-based beta-blocker therapy initiation and titration',
  stage_c_rec_4: 'Diuretics for optimal volume management and symptom control',
  stage_c_rec_5: 'Device therapy evaluation (ICD/CRT) per current guidelines',
  stage_c_rec_6: 'Regular monitoring and medication optimization',
  
  // Stage D recommendations
  stage_d_rec_1: 'Advanced heart failure therapies and specialized care coordination',
  stage_d_rec_2: 'Mechanical circulatory support evaluation with heart team consultation',
  stage_d_rec_3: 'Heart transplantation evaluation at qualified center',
  stage_d_rec_4: 'Palliative care consultation for symptom management',
  stage_d_rec_5: 'Specialized heart failure center referral for comprehensive care',
  stage_d_rec_6: 'Clinical trial consideration for experimental therapies',
  
  // Stage A next steps
  stage_a_next_1: 'Primary care optimization with cardiovascular risk focus',
  stage_a_next_2: 'Comprehensive risk factor modification program',
  stage_a_next_3: 'Patient education on cardiovascular health',
  stage_a_next_4: 'Regular monitoring with annual assessments',
  stage_a_next_5: 'Baseline echocardiogram if multiple high-risk factors present',
  stage_a_next_low_1: 'Continue routine preventive care',
  stage_a_next_low_2: 'Annual health maintenance and screening',
  stage_a_next_low_3: 'Lifestyle counseling and education',
  stage_a_next_low_4: 'Regular follow-up with primary care provider',
  
  // Stage B next steps
  stage_b_next_1: 'Cardiology evaluation for structural heart disease management',
  stage_b_next_2: 'Annual or biannual echocardiogram monitoring',
  stage_b_next_3: 'Optimal medical therapy initiation and titration',
  stage_b_next_4: 'Patient education on heart failure symptoms recognition',
  stage_b_next_5: 'Aggressive risk factor management and lifestyle modification',
  
  // Stage C next steps
  stage_c_next_1: 'Cardiology referral for specialized heart failure management',
  stage_c_next_2: 'Comprehensive echocardiographic evaluation and monitoring',
  stage_c_next_3: 'Laboratory monitoring and medication adjustment',
  stage_c_next_4: 'Patient education and self-care management training',
  stage_c_next_5: 'Device therapy consideration and electrophysiology consultation',
  
  // Stage D next steps
  stage_d_next_1: 'Immediate advanced heart failure specialist consultation',
  stage_d_next_2: 'Comprehensive hemodynamic and functional assessment',
  stage_d_next_3: 'Multidisciplinary heart team evaluation',
  stage_d_next_4: 'End-of-life planning and advanced directive discussions',
  
  // Result card section
  heart_failure_stage: 'Heart Failure Stage',
  clinical_recommendations: 'Clinical Recommendations',
  next_steps: 'Next Steps',
  
  // Creator section updates
  creator_insights: 'Creator Insights',
  creator_guidance: 'Expert guidance from leading heart failure specialists',
  creator_full_title: 'Stanford University School of Medicine | Heart Failure Specialist',
  creator_description: 'Dr. Hunt is a renowned cardiologist and Professor of Cardiovascular Medicine at Stanford University. She has dedicated her career to advancing heart failure care and has been instrumental in developing evidence-based staging systems that improve patient outcomes through early detection and intervention.',
  view_publications: 'View Publications on PubMed',
  
  // Evidence section updates
  evidence_staging_criteria: 'Evidence & Staging Criteria',
  evidence_subtitle: 'ACC/AHA 2022 Heart Failure Guidelines - Complete Staging Framework',
  evidence_reference: 'Reference:',
  evidence_reference_text: '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. Circulation. 2022;145(18):e895-e1032. This classification system enables early intervention and risk stratification to prevent progression and improve outcomes.',
  
  // Management recommendations section
  management_recommendations: 'Management Recommendations',
  management_subtitle: 'Stage-specific therapeutic strategies and clinical interventions',
  
  // Stage titles for management
  stage_a_management_title: 'Risk Factor Management',
  stage_b_management_title: 'Structural Heart Disease Prevention',
  stage_c_management_title: 'Guideline-Directed Medical Therapy',
  stage_d_management_title: 'Advanced Heart Failure Management',
  
  // Clinical note
  clinical_note: 'Clinical Note:',
  clinical_note_text: 'All recommendations should be individualized based on patient characteristics, comorbidities, and clinical judgment. Regular monitoring and medication optimization are essential for optimal outcomes at every stage.',

  // Management Section
  management_title: 'MANAGEMENT',
  management_summary: 'Below is a summary of Class I recommendation statements. This list focuses on goal directed medical therapy (GDMT) and does not contain all guideline statements. Refer to the full guideline text for further details and management options.',

  management_stage_a_title: 'Stage A: Patients at high risk of developing HF because of the presence of conditions that are strongly associated with the development of HF.',
  management_stage_a_htn: 'In patients with HTN, blood pressure should be controlled with GDMT for HTN to prevent symptomatic heart failure. (LOE: A)',
  management_stage_a_dm: 'In patients with type 2 diabetes mellitus and either established CVD or who are at high cardiovascular risk, an SGLT2i should be used to prevent hospitalizations for heart failure. (LOE: A)',
  management_stage_a_lifestyle: 'Healthy lifestyle habits such as regular physical activity, maintaining normal weight, following a healthy diet, and avoiding smoking are helpful to reduce future risk of heart failure. (LOE: B-NR)',
  management_stage_a_cvd: 'In patients with CVD, optimal management is recommended.',
  management_stage_a_cardiotoxic: 'In patients with exposure to cardiotoxic agents, multidisciplinary management is recommended.',
  management_stage_a_genetic: 'For patients who have first-degree relatives with genetic or inherited cardiomyopathies, genetic screening and counseling is recommended.',

  management_stage_b_title: 'Stage B: Patients who have developed structural heart disease that is strongly associated with the development of HF but who have never shown signs or symptoms of HF.',
  management_stage_b_ace: 'In patients with LVEF <40%, treatment with an ACEi is recommended to prevent symptomatic heart failure and reduce mortality. (LOE: A)',
  management_stage_b_statin: 'In patients with a recent or remote history of MI or ACS, statins should be used to prevent symptomatic heart failure and adverse cardiovascular events. (LOE: B-R)',
  management_stage_b_arb: 'In patients with a recent MI and LVEF <40%, treatment with an ARB is recommended if an ACEI is not tolerated. (LOE: A)',
  management_stage_b_beta: 'In patients with LVEF <40% and a recent or remote history of MI or ACS, evidence-based beta blocker therapy is recommended. (LOE: B-R)',
  management_stage_b_icd: 'In patients with an LVEF <30%, >1 year survival, > 40 days post MI, treatment with an ICD is recommended to reduce mortality and for primary prevention of sudden cardiac death. (LOE: B-R)',
  management_stage_b_beta_prevent: 'In patients with LVEF <40%, beta blockers should be used to prevent symptomatic heart failure. (LOE: C-LD)',

  management_stage_c_title: 'Stage C: Patients who have current or prior symptoms of HF associated with underlying structural heart disease.',
  management_stage_c_diuretics: 'In patients who have fluid retention, diuretics are recommended to relieve congestion, improve symptoms, and prevent worsening heart failure. (Level of Evidence: B-NR)',
  management_stage_c_arni: 'In patients with HFrEF and NYHA class II or III symptoms, the use of an ARNi is recommended to reduce morbidity and mortality. (LOE: A)',
  management_stage_c_ace: 'The use of ACEi is beneficial to reduce morbidity and mortality when use of an ARNi is not feasible. (LOE: A)',
  management_stage_c_arb: 'The use of an ARB is recommended only if intolerant to an ACEi or ARNi. (LOE: A)',
  management_stage_c_arni_switch: 'In patients with chronic symptomatic HFrEF NYHA class II or III who are able to tolerate ACEi or ARB, replacement with an ARNi is recommended to further reduce morbidity and mortality. (LOE: B-R)',
  management_stage_c_beta_blocker: 'If a beta blocker is indicated, use of bisoprolol, carvedilol or metoprolol succinate is recommended to reduce mortality and hospitalizations. (LOE: A)',
  management_stage_c_mra: 'In patients with HFrEF and NYHA class II-IV symptoms, spironolactone or eplerenone is recommended to reduce morbidity and mortality. (LOE: A) eGFR should be >30 ml/min/1.73m2 and serum potassium should be <5.0 mEq/L.',
  management_stage_c_sglt2i: 'In patients with symptomatic chronic HFrEF, SGLT2i are recommended to reduce hospitalizations for heart failure and cardiovascular mortality, regardless of the presence or absence of type 2 diabetes. (LOE: A)',
  management_stage_c_hydralazine: 'For patients who self-identify as African American, who have NYHA class III-IV HFrEF, and who are receiving optimal medical therapy, the combination of hydralazine and isosorbide dinitrate is recommended to improve symptoms and reduce morbidity and mortality. (LOE: A)',

  management_stage_d_title: 'Stage D: Patients with advanced structural heart disease and marked symptoms of HF at rest despite maximal medical therapy and who require specialized interventions.',
  management_stage_d_referral: 'In patients with advanced heart failure, timely referral for HF specialty care is recommended (if consistent with patient\'s goals) to review management and advanced HF therapies. (LOE: C-LD)',
  management_stage_d_lvad: 'In select patients with advanced HFrEF with NYHA class IV symptoms who are deemed to be dependent on continuous IV inotropes or temporary MCS, durable LVAD implantation is effective to improve functional status, QOL, and survival. (LOE: A)',
  management_stage_d_transplant: 'For selected patients with advanced HF despite GDMT, cardiac transplantation is indicated to improve survival and QOL. (LOE: C-LD)',
  management_stage_d_assessment: 'In patients hospitalized with HF, severity of congestion and adequacy of perfusion should be assessed to guide triage and initial therapy. (LOE: C-LD).'
};

export default heartFailureStagingTranslations; 