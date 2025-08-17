import React, { useState, useEffect, useRef } from 'react';
import { Heart, Baby, AlertTriangle, Info, CheckCircle, Clock, User, Activity, Target, Stethoscope, Award, Shield, Sparkles, AlertCircle, RefreshCw, ArrowRight, ArrowLeft, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CalculatorContainer, 
  CalculatorInput, 
  CalculatorSelect, 
  CalculatorCheckbox, 
  CalculatorButton, 
  ResultsDisplay 
} from '../ui/calculator-ui';
import { CalculatorResultShare } from './CalculatorResultShare';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { useTranslation } from '../../hooks/useTranslation';
import { ApgarScoreInput, ApgarScoreResult } from '../../types/obgyn-calculators';
import { calculateOBGYN, validateOBGYNInput } from '../../services/obgynCalculatorService';

interface FormData {
  heartRate: 'absent' | 'slow' | 'normal' | '';
  respiratoryEffort: 'absent' | 'weak' | 'strong' | '';
  muscletone: 'limp' | 'some-flexion' | 'active' | '';
  reflexResponse: 'no-response' | 'grimace' | 'cry' | '';
  colorAppearance: 'blue-pale' | 'acrocyanotic' | 'pink' | '';
  timepoint: '1-min' | '5-min' | '10-min';
}

