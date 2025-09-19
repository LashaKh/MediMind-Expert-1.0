import React, { useState } from 'react';
import { Calculator, Info, Heart, AlertTriangle, Activity, Zap, User, FileText, Target, Stethoscope, Award, BarChart3, Shield, Brain, TrendingUp, Clock, Pill, BookOpen, ExternalLink } from 'lucide-react';
import { 
  CalculatorContainer, 
  CalculatorInput, 
  CalculatorSelect, 
  CalculatorCheckbox, 
  CalculatorButton, 
  ResultsDisplay 
} from '../ui/calculator-ui';
import { Button } from '../ui/button';
import { Tooltip } from '../ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useTranslation } from '../../hooks/useTranslation';
import { getCategoryIconClass, getSpecialtyGradientClass } from '../../utils/calculatorTheme';
import { MedicalSpecialty } from '../../stores/useAppStore';

interface CHA2DS2VAScFormData {
  age: string;
  sex: 'male' | 'female' | '';
  chf: boolean;
  hypertension: boolean;
  diabetes: boolean;
  stroke_tia: boolean;
  vascularDisease: boolean;
}

interface HASBLEDFormData {
  hypertension: boolean;
  abnormalRenal: boolean;
  abnormalLiver: boolean;
  stroke: boolean;
  bleeding: boolean;
  labileINR: boolean;
  elderly: boolean;
  drugs: boolean;
  alcohol: boolean;
}

interface CHA2DS2VAScResult {
  score: number;
  annualStrokeRisk: number;
  riskCategory: 'low' | 'moderate' | 'high';
  recommendation: string;
}

interface HASBLEDResult {
  score: number;
  annualBleedingRisk: number;
  riskCategory: 'low' | 'moderate' | 'high';
  recommendation: string;
}

