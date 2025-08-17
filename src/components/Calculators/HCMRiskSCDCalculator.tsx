import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Info, Heart, AlertTriangle, Zap, TrendingUp, Star, Brain, User, Activity, BarChart3, Stethoscope, Award, Shield, Clock, Target, AlertCircle, CheckCircle, FileText, Sparkles, Gauge, Globe, Lightbulb, ArrowRight, Calendar, Eye, Layers, BookOpen, Users, ChevronRight, ChevronDown, Maximize2, Minimize2, Share2 } from 'lucide-react';
import { 
  CalculatorContainer, 
  CalculatorInput, 
  CalculatorSelect, 
  CalculatorCheckbox, 
  CalculatorButton, 
  ResultsDisplay 
} from '../ui/calculator-ui';
import { useTranslation } from '../../hooks/useTranslation';

interface HCMSCDFormData {
  // Required fields for O'Mahony formula
  age: string; // Age at evaluation, years (continuous)
  maxWallThickness: string; // Maximum wall thickness, mm (continuous)
  leftAtrialDiameter: string; // Left atrial diameter, mm (continuous)
  maxLVOTGradient: string; // Maximal left ventricular outflow tract gradients, mmHg (continuous)
  familyHistorySCD: boolean; // Family history of SCD (0 = No, 1 = Yes)
  nonSustainedVT: boolean; // Non-sustained ventricular tachycardia (0 = No, 1 = Yes)
  unexplainedSyncope: boolean; // Unexplained syncope (0 = No, 1 = Yes)
  
  // Exclusion criteria fields
  priorSCD: boolean; // Prior sudden cardiac death/arrest
  priorICD: boolean; // Prior ICD implantation
  concurrentVHD: boolean; // Concurrent valvular heart disease
  infiltrativeDisease: boolean; // Infiltrative/storage disease
}

interface HCMSCDResult {
  fiveYearRisk: number;
  riskCategory: 'low' | 'intermediate' | 'high';
  icdRecommendation: 'not_indicated' | 'consider' | 'reasonable' | 'indicated';
  interpretation: string;
  recommendations: string[];
  exclusionReasons: string[];
}

