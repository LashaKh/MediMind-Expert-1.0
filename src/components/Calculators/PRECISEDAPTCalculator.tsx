import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Calculator, Info, AlertTriangle, Clock, Shield, TrendingDown, TrendingUp, Droplets, Activity, User, FileText, Target, Stethoscope, Award, BarChart3, Brain, Heart, Thermometer, Zap, CheckCircle2 } from 'lucide-react';
import { 
  CalculatorContainer, 
  CalculatorInput, 
  CalculatorSelect, 
  CalculatorCheckbox, 
  CalculatorButton, 
  ResultsDisplay 
} from '../ui/calculator-ui';

interface PRECISEDAPTFormData {
  age: string;
  creatinine: string;
  hemoglobin: string;
  whiteBloodCount: string;
  previousBleed: boolean;
}

interface PRECISEDAPTResult {
  score: number;
  bleedingRisk: 'low' | 'intermediate' | 'high';
  riskPercentage: number;
  daptRecommendation: string;
  durationGuidance: string;
  clinicalGuidance: string;
  riskFactors: string[];
  riskAnalysis: {
    majorBleedingRisk: number;
    clinicalBenefit: string;
    clinicalGuidance: string;
    safeDuration: string;
  };
}

const PRECISEDAPTCalculatorComponent: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<PRECISEDAPTFormData>({
    age: '',
    creatinine: '',
    hemoglobin: '',
    whiteBloodCount: '',
    previousBleed: false
  });

  const [result, setResult] = useState<PRECISEDAPTResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showResult, setShowResult] = useState(false);

  // Refs for form fields to enable scrolling to errors
  const ageRef = useRef<HTMLDivElement>(null);
  const creatinineRef = useRef<HTMLDivElement>(null);
  const hemoglobinRef = useRef<HTMLDivElement>(null);
  const whiteBloodCountRef = useRef<HTMLDivElement>(null);
  const previousBleedRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the first error field
  const scrollToFirstError = (errorKeys: string[]) => {
    if (errorKeys.length === 0) return;

    const fieldRefMap: Record<string, React.RefObject<HTMLDivElement>> = {
      'age': ageRef,
      'creatinine': creatinineRef,
      'hemoglobin': hemoglobinRef,
      'whiteBloodCount': whiteBloodCountRef,
      'previousBleed': previousBleedRef
    };

    // Map fields to their corresponding steps
    const fieldStepMap: Record<string, number> = {
      'age': 1,
      'creatinine': 1,
      'hemoglobin': 1,
      'whiteBloodCount': 1,
      'previousBleed': 2
    };

    // Find the first error field and determine its step
    let targetStep = 1;
    let targetRef: React.RefObject<HTMLDivElement> | null = null;

    for (const errorKey of errorKeys) {
      const ref = fieldRefMap[errorKey];
      const step = fieldStepMap[errorKey];
      
      if (ref && step) {
        targetStep = step;
        targetRef = ref;
        break;
      }
    }

    if (targetRef) {
      // Navigate to the correct step if different from current
      if (targetStep !== currentStep) {
        setCurrentStep(targetStep);
      }
      
      // Scroll to the field with appropriate delay for step changes
      setTimeout(() => {
        targetRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
        
        // Add a subtle shake animation
        targetRef.current?.classList.add('animate-pulse');
        setTimeout(() => {
          targetRef.current?.classList.remove('animate-pulse');
        }, 1000);
      }, targetStep !== currentStep ? 300 : 100);
    }
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.age || parseInt(formData.age) < 18) {
      newErrors.age = t('calculators.cardiology.precise_dapt.age_error');
    } else if (parseInt(formData.age) > 120) {
      newErrors.age = t('calculators.cardiology.precise_dapt.age_error');
    }

    const creatinine = parseFloat(formData.creatinine);
    if (!formData.creatinine || isNaN(creatinine)) {
      newErrors.creatinine = t('calculators.cardiology.precise_dapt.creatinine_error');
    } else if (creatinine < 0.5 || creatinine > 15.0) {
      newErrors.creatinine = t('calculators.cardiology.precise_dapt.creatinine_error');
    }

    const hemoglobin = parseFloat(formData.hemoglobin);
    if (!formData.hemoglobin || isNaN(hemoglobin)) {
      newErrors.hemoglobin = t('calculators.cardiology.precise_dapt.hemoglobin_error');
    } else if (hemoglobin < 5.0 || hemoglobin > 20.0) {
      newErrors.hemoglobin = t('calculators.cardiology.precise_dapt.hemoglobin_error');
    }

    const whiteBloodCount = parseFloat(formData.whiteBloodCount);
    if (!formData.whiteBloodCount || isNaN(whiteBloodCount)) {
      newErrors.whiteBloodCount = t('calculators.cardiology.precise_dapt.white_blood_count_error');
    } else if (whiteBloodCount < 1.0 || whiteBloodCount > 50.0) {
      newErrors.whiteBloodCount = t('calculators.cardiology.precise_dapt.white_blood_count_error');
    }

    setErrors(newErrors);
    
    // If there are errors, scroll to the first one
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(Object.keys(newErrors));
    }
    
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const generateRiskFactors = useCallback((age: number, creatinine: number, hemoglobin: number, whiteBloodCount: number, previousBleed: boolean): string[] => {
    const riskFactors: string[] = [];

    // Age factors
    if (age >= 75) {
      riskFactors.push(t('calculators.cardiology.precise_dapt.risk_factor_advanced_age'));
    } else if (age >= 65) {
      riskFactors.push(t('calculators.cardiology.precise_dapt.risk_factor_elderly_age'));
    }

    // Renal function factors
    if (creatinine >= 2.0) {
      riskFactors.push(t('calculators.cardiology.precise_dapt.risk_factor_severe_renal'));
    } else if (creatinine >= 1.5) {
      riskFactors.push(t('calculators.cardiology.precise_dapt.risk_factor_moderate_renal'));
    } else if (creatinine >= 1.2) {
      riskFactors.push(t('calculators.cardiology.precise_dapt.risk_factor_mild_renal'));
    }

    // Hemoglobin factors
    if (hemoglobin < 10) {
      riskFactors.push(t('calculators.cardiology.precise_dapt.risk_factor_severe_anemia'));
    } else if (hemoglobin < 12) {
      riskFactors.push(t('calculators.cardiology.precise_dapt.risk_factor_moderate_anemia'));
    } else if (hemoglobin < 13) {
      riskFactors.push(t('calculators.cardiology.precise_dapt.risk_factor_low_hemoglobin'));
    }

    // White blood count factors
    if (whiteBloodCount > 12) {
      riskFactors.push(t('calculators.cardiology.precise_dapt.risk_factor_elevated_wbc'));
    } else if (whiteBloodCount < 4) {
      riskFactors.push(t('calculators.cardiology.precise_dapt.risk_factor_low_wbc'));
    }

    // Previous bleeding
    if (previousBleed) {
      riskFactors.push(t('calculators.cardiology.precise_dapt.risk_factor_previous_bleeding'));
    }

    return riskFactors;
  }, [t]);

  const calculatePRECISEDAPTScore = useCallback((): PRECISEDAPTResult => {
    const age = parseInt(formData.age);
    const creatinine = parseFloat(formData.creatinine);
    const hemoglobin = parseFloat(formData.hemoglobin);
    const wbc = parseFloat(formData.whiteBloodCount);
    
    let score = 0;
    const riskFactors: string[] = generateRiskFactors(age, creatinine, hemoglobin, wbc, formData.previousBleed);

    // Age (65-74 = 1.5 points, ≥75 = 2.5 points)
    if (age >= 75) {
      score += 2.5;
    } else if (age >= 65) {
      score += 1.5;
    }

    // Creatinine clearance/renal function (major bleeding predictor)
    if (creatinine >= 2.0) {
      score += 2.0;
    } else if (creatinine >= 1.5) {
      score += 1.0;
    } else if (creatinine >= 1.2) {
      score += 0.5;
    }

    // Hemoglobin (anemia significantly increases bleeding risk and complications)
    if (hemoglobin < 10) {
      score += 1.5;
    } else if (hemoglobin < 12) {
      score += 1.0;
    } else if (hemoglobin < 13) {
      score += 0.5;
    }

    // White blood count (inflammation/infection marker)
    if (wbc > 12) {
      score += 0.5;
    } else if (wbc < 4) {
      score += 0.5;
    }

    // Previous bleeding (strongest clinical predictor)
    if (formData.previousBleed) {
      score += 1.0;
    }

    // Convert score to risk category and determine recommendations
    let bleedingRisk: 'low' | 'intermediate' | 'high';
    let riskPercentage: number;
    let majorBleedingRisk: number;
    let daptRecommendation: string;
    let durationGuidance: string;
    let clinicalGuidance: string;
    let clinicalBenefit: string;
    let safeDuration: string;

    if (score < 25) {
      bleedingRisk = 'low';
      riskPercentage = 7.9;
      majorBleedingRisk = 1.9; // Annual major bleeding risk
      daptRecommendation = t('calculators.cardiology.precise_dapt.recommendation_low');
      durationGuidance = t('calculators.cardiology.precise_dapt.duration_low');
      clinicalGuidance = t('calculators.cardiology.precise_dapt.guidance_low');
      clinicalBenefit = t('calculators.cardiology.precise_dapt.benefit_low');
      safeDuration = t('calculators.cardiology.precise_dapt.safe_duration_low');
    } else if (score < 50) {
      bleedingRisk = 'intermediate';
      riskPercentage = 17.8;
      majorBleedingRisk = 4.2; // Annual major bleeding risk
      daptRecommendation = t('calculators.cardiology.precise_dapt.recommendation_intermediate');
      durationGuidance = t('calculators.cardiology.precise_dapt.duration_intermediate');
      clinicalGuidance = t('calculators.cardiology.precise_dapt.guidance_intermediate');
      clinicalBenefit = t('calculators.cardiology.precise_dapt.benefit_intermediate');
      safeDuration = t('calculators.cardiology.precise_dapt.safe_duration_intermediate');
    } else {
      bleedingRisk = 'high';
      riskPercentage = 35.1;
      majorBleedingRisk = 8.8; // Annual major bleeding risk
      daptRecommendation = t('calculators.cardiology.precise_dapt.recommendation_high');
      durationGuidance = t('calculators.cardiology.precise_dapt.duration_high');
      clinicalGuidance = t('calculators.cardiology.precise_dapt.guidance_high');
      clinicalBenefit = t('calculators.cardiology.precise_dapt.benefit_high');
      safeDuration = t('calculators.cardiology.precise_dapt.safe_duration_high');
    }

    return {
      score,
      bleedingRisk,
      riskPercentage,
      riskFactors,
      daptRecommendation,
      durationGuidance,
      clinicalGuidance,
      riskAnalysis: {
        majorBleedingRisk,
        clinicalBenefit,
        clinicalGuidance,
        safeDuration
      }
    };
  }, [formData, generateRiskFactors, t]);

  const handleCalculate = useCallback(() => {
    if (validateForm()) {
      setIsCalculating(true);
      setTimeout(() => {
        const result = calculatePRECISEDAPTScore();
        setResult(result);
        setShowResult(true);
        setIsCalculating(false);
      }, 1500);
    }
  }, [validateForm, calculatePRECISEDAPTScore]);

  const handleReset = useCallback(() => {
    setFormData({
      age: '',
      creatinine: '',
      hemoglobin: '',
      whiteBloodCount: '',
      previousBleed: false
    });
    setErrors({});
    setResult(null);
    setShowResult(false);
    setCurrentStep(1);
  }, []);

  const handleNext = useCallback(() => {
    const age = parseInt(formData.age);
    const creatinine = parseFloat(formData.creatinine);
    const hemoglobin = parseFloat(formData.hemoglobin);
    const whiteBloodCount = parseFloat(formData.whiteBloodCount);

    if (!formData.age || isNaN(age) || age < 18 || age > 120) {
      setErrors({ age: t('calculators.cardiology.precise_dapt.age_error') });
      return;
    }
    
    if (!formData.creatinine || isNaN(creatinine) || creatinine < 0.5 || creatinine > 15.0) {
      setErrors({ creatinine: t('calculators.cardiology.precise_dapt.creatinine_error') });
      return;
    }
    
    if (!formData.hemoglobin || isNaN(hemoglobin) || hemoglobin < 5.0 || hemoglobin > 20.0) {
      setErrors({ hemoglobin: t('calculators.cardiology.precise_dapt.hemoglobin_error') });
      return;
    }
    
    if (!formData.whiteBloodCount || isNaN(whiteBloodCount) || whiteBloodCount < 1.0 || whiteBloodCount > 50.0) {
      setErrors({ whiteBloodCount: t('calculators.cardiology.precise_dapt.white_blood_count_error') });
      return;
    }

    setErrors({});
    setCurrentStep(2);
  }, [formData, t]);

  const handleBack = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const getInterpretation = useMemo(() => (risk: 'low' | 'intermediate' | 'high', riskPercentage: number) => {
    return t(`calculators.cardiology.precise_dapt.interpretation_${risk}`, { risk: riskPercentage.toString() });
  }, [t]);

  const getRiskLevel = useMemo(() => (risk: string): 'low' | 'borderline' | 'intermediate' | 'high' => {
    return risk as 'low' | 'borderline' | 'intermediate' | 'high';
  }, []);

  const getBleedingInfo = useMemo(() => (risk: string) => {
    switch (risk) {
      case 'low':
        return { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-800' };
      case 'intermediate':
        return { color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-800' };
      case 'high':
        return { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800' };
      default:
        return { color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-900/20', borderColor: 'border-gray-200 dark:border-gray-800' };
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {!showResult ? (
        <CalculatorContainer
          title={t('calculators.cardiology.precise_dapt.title')}
          subtitle={t('calculators.cardiology.precise_dapt.subtitle')}
        >
          {/* Alert Banner */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.precise_dapt.bleeding_assessment_tool')}</h3>
                <p className="text-red-800 dark:text-red-200 mt-2 text-sm leading-relaxed">
                  {t('calculators.cardiology.precise_dapt.tool_description')}
                </p>
              </div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentStep === 1 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                <span className="font-medium">{t('calculators.cardiology.precise_dapt.patient_labs')}</span>
              </div>
              <div className="w-6 h-px bg-gray-300 dark:bg-gray-600"></div>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentStep === 2 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                <span className="font-medium">{t('calculators.cardiology.precise_dapt.bleeding_history')}</span>
              </div>
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Demographics & Lab Values */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.precise_dapt.demographics_labs_section')}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.cardiology.precise_dapt.laboratory_description')}</p>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                  <div ref={ageRef}>
                    <CalculatorInput
                      label={t('calculators.cardiology.precise_dapt.age_label')}
                      value={formData.age}
                      onChange={(value) => setFormData({ ...formData, age: value })}
                      placeholder="75"
                      error={errors.age}
                      type="number"
                    />
                  </div>
                  
                  <div ref={creatinineRef}>
                    <CalculatorInput
                      label={t('calculators.cardiology.precise_dapt.creatinine_label')}
                      value={formData.creatinine}
                      onChange={(value) => setFormData({ ...formData, creatinine: value })}
                      placeholder="1.2"
                      unit={t('calculators.cardiology.precise_dapt.creatinine_unit')}
                      error={errors.creatinine}
                      type="number"
                      step="0.1"
                    />
                  </div>
                  
                  <div ref={hemoglobinRef}>
                    <CalculatorInput
                      label={t('calculators.cardiology.precise_dapt.hemoglobin_label')}
                      value={formData.hemoglobin}
                      onChange={(value) => setFormData({ ...formData, hemoglobin: value })}
                      placeholder="11.5"
                      unit={t('calculators.cardiology.precise_dapt.hemoglobin_unit')}
                      error={errors.hemoglobin}
                      type="number"
                      step="0.1"
                    />
                  </div>
                  
                  <div ref={whiteBloodCountRef}>
                    <CalculatorInput
                      label={t('calculators.cardiology.precise_dapt.white_blood_count_label')}
                      value={formData.whiteBloodCount}
                      onChange={(value) => setFormData({ ...formData, whiteBloodCount: value })}
                      placeholder="8.5"
                      unit={t('calculators.cardiology.precise_dapt.white_blood_count_unit')}
                      error={errors.whiteBloodCount}
                      type="number"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-end">
                <CalculatorButton
                  onClick={() => setCurrentStep(2)}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                >
                  {t('calculators.cardiology.precise_dapt.next_bleeding_history')}
                </CalculatorButton>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Bleeding History */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Droplets className="w-6 h-6 text-orange-600" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.precise_dapt.bleeding_history_section')}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.cardiology.precise_dapt.bleeding_history_description')}</p>
                
                <div className="mt-6" ref={previousBleedRef}>
                  <CalculatorCheckbox
                    label={t('calculators.cardiology.precise_dapt.previous_bleed')}
                    checked={formData.previousBleed}
                    onChange={(checked) => setFormData({ ...formData, previousBleed: checked })}
                    description={t('calculators.cardiology.precise_dapt.previous_bleed_desc')}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <CalculatorButton
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3"
                >
                  Back
                </CalculatorButton>
                
                <CalculatorButton
                  onClick={handleCalculate}
                  loading={isCalculating}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                >
                  {t('calculators.cardiology.precise_dapt.calculate_button')}
                </CalculatorButton>
              </div>
            </div>
          )}
        </CalculatorContainer>
      ) : (
        result && (
          <ResultsDisplay
            title={t('calculators.cardiology.precise_dapt.bleeding_risk_analysis')}
            value={t('calculators.cardiology.precise_dapt.score_points', { score: result.score.toString() })}
            category={result.bleedingRisk}
            interpretation={getInterpretation(result.bleedingRisk, result.riskPercentage)}
            riskLevel={result.bleedingRisk as 'low' | 'high'}
          >
            <div className="space-y-6">
              {/* Risk Assessment Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.precise_dapt.bleeding_risk')}</h4>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    result.bleedingRisk === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                    result.bleedingRisk === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                  }`}>
                    {t(`calculators.cardiology.precise_dapt.${result.bleedingRisk}_risk`)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {t('calculators.cardiology.precise_dapt.overall_bleeding_risk', { risk: result.riskPercentage.toString() })}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.precise_dapt.major_bleeding')}</h4>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {result.riskPercentage}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('calculators.cardiology.precise_dapt.annual_major_bleeding')}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.precise_dapt.safe_duration')}</h4>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400 mt-2">
                    {result.riskAnalysis.safeDuration}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('calculators.cardiology.precise_dapt.recommended_dapt_duration')}
                  </p>
                </div>
              </div>

              {/* Clinical Recommendation */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Brain className="w-6 h-6 text-blue-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.precise_dapt.clinical_recommendation')}</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {result.daptRecommendation}
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.durationGuidance}
                  </p>
                </div>
              </div>

              {/* Clinical Benefit Analysis */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.precise_dapt.clinical_benefit_analysis')}</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {result.riskAnalysis.clinicalBenefit}
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-green-200 dark:border-green-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.riskAnalysis.clinicalGuidance}
                  </p>
                </div>
              </div>

              {/* Contributing Risk Factors */}
              {result.riskFactors.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.precise_dapt.contributing_risk_factors')}</h4>
                  </div>
                  <ul className="space-y-2">
                    {result.riskFactors.map((factor, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Score Interpretation Guide */}
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-gray-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.precise_dapt.score_interpretation')}</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="font-semibold text-green-800 dark:text-green-200 mb-1">{t('calculators.cardiology.precise_dapt.score_low_range')}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">{t('calculators.cardiology.precise_dapt.score_low_description')}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold text-orange-800 dark:text-orange-200 mb-1">{t('calculators.cardiology.precise_dapt.score_intermediate_range')}</div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">{t('calculators.cardiology.precise_dapt.score_intermediate_description')}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold text-red-800 dark:text-red-200 mb-1">{t('calculators.cardiology.precise_dapt.score_high_range')}</div>
                    <div className="text-sm text-red-700 dark:text-red-300">{t('calculators.cardiology.precise_dapt.score_high_description')}</div>
                  </div>
                </div>
              </div>

              {/* Algorithm Validation Footer */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-red-800 dark:text-red-200">{t('calculators.cardiology.precise_dapt.enhanced_algorithm')}</h4>
                  </div>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  {t('calculators.cardiology.precise_dapt.algorithm_validation')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <CalculatorButton
                  onClick={handleReset}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {t('calculators.cardiology.precise_dapt.new_assessment')}
                </CalculatorButton>
                
                <CalculatorButton
                  onClick={() => setShowResult(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                >
                  {t('calculators.cardiology.precise_dapt.modify_inputs')}
                </CalculatorButton>
              </div>
            </div>
          </ResultsDisplay>
        )
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
        <span>{t('calculators.cardiology.precise_dapt.based_on_precise_dapt')}</span>
        <br />
        <span className="text-red-600 font-semibold">{t('calculators.cardiology.precise_dapt.bleeding_safety_validated')}</span>
      </div>
    </div>
  );
};

// Memoized component to prevent unnecessary re-renders
export const PRECISEDAPTCalculator = React.memo(PRECISEDAPTCalculatorComponent);