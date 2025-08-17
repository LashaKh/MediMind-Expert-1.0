/**
 * OB/GYN Calculator Types and Interfaces
 * Comprehensive data models for obstetrics and gynecology calculators
 * Based on ACOG, SMFM, ASCCP, SGO, ASRM, and NAMS guidelines
 */

// Base interfaces for all calculators
export interface BaseCalculatorInput {
  patientId?: string;
  calculationDate?: Date | string;
}

export interface BaseCalculatorResult {
  value: number | string;
  unit?: string;
  category: 'low' | 'moderate' | 'high' | 'very-high';
  interpretation: string;
  recommendations: string[];
  references: string[];
  hasValidationConcerns?: boolean;
  validationMessage?: string;
}

// ==================================================
// CATEGORY 1: PREGNANCY DATING & ASSESSMENT
// ==================================================

export interface EDDCalculatorInput extends BaseCalculatorInput {
  lmpDate?: string;
  firstTrimesterCRL?: string; // Crown-rump length in mm
  artTransferDate?: string; // ART transfer date
  artDaysToTransfer?: string; // Days from retrieval to transfer
  cycleDays?: string; // Cycle length for irregular cycles
}

export interface EDDCalculatorResult extends BaseCalculatorResult {
  edd: string; // Estimated due date
  currentGA: string; // Current gestational age
  method: 'LMP' | 'Ultrasound' | 'ART';
  confidence: 'high' | 'moderate' | 'low';
  discrepancy?: string; // If multiple methods used
}

export interface GestationalAgeInput extends BaseCalculatorInput {
  referenceDate: string; // Date for which to calculate GA
  calculationDate?: string; // Alternative naming for referenceDate
  eddDate?: string;
  lmpDate?: string;
  firstTrimesterCRL?: string; // Crown-rump length in mm for ultrasound dating
  ultrasoundGA?: string;
  ultrasoundDate?: string;
}

export interface GestationalAgeResult extends BaseCalculatorResult {
  gestationalAge: string; // e.g., "28w 3d" - primary result display
  weeksAndDays: string; // e.g., "28w 3d" - same as gestationalAge for backward compatibility
  totalDays: number;
  trimester: 1 | 2 | 3 | string; // Allow string for display like "First", "Second", "Third"
  deliveryTiming: 'preterm' | 'term' | 'postterm';
  method: 'LMP' | 'Ultrasound' | 'EDD' | 'Manual'; // Method used for calculation
  confidence: 'high' | 'moderate' | 'low'; // Dating confidence
  estimatedDeliveryDate?: string; // EDD if calculated from GA
}

// ==================================================
// CATEGORY 2: ANTENATAL RISK ASSESSMENT
// ==================================================

export interface PreeclampsiaRiskInput extends BaseCalculatorInput {
  maternalAge: string;
  nulliparity: boolean;
  previousPreeclampsia: boolean;
  familyHistory: boolean;
  chronicHypertension: boolean;
  diabetes: boolean;
  multipleGestation: boolean;
  bmi: string;
  meanArterialPressure?: string; // MAP at 11-13 weeks
  uterineArteryPI?: string; // Pulsatility index
  plgf?: string; // Placental growth factor
  pappA?: string; // Pregnancy-associated plasma protein A
}

export interface PreeclampsiaRiskResult extends BaseCalculatorResult {
  riskScore: number;
  earlyOnsetRisk: number; // <34 weeks
  termRisk: number; // ≥37 weeks
  aspirinRecommended: boolean;
  monitoringLevel: 'standard' | 'enhanced' | 'high-risk';
}

export interface PretermBirthRiskInput extends BaseCalculatorInput {
  gestationalAge: string;
  previousPretermBirth: boolean;
  cervicalLength: string; // mm
  multipleGestation: boolean;
  uterineAnomalies: boolean;
  smoking: boolean;
  bmi: string;
  fFN?: boolean; // Fetal fibronectin
}

export interface PretermBirthRiskResult extends BaseCalculatorResult {
  riskByGA: {
    before28: number;
    before32: number;
    before34: number;
    before37: number;
  };
  interventionRecommended: boolean;
  progesteroneCandidate: boolean;
  cervicalCerclageCandidate: boolean;
}

export interface GDMScreeningInput extends BaseCalculatorInput {
  maternalAge: string;
  bmi: string;
  previousGDM: boolean;
  familyHistoryDM: boolean;
  previousMacrosomia: boolean;
  race: 'white' | 'hispanic' | 'african-american' | 'asian' | 'native-american' | 'other';
  pcos: boolean;
}

