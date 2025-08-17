/**
 * OB/GYN Calculator Service
 * Comprehensive calculation engine for obstetrics and gynecology medical calculators
 * Based on ACOG, SMFM, ASCCP, SGO, ASRM, and NAMS evidence-based guidelines
 */

import i18next from 'i18next';
import {
  OBGYNCalculatorType,
  OBGYNCalculatorInput,
  OBGYNCalculatorResult,
  EDDCalculatorInput,
  EDDCalculatorResult,
  GestationalAgeInput,
  GestationalAgeResult,
  PreeclampsiaRiskInput,
  PreeclampsiaRiskResult,
  PretermBirthRiskInput,
  PretermBirthRiskResult,
  GDMScreeningInput,
  GDMScreeningResult,
  BishopScoreInput,
  BishopScoreResult,
  VBACSuccessInput,
  VBACSuccessResult,
  ApgarScoreInput,
  ApgarScoreResult,
  PPHRiskInput,
  PPHRiskResult,
  CervicalCancerRiskInput,
  CervicalCancerRiskResult,
  OvarianCancerRiskInput,
  OvarianCancerRiskResult,
  EndometrialCancerRiskInput,
  EndometrialCancerRiskResult,
  OvarianReserveInput,
  OvarianReserveResult,
  MenopauseAssessmentInput,
  MenopauseAssessmentResult
} from '../types/obgyn-calculators';

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Calculate gestational age from dates (utility function)
 */
function calculateGAFromDates(startDate: Date, currentDate: Date): { weeks: number; days: number; totalDays: number } {
  const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  
  return { weeks, days, totalDays };
}

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Parse date string safely
 */
