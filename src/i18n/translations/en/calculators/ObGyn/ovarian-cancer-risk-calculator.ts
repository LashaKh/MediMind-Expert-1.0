export const ovarianCancerRiskCalculator = {
  title: 'Ovarian Cancer Risk Assessment',
  subtitle: 'Evidence-based ovarian cancer risk evaluation with genetic and reproductive factor analysis',
  
  // Tab labels
  tabs: {
    calculator: 'Calculator',
    about: 'About'
  },
  
  // Progress indicator - UPDATED STRUCTURE
  progress: {
    title: 'Risk Assessment Progress',
    step_label: 'Step {{step}} of 3',
    steps: {
      demographics: {
        title: 'Demographics',
        description: 'Age & reproductive history'
      },
      genetic: {
        title: 'Genetic Factors',
        description: 'BRCA & family history'
      },
      assessment: {
        title: 'Risk Assessment',
        description: 'Calculate & review'
      }
    }
  },
  
  // Step 1 - UPDATED STRUCTURE
  step1: {
    title: 'Demographics & Reproductive History',
    step_indicator: 'Step 1 of 3',
    age: {
      label: 'Patient Age',
      unit: 'years',
      help_text: 'Current age in years',
      required_error: 'Age is required',
      validation_error: 'Please enter a valid age (18-100 years)'
    },
    parity: {
      label: 'Parity (Number of Births)',
      unit: 'births',
      help_text: 'Total number of live births',
      required_error: 'Parity is required', 
      validation_error: 'Please enter a valid number (0-20)'
    },
    hormonal_history: {
      title: 'Hormonal History',
      oral_contraceptive: {
        label: 'Oral Contraceptive Use',
        unit: 'years',
        help_text: 'Enter 0 if never used oral contraceptives',
        required_error: 'Oral contraceptive use duration is required',
        validation_error: 'Please enter a valid duration (0-50 years)'
      },
      hormone_therapy: {
        label: 'Hormone Replacement Therapy',
        description: 'Current or previous HRT use'
      }
    },
    next_button: 'Next: Genetic Factors'
  },
  
  // Step 2 - NEW STRUCTURE
  step2: {
    title: 'Genetic Risk Factors',
    step_indicator: 'Step 2 of 3',
    family_history: {
      title: 'Family History',
      label: 'Family History of Cancer',
      help_text: 'First or second-degree relatives with cancer history',
      options: {
        none: 'No family history of cancer',
        ovarian: 'Ovarian cancer history',
        breast: 'Breast cancer history',
        both: 'Both ovarian and breast cancer history'
      }
    },
    genetic_mutations: {
      title: 'Known Genetic Mutations',
      brca1: {
        label: 'BRCA1 Mutation',
        description: 'Known pathogenic BRCA1 variant (17q21)'
      },
      brca2: {
        label: 'BRCA2 Mutation',
        description: 'Known pathogenic BRCA2 variant (13q13)'
      },
      lynch_syndrome: {
        label: 'Lynch Syndrome',
        description: 'Hereditary nonpolyposis colorectal cancer (MLH1, MSH2, MSH6, PMS2)'
      },
      personal_breast_cancer: {
        label: 'Personal Breast Cancer History',
        description: 'Previous diagnosis of breast cancer'
      }
    },
    buttons: {
      previous: 'Previous',
      next: 'Next: Calculate Risk'
    }
  },
  
  // Step 3 - NEW STRUCTURE  
  step3: {
    title: 'Risk Assessment Review',
    step_indicator: 'Step 3 of 3',
    summary: {
      title: 'Assessment Summary',
      labels: {
        age: 'Age',
        parity: 'Parity',
        oc_use: 'OC Use',
        hrt: 'HRT',
        family_history: 'Family History',
        brca1: 'BRCA1',
        brca2: 'BRCA2',
        lynch_syndrome: 'Lynch Syndrome'
      },
      values: {
        years: 'years',
        births: 'births',
        yes: 'Yes',
        no: 'No',
        none: 'None',
        positive: 'Positive',
        negative: 'Negative'
      }
    },
    buttons: {
      previous: 'Previous',
      calculating: 'Calculating Risk...',
      calculate: 'Calculate Risk Assessment',
      reset: 'Reset All Fields'
    }
  },

  // About section - COMPLETE STRUCTURE MATCHING GEORGIAN
  about: {
    title: 'About Ovarian Cancer Risk Assessment',
    clinical_purpose: {
      title: 'Clinical Purpose',
      description_1: 'This calculator provides comprehensive ovarian cancer risk assessment incorporating genetic, family history, and reproductive factors to guide screening and prevention strategies.',
      description_2: 'Ovarian cancer has the highest mortality among gynecologic cancers, making risk stratification crucial for early detection and prevention in high-risk populations. Risk-based management optimizes surveillance while minimizing unnecessary interventions.'
    },
    
    risk_factors: {
      high_risk: {
        title: 'High-Risk Factors',
        items: [
          'BRCA1 mutation (39-46% lifetime risk)',
          'BRCA2 mutation (12-20% lifetime risk)', 
          'Lynch syndrome (9-12% lifetime risk)',
          'Strong family history (2+ relatives)',
          'Personal breast cancer history',
          'Ashkenazi Jewish ancestry',
          'Nulliparity (no pregnancies)',
          'Late menopause (>55 years)',
          'Hormone replacement therapy',
          'Endometriosis',
          'Talc exposure (perineal use)'
        ]
      },
      protective: {
        title: 'Protective Factors',
        items: [
          'Oral contraceptive use (5+ years)',
          'Multiparity (2+ pregnancies)',
          'Extended breastfeeding (>12 months)',
          'Tubal ligation',
          'Hysterectomy (with ovaries retained)',
          'Early menopause (<45 years)',
          'Prophylactic oophorectomy',
          'Lower BMI (<25 kg/m²)',
          'NSAID use (aspirin)',
          'Mediterranean diet'
        ]
      }
    },
    
    management_strategies: {
      title: 'Risk-Based Management Strategies',
      very_high_risk: {
        title: 'Very High Risk (BRCA1/2, Lynch Syndrome)',
        strategies: [
          'Consider prophylactic bilateral salpingo-oophorectomy (PBSO)',
          'Enhanced surveillance: CA-125 + transvaginal ultrasound q6months',
          'Annual pelvic MRI for very high-risk patients',
          'Genetic counseling and family cascade testing',
          'Risk-reducing strategies counseling'
        ]
      },
      moderate_risk: {
        title: 'Moderate Risk (Family History)',
        strategies: [
          'Enhanced surveillance with CA-125 + TVS annually',
          'Genetic counseling evaluation',
          'Risk factor modification counseling',
          'Symptom awareness education'
        ]
      },
      average_risk: {
        title: 'Average Risk (General Population)',
        strategies: [
          'No routine screening recommended (insufficient evidence)',
          'Symptom awareness and education',
          'Risk factor modification (OC use, family planning)',
          'Annual pelvic examination'
        ]
      }
    },
    
    symptoms: {
      title: 'Clinical Symptom Recognition',
      early_warning: {
        title: 'Early Warning Signs (Often Subtle)',
        signs: [
          'Persistent abdominal bloating or distension',
          'Difficulty eating or feeling full quickly',
          'Pelvic or abdominal pain',
          'Urinary urgency or frequency',
          'Unusual fatigue',
          'Irregular menstrual bleeding'
        ]
      },
      advanced_disease: {
        title: 'Advanced Disease Signs',
        signs: [
          'Ascites (abdominal fluid accumulation)',
          'Bowel obstruction symptoms',
          'Pleural effusion (shortness of breath)',
          'Palpable adnexal masses',
          'Significant weight loss'
        ]
      }
    },
    
    genetic_testing: {
      title: 'Genetic Testing Considerations',
      brca_testing: {
        title: 'BRCA Testing Indications',
        indications: [
          'Personal history: Breast cancer ≤45 years',
          'Personal history: Triple-negative breast cancer ≤60 years',
          'Personal history: Ovarian cancer at any age',
          'Family history: ≥2 breast cancers (same side of family)',
          'Family history: Breast and ovarian cancer',
          'Family history: Male breast cancer',
          'Ashkenazi Jewish ancestry with relevant history'
        ]
      },
      lynch_testing: {
        title: 'Lynch Syndrome Testing',
        indications: [
          'Colorectal cancer <50 years',
          'Endometrial cancer <50 years',
          'Multiple Lynch-associated cancers',
          'Family history meeting Amsterdam criteria',
          'Tumor microsatellite instability (MSI-H)'
        ]
      }
    },
    
    guidelines: {
      title: 'Clinical Guidelines & Evidence',
      references: [
        'NCCN Guidelines v2024.1: Ovarian cancer screening and risk reduction strategies',
        'SGO Clinical Practice Statement: Genetic testing for hereditary breast and ovarian cancer',
        'ACOG Practice Bulletin No. 182: Hereditary cancer syndromes and risk assessment',
        'USPSTF 2018: Risk assessment, genetic counseling, and genetic testing for BRCA-related cancer',
        'ESMO Guidelines: Hereditary breast and ovarian cancer syndrome management',
        'NICE Guidelines CG164: Familial breast cancer classification and care',
        'CDC Tier 1 Evidence: BRCA testing for women with family history'
      ]
    }
  },
  
  // Service layer translations
  service: {
    risk_factors: {
      brca1_mutation: 'BRCA1 mutation (very high risk)',
      brca2_mutation: 'BRCA2 mutation (high risk)',
      lynch_syndrome: 'Lynch syndrome (high risk)',
      family_history_ovarian: 'Family history of ovarian cancer',
      family_history_breast: 'Family history of breast cancer',
      family_history_both: 'Family history of ovarian and breast cancer',
      personal_breast_cancer: 'Personal history of breast cancer',
      peak_age_group: 'Peak age group',
      advanced_age: 'Advanced age',
      nulliparity: 'Nulliparity',
      multiparity: 'Multiparity (protective factor)',
      oral_contraceptive_use: 'Oral contraceptive use (protective factor)',
      oral_contraceptive_protective: 'Oral contraceptive use: {years} years (protective factor)',
      hormone_therapy: 'Hormone replacement therapy'
    },
    
    risk_interpretations: {
      population_average: 'population average',
      risk_factors_prefix: 'Risk factors: ',
      no_risk_factors: 'No significant risk factors identified.'
    },
    
    clinical_recommendations: {
      genetic_counseling: 'Genetic counseling and family cascade testing recommended',
      prophylactic_surgery: 'Discuss timing of prophylactic surgery based on reproductive plans',
      consider_genetic_testing: 'Consider genetic counseling and BRCA/Lynch syndrome testing',
      symptom_awareness: 'Educate on ovarian cancer symptoms: bloating, pelvic pain, urinary symptoms, early satiety',
      symptom_awareness_short: 'Symptom awareness education',
      pregnancy_consideration: 'Consider pregnancy and breastfeeding for risk reduction',
      oc_consideration: 'Discuss oral contraceptive use for ovarian cancer risk reduction'
    },
    
    screening_recommendations: {
      high_risk_surveillance: 'Enhanced surveillance TVS/CA-125 every 6 months. Consider prophylactic bilateral salpingo-oophorectomy.',
      population_based: 'Population-based screening not recommended. Focus on symptom awareness.'
    },
    
    references: [
      'NCCN Guidelines for Genetic/Familial High-Risk Assessment: Breast, Ovarian, and Pancreatic',
      'SGO Clinical Practice Statement: Genetic Testing for Ovarian Cancer',
      'ACOG Practice Bulletin: Hereditary Cancer Syndromes and Risk Assessment',
      'Cancer Epidemiology, Biomarkers & Prevention: Ovarian Cancer Risk Factors'
    ]
  },
  
  // Results section
  results: {
    title: 'Ovarian Cancer Risk Assessment',
    
    risk_levels: {
      low: 'Low Risk',
      moderate: 'Moderate Risk',
      high: 'High Risk',
      'very-high': 'Very High Risk'
    },
    
    lifetime_risk_label: 'Lifetime Risk',
    
    lifetime_risk: {
      title: 'lifetime ovarian cancer risk'
    },
    
    management: {
      title: 'Management Recommendations',
      description: 'Based on risk assessment, follow evidence-based recommendations for monitoring and prevention.'
    },
    
    screening: {
      title: 'Screening Recommendations'
    },
    
    share: {
      calculator_name: 'Ovarian Cancer Risk Assessment',
      
      results_summary: {
        risk_level: 'Risk Level',
        lifetime_risk: 'Lifetime Risk',
        risk_multiplier: 'Risk Multiplier',
        screening_recommendation: 'Screening Recommendation',
        prophylactic_surgery_discussion: 'Prophylactic Surgery Discussion',
        yes: 'Yes',
        no: 'No'
      }
    }
  },
  
  // Error messages
  errors: {
    calculation_error: 'An error occurred during calculation. Please try again.',
    general_error: 'Please check your input and try again.'
  }
}; 