export interface GDMScreeningResult extends BaseCalculatorResult {
  riskLevel: 'low' | 'moderate' | 'high';
  screeningRecommendation: 'early' | 'standard' | 'enhanced';
  testingProtocol: 'one-step' | 'two-step' | 'either';
  interpretationKey?: string;
  recommendationsKey?: string;
  universalRecommendationsKey?: string;
}

// ==================================================
// CATEGORY 3: LABOR MANAGEMENT
// ==================================================

export interface BishopScoreInput extends BaseCalculatorInput {
  cervicalDilation: string; // cm
  cervicalEffacement: string; // %
  cervicalConsistency: 'firm' | 'medium' | 'soft';
  cervicalPosition: 'posterior' | 'mid' | 'anterior';
  fetalStation: string; // -3 to +3
}

export interface BishopScoreResult extends BaseCalculatorResult {
  totalScore: number;
  inductionSuccess: 'unlikely' | 'possible' | 'likely' | 'very-likely';
  cesareanRisk: number;
  inductionRecommendation: string;
  labels?: {
    bishopScore: string;
    inductionSuccess: string;
    cesareanRisk: string;
  };
  successLabels?: {
    unlikely: string;
    possible: string;
    likely: string;
    very_likely: string;
  };
}

export interface VBACSuccessInput extends BaseCalculatorInput {
  maternalAge: string;
  bmi: string;
  previousVaginalDelivery: boolean;
  indicationForPreviousCD: 'non-recurring' | 'recurring' | 'unknown';
  cervicalDilation: string; // cm at admission
  gestationalAge: string;
  estimatedFetalWeight: string; // grams
}

export interface VBACSuccessResult extends BaseCalculatorResult {
  successProbability: number;
  uterineRuptureRisk: number;
  recommendation: 'candidate' | 'relative-contraindication' | 'contraindication';
  counselingPoints: string[];
}

// ==================================================
// CATEGORY 4: ASSESSMENT TOOLS
// ==================================================

export interface ApgarScoreInput extends BaseCalculatorInput {
  heartRate: 'absent' | 'slow' | 'normal'; // 0, <100, ≥100
  respiratoryEffort: 'absent' | 'weak' | 'strong';
  muscletone: 'limp' | 'some-flexion' | 'active';
  reflexResponse: 'no-response' | 'grimace' | 'cry';
  colorAppearance: 'blue-pale' | 'acrocyanotic' | 'pink';
  timepoint: '1-min' | '5-min' | '10-min';
}

export interface ApgarScoreResult extends Omit<BaseCalculatorResult, 'interpretation'> {
  totalScore: number;
  assessment: 'severely-depressed' | 'moderately-depressed' | 'excellent';
  resuscitationNeeded: boolean;
  followUpRecommended: boolean;
  scores: {
    heartRate: number;
    respiratoryEffort: number;
    muscletone: number;
    reflexResponse: number;
    colorAppearance: number;
  };
  clinicalActions: string[];
  resuscitationGuidance: string[];
  timepoint: '1-min' | '5-min' | '10-min';
  interpretationData: {
    score: number;
    timepoint: string;
    timeKey: string;
    conditionKey: string;
    needsFollowup: boolean;
  };
}

export interface PPHRiskInput extends BaseCalculatorInput {
  maternalAge: string;
  bmi: string;
  parity: string;
  previousPPH: boolean;
  multipleGestation: boolean;
  polyhydramnios: boolean;
  macrosomia: boolean;
  prolongedLabor: boolean;
  chorioamnionitis: boolean;
  placenta: 'normal' | 'previa' | 'accreta' | 'abruption';
  anticoagulation: boolean;
}

export interface PPHRiskResult extends BaseCalculatorResult {
  riskScore: number;
  preventionStrategy: 'standard' | 'enhanced' | 'high-risk';
  interventionPlan: string[];
  emergencyPreparation: boolean;
}

// ==================================================
// CATEGORY 5: GYNECOLOGIC ONCOLOGY
// ==================================================

export interface CervicalCancerRiskInput extends BaseCalculatorInput {
  age: string;
  hpvStatus: 'negative' | 'positive-low-risk' | 'positive-high-risk' | 'unknown';
  cytologyResult: 'normal' | 'ascus' | 'lsil' | 'hsil' | 'agc' | 'asc-h';
  previousAbnormalScreening: boolean;
  smokingStatus: boolean;
  immunocompromised: boolean;
  screeningHistory: 'adequate' | 'inadequate' | 'never-screened';
}

export interface CervicalCancerRiskResult extends BaseCalculatorResult {
  riskLevel: 'minimal' | 'low' | 'intermediate' | 'high';
  managementRecommendation: string;
  followUpInterval: string;
  colposcopyRecommended: boolean;
}

