import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, Baby, AlertTriangle, Info, CheckCircle, Clock, Star, User, Activity, BarChart3, Stethoscope, Award, Shield, Target, Calculator, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
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
import { DatePicker } from '../ui/date-picker';
import { CalculatorResultShare } from './CalculatorResultShare';
import { calculateGestationalAge, validateOBGYNInput } from '../../services/obgynCalculatorService';
import { GestationalAgeInput, GestationalAgeResult } from '../../types/obgyn-calculators';
import { useTranslation } from '../../hooks/useTranslation';

interface FormData {
  referenceDate: string;
  lmpDate: string;
  firstTrimesterCRL: string;
  eddDate: string;
  currentDate: string;
}

const GestationalAgeCalculatorComponent: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('calculator');
  const [formData, setFormData] = useState<FormData>({
    referenceDate: new Date().toISOString().split('T')[0],
    lmpDate: '',
    firstTrimesterCRL: '',
    eddDate: '',
    currentDate: new Date().toISOString().split('T')[0]
  });
  
  const [result, setResult] = useState<GestationalAgeResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [calculationMethod, setCalculationMethod] = useState<'lmp' | 'ultrasound' | 'edd'>('lmp');

  // Memoized helper function to parse gestational age string into weeks and days
  const parseGestationalAge = useMemo(() => (gestationalAge: string): { weeks: number; days: number } => {
    const match = gestationalAge.match(/(\d+)w\s*(\d+)d/);
    if (match) {
      return { weeks: parseInt(match[1]), days: parseInt(match[2]) };
    }
    return { weeks: 0, days: 0 };
  }, []);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Reference date validation
    if (!formData.referenceDate) {
      newErrors.referenceDate = t('calculators.gestational_age.validation.reference_date_required');
    }

    // At least one dating method must be provided
    if (!formData.lmpDate && !formData.firstTrimesterCRL && !formData.eddDate) {
      newErrors.general = t('calculators.gestational_age.validation.method_required');
    }

    // LMP validation
    if (formData.lmpDate) {
      const lmpDate = new Date(formData.lmpDate);
      const refDate = new Date(formData.referenceDate);
      const daysDiff = Math.floor((refDate.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 0) {
        newErrors.lmpDate = t('calculators.gestational_age.validation.lmp_after_reference');
      } else if (daysDiff > 300) {
        newErrors.lmpDate = t('calculators.gestational_age.validation.lmp_too_far');
      }
    }

    // CRL validation
    if (formData.firstTrimesterCRL) {
      const crl = parseFloat(formData.firstTrimesterCRL);
      if (isNaN(crl) || crl < 15 || crl > 95) {
        newErrors.firstTrimesterCRL = t('calculators.gestational_age.method_selection.ultrasound.crl_error');
      }
    }

    // EDD validation
    if (formData.eddDate) {
      const eddDate = new Date(formData.eddDate);
      const refDate = new Date(formData.referenceDate);
      
      if (eddDate.getTime() < refDate.getTime()) {
        newErrors.eddDate = t('calculators.gestational_age.validation.edd_before_reference');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleCalculate = useCallback(() => {
    if (!validateForm()) return;

    setIsCalculating(true);
    
    // Professional GA calculation with loading animation
    setTimeout(() => {
      try {
        const input: GestationalAgeInput = {
          referenceDate: formData.referenceDate,
          lmpDate: formData.lmpDate || undefined,
          firstTrimesterCRL: formData.firstTrimesterCRL || undefined,
          eddDate: formData.eddDate || undefined
        };

        // Use the service validation
        const validation = validateOBGYNInput('gestational-age', input);
        if (!validation.isValid) {
          setErrors(validation.errors.reduce((acc, error, index) => ({ ...acc, [`error_${index}`]: error }), {}));
          setIsCalculating(false);
          return;
        }

        const calculationResult = calculateGestationalAge(input);
        setResult(calculationResult);
        
      } catch (error) {
        setErrors({ calculation: error instanceof Error ? error.message : t('calculators.gestational_age.validation.calculation_error') });
      } finally {
        setIsCalculating(false);
      }
    }, 1900); // Professional OB/GYN GA calculation simulation
  }, [validateForm, formData, t]);

  const handleReset = useCallback(() => {
    setFormData({
      referenceDate: new Date().toISOString().split('T')[0],
      lmpDate: '',
      firstTrimesterCRL: '',
      eddDate: '',
      currentDate: new Date().toISOString().split('T')[0]
    });
    setResult(null);
    setErrors({});
    setIsCalculating(false);
    setCurrentStep(1);
    setCalculationMethod('lmp');
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

  const getRiskBgColor = (category: string) => {
    switch (category) {
      case 'high': return 'bg-green-50 border-green-200 text-green-800';
      case 'moderate': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getTrimesterInfo = (gestationalAge: string) => {
    const { weeks } = parseGestationalAge(gestationalAge);
    if (weeks < 14) return { trimester: 'First', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (weeks < 28) return { trimester: 'Second', color: 'text-green-600', bg: 'bg-green-50' };
    return { trimester: 'Third', color: 'text-purple-600', bg: 'bg-purple-50' };
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="calculator">{t('calculators.common.calculator')}</TabsTrigger>
        <TabsTrigger value="about">{t('calculators.common.about')}</TabsTrigger>
      </TabsList>

      <TabsContent value="calculator">
        <CalculatorContainer
          title={t('calculators.gestational_age.title')}
          subtitle={t('calculators.gestational_age.subtitle')}
          icon={Clock}
          gradient="obgyn"
          className="max-w-5xl mx-auto"
        >
          <div className="space-y-8">
            {/* ACOG Alert */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-pink-800 dark:text-pink-200 mb-3">{t('calculators.gestational_age.acog_alert.title')}</h3>
                  <p className="text-pink-700 dark:text-pink-300 leading-relaxed">
                    {t('calculators.gestational_age.acog_alert.content')}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-pink-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </div>
                <span className="font-medium">{t('calculators.gestational_age.progress.step1')}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-pink-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
                <span className="font-medium">{t('calculators.gestational_age.progress.step2')}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-pink-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </div>
                <span className="font-medium">{t('calculators.gestational_age.progress.step3')}</span>
              </div>
            </div>

            {!result ? (
              <>
                {/* Step 1: Method Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('calculators.gestational_age.method_selection.title')}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{t('calculators.gestational_age.method_selection.description')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {/* LMP Method */}
                      <button
                        onClick={() => {
                          setCalculationMethod('lmp');
                          setCurrentStep(2);
                        }}
                        className="bg-white dark:bg-gray-800 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow min-h-[44px] touch-manipulation"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.gestational_age.method_selection.lmp.title')}</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2">
                            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">{t('calculators.gestational_age.method_selection.lmp.accuracy')}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                            {t('calculators.gestational_age.method_selection.lmp.description')}
                          </p>
                        </div>
                      </button>

                      {/* Ultrasound Method */}
                      <button
                        onClick={() => {
                          setCalculationMethod('ultrasound');
                          setCurrentStep(2);
                        }}
                        className="bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow min-h-[44px] touch-manipulation"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.gestational_age.method_selection.ultrasound.title')}</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                            <span className="text-xs font-medium text-green-700 dark:text-green-300">{t('calculators.gestational_age.method_selection.ultrasound.accuracy')}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                            {t('calculators.gestational_age.method_selection.ultrasound.description')}
                          </p>
                        </div>
                      </button>

                      {/* EDD Method */}
                      <button
                        onClick={() => {
                          setCalculationMethod('edd');
                          setCurrentStep(2);
                        }}
                        className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow min-h-[44px] touch-manipulation"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.gestational_age.method_selection.edd.title')}</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{t('calculators.gestational_age.method_selection.edd.accuracy')}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                            {t('calculators.gestational_age.method_selection.edd.description')}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Reference Date Setup */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('calculators.gestational_age.reference.title')}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{t('calculators.gestational_age.reference.description')}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <DatePicker
                        label={t('calculators.gestational_age.reference.date_label')}
                        value={formData.referenceDate}
                        onChange={(value) => handleInputChange('referenceDate', value)}
                        error={errors.referenceDate}
                        helpText={t('calculators.gestational_age.reference.date_help')}
                        icon={Calendar}
                      />

                      {/* Dating Method Input */}
                      {calculationMethod === 'lmp' && (
                        <DatePicker
                          label={t('calculators.gestational_age.method_selection.lmp.label')}
                          value={formData.lmpDate}
                          onChange={(value) => handleInputChange('lmpDate', value)}
                          error={errors.lmpDate}
                          helpText={t('calculators.gestational_age.method_selection.lmp.help')}
                          icon={Calendar}
                        />
                      )}

                      {calculationMethod === 'ultrasound' && (
                        <CalculatorInput
                          label={t('calculators.gestational_age.method_selection.ultrasound.crl_label')}
                          type="number"
                          value={formData.firstTrimesterCRL}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstTrimesterCRL', e.target.value)}
                          error={errors.firstTrimesterCRL}
                          placeholder={t('calculators.gestational_age.method_selection.ultrasound.crl_placeholder')}
                          unit={t('calculators.gestational_age.method_selection.ultrasound.crl_unit')}
                          helpText={t('calculators.gestational_age.method_selection.ultrasound.crl_help')}
                          icon={Activity}
                        />
                      )}

                      {calculationMethod === 'edd' && (
                        <DatePicker
                          label={t('calculators.gestational_age.method_selection.edd.label')}
                          value={formData.eddDate}
                          onChange={(value) => handleInputChange('eddDate', value)}
                          error={errors.eddDate}
                          helpText={t('calculators.gestational_age.method_selection.edd.help')}
                          icon={Target}
                        />
                      )}

                      <div className="flex space-x-4 pt-6">
                        <CalculatorButton
                          onClick={() => setCurrentStep(1)}
                          variant="outline"
                          icon={ChevronLeft}
                        >
                          {t('calculators.common.back')}
                        </CalculatorButton>
                        <CalculatorButton
                          onClick={() => setCurrentStep(3)}
                          variant="primary"
                          icon={ChevronRight}
                        >
                          {t('calculators.gestational_age.buttons.continue')}
                        </CalculatorButton>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Calculation */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('calculators.gestational_age.progress.step3')}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{t('calculators.gestational_age.calculation.description')}</p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-xl p-6">
                      <h4 className="font-semibold text-pink-800 dark:text-pink-200 mb-4">{t('calculators.gestational_age.calculation.summary')}</h4>
                      <div className="space-y-2 text-pink-700 dark:text-pink-300">
                        <div><strong>{t('calculators.gestational_age.reference.date_label')}:</strong> {formatDate(formData.referenceDate)}</div>
                        <div><strong>{t('calculators.gestational_age.results.calculation_method')}:</strong> {
                          calculationMethod === 'lmp' ? t('calculators.gestational_age.results.method_names.lmp') :
                          calculationMethod === 'ultrasound' ? t('calculators.gestational_age.results.method_names.crl') :
                          calculationMethod === 'edd' ? t('calculators.gestational_age.results.method_names.edd') : ''
                        }</div>
                        {calculationMethod === 'lmp' && formData.lmpDate && (
                          <div><strong>{t('calculators.gestational_age.method_selection.lmp.label')}:</strong> {formatDate(formData.lmpDate)}</div>
                        )}
                        {calculationMethod === 'ultrasound' && formData.firstTrimesterCRL && (
                          <div><strong>{t('calculators.gestational_age.method_selection.ultrasound.crl_label')}:</strong> {formData.firstTrimesterCRL} {t('calculators.gestational_age.method_selection.ultrasound.crl_unit')}</div>
                        )}
                        {calculationMethod === 'edd' && formData.eddDate && (
                          <div><strong>{t('calculators.gestational_age.method_selection.edd.label')}:</strong> {formatDate(formData.eddDate)}</div>
                        )}
                      </div>
                    </div>

                    {Object.keys(errors).length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <div>
                            <h4 className="font-medium text-red-900 dark:text-red-100">{t('calculators.common.validation_errors')}</h4>
                            <div className="text-red-700 dark:text-red-300 text-sm mt-1">
                              {Object.values(errors).map((error, index) => (
                                <div key={index}>• {error}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <CalculatorButton
                        onClick={() => setCurrentStep(2)}
                        variant="outline"
                        icon={ChevronLeft}
                      >
                        {t('calculators.common.back')}
                      </CalculatorButton>
                      <CalculatorButton
                        onClick={handleCalculate}
                        variant="primary"
                        disabled={isCalculating}
                        icon={Calculator}
                      >
                        {isCalculating ? t('calculators.common.calculating') : t('calculators.gestational_age.buttons.calculate')}
                      </CalculatorButton>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Results Display */
              <div className="space-y-8 animate-scaleIn">
                <ResultsDisplay
                  title={t('calculators.gestational_age.results.title')}
                  value={result ? result.gestationalAge : ''}
                  category={result?.category === 'low' ? 'high' : result?.category === 'moderate' ? 'intermediate' : 'low'}
                  interpretation={result ? result.interpretation : ''}
                  icon={Clock}
                >
                  {/* Detailed Results */}
                  <div className="space-y-6">
                    {/* Main Results Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('calculators.gestational_age.results.gestational_age')}</h4>
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl font-bold text-pink-600">{result ? result.gestationalAge : ''}</div>
                          <div className="text-sm text-gray-600">{t('calculators.gestational_age.results.reference_date')}: {formatDate(formData.referenceDate)}</div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('calculators.gestational_age.results.trimester')}</h4>
                        <div className="flex items-center space-x-3">
                          <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                            result?.trimester === 'First' ? 'bg-blue-100 text-blue-800' :
                            result?.trimester === 'Second' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {result ? 
                              result.trimester === 'First' ? t('calculators.gestational_age.results.trimester_names.first') :
                              result.trimester === 'Second' ? t('calculators.gestational_age.results.trimester_names.second') :
                              result.trimester === 'Third' ? t('calculators.gestational_age.results.trimester_names.third') : ''
                              : ''}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('calculators.gestational_age.results.calculation_method')}</h4>
                        <div className="flex items-center space-x-3">
                          <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${getConfidenceColor(
                            calculationMethod === 'ultrasound' ? 'high' :
                            calculationMethod === 'edd' ? 'moderate' :
                            calculationMethod === 'lmp' ? 'moderate' : 'moderate'
                          )}`}>
                            {calculationMethod === 'lmp' ? t('calculators.gestational_age.results.method_names.lmp') :
                             calculationMethod === 'ultrasound' ? t('calculators.gestational_age.results.method_names.crl') :
                             calculationMethod === 'edd' ? t('calculators.gestational_age.results.method_names.edd') : ''}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('calculators.gestational_age.results.estimated_due_date')}</h4>
                        <div className="flex items-center space-x-3">
                          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                            {result?.estimatedDeliveryDate ? formatDate(result.estimatedDeliveryDate) : ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <CalculatorButton
                        onClick={() => {
                          setResult(null);
                          setFormData({
                            lmpDate: '',
                            firstTrimesterCRL: '',
                            eddDate: '',
                            referenceDate: new Date().toISOString().split('T')[0],
                            currentDate: new Date().toISOString().split('T')[0]
                          });
                          setCurrentStep(1);
                          setErrors({});
                        }}
                        variant="outline"
                        size="lg"
                        icon={Calculator}
                      >
                        {t('calculators.gestational_age.buttons.new_calculation')}
                      </CalculatorButton>
                      <CalculatorResultShare
                        calculatorName="Gestational Age Calculator"
                        calculatorId="gestational-age"
                        results={{
                          gestationalAge: result?.gestationalAge || '',
                          trimester: result?.trimester || '',
                          method: calculationMethod === 'lmp' ? 'LMP' : calculationMethod === 'ultrasound' ? 'Ultrasound CRL' : 'EDD',
                          estimatedDueDate: result?.estimatedDeliveryDate || ''
                        }}
                        interpretation={result?.interpretation || ''}
                        recommendations={result?.recommendations || []}
                        riskLevel={result?.category === 'low' ? 'low' : result?.category === 'high' ? 'high' : 'intermediate'}
                      />
                    </div>
                  </div>
                </ResultsDisplay>
              </div>
            )}

            {/* Footer Information */}
            <div className="text-center pt-8 border-t border-white/20 dark:border-gray-800/20">
              <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Info className="w-4 h-4" />
                <span>{t('calculators.gestational_age.footer.disclaimer')}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-pink-600" />
                  <span className="text-pink-600 font-semibold">{t('calculators.gestational_age.footer.guidelines')}</span>
                </div>
              </div>
            </div>
          </div>
        </CalculatorContainer>
      </TabsContent>

      <TabsContent value="about" className="space-y-6">
        <CalculatorContainer
          title={t('calculators.gestational_age.about.title')}
          subtitle={t('calculators.gestational_age.about.subtitle')}
          icon={Clock}
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
                  <h3 className="text-xl font-bold text-pink-800 dark:text-pink-200 mb-3">{t('calculators.gestational_age.about.clinical_purpose.title')}</h3>
                  <p className="text-pink-700 dark:text-pink-300 leading-relaxed">
                    {t('calculators.gestational_age.about.clinical_purpose.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Methods Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-3">{t('calculators.gestational_age.about.methods.title')}</h3>
                  <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                    {t('calculators.gestational_age.about.methods.description')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {/* LMP Method */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">{t('calculators.gestational_age.about.methods.lmp_method.title')}</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">{t('calculators.gestational_age.about.methods.lmp_method.accuracy')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('calculators.gestational_age.about.methods.lmp_method.description')}
                    </p>
                    <div className="space-y-1 text-xs text-gray-500">
                      <p>• {t('calculators.gestational_age.about.methods.lmp_method.features.accessible')}</p>
                      <p>• {t('calculators.gestational_age.about.methods.lmp_method.features.recall')}</p>
                      <p>• {t('calculators.gestational_age.about.methods.lmp_method.features.regular')}</p>
                    </div>
                  </div>
                </div>

                {/* Ultrasound Method */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3 mb-4">
                    <Activity className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800 dark:text-green-200">{t('calculators.gestational_age.about.methods.ultrasound_method.title')}</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">{t('calculators.gestational_age.about.methods.ultrasound_method.accuracy')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('calculators.gestational_age.about.methods.ultrasound_method.description')}
                    </p>
                    <div className="space-y-1 text-xs text-gray-500">
                      <p>• {t('calculators.gestational_age.about.methods.ultrasound_method.features.range')}</p>
                      <p>• {t('calculators.gestational_age.about.methods.ultrasound_method.features.formula')}</p>
                      <p>• {t('calculators.gestational_age.about.methods.ultrasound_method.features.standard')}</p>
                    </div>
                  </div>
                </div>

                {/* EDD Method */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center space-x-3 mb-4">
                    <Target className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200">{t('calculators.gestational_age.about.methods.edd_method.title')}</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">{t('calculators.gestational_age.about.methods.edd_method.accuracy')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('calculators.gestational_age.about.methods.edd_method.description')}
                    </p>
                    <div className="space-y-1 text-xs text-gray-500">
                      <p>• {t('calculators.gestational_age.about.methods.edd_method.features.established')}</p>
                      <p>• {t('calculators.gestational_age.about.methods.edd_method.features.reverse')}</p>
                      <p>• {t('calculators.gestational_age.about.methods.edd_method.features.consistent')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Applications */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Heart className="w-6 h-6 text-emerald-600" />
                  <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{t('calculators.gestational_age.about.applications.prenatal_care.title')}</h4>
                </div>
                <div className="space-y-2 text-emerald-700 dark:text-emerald-300 text-sm">
                  <p>• {t('calculators.gestational_age.about.applications.prenatal_care.scheduling')}</p>
                  <p>• {t('calculators.gestational_age.about.applications.prenatal_care.genetic')}</p>
                  <p>• {t('calculators.gestational_age.about.applications.prenatal_care.delivery')}</p>
                  <p>• {t('calculators.gestational_age.about.applications.prenatal_care.growth')}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Award className="w-6 h-6 text-amber-600" />
                  <h4 className="text-lg font-bold text-amber-800 dark:text-amber-200">{t('calculators.gestational_age.about.applications.clinical_management.title')}</h4>
                </div>
                <div className="space-y-2 text-amber-700 dark:text-amber-300 text-sm">
                  <p>• {t('calculators.gestational_age.about.applications.clinical_management.medication')}</p>
                  <p>• {t('calculators.gestational_age.about.applications.clinical_management.viability')}</p>
                  <p>• {t('calculators.gestational_age.about.applications.clinical_management.specialized')}</p>
                  <p>• {t('calculators.gestational_age.about.applications.clinical_management.decisions')}</p>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-200 mb-3">{t('calculators.gestational_age.about.guidelines.title')}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3">{t('calculators.gestational_age.about.guidelines.acog.title')}</h4>
                  <div className="space-y-2 text-indigo-700 dark:text-indigo-300 text-sm">
                    <p>• {t('calculators.gestational_age.about.guidelines.acog.opinion_700')}</p>
                    <p>• {t('calculators.gestational_age.about.guidelines.acog.bulletin_175')}</p>
                    <p>• {t('calculators.gestational_age.about.guidelines.acog.opinion_611')}</p>
                    <p>• {t('calculators.gestational_age.about.guidelines.acog.first_trimester')}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3">{t('calculators.gestational_age.about.guidelines.best_practices.title')}</h4>
                  <div className="space-y-2 text-indigo-700 dark:text-indigo-300 text-sm">
                    <p>• {t('calculators.gestational_age.about.guidelines.best_practices.early_dating')}</p>
                    <p>• {t('calculators.gestational_age.about.guidelines.best_practices.flexibility')}</p>
                    <p>• {t('calculators.gestational_age.about.guidelines.best_practices.comparison')}</p>
                    <p>• {t('calculators.gestational_age.about.guidelines.best_practices.judgment')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trimester Definitions */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-3">{t('calculators.gestational_age.about.trimesters.title')}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">{t('calculators.gestational_age.about.trimesters.first.title')}</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">{t('calculators.gestational_age.about.trimesters.first.weeks')}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">{t('calculators.gestational_age.about.trimesters.first.description')}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">{t('calculators.gestational_age.about.trimesters.second.title')}</h4>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">{t('calculators.gestational_age.about.trimesters.second.weeks')}</p>
                  <p className="text-xs text-green-700 dark:text-green-300">{t('calculators.gestational_age.about.trimesters.second.description')}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">{t('calculators.gestational_age.about.trimesters.third.title')}</h4>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">{t('calculators.gestational_age.about.trimesters.third.weeks')}</p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">{t('calculators.gestational_age.about.trimesters.third.description')}</p>
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
export const GestationalAgeCalculator = React.memo(GestationalAgeCalculatorComponent);

export default GestationalAgeCalculator; 