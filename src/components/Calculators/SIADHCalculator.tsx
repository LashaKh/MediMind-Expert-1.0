import React, { useState, useEffect, useMemo } from 'react';
import { Droplets, Info, CheckCircle, AlertTriangle, Calculator, Stethoscope, Heart, Activity, Brain, Target, TrendingUp, FlaskConical, Award, Clock, Users, BarChart3, Zap, Sparkles, Shield, Star, LucideIcon } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  CalculatorContainer, 
  CalculatorInput, 
  CalculatorSelect, 
  CalculatorCheckbox, 
  CalculatorButton, 
  ResultsDisplay 
} from '../ui/calculator-ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface SIADHFormData {
  // Essential criteria
  effectiveSerumOsmolality: boolean;
  urineOsmolality: boolean;
  noVolumeEvidence: boolean;
  urineSodium: boolean;
  noEndocrineDeficiency: boolean;
  noDiureticsRecent: boolean;
  
  // Supplemental criteria
  serumUricAcid: boolean;
  serumUrea: boolean;
  failureSalineCorrection: boolean;
  fractionalSodiumExcretion: boolean;
  fractionalUreaExcretion: boolean;
  fractionalUricAcidExcretion: boolean;
  correctionFluidRestriction: boolean;
}

interface SIADHResult {
  score: number;
  essentialCriteriaMet: boolean;
  supplementalPoints: number;
  interpretation: 'met' | 'not-met';
  recommendation: string;
  clinicalActions: string[];
  riskLevel: 'low' | 'intermediate' | 'high';
}