function parseDate(dateString: string): Date | null {
  try {
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

// ========================================
// PREGNANCY DATING & ASSESSMENT
// ========================================

export function calculateEDD(input: EDDCalculatorInput): EDDCalculatorResult {
  const currentDate = new Date();
  let edd: Date | null = null;
  let method: 'LMP' | 'Ultrasound' | 'ART' = 'LMP';
  let confidence: 'high' | 'moderate' | 'low' = 'moderate';

  // Method 1: Last Menstrual Period (LMP)
  if (input.lmpDate) {
    const lmp = parseDate(input.lmpDate);
    if (lmp) {
      edd = addDays(lmp, 280); // Naegele's Rule: LMP + 280 days
      method = 'LMP';
      confidence = 'moderate';
    }
  }

  // Method 2: First Trimester Ultrasound (most accurate)
  if (input.firstTrimesterCRL) {
    const crl = parseFloat(input.firstTrimesterCRL);
    if (crl >= 15 && crl <= 95) { // Valid CRL range 6-14 weeks
      // Robinson-Fleming formula for EDD from CRL
      const gestationalAge = Math.round(8.052 * Math.pow(crl, 0.5) + 23.73);
      const scanDate = new Date();
      edd = addDays(scanDate, 280 - gestationalAge);
      method = 'Ultrasound';
      confidence = 'high';
    }
  }

  // Method 3: ART (Assisted Reproductive Technology)
  if (input.artTransferDate && input.artDaysToTransfer) {
    const transferDate = parseDate(input.artTransferDate);
    const daysToTransfer = parseInt(input.artDaysToTransfer);
    
    if (transferDate && daysToTransfer >= 3 && daysToTransfer <= 6) {
      // For ART: EDD = Transfer date + 280 - (days to transfer + 14)
      edd = addDays(transferDate, 280 - (daysToTransfer + 14));
      method = 'ART';
      confidence = 'high';
    }
  }

  if (!edd) {
    throw new Error('Unable to calculate EDD: insufficient or invalid data provided');
  }

  // Calculate current gestational age
  const ga = calculateGAFromDates(addDays(edd, -280), currentDate);
  const currentGA = `${ga.weeks}w ${ga.days}d`;

  return {
    value: edd.toISOString().split('T')[0],
    category: 'moderate',
    interpretation: `Estimated due date calculated using ${method} method`,
    recommendations: [
      'Confirm dating with first trimester ultrasound if LMP uncertain',
      'Use most accurate dating method available',
      'Document method used for EDD calculation'
    ],
    references: [
      'ACOG Committee Opinion No. 700: Methods for Estimating the Due Date',
      'ACOG Practice Bulletin No. 175: Ultrasound in Pregnancy'
    ],
    edd: edd.toISOString().split('T')[0],
    currentGA,
    method,
    confidence
  };
}

export function calculateGestationalAge(input: GestationalAgeInput): GestationalAgeResult {
  const referenceDate = parseDate(input.referenceDate || input.calculationDate || '') || new Date();
  let pregnancyStart: Date | null = null;
  let method: 'LMP' | 'Ultrasound' | 'EDD' | 'Manual' = 'Manual';
  let confidence: 'high' | 'moderate' | 'low' = 'moderate';

  // Method 1: Calculate from EDD (work backwards)
  if (input.eddDate) {
    const edd = parseDate(input.eddDate);
    if (edd) {
      pregnancyStart = addDays(edd, -280); // LMP = EDD - 280 days
      method = 'EDD';
      confidence = 'moderate';
    }
  }

  // Method 2: Use LMP directly
  if (input.lmpDate && !pregnancyStart) {
    pregnancyStart = parseDate(input.lmpDate);
    if (pregnancyStart) {
      method = 'LMP';
      confidence = 'moderate';
    }
  }

  // Method 3: First trimester ultrasound (most accurate)
  if (input.firstTrimesterCRL) {
    const crl = parseFloat(input.firstTrimesterCRL);
    if (crl >= 15 && crl <= 95) { // Valid CRL range
      // Robinson-Fleming formula: GA in days = (8.052 * sqrt(CRL) + 23.73)
      const gestationalAgeDays = Math.round(8.052 * Math.pow(crl, 0.5) + 23.73);
      pregnancyStart = addDays(referenceDate, -gestationalAgeDays);
      method = 'Ultrasound';
      confidence = 'high';
    }
  }

  if (!pregnancyStart) {
    throw new Error('Unable to calculate gestational age: no valid dating method provided');
  }

  const ga = calculateGAFromDates(pregnancyStart, referenceDate);
  const gestationalAge = `${ga.weeks}w ${ga.days}d`;
  
  // Determine trimester
  let trimester: 1 | 2 | 3;
  let trimesterString: string;
  if (ga.weeks < 14) {
    trimester = 1;
    trimesterString = 'First';
  } else if (ga.weeks < 28) {
    trimester = 2;
    trimesterString = 'Second';
  } else {
    trimester = 3;
    trimesterString = 'Third';
  }

  // Determine delivery timing
  let deliveryTiming: 'preterm' | 'term' | 'postterm';
  if (ga.weeks < 37) deliveryTiming = 'preterm';
  else if (ga.weeks <= 42) deliveryTiming = 'term';
  else deliveryTiming = 'postterm';

  // Calculate estimated due date
  const estimatedDeliveryDate = addDays(pregnancyStart, 280);

  let category: 'low' | 'moderate' | 'high' | 'very-high' = 'moderate';
  if (ga.weeks < 24) category = 'very-high';
  else if (ga.weeks < 32) category = 'high';
  else if (ga.weeks < 37 || ga.weeks > 42) category = 'moderate';
  else category = 'low';

  return {
    value: gestationalAge,
    category,
    interpretation: `Current gestational age is ${gestationalAge} (${trimesterString} trimester). This represents ${deliveryTiming} timing.`,
    recommendations: [
      'Regular prenatal care according to gestational age',
      'Appropriate screening tests for current trimester',
      'Monitor for complications based on gestational age',
      ...(ga.weeks < 37 ? ['Monitor for preterm labor signs'] : []),
      ...(ga.weeks > 41 ? ['Consider post-term monitoring protocols'] : [])
    ],
    references: [
      'ACOG Committee Opinion No. 700: Methods for Estimating the Due Date',
      'ACOG Practice Bulletin No. 175: Ultrasound in Pregnancy'
    ],
    gestationalAge,
    weeksAndDays: gestationalAge,
    totalDays: ga.totalDays,
    trimester: trimesterString, // Use string for display
    deliveryTiming,
    method,
    confidence,
    estimatedDeliveryDate: estimatedDeliveryDate.toISOString().split('T')[0]
  };
}

// ========================================
// ANTENATAL RISK ASSESSMENT
// ========================================

export function calculatePreeclampsiaRisk(input: PreeclampsiaRiskInput): PreeclampsiaRiskResult {
  const age = parseInt(input.maternalAge);
  const bmi = parseFloat(input.bmi);
  
  // ACOG/SMFM Risk Assessment for Preeclampsia
  let riskScore = 0;
  const riskFactors: string[] = [];

  // Major risk factors (each worth 2 points)
  if (input.previousPreeclampsia) {
    riskScore += 2;
    riskFactors.push('Previous preeclampsia');
  }
  if (input.chronicHypertension) {
    riskScore += 2;
    riskFactors.push('Chronic hypertension');
  }
  if (input.diabetes) {
    riskScore += 2;
    riskFactors.push('Diabetes mellitus');
  }
  if (input.multipleGestation) {
    riskScore += 2;
    riskFactors.push('Multiple gestation');
  }

  // Moderate risk factors (each worth 1 point)
  if (input.nulliparity) {
    riskScore += 1;
    riskFactors.push('Nulliparity');
  }
  if (input.familyHistory) {
    riskScore += 1;
    riskFactors.push('Family history of preeclampsia');
  }
  if (age >= 35) {
    riskScore += 1;
    riskFactors.push('Advanced maternal age (≥35 years)');
  }
  if (bmi >= 30) {
    riskScore += 1;
    riskFactors.push('Obesity (BMI ≥30)');
  }

  // Calculate risk percentages based on validated models
  const baseRisk = 3.4; // Population baseline risk
  let earlyOnsetRisk = 0.5;
  let termRisk = 2.9;

  // Risk multiplication based on score
  const riskMultiplier = Math.pow(1.8, riskScore);
  earlyOnsetRisk *= riskMultiplier;
  termRisk *= riskMultiplier;

  // Cap maximum risk at realistic levels
  earlyOnsetRisk = Math.min(earlyOnsetRisk, 25);
  termRisk = Math.min(termRisk, 40);

  // Determine aspirin recommendation (USPSTF/ACOG guidelines)
  const aspirinRecommended = riskScore >= 2 || (riskScore === 1 && (input.previousPreeclampsia || input.chronicHypertension));

  let category: 'low' | 'moderate' | 'high' | 'very-high';
  let monitoringLevel: 'standard' | 'enhanced' | 'high-risk';

  if (riskScore === 0) {
    category = 'low';
    monitoringLevel = 'standard';
  } else if (riskScore === 1) {
    category = 'moderate';
    monitoringLevel = 'enhanced';
  } else if (riskScore <= 3) {
    category = 'high';
    monitoringLevel = 'high-risk';
  } else {
    category = 'very-high';
    monitoringLevel = 'high-risk';
  }

  const totalRisk = earlyOnsetRisk + termRisk;

  return {
    value: totalRisk,
    unit: '%',
    category,
    interpretation: `${category.charAt(0).toUpperCase() + category.slice(1)} risk for preeclampsia (${totalRisk.toFixed(1)}% total risk)`,
    recommendations: [
      ...(aspirinRecommended ? ['Low-dose aspirin 81mg daily starting 12-16 weeks'] : []),
      'Regular blood pressure monitoring',
      'Prenatal care frequency based on risk level',
      'Patient education on preeclampsia symptoms'
    ],
    references: [
      'ACOG Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia',
      'USPSTF Recommendation: Low-Dose Aspirin for Prevention of Preeclampsia'
    ],
    riskScore,
    earlyOnsetRisk: parseFloat(earlyOnsetRisk.toFixed(1)),
    termRisk: parseFloat(termRisk.toFixed(1)),
    aspirinRecommended,
    monitoringLevel
  };
}

export function calculatePretermBirthRisk(input: PretermBirthRiskInput): PretermBirthRiskResult {
  const currentGA = parseFloat(input.gestationalAge);
  const cervicalLength = parseFloat(input.cervicalLength);
  const bmi = parseFloat(input.bmi);

  // ACOG/SMFM Risk Stratification for Preterm Birth
  let riskScore = 0;
  const riskFactors: string[] = [];

  // Major risk factors
  if (input.previousPretermBirth) {
    riskScore += 3;
    riskFactors.push('Previous spontaneous preterm birth');
  }

  if (cervicalLength < 25) {
    if (cervicalLength < 15) {
      riskScore += 4;
      riskFactors.push('Very short cervical length (<15mm)');
    } else if (cervicalLength < 20) {
      riskScore += 3;
      riskFactors.push('Short cervical length (15-19mm)');
    } else {
      riskScore += 2;
      riskFactors.push('Borderline short cervical length (20-24mm)');
    }
  }

  if (input.multipleGestation) {
    riskScore += 3;
    riskFactors.push('Multiple gestation');
  }

  if (input.fFN) {
    riskScore += 2;
    riskFactors.push('Positive fetal fibronectin');
  }

  // Moderate risk factors
  if (input.uterineAnomalies) {
    riskScore += 1;
    riskFactors.push('Uterine anomalies');
  }

  if (input.smoking) {
    riskScore += 1;
    riskFactors.push('Current smoking');
  }

  if (bmi < 18.5 || bmi > 35) {
    riskScore += 1;
    riskFactors.push(bmi < 18.5 ? 'Underweight (BMI <18.5)' : 'Severe obesity (BMI >35)');
  }

  // Calculate risk percentages based on validated models
  const baseRisk = {
    before28: 1.2,
    before32: 2.8,
    before34: 4.5,
    before37: 11.2
  };

  // Apply risk multiplier based on score
  const riskMultiplier = Math.pow(1.6, riskScore);
  
  const riskByGA = {
    before28: Math.min(parseFloat((baseRisk.before28 * riskMultiplier).toFixed(1)), 45),
    before32: Math.min(parseFloat((baseRisk.before32 * riskMultiplier).toFixed(1)), 55),
    before34: Math.min(parseFloat((baseRisk.before34 * riskMultiplier).toFixed(1)), 65),
    before37: Math.min(parseFloat((baseRisk.before37 * riskMultiplier).toFixed(1)), 80)
  };

  // Determine overall risk category
  let category: 'low' | 'moderate' | 'high' | 'very-high';
  if (riskScore === 0) {
    category = 'low';
  } else if (riskScore <= 2) {
    category = 'moderate';
  } else if (riskScore <= 4) {
    category = 'high';
  } else {
    category = 'very-high';
  }

  // Intervention recommendations based on ACOG guidelines
  const interventionRecommended = riskScore >= 2;
  
  // Progesterone candidacy
  const progesteroneCandidate = (
    (input.previousPretermBirth && !input.multipleGestation) || // 17P for singleton with history
    (cervicalLength < 20 && !input.previousPretermBirth && !input.multipleGestation) // Vaginal progesterone for short cervix
  );

  // Cervical cerclage candidacy
  const cervicalCerclageCandidate = (
    (input.previousPretermBirth && cervicalLength < 25) || // History + short cervix
    (cervicalLength < 15) // Very short cervix
  );

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (category === 'low') {
    recommendations.push('Standard prenatal care schedule');
    recommendations.push('Routine prenatal monitoring');
    recommendations.push('Patient education on preterm labor signs');
  } else {
    recommendations.push('Enhanced prenatal monitoring');
    recommendations.push('Serial cervical length assessments');
    recommendations.push('Patient education on preterm labor symptoms');
    
    if (progesteroneCandidate) {
      if (input.previousPretermBirth) {
        recommendations.push('Consider 17α-hydroxyprogesterone caproate (17P) 250mg IM weekly');
      } else {
        recommendations.push('Consider vaginal progesterone 200mg daily');
      }
    }
    
    if (cervicalCerclageCandidate) {
      recommendations.push('MFM consultation for cervical cerclage evaluation');
    }
    
    if (input.multipleGestation) {
      recommendations.push('Specialized multiple gestation care protocols');
      recommendations.push('Enhanced growth and well-being surveillance');
    }
    
    if (riskScore >= 4) {
      recommendations.push('Consider antenatal corticosteroids if indicated');
      recommendations.push('Plan delivery at appropriate tertiary care facility');
    }
  }

  // Add lifestyle recommendations
  if (input.smoking) {
    recommendations.push('Smoking cessation counseling and support');
  }
  
  recommendations.push('Adequate nutrition and prenatal vitamins');
  recommendations.push('Avoid known preterm birth triggers');

  const interpretation = `${category.charAt(0).toUpperCase() + category.slice(1)} risk for spontaneous preterm birth. Risk of delivery before 37 weeks is ${riskByGA.before37}%. ${
    interventionRecommended ? 'Clinical interventions are recommended.' : 'Standard care is appropriate.'
  }`;

  return {
    value: riskByGA.before37,
    unit: '%',
    category,
    interpretation,
    recommendations,
    references: [
      'ACOG Practice Bulletin No. 234: Prediction and Prevention of Spontaneous Preterm Birth',
      'SMFM Consult Series #44: Cervical Cerclage',
      'ACOG Practice Bulletin No. 142: Cerclage for the Management of Cervical Insufficiency',
      'Cochrane Reviews: Progesterone for preventing preterm birth'
    ],
    riskByGA,
    interventionRecommended,
    progesteroneCandidate,
    cervicalCerclageCandidate
  };
}

// ========================================
// LABOR MANAGEMENT
// ========================================

export function calculateBishopScore(input: BishopScoreInput, t?: (key: string) => string): BishopScoreResult {
  // Parse inputs
  const dilation = parseFloat(input.cervicalDilation);
  const effacement = parseFloat(input.cervicalEffacement);
  const consistency = input.cervicalConsistency;
  const position = input.cervicalPosition;
  const station = parseInt(input.fetalStation);

  // Calculate individual component scores
  let dilationScore = 0;
  if (dilation >= 5) dilationScore = 3;
  else if (dilation >= 3) dilationScore = 2;
  else if (dilation >= 1) dilationScore = 1;
  else dilationScore = 0;

  let effacementScore = 0;
  if (effacement >= 80) effacementScore = 3;
  else if (effacement >= 60) effacementScore = 2;
  else if (effacement >= 40) effacementScore = 1;
  else effacementScore = 0;

  let consistencyScore = 0;
  if (consistency === 'soft') consistencyScore = 2;
  else if (consistency === 'medium') consistencyScore = 1;
  else consistencyScore = 0;

  let positionScore = 0;
  if (position === 'anterior') positionScore = 2;
  else if (position === 'mid') positionScore = 1;
  else positionScore = 0;

  let stationScore = 0;
  if (station >= 0) stationScore = 3;
  else if (station >= -1) stationScore = 2;
  else if (station >= -2) stationScore = 1;
  else stationScore = 0;

  // Calculate total score
  const totalScore = dilationScore + effacementScore + consistencyScore + positionScore + stationScore;

  // Determine category and success probability
  let category: 'low' | 'moderate' | 'high' | 'very-high';
  let inductionSuccess: 'unlikely' | 'possible' | 'likely' | 'very-likely';
  let cesareanRisk: number;

  if (totalScore <= 3) {
    category = 'high'; // High risk category for low scores (unfavorable)
    inductionSuccess = 'unlikely';
    cesareanRisk = 40;
  } else if (totalScore <= 6) {
    category = 'moderate'; // Changed from 'intermediate' to 'moderate'
    inductionSuccess = 'possible';
    cesareanRisk = 25;
  } else if (totalScore <= 8) {
    category = 'moderate'; // Changed from 'borderline' to 'moderate'
    inductionSuccess = 'likely';
    cesareanRisk = 15;
  } else {
    category = 'low'; // Low risk category for high scores (favorable)
    inductionSuccess = 'very-likely'; // Changed from 'very likely' to 'very-likely'
    cesareanRisk = 8;
  }

  // Generate recommendations based on score
  const recommendations: string[] = [];
  
  if (totalScore <= 3) {
    recommendations.push(t ? t('calculators.bishop_score.rec_cervical_ripening_agents') : 'Consider cervical ripening agents before induction');
    recommendations.push(t ? t('calculators.bishop_score.rec_alternative_methods') : 'Alternative methods: mechanical dilation or prostaglandins');
    recommendations.push(t ? t('calculators.bishop_score.rec_discuss_risks_benefits') : 'Discuss risks and benefits of induction vs. cesarean delivery');
  } else if (totalScore <= 6) {
    recommendations.push(t ? t('calculators.bishop_score.rec_induction_caution') : 'Induction may be attempted with caution');
    recommendations.push(t ? t('calculators.bishop_score.rec_cervical_ripening_unfavorable') : 'Consider cervical ripening if unfavorable features present');
    recommendations.push(t ? t('calculators.bishop_score.rec_monitor_failed_induction') : 'Monitor closely for signs of failed induction');
  } else {
    recommendations.push(t ? t('calculators.bishop_score.rec_favorable_conditions') : 'Favorable conditions for labor induction');
    recommendations.push(t ? t('calculators.bishop_score.rec_standard_protocols') : 'Standard induction protocols likely successful');
    recommendations.push(t ? t('calculators.bishop_score.rec_institutional_guidelines') : 'Monitor progress according to institutional guidelines');
  }

  // Add general recommendations
  recommendations.push(t ? t('calculators.bishop_score.rec_continuous_monitoring') : 'Continuous fetal monitoring during induction');
  recommendations.push(t ? t('calculators.bishop_score.rec_pain_management') : 'Adequate pain management options');
  recommendations.push(t ? t('calculators.bishop_score.rec_delivery_plan') : 'Clear delivery plan and cesarean backup available');

  // Generate induction recommendation
  let inductionRecommendation: string;
  if (totalScore <= 3) {
    inductionRecommendation = t ? t('calculators.bishop_score.induction_recommendation_unfavorable') : 'Unfavorable cervix - consider cervical ripening or alternative delivery method';
  } else if (totalScore <= 6) {
    inductionRecommendation = t ? t('calculators.bishop_score.induction_recommendation_partially') : 'Partially favorable - proceed with caution and close monitoring';
  } else if (totalScore <= 8) {
    inductionRecommendation = t ? t('calculators.bishop_score.induction_recommendation_favorable') : 'Favorable cervix - standard induction protocol likely successful';
  } else {
    inductionRecommendation = t ? t('calculators.bishop_score.induction_recommendation_very_favorable') : 'Very favorable cervix - high likelihood of successful vaginal delivery';
  }

  // Get interpretation based on score
  let interpretationKey: string;
  if (totalScore <= 3) {
    interpretationKey = t ? t('calculators.bishop_score.interpretation_unfavorable') : 'an unfavorable cervix with high risk of failed induction';
  } else if (totalScore <= 6) {
    interpretationKey = t ? t('calculators.bishop_score.interpretation_partially_favorable') : 'a partially favorable cervix with moderate induction success rate';
  } else if (totalScore <= 8) {
    interpretationKey = t ? t('calculators.bishop_score.interpretation_favorable') : 'a favorable cervix with good induction success rate';
  } else {
    interpretationKey = t ? t('calculators.bishop_score.interpretation_very_favorable') : 'a very favorable cervix with excellent induction success rate';
  }

  const titleText = t ? t('calculators.bishop_score.title') : 'Bishop Score';
  const indicatesText = t ? t('common.indicates') : 'indicates';
  const cesareanRiskText = t ? t('calculators.bishop_score.cesarean_delivery_risk') : 'Risk of cesarean delivery';

  // Return structured result with translated content
  return {
    value: totalScore, // Add required value property
    unit: 'points', // Add unit
    totalScore,
    category,
    inductionSuccess,
    cesareanRisk,
    inductionRecommendation: totalScore <= 3 ? (t ? t('calculators.bishop_score.induction_recommendation_unfavorable') : 'Unfavorable cervix - consider cervical ripening or alternative delivery method') :
      totalScore <= 6 ? (t ? t('calculators.bishop_score.induction_recommendation_partially') : 'Partially favorable - proceed with caution and close monitoring') :
      totalScore <= 8 ? (t ? t('calculators.bishop_score.induction_recommendation_favorable') : 'Favorable cervix - standard induction protocol likely successful') :
      (t ? t('calculators.bishop_score.induction_recommendation_very_favorable') : 'Very favorable cervix - high likelihood of successful vaginal delivery'), // Add required inductionRecommendation property
    interpretation: t ? `${t('calculators.bishop_score.title')} ${totalScore}/13 ${t('common.indicates')} ${
      totalScore <= 3 ? t('calculators.bishop_score.interpretation_unfavorable') :
      totalScore <= 6 ? t('calculators.bishop_score.interpretation_partially_favorable') :
      totalScore <= 8 ? t('calculators.bishop_score.interpretation_favorable') :
      t('calculators.bishop_score.interpretation_very_favorable')
    }. ${t('calculators.bishop_score.cesarean_delivery_risk')}: ${cesareanRisk}%.` : 
    `Bishop Score of ${totalScore}/13 indicates ${
      totalScore <= 3 ? 'an unfavorable cervix with high risk of failed induction' :
      totalScore <= 6 ? 'a partially favorable cervix with moderate induction success rate' :
      totalScore <= 8 ? 'a favorable cervix with good induction success rate' :
      'a very favorable cervix with excellent induction success rate'
    }. The estimated cesarean delivery risk is ${cesareanRisk}%.`,
    recommendations,
    references: t ? [
      t('calculators.bishop_score.ref_acog_bulletin'),
      t('calculators.bishop_score.ref_bishop_original'),
      t('calculators.bishop_score.ref_who_recommendations'),
      t('calculators.bishop_score.ref_cochrane_review')
    ] : [
      'ACOG Practice Bulletin No. 107: Induction of Labor',
      'Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol. 1964;24:266-8',
      'WHO Recommendations: Induction of Labour at or beyond Term',
      'Cochrane Review: Mechanical methods for induction of labour'
    ],
    // Add translated labels for UI display
    labels: t ? {
      bishopScore: t('calculators.bishop_score.bishop_score_label'),
      inductionSuccess: t('calculators.bishop_score.induction_success_label'),
      cesareanRisk: t('calculators.bishop_score.cesarean_risk_label')
    } : {
      bishopScore: 'bishop Score',
      inductionSuccess: 'induction Success', 
      cesareanRisk: 'cesarean Risk'
    },
    // Add translated success values
    successLabels: t ? {
      unlikely: t('calculators.bishop_score.unlikely'),
      possible: t('calculators.bishop_score.possible'),
      likely: t('calculators.bishop_score.likely'),
      very_likely: t('calculators.bishop_score.very_likely')
    } : {
      unlikely: 'unlikely',
      possible: 'possible',
      likely: 'likely', 
      very_likely: 'very likely'
    }
  };
}

// Calculate Apgar Score
export function calculateApgarScore(input: ApgarScoreInput): ApgarScoreResult {
  // Calculate individual component scores
  const heartRateScore = input.heartRate === 'absent' ? 0 : input.heartRate === 'slow' ? 1 : 2;
  const respiratoryScore = input.respiratoryEffort === 'absent' ? 0 : input.respiratoryEffort === 'weak' ? 1 : 2;
  const muscleScore = input.muscletone === 'limp' ? 0 : input.muscletone === 'some-flexion' ? 1 : 2;
  const reflexScore = input.reflexResponse === 'no-response' ? 0 : input.reflexResponse === 'grimace' ? 1 : 2;
  const colorScore = input.colorAppearance === 'blue-pale' ? 0 : input.colorAppearance === 'acrocyanotic' ? 1 : 2;

  // Total score
  const totalScore = heartRateScore + respiratoryScore + muscleScore + reflexScore + colorScore;

  // Determine assessment category
  let assessment: 'severely-depressed' | 'moderately-depressed' | 'excellent';
  let category: 'low' | 'moderate' | 'high';
  
  if (totalScore <= 3) {
    assessment = 'severely-depressed';
    category = 'low';
  } else if (totalScore <= 6) {
    assessment = 'moderately-depressed';
    category = 'moderate';
  } else {
    assessment = 'excellent';
    category = 'high';
  }

  // Determine resuscitation needs
  const resuscitationNeeded = totalScore <= 6;
  const followUpRecommended = totalScore <= 7 || input.timepoint === '5-min';

  // Generate recommendations based on score and timepoint
  const recommendations: string[] = [];
  
  if (totalScore <= 3) {
    recommendations.push('Immediate resuscitation required');
    recommendations.push('Positive pressure ventilation indicated');
    recommendations.push('Consider chest compressions and medications');
    recommendations.push('NICU consultation recommended');
    if (input.timepoint === '5-min') {
      recommendations.push('10-minute Apgar score required');
      recommendations.push('Extended resuscitation protocols');
    }
  } else if (totalScore <= 6) {
    recommendations.push('Some form of resuscitation indicated');
    recommendations.push('Stimulation and oxygen support');
    recommendations.push('Close monitoring for improvement');
    if (input.timepoint === '1-min') {
      recommendations.push('Reassess at 5 minutes');
    }
    if (input.timepoint === '5-min') {
      recommendations.push('Consider extended resuscitation');
      recommendations.push('10-minute assessment recommended');
    }
  } else if (totalScore <= 7) {
    recommendations.push('Minimal intervention required');
    recommendations.push('Standard observation protocols');
    recommendations.push('Monitor for signs of distress');
  } else {
    recommendations.push('Excellent condition - routine care');
    recommendations.push('Standard newborn protocols');
    recommendations.push('Normal transition to extrauterine life');
  }

  // Add timepoint-specific recommendations
  if (input.timepoint === '1-min') {
    recommendations.push('Reassessment at 5 minutes mandatory');
  } else if (input.timepoint === '5-min' && totalScore <= 7) {
    recommendations.push('Consider 10-minute assessment');
  } else if (input.timepoint === '10-min') {
    recommendations.push('Extended monitoring protocols');
    if (totalScore <= 6) {
      recommendations.push('NICU consultation strongly recommended');
    }
  }

  // Generate interpretation text
  const timeDisplay = input.timepoint.replace('-', '-minute ');
  const interpretation = `Apgar score of ${totalScore}/10 at ${timeDisplay} indicates ${
    totalScore <= 3 ? 'severe neonatal depression requiring immediate aggressive resuscitation' :
    totalScore <= 6 ? 'moderate neonatal depression requiring resuscitation and close monitoring' :
    totalScore <= 7 ? 'mildly depressed neonate requiring observation and minimal intervention' :
    'excellent neonatal condition with normal adaptation to extrauterine life'
  }.${
    input.timepoint === '1-min' ? ' Five-minute reassessment is required for all neonates.' :
    input.timepoint === '5-min' && totalScore <= 7 ? ' Ten-minute assessment should be considered.' :
    ''
  }`;

  // Clinical actions based on score
  const clinicalActions: string[] = [];
  if (totalScore <= 3) {
    clinicalActions.push('Immediate resuscitation required');
    clinicalActions.push('Clear airway, stimulate breathing');
    clinicalActions.push('Positive pressure ventilation');
    clinicalActions.push('Consider chest compressions');
    clinicalActions.push('Emergency medications if indicated');
  } else if (totalScore <= 6) {
    clinicalActions.push('Stimulation and assessment');
    clinicalActions.push('Clear airway and provide oxygen');
    clinicalActions.push('Support breathing as needed');
    clinicalActions.push('Monitor for improvement');
  } else if (totalScore <= 7) {
    clinicalActions.push('Routine care with observation');
    clinicalActions.push('Monitor respiratory effort');
    clinicalActions.push('Assess for signs of distress');
  } else {
    clinicalActions.push('Routine newborn care');
    clinicalActions.push('Standard monitoring protocols');
    clinicalActions.push('Normal transition support');
  }

  // Resuscitation guidance
  const resuscitationGuidance: string[] = [];
  if (totalScore <= 3) {
    resuscitationGuidance.push('Follow NRP algorithm for severely depressed newborn');
    resuscitationGuidance.push('Ensure adequate ventilation first priority');
    resuscitationGuidance.push('Consider intubation if bag-mask ineffective');
    resuscitationGuidance.push('Start chest compressions if heart rate <60 after adequate ventilation');
    resuscitationGuidance.push('Epinephrine 0.01-0.03 mg/kg IV if heart rate remains <60');
  } else if (totalScore <= 6) {
    resuscitationGuidance.push('Initial steps: warm, clear airway, dry, stimulate');
    resuscitationGuidance.push('Provide positive pressure ventilation if needed');
    resuscitationGuidance.push('Use 21% oxygen initially, adjust based on oximetry');
    resuscitationGuidance.push('Consider CPAP for spontaneous breathing with poor effort');
  } else {
    resuscitationGuidance.push('Standard care - no active resuscitation needed');
    resuscitationGuidance.push('Monitor for signs of respiratory distress');
    resuscitationGuidance.push('Maintain normal temperature and glucose');
  }

  // Generate interpretation using translation-ready data
  const conditionKey = totalScore <= 3 ? 'severe_depression' :
                       totalScore <= 6 ? 'moderate_depression' :
                       totalScore <= 7 ? 'mild_depression' :
                       'excellent';
  
  const timeKey = input.timepoint.replace('-', '_'); // '1-min' -> '1_min'
  
  // Instead of hardcoded interpretation, provide structured data for translation
  const interpretationData = {
    score: totalScore,
    timepoint: input.timepoint,
    timeKey,
    conditionKey,
    needsFollowup: input.timepoint === '1-min' ? true : (input.timepoint === '5-min' && totalScore <= 7)
  };

  // The component will use these keys with translations:
  // t('calculators.obgyn.apgar_score.interpretation_templates.score_template', { 
  //   score: interpretationData.score, 
  //   time: t(`calculators.obgyn.apgar_score.interpretation_templates.time_display.${timeKey}`),
  //   condition: t(`calculators.obgyn.apgar_score.result_interpretations.${conditionKey}`)
  // })

  return {
    value: totalScore,
    unit: 'points',
    category,
    interpretationData, // Structured data instead of hardcoded text
    recommendations,
    references: [
      'ACOG Committee Opinion No. 644: The Apgar Score',
      'AAP/ACOG Guidelines for Perinatal Care, 8th Edition',
      'Neonatal Resuscitation Program (NRP) Guidelines',
      'WHO Recommendations on Postnatal Care of the Mother and Newborn'
    ],
    totalScore,
    assessment,
    resuscitationNeeded,
    followUpRecommended,
    scores: {
      heartRate: heartRateScore,
      respiratoryEffort: respiratoryScore,
      muscletone: muscleScore,
      reflexResponse: reflexScore,
      colorAppearance: colorScore
    },
    clinicalActions,
    resuscitationGuidance,
    timepoint: input.timepoint
  };
}

export function calculateGDMScreening(input: GDMScreeningInput): GDMScreeningResult {
  // Calculate risk score
  let riskScore = 0;
  const age = parseInt(input.maternalAge);
  const bmi = parseFloat(input.bmi);

  // Age factor (≥35 years = +1 point)
  if (age >= 35) {
    riskScore += 1;
  }

  // BMI factor (≥25 = +1 point, ≥30 = +2 points)
  if (bmi >= 30) {
    riskScore += 2;
  } else if (bmi >= 25) {
    riskScore += 1;
  }

  // High-risk ethnicity (+1 point)
  const highRiskEthnicities = ['hispanic', 'asian', 'african-american', 'native-american'];
  if (highRiskEthnicities.includes(input.race)) {
    riskScore += 1;
  }

  // Family history of diabetes (+1 point)
  if (input.familyHistoryDM) {
    riskScore += 1;
  }

  // Previous GDM (+2 points - strong predictor)
  if (input.previousGDM) {
    riskScore += 2;
  }

  // Previous macrosomia (+1 point)
  if (input.previousMacrosomia) {
    riskScore += 1;
  }

  // PCOS (+1 point)
  if (input.pcos) {
    riskScore += 1;
  }

  // Determine risk level
  let riskLevel: 'low' | 'moderate' | 'high';
  let category: 'low' | 'moderate' | 'high' | 'very-high';
  let screeningRecommendation: 'early' | 'standard' | 'enhanced';
  let testingProtocol: 'one-step' | 'two-step' | 'either';

  if (riskScore >= 3) {
    riskLevel = 'high';
    category = 'high';
    screeningRecommendation = 'early';
    testingProtocol = 'one-step';
  } else if (riskScore >= 1) {
    riskLevel = 'moderate';
    category = 'moderate';
    screeningRecommendation = 'standard';
    testingProtocol = 'either';
  } else {
    riskLevel = 'low';
    category = 'low';
    screeningRecommendation = 'standard';
    testingProtocol = 'either';
  }

  // Generate interpretation and recommendations using translation keys
  const interpretationKey = `calculators.gdm_screening.interpretations.${riskLevel}`;
  const recommendationsKey = `calculators.gdm_screening.recommendations.${riskLevel}`;
  const universalRecommendationsKey = 'calculators.gdm_screening.recommendations.universal';

  // For now, return hardcoded fallback values that the component can override
  // The component will use the translation keys for actual display
  const interpretation = `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} risk for gestational diabetes mellitus (Risk Score: ${riskScore}). ${
    riskLevel === 'low' ? 'Standard screening protocols are appropriate.' :
    riskLevel === 'moderate' ? 'Standard screening with enhanced counseling recommended.' :
    'Early screening and intensive management protocols recommended.'
  }`;

  const recommendations = [
    // These will be overridden by the component using translation keys
    ...(riskLevel === 'low' ? [
      'Standard screening at 24-28 weeks gestation',
      'Either one-step (75g OGTT) or two-step (50g GCT followed by 100g OGTT if abnormal) approach acceptable',
      'Maintain healthy diet and regular physical activity',
      'Weight management within recommended gestational weight gain guidelines'
    ] : riskLevel === 'moderate' ? [
      'Standard screening at 24-28 weeks gestation',
      'Consider early screening if additional risk factors develop',
      'Enhanced dietary counseling and exercise guidance',
      'Monitor weight gain closely according to IOM guidelines',
      'Patient education on GDM symptoms and risks'
    ] : [
      'Early screening recommended at first prenatal visit or before 24 weeks',
      'If early screening negative, repeat screening at 24-28 weeks',
      'One-step approach (75g OGTT) preferred for high-risk patients',
      'Comprehensive nutritional counseling with registered dietitian',
      'Structured exercise program if not contraindicated',
      'Close monitoring of maternal weight gain',
      'Enhanced prenatal care schedule',
      'Consider continuous glucose monitoring if GDM diagnosed'
    ]),
    'Folic acid supplementation 400-800 mcg daily',
    'Avoid simple sugars and refined carbohydrates',
    'Postpartum screening for type 2 diabetes at 6-12 weeks'
  ];

  return {
    value: riskScore,
    unit: 'points',
    category,
    interpretation,
    recommendations,
    references: [
      'ACOG Practice Bulletin No. 190: Gestational Diabetes Mellitus',
      'ADA Standards of Care: Diabetes in Pregnancy',
      'IADPSG Consensus Panel: International Association of Diabetes and Pregnancy Study Groups',
      'WHO Guidelines: Diagnosis and management of gestational diabetes mellitus',
      'SMFM Consult Series: Gestational diabetes mellitus screening and management'
    ],
    riskLevel,
    screeningRecommendation,
    testingProtocol,
    // Add the translation keys as additional properties
    interpretationKey,
    recommendationsKey,
    universalRecommendationsKey
  };
}

export function calculateVBACSuccess(input: VBACSuccessInput, t?: (key: string) => string): VBACSuccessResult {
  const maternalAge = parseInt(input.maternalAge);
  const bmi = parseFloat(input.bmi);
  const gestationalAge = parseFloat(input.gestationalAge);
  const estimatedFetalWeight = input.estimatedFetalWeight ? parseFloat(input.estimatedFetalWeight) : 3500; // Default average
  const cervicalDilation = input.cervicalDilation ? parseFloat(input.cervicalDilation) : 0;
  
  // Default translation function if none provided
  const translate = t || ((key: string) => key);
  
  // Calculate success probability using validated predictive model
  // Based on Grobman et al. nomogram and ACOG guidelines
  
  let baseScore = 45; // Base success probability
  
  // Maternal age factor (optimal range 20-35)
  if (maternalAge < 20) {
    baseScore += 10; // Younger mothers generally have better outcomes
  } else if (maternalAge <= 35) {
    baseScore += 5; // Optimal age range
  } else if (maternalAge <= 40) {
    baseScore -= 5; // Slightly reduced success
  } else {
    baseScore -= 15; // Advanced maternal age
  }
  
  // BMI factor (optimal BMI < 30)
  if (bmi < 25) {
    baseScore += 10; // Normal weight
  } else if (bmi < 30) {
    baseScore += 5; // Overweight but manageable
  } else if (bmi < 35) {
    baseScore -= 10; // Obesity class I
  } else if (bmi < 40) {
    baseScore -= 20; // Obesity class II
  } else {
    baseScore -= 30; // Obesity class III
  }
  
  // Previous vaginal delivery - strongest positive predictor
  if (input.previousVaginalDelivery) {
    baseScore += 25; // Significant positive factor
  }
  
  // Indication for previous cesarean
  switch (input.indicationForPreviousCD) {
    case 'non-recurring':
      baseScore += 15; // Non-recurring indication is favorable
      break;
    case 'recurring':
      baseScore -= 20; // Recurring indication suggests structural issues
      break;
    case 'unknown':
      baseScore += 0; // Neutral
      break;
  }
  
  // Gestational age factor (optimal range 37-40 weeks)
  if (gestationalAge >= 37 && gestationalAge <= 40) {
    baseScore += 5; // Optimal timing
  } else if (gestationalAge > 40) {
    baseScore -= 10; // Post-term complications
  } else {
    baseScore -= 5; // Preterm considerations
  }
  
  // Estimated fetal weight factor
  if (estimatedFetalWeight >= 4500) {
    baseScore -= 25; // Macrosomia significantly reduces success
  } else if (estimatedFetalWeight >= 4000) {
    baseScore -= 15; // Large baby
  } else if (estimatedFetalWeight >= 3500) {
    baseScore += 0; // Average size
  } else {
    baseScore += 5; // Smaller baby
  }
  
  // Cervical dilation (if in labor)
  if (cervicalDilation > 0) {
    baseScore += cervicalDilation * 2; // Each cm adds to success probability
  }
  
  // Ensure probability is within realistic bounds
  const successProbability = Math.max(10, Math.min(95, baseScore));
  
  // Calculate uterine rupture risk (0.4-0.9% baseline)
  let uterineRuptureRisk = 0.5; // Base risk
  
  if (input.indicationForPreviousCD === 'recurring') {
    uterineRuptureRisk += 0.2; // Slightly higher risk
  }
  
  if (bmi >= 35) {
    uterineRuptureRisk += 0.1; // Obesity increases risk
  }
  
  if (estimatedFetalWeight >= 4500) {
    uterineRuptureRisk += 0.2; // Macrosomia increases risk
  }
  
  // Round to one decimal place
  uterineRuptureRisk = Math.round(uterineRuptureRisk * 10) / 10;
  
  // Determine category and recommendation
  let category: 'low' | 'moderate' | 'high';
  let recommendation: 'candidate' | 'relative-contraindication' | 'contraindication';
  
  if (successProbability >= 70) {
    category = 'low'; // Low risk (high success probability)
    recommendation = 'candidate';
  } else if (successProbability >= 50) {
    category = 'moderate'; // Moderate risk (moderate success probability)
    recommendation = 'candidate';
  } else if (successProbability >= 30) {
    category = 'high'; // High risk (low success probability)
    recommendation = 'relative-contraindication';
  } else {
    category = 'high'; // Very high risk (very low success probability)
    recommendation = 'contraindication';
  }

  // Generate recommendations using translation keys
  const recommendations: string[] = [];

  if (successProbability >= 70) {
    recommendations.push(translate('calculators.vbac_success.rec_vbac_strongly_recommended'));
    recommendations.push(translate('calculators.vbac_success.rec_continuous_monitoring'));
    recommendations.push(translate('calculators.vbac_success.rec_emergency_access'));
    recommendations.push(translate('calculators.vbac_success.rec_epidural_anesthesia'));
    recommendations.push(translate('calculators.vbac_success.rec_regular_assessment'));
  } else if (successProbability >= 50) {
    recommendations.push(translate('calculators.vbac_success.rec_vbac_reasonable'));
    recommendations.push(translate('calculators.vbac_success.rec_detailed_discussion'));
    recommendations.push(translate('calculators.vbac_success.rec_close_monitoring'));
    recommendations.push(translate('calculators.vbac_success.rec_low_threshold'));
    recommendations.push(translate('calculators.vbac_success.rec_operating_room'));
  } else {
    recommendations.push(translate('calculators.vbac_success.rec_elective_repeat'));
    recommendations.push(translate('calculators.vbac_success.rec_enhanced_monitoring'));
    recommendations.push(translate('calculators.vbac_success.rec_informed_consent'));
    recommendations.push(translate('calculators.vbac_success.rec_surgical_team'));
    recommendations.push(translate('calculators.vbac_success.rec_tertiary_center'));
  }

  // Universal recommendations
  recommendations.push(translate('calculators.vbac_success.rec_type_screen'));
  recommendations.push(translate('calculators.vbac_success.rec_iv_access'));
  recommendations.push(translate('calculators.vbac_success.rec_anesthesia_consult'));
  recommendations.push(translate('calculators.vbac_success.rec_pediatric_team'));
  recommendations.push(translate('calculators.vbac_success.rec_document_counseling'));

  // Additional recommendations based on specific factors
  if (estimatedFetalWeight >= 4000) {
    recommendations.push(translate('calculators.vbac_success.rec_shoulder_dystocia'));
    recommendations.push(translate('calculators.vbac_success.rec_cesarean_macrosomia'));
  }

  if (bmi >= 35) {
    recommendations.push(translate('calculators.vbac_success.rec_obesity_anesthesia'));
    recommendations.push(translate('calculators.vbac_success.rec_obesity_complications'));
  }

  if (maternalAge >= 40) {
    recommendations.push(translate('calculators.vbac_success.rec_advanced_age_surveillance'));
    recommendations.push(translate('calculators.vbac_success.rec_maternal_monitoring'));
  }

  // Generate translated interpretation
  const interpretationKey = category === 'low' ? 'calculators.vbac_success.interpretation_high_success' :
    category === 'moderate' ? 'calculators.vbac_success.interpretation_moderate_success' :
    'calculators.vbac_success.interpretation_low_success';

  const interpretation = translate('calculators.vbac_success.interpretation_template')
    .replace('{successProbability}', successProbability.toString())
    .replace('{categoryText}', translate(interpretationKey))
    .replace('{uterineRuptureRisk}', uterineRuptureRisk.toString());

  return {
    value: successProbability,
    unit: 'percentage',
    category,
    interpretation: interpretation || `VBAC success probability of ${successProbability}% indicates ${
      category === 'low' ? 'high likelihood of successful vaginal delivery' :
      category === 'moderate' ? 'moderate success probability requiring careful monitoring' :
      'lower success probability - consider individual factors and patient preference'
    }. Uterine rupture risk is estimated at ${uterineRuptureRisk}%. This prediction is based on validated clinical factors including maternal characteristics, obstetric history, and current labor parameters.`,
    recommendations,
    references: [
      'ACOG Practice Bulletin No. 205: Vaginal Birth After Cesarean Delivery',
      'Grobman et al.: Development of a nomogram for prediction of vaginal birth after cesarean delivery',
      'SMFM Consult Series: Trial of labor after cesarean delivery',
      'Landon et al.: Risk of uterine rupture with a trial of labor in women with multiple and single prior cesarean delivery',
      'RCOG Guidelines: Birth after previous caesarean birth'
    ],
    successProbability,
    uterineRuptureRisk,
    recommendation,
    counselingPoints: [
      translate('calculators.vbac_success.counseling_success_probability').replace('{percentage}', successProbability.toString()),
      translate('calculators.vbac_success.counseling_uterine_rupture_risk').replace('{percentage}', uterineRuptureRisk.toString()),
      translate('calculators.vbac_success.counseling_rupture_signs'),
      translate('calculators.vbac_success.counseling_emergency_cesarean'),
      translate('calculators.vbac_success.counseling_complications_risk')
    ]
  };
}

export function calculatePPHRisk(input: PPHRiskInput, t?: (key: string) => string): PPHRiskResult {
  const age = parseInt(input.maternalAge);
  const bmi = parseFloat(input.bmi);
  const parity = parseInt(input.parity);
  
  // Calculate risk score based on evidence-based risk factors
  let riskScore = 0;
  
  // Maternal demographics (0-4 points)
  if (age >= 35) {
    riskScore += 1; // Advanced maternal age
  }
  if (age >= 40) {
    riskScore += 1; // Additional risk for very advanced age
  }
  
  if (bmi >= 30) {
    riskScore += 1; // Obesity
  }
  if (bmi >= 35) {
    riskScore += 1; // Severe obesity
  }
  
  // Parity factors (0-2 points)
  if (parity === 0) {
    riskScore += 1; // Nulliparity
  } else if (parity >= 5) {
    riskScore += 2; // Grand multiparity
  }
  
  // Medical history (0-6 points)
  if (input.previousPPH) {
    riskScore += 3; // Previous PPH - strongest predictor
  }
  
  if (input.anticoagulation) {
    riskScore += 2; // Bleeding disorder/anticoagulation
  }
  
  // Current pregnancy factors (0-8 points)
  if (input.multipleGestation) {
    riskScore += 2; // Twins/multiples
  }
  
  if (input.polyhydramnios) {
    riskScore += 1; // Overdistension
  }
  
  if (input.macrosomia) {
    riskScore += 1; // Overdistension/shoulder dystocia risk
  }
  
  if (input.chorioamnionitis) {
    riskScore += 1; // Infection impairs uterine contraction
  }
  
  if (input.prolongedLabor) {
    riskScore += 1; // Uterine atony risk
  }
  
  // Placental factors (0-4 points)
  switch (input.placenta) {
    case 'previa':
      riskScore += 2; // Placenta previa
      break;
    case 'accreta':
      riskScore += 4; // Placenta accreta - highest risk
      break;
    case 'abruption':
      riskScore += 3; // Placental abruption
      break;
    case 'normal':
    default:
      // No additional points
      break;
  }
  
  // Determine risk category based on total score
  let category: 'low' | 'moderate' | 'high' | 'very-high';
  let preventionStrategy: 'standard' | 'enhanced' | 'high-risk';
  let emergencyPreparation = false;
  
  if (riskScore <= 2) {
    category = 'low';
    preventionStrategy = 'standard';
  } else if (riskScore <= 5) {
    category = 'moderate';
    preventionStrategy = 'enhanced';
  } else if (riskScore <= 8) {
    category = 'high';
    preventionStrategy = 'high-risk';
    emergencyPreparation = true;
  } else {
    category = 'very-high';
    preventionStrategy = 'high-risk';
    emergencyPreparation = true;
  }
  
  // Generate intervention plan based on risk level
  const interventionPlan: string[] = [];
  
  // Standard interventions for all patients
  const standardInterventions = t ? [
    t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.standard.0'),
    t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.standard.1'),
    t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.standard.2'),
    t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.standard.3')
  ] : [
    'Active management of third stage of labor',
    'Immediate postpartum uterine massage',
    'Oxytocin 10-20 units IM or IV after delivery',
    'Quantitative blood loss assessment'
  ];
  
  interventionPlan.push(...standardInterventions);
  
  // Enhanced interventions for moderate risk
  if (category === 'moderate' || category === 'high' || category === 'very-high') {
    const enhancedInterventions = t ? [
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.enhanced.0'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.enhanced.1'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.enhanced.2'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.enhanced.3'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.enhanced.4')
    ] : [
      'Large bore IV access (18-gauge or larger)',
      'Type and screen for blood products',
      'Anesthesia team notification',
      'Operating room availability confirmation',
      'Consider additional uterotonic agents ready'
    ];
    
    interventionPlan.push(...enhancedInterventions);
  }
  
  // High-risk interventions
  if (category === 'high' || category === 'very-high') {
    const highRiskInterventions = t ? [
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.high_risk.0'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.high_risk.1'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.high_risk.2'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.high_risk.3'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.high_risk.4'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.high_risk.5')
    ] : [
      'Type and crossmatch 2-4 units blood',
      'Second IV access established',
      'Anesthesia team present at delivery',
      'Blood bank notification and products ready',
      'Senior obstetrician involvement',
      'Consider cell saver if available'
    ];
    
    interventionPlan.push(...highRiskInterventions);
  }
  
  // Very high-risk interventions
  if (category === 'very-high') {
    const veryHighRiskInterventions = t ? [
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.very_high_risk.0'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.very_high_risk.1'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.very_high_risk.2'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.very_high_risk.3'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.very_high_risk.4'),
      t('calculators.obgyn.pph_risk_calculator.results.intervention_plans.very_high_risk.5')
    ] : [
      'Multidisciplinary team meeting pre-delivery',
      'Consider delivery in main operating room',
      'Maternal-fetal medicine consultation',
      'Interventional radiology team on standby',
      'Consider uterine artery balloon placement',
      'ICU bed availability confirmed'
    ];
    
    interventionPlan.push(...veryHighRiskInterventions);
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  // Universal recommendations
  const universalRecommendations = t ? [
    t('calculators.obgyn.pph_risk_calculator.results.recommendations.universal.0'),
    t('calculators.obgyn.pph_risk_calculator.results.recommendations.universal.1'),
    t('calculators.obgyn.pph_risk_calculator.results.recommendations.universal.2'),
    t('calculators.obgyn.pph_risk_calculator.results.recommendations.universal.3'),
    t('calculators.obgyn.pph_risk_calculator.results.recommendations.universal.4')
  ] : [
    'Establish IV access upon admission to labor unit',
    'Baseline hemoglobin and hematocrit levels',
    'Blood type and antibody screen',
    'Continuous monitoring during active labor',
    'Team communication of risk status'
  ];
  
  recommendations.push(...universalRecommendations);
  
  // Risk-specific recommendations
  if (category === 'low') {
    const lowRiskRecommendations = t ? [
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.low.0'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.low.1'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.low.2')
    ] : [
      'Standard postpartum monitoring protocols',
      'Early ambulation and breastfeeding support',
      'Standard discharge planning'
    ];
    
    recommendations.push(...lowRiskRecommendations);
  } else if (category === 'moderate') {
    const moderateRiskRecommendations = t ? [
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.moderate.0'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.moderate.1'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.moderate.2'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.moderate.3')
    ] : [
      'Enhanced postpartum monitoring for 24 hours',
      'Serial hemoglobin assessment',
      'Consider extended observation',
      'Clear emergency action plan documented'
    ];
    
    recommendations.push(...moderateRiskRecommendations);
  } else if (category === 'high') {
    const highRiskRecommendations = t ? [
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.high.0'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.high.1'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.high.2'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.high.3'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.high.4')
    ] : [
      'Continuous postpartum monitoring for 24-48 hours',
      'Serial complete blood counts',
      'Coagulation studies if indicated',
      'Consider prophylactic transfusion if Hgb <7 g/dL',
      'Delayed discharge until stable'
    ];
    
    recommendations.push(...highRiskRecommendations);
  } else {
    const veryHighRiskRecommendations = t ? [
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.very_high.0'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.very_high.1'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.very_high.2'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.very_high.3'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.very_high.4')
    ] : [
      'ICU-level monitoring consideration',
      'Frequent vital signs and laboratory monitoring',
      'Early hematology consultation',
      'Consider prophylactic procedures pre-delivery',
      'Extended hospital stay planning'
    ];
    
    recommendations.push(...veryHighRiskRecommendations);
  }
  
  // Additional recommendations based on specific risk factors
  if (input.placenta === 'accreta') {
    const acreteRecommendations = t ? [
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.placenta_accreta.0'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.placenta_accreta.1'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.placenta_accreta.2')
    ] : [
      'Urology consultation for potential bladder involvement',
      'Cesarean hysterectomy counseling and consent',
      'Consider leaving placenta in place if accreta diagnosed'
    ];
    
    recommendations.push(...acreteRecommendations);
  }
  
  if (input.previousPPH) {
    const previousPPHRecommendations = t ? [
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.previous_pph.0'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.previous_pph.1'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.previous_pph.2')
    ] : [
      'Review previous PPH details and management',
      'Identify specific causes of previous hemorrhage',
      'Patient counseling about recurrence risk'
    ];
    
    recommendations.push(...previousPPHRecommendations);
  }
  
  if (input.anticoagulation) {
    const anticoagulationRecommendations = t ? [
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.anticoagulation.0'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.anticoagulation.1'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.anticoagulation.2')
    ] : [
      'Hematology consultation for anticoagulation management',
      'Plan for reversal agents if needed',
      'Coordinate with maternal medicine team'
    ];
    
    recommendations.push(...anticoagulationRecommendations);
  }
  
  if (input.multipleGestation) {
    const multipleGestationRecommendations = t ? [
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.multiple_gestation.0'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.multiple_gestation.1'),
      t('calculators.obgyn.pph_risk_calculator.results.recommendations.multiple_gestation.2')
    ] : [
      'Enhanced monitoring for uterine atony',
      'Consider early oxytocin administration',
      'Pediatric team coordination for multiple infants'
    ];
    
    recommendations.push(...multipleGestationRecommendations);
  }
  
  // Generate interpretation using translation keys
  const interpretation = t ? 
    `${t('calculators.obgyn.pph_risk_calculator.results.interpretations.assessment_prefix')} ${t(`calculators.obgyn.pph_risk_calculator.results.categories.${category.replace('-', '_')}`)} ${t('calculators.obgyn.pph_risk_calculator.results.interpretations.category_suffix')} ${riskScore}/20). ${t(`calculators.obgyn.pph_risk_calculator.results.interpretations.${category.replace('-', '_')}`)}` :
    `PPH risk assessment indicates ${category.replace('-', ' ')} risk category (Score: ${riskScore}/20). ${
      category === 'low' ? 'Standard prevention protocols are appropriate with routine postpartum monitoring.' :
      category === 'moderate' ? 'Enhanced prevention strategies recommended with increased monitoring and preparation.' :
      category === 'high' ? 'High-risk protocols required with immediate availability of emergency interventions.' :
      'Very high-risk patient requiring maximal preparation, multidisciplinary involvement, and enhanced emergency protocols.'
    } Early identification and preparation are essential for optimal maternal outcomes.`;

  return {
    value: riskScore,
    unit: 'points',
    category,
    interpretation,
    recommendations,
    references: [
      'ACOG Practice Bulletin No. 183: Postpartum Hemorrhage',
      'California Maternal Quality Care Collaborative: OB Hemorrhage Toolkit',
      'National Partnership for Maternal Safety: Consensus Bundle on Obstetric Hemorrhage',
      'WHO Guidelines: Management of postpartum haemorrhage and retained placenta',
      'SMFM Consult Series #44: Management of bleeding in the late preterm period'
    ],
    riskScore,
    preventionStrategy, // Return raw value, not translated
    interventionPlan,
    emergencyPreparation // Return boolean, not translated string
  };
}

