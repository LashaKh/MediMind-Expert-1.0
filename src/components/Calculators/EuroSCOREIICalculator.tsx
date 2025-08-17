import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Info, Heart, AlertTriangle, Globe, TrendingUp, Star, Brain, User, Activity, BarChart3, Stethoscope, Award, Shield, Zap, AlertCircle, CheckCircle, FileText, Clock, Target, ExternalLink, ArrowRight, ArrowLeft, Sparkles, Gauge, TrendingDown, Eye, Layers, Lightbulb, BookOpen, Users, ChevronRight, ChevronDown, Maximize2, Minimize2, Share2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  CalculatorContainer, 
  CalculatorInput, 
  CalculatorSelect, 
  CalculatorCheckbox, 
  CalculatorButton, 
  ResultsDisplay 
} from '../ui/calculator-ui';

interface EuroSCOREFormData {
  // Patient-related factors
  age: string;
  gender: 'male' | 'female' | '';
  
  // Renal function - Creatinine clearance (Cockcroft-Gault)
  creatinineClearance: '>85' | '51-85' | '≤50' | 'dialysis' | '';
  
  // LV function
  lvFunction: 'good' | 'moderate' | 'poor' | 'very_poor' | '';
  
  // Cardiac-related factors
  recentMI: boolean; // MI within 90 days
  pulmonaryArteryPressure: '<31' | '31-54' | '≥55' | '';
  extracardiacArteriopathy: boolean;
  neurologicalDysfunction: boolean;
  previousCardiacSurgery: boolean;
  activeEndocarditis: boolean;
  nyhaClass: '1' | '2' | '3' | '4' | '';
  ccsClass4: boolean; // CCS class 4 angina
  
  // Patient comorbidities
  diabetesOnInsulin: boolean;
  chronicPulmonaryDisease: boolean;
  poorMobility: boolean;
  criticalPreoperativeState: boolean;
  
  // Operative factors
  urgency: 'elective' | 'urgent' | 'emergency' | 'salvage' | '';
  weightOfProcedure: 'isolated_cabg' | 'isolated_non_cabg' | 'two_major' | 'three_plus_major' | '';
  thoracicAortaSurgery: boolean;
}

interface EuroSCOREResult {
  predictedMortality: number;
  riskCategory: 'low' | 'intermediate' | 'high' | 'very_high';
  interpretation: string;
  recommendations: string[];
  comparisonToSTS: string;
}

