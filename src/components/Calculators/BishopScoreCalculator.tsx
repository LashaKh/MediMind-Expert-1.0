import React, { useState, useCallback, useMemo } from 'react';
import { Calculator, Info, AlertTriangle, CheckCircle, Target, Star, User, Activity, BarChart3, Stethoscope, Award, Shield, Clock, Baby, Zap } from 'lucide-react';
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
import { calculateOBGYN, validateOBGYNInput, calculateBishopScore } from '../../services/obgynCalculatorService';
import { BishopScoreInput, BishopScoreResult } from '../../types/obgyn-calculators';
import { useTranslation } from '../../hooks/useTranslation';
import { safe, ErrorSeverity } from '../../lib/utils/errorHandling';

interface FormData {
  cervicalDilation: string;
  cervicalEffacement: string;
  cervicalConsistency: 'firm' | 'medium' | 'soft' | '';
  cervicalPosition: 'posterior' | 'mid' | 'anterior' | '';
  fetalStation: string;
}

const BishopScoreCalculatorComponent: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'calculator' | 'about'>('calculator');
  const [formData, setFormData] = useState<FormData>({
    cervicalDilation: '',
    cervicalEffacement: '',
    cervicalConsistency: '',
    cervicalPosition: '',
    fetalStation: ''
  });
  
  const [result, setResult] = useState<BishopScoreResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  
  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Check all required fields
    if (!formData.cervicalDilation) {
      newErrors.cervicalDilation = t('calculators.bishop_score.cervical_dilation_label') + ' is required';
    } else {
      const dilation = parseFloat(formData.cervicalDilation);
      if (isNaN(dilation) || dilation < 0 || dilation > 10) {
        newErrors.cervicalDilation = t('calculators.bishop_score.cervical_dilation_error');
      }
    }

    if (!formData.cervicalEffacement) {
      newErrors.cervicalEffacement = t('calculators.bishop_score.cervical_effacement_label') + ' is required';
    } else {
      const effacement = parseFloat(formData.cervicalEffacement);
      if (isNaN(effacement) || effacement < 0 || effacement > 100) {
        newErrors.cervicalEffacement = t('calculators.bishop_score.cervical_effacement_error');
      }
    }

    if (!formData.cervicalConsistency) {
      newErrors.cervicalConsistency = t('calculators.bishop_score.cervical_consistency_label') + ' is required';
    }

    if (!formData.cervicalPosition) {
      newErrors.cervicalPosition = t('calculators.bishop_score.cervical_position_label') + ' is required';
    }

    if (!formData.fetalStation) {
      newErrors.fetalStation = t('calculators.bishop_score.fetal_station_label') + ' is required';
    } else {
      const station = parseInt(formData.fetalStation);
      if (isNaN(station) || station < -3 || station > 3) {
        newErrors.fetalStation = t('calculators.bishop_score.fetal_station_error');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleCalculate = useCallback(() => {
    if (validateForm()) {
      const [result, error] = safe(() => {
        return calculateBishopScore({
          cervicalDilation: formData.cervicalDilation,
          cervicalEffacement: formData.cervicalEffacement,
          cervicalConsistency: formData.cervicalConsistency as 'firm' | 'medium' | 'soft',
          cervicalPosition: formData.cervicalPosition as 'posterior' | 'mid' | 'anterior',
          fetalStation: formData.fetalStation
        }, t);
      }, {
        context: 'Bishop score calculation',
        severity: ErrorSeverity.HIGH,
        showToast: true
      });

      if (error) {
        setErrors({
          general: t('common.calculation_failed')
        });
      } else {
        setResult(result);
        setErrors({});
      }
    }
  }, [validateForm, formData, t]);

  const handleReset = useCallback(() => {
    setFormData({
      cervicalDilation: '',
      cervicalEffacement: '',
      cervicalConsistency: '',
      cervicalPosition: '',
      fetalStation: ''
    });
    setResult(null);
    setErrors({});
    setIsCalculating(false);
    setCurrentStep(1);
  }, []);

  const getScoreColor = useMemo(() => (score: number) => {
    if (score <= 3) return 'text-red-600 bg-red-50 border-red-200';
    if (score <= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score <= 8) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  }, []);

  const getSuccessBgColor = useMemo(() => (success: string) => {
    switch (success) {
      case 'unlikely': return 'bg-red-50 border-red-200 text-red-800';
      case 'possible': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'likely': return 'bg-green-50 border-green-200 text-green-800';
      case 'very-likely': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }, []);
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'calculator' | 'about')} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="calculator">{t('common.calculator')}</TabsTrigger>
        <TabsTrigger value="about">{t('common.about')}</TabsTrigger>
      </TabsList>

      <TabsContent value="calculator">
        <CalculatorContainer
          title={t('calculators.bishop_score.title')}
          subtitle={t('calculators.bishop_score.subtitle')}
          icon={Target}
          gradient="obgyn"
          className="max-w-5xl mx-auto"
        >
          <div className="space-y-8">
            {/* OB/GYN Bishop Score Alert */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                  <Target className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-pink-800 dark:text-pink-200 mb-2">{t('calculators.bishop_score.assessment_tool')}</h4>
                  <p className="text-pink-700 dark:text-pink-300 leading-relaxed">
                    {t('calculators.bishop_score.tool_description')}
                  </p>
                  <div className="mt-3 inline-flex items-center space-x-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg px-3 py-1">
                    <Star className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    <span className="text-xs font-semibold text-pink-700 dark:text-pink-300">{t('calculators.bishop_score.based_on_bishop')}</span>
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
                      currentStep >= 1 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      1
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('calculators.bishop_score.cervical_assessment')}</span>
                  </div>
                  <div className={`w-16 h-1 rounded-full transition-all duration-300 ${
                    currentStep >= 2 ? 'bg-rose-500' : 'bg-gray-200'
                  }`}></div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      currentStep >= 3 ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      3
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.results')}</span>
                  </div>
                </div>

                {/* Step 1: Cervical Assessment */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl border border-pink-200 dark:border-pink-800">
                        <Activity className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.bishop_score.cervical_parameters_section')}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.bishop_score.cervical_parameters_description')}</p>
                    </div>

                    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                      {/* Cervical Dilation */}
                      <div className={`${isMobile ? 'p-4' : 'p-4 sm:p-6'} bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl`}>
                        <div className="flex items-center space-x-3 mb-4">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200">{t('calculators.bishop_score.cervical_dilation_label')}</h4>
                        </div>
                        
                        <CalculatorInput
                          label={t('calculators.bishop_score.cervical_dilation_label')}
                          value={formData.cervicalDilation}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cervicalDilation: e.target.value })}
                          type="number"
                          placeholder="2.0"
                          min={0}
                          max={10}
                          step={0.5}
                          unit={t('calculators.bishop_score.cervical_dilation_unit')}
                          error={errors.cervicalDilation}
                          helpText={t('calculators.bishop_score.cervical_dilation_help')}
                          icon={BarChart3}
                        />

                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                          <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">{t('calculators.bishop_score.scoring_system')}</h5>
                          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <p>• {t('calculators.bishop_score.dilation_score_0')}</p>
                            <p>• {t('calculators.bishop_score.dilation_score_1')}</p>
                            <p>• {t('calculators.bishop_score.dilation_score_2')}</p>
                            <p>• {t('calculators.bishop_score.dilation_score_3')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Cervical Effacement */}
                      <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <Activity className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-green-800 dark:text-green-200">{t('calculators.bishop_score.cervical_effacement_label')}</h4>
                        </div>
                        
                        <CalculatorInput
                          label={t('calculators.bishop_score.cervical_effacement_label')}
                          value={formData.cervicalEffacement}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cervicalEffacement: e.target.value })}
                          type="number"
                          placeholder="50"
                          min={0}
                          max={100}
                          step={5}
                          unit={t('calculators.bishop_score.cervical_effacement_unit')}
                          error={errors.cervicalEffacement}
                          helpText={t('calculators.bishop_score.cervical_effacement_help')}
                          icon={Activity}
                        />

                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                          <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">{t('calculators.bishop_score.scoring_system')}</h5>
                          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                            <p>• {t('calculators.bishop_score.effacement_score_0')}</p>
                            <p>• {t('calculators.bishop_score.effacement_score_1')}</p>
                            <p>• {t('calculators.bishop_score.effacement_score_2')}</p>
                            <p>• {t('calculators.bishop_score.effacement_score_3')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cervical Consistency and Position */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Cervical Consistency */}
                      <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <Shield className="w-5 h-5 text-yellow-600" />
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">{t('calculators.bishop_score.cervical_consistency_label')}</h4>
                        </div>
                        
                        <CalculatorSelect
                          label={t('calculators.bishop_score.cervical_consistency_label')}
                          value={formData.cervicalConsistency}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, cervicalConsistency: e.target.value as typeof formData.cervicalConsistency })}
                          options={[
                            { value: '', label: t('calculators.bishop_score.cervical_consistency_label') + '...' },
                            { value: 'firm', label: t('calculators.bishop_score.cervical_consistency_firm') + ' (0 points)' },
                            { value: 'medium', label: t('calculators.bishop_score.cervical_consistency_medium') + ' (1 point)' },
                            { value: 'soft', label: t('calculators.bishop_score.cervical_consistency_soft') + ' (2 points)' }
                          ]}
                          error={errors.cervicalConsistency}
                          helpText={t('calculators.bishop_score.cervical_consistency_help')}
                          icon={Shield}
                        />

                        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                          <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">{t('calculators.bishop_score.clinical_assessment')}</h5>
                          <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            <p>• {t('calculators.bishop_score.consistency_descriptions_firm')}</p>
                            <p>• {t('calculators.bishop_score.consistency_descriptions_medium')}</p>
                            <p>• {t('calculators.bishop_score.consistency_descriptions_soft')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Cervical Position */}
                      <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <Target className="w-5 h-5 text-red-600" />
                          <h4 className="font-semibold text-red-800 dark:text-red-200">{t('calculators.bishop_score.cervical_position_label')}</h4>
                        </div>
                        
                        <CalculatorSelect
                          label={t('calculators.bishop_score.cervical_position_label')}
                          value={formData.cervicalPosition}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, cervicalPosition: e.target.value as typeof formData.cervicalPosition })}
                          options={[
                            { value: '', label: t('calculators.bishop_score.cervical_position_label') + '...' },
                            { value: 'posterior', label: t('calculators.bishop_score.cervical_position_posterior') + ' (0 points)' },
                            { value: 'mid', label: t('calculators.bishop_score.cervical_position_mid') + ' (1 point)' },
                            { value: 'anterior', label: t('calculators.bishop_score.cervical_position_anterior') + ' (2 points)' }
                          ]}
                          error={errors.cervicalPosition}
                          helpText={t('calculators.bishop_score.cervical_position_help')}
                          icon={Target}
                        />

                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                          <h5 className="font-semibold text-red-800 dark:text-red-200 mb-2">{t('calculators.bishop_score.position_assessment')}</h5>
                          <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                            <p>• {t('calculators.bishop_score.position_descriptions_posterior')}</p>
                            <p>• {t('calculators.bishop_score.position_descriptions_mid')}</p>
                            <p>• {t('calculators.bishop_score.position_descriptions_anterior')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <CalculatorButton
                        onClick={() => setCurrentStep(2)}
                        className="enhanced-calculator-button"
                      >
                        {t('common.next')}: {t('calculators.bishop_score.fetal_station_label')}
                      </CalculatorButton>
                    </div>
                  </div>
                )}

                {/* Step 2: Fetal Position */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-900/20 dark:to-purple-900/20 rounded-2xl border border-rose-200 dark:border-rose-800">
                        <Baby className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.bishop_score.fetal_station_label')} {t('calculators.bishop_score.assessment_tool')}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.bishop_score.fetal_station_help')}</p>
                    </div>

                    {/* Fetal Station */}
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl">
                      <div className="flex items-center space-x-3 mb-4">
                        <Baby className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">{t('calculators.bishop_score.fetal_station_label')}</h4>
                      </div>
                      
                      <CalculatorSelect
                        label={t('calculators.bishop_score.fetal_station_label')}
                        value={formData.fetalStation}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, fetalStation: e.target.value })}
                        options={[
                          { value: '', label: t('calculators.bishop_score.fetal_station_label') + '...' },
                          { value: '-3', label: `-3 (${t('calculators.bishop_score.zero_points')}) - ${t('calculators.bishop_score.station_high_label')}` },
                          { value: '-2', label: `-2 (${t('calculators.bishop_score.zero_points')}) - ${t('calculators.bishop_score.station_high_label')}` },
                          { value: '-1', label: `-1 (${t('calculators.bishop_score.one_point')}) - ${t('calculators.bishop_score.station_mid_label')}` },
                          { value: '0', label: `0 (${t('calculators.bishop_score.two_points')}) - ${t('calculators.bishop_score.station_at_spines')}` },
                          { value: '1', label: `+1 (${t('calculators.bishop_score.three_points')}) - ${t('calculators.bishop_score.station_low_label')}` },
                          { value: '2', label: `+2 (${t('calculators.bishop_score.three_points')}) - ${t('calculators.bishop_score.station_low_label')}` },
                          { value: '3', label: `+3 (${t('calculators.bishop_score.three_points')}) - ${t('calculators.bishop_score.station_low_label')}` }
                        ]}
                        error={errors.fetalStation}
                        helpText={t('calculators.bishop_score.fetal_station_help')}
                        icon={Baby}
                      />

                      <div className="mt-6 p-6 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg">
                        <h5 className="font-semibold text-purple-800 dark:text-purple-200 mb-4">{t('calculators.bishop_score.fetal_station_label')} {t('calculators.bishop_score.reference_text')}</h5>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-sm text-purple-700 dark:text-purple-300">
                          <div>
                            <h6 className="font-semibold mb-2">{t('calculators.bishop_score.high_station')}</h6>
                            <p>• {t('calculators.bishop_score.high_station_description_1')}</p>
                            <p>• {t('calculators.bishop_score.high_station_description_2')}</p>
                            <p>• {t('calculators.bishop_score.high_station_description_3')}</p>
                          </div>
                          <div>
                            <h6 className="font-semibold mb-2">{t('calculators.bishop_score.mid_station')}</h6>
                            <p>• {t('calculators.bishop_score.mid_station_description_1')}</p>
                            <p>• {t('calculators.bishop_score.mid_station_description_2')}</p>
                            <p>• {t('calculators.bishop_score.mid_station_description_3')}</p>
                          </div>
                          <div>
                            <h6 className="font-semibold mb-2">{t('calculators.bishop_score.low_station')}</h6>
                            <p>• {t('calculators.bishop_score.low_station_description_1')}</p>
                            <p>• {t('calculators.bishop_score.low_station_description_2')}</p>
                            <p>• {t('calculators.bishop_score.low_station_description_3')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <CalculatorButton
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                      >
                        {t('common.back')}
                      </CalculatorButton>
                      <CalculatorButton
                        onClick={handleCalculate}
                        loading={isCalculating}
                        icon={Calculator}
                        size="lg"
                        className="enhanced-calculator-button"
                      >
                        {t('calculators.bishop_score.calculate_button')}
                      </CalculatorButton>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Results Display */
              <div className="space-y-8 animate-scaleIn">
                <ResultsDisplay
                  title={t('calculators.bishop_score.bishop_score_analysis')}
                  value={result.totalScore.toString()}
                  category={result.totalScore <= 3 ? 'low' : result.totalScore <= 6 ? 'intermediate' : 'high'}
                  interpretation={result.interpretation}
                  icon={Target}
                >
                  {/* Score Display */}
                  <div className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      <span className="font-semibold text-pink-800 dark:text-pink-200">{t('calculators.bishop_score.total_score')}: {result.totalScore}/13</span>
                    </div>
                    <div className={`inline-flex items-center space-x-1 rounded-lg px-3 py-1 ${getScoreColor(result.totalScore)}`}>
                      <span className="text-xs font-semibold">{t('calculators.bishop_score.induction_success')}: {result.successLabels?.[result.inductionSuccess.replace('-', '_') as keyof typeof result.successLabels] || result.inductionSuccess.charAt(0).toUpperCase() + result.inductionSuccess.slice(1).replace('-', ' ')}</span>
                    </div>
                  </div>

                  {/* Assessment Summary */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                      <div className="flex items-center space-x-3 mb-3">
                        <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">{t('calculators.bishop_score.induction_success')}</h4>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{result.successLabels?.[result.inductionSuccess.replace('-', '_') as keyof typeof result.successLabels] || result.inductionSuccess.charAt(0).toUpperCase() + result.inductionSuccess.slice(1).replace('-', ' ')}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{t('calculators.bishop_score.labor_likelihood')}</p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <div className="flex items-center space-x-3 mb-3">
                        <AlertTriangle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h4 className="font-semibold text-green-800 dark:text-green-200">{t('calculators.bishop_score.cesarean_risk')}</h4>
                      </div>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{result.cesareanRisk.toFixed(1)}%</p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">{t('calculators.bishop_score.cesarean_delivery_risk')}</p>
                    </div>
                  </div>

                  {/* Induction Recommendations */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Stethoscope className="w-5 h-5 text-blue-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.bishop_score.clinical_recommendation')}</h4>
                    </div>
                    <div className={`p-6 rounded-2xl border-2 ${getSuccessBgColor(result.inductionSuccess)}`}>
                      <div className="space-y-3">
                        <p className="font-semibold">{result.inductionRecommendation}</p>
                        {result.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-current rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Evidence References */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200">{t('calculators.bishop_score.evidence_base')}</h4>
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                      {result.references.map((ref, index) => (
                        <p key={index}>• {ref}</p>
                      ))}
                    </div>
                  </div>
                </ResultsDisplay>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <CalculatorButton
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    icon={Calculator}
                  >
                    {t('calculators.bishop_score.new_assessment')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={() => setResult(null)}
                    variant="secondary"
                    size="lg"
                  >
                    {t('calculators.bishop_score.modify_inputs')}
                  </CalculatorButton>
                </div>

                {/* Result Sharing */}
                <div className="mt-6">
                  <CalculatorResultShare
                    calculatorName={t('calculators.bishop_score.title')}
                    calculatorId="bishop-score-calculator"
                    results={{
                      [result.labels?.bishopScore || 'Bishop Score']: result.totalScore,
                      [result.labels?.inductionSuccess || 'Induction Success']: result.successLabels?.[result.inductionSuccess.replace('-', '_') as keyof typeof result.successLabels] || result.inductionSuccess,
                      [result.labels?.cesareanRisk || 'Cesarean Risk']: `${result.cesareanRisk}%`
                    }}
                    interpretation={result.interpretation}
                    recommendations={result.recommendations}
                    riskLevel={result.totalScore <= 3 ? 'high' : result.totalScore <= 6 ? 'intermediate' : 'low'}
                  />
                </div>
              </div>
            )}

            {/* Footer Information */}
            <div className="text-center pt-8 border-t border-white/20 dark:border-gray-800/20">
              <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Info className="w-4 h-4" />
                <span>{t('calculators.bishop_score.based_on_bishop')}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-pink-600" />
                  <span className="text-pink-600 font-semibold">{t('calculators.bishop_score.obstetric_safety_validated')}</span>
                </div>
              </div>
            </div>
          </div>
        </CalculatorContainer>
      </TabsContent>

      <TabsContent value="about" className="space-y-6">
        <CalculatorContainer
          title={t('calculators.bishop_score.about_title')}
          subtitle={t('calculators.bishop_score.subtitle')}
          icon={Target}
          gradient="obgyn"
          className="max-w-5xl mx-auto"
        >
          <div className="space-y-8">
            {/* Clinical Purpose */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                  <Stethoscope className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-pink-800 dark:text-pink-200 mb-3">{t('common.clinical_purpose')}</h3>
                  <p className="text-pink-700 dark:text-pink-300 leading-relaxed">
                    {t('calculators.bishop_score.tool_description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Scoring System */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <CardTitle className="text-blue-800 dark:text-blue-200">{t('calculators.bishop_score.scoring_parameters')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">{t('calculators.bishop_score.five_assessment_parameters')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('calculators.bishop_score.cervical_dilation_points')}</li>
                      <li>• {t('calculators.bishop_score.cervical_effacement_points')}</li>
                      <li>• {t('calculators.bishop_score.cervical_consistency_points')}</li>
                      <li>• {t('calculators.bishop_score.cervical_position_points')}</li>
                      <li>• {t('calculators.bishop_score.fetal_station_points')}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Target className="w-6 h-6 text-green-600" />
                    <CardTitle className="text-green-800 dark:text-green-200">{t('calculators.bishop_score.score_interpretation')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">{t('calculators.bishop_score.induction_success_prediction')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('calculators.bishop_score.score_unfavorable')}</li>
                      <li>• {t('calculators.bishop_score.score_intermediate')}</li>
                      <li>• {t('calculators.bishop_score.score_favorable')}</li>
                      <li>• {t('calculators.bishop_score.score_very_favorable')}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clinical Applications */}
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Activity className="w-6 h-6 text-purple-600" />
                  <CardTitle className="text-purple-800 dark:text-purple-200">{t('calculators.bishop_score.clinical_applications')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">{t('calculators.bishop_score.labor_induction_planning')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('calculators.bishop_score.labor_induction_description')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">{t('calculators.bishop_score.delivery_planning')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('calculators.bishop_score.delivery_planning_description')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">{t('calculators.bishop_score.clinical_documentation')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('calculators.bishop_score.clinical_documentation_description')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Base */}
            <Card className="border-2 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-orange-600" />
                  <CardTitle className="text-orange-800 dark:text-orange-200">{t('calculators.bishop_score.evidence_base')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">{t('calculators.bishop_score.professional_guidelines')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('calculators.bishop_score.acog_practice_bulletin')}</li>
                      <li>• {t('calculators.bishop_score.maternal_fetal_medicine')}</li>
                      <li>• {t('calculators.bishop_score.validation_studies')}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">{t('calculators.bishop_score.clinical_validation')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('calculators.bishop_score.clinical_validation_description')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-3">{t('calculators.bishop_score.clinical_considerations')}</h3>
                  <div className="space-y-2 text-amber-700 dark:text-amber-300 text-sm">
                    <p>• {t('calculators.bishop_score.consideration_1')}</p>
                    <p>• {t('calculators.bishop_score.consideration_2')}</p>
                    <p>• {t('calculators.bishop_score.consideration_3')}</p>
                    <p>• {t('calculators.bishop_score.consideration_4')}</p>
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

// Memoized component to prevent unnecessary re-renders
export const BishopScoreCalculator = React.memo(BishopScoreCalculatorComponent);

export default BishopScoreCalculator; 