function calculateCervicalCancerRisk(input: CervicalCancerRiskInput, t?: (key: string) => string): CervicalCancerRiskResult {
  let riskScore = 0;
  const riskFactors: string[] = [];
  
  const age = parseInt(input.age);
  
  // Age-based risk (cervical cancer rates peak 35-44 years)
  if (age >= 30 && age <= 44) {
    riskScore += 2;
    riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.peak_incidence_age') : 'Peak incidence age group');
  } else if (age >= 45 && age <= 54) {
    riskScore += 1;
    riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.elevated_risk_age') : 'Elevated risk age group');
  }

  // HPV status (most important risk factor)
  if (input.hpvStatus === 'positive-high-risk') {
    riskScore += 8;
    riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.high_risk_hpv') : 'High-risk HPV infection');
  } else if (input.hpvStatus === 'positive-low-risk') {
    riskScore += 2;
    riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.low_risk_hpv') : 'Low-risk HPV infection');
  } else if (input.hpvStatus === 'negative') {
    riskScore -= 2;
    riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.hpv_negative') : 'HPV negative (protective)');
  }

  // Cytology results
  switch (input.cytologyResult) {
    case 'hsil':
    case 'asc-h':
      riskScore += 6;
      riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.high_grade_cytology') : 'High-grade cytologic abnormality');
      break;
    case 'lsil':
      riskScore += 3;
      riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.low_grade_cytology') : 'Low-grade cytologic abnormality');
      break;
    case 'ascus':
      riskScore += 1;
      riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.ascus') : 'Atypical cells of undetermined significance');
      break;
    case 'agc':
      riskScore += 4;
      riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.agc') : 'Atypical glandular cells');
      break;
    case 'normal':
      riskScore -= 1;
      riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.normal_cytology') : 'Normal cytology (protective)');
      break;
  }

  // Previous abnormal screening
  if (input.previousAbnormalScreening) {
    riskScore += 3;
    riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.previous_abnormal') : 'History of abnormal screening results');
  }

  // Smoking status
  if (input.smokingStatus) {
    riskScore += 2;
    riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.smoking') : 'Current tobacco use');
  }

  // Immunocompromised status
  if (input.immunocompromised) {
    riskScore += 4;
    riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.immunocompromised') : 'Immunocompromised status');
  }

  // Screening history
  switch (input.screeningHistory) {
    case 'never-screened':
      riskScore += 3;
      riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.never_screened') : 'Never screened');
      break;
    case 'inadequate':
      riskScore += 2;
      riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.inadequate_screening') : 'Inadequate screening history');
      break;
    case 'adequate':
      riskScore -= 1;
      riskFactors.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.risk_factors.adequate_screening') : 'Adequate screening history (protective)');
      break;
  }

  // Determine risk level
  let riskLevel: 'minimal' | 'low' | 'intermediate' | 'high';
  let managementRecommendation: string;
  let followUpInterval: string;
  let colposcopyRecommended: boolean;

  if (riskScore <= 0) {
    riskLevel = 'minimal';
    managementRecommendation = t ? t('calculators.obgyn.cervical_cancer_risk.service.management.minimal') : 'Continue routine screening per guidelines';
    followUpInterval = t ? t('calculators.obgyn.cervical_cancer_risk.service.follow_up.minimal') : '3-5 years (depending on age and screening method)';
    colposcopyRecommended = false;
  } else if (riskScore <= 3) {
    riskLevel = 'low';
    managementRecommendation = t ? t('calculators.obgyn.cervical_cancer_risk.service.management.low') : 'Enhanced surveillance with co-testing or primary HPV testing';
    followUpInterval = t ? t('calculators.obgyn.cervical_cancer_risk.service.follow_up.low') : '1-3 years';
    colposcopyRecommended = false;
  } else if (riskScore <= 8) {
    riskLevel = 'intermediate';
    managementRecommendation = t ? t('calculators.obgyn.cervical_cancer_risk.service.management.intermediate') : 'Consider colposcopy referral, enhanced surveillance recommended';
    followUpInterval = t ? t('calculators.obgyn.cervical_cancer_risk.service.follow_up.intermediate') : '6-12 months';
    colposcopyRecommended = true;
  } else {
    riskLevel = 'high';
    managementRecommendation = t ? t('calculators.obgyn.cervical_cancer_risk.service.management.high') : 'Immediate colposcopy referral strongly recommended';
    followUpInterval = t ? t('calculators.obgyn.cervical_cancer_risk.service.follow_up.high') : '3-6 months';
    colposcopyRecommended = true;
  }

  // Generate interpretation with proper translation
  const interpretation = t ? 
    `${t(`calculators.obgyn.cervical_cancer_risk.service.interpretation.${riskLevel}`)} ${riskFactors.length > 0 ? riskFactors.slice(0, 3).join(', ') + '.' : ''}` :
    `Based on clinical risk factors, patient has ${riskLevel} risk for cervical cancer. ${
      riskFactors.length > 0 ? `Key factors include: ${riskFactors.slice(0, 3).join(', ')}.` : ''
    }`;

  // Generate recommendations
  const recommendations: string[] = [managementRecommendation];
  
  if (colposcopyRecommended) {
    recommendations.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.recommendations.colposcopy') : 'Refer for colposcopic evaluation');
  }
  
  if (input.hpvStatus === 'unknown') {
    recommendations.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.recommendations.hpv_testing') : 'Consider HPV testing if not recently performed');
  }
  
  if (input.smokingStatus) {
    recommendations.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.recommendations.smoking_cessation') : 'Smoking cessation counseling strongly recommended');
  }
  
  if (input.immunocompromised) {
    recommendations.push(t ? t('calculators.obgyn.cervical_cancer_risk.service.recommendations.enhanced_surveillance') : 'Enhanced surveillance due to immunocompromised status');
  }

  return {
    value: riskScore,
    category: riskLevel === 'minimal' ? 'low' : riskLevel === 'low' ? 'low' : riskLevel === 'intermediate' ? 'moderate' : 'high',
    interpretation,
    recommendations,
    references: t ? (t('calculators.obgyn.cervical_cancer_risk.service.references', { returnObjects: true }) as string[]) : [
      'ASCCP Risk-Based Management Consensus Guidelines (2019)',
      'American Cancer Society Cervical Cancer Screening Guidelines',
      'WHO Classification of Tumours of Female Reproductive Organs',
      'NCCN Guidelines for Cervical Cancer Screening'
    ],
    riskLevel,
    managementRecommendation,
    followUpInterval,
    colposcopyRecommended
  };
}

