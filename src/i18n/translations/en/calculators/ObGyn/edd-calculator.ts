export const eddCalculator = {
  // Basic Info
  title: "EDD Calculator",
  subtitle: "Estimated Date of Delivery Calculator",
  
  // Main Interface
  acog_evidence_based: "ACOG Evidence-Based Dating",
  tool_description: "Professional pregnancy dating calculator using multiple evidence-based methods for accurate gestational age estimation and due date prediction.",
  acog_committee_reference: "ACOG Committee Opinion No. 700 - Due Date Estimation",
  
  // Progress Steps
  dating_methods: "Dating Methods",
  multiple_dating_methods: "Choose one or more dating methods for most accurate estimation",
  next_clinical_review: "Next: Clinical Review",
  clinical_data_review: "Clinical Data Review",
  review_dating_parameters: "Review your selected dating parameters and calculation accuracy",
  back: "Back",
  calculate_due_date: "Calculate Due Date",
  
  // Dating Methods
  lmp_method: "Last Menstrual Period (LMP)",
  ultrasound_method: "Ultrasound Dating",
  art_method: "ART (Assisted Reproductive Technology)",
  
  // Confidence Levels
  moderate_confidence: "Moderate Confidence",
  high_confidence: "High Confidence",
  
  // LMP Section
  lmp_date_label: "Last Menstrual Period (LMP) Date",
  lmp_date_help: "First day of your last menstrual period",
  cycle_days_label: "Cycle Length",
  cycle_days_unit: "days",
  cycle_days_help: "Average menstrual cycle length (21-35 days)",
  
  // Ultrasound Section
  first_trimester_crl_label: "Crown-Rump Length (CRL)",
  first_trimester_crl_unit: "mm",
  first_trimester_crl_help: "First trimester ultrasound measurement (15-95mm, 6-14 weeks)",
  
  // ART Section
  art_transfer_date_label: "Embryo Transfer Date",
  art_transfer_date_help: "Date of embryo transfer procedure",
  art_days_to_transfer_label: "Days to Transfer",
  day_3_cleavage: "Day 3 (Cleavage stage)",
  day_5_blastocyst: "Day 5 (Blastocyst)",
  day_6_expanded_blastocyst: "Day 6 (Expanded blastocyst)",
  
  // Clinical Review Section
  selected_dating_method: "Selected Dating Method",
  expected_accuracy: "Expected Accuracy",
  
  // Accuracy Information
  ultrasound_crl_accuracy: "±3-5 days accuracy in first trimester",
  art_dating_accuracy: "±1 day accuracy (most precise)",
  lmp_dating_accuracy: "±1-2 weeks accuracy (cycle dependent)",
  
  // ACOG Guidelines
  acog_guidelines: "ACOG Guidelines",
  acog_guideline_1: "First trimester ultrasound is most accurate for dating when CRL 15-95mm",
  acog_guideline_2: "LMP dating acceptable when reliable and consistent with clinical findings",
  acog_guideline_3: "ART dating is highly accurate due to known conception timing",
  acog_guideline_4: "Discrepancies >7 days should favor ultrasound over LMP dating",
  
  // Results Section
  edd_analysis: "EDD Analysis",
  dating_method_label: "Dating Method:",
  confidence_label: "Confidence:",
  estimated_due_date: "Estimated Due Date",
  forty_weeks_gestation: "40 weeks gestation",
  current_status: "Current Status",
  current_gestational_age: "Current gestational age",
  clinical_recommendations: "Clinical Recommendations",
  evidence_base: "Evidence Base",
  
  // Display Labels
  lmp_display: "LMP",
  crl_display: "CRL",
  art_display: "ART",
  cycle_display: "Cycle",
  mm_unit: "mm",
  days_unit: "days",
  transfer_suffix: "transfer",
  day_prefix: "Day",
  
  // Action Buttons
  new_assessment: "New Assessment",
  modify_inputs: "Modify Inputs",
  
  // Footer
  based_on_acog_700: "Based on ACOG Committee Opinion No. 700",
  educational_purposes_only: "For educational purposes only",
  acog_2017_guidelines: "ACOG 2017 Guidelines",
  
  // About Section
  about_edd_calculator: "About EDD Calculator",
  about_subtitle: "Evidence-Based Pregnancy Dating Methods",
  clinical_purpose: "Clinical Purpose",
  clinical_purpose_description: "This calculator provides evidence-based gestational age estimation using multiple validated dating methods. It follows ACOG Committee Opinion No. 700 guidelines for accurate pregnancy dating and due date determination.",
  
  evidence_based_dating_methods: "Evidence-Based Dating Methods",
  multiple_approaches_accuracy: "Multiple approaches ensure the most accurate gestational age estimation",
  
  // Method Details
  last_menstrual_period_lmp: "Last Menstrual Period (LMP)",
  moderate_accuracy_days: "±7-14 days accuracy",
  naegele_rule_description: "Traditional method using Naegele's rule: LMP + 280 days with cycle length adjustments.",
  standard_28_day_cycle: "• Standard 28-day cycle assumption",
  cycle_length_adjustments: "• Cycle length adjustments applied",
  requires_accurate_lmp: "• Requires accurate LMP recall",
  
  high_confidence_accuracy: "±3-5 days accuracy",
  crl_most_accurate: "Crown-rump length measurement provides the most accurate dating in first trimester (6-14 weeks).",
  crl_range_weeks: "• CRL range: 15-95mm (6-14 weeks)",
  robinson_fleming_formula: "• Robinson-Fleming formula",
  gold_standard_dating: "• Gold standard for first trimester",
  
  highly_accurate_known_conception: "Highly accurate dating method with known conception timing from assisted reproductive technology.",
  transfer_day_options: "• Day 3, 5, or 6 transfer options",
  known_conception_timing: "• Known conception timing",
  precise_developmental_stage: "• Precise developmental stage",
  
  // Clinical Guidelines Section
  clinical_guidelines_evidence: "Clinical Guidelines & Evidence",
  acog_guidelines_section: "ACOG Guidelines",
  acog_committee_700: "• ACOG Committee Opinion No. 700",
  acog_practice_175: "• ACOG Practice Bulletin No. 175",
  first_trimester_preferred: "• First trimester ultrasound preferred",
  discrepancy_ultrasound: "• >7 day discrepancy favors ultrasound",
  
  clinical_applications: "Clinical Applications",
  prenatal_care_scheduling: "• Prenatal care scheduling",
  screening_test_timing: "• Screening test timing",
  labor_delivery_planning: "• Labor & delivery planning",
  fetal_growth_baselines: "• Fetal growth assessment baselines",
  
  // Important Notes
  important_clinical_considerations: "Important Clinical Considerations",
  clinical_calculator_notice: "This calculator provides evidence-based estimates for clinical decision-making. Always consider individual patient factors and clinical judgment.",
  statistical_reality: "Statistical Reality",
  five_percent_exact_date: "Only ~5% of babies are born on exact due date",
  clinical_range: "Clinical Range",
  normal_delivery_weeks: "Normal delivery: 37-42 weeks gestation",
  
  // Error Messages
  general_error: "Please select at least one dating method",
  lmp_date_error: "LMP date cannot be in the future",
  lmp_date_far_past_error: "LMP date cannot be more than 300 days ago",
  first_trimester_crl_error: "CRL must be between 15-95mm",
  art_days_to_transfer_required: "Days to transfer is required for ART method",
  art_days_to_transfer_error: "Days to transfer must be 3, 5, or 6",
  cycle_days_error: "Cycle length must be between 21-35 days",
  calculation_failed: "Calculation failed. Please check your inputs and try again.",
}; 