export interface OvarianCancerRiskInput extends BaseCalculatorInput {
  age: string;
  familyHistory: 'none' | 'ovarian' | 'breast' | 'both';
  brca1: boolean;
  brca2: boolean;
  lynchSyndrome: boolean;
  personalBreastCancer: boolean;
  parity: string;
  oralContraceptiveUse: string; // years
  hormonetherapy: boolean;
}

export interface OvarianCancerRiskResult extends BaseCalculatorResult {
  lifetimeRisk: number;
  riskMultiplier: number;
  screeningRecommendation: string;
  prophylacticSurgeryDiscussion: boolean;
}

export interface EndometrialCancerRiskInput extends BaseCalculatorInput {
  age: string;
  bmi: string;
  diabetes: boolean;
  nulliparity: boolean;
  lateMenupause: boolean; // >55 years
  unopposedEstrogen: boolean;
  tamoxifenUse: boolean;
  lynchSyndrome: boolean;
  familyHistory: boolean;
}

export interface EndometrialCancerRiskResult extends BaseCalculatorResult {
  lifetimeRisk: number;
  annualRisk: number;
  screeningRecommendation: string;
  protectiveFactors: string[];
}

// ==================================================
// CATEGORY 6: REPRODUCTIVE ENDOCRINOLOGY
// ==================================================

export interface OvarianReserveInput extends BaseCalculatorInput {
  age: string;
  amh: string; // ng/mL
  antalFolicleCount?: string;
  fsh?: string; // Day 3 FSH
  estradiol?: string; // Day 3 E2
  inhibinB?: string;
}

export interface OvarianReserveResult extends BaseCalculatorResult {
  reserveCategory: 'low' | 'normal' | 'high';
  reproductivePotential: string;
  treatmentOptions: string[];
  counselingPoints: string[];
}

export interface MenopauseAssessmentInput extends BaseCalculatorInput {
  age: string;
  lastMenstrualPeriod: string;
  menstrualPattern: 'regular' | 'irregular' | 'absent';
  vasomotorSymptoms: 'none' | 'mild' | 'moderate' | 'severe';
  sleepDisturbance: boolean;
  moodChanges: boolean;
  vaginalDryness: boolean;
  hotFlashFrequency: string; // per day
  fsh?: string;
  estradiol?: string;
}

export interface MenopauseAssessmentResult extends BaseCalculatorResult {
  menopauseStatus: 'premenopausal' | 'perimenopausal' | 'postmenopausal';
  symptomSeverity: 'mild' | 'moderate' | 'severe';
  treatmentOptions: string[];
  lifestyleModifications: string[];
}

// ==================================================
// CALCULATOR TYPE UNION
// ==================================================

export type OBGYNCalculatorType = 
  // Pregnancy Dating & Assessment
  | 'edd-calculator' | 'gestational-age'
  // Antenatal Risk Assessment
  | 'preeclampsia-risk' | 'preterm-birth-risk' | 'gdm-screening'
  // Labor Management
  | 'bishop-score' | 'vbac-success'
  // Assessment Tools
  | 'apgar-score' | 'pph-risk'
  // Gynecologic Oncology
  | 'cervical-cancer-risk' | 'ovarian-cancer-risk' | 'endometrial-cancer-risk'
  // Reproductive Endocrinology
  | 'ovarian-reserve' | 'menopause-assessment';

export type OBGYNCalculatorInput = 
  | EDDCalculatorInput | GestationalAgeInput
  | PreeclampsiaRiskInput | PretermBirthRiskInput | GDMScreeningInput
  | BishopScoreInput | VBACSuccessInput
  | ApgarScoreInput | PPHRiskInput
  | CervicalCancerRiskInput | OvarianCancerRiskInput | EndometrialCancerRiskInput
  | OvarianReserveInput | MenopauseAssessmentInput;

export type OBGYNCalculatorResult = 
  | EDDCalculatorResult | GestationalAgeResult
  | PreeclampsiaRiskResult | PretermBirthRiskResult | GDMScreeningResult
  | BishopScoreResult | VBACSuccessResult
  | ApgarScoreResult | PPHRiskResult
  | CervicalCancerRiskResult | OvarianCancerRiskResult | EndometrialCancerRiskResult
  | OvarianReserveResult | MenopauseAssessmentResult;

// Calculator category configuration
export interface OBGYNCalculatorCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  calculators: {
    id: OBGYNCalculatorType;
    name: string;
    description: string;
    guidelines: string[];
  }[];
} 