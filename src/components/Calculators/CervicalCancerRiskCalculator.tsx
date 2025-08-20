import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Shield, AlertTriangle, Info, CheckCircle, Star, User, FileText, Activity, Clock, Target, Calculator, TrendingUp, Stethoscope, Award, ArrowRight, Users, Calendar, AlertCircle, Microscope, Dna, Heart } from 'lucide-react';
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
import { CalculatorResultShare } from './CalculatorResultShare';
import { calculateOBGYN, validateOBGYNInput } from '../../services/obgynCalculatorService';
import { CervicalCancerRiskInput, CervicalCancerRiskResult } from '../../types/obgyn-calculators';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../stores/useAppStore';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface FormData {
  age: string;
  hpvStatus: 'negative' | 'positive-low-risk' | 'positive-high-risk' | 'unknown';
  cytologyResult: 'normal' | 'ascus' | 'lsil' | 'hsil' | 'agc' | 'asc-h';
  previousAbnormalScreening: boolean;
  smokingStatus: boolean;
  immunocompromised: boolean;
  screeningHistory: 'adequate' | 'inadequate' | 'never-screened';
}

interface Errors {
  age?: string;
  hpvStatus?: string;
  cytologyResult?: string;
}

const CervicalCancerRiskCalculatorComponent: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
  const [formData, setFormData] = useState<FormData>({
    age: '',
    hpvStatus: 'unknown',
    cytologyResult: 'normal',
    previousAbnormalScreening: false,
    smokingStatus: false,
    immunocompromised: false,
    screeningHistory: 'adequate'
  });
  
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<CervicalCancerRiskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'about'>('calculator');

  // Clear state on language change to ensure fresh translations
  useEffect(() => {
    setResult(null);
    setStep(1);
    setShowResult(false);
  }, [currentLanguage]);

  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field as keyof Errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateStep = useCallback((currentStep: number): boolean => {
    const newErrors: Errors = {};

    if (currentStep === 1) {
      if (!formData.age) {
        newErrors.age = t('calculators.obgyn.cervical_cancer_risk.demographics.patient_age.required_error');
      } else if (Number(formData.age) < 18 || Number(formData.age) > 100) {
        newErrors.age = t('calculators.obgyn.cervical_cancer_risk.demographics.patient_age.validation_error');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleNext = useCallback(() => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  }, [validateStep, step]);

  const handlePrevious = useCallback(() => {
    setStep(step - 1);
  }, [step]);

  const handleCalculate = useCallback(async () => {
    if (!validateStep(1)) return;

    setIsLoading(true);
    setShowResult(false);

    const [, error] = await safeAsync(async () => {
      const input: CervicalCancerRiskInput = {
        age: formData.age,
        hpvStatus: formData.hpvStatus,
        cytologyResult: formData.cytologyResult,
        previousAbnormalScreening: formData.previousAbnormalScreening,
        smokingStatus: formData.smokingStatus,
        immunocompromised: formData.immunocompromised,
        screeningHistory: formData.screeningHistory,
        calculationDate: new Date().toISOString()
      };

      // Validate input
      const validation = validateOBGYNInput('cervical-cancer-risk', input);
      if (!validation.isValid) {
        const fieldErrors: Errors = {};
        validation.errors.forEach(error => {
          if (error.includes('age')) fieldErrors.age = error;
          if (error.includes('HPV')) fieldErrors.hpvStatus = error;
          if (error.includes('cytology')) fieldErrors.cytologyResult = error;
        });
        setErrors(fieldErrors);
        return;
      }

      const calculationResult = calculateOBGYN('cervical-cancer-risk', input, t) as CervicalCancerRiskResult;
      setResult(calculationResult);
      setShowResult(true);
      
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('cervical-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

      return calculationResult;
    }, {
      context: 'cervical cancer risk calculation',
      severity: ErrorSeverity.HIGH,
      showToast: true
    });

    if (error) {
      setErrors({ age: t('calculators.obgyn.cervical_cancer_risk.errors.calculation_error') });
    }

    setIsLoading(false);
  }, [validateStep, formData, t]);

  const handleReset = useCallback(() => {
    setFormData({
      age: '',
      hpvStatus: 'unknown',
      cytologyResult: 'normal',
      previousAbnormalScreening: false,
      smokingStatus: false,
      immunocompromised: false,
      screeningHistory: 'adequate'
    });
    setErrors({});
    setResult(null);
    setStep(1);
    setShowResult(false);
  }, []);

  const getRiskColor = useMemo(() => (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'moderate':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'very-high':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }, []);

  const getRiskIcon = useMemo(() => (level: string) => {
    switch (level) {
      case 'low':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'moderate':
        return <Info className="w-6 h-6 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case 'very-high':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Info className="w-6 h-6 text-gray-600" />;
    }
  }, []);

  const getStepIcon = useMemo(() => (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return <User className="w-5 h-5" />;
      case 2:
        return <Microscope className="w-5 h-5" />;
      case 3:
        return <Activity className="w-5 h-5" />;
      default:
        return <Calculator className="w-5 h-5" />;
    }
  }, []);

  return (
    <CalculatorContainer
      key={currentLanguage}  // Force re-render on language change
      title={t('calculators.obgyn.cervical_cancer_risk.title')}
      subtitle={t('calculators.obgyn.cervical_cancer_risk.subtitle')}
      icon={Shield}
      gradient="obgyn"
    >
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'calculator' | 'about')} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-purple-50 border border-purple-200">
          <TabsTrigger value="calculator" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Calculator className="w-4 h-4 mr-2" />
            {t('calculators.obgyn.cervical_cancer_risk.calculator_tab')}
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Info className="w-4 h-4 mr-2" />
            {t('calculators.obgyn.cervical_cancer_risk.about_tab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-8">
          {/* Progress Indicator */}
          <div className="w-full bg-purple-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-800">{t('calculators.obgyn.cervical_cancer_risk.progress.title')}</h3>
              <span className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                {t('calculators.obgyn.cervical_cancer_risk.progress.step_indicator', { step })}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${step >= i 
                      ? 'bg-purple-600 border-purple-600 text-white' 
                      : 'bg-white border-purple-300 text-purple-400'
                    }
                  `}>
                    {getStepIcon(i)}
                  </div>
                  {i < 3 && (
                    <div className={`
                      w-16 h-1 mx-2 rounded transition-colors
                      ${step > i ? 'bg-purple-600' : 'bg-purple-200'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <p className="text-sm font-medium text-purple-800">{t('calculators.obgyn.cervical_cancer_risk.progress.steps.demographics.title')}</p>
                <p className="text-xs text-purple-600">{t('calculators.obgyn.cervical_cancer_risk.progress.steps.demographics.description')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">{t('calculators.obgyn.cervical_cancer_risk.progress.steps.test_results.title')}</p>
                <p className="text-xs text-purple-600">{t('calculators.obgyn.cervical_cancer_risk.progress.steps.test_results.description')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">{t('calculators.obgyn.cervical_cancer_risk.progress.steps.risk_factors.title')}</p>
                <p className="text-xs text-purple-600">{t('calculators.obgyn.cervical_cancer_risk.progress.steps.risk_factors.description')}</p>
              </div>
            </div>
          </div>

          {/* Step 1: Demographics */}
          {step === 1 && (
            <Card className="border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                <CardTitle className="flex items-center gap-3 text-purple-800">
                  <User className="w-6 h-6 text-purple-600" />
                  {t('calculators.obgyn.cervical_cancer_risk.demographics.title')}
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-auto">
                    {t('calculators.obgyn.cervical_cancer_risk.demographics.step_label')}
                  </span>
              </CardTitle>
            </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <CalculatorInput
                    label={t('calculators.obgyn.cervical_cancer_risk.demographics.patient_age.label')}
                    value={formData.age}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('age', e.target.value)}
                    type="number"
                    placeholder={t('calculators.obgyn.cervical_cancer_risk.demographics.patient_age.placeholder')}
                    min={18}
                    max={100}
                    unit={t('calculators.obgyn.cervical_cancer_risk.demographics.patient_age.unit')}
                    error={errors.age}
                    helpText={t('calculators.obgyn.cervical_cancer_risk.demographics.patient_age.help')}
                    icon={User}
                    required
                  />

                  <CalculatorSelect
                    label={t('calculators.obgyn.cervical_cancer_risk.demographics.screening_history.label')}
                    value={formData.screeningHistory}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('screeningHistory', e.target.value)}
                    options={[
                      { value: 'adequate', label: t('calculators.obgyn.cervical_cancer_risk.demographics.screening_history.options.adequate') },
                      { value: 'inadequate', label: t('calculators.obgyn.cervical_cancer_risk.demographics.screening_history.options.inadequate') },
                      { value: 'never-screened', label: t('calculators.obgyn.cervical_cancer_risk.demographics.screening_history.options.never_screened') }
                    ]}
                    helpText={t('calculators.obgyn.cervical_cancer_risk.demographics.screening_history.help')}
                    icon={Calendar}
                  />
                </div>

                <div className="flex justify-end">
                  <CalculatorButton
                    onClick={handleNext}
                    disabled={!formData.age}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                  >
                    {t('calculators.obgyn.cervical_cancer_risk.demographics.next_button')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </CalculatorButton>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: HPV and Cytology Results */}
          {step === 2 && (
            <Card className="border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                <CardTitle className="flex items-center gap-3 text-purple-800">
                  <Microscope className="w-6 h-6 text-purple-600" />
                  {t('calculators.obgyn.cervical_cancer_risk.test_results.title')}
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-auto">
                    {t('calculators.obgyn.cervical_cancer_risk.test_results.step_label')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* HPV Testing */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <Dna className="w-5 h-5" />
                    {t('calculators.obgyn.cervical_cancer_risk.test_results.hpv_test.title')}
                  </h4>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="space-y-3">
                      <CalculatorCheckbox
                        label={t('calculators.obgyn.cervical_cancer_risk.test_results.hpv_test.positive_high_risk.label')}
                          checked={formData.hpvStatus === 'positive-high-risk'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleInputChange('hpvStatus', e.target.checked ? 'positive-high-risk' : 'unknown')
                        }
                        description={t('calculators.obgyn.cervical_cancer_risk.test_results.hpv_test.positive_high_risk.description')}
                      />
                      
                      <CalculatorCheckbox
                        label={t('calculators.obgyn.cervical_cancer_risk.test_results.hpv_test.positive_low_risk.label')}
                          checked={formData.hpvStatus === 'positive-low-risk'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleInputChange('hpvStatus', e.target.checked ? 'positive-low-risk' : 'unknown')
                        }
                        description={t('calculators.obgyn.cervical_cancer_risk.test_results.hpv_test.positive_low_risk.description')}
                      />
                  </div>

                  <div className="space-y-3">
                      <CalculatorCheckbox
                        label={t('calculators.obgyn.cervical_cancer_risk.test_results.hpv_test.negative.label')}
                        checked={formData.hpvStatus === 'negative'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleInputChange('hpvStatus', e.target.checked ? 'negative' : 'unknown')
                        }
                        description={t('calculators.obgyn.cervical_cancer_risk.test_results.hpv_test.negative.description')}
                        />
                      
                      <CalculatorCheckbox
                        label={t('calculators.obgyn.cervical_cancer_risk.test_results.hpv_test.unknown.label')}
                        checked={formData.hpvStatus === 'unknown'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleInputChange('hpvStatus', e.target.checked ? 'unknown' : 'negative')
                        }
                        description={t('calculators.obgyn.cervical_cancer_risk.test_results.hpv_test.unknown.description')}
                      />
                    </div>
                  </div>
                </div>

                {/* Cytology Results */}
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <h4 className="font-semibold text-pink-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {t('calculators.obgyn.cervical_cancer_risk.test_results.cytology_test.title')}
                  </h4>
                  
                  <CalculatorSelect
                    label={t('calculators.obgyn.cervical_cancer_risk.test_results.cytology_test.label')}
                    value={formData.cytologyResult}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('cytologyResult', e.target.value)}
                    options={[
                      { value: 'normal', label: t('calculators.obgyn.cervical_cancer_risk.test_results.cytology_test.options.normal') },
                      { value: 'ascus', label: t('calculators.obgyn.cervical_cancer_risk.test_results.cytology_test.options.ascus') },
                      { value: 'lsil', label: t('calculators.obgyn.cervical_cancer_risk.test_results.cytology_test.options.lsil') },
                      { value: 'hsil', label: t('calculators.obgyn.cervical_cancer_risk.test_results.cytology_test.options.hsil') },
                      { value: 'asc-h', label: t('calculators.obgyn.cervical_cancer_risk.test_results.cytology_test.options.asc_h') },
                      { value: 'agc', label: t('calculators.obgyn.cervical_cancer_risk.test_results.cytology_test.options.agc') }
                    ]}
                    helpText={t('calculators.obgyn.cervical_cancer_risk.test_results.cytology_test.help')}
                    icon={Microscope}
                  />
              </div>

                <div className="flex gap-4">
                  <CalculatorButton
                    onClick={handlePrevious}
                    variant="outline"
                    className="px-8"
                  >
                    {t('calculators.obgyn.cervical_cancer_risk.test_results.previous_button')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={handleNext}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 flex-1"
                  >
                    {t('calculators.obgyn.cervical_cancer_risk.test_results.next_button')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </CalculatorButton>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Clinical Risk Factors */}
          {step === 3 && (
            <Card className="border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                <CardTitle className="flex items-center gap-3 text-purple-800">
                  <Activity className="w-6 h-6 text-purple-600" />
                  {t('calculators.obgyn.cervical_cancer_risk.risk_factors.title')}
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-auto">
                    {t('calculators.obgyn.cervical_cancer_risk.risk_factors.step_label')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Medical History Risk Factors */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {t('calculators.obgyn.cervical_cancer_risk.risk_factors.medical_history.title')}
                  </h4>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.cervical_cancer_risk.risk_factors.medical_history.previous_abnormal_screening.label')}
                      checked={formData.previousAbnormalScreening}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('previousAbnormalScreening', e.target.checked)}
                      description={t('calculators.obgyn.cervical_cancer_risk.risk_factors.medical_history.previous_abnormal_screening.description')}
                    />
                    
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.cervical_cancer_risk.risk_factors.medical_history.immunocompromised.label')}
                      checked={formData.immunocompromised}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('immunocompromised', e.target.checked)}
                      description={t('calculators.obgyn.cervical_cancer_risk.risk_factors.medical_history.immunocompromised.description')}
                    />
                  </div>
                    </div>

                {/* Lifestyle Risk Factors */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    {t('calculators.obgyn.cervical_cancer_risk.risk_factors.lifestyle_factors.title')}
                  </h4>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.cervical_cancer_risk.risk_factors.lifestyle_factors.smoking_status.label')}
                      checked={formData.smokingStatus}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('smokingStatus', e.target.checked)}
                      description={t('calculators.obgyn.cervical_cancer_risk.risk_factors.lifestyle_factors.smoking_status.description')}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <CalculatorButton
                    onClick={handlePrevious}
                    variant="outline"
                    className="px-8"
                  >
                    {t('calculators.obgyn.cervical_cancer_risk.risk_factors.previous_button')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={handleCalculate}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 flex-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('calculators.obgyn.cervical_cancer_risk.risk_factors.calculating')}
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        {t('calculators.obgyn.cervical_cancer_risk.risk_factors.calculate_button')}
                      </>
                    )}
                  </CalculatorButton>
                </div>

                <CalculatorButton
                  onClick={handleReset}
                  variant="outline"
                  className="w-full mt-4"
                >
                  {t('calculators.obgyn.cervical_cancer_risk.risk_factors.reset_button')}
                </CalculatorButton>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {showResult && result && (
            <div id="cervical-results">
              <ResultsDisplay
                title={t('calculators.obgyn.cervical_cancer_risk.results.title')}
                value={t('calculators.obgyn.cervical_cancer_risk.results.risk_level', { 
                  level: t(`calculators.obgyn.cervical_cancer_risk.results.categories.${result.riskLevel}`) 
                })}
                category={result.riskLevel === 'minimal' || result.riskLevel === 'low' ? 'low' : result.riskLevel === 'intermediate' ? 'intermediate' : 'high'}
                interpretation={result.interpretation}
                icon={Shield}
              >
                {/* Risk Assessment Card */}
                <div className={`p-6 rounded-xl border-2 ${getRiskColor(result.riskLevel)} mb-6`}>
                  <div className="flex items-center gap-4 mb-4">
                    {getRiskIcon(result.riskLevel)}
                    <div>
                      <h3 className="text-xl font-bold">
                        {t('calculators.obgyn.cervical_cancer_risk.results.risk_level', { 
                          level: t(`calculators.obgyn.cervical_cancer_risk.results.categories.${result.riskLevel}`) 
                        })}
                      </h3>
                      <p className="text-sm font-medium">{t('calculators.obgyn.cervical_cancer_risk.results.management.follow_up_title')}: {result.followUpInterval}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{result.interpretation}</p>
                </div>

                {/* Management Strategy Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">{t('calculators.obgyn.cervical_cancer_risk.results.management.title')}</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      {result.managementRecommendation}
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">{t('calculators.obgyn.cervical_cancer_risk.results.management.follow_up_title')}</h4>
                    </div>
                    <p className="text-sm text-purple-700">
                      {result.followUpInterval}
                    </p>
                  </div>
                </div>

                {/* Colposcopy Recommendation */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {t('calculators.obgyn.cervical_cancer_risk.results.asccp_recommendations.title')}
                  </h4>
                  <div className="space-y-2">
                    <div className="text-sm text-green-700 flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{result.managementRecommendation}</span>
                    </div>
                    {result.colposcopyRecommended && (
                      <div className="text-sm text-green-700 flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{t('calculators.obgyn.cervical_cancer_risk.results.asccp_recommendations.colposcopy_recommended')}</span>
                      </div>
                    )}
                </div>
              </div>

                {/* Clinical Recommendations */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {t('calculators.obgyn.cervical_cancer_risk.results.clinical_recommendations.title')}
                  </h4>
                  <div className="space-y-2">
                    {result.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="text-sm text-orange-700 flex items-start gap-3">
                        <Star className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
              </div>
                    ))}
                  </div>
                </div>

                {/* Share Results */}
                <CalculatorResultShare
                  calculatorName={t('calculators.obgyn.cervical_cancer_risk.results.share.calculator_name')}
                  calculatorId="cervical-cancer-risk"
                  results={{
                    [t('calculators.obgyn.cervical_cancer_risk.results.share.results_summary.risk_level')]: t(`calculators.obgyn.cervical_cancer_risk.results.categories.${result.riskLevel}`),
                    [t('calculators.obgyn.cervical_cancer_risk.results.share.results_summary.follow_up_interval')]: result.followUpInterval,
                    [t('calculators.obgyn.cervical_cancer_risk.results.share.results_summary.management_recommendation')]: result.managementRecommendation,
                    [t('calculators.obgyn.cervical_cancer_risk.results.share.results_summary.colposcopy_recommended')]: result.colposcopyRecommended ? t('calculators.obgyn.cervical_cancer_risk.results.share.results_summary.yes') : t('calculators.obgyn.cervical_cancer_risk.results.share.results_summary.no')
                  }}
                  interpretation={result.interpretation}
                  recommendations={result.recommendations}
                  riskLevel={result.riskLevel === 'minimal' || result.riskLevel === 'low' ? 'low' : result.riskLevel === 'intermediate' ? 'intermediate' : 'high'}
                />
              </ResultsDisplay>
              </div>
          )}
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
              <CardTitle className="flex items-center gap-3 text-purple-800">
                <Info className="w-6 h-6 text-purple-600" />
                {t('calculators.obgyn.cervical_cancer_risk.about.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {t('calculators.obgyn.cervical_cancer_risk.about.clinical_purpose.title')}
                </h3>
                <p className="text-purple-700 mb-3">
                  {t('calculators.obgyn.cervical_cancer_risk.about.clinical_purpose.description_1')}
                </p>
                <p className="text-purple-700">
                  {t('calculators.obgyn.cervical_cancer_risk.about.clinical_purpose.description_2')}
                </p>
              </div>

              <div className="grid xl:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {t('calculators.obgyn.cervical_cancer_risk.about.risk_factors.high_risk.title')}
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {(t('calculators.obgyn.cervical_cancer_risk.about.risk_factors.high_risk.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {t('calculators.obgyn.cervical_cancer_risk.about.risk_factors.protective.title')}
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    {(t('calculators.obgyn.cervical_cancer_risk.about.risk_factors.protective.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t('calculators.obgyn.cervical_cancer_risk.about.asccp_management.title')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">{t('calculators.obgyn.cervical_cancer_risk.about.asccp_management.immediate_risk.title')}</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {(t('calculators.obgyn.cervical_cancer_risk.about.asccp_management.immediate_risk.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">{t('calculators.obgyn.cervical_cancer_risk.about.asccp_management.management_strategies.title')}</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {(t('calculators.obgyn.cervical_cancer_risk.about.asccp_management.management_strategies.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                  <Microscope className="w-5 h-5" />
                  {t('calculators.obgyn.cervical_cancer_risk.about.screening_guidelines.title')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">{t('calculators.obgyn.cervical_cancer_risk.about.screening_guidelines.age_based.title')}</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {(t('calculators.obgyn.cervical_cancer_risk.about.screening_guidelines.age_based.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">{t('calculators.obgyn.cervical_cancer_risk.about.screening_guidelines.special_populations.title')}</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {(t('calculators.obgyn.cervical_cancer_risk.about.screening_guidelines.special_populations.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t('calculators.obgyn.cervical_cancer_risk.about.clinical_guidelines.title')}
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  {(t('calculators.obgyn.cervical_cancer_risk.about.clinical_guidelines.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </CalculatorContainer>
  );
};

// Memoized component to prevent unnecessary re-renders
export const CervicalCancerRiskCalculator = React.memo(CervicalCancerRiskCalculatorComponent);

export default CervicalCancerRiskCalculator; 