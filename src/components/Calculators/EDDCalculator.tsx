import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, Baby, AlertTriangle, Info, CheckCircle, Star, User, Activity, BarChart3, Stethoscope, Award, Shield, Clock, Target, Calculator } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip } from '../ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  CalculatorContainer, 
  CalculatorInput, 
  CalculatorSelect, 
  CalculatorCheckbox, 
  CalculatorButton, 
  ResultsDisplay 
} from '../ui/calculator-ui';
import { DatePicker } from '../ui/date-picker';
import { CalculatorResultShare } from './CalculatorResultShare';
import { calculateEDD, validateOBGYNInput } from '../../services/obgynCalculatorService';
import { EDDCalculatorInput, EDDCalculatorResult } from '../../types/obgyn-calculators';
import { useTranslation } from '../../hooks/useTranslation';

interface FormData {
  lmpDate: string;
  firstTrimesterCRL: string;
  artTransferDate: string;
  artDaysToTransfer: string;
  cycleDays: string;
}

const EDDCalculatorComponent: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('calculator');
  const [formData, setFormData] = useState<FormData>({
    lmpDate: '',
    firstTrimesterCRL: '',
    artTransferDate: '',
    artDaysToTransfer: '',
    cycleDays: '28'
  });
  
  const [result, setResult] = useState<EDDCalculatorResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // At least one dating method must be provided
    if (!formData.lmpDate && !formData.firstTrimesterCRL && !formData.artTransferDate) {
      newErrors.general = t('calculators.edd.general_error');
    }

    // LMP validation
    if (formData.lmpDate) {
      const lmpDate = new Date(formData.lmpDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 0) {
        newErrors.lmpDate = t('calculators.edd.lmp_date_error');
      } else if (daysDiff > 300) {
        newErrors.lmpDate = t('calculators.edd.lmp_date_far_past_error');
      }
    }

    // CRL validation
    if (formData.firstTrimesterCRL) {
      const crl = parseFloat(formData.firstTrimesterCRL);
      if (isNaN(crl) || crl < 15 || crl > 95) {
        newErrors.firstTrimesterCRL = t('calculators.edd.first_trimester_crl_error');
      }
    }

    // ART validation
    if (formData.artTransferDate) {
      if (!formData.artDaysToTransfer) {
        newErrors.artDaysToTransfer = t('calculators.edd.art_days_to_transfer_required');
      } else {
        const days = parseInt(formData.artDaysToTransfer);
        if (isNaN(days) || days < 3 || days > 6) {
          newErrors.artDaysToTransfer = t('calculators.edd.art_days_to_transfer_error');
        }
      }
    }

    // Cycle length validation
    if (formData.cycleDays) {
      const cycle = parseInt(formData.cycleDays);
      if (isNaN(cycle) || cycle < 21 || cycle > 35) {
        newErrors.cycleDays = t('calculators.edd.cycle_days_error');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleCalculate = useCallback(() => {
    if (!validateForm()) return;

    setIsCalculating(true);
    
    // Simulate professional EDD calculation with loading animation
    setTimeout(() => {
      try {
        const input: EDDCalculatorInput = {
          lmpDate: formData.lmpDate || undefined,
          firstTrimesterCRL: formData.firstTrimesterCRL || undefined,
          artTransferDate: formData.artTransferDate || undefined,
          artDaysToTransfer: formData.artDaysToTransfer || undefined,
          cycleDays: formData.cycleDays || undefined,
          calculationDate: new Date().toISOString()
        };

        // Use the service validation
        const validation = validateOBGYNInput('edd-calculator', input);
        if (!validation.isValid) {
          setErrors(validation.errors.reduce((acc, error, index) => ({ ...acc, [`error_${index}`]: error }), {}));
          setIsCalculating(false);
          return;
        }

        const calculationResult = calculateEDD(input);
        setResult(calculationResult);
        
      } catch (error) {
        setErrors({ calculation: error instanceof Error ? error.message : t('calculators.edd.errors.calculation_failed') });
      } finally {
        setIsCalculating(false);
      }
    }, 1800); // Professional OB/GYN calculation simulation
  }, [formData, validateForm, t]);

  const handleReset = useCallback(() => {
    setFormData({
      lmpDate: '',
      firstTrimesterCRL: '',
      artTransferDate: '',
      artDaysToTransfer: '',
      cycleDays: '28'
    });
    setResult(null);
    setErrors({});
    setIsCalculating(false);
    setCurrentStep(1);
  }, []);

  // Memoized step navigation handlers
  const handleNextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const handlePrevStep = useCallback(() => {
    setCurrentStep(prev => prev - 1);
  }, []);

  // Memoized form field update handlers
  const handleLmpDateChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, lmpDate: value }));
  }, []);

  const handleCRLChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, firstTrimesterCRL: e.target.value }));
  }, []);

  const handleArtTransferDateChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, artTransferDate: value }));
  }, []);

  const handleArtDaysToTransferChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, artDaysToTransfer: e.target.value }));
  }, []);

  const handleCycleDaysChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, cycleDays: e.target.value }));
  }, []);

  const handleBackToModify = useCallback(() => {
    setResult(null);
  }, []);

  const formatDate = useMemo(() => (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  const getConfidenceColor = useMemo(() => (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  const getRiskBgColor = useMemo(() => (category: string) => {
    switch (category) {
      case 'high': return 'bg-green-50 border-green-200 text-green-800';
      case 'moderate': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }, []);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="calculator">{t('common.calculator')}</TabsTrigger>
        <TabsTrigger value="about">{t('common.about')}</TabsTrigger>
      </TabsList>

      <TabsContent value="calculator">
        <CalculatorContainer
          title={t('calculators.edd.title')}
          subtitle={t('calculators.edd.subtitle')}
          icon={Baby}
          gradient="obgyn"
          className="max-w-5xl mx-auto"
        >
          <div className="space-y-8">
            {/* OB/GYN Dating Methods Alert */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                  <Calendar className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-pink-800 dark:text-pink-200 mb-2">{t('calculators.edd.acog_evidence_based')}</h4>
                  <p className="text-pink-700 dark:text-pink-300 leading-relaxed">
                    {t('calculators.edd.tool_description')}
                  </p>
                  <div className="mt-3 inline-flex items-center space-x-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg px-3 py-1">
                    <Star className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    <span className="text-xs font-semibold text-pink-700 dark:text-pink-300">{t('calculators.edd.about.clinical_guidelines.acog_guidelines')}</span>
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
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('calculators.edd.dating_methods')}</span>
                  </div>
                  <div className={`w-16 h-1 rounded-full transition-all duration-300 ${
                    currentStep >= 2 ? 'bg-rose-500' : 'bg-gray-200'
                  }`}></div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      currentStep >= 2 ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      2
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.clinical_data')}</span>
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
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.calculation')}</span>
                  </div>
                </div>

                {/* Step 1: Dating Method Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl border border-pink-200 dark:border-pink-800">
                        <Calendar className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.edd.dating_methods')}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.edd.multiple_dating_methods')}</p>
                    </div>

                    <div className="space-y-6">
                      {/* LMP Method */}
                      <div className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <Calendar className="w-5 h-5 text-pink-600" />
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.edd.lmp_method')}</h4>
                          <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg px-2 py-1">
                            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">{t('calculators.edd.moderate_confidence')}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <DatePicker
                            label={t('calculators.edd.lmp_date_label')}
                            value={formData.lmpDate}
                            onChange={handleLmpDateChange}
                            placeholder={t('calculators.edd.lmp_date_label') + '...'}
                            error={errors.lmpDate}
                            helpText={t('calculators.edd.lmp_date_help')}
                            icon={Calendar}
                            maxDate={new Date().toISOString().split('T')[0]}
                            required={!formData.firstTrimesterCRL && !formData.artTransferDate}
                          />

                          <CalculatorInput
                            label={t('calculators.edd.cycle_days_label')}
                            value={formData.cycleDays}
                            onChange={handleCycleDaysChange}
                            type="number"
                            placeholder="28"
                            min={21}
                            max={35}
                            unit={t('calculators.edd.cycle_days_unit')}
                            helpText={t('calculators.edd.cycle_days_help')}
                            icon={Clock}
                          />
                        </div>
                      </div>

                      {/* Ultrasound Method */}
                      <div className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <Activity className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.edd.ultrasound_method')}</h4>
                          <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 rounded-lg px-2 py-1">
                            <span className="text-xs font-medium text-green-700 dark:text-green-300">{t('calculators.edd.high_confidence')}</span>
                          </div>
                        </div>
                        
                        <CalculatorInput
                          label={t('calculators.edd.first_trimester_crl_label')}
                          value={formData.firstTrimesterCRL}
                          onChange={handleCRLChange}
                          type="number"
                          placeholder="45"
                          min={15}
                          max={95}
                          unit={t('calculators.edd.first_trimester_crl_unit')}
                          step={0.1}
                          error={errors.firstTrimesterCRL}
                          helpText={t('calculators.edd.first_trimester_crl_help')}
                          icon={Activity}
                        />
                      </div>

                      {/* ART Method */}
                      <div className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.edd.art_method')}</h4>
                          <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 rounded-lg px-2 py-1">
                            <span className="text-xs font-medium text-green-700 dark:text-green-300">{t('calculators.edd.high_confidence')}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <DatePicker
                            label={t('calculators.edd.art_transfer_date_label')}
                            value={formData.artTransferDate}
                            onChange={handleArtTransferDateChange}
                            placeholder={t('calculators.edd.art_transfer_date_label') + '...'}
                            error={errors.artTransferDate}
                            helpText={t('calculators.edd.art_transfer_date_help')}
                            icon={Calendar}
                            maxDate={new Date().toISOString().split('T')[0]}
                            required={!formData.lmpDate && !formData.firstTrimesterCRL}
                          />

                          <CalculatorSelect
                            label={t('calculators.edd.art_days_to_transfer_label')}
                            value={formData.artDaysToTransfer}
                            onChange={handleArtDaysToTransferChange}
                            options={[
                              { value: '', label: t('calculators.edd.art_days_to_transfer_label') + '...' },
                              { value: '3', label: t('calculators.edd.day_3_cleavage') },
                              { value: '5', label: t('calculators.edd.day_5_blastocyst') },
                              { value: '6', label: t('calculators.edd.day_6_expanded_blastocyst') },
                            ]}
                            error={errors.artDaysToTransfer}
                            icon={BarChart3}
                          />
                        </div>
                      </div>
                    </div>

                    {errors.general && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <p className="text-sm text-red-700 dark:text-red-300">{errors.general}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <CalculatorButton
                        onClick={handleNextStep}
                        disabled={!formData.lmpDate && !formData.firstTrimesterCRL && !formData.artTransferDate}
                        className="enhanced-calculator-button"
                      >
                        {t('calculators.edd.next_clinical_review')}
                      </CalculatorButton>
                    </div>
                  </div>
                )}

                {/* Step 2: Clinical Data Review */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-900/20 dark:to-purple-900/20 rounded-2xl border border-rose-200 dark:border-rose-800">
                        <Stethoscope className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.edd.clinical_data_review')}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.edd.review_dating_parameters')}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Dating Method Summary */}
                      <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800 rounded-xl">
                        <h4 className="font-semibold text-pink-800 dark:text-pink-200 mb-4">{t('calculators.edd.selected_dating_method')}</h4>
                        <div className="space-y-3">
                          {formData.lmpDate && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-pink-600" />
                              <span className="text-sm font-medium">LMP: {formatDate(formData.lmpDate)}</span>
                            </div>
                          )}
                          {formData.firstTrimesterCRL && (
                            <div className="flex items-center space-x-2">
                              <Activity className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">CRL: {formData.firstTrimesterCRL}mm</span>
                            </div>
                          )}
                          {formData.artTransferDate && (
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium">ART: Day {formData.artDaysToTransfer} transfer</span>
                            </div>
                          )}
                          {formData.cycleDays && formData.cycleDays !== '28' && (
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium">Cycle: {formData.cycleDays} days</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dating Accuracy Information */}
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-4">{t('calculators.edd.expected_accuracy')}</h4>
                        <div className="space-y-2 text-sm">
                          {formData.firstTrimesterCRL && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700 dark:text-green-300">{t('calculators.edd.ultrasound_crl_accuracy')}</span>
                            </div>
                          )}
                          {formData.artTransferDate && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700 dark:text-green-300">{t('calculators.edd.art_dating_accuracy')}</span>
                            </div>
                          )}
                          {formData.lmpDate && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="text-yellow-700 dark:text-yellow-300">{t('calculators.edd.lmp_dating_accuracy')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Clinical Guidelines Information */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">{t('calculators.edd.acog_guidelines')}</h4>
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                        <p>{t('calculators.edd.acog_guideline_1')}</p>
                        <p>{t('calculators.edd.acog_guideline_2')}</p>
                        <p>{t('calculators.edd.acog_guideline_3')}</p>
                        <p>{t('calculators.edd.acog_guideline_4')}</p>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <CalculatorButton
                        onClick={handlePrevStep}
                        variant="outline"
                      >
                        {t('calculators.edd.back')}
                      </CalculatorButton>
                      <CalculatorButton
                        onClick={handleCalculate}
                        loading={isCalculating}
                        icon={Calculator}
                        size="lg"
                        className="enhanced-calculator-button"
                      >
                        {t('calculators.edd.calculate_due_date')}
                      </CalculatorButton>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Results Display */
              <div className="space-y-8 animate-scaleIn">
                <ResultsDisplay
                  title={t('calculators.edd.edd_analysis')}
                  value={formatDate(String(result.value))}
                  category={result.confidence === 'moderate' ? 'intermediate' : result.confidence as 'low' | 'high'}
                  interpretation={result.interpretation}
                  icon={Baby}
                >
                  {/* Dating Method Used */}
                  <div className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      <span className="font-semibold text-pink-800 dark:text-pink-200">{t('calculators.edd.dating_method_label')} {result.method}</span>
                    </div>
                    <div className={`inline-flex items-center space-x-1 rounded-lg px-3 py-1 ${getConfidenceColor(result.confidence)}`}>
                      <span className="text-xs font-semibold">{t('calculators.edd.confidence_label')} {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)}</span>
                    </div>
                  </div>

                  {/* Due Date Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                      <div className="flex items-center space-x-3 mb-3">
                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">{t('calculators.edd.estimated_due_date')}</h4>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatDate(String(result.value))}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{t('calculators.edd.forty_weeks_gestation')}</p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <div className="flex items-center space-x-3 mb-3">
                        <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h4 className="font-semibold text-green-800 dark:text-green-200">{t('calculators.edd.current_status')}</h4>
                      </div>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{result.currentGA}</p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">{t('calculators.edd.current_gestational_age')}</p>
                    </div>
                  </div>

                  {/* Clinical Recommendations */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Stethoscope className="w-5 h-5 text-blue-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.edd.clinical_recommendations')}</h4>
                    </div>
                    <div className={`p-6 rounded-2xl border-2 ${getRiskBgColor(result.confidence)}`}>
                      <div className="space-y-3">
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
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200">{t('calculators.edd.evidence_base')}</h4>
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
                    {t('calculators.edd.new_assessment')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={handleBackToModify}
                    variant="secondary"
                    size="lg"
                  >
                    {t('calculators.edd.modify_inputs')}
                  </CalculatorButton>
                </div>

                {/* Result Sharing */}
                <div className="mt-6">
                  <CalculatorResultShare
                    calculatorName={t('calculators.edd.name')}
                    calculatorId="edd-calculator"
                    results={{
                      estimatedDueDate: formatDate(String(result.value)),
                      method: result.method,
                      confidence: result.confidence,
                      currentGA: result.currentGA
                    }}
                    interpretation={result.interpretation}
                    recommendations={result.recommendations}
                    riskLevel={result.confidence === 'high' ? 'low' : result.confidence === 'low' ? 'high' : 'intermediate'}
                  />
                </div>
              </div>
            )}

            {/* Footer Information */}
            <div className="text-center pt-8 border-t border-white/20 dark:border-gray-800/20">
              <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Info className="w-4 h-4" />
                <span>{t('calculators.edd.based_on_acog_700')} • {t('calculators.edd.educational_purposes_only')}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-pink-600" />
                  <span className="text-pink-600 font-semibold">{t('calculators.edd.acog_2017_guidelines')}</span>
                </div>
              </div>
            </div>
          </div>
        </CalculatorContainer>
      </TabsContent>

      <TabsContent value="about" className="space-y-6">
        <CalculatorContainer
          title={t('calculators.edd.about_edd_calculator')}
          subtitle={t('calculators.edd.about_subtitle')}
          icon={Baby}
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
                  <h3 className="text-xl font-bold text-pink-800 dark:text-pink-200 mb-3">{t('calculators.edd.clinical_purpose')}</h3>
                  <p className="text-pink-700 dark:text-pink-300 leading-relaxed">
                    {t('calculators.edd.clinical_purpose_description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Dating Methods */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('calculators.edd.evidence_based_dating_methods')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('calculators.edd.multiple_approaches_accuracy')}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {/* LMP Method */}
                <div className="bg-white dark:bg-gray-800 border-2 border-pink-200 dark:border-pink-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.edd.last_menstrual_period_lmp')}</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">{t('calculators.edd.moderate_accuracy_days')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('calculators.edd.naegele_rule_description')}
                    </p>
                    <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <li>{t('calculators.edd.standard_28_day_cycle')}</li>
                      <li>{t('calculators.edd.cycle_length_adjustments')}</li>
                      <li>{t('calculators.edd.requires_accurate_lmp')}</li>
                    </ul>
                  </div>
                </div>

                {/* Ultrasound Method */}
                <div className="bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.edd.ultrasound_method')}</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">{t('calculators.edd.high_confidence_accuracy')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('calculators.edd.crl_most_accurate')}
                    </p>
                    <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <li>{t('calculators.edd.crl_range_weeks')}</li>
                      <li>{t('calculators.edd.robinson_fleming_formula')}</li>
                      <li>{t('calculators.edd.gold_standard_dating')}</li>
                    </ul>
                  </div>
                </div>

                {/* ART Method */}
                <div className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.edd.art_method')}</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">{t('calculators.edd.high_confidence_accuracy')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('calculators.edd.highly_accurate_known_conception')}
                    </p>
                    <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <li>{t('calculators.edd.transfer_day_options')}</li>
                      <li>{t('calculators.edd.known_conception_timing')}</li>
                      <li>{t('calculators.edd.precise_developmental_stage')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Guidelines */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-4">{t('calculators.edd.clinical_guidelines_evidence')}</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">{t('calculators.edd.acog_guidelines_section')}</h4>
                      <ul className="space-y-1 text-sm text-purple-600 dark:text-purple-400">
                        <li>{t('calculators.edd.acog_committee_700')}</li>
                        <li>{t('calculators.edd.acog_practice_175')}</li>
                        <li>{t('calculators.edd.first_trimester_preferred')}</li>
                        <li>{t('calculators.edd.discrepancy_ultrasound')}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">{t('calculators.edd.clinical_applications')}</h4>
                      <ul className="space-y-1 text-sm text-purple-600 dark:text-purple-400">
                        <li>{t('calculators.edd.prenatal_care_scheduling')}</li>
                        <li>{t('calculators.edd.screening_test_timing')}</li>
                        <li>{t('calculators.edd.labor_delivery_planning')}</li>
                        <li>{t('calculators.edd.fetal_growth_baselines')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-3">{t('calculators.edd.important_clinical_considerations')}</h3>
                  <div className="space-y-3">
                    <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                      {t('calculators.edd.clinical_calculator_notice')}
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                      <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3">
                        <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm mb-1">{t('calculators.edd.statistical_reality')}</h4>
                        <p className="text-xs text-amber-600 dark:text-amber-400">{t('calculators.edd.five_percent_exact_date')}</p>
                      </div>
                      <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3">
                        <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm mb-1">{t('calculators.edd.clinical_range')}</h4>
                        <p className="text-xs text-amber-600 dark:text-amber-400">{t('calculators.edd.normal_delivery_weeks')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-pink-200 dark:border-pink-800">
              <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Info className="w-4 h-4" />
                <span>{t('calculators.edd.based_on_acog_700')} • {t('calculators.edd.educational_purposes_only')}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-pink-600" />
                  <span className="text-pink-600 font-semibold">{t('calculators.edd.acog_2017_guidelines')}</span>
                </div>
              </div>
            </div>
          </div>
        </CalculatorContainer>
      </TabsContent>
    </Tabs>
  );
};

// Memoized component with shallow prop comparison
export const EDDCalculator = React.memo(EDDCalculatorComponent); 