export const ApgarScoreCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'calculator' | 'about'>('calculator');
  const [formData, setFormData] = useState<FormData>({
    heartRate: '',
    respiratoryEffort: '',
    muscletone: '',
    reflexResponse: '',
    colorAppearance: '',
    timepoint: '1-min'
  });
  
  const [result, setResult] = useState<ApgarScoreResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.heartRate) {
      newErrors.heartRate = t('calculators.obgyn.apgar_score.heart_rate_required');
    }

    if (!formData.respiratoryEffort) {
      newErrors.respiratoryEffort = t('calculators.obgyn.apgar_score.respiratory_effort_required');
    }

    if (!formData.muscletone) {
      newErrors.muscletone = t('calculators.obgyn.apgar_score.muscle_tone_required');
    }

    if (!formData.reflexResponse) {
      newErrors.reflexResponse = t('calculators.obgyn.apgar_score.reflex_response_required');
    }

    if (!formData.colorAppearance) {
      newErrors.colorAppearance = t('calculators.obgyn.apgar_score.color_appearance_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validateForm()) return;

    setIsCalculating(true);
    
    setTimeout(async () => {
      const [calculationResult, error] = await safeAsync(
        async () => {
          const input: ApgarScoreInput = {
            heartRate: formData.heartRate as 'absent' | 'slow' | 'normal',
            respiratoryEffort: formData.respiratoryEffort as 'absent' | 'weak' | 'strong',
            muscletone: formData.muscletone as 'limp' | 'some-flexion' | 'active',
            reflexResponse: formData.reflexResponse as 'no-response' | 'grimace' | 'cry',
            colorAppearance: formData.colorAppearance as 'blue-pale' | 'acrocyanotic' | 'pink',
            timepoint: formData.timepoint,
            calculationDate: new Date().toISOString()
          };

          const validation = validateOBGYNInput('apgar-score', input);
          if (!validation.isValid) {
            setErrors(validation.errors.reduce((acc, error, index) => ({ ...acc, [`error_${index}`]: error }), {}));
            throw new Error('Validation failed');
          }

          return calculateOBGYN('apgar-score', input) as ApgarScoreResult;
        },
        {
          context: 'calculate APGAR score',
          showToast: true,
          severity: ErrorSeverity.HIGH
        }
      );

      if (error) {
        setErrors({ calculation: error.userMessage || t('calculators.obgyn.apgar_score.calculation_error') });
      } else {
        setResult(calculationResult);
      }
      
      setIsCalculating(false);
    }, 1500);
  };

  const handleReset = () => {
    setFormData({
      heartRate: '',
      respiratoryEffort: '',
      muscletone: '',
      reflexResponse: '',
      colorAppearance: '',
      timepoint: '1-min'
    });
    setResult(null);
    setErrors({});
    setIsCalculating(false);
    setCurrentStep(1);
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return 'text-red-600 bg-red-50 border-red-200';
    if (score <= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getAssessmentColor = (assessment: string) => {
    switch (assessment) {
      case 'severely-depressed': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderately-depressed': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'calculator' | 'about')} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="calculator">{t('calculators.common.calculator')}</TabsTrigger>
        <TabsTrigger value="about">{t('calculators.common.about')}</TabsTrigger>
      </TabsList>

      <TabsContent value="calculator" className="space-y-6">
        <CalculatorContainer
          title={t('calculators.obgyn.apgar_score.title')}
          subtitle={t('calculators.obgyn.apgar_score.subtitle')}
          icon={Baby}
          gradient="obgyn"
          className="max-w-5xl mx-auto"
        >
          <div className="space-y-8">
            {/* Error Display */}
            {errors.calculation && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 dark:text-red-300 font-medium">{errors.calculation}</span>
                </div>
              </div>
            )}

            {/* OB/GYN Apgar Alert */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Baby className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">{t('calculators.obgyn.apgar_score.system_title')}</h4>
                  <p className="text-green-700 dark:text-green-300 leading-relaxed">
                    {t('calculators.obgyn.apgar_score.system_description')}
                  </p>
                  <div className="mt-3 inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 rounded-lg px-3 py-1">
                    <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">{t('calculators.obgyn.apgar_score.guidelines')}</span>
                  </div>
                </div>
              </div>
            </div>

            {!result ? (
              <div className="space-y-8">
                {/* Time Point Selection */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                    <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.obgyn.apgar_score.time_point_title')}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.obgyn.apgar_score.time_point_description')}</p>
                  
                  <div className="flex justify-center space-x-4 mt-6">
                    {[
                      { value: '1-min', label: t('calculators.obgyn.apgar_score.time_points.one_minute.label'), description: t('calculators.obgyn.apgar_score.time_points.one_minute.description') },
                      { value: '5-min', label: t('calculators.obgyn.apgar_score.time_points.five_minutes.label'), description: t('calculators.obgyn.apgar_score.time_points.five_minutes.description') },
                      { value: '10-min', label: t('calculators.obgyn.apgar_score.time_points.ten_minutes.label'), description: t('calculators.obgyn.apgar_score.time_points.ten_minutes.description') }
                    ].map((time) => (
                      <button
                        key={time.value}
                        onClick={() => setFormData({ ...formData, timepoint: time.value as '1-min' | '5-min' | '10-min' })}
                        className={`p-4 rounded-xl text-center transition-all duration-300 border-2 ${
                          formData.timepoint === time.value
                            ? 'bg-green-100 border-green-300 text-green-800 shadow-lg transform scale-105'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-semibold">{time.label}</div>
                        <div className="text-xs mt-1">{time.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assessment Parameters */}
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                      <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.obgyn.apgar_score.parameters_title')}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.obgyn.apgar_score.parameters_description')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Heart Rate (Pulse) */}
                    <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                      <div className="flex items-center space-x-3 mb-4">
                        <Heart className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-red-800 dark:text-red-200">{t('calculators.obgyn.apgar_score.heart_rate.title')}</h4>
                      </div>
                      
                      <CalculatorSelect
                        label={t('calculators.obgyn.apgar_score.heart_rate.label')}
                        value={formData.heartRate}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, heartRate: e.target.value as typeof formData.heartRate })}
                        options={[
                          { value: '', label: t('calculators.obgyn.apgar_score.heart_rate.select') },
                          { value: 'absent', label: t('calculators.obgyn.apgar_score.heart_rate.options.absent') },
                          { value: 'slow', label: t('calculators.obgyn.apgar_score.heart_rate.options.slow') },
                          { value: 'normal', label: t('calculators.obgyn.apgar_score.heart_rate.options.normal') }
                        ]}
                        error={errors.heartRate}
                        helpText={t('calculators.obgyn.apgar_score.heart_rate.help')}
                        icon={Heart}
                      />

                      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                        <h5 className="font-semibold text-red-800 dark:text-red-200 mb-2">{t('calculators.obgyn.apgar_score.heart_rate.guide_title')}</h5>
                        <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                          <p>• {t('calculators.obgyn.apgar_score.heart_rate.guide.absent')}</p>
                          <p>• {t('calculators.obgyn.apgar_score.heart_rate.guide.slow')}</p>
                          <p>• {t('calculators.obgyn.apgar_score.heart_rate.guide.normal')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Respiratory Effort */}
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                      <div className="flex items-center space-x-3 mb-4">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">{t('calculators.obgyn.apgar_score.respiratory_effort.title')}</h4>
                      </div>
                      
                      <CalculatorSelect
                        label={t('calculators.obgyn.apgar_score.respiratory_effort.label')}
                        value={formData.respiratoryEffort}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, respiratoryEffort: e.target.value as typeof formData.respiratoryEffort })}
                        options={[
                          { value: '', label: t('calculators.obgyn.apgar_score.respiratory_effort.select') },
                          { value: 'absent', label: t('calculators.obgyn.apgar_score.respiratory_effort.options.absent') },
                          { value: 'weak', label: t('calculators.obgyn.apgar_score.respiratory_effort.options.weak') },
                          { value: 'strong', label: t('calculators.obgyn.apgar_score.respiratory_effort.options.strong') }
                        ]}
                        error={errors.respiratoryEffort}
                        helpText={t('calculators.obgyn.apgar_score.respiratory_effort.help')}
                        icon={Activity}
                      />

                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">{t('calculators.obgyn.apgar_score.respiratory_effort.guide_title')}</h5>
                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <p>• {t('calculators.obgyn.apgar_score.respiratory_effort.guide.absent')}</p>
                          <p>• {t('calculators.obgyn.apgar_score.respiratory_effort.guide.weak')}</p>
                          <p>• {t('calculators.obgyn.apgar_score.respiratory_effort.guide.strong')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Muscle Tone */}
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                      <div className="flex items-center space-x-3 mb-4">
                        <Target className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-green-800 dark:text-green-200">{t('calculators.obgyn.apgar_score.muscle_tone.title')}</h4>
                      </div>

                      <CalculatorSelect
                        label={t('calculators.obgyn.apgar_score.muscle_tone.label')}
                        value={formData.muscletone}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, muscletone: e.target.value as typeof formData.muscletone })}
                        options={[
                          { value: '', label: t('calculators.obgyn.apgar_score.muscle_tone.select') },
                          { value: 'limp', label: t('calculators.obgyn.apgar_score.muscle_tone.options.limp') },
                          { value: 'some-flexion', label: t('calculators.obgyn.apgar_score.muscle_tone.options.some_flexion') },
                          { value: 'active', label: t('calculators.obgyn.apgar_score.muscle_tone.options.active') }
                        ]}
                        error={errors.muscletone}
                        helpText={t('calculators.obgyn.apgar_score.muscle_tone.help')}
                        icon={Target}
                      />

                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                        <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">{t('calculators.obgyn.apgar_score.muscle_tone.guide_title')}</h5>
                        <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          <p>• {t('calculators.obgyn.apgar_score.muscle_tone.guide.limp')}</p>
                          <p>• {t('calculators.obgyn.apgar_score.muscle_tone.guide.some_flexion')}</p>
                          <p>• {t('calculators.obgyn.apgar_score.muscle_tone.guide.active')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Reflex Response */}
                    <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
                      <div className="flex items-center space-x-3 mb-4">
                        <Shield className="w-5 h-5 text-yellow-600" />
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">{t('calculators.obgyn.apgar_score.reflex_response.title')}</h4>
                      </div>

                      <CalculatorSelect
                        label={t('calculators.obgyn.apgar_score.reflex_response.label')}
                        value={formData.reflexResponse}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, reflexResponse: e.target.value as typeof formData.reflexResponse })}
                        options={[
                          { value: '', label: t('calculators.obgyn.apgar_score.reflex_response.select') },
                          { value: 'no-response', label: t('calculators.obgyn.apgar_score.reflex_response.options.no_response') },
                          { value: 'grimace', label: t('calculators.obgyn.apgar_score.reflex_response.options.grimace') },
                          { value: 'cry', label: t('calculators.obgyn.apgar_score.reflex_response.options.cry') }
                        ]}
                        error={errors.reflexResponse}
                        helpText={t('calculators.obgyn.apgar_score.reflex_response.help')}
                        icon={Shield}
                      />

                      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">{t('calculators.obgyn.apgar_score.reflex_response.guide_title')}</h5>
                        <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                          <p>• {t('calculators.obgyn.apgar_score.reflex_response.guide.no_response')}</p>
                          <p>• {t('calculators.obgyn.apgar_score.reflex_response.guide.grimace')}</p>
                          <p>• {t('calculators.obgyn.apgar_score.reflex_response.guide.cry')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Color Appearance */}
                  <div className="max-w-2xl mx-auto">
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl">
                      <div className="flex items-center space-x-3 mb-4">
                        <User className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">{t('calculators.obgyn.apgar_score.color_appearance.title')}</h4>
                      </div>
                      
                      <CalculatorSelect
                        label={t('calculators.obgyn.apgar_score.color_appearance.label')}
                        value={formData.colorAppearance}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, colorAppearance: e.target.value as typeof formData.colorAppearance })}
                        options={[
                          { value: '', label: t('calculators.obgyn.apgar_score.color_appearance.select') },
                          { value: 'blue-pale', label: t('calculators.obgyn.apgar_score.color_appearance.options.blue_pale') },
                          { value: 'acrocyanotic', label: t('calculators.obgyn.apgar_score.color_appearance.options.acrocyanotic') },
                          { value: 'pink', label: t('calculators.obgyn.apgar_score.color_appearance.options.pink') }
                        ]}
                        error={errors.colorAppearance}
                        helpText={t('calculators.obgyn.apgar_score.color_appearance.help')}
                        icon={User}
                      />

                      <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg">
                        <h5 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">{t('calculators.obgyn.apgar_score.color_appearance.guide_title')}</h5>
                        <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                          <p>• {t('calculators.obgyn.apgar_score.color_appearance.guide.blue_pale')}</p>
                          <p>• {t('calculators.obgyn.apgar_score.color_appearance.guide.acrocyanotic')}</p>
                          <p>• {t('calculators.obgyn.apgar_score.color_appearance.guide.pink')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculate Button */}
                <div className="flex justify-center">
                  <CalculatorButton
                    onClick={handleCalculate}
                    loading={isCalculating}
                    icon={Baby}
                    size="lg"
                    className="enhanced-calculator-button"
                  >
                    {t('calculators.obgyn.apgar_score.calculate_button')}
                  </CalculatorButton>
                </div>
              </div>
            ) : (
              /* Results Display with proper null checks */
              <div className="space-y-8 animate-scaleIn">
                <ResultsDisplay
                  title={t('calculators.obgyn.apgar_score.results.title')}
                  value={`${result.totalScore}/10`}
                  category={result.assessment === 'excellent' ? 'high' : result.assessment === 'moderately-depressed' ? 'intermediate' : 'low'}
                  interpretation={
                    t('calculators.obgyn.apgar_score.interpretation_templates.score_template', {
                      score: result.interpretationData.score.toString(),
                      time: t(`calculators.obgyn.apgar_score.interpretation_templates.time_display.${result.interpretationData.timeKey}`),
                      condition: t(`calculators.obgyn.apgar_score.result_interpretations.${result.interpretationData.conditionKey}`)
                    }) +
                    (result.interpretationData.timeKey === '1-min' 
                      ? ' ' + t('calculators.obgyn.apgar_score.interpretation_templates.followup_one_min')
                      : result.interpretationData.needsFollowup 
                        ? ' ' + t('calculators.obgyn.apgar_score.interpretation_templates.followup_five_min_low')
                        : '')
                  }
                  icon={Baby}
                >
                  {/* Score Display */}
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Baby className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-800 dark:text-green-200">{t('calculators.obgyn.apgar_score.results.total_score')}: {result.totalScore}/10</span>
                    </div>
                    <div className={`inline-flex items-center space-x-1 rounded-lg px-3 py-1 ${getScoreColor(result.totalScore)}`}>
                      {result.totalScore >= 7 ? 
                        <CheckCircle className="w-4 h-4" /> : 
                        result.totalScore >= 4 ?
                        <AlertTriangle className="w-4 h-4" /> :
                        <AlertTriangle className="w-4 h-4" />
                      }
                      <span className="text-xs font-semibold">{result.assessment.charAt(0).toUpperCase() + result.assessment.slice(1).replace('-', ' ')}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <CalculatorButton
                      onClick={handleReset}
                      variant="outline"
                      size="lg"
                      icon={Baby}
                    >
                      {t('calculators.obgyn.apgar_score.new_assessment')}
                    </CalculatorButton>
                    <CalculatorButton
                      onClick={() => setResult(null)}
                      variant="secondary"
                      size="lg"
                    >
                      {t('calculators.obgyn.apgar_score.modify_assessment')}
                    </CalculatorButton>
                  </div>
                </ResultsDisplay>
              </div>
            )}

            {/* Footer Information */}
            <div className="text-center pt-8 border-t border-white/20 dark:border-gray-800/20">
              <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Info className="w-4 h-4" />
                <span>{t('calculators.obgyn.apgar_score.footer.clinical_use')}</span>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-semibold">{t('calculators.obgyn.apgar_score.footer.guidelines')}</span>
                </div>
              </div>
            </div>
          </div>
        </CalculatorContainer>
      </TabsContent>

      <TabsContent value="about" className="space-y-6">
        <CalculatorContainer
          title={t('calculators.obgyn.apgar_score.about.title')}
          subtitle={t('calculators.obgyn.apgar_score.about.subtitle')}
          icon={Baby}
          gradient="obgyn"
          className="max-w-5xl mx-auto"
        >
          <div className="space-y-8">
            {/* Clinical Purpose */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Stethoscope className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-3">{t('calculators.obgyn.apgar_score.about.clinical_purpose.title')}</h3>
                  <p className="text-green-700 dark:text-green-300 leading-relaxed">
                    {t('calculators.obgyn.apgar_score.about.clinical_purpose.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* APGAR Components */}
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-blue-800 dark:text-blue-200">{t('calculators.obgyn.apgar_score.about.components.title')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">{t('calculators.obgyn.apgar_score.about.components.mnemonic.title')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li><strong>A</strong> - {t('calculators.obgyn.apgar_score.about.components.mnemonic.appearance')}</li>
                      <li><strong>P</strong> - {t('calculators.obgyn.apgar_score.about.components.mnemonic.pulse')}</li>
                      <li><strong>G</strong> - {t('calculators.obgyn.apgar_score.about.components.mnemonic.grimace')}</li>
                      <li><strong>A</strong> - {t('calculators.obgyn.apgar_score.about.components.mnemonic.activity')}</li>
                      <li><strong>R</strong> - {t('calculators.obgyn.apgar_score.about.components.mnemonic.respiration')}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">{t('calculators.obgyn.apgar_score.about.components.scoring.title')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li>• {t('calculators.obgyn.apgar_score.about.components.scoring.scale')}</li>
                      <li>• {t('calculators.obgyn.apgar_score.about.components.scoring.total')}</li>
                      <li>• {t('calculators.obgyn.apgar_score.about.components.scoring.higher')}</li>
                      <li>• {t('calculators.obgyn.apgar_score.about.components.scoring.timing')}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <Info className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-3">{t('calculators.obgyn.apgar_score.about.considerations.title')}</h3>
                  <div className="space-y-2 text-amber-700 dark:text-amber-300 text-sm">
                    <p>• {t('calculators.obgyn.apgar_score.about.considerations.resuscitation')}</p>
                    <p>• {t('calculators.obgyn.apgar_score.about.considerations.factors')}</p>
                    <p>• {t('calculators.obgyn.apgar_score.about.considerations.serial')}</p>
                    <p>• {t('calculators.obgyn.apgar_score.about.considerations.investigation')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CalculatorContainer>
      </TabsContent>
    </Tabs>
  );
}; 