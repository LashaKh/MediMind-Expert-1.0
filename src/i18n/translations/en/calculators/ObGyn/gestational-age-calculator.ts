export const gestationalAgeCalculator = {
  title: "Gestational Age Calculator",
  subtitle: "Accurate Gestational Age Assessment",
  description: "Professional gestational age calculation using multiple dating methods for accurate clinical assessment",

  // ACOG Alert
  acog_alert: {
    title: "ACOG Guidelines",
    content: "First-trimester ultrasound is most accurate for dating. LMP may be unreliable due to irregular cycles or recall bias. Clinical judgment should guide method selection."
  },

  // Progress Steps
  progress: {
    step1: "Method Selection",
    step2: "Data Entry", 
    step3: "Calculate"
  },

  // Method Selection
  method_selection: {
    title: "Select Dating Method",
    description: "Choose the most appropriate method based on available clinical data",
    
    lmp: {
      title: "Last Menstrual Period",
      accuracy: "±7 days accuracy",
      description: "Calculate based on first day of last menstrual period. Requires regular 28-day cycles for optimal accuracy.",
      label: "First day of last menstrual period",
      help: "Select the first day of the patient's last normal menstrual period"
    },
    
    ultrasound: {
      title: "First Trimester Ultrasound",
      accuracy: "±5 days accuracy",
      description: "Most accurate method using crown-rump length (CRL) measurement from 6-14 weeks gestation.",
      crl_label: "Crown-Rump Length (CRL)",
      crl_placeholder: "Enter CRL measurement",
      crl_unit: "mm",
      crl_help: "CRL measurement from first trimester ultrasound (15-95 mm)",
      crl_error: "CRL must be between 15-95 mm"
    },
    
    edd: {
      title: "Known Due Date",
      accuracy: "Calculated backwards",
      description: "Calculate current gestational age from a previously established estimated due date.",
      label: "Estimated due date",
      help: "Previously calculated or established due date"
    }
  },

  // Reference Date
  reference: {
    title: "Reference Date Setup",
    description: "Set the date for which you want to calculate gestational age",
    date_label: "Reference date",
    date_help: "Date for gestational age calculation (typically today's date)"
  },

  // Calculation Section
  calculation: {
    description: "Review information and calculate gestational age",
    summary: "Calculation Summary"
  },

  // Validation Messages
  validation: {
    reference_date_required: "Reference date is required",
    method_required: "At least one dating method must be provided", 
    lmp_after_reference: "LMP date cannot be after reference date",
    lmp_too_far: "LMP date seems too far in the past (>300 days)",
    edd_before_reference: "Due date cannot be before reference date",
    calculation_error: "Error during calculation. Please check your inputs."
  },

  // Results
  results: {
    title: "Gestational Age Results",
    gestational_age: "Gestational Age",
    trimester: "Trimester",
    calculation_method: "Calculation Method",
    estimated_due_date: "Estimated Due Date",
    reference_date: "Reference Date",
    
    method_names: {
      lmp: "Last Menstrual Period",
      crl: "Ultrasound CRL",
      edd: "Known Due Date"
    },
    
    trimester_names: {
      first: "First Trimester",
      second: "Second Trimester", 
      third: "Third Trimester"
    }
  },

  // Buttons
  buttons: {
    continue: "Continue",
    calculate: "Calculate Gestational Age",
    new_calculation: "New Calculation"
  },

  // Footer
  footer: {
    disclaimer: "For clinical use by qualified healthcare professionals",
    guidelines: "ACOG Guidelines Compliant"
  },

  // About Section
  about: {
    title: "About Gestational Age Calculator",
    subtitle: "Clinical Documentation and Guidelines",
    
    clinical_purpose: {
      title: "Clinical Purpose",
      description: "Accurate gestational age assessment is fundamental to prenatal care, enabling appropriate timing of interventions, screening tests, and delivery planning according to ACOG guidelines."
    },
    
    methods: {
      title: "Calculation Methods",
      description: "Three primary methods for gestational age calculation, each with specific clinical applications:",
      
      lmp_method: {
        title: "LMP Method",
        accuracy: "±7 days",
        description: "Traditional method using Naegele's rule (LMP + 280 days). Most accessible but requires accurate recall and regular cycles.",
        features: {
          accessible: "Universally accessible method",
          recall: "Dependent on patient recall accuracy",
          regular: "Assumes regular 28-day cycles"
        }
      },
      
      ultrasound_method: {
        title: "Ultrasound CRL",
        accuracy: "±5 days",
        description: "Gold standard for early pregnancy dating using crown-rump length measurement in first trimester.",
        features: {
          range: "Optimal accuracy: 6-14 weeks",
          formula: "Uses validated CRL formulas",
          standard: "ACOG preferred method"
        }
      },
      
      edd_method: {
        title: "Known EDD",
        accuracy: "Reference-based",
        description: "Calculates current gestational age from previously established due date, maintaining consistency.",
        features: {
          established: "Uses established due date",
          reverse: "Reverse calculation method",
          consistent: "Maintains dating consistency"
        }
      }
    },
    
    applications: {
      prenatal_care: {
        title: "Prenatal Care Applications",
        scheduling: "Prenatal visit scheduling",
        genetic: "Genetic screening timing",
        delivery: "Delivery planning",
        growth: "Fetal growth assessment"
      },
      
      clinical_management: {
        title: "Clinical Management",
        medication: "Medication dosing adjustments",
        viability: "Viability assessments",
        specialized: "Specialized care referrals",
        decisions: "Timing of interventions"
      }
    },
    
    guidelines: {
      title: "Clinical Guidelines",
      
      acog: {
        title: "ACOG Recommendations",
        opinion_700: "Committee Opinion 700: Gestational Age Assessment",
        bulletin_175: "Practice Bulletin 175: Ultrasound in Pregnancy",
        opinion_611: "Committee Opinion 611: Method for Estimating Due Date",
        first_trimester: "First-trimester ultrasound preferred for dating"
      },
      
      best_practices: {
        title: "Best Practices",
        early_dating: "Establish dating early in pregnancy",
        flexibility: "Consider method limitations",
        comparison: "Compare multiple methods when available",
        judgment: "Apply clinical judgment to discrepancies"
      }
    },
    
    trimesters: {
      title: "Trimester Definitions",
      
      first: {
        title: "First Trimester",
        weeks: "0-13 weeks 6 days",
        description: "Critical period for organogenesis and early development screening"
      },
      
      second: {
        title: "Second Trimester", 
        weeks: "14-27 weeks 6 days",
        description: "Optimal period for detailed anatomy scanning and genetic testing"
      },
      
      third: {
        title: "Third Trimester",
        weeks: "28 weeks - delivery",
        description: "Focus on growth monitoring and delivery preparation"
      }
    }
  }
}; 