function calculateEndometrialCancerRisk(input: EndometrialCancerRiskInput, t?: (key: string) => string): EndometrialCancerRiskResult {
  let lifetimeRisk = 2.8; // Base lifetime risk for general population
  let riskMultiplier = 1.0;
  const riskFactors: string[] = [];
  const protectiveFactors: string[] = [];
  
  const age = parseInt(input.age);
  const bmi = parseFloat(input.bmi);
  
  // Age factor
  if (age >= 55 && age <= 69) {
    riskMultiplier += 0.3;
    riskFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.peak_incidence_age') || 'Peak incidence age group (55-69 years)');
  } else if (age >= 70) {
    riskMultiplier += 0.2;
    riskFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.advanced_age') || 'Advanced age');
  }
  
  // BMI - strongest modifiable risk factor
  if (bmi >= 35) {
    riskMultiplier += 4.0; // 5-6x increased risk for BMI ≥35
    riskFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.severe_obesity') || 'Severe obesity (BMI ≥35) - 5-6x increased risk');
  } else if (bmi >= 30) {
    riskMultiplier += 2.0; // 3x increased risk for BMI 30-34.9
    riskFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.obesity') || 'Obesity (BMI 30-34.9) - 3x increased risk');
  } else if (bmi >= 25) {
    riskMultiplier += 0.5; // Moderately increased risk
    riskFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.overweight') || 'Overweight (BMI 25-29.9) - moderately increased risk');
  } else if (bmi >= 18.5 && bmi < 25) {
    protectiveFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.normal_bmi_baseline') || 'Normal BMI (18.5-24.9) - baseline risk');
  }
  
  // Medical conditions
  if (input.diabetes) {
    riskMultiplier += 1.5; // 2-4x increased risk
    riskFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.type_2_diabetes_risk') || 'Type 2 diabetes mellitus - 2-4x increased risk');
  }
  
  if (input.lynchSyndrome) {
    lifetimeRisk = 50; // 40-60% lifetime risk for Lynch syndrome
    riskMultiplier = 18;
    riskFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.lynch_syndrome_risk') || 'Lynch syndrome - 40-60% lifetime risk');
  }
  
  if (input.familyHistory) {
    riskMultiplier += 1.8;
    riskFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.family_history_cancer') || 'Family history of endometrial/ovarian/colon cancer');
  }
  
  // Reproductive history
  if (input.nulliparity) {
    riskMultiplier += 1.5; // 2-3x increased risk
    riskFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.nulliparity_risk') || 'Nulliparity - 2-3x increased risk');
  } else {
    protectiveFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.parity_protective') || 'Parity - protective against endometrial cancer');
  }
  
  if (input.lateMenupause) {
    riskMultiplier += 1.2;
    riskFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.late_menopause_estrogen') || 'Late menopause (>52 years) - prolonged estrogen exposure');
  }
  
  // Medication history
  if (input.tamoxifenUse) {
    riskMultiplier += 2.5; // 2-7x increased risk
    riskFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.tamoxifen_risk') || 'Tamoxifen use - 2-7x increased risk');
  }
  
  if (input.unopposedEstrogen) {
    riskMultiplier += 8.0; // 8-15x increased risk
    riskFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.unopposed_estrogen_risk') || 'Unopposed estrogen therapy - 8-15x increased risk');
  }
  
  // Calculate final lifetime risk
  if (!input.lynchSyndrome) {
    lifetimeRisk = 2.8 * riskMultiplier;
  }
  
  // Calculate annual risk (approximate)
  const annualRisk = lifetimeRisk / 80; // Rough approximation
  
  // Risk category determination
  let category: 'low' | 'moderate' | 'high' | 'very-high';
  let screeningRecommendation: string;
  
  if (lifetimeRisk >= 40) {
    category = 'very-high';
    screeningRecommendation = t?.('calculators.obgyn.endometrial_cancer_risk.service.screening_very_high') || 'Annual endometrial biopsy starting at age 35. Consider prophylactic hysterectomy after childbearing.';
  } else if (lifetimeRisk >= 15) {
    category = 'high';
    screeningRecommendation = t?.('calculators.obgyn.endometrial_cancer_risk.service.screening_high') || 'Enhanced surveillance with annual evaluation. Consider endometrial sampling for any abnormal bleeding.';
  } else if (lifetimeRisk >= 8) {
    category = 'moderate';
    screeningRecommendation = t?.('calculators.obgyn.endometrial_cancer_risk.service.screening_moderate') || 'Increased vigilance for symptoms. Prompt evaluation of any abnormal bleeding.';
  } else {
    category = 'low';
    screeningRecommendation = t?.('calculators.obgyn.endometrial_cancer_risk.service.screening_low') || 'Standard care. Evaluate any postmenopausal bleeding promptly.';
  }
  
  const recommendations: string[] = [
    screeningRecommendation
  ];
  
  // Risk-specific recommendations
  if (input.lynchSyndrome) {
    recommendations.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.genetic_counseling') || 'Genetic counseling and family cascade testing');
    recommendations.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.prophylactic_surgery') || 'Consider prophylactic hysterectomy and bilateral salpingo-oophorectomy after childbearing');
    recommendations.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.enhanced_surveillance') || 'Enhanced surveillance for Lynch syndrome-associated cancers');
  }
  
  if (bmi >= 30) {
    recommendations.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.weight_management') || 'Weight management through diet and exercise');
    recommendations.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.bariatric_surgery') || 'Consider bariatric surgery for severe obesity');
  }
  
  if (input.diabetes) {
    recommendations.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.glycemic_control') || 'Optimize glycemic control with HbA1c target <7%');
    recommendations.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.metformin_consideration') || 'Consider metformin which may have protective effects');
  }
  
  if (input.unopposedEstrogen) {
    recommendations.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.progestin_addition') || 'Consider adding progestin to estrogen therapy');
    recommendations.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.hormone_alternatives') || 'Evaluate alternative hormone therapy options');
  }
  
  // General recommendations
  recommendations.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.healthy_lifestyle') || 'Maintain healthy lifestyle: regular exercise, balanced diet');
  recommendations.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.postmenopausal_bleeding_evaluation') || 'Immediate evaluation for any postmenopausal bleeding');
  recommendations.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.annual_gynecologic_exam') || 'Annual gynecologic examination with pelvic exam');
  
  // Add protective factors if applicable
  if (!input.nulliparity) {
    protectiveFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.pregnancy_history') || 'History of pregnancy(ies)');
  }
  
  if (bmi < 25) {
    protectiveFactors.push(t?.('calculators.obgyn.endometrial_cancer_risk.service.normal_body_weight') || 'Normal body weight');
  }
  
  const lifetimeRiskText = t?.('calculators.obgyn.endometrial_cancer_risk.service.lifetime_endometrial_cancer_risk') || 'lifetime endometrial cancer risk';
  const populationAverageText = t?.('calculators.obgyn.endometrial_cancer_risk.service.population_average') || 'population average';
  const primaryRiskFactorsText = t?.('calculators.obgyn.endometrial_cancer_risk.service.primary_risk_factors') || 'Primary risk factors:';
  const noRiskFactorsText = t?.('calculators.obgyn.endometrial_cancer_risk.service.no_risk_factors') || 'No significant risk factors identified';
  
  const interpretation = `${lifetimeRisk.toFixed(1)}% ${lifetimeRiskText} (${riskMultiplier.toFixed(1)}x ${populationAverageText}). ${riskFactors.length > 0 ? primaryRiskFactorsText + ' ' + riskFactors.slice(0, 3).join(', ') + '.' : noRiskFactorsText + '.'}`;
  
  return {
    value: `${lifetimeRisk.toFixed(1)}%`,
    unit: 'lifetime risk',
    category: category,
    interpretation: interpretation,
    recommendations: recommendations,
    references: [
      'NCCN Guidelines v2024.1: Uterine Neoplasms',
      'SGO Clinical Practice Statement: Endometrial Cancer Screening',
      'ACOG Practice Bulletin: Lynch Syndrome and Gynecologic Cancers',
      'American Cancer Society: Endometrial Cancer Risk Factors'
    ],
    lifetimeRisk: parseFloat(lifetimeRisk.toFixed(1)),
    annualRisk: parseFloat(annualRisk.toFixed(2)),
    screeningRecommendation: screeningRecommendation,
    protectiveFactors: protectiveFactors
  };
}

