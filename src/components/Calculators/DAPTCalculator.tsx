import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Calculator, Info, Heart, AlertTriangle, Clock, TrendingUp, Pill, Activity, User, FileText, Target, Stethoscope, Award, BarChart3, Shield, Droplets, Zap, Brain, TimerIcon, CheckCircle2, UserCheck, BookOpen, ExternalLink, MessageCircle, Lightbulb } from 'lucide-react';
import { 
  CalculatorContainer, 
  CalculatorInput, 
  CalculatorSelect, 
  CalculatorCheckbox, 
  CalculatorButton, 
  ResultsDisplay 
} from '../ui/calculator-ui';

interface DAPTFormData {
  age: string;
  cigaretteSmoking: boolean;
  diabetesMellitus: boolean;
  miAtPresentation: boolean;
  priorPCIOrMI: boolean;
  paclitaxelElutingStent: boolean;
  stentDiameter: string; // <3mm = 1 point
  chfOrLVEF: boolean; // CHF or LVEF <30%
  veinGraftPCI: boolean;
}

interface DAPTResult {
  score: number;
  ischemicBenefit: 'high' | 'intermediate' | 'low';
  bleedingRisk: 'high' | 'intermediate' | 'low';
  netBenefit: 'favorable' | 'uncertain' | 'unfavorable';
  recommendation: string;
  durationGuidance: string;
  clinicalConsiderations: string[];
  riskBalance: {
    ischemicReduction: number;
    bleedingIncrease: number;
    netClinicalBenefit: string;
  };
}