// Premium animated checkbox component
const PremiumCheckbox: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: LucideIcon;
  type: 'essential' | 'supplemental';
}> = ({ label, description, checked, onChange, icon: Icon, type }) => {
  return (
    <div className="group relative">
      <div className={`
        relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ease-out
        ${checked 
          ? type === 'essential' 
            ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border-2 border-blue-300 dark:border-blue-600 shadow-xl shadow-blue-200/50 dark:shadow-blue-900/30' 
            : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/30 dark:via-green-900/30 dark:to-teal-900/30 border-2 border-emerald-300 dark:border-emerald-600 shadow-xl shadow-emerald-200/50 dark:shadow-emerald-900/30'
          : 'bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-gray-50/90 dark:hover:bg-gray-700/90 hover:border-gray-300 dark:hover:border-gray-600'
        }
        backdrop-blur-sm cursor-pointer transform hover:scale-[1.02] hover:shadow-lg
      `}
      onClick={() => onChange(!checked)}
      >
        {/* Animated background gradient */}
        <div className={`
          absolute inset-0 opacity-0 transition-opacity duration-500
          ${checked ? 'opacity-100' : 'opacity-0'}
          ${type === 'essential' 
            ? 'bg-gradient-to-r from-blue-400/10 via-indigo-400/10 to-purple-400/10' 
            : 'bg-gradient-to-r from-emerald-400/10 via-green-400/10 to-teal-400/10'
          }
        `} />
        
        <div className="relative flex items-start space-x-4">
          {/* Custom checkbox with animation */}
          <div className={`
            relative flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-300
            ${checked 
              ? type === 'essential'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-500 shadow-lg shadow-blue-500/30'
                : 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-500 shadow-lg shadow-emerald-500/30'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
            }
          `}>
            {checked && (
              <CheckCircle className="w-4 h-4 text-white absolute inset-0.5 animate-in zoom-in-50 duration-200" />
            )}
          </div>
          
          {/* Icon with animation */}
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
            ${checked 
              ? type === 'essential'
                ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-800/50 text-blue-600 dark:text-blue-400 shadow-lg'
                : 'bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-800/50 dark:to-green-800/50 text-emerald-600 dark:text-emerald-400 shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }
          `}>
            <Icon className={`w-6 h-6 transition-transform duration-300 ${checked ? 'scale-110' : 'scale-100'}`} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`
              text-lg font-semibold transition-colors duration-300 leading-tight mb-2
              ${checked 
                ? type === 'essential'
                  ? 'text-blue-900 dark:text-blue-100'
                  : 'text-emerald-900 dark:text-emerald-100'
                : 'text-gray-900 dark:text-gray-100'
              }
            `}>
              {label}
            </h4>
            <p className={`
              text-sm transition-colors duration-300
              ${checked 
                ? type === 'essential'
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-emerald-700 dark:text-emerald-300'
                : 'text-gray-600 dark:text-gray-400'
              }
            `}>
              {description}
            </p>
          </div>
          
          {/* Points indicator */}
          <div className={`
            flex-shrink-0 w-12 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300
            ${checked 
              ? type === 'essential'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }
          `}>
            {type === 'essential' ? '+8' : '+1'}
          </div>
        </div>
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </div>
      </div>
    </div>
  );
};

// Premium animated score display
const PremiumScoreDisplay: React.FC<{
  title: string;
  value: number;
  maxValue?: number;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
  subtitle?: string;
  animate?: boolean;
}> = ({ title, value, maxValue, color, subtitle, animate = true }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (animate) {
      const duration = 1000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animate]);
  
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-600 shadow-blue-500/30',
    emerald: 'from-emerald-500 to-green-600 shadow-emerald-500/30',
    purple: 'from-purple-500 to-violet-600 shadow-purple-500/30',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/30'
  };
  
  return (
    <div className="relative group">
      <div className={`
        relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-500
        bg-gradient-to-br ${colorClasses[color]} shadow-xl backdrop-blur-sm
        hover:shadow-2xl hover:scale-105 transform
      `}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 animate-pulse" />
        </div>
        
        <div className="relative z-10">
          <div className="text-4xl font-bold text-white mb-2 font-mono tracking-tight">
            {displayValue}
            {maxValue && <span className="text-2xl opacity-75">/{maxValue}</span>}
          </div>
          <div className="text-white/90 font-semibold text-sm uppercase tracking-wider">
            {title}
          </div>
          {subtitle && (
            <div className="text-white/70 text-xs mt-1">
              {subtitle}
            </div>
          )}
        </div>
        
        {/* Progress bar if maxValue provided */}
        {maxValue && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-white/60 transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((value / maxValue) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const SIADHCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'calculator' | 'about'>('calculator');
  const [formData, setFormData] = useState<SIADHFormData>({
    // Essential criteria
    effectiveSerumOsmolality: false,
    urineOsmolality: false,
    noVolumeEvidence: false,
    urineSodium: false,
    noEndocrineDeficiency: false,
    noDiureticsRecent: false,
    
    // Supplemental criteria
    serumUricAcid: false,
    serumUrea: false,
    failureSalineCorrection: false,
    fractionalSodiumExcretion: false,
    fractionalUreaExcretion: false,
    fractionalUricAcidExcretion: false,
    correctionFluidRestriction: false,
  });
  
  const [result, setResult] = useState<SIADHResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Monitor state changes with useEffect
  useEffect(() => {
    
    // Real-time scoring check
    const essentialCriteria = [
      formData.effectiveSerumOsmolality,
      formData.urineOsmolality,
      formData.noVolumeEvidence,
      formData.urineSodium,
      formData.noEndocrineDeficiency,
      formData.noDiureticsRecent
    ];
    
    const supplementalCriteria = [
      formData.serumUricAcid,
      formData.serumUrea,
      formData.failureSalineCorrection,
      formData.fractionalSodiumExcretion,
      formData.fractionalUreaExcretion,
      formData.fractionalUricAcidExcretion,
      formData.correctionFluidRestriction
    ];
    
    const essentialCount = essentialCriteria.filter(c => c).length;
    const essentialMet = essentialCriteria.every(c => c);
    const essentialPoints = essentialCount * 8; // Each essential criterion worth 8 points
    const supplementalCount = supplementalCriteria.filter(c => c).length;
    const totalScore = essentialPoints + supplementalCount;
    
  }, [formData]);

  // Debug function to track state changes
  const updateFormData = (field: keyof SIADHFormData, value: boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Force a small delay to ensure state update completes
      setTimeout(() => {
        // Force refresh if needed
        setRefreshCounter(counter => counter + 1);
      }, 10);
      
      return newData;
    });
  };

  const calculateSIADH = (): SIADHResult => {
    // Check if ALL essential criteria are met
    const essentialCriteria = [
      formData.effectiveSerumOsmolality,
      formData.urineOsmolality,
      formData.noVolumeEvidence,
      formData.urineSodium,
      formData.noEndocrineDeficiency,
      formData.noDiureticsRecent
    ];

    // Count how many essential criteria are met (each worth 8 points)
    const essentialCriteriaCount = essentialCriteria.filter(criterion => criterion === true).length;
    const essentialPoints = essentialCriteriaCount * 8;
    const essentialCriteriaMet = essentialCriteria.every(criterion => criterion === true);
    
    // Count supplemental criteria
    const supplementalCriteria = [
      formData.serumUricAcid,
      formData.serumUrea,
      formData.failureSalineCorrection,
      formData.fractionalSodiumExcretion,
      formData.fractionalUreaExcretion,
      formData.fractionalUricAcidExcretion,
      formData.correctionFluidRestriction
    ];
    
    const supplementalPoints = supplementalCriteria.filter(criterion => criterion === true).length;
    
    // Calculate total score
    const score = essentialPoints + supplementalPoints;
    
    // Determine interpretation
    const interpretation: 'met' | 'not-met' = score >= 8 ? 'met' : 'not-met';
    
    let recommendation: string;
    let clinicalActions: string[];
    let riskLevel: 'low' | 'intermediate' | 'high';
    
    if (interpretation === 'met') {
      recommendation = 'Meets criteria for possible SIADH. Consider further evaluation and specific treatment for SIADH.';
      clinicalActions = [
        'Confirm diagnosis with additional testing if needed',
        'Initiate fluid restriction (800-1000 mL/day initially)',
        'Consider vasopressin receptor antagonists (vaptans) if appropriate',
        'Monitor serum sodium levels closely',
        'Investigate underlying causes (malignancy, CNS disorders, medications)',
        'Consider specialist endocrinology consultation'
      ];
      riskLevel = score >= 12 ? 'high' : 'intermediate';
    } else {
      recommendation = 'Criteria not met for SIADH diagnosis. Consider alternative causes of hyponatremia.';
      clinicalActions = [
        'Evaluate other causes of hyponatremia',
        'Consider volume status assessment',
        'Review medications for potential causes',
        'Assess renal, adrenal, and thyroid function',
        'Consider diuretic use or other sodium-wasting conditions',
        'Re-evaluate if clinical picture changes'
      ];
      riskLevel = 'low';
    }
    
    return {
      score,
      essentialCriteriaMet,
      supplementalPoints,
      interpretation,
      recommendation,
      clinicalActions,
      riskLevel
    };
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const calculatedResult = calculateSIADH();
      setResult(calculatedResult);
      setShowResult(true);
      setIsCalculating(false);
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      // Essential criteria
      effectiveSerumOsmolality: false,
      urineOsmolality: false,
      noVolumeEvidence: false,
      urineSodium: false,
      noEndocrineDeficiency: false,
      noDiureticsRecent: false,
      
      // Supplemental criteria
      serumUricAcid: false,
      serumUrea: false,
      failureSalineCorrection: false,
      fractionalSodiumExcretion: false,
      fractionalUreaExcretion: false,
      fractionalUricAcidExcretion: false,
      correctionFluidRestriction: false,
    });
    setResult(null);
    setShowResult(false);
  };

  // Memoized real-time calculations to ensure proper recalculation
  const essentialCriteriaCount = useMemo(() => {
    const essentialCriteria = [
      formData.effectiveSerumOsmolality,
      formData.urineOsmolality,
      formData.noVolumeEvidence,
      formData.urineSodium,
      formData.noEndocrineDeficiency,
      formData.noDiureticsRecent
    ];
    const count = essentialCriteria.filter(c => c).length;
    return count;
  }, [formData, refreshCounter]);

  const essentialCriteriaMet = useMemo(() => {
    const essentialCriteria = [
      formData.effectiveSerumOsmolality,
      formData.urineOsmolality,
      formData.noVolumeEvidence,
      formData.urineSodium,
      formData.noEndocrineDeficiency,
      formData.noDiureticsRecent
    ];
    const allMet = essentialCriteria.every(c => c);
    return allMet;
  }, [formData, refreshCounter]);

  const essentialPoints = useMemo(() => {
    const points = essentialCriteriaCount * 8;
    return points;
  }, [essentialCriteriaCount, refreshCounter]);

  const supplementalPoints = useMemo(() => {
    const supplementalCriteria = [
      formData.serumUricAcid,
      formData.serumUrea,
      formData.failureSalineCorrection,
      formData.fractionalSodiumExcretion,
      formData.fractionalUreaExcretion,
      formData.fractionalUricAcidExcretion,
      formData.correctionFluidRestriction
    ];
    const points = supplementalCriteria.filter(c => c).length;
    return points;
  }, [formData, refreshCounter]);

  const totalScore = useMemo(() => {
    const score = essentialPoints + supplementalPoints;
    return score;
  }, [essentialPoints, supplementalPoints, refreshCounter]);

  const renderAboutTab = () => (
    <div className="space-y-8">
      {/* Hero section with glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/50 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-indigo-400/5 to-purple-400/5" />
        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SIADH Diagnostic Criteria
              </h2>
              <p className="text-blue-700 dark:text-blue-300 text-lg">
                Advanced Clinical Assessment Tool
              </p>
            </div>
          </div>
          
          <div className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed space-y-4">
            <p>
              The Diagnostic Criteria for Syndrome of Inappropriate Antidiuretic Hormone Secretion (SIADH) is a clinical tool designed to aid in the diagnosis of SIADH, a condition characterized by excessive release of antidiuretic hormone from the posterior pituitary gland or other sources. The criteria are primarily used to identify patients with hyponatremia, a common electrolyte disorder, who may have SIADH as the underlying cause.
            </p>
            
            <p>
              The diagnostic criteria consist of essential and supplemental components. The essential criteria include effective serum osmolality less than 275 mOsm/kg, urine osmolality greater than 100 mOsm/kg, absence of clinical evidence of hypovolemia or hypervolemia, urine sodium concentration greater than 30 mmol/L with normal dietary salt and water intake, absence of adrenal, thyroid, pituitary or renal insufficiency, and no recent use of diuretic agents.
            </p>
            
            <p>
              The supplemental criteria, which provide additional diagnostic support, include serum uric acid less than 0.24 mmol/L, serum urea less than 3.6 mmol/L, failure to correct hyponatremia after 0.9% saline infusion, fractional sodium excretion greater than 0.5%, fractional urea excretion greater than 55%, fractional uric acid excretion greater than 12%, and correction of hyponatremia through fluid restriction.
            </p>
            
            <p>
              The Diagnostic Criteria for SIADH is a comprehensive tool that incorporates a wide range of clinical and laboratory parameters, providing a robust framework for the diagnosis of this complex disorder.
            </p>
          </div>
        </div>
      </div>

      {/* Scoring system cards */}
      <div className="grid xl:grid-cols-2 gap-4 sm:gap-6">
        <Card className="relative overflow-hidden border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-blue-800 dark:text-blue-200">
              <Shield className="w-6 h-6" />
              <span>Essential Criteria</span>
              <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-bold">
                8 pts each
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <p className="text-base">
              Each essential criterion checked adds <strong>8 points</strong> to the total score.
            </p>
            <div className="bg-blue-100/50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Maximum Score</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">48 points</div>
              <div className="text-blue-600 dark:text-blue-400">6 criteria × 8 points each</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-emerald-200/50 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-emerald-800 dark:text-emerald-200">
              <Star className="w-6 h-6" />
              <span>Supplemental Criteria</span>
              <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm font-bold">
                1 pt each
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <p className="text-base">
              Each supplemental criterion adds <strong>1 point</strong> and provides additional diagnostic support.
            </p>
            <div className="bg-emerald-100/50 dark:bg-emerald-900/20 rounded-xl p-4">
              <div className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Maximum Score</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">7 points</div>
              <div className="text-emerald-600 dark:text-emerald-400">7 criteria × 1 point each</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interpretation guidelines */}
      <Card className="border-amber-200/50 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-amber-800 dark:text-amber-200">
            <Award className="w-6 h-6" />
            <span>Clinical Interpretation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid xl:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-green-800 dark:text-green-200">≥8 points</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Meets criteria for possible SIADH</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-red-800 dark:text-red-200">&lt;8 points</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Criteria not met</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">55</div>
              <div className="text-purple-700 dark:text-purple-300 font-semibold">Maximum Total Score</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">48 essential + 7 supplemental</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCalculatorTab = () => (
    <div className="space-y-8">
      {/* Header with real-time scoring */}
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-indigo-400/20 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              SIADH Diagnostic Calculator
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Advanced clinical assessment tool for diagnosing Syndrome of Inappropriate Antidiuretic Hormone Secretion
            </p>
          </div>
        </div>
        
        {/* Real-time score dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumScoreDisplay
            title="Essential"
            value={essentialCriteriaCount}
            maxValue={6}
            color="blue"
            subtitle="criteria checked"
          />
          <PremiumScoreDisplay
            title="Essential Points"
            value={essentialPoints}
            maxValue={48}
            color="purple"
            subtitle={`${essentialCriteriaCount} × 8 points`}
          />
          <PremiumScoreDisplay
            title="Supplemental"
            value={supplementalPoints}
            maxValue={7}
            color="emerald"
            subtitle="additional points"
          />
          <PremiumScoreDisplay
            title="Total Score"
            value={totalScore}
            maxValue={55}
            color={totalScore >= 8 ? 'emerald' : 'amber'}
            subtitle={totalScore >= 8 ? 'Criteria met!' : 'Need ≥8 points'}
          />
        </div>
      </div>

      {/* Essential Criteria Section */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Essential Criteria</h2>
              <p className="text-blue-600 dark:text-blue-400 font-medium">Each criterion worth 8 points</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-blue-500 text-white font-bold text-lg shadow-lg">
              {essentialPoints}/48
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <PremiumCheckbox
            label="Effective serum osmolality < 275 mOsm/kg"
            description="Low serum osmolality indicating dilutional hyponatremia"
            checked={formData.effectiveSerumOsmolality}
            onChange={(checked) => updateFormData('effectiveSerumOsmolality', checked)}
            icon={FlaskConical}
            type="essential"
          />

          <PremiumCheckbox
            label="Urine osmolality > 100 mOsm/kg"
            description="Inappropriately concentrated urine relative to serum osmolality"
            checked={formData.urineOsmolality}
            onChange={(checked) => updateFormData('urineOsmolality', checked)}
            icon={Droplets}
            type="essential"
          />

          <PremiumCheckbox
            label="No clinical evidence of hypovolemia or hypervolemia"
            description="Euvolemic state with normal volume status"
            checked={formData.noVolumeEvidence}
            onChange={(checked) => updateFormData('noVolumeEvidence', checked)}
            icon={Heart}
            type="essential"
          />

          <PremiumCheckbox
            label="Urine sodium concentration > 30 mmol/L"
            description="With normal dietary salt and water intake"
            checked={formData.urineSodium}
            onChange={(checked) => updateFormData('urineSodium', checked)}
            icon={Target}
            type="essential"
          />

          <PremiumCheckbox
            label="Absence of adrenal, thyroid, pituitary or renal insufficiency"
            description="No hormonal deficiencies that could cause hyponatremia"
            checked={formData.noEndocrineDeficiency}
            onChange={(checked) => updateFormData('noEndocrineDeficiency', checked)}
            icon={Brain}
            type="essential"
          />

          <PremiumCheckbox
            label="No recent use of diuretic agents"
            description="Excludes diuretic-induced hyponatremia"
            checked={formData.noDiureticsRecent}
            onChange={(checked) => updateFormData('noDiureticsRecent', checked)}
            icon={Activity}
            type="essential"
          />
        </div>
      </div>

      {/* Supplemental Criteria Section */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 backdrop-blur-sm rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Supplemental Criteria</h2>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium">Each criterion worth 1 point</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-lg shadow-lg">
              {supplementalPoints}/7
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <PremiumCheckbox
            label="Serum uric acid < 0.24 mmol/L (< 4 mg/dL)"
            description="Low uric acid supports SIADH diagnosis"
            checked={formData.serumUricAcid}
            onChange={(checked) => updateFormData('serumUricAcid', checked)}
            icon={FlaskConical}
            type="supplemental"
          />

          <PremiumCheckbox
            label="Serum urea < 3.6 mmol/L (< 21.6 mg/dL)"
            description="Low BUN consistent with volume expansion"
            checked={formData.serumUrea}
            onChange={(checked) => updateFormData('serumUrea', checked)}
            icon={BarChart3}
            type="supplemental"
          />

          <PremiumCheckbox
            label="Failure to correct hyponatremia after 0.9% saline infusion"
            description="Distinguishes from volume depletion"
            checked={formData.failureSalineCorrection}
            onChange={(checked) => updateFormData('failureSalineCorrection', checked)}
            icon={Droplets}
            type="supplemental"
          />

          <PremiumCheckbox
            label="Fractional sodium excretion > 0.5%"
            description="Indicates continued sodium wasting"
            checked={formData.fractionalSodiumExcretion}
            onChange={(checked) => updateFormData('fractionalSodiumExcretion', checked)}
            icon={TrendingUp}
            type="supplemental"
          />

          <PremiumCheckbox
            label="Fractional urea excretion > 55%"
            description="High fractional excretion of urea"
            checked={formData.fractionalUreaExcretion}
            onChange={(checked) => updateFormData('fractionalUreaExcretion', checked)}
            icon={Activity}
            type="supplemental"
          />

          <PremiumCheckbox
            label="Fractional uric acid excretion > 12%"
            description="Increased renal uric acid clearance"
            checked={formData.fractionalUricAcidExcretion}
            onChange={(checked) => updateFormData('fractionalUricAcidExcretion', checked)}
            icon={Target}
            type="supplemental"
          />

          <PremiumCheckbox
            label="Correction of hyponatremia through fluid restriction"
            description="Therapeutic response confirms diagnosis"
            checked={formData.correctionFluidRestriction}
            onChange={(checked) => updateFormData('correctionFluidRestriction', checked)}
            icon={Clock}
            type="supplemental"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center space-x-6">
        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className={`
            group relative overflow-hidden px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300
            ${isCalculating 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105'
            }
            text-white
          `}
        >
          <div className="relative flex items-center space-x-3">
            {isCalculating ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Calculator className="w-6 h-6" />
            )}
            <span>{isCalculating ? 'Calculating...' : 'Calculate SIADH Score'}</span>
          </div>
          
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
        
        <button
          onClick={handleReset}
          className="group relative overflow-hidden px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transform hover:scale-105"
        >
          <div className="relative flex items-center space-x-3">
            <Zap className="w-6 h-6" />
            <span>Reset</span>
          </div>
        </button>
      </div>

      {/* Results Section */}
      {showResult && result && (
        <div className="space-y-8">
          {/* Results header */}
          <div className="text-center">
            <div className={`
              inline-flex items-center space-x-4 px-8 py-4 rounded-2xl backdrop-blur-sm border-2
              ${result.interpretation === 'met'
                ? 'bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-300 dark:border-green-700'
                : 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-300 dark:border-amber-700'
              }
            `}>
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl
                ${result.interpretation === 'met'
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-amber-500 to-orange-600'
                }
              `}>
                {result.interpretation === 'met' ? (
                  <CheckCircle className="w-8 h-8 text-white" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="text-left">
                <div className={`
                  text-3xl font-bold
                  ${result.interpretation === 'met'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-amber-700 dark:text-amber-300'
                  }
                `}>
                  {result.interpretation === 'met' ? 'Criteria Met' : 'Criteria Not Met'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Total Score: {result.score}/55 points
                </div>
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <PremiumScoreDisplay
              title="Total Score"
              value={result.score}
              maxValue={55}
              color={result.interpretation === 'met' ? 'emerald' : 'amber'}
              subtitle="out of 55 points"
              animate={true}
            />
            <PremiumScoreDisplay
              title="Essential Points"
              value={essentialPoints}
              maxValue={48}
              color="blue"
              subtitle={`${essentialCriteriaCount} × 8 each`}
              animate={true}
            />
            <PremiumScoreDisplay
              title="Supplemental Points"
              value={result.supplementalPoints}
              maxValue={7}
              color="purple"
              subtitle="additional support"
              animate={true}
            />
          </div>

          {/* Clinical actions */}
          <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-900/50 dark:to-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-slate-800 dark:text-slate-200">
                <Stethoscope className="w-6 h-6" />
                <span>Clinical Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Clinical Interpretation</h4>
                  <p className="text-slate-700 dark:text-slate-300">{result.recommendation}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Recommended Actions</span>
                  </h4>
                  <div className="grid gap-3">
                    {result.clinicalActions.map((action, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );

  return (
    <div style={{ transform: 'scale(0.805)', transformOrigin: 'top' }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Premium tab system */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`
                flex items-center space-x-3 px-8 py-3 rounded-xl transition-all duration-300
                ${activeTab === 'calculator'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }
              `}
            >
              <Calculator className="w-5 h-5" />
              <span className="font-semibold">Calculator</span>
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`
                flex items-center space-x-3 px-8 py-3 rounded-xl transition-all duration-300
                ${activeTab === 'about'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }
              `}
            >
              <Info className="w-5 h-5" />
              <span className="font-semibold">About</span>
            </button>
          </div>
        </div>

        {activeTab === 'calculator' && renderCalculatorTab()}
        {activeTab === 'about' && renderAboutTab()}
      </div>
      </div>
    </div>
  );
}; 