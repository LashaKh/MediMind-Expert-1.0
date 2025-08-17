export const cervicalCancerRiskCalculator = {
  title: 'Cervical Cancer Risk Assessment',
  subtitle: 'ASCCP guideline-based cervical cancer risk assessment and management recommendations',
  
  // Tab Labels
  calculator_tab: 'Calculator',
  about_tab: 'About',
  
  // Progress Section
  progress: {
    title: 'Assessment Progress',
    step_indicator: 'Step {{step}} of 3',
    steps: {
      demographics: {
        title: 'Demographics',
        description: 'Basic information'
      },
      test_results: {
        title: 'Test Results',
        description: 'HPV & cytology'
      },
      risk_factors: {
        title: 'Risk Factors',
        description: 'Clinical history'
      }
    }
  },
  
  // Step 1: Demographics
  demographics: {
    title: 'Patient Demographics',
    step_label: 'Step 1 of 3',
    patient_age: {
      label: 'Patient Age',
      placeholder: '32',
      unit: 'years',
      help: 'Current age in years',
      required_error: 'Age is required',
      validation_error: 'Please enter a valid age (18-100 years)'
    },
    screening_history: {
      label: 'Screening History',
      help: 'Previous cervical cancer screening participation',
      options: {
        adequate: 'Adequate screening history',
        inadequate: 'Inadequate screening history',
        never_screened: 'Never been screened'
      }
    },
    next_button: 'Next: Test Results'
  },
  
  // Step 2: HPV and Cytology Test Results
  test_results: {
    title: 'HPV & Cytology Test Results',
    step_label: 'Step 2 of 3',
    hpv_test: {
      title: 'HPV Test Result',
      positive_high_risk: {
        label: 'HPV Positive (High-risk types)',
        description: 'Types 16, 18, 31, 33, 35, 39, 45, 51, 52, 56, 58, 59, 68'
      },
      positive_low_risk: {
        label: 'HPV Positive (Low-risk types)',
        description: 'Types 6, 11, and other low-risk types'
      },
      negative: {
        label: 'HPV Negative',
        description: 'No HPV DNA detected'
      },
      unknown: {
        label: 'HPV Unknown/Not tested',
        description: 'HPV testing not performed or results unavailable'
      }
    },
    cytology_test: {
      title: 'Cytology (Pap Test) Result',
      label: 'Cytology Result',
      help: 'Most recent cervical cytology (Pap test) result',
      options: {
        normal: 'Normal/NILM (Negative for Intraepithelial Lesion)',
        ascus: 'ASCUS (Atypical Squamous Cells of Undetermined Significance)',
        lsil: 'LSIL (Low-grade Squamous Intraepithelial Lesion)',
        hsil: 'HSIL (High-grade Squamous Intraepithelial Lesion)',
        asc_h: 'ASC-H (Atypical Squamous Cells, Cannot Exclude HSIL)',
        agc: 'AGC (Atypical Glandular Cells)'
      }
    },
    previous_button: 'Previous',
    next_button: 'Next: Risk Factors'
  },
  
  // Step 3: Clinical Risk Factors
  risk_factors: {
    title: 'Clinical Risk Factors',
    step_label: 'Step 3 of 3',
    medical_history: {
      title: 'Medical History',
      previous_abnormal_screening: {
        label: 'Previous Abnormal Screening',
        description: 'History of abnormal Pap tests or HPV results'
      },
      immunocompromised: {
        label: 'Immunocompromised Status',
        description: 'HIV, organ transplant, immunosuppressive therapy'
      }
    },
    lifestyle_factors: {
      title: 'Lifestyle Factors',
      smoking_status: {
        label: 'Current Smoker',
        description: 'Active tobacco use (increases cervical cancer risk)'
      }
    },
    previous_button: 'Previous',
    calculate_button: 'Calculate Risk Assessment',
    calculating: 'Calculating Risk...',
    reset_button: 'Reset All Fields'
  },
  
  // Results Section
  results: {
    title: 'Cervical Cancer Risk Assessment',
    risk_level: '{{level}} Risk',
    categories: {
      minimal: 'Minimal',
      low: 'Low',
      moderate: 'Moderate',
      intermediate: 'Intermediate',
      high: 'High',
      very_high: 'Very High'
    },
    management: {
      title: 'Management Recommendation',
      follow_up_title: 'Follow-up Interval'
    },
    asccp_recommendations: {
      title: 'ASCCP Management Recommendations',
      colposcopy_recommended: 'Colposcopy examination recommended'
    },
    clinical_recommendations: {
      title: 'Clinical Recommendations'
    },
    share: {
      calculator_name: 'Cervical Cancer Risk Assessment',
      results_summary: {
        risk_level: 'Risk Level',
        follow_up_interval: 'Follow-up Interval',
        management_recommendation: 'Management Recommendation',
        colposcopy_recommended: 'Colposcopy Recommended',
        yes: 'Yes',
        no: 'No'
      }
    }
  },
  
  // About Section
  about: {
    title: 'About Cervical Cancer Risk Assessment',
    clinical_purpose: {
      title: 'Clinical Purpose',
      description_1: 'This calculator provides comprehensive cervical cancer risk assessment based on ASCCP (American Society for Colposcopy and Cervical Pathology) guidelines and established clinical risk factors.',
      description_2: 'Cervical cancer is highly preventable through effective screening and vaccination. Risk-based management optimizes outcomes while reducing overtreatment and patient anxiety.'
    },
    risk_factors: {
      high_risk: {
        title: 'High-Risk Factors',
        items: [
          'High-risk HPV infection (16, 18, others)',
          'High-grade cytology (HSIL, ASC-H)',
          'Immunocompromised status',
          'Prior abnormal screening',
          'Smoking (current)',
          'Multiple sexual partners',
          'Early age at first intercourse',
          'Long-term oral contraceptive use'
        ]
      },
      protective: {
        title: 'Protective Factors',
        items: [
          'HPV vaccination',
          'Regular screening participation',
          'HPV-negative status',
          'Normal cytology',
          'Monogamous relationships',
          'No smoking history',
          'Normal immune function',
          'Adequate screening history'
        ]
      }
    },
    asccp_management: {
      title: 'ASCCP Risk-Based Management',
      immediate_risk: {
        title: 'Immediate Risk Categories',
        items: [
          'CIN 3+ risk ≥60%: Immediate treatment recommended',
          'CIN 3+ risk 25-59%: Colposcopy recommended',
          'CIN 3+ risk <25%: Surveillance or routine screening'
        ]
      },
      management_strategies: {
        title: 'Management Strategies',
        items: [
          'Risk-based colposcopy referral thresholds',
          'HPV testing algorithms',
          'Enhanced surveillance protocols',
          'HPV vaccination recommendations',
          'Patient counseling guidelines'
        ]
      }
    },
    screening_guidelines: {
      title: 'Screening Guidelines Summary',
      age_based: {
        title: 'Age-Based Screening',
        items: [
          'Ages 21-29: Cytology alone every 3 years',
          'Ages 30-65: HPV testing every 5 years (preferred) OR',
          'Ages 30-65: HPV/cytology co-testing every 5 years OR',
          'Ages 30-65: Cytology alone every 3 years',
          'Ages >65: Discontinue if adequate screening history'
        ]
      },
      special_populations: {
        title: 'Special Populations',
        items: [
          'Immunocompromised: More frequent screening',
          'Post-hysterectomy: Generally discontinue if no CIN 2+ history',
          'HPV vaccinated: Follow standard guidelines'
        ]
      }
    },
    clinical_guidelines: {
      title: 'Clinical Guidelines',
      items: [
        'ASCCP Guidelines 2019: Risk-based management of cervical screening abnormalities',
        'USPSTF 2018: Screening for cervical cancer recommendations',
        'ACOG Practice Bulletin No. 168: Cervical cancer screening and prevention',
        'ACS/ASCCP/ASCP Guidelines: Cervical cancer prevention and early detection',
        'CDC Guidelines: Cervical cancer screening guidelines for healthcare providers'
      ]
    }
  },
  
  // Error Messages
  errors: {
    calculation_error: 'An error occurred during calculation. Please try again.',
    general_error: 'An error occurred. Please try again.'
  },

  // Service layer translations for calculation results
  service: {
    risk_factors: {
      peak_incidence_age: 'Peak incidence age group',
      elevated_risk_age: 'Elevated risk age group',
      high_risk_hpv: 'High-risk HPV infection',
      low_risk_hpv: 'Low-risk HPV infection',
      hpv_negative: 'HPV negative (protective)',
      high_grade_cytology: 'High-grade cytologic abnormality',
      low_grade_cytology: 'Low-grade cytologic abnormality',
      ascus: 'Atypical cells of undetermined significance',
      agc: 'Atypical glandular cells',
      normal_cytology: 'Normal cytology (protective)',
      previous_abnormal: 'History of abnormal screening results',
      smoking: 'Current tobacco use',
      immunocompromised: 'Immunocompromised status',
      never_screened: 'Never screened',
      inadequate_screening: 'Inadequate screening history',
      adequate_screening: 'Adequate screening history (protective)'
    },
    management: {
      minimal: 'Continue routine screening per guidelines',
      low: 'Enhanced surveillance with co-testing or primary HPV testing',
      intermediate: 'Consider colposcopy referral, enhanced surveillance recommended',
      high: 'Immediate colposcopy referral strongly recommended'
    },
    follow_up: {
      minimal: '3-5 years (depending on age and screening method)',
      low: '1-3 years',
      intermediate: '6-12 months',
      high: '3-6 months'
    },
    interpretation: {
      minimal: 'Based on clinical risk factors, patient has minimal risk for cervical cancer. Key factors include:',
      low: 'Based on clinical risk factors, patient has low risk for cervical cancer. Key factors include:',
      intermediate: 'Based on clinical risk factors, patient has intermediate risk for cervical cancer. Key factors include:',
      high: 'Based on clinical risk factors, patient has high risk for cervical cancer. Key factors include:'
    },
    recommendations: {
      colposcopy: 'Refer for colposcopic evaluation',
      hpv_testing: 'Consider HPV testing if not recently performed',
      smoking_cessation: 'Smoking cessation counseling strongly recommended',
      enhanced_surveillance: 'Enhanced surveillance due to immunocompromised status'
    },
    references: [
      'ASCCP Risk-Based Management Consensus Guidelines (2019)',
      'American Cancer Society Cervical Cancer Screening Guidelines',
      'WHO Classification of Tumours of Female Reproductive Organs',
      'NCCN Guidelines for Cervical Cancer Screening'
    ]
  }
}; 