export const EuroSCOREIICalculator: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('calculator');
  const [formData, setFormData] = useState<EuroSCOREFormData>({
    age: '',
    gender: '',
    creatinineClearance: '',
    lvFunction: '',
    recentMI: false,
    pulmonaryArteryPressure: '',
    extracardiacArteriopathy: false,
    neurologicalDysfunction: false,
    previousCardiacSurgery: false,
    activeEndocarditis: false,
    nyhaClass: '',
    ccsClass4: false,
    diabetesOnInsulin: false,
    chronicPulmonaryDisease: false,
    poorMobility: false,
    criticalPreoperativeState: false,
    urgency: '',
    weightOfProcedure: '',
    thoracicAortaSurgery: false
  });

  const [result, setResult] = useState<EuroSCOREResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [realTimeRisk, setRealTimeRisk] = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Real-time risk calculation for preview
  useEffect(() => {
    const calculateRealTimeRisk = () => {
      if (!formData.age || !formData.gender) return 0;
      
      try {
        // Simplified real-time calculation for preview
        const age = parseInt(formData.age);
        let baseRisk = Math.max(0, (age - 60) * 0.5); // Age contribution
        
        if (formData.gender === 'female') baseRisk += 1;
        if (formData.diabetesOnInsulin) baseRisk += 2;
        if (formData.chronicPulmonaryDisease) baseRisk += 1.5;
        if (formData.poorMobility) baseRisk += 2;
        if (formData.criticalPreoperativeState) baseRisk += 5;
        if (formData.previousCardiacSurgery) baseRisk += 3;
        if (formData.activeEndocarditis) baseRisk += 2.5;
        if (formData.recentMI) baseRisk += 1;
        if (formData.ccsClass4) baseRisk += 1.5;
        if (formData.extracardiacArteriopathy) baseRisk += 2;
        if (formData.neurologicalDysfunction) baseRisk += 1.5;
        if (formData.thoracicAortaSurgery) baseRisk += 2.5;
        
        // Adjust for categorical values
        if (formData.creatinineClearance === '51-85') baseRisk += 1;
        if (formData.creatinineClearance === '≤50') baseRisk += 3;
        if (formData.creatinineClearance === 'dialysis') baseRisk += 2.5;
        
        if (formData.lvFunction === 'moderate') baseRisk += 1.5;
        if (formData.lvFunction === 'poor') baseRisk += 3;
        if (formData.lvFunction === 'very_poor') baseRisk += 4;
        
        if (formData.nyhaClass === '2') baseRisk += 0.5;
        if (formData.nyhaClass === '3') baseRisk += 1.5;
        if (formData.nyhaClass === '4') baseRisk += 2.5;
        
        if (formData.pulmonaryArteryPressure === '31-54') baseRisk += 1;
        if (formData.pulmonaryArteryPressure === '≥55') baseRisk += 2;
        
        if (formData.urgency === 'urgent') baseRisk += 1.5;
        if (formData.urgency === 'emergency') baseRisk += 3;
        if (formData.urgency === 'salvage') baseRisk += 5;
        
        if (formData.weightOfProcedure === 'isolated_non_cabg') baseRisk += 0.5;
        if (formData.weightOfProcedure === 'two_major') baseRisk += 2;
        if (formData.weightOfProcedure === 'three_plus_major') baseRisk += 3.5;
        
        return Math.min(Math.max(baseRisk, 0), 100);
      } catch {
        return 0;
      }
    };
    
    const risk = calculateRealTimeRisk();
    setRealTimeRisk(risk);
  }, [formData]);
  
  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Step completion tracking
  useEffect(() => {
    const newCompletedSteps = [];
    
    // Step 1 completion check
    if (formData.age && formData.gender && formData.creatinineClearance && formData.lvFunction) {
      newCompletedSteps.push(1);
    }
    
    // Step 2 completion check
    if (formData.nyhaClass && formData.pulmonaryArteryPressure) {
      newCompletedSteps.push(2);
    }
    
    // Step 3 completion check
    if (formData.urgency && formData.weightOfProcedure) {
      newCompletedSteps.push(3);
    }
    
    setCompletedSteps(newCompletedSteps);
  }, [formData]);
  
  // Animation phases for calculation
  useEffect(() => {
    if (isCalculating) {
      const phases = [
        { phase: 1, duration: 800, message: 'Analyzing patient risk factors...' },
        { phase: 2, duration: 600, message: 'Calculating cardiac risk indices...' },
        { phase: 3, duration: 400, message: 'Applying EuroSCORE II algorithm...' },
        { phase: 4, duration: 400, message: 'Generating clinical recommendations...' }
      ];
      
      let currentPhaseIndex = 0;
      
      const nextPhase = () => {
        if (currentPhaseIndex < phases.length) {
          setAnimationPhase(phases[currentPhaseIndex].phase);
          setTimeout(() => {
            currentPhaseIndex++;
            nextPhase();
          }, phases[currentPhaseIndex].duration);
        }
      };
      
      nextPhase();
    }
  }, [isCalculating]);

  const getRiskColor = (risk: number) => {
    if (risk < 2) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', accent: 'from-emerald-400 to-emerald-600' };
    if (risk < 5) return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', accent: 'from-yellow-400 to-yellow-600' };
    if (risk < 10) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', accent: 'from-orange-400 to-orange-600' };
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', accent: 'from-red-400 to-red-600' };
  };

  const getRiskLevel = (risk: number) => {
    if (risk < 2) return { level: t('calculators.eurscoreII.risk_low'), description: t('calculators.eurscoreII.excellent_surgical_candidate') };
    if (risk < 5) return { level: t('calculators.eurscoreII.risk_intermediate'), description: t('calculators.eurscoreII.good_surgical_candidate') };
    if (risk < 10) return { level: t('calculators.eurscoreII.risk_high'), description: t('calculators.eurscoreII.requires_careful_evaluation') };
    return { level: t('calculators.eurscoreII.risk_very_high'), description: t('calculators.eurscoreII.extensive_risk_benefit_analysis') };
  };

  const getStepProgress = () => {
    const totalSteps = 3;
    const completed = completedSteps.length;
    return (completed / totalSteps) * 100;
  };

  // Step-specific validation functions
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.age) {
      newErrors.age = t('calculators.eurscoreII.validation.age_required');
    } else if (parseInt(formData.age) < 18 || parseInt(formData.age) > 120) {
      newErrors.age = t('calculators.eurscoreII.validation.age_range');
    }

    if (!formData.gender) {
      newErrors.gender = t('calculators.eurscoreII.validation.gender_required');
    }

    if (!formData.creatinineClearance) {
      newErrors.creatinineClearance = t('calculators.eurscoreII.validation.creatinine_required');
    }

    if (!formData.lvFunction) {
      newErrors.lvFunction = t('calculators.eurscoreII.validation.lv_function_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nyhaClass) {
      newErrors.nyhaClass = t('calculators.eurscoreII.validation.nyha_required');
    }

    if (!formData.pulmonaryArteryPressure) {
      newErrors.pulmonaryArteryPressure = t('calculators.eurscoreII.validation.pa_pressure_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.urgency) {
      newErrors.urgency = t('calculators.eurscoreII.validation.urgency_required');
    }

    if (!formData.weightOfProcedure) {
      newErrors.weightOfProcedure = t('calculators.eurscoreII.validation.procedure_weight_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    return validateStep1() && validateStep2() && validateStep3();
  };

  // Step navigation with validation
  const goToStep = (targetStep: number) => {
    if (targetStep === 2) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (targetStep === 3) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    } else {
      setCurrentStep(targetStep);
    }
  };

  const calculateEuroSCORE = (): EuroSCOREResult => {
    // EuroSCORE II Formula: Predicted mortality = e^y / (1 + e^y)
    // Where y = -5.324537 + Σ βixi
    
    const age = parseInt(formData.age);
    let y = -5.324537; // Base constant

    // Patient factors
    // Age: xi = 1 if age ≤60; xi increases by one point per year thereafter
    const ageCoeff = age <= 60 ? 1 : (age - 59);
    y += 0.0285181 * ageCoeff;

    // Gender: Female
    if (formData.gender === 'female') {
      y += 0.2196434;
    }

    // Insulin-dependent diabetes mellitus
    if (formData.diabetesOnInsulin) {
      y += 0.3542749;
    }

    // Chronic pulmonary dysfunction
    if (formData.chronicPulmonaryDisease) {
      y += 0.1886564;
    }

    // Neurological or musculoskeletal dysfunction severely affecting mobility
    if (formData.poorMobility) {
      y += 0.2407181;
    }

    // Renal dysfunction (creatinine clearance)
    switch (formData.creatinineClearance) {
      case '51-85':
        y += 0.303553;
        break;
      case '≤50':
        y += 0.8592256;
        break;
      case 'dialysis':
        y += 0.6421508;
        break;
      // >85 mL/min = 0 (reference)
    }

    // Critical preop state
    if (formData.criticalPreoperativeState) {
      y += 1.086517;
    }

    // Cardiac-specific factors
    // NYHA class
    switch (formData.nyhaClass) {
      case '2':
        y += 0.1070545;
        break;
      case '3':
        y += 0.2958358;
        break;
      case '4':
        y += 0.5597929;
        break;
      // Class 1 = 0 (reference)
    }

    // CCS class 4
    if (formData.ccsClass4) {
      y += 0.2226147;
    }

    // Extracardiac arteriopathy
    if (formData.extracardiacArteriopathy) {
      y += 0.5360268;
    }

    // Previous cardiac surgery
    if (formData.previousCardiacSurgery) {
      y += 1.118599;
    }

    // Active endocarditis
    if (formData.activeEndocarditis) {
      y += 0.6194522;
    }

    // LV function or LVEF
    switch (formData.lvFunction) {
      case 'moderate':
        y += 0.3150652;
        break;
      case 'poor':
        y += 0.8084096;
        break;
      case 'very_poor':
        y += 0.9346919;
        break;
      // Good (≥51%) = 0 (reference)
    }

    // Recent MI
    if (formData.recentMI) {
      y += 0.1528943;
    }

    // Pulmonary artery systolic pressure
    switch (formData.pulmonaryArteryPressure) {
      case '31-54':
        y += 0.1788899;
        break;
      case '≥55':
        y += 0.3491475;
        break;
      // <31 = 0 (reference)
    }

    // Procedural factors
    // Urgency
    switch (formData.urgency) {
      case 'urgent':
        y += 0.3174673;
        break;
      case 'emergency':
        y += 0.7039121;
        break;
      case 'salvage':
        y += 1.362947;
        break;
      // Elective = 0 (reference)
    }

    // Weight of procedure
    switch (formData.weightOfProcedure) {
      case 'isolated_non_cabg':
        y += 0.0062118;
        break;
      case 'two_major':
        y += 0.5521478;
        break;
      case 'three_plus_major':
        y += 0.9724533;
        break;
      // Isolated CABG = 0 (reference)
    }

    // Thoracic aorta surgery
    if (formData.thoracicAortaSurgery) {
      y += 0.6527205;
    }

    // Calculate predicted mortality using logistic regression formula
    const predictedMortality = (Math.exp(y) / (1 + Math.exp(y))) * 100;

    // Risk categorization
    let riskCategory: 'low' | 'intermediate' | 'high' | 'very_high';
    let interpretation: string;

    if (predictedMortality < 2) {
      riskCategory = 'low';
      interpretation = t('calculators.eurscoreII.interpretation_low');
    } else if (predictedMortality < 5) {
      riskCategory = 'intermediate';
      interpretation = t('calculators.eurscoreII.interpretation_intermediate');
    } else if (predictedMortality < 10) {
      riskCategory = 'high';
      interpretation = t('calculators.eurscoreII.interpretation_high');
    } else {
      riskCategory = 'very_high';
      interpretation = t('calculators.eurscoreII.interpretation_very_high');
    }

    const recommendations = getRecommendations(riskCategory, predictedMortality, formData);
    const comparisonToSTS = getSTSComparison(riskCategory);

    return {
      predictedMortality: Math.round(predictedMortality * 10) / 10,
      riskCategory,
      interpretation,
      recommendations,
      comparisonToSTS
    };
  };

  const getRecommendations = (
    riskCategory: string, 
    mortality: number, 
    data: EuroSCOREFormData
  ): string[] => {
    const recommendations: string[] = [];

    // Base recommendations for all patients
    recommendations.push(t('calculators.eurscoreII.recommendation_team_evaluation'));
    recommendations.push(t('calculators.eurscoreII.recommendation_preop_optimization'));
    recommendations.push(t('calculators.eurscoreII.recommendation_counseling'));

    switch (riskCategory) {
      case 'low':
        recommendations.push(t('calculators.eurscoreII.recommendation_standard_approach'));
        recommendations.push(t('calculators.eurscoreII.recommendation_fast_track'));
        recommendations.push(t('calculators.eurscoreII.recommendation_routine_care'));
        break;
      case 'intermediate':
        recommendations.push(t('calculators.eurscoreII.recommendation_enhanced_assessment'));
        recommendations.push(t('calculators.eurscoreII.recommendation_additional_imaging'));
        recommendations.push(t('calculators.eurscoreII.recommendation_standard_icu'));
        recommendations.push(t('calculators.eurscoreII.recommendation_risk_modification'));
        break;
      case 'high':
        recommendations.push(t('calculators.eurscoreII.recommendation_alternative_approaches'));
        recommendations.push(t('calculators.eurscoreII.recommendation_extensive_optimization'));
        recommendations.push(t('calculators.eurscoreII.recommendation_extended_icu'));
        recommendations.push(t('calculators.eurscoreII.recommendation_informed_consent'));
        recommendations.push(t('calculators.eurscoreII.recommendation_less_invasive'));
        break;
      case 'very_high':
        recommendations.push(t('calculators.eurscoreII.recommendation_non_surgical'));
        recommendations.push(t('calculators.eurscoreII.recommendation_palliative_care'));
        recommendations.push(t('calculators.eurscoreII.recommendation_goals_care'));
        recommendations.push(t('calculators.eurscoreII.recommendation_high_risk_protocols'));
        recommendations.push(t('calculators.eurscoreII.recommendation_transcatheter'));
        recommendations.push(t('calculators.eurscoreII.recommendation_family_meeting'));
        break;
    }

    return recommendations;
  };

  const getSTSComparison = (riskCategory: string): string => {
    switch (riskCategory) {
      case 'low':
        return t('calculators.eurscoreII.sts_comparison_low');
      case 'intermediate':
        return t('calculators.eurscoreII.sts_comparison_intermediate');
      case 'high':
        return t('calculators.eurscoreII.sts_comparison_high');
      case 'very_high':
        return t('calculators.eurscoreII.sts_comparison_very_high');
      default:
        return t('calculators.eurscoreII.sts_comparison_default');
    }
  };

  const handleCalculate = () => {
    if (!validateForm()) return;
    
    setIsCalculating(true);
    setErrors({});
    
    // Enhanced calculation with realistic timing and animations
    setTimeout(() => {
      const calculatedResult = calculateEuroSCORE();
      setResult(calculatedResult);
      setIsCalculating(false);
      setShowInsights(true);
      
      // Scroll to results with smooth animation
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }, 2200);
  };

  const handleReset = () => {
    setFormData({
      age: '',
      gender: '',
      creatinineClearance: '',
      lvFunction: '',
      recentMI: false,
      pulmonaryArteryPressure: '',
      extracardiacArteriopathy: false,
      neurologicalDysfunction: false,
      previousCardiacSurgery: false,
      activeEndocarditis: false,
      nyhaClass: '',
      ccsClass4: false,
      diabetesOnInsulin: false,
      chronicPulmonaryDisease: false,
      poorMobility: false,
      criticalPreoperativeState: false,
      urgency: '',
      weightOfProcedure: '',
      thoracicAortaSurgery: false
    });
    setResult(null);
    setErrors({});
    setIsCalculating(false);
    setCurrentStep(1);
  };

  const getRiskColorLegacy = (category: string) => {
    switch (category) {
      case 'low': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'very_high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBgColor = (category: string) => {
    switch (category) {
      case 'low': return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'intermediate': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'high': return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'very_high': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default: return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
          rgba(59, 130, 246, 0.1) 0%, 
          rgba(147, 51, 234, 0.05) 35%, 
          rgba(236, 72, 153, 0.03) 70%, 
          transparent 100%)`
      }}
    >
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-16 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-indigo-400/20 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-16 left-32 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <CalculatorContainer
          title={t('calculators.eurscoreII.title')}
          subtitle={t('calculators.eurscoreII.subtitle')}
          icon={Globe}
          gradient="cardiology"
          className="max-w-6xl mx-auto"
        >
          {/* Real-time Risk Preview */}
          {realTimeRisk > 0 && !result && (
            <div className={`mb-8 p-6 rounded-3xl border-2 backdrop-blur-xl transition-all duration-500 ${
              getRiskColor(realTimeRisk).bg
            } ${getRiskColor(realTimeRisk).border}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${getRiskColor(realTimeRisk).accent}`}>
                    <Gauge className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('calculators.eurscoreII.live_risk_preview')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('calculators.eurscoreII.updates_as_complete')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getRiskColor(realTimeRisk).text}`}>
                    {realTimeRisk.toFixed(1)}%
                  </div>
                  <div className={`text-sm font-medium ${getRiskColor(realTimeRisk).text}`}>
                    {getRiskLevel(realTimeRisk).level}
                  </div>
                </div>
              </div>
              
              {/* Animated Progress Bar */}
              <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getRiskColor(realTimeRisk).accent} transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min(realTimeRisk * 2, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Step Progress */}
          <div className="mb-8 p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('calculators.eurscoreII.completion_progress')}</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {completedSteps.length}/3 {t('calculators.eurscoreII.sections_completed')}
              </div>
            </div>
            
            <div className="relative">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transition-all duration-1000 ease-out"
                  style={{ width: `${getStepProgress()}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                {[1, 2, 3].map((step, index) => (
                  <div key={step} className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      completedSteps.includes(step) 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                        : currentStep === step
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {completedSteps.includes(step) ? <CheckCircle className="w-4 h-4" /> : step}
                    </div>
                    <span className={`text-sm font-medium ${
                      completedSteps.includes(step) ? 'text-purple-600' : 'text-gray-600'
                    }`}>
                      {step === 1 ? t('calculators.eurscoreII.patient_section') : step === 2 ? t('calculators.eurscoreII.cardiac_section') : t('calculators.eurscoreII.operative_section')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
        {/* EuroSCORE II Alert */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">{t('calculators.eurscoreII.alert_title')}</h4>
              <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                {t('calculators.eurscoreII.alert_description')}
              </p>
              <div className="mt-3 inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg px-3 py-1">
                <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{t('calculators.eurscoreII.alert_validation')}</span>
              </div>
            </div>
          </div>
        </div>

        {!result ? (
          <>
            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('calculators.eurscoreII.patient_factors')}</span>
              </div>
              <div className={`w-16 h-1 rounded-full transition-all duration-300 ${
                currentStep >= 2 ? 'bg-purple-500' : 'bg-gray-200'
              }`}></div>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  currentStep >= 2 ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('calculators.eurscoreII.cardiac_factors')}</span>
              </div>
              <div className={`w-16 h-1 rounded-full transition-all duration-300 ${
                currentStep >= 3 ? 'bg-indigo-500' : 'bg-gray-200'
              }`}></div>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  currentStep >= 3 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('calculators.eurscoreII.operative_factors')}</span>
              </div>
            </div>

            {/* Step 1: Patient Demographics & Basic Factors */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.eurscoreII.section_patient_demographics')}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.eurscoreII.section_patient_description')}</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <CalculatorInput
                    label={t('calculators.eurscoreII.age_label')}
                    value={formData.age}
                    onChange={(value) => setFormData({ ...formData, age: value })}
                    type="number"
                    placeholder={t('calculators.eurscoreII.age_placeholder')}
                    min={18}
                    max={120}
                    unit={t('calculators.eurscoreII.age_unit')}
                    error={errors.age}
                    icon={User}
                  />

                  <CalculatorSelect
                    label={t('calculators.eurscoreII.gender_label')}
                    value={formData.gender}
                    onChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' })}
                    options={[
                      { value: '', label: t('calculators.eurscoreII.gender_placeholder'), description: t('calculators.eurscoreII.gender_description') },
                      { value: 'male', label: t('calculators.eurscoreII.gender_male'), description: t('calculators.eurscoreII.gender_male_description') },
                      { value: 'female', label: t('calculators.eurscoreII.gender_female'), description: t('calculators.eurscoreII.gender_female_description') },
                    ]}
                    error={errors.gender}
                    icon={User}
                    searchable={false}
                  />

                  <CalculatorSelect
                    label={t('calculators.eurscoreII.creatinine_clearance_label')}
                    value={formData.creatinineClearance}
                    onChange={(value) => setFormData({ ...formData, creatinineClearance: value as any })}
                    options={[
                      { value: '', label: t('calculators.eurscoreII.creatinine_clearance_placeholder'), description: t('calculators.eurscoreII.creatinine_clearance_description') },
                      { value: '>85', label: t('calculators.eurscoreII.creatinine_clearance_gt85'), description: t('calculators.eurscoreII.creatinine_normal') },
                      { value: '51-85', label: t('calculators.eurscoreII.creatinine_clearance_51_85'), description: t('calculators.eurscoreII.creatinine_mild') },
                      { value: '≤50', label: t('calculators.eurscoreII.creatinine_clearance_le50'), description: t('calculators.eurscoreII.creatinine_moderate') },
                      { value: 'dialysis', label: t('calculators.eurscoreII.creatinine_clearance_dialysis'), description: t('calculators.eurscoreII.creatinine_dialysis') },
                    ]}
                    error={errors.creatinineClearance}
                    icon={BarChart3}
                    searchable={false}
                  />

                  <CalculatorSelect
                    label={t('calculators.eurscoreII.lv_function_label')}
                    value={formData.lvFunction}
                    onChange={(value) => setFormData({ ...formData, lvFunction: value as any })}
                    options={[
                      { value: '', label: t('calculators.eurscoreII.lv_function_placeholder'), description: t('calculators.eurscoreII.lv_function_description') },
                      { value: 'good', label: t('calculators.eurscoreII.lv_function_good'), description: t('calculators.eurscoreII.lv_function_good_description') },
                      { value: 'moderate', label: t('calculators.eurscoreII.lv_function_moderate'), description: t('calculators.eurscoreII.lv_function_moderate_description') },
                      { value: 'poor', label: t('calculators.eurscoreII.lv_function_poor'), description: t('calculators.eurscoreII.lv_function_poor_description') },
                      { value: 'very_poor', label: t('calculators.eurscoreII.lv_function_very_poor'), description: t('calculators.eurscoreII.lv_function_very_poor_description') },
                    ]}
                    error={errors.lvFunction}
                    icon={Heart}
                    searchable={false}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span>{t('calculators.eurscoreII.additional_risk_factors')}</span>
                  </h4>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <CalculatorCheckbox
                      label={t('calculators.eurscoreII.poor_mobility_label')}
                      checked={formData.poorMobility}
                      onChange={(checked) => setFormData({ ...formData, poorMobility: checked })}
                      description={t('calculators.eurscoreII.poor_mobility_description')}
                      icon={Activity}
                    />

                    <CalculatorCheckbox
                      label={t('calculators.eurscoreII.diabetes_insulin_label')}
                      checked={formData.diabetesOnInsulin}
                      onChange={(checked) => setFormData({ ...formData, diabetesOnInsulin: checked })}
                      description={t('calculators.eurscoreII.diabetes_insulin_description')}
                      icon={BarChart3}
                    />

                    <CalculatorCheckbox
                      label={t('calculators.eurscoreII.chronic_pulmonary_label')}
                      checked={formData.chronicPulmonaryDisease}
                      onChange={(checked) => setFormData({ ...formData, chronicPulmonaryDisease: checked })}
                      description={t('calculators.eurscoreII.chronic_pulmonary_description')}
                      icon={Activity}
                    />

                    <CalculatorCheckbox
                      label={t('calculators.eurscoreII.neurological_dysfunction_label')}
                      checked={formData.neurologicalDysfunction}
                      onChange={(checked) => setFormData({ ...formData, neurologicalDysfunction: checked })}
                      description={t('calculators.eurscoreII.neurological_dysfunction_description')}
                      icon={Brain}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <CalculatorButton
                    onClick={() => goToStep(2)}
                    className="enhanced-calculator-button"
                  >
                    {t('calculators.eurscoreII.next_cardiac_status')}
                  </CalculatorButton>
                </div>
              </div>
            )}

            {/* Step 2: Cardiac-Related Factors */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                    <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.eurscoreII.section_cardiac_factors')}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.eurscoreII.section_cardiac_description')}</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <CalculatorSelect
                    label={t('calculators.eurscoreII.nyha_label')}
                    value={formData.nyhaClass}
                    onChange={(value) => setFormData({ ...formData, nyhaClass: value as any })}
                    options={[
                      { value: '', label: t('calculators.eurscoreII.nyha_placeholder'), description: t('calculators.eurscoreII.nyha_description') },
                      { value: '1', label: t('calculators.eurscoreII.nyha_class_1_full'), description: t('calculators.eurscoreII.nyha_class_1_description') },
                      { value: '2', label: t('calculators.eurscoreII.nyha_class_2_full'), description: t('calculators.eurscoreII.nyha_class_2_description') },
                      { value: '3', label: t('calculators.eurscoreII.nyha_class_3_full'), description: t('calculators.eurscoreII.nyha_class_3_description') },
                      { value: '4', label: t('calculators.eurscoreII.nyha_class_4_full'), description: t('calculators.eurscoreII.nyha_class_4_description') },
                    ]}
                    error={errors.nyhaClass}
                    icon={Activity}
                    searchable={false}
                  />

                  <CalculatorSelect
                    label={t('calculators.eurscoreII.pa_pressure_label')}
                    value={formData.pulmonaryArteryPressure}
                    onChange={(value) => setFormData({ ...formData, pulmonaryArteryPressure: value as any })}
                    options={[
                      { value: '', label: t('calculators.eurscoreII.pa_pressure_placeholder'), description: t('calculators.eurscoreII.pa_pressure_description') },
                      { value: '<31', label: t('calculators.eurscoreII.pa_pressure_lt31'), description: t('calculators.eurscoreII.pa_pressure_normal') },
                      { value: '31-54', label: t('calculators.eurscoreII.pa_pressure_31_54'), description: t('calculators.eurscoreII.pa_pressure_mild') },
                      { value: '≥55', label: t('calculators.eurscoreII.pa_pressure_ge55'), description: t('calculators.eurscoreII.pa_pressure_severe') },
                    ]}
                    error={errors.pulmonaryArteryPressure}
                    icon={Activity}
                    searchable={false}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-purple-600" />
                    <span>{t('calculators.eurscoreII.cardiac_history_title')}</span>
                  </h4>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <CalculatorCheckbox
                      label={t('calculators.eurscoreII.ccs_class4_label')}
                      checked={formData.ccsClass4}
                      onChange={(checked) => setFormData({ ...formData, ccsClass4: checked })}
                      description={t('calculators.eurscoreII.ccs_class4_description')}
                      icon={Heart}
                    />

                    <CalculatorCheckbox
                      label={t('calculators.eurscoreII.extracardiac_arteriopathy_label')}
                      checked={formData.extracardiacArteriopathy}
                      onChange={(checked) => setFormData({ ...formData, extracardiacArteriopathy: checked })}
                      description={t('calculators.eurscoreII.extracardiac_arteriopathy_description_detailed')}
                      icon={Brain}
                    />

                    <CalculatorCheckbox
                      label={t('calculators.eurscoreII.previous_cardiac_surgery_label')}
                      checked={formData.previousCardiacSurgery}
                      onChange={(checked) => setFormData({ ...formData, previousCardiacSurgery: checked })}
                      description={t('calculators.eurscoreII.previous_cardiac_surgery_description_detailed')}
                      icon={Heart}
                    />

                    <CalculatorCheckbox
                      label={t('calculators.eurscoreII.active_endocarditis_label')}
                      checked={formData.activeEndocarditis}
                      onChange={(checked) => setFormData({ ...formData, activeEndocarditis: checked })}
                      description={t('calculators.eurscoreII.active_endocarditis_description_detailed')}
                      icon={AlertTriangle}
                    />

                    <CalculatorCheckbox
                      label={t('calculators.eurscoreII.recent_mi_label')}
                      checked={formData.recentMI}
                      onChange={(checked) => setFormData({ ...formData, recentMI: checked })}
                      description={t('calculators.eurscoreII.recent_mi_description_detailed')}
                      icon={Heart}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <CalculatorButton
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                  >
                    {t('calculators.eurscoreII.back_button')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={() => goToStep(3)}
                    className="enhanced-calculator-button"
                  >
                    {t('calculators.eurscoreII.next_operative_factors_full')}
                  </CalculatorButton>
                </div>
              </div>
            )}

            {/* Step 3: Operative Factors */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-indigo-50 to-pink-50 dark:from-indigo-900/20 dark:to-pink-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                    <Stethoscope className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.eurscoreII.section_operative_factors')}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.eurscoreII.section_operative_description')}</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <CalculatorSelect
                    label={t('calculators.eurscoreII.urgency_label')}
                    value={formData.urgency}
                    onChange={(value) => setFormData({ ...formData, urgency: value as any })}
                    options={[
                      { value: '', label: t('calculators.eurscoreII.urgency_placeholder'), description: t('calculators.eurscoreII.urgency_description') },
                      { value: 'elective', label: t('calculators.eurscoreII.urgency_elective_full'), description: t('calculators.eurscoreII.urgency_elective_description') },
                      { value: 'urgent', label: t('calculators.eurscoreII.urgency_urgent_full'), description: t('calculators.eurscoreII.urgency_urgent_description') },
                      { value: 'emergency', label: t('calculators.eurscoreII.urgency_emergency_full'), description: t('calculators.eurscoreII.urgency_emergency_description') },
                      { value: 'salvage', label: t('calculators.eurscoreII.urgency_salvage_full'), description: t('calculators.eurscoreII.urgency_salvage_description') },
                    ]}
                    searchable={true}
                    error={errors.urgency}
                    icon={AlertTriangle}
                  />

                  <CalculatorSelect
                    label={t('calculators.eurscoreII.weight_of_procedure_label')}
                    value={formData.weightOfProcedure}
                    onChange={(value) => setFormData({ ...formData, weightOfProcedure: value as any })}
                    options={[
                      { value: '', label: t('calculators.eurscoreII.weight_of_procedure_placeholder'), description: t('calculators.eurscoreII.procedure_complexity_classification') },
                      { value: 'isolated_cabg', label: t('calculators.eurscoreII.isolated_cabg'), description: t('calculators.eurscoreII.isolated_cabg_description') },
                      { value: 'isolated_non_cabg', label: t('calculators.eurscoreII.isolated_non_cabg'), description: t('calculators.eurscoreII.isolated_non_cabg_description') },
                      { value: 'two_major', label: t('calculators.eurscoreII.two_major'), description: t('calculators.eurscoreII.two_major_description') },
                      { value: 'three_plus_major', label: t('calculators.eurscoreII.three_plus_major'), description: t('calculators.eurscoreII.three_plus_major_description') },
                    ]}
                    searchable={true}
                    error={errors.weightOfProcedure}
                    icon={Calculator}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-indigo-600" />
                    <span>{t('calculators.eurscoreII.critical_conditions_header')}</span>
                  </h4>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <CalculatorCheckbox
                      label={t('calculators.eurscoreII.critical_preoperative_state_label')}
                      checked={formData.criticalPreoperativeState}
                      onChange={(checked) => setFormData({ ...formData, criticalPreoperativeState: checked })}
                      description={t('calculators.eurscoreII.critical_preoperative_state_description_detailed')}
                      icon={AlertTriangle}
                    />

                    <CalculatorCheckbox
                      label={t('calculators.eurscoreII.thoracic_aorta_label')}
                      checked={formData.thoracicAortaSurgery}
                      onChange={(checked) => setFormData({ ...formData, thoracicAortaSurgery: checked })}
                      description={t('calculators.eurscoreII.thoracic_aorta_description')}
                      icon={Heart}
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">{t('calculators.eurscoreII.complexity_info_title')}</h4>
                  </div>
                  <div className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
                    <p>{t('calculators.eurscoreII.complexity_low_info')}</p>
                    <p>{t('calculators.eurscoreII.complexity_medium_info')}</p>
                    <p>{t('calculators.eurscoreII.complexity_high_info')}</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <CalculatorButton
                    onClick={() => setCurrentStep(2)}
                    variant="outline"
                  >
                    {t('calculators.eurscoreII.back_button')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={handleCalculate}
                    loading={isCalculating}
                    icon={Calculator}
                    size="lg"
                    className="enhanced-calculator-button"
                  >
                    {t('calculators.eurscoreII.calculate_euroscore_ii')}
                  </CalculatorButton>
                </div>
              </div>
            )}

          </>
        ) : isCalculating ? (
          /* Enhanced Calculation Animation */
          <div className="text-center py-16 animate-sophisticatedFadeIn" id="calculation-section">
            <div className="relative">
              {/* Sophisticated calculation animation */}
              <div className="relative mx-auto mb-8 w-40 h-40">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                
                {/* Animated rings */}
                <div className={`absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin ${
                  animationPhase >= 1 ? 'opacity-100' : 'opacity-30'
                }`}></div>
                <div className={`absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin ${
                  animationPhase >= 2 ? 'opacity-100' : 'opacity-30'
                }`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className={`absolute inset-4 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin ${
                  animationPhase >= 3 ? 'opacity-100' : 'opacity-30'
                }`} style={{ animationDuration: '2s' }}></div>
                <div className={`absolute inset-6 rounded-full border-4 border-transparent border-t-pink-500 animate-spin ${
                  animationPhase >= 4 ? 'opacity-100' : 'opacity-30'
                }`} style={{ animationDirection: 'reverse', animationDuration: '2.5s' }}></div>
                
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`p-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 ${
                    animationPhase >= 4 ? 'animate-sophisticatedPulse' : 'animate-sophisticatedScale'
                  }`}>
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Progress indicators */}
              <div className="flex justify-center space-x-3 mb-8">
                {[1, 2, 3, 4].map((phase) => (
                  <div
                    key={phase}
                    className={`w-4 h-4 rounded-full transition-all duration-500 ${
                      animationPhase >= phase 
                        ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-sophisticatedPulse shadow-lg' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              {/* Dynamic status messages */}
              <div className="space-y-4">
                <div className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {t('calculators.eurscoreII.calculating')}
                  </h3>
                  <div className="h-8 flex items-center justify-center">
                    <p className="text-lg text-gray-600 dark:text-gray-400 transition-all duration-300">
                      {animationPhase === 1 && (
                        <span className="flex items-center space-x-2">
                          <Brain className="w-5 h-5 text-blue-500 animate-pulse" />
                          <span>{t('calculators.eurscoreII.analyzing_patient_factors')}</span>
                        </span>
                      )}
                      {animationPhase === 2 && (
                        <span className="flex items-center space-x-2">
                          <Heart className="w-5 h-5 text-purple-500 animate-pulse" />
                          <span>{t('calculators.eurscoreII.calculating_cardiac_indices')}</span>
                        </span>
                      )}
                      {animationPhase === 3 && (
                        <span className="flex items-center space-x-2">
                          <Globe className="w-5 h-5 text-indigo-500 animate-pulse" />
                          <span>{t('calculators.eurscoreII.applying_euroscore_algorithm')}</span>
                        </span>
                      )}
                      {animationPhase === 4 && (
                        <span className="flex items-center space-x-2">
                          <Lightbulb className="w-5 h-5 text-pink-500 animate-pulse" />
                          <span>{t('calculators.eurscoreII.generating_recommendations')}</span>
                        </span>
                      )}
                      {animationPhase === 0 && (
                        <span className="flex items-center space-x-2">
                          <Sparkles className="w-5 h-5 text-gray-500 animate-pulse" />
                          <span>{t('calculators.eurscoreII.initializing_assessment')}</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Sophisticated loading dots */}
                <div className="flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-sophisticatedDots"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-sophisticatedDots"></div>
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-sophisticatedDots"></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-sophisticatedDots"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* World-Class Results Display */
          result && (
            <div className="space-y-12 results-animate-in" id="results-section">
              {/* Hero Section with Risk Gauge */}
              <div className="medical-card p-12 text-center">
                <div className="max-w-4xl mx-auto">
                  <h1 className="results-hero-title mb-2">
                    {t('calculators.eurscoreII.results_title')}
                  </h1>
                  <p className="results-subtitle mb-12">
                    {t('calculators.eurscoreII.results_subtitle')}
                  </p>
                  
                  {/* Risk Gauge */}
                  <div className="risk-gauge-container mb-8">
                    <div className="risk-gauge-background">
                      <div className="risk-gauge-inner">
                        <div className="risk-gauge-value number-count-animation">
                          {result.predictedMortality}%
                        </div>
                        <div className="risk-gauge-label">
                          {t('calculators.eurscoreII.mortality_risk_30day')}
                        </div>
                        <div 
                          className="risk-gauge-needle"
                          style={{ 
                            '--needle-rotation': `${Math.min(result.predictedMortality * 6, 180)}deg` 
                          } as React.CSSProperties}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Category Badge */}
                  <div className="inline-flex items-center gap-3 mb-6">
                    <div className="validation-badge">
                      <Award className="w-5 h-5" />
                      <span>{t('calculators.eurscoreII.clinical_grade_assessment')}</span>
                    </div>
                    <div className={`px-8 py-4 rounded-2xl border-2 font-bold text-xl ${
                      getRiskColor(result.predictedMortality).bg
                    } ${getRiskColor(result.predictedMortality).border} ${getRiskColor(result.predictedMortality).text}`}>
                      {t(`calculators.eurscoreII.risk_${result.riskCategory}_full`)}
                    </div>
                  </div>

                  <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    {result.interpretation}
                  </p>
                </div>
              </div>

              {/* Risk Stratification Dashboard */}
              <div className="medical-card p-8 results-animate-in">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="results-section-title">{t('calculators.eurscoreII.risk_stratification_analysis')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('calculators.eurscoreII.population_based_categorization')}</p>
                  </div>
                </div>
                
                <div className="risk-category-grid">
                  <div className={`risk-category-card low ${result.riskCategory === 'low' ? 'active' : ''}`}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                        {t('calculators.eurscoreII.low_risk_label')}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {t('calculators.eurscoreII.low_risk_range')}
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300 mt-2">
                        {t('calculators.eurscoreII.excellent_surgical_candidate')}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`risk-category-card intermediate ${result.riskCategory === 'intermediate' ? 'active' : ''}`}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                        {t('calculators.eurscoreII.intermediate_risk_label')}
                      </div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                        {t('calculators.eurscoreII.intermediate_risk_range')}
                      </div>
                      <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                        {t('calculators.eurscoreII.moderate_surgical_risk')}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`risk-category-card high ${result.riskCategory === 'high' ? 'active' : ''}`}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-800 dark:text-orange-200 mb-2">
                        {t('calculators.eurscoreII.high_risk_label')}
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                        {t('calculators.eurscoreII.high_risk_range')}
                      </div>
                      <div className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                        {t('calculators.eurscoreII.enhanced_perioperative_care')}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`risk-category-card very-high ${result.riskCategory === 'very_high' ? 'active' : ''}`}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
                        {t('calculators.eurscoreII.very_high_risk_label')}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                        {t('calculators.eurscoreII.very_high_risk_range')}
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-300 mt-2">
                        {t('calculators.eurscoreII.multidisciplinary_evaluation')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Insights */}
              <div className="medical-card p-8 results-animate-in">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="results-section-title">{t('calculators.eurscoreII.clinical_recommendations')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('calculators.eurscoreII.evidence_based_validation')}</p>
                  </div>
                </div>
                
                <div className="clinical-insights">
                  <div className="space-y-4">
                    {result.recommendations.map((rec, index) => (
                      <div key={index} className="clinical-recommendation-item">
                        <div className="clinical-recommendation-icon">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="clinical-recommendation-text">
                          {rec}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comparative Risk Analysis */}
              <div className="medical-card p-8 results-animate-in">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 shadow-lg">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="results-section-title">{t('calculators.eurscoreII.comparative_risk_analysis')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('calculators.eurscoreII.euroscore_vs_population')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Enhanced Chart Visualization */}
                  <div className="data-viz-container">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 relative z-10">
                      {t('calculators.eurscoreII.risk_comparison_chart')}
                    </h3>
                    <div className="comparison-chart relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg p-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
                        {t('calculators.eurscoreII.mortality_risk_percent')}
                      </div>
                      <div className="space-y-6">
                        {/* Population Average Bar */}
                        <div className="relative">
                          <div className="flex justify-between items-center mb-3 min-h-6">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight flex-shrink-0 mr-4 risk-analysis-label">{t('calculators.eurscoreII.population_average')}</span>
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400 flex-shrink-0 risk-analysis-value">2.8%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-gray-400 to-gray-500 h-4 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: '14%' }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                            </div>
                          </div>
                        </div>

                        {/* Your Patient Bar */}
                        <div className="relative">
                          <div className="flex justify-between items-center mb-3 min-h-6">
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-300 leading-tight flex-shrink-0 mr-4 risk-analysis-label">{t('calculators.eurscoreII.your_patient')}</span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 risk-analysis-value">{result.predictedMortality}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                              style={{ width: `${Math.min(result.predictedMortality * 5, 100)}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                              <div className="absolute inset-0 rounded-full shadow-inner"></div>
                            </div>
                          </div>
                        </div>

                        {/* Low Risk Cohort Bar */}
                        <div className="relative">
                          <div className="flex justify-between items-center mb-3 min-h-6">
                            <span className="text-sm font-medium text-green-700 dark:text-green-300 leading-tight flex-shrink-0 mr-4 risk-analysis-label">{t('calculators.eurscoreII.low_risk_cohort')}</span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400 flex-shrink-0 risk-analysis-value">1.2%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-green-500 h-4 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: '6%' }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                            </div>
                          </div>
                        </div>

                        {/* High Risk Cohort Bar */}
                        <div className="relative">
                          <div className="flex justify-between items-center mb-3 min-h-6">
                            <span className="text-sm font-medium text-red-700 dark:text-red-300 leading-tight flex-shrink-0 mr-4 risk-analysis-label">{t('calculators.eurscoreII.high_risk_cohort')}</span>
                            <span className="text-sm font-bold text-red-600 dark:text-red-400 flex-shrink-0 risk-analysis-value">8.5%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-red-400 to-red-500 h-4 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: '42.5%' }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Model Comparison */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {t('calculators.eurscoreII.risk_model_comparison')}
                    </h3>
                    
                    {/* EuroSCORE II */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <h4 className="font-bold text-blue-800 dark:text-blue-200">{t('calculators.eurscoreII.euroscore_ii_current')}</h4>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">{t('calculators.eurscoreII.current_label')}</span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        {result.predictedMortality}% {t('calculators.eurscoreII.mortality_risk_result')}
                      </p>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {t('calculators.eurscoreII.latest_european_algorithm')}
                      </div>
                    </div>

                    {/* STS Score */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <h4 className="font-bold text-purple-800 dark:text-purple-200">{t('calculators.eurscoreII.sts_risk_score')}</h4>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">{t('calculators.eurscoreII.reference_label')}</span>
                      </div>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                        {result.comparisonToSTS}
                      </p>
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        {t('calculators.eurscoreII.north_american_standard')}
                      </div>
                    </div>

                    {/* Additional Context */}
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3 mb-2">
                        <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h4 className="font-bold text-amber-800 dark:text-amber-200">{t('calculators.eurscoreII.clinical_significance')}</h4>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {result.riskCategory === 'low' && t('calculators.eurscoreII.excellent_surgical_candidate_full')}
                        {result.riskCategory === 'intermediate' && t('calculators.eurscoreII.standard_surgical_risk')}
                        {result.riskCategory === 'high' && t('calculators.eurscoreII.elevated_risk_enhanced_care')}
                        {result.riskCategory === 'very_high' && t('calculators.eurscoreII.high_risk_specialized_care')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scientific Validation */}
              <div className="medical-card p-8 results-animate-in">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="results-section-title">{t('calculators.eurscoreII.scientific_foundation')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('calculators.eurscoreII.evidence_based_validation')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      {t('calculators.eurscoreII.evidence.formula_title')}
                    </h3>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div className="font-mono text-lg text-center">
                        <p className="text-indigo-700 dark:text-indigo-300 mb-2">
                          {t('calculators.eurscoreII.formula_prediction')}
                        </p>
                        <p className="text-indigo-600 dark:text-indigo-400 text-sm">
                          {t('calculators.eurscoreII.formula_where_y')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      {t('calculators.eurscoreII.algorithm_validation')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('calculators.eurscoreII.validated_on_patients')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('calculators.eurscoreII.c_index_excellent')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('calculators.eurscoreII.multiple_international_validations')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-bold text-indigo-800 dark:text-indigo-200 mb-4">
                    {t('calculators.eurscoreII.key_validation_studies')}
                  </h4>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="text-indigo-700 dark:text-indigo-300 font-medium">
                        {t('calculators.eurscoreII.original_development')}
                      </p>
                      <p className="text-indigo-600 dark:text-indigo-400">
                        {t('calculators.eurscoreII.nashef_reference')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-indigo-700 dark:text-indigo-300 font-medium">
                        {t('calculators.eurscoreII.international_validation')}
                      </p>
                      <p className="text-indigo-600 dark:text-indigo-400">
                        {t('calculators.eurscoreII.chalmers_reference')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Actions */}
              <div className="action-buttons-container">
                <button
                  onClick={handleReset}
                  className="action-button-primary"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  {t('calculators.eurscoreII.new_assessment_action')}
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="action-button-secondary"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  {t('calculators.eurscoreII.print_results')}
                </button>
              </div>
            </div>
          )
        )}

        {/* Footer Information */}
        <div className="text-center pt-8 border-t border-white/20 dark:border-gray-800/20">
          <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
            <Info className="w-4 h-4" />
            <span>{t('calculators.eurscoreII.footer_info')}</span>
            <div className="flex items-center space-x-1">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-semibold">{t('calculators.eurscoreII.validation_badge')}</span>
            </div>
          </div>
          </div>
        </div>
        </CalculatorContainer>
      </div>
    </div>
  );
};