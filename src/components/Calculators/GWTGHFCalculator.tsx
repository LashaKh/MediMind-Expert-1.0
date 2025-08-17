import React, { useState, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Heart, Info, AlertTriangle, Calculator, Activity, TrendingUp, User, BarChart3, Target, Stethoscope, Award, Shield, Zap, AlertCircle, CheckCircle, FileText, Clock, ExternalLink, BookOpen, Edit } from 'lucide-react';
import { 
  CalculatorContainer, 
  CalculatorInput, 
  CalculatorSelect, 
  CalculatorCheckbox, 
  CalculatorButton, 
  ResultsDisplay 
} from '../ui/calculator-ui';

interface GWTGHFData {
  age: string;
  sbp: string;
  bun: string;
  sodium: string;
  race: 'black' | 'other' | '';
  copd: boolean;
  heartRate: string;
}

interface RiskResult {
  score: number;
  mortality: number;
  risk: 'Low' | 'Intermediate' | 'High' | 'Very High';
  interpretation: string;
  recommendations: string[];
  riskFactors: {
    age: number;
    sbp: number;
    bun: number;
    sodium: number;
    race: number;
    copd: number;
    heartRate: number;
  };
}

export const GWTGHFCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<GWTGHFData>({
    age: '',
    sbp: '',
    bun: '',
    sodium: '',
    race: '',
    copd: false,
    heartRate: '',
  });

  const [result, setResult] = useState<RiskResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [animateResults, setAnimateResults] = useState(false);
  const [hoveredFactor, setHoveredFactor] = useState<string | null>(null);

  // Refs for form fields to enable scrolling to errors
  const ageRef = useRef<HTMLDivElement>(null);
  const raceRef = useRef<HTMLDivElement>(null);
  const copdRef = useRef<HTMLDivElement>(null);
  const sbpRef = useRef<HTMLDivElement>(null);
  const heartRateRef = useRef<HTMLDivElement>(null);
  const bunRef = useRef<HTMLDivElement>(null);
  const sodiumRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the first error field
  const scrollToFirstError = (errorKeys: string[]) => {
    if (errorKeys.length === 0) return;

    const fieldRefMap: Record<string, React.RefObject<HTMLDivElement>> = {
      'age': ageRef,
      'race': raceRef, 
      'copd': copdRef,
      'sbp': sbpRef,
      'heartRate': heartRateRef,
      'bun': bunRef,
      'sodium': sodiumRef
    };

    // Map fields to their corresponding steps
    const fieldStepMap: Record<string, number> = {
      'age': 1,
      'race': 1,
      'copd': 1,
      'sbp': 2,
      'heartRate': 2,
      'bun': 3,
      'sodium': 3
    };

    // Find the first error field and determine its step
    let targetStep = 1;
    let targetRef: React.RefObject<HTMLDivElement> | null = null;

    for (const errorKey of errorKeys) {
      const ref = fieldRefMap[errorKey];
      const step = fieldStepMap[errorKey];
      if (ref?.current && step) {
        targetStep = step;
        targetRef = ref;
        break;
      }
    }

    // Navigate to the correct step first
    if (targetStep !== currentStep) {
      setCurrentStep(targetStep);
    }

    // Scroll to the field after a delay to ensure step transition completes
    setTimeout(() => {
      if (targetRef?.current) {
        // Smooth scroll to the field with some offset for better visibility
        targetRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Add a subtle shake animation to draw attention
        targetRef.current.classList.add('animate-shake');
        setTimeout(() => {
          targetRef.current?.classList.remove('animate-shake');
        }, 600);
      }
    }, targetStep !== currentStep ? 300 : 100); // Longer delay if step changed
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age)) {
      newErrors.age = t('calculators.cardiology.gwtgHf.validation.age_required');
    } else if (age < 18 || age > 120) {
      newErrors.age = t('calculators.cardiology.gwtgHf.validation.age_range');
    }

    const sbp = parseInt(formData.sbp);
    if (!formData.sbp || isNaN(sbp)) {
      newErrors.sbp = t('calculators.cardiology.gwtgHf.validation.sbp_required');
    } else if (sbp < 60 || sbp > 300) {
      newErrors.sbp = t('calculators.cardiology.gwtgHf.validation.sbp_range');
    }

    const bun = parseInt(formData.bun);
    if (!formData.bun || isNaN(bun)) {
      newErrors.bun = t('calculators.cardiology.gwtgHf.validation.bun_required');
    } else if (bun < 5 || bun > 200) {
      newErrors.bun = t('calculators.cardiology.gwtgHf.validation.bun_range');
    }

    const sodium = parseInt(formData.sodium);
    if (!formData.sodium || isNaN(sodium)) {
      newErrors.sodium = t('calculators.cardiology.gwtgHf.validation.sodium_required');
    } else if (sodium < 115 || sodium > 160) {
      newErrors.sodium = t('calculators.cardiology.gwtgHf.validation.sodium_range');
    }

    if (!formData.race) {
      newErrors.race = t('calculators.cardiology.gwtgHf.validation.race_required');
    }

    const heartRate = parseInt(formData.heartRate);
    if (!formData.heartRate || isNaN(heartRate)) {
      newErrors.heartRate = t('calculators.cardiology.gwtgHf.validation.heart_rate_required');
    } else if (heartRate < 30 || heartRate > 200) {
      newErrors.heartRate = t('calculators.cardiology.gwtgHf.validation.heart_rate_range');
    }

    setErrors(newErrors);
    const errorKeys = Object.keys(newErrors);
    
    // If there are errors, scroll to the first one
    if (errorKeys.length > 0) {
      // Small delay to ensure state updates are processed
      setTimeout(() => {
        scrollToFirstError(errorKeys);
      }, 100);
      return false;
    }
    
    return true;
  };

  const calculateGWTGHF = (): RiskResult => {
    const age = parseInt(formData.age);
    const sbp = parseInt(formData.sbp);
    const bun = parseInt(formData.bun);
    const sodium = parseInt(formData.sodium);
    const heartRate = parseInt(formData.heartRate);

    let score = 0;
    const riskFactors = {
      age: 0,
      sbp: 0,
      bun: 0,
      sodium: 0,
      race: 0,
      copd: 0,
      heartRate: 0,
    };

    // Age scoring - Based on official GWTG-HF Risk Score table
    if (age >= 110) {
      score += 28;
      riskFactors.age = 28;
    } else if (age >= 100) {
      score += 25;
      riskFactors.age = 25;
    } else if (age >= 90) {
      score += 22;
      riskFactors.age = 22;
    } else if (age >= 80) {
      score += 19;
      riskFactors.age = 19;
    } else if (age >= 70) {
      score += 17;
      riskFactors.age = 17;
    } else if (age >= 60) {
      score += 14;
      riskFactors.age = 14;
    } else if (age >= 50) {
      score += 11;
      riskFactors.age = 11;
    } else if (age >= 40) {
      score += 8;
      riskFactors.age = 8;
    } else if (age >= 30) {
      score += 6;
      riskFactors.age = 6;
    } else if (age >= 20) {
      score += 3;
      riskFactors.age = 3;
    } else {
      score += 0;
      riskFactors.age = 0;
    }

    // Systolic Blood Pressure - Based on official GWTG-HF table
    if (sbp >= 200) {
      score += 0;
      riskFactors.sbp = 0;
    } else if (sbp >= 190) {
      score += 2;
      riskFactors.sbp = 2;
    } else if (sbp >= 180) {
      score += 4;
      riskFactors.sbp = 4;
    } else if (sbp >= 170) {
      score += 6;
      riskFactors.sbp = 6;
    } else if (sbp >= 160) {
      score += 8;
      riskFactors.sbp = 8;
    } else if (sbp >= 150) {
      score += 9;
      riskFactors.sbp = 9;
    } else if (sbp >= 140) {
      score += 11;
      riskFactors.sbp = 11;
    } else if (sbp >= 130) {
      score += 13;
      riskFactors.sbp = 13;
    } else if (sbp >= 120) {
      score += 15;
      riskFactors.sbp = 15;
    } else if (sbp >= 110) {
      score += 17;
      riskFactors.sbp = 17;
    } else if (sbp >= 100) {
      score += 19;
      riskFactors.sbp = 19;
    } else if (sbp >= 90) {
      score += 21;
      riskFactors.sbp = 21;
    } else if (sbp >= 80) {
      score += 23;
      riskFactors.sbp = 23;
    } else if (sbp >= 70) {
      score += 24;
      riskFactors.sbp = 24;
    } else if (sbp >= 60) {
      score += 26;
      riskFactors.sbp = 26;
    } else {
      score += 28;
      riskFactors.sbp = 28;
    }

    // Blood Urea Nitrogen - Based on official GWTG-HF table
    if (bun >= 150) {
      score += 28;
      riskFactors.bun = 28;
    } else if (bun >= 140) {
      score += 27;
      riskFactors.bun = 27;
    } else if (bun >= 130) {
      score += 25;
      riskFactors.bun = 25;
    } else if (bun >= 120) {
      score += 23;
      riskFactors.bun = 23;
    } else if (bun >= 110) {
      score += 21;
      riskFactors.bun = 21;
    } else if (bun >= 100) {
      score += 19;
      riskFactors.bun = 19;
    } else if (bun >= 90) {
      score += 17;
      riskFactors.bun = 17;
    } else if (bun >= 80) {
      score += 15;
      riskFactors.bun = 15;
    } else if (bun >= 70) {
      score += 13;
      riskFactors.bun = 13;
    } else if (bun >= 60) {
      score += 11;
      riskFactors.bun = 11;
    } else if (bun >= 50) {
      score += 9;
      riskFactors.bun = 9;
    } else if (bun >= 40) {
      score += 8;
      riskFactors.bun = 8;
    } else if (bun >= 30) {
      score += 6;
      riskFactors.bun = 6;
    } else if (bun >= 20) {
      score += 4;
      riskFactors.bun = 4;
    } else if (bun >= 10) {
      score += 2;
      riskFactors.bun = 2;
    } else {
      score += 0;
      riskFactors.bun = 0;
    }

    // Sodium - Based on official GWTG-HF table
    if (sodium >= 139) {
      score += 0;
      riskFactors.sodium = 0;
    } else if (sodium >= 138) {
      score += 1;
      riskFactors.sodium = 1;
    } else if (sodium >= 137) {
      score += 1;
      riskFactors.sodium = 1;
    } else if (sodium >= 136) {
      score += 2;
      riskFactors.sodium = 2;
    } else if (sodium >= 135) {
      score += 2;
      riskFactors.sodium = 2;
    } else if (sodium >= 134) {
      score += 2;
      riskFactors.sodium = 2;
    } else if (sodium >= 133) {
      score += 3;
      riskFactors.sodium = 3;
    } else if (sodium >= 131) {
      score += 3;
      riskFactors.sodium = 3;
    } else {
      score += 4;
      riskFactors.sodium = 4;
    }

    // Race - Based on official GWTG-HF algorithm (Non-black = additional risk)
    if (formData.race === 'other') {
      score += 3;
      riskFactors.race = 3;
    } else if (formData.race === 'black') {
      score += 0;
      riskFactors.race = 0;
    }

    // COPD - Based on official GWTG-HF algorithm
    if (formData.copd) {
      score += 2;
      riskFactors.copd = 2;
    }

    // Heart Rate - Based on official GWTG-HF table
    if (heartRate >= 105) {
      score += 8;
      riskFactors.heartRate = 8;
    } else if (heartRate >= 100) {
      score += 6;
      riskFactors.heartRate = 6;
    } else if (heartRate >= 95) {
      score += 5;
      riskFactors.heartRate = 5;
    } else if (heartRate >= 90) {
      score += 4;
      riskFactors.heartRate = 4;
    } else if (heartRate >= 85) {
      score += 3;
      riskFactors.heartRate = 3;
    } else if (heartRate >= 80) {
      score += 1;
      riskFactors.heartRate = 1;
    } else {
      score += 0;
      riskFactors.heartRate = 0;
    }

    // Calculate mortality risk and risk stratification based on official GWTG-HF ranges
    let mortality: number;
    let risk: 'Low' | 'Intermediate' | 'High' | 'Very High';
    let interpretation: string;

    // Official GWTG-HF Risk Thresholds based on the reference table
    if (score <= 33) {
      mortality = 1.0;
      risk = 'Low';
      interpretation = 'Low risk for in-hospital mortality (<1%). Standard heart failure management appropriate.';
    } else if (score <= 50) {
      mortality = 2.5;
      risk = 'Intermediate';
      interpretation = 'Intermediate risk for in-hospital mortality (1-5%). Enhanced monitoring recommended.';
    } else if (score <= 57) {
      mortality = 7.5;
      risk = 'High';
      interpretation = 'High risk for in-hospital mortality (>5-10%). Intensive monitoring and early intervention needed.';
    } else if (score <= 61) {
      mortality = 12.5;
      risk = 'High';
      interpretation = 'High risk for in-hospital mortality (>10-15%). Intensive monitoring required.';
    } else if (score <= 65) {
      mortality = 17.5;
      risk = 'Very High';
      interpretation = 'Very high risk for in-hospital mortality (>15-20%). ICU-level care recommended.';
    } else if (score <= 70) {
      mortality = 25.0;
      risk = 'Very High';
      interpretation = 'Very high risk for in-hospital mortality (>20-30%). Critical care management required.';
    } else if (score <= 74) {
      mortality = 35.0;
      risk = 'Very High';
      interpretation = 'Very high risk for in-hospital mortality (>30-40%). Urgent intensive management.';
    } else if (score <= 78) {
      mortality = 45.0;
      risk = 'Very High';
      interpretation = 'Very high risk for in-hospital mortality (>40-50%). Critical condition requiring immediate intervention.';
    } else {
      mortality = 50.0;
      risk = 'Very High';
      interpretation = 'Extremely high risk for in-hospital mortality (>50%). Palliative care consultation recommended.';
    }

    const recommendations = getRecommendations(risk, score);

    return {
      score,
      mortality,
      risk,
      interpretation,
      recommendations,
      riskFactors,
    };
  };

  const getRecommendations = (risk: string, score: number): string[] => {
    const baseRecommendations = [
      t('calculators.cardiology.gwtgHf.recommendation_guideline_therapy'),
      t('calculators.cardiology.gwtgHf.recommendation_fluid_monitoring'),
      t('calculators.cardiology.gwtgHf.recommendation_vital_assessment'),
      t('calculators.cardiology.gwtgHf.recommendation_precipitating_factors'),
    ];

    if (risk === 'Low') {
      return [
        ...baseRecommendations,
        t('calculators.cardiology.gwtgHf.recommendation_standard_protocols'),
        t('calculators.cardiology.gwtgHf.recommendation_early_discharge'),
        t('calculators.cardiology.gwtgHf.recommendation_outpatient_followup'),
        t('calculators.cardiology.gwtgHf.recommendation_medication_reconciliation'),
      ];
    } else if (risk === 'Intermediate') {
      return [
        ...baseRecommendations,
        t('calculators.cardiology.gwtgHf.recommendation_enhanced_monitoring'),
        t('calculators.cardiology.gwtgHf.recommendation_telemetry_consideration'),
        t('calculators.cardiology.gwtgHf.recommendation_nurse_navigator'),
        t('calculators.cardiology.gwtgHf.recommendation_close_followup'),
        t('calculators.cardiology.gwtgHf.recommendation_biomarker_monitoring'),
      ];
    } else if (risk === 'High') {
      return [
        ...baseRecommendations,
        t('calculators.cardiology.gwtgHf.recommendation_intensive_monitoring'),
        t('calculators.cardiology.gwtgHf.recommendation_early_consultation'),
        t('calculators.cardiology.gwtgHf.recommendation_icu_consideration'),
        t('calculators.cardiology.gwtgHf.recommendation_palliative_consult'),
        t('calculators.cardiology.gwtgHf.recommendation_advance_directive'),
        t('calculators.cardiology.gwtgHf.recommendation_inotropic_support'),
      ];
    } else {
      return [
        ...baseRecommendations,
        t('calculators.cardiology.gwtgHf.recommendation_icu_level_care'),
        t('calculators.cardiology.gwtgHf.recommendation_immediate_hf_consult'),
        t('calculators.cardiology.gwtgHf.recommendation_mechanical_support'),
        t('calculators.cardiology.gwtgHf.recommendation_goals_of_care'),
        t('calculators.cardiology.gwtgHf.recommendation_family_meetings'),
        t('calculators.cardiology.gwtgHf.recommendation_hospice_consideration'),
        t('calculators.cardiology.gwtgHf.recommendation_multidisciplinary_team'),
      ];
    }
  };

  const handleCalculate = () => {
    if (!validateForm()) return;
    
    setIsCalculating(true);
    setAnimateResults(false);
    
    // Simulate advanced risk analysis with loading animation
    setTimeout(() => {
      const calculatedResult = calculateGWTGHF();
      setResult(calculatedResult);
      setShowResult(true);
      setIsCalculating(false);
      setTimeout(() => setAnimateResults(true), 100);
    }, 2000);
  };

  const handleReset = () => {
    setFormData({
      age: '',
      sbp: '',
      bun: '',
      sodium: '',
      race: '',
      copd: false,
      heartRate: '',
    });
    setResult(null);
    setErrors({});
    setShowResult(false);
    setCurrentStep(1);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 dark:text-green-400';
      case 'Intermediate': return 'text-yellow-600 dark:text-yellow-400';
      case 'High': return 'text-orange-600 dark:text-orange-400';
      case 'Very High': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'Intermediate': return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'High': return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case 'Very High': return <Shield className="w-6 h-6 text-red-500" />;
      default: return <Activity className="w-6 h-6 text-gray-500" />;
    }
  };

  const getInterpretation = (result: RiskResult) => {
    const interpretationKey = result.risk === 'Low' ? 'interpretation_low' :
                             result.risk === 'Intermediate' ? 'interpretation_intermediate' :
                             result.risk === 'High' ? 'interpretation_high' : 'interpretation_very_high';
    
    return t('calculators.cardiology.gwtgHf.interpretation_template', {
      score: result.score,
      interpretation: t(`calculators.cardiology.gwtgHf.${interpretationKey}`),
      mortality: result.mortality
    });
  };

  return (
    <CalculatorContainer
      title={t('calculators.cardiology.gwtgHf.title')}
      subtitle={t('calculators.cardiology.gwtgHf.subtitle')}
      icon={Heart}
      gradient="cardiology"
      className="max-w-5xl mx-auto relative overflow-hidden"
    >
      {/* Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full filter blur-3xl animate-liquidMorph" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl animate-liquidMorph animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="w-full h-full bg-gradient-radial from-transparent via-transparent to-white/5 dark:to-black/20 animate-neuronPulse" />
        </div>
      </div>
      <div className="space-y-8 relative z-10">
        {/* Premium GWTG-HF Risk Alert */}
        <div className="premium-glass rounded-3xl p-8 animate-premiumFadeIn shadow-premium premium-hover">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl blur-xl opacity-50 animate-heartbeatAdvanced" />
              <div className="relative p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <Heart className="w-8 h-8 text-white animate-heartbeatAdvanced" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent mb-3">
                {t('calculators.cardiology.gwtgHf.enhanced_alert_title')}
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {t('calculators.cardiology.gwtgHf.enhanced_alert_description')}
              </p>
              <div className="mt-4 inline-flex items-center space-x-3 premium-glass rounded-full px-5 py-2.5 transform hover:scale-105 transition-all duration-300">
                <Award className="w-5 h-5 text-red-600 dark:text-red-400 animate-pulse" />
                <span className="text-sm font-bold text-red-700 dark:text-red-300 uppercase tracking-wide">
                  {t('calculators.cardiology.gwtgHf.enhanced_alert_badge')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isCalculating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-premiumFadeIn">
            <div className="premium-glass rounded-3xl p-12 shadow-2xl transform scale-110">
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                    <Heart className="w-12 h-12 text-white animate-heartbeatAdvanced" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Analyzing Risk Factors
                  </h3>
                  <p className="text-gray-200">
                    Calculating GWTG-HF mortality risk score...
                  </p>
                </div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {!showResult ? (
          <>
            {/* Premium Progress Indicator */}
            <div className="relative mb-12 animate-premiumFadeIn animation-delay-200">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-blue-500/20 blur-2xl rounded-full" />
              <div className="relative flex items-center justify-center space-x-6 premium-glass rounded-full p-4">
                {/* Step 1 */}
                <div className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full blur-lg transition-all duration-500 ${
                      currentStep >= 1 ? 'bg-red-500 opacity-50' : 'opacity-0'
                    }`} />
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 transform group-hover:scale-110 ${
                      currentStep >= 1 
                        ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {currentStep > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
                    </div>
                  </div>
                  <span className={`text-sm font-semibold transition-all duration-300 ${
                    currentStep >= 1 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {t('calculators.cardiology.gwtgHf.progress_demographics')}
                  </span>
                </div>
                
                {/* Connector 1 */}
                <div className="relative w-20 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className={`absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-700 ${
                    currentStep >= 2 ? 'w-full' : 'w-0'
                  }`} />
                  {currentStep >= 2 && (
                    <div className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-dataFlow" />
                  )}
                </div>
                
                {/* Step 2 */}
                <div className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full blur-lg transition-all duration-500 ${
                      currentStep >= 2 ? 'bg-orange-500 opacity-50' : 'opacity-0'
                    }`} />
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 transform group-hover:scale-110 ${
                      currentStep >= 2 
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {currentStep > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
                    </div>
                  </div>
                  <span className={`text-sm font-semibold transition-all duration-300 ${
                    currentStep >= 2 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {t('calculators.cardiology.gwtgHf.progress_vital_signs')}
                  </span>
                </div>
                
                {/* Connector 2 */}
                <div className="relative w-20 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className={`absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-blue-500 transition-all duration-700 ${
                    currentStep >= 3 ? 'w-full' : 'w-0'
                  }`} />
                  {currentStep >= 3 && (
                    <div className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-dataFlow" />
                  )}
                </div>
                
                {/* Step 3 */}
                <div className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full blur-lg transition-all duration-500 ${
                      currentStep >= 3 ? 'bg-blue-500 opacity-50' : 'opacity-0'
                    }`} />
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 transform group-hover:scale-110 ${
                      currentStep >= 3 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      3
                    </div>
                  </div>
                  <span className={`text-sm font-semibold transition-all duration-300 ${
                    currentStep >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {t('calculators.cardiology.gwtgHf.progress_laboratory')}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 1: Demographics & Comorbidities */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-premiumFadeIn">
                <div className="text-center">
                  <div className="inline-flex items-center space-x-4 premium-glass rounded-full px-8 py-4 shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent">
                      {t('calculators.cardiology.gwtgHf.section_demographics')}
                    </h3>
                  </div>
                  <p className="text-base text-gray-600 dark:text-gray-400 mt-4 font-medium">
                    {t('calculators.cardiology.gwtgHf.section_demographics_description')}
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <div ref={ageRef} className="premium-glass rounded-2xl p-6 premium-hover group">
                    <CalculatorInput
                      label={t('calculators.cardiology.gwtgHf.field_age')}
                      value={formData.age}
                      onChange={(value: string) => setFormData({ ...formData, age: value })}
                      type="number"
                      placeholder={t('calculators.cardiology.gwtgHf.field_age_placeholder')}
                      min={18}
                      max={120}
                      error={errors.age}
                      icon={User}
                      className="premium-input focus-premium"
                    />
                    <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <Info className="w-3 h-3" />
                      <span>Valid range: 18-120 years</span>
                    </div>
                  </div>

                  <div ref={raceRef} className="premium-glass rounded-2xl p-6 premium-hover group relative z-10">
                    <CalculatorSelect
                      label={t('calculators.cardiology.gwtgHf.field_race')}
                      value={formData.race}
                      onChange={(value: string) => setFormData({ ...formData, race: value as 'black' | 'other' })}
                      options={[
                        { value: '', label: t('calculators.cardiology.gwtgHf.field_race_select') },
                        { value: 'black', label: t('calculators.cardiology.gwtgHf.field_race_black') },
                        { value: 'other', label: t('calculators.cardiology.gwtgHf.field_race_other') },
                      ]}
                      error={errors.race}
                      icon={User}
                      className="premium-input focus-premium"
                    />
                    <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <Info className="w-3 h-3" />
                      <span>Risk stratification varies by ethnicity</span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div ref={copdRef} className="premium-glass rounded-2xl p-6 premium-hover group">
                      <CalculatorCheckbox
                        label={t('calculators.cardiology.gwtgHf.field_copd')}
                        checked={formData.copd}
                        onChange={(checked: boolean) => setFormData({ ...formData, copd: checked })}
                        description={t('calculators.cardiology.gwtgHf.field_copd_description')}
                        icon={Activity}
                        className="transform scale-105"
                      />
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            <p className="font-semibold mb-1">Clinical Note:</p>
                            <p>COPD is an independent predictor of mortality in heart failure patients, contributing +2 points to the risk score.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 overflow-hidden btn-premium"
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      <span>{t('calculators.cardiology.gwtgHf.button_next_vital_signs')}</span>
                      <Activity className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Vital Signs */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-premiumFadeIn">
                <div className="text-center">
                  <div className="inline-flex items-center space-x-4 premium-glass rounded-full px-8 py-4 shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl shadow-lg animate-pulse">
                      <Activity className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 dark:from-orange-400 dark:to-yellow-400 bg-clip-text text-transparent">
                      {t('calculators.cardiology.gwtgHf.vital_signs_section')}
                    </h3>
                  </div>
                  <p className="text-base text-gray-600 dark:text-gray-400 mt-4 font-medium">
                    {t('calculators.cardiology.gwtgHf.vital_signs_description')}
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <div ref={sbpRef} className="premium-glass rounded-2xl p-6 premium-hover group">
                    <CalculatorInput
                      label={t('calculators.cardiology.gwtgHf.systolic_bp_label')}
                      value={formData.sbp}
                      onChange={(value: string) => setFormData({ ...formData, sbp: value })}
                      type="number"
                      placeholder={t('calculators.cardiology.gwtgHf.systolic_bp_placeholder')}
                      min={60}
                      max={300}
                      unit="mmHg"
                      error={errors.sbp}
                      icon={TrendingUp}
                      className="premium-input focus-premium"
                    />
                    <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Normal: 120-139</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">Lower = Higher Risk</span>
                      </div>
                    </div>
                  </div>

                  <div ref={heartRateRef} className="premium-glass rounded-2xl p-6 premium-hover group">
                    <CalculatorInput
                      label={t('calculators.cardiology.gwtgHf.heart_rate_label')}
                      value={formData.heartRate}
                      onChange={(value: string) => setFormData({ ...formData, heartRate: value })}
                      type="number"
                      placeholder={t('calculators.cardiology.gwtgHf.heart_rate_placeholder')}
                      min={30}
                      max={200}
                      unit="bpm"
                      error={errors.heartRate}
                      icon={Heart}
                      className="premium-input focus-premium"
                    />
                    <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Tachycardia increases mortality risk</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="group px-6 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <span className="flex items-center space-x-2">
                      <User className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      <span>{t('calculators.cardiology.gwtgHf.back_button')}</span>
                    </span>
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 overflow-hidden btn-premium"
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      <span>{t('calculators.cardiology.gwtgHf.next_laboratory')}</span>
                      <BarChart3 className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Laboratory Values */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-premiumFadeIn">
                <div className="text-center">
                  <div className="inline-flex items-center space-x-4 premium-glass rounded-full px-8 py-4 shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                      <BarChart3 className="w-7 h-7 text-white animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {t('calculators.cardiology.gwtgHf.laboratory_section')}
                    </h3>
                  </div>
                  <p className="text-base text-gray-600 dark:text-gray-400 mt-4 font-medium">
                    {t('calculators.cardiology.gwtgHf.laboratory_description')}
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <div ref={bunRef} className="premium-glass rounded-2xl p-6 premium-hover group">
                    <CalculatorInput
                      label={t('calculators.cardiology.gwtgHf.bun_label')}
                      value={formData.bun}
                      onChange={(value: string) => setFormData({ ...formData, bun: value })}
                      type="number"
                      placeholder={t('calculators.cardiology.gwtgHf.bun_placeholder')}
                      min={5}
                      max={200}
                      unit="mg/dL"
                      error={errors.bun}
                      icon={BarChart3}
                      className="premium-input focus-premium"
                    />
                    <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Normal: 7-20 mg/dL</span>
                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">Kidney function marker</span>
                      </div>
                    </div>
                  </div>

                  <div ref={sodiumRef} className="premium-glass rounded-2xl p-6 premium-hover group">
                    <CalculatorInput
                      label={t('calculators.cardiology.gwtgHf.sodium_label')}
                      value={formData.sodium}
                      onChange={(value: string) => setFormData({ ...formData, sodium: value })}
                      type="number"
                      placeholder={t('calculators.cardiology.gwtgHf.sodium_placeholder')}
                      min={115}
                      max={160}
                      unit="mEq/L"
                      error={errors.sodium}
                      icon={BarChart3}
                      className="premium-input focus-premium"
                    />
                    <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Normal: 136-145 mEq/L</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">Hyponatremia = Risk ↑</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="group px-6 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <span className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      <span>{t('calculators.cardiology.gwtgHf.back_button')}</span>
                    </span>
                  </button>
                  <button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="group relative px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden btn-premium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCalculating ? (
                      <span className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Analyzing Risk Factors...</span>
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center space-x-3">
                        <Calculator className="w-6 h-6" />
                        <span>{t('calculators.cardiology.gwtgHf.calculate_button')}</span>
                        <Zap className="w-5 h-5 animate-pulse" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Premium Results Display */
          result && (
            <div className="space-y-8">
              {/* Premium Results Header */}
              <div className={`premium-glass rounded-3xl p-8 shadow-premium transform transition-all duration-1000 ${
                animateResults ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl blur-xl opacity-50 animate-heartbeatAdvanced" />
                      <div className="relative p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg">
                        <Heart className="w-10 h-10 text-white animate-heartbeatAdvanced" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent">
                      {t('calculators.cardiology.gwtgHf.results_title')}
                    </h2>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {getInterpretation(result)}
                  </p>
                </div>
                {/* Premium Risk Overview Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {/* Risk Score Card */}
                  <div className={`premium-glass rounded-2xl p-6 transform transition-all duration-700 hover:scale-105 card-3d-hover ${
                    animateResults ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`} style={{ transitionDelay: '100ms' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getRiskIcon(result.risk)}
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">
                          {t('calculators.cardiology.gwtgHf.risk_score_label')}
                        </h4>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <div className={`text-5xl font-black ${getRiskColor(result.risk)} animate-numberTicker`}>
                          {result.score}
                        </div>
                        <div className="absolute -top-2 -right-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {t('calculators.cardiology.gwtgHf.gwtg_points')}
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 transition-all duration-1000"
                          style={{ width: `${Math.min((result.score / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mortality Risk Card */}
                  <div className={`premium-glass rounded-2xl p-6 transform transition-all duration-700 hover:scale-105 card-3d-hover ${
                    animateResults ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`} style={{ transitionDelay: '200ms' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <Target className="w-6 h-6 text-red-500 animate-pulse" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">
                          {t('calculators.cardiology.gwtgHf.mortality_risk_label')}
                        </h4>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
                        <div className="relative text-5xl font-black text-red-600 dark:text-red-400 animate-numberTicker">
                          {result.mortality}%
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {t('calculators.cardiology.gwtgHf.in_hospital_mortality')}
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                          {result.mortality > 10 ? 'HIGH RISK' : result.mortality > 5 ? 'MODERATE RISK' : 'LOW RISK'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Category Card */}
                  <div className={`premium-glass rounded-2xl p-6 transform transition-all duration-700 hover:scale-105 card-3d-hover ${
                    animateResults ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`} style={{ transitionDelay: '300ms' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          result.risk === 'Low' ? 'bg-green-100 dark:bg-green-900/30' :
                          result.risk === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          result.risk === 'High' ? 'bg-orange-100 dark:bg-orange-900/30' :
                          'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          <Shield className={`w-6 h-6 ${
                            result.risk === 'Low' ? 'text-green-500' :
                            result.risk === 'Intermediate' ? 'text-yellow-500' :
                            result.risk === 'High' ? 'text-orange-500' :
                            'text-red-500'
                          } animate-pulse`} />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">
                          {t('calculators.cardiology.gwtgHf.risk_category_label')}
                        </h4>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className={`text-3xl font-black ${getRiskColor(result.risk)} animate-numberTicker uppercase`}>
                        {result.risk}
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {t('calculators.cardiology.gwtgHf.risk_stratification')}
                      </div>
                      <div className={`h-12 rounded-lg flex items-center justify-center font-semibold text-sm ${
                        result.risk === 'Low' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                        result.risk === 'Intermediate' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                        result.risk === 'High' ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                        'bg-gradient-to-r from-red-400 to-red-500 text-white'
                      } shadow-lg transform hover:scale-105 transition-all duration-300`}>
                        {result.risk === 'Low' ? 'STANDARD CARE' :
                         result.risk === 'Intermediate' ? 'ENHANCED MONITORING' :
                         result.risk === 'High' ? 'INTENSIVE CARE' :
                         'CRITICAL INTERVENTION'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium Risk Factor Breakdown */}
                <div className={`premium-glass rounded-3xl p-8 transform transition-all duration-700 ${
                  animateResults ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`} style={{ transitionDelay: '400ms' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {t('calculators.cardiology.gwtgHf.risk_factor_contribution')}
                      </h4>
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total: {result.score} points
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { key: 'age', label: t('calculators.cardiology.gwtgHf.age_factor'), value: result.riskFactors.age, color: 'blue', icon: User },
                      { key: 'sbp', label: t('calculators.cardiology.gwtgHf.systolic_bp_factor'), value: result.riskFactors.sbp, color: 'red', icon: TrendingUp },
                      { key: 'bun', label: t('calculators.cardiology.gwtgHf.bun_factor'), value: result.riskFactors.bun, color: 'yellow', icon: BarChart3 },
                      { key: 'sodium', label: t('calculators.cardiology.gwtgHf.sodium_factor'), value: result.riskFactors.sodium, color: 'green', icon: Activity },
                      { key: 'race', label: t('calculators.cardiology.gwtgHf.race_factor'), value: result.riskFactors.race, color: 'purple', icon: User },
                      { key: 'copd', label: t('calculators.cardiology.gwtgHf.copd_factor'), value: result.riskFactors.copd, color: 'orange', icon: Activity },
                      { key: 'heartRate', label: t('calculators.cardiology.gwtgHf.heart_rate_factor'), value: result.riskFactors.heartRate, color: 'indigo', icon: Heart }
                    ].map((factor, index) => {
                      const Icon = factor.icon;
                      const maxValue = Math.max(...Object.values(result.riskFactors));
                      const percentage = maxValue > 0 ? (factor.value / maxValue) * 100 : 0;
                      
                      return (
                        <div
                          key={factor.key}
                          className={`relative premium-glass rounded-2xl p-5 transform transition-all duration-500 hover:scale-105 cursor-pointer ${
                            hoveredFactor === factor.key ? 'ring-2 ring-' + factor.color + '-500 shadow-lg' : ''
                          } ${
                            animateResults ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                          }`}
                          style={{ transitionDelay: `${500 + index * 50}ms` }}
                          onMouseEnter={() => setHoveredFactor(factor.key)}
                          onMouseLeave={() => setHoveredFactor(null)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Icon className={`w-5 h-5 text-${factor.color}-500`} />
                            <div className={`text-3xl font-black text-${factor.color}-600 dark:text-${factor.color}-400 animate-numberTicker`}>
                              {factor.value}
                            </div>
                          </div>
                          <div className={`text-xs font-medium text-${factor.color}-700 dark:text-${factor.color}-300 mb-2`}>
                            {factor.label}
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r from-${factor.color}-400 to-${factor.color}-600 transition-all duration-1000`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          {hoveredFactor === factor.key && (
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
                              {((factor.value / result.score) * 100).toFixed(1)}% of total risk
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Premium Clinical Recommendations */}
                <div className={`premium-glass rounded-3xl p-8 transform transition-all duration-700 ${
                  animateResults ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`} style={{ transitionDelay: '800ms' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl shadow-lg ${
                        result.risk === 'Low' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                        result.risk === 'Intermediate' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                        result.risk === 'High' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                        'bg-gradient-to-br from-red-500 to-red-600'
                      }`}>
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {t('calculators.cardiology.gwtgHf.clinical_management')}
                      </h4>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-bold text-white ${
                      result.risk === 'Low' ? 'bg-green-500' :
                      result.risk === 'Intermediate' ? 'bg-yellow-500' :
                      result.risk === 'High' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}>
                      {result.risk} Risk Protocol
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {result.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md transform hover:scale-[1.02] ${
                          index % 2 === 0 
                            ? 'bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50' 
                            : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-900/50 dark:to-gray-800/50'
                        } ${
                          animateResults ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                        }`}
                        style={{ transitionDelay: `${900 + index * 100}ms` }}
                      >
                        <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0 ${
                          result.risk === 'Low' ? 'bg-gradient-to-br from-green-400 to-green-500' :
                          result.risk === 'Intermediate' ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                          result.risk === 'High' ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                          'bg-gradient-to-br from-red-400 to-red-500'
                        }`}>
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
                          {rec}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Premium Risk Score Reference */}
                <div className={`grid grid-cols-1 xl:grid-cols-2 gap-6 ${
                  animateResults ? 'opacity-100' : 'opacity-0'
                }`} style={{ transitionDelay: '1200ms' }}>
                  <div className="premium-glass rounded-3xl p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                        <Info className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {t('calculators.cardiology.gwtgHf.risk_reference_title')}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {[
                        { range: '0-33', mortality: '<1%', risk: 'Low', color: 'green' },
                        { range: '34-50', mortality: '1-5%', risk: 'Intermediate', color: 'yellow' },
                        { range: '51-57', mortality: '5-10%', risk: 'High', color: 'orange' },
                        { range: '≥58', mortality: '>10%', risk: 'Very High', color: 'red' }
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:shadow-md transform hover:scale-[1.02] ${
                            result.score >= parseInt(item.range) || item.range.startsWith('≥') 
                              ? `bg-${item.color}-100 dark:bg-${item.color}-900/30 ring-2 ring-${item.color}-500` 
                              : 'bg-gray-50 dark:bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-br from-${item.color}-400 to-${item.color}-600`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className={`font-bold text-${item.color}-800 dark:text-${item.color}-200`}>
                                {item.range} points
                              </div>
                              <div className={`text-sm text-${item.color}-700 dark:text-${item.color}-300`}>
                                {item.mortality} mortality
                              </div>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full bg-${item.color}-500 text-white text-xs font-bold`}>
                            {item.risk}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Premium Creator Insights */}
                  <div className="premium-glass rounded-3xl p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {t('calculators.cardiology.gwtgHf.from_creator_title')}
                      </h4>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg transform rotate-3">
                          GF
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                            {t('calculators.cardiology.gwtgHf.creator_name')}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('calculators.cardiology.gwtgHf.creator_title_role')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                          <h6 className="font-bold text-indigo-800 dark:text-indigo-200 mb-2 flex items-center space-x-2">
                            <Zap className="w-5 h-5" />
                            <span>{t('calculators.cardiology.gwtgHf.why_developed')}</span>
                          </h6>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {t('calculators.cardiology.gwtgHf.why_developed_text')}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl">
                          <h6 className="font-bold text-purple-800 dark:text-purple-200 mb-2 flex items-center space-x-2">
                            <Target className="w-5 h-5" />
                            <span>{t('calculators.cardiology.gwtgHf.clinical_application')}</span>
                          </h6>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {t('calculators.cardiology.gwtgHf.clinical_application_text')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <a 
                          href="https://pubmed.ncbi.nlm.nih.gov/?term=Fonarow+GC%5BAuthor%5D" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          <BookOpen className="w-5 h-5" />
                          <span>{t('calculators.cardiology.gwtgHf.view_publications')}</span>
                          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium Evidence & Validation */}
                <div className={`premium-glass rounded-3xl p-8 transform transition-all duration-700 ${
                  animateResults ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`} style={{ transitionDelay: '1400ms' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {t('calculators.cardiology.gwtgHf.evidence_title')}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">VALIDATED</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                        <h6 className="font-bold text-emerald-800 dark:text-emerald-200 mb-3 flex items-center space-x-2">
                          <Calculator className="w-5 h-5" />
                          <span>{t('calculators.cardiology.gwtgHf.formula_title')}</span>
                        </h6>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t('calculators.cardiology.gwtgHf.formula_description')}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <h6 className="font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                          <Target className="w-5 h-5 text-emerald-500" />
                          <span>Key Validation Points</span>
                        </h6>
                        {[
                          t('calculators.cardiology.gwtgHf.validation_cohort'),
                          t('calculators.cardiology.gwtgHf.key_predictors'),
                          t('calculators.cardiology.gwtgHf.ehealthrecords_validation')
                        ].map((point, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl">
                        <h6 className="font-bold text-teal-800 dark:text-teal-200 mb-3">
                          {t('calculators.cardiology.gwtgHf.score_interpretation_title')}
                        </h6>
                        <div className="space-y-2">
                          {[
                            { score: '0-33', mortality: '<1%', bar: 10 },
                            { score: '34-50', mortality: '1-5%', bar: 25 },
                            { score: '51-57', mortality: '5-10%', bar: 40 },
                            { score: '58-61', mortality: '10-15%', bar: 55 },
                            { score: '62-65', mortality: '15-20%', bar: 65 },
                            { score: '66-70', mortality: '20-30%', bar: 75 },
                            { score: '71-74', mortality: '30-40%', bar: 85 },
                            { score: '75-78', mortality: '40-50%', bar: 92 },
                            { score: '≥79', mortality: '>50%', bar: 100 }
                          ].map((item, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{item.score}</span>
                                <span className="font-bold text-emerald-700 dark:text-emerald-300">{item.mortality}</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000"
                                  style={{ width: `${item.bar}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl">
                        <h6 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center space-x-2">
                          <FileText className="w-5 h-5" />
                          <span>References</span>
                        </h6>
                        <div className="space-y-2 text-xs">
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">{t('calculators.cardiology.gwtgHf.original_reference')}:</span>
                            <br />Peterson PN, et al. Circ Cardiovasc Qual Outcomes. 2010;3(1):25-32.
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">{t('calculators.cardiology.gwtgHf.validation_reference')}:</span>
                            <br />Lagu T, et al. Circ Heart Fail. 2016;9(8).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 italic text-center">
                      {t('calculators.cardiology.gwtgHf.funding_note')}
                    </p>
                  </div>
                </div>

                {/* Premium Algorithm Validation Status */}
                <div className={`premium-glass rounded-3xl p-6 transform transition-all duration-700 hover:scale-[1.02] ${
                  animateResults ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`} style={{ transitionDelay: '1600ms' }}>
                  <div className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full filter blur-3xl opacity-20 animate-pulse" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg animate-pulse">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                            {t('calculators.cardiology.gwtgHf.algorithm_title')}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('calculators.cardiology.gwtgHf.algorithm_description')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-gray-800">
                            ✓
                          </div>
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-gray-800">
                            ✓
                          </div>
                          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-gray-800">
                            ✓
                          </div>
                        </div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">100% Validated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Action Buttons */}
              <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 ${
                animateResults ? 'opacity-100' : 'opacity-0'
              }`} style={{ transitionDelay: '1800ms' }}>
                <button
                  onClick={handleReset}
                  className="group relative px-8 py-4 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-2xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-lg transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <Calculator className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    <span>{t('calculators.cardiology.gwtgHf.new_assessment')}</span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    setShowResult(false);
                    setAnimateResults(false);
                  }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden btn-premium"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <Edit className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    <span>{t('calculators.cardiology.gwtgHf.modify_inputs')}</span>
                  </span>
                </button>
              </div>
            </div>
          )
        )}

        {/* Footer Information */}
        <div className="text-center pt-8 border-t border-white/20 dark:border-gray-800/20">
          <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
            <Info className="w-4 h-4" />
            <span>{t('calculators.cardiology.gwtgHf.footer_based_on')}</span>
            <div className="flex items-center space-x-1">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-semibold">{t('calculators.cardiology.gwtgHf.footer_guidelines_validated')}</span>
            </div>
          </div>
        </div>
      </div>
    </CalculatorContainer>
  );
}; 