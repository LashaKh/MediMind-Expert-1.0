import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Calculator, Info, Zap, AlertTriangle, Clock, Activity, Heart, User, FileText, AlertCircle, Target, Stethoscope, Pill, Award, TrendingUp, BarChart3, Shield, ArrowRight, ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react';
import { 
  CalculatorContainer, 
  CalculatorInput, 
  CalculatorSelect, 
  CalculatorCheckbox, 
  CalculatorButton, 
  ResultsDisplay 
} from '../ui/calculator-ui';

interface TIMIFormData {
  age: string;
  coronaryRiskFactors: string;
  knownCAD: boolean;
  aspirinUse: boolean;
  severeAngina: boolean;
  stDeviation: boolean;
  elevatedBiomarkers: boolean;
}

interface TIMIResult {
  score: number;
  riskCategory: 'low' | 'intermediate' | 'high';
  adverseOutcomeRisk: number;
  riskDetails: {
    mortality: number;
    miRisk: number;
    urgentRevasc: number;
  };
  urgency: 'routine' | 'moderate' | 'high';
  recommendations: string[];
}

export const TIMIRiskCalculator: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TIMIFormData>({
    age: '',
    coronaryRiskFactors: '',
    knownCAD: false,
    aspirinUse: false,
    severeAngina: false,
    stDeviation: false,
    elevatedBiomarkers: false
  });
  const [result, setResult] = useState<TIMIResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age)) {
        newErrors.age = t('calculators.cardiology.timi.age_error');
    } else if (age < 18 || age > 120) {
        newErrors.age = t('calculators.cardiology.timi.age_error');
      }

      const riskFactors = parseInt(formData.coronaryRiskFactors);
      if (!formData.coronaryRiskFactors || isNaN(riskFactors) || riskFactors < 0 || riskFactors > 5) {
        newErrors.coronaryRiskFactors = t('calculators.cardiology.timi.risk_factors_help');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTIMI = (): TIMIResult => {
    let score = 0;

    // Age ≥65 years = 1 point
    if (parseInt(formData.age) >= 65) score += 1;

    // ≥3 CAD risk factors = 1 point
    if (parseInt(formData.coronaryRiskFactors) >= 3) score += 1;

    // Known CAD (stenosis ≥50%) = 1 point
    if (formData.knownCAD) score += 1;

    // Aspirin use in prior 7 days = 1 point
    if (formData.aspirinUse) score += 1;

    // Severe anginal symptoms (≥2 episodes in 24h) = 1 point
    if (formData.severeAngina) score += 1;

    // ST deviation ≥0.5mm = 1 point
    if (formData.stDeviation) score += 1;

    // Elevated cardiac biomarkers = 1 point
    if (formData.elevatedBiomarkers) score += 1;

    // Official TIMI Risk Score percentages from JAMA 2000 study (Antman et al.)
    // 14-day composite endpoint: all-cause mortality, MI, or urgent revascularization
    const timiRiskData = {
      0: { composite: 4.7, mortality: 0, mi: 3.5, urgentRevasc: 1.2 },
      1: { composite: 4.7, mortality: 0, mi: 3.5, urgentRevasc: 1.2 },
      2: { composite: 8.3, mortality: 0.9, mi: 1.8, urgentRevasc: 6.2 },
      3: { composite: 13.2, mortality: 1.8, mi: 4.0, urgentRevasc: 9.1 },
      4: { composite: 19.9, mortality: 2.6, mi: 5.9, urgentRevasc: 14.0 },
      5: { composite: 26.2, mortality: 7.1, mi: 9.7, urgentRevasc: 15.0 },
      6: { composite: 40.9, mortality: 10.6, mi: 16.7, urgentRevasc: 27.3 },
      7: { composite: 40.9, mortality: 10.6, mi: 16.7, urgentRevasc: 27.3 }
    };

    const riskData = timiRiskData[score as keyof typeof timiRiskData];
    
    // Risk stratification based on official TIMI risk score categories
    let riskCategory: 'low' | 'intermediate' | 'high';
    let urgency: 'routine' | 'moderate' | 'high';

    if (score <= 2) {
      riskCategory = 'low';
      urgency = 'routine';
    } else if (score <= 4) {
      riskCategory = 'intermediate';
      urgency = 'moderate';
    } else {
      riskCategory = 'high';
      urgency = 'high';
    }

    const recommendations = [
      t(`calculators.cardiology.timi.recommendation_${riskCategory}`)
    ];

    return {
      score,
      riskCategory,
      adverseOutcomeRisk: riskData.composite,
      riskDetails: {
        mortality: riskData.mortality,
        miRisk: riskData.mi,
        urgentRevasc: riskData.urgentRevasc
      },
      urgency,
      recommendations
    };
  };

  const handleCalculate = () => {
    if (validateStep()) {
      const result = calculateTIMI();
      setResult(result);
      setStep(2);
    }
  };

  const handleNextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setErrors({});
  };

  const resetCalculator = () => {
    setFormData({
      age: '',
      coronaryRiskFactors: '',
      knownCAD: false,
      aspirinUse: false,
      severeAngina: false,
      stDeviation: false,
      elevatedBiomarkers: false
    });
    setErrors({});
    setStep(1);
    setResult(null);
  };

  const getRiskLevel = (category: string): 'low' | 'intermediate' | 'high' => {
    switch (category) {
      case 'high': return 'high';
      case 'intermediate': return 'intermediate';
      default: return 'low';
    }
  };

  const getInterpretation = (category: string, score: number, risk: number) => {
    return t(`calculators.cardiology.timi.interpretation_${category}`).replace('{risk}', risk.toFixed(1));
  };

  const getUrgencyInfo = (urgency: string) => {
    switch (urgency) {
      case 'routine':
        return { icon: Clock, color: 'green', label: t('calculators.cardiology.timi.routine_management') };
      case 'moderate':
        return { icon: AlertTriangle, color: 'orange', label: t('calculators.cardiology.timi.early_intervention') };
      case 'high':
        return { icon: Zap, color: 'red', label: t('calculators.cardiology.timi.urgent_management') };
      default:
        return { icon: Clock, color: 'gray', label: '' };
    }
  };

  if (result) {
  return (
    <CalculatorContainer
        title={t('calculators.cardiology.timi.title')}
        subtitle={t('calculators.cardiology.timi.subtitle')}
      icon={Zap}
      gradient="cardiology"
      className="max-w-7xl mx-auto"
    >
      <div className="space-y-10">
        {/* Emergency Alert - Enhanced */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-red-25 to-orange-50 dark:from-red-950/30 dark:via-red-900/20 dark:to-orange-950/30 border-2 border-red-200/60 dark:border-red-800/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-red-500/10">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/5 to-orange-400/5"></div>
          <div className="relative flex items-start space-x-6">
            <div className="p-4 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 rounded-2xl shadow-lg backdrop-blur-sm">
              <Zap className="w-8 h-8 text-red-600 dark:text-red-400 animate-pulse" />
            </div>
            <div className="flex-1">
                <h4 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-3">
                  {t('calculators.cardiology.timi.emergency_tool')}
                </h4>
              <p className="text-red-700 dark:text-red-300 leading-relaxed text-lg">
                  {t('calculators.cardiology.timi.tool_description')}
              </p>
            </div>
          </div>
        </div>

          {/* Results Display - World-Class Design */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-indigo-400/10 rounded-4xl blur-3xl transform -rotate-1"></div>
            <div className="relative bg-gradient-to-br from-white/90 via-white/70 to-white/90 dark:from-gray-900/90 dark:via-gray-800/70 dark:to-gray-900/90 backdrop-blur-2xl border border-white/20 dark:border-gray-700/20 rounded-4xl p-10 shadow-2xl">
              
              {/* Hero Score Display */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/30 mb-8 transform hover:scale-105 transition-all duration-500">
                  <div className="text-center">
                    <div className="text-5xl font-black text-white mb-1">
                      {result.score}
                    </div>
                    <div className="text-lg font-normal text-white/80">/ 7 {t('common.points')}</div>
                  </div>
                </div>
                
                <h2 className="text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent mb-6">
                  {t('calculators.cardiology.timi.score_analysis')}
                </h2>
                
                {/* DEBUG: Language indicator - REMOVE AFTER TESTING */}
                <div className="mb-4 p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg text-center">
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    DEBUG: Current Language = {currentLanguage} | Title = {t('calculators.cardiology.timi.title')}
                  </span>
                </div>
                
                <div className={`inline-flex items-center px-10 py-5 rounded-2xl text-2xl font-bold shadow-xl transform hover:scale-105 transition-all duration-300 ${
                  result.riskCategory === 'high' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30' 
                    : result.riskCategory === 'intermediate'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-orange-500/30'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30'
                }`}>
                  <Heart className="w-8 h-8 mr-4" />
                  {getInterpretation(result.riskCategory, result.score, result.adverseOutcomeRisk)}
                </div>
              </div>
                {/* Detailed Risk Analysis - Enhanced */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* 14-Day Risk Breakdown - Enhanced */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-purple-25 to-indigo-50 dark:from-purple-950/30 dark:via-purple-900/20 dark:to-indigo-950/30 border border-purple-200/60 dark:border-purple-800/40 rounded-3xl p-8 backdrop-blur-xl shadow-xl shadow-purple-500/10 transform hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-indigo-400/5"></div>
                    <div className="relative flex items-center space-x-4 mb-6">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-purple-900/40 dark:to-indigo-800/40 rounded-2xl shadow-lg">
                        <BarChart3 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                      </div>
                  <h4 className="text-xl font-bold text-purple-800 dark:text-purple-200">
                    {t('calculators.cardiology.timi.fourteen_day_breakdown')}
                  </h4>
                    </div>
                    <div className="relative space-y-4">
                      <div className="flex justify-between items-center p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <span className="text-lg font-medium text-purple-700 dark:text-purple-300">
                      {t('calculators.cardiology.timi.mortality')}
                    </span>
                    <span className="text-2xl font-black text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-xl">
                      {result.riskDetails.mortality}%
                    </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <span className="text-lg font-medium text-purple-700 dark:text-purple-300">
                      {t('calculators.cardiology.timi.myocardial_infarction')}
                    </span>
                    <span className="text-2xl font-black text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-xl">
                      {result.riskDetails.miRisk}%
                    </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <span className="text-lg font-medium text-purple-700 dark:text-purple-300">
                      {t('calculators.cardiology.timi.urgent_revascularization')}
                    </span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-xl">
                      {result.riskDetails.urgentRevasc}%
                    </span>
                      </div>
                    </div>
                  </div>

                  {/* Management Urgency - Enhanced */}
                  <div className={`relative overflow-hidden bg-gradient-to-br ${
                    result.urgency === 'high' 
                      ? 'from-red-50 via-red-25 to-red-100 dark:from-red-950/30 dark:via-red-900/20 dark:to-red-800/30 border-red-200/60 dark:border-red-800/40 shadow-red-500/10' 
                      : result.urgency === 'moderate'
                      ? 'from-orange-50 via-orange-25 to-yellow-50 dark:from-orange-950/30 dark:via-orange-900/20 dark:to-yellow-950/30 border-orange-200/60 dark:border-orange-800/40 shadow-orange-500/10'
                      : 'from-green-50 via-green-25 to-emerald-50 dark:from-green-950/30 dark:via-green-900/20 dark:to-emerald-950/30 border-green-200/60 dark:border-green-800/40 shadow-green-500/10'
                  } border rounded-3xl p-8 backdrop-blur-xl shadow-xl transform hover:scale-105 transition-all duration-300`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${
                      result.urgency === 'high' ? 'from-red-400/5 to-red-500/5' :
                      result.urgency === 'moderate' ? 'from-orange-400/5 to-yellow-400/5' :
                      'from-green-400/5 to-emerald-400/5'
                    }`}></div>
                    <div className="relative flex items-center space-x-4 mb-6">
                      {(() => {
                        const urgencyInfo = getUrgencyInfo(result.urgency);
                    const IconComponent = urgencyInfo.icon;
                        return (
                          <>
                        <div className={`p-3 bg-gradient-to-br ${
                          result.urgency === 'high' ? 'from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40' :
                          result.urgency === 'moderate' ? 'from-orange-100 to-yellow-200 dark:from-orange-900/40 dark:to-yellow-800/40' :
                          'from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/40'
                        } rounded-2xl shadow-lg`}>
                          <IconComponent className={`w-7 h-7 ${
                            result.urgency === 'high' ? 'text-red-600 dark:text-red-400' :
                            result.urgency === 'moderate' ? 'text-orange-600 dark:text-orange-400' :
                            'text-green-600 dark:text-green-400'
                          }`} />
                        </div>
                        <h4 className={`text-xl font-bold ${
                          result.urgency === 'high' ? 'text-red-800 dark:text-red-200' :
                          result.urgency === 'moderate' ? 'text-orange-800 dark:text-orange-200' :
                          'text-green-800 dark:text-green-200'
                        }`}>
                          {t('calculators.cardiology.timi.management_urgency')}
                        </h4>
                          </>
                        );
                      })()}
                    </div>
                    <div className="relative space-y-6">
                      <div className={`text-center p-6 bg-white/70 dark:bg-gray-800/70 rounded-2xl border ${
                        result.urgency === 'high' ? 'border-red-200/50 dark:border-red-700/50' :
                        result.urgency === 'moderate' ? 'border-orange-200/50 dark:border-orange-700/50' :
                        'border-green-200/50 dark:border-green-700/50'
                      }`}>
                        <div className={`text-3xl font-black mb-3 ${
                          result.urgency === 'high' ? 'text-red-600 dark:text-red-400' :
                          result.urgency === 'moderate' ? 'text-orange-600 dark:text-orange-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>
                          {getUrgencyInfo(result.urgency).label}
                        </div>
                        <div className={`text-lg font-medium ${
                          result.urgency === 'high' ? 'text-red-700 dark:text-red-300' :
                          result.urgency === 'moderate' ? 'text-orange-700 dark:text-orange-300' :
                          'text-green-700 dark:text-green-300'
                        }`}>
                          {t('calculators.cardiology.timi.recommended_timeframe')} {
                            result.urgency === 'high' ? t('calculators.cardiology.timi.timeframe_under_24') :
                            result.urgency === 'moderate' ? t('calculators.cardiology.timi.timeframe_24_48') :
                            t('calculators.cardiology.timi.timeframe_24_72')
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Score Components */}
            <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/20">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t('calculators.cardiology.timi.score_components')} ({result.score}/7 {t('common.points', { defaultValue: 'points' })})
              </h4>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <div className={`flex items-center space-x-2 ${parseInt(formData.age) >= 65 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{t('calculators.cardiology.timi.age_component')}</span>
                </div>
                <div className={`flex items-center space-x-2 ${parseInt(formData.coronaryRiskFactors) >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{t('calculators.cardiology.timi.cad_risk_factors_component')}</span>
                </div>
                <div className={`flex items-center space-x-2 ${formData.knownCAD ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{t('calculators.cardiology.timi.known_cad_component')}</span>
                </div>
                <div className={`flex items-center space-x-2 ${formData.aspirinUse ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{t('calculators.cardiology.timi.aspirin_component')}</span>
                </div>
                <div className={`flex items-center space-x-2 ${formData.severeAngina ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{t('calculators.cardiology.timi.angina_component')}</span>
                  </div>
                <div className={`flex items-center space-x-2 ${formData.stDeviation ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{t('calculators.cardiology.timi.st_component')}</span>
                  </div>
                <div className={`flex items-center space-x-2 ${formData.elevatedBiomarkers ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{t('calculators.cardiology.timi.biomarkers_component')}</span>
                </div>
                  </div>
                        </div>

            {/* Clinical Recommendation */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h4 className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  {t('calculators.cardiology.timi.clinical_strategy')}
                </h4>
                      </div>
              <div className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <p key={index} className="text-blue-700 dark:text-blue-300 leading-relaxed">
                    {rec}
                  </p>
                    ))}
                  </div>
                </div>

              {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CalculatorButton
                onClick={resetCalculator}
                  variant="outline"
                className="flex items-center justify-center space-x-2"
                >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('calculators.cardiology.timi.new_assessment')}</span>
                </CalculatorButton>
              
                <CalculatorButton
                onClick={() => setResult(null)}
                className="flex items-center justify-center space-x-2"
                >
                <Calculator className="w-4 h-4" />
                <span>{t('calculators.cardiology.timi.modify_inputs')}</span>
                </CalculatorButton>
            </div>

            {/* About the Creator - World-Class Design */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-blue-900/40 border border-blue-200/60 dark:border-blue-800/40 rounded-3xl p-10 backdrop-blur-xl shadow-2xl shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5"></div>
              <div className="relative flex items-center space-x-6 mb-8">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-800/40 rounded-2xl shadow-lg">
                  <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-3xl font-black text-blue-800 dark:text-blue-200">
                  {t('calculators.cardiology.timi.about_creator_title')}
                </h3>
              </div>
              <div className="relative space-y-6">
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed text-xl">
                  <strong className="text-blue-800 dark:text-blue-200 text-2xl">{t('calculators.cardiology.timi.creator_name')}</strong>
                </p>
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed text-lg">
                  {t('calculators.cardiology.timi.creator_description')}
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-lg">
                  {t('calculators.cardiology.timi.creator_publications')}{' '}
                  <a 
                    href="https://pubmed.ncbi.nlm.nih.gov/?term=Antman+EM%5BAuthor%5D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center underline hover:text-blue-800 dark:hover:text-blue-200 transition-colors font-bold"
                  >
                    PubMed
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </p>
              </div>
            </div>

            {/* Evidence & Formula - World-Class Design */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/40 dark:via-emerald-950/40 dark:to-green-900/40 border border-green-200/60 dark:border-green-800/40 rounded-3xl p-10 backdrop-blur-xl shadow-2xl shadow-green-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-emerald-400/5"></div>
              <div className="relative flex items-center space-x-6 mb-8">
                <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/40 rounded-2xl shadow-lg">
                  <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-3xl font-black text-green-800 dark:text-green-200">
                  {t('calculators.cardiology.timi.evidence_title')}
                </h3>
              </div>
              
              <div className="relative space-y-8">
                <div>
                  <h4 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
                    {t('calculators.cardiology.timi.formula_title')}
                  </h4>
                  <p className="text-green-700 dark:text-green-300 mb-6 text-lg leading-relaxed">
                    {t('calculators.cardiology.timi.formula_description')}
                  </p>
                  
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-3xl p-8 space-y-4 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center p-4 bg-green-50/80 dark:bg-green-900/30 rounded-2xl">
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">{t('calculators.cardiology.timi.variable_age')}</span>
                        <span className="font-mono text-2xl font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/40 px-4 py-2 rounded-xl">1</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-50/80 dark:bg-green-900/30 rounded-2xl">
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">{t('calculators.cardiology.timi.variable_risk_factors')}</span>
                        <span className="font-mono text-2xl font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/40 px-4 py-2 rounded-xl">1</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-50/80 dark:bg-green-900/30 rounded-2xl">
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">{t('calculators.cardiology.timi.variable_known_cad')}</span>
                        <span className="font-mono text-2xl font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/40 px-4 py-2 rounded-xl">1</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-50/80 dark:bg-green-900/30 rounded-2xl">
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">{t('calculators.cardiology.timi.variable_aspirin')}</span>
                        <span className="font-mono text-2xl font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/40 px-4 py-2 rounded-xl">1</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-50/80 dark:bg-green-900/30 rounded-2xl">
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">{t('calculators.cardiology.timi.variable_angina')}</span>
                        <span className="font-mono text-2xl font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/40 px-4 py-2 rounded-xl">1</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-50/80 dark:bg-green-900/30 rounded-2xl">
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">{t('calculators.cardiology.timi.variable_st_deviation')}</span>
                        <span className="font-mono text-2xl font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/40 px-4 py-2 rounded-xl">1</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-50/80 dark:bg-green-900/30 rounded-2xl">
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">{t('calculators.cardiology.timi.variable_biomarkers')}</span>
                        <span className="font-mono text-2xl font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/40 px-4 py-2 rounded-xl">1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Appraisal - World-Class Design */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 dark:from-purple-950/40 dark:via-violet-950/40 dark:to-purple-900/40 border border-purple-200/60 dark:border-purple-800/40 rounded-3xl p-10 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-violet-400/5"></div>
              <div className="relative flex items-center space-x-6 mb-8">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-violet-200 dark:from-purple-900/40 dark:to-violet-800/40 rounded-2xl shadow-lg">
                  <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-3xl font-black text-purple-800 dark:text-purple-200">
                  {t('calculators.cardiology.timi.evidence_appraisal_title')}
                </h3>
              </div>
              <div className="relative">
                <p className="text-purple-700 dark:text-purple-300 leading-relaxed text-lg">
                  {t('calculators.cardiology.timi.evidence_appraisal_description')}
                </p>
              </div>
            </div>

            {/* Literature - World-Class Design */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-950/40 dark:via-slate-950/40 dark:to-gray-900/40 border border-gray-200/60 dark:border-gray-800/40 rounded-3xl p-10 backdrop-blur-xl shadow-2xl shadow-gray-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400/5 to-slate-400/5"></div>
              <div className="relative flex items-center space-x-6 mb-8">
                <div className="p-4 bg-gradient-to-br from-gray-100 to-slate-200 dark:from-gray-900/40 dark:to-slate-800/40 rounded-2xl shadow-lg">
                  <FileText className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-gray-200">
                  {t('calculators.cardiology.timi.literature_title')}
                </h3>
              </div>
              <div className="relative space-y-6">
                <div className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                  <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                    {t('calculators.cardiology.timi.original_reference_title')}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {t('calculators.cardiology.timi.original_reference')}
                  </p>
                </div>
                <div className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                  <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                    {t('calculators.cardiology.timi.validation_studies_title')}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {t('calculators.cardiology.timi.validation_studies')}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer - Enhanced */}
            <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-3xl text-center backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-center space-x-4 text-gray-600 dark:text-gray-400 mb-3">
                <Award className="w-6 h-6" />
                <span className="text-xl font-bold">{t('calculators.cardiology.timi.based_on_timi')}</span>
              </div>
              <div className="text-lg text-gray-500 dark:text-gray-500">
                {t('calculators.cardiology.timi.clinically_validated')}
              </div>
            </div>
          </div>
        </div>
        </div>
      </CalculatorContainer>
    );
  }

  return (
    <CalculatorContainer
      title={t('calculators.cardiology.timi.title')}
      subtitle={t('calculators.cardiology.timi.subtitle')}
      icon={Zap}
      gradient="cardiology"
      className="max-w-4xl mx-auto"
    >
      <div className="space-y-8">
        {/* Emergency Alert */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <Zap className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">
                {t('calculators.cardiology.timi.emergency_tool')}
              </h4>
              <p className="text-red-700 dark:text-red-300 leading-relaxed">
                {t('calculators.cardiology.timi.tool_description')}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator - Enhanced */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/20">
            <div className={`flex items-center space-x-4 ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                step >= 1 ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                1
              </div>
              <span className="font-bold text-lg">{t('calculators.cardiology.timi.patient_info')}</span>
            </div>
            <div className="w-12 h-px bg-gradient-to-r from-blue-300 to-purple-300 dark:from-blue-600 dark:to-purple-600"></div>
            <div className={`flex items-center space-x-4 ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                step >= 2 ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                2
              </div>
              <span className="font-bold text-lg">{t('calculators.cardiology.timi.clinical_factors')}</span>
            </div>
          </div>
        </div>

        {/* Step 1: Demographics & Risk Factors - World-Class Design */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-blue-900/40 border border-blue-200/60 dark:border-blue-800/40 rounded-4xl p-10 backdrop-blur-xl shadow-2xl shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5"></div>
              <div className="relative flex items-center space-x-6 mb-8">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-800/40 rounded-2xl shadow-lg">
                  <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-3xl font-black text-blue-800 dark:text-blue-200">
                  {t('calculators.cardiology.timi.demographics_section')}
                </h3>
              </div>

              <div className="relative grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <CalculatorInput
                    label={t('calculators.cardiology.timi.age_label')}
                    type="number"
                    value={formData.age}
                    onChange={(value) => setFormData({ ...formData, age: value })}
                    placeholder="65"
                    min={18}
                    max={120}
                    error={errors.age}
                  />
                  <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                      {t('calculators.cardiology.timi.age_help')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <CalculatorSelect
                    label={t('calculators.cardiology.timi.coronary_risk_factors')}
                    value={formData.coronaryRiskFactors}
                    onChange={(value) => setFormData({ ...formData, coronaryRiskFactors: value })}
                    options={[
                      { value: '', label: t('common.selectOption', { defaultValue: 'Select option' }) },
                      { value: '0', label: '0' },
                      { value: '1', label: '1' },
                      { value: '2', label: '2' },
                      { value: '3', label: '3+' }
                    ]}
                    error={errors.coronaryRiskFactors}
                  />
                  <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                      {t('calculators.cardiology.timi.risk_factors_help')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative mt-8 p-6 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-start space-x-4">
                  <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed text-lg font-medium">
                    {t('calculators.cardiology.timi.risk_factors_detail')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <CalculatorButton
                onClick={handleNextStep}
                className="flex items-center space-x-3 px-8 py-4 text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl shadow-xl shadow-blue-500/30 transform hover:scale-105 transition-all duration-300"
              >
                <span>{t('calculators.cardiology.timi.next_clinical_factors')}</span>
                <ArrowRight className="w-6 h-6" />
              </CalculatorButton>
            </div>
          </div>
        )}

        {/* Step 2: Clinical Assessment - World-Class Design */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-red-100 dark:from-red-950/40 dark:via-rose-950/40 dark:to-red-900/40 border border-red-200/60 dark:border-red-800/40 rounded-4xl p-10 backdrop-blur-xl shadow-2xl shadow-red-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/5 to-rose-400/5"></div>
              <div className="relative flex items-center space-x-6 mb-8">
                <div className="p-4 bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-900/40 dark:to-rose-800/40 rounded-2xl shadow-lg">
                  <Activity className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-3xl font-black text-red-800 dark:text-red-200">
                  {t('calculators.cardiology.timi.clinical_assessment')}
                </h3>
              </div>

              <div className="relative mb-8 p-6 bg-white/80 dark:bg-gray-800/80 rounded-3xl border border-red-200/50 dark:border-red-700/50">
                <p className="text-red-700 dark:text-red-300 text-lg leading-relaxed font-medium">
                  {t('calculators.cardiology.timi.clinical_assessment_description')}
                </p>
              </div>

              <div className="relative space-y-6">
                <div className="p-6 bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-red-200/50 dark:border-red-700/50 backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-300">
                  <CalculatorCheckbox
                    label={t('calculators.cardiology.timi.known_cad')}
                    checked={formData.knownCAD}
                    onChange={(checked) => setFormData({ ...formData, knownCAD: checked })}
                    description={t('calculators.cardiology.timi.known_cad_desc')}
                  />
                </div>

                <div className="p-6 bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-red-200/50 dark:border-red-700/50 backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-300">
                  <CalculatorCheckbox
                    label={t('calculators.cardiology.timi.aspirin_use')}
                    checked={formData.aspirinUse}
                    onChange={(checked) => setFormData({ ...formData, aspirinUse: checked })}
                    description={t('calculators.cardiology.timi.aspirin_use_desc')}
                  />
                </div>

                <div className="p-6 bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-red-200/50 dark:border-red-700/50 backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-300">
                  <CalculatorCheckbox
                    label={t('calculators.cardiology.timi.severe_angina')}
                    checked={formData.severeAngina}
                    onChange={(checked) => setFormData({ ...formData, severeAngina: checked })}
                    description={t('calculators.cardiology.timi.severe_angina_desc')}
                  />
                </div>

                <div className="p-6 bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-red-200/50 dark:border-red-700/50 backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-300">
                  <CalculatorCheckbox
                    label={t('calculators.cardiology.timi.st_deviation')}
                    checked={formData.stDeviation}
                    onChange={(checked) => setFormData({ ...formData, stDeviation: checked })}
                    description={t('calculators.cardiology.timi.st_deviation_desc')}
                  />
                </div>

                <div className="p-6 bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-red-200/50 dark:border-red-700/50 backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-300">
                  <CalculatorCheckbox
                    label={t('calculators.cardiology.timi.elevated_biomarkers')}
                    checked={formData.elevatedBiomarkers}
                    onChange={(checked) => setFormData({ ...formData, elevatedBiomarkers: checked })}
                    description={t('calculators.cardiology.timi.elevated_biomarkers_desc')}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <CalculatorButton
                onClick={handlePrevStep}
                variant="outline"
                className="flex items-center space-x-3 px-8 py-4 text-lg font-bold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-6 h-6" />
                <span>{t('common.previous')}</span>
              </CalculatorButton>
              
              <CalculatorButton
                onClick={handleCalculate}
                className="flex items-center space-x-3 px-8 py-4 text-lg font-bold bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl shadow-xl shadow-red-500/30 transform hover:scale-105 transition-all duration-300"
              >
                <Calculator className="w-6 h-6" />
                <span>{t('calculators.cardiology.timi.calculate_button')}</span>
              </CalculatorButton>
            </div>
          </div>
        )}
      </div>
    </CalculatorContainer>
  );
}; 