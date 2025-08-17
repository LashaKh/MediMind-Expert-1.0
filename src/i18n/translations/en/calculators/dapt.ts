export const daptTranslations = {
  title: 'DAPT Score Calculator',
  subtitle: 'Dual Antiplatelet Therapy Duration • Risk-Benefit Assessment',
  description: "Risk-benefit assessment of extended dual antiplatelet therapy duration after PCI.",
  
  // Alert section
  therapy_management_tool: "Therapy Management Tool",
  tool_description: "DAPT Score Calculator helps determine optimal dual antiplatelet therapy duration after percutaneous coronary intervention (PCI) by balancing ischemic and bleeding risks.",
  study_validated: "DAPT Study Validated",
  
  // Progress steps
  patient_profile: "Patient Profile",
  risk_assessment: "Risk Assessment", 
  dapt_analysis: "DAPT Analysis",
  
  // Step 1: Demographics
  demographics_section: "Patient Demographics & Procedure Details",
  demographics_description: "Enter basic patient information and procedural details",
  age_label: "Age",
  age_help: "Patient age in years (affects bleeding risk calculation)",
  age_error: "Age must be between 18-120 years",
  stent_diameter_label: "Stent Diameter",
  stent_diameter_help: "Smallest stent diameter used during PCI procedure",
  stent_diameter_error: "Stent diameter must be between 1-10 mm",
  next_risk_factors: "Next: Risk Factors",
  
  // Step 2: Risk factors
  risk_factors_section: "Clinical Risk Factors",
  risk_factors_description: "Select all applicable clinical risk factors for this patient",
  cigarette_smoking: "Cigarette Smoking",
  cigarette_smoking_desc: "Current smoker or quit within past year",
  diabetes_mellitus: "Diabetes Mellitus",
  diabetes_mellitus_desc: "Type 1 or Type 2 diabetes requiring medication",
  mi_at_presentation: "MI at Presentation",
  mi_at_presentation_desc: "STEMI or NSTEMI as indication for current PCI",
  prior_pci_mi: "Prior PCI or MI",
  prior_pci_mi_desc: "Previous percutaneous coronary intervention or myocardial infarction",
  paclitaxel_stent: "Paclitaxel-Eluting Stent",
  paclitaxel_stent_desc: "Use of paclitaxel-eluting drug-eluting stent",
  chf_lvef: "CHF or LVEF <30%",
  chf_lvef_desc: "Congestive heart failure or left ventricular ejection fraction <30%",
  next_specialized_factors: "Next: Specialized Factors",
  
  // Step 3: Specialized factors
  specialized_factors_section: "Specialized Procedural Factors",
  specialized_factors_description: "Additional procedural and anatomical considerations",
  vein_graft_pci: "Vein Graft PCI",
  vein_graft_pci_desc: "PCI performed on saphenous vein graft or other bypass graft",
  
  // Calculation button
  calculate_button: "Calculate DAPT Score",
  
  // Results
  score_analysis: "DAPT Score Analysis",
  score_points: "{{score}} points",
  ischemic_benefit: "Ischemic Benefit",
  bleeding_risk: "Bleeding Risk",
  net_benefit: "Net Clinical Benefit",
  
  // Risk levels
  high_risk: "High",
  intermediate_risk: "Intermediate", 
  low_risk: "Low",
  
  // Risk descriptions
  mace_reduction: "{{reduction}}% MACE reduction",
  bleeding_increase: "{{increase}}% bleeding increase",
  
  // Net benefit categories
  favorable_benefit: "Favorable",
  uncertain_benefit: "Uncertain",
  unfavorable_benefit: "Unfavorable",
  benefits_outweigh_risks: "Benefits outweigh risks",
  requires_individual_assessment: "Requires individualized assessment",
  risks_outweigh_benefits: "Risks outweigh benefits",
  assessment_required: "Assessment Required",
  clinical_evaluation_needed: "Clinical evaluation needed",
  
  // Net benefit descriptions
  net_benefit_strong: "Strong net clinical benefit - ischemic risk reduction substantially outweighs bleeding risk",
  net_benefit_modest: "Modest net clinical benefit with careful patient selection", 
  net_benefit_harm: "Net clinical harm - bleeding risk outweighs ischemic benefit",
  net_benefit_modest_uncertain: "Modest benefit with uncertainty - individualized assessment recommended",
  net_benefit_neutral: "Neutral net benefit - requires careful individual consideration",
  net_benefit_unfavorable: "Unfavorable balance - bleeding risk likely outweighs benefit",
  net_benefit_harm_elderly: "Net harm in elderly - high bleeding risk with limited ischemic benefit",
  net_benefit_neutral_unfavorable: "Neutral to unfavorable - limited ischemic benefit",
  
  // Recommendations
  recommendation_extended_strongly: "Extended DAPT strongly recommended - high ischemic benefit with acceptable bleeding risk",
  recommendation_extended_may_benefit: "Extended DAPT may provide benefit - consider individualized assessment",
  recommendation_not_recommended_bleeding: "Extended DAPT not recommended due to excessive bleeding risk",
  recommendation_individualized_assessment: "Individualized assessment recommended - benefits and risks are balanced",
  recommendation_careful_consideration: "Careful consideration needed - uncertain net benefit",
  recommendation_not_recommended: "Extended DAPT not recommended - unfavorable risk-benefit ratio",
  recommendation_not_recommended_limited: "Extended DAPT not recommended - limited ischemic benefit",
  
  // Duration guidance
  duration_18_30_months: "Consider 18-30 months of DAPT with close monitoring",
  duration_18_months_monitoring: "Consider 18 months with enhanced bleeding monitoring",
  duration_12_months_early: "Standard 12 months, consider early discontinuation if bleeding occurs",
  duration_12_18_individualized: "12-18 months based on individualized risk assessment",
  duration_12_months_rationale: "Standard 12 months unless compelling rationale for extension",
  duration_12_months_early_consideration: "Standard 12 months with early discontinuation consideration",
  duration_12_months_shorter: "Standard 12 months or shorter if high bleeding risk",
  
  // Clinical considerations
  consideration_advanced_age: "Advanced age (≥75 years) significantly increases bleeding risk",
  consideration_moderate_age: "Moderate age-related bleeding risk (65-74 years)",
  consideration_diabetes: "Diabetes increases both ischemic and bleeding risk",
  consideration_mi_presentation: "Recent MI increases ischemic risk and DAPT benefit",
  consideration_small_vessel: "Small vessel PCI (<3mm) increases risk of stent thrombosis",
  consideration_heart_failure: "Heart failure increases both ischemic and bleeding risk",
  consideration_paclitaxel_stent: "Paclitaxel-eluting stents may benefit from extended DAPT",
  consideration_vein_graft: "Vein graft PCI has unique risk profile requiring individualized approach",
  
  // Duration recommendation section
  duration_recommendation: "Duration Recommendation",
  clinical_considerations: "Clinical Considerations",
  
  // Interpretation guide
  interpretation_guide: "DAPT Score Interpretation Guide",
  score_high: "Score ≥2 (High Benefit)",
  score_high_desc: "Likely to benefit from extended DAPT duration",
  score_intermediate: "Score 1 (Intermediate Benefit)", 
  score_intermediate_desc: "May benefit from extended DAPT with careful assessment",
  score_low: "Score ≤0 (Low/No Benefit)",
  score_low_desc: "Limited benefit from extended DAPT, bleeding risk may outweigh benefit",
  
  // Interpretations
  interpretation_high: "High benefit patient (Score: {{{score}}}) - Extended DAPT likely beneficial",
  interpretation_intermediate: "Intermediate benefit patient (Score: {{{score}}}) - Consider extended DAPT",
  interpretation_low: "Low benefit patient (Score: {{{score}}}) - Extended DAPT may be harmful",
  
  // Enhanced algorithm
  enhanced_algorithm: "Enhanced Algorithm Validation",
  algorithm_validation: "This calculator incorporates age-adjusted bleeding risk assessment and evidence-based recommendations from the DAPT Study for optimal clinical decision-making.",
  
  // Action buttons
  new_assessment: "New Assessment",
  modify_inputs: "Modify Inputs",
  
  // Creator Insights Section
  creator_insights_title: "Creator Insights",
  creator_name: "Dr. Robert W. Yeh",
  creator_bio: "Associate Professor of Medicine at Harvard Medical School and Director of the Richard and Susan Smith Center for Outcomes Research in Cardiology at Beth Israel Deaconess Medical Center.",
  
  creator_insight_condensed: "Determining optimal antiplatelet therapy duration after coronary stents requires balancing heart attack prevention against bleeding risk. The DAPT Score, developed from the largest randomized trial (11,648 patients) at Harvard Clinical Research Institute, helps identify patients who benefit from extended therapy versus those better served by shorter durations. This validated tool guides clinical decisions alongside physician judgment, effectively separating high ischemic/low bleeding risk patients from those with opposite risk profiles. Essential for shared decision-making in routine practice.",
  
  // Evidence Section
  evidence_title: "Evidence & Formula",
  evidence_formula_title: "DAPT Score Formula",
  formula_description: "Addition of the selected points:",
  age_scoring: "Age: ≥75 years (-2 points), 65-74 years (-1 point), <65 years (0 points)",
  risk_factors_scoring: "Risk factors: Each selected factor adds +1 point (smoking, diabetes, MI at presentation, prior PCI/MI, paclitaxel stent, stent <3mm, CHF/LVEF<30%, vein graft)",
  interpretation_note: "Score ≥2: High ischemic/low bleeding risk - Prolonged DAPT recommended | Score -2 to 1: Low ischemic/high bleeding risk - Prolonged DAPT not recommended",
  
  evidence_validation_title: "Study Validation",
  evidence_validation_description: "Developed and validated using data from the DAPT Study, the largest randomized trial of DAPT duration involving 11,648 patients. The score was subsequently validated in multiple independent cohorts including Japanese PCI studies and real-world registries, consistently demonstrating its ability to identify patients who benefit from extended DAPT.",
  
  evidence_guidelines_title: "Clinical Guidelines",
  evidence_guidelines_description: "Incorporated into the 2016 ACC/AHA Guideline Focused Update on Duration of Dual Antiplatelet Therapy. The DAPT Score is recommended as a clinical decision tool to inform DAPT duration decisions in patients who have completed 12 months of DAPT without bleeding complications.",
  
  references_title: "References",
  reference_original: "Original DAPT Score Development (Yeh et al. JAMA 2016)",
  reference_validation: "Validation Studies (Piccolo et al. Ann Intern Med 2017)",
  reference_guidelines: "ACC/AHA Guidelines (Levine et al. JACC 2016)"
};

export default daptTranslations; 