export const AtrialFibrillationCalculators: React.FC = () => {
  const { t } = useTranslation();
  const [activeCalc, setActiveCalc] = useState('cha2ds2vasc');

  // CHA₂DS₂-VASc State
  const [cha2ds2vascData, setCha2ds2vascData] = useState<CHA2DS2VAScFormData>({
    age: '',
    sex: '',
    chf: false,
    hypertension: false,
    diabetes: false,
    stroke_tia: false,
    vascularDisease: false
  });
  const [cha2ds2vascResult, setCha2ds2vascResult] = useState<CHA2DS2VAScResult | null>(null);
  const [cha2ds2vascErrors, setCha2ds2vascErrors] = useState<Record<string, string>>({});
  const [isCalculatingCHA2DS2VASc, setIsCalculatingCHA2DS2VASc] = useState(false);
  const [showCHA2DS2VAScResult, setShowCHA2DS2VAScResult] = useState(false);

  // HAS-BLED State
  const [hasbledData, setHasbledData] = useState<HASBLEDFormData>({
    hypertension: false,
    abnormalRenal: false,
    abnormalLiver: false,
    stroke: false,
    bleeding: false,
    labileINR: false,
    elderly: false,
    drugs: false,
    alcohol: false
  });
  const [hasbledResult, setHasbledResult] = useState<HASBLEDResult | null>(null);
  const [isCalculatingHASBLED, setIsCalculatingHASBLED] = useState(false);
  const [showHASBLEDResult, setShowHASBLEDResult] = useState(false);

  const validateCHA2DS2VASc = (): boolean => {
    const newErrors: Record<string, string> = {};

    const age = parseInt(cha2ds2vascData.age);
    if (!cha2ds2vascData.age || isNaN(age)) {
      newErrors.age = t('calculators.cardiology.atrial_fibrillation.validation.age_required');
    } else if (age < 18 || age > 120) {
      newErrors.age = t('calculators.cardiology.atrial_fibrillation.validation.age_range');
    }

    if (!cha2ds2vascData.sex) {
      newErrors.sex = t('calculators.cardiology.atrial_fibrillation.validation.sex_required');
    }

    setCha2ds2vascErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateCHA2DS2VASc = (): CHA2DS2VAScResult => {
    const age = parseInt(cha2ds2vascData.age);
    let score = 0;

    // Age scoring
    if (age >= 75) score += 2;
    else if (age >= 65) score += 1;

    // Sex scoring (female gets 1 point)
    if (cha2ds2vascData.sex === 'female') score += 1;

    // Clinical conditions (1 point each)
    if (cha2ds2vascData.chf) score += 1;
    if (cha2ds2vascData.hypertension) score += 1;
    if (cha2ds2vascData.diabetes) score += 1;
    if (cha2ds2vascData.vascularDisease) score += 1;

    // Stroke/TIA (2 points)
    if (cha2ds2vascData.stroke_tia) score += 2;

    // Annual stroke risk based on score
    const riskTable: Record<number, number> = {
      0: 0.2, 1: 0.6, 2: 2.2, 3: 3.2, 4: 4.8, 5: 7.2, 6: 9.7, 7: 11.2, 8: 10.8, 9: 12.2
    };

    const annualStrokeRisk = riskTable[Math.min(score, 9)] || 15;

    // Risk category and recommendations
    let riskCategory: 'low' | 'moderate' | 'high';
    let recommendation: string;

    if (score === 0) {
      riskCategory = 'low';
      recommendation = t('calculators.cardiology.chads_vasc.no_anticoagulation');
    } else if (score === 1 && cha2ds2vascData.sex === 'male') {
      riskCategory = 'low';
      recommendation = t('calculators.cardiology.chads_vasc.no_anticoagulation');
    } else if (score === 1) {
      riskCategory = 'moderate';
      recommendation = t('calculators.cardiology.chads_vasc.consider_anticoagulation');
    } else {
      riskCategory = 'high';
      recommendation = t('calculators.cardiology.chads_vasc.anticoagulation_recommended');
    }

    return {
      score,
      annualStrokeRisk,
      riskCategory,
      recommendation
    };
  };

  const calculateHASBLED = (): HASBLEDResult => {
    let score = 0;

    // Each factor is 1 point
    if (hasbledData.hypertension) score += 1;
    if (hasbledData.abnormalRenal) score += 1;
    if (hasbledData.abnormalLiver) score += 1;
    if (hasbledData.stroke) score += 1;
    if (hasbledData.bleeding) score += 1;
    if (hasbledData.labileINR) score += 1;
    if (hasbledData.elderly) score += 1;
    if (hasbledData.drugs) score += 1;
    if (hasbledData.alcohol) score += 1;

    // Annual bleeding risk based on score
    const riskTable: Record<number, number> = {
      0: 1.13, 1: 1.02, 2: 1.88, 3: 3.74, 4: 8.70, 5: 12.50, 6: 12.50, 7: 12.50, 8: 12.50, 9: 12.50
    };

    const annualBleedingRisk = riskTable[Math.min(score, 9)] || 15;

    // Risk category
    let riskCategory: 'low' | 'moderate' | 'high';
    let recommendation: string;

    if (score <= 2) {
      riskCategory = 'low';
      recommendation = 'Low bleeding risk. Anticoagulation can be used with standard monitoring.';
    } else if (score === 3) {
      riskCategory = 'moderate';
      recommendation = 'Moderate bleeding risk. Caution with anticoagulation. More frequent monitoring and careful assessment of modifiable bleeding risk factors recommended.';
    } else {
      riskCategory = 'high';
      recommendation = 'High bleeding risk. Address modifiable bleeding risk factors. Consider alternatives to anticoagulation or use with extreme caution and close monitoring.';
    }

    return {
      score,
      annualBleedingRisk,
      riskCategory,
      recommendation
    };
  };

  const handleCHA2DS2VAScCalculate = () => {
    if (!validateCHA2DS2VASc()) return;
    
    setIsCalculatingCHA2DS2VASc(true);
    
    // Simulate stroke risk analysis with loading animation
    setTimeout(() => {
      const result = calculateCHA2DS2VASc();
      setCha2ds2vascResult(result);
      setShowCHA2DS2VAScResult(true);
      setIsCalculatingCHA2DS2VASc(false);
    }, 1500);
  };

  const handleHASBLEDCalculate = () => {
    setIsCalculatingHASBLED(true);
    
    // Simulate bleeding risk analysis with loading animation
    setTimeout(() => {
      const result = calculateHASBLED();
      setHasbledResult(result);
      setShowHASBLEDResult(true);
      setIsCalculatingHASBLED(false);
    }, 1500);
  };

  const resetCHA2DS2VASc = () => {
    setCha2ds2vascData({
      age: '',
      sex: '',
      chf: false,
      hypertension: false,
      diabetes: false,
      stroke_tia: false,
      vascularDisease: false
    });
    setCha2ds2vascResult(null);
    setCha2ds2vascErrors({});
    setShowCHA2DS2VAScResult(false);
  };

  const resetHASBLED = () => {
    setHasbledData({
      hypertension: false,
      abnormalRenal: false,
      abnormalLiver: false,
      stroke: false,
      bleeding: false,
      labileINR: false,
      elderly: false,
      drugs: false,
      alcohol: false
    });
    setHasbledResult(null);
    setShowHASBLEDResult(false);
  };

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'low': return 'text-calc-category-4';
      case 'moderate': return 'text-calc-category-3';
      case 'high': return 'text-calc-category-1';
      default: return 'text-gray-600';
    }
  };

  const getRiskBgColor = (category: string) => {
    switch (category) {
      case 'low': return 'bg-calc-category-4/10 border-calc-category-4/30 dark:bg-calc-category-4/20 dark:border-calc-category-4/30';
      case 'moderate': return 'bg-calc-category-3/10 border-calc-category-3/30 dark:bg-calc-category-3/20 dark:border-calc-category-3/30';
      case 'high': return 'bg-calc-category-1/10 border-calc-category-1/30 dark:bg-calc-category-1/20 dark:border-calc-category-1/30';
      default: return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  return (
    <CalculatorContainer
      title={t('calculators.cardiology.atrial_fibrillation.title')}
      subtitle={t('calculators.cardiology.atrial_fibrillation.subtitle')}
      icon={Activity}
      gradient="cardiology"
      className="max-w-6xl mx-auto"
      compact={true}
    >
      <div className="space-y-8">
        {/* Atrial Fibrillation Alert */}
        <div className="bg-gradient-to-r from-calc-theme-secondary/10 to-calc-theme-accent/10 dark:from-calc-theme-secondary/20 dark:to-calc-theme-accent/20 border-2 border-calc-theme-secondary/30 dark:border-calc-theme-primary/30 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-calc-theme-secondary/10 dark:bg-calc-theme-primary/30 rounded-xl">
              <Activity className="w-6 h-6 text-calc-theme-secondary dark:text-calc-theme-accent" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-calc-theme-primary dark:text-calc-theme-light mb-2">{t('calculators.cardiology.atrial_fibrillation.alert_title')}</h4>
              <p className="text-calc-theme-secondary dark:text-calc-theme-accent leading-relaxed">
                {t('calculators.cardiology.atrial_fibrillation.alert_description')}
              </p>
              <div className="mt-3 inline-flex items-center space-x-2 bg-calc-theme-secondary/10 dark:bg-calc-theme-primary/30 rounded-lg px-3 py-1">
                <Award className="w-4 h-4 text-calc-theme-secondary dark:text-calc-theme-accent" />
                <span className="text-xs font-semibold text-calc-theme-secondary dark:text-calc-theme-accent">{t('calculators.cardiology.atrial_fibrillation.alert_badge')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calculator Tabs */}
        <Tabs value={activeCalc} onValueChange={setActiveCalc} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-calc-theme-secondary/10 dark:bg-calc-theme-primary/20 border border-calc-theme-secondary/30 dark:border-calc-theme-primary/30 rounded-xl p-1">
            <TabsTrigger 
              value="cha2ds2vasc" 
              className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-calc-theme-primary data-[state=active]:shadow-md transition-all duration-200"
            >
              <Heart className="w-4 h-4" />
              <span className="font-medium">{t('calculators.cardiology.atrial_fibrillation.tab_cha2ds2vasc')}</span>
              <span className="text-xs text-gray-500">{t('calculators.cardiology.atrial_fibrillation.tab_cha2ds2vasc_subtitle')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="hasbled" 
              className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-calc-category-1 data-[state=active]:shadow-md transition-all duration-200"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">{t('calculators.cardiology.atrial_fibrillation.tab_hasbled')}</span>
              <span className="text-xs text-gray-500">{t('calculators.cardiology.atrial_fibrillation.tab_hasbled_subtitle')}</span>
            </TabsTrigger>
          </TabsList>

          {/* CHA₂DS₂-VASc Calculator */}
          <TabsContent value="cha2ds2vasc" className="mt-6">
            <div className="space-y-8">
              {/* Form Container with Stunning Design */}
              <div className="relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-calc-theme-secondary/10 via-calc-theme-primary/10 to-calc-theme-accent/10 dark:from-calc-theme-secondary/30 dark:via-calc-theme-primary/30 dark:to-calc-theme-accent/30" />
                
                {/* Glassmorphism Effect */}
                <div className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl shadow-black/5 dark:shadow-black/20">
                  <div className="p-8">
                    {/* Header with Icon */}
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center mb-4">
                        <div className="relative p-4 bg-gradient-to-br from-calc-theme-secondary to-calc-theme-primary rounded-2xl shadow-lg shadow-calc-theme-secondary/25 transform hover:scale-105 transition-all duration-300">
                          <Heart className="w-8 h-8 text-white animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-calc-theme-secondary to-calc-theme-primary dark:from-calc-theme-accent dark:to-calc-theme-light bg-clip-text text-transparent mb-3">
                  {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.title')}
                </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                  {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.description')}
                </p>
              </div>

                    {/* Enhanced Form */}
                    <div className="space-y-8">
                      {/* Basic Information Section */}
                      <div className="relative">
                        <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-blue-800 dark:text-blue-200">
                              Patient Information
                            </h4>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age */}
                            <div className="group">
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-blue-500" />
                                  <span>{t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.age_label')}</span>
                    <Tooltip content={t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.age_tooltip')}>
                                    <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors cursor-help" />
                    </Tooltip>
                                </div>
                  </label>
                              <div className="relative">
                  <input
                    type="number"
                    value={cha2ds2vascData.age}
                    onChange={(e) => setCha2ds2vascData({ ...cha2ds2vascData, age: e.target.value })}
                                  className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                                    cha2ds2vascErrors.age 
                                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                                      : 'border-blue-200 dark:border-blue-700 bg-white/80 dark:bg-gray-800/80 hover:border-blue-300 dark:hover:border-blue-600'
                                  } text-gray-900 dark:text-gray-100 font-medium backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500`}
                    placeholder={t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.age_placeholder')}
                    min="18"
                    max="120"
                  />
                                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                              </div>
                              {cha2ds2vascErrors.age && (
                                <p className="text-red-500 text-sm mt-2 font-medium flex items-center space-x-1">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span>{cha2ds2vascErrors.age}</span>
                                </p>
                              )}
                </div>

                {/* Sex */}
                            <div className="group">
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-blue-500" />
                                  <span>{t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.sex_label')}</span>
                    <Tooltip content={t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.sex_tooltip')}>
                                    <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors cursor-help" />
                    </Tooltip>
                                </div>
                  </label>
                              <div className="relative">
                  <select
                    value={cha2ds2vascData.sex}
                    onChange={(e) => setCha2ds2vascData({ ...cha2ds2vascData, sex: e.target.value as 'male' | 'female' })}
                                  className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                                    cha2ds2vascErrors.sex 
                                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                                      : 'border-blue-200 dark:border-blue-700 bg-white/80 dark:bg-gray-800/80 hover:border-blue-300 dark:hover:border-blue-600'
                                  } text-gray-900 dark:text-gray-100 font-medium backdrop-blur-sm appearance-none cursor-pointer`}
                  >
                    <option value="">{t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.sex_placeholder')}</option>
                    <option value="male">{t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.sex_male')}</option>
                    <option value="female">{t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.sex_female')}</option>
                  </select>
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 pointer-events-none" />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"></path>
                                  </svg>
                                </div>
                              </div>
                              {cha2ds2vascErrors.sex && (
                                <p className="text-red-500 text-sm mt-2 font-medium flex items-center space-x-1">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span>{cha2ds2vascErrors.sex}</span>
                                </p>
                              )}
                            </div>
                          </div>
                </div>
              </div>

                      {/* Risk Factors Section */}
                      <div className="relative">
                        <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25">
                              <Heart className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                  {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.risk_factors_title')}
                </h4>
                            <span className="text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full">1 point each</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { key: 'chf', icon: Heart, label: t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.chf_label') },
                              { key: 'hypertension', icon: TrendingUp, label: t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.hypertension_label') },
                              { key: 'diabetes', icon: Activity, label: t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.diabetes_label') },
                              { key: 'vascularDisease', icon: Target, label: t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.vascular_disease_label') }
                            ].map((factor) => {
                              const IconComponent = factor.icon;
                              const isChecked = cha2ds2vascData[factor.key as keyof CHA2DS2VAScFormData] as boolean;
                              return (
                                <label key={factor.key} className="group cursor-pointer">
                                  <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                                    isChecked 
                                      ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/20' 
                                      : 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                                  } hover:scale-[1.02] backdrop-blur-sm`}>
                                    <div className="flex items-center space-x-3">
                                      <div className="relative">
                    <input
                      type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => setCha2ds2vascData({ ...cha2ds2vascData, [factor.key]: e.target.checked })}
                                          className="sr-only"
                                        />
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                          isChecked 
                                            ? 'border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/30' 
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                        }`}>
                                          {isChecked && (
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m5 13 4 4L19 7"></path>
                                            </svg>
                                          )}
                                        </div>
                                      </div>
                                      <div className={`p-2 rounded-lg ${
                                        isChecked 
                                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                      } transition-colors duration-300`}>
                                        <IconComponent className="w-5 h-5" />
                                      </div>
                                      <span className={`text-sm font-medium transition-colors duration-300 ${
                                        isChecked 
                                          ? 'text-emerald-800 dark:text-emerald-200' 
                                          : 'text-gray-700 dark:text-gray-300'
                                      }`}>
                                        {factor.label}
                    </span>
                                    </div>
                                  </div>
                  </label>
                              );
                            })}
                          </div>
                </div>
              </div>

                      {/* High-Risk Factor Section */}
                      <div className="relative">
                        <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-500/25">
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-red-800 dark:text-red-200">
                  {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.high_risk_title')}
                </h4>
                            <span className="text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full">2 points</span>
                          </div>
                          
                          <label className="group cursor-pointer">
                            <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                              cha2ds2vascData.stroke_tia 
                                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 shadow-lg shadow-red-500/20' 
                                : 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 hover:border-red-200 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/10'
                            } hover:scale-[1.02] backdrop-blur-sm`}>
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                  <input
                    type="checkbox"
                    checked={cha2ds2vascData.stroke_tia}
                    onChange={(e) => setCha2ds2vascData({ ...cha2ds2vascData, stroke_tia: e.target.checked })}
                                    className="sr-only"
                                  />
                                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                    cha2ds2vascData.stroke_tia 
                                      ? 'border-red-500 bg-red-500 shadow-lg shadow-red-500/30' 
                                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                  }`}>
                                    {cha2ds2vascData.stroke_tia && (
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m5 13 4 4L19 7"></path>
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                <div className={`p-2 rounded-lg ${
                                  cha2ds2vascData.stroke_tia 
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                } transition-colors duration-300`}>
                                  <Brain className="w-5 h-5" />
                                </div>
                                <span className={`text-sm font-medium transition-colors duration-300 ${
                                  cha2ds2vascData.stroke_tia 
                                    ? 'text-red-800 dark:text-red-200' 
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                    {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.stroke_tia_label')}
                  </span>
                              </div>
                            </div>
                </label>
                        </div>
              </div>

              {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={handleCHA2DS2VAScCalculate}
                          className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl shadow-blue-500/25 hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02]"
                >
                          <Calculator className="w-5 h-5" />
                          <span className="text-lg">{t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.calculate_button')}</span>
                </Button>
                <Button
                  onClick={resetCHA2DS2VASc}
                  variant="outline"
                          className="flex-1 flex items-center justify-center space-x-3 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm bg-white/60 dark:bg-gray-800/60"
                >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                          <span className="text-lg">{t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.reset_button')}</span>
                </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              {cha2ds2vascResult && (
                <div className="space-y-8">
                  {/* Hero Result Card */}
                  <div className="relative overflow-hidden">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 ${
                      cha2ds2vascResult.riskCategory === 'low' 
                        ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30'
                        : cha2ds2vascResult.riskCategory === 'moderate'
                        ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30'
                        : 'bg-gradient-to-br from-rose-50 via-red-50 to-pink-50 dark:from-rose-950/30 dark:via-red-950/30 dark:to-pink-950/30'
                    }`} />
                    
                    {/* Glassmorphism Effect */}
                    <div className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl shadow-black/5 dark:shadow-black/20">
                      <div className="p-8">
                        {/* Header with animated icon */}
                        <div className="flex items-center justify-center mb-6">
                          <div className={`relative p-4 rounded-2xl ${
                            cha2ds2vascResult.riskCategory === 'low' 
                              ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25'
                              : cha2ds2vascResult.riskCategory === 'moderate'
                              ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25'
                              : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/25'
                          } transform transition-all duration-300 hover:scale-105`}>
                            <Heart className="w-8 h-8 text-white animate-pulse" />
                      </div>
                        </div>

                        {/* Score Display with Circular Progress */}
                        <div className="text-center mb-8">
                          <div className="relative inline-flex items-center justify-center">
                            {/* Circular Progress Ring */}
                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                              {/* Background circle */}
                              <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-gray-200 dark:text-gray-700"
                              />
                              {/* Progress circle */}
                              <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${(cha2ds2vascResult.score / 9) * 314} 314`}
                                className={`transition-all duration-1000 ease-out ${
                                  cha2ds2vascResult.riskCategory === 'low' 
                                    ? 'text-emerald-500'
                                    : cha2ds2vascResult.riskCategory === 'moderate'
                                    ? 'text-amber-500'
                                    : 'text-rose-500'
                                }`}
                              />
                            </svg>
                            
                            {/* Score Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`text-4xl font-bold ${
                                cha2ds2vascResult.riskCategory === 'low' 
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : cha2ds2vascResult.riskCategory === 'moderate'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}>
                        {cha2ds2vascResult.score}
                              </span>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Score
                              </span>
                      </div>
                          </div>

                          {/* Title */}
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
                            {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.score_label')}
                          </h3>

                          {/* Risk Percentage with animated counter */}
                          <div className="space-y-2">
                            <div className={`text-2xl font-semibold ${
                              cha2ds2vascResult.riskCategory === 'low' 
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : cha2ds2vascResult.riskCategory === 'moderate'
                                ? 'text-amber-700 dark:text-amber-300'
                                : 'text-rose-700 dark:text-rose-300'
                            }`}>
                              {cha2ds2vascResult.annualStrokeRisk}%
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 font-medium">
                              {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.annual_stroke_risk')}
                            </p>
                          </div>

                          {/* Risk Category Badge */}
                          <div className="mt-4">
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border shadow-lg ${
                              cha2ds2vascResult.riskCategory === 'low' 
                                ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700'
                                : cha2ds2vascResult.riskCategory === 'moderate'
                                ? 'bg-amber-100/80 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700'
                                : 'bg-rose-100/80 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700'
                            }`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                cha2ds2vascResult.riskCategory === 'low' 
                                  ? 'bg-emerald-500'
                                  : cha2ds2vascResult.riskCategory === 'moderate'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`} />
                        {cha2ds2vascResult.riskCategory.charAt(0).toUpperCase() + cha2ds2vascResult.riskCategory.slice(1)} Risk
                            </div>
                      </div>
                    </div>

                        {/* Recommendation Section */}
                        <div className="relative">
                          <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/30 dark:border-gray-700/30">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${
                                cha2ds2vascResult.riskCategory === 'low' 
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : cha2ds2vascResult.riskCategory === 'moderate'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}>
                                <Brain className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                        {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.recommendation')}
                      </h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {cha2ds2vascResult.recommendation}
                      </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Evidence Section */}
                  <div className="relative">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-2xl" />
                    
                    <div className="relative backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-xl">
                      <div className="p-8">
                        {/* Header */}
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                      {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.evidence_title')}
                    </h3>
                        </div>

                        <div className="grid gap-6">
                          {/* Evidence Cards */}
                          <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-blue-500/10 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              </div>
                      <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.evidence_origin_title')}
                        </h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.evidence_origin_description')}
                        </p>
                              </div>
                            </div>
                      </div>
                      
                          <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                              </div>
                      <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.evidence_validation_title')}
                        </h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.evidence_validation_description')}
                        </p>
                              </div>
                            </div>
                      </div>

                          <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-purple-500/10 rounded-lg">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                              </div>
                      <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.evidence_guidelines_title')}
                        </h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.evidence_guidelines_description')}
                        </p>
                              </div>
                            </div>
                      </div>

                          {/* Reference Links */}
                          <div className="bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                              <BookOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                              References
                            </h4>
                            <div className="space-y-3">
                        <a 
                          href="https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193"
                          target="_blank"
                          rel="noopener noreferrer"
                                className="group flex items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-white/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                        >
                                <div className="p-2 bg-blue-500/10 rounded-lg mr-3 group-hover:bg-blue-500/20 transition-colors">
                                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.evidence_link_guidelines')}
                                </span>
                                <ExternalLink className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        </a>
                              
                        <a 
                          href="https://pubmed.ncbi.nlm.nih.gov/20299623/"
                          target="_blank"
                          rel="noopener noreferrer"
                                className="group flex items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-white/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                        >
                                <div className="p-2 bg-indigo-500/10 rounded-lg mr-3 group-hover:bg-indigo-500/20 transition-colors">
                                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                          {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.evidence_link_original')}
                                </span>
                                <ExternalLink className="w-4 h-4 ml-auto text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                        </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Pearls Section */}
                  <div className="relative">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 rounded-2xl" />
                    
                    <div className="relative backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-xl">
                      <div className="p-8">
                        {/* Header */}
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25">
                            <Brain className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                      {t('calculators.cardiology.atrial_fibrillation.cha2ds2vasc.clinical_pearls_title')}
                    </h3>
                        </div>

                        <div className="grid gap-4">
                          {[
                            { icon: Brain, color: 'emerald', pearl: 'clinical_pearl_1' },
                            { icon: Shield, color: 'teal', pearl: 'clinical_pearl_2' },
                            { icon: TrendingUp, color: 'cyan', pearl: 'clinical_pearl_3' },
                            { icon: Pill, color: 'blue', pearl: 'clinical_pearl_4' }
                          ].map((item, index) => {
                            const IconComponent = item.icon;
                            return (
                              <div key={index} className="group bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                <div className="flex items-start space-x-4">
                                  <div className={`p-3 bg-gradient-to-br ${
                                    item.color === 'emerald' ? 'from-emerald-500 to-green-600 shadow-emerald-500/25' :
                                    item.color === 'teal' ? 'from-teal-500 to-cyan-600 shadow-teal-500/25' :
                                    item.color === 'cyan' ? 'from-cyan-500 to-blue-600 shadow-cyan-500/25' :
                                    'from-blue-500 to-indigo-600 shadow-blue-500/25'
                                  } rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <IconComponent className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                      {t(`calculators.cardiology.atrial_fibrillation.cha2ds2vasc.${item.pearl}`)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* HAS-BLED Calculator */}
          <TabsContent value="hasbled" className="mt-6">
            <div className="space-y-8">
              {/* Form Container with Stunning Design */}
              <div className="relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-950/30 dark:via-rose-950/30 dark:to-pink-950/30" />
                
                {/* Glassmorphism Effect */}
                <div className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl shadow-black/5 dark:shadow-black/20">
                  <div className="p-8">
                    {/* Header with Icon */}
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center mb-4">
                        <div className="relative p-4 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg shadow-red-500/25 transform hover:scale-105 transition-all duration-300">
                          <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent mb-3">
                  {t('calculators.cardiology.atrial_fibrillation.hasbled.title')}
                </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                  {t('calculators.cardiology.atrial_fibrillation.hasbled.description')}
                </p>
              </div>

                    {/* Enhanced Form */}
                    <div className="space-y-8">
                      {/* Bleeding Risk Factors Section */}
                      <div className="relative">
                        <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-500/25">
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-red-800 dark:text-red-200">
                  {t('calculators.cardiology.atrial_fibrillation.hasbled.risk_factors_title')}
                </h4>
                            <span className="text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full">1 point each</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                              { key: 'hypertension', icon: TrendingUp, label: t('calculators.cardiology.atrial_fibrillation.hasbled.hypertension_label'), description: 'Systolic BP >160 mmHg' },
                              { key: 'abnormalRenal', icon: Activity, label: t('calculators.cardiology.atrial_fibrillation.hasbled.abnormal_renal_label'), description: 'Dialysis, transplant, creatinine >200 μmol/L' },
                              { key: 'abnormalLiver', icon: Target, label: t('calculators.cardiology.atrial_fibrillation.hasbled.abnormal_liver_label'), description: 'Cirrhosis, bilirubin >2x normal, ALT/AST >3x normal' },
                              { key: 'stroke', icon: Brain, label: t('calculators.cardiology.atrial_fibrillation.hasbled.stroke_label'), description: 'History of stroke' },
                              { key: 'bleeding', icon: Heart, label: t('calculators.cardiology.atrial_fibrillation.hasbled.bleeding_label'), description: 'History or predisposition to bleeding' },
                              { key: 'labileINR', icon: BarChart3, label: t('calculators.cardiology.atrial_fibrillation.hasbled.labile_inr_label'), description: 'Unstable/high INR, <60% time in therapeutic range' },
                              { key: 'elderly', icon: Clock, label: t('calculators.cardiology.atrial_fibrillation.hasbled.elderly_label'), description: 'Age >65 years' },
                              { key: 'drugs', icon: Pill, label: t('calculators.cardiology.atrial_fibrillation.hasbled.drugs_label'), description: 'Antiplatelet agents, NSAIDs' },
                              { key: 'alcohol', icon: Shield, label: t('calculators.cardiology.atrial_fibrillation.hasbled.alcohol_label'), description: '≥8 drinks per week' }
                            ].map((factor) => {
                              const IconComponent = factor.icon;
                              const isChecked = hasbledData[factor.key as keyof HASBLEDFormData] as boolean;
                              return (
                                <label key={factor.key} className="group cursor-pointer">
                                  <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                                    isChecked 
                                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20 shadow-lg shadow-red-500/20' 
                                      : 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 hover:border-red-200 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/10'
                                  } hover:scale-[1.02] backdrop-blur-sm min-h-[120px]`}>
                                    <div className="flex flex-col h-full">
                                      <div className="flex items-start space-x-3 mb-2">
                                        <div className="relative mt-1">
                    <input
                      type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => setHasbledData({ ...hasbledData, [factor.key]: e.target.checked })}
                                            className="sr-only"
                                          />
                                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                            isChecked 
                                              ? 'border-red-500 bg-red-500 shadow-lg shadow-red-500/30' 
                                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                          }`}>
                                            {isChecked && (
                                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m5 13 4 4L19 7"></path>
                                              </svg>
                                            )}
                                          </div>
                                        </div>
                                        <div className={`p-2 rounded-lg ${
                                          isChecked 
                                            ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                        } transition-colors duration-300`}>
                                          <IconComponent className="w-5 h-5" />
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <h5 className={`text-sm font-semibold mb-1 transition-colors duration-300 ${
                                          isChecked 
                                            ? 'text-red-800 dark:text-red-200' 
                                            : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                          {factor.label}
                                        </h5>
                                        <p className={`text-xs transition-colors duration-300 ${
                                          isChecked 
                                            ? 'text-red-600 dark:text-red-300' 
                                            : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                          {factor.description}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                  </label>
                              );
                            })}
                          </div>
                </div>
              </div>

              {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={handleHASBLEDCalculate}
                          className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl shadow-red-500/25 hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-[1.02]"
                >
                          <Calculator className="w-5 h-5" />
                          <span className="text-lg">{t('calculators.cardiology.atrial_fibrillation.hasbled.calculate_button')}</span>
                </Button>
                <Button
                  onClick={resetHASBLED}
                  variant="outline"
                          className="flex-1 flex items-center justify-center space-x-3 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm bg-white/60 dark:bg-gray-800/60"
                >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                          <span className="text-lg">{t('calculators.cardiology.atrial_fibrillation.hasbled.reset_button')}</span>
                </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              {hasbledResult && (
                <div className="space-y-8">
                  {/* Hero Result Card */}
                  <div className="relative overflow-hidden">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 ${
                      hasbledResult.riskCategory === 'low' 
                        ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30'
                        : hasbledResult.riskCategory === 'moderate'
                        ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30'
                        : 'bg-gradient-to-br from-rose-50 via-red-50 to-pink-50 dark:from-rose-950/30 dark:via-red-950/30 dark:to-pink-950/30'
                    }`} />
                    
                    {/* Glassmorphism Effect */}
                    <div className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl shadow-black/5 dark:shadow-black/20">
                      <div className="p-8">
                        {/* Header with animated icon */}
                        <div className="flex items-center justify-center mb-6">
                          <div className={`relative p-4 rounded-2xl ${
                            hasbledResult.riskCategory === 'low' 
                              ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25'
                              : hasbledResult.riskCategory === 'moderate'
                              ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25'
                              : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/25'
                          } transform transition-all duration-300 hover:scale-105`}>
                            <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
                    </div>
                        </div>

                        {/* Score Display with Circular Progress */}
                        <div className="text-center mb-8">
                          <div className="relative inline-flex items-center justify-center">
                            {/* Circular Progress Ring */}
                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                              {/* Background circle */}
                              <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-gray-200 dark:text-gray-700"
                              />
                              {/* Progress circle */}
                              <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${(hasbledResult.score / 9) * 314} 314`}
                                className={`transition-all duration-1000 ease-out ${
                                  hasbledResult.riskCategory === 'low' 
                                    ? 'text-emerald-500'
                                    : hasbledResult.riskCategory === 'moderate'
                                    ? 'text-amber-500'
                                    : 'text-rose-500'
                                }`}
                              />
                            </svg>
                            
                            {/* Score Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`text-4xl font-bold ${
                                hasbledResult.riskCategory === 'low' 
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : hasbledResult.riskCategory === 'moderate'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}>
                      {hasbledResult.score}
                              </span>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Score
                              </span>
                    </div>
                          </div>

                          {/* Title */}
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
                            {t('calculators.cardiology.atrial_fibrillation.hasbled.score_label')}
                          </h3>

                          {/* Risk Percentage with animated counter */}
                          <div className="space-y-2">
                            <div className={`text-2xl font-semibold ${
                              hasbledResult.riskCategory === 'low' 
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : hasbledResult.riskCategory === 'moderate'
                                ? 'text-amber-700 dark:text-amber-300'
                                : 'text-rose-700 dark:text-rose-300'
                            }`}>
                              {hasbledResult.annualBleedingRisk}%
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 font-medium">
                              {t('calculators.cardiology.atrial_fibrillation.hasbled.annual_bleeding_risk')}
                            </p>
                          </div>

                          {/* Risk Category Badge */}
                          <div className="mt-4">
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border shadow-lg ${
                              hasbledResult.riskCategory === 'low' 
                                ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700'
                                : hasbledResult.riskCategory === 'moderate'
                                ? 'bg-amber-100/80 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700'
                                : 'bg-rose-100/80 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700'
                            }`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                hasbledResult.riskCategory === 'low' 
                                  ? 'bg-emerald-500'
                                  : hasbledResult.riskCategory === 'moderate'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`} />
                      {hasbledResult.riskCategory.charAt(0).toUpperCase() + hasbledResult.riskCategory.slice(1)} {t('calculators.cardiology.atrial_fibrillation.hasbled.risk_category')}
                            </div>
                    </div>
                  </div>

                        {/* Recommendation Section */}
                        <div className="relative">
                          <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/30 dark:border-gray-700/30">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${
                                hasbledResult.riskCategory === 'low' 
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : hasbledResult.riskCategory === 'moderate'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}>
                                <Shield className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                      {t('calculators.cardiology.atrial_fibrillation.hasbled.recommendation')}
                    </h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {hasbledResult.recommendation}
                    </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comprehensive HAS-BLED Information */}
              {hasbledResult && (
                <div className="space-y-8 mt-8">
                  {/* Author Information - Dr. Ron Pisters */}
                  <div className="relative">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 rounded-2xl" />
                    
                    <div className="relative backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-xl">
                      <div className="p-8">
                        {/* Header */}
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-xl shadow-violet-500/25 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                              <span className="text-white font-bold text-xl">RP</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                              <User className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                              {t('calculators.cardiology.atrial_fibrillation.hasbled.author_title')}
                            </h4>
                            <h5 className="text-lg font-semibold text-violet-800 dark:text-violet-200">
                              {t('calculators.cardiology.atrial_fibrillation.hasbled.author_name')}
                            </h5>
                          </div>
                        </div>

                        {/* Bio */}
                        <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40 mb-6">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                            {t('calculators.cardiology.atrial_fibrillation.hasbled.author_bio')}
                          </p>
                        </div>
                        
                        {/* Key Message */}
                        <div className="group bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40 hover:shadow-lg transition-all duration-300 mb-6">
                          <div className="flex items-start space-x-4">
                            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/25 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h6 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                {t('calculators.cardiology.atrial_fibrillation.hasbled.author_key_message_title')}
                              </h6>
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {t('calculators.cardiology.atrial_fibrillation.hasbled.author_key_message')}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* PubMed Link */}
                        <div className="mt-6">
                          <a 
                            href="https://pubmed.ncbi.nlm.nih.gov/?term=Pisters+R%5BAuthor%5D"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center p-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]"
                          >
                            <div className="p-2 bg-white/20 rounded-lg mr-3 group-hover:bg-white/30 transition-colors">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <span>{t('calculators.cardiology.atrial_fibrillation.hasbled.author_pubmed_link')}</span>
                            <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Formula Section */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-cyan-500/10 border border-teal-200/50 dark:border-teal-400/30 backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-teal-500/10"></div>
                    <div className="relative p-6 space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center backdrop-blur-sm">
                          <Calculator className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {t('calculators.cardiology.atrial_fibrillation.hasbled.formula_title')}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">HAS-BLED Point System</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {t('calculators.cardiology.atrial_fibrillation.hasbled.formula_description')}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          {[
                            { label: "Hypertension", value: "1" },
                            { label: "Renal disease", value: "1" },
                            { label: "Liver disease", value: "1" },
                            { label: "Stroke history", value: "1" }
                          ].map((item, index) => (
                            <div key={index} className="group flex justify-between items-center p-3 bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl border border-white/40 dark:border-gray-700/40 hover:scale-[1.02] transition-all duration-300">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                              <span className="px-3 py-1 bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-lg font-bold text-sm">{item.value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-3">
                          {[
                            { label: "Prior major bleeding", value: "1" },
                            { label: "Labile INR", value: "1" },
                            { label: "Elderly (age > 65)", value: "1" },
                            { label: "Medication/Alcohol usage", value: "1" }
                          ].map((item, index) => (
                            <div key={index} className="group flex justify-between items-center p-3 bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl border border-white/40 dark:border-gray-700/40 hover:scale-[1.02] transition-all duration-300">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                              <span className="px-3 py-1 bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-lg font-bold text-sm">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/20 via-blue-400/10 to-indigo-500/20 border border-blue-200/50 dark:border-blue-400/30 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-blue-500/10"></div>
                        <div className="relative p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center">
                              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                <strong>Note:</strong> {t('calculators.cardiology.atrial_fibrillation.hasbled.formula_note')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Facts & Figures - Risk Table */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-400/5 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-400/30 backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-indigo-500/10"></div>
                    <div className="relative p-6 space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center backdrop-blur-sm">
                          <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {t('calculators.cardiology.atrial_fibrillation.hasbled.facts_figures_title')}
                          </h4>
                          <h5 className="text-sm text-gray-600 dark:text-gray-400">
                            {t('calculators.cardiology.atrial_fibrillation.hasbled.risk_table_title')}
                          </h5>
                        </div>
                      </div>
                      
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm border border-white/40 dark:border-gray-700/40">
                        <div className="overflow-x-auto">
                          <table className="min-w-full table-auto">
                            <thead>
                              <tr className="bg-gradient-to-r from-indigo-500/20 via-indigo-400/10 to-purple-500/20 backdrop-blur-sm">
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200">
                                  {t('calculators.cardiology.atrial_fibrillation.hasbled.risk_table_score')}
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200">
                                  {t('calculators.cardiology.atrial_fibrillation.hasbled.risk_table_group')}
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200">
                                  {t('calculators.cardiology.atrial_fibrillation.hasbled.risk_table_major_bleeding')}
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200">
                                  {t('calculators.cardiology.atrial_fibrillation.hasbled.risk_table_bleeds_per_100')}
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200">
                                  {t('calculators.cardiology.atrial_fibrillation.hasbled.risk_table_recommendation')}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20 dark:divide-gray-700/40">
                              {[
                                { score: "0", risk: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_low'), bleeding: "0.9%", bleeds: "1.13", rec: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_rec_0_1'), color: "emerald" },
                                { score: "1", risk: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_low'), bleeding: "3.4%", bleeds: "1.02", rec: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_rec_0_1'), color: "green" },
                                { score: "2", risk: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_moderate'), bleeding: "4.1%", bleeds: "1.88", rec: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_rec_2'), color: "yellow" },
                                { score: "3", risk: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_high'), bleeding: "5.8%", bleeds: "3.72", rec: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_rec_3_4'), color: "orange" },
                                { score: "4", risk: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_high'), bleeding: "8.9%", bleeds: "8.70", rec: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_rec_3_4'), color: "red" },
                                { score: "5", risk: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_high'), bleeding: "9.1%", bleeds: "12.50", rec: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_rec_3_4'), color: "red" },
                                { score: "> 5", risk: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_very_high'), bleeding: "-", bleeds: "-", rec: t('calculators.cardiology.atrial_fibrillation.hasbled.risk_rec_5_plus'), color: "rose" }
                              ].map((row, index) => (
                                <tr key={index} className={`group hover:bg-gradient-to-r ${
                                  row.color === 'emerald' ? 'hover:from-emerald-500/10 hover:to-green-500/10' :
                                  row.color === 'green' ? 'hover:from-green-500/10 hover:to-emerald-500/10' :
                                  row.color === 'yellow' ? 'hover:from-yellow-500/10 hover:to-amber-500/10' :
                                  row.color === 'orange' ? 'hover:from-orange-500/10 hover:to-red-500/10' :
                                  row.color === 'red' ? 'hover:from-red-500/10 hover:to-rose-500/10' :
                                  'hover:from-rose-500/10 hover:to-red-500/10'
                                } transition-all duration-300`}>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                                      row.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                                      row.color === 'green' ? 'bg-green-500/20 text-green-700 dark:text-green-300' :
                                      row.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' :
                                      row.color === 'orange' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300' :
                                      row.color === 'red' ? 'bg-red-500/20 text-red-700 dark:text-red-300' :
                                      'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                    }`}>
                                      {row.score}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">{row.risk}</td>
                                  <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">{row.bleeding}</td>
                                  <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">{row.bleeds}</td>
                                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{row.rec}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-r from-white/40 to-white/20 dark:from-gray-800/40 dark:to-gray-800/20 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30">
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            **Risk figures from Lip 2011.
                          </p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-white/40 to-white/20 dark:from-gray-800/40 dark:to-gray-800/20 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30">
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                            ***Risk figures from Pisters 2010.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Evidence Section */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-amber-500/10 border border-orange-200/50 dark:border-orange-400/30 backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-orange-500/10"></div>
                    <div className="relative p-6 space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center backdrop-blur-sm">
                          <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {t('calculators.cardiology.atrial_fibrillation.hasbled.evidence_title')}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Scientific Validation & Guidelines</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { 
                            title: "Development", 
                            content: t('calculators.cardiology.atrial_fibrillation.hasbled.evidence_development'),
                            icon: Brain,
                            color: "blue"
                          },
                          { 
                            title: "Validation", 
                            content: t('calculators.cardiology.atrial_fibrillation.hasbled.evidence_validation'),
                            icon: Shield,
                            color: "green"
                          },
                          { 
                            title: "Clinical Guidelines", 
                            content: t('calculators.cardiology.atrial_fibrillation.hasbled.evidence_guidelines'),
                            icon: FileText,
                            color: "purple"
                          },
                          { 
                            title: "Limitations", 
                            content: t('calculators.cardiology.atrial_fibrillation.hasbled.evidence_limitations'),
                            icon: AlertTriangle,
                            color: "amber"
                          }
                        ].map((item, index) => (
                          <div key={index} className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm border border-white/40 dark:border-gray-700/40 hover:scale-[1.02] transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5"></div>
                            <div className="relative p-5 space-y-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-xl ${
                                  item.color === 'blue' ? 'bg-blue-500/20' :
                                  item.color === 'green' ? 'bg-green-500/20' :
                                  item.color === 'purple' ? 'bg-purple-500/20' :
                                  'bg-amber-500/20'
                                } flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                  <item.icon className={`w-5 h-5 ${
                                    item.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                    item.color === 'green' ? 'text-green-600 dark:text-green-400' :
                                    item.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                                    'text-amber-600 dark:text-amber-400'
                                  }`} />
                                </div>
                                <h5 className="font-bold text-gray-900 dark:text-gray-100">{item.title}</h5>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {item.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-500/20 via-slate-400/10 to-gray-500/20 border border-slate-200/50 dark:border-slate-400/30 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-slate-500/10"></div>
                        <div className="relative p-6 space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <h5 className="text-lg font-bold text-gray-900 dark:text-gray-100">Key References</h5>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              t('calculators.cardiology.atrial_fibrillation.hasbled.reference_original'),
                              t('calculators.cardiology.atrial_fibrillation.hasbled.reference_validation'),
                              t('calculators.cardiology.atrial_fibrillation.hasbled.reference_guidelines_2020'),
                              t('calculators.cardiology.atrial_fibrillation.hasbled.reference_guidelines_2023')
                            ].map((ref, index) => (
                              <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-white/40 to-white/20 dark:from-gray-800/40 dark:to-gray-800/20 backdrop-blur-sm rounded-lg border border-white/30 dark:border-gray-700/30">
                                <div className="w-6 h-6 rounded-full bg-slate-500/20 flex items-center justify-center mt-0.5">
                                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{index + 1}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
                                  {ref}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Source Information */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-green-500/10 border border-emerald-200/50 dark:border-emerald-400/30 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-emerald-500/10"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
                <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-center">
                <div className="flex items-center space-x-2 mb-1">
                  <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Clinical Guidelines Compliance</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Based on 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CalculatorContainer>
  );
}; 