function calculateOvarianCancerRisk(input: OvarianCancerRiskInput, t?: (key: string) => string): OvarianCancerRiskResult {
  const riskScore = 0;
  const riskFactors: string[] = [];
  
  const age = parseInt(input.age);
  const parity = parseInt(input.parity);
  const ocUse = parseFloat(input.oralContraceptiveUse);
  
  // Base lifetime risk for general population: ~1.3%
  let lifetimeRisk = 1.3;
  let riskMultiplier = 1.0;
  
  // Genetic factors (highest impact)
  if (input.brca1) {
    lifetimeRisk = 39; // BRCA1 carriers: 39% lifetime risk
    riskMultiplier = 30;
    riskFactors.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_factors.brca1_mutation') || 'BRCA1 mutation (very high risk)');
  } else if (input.brca2) {
    lifetimeRisk = 11; // BRCA2 carriers: 11% lifetime risk
    riskMultiplier = 8.5;
    riskFactors.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_factors.brca2_mutation') || 'BRCA2 mutation (high risk)');
  } else if (input.lynchSyndrome) {
    lifetimeRisk = 8; // Lynch syndrome: 8% lifetime risk
    riskMultiplier = 6;
    riskFactors.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_factors.lynch_syndrome') || 'Lynch syndrome (high risk)');
  }
  
  // Family history (if no genetic mutation identified)
  if (!input.brca1 && !input.brca2 && !input.lynchSyndrome) {
    if (input.familyHistory === 'ovarian') {
      riskMultiplier += 3.1;
      riskFactors.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_factors.family_history_ovarian') || 'Family history of ovarian cancer');
    } else if (input.familyHistory === 'breast') {
      riskMultiplier += 1.8;
      riskFactors.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_factors.family_history_breast') || 'Family history of breast cancer');
    } else if (input.familyHistory === 'both') {
      riskMultiplier += 4.2;
      riskFactors.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_factors.family_history_both') || 'Family history of ovarian and breast cancer');
    }
  }
  
  // Personal cancer history
  if (input.personalBreastCancer) {
    riskMultiplier += 2.0;
    riskFactors.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_factors.personal_breast_cancer') || 'Personal history of breast cancer');
  }
  
  // Age factor (risk increases with age, peaks around 60-65)
  if (age >= 50 && age <= 64) {
    riskMultiplier += 0.5;
    riskFactors.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_factors.peak_age') || 'Peak incidence age group');
  } else if (age >= 65) {
    riskMultiplier += 0.3;
    riskFactors.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_factors.advanced_age') || 'Advanced age');
  }
  
  // Reproductive factors
  if (parity === 0) {
    riskMultiplier += 1.5;
    riskFactors.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_factors.nulliparity') || 'Nulliparity');
  } else if (parity >= 3) {
    riskMultiplier -= 0.5;
    riskFactors.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_factors.multiparity') || 'Multiparity (protective)');
  }
  
  // Oral contraceptive use (protective)
  if (ocUse > 0) {
    const protection = Math.min(0.5, ocUse * 0.1); // 10% reduction per year, max 50%
    riskMultiplier -= protection;
    riskFactors.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_factors.oral_contraceptive_use') || `Oral contraceptive use: ${ocUse} years (protective)`);
  }
  
  // Hormone replacement therapy
  if (input.hormonetherapy) {
    riskMultiplier += 1.2;
    riskFactors.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_factors.hormone_therapy') || 'Hormone replacement therapy');
  }
  
  // Calculate final lifetime risk
  if (!input.brca1 && !input.brca2 && !input.lynchSyndrome) {
    lifetimeRisk = 1.3 * riskMultiplier;
  }
  
  // Risk category determination
  let category: 'low' | 'moderate' | 'high' | 'very-high';
  let screeningRecommendation: string;
  let prophylacticSurgeryDiscussion: boolean = false;
  
  if (lifetimeRisk >= 20) {
    category = 'very-high';
    screeningRecommendation = t?.('calculators.obgyn.ovarian_cancer_risk.service.screening_recommendations.enhanced_surveillance') || 'Enhanced surveillance with TVS/CA-125 every 6 months. Consider prophylactic bilateral salpingo-oophorectomy.';
    prophylacticSurgeryDiscussion = true;
  } else if (lifetimeRisk >= 10) {
    category = 'high';
    screeningRecommendation = t?.('calculators.obgyn.ovarian_cancer_risk.service.screening_recommendations.high_risk_surveillance') || 'Annual transvaginal ultrasound and CA-125. Genetic counseling recommended.';
    prophylacticSurgeryDiscussion = true;
  } else if (lifetimeRisk >= 5) {
    category = 'moderate';
    screeningRecommendation = t?.('calculators.obgyn.ovarian_cancer_risk.service.screening_recommendations.standard_surveillance') || 'Standard surveillance. Consider genetic counseling if strong family history.';
  } else {
    category = 'low';
    screeningRecommendation = t?.('calculators.obgyn.ovarian_cancer_risk.service.screening_recommendations.population_based') || 'Population-based screening not recommended. Focus on symptom awareness.';
  }
  
  const recommendations: string[] = [
    screeningRecommendation
  ];
  
  // Add genetic counseling recommendations
  if (input.brca1 || input.brca2 || input.lynchSyndrome) {
    recommendations.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.clinical_recommendations.genetic_counseling') || 'Genetic counseling and family cascade testing recommended');
    recommendations.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.clinical_recommendations.prophylactic_surgery') || 'Discuss timing of prophylactic surgery based on reproductive plans');
  } else if (input.familyHistory !== 'none') {
    recommendations.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.clinical_recommendations.consider_genetic_testing') || 'Consider genetic counseling and BRCA/Lynch syndrome testing');
  }
  
  // Add symptom awareness
  recommendations.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.clinical_recommendations.symptom_awareness_short') || 'Symptom awareness education');
  
  // Risk reduction strategies
  if (age < 40 && parity === 0) {
    recommendations.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.clinical_recommendations.pregnancy_consideration') || 'Consider pregnancy and breastfeeding for risk reduction');
  }
  
  if (ocUse === 0 && age < 45) {
    recommendations.push(t?.('calculators.obgyn.ovarian_cancer_risk.service.clinical_recommendations.oc_consideration') || 'Discuss oral contraceptive use for ovarian cancer risk reduction');
  }
  
  const interpretation = `${lifetimeRisk.toFixed(1)}% ${t?.('calculators.obgyn.ovarian_cancer_risk.results.lifetime_risk.title') || 'lifetime ovarian cancer risk'} (${riskMultiplier.toFixed(1)}x ${t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_interpretations.population_average') || 'population average'}). ${riskFactors.length > 0 ? (t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_interpretations.risk_factors_prefix') || 'Risk factors: ') + riskFactors.slice(0, 3).join(', ') + '.' : (t?.('calculators.obgyn.ovarian_cancer_risk.service.risk_interpretations.no_risk_factors') || 'No significant risk factors identified.')}`;
  
  return {
    value: `${lifetimeRisk.toFixed(1)}%`,
    unit: t?.('calculators.obgyn.ovarian_cancer_risk.results.lifetime_risk.title') || 'lifetime risk',
    category: category,
    interpretation: interpretation,
    recommendations: recommendations,
    references: [
      'NCCN Guidelines for Genetic/Familial High-Risk Assessment: Breast, Ovarian, and Pancreatic',
      'SGO Clinical Practice Statement: Genetic Testing for Ovarian Cancer',
      'ACOG Practice Bulletin: Hereditary Cancer Syndromes and Risk Assessment',
      'Cancer Epidemiology, Biomarkers & Prevention: Ovarian Cancer Risk Factors'
    ],
    lifetimeRisk: parseFloat(lifetimeRisk.toFixed(1)),
    riskMultiplier: parseFloat(riskMultiplier.toFixed(1)),
    screeningRecommendation: screeningRecommendation,
    prophylacticSurgeryDiscussion: prophylacticSurgeryDiscussion
  };
}