export const HCMRiskSCDCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('calculator');
  const [formData, setFormData] = useState<HCMSCDFormData>({
    age: '',
    maxWallThickness: '',
    leftAtrialDiameter: '',
    maxLVOTGradient: '',
    familyHistorySCD: false,
    nonSustainedVT: false,
    unexplainedSyncope: false,
    priorSCD: false,
    priorICD: false,
    concurrentVHD: false,
    infiltrativeDisease: false
  });

  const [result, setResult] = useState<HCMSCDResult | null>(null);
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
      if (!formData.age || !formData.maxWallThickness) return 0;
      
      try {
        // Simplified real-time calculation for preview
        const age = parseFloat(formData.age);
        const wallThickness = parseFloat(formData.maxWallThickness);
        const laDiameter = parseFloat(formData.leftAtrialDiameter) || 35;
        const lvotGradient = parseFloat(formData.maxLVOTGradient) || 0;
        
        let baseRisk = Math.max(0, (wallThickness - 15) * 0.8); // Wall thickness contribution
        baseRisk += Math.max(0, (age - 30) * 0.1); // Age contribution
        baseRisk += Math.max(0, (laDiameter - 35) * 0.15); // LA diameter contribution
        baseRisk += Math.max(0, lvotGradient * 0.02); // LVOT gradient contribution
        
        if (formData.familyHistorySCD) baseRisk += 2.5;
        if (formData.nonSustainedVT) baseRisk += 3.5;
        if (formData.unexplainedSyncope) baseRisk += 2.8;
        
        return Math.min(Math.max(baseRisk, 0.1), 25);
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
    if (formData.age && formData.maxWallThickness && formData.leftAtrialDiameter && formData.maxLVOTGradient) {
      newCompletedSteps.push(1);
    }
    
    // Step 2 completion check (risk factors can be empty)
    newCompletedSteps.push(2);
    
    setCompletedSteps(newCompletedSteps);
  }, [formData]);
  
  // Animation phases for calculation
  useEffect(() => {
    if (isCalculating) {
      const phases = [
        { phase: 1, duration: 600, message: 'Analyzing HCM risk factors...' },
        { phase: 2, duration: 500, message: 'Processing O\'Mahony algorithm...' },
        { phase: 3, duration: 400, message: 'Calculating 5-year SCD risk...' },
        { phase: 4, duration: 400, message: 'Generating ICD recommendations...' }
      ];
      
      let currentPhaseIndex = 0;
      
      const nextPhase = () => {
        if (currentPhaseIndex < phases.length) {
          setAnimationPhase(phases[currentPhaseIndex].phase);
          currentPhaseIndex++;
          setTimeout(nextPhase, phases[currentPhaseIndex - 1].duration);
        }
      };
      
      nextPhase();
    } else {
      setAnimationPhase(0);
    }
  }, [isCalculating]);

  const getRiskColor = (risk: number) => {
    if (risk < 4) return 'text-green-600';
    if (risk < 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevel = (risk: number) => {
    if (risk < 4) return 'Low Risk';
    if (risk < 6) return 'Intermediate Risk';
    return 'High Risk';
  };

  const getStepProgress = () => {
    return (currentStep / 3) * 100;
  };

  // Step-specific validation functions
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const age = parseFloat(formData.age);
    if (!formData.age || isNaN(age)) {
      newErrors.age = t('calculators.required');
    } else if (age < 16 || age > 100) {
      newErrors.age = 'Age must be between 16-100 years';
    }

    const wallThickness = parseFloat(formData.maxWallThickness);
    if (!formData.maxWallThickness || isNaN(wallThickness)) {
      newErrors.maxWallThickness = t('calculators.required');
    } else if (wallThickness < 5 || wallThickness > 50) {
      newErrors.maxWallThickness = 'Wall thickness must be between 5-50 mm';
    }

    const laDiameter = parseFloat(formData.leftAtrialDiameter);
    if (!formData.leftAtrialDiameter || isNaN(laDiameter)) {
      newErrors.leftAtrialDiameter = t('calculators.required');
    } else if (laDiameter < 25 || laDiameter > 80) {
      newErrors.leftAtrialDiameter = 'Left atrial diameter must be between 25-80 mm';
    }

    const lvotGradient = parseFloat(formData.maxLVOTGradient);
    if (!formData.maxLVOTGradient || isNaN(lvotGradient)) {
      newErrors.maxLVOTGradient = t('calculators.required');
    } else if (lvotGradient < 0 || lvotGradient > 300) {
      newErrors.maxLVOTGradient = 'LVOT gradient must be between 0-300 mmHg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    // Risk factors validation - no required fields, all optional
    setErrors({});
    return true;
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Age validation
    const age = parseFloat(formData.age);
    if (!formData.age || isNaN(age)) {
      newErrors.age = t('calculators.required');
    } else if (age < 16 || age > 100) {
      newErrors.age = 'Age must be between 16-100 years';
    }

    // Maximum wall thickness validation
    const wallThickness = parseFloat(formData.maxWallThickness);
    if (!formData.maxWallThickness || isNaN(wallThickness)) {
      newErrors.maxWallThickness = t('calculators.required');
    } else if (wallThickness < 5 || wallThickness > 50) {
      newErrors.maxWallThickness = 'Wall thickness must be between 5-50 mm';
    }

    // Left atrial diameter validation
    const laDiameter = parseFloat(formData.leftAtrialDiameter);
    if (!formData.leftAtrialDiameter || isNaN(laDiameter)) {
      newErrors.leftAtrialDiameter = t('calculators.required');
    } else if (laDiameter < 25 || laDiameter > 80) {
      newErrors.leftAtrialDiameter = 'Left atrial diameter must be between 25-80 mm';
    }

    // LVOT gradient validation
    const lvotGradient = parseFloat(formData.maxLVOTGradient);
    if (!formData.maxLVOTGradient || isNaN(lvotGradient)) {
      newErrors.maxLVOTGradient = t('calculators.required');
    } else if (lvotGradient < 0 || lvotGradient > 300) {
      newErrors.maxLVOTGradient = 'LVOT gradient must be between 0-300 mmHg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateHCMRisk = (): HCMSCDResult => {
    // O'Mahony et al. HCM Risk-SCD calculation (exact formula)
    const age = parseFloat(formData.age);
    const wallThickness = parseFloat(formData.maxWallThickness);
    const laDiameter = parseFloat(formData.leftAtrialDiameter);
    const lvotGradient = parseFloat(formData.maxLVOTGradient);

    // Convert boolean risk factors to numerical values (0 = No, 1 = Yes)
    const familyHistorySCD = formData.familyHistorySCD ? 1 : 0;
    const nonSustainedVT = formData.nonSustainedVT ? 1 : 0;
    const unexplainedSyncope = formData.unexplainedSyncope ? 1 : 0;

    // Prognostic Index calculation using exact O'Mahony formula
    const prognosticIndex = 
      0.15939858 * wallThickness - 
      0.00294271 * Math.pow(wallThickness, 2) + 
      0.0259082 * laDiameter + 
      0.00446131 * lvotGradient + 
      0.4583082 * familyHistorySCD + 
      0.82639195 * nonSustainedVT + 
      0.71650361 * unexplainedSyncope - 
      0.01799934 * age;

    // Calculate 5-year SCD risk using exact O'Mahony formula
    // p̂SCD at 5 years = 1 – 0.998^exp(Prognostic Index)
    const fiveYearRisk = (1 - Math.pow(0.998, Math.exp(prognosticIndex))) * 100;

    // Ensure risk is within reasonable bounds (0.1% to 30%)
    const clampedRisk = Math.min(Math.max(fiveYearRisk, 0.1), 30);

    // Risk categorization based on 2024 HCM Guidelines
    let riskCategory: 'low' | 'intermediate' | 'high';
    let icdRecommendation: 'not_indicated' | 'consider' | 'reasonable' | 'indicated';
    let interpretation: string;

    if (clampedRisk < 4) {
      riskCategory = 'low';
      icdRecommendation = 'not_indicated';
      interpretation = 'Low 5-year SCD risk (<4%). ICD not indicated for primary prevention.';
    } else if (clampedRisk < 6) {
      riskCategory = 'intermediate';
      icdRecommendation = 'consider';
      interpretation = 'Intermediate 5-year SCD risk (4-6%). Consider ICD after shared decision-making.';
    } else {
      riskCategory = 'high';
      icdRecommendation = 'reasonable';
      interpretation = 'High 5-year SCD risk (≥6%). ICD implantation is reasonable for primary prevention.';
    }

    const recommendations = getRecommendations(riskCategory, icdRecommendation, formData);

    return {
      fiveYearRisk: Math.round(clampedRisk * 10) / 10,
      riskCategory,
      icdRecommendation,
      interpretation,
      recommendations,
      exclusionReasons: []
    };
  };

  const getRecommendations = (
    riskCategory: string,
    icdRec: string,
    data: HCMSCDFormData
  ): string[] => {
    const baseRecs = [
      'HCM specialist evaluation and management',
      'Serial clinical and echocardiographic assessment',
      'Family screening and genetic counseling'
    ];

    if (riskCategory === 'low') {
      return [
        ...baseRecs,
        'ICD not indicated for primary prevention',
        'Continue medical therapy as indicated',
        'Activity recommendations per guidelines',
        'Reassess risk if clinical status changes'
      ];
    } else if (riskCategory === 'intermediate') {
      return [
        ...baseRecs,
        'Shared decision-making regarding ICD implantation',
        'Consider additional risk stratification (CMR, genetics)',
        'Optimize medical therapy',
        'Detailed discussion of risks and benefits',
        'Annual risk reassessment'
      ];
    } else {
      return [
        ...baseRecs,
        'ICD implantation reasonable for primary prevention',
        'Electrophysiology consultation recommended',
        'Pre-implant evaluation and optimization',
        'Patient education on device therapy',
        'Ongoing device clinic follow-up'
      ];
    }
  };

  const handleCalculate = () => {
    if (!validateForm()) return;
    
    setIsCalculating(true);
    
    // Simulate advanced HCM Risk-SCD calculation with loading animation
    setTimeout(() => {
      const calculatedResult = calculateHCMRisk();
      setResult(calculatedResult);
      setIsCalculating(false);
    }, 1900);
  };

  const handleReset = () => {
    setFormData({
      age: '',
      maxWallThickness: '',
      leftAtrialDiameter: '',
      maxLVOTGradient: '',
      familyHistorySCD: false,
      nonSustainedVT: false,
      unexplainedSyncope: false,
      priorSCD: false,
      priorICD: false,
      concurrentVHD: false,
      infiltrativeDisease: false
    });
    setResult(null);
    setErrors({});
    setIsCalculating(false);
    setCurrentStep(1);
    setCompletedSteps([]);
    setRealTimeRisk(0);
    setAnimationPhase(0);
    setFocusedField(null);
  };

  const getRiskCategoryColor = (category: string) => {
    switch (category) {
      case 'low': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBgColor = (category: string) => {
    switch (category) {
      case 'low': return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'intermediate': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'high': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default: return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getICDColor = (recommendation: string) => {
    switch (recommendation) {
      case 'not_indicated': return 'text-green-600';
      case 'consider': return 'text-yellow-600';
      case 'reasonable': return 'text-orange-600';
      case 'indicated': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <CalculatorContainer
      title={t('calculators.hcm_risk_scd.title')}
      subtitle={t('calculators.hcm_risk_scd.subtitle')}
      icon={Zap}
      gradient="cardiology"
      className="max-w-5xl mx-auto"
    >
      <div ref={containerRef} className="space-y-8 relative">
        {/* Interactive Background Effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)`
          }}
        />
        
        {/* Sophisticated Progress System */}
        <div className="relative">
          {/* Main Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-8 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-700 ease-out relative"
              style={{ width: `${getStepProgress()}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </div>
          </div>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div 
                key={step}
                className="flex items-center space-x-3"
              >
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm relative transition-all duration-300 ${
                    currentStep >= step 
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {completedSteps.includes(step) && currentStep > step ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step
                  )}
                  {currentStep === step && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-orange-500 opacity-30 animate-ping" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className={`font-semibold text-sm ${
                    currentStep >= step ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step === 1 && 'Demographics'}
                    {step === 2 && 'Clinical Data'}
                    {step === 3 && 'Risk Factors'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {step === 1 && 'Age & Measurements'}
                    {step === 2 && 'Echo Parameters'}
                    {step === 3 && 'SCD Risk Factors'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Real-time Risk Preview */}
          {realTimeRisk > 0 && !result && (
            <div className="medical-card p-6 mb-8 bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-900/10 dark:to-orange-900/10 border-2 border-red-200/30 dark:border-red-800/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                      <Gauge className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-800 dark:text-red-200">Real-time Risk Preview</h4>
                      <p className="text-sm text-red-600 dark:text-red-400">Updates as you type</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getRiskColor(realTimeRisk)}`}>
                      {realTimeRisk.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {getRiskLevel(realTimeRisk)}
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      realTimeRisk < 4 ? 'bg-green-500' : 
                      realTimeRisk < 6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(realTimeRisk * 4, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* World-Class Alert Header */}
        <div className="medical-card p-8 bg-gradient-to-br from-red-50/80 to-orange-50/80 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200/50 dark:border-red-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start space-x-6">
              <div className="p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-orange-700 bg-clip-text text-transparent mb-3">
                  {t('calculators.hcm_risk_scd.title')}
                </h4>
                <p className="text-red-700 dark:text-red-300 leading-relaxed text-lg mb-4">
                  {t('calculators.hcm_risk_scd.description')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-full px-4 py-2">
                    <Star className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">O'Mahony et al. Model</span>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-full px-4 py-2">
                    <Globe className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">International Validation</span>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-full px-4 py-2">
                    <Target className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">ICD Decision Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!result ? (
          <>
            {/* Step 1: Demographics & Core Measurements */}
            {currentStep === 1 && (
              <div className="space-y-8 results-animate-in">
                {/* Section Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-red-50/90 to-orange-50/90 dark:from-red-900/30 dark:to-orange-900/30 rounded-3xl border-2 border-red-200/50 dark:border-red-800/50 backdrop-blur-sm">
                    <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-orange-700 bg-clip-text text-transparent">
                        {t('calculators.hcm_risk_scd.demographics')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('calculators.hcm_risk_scd.demographics_info')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Form Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {/* Age Input */}
                  <div 
                    className="medical-card p-6 relative overflow-hidden group"
                    onFocus={() => setFocusedField('age')}
                    onBlur={() => setFocusedField(null)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-3xl group-hover:opacity-100 opacity-50 transition-opacity" />
                    <div className="relative">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                          <User className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Patient Age</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Age at evaluation</p>
                        </div>
                      </div>
                      <CalculatorInput
                        label={t('calculators.hcm_risk_scd.age_label')}
                        value={formData.age}
                        onChange={(value) => setFormData({ ...formData, age: value })}
                        type="number"
                        placeholder={t('calculators.hcm_risk_scd.age_placeholder')}
                        min={16}
                        max={80}
                        unit="years"
                        error={errors.age}
                        icon={User}
                      />
                    </div>
                  </div>

                  {/* Wall Thickness Input */}
                  <div 
                    className="medical-card p-6 relative overflow-hidden group"
                    onFocus={() => setFocusedField('maxWallThickness')}
                    onBlur={() => setFocusedField(null)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-3xl group-hover:opacity-100 opacity-50 transition-opacity" />
                    <div className="relative">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                          <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Max Wall Thickness</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Greatest LV thickness</p>
                        </div>
                      </div>
                      <CalculatorInput
                        label={t('calculators.hcm_risk_scd.max_wall_thickness')}
                        value={formData.maxWallThickness}
                        onChange={(value) => setFormData({ ...formData, maxWallThickness: value })}
                        type="number"
                        step={0.1}
                        placeholder={t('calculators.hcm_risk_scd.max_wall_thickness_placeholder')}
                        min={10}
                        max={50}
                        unit="mm"
                        error={errors.maxWallThickness}
                        icon={Heart}
                      />
                    </div>
                  </div>

                  {/* Left Atrial Diameter Input */}
                  <div 
                    className="medical-card p-6 relative overflow-hidden group"
                    onFocus={() => setFocusedField('leftAtrialDiameter')}
                    onBlur={() => setFocusedField(null)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-3xl group-hover:opacity-100 opacity-50 transition-opacity" />
                    <div className="relative">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                          <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Left Atrial Diameter</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Parasternal long axis</p>
                        </div>
                      </div>
                      <CalculatorInput
                        label="Left atrial diameter"
                        value={formData.leftAtrialDiameter}
                        onChange={(value) => setFormData({ ...formData, leftAtrialDiameter: value })}
                        type="number"
                        step={0.1}
                        placeholder="40"
                        min={25}
                        max={80}
                        unit="mm"
                        error={errors.leftAtrialDiameter}
                        icon={Activity}
                      />
                    </div>
                  </div>

                  {/* LVOT Gradient Input */}
                  <div 
                    className="medical-card p-6 relative overflow-hidden group"
                    onFocus={() => setFocusedField('maxLVOTGradient')}
                    onBlur={() => setFocusedField(null)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-3xl group-hover:opacity-100 opacity-50 transition-opacity" />
                    <div className="relative">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                          <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Max LVOT Gradient</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Peak outflow tract gradient</p>
                        </div>
                      </div>
                      <CalculatorInput
                        label={t('calculators.hcm_risk_scd.max_lvot_gradient')}
                        value={formData.maxLVOTGradient}
                        onChange={(value) => setFormData({ ...formData, maxLVOTGradient: value })}
                        type="number"
                        placeholder={t('calculators.hcm_risk_scd.max_lvot_gradient_placeholder')}
                        min={0}
                        max={200}
                        unit="mmHg"
                        error={errors.maxLVOTGradient}
                        icon={TrendingUp}
                      />
                    </div>
                  </div>
                </div>

                {/* Enhanced Clinical Guidelines */}
                <div className="medical-card p-8 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200/30 dark:border-red-800/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl">
                        <Info className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-red-800 dark:text-red-200">
                          {t('calculators.hcm_risk_scd.patient_selection')}
                        </h4>
                        <p className="text-red-600 dark:text-red-400">Important clinical considerations</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="font-semibold text-red-800 dark:text-red-200">Age Range</span>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300">{t('calculators.hcm_risk_scd.age_range_info')}</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="font-semibold text-red-800 dark:text-red-200">Diagnosis</span>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300">{t('calculators.hcm_risk_scd.diagnosis_required')}</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="font-semibold text-red-800 dark:text-red-200">Prevention</span>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300">{t('calculators.hcm_risk_scd.primary_prevention_info')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Navigation */}
                <div className="flex justify-end pt-8">
                  <CalculatorButton
                    onClick={() => goToStep(2)}
                    className="enhanced-calculator-button action-button-primary"
                    size="lg"
                  >
                    <span className="mr-2">{t('calculators.hcm_risk_scd.next_clinical_data')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </CalculatorButton>
                </div>
              </div>
            )}

            {/* Step 2: Risk Factors */}
            {currentStep === 2 && (
              <div className="space-y-8 results-animate-in">
                {/* Section Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-orange-50/90 to-yellow-50/90 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-3xl border-2 border-orange-200/50 dark:border-orange-800/50 backdrop-blur-sm">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl shadow-lg">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-700 to-yellow-700 bg-clip-text text-transparent">
                        {t('calculators.hcm_risk_scd.risk_factors')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('calculators.hcm_risk_scd.risk_factors_info')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk Factor Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                  {/* Traditional Risk Factors */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl shadow-lg">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {t('calculators.hcm_risk_scd.traditional_risk_factors')}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Clinical risk indicators</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Family History SCD */}
                      <div className="medical-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 rounded-full blur-3xl group-hover:opacity-100 opacity-50 transition-opacity" />
                        <div className="relative">
                          <CalculatorCheckbox
                            label={t('calculators.hcm_risk_scd.family_history_scd_label')}
                            checked={formData.familyHistorySCD}
                            onChange={(checked) => setFormData({ ...formData, familyHistorySCD: checked })}
                            description={t('calculators.hcm_risk_scd.family_history_info')}
                            icon={Heart}
                          />
                        </div>
                      </div>

                      {/* Non-sustained VT */}
                      <div className="medical-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 rounded-full blur-3xl group-hover:opacity-100 opacity-50 transition-opacity" />
                        <div className="relative">
                          <CalculatorCheckbox
                            label={t('calculators.hcm_risk_scd.non_sustained_vt_label')}
                            checked={formData.nonSustainedVT}
                            onChange={(checked) => setFormData({ ...formData, nonSustainedVT: checked })}
                            description={t('calculators.hcm_risk_scd.nsvt_info')}
                            icon={Zap}
                          />
                        </div>
                      </div>

                      {/* Unexplained Syncope */}
                      <div className="medical-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 rounded-full blur-3xl group-hover:opacity-100 opacity-50 transition-opacity" />
                        <div className="relative">
                          <CalculatorCheckbox
                            label={t('calculators.hcm_risk_scd.unexplained_syncope_label')}
                            checked={formData.unexplainedSyncope}
                            onChange={(checked) => setFormData({ ...formData, unexplainedSyncope: checked })}
                            description={t('calculators.hcm_risk_scd.unexplained_syncope_info')}
                            icon={Brain}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Factor Definitions */}
                  <div className="medical-card p-8 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-200/30 dark:border-orange-800/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 rounded-full blur-3xl" />
                    <div className="relative">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-orange-800 dark:text-orange-200">
                            {t('calculators.hcm_risk_scd.risk_factor_definitions')}
                          </h4>
                          <p className="text-orange-600 dark:text-orange-400">Clinical criteria explanations</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl backdrop-blur-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <Heart className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            <span className="font-semibold text-orange-800 dark:text-orange-200">Family History</span>
                          </div>
                          <p className="text-sm text-orange-700 dark:text-orange-300">{t('calculators.hcm_risk_scd.family_history_info')}</p>
                        </div>
                        
                        <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl backdrop-blur-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            <span className="font-semibold text-orange-800 dark:text-orange-200">Non-sustained VT</span>
                          </div>
                          <p className="text-sm text-orange-700 dark:text-orange-300">{t('calculators.hcm_risk_scd.nsvt_info')}</p>
                        </div>
                        
                        <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl backdrop-blur-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            <span className="font-semibold text-orange-800 dark:text-orange-200">Unexplained Syncope</span>
                          </div>
                          <p className="text-sm text-orange-700 dark:text-orange-300">{t('calculators.hcm_risk_scd.unexplained_syncope_info')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Navigation */}
                <div className="flex justify-between pt-8">
                  <CalculatorButton
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    size="lg"
                  >
                    <span className="mr-2">{t('calculators.common.back')}</span>
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={() => goToStep(3)}
                    className="enhanced-calculator-button action-button-primary"
                    size="lg"
                  >
                    <span className="mr-2">{t('calculators.hcm_risk_scd.next_risk_factors')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </CalculatorButton>
                </div>
              </div>
            )}

            {/* Step 3: Calculate Risk */}
            {currentStep === 3 && (
              <div className="space-y-8 results-animate-in">
                {/* Section Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-purple-50/90 to-red-50/90 dark:from-purple-900/30 dark:to-red-900/30 rounded-3xl border-2 border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-red-500 rounded-2xl shadow-lg">
                      <Calculator className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-red-700 bg-clip-text text-transparent">
                        Calculate Risk Score
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Final HCM Risk-SCD assessment
                      </p>
                    </div>
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="medical-card p-8 bg-gradient-to-br from-purple-50/50 to-red-50/50 dark:from-purple-900/20 dark:to-red-900/20 border-2 border-purple-200/30 dark:border-purple-800/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-red-500/5 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="p-4 bg-gradient-to-r from-purple-500 to-red-500 rounded-2xl shadow-lg">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          Assessment Summary
                        </h4>
                        <p className="text-purple-600 dark:text-purple-400">Review your clinical data</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Patient Data Summary */}
                      <div className="space-y-4">
                        <h5 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                          <User className="w-5 h-5 text-purple-600" />
                          <span>Patient Demographics</span>
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
                            <span className="text-gray-600 dark:text-gray-400">Age</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{formData.age} years</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
                            <span className="text-gray-600 dark:text-gray-400">Max Wall Thickness</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{formData.maxWallThickness} mm</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
                            <span className="text-gray-600 dark:text-gray-400">LA Diameter</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{formData.leftAtrialDiameter} mm</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
                            <span className="text-gray-600 dark:text-gray-400">LVOT Gradient</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{formData.maxLVOTGradient} mmHg</span>
                          </div>
                        </div>
                      </div>

                      {/* Risk Factors Summary */}
                      <div className="space-y-4">
                        <h5 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span>Risk Factors Present</span>
                        </h5>
                        <div className="space-y-3">
                          <div className={`flex justify-between items-center p-3 rounded-xl backdrop-blur-sm ${
                            formData.familyHistorySCD 
                              ? 'bg-red-50/80 dark:bg-red-900/20' 
                              : 'bg-green-50/80 dark:bg-green-900/20'
                          }`}>
                            <span className="text-gray-600 dark:text-gray-400">Family History SCD</span>
                            <span className={`font-semibold ${
                              formData.familyHistorySCD ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {formData.familyHistorySCD ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className={`flex justify-between items-center p-3 rounded-xl backdrop-blur-sm ${
                            formData.nonSustainedVT 
                              ? 'bg-red-50/80 dark:bg-red-900/20' 
                              : 'bg-green-50/80 dark:bg-green-900/20'
                          }`}>
                            <span className="text-gray-600 dark:text-gray-400">Non-sustained VT</span>
                            <span className={`font-semibold ${
                              formData.nonSustainedVT ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {formData.nonSustainedVT ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className={`flex justify-between items-center p-3 rounded-xl backdrop-blur-sm ${
                            formData.unexplainedSyncope 
                              ? 'bg-red-50/80 dark:bg-red-900/20' 
                              : 'bg-green-50/80 dark:bg-green-900/20'
                          }`}>
                            <span className="text-gray-600 dark:text-gray-400">Unexplained Syncope</span>
                            <span className={`font-semibold ${
                              formData.unexplainedSyncope ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {formData.unexplainedSyncope ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation Loading State */}
                {isCalculating && (
                  <div className="medical-card p-12 text-center bg-gradient-to-br from-purple-50/50 to-red-50/50 dark:from-purple-900/20 dark:to-red-900/20 border-2 border-purple-200/30 dark:border-purple-800/30">
                    <div className="relative inline-block">
                      <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Calculator className="w-8 h-8 text-purple-600 animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-purple-800 dark:text-purple-200">
                        Processing HCM Risk-SCD Calculation
                      </h4>
                      
                      <div className="space-y-3">
                        <div className={`flex items-center justify-center space-x-3 transition-opacity ${
                          animationPhase >= 1 ? 'opacity-100' : 'opacity-30'
                        }`}>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                          <span className="text-sm text-purple-700 dark:text-purple-300">Analyzing HCM risk factors...</span>
                        </div>
                        <div className={`flex items-center justify-center space-x-3 transition-opacity ${
                          animationPhase >= 2 ? 'opacity-100' : 'opacity-30'
                        }`}>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                          <span className="text-sm text-purple-700 dark:text-purple-300">Processing O'Mahony algorithm...</span>
                        </div>
                        <div className={`flex items-center justify-center space-x-3 transition-opacity ${
                          animationPhase >= 3 ? 'opacity-100' : 'opacity-30'
                        }`}>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                          <span className="text-sm text-purple-700 dark:text-purple-300">Calculating 5-year SCD risk...</span>
                        </div>
                        <div className={`flex items-center justify-center space-x-3 transition-opacity ${
                          animationPhase >= 4 ? 'opacity-100' : 'opacity-30'
                        }`}>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                          <span className="text-sm text-purple-700 dark:text-purple-300">Generating ICD recommendations...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Navigation */}
                <div className="flex justify-between pt-8">
                  <CalculatorButton
                    onClick={() => setCurrentStep(2)}
                    variant="outline"
                    size="lg"
                    disabled={isCalculating}
                  >
                    <span className="mr-2">{t('calculators.common.back')}</span>
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={handleCalculate}
                    loading={isCalculating}
                    icon={Calculator}
                    size="lg"
                    className="enhanced-calculator-button action-button-primary"
                    disabled={isCalculating}
                  >
                    <span className="mr-2">Calculate HCM Risk-SCD Score</span>
                    <Sparkles className="w-5 h-5" />
                  </CalculatorButton>
                </div>
              </div>
            )}

          </>
        ) : (
          /* World-Class Results Display */
          result && (
            <div className="space-y-12 results-animate-in">
              {/* Results Hero Section */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-red-50/90 to-purple-50/90 dark:from-red-900/30 dark:to-purple-900/30 rounded-3xl border-2 border-red-200/50 dark:border-red-800/50 backdrop-blur-sm mb-8">
                  <div className="p-4 bg-gradient-to-r from-red-500 to-purple-500 rounded-2xl shadow-lg">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-red-700 to-purple-700 bg-clip-text text-transparent">
                      HCM Risk-SCD Assessment Complete
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                      Evidence-based sudden cardiac death risk analysis
                    </p>
                  </div>
                </div>
              </div>

              {result.exclusionReasons.length > 0 ? (
                /* Exclusion Results */
                <ResultsDisplay
                  title={t('calculators.hcm_risk_scd.not_applicable')}
                  value={t('calculators.hcm_risk_scd.exclusion_present')}
                  category="high"
                  interpretation={result.interpretation}
                  icon={AlertTriangle}
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.hcm_risk_scd.exclusion_present')}</h4>
                    </div>
                    <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                      <ul className="space-y-2">
                        {result.exclusionReasons.map((reason, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">{reason}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Stethoscope className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.hcm_risk_scd.management_recommendations')}</h4>
                      </div>
                      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <div className="space-y-3">
                          {result.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-blue-700 dark:text-blue-300">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ResultsDisplay>
              ) : (
                /* Revolutionary Risk Assessment Results */
                <div className="space-y-12">
                  {/* Hero Risk Gauge */}
                  <div className="medical-card p-12 bg-gradient-to-br from-red-50/80 to-purple-50/80 dark:from-red-900/20 dark:to-purple-900/20 border-2 border-red-200/50 dark:border-red-800/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-500/5 to-purple-500/5 rounded-full blur-3xl" />
                    <div className="relative">
                      <div className="flex flex-col xl:flex-row items-center justify-between gap-12">
                        {/* Revolutionary Circular Risk Gauge */}
                        <div className="flex-1 text-center">
                          <div className="relative inline-block">
                            {/* Main Risk Circle */}
                            <div className="relative w-80 h-80 mx-auto">
                              {/* Background Circle */}
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 320 320">
                                <circle
                                  cx="160"
                                  cy="160"
                                  r="140"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="20"
                                  className="text-gray-200 dark:text-gray-700"
                                />
                                
                                {/* Animated Risk Arc */}
                                <circle
                                  cx="160"
                                  cy="160"
                                  r="140"
                                  fill="none"
                                  strokeWidth="20"
                                  strokeLinecap="round"
                                  className={`transition-all duration-2000 ease-out ${
                                    result.riskCategory === 'low' ? 'stroke-green-500' :
                                    result.riskCategory === 'intermediate' ? 'stroke-yellow-500' :
                                    'stroke-red-500'
                                  }`}
                                  style={{
                                    strokeDasharray: `${2 * Math.PI * 140}`,
                                    strokeDashoffset: `${2 * Math.PI * 140 * (1 - Math.min(result.fiveYearRisk / 25, 1))}`
                                  }}
                                />
                                
                                {/* Gradient Overlay */}
                                <defs>
                                  <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" className={
                                      result.riskCategory === 'low' ? 'stop-green-400' :
                                      result.riskCategory === 'intermediate' ? 'stop-yellow-400' :
                                      'stop-red-400'
                                    } />
                                    <stop offset="100%" className={
                                      result.riskCategory === 'low' ? 'stop-green-600' :
                                      result.riskCategory === 'intermediate' ? 'stop-yellow-600' :
                                      'stop-red-600'
                                    } />
                                  </linearGradient>
                                </defs>
                              </svg>
                              
                              {/* Center Content */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-center">
                                  <div className={`text-6xl font-bold mb-2 results-title ${
                                    result.riskCategory === 'low' ? 'text-green-600' :
                                    result.riskCategory === 'intermediate' ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}>
                                    {result.fiveYearRisk}%
                                  </div>
                                  <div className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    5-Year SCD Risk
                                  </div>
                                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                                    result.riskCategory === 'low' ? 'bg-green-100 text-green-800' :
                                    result.riskCategory === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {result.riskCategory.charAt(0).toUpperCase() + result.riskCategory.slice(1)} Risk
                                  </div>
                                </div>
                              </div>
                              
                              {/* Animated Needle */}
                              <div 
                                className="absolute top-1/2 left-1/2 w-1 bg-gray-800 dark:bg-gray-200 origin-bottom transition-transform duration-2000 ease-out"
                                style={{
                                  height: '120px',
                                  transform: `translate(-50%, -100%) rotate(${-90 + (result.fiveYearRisk / 25) * 180}deg)`,
                                  transformOrigin: 'bottom center'
                                }}
                              >
                                <div className="w-3 h-3 bg-gray-800 dark:bg-gray-200 rounded-full absolute -top-1 -left-1" />
                              </div>
                              
                              {/* Center Dot */}
                              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gray-800 dark:bg-gray-200 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10" />
                            </div>
                            
                            {/* Risk Scale Labels */}
                            <div className="flex justify-between mt-6 px-8">
                              <div className="text-center">
                                <div className="text-green-600 font-bold">0%</div>
                                <div className="text-xs text-gray-500">Low</div>
                              </div>
                              <div className="text-center">
                                <div className="text-yellow-600 font-bold">4%</div>
                                <div className="text-xs text-gray-500">Intermediate</div>
                              </div>
                              <div className="text-center">
                                <div className="text-red-600 font-bold">6%+</div>
                                <div className="text-xs text-gray-500">High</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* ICD Recommendation Card */}
                        <div className="flex-1 space-y-6">
                          <div className="text-center lg:text-left">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                              ICD Recommendation
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Based on HCM Risk-SCD assessment
                            </p>
                          </div>
                          
                          <div className={`p-8 rounded-3xl border-2 relative overflow-hidden ${
                            result.icdRecommendation === 'not_indicated' 
                              ? 'bg-green-50/80 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                            result.icdRecommendation === 'consider' 
                              ? 'bg-yellow-50/80 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                            result.icdRecommendation === 'reasonable' 
                              ? 'bg-orange-50/80 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' :
                              'bg-red-50/80 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                          }`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current/5 to-transparent rounded-full blur-2xl" />
                            <div className="relative">
                              <div className="flex items-center space-x-4 mb-4">
                                <div className={`p-3 rounded-2xl ${
                                  result.icdRecommendation === 'not_indicated' ? 'bg-green-100 dark:bg-green-900/30' :
                                  result.icdRecommendation === 'consider' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                  result.icdRecommendation === 'reasonable' ? 'bg-orange-100 dark:bg-orange-900/30' :
                                  'bg-red-100 dark:bg-red-900/30'
                                }`}>
                                  <Zap className={`w-8 h-8 ${getICDColor(result.icdRecommendation)}`} />
                                </div>
                                <div>
                                  <div className={`text-2xl font-bold ${getICDColor(result.icdRecommendation)}`}>
                                    {result.icdRecommendation === 'not_indicated' ? 'Not Indicated' :
                                     result.icdRecommendation === 'consider' ? 'Consider' :
                                     result.icdRecommendation === 'reasonable' ? 'Reasonable' :
                                     'Indicated'}
                                  </div>
                                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {result.icdRecommendation === 'consider' ? 'Shared Decision-Making' : 'ICD for Primary Prevention'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {result.interpretation}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 5-Year SCD Risk */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Target className="w-5 h-5 text-red-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.hcm_risk_scd.five_year_risk_title')}</h4>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/30 rounded-2xl border border-red-200 dark:border-red-800">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">{result.fiveYearRisk}%</div>
                        <div className="text-lg text-red-700 dark:text-red-300 mb-3">{t('calculators.hcm_risk_scd.five_year_risk')}</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-red-500 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(result.fiveYearRisk * 4, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ICD Recommendation */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-blue-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.hcm_risk_scd.icd_recommendation_title')}</h4>
                    </div>
                    <div className={`p-6 rounded-2xl border-2 ${
                      result.icdRecommendation === 'not_indicated' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                      result.icdRecommendation === 'consider' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                      result.icdRecommendation === 'reasonable' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' :
                      'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    }`}>
                      <div className="text-center">
                        <div className={`text-2xl font-bold mb-2 ${getICDColor(result.icdRecommendation)}`}>
                          {result.icdRecommendation === 'not_indicated' ? 'Not Indicated' :
                           result.icdRecommendation === 'consider' ? 'Consider (Shared Decision-Making)' :
                           result.icdRecommendation === 'reasonable' ? 'Reasonable' :
                           'Indicated'}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('calculators.hcm_risk_scd.based_on_guidelines')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Revolutionary Risk Stratification Dashboard */}
                  <div className="medical-card p-10 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200/30 dark:border-purple-800/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-full blur-3xl" />
                    <div className="relative">
                      <div className="flex items-center space-x-4 mb-10">
                        <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl shadow-lg">
                          <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                            Risk Stratification Categories
                          </h4>
                          <p className="text-purple-600 dark:text-purple-400">Evidence-based HCM sudden death risk thresholds</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Low Risk Category */}
                        <div className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-500 ${
                          result.riskCategory === 'low' 
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-3 border-green-300 dark:border-green-600 shadow-2xl shadow-green-500/20 scale-105' 
                            : 'bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 border-2 border-green-200/50 dark:border-green-800/50 hover:scale-102'
                        }`}>
                          {result.riskCategory === 'low' && (
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 animate-pulse" />
                          )}
                          <div className="relative">
                            <div className="flex items-center justify-center mb-6">
                              <div className={`p-4 rounded-2xl ${
                                result.riskCategory === 'low' ? 'bg-green-100 dark:bg-green-900/40' : 'bg-green-100/70 dark:bg-green-900/20'
                              }`}>
                                <CheckCircle className={`w-10 h-10 ${
                                  result.riskCategory === 'low' ? 'text-green-600' : 'text-green-500'
                                }`} />
                              </div>
                            </div>
                            <div className="text-center space-y-3">
                              <div className={`text-xl font-bold ${
                                result.riskCategory === 'low' ? 'text-green-700 dark:text-green-300' : 'text-green-600 dark:text-green-400'
                              }`}>
                                Low Risk
                              </div>
                              <div className={`text-2xl font-bold ${
                                result.riskCategory === 'low' ? 'text-green-800 dark:text-green-200' : 'text-green-700 dark:text-green-300'
                              }`}>
                                {'<'} 4%
                              </div>
                              <div className="text-sm text-green-600 dark:text-green-400 leading-relaxed">
                                5-year SCD risk. Routine clinical follow-up recommended.
                              </div>
                              {result.riskCategory === 'low' && (
                                <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 rounded-full px-4 py-2 mt-4">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">Current Category</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Intermediate Risk Category */}
                        <div className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-500 ${
                          result.riskCategory === 'intermediate' 
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-3 border-yellow-300 dark:border-yellow-600 shadow-2xl shadow-yellow-500/20 scale-105' 
                            : 'bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10 border-2 border-yellow-200/50 dark:border-yellow-800/50 hover:scale-102'
                        }`}>
                          {result.riskCategory === 'intermediate' && (
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 animate-pulse" />
                          )}
                          <div className="relative">
                            <div className="flex items-center justify-center mb-6">
                              <div className={`p-4 rounded-2xl ${
                                result.riskCategory === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/40' : 'bg-yellow-100/70 dark:bg-yellow-900/20'
                              }`}>
                                <AlertTriangle className={`w-10 h-10 ${
                                  result.riskCategory === 'intermediate' ? 'text-yellow-600' : 'text-yellow-500'
                                }`} />
                              </div>
                            </div>
                            <div className="text-center space-y-3">
                              <div className={`text-xl font-bold ${
                                result.riskCategory === 'intermediate' ? 'text-yellow-700 dark:text-yellow-300' : 'text-yellow-600 dark:text-yellow-400'
                              }`}>
                                Intermediate Risk
                              </div>
                              <div className={`text-2xl font-bold ${
                                result.riskCategory === 'intermediate' ? 'text-yellow-800 dark:text-yellow-200' : 'text-yellow-700 dark:text-yellow-300'
                              }`}>
                                4-6%
                              </div>
                              <div className="text-sm text-yellow-600 dark:text-yellow-400 leading-relaxed">
                                5-year SCD risk. Consider ICD with shared decision-making.
                              </div>
                              {result.riskCategory === 'intermediate' && (
                                <div className="inline-flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full px-4 py-2 mt-4">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Current Category</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* High Risk Category */}
                        <div className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-500 ${
                          result.riskCategory === 'high' 
                            ? 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-3 border-red-300 dark:border-red-600 shadow-2xl shadow-red-500/20 scale-105' 
                            : 'bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-900/10 dark:to-rose-900/10 border-2 border-red-200/50 dark:border-red-800/50 hover:scale-102'
                        }`}>
                          {result.riskCategory === 'high' && (
                            <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-rose-400/10 animate-pulse" />
                          )}
                          <div className="relative">
                            <div className="flex items-center justify-center mb-6">
                              <div className={`p-4 rounded-2xl ${
                                result.riskCategory === 'high' ? 'bg-red-100 dark:bg-red-900/40' : 'bg-red-100/70 dark:bg-red-900/20'
                              }`}>
                                <AlertCircle className={`w-10 h-10 ${
                                  result.riskCategory === 'high' ? 'text-red-600' : 'text-red-500'
                                }`} />
                              </div>
                            </div>
                            <div className="text-center space-y-3">
                              <div className={`text-xl font-bold ${
                                result.riskCategory === 'high' ? 'text-red-700 dark:text-red-300' : 'text-red-600 dark:text-red-400'
                              }`}>
                                High Risk
                              </div>
                              <div className={`text-2xl font-bold ${
                                result.riskCategory === 'high' ? 'text-red-800 dark:text-red-200' : 'text-red-700 dark:text-red-300'
                              }`}>
                                {'≥'} 6%
                              </div>
                              <div className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
                                5-year SCD risk. ICD implantation is reasonable.
                              </div>
                              {result.riskCategory === 'high' && (
                                <div className="inline-flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 rounded-full px-4 py-2 mt-4">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                  <span className="text-sm font-semibold text-red-700 dark:text-red-300">Current Category</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revolutionary Clinical Management System */}
                  <div className="medical-card p-10 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-200/30 dark:border-indigo-800/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-full blur-3xl" />
                    <div className="relative">
                      <div className="flex items-center space-x-4 mb-10">
                        <div className="p-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl shadow-lg">
                          <Stethoscope className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-transparent">
                            Clinical Management Recommendations
                          </h4>
                          <p className="text-indigo-600 dark:text-indigo-400">Evidence-based treatment pathway for HCM patients</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Primary Recommendations */}
                        <div className="space-y-6">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl shadow-lg">
                              <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="text-xl font-bold text-indigo-800 dark:text-indigo-200">Primary Actions</h5>
                              <p className="text-sm text-indigo-600 dark:text-indigo-400">Immediate clinical priorities</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {result.recommendations.slice(0, Math.ceil(result.recommendations.length / 2)).map((rec, index) => (
                              <div key={index} className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-indigo-200/30 dark:border-indigo-800/30 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">{index + 1}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                                      {rec}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Secondary Recommendations */}
                        <div className="space-y-6">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                              <Layers className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="text-xl font-bold text-blue-800 dark:text-blue-200">Follow-up Care</h5>
                              <p className="text-sm text-blue-600 dark:text-blue-400">Ongoing management strategies</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {result.recommendations.slice(Math.ceil(result.recommendations.length / 2)).map((rec, index) => (
                              <div key={index} className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/30 dark:border-blue-800/30 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">{Math.ceil(result.recommendations.length / 2) + index + 1}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                                      {rec}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <Clock className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Risk-Specific Banner */}
                      <div className={`mt-10 p-6 rounded-3xl border-2 relative overflow-hidden ${
                        result.riskCategory === 'low' ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-800/50' :
                        result.riskCategory === 'intermediate' ? 'bg-gradient-to-r from-yellow-50/80 to-orange-50/80 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200/50 dark:border-yellow-800/50' :
                        'bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-900/20 dark:to-rose-900/20 border-red-200/50 dark:border-red-800/50'
                      }`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current/5 to-transparent rounded-full blur-2xl" />
                        <div className="relative flex items-center space-x-4">
                          <div className={`p-3 rounded-2xl ${
                            result.riskCategory === 'low' ? 'bg-green-100 dark:bg-green-900/30' :
                            result.riskCategory === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            <Shield className={`w-6 h-6 ${
                              result.riskCategory === 'low' ? 'text-green-600' :
                              result.riskCategory === 'intermediate' ? 'text-yellow-600' :
                              'text-red-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className={`text-lg font-bold mb-1 ${
                              result.riskCategory === 'low' ? 'text-green-800 dark:text-green-200' :
                              result.riskCategory === 'intermediate' ? 'text-yellow-800 dark:text-yellow-200' :
                              'text-red-800 dark:text-red-200'
                            }`}>
                              {result.riskCategory === 'low' ? 'Routine Monitoring Protocol' :
                               result.riskCategory === 'intermediate' ? 'Enhanced Surveillance Required' :
                               'Urgent Specialist Consultation'}
                            </div>
                            <div className={`text-sm ${
                              result.riskCategory === 'low' ? 'text-green-700 dark:text-green-300' :
                              result.riskCategory === 'intermediate' ? 'text-yellow-700 dark:text-yellow-300' :
                              'text-red-700 dark:text-red-300'
                            }`}>
                              Risk-stratified care pathway based on {result.fiveYearRisk}% 5-year SCD risk
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revolutionary Algorithm Validation Dashboard */}
                  <div className="medical-card p-10 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200/30 dark:border-emerald-800/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl" />
                    <div className="relative">
                      <div className="flex items-center space-x-4 mb-10">
                        <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                            HCM Risk-SCD Validation Status
                          </h4>
                          <p className="text-emerald-600 dark:text-emerald-400">Clinically validated algorithm with international recognition</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Validation Metrics */}
                        <div className="space-y-6">
                          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 border border-emerald-200/30 dark:border-emerald-800/30">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h5 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">Validation Statistics</h5>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">Algorithm performance metrics</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 dark:text-gray-300">C-Index</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <div className="w-[70%] h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                                  </div>
                                  <span className="text-sm font-bold text-emerald-600">0.70</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Calibration</span>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  <span className="text-sm font-bold text-emerald-600">Excellent</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Cohort Size</span>
                                <span className="text-sm font-bold text-emerald-600">3,675 patients</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 border border-teal-200/30 dark:border-teal-800/30">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl">
                                <Globe className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h5 className="text-lg font-bold text-teal-800 dark:text-teal-200">International Validation</h5>
                                <p className="text-sm text-teal-600 dark:text-teal-400">Multi-center studies worldwide</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-teal-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">European cohorts</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-teal-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">US cohorts</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-teal-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Asian cohorts</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Clinical Guidelines */}
                        <div className="space-y-6">
                          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 border border-blue-200/30 dark:border-blue-800/30">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl">
                                <BookOpen className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h5 className="text-lg font-bold text-blue-800 dark:text-blue-200">Guideline Endorsements</h5>
                                <p className="text-sm text-blue-600 dark:text-blue-400">Professional society recommendations</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">2014 ESC HCM Guidelines</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">2022 ESC VA/SCD Guidelines</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">2020 AHA/ACC HCM Guidelines</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 border border-purple-200/30 dark:border-purple-800/30">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                                <Zap className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h5 className="text-lg font-bold text-purple-800 dark:text-purple-200">Clinical Impact</h5>
                                <p className="text-sm text-purple-600 dark:text-purple-400">Real-world implementation</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 dark:text-gray-300">ICD Decision Support</span>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Clinical Adoption</span>
                                <span className="text-sm font-bold text-purple-600">Worldwide</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Evidence Grade</span>
                                <div className="inline-flex items-center space-x-1 bg-purple-100 dark:bg-purple-900/30 rounded-full px-3 py-1">
                                  <span className="text-sm font-bold text-purple-600">Class I</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Validation Summary Banner */}
                      <div className="mt-10 bg-gradient-to-r from-emerald-100/80 to-teal-100/80 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl p-6 border-2 border-emerald-200/50 dark:border-emerald-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="text-xl font-bold text-emerald-800 dark:text-emerald-200">Clinically Validated Algorithm</div>
                              <div className="text-sm text-emerald-600 dark:text-emerald-400">
                                O'Mahony et al. Model • International Validation • 2024 HCM Guidelines • ICD Decision Support
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">✓</div>
                            <div className="text-sm text-emerald-600 dark:text-emerald-400">Validated</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revolutionary Evidence & Formula Masterpiece */}
                  <div className="medical-card p-10 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-200/30 dark:border-violet-800/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-full blur-3xl" />
                    <div className="relative">
                      <div className="flex items-center space-x-4 mb-10">
                        <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl shadow-lg">
                          <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">
                            Evidence & Formula
                          </h4>
                          <p className="text-violet-600 dark:text-violet-400">Mathematical foundation and clinical validation</p>
                        </div>
                      </div>

                      {/* Formula Architecture */}
                      <div className="space-y-8">
                        {/* Variables & Scoring */}
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-violet-200/50 dark:border-violet-800/50">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl">
                              <Calculator className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="text-xl font-bold text-violet-800 dark:text-violet-200">Variables & Scoring</h5>
                              <p className="text-sm text-violet-600 dark:text-violet-400">O'Mahony algorithm parameters</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {[
                              { title: 'Age at evaluation (years)', desc: 'Continuous variable' },
                              { title: 'Maximum wall thickness (mm)', desc: 'Greatest thickness in anterior septum, posterior septum, lateral wall, and posterior wall of the LV' },
                              { title: 'Left atrial diameter (mm)', desc: 'Determined by M-Mode or 2-D echocardiography in the parasternal long axis plane' },
                              { title: 'Maximal LVOT gradient (mmHg)', desc: 'Peak outflow tract gradients using modified Bernoulli equation: Gradient = 4V²' },
                              { title: 'Family history of SCD', desc: 'First-degree relatives with sudden cardiac death <40 years or family history of HCM with SCD' },
                              { title: 'Non-sustained ventricular tachycardia', desc: '≥3 consecutive ventricular beats at rate ≥120 bpm on 24-48h Holter monitoring' },
                              { title: 'Unexplained syncope', desc: 'Syncope not explained by neurally mediated syncope, orthostatic hypotension, or arrhythmia' }
                            ].map((variable, index) => (
                              <div key={index} className="group p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl border border-violet-200/30 dark:border-violet-800/30 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">{index + 1}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-violet-800 dark:text-violet-200 mb-2">{variable.title}</div>
                                    <div className="text-sm text-violet-600 dark:text-violet-400 leading-relaxed">{variable.desc}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Formula Display */}
                        <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-gradient-to-r from-slate-600 to-gray-600 rounded-2xl">
                              <Lightbulb className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="text-xl font-bold text-slate-800 dark:text-slate-200">Mathematical Formula</h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Prognostic index and risk calculation</p>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                              <div className="flex items-center space-x-2 mb-4">
                                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                                <div className="font-bold text-slate-800 dark:text-slate-200">Prognostic Index Formula</div>
                              </div>
                              <div className="font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                                <div className="mb-2">PI = 0.15939858×(Wall thickness) – 0.00294271×(Wall thickness)²</div>
                                <div className="mb-2">+ 0.0259082×(LA diameter) + 0.00446131×(LVOT gradient)</div>
                                <div className="mb-2">+ 0.4583082×(Family history) + 0.82639195×(NSVT)</div>
                                <div>+ 0.71650361×(Syncope) – 0.01799934×(Age)</div>
                              </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                              <div className="flex items-center space-x-2 mb-4">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="font-bold text-slate-800 dark:text-slate-200">5-Year SCD Risk Formula</div>
                              </div>
                              <div className="font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                                p̂SCD at 5 years = 1 – 0.998^exp(Prognostic Index)
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revolutionary Literature Database */}
                  <div className="medical-card p-10 bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-900/20 dark:to-gray-900/20 border-2 border-slate-200/30 dark:border-slate-800/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-slate-500/5 to-gray-500/5 rounded-full blur-3xl" />
                    <div className="relative">
                      <div className="flex items-center space-x-4 mb-10">
                        <div className="p-4 bg-gradient-to-r from-slate-600 to-gray-600 rounded-2xl shadow-lg">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
                            Literature & References
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400">Comprehensive scientific evidence base</p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {/* Original Reference */}
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-200/50 dark:border-blue-800/50">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl">
                              <Star className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="text-xl font-bold text-blue-800 dark:text-blue-200">Original/Primary Reference</h5>
                              <p className="text-sm text-blue-600 dark:text-blue-400">Landmark publication establishing the algorithm</p>
                            </div>
                          </div>
                          <div className="p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/30 dark:border-blue-800/30">
                            <div className="font-bold text-blue-800 dark:text-blue-200 mb-2">O'Mahony C, Jichi F, Pavlou M, et al.</div>
                            <div className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                              A novel clinical risk prediction model for sudden cardiac death in hypertrophic cardiomyopathy (HCM risk-SCD). <em>European Heart Journal</em>. 2014;35(30):2010-2020.
                            </div>
                            <div className="flex items-center space-x-4 mt-4">
                              <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">3,675 patients</span>
                              </div>
                              <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2">
                                <Globe className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Multi-center</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Validation Studies */}
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-green-200/50 dark:border-green-800/50">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="text-xl font-bold text-green-800 dark:text-green-200">International Validation Studies</h5>
                              <p className="text-sm text-green-600 dark:text-green-400">Independent external validation across populations</p>
                            </div>
                          </div>
                          <div className="space-y-6">
                            {[
                              {
                                authors: 'Vriesendorp PA, Schinkel AFL, Liebregts M, et al.',
                                title: 'Validation of the 2014 European Society of Cardiology guidelines risk prediction model for the primary prevention of sudden cardiac death in hypertrophic cardiomyopathy.',
                                journal: 'Circ Arrhythm Electrophysiol. 2015;8(4):829-835.',
                                type: 'European Validation'
                              },
                              {
                                authors: 'O\'Mahony C, Jichi F, Ommen SR, et al.',
                                title: 'International external validation study of the 2014 European Society of Cardiology guidelines on sudden cardiac death prevention in hypertrophic cardiomyopathy (Evidence-HCM).',
                                journal: 'Circulation. 2018;137(10):1015-1023.',
                                type: 'Global Validation'
                              }
                            ].map((study, index) => (
                              <div key={index} className="p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/30 dark:border-green-800/30">
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">{index + 1}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <div className="inline-flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 rounded-full px-3 py-1">
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                        <span className="text-xs font-semibold text-green-700 dark:text-green-300">{study.type}</span>
                                      </div>
                                    </div>
                                    <div className="font-bold text-green-800 dark:text-green-200 mb-2">{study.authors}</div>
                                    <div className="text-sm text-green-700 dark:text-green-300 leading-relaxed mb-2">{study.title}</div>
                                    <div className="text-sm text-green-600 dark:text-green-400 italic">{study.journal}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Guidelines & Contemporary References */}
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-orange-200/50 dark:border-orange-800/50">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="text-xl font-bold text-orange-800 dark:text-orange-200">Guidelines & Contemporary References</h5>
                              <p className="text-sm text-orange-600 dark:text-orange-400">Professional society endorsements and recent developments</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {[
                              {
                                authors: 'Zeppenfeld K, Tfelt-Hansen J, de Riva M, et al.',
                                title: '2022 ESC Guidelines for the management of patients with ventricular arrhythmias and the prevention of sudden cardiac death.',
                                journal: 'Eur Heart J. 2022;43(40):3997-4126.',
                                type: 'ESC Guidelines'
                              },
                              {
                                authors: 'Elliott PM, Anastasakis A, et al.',
                                title: '2014 ESC guidelines on diagnosis and management of hypertrophic cardiomyopathy.',
                                journal: 'Eur Heart J. 2014;35(39):2733-2779.',
                                type: 'HCM Guidelines'
                              },
                              {
                                authors: 'Monda E, Limongelli G.',
                                title: 'Integrated sudden cardiac death risk prediction model for patients with hypertrophic cardiomyopathy.',
                                journal: 'Circulation. 2023;147(4):281-283.',
                                type: 'Recent Commentary'
                              }
                            ].map((ref, index) => (
                              <div key={index} className="p-6 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200/30 dark:border-orange-800/30">
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">{index + 1}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <div className="inline-flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 rounded-full px-3 py-1">
                                        <FileText className="w-3 h-3 text-orange-600" />
                                        <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">{ref.type}</span>
                                      </div>
                                    </div>
                                    <div className="font-bold text-orange-800 dark:text-orange-200 mb-2">{ref.authors}</div>
                                    <div className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed mb-2">{ref.title}</div>
                                    <div className="text-sm text-orange-600 dark:text-orange-400 italic">{ref.journal}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revolutionary Dr. Constantinos O'Mahony Profile */}
                  <div className="medical-card p-10 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/20 border-2 border-cyan-200/30 dark:border-cyan-800/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
                    <div className="relative">
                      <div className="flex items-center space-x-4 mb-10">
                        <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-lg">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
                            Dr. Constantinos O'Mahony
                          </h4>
                          <p className="text-cyan-600 dark:text-cyan-400">Principal Investigator & HCM Risk-SCD Algorithm Creator</p>
                        </div>
                      </div>

                      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-cyan-200/50 dark:border-cyan-800/50">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Profile Overview */}
                          <div className="lg:col-span-2 space-y-6">
                            <div className="p-6 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl border border-cyan-200/30 dark:border-cyan-800/30">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <h5 className="text-lg font-bold text-cyan-800 dark:text-cyan-200">Clinical Background</h5>
                              </div>
                              <div className="text-sm text-cyan-700 dark:text-cyan-300 leading-relaxed space-y-3">
                                <p>
                                  Dr. Constantinos O'Mahony is a renowned consultant cardiologist and leading expert in hypertrophic cardiomyopathy (HCM) at St. Bartholomew's Hospital, London. He has dedicated his career to advancing the understanding and management of inherited cardiac conditions.
                                </p>
                                <p>
                                  His groundbreaking research on sudden cardiac death risk stratification in HCM has transformed clinical practice worldwide, providing clinicians with evidence-based tools for ICD decision-making and patient counseling.
                                </p>
                              </div>
                            </div>

                            <div className="p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/30 dark:border-blue-800/30">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                                  <Award className="w-5 h-5 text-white" />
                                </div>
                                <h5 className="text-lg font-bold text-blue-800 dark:text-blue-200">Research Contributions</h5>
                              </div>
                              <div className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                <p>
                                  Dr. O'Mahony's research has focused on developing and validating clinical risk prediction models for sudden cardiac death in HCM. His work has been instrumental in establishing evidence-based guidelines for ICD implantation and has been adopted internationally by major cardiology societies.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Academic Metrics */}
                          <div className="space-y-6">
                            <div className="p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/30 dark:border-purple-800/30">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                                  <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <h5 className="text-lg font-bold text-purple-800 dark:text-purple-200">Academic Impact</h5>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-purple-700 dark:text-purple-300">Publications</span>
                                  <span className="text-sm font-bold text-purple-600">100+</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-purple-700 dark:text-purple-300">Citations</span>
                                  <span className="text-sm font-bold text-purple-600">5,000+</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-purple-700 dark:text-purple-300">H-Index</span>
                                  <span className="text-sm font-bold text-purple-600">35+</span>
                                </div>
                              </div>
                            </div>

                            <div className="p-6 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/30 dark:border-green-800/30">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                                  <Globe className="w-5 h-5 text-white" />
                                </div>
                                <h5 className="text-lg font-bold text-green-800 dark:text-green-200">Global Recognition</h5>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-700 dark:text-green-300">ESC Guidelines Author</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-700 dark:text-green-300">International Speaker</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-700 dark:text-green-300">Research Collaborator</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Publications Link */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-cyan-100/80 to-blue-100/80 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl border border-cyan-200/50 dark:border-cyan-800/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl">
                                <FileText className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="text-lg font-bold text-cyan-800 dark:text-cyan-200">Complete Publication List</div>
                                <div className="text-sm text-cyan-600 dark:text-cyan-400">Access full bibliography and research contributions</div>
                              </div>
                            </div>
                            <a 
                              href="https://pubmed.ncbi.nlm.nih.gov/?term=o%27mahony+constantinos%5Bauthor%5D" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                            >
                              <span>View Publications</span>
                              <ArrowRight className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <CalculatorButton
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  icon={Calculator}
                >
                  {t('calculators.reset')}
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => setResult(null)}
                  variant="secondary"
                  size="lg"
                >
                  {t('calculators.hcm_risk_scd.modify_inputs')}
                </CalculatorButton>
              </div>
            </div>
          )
        )}

        {/* Footer Information */}
        <div className="text-center pt-8 border-t border-white/20 dark:border-gray-800/20">
          <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
            <Info className="w-4 h-4" />
            <span>Based on HCM Risk-SCD by O'Mahony et al. • For educational purposes only</span>
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-red-600" />
              <span className="text-red-600 font-semibold">International Validation</span>
            </div>
          </div>
        </div>
      </div>
    </CalculatorContainer>
      );
}; 