export default function DAPTCalculator() {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<DAPTFormData>({
    age: '',
    cigaretteSmoking: false,
    diabetesMellitus: false,
    miAtPresentation: false,
    priorPCIOrMI: false,
    paclitaxelElutingStent: false,
    stentDiameter: '',
    chfOrLVEF: false,
    veinGraftPCI: false
  });

  const [result, setResult] = useState<DAPTResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showResult, setShowResult] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age)) {
      newErrors.age = t('common.required');
    } else if (age < 18 || age > 120) {
      newErrors.age = t('calculators.cardiology.dapt.age_error');
    }

    const stentDiameter = parseFloat(formData.stentDiameter);
    if (!formData.stentDiameter || isNaN(stentDiameter)) {
      newErrors.stentDiameter = t('common.required');
    } else if (stentDiameter < 1 || stentDiameter > 10) {
      newErrors.stentDiameter = t('calculators.cardiology.dapt.stent_diameter_error');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDAPTScore = (): DAPTResult => {
    const age = parseInt(formData.age);
    const stentDiameter = parseFloat(formData.stentDiameter);
    let score = 0;

    // Age scoring (65-75 = -1, ≥75 = -2)
    if (age >= 75) score -= 2;
    else if (age >= 65) score -= 1;

    // Risk factors (+1 each)
    if (formData.cigaretteSmoking) score += 1;
    if (formData.diabetesMellitus) score += 1;
    if (formData.miAtPresentation) score += 1;
    if (formData.priorPCIOrMI) score += 1;
    if (formData.paclitaxelElutingStent) score += 1;
    if (stentDiameter < 3) score += 1;
    if (formData.chfOrLVEF) score += 2;
    if (formData.veinGraftPCI) score += 2;

    // Enhanced clinical interpretation with risk-benefit analysis
    let ischemicBenefit: 'high' | 'intermediate' | 'low';
    let bleedingRisk: 'high' | 'intermediate' | 'low';
    let netBenefit: 'favorable' | 'uncertain' | 'unfavorable';
    let recommendation: string;
    let durationGuidance: string;
    let clinicalConsiderations: string[];
    let ischemicReduction = 0;
    let bleedingIncrease = 0;
    let netClinicalBenefit = '';

    // Advanced risk-benefit calculation
    if (score >= 2) {
      ischemicBenefit = 'high';
      ischemicReduction = 1.4; // 1.4% absolute reduction in MACE
      
      if (age < 65) {
        bleedingRisk = 'low';
        bleedingIncrease = 0.3; // 0.3% increase in major bleeding
        netBenefit = 'favorable';
        netClinicalBenefit = t('calculators.cardiology.dapt.net_benefit_strong');
        recommendation = t('calculators.cardiology.dapt.recommendation_extended_strongly');
        durationGuidance = t('calculators.cardiology.dapt.duration_18_30_months');
      } else if (age < 75) {
        bleedingRisk = 'intermediate';
        bleedingIncrease = 0.6; // 0.6% increase in major bleeding
        netBenefit = 'uncertain';
        netClinicalBenefit = t('calculators.cardiology.dapt.net_benefit_modest');
        recommendation = t('calculators.cardiology.dapt.recommendation_extended_may_benefit');
        durationGuidance = t('calculators.cardiology.dapt.duration_18_months_monitoring');
      } else {
        bleedingRisk = 'high';
        bleedingIncrease = 1.2; // 1.2% increase in major bleeding
        netBenefit = 'unfavorable';
        netClinicalBenefit = t('calculators.cardiology.dapt.net_benefit_harm');
        recommendation = t('calculators.cardiology.dapt.recommendation_not_recommended_bleeding');
        durationGuidance = t('calculators.cardiology.dapt.duration_12_months_early');
      }
    } else if (score >= 1) {
      ischemicBenefit = 'intermediate';
      ischemicReduction = 0.8; // 0.8% absolute reduction in MACE
      
      if (age < 65) {
        bleedingRisk = 'low';
        bleedingIncrease = 0.3;
        netBenefit = 'uncertain';
        netClinicalBenefit = t('calculators.cardiology.dapt.net_benefit_modest_uncertain');
        recommendation = t('calculators.cardiology.dapt.recommendation_individualized_assessment');
        durationGuidance = t('calculators.cardiology.dapt.duration_12_18_individualized');
      } else if (age < 75) {
        bleedingRisk = 'intermediate';
        bleedingIncrease = 0.6;
        netBenefit = 'uncertain';
        netClinicalBenefit = t('calculators.cardiology.dapt.net_benefit_neutral');
        recommendation = t('calculators.cardiology.dapt.recommendation_careful_consideration');
        durationGuidance = t('calculators.cardiology.dapt.duration_12_months_rationale');
      } else {
        bleedingRisk = 'high';
        bleedingIncrease = 1.2;
        netBenefit = 'unfavorable';
        netClinicalBenefit = t('calculators.cardiology.dapt.net_benefit_unfavorable');
        recommendation = t('calculators.cardiology.dapt.recommendation_not_recommended');
        durationGuidance = t('calculators.cardiology.dapt.duration_12_months_early_consideration');
      }
    } else {
      ischemicBenefit = 'low';
      ischemicReduction = 0.4; // 0.4% absolute reduction in MACE
      bleedingIncrease = age >= 75 ? 1.2 : age >= 65 ? 0.6 : 0.3;
      bleedingRisk = age >= 75 ? 'high' : age >= 65 ? 'intermediate' : 'low';
      netBenefit = 'unfavorable';
      netClinicalBenefit = age >= 65 ? t('calculators.cardiology.dapt.net_benefit_harm_elderly') : t('calculators.cardiology.dapt.net_benefit_neutral_unfavorable');
      recommendation = t('calculators.cardiology.dapt.recommendation_not_recommended_limited');
      durationGuidance = t('calculators.cardiology.dapt.duration_12_months_shorter');
    }

    // Enhanced clinical considerations
    clinicalConsiderations = [];
    if (age >= 75) {
      clinicalConsiderations.push(t('calculators.cardiology.dapt.consideration_advanced_age'));
    } else if (age >= 65) {
      clinicalConsiderations.push(t('calculators.cardiology.dapt.consideration_moderate_age'));
    }
    
    if (formData.diabetesMellitus) {
      clinicalConsiderations.push(t('calculators.cardiology.dapt.consideration_diabetes'));
    }
    
    if (formData.miAtPresentation) {
      clinicalConsiderations.push(t('calculators.cardiology.dapt.consideration_mi_presentation'));
    }
    
    if (stentDiameter < 3) {
      clinicalConsiderations.push(t('calculators.cardiology.dapt.consideration_small_vessel'));
    }
    
    if (formData.chfOrLVEF) {
      clinicalConsiderations.push(t('calculators.cardiology.dapt.consideration_heart_failure'));
    }
    
    if (formData.paclitaxelElutingStent) {
      clinicalConsiderations.push(t('calculators.cardiology.dapt.consideration_paclitaxel_stent'));
    }
    
    if (formData.veinGraftPCI) {
      clinicalConsiderations.push(t('calculators.cardiology.dapt.consideration_vein_graft'));
    }

    return {
      score,
      ischemicBenefit,
      bleedingRisk,
      netBenefit,
      recommendation,
      durationGuidance,
      clinicalConsiderations,
      riskBalance: {
        ischemicReduction,
        bleedingIncrease,
        netClinicalBenefit
      }
    };
  };

  const handleCalculate = () => {
    if (validateForm()) {
      setIsCalculating(true);
      
      setTimeout(() => {
        const calculatedResult = calculateDAPTScore();
        setResult(calculatedResult);
        setShowResult(true);
        setIsCalculating(false);
      }, 1500);
    }
  };

  const handleReset = () => {
    setFormData({
      age: '',
      cigaretteSmoking: false,
      diabetesMellitus: false,
      miAtPresentation: false,
      priorPCIOrMI: false,
      paclitaxelElutingStent: false,
      stentDiameter: '',
      chfOrLVEF: false,
      veinGraftPCI: false
    });
    setResult(null);
    setErrors({});
    setCurrentStep(1);
    setShowResult(false);
  };

  const getInterpretation = (category: string, score: number) => {
    if (score >= 2) {
      return t('calculators.cardiology.dapt.interpretation_high', { score });
    } else if (score >= 1) {
      return t('calculators.cardiology.dapt.interpretation_intermediate', { score });
    } else {
      return t('calculators.cardiology.dapt.interpretation_low', { score });
    }
  };

  const getRiskLevel = (category: string): 'low' | 'borderline' | 'intermediate' | 'high' => {
    return category === 'low' ? 'low' : category === 'intermediate' ? 'intermediate' : 'high';
  };

  const getBenefitInfo = (benefit: string) => {
    switch (benefit) {
      case 'favorable':
        return { icon: Shield, label: t('calculators.cardiology.dapt.favorable_benefit'), color: 'green', description: t('calculators.cardiology.dapt.benefits_outweigh_risks') };
      case 'uncertain':
        return { icon: AlertTriangle, label: t('calculators.cardiology.dapt.uncertain_benefit'), color: 'orange', description: t('calculators.cardiology.dapt.requires_individual_assessment') };
      case 'unfavorable':
        return { icon: Zap, label: t('calculators.cardiology.dapt.unfavorable_benefit'), color: 'red', description: t('calculators.cardiology.dapt.risks_outweigh_benefits') };
      default:
        return { icon: Brain, label: t('calculators.cardiology.dapt.assessment_required'), color: 'gray', description: t('calculators.cardiology.dapt.clinical_evaluation_needed') };
    }
  };

  return (
    <CalculatorContainer
      title={t('calculators.cardiology.dapt.title')}
      subtitle={t('calculators.cardiology.dapt.subtitle')}
      icon={Pill}
      gradient="medical"
      className="max-w-6xl mx-auto"
    >
      <div className="space-y-8">
        {/* Alert */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                {t('calculators.cardiology.dapt.therapy_management_tool')}
              </h3>
              <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                {t('calculators.cardiology.dapt.tool_description')}
              </p>
              <div className="mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  {t('calculators.cardiology.dapt.study_validated')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {!showResult ? (
          <>
            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  currentStep >= 1 ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('calculators.cardiology.dapt.patient_profile')}</span>
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
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('calculators.cardiology.dapt.risk_assessment')}</span>
              </div>
              <div className={`w-16 h-1 rounded-full transition-all duration-300 ${
                currentStep >= 3 ? 'bg-purple-500' : 'bg-gray-200'
              }`}></div>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  currentStep >= 3 ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('calculators.cardiology.dapt.dapt_analysis')}</span>
              </div>
            </div>

            {/* Step 1: Patient Demographics and Procedure Details */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.dapt.demographics_section')}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.cardiology.dapt.demographics_description')}</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <CalculatorInput
                    label={t('calculators.cardiology.dapt.age_label')}
                    value={formData.age}
                    onChange={(value) => setFormData({ ...formData, age: value })}
                    error={errors.age}
                    helpText={t('calculators.cardiology.dapt.age_help')}
                    icon={User}
                    type="number"
                    placeholder="65"
                    unit={t('medical.years')}
                    min={18}
                    max={120}
                    required
                  />

                  <CalculatorInput
                    label={t('calculators.cardiology.dapt.stent_diameter_label')}
                    value={formData.stentDiameter}
                    onChange={(value) => setFormData({ ...formData, stentDiameter: value })}
                    error={errors.stentDiameter}
                    helpText={t('calculators.cardiology.dapt.stent_diameter_help')}
                    icon={Target}
                    type="number"
                    placeholder="3.0"
                    unit="mm"
                    step={0.1}
                    min={1}
                    max={10}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <CalculatorButton
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.age || !formData.stentDiameter}
                    className="enhanced-calculator-button"
                  >
                    {t('calculators.cardiology.dapt.next_risk_factors')}
                  </CalculatorButton>
                </div>
              </div>
            )}

            {/* Step 2: Clinical Risk Factors */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.dapt.risk_factors_section')}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.cardiology.dapt.risk_factors_description')}</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <CalculatorCheckbox
                    label={t('calculators.cardiology.dapt.cigarette_smoking')}
                    checked={formData.cigaretteSmoking}
                    onChange={(checked) => setFormData({ ...formData, cigaretteSmoking: checked })}
                    description={t('calculators.cardiology.dapt.cigarette_smoking_desc')}
                    icon={Zap}
                  />

                  <CalculatorCheckbox
                    label={t('calculators.cardiology.dapt.diabetes_mellitus')}
                    checked={formData.diabetesMellitus}
                    onChange={(checked) => setFormData({ ...formData, diabetesMellitus: checked })}
                    description={t('calculators.cardiology.dapt.diabetes_mellitus_desc')}
                    icon={Droplets}
                  />

                  <CalculatorCheckbox
                    label={t('calculators.cardiology.dapt.mi_at_presentation')}
                    checked={formData.miAtPresentation}
                    onChange={(checked) => setFormData({ ...formData, miAtPresentation: checked })}
                    description={t('calculators.cardiology.dapt.mi_at_presentation_desc')}
                    icon={Heart}
                  />

                  <CalculatorCheckbox
                    label={t('calculators.cardiology.dapt.prior_pci_mi')}
                    checked={formData.priorPCIOrMI}
                    onChange={(checked) => setFormData({ ...formData, priorPCIOrMI: checked })}
                    description={t('calculators.cardiology.dapt.prior_pci_mi_desc')}
                    icon={FileText}
                  />

                  <CalculatorCheckbox
                    label={t('calculators.cardiology.dapt.paclitaxel_stent')}
                    checked={formData.paclitaxelElutingStent}
                    onChange={(checked) => setFormData({ ...formData, paclitaxelElutingStent: checked })}
                    description={t('calculators.cardiology.dapt.paclitaxel_stent_desc')}
                    icon={Target}
                  />

                  <CalculatorCheckbox
                    label={t('calculators.cardiology.dapt.chf_lvef')}
                    checked={formData.chfOrLVEF}
                    onChange={(checked) => setFormData({ ...formData, chfOrLVEF: checked })}
                    description={t('calculators.cardiology.dapt.chf_lvef_desc')}
                    icon={Heart}
                  />
                </div>

                <div className="flex justify-between">
                  <CalculatorButton
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                  >
                    {t('common.back')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={() => setCurrentStep(3)}
                    className="enhanced-calculator-button"
                  >
                    {t('calculators.cardiology.dapt.next_specialized_factors')}
                  </CalculatorButton>
                </div>
              </div>
            )}

            {/* Step 3: Specialized Procedural Factors */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl border border-orange-200 dark:border-orange-800">
                    <Stethoscope className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.dapt.specialized_factors_section')}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.cardiology.dapt.specialized_factors_description')}</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <CalculatorCheckbox
                    label={t('calculators.cardiology.dapt.vein_graft_pci')}
                    checked={formData.veinGraftPCI}
                    onChange={(checked) => setFormData({ ...formData, veinGraftPCI: checked })}
                    description={t('calculators.cardiology.dapt.vein_graft_pci_desc')}
                    icon={Shield}
                  />
                </div>

                <div className="flex justify-between">
                  <CalculatorButton
                    onClick={() => setCurrentStep(2)}
                    variant="outline"
                  >
                    {t('common.back')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={handleCalculate}
                    loading={isCalculating}
                    className="enhanced-calculator-button"
                  >
                    {isCalculating ? t('common.calculating') : t('calculators.cardiology.dapt.calculate_button')}
                  </CalculatorButton>
                </div>
              </div>
            )}
          </>
        ) : (
          result && (
            <div className="animate-fadeIn">
              {/* Hero Results Card - Matching AF Calculator Style */}
              <div className={`relative overflow-hidden rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl shadow-black/5 dark:shadow-black/20 mb-8 ${
                result.score >= 2 ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20' :
                result.score >= 0 ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-orange-950/20' :
                'bg-gradient-to-br from-rose-50 via-red-50 to-pink-50 dark:from-rose-950/20 dark:via-red-950/20 dark:to-pink-950/20'
              }`}>
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80"></div>
                
                <div className="relative p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {t('calculators.cardiology.dapt.score_analysis')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {getInterpretation(result.ischemicBenefit, result.score)}
                    </p>
                  </div>

                  {/* Central Score Display with Circular Progress */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                      {/* Circular Progress Ring */}
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                        {/* Background circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${((result.score + 2) / 6) * 314} 314`}
                          strokeLinecap="round"
                          className={`transition-all duration-1000 ease-out ${
                            result.score >= 2 ? 'text-emerald-500' :
                            result.score >= 0 ? 'text-amber-500' :
                            'text-rose-500'
                          }`}
                        />
                      </svg>
                      
                      {/* Score Display */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${
                          result.score >= 2 ? 'text-emerald-600 dark:text-emerald-400' :
                          result.score >= 0 ? 'text-amber-600 dark:text-amber-400' :
                          'text-rose-600 dark:text-rose-400'
                        }`}>
                          {result.score}
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t('calculators.common.points')}
                        </span>
                      </div>
                    </div>

                    {/* Risk Category Badge */}
                    <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-full font-medium text-sm ${
                      result.score >= 2 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                      result.score >= 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        result.score >= 2 ? 'bg-emerald-500' :
                        result.score >= 0 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}></div>
                      {result.score >= 2 ? t('calculators.cardiology.dapt.high_risk') :
                       result.score >= 0 ? t('calculators.cardiology.dapt.intermediate_risk') :
                       t('calculators.cardiology.dapt.low_risk')} Benefit
                    </div>
                  </div>

                  {/* Risk Analysis Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 border border-white/40 dark:border-gray-700/40">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg mr-3">
                          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.dapt.ischemic_benefit')}</h4>
                      </div>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{t(`calculators.cardiology.dapt.${result.ischemicBenefit}_risk`)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('calculators.cardiology.dapt.mace_reduction', { reduction: result.riskBalance.ischemicReduction })}</p>
                    </div>
                    
                    <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 border border-white/40 dark:border-gray-700/40">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-red-500/10 rounded-lg mr-3">
                          <Droplets className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.dapt.bleeding_risk')}</h4>
                      </div>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">{t(`calculators.cardiology.dapt.${result.bleedingRisk}_risk`)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('calculators.cardiology.dapt.bleeding_increase', { increase: result.riskBalance.bleedingIncrease })}</p>
                    </div>
                    
                    <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 border border-white/40 dark:border-gray-700/40">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                          <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.cardiology.dapt.net_benefit')}</h4>
                      </div>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{getBenefitInfo(result.netBenefit).label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{getBenefitInfo(result.netBenefit).description}</p>
                    </div>
                  </div>

                  {/* Clinical Recommendation */}
                  <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 border border-white/40 dark:border-gray-700/40 mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('calculators.cardiology.dapt.duration_recommendation')}</h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result.durationGuidance}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Clinical Considerations */}
                  <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 border border-white/40 dark:border-gray-700/40">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('calculators.cardiology.dapt.clinical_considerations')}</h4>
                        <ul className="space-y-2">
                          {result.clinicalConsiderations.map((consideration, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300">{consideration}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interpretation Guide */}
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('calculators.cardiology.dapt.interpretation_guide')}</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Award className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{t('calculators.cardiology.dapt.score_high')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('calculators.cardiology.dapt.score_high_desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <BarChart3 className="w-5 h-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{t('calculators.cardiology.dapt.score_intermediate')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('calculators.cardiology.dapt.score_intermediate_desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{t('calculators.cardiology.dapt.score_low')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('calculators.cardiology.dapt.score_low_desc')}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                   <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    {t('calculators.cardiology.dapt.algorithm_validation')}
                  </p>
                </div>
              </div>

              {/* Creator Insights Section */}
              <div className="relative mt-8">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 rounded-2xl" />
                
                <div className="relative backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-xl">
                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25">
                        <UserCheck className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                        {t('calculators.cardiology.dapt.creator_insights_title')}
                      </h3>
                    </div>

                    {/* Creator Profile */}
                    <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40 mb-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                            {t('calculators.cardiology.dapt.creator_name')}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {t('calculators.cardiology.dapt.creator_bio')}
                          </p>
                          <a 
                            href="https://pubmed.ncbi.nlm.nih.gov/?term=Yeh+RW%5BAu%5D" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Publications on PubMed
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Condensed Insight */}
                    <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25">
                          <Lightbulb className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                            {t('calculators.cardiology.dapt.creator_insight_condensed')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence Section */}
              <div className="relative mt-8">
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
                        {t('calculators.cardiology.dapt.evidence_title')}
                      </h3>
                    </div>

                    <div className="grid gap-4 sm:gap-6">
                      {/* Formula Section */}
                      <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                              {t('calculators.cardiology.dapt.evidence_formula_title')}
                            </h4>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                                <p className="font-mono">{t('calculators.cardiology.dapt.formula_description')}</p>
                                <div className="mt-3 space-y-1">
                                  <p><strong>{t('calculators.cardiology.dapt.age_scoring')}</strong></p>
                                  <p><strong>{t('calculators.cardiology.dapt.risk_factors_scoring')}</strong></p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                {t('calculators.cardiology.dapt.interpretation_note')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Evidence Cards */}
                      <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              {t('calculators.cardiology.dapt.evidence_validation_title')}
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {t('calculators.cardiology.dapt.evidence_validation_description')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 dark:border-gray-700/40 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              {t('calculators.cardiology.dapt.evidence_guidelines_title')}
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {t('calculators.cardiology.dapt.evidence_guidelines_description')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Reference Links */}
                      <div className="bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                          <BookOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                          {t('calculators.cardiology.dapt.references_title')}
                        </h4>
                        <div className="space-y-3">
                          <a 
                            href="https://jamanetwork.com/journals/jama/fullarticle/2516815"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-white/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                          >
                            <div className="p-2 bg-blue-500/10 rounded-lg mr-3 group-hover:bg-blue-500/20 transition-colors">
                              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                              {t('calculators.cardiology.dapt.reference_original')}
                            </span>
                            <ExternalLink className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                          </a>
                          
                          <a 
                            href="https://www.sciencedirect.com/science/article/pii/S0003497516309080"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-white/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                          >
                            <div className="p-2 bg-indigo-500/10 rounded-lg mr-3 group-hover:bg-indigo-500/20 transition-colors">
                              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                              {t('calculators.cardiology.dapt.reference_validation')}
                            </span>
                            <ExternalLink className="w-4 h-4 ml-auto text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                          </a>

                          <a 
                            href="https://www.sciencedirect.com/science/article/pii/S0735109716004549"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-white/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                          >
                            <div className="p-2 bg-green-500/10 rounded-lg mr-3 group-hover:bg-green-500/20 transition-colors">
                              <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="font-medium text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300">
                              {t('calculators.cardiology.dapt.reference_guidelines')}
                            </span>
                            <ExternalLink className="w-4 h-4 ml-auto text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <CalculatorButton
                  onClick={handleReset}
                  className="enhanced-calculator-button"
                >
                  <TimerIcon className="w-4 h-4 mr-2" />
                  {t('calculators.cardiology.dapt.new_assessment')}
                </CalculatorButton>
              </div>
            </div>
          )
        )}
      </div>
    </CalculatorContainer>
  );
} 