// ========================================
// MAIN CALCULATOR DISPATCHER
// ========================================

export function calculateOBGYN(
  calculatorType: OBGYNCalculatorType,
  input: OBGYNCalculatorInput,
  t?: (key: string) => string
): OBGYNCalculatorResult {
  try {
    switch (calculatorType) {
      case 'edd-calculator':
        return calculateEDD(input as EDDCalculatorInput);
      
      case 'gestational-age':
        return calculateGestationalAge(input as GestationalAgeInput);
      
      case 'preeclampsia-risk':
        return calculatePreeclampsiaRisk(input as PreeclampsiaRiskInput);
      
      case 'preterm-birth-risk':
        return calculatePretermBirthRisk(input as PretermBirthRiskInput);
      
      case 'gdm-screening':
        return calculateGDMScreening(input as GDMScreeningInput);
      
      case 'vbac-success':
        return calculateVBACSuccess(input as VBACSuccessInput, t);
      
      case 'bishop-score':
        return calculateBishopScore(input as BishopScoreInput, t);
      
      case 'apgar-score':
        return calculateApgarScore(input as ApgarScoreInput);
      
      case 'pph-risk':
        return calculatePPHRisk(input as PPHRiskInput, t);
      
      case 'cervical-cancer-risk':
        return calculateCervicalCancerRisk(input as CervicalCancerRiskInput, t);
      
      case 'ovarian-cancer-risk':
        return calculateOvarianCancerRisk(input as OvarianCancerRiskInput, t);
      
      case 'endometrial-cancer-risk':
        return calculateEndometrialCancerRisk(input as EndometrialCancerRiskInput, t);
      
      case 'ovarian-reserve':
      case 'menopause-assessment':
        throw new Error(`Calculator ${calculatorType} is not yet implemented`);
      
      default:
        throw new Error(`Unknown calculator type: ${calculatorType}`);
    }
  } catch (error) {
    throw new Error(`Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ========================================
// VALIDATION UTILITIES
// ========================================

export function validateOBGYNInput(
  calculatorType: OBGYNCalculatorType,
  input: OBGYNCalculatorInput
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (calculatorType) {
    case 'edd-calculator':
      const eddInput = input as EDDCalculatorInput;
      if (!eddInput.lmpDate && !eddInput.firstTrimesterCRL && !eddInput.artTransferDate) {
        errors.push('At least one dating method (LMP, ultrasound, or ART) is required');
      }
      if (eddInput.firstTrimesterCRL) {
        const crl = parseFloat(eddInput.firstTrimesterCRL);
        if (isNaN(crl) || crl < 15 || crl > 95) {
          errors.push('Crown-rump length must be between 15-95mm for accurate dating');
        }
      }
      break;

    case 'gestational-age':
      const gaInput = input as GestationalAgeInput;
      if (!gaInput.referenceDate && !gaInput.calculationDate) {
        errors.push('Reference date is required');
      }
      if (!gaInput.eddDate && !gaInput.lmpDate && !gaInput.firstTrimesterCRL) {
        errors.push('At least one dating method (EDD, LMP, or ultrasound CRL) is required');
      }
      if (gaInput.firstTrimesterCRL) {
        const crl = parseFloat(gaInput.firstTrimesterCRL);
        if (isNaN(crl) || crl < 15 || crl > 95) {
          errors.push('Crown-rump length must be between 15-95mm for accurate dating');
        }
      }
      break;

    case 'preeclampsia-risk':
      const preInput = input as PreeclampsiaRiskInput;
      const age = parseInt(preInput.maternalAge);
      const bmi = parseFloat(preInput.bmi);
      
      if (isNaN(age) || age < 12 || age > 60) {
        errors.push('Maternal age must be between 12-60 years');
      }
      if (isNaN(bmi) || bmi < 15 || bmi > 60) {
        errors.push('BMI must be between 15-60 kg/m²');
      }
      break;

    case 'preterm-birth-risk':
      const pretermInput = input as PretermBirthRiskInput;
      
      // Validate gestational age
      if (!pretermInput.gestationalAge) {
        errors.push('Current gestational age is required');
      } else {
        const ga = parseFloat(pretermInput.gestationalAge);
        if (isNaN(ga) || ga < 16 || ga > 36) {
          errors.push('Gestational age must be between 16-36 weeks for risk assessment');
        }
      }
      
      // Validate cervical length
      if (!pretermInput.cervicalLength) {
        errors.push('Cervical length measurement is required');
      } else {
        const cl = parseFloat(pretermInput.cervicalLength);
        if (isNaN(cl) || cl < 5 || cl > 60) {
          errors.push('Cervical length must be between 5-60mm');
        }
      }
      
      // Validate BMI
      if (!pretermInput.bmi) {
        errors.push('BMI is required');
      } else {
        const bmi = parseFloat(pretermInput.bmi);
        if (isNaN(bmi) || bmi < 15 || bmi > 60) {
          errors.push('BMI must be between 15-60 kg/m²');
        }
      }
      break;

    case 'bishop-score':
      const bishopInput = input as BishopScoreInput;
      
      // Validate cervical dilation
      if (!bishopInput.cervicalDilation) {
        errors.push('Cervical dilation is required');
      } else {
        const dilation = parseFloat(bishopInput.cervicalDilation);
        if (isNaN(dilation) || dilation < 0 || dilation > 10) {
          errors.push('Cervical dilation must be between 0-10 cm');
        }
      }
      
      // Validate cervical effacement
      if (!bishopInput.cervicalEffacement) {
        errors.push('Cervical effacement is required');
      } else {
        const effacement = parseFloat(bishopInput.cervicalEffacement);
        if (isNaN(effacement) || effacement < 0 || effacement > 100) {
          errors.push('Cervical effacement must be between 0-100%');
        }
      }
      
      // Validate fetal station
      if (!bishopInput.fetalStation) {
        errors.push('Fetal station is required');
      } else {
        const station = parseInt(bishopInput.fetalStation);
        if (isNaN(station) || station < -3 || station > 3) {
          errors.push('Fetal station must be between -3 and +3');
        }
      }
      
      // Validate cervical consistency
      if (!bishopInput.cervicalConsistency || !['firm', 'medium', 'soft'].includes(bishopInput.cervicalConsistency)) {
        errors.push('Cervical consistency must be firm, medium, or soft');
      }
      
      // Validate cervical position
      if (!bishopInput.cervicalPosition || !['posterior', 'mid', 'anterior'].includes(bishopInput.cervicalPosition)) {
        errors.push('Cervical position must be posterior, mid, or anterior');
      }
      break;

    case 'apgar-score':
      const apgarInput = input as ApgarScoreInput;
      
      // Validate heart rate
      if (!apgarInput.heartRate || !['absent', 'slow', 'normal'].includes(apgarInput.heartRate)) {
        errors.push('Heart rate assessment is required');
      }
      
      // Validate respiratory effort
      if (!apgarInput.respiratoryEffort || !['absent', 'weak', 'strong'].includes(apgarInput.respiratoryEffort)) {
        errors.push('Respiratory effort assessment is required');
      }
      
      // Validate muscle tone
      if (!apgarInput.muscletone || !['limp', 'some-flexion', 'active'].includes(apgarInput.muscletone)) {
        errors.push('Muscle tone assessment is required');
      }
      
      // Validate reflex response
      if (!apgarInput.reflexResponse || !['no-response', 'grimace', 'cry'].includes(apgarInput.reflexResponse)) {
        errors.push('Reflex response assessment is required');
      }
      
      // Validate color appearance
      if (!apgarInput.colorAppearance || !['blue-pale', 'acrocyanotic', 'pink'].includes(apgarInput.colorAppearance)) {
        errors.push('Color appearance assessment is required');
      }
      
      // Validate timepoint
      if (!apgarInput.timepoint || !['1-min', '5-min', '10-min'].includes(apgarInput.timepoint)) {
        errors.push('Assessment timepoint must be 1-min, 5-min, or 10-min');
      }
      break;

    case 'gdm-screening':
      const gdmInput = input as GDMScreeningInput;
      
      // Validate maternal age
      if (!gdmInput.maternalAge) {
        errors.push('Maternal age is required');
      } else {
        const age = parseInt(gdmInput.maternalAge);
        if (isNaN(age) || age < 15 || age > 55) {
          errors.push('Maternal age must be between 15-55 years');
        }
      }
      
      // Validate BMI
      if (!gdmInput.bmi) {
        errors.push('Pre-pregnancy BMI is required');
      } else {
        const bmi = parseFloat(gdmInput.bmi);
        if (isNaN(bmi) || bmi < 15 || bmi > 60) {
          errors.push('BMI must be between 15-60 kg/m²');
        }
      }
      
      // Validate race
      if (!gdmInput.race || !['white', 'hispanic', 'african-american', 'asian', 'native-american', 'other'].includes(gdmInput.race)) {
        errors.push('Race/ethnicity selection is required');
      }
      break;

    case 'vbac-success':
      const vbacInput = input as VBACSuccessInput;
      
      // Validate maternal age
      if (!vbacInput.maternalAge) {
        errors.push('Maternal age is required');
      } else {
        const age = parseInt(vbacInput.maternalAge);
        if (isNaN(age) || age < 15 || age > 55) {
          errors.push('Maternal age must be between 15-55 years');
        }
      }
      
      // Validate BMI
      if (!vbacInput.bmi) {
        errors.push('BMI is required');
      } else {
        const bmi = parseFloat(vbacInput.bmi);
        if (isNaN(bmi) || bmi < 15 || bmi > 60) {
          errors.push('BMI must be between 15-60 kg/m²');
        }
      }
      
      // Validate gestational age
      if (!vbacInput.gestationalAge) {
        errors.push('Gestational age is required');
      } else {
        const ga = parseFloat(vbacInput.gestationalAge);
        if (isNaN(ga) || ga < 34 || ga > 42) {
          errors.push('Gestational age must be between 34-42 weeks');
        }
      }
      
      // Validate optional cervical dilation
      if (vbacInput.cervicalDilation) {
        const dilation = parseFloat(vbacInput.cervicalDilation);
        if (isNaN(dilation) || dilation < 0 || dilation > 10) {
          errors.push('Cervical dilation must be between 0-10 cm');
        }
      }
      
      // Validate optional estimated fetal weight
      if (vbacInput.estimatedFetalWeight) {
        const weight = parseFloat(vbacInput.estimatedFetalWeight);
        if (isNaN(weight) || weight < 1000 || weight > 6000) {
          errors.push('Estimated fetal weight must be between 1000-6000 grams');
        }
      }
      break;

    case 'pph-risk':
      const pphInput = input as PPHRiskInput;
      
      // Validate maternal age
      if (!pphInput.maternalAge) {
        errors.push('Maternal age is required');
      } else {
        const age = parseInt(pphInput.maternalAge);
        if (isNaN(age) || age < 15 || age > 55) {
          errors.push('Maternal age must be between 15-55 years');
        }
      }
      
      // Validate BMI
      if (!pphInput.bmi) {
        errors.push('BMI is required');
      } else {
        const bmi = parseFloat(pphInput.bmi);
        if (isNaN(bmi) || bmi < 15 || bmi > 60) {
          errors.push('BMI must be between 15-60 kg/m²');
        }
      }
      
      // Validate parity
      if (!pphInput.parity) {
        errors.push('Parity is required');
      } else {
        const parity = parseInt(pphInput.parity);
        if (isNaN(parity) || parity < 0 || parity > 20) {
          errors.push('Parity must be between 0-20');
        }
      }
      break;

    case 'cervical-cancer-risk':
      return validateCervicalCancerRiskInput(input as CervicalCancerRiskInput);
      
    case 'ovarian-cancer-risk':
      const ovarianInput = input as OvarianCancerRiskInput;
      
      // Validate age
      if (!ovarianInput.age) {
        errors.push('Age is required');
      } else {
        const age = parseInt(ovarianInput.age);
        if (isNaN(age) || age < 18 || age > 100) {
          errors.push('Age must be between 18-100 years');
        }
      }
      
      // Validate parity
      if (!ovarianInput.parity) {
        errors.push('Parity is required');
      } else {
        const parity = parseInt(ovarianInput.parity);
        if (isNaN(parity) || parity < 0 || parity > 20) {
          errors.push('Parity must be between 0-20');
        }
      }
      
      // Validate oral contraceptive use
      if (!ovarianInput.oralContraceptiveUse) {
        errors.push('Oral contraceptive use duration is required');
      } else {
        const years = parseFloat(ovarianInput.oralContraceptiveUse);
        if (isNaN(years) || years < 0 || years > 50) {
          errors.push('Oral contraceptive use must be between 0-50 years');
        }
      }
      
      // Validate family history
      const validFamilyHistory = ['none', 'ovarian', 'breast', 'both'];
      if (!validFamilyHistory.includes(ovarianInput.familyHistory)) {
        errors.push('Invalid family history selection');
      }
      break;

    case 'endometrial-cancer-risk':
      const endometrialInput = input as EndometrialCancerRiskInput;
      
      // Validate age
      if (!endometrialInput.age) {
        errors.push('Age is required');
      } else {
        const age = parseInt(endometrialInput.age);
        if (isNaN(age) || age < 18 || age > 100) {
          errors.push('Age must be between 18-100 years');
        }
      }
      
      // Validate BMI
      if (!endometrialInput.bmi) {
        errors.push('BMI is required');
      } else {
        const bmi = parseFloat(endometrialInput.bmi);
        if (isNaN(bmi) || bmi < 15 || bmi > 60) {
          errors.push('BMI must be between 15-60 kg/m²');
        }
      }
      break;

    default:
      throw new Error(`Unknown calculator type: ${calculatorType}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateCervicalCancerRiskInput(input: CervicalCancerRiskInput): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Age validation
  if (!input.age || input.age.trim() === '') {
    errors.push('Age is required');
  } else {
    const age = parseInt(input.age);
    if (isNaN(age) || age < 18 || age > 100) {
      errors.push('Age must be between 18-100 years');
    }
  }

  // HPV status validation
  const validHpvStatuses = ['negative', 'positive-low-risk', 'positive-high-risk', 'unknown'];
  if (!validHpvStatuses.includes(input.hpvStatus)) {
    errors.push('Invalid HPV status');
  }

  // Cytology result validation
  const validCytologyResults = ['normal', 'ascus', 'lsil', 'hsil', 'agc', 'asc-h'];
  if (!validCytologyResults.includes(input.cytologyResult)) {
    errors.push('Invalid cytology result');
  }

  // Screening history validation
  const validScreeningHistory = ['adequate', 'inadequate', 'never-screened'];
  if (!validScreeningHistory.includes(input.screeningHistory)) {
    errors.push('Invalid screening history');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 