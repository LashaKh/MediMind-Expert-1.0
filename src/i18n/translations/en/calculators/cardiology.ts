import maggicTranslations from './maggic';
import riskAssessmentTranslations from './risk-assessment';
import { timiRiskScoreTranslations } from './timi-risk-score';
import grace2Translations from './grace-2';
import daptTranslations from './dapt';
import preciseDaptTranslations from './precise-dapt';
import ahaPreventTranslations from './aha-prevent';
import shfmTranslations from './shfm';
import gwtgHfRiskTranslations from './gwtg-hf-risk';
import { heartFailureStagingTranslations } from './heart-failure-staging';
import { stsAdultCardiacTranslations } from './sts-adult-cardiac';

export default {
  // Import risk assessment translations
  ...riskAssessmentTranslations,
  
  // Common translations
  title: 'Cardiology Calculators',
  description: 'Evidence-based cardiovascular risk assessment and clinical decision support tools',
  category: 'Cardiology',

  // Calculator titles for navigation
  graceTitle: 'GRACE 2.0 Calculator',
  hcmRiskScdTitle: 'HCM Risk-SCD Calculator',
  maggicTitle: maggicTranslations.title,
  gwtgHfTitle: 'GWTG-HF Calculator',
  heartFailureStagingTitle: 'Heart Failure Staging',
  shfmTitle: 'SHFM Risk Calculator',
  stsTitle: 'STS Risk Calculator',
  euroScoreTitle: 'EuroSCORE II Calculator',
  timiTitle: 'TIMI Risk Calculator',
  preventTitle: 'AHA PREVENT Calculator',
  hcmAfTitle: 'HCM-AF Calculator',
  chadsVascTitle: 'CHA2DS2-VASc Calculator',
  hasBleedTitle: 'HAS-BLED Calculator',
  chads2Title: 'CHADS2 Calculator',

  // Calculator references used by main calculator list
  timi_risk: {
    title: 'TIMI Risk Calculator',
    subtitle: 'Unstable Angina/NSTEMI Risk Assessment'
  },
  
  grace_acs: {
    title: 'GRACE ACS Risk Calculator',
    subtitle: 'Acute Coronary Syndrome Mortality Risk'
  },

  // HCM Risk-SCD Calculator
  // hcm_risk_scd: { ... } // Moved to hcm-risk-scd.ts

  // GRACE 2.0 Risk Calculator - Extracted to standalone file
  grace: grace2Translations,

  // DAPT Score Calculator - Extracted to standalone file
  dapt: daptTranslations,

  // PRECISE-DAPT Calculator - Extracted to standalone file
  precise_dapt: preciseDaptTranslations,

  // TIMI Risk Calculator - Extracted to standalone file
  timi: timiRiskScoreTranslations,

  // HCM-AF Risk Calculator - PLACEHOLDER FOR PATTERN COMPLIANCE
  hcm_af: {
    title: 'HCM-AF Risk Calculator',
    subtitle: 'Atrial Fibrillation Risk in Hypertrophic Cardiomyopathy',
    description: 'Atrial fibrillation risk assessment in patients with hypertrophic cardiomyopathy.',
    calculate_button: 'Calculate HCM-AF Risk',
    risk_category: 'Risk category',
    recommendations: 'Clinical recommendations',
    low_risk: 'Low risk',
    high_risk: 'High risk'
  },

  // MAGGIC Risk Calculator - Extracted to standalone file
  maggic: maggicTranslations,

  // AHA PREVENT™ Calculator - Extracted to standalone file
  prevent: ahaPreventTranslations,

  // SHFM Risk Calculator - Extracted to standalone file
  shfm: shfmTranslations,

  // GWTG-HF Risk Calculator - Extracted to standalone file
  gwtgHf: gwtgHfRiskTranslations,

  // Heart Failure Staging Calculator - Extracted to standalone file
  heartFailureStaging: heartFailureStagingTranslations,

  // STS Adult Cardiac Surgery Risk Calculator - Extracted to standalone file
  sts: stsAdultCardiacTranslations,

  // Ensure other calculator IDs referenced in Calculators.tsx for cardiology also have title/subtitle
  chads_vasc: {
    title: 'CHA2DS2-VASc Score for Atrial Fibrillation Stroke Risk',
    subtitle: 'Estimates stroke risk in patients with non-valvular atrial fibrillation',
    description: 'The CHA2DS2-VASc score is a clinical prediction rule for estimating the risk of stroke in patients with non-rheumatic atrial fibrillation (AF).',
    age: 'Age',
    sex: 'Sex',
    female: 'Female',
    male: 'Male',
    hypertension: 'Hypertension',
    diabetes: 'Diabetes Mellitus',
    chf: 'Congestive Heart Failure',
    stroke_tia: 'Prior Stroke, TIA, or Thromboembolism',
    vascular_disease: 'Vascular Disease (prior MI, PAD, or aortic plaque)',
    calculate_button: 'Calculate CHA2DS2-VASc Score',
    result_title: 'CHA2DS2-VASc Score',
    result_interpretation: 'Interpretation',
    thromb_prophylaxis_rec: 'Recommendations for Thromboprophylaxis',
    score_0_rec: 'Aspirin or no therapy may be considered',
    score_1_rec: 'Oral anticoagulant or aspirin may be considered',
    score_2_rec: 'Oral anticoagulant is recommended',
  },
}; 