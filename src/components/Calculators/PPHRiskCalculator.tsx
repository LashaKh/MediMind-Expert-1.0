import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Droplets, AlertTriangle, Shield, Activity, Heart, Info, CheckCircle, Star, User, Baby, Clock, Target, Calculator, TrendingUp, Stethoscope, Award, ArrowRight, Users, FileText, Calendar, AlertCircle } from 'lucide-react';
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
import { calculatePPHRisk, validateOBGYNInput } from '../../services/obgynCalculatorService';
import { PPHRiskInput, PPHRiskResult } from '../../types/obgyn-calculators';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../stores/useAppStore';
import { safeAsync, safe, ErrorSeverity } from '../../lib/utils/errorHandling';

interface FormData {
  maternalAge: string;
  bmi: string;
  parity: string;
  previousPPH: boolean;
  multipleGestation: boolean;
  polyhydramnios: boolean;
  macrosomia: boolean;
  prolongedLabor: boolean;
  chorioamnionitis: boolean;
  placenta: 'normal' | 'previa' | 'accreta' | 'abruption';
  anticoagulation: boolean;
}

interface Errors {
  maternalAge?: string;
  bmi?: string;
  parity?: string;
}

const PPHRiskCalculatorComponent: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
  const [formData, setFormData] = useState<FormData>({
    maternalAge: '',
    bmi: '',
    parity: '',
    previousPPH: false,
    multipleGestation: false,
    polyhydramnios: false,
    macrosomia: false,
    prolongedLabor: false,
    chorioamnionitis: false,
    placenta: 'normal',
    anticoagulation: false,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<PPHRiskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'about'>('calculator');

  // Clear results when language changes to prevent stale translations
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
      if (!formData.maternalAge) {
        newErrors.maternalAge = t('calculators.obgyn.pph_risk_calculator.demographics.maternal_age.required_error');
      } else if (Number(formData.maternalAge) < 15 || Number(formData.maternalAge) > 55) {
        newErrors.maternalAge = t('calculators.obgyn.pph_risk_calculator.demographics.maternal_age.validation_error');
      }

      if (!formData.bmi) {
        newErrors.bmi = t('calculators.obgyn.pph_risk_calculator.demographics.bmi.required_error');
      } else if (Number(formData.bmi) < 15 || Number(formData.bmi) > 60) {
        newErrors.bmi = t('calculators.obgyn.pph_risk_calculator.demographics.bmi.validation_error');
      }

      if (!formData.parity) {
        newErrors.parity = t('calculators.obgyn.pph_risk_calculator.demographics.parity.required_error');
      } else if (Number(formData.parity) < 0 || Number(formData.parity) > 20) {
        newErrors.parity = t('calculators.obgyn.pph_risk_calculator.demographics.parity.validation_error');
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
      const input: PPHRiskInput = {
        maternalAge: formData.maternalAge,
        bmi: formData.bmi,
        parity: formData.parity,
        previousPPH: formData.previousPPH,
        multipleGestation: formData.multipleGestation,
        polyhydramnios: formData.polyhydramnios,
        macrosomia: formData.macrosomia,
        prolongedLabor: formData.prolongedLabor,
        chorioamnionitis: formData.chorioamnionitis,
        placenta: formData.placenta,
        anticoagulation: formData.anticoagulation,
      };

      // Validate input
      const validation = validateOBGYNInput('pph-risk', input);
      if (!validation.isValid) {
        const fieldErrors: Errors = {};
        validation.errors.forEach(error => {
          if (error.includes('age')) fieldErrors.maternalAge = error;
          if (error.includes('BMI')) fieldErrors.bmi = error;
          if (error.includes('parity')) fieldErrors.parity = error;
        });
        setErrors(fieldErrors);
        return;
      }

      const calculationResult = calculatePPHRisk(input, t);
      setResult(calculationResult);
      setShowResult(true);
      
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('pph-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

      return calculationResult;
    }, {
      context: 'postpartum hemorrhage risk calculation',
      severity: ErrorSeverity.HIGH,
      showToast: true
    });

    if (error) {
      setErrors({ maternalAge: t('calculators.obgyn.pph_risk_calculator.calculation_error') });
    }

    setIsLoading(false);
  }, [validateStep, formData, t]);

  const handleReset = useCallback(() => {
    setFormData({
      maternalAge: '',
      bmi: '',
      parity: '',
      previousPPH: false,
      multipleGestation: false,
      polyhydramnios: false,
      macrosomia: false,
      prolongedLabor: false,
      chorioamnionitis: false,
      placenta: 'normal',
      anticoagulation: false,
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
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'high':
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
        return <FileText className="w-5 h-5" />;
      case 3:
        return <Activity className="w-5 h-5" />;
      default:
        return <Calculator className="w-5 h-5" />;
    }
  }, []);

  const getTranslationArray = useCallback((key: string, fallbackLength: number = 0): string[] => {
    const [result, error] = safe(() => {
      // For arrays in translations, we need to access them individually
      const items: string[] = [];
      let index = 0;
      
      // Keep trying to get items until we don't find any more
      while (true) {
        const itemKey = `${key}.${index}`;
        const item = t(itemKey);
        
        // If we get back the key itself, it means translation doesn't exist
        if (item === itemKey) {
          break;
        }
        
        items.push(item);
        index++;
      }
      
      return items;
    }, {
      context: `translation array retrieval for key "${key}"`,
      severity: ErrorSeverity.LOW,
      showToast: false
    });

    return error ? [] : result;
  }, [t]);

  return (
    <CalculatorContainer
      key={currentLanguage}
      title={t('calculators.obgyn.pph_risk_calculator.title')}
      subtitle={t('calculators.obgyn.pph_risk_calculator.subtitle')}
      icon={Droplets}
      gradient="obgyn"
    >
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'calculator' | 'about')} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-red-50 border border-red-200">
          <TabsTrigger value="calculator" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Calculator className="w-4 h-4 mr-2" />
            {t('calculators.obgyn.pph_risk_calculator.calculator_tab')}
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Info className="w-4 h-4 mr-2" />
            {t('calculators.obgyn.pph_risk_calculator.about_tab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-8">
          {/* Progress Indicator */}
          <div className="w-full bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-800">{t('calculators.obgyn.pph_risk_calculator.progress.title')}</h3>
              <span className="text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full">
                {t('calculators.obgyn.pph_risk_calculator.progress.step_indicator', { step: step.toString() })}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${step >= i 
                      ? 'bg-red-600 border-red-600 text-white' 
                      : 'bg-white border-red-300 text-red-400'
                    }
                  `}>
                    {getStepIcon(i)}
                  </div>
                  {i < 3 && (
                    <div className={`
                      w-16 h-1 mx-2 rounded transition-colors
                      ${step > i ? 'bg-red-600' : 'bg-red-200'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <p className="text-sm font-medium text-red-800">{t('calculators.obgyn.pph_risk_calculator.progress.steps.demographics.title')}</p>
                <p className="text-xs text-red-600">{t('calculators.obgyn.pph_risk_calculator.progress.steps.demographics.description')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">{t('calculators.obgyn.pph_risk_calculator.progress.steps.medical_history.title')}</p>
                <p className="text-xs text-red-600">{t('calculators.obgyn.pph_risk_calculator.progress.steps.medical_history.description')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">{t('calculators.obgyn.pph_risk_calculator.progress.steps.current_pregnancy.title')}</p>
                <p className="text-xs text-red-600">{t('calculators.obgyn.pph_risk_calculator.progress.steps.current_pregnancy.description')}</p>
              </div>
            </div>
          </div>

          {/* Step 1: Demographics */}
          {step === 1 && (
            <Card className="border-red-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
                <CardTitle className="flex items-center gap-3 text-red-800">
                  <User className="w-6 h-6 text-red-600" />
                  {t('calculators.obgyn.pph_risk_calculator.demographics.title')}
                  <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full ml-auto">
                    {t('calculators.obgyn.pph_risk_calculator.demographics.step_label')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  <CalculatorInput
                    label={t('calculators.obgyn.pph_risk_calculator.demographics.maternal_age.label')}
                    value={formData.maternalAge}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('maternalAge', e.target.value)}
                    type="number"
                    placeholder={t('calculators.obgyn.pph_risk_calculator.demographics.maternal_age.placeholder')}
                    min={15}
                    max={55}
                    unit={t('calculators.obgyn.pph_risk_calculator.demographics.maternal_age.unit')}
                    error={errors.maternalAge}
                    helpText={t('calculators.obgyn.pph_risk_calculator.demographics.maternal_age.help')}
                    icon={User}
                    required
                  />

                  <CalculatorInput
                    label={t('calculators.obgyn.pph_risk_calculator.demographics.bmi.label')}
                    value={formData.bmi}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('bmi', e.target.value)}
                    type="number"
                    step={0.1}
                    placeholder={t('calculators.obgyn.pph_risk_calculator.demographics.bmi.placeholder')}
                    min={15}
                    max={60}
                    unit={t('calculators.obgyn.pph_risk_calculator.demographics.bmi.unit')}
                    error={errors.bmi}
                    helpText={t('calculators.obgyn.pph_risk_calculator.demographics.bmi.help')}
                    icon={Activity}
                    required
                  />

                  <CalculatorInput
                    label={t('calculators.obgyn.pph_risk_calculator.demographics.parity.label')}
                    value={formData.parity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('parity', e.target.value)}
                    type="number"
                    placeholder={t('calculators.obgyn.pph_risk_calculator.demographics.parity.placeholder')}
                    min={0}
                    max={20}
                    unit={t('calculators.obgyn.pph_risk_calculator.demographics.parity.unit')}
                    error={errors.parity}
                    helpText={t('calculators.obgyn.pph_risk_calculator.demographics.parity.help')}
                    icon={Baby}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <CalculatorButton
                    onClick={handleNext}
                    disabled={!formData.maternalAge || !formData.bmi || !formData.parity}
                    className="bg-red-600 hover:bg-red-700 text-white px-8"
                  >
                    {t('calculators.obgyn.pph_risk_calculator.demographics.next_button')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </CalculatorButton>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Medical History */}
          {step === 2 && (
            <Card className="border-red-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
                <CardTitle className="flex items-center gap-3 text-red-800">
                  <FileText className="w-6 h-6 text-red-600" />
                  {t('calculators.obgyn.pph_risk_calculator.medical_history.title')}
                  <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full ml-auto">
                    {t('calculators.obgyn.pph_risk_calculator.medical_history.step_label')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {t('calculators.obgyn.pph_risk_calculator.medical_history.obstetric_history.title')}
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.pph_risk_calculator.medical_history.obstetric_history.previous_pph.label')}
                      checked={formData.previousPPH}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('previousPPH', e.target.checked)}
                      description={t('calculators.obgyn.pph_risk_calculator.medical_history.obstetric_history.previous_pph.description')}
                    />
                    
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.pph_risk_calculator.medical_history.obstetric_history.anticoagulation.label')}
                      checked={formData.anticoagulation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('anticoagulation', e.target.checked)}
                      description={t('calculators.obgyn.pph_risk_calculator.medical_history.obstetric_history.anticoagulation.description')}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <CalculatorButton
                    onClick={handlePrevious}
                    variant="outline"
                    className="px-8"
                  >
                    {t('calculators.obgyn.pph_risk_calculator.medical_history.previous_button')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={handleNext}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 flex-1"
                  >
                    {t('calculators.obgyn.pph_risk_calculator.medical_history.next_button')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </CalculatorButton>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Current Pregnancy & Labor Factors */}
          {step === 3 && (
            <Card className="border-red-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
                <CardTitle className="flex items-center gap-3 text-red-800">
                  <Activity className="w-6 h-6 text-red-600" />
                  {t('calculators.obgyn.pph_risk_calculator.current_pregnancy.title')}
                  <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full ml-auto">
                    {t('calculators.obgyn.pph_risk_calculator.current_pregnancy.step_label')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Current Pregnancy Factors */}
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <h4 className="font-semibold text-pink-800 mb-4 flex items-center gap-2">
                    <Baby className="w-5 h-5" />
                    {t('calculators.obgyn.pph_risk_calculator.current_pregnancy.pregnancy_factors.title')}
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.pph_risk_calculator.current_pregnancy.pregnancy_factors.multiple_gestation.label')}
                      checked={formData.multipleGestation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('multipleGestation', e.target.checked)}
                      description={t('calculators.obgyn.pph_risk_calculator.current_pregnancy.pregnancy_factors.multiple_gestation.description')}
                    />
                    
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.pph_risk_calculator.current_pregnancy.pregnancy_factors.polyhydramnios.label')}
                      checked={formData.polyhydramnios}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('polyhydramnios', e.target.checked)}
                      description={t('calculators.obgyn.pph_risk_calculator.current_pregnancy.pregnancy_factors.polyhydramnios.description')}
                    />
                    
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.pph_risk_calculator.current_pregnancy.pregnancy_factors.macrosomia.label')}
                      checked={formData.macrosomia}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('macrosomia', e.target.checked)}
                      description={t('calculators.obgyn.pph_risk_calculator.current_pregnancy.pregnancy_factors.macrosomia.description')}
                    />
                    
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.pph_risk_calculator.current_pregnancy.pregnancy_factors.chorioamnionitis.label')}
                      checked={formData.chorioamnionitis}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('chorioamnionitis', e.target.checked)}
                      description={t('calculators.obgyn.pph_risk_calculator.current_pregnancy.pregnancy_factors.chorioamnionitis.description')}
                    />
                  </div>
                </div>

                {/* Labor & Delivery Factors */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    {t('calculators.obgyn.pph_risk_calculator.current_pregnancy.labor_factors.title')}
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.pph_risk_calculator.current_pregnancy.labor_factors.prolonged_labor.label')}
                      checked={formData.prolongedLabor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('prolongedLabor', e.target.checked)}
                      description={t('calculators.obgyn.pph_risk_calculator.current_pregnancy.labor_factors.prolonged_labor.description')}
                    />
                    
                    <div className="space-y-3">
                      <CalculatorSelect
                        label={t('calculators.obgyn.pph_risk_calculator.current_pregnancy.labor_factors.placental_condition.label')}
                        value={formData.placenta}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('placenta', e.target.value)}
                        options={[
                          { value: 'normal', label: t('calculators.obgyn.pph_risk_calculator.current_pregnancy.labor_factors.placental_condition.options.normal') },
                          { value: 'previa', label: t('calculators.obgyn.pph_risk_calculator.current_pregnancy.labor_factors.placental_condition.options.previa') },
                          { value: 'accreta', label: t('calculators.obgyn.pph_risk_calculator.current_pregnancy.labor_factors.placental_condition.options.accreta') },
                          { value: 'abruption', label: t('calculators.obgyn.pph_risk_calculator.current_pregnancy.labor_factors.placental_condition.options.abruption') }
                        ]}
                        helpText={t('calculators.obgyn.pph_risk_calculator.current_pregnancy.labor_factors.placental_condition.help')}
                        icon={Target}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CalculatorButton
                    onClick={handlePrevious}
                    variant="outline"
                    className="px-8"
                  >
                    {t('calculators.obgyn.pph_risk_calculator.current_pregnancy.previous_button')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={handleCalculate}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 flex-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('calculators.obgyn.pph_risk_calculator.current_pregnancy.calculating')}
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        {t('calculators.obgyn.pph_risk_calculator.current_pregnancy.calculate_button')}
                      </>
                    )}
                  </CalculatorButton>
                </div>

                <CalculatorButton
                  onClick={handleReset}
                  variant="outline"
                  className="w-full mt-4"
                >
                  {t('calculators.obgyn.pph_risk_calculator.current_pregnancy.reset_button')}
                </CalculatorButton>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {showResult && result && (
            <div id="pph-results">
              <ResultsDisplay
                title={t('calculators.obgyn.pph_risk_calculator.results.title')}
                value={t('calculators.obgyn.pph_risk_calculator.results.risk_level', { 
                  category: t(`calculators.obgyn.pph_risk_calculator.results.categories.${result.category}`)
                })}
                category={result.category === 'low' ? 'low' : result.category === 'moderate' ? 'intermediate' : 'high'}
                interpretation={result.interpretation}
                icon={Droplets}
              >
                {/* Risk Assessment Card */}
                <div className={`p-6 rounded-xl border-2 ${getRiskColor(result.category)} mb-6`}>
                  <div className="flex items-center gap-4 mb-4">
                    {getRiskIcon(result.category)}
                    <div>
                      <h3 className="text-xl font-bold">
                        {t(`calculators.obgyn.pph_risk_calculator.results.categories.${result.category}`)} {t('calculators.obgyn.pph_risk_calculator.results.risk_level', { category: '' }).split(' ')[1]}
                      </h3>
                      <p className="text-sm font-medium">{t('calculators.obgyn.pph_risk_calculator.results.score', { score: result.riskScore.toString() })}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{result.interpretation}</p>
                </div>

                {/* Management Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">{t('calculators.obgyn.pph_risk_calculator.results.cards.prevention_strategy.title')}</h4>
                    </div>
                    <p className="text-sm text-blue-700 capitalize">
                      {t(`calculators.obgyn.pph_risk_calculator.results.prevention_strategies.${result.preventionStrategy}`)}
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">{t('calculators.obgyn.pph_risk_calculator.results.cards.emergency_preparedness.title')}</h4>
                    </div>
                    <p className="text-sm text-purple-700">
                      {result.emergencyPreparation 
                        ? t('calculators.obgyn.pph_risk_calculator.results.emergency_preparations.enhanced')
                        : t('calculators.obgyn.pph_risk_calculator.results.emergency_preparations.standard')
                      }
                    </p>
                  </div>
                </div>

                {/* Intervention Plan */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    {t('calculators.obgyn.pph_risk_calculator.results.cards.intervention_plan.title')}
                  </h4>
                  <ul className="space-y-2">
                    {result.interventionPlan.map((intervention, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{intervention}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Management Recommendations */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {t('calculators.obgyn.pph_risk_calculator.results.cards.management_recommendations.title')}
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start gap-3">
                        <Star className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Share Results */}
                <CalculatorResultShare
                  calculatorName={t('calculators.obgyn.pph_risk_calculator.results.share.calculator_name')}
                  calculatorId="pph-risk"
                  results={{
                    [t('calculators.obgyn.pph_risk_calculator.results.share.results_summary.risk_level')]: t(`calculators.obgyn.pph_risk_calculator.results.categories.${result.category}`),
                    [t('calculators.obgyn.pph_risk_calculator.results.share.results_summary.risk_score')]: `${result.riskScore}/20`,
                    [t('calculators.obgyn.pph_risk_calculator.results.share.results_summary.prevention_strategy')]: t(`calculators.obgyn.pph_risk_calculator.results.prevention_strategies.${result.preventionStrategy}`),
                    [t('calculators.obgyn.pph_risk_calculator.results.share.results_summary.emergency_preparation')]: result.emergencyPreparation 
                      ? t('calculators.obgyn.pph_risk_calculator.results.emergency_preparations.enhanced') 
                      : t('calculators.obgyn.pph_risk_calculator.results.emergency_preparations.standard')
                  }}
                  interpretation={result.interpretation}
                  recommendations={result.recommendations}
                  riskLevel={result.category === 'low' ? 'low' : result.category === 'moderate' ? 'intermediate' : 'high'}
                />
              </ResultsDisplay>
            </div>
          )}
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card className="border-red-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
              <CardTitle className="flex items-center gap-3 text-red-800">
                <Info className="w-6 h-6 text-red-600" />
                {t('calculators.obgyn.pph_risk_calculator.about.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {t('calculators.obgyn.pph_risk_calculator.about.clinical_purpose.title')}
                </h3>
                <p className="text-red-700 mb-3">
                  {t('calculators.obgyn.pph_risk_calculator.about.clinical_purpose.description1')}
                </p>
                <p className="text-red-700">
                  {t('calculators.obgyn.pph_risk_calculator.about.clinical_purpose.description2')}
                </p>
              </div>

              <div className="grid xl:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">
                    {t('calculators.obgyn.pph_risk_calculator.about.risk_factors.title')}
                  </h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                   {getTranslationArray('calculators.obgyn.pph_risk_calculator.about.risk_factors.items').map((item: string, index: number) => (
                     <li key={index}>• {item}</li>
                   ))}
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    {t('calculators.obgyn.pph_risk_calculator.about.prevention_strategies.title')}
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                   {getTranslationArray('calculators.obgyn.pph_risk_calculator.about.prevention_strategies.items').map((item: string, index: number) => (
                     <li key={index}>• {item}</li>
                   ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    {t('calculators.obgyn.pph_risk_calculator.about.pph_definition.title')}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-2">{t('calculators.obgyn.pph_risk_calculator.about.pph_definition.definition.title')}</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                       {getTranslationArray('calculators.obgyn.pph_risk_calculator.about.pph_definition.definition.items').map((item: string, index: number) => (
                         <li key={index}>• {item}</li>
                       ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-2">{t('calculators.obgyn.pph_risk_calculator.about.pph_definition.management.title')}</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                       {getTranslationArray('calculators.obgyn.pph_risk_calculator.about.pph_definition.management.items').map((item: string, index: number) => (
                         <li key={index}>• {item}</li>
                       ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {t('calculators.obgyn.pph_risk_calculator.about.clinical_guidelines.title')}
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                   {getTranslationArray('calculators.obgyn.pph_risk_calculator.about.clinical_guidelines.items').map((item: string, index: number) => (
                     <li key={index}>{item}</li>
                   ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </CalculatorContainer>
  );
};

// Memoized component to prevent unnecessary re-renders
export const PPHRiskCalculator = React.memo(PPHRiskCalculatorComponent);

export default PPHRiskCalculator;