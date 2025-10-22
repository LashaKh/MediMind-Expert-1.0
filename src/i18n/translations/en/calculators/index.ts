import common from './common';
import cardiology from './cardiology';
import eurscoreII from './euroscore-ii';
import hcmRiskSCD from './hcm-risk-scd';
import hcmAFRisk from './hcm-af-risk';
import heartFailureStagingTranslations from './heart-failure-staging';
import gwtgHfRiskTranslations from './gwtg-hf-risk';
import { 
  ovarianReserveCalculator,
  gestationalAgeCalculator,
  eddCalculator,
  preeclampsiaRiskCalculator,
  pretermBirthRiskCalculator,
  gdmScreeningCalculator,
  bishopScoreCalculator,
  vbacSuccessCalculator,
  apgarScoreCalculator,
  pphRiskCalculator,
  cervicalCancerRiskCalculator,
  ovarianCancerRiskCalculator,
  endometrialCancerRiskCalculator,
  menopauseAssessmentCalculator
} from './ObGyn';

export default {
  common,
  cardiology,
  eurscoreII,
  
  // OB/GYN namespace - this is what makes t('calculators.obgyn.apgar_score.title') work
  obgyn: {
    apgar_score: apgarScoreCalculator,
    bishop_score: bishopScoreCalculator,
    cervical_cancer_risk: cervicalCancerRiskCalculator,
    edd_calculator: eddCalculator,
    endometrial_cancer_risk: endometrialCancerRiskCalculator,
    gdm_screening: gdmScreeningCalculator,
    gestational_age: gestationalAgeCalculator,
    menopause_assessment: menopauseAssessmentCalculator,
    ovarian_cancer_risk: ovarianCancerRiskCalculator,
    ovarian_reserve: ovarianReserveCalculator,
    pph_risk: pphRiskCalculator,
    preeclampsia_risk: preeclampsiaRiskCalculator,
    preterm_birth_risk: pretermBirthRiskCalculator,
    vbac_success: vbacSuccessCalculator,
  },
  
  // Legacy namespace mappings
  ObGyn: {
    ovarianReserve: ovarianReserveCalculator,
    ovarianReserveCalculator: ovarianReserveCalculator,
    apgarScoreCalculator: apgarScoreCalculator,
    bishopScoreCalculator: bishopScoreCalculator,
    cervicalCancerRiskCalculator: cervicalCancerRiskCalculator,
    eddCalculator: eddCalculator,
    endometrialCancerRiskCalculator: endometrialCancerRiskCalculator,
    gdmScreeningCalculator: gdmScreeningCalculator,
    gestationalAgeCalculator: gestationalAgeCalculator,
    menopauseAssessmentCalculator: menopauseAssessmentCalculator,
    ovarianCancerRiskCalculator: ovarianCancerRiskCalculator,
    pphRiskCalculator: pphRiskCalculator,
    preeclampsiaRiskCalculator: preeclampsiaRiskCalculator,
    pretermBirthRiskCalculator: pretermBirthRiskCalculator,
    vbacSuccessCalculator: vbacSuccessCalculator,
  },
  
  // HCM Risk calculators
  hcm_risk_scd: hcmRiskSCD,
  
  hcm_af_risk: hcmAFRisk,
  
  // Top-level keys for Calculator landing page
  specialty: {
    cardiology: {
      title: 'Cardiology Calculators',
      description: 'Professional cardiovascular risk assessment and clinical decision support tools',
      status: 'PRODUCTION READY', 
      message: '✅ 16 Calculators • 100% Validated • 6 Categories'
    },
    obgyn: {
      title: 'OB/GYN Calculators',
      description: 'Comprehensive obstetrics and gynecology assessment tools',
      status: 'IMPLEMENTATION READY',
      message: '⚠️ 14 Calculators • Implementation Phase • Professional Grade'
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
    pregnancy_dating: 'Pregnancy Dating',
    antenatal_risk: 'Antenatal Risk',
    labor_management: 'Labor Management',
    assessment_tools: 'Assessment Tools',
    gynecologic_oncology: 'Gynecologic Oncology',
    reproductive_endocrinology: 'Reproductive Endocrinology'
  },
  
  // Calculator title/subtitle shortcuts for cards
  dapt: {
    title: 'DAPT Score Calculator',
    subtitle: 'Dual Antiplatelet Therapy Duration • Risk-Benefit Assessment'
  },
  
  precise_dapt: {
    title: 'PRECISE-DAPT Calculator',
    subtitle: 'Bleeding Risk Assessment • DAPT Duration Optimization'
  },
  
  prevent: {
    title: 'AHA PREVENT™ Calculator',
    subtitle: 'Cardiovascular Risk Assessment • CKM-E Enhanced'
  },
  
  ascvd: {
    title: 'ASCVD Risk Calculator',
    subtitle: '10-Year Atherosclerotic Cardiovascular Disease Risk'
  },
  
  atrial_fibrillation: {
    title: 'Atrial Fibrillation Calculators',
    subtitle: 'CHA₂DS₂-VASc • HAS-BLED • Comprehensive AF Assessment'
  },
  
  timi_risk: {
    title: 'TIMI Risk Calculator',
    subtitle: 'Thrombolysis in Myocardial Infarction Risk Assessment'
  },
  
  grace_acs: {
    title: 'GRACE ACS Calculator',
    subtitle: 'Global Registry of Acute Coronary Events Risk Assessment'
  },
  
  heart_failure_staging: {
    title: 'Heart Failure Staging',
    subtitle: 'ACC/AHA Stage Classification • Clinical Assessment'
  },
  
  gwtg_hf: {
    title: 'GWTG-HF Calculator',
    subtitle: 'Get With The Guidelines - Heart Failure Risk Score'
  },
  
  maggic: {
    title: 'MAGGIC Calculator',
    subtitle: 'Meta-Analysis Global Group in Chronic Heart Failure'
  },
  
  shfm: {
    title: 'SHFM Calculator',
    subtitle: 'Seattle Heart Failure Model • Survival Prediction'
  },

  // OB/GYN Calculators
  edd: {
    title: 'EDD Calculator',
    subtitle: 'Estimated Date of Delivery Calculator'
  },
  gestational_age: {
    title: 'Gestational Age Calculator',
    subtitle: 'Accurate Gestational Age Assessment'
  },
  preeclampsia_risk: {
    title: 'Preeclampsia Risk Calculator',
    subtitle: 'Early Pregnancy Risk Assessment for Preeclampsia'
  },
  preterm_birth_risk: {
    title: 'Preterm Birth Risk Calculator',
    subtitle: 'Evidence-Based Risk Stratification • ACOG Guidelines • Cervical Length Assessment • Clinical Decision Support'
  },
  gdm_screening: {
    title: 'Gestational Diabetes Mellitus (GDM) Screening',
    subtitle: 'Evidence-Based Risk Assessment • ACOG Guidelines • Personalized Screening Protocol • Clinical Decision Support'
  },
  bishop_score: {
    title: 'Bishop Score Calculator',
    subtitle: 'Cervical Readiness Assessment for Labor Induction'
  },
  vbac_success: {
    title: 'VBAC Success Calculator',
    subtitle: 'Vaginal Birth After Cesarean Success Prediction'
  },
  pph_risk: {
    title: 'Postpartum Hemorrhage Risk Assessment',
    subtitle: 'Evidence-based risk stratification for maternal hemorrhage prevention'
  },
  cervical_cancer_risk: {
    title: 'Cervical Cancer Risk Assessment',
    subtitle: 'ASCCP guideline-based cervical cancer risk assessment and management recommendations'
  },
  ovarian_cancer_risk: {
    title: 'Ovarian Cancer Risk Assessment',
    subtitle: 'Evidence-based ovarian cancer risk evaluation with genetic and reproductive factor analysis'
  },
  endometrial_cancer_risk: {
    title: 'Endometrial Cancer Risk Calculator',
    subtitle: 'Lifetime Risk Assessment for Endometrial Cancer'
  },
  ovarian_reserve: {
    title: 'Ovarian Reserve Assessment',
    description: 'Comprehensive fertility evaluation and treatment planning tool'
  },
  menopause_assessment: {
    title: 'Menopause Assessment Tool',
    subtitle: 'Comprehensive menopause status assessment using clinical symptoms and biomarkers'
  },
  
  sts: {
    title: 'STS Calculator',
    subtitle: 'Society of Thoracic Surgeons Risk Assessment'
  },
  
  euroscore: {
    title: 'EuroSCORE II Calculator',
    subtitle: 'European System for Cardiac Operative Risk Evaluation'
  },
  
  categories_label: 'Categories',
  calculator_categories: 'Calculator Categories',
  back_to: 'Back to',
  view_grid: 'Grid',
  view_list: 'List',

  // Heart Failure Staging Calculator - top-level access
  heartFailureStaging: heartFailureStagingTranslations,
  
  // GWTG-HF Risk Calculator - top-level access
  gwtgHfRisk: gwtgHfRiskTranslations
};

export {
  eurscoreII
}; 