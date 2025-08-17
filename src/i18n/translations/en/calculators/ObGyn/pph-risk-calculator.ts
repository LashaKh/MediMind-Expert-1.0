export const pphRiskCalculator = {
  title: 'Postpartum Hemorrhage Risk Assessment',
  subtitle: 'Evidence-based risk stratification for maternal hemorrhage prevention',
  system_title: 'PPH Risk Assessment System',
  system_description: 'Evidence-based tool for identifying postpartum hemorrhage risk and implementing appropriate preventive measures',
  
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
        description: 'Basic patient information'
      },
      medical_history: {
        title: 'Medical History',
        description: 'Previous obstetric history'
      },
      current_pregnancy: {
        title: 'Current Pregnancy',
        description: 'Current pregnancy factors'
      }
    }
  },
  
  // Step 1: Demographics
  demographics: {
    title: 'Patient Demographics',
    step_label: 'Step 1 of 3',
    maternal_age: {
      label: 'Maternal Age',
      placeholder: 'Enter age',
      unit: 'years',
      help: 'Age at time of delivery',
      required_error: 'Maternal age is required',
      validation_error: 'Age must be between 15-55 years'
    },
    bmi: {
      label: 'Body Mass Index (BMI)',
      placeholder: 'Enter BMI',
      unit: 'kg/m²',
      help: 'Pre-pregnancy or early pregnancy BMI',
      required_error: 'BMI is required',
      validation_error: 'BMI must be between 15-60'
    },
    parity: {
      label: 'Parity',
      placeholder: 'Number of births',
      unit: 'births',
      help: 'Number of previous births ≥20 weeks',
      required_error: 'Parity is required',
      validation_error: 'Parity must be 0-20'
    },
    next_button: 'Next Step'
  },
  
  // Step 2: Medical History
  medical_history: {
    title: 'Medical & Obstetric History',
    step_label: 'Step 2 of 3',
    obstetric_history: {
      title: 'Previous Obstetric History',
      previous_pph: {
        label: 'Previous Postpartum Hemorrhage',
        description: 'History of PPH in previous deliveries'
      },
      anticoagulation: {
        label: 'Anticoagulation Therapy',
        description: 'Currently on anticoagulant medications'
      }
    },
    previous_button: 'Previous',
    next_button: 'Next Step'
  },
  
  // Step 3: Current Pregnancy
  current_pregnancy: {
    title: 'Current Pregnancy & Labor Factors',
    step_label: 'Step 3 of 3',
    pregnancy_factors: {
      title: 'Current Pregnancy Factors',
      multiple_gestation: {
        label: 'Multiple Gestation',
        description: 'Twins, triplets, or higher-order multiples'
      },
      polyhydramnios: {
        label: 'Polyhydramnios',
        description: 'Excessive amniotic fluid'
      },
      macrosomia: {
        label: 'Fetal Macrosomia',
        description: 'Estimated fetal weight ≥4000g'
      },
      chorioamnionitis: {
        label: 'Chorioamnionitis',
        description: 'Intra-amniotic infection'
      }
    },
    labor_factors: {
      title: 'Labor & Delivery Factors',
      prolonged_labor: {
        label: 'Prolonged Labor',
        description: 'Labor duration >20 hours (nullipara) or >14 hours (multipara)'
      },
      placental_condition: {
        label: 'Placental Condition',
        help: 'Select placental abnormality if present',
        options: {
          normal: 'Normal Placentation',
          previa: 'Placenta Previa',
          accreta: 'Placenta Accreta Spectrum',
          abruption: 'Placental Abruption'
        }
      }
    },
    calculating: 'Calculating...',
    calculate_button: 'Calculate Risk',
    reset_button: 'Reset Form',
    previous_button: 'Previous'
  },
  
  // Results Section
  results: {
    title: 'PPH Risk Assessment Results',
    risk_level: '{{category}} Risk',
    score: 'Score: {{score}}/20',
    categories: {
      low: 'Low',
      moderate: 'Moderate',
      high: 'High',
      'very-high': 'Very High',
      very_high: 'Very High'
    },
    interpretations: {
      assessment_prefix: "PPH risk assessment indicates",
      category_suffix: "risk category (Score:",
      low: 'Standard prevention protocols are appropriate with routine postpartum monitoring.',
      moderate: 'Enhanced prevention strategies recommended with increased monitoring and preparation.',
      high: 'High-risk protocols required with immediate availability of emergency interventions.',
      'very-high': 'Very high-risk patient requiring maximal preparation, multidisciplinary involvement, and enhanced emergency protocols. Early identification and preparation are essential for optimal maternal outcomes.',
      very_high: 'Very high-risk patient requiring maximal preparation, multidisciplinary involvement, and enhanced emergency protocols. Early identification and preparation are essential for optimal maternal outcomes.'
    },
    prevention_strategies: {
      standard: 'Standard prevention protocol',
      enhanced: 'Enhanced prevention protocol',
      'high-risk': 'High-risk prevention protocol'
    },
    emergency_preparations: {
      standard: 'Standard emergency protocols',
      enhanced: 'Enhanced emergency protocols required'
    },
    cards: {
      prevention_strategy: {
        title: 'Prevention Strategy',
        description: '{{strategy}} prevention protocol'
      },
      emergency_preparedness: {
        title: 'Emergency Preparedness',
        enhanced: 'Enhanced emergency protocols required',
        standard: 'Standard emergency protocols'
      },
      intervention_plan: {
        title: 'Intervention Plan'
      },
      management_recommendations: {
        title: 'Management Recommendations'
      }
    },
    share: {
      calculator_name: 'PPH Risk Assessment',
      results_summary: {
        risk_level: 'Risk Level',
        risk_score: 'Risk Score',
        prevention_strategy: 'Prevention Strategy',
        emergency_preparation: 'Emergency Preparation',
        required: 'Required',
        standard: 'Standard'
      }
    },
    intervention_plans: {
      standard: [
        'Active management of third stage of labor',
        'Immediate postpartum uterine massage',
        'Oxytocin 10-20 units IM or IV after delivery',
        'Quantitative blood loss assessment'
      ],
      enhanced: [
        'Large bore IV access (18-gauge or larger)',
        'Type and screen for blood products',
        'Anesthesia team notification',
        'Operating room availability confirmation',
        'Consider additional uterotonic agents ready'
      ],
      high_risk: [
        'Type and crossmatch 2-4 units blood',
        'Second IV access established',
        'Anesthesia team present at delivery',
        'Blood bank notification and products ready',
        'Senior obstetrician involvement',
        'Consider cell saver if available'
      ],
      very_high_risk: [
        'Multidisciplinary team meeting pre-delivery',
        'Consider delivery in main operating room',
        'Maternal-fetal medicine consultation',
        'Interventional radiology team on standby',
        'Consider uterine artery balloon placement',
        'ICU bed availability confirmed'
      ]
    },
    recommendations: {
      universal: [
        'Establish IV access upon admission to labor unit',
        'Baseline hemoglobin and hematocrit levels',
        'Blood type and antibody screen',
        'Continuous monitoring during active labor',
        'Team communication of risk status'
      ],
      low: [
        'Standard postpartum monitoring protocols',
        'Early ambulation and breastfeeding support',
        'Standard discharge planning'
      ],
      moderate: [
        'Enhanced postpartum monitoring for 24 hours',
        'Serial hemoglobin assessment',
        'Consider extended observation',
        'Clear emergency action plan documented'
      ],
      high: [
        'Continuous postpartum monitoring for 24-48 hours',
        'Serial complete blood counts',
        'Coagulation studies if indicated',
        'Consider prophylactic transfusion if Hgb <7 g/dL',
        'Delayed discharge until stable'
      ],
      very_high: [
        'ICU-level monitoring consideration',
        'Frequent vital signs and laboratory monitoring',
        'Early hematology consultation',
        'Consider prophylactic procedures pre-delivery',
        'Extended hospital stay planning'
      ],
      placenta_accreta: [
        'Urology consultation for potential bladder involvement',
        'Cesarean hysterectomy counseling and consent',
        'Consider leaving placenta in place if accreta diagnosed'
      ],
      previous_pph: [
        'Review previous PPH details and management',
        'Identify specific causes of previous hemorrhage',
        'Patient counseling about recurrence risk'
      ],
      anticoagulation: [
        'Hematology consultation for anticoagulation management',
        'Plan for reversal agents if needed',
        'Coordinate with maternal medicine team'
      ],
      multiple_gestation: [
        'Enhanced monitoring for uterine atony',
        'Consider early oxytocin administration',
        'Pediatric team coordination for multiple infants'
      ]
    }
  },
  
  // About Section
  about: {
    title: 'About PPH Risk Assessment',
    clinical_purpose: {
      title: 'Clinical Purpose',
      description1: 'This tool provides evidence-based risk stratification for postpartum hemorrhage (PPH), enabling proactive management and improved maternal outcomes.',
      description2: 'The assessment incorporates maternal demographics, medical history, and current pregnancy factors to generate comprehensive risk scores and management recommendations.'
    },
    risk_factors: {
      title: 'Major Risk Factors',
      items: {
        '0': 'Previous postpartum hemorrhage',
        '1': 'Placenta previa or accreta spectrum',
        '2': 'Multiple gestation (twins/multiples)',
        '3': 'Grand multiparity (≥5 deliveries)',
        '4': 'Polyhydramnios (excessive amniotic fluid)',
        '5': 'Fetal macrosomia (≥4000g)',
        '6': 'Prolonged labor duration',
        '7': 'Chorioamnionitis infection'
      }
    },
    prevention_strategies: {
      title: 'Prevention Strategies',
      items: {
        '0': 'Active management of third stage',
        '1': 'Prophylactic uterotonic agents',
        '2': 'IV access and blood type/screen',
        '3': 'Anesthesia team consultation',
        '4': 'Blood bank notification',
        '5': 'Delivery room preparation',
        '6': 'Multidisciplinary team communication'
      }
    },
    pph_definition: {
      title: 'PPH Definition & Management',
      definition: {
        title: 'Definition',
        items: {
          '0': 'Vaginal delivery: Blood loss ≥500 mL within 24 hours',
          '1': 'Cesarean delivery: Blood loss ≥1000 mL within 24 hours',
          '2': 'Any blood loss causing hemodynamic instability'
        }
      },
      management: {
        title: 'Initial Management',
        items: {
          '0': 'Immediate uterine massage and bimanual compression',
          '1': 'Oxytocin 20-40 units in 1L normal saline',
          '2': 'Secondary uterotonics: ergot alkaloids, prostaglandins',
          '3': 'Surgical interventions if medical management fails'
        }
      }
    },
    clinical_guidelines: {
      title: 'Clinical Guidelines',
      items: {
        '0': 'ACOG Practice Bulletin No. 183: Postpartum Hemorrhage',
        '1': 'WHO Guidelines: Management of postpartum haemorrhage and retained placenta',
        '2': 'SMFM Consult Series: Postpartum hemorrhage risk assessment',
        '3': 'California Maternal Quality Care Collaborative: OB hemorrhage toolkit',
        '4': 'National Partnership for Maternal Safety: Consensus bundle on obstetric hemorrhage'
      }
    }
  },
  
  // Error Messages
  calculation_error: 'Error calculating PPH risk. Please check your inputs.'
}; 