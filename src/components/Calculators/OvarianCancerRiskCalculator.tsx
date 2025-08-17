import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../stores/useAppStore';
import { Shield, AlertTriangle, Info, CheckCircle, Star, User, FileText, Activity, Clock, Target, Calculator, TrendingUp, Stethoscope, Award, ArrowRight, Users, Calendar, AlertCircle, Microscope, Dna, Heart, FlaskConical, Baby, Zap } from 'lucide-react';
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
import { OvarianCancerRiskInput, OvarianCancerRiskResult } from '../../types/obgyn-calculators';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface FormData {
  age: string;
  familyHistory: 'none' | 'ovarian' | 'breast' | 'both';
  brca1: boolean;
  brca2: boolean;
  lynchSyndrome: boolean;
  personalBreastCancer: boolean;
  parity: string;
  oralContraceptiveUse: string;
  hormonetherapy: boolean;
}

interface Errors {
  age?: string;
  parity?: string;
  oralContraceptiveUse?: string;
}

const OvarianCancerRiskCalculator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentLanguage } = useLanguage();

  // CRITICAL: Synchronize language between LanguageContext and i18next
  useEffect(() => {
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage, i18n]);

  const [formData, setFormData] = useState<FormData>({
    age: '',
    familyHistory: 'none',
    brca1: false,
    brca2: false,
    lynchSyndrome: false,
    personalBreastCancer: false,
    parity: '',
    oralContraceptiveUse: '',
    hormonetherapy: false
  });
  
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<OvarianCancerRiskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'about'>('calculator');

  // CRITICAL: Clear state on language change
  useEffect(() => {
    setResult(null);
    setStep(1);
    setShowResult(false);
    setErrors({});
  }, [currentLanguage]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field as keyof Errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Errors = {};

    if (currentStep === 1) {
    if (!formData.age) {
        newErrors.age = t('calculators.obgyn.ovarian_cancer_risk.step1.age.required_error');
      } else if (Number(formData.age) < 18 || Number(formData.age) > 100) {
        newErrors.age = t('calculators.obgyn.ovarian_cancer_risk.step1.age.validation_error');
    }

    if (!formData.parity) {
        newErrors.parity = t('calculators.obgyn.ovarian_cancer_risk.step1.parity.required_error');
      } else if (Number(formData.parity) < 0 || Number(formData.parity) > 20) {
        newErrors.parity = t('calculators.obgyn.ovarian_cancer_risk.step1.parity.validation_error');
    }

    if (!formData.oralContraceptiveUse) {
        newErrors.oralContraceptiveUse = t('calculators.obgyn.ovarian_cancer_risk.step1.hormonal_history.oral_contraceptive.required_error');
      } else if (Number(formData.oralContraceptiveUse) < 0 || Number(formData.oralContraceptiveUse) > 50) {
        newErrors.oralContraceptiveUse = t('calculators.obgyn.ovarian_cancer_risk.step1.hormonal_history.oral_contraceptive.validation_error');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleCalculate = async () => {
    if (!validateStep(1)) return;

    setIsLoading(true);
    setShowResult(false);

    const [, error] = await safeAsync(async () => {
      const input: OvarianCancerRiskInput = {
        age: formData.age,
        familyHistory: formData.familyHistory,
        brca1: formData.brca1,
        brca2: formData.brca2,
        lynchSyndrome: formData.lynchSyndrome,
        personalBreastCancer: formData.personalBreastCancer,
        parity: formData.parity,
        oralContraceptiveUse: formData.oralContraceptiveUse,
        hormonetherapy: formData.hormonetherapy,
        calculationDate: new Date().toISOString()
      };

      // Validate input
      const validation = validateOBGYNInput('ovarian-cancer-risk', input);
      if (!validation.isValid) {
        const fieldErrors: Errors = {};
        validation.errors.forEach(error => {
          if (error.includes('age')) fieldErrors.age = error;
          if (error.includes('parity')) fieldErrors.parity = error;
          if (error.includes('oral contraceptive')) fieldErrors.oralContraceptiveUse = error;
        });
        setErrors(fieldErrors);
        return;
      }

      const calculationResult = calculateOBGYN('ovarian-cancer-risk', input, t) as OvarianCancerRiskResult;
      setResult(calculationResult);
      setShowResult(true);
      
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('ovarian-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

      return calculationResult;
    }, {
      context: 'ovarian cancer risk calculation',
      severity: ErrorSeverity.HIGH,
      showToast: true
    });

    if (error) {
      setErrors({ age: t('calculators.obgyn.ovarian_cancer_risk.errors.calculation_error') });
    }

    setIsLoading(false);
  };

  const handleReset = () => {
    setFormData({
      age: '',
      familyHistory: 'none',
      brca1: false,
      brca2: false,
      lynchSyndrome: false,
      personalBreastCancer: false,
      parity: '',
      oralContraceptiveUse: '',
      hormonetherapy: false
    });
    setErrors({});
    setResult(null);
    setStep(1);
    setShowResult(false);
  };

  const getRiskColor = (level: string) => {
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
  };

  const getRiskIcon = (level: string) => {
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
  };

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return <User className="w-5 h-5" />;
      case 2:
        return <Dna className="w-5 h-5" />;
      case 3:
        return <Activity className="w-5 h-5" />;
      default:
        return <Calculator className="w-5 h-5" />;
    }
  };

  return (
    <CalculatorContainer
      key={currentLanguage}  // CRITICAL: Forces re-render
      title={t('calculators.obgyn.ovarian_cancer_risk.title')}
      subtitle={t('calculators.obgyn.ovarian_cancer_risk.subtitle')}
      icon={Shield}
      gradient="obgyn"
    >
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'calculator' | 'about')} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-purple-50 border border-purple-200">
          <TabsTrigger value="calculator" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Calculator className="w-4 h-4 mr-2" />
            {t('calculators.obgyn.ovarian_cancer_risk.tabs.calculator')}
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Info className="w-4 h-4 mr-2" />
            {t('calculators.obgyn.ovarian_cancer_risk.tabs.about')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-8">
          {/* Progress Indicator */}
          <div className="w-full bg-purple-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-800">{t('calculators.obgyn.ovarian_cancer_risk.progress.title')}</h3>
              <span className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                {t('calculators.obgyn.ovarian_cancer_risk.progress.step_label', { step })}
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
                <p className="text-sm font-medium text-purple-800">{t('calculators.obgyn.ovarian_cancer_risk.progress.steps.demographics.title')}</p>
                <p className="text-xs text-purple-600">{t('calculators.obgyn.ovarian_cancer_risk.progress.steps.demographics.description')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">{t('calculators.obgyn.ovarian_cancer_risk.progress.steps.genetic.title')}</p>
                <p className="text-xs text-purple-600">{t('calculators.obgyn.ovarian_cancer_risk.progress.steps.genetic.description')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">{t('calculators.obgyn.ovarian_cancer_risk.progress.steps.assessment.title')}</p>
                <p className="text-xs text-purple-600">{t('calculators.obgyn.ovarian_cancer_risk.progress.steps.assessment.description')}</p>
              </div>
            </div>
          </div>

          {/* Step 1: Demographics & Reproductive History */}
          {step === 1 && (
            <Card className="border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                <CardTitle className="flex items-center gap-3 text-purple-800">
                  <User className="w-6 h-6 text-purple-600" />
                  {t('calculators.obgyn.ovarian_cancer_risk.step1.title')}
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-auto">
                    {t('calculators.obgyn.ovarian_cancer_risk.step1.step_indicator')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <CalculatorInput
                    label={t('calculators.obgyn.ovarian_cancer_risk.step1.age.label')}
                    value={formData.age}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('age', e.target.value)}
                    type="number"
                    placeholder="45"
                    min={18}
                    max={100}
                    unit={t('calculators.obgyn.ovarian_cancer_risk.step1.age.unit')}
                    error={errors.age}
                    helpText={t('calculators.obgyn.ovarian_cancer_risk.step1.age.help_text')}
                    icon={User}
                    required
                  />

                  <CalculatorInput
                    label={t('calculators.obgyn.ovarian_cancer_risk.step1.parity.label')}
                    value={formData.parity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('parity', e.target.value)}
                    type="number"
                    placeholder="2"
                    min={0}
                    max={20}
                    unit={t('calculators.obgyn.ovarian_cancer_risk.step1.parity.unit')}
                    error={errors.parity}
                    helpText={t('calculators.obgyn.ovarian_cancer_risk.step1.parity.help_text')}
                    icon={Baby}
                    required
                  />
                </div>

                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <h4 className="font-semibold text-pink-800 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    {t('calculators.obgyn.ovarian_cancer_risk.step1.hormonal_history.title')}
                  </h4>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <CalculatorInput
                      label={t('calculators.obgyn.ovarian_cancer_risk.step1.hormonal_history.oral_contraceptive.label')}
                      value={formData.oralContraceptiveUse}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('oralContraceptiveUse', e.target.value)}
                      type="number"
                      placeholder="5"
                      min={0}
                      max={50}
                      step={0.5}
                      unit={t('calculators.obgyn.ovarian_cancer_risk.step1.hormonal_history.oral_contraceptive.unit')}
                      error={errors.oralContraceptiveUse}
                      helpText={t('calculators.obgyn.ovarian_cancer_risk.step1.hormonal_history.oral_contraceptive.help_text')}
                      icon={Target}
                      required
                    />

                    <div className="space-y-3 pt-6">
                      <CalculatorCheckbox
                        label={t('calculators.obgyn.ovarian_cancer_risk.step1.hormonal_history.hormone_therapy.label')}
                        checked={formData.hormonetherapy}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('hormonetherapy', e.target.checked)}
                        description={t('calculators.obgyn.ovarian_cancer_risk.step1.hormonal_history.hormone_therapy.description')}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <CalculatorButton
                    onClick={handleNext}
                    disabled={!formData.age || !formData.parity || !formData.oralContraceptiveUse}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                  >
                    {t('calculators.obgyn.ovarian_cancer_risk.step1.next_button')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </CalculatorButton>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Genetic Risk Factors */}
          {step === 2 && (
            <Card className="border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                <CardTitle className="flex items-center gap-3 text-purple-800">
                  <Dna className="w-6 h-6 text-purple-600" />
                  {t('calculators.obgyn.ovarian_cancer_risk.step2.title')}
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-auto">
                    {t('calculators.obgyn.ovarian_cancer_risk.step2.step_indicator')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Family History */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t('calculators.obgyn.ovarian_cancer_risk.step2.family_history.title')}
                  </h4>
                  
                  <CalculatorSelect
                    label={t('calculators.obgyn.ovarian_cancer_risk.step2.family_history.label')}
                    value={formData.familyHistory}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('familyHistory', e.target.value)}
                    options={[
                      { value: 'none', label: t('calculators.obgyn.ovarian_cancer_risk.step2.family_history.options.none') },
                      { value: 'ovarian', label: t('calculators.obgyn.ovarian_cancer_risk.step2.family_history.options.ovarian') },
                      { value: 'breast', label: t('calculators.obgyn.ovarian_cancer_risk.step2.family_history.options.breast') },
                      { value: 'both', label: t('calculators.obgyn.ovarian_cancer_risk.step2.family_history.options.both') }
                    ]}
                    helpText={t('calculators.obgyn.ovarian_cancer_risk.step2.family_history.help_text')}
                    icon={Users}
                  />
                  </div>

                  {/* Genetic Mutations */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <FlaskConical className="w-5 h-5" />
                    {t('calculators.obgyn.ovarian_cancer_risk.step2.genetic_mutations.title')}
                  </h4>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.ovarian_cancer_risk.step2.genetic_mutations.brca1.label')}
                        checked={formData.brca1}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('brca1', e.target.checked)}
                      description={t('calculators.obgyn.ovarian_cancer_risk.step2.genetic_mutations.brca1.description')}
                      />

                    <CalculatorCheckbox
                      label={t('calculators.obgyn.ovarian_cancer_risk.step2.genetic_mutations.brca2.label')}
                        checked={formData.brca2}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('brca2', e.target.checked)}
                      description={t('calculators.obgyn.ovarian_cancer_risk.step2.genetic_mutations.brca2.description')}
                      />

                    <CalculatorCheckbox
                      label={t('calculators.obgyn.ovarian_cancer_risk.step2.genetic_mutations.lynch_syndrome.label')}
                        checked={formData.lynchSyndrome}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lynchSyndrome', e.target.checked)}
                      description={t('calculators.obgyn.ovarian_cancer_risk.step2.genetic_mutations.lynch_syndrome.description')}
                      />

                    <CalculatorCheckbox
                      label={t('calculators.obgyn.ovarian_cancer_risk.step2.genetic_mutations.personal_breast_cancer.label')}
                        checked={formData.personalBreastCancer}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('personalBreastCancer', e.target.checked)}
                      description={t('calculators.obgyn.ovarian_cancer_risk.step2.genetic_mutations.personal_breast_cancer.description')}
                      />
                  </div>
                </div>

                <div className="flex gap-4">
                  <CalculatorButton
                    onClick={handlePrevious}
                    variant="outline"
                    className="px-8"
                  >
                    {t('calculators.obgyn.ovarian_cancer_risk.step2.buttons.previous')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={handleNext}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 flex-1"
                  >
                    {t('calculators.obgyn.ovarian_cancer_risk.step2.buttons.next')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </CalculatorButton>
              </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Risk Calculation */}
          {step === 3 && (
            <Card className="border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                <CardTitle className="flex items-center gap-3 text-purple-800">
                  <Activity className="w-6 h-6 text-purple-600" />
                  {t('calculators.obgyn.ovarian_cancer_risk.step3.title')}
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-auto">
                    {t('calculators.obgyn.ovarian_cancer_risk.step3.step_indicator')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Summary of inputs */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {t('calculators.obgyn.ovarian_cancer_risk.step3.summary.title')}
                  </h4>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>{t('calculators.obgyn.ovarian_cancer_risk.step3.summary.labels.age')}:</strong> {formData.age} {t('calculators.obgyn.ovarian_cancer_risk.step3.summary.values.years')}</p>
                      <p><strong>{t('calculators.obgyn.ovarian_cancer_risk.step3.summary.labels.parity')}:</strong> {formData.parity} {t('calculators.obgyn.ovarian_cancer_risk.step3.summary.values.births')}</p>
                      <p><strong>{t('calculators.obgyn.ovarian_cancer_risk.step3.summary.labels.oc_use')}:</strong> {formData.oralContraceptiveUse} {t('calculators.obgyn.ovarian_cancer_risk.step3.summary.values.years')}</p>
                      <p><strong>{t('calculators.obgyn.ovarian_cancer_risk.step3.summary.labels.hrt')}:</strong> {formData.hormonetherapy ? t('calculators.obgyn.ovarian_cancer_risk.step3.summary.values.yes') : t('calculators.obgyn.ovarian_cancer_risk.step3.summary.values.no')}</p>
                  </div>
                    <div>
                      <p><strong>{t('calculators.obgyn.ovarian_cancer_risk.step3.summary.labels.family_history')}:</strong> {formData.familyHistory === 'none' ? t('calculators.obgyn.ovarian_cancer_risk.step3.summary.values.none') : formData.familyHistory}</p>
                      <p><strong>{t('calculators.obgyn.ovarian_cancer_risk.step3.summary.labels.brca1')}:</strong> {formData.brca1 ? t('calculators.obgyn.ovarian_cancer_risk.step3.summary.values.positive') : t('calculators.obgyn.ovarian_cancer_risk.step3.summary.values.negative')}</p>
                      <p><strong>{t('calculators.obgyn.ovarian_cancer_risk.step3.summary.labels.brca2')}:</strong> {formData.brca2 ? t('calculators.obgyn.ovarian_cancer_risk.step3.summary.values.positive') : t('calculators.obgyn.ovarian_cancer_risk.step3.summary.values.negative')}</p>
                      <p><strong>{t('calculators.obgyn.ovarian_cancer_risk.step3.summary.labels.lynch_syndrome')}:</strong> {formData.lynchSyndrome ? t('calculators.obgyn.ovarian_cancer_risk.step3.summary.values.positive') : t('calculators.obgyn.ovarian_cancer_risk.step3.summary.values.negative')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CalculatorButton
                    onClick={handlePrevious}
                    variant="outline"
                    className="px-8"
                  >
                    {t('calculators.obgyn.ovarian_cancer_risk.step3.buttons.previous')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={handleCalculate}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 flex-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('calculators.obgyn.ovarian_cancer_risk.step3.buttons.calculating')}
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        {t('calculators.obgyn.ovarian_cancer_risk.step3.buttons.calculate')}
                      </>
                    )}
                  </CalculatorButton>
              </div>

                <CalculatorButton
                  onClick={handleReset}
                  variant="outline"
                  className="w-full mt-4"
                >
                  {t('calculators.obgyn.ovarian_cancer_risk.step3.buttons.reset')}
                </CalculatorButton>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {showResult && result && (
            <div id="ovarian-results">
              <ResultsDisplay
                title={t('calculators.obgyn.ovarian_cancer_risk.results.title')}
                value={result.category.charAt(0).toUpperCase() + result.category.slice(1) + ' ' + t('calculators.obgyn.ovarian_cancer_risk.results.risk_levels.low')}
                category={result.category === 'low' ? 'low' : result.category === 'moderate' ? 'intermediate' : 'high'}
                interpretation={result.interpretation}
                icon={Shield}
              >
                {/* Risk Assessment Card */}
                <div className={`p-6 rounded-xl border-2 ${getRiskColor(result.category)} mb-6`}>
                  <div className="flex items-center gap-4 mb-4">
                    {getRiskIcon(result.category)}
                    <div>
                      <h3 className="text-xl font-bold">
                        {result.category.charAt(0).toUpperCase() + result.category.slice(1)} {t('calculators.obgyn.ovarian_cancer_risk.results.risk_levels.low')}
                      </h3>
                      <p className="text-sm font-medium">{t('calculators.obgyn.ovarian_cancer_risk.results.lifetime_risk_label')} {result.lifetimeRisk}%</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{result.interpretation}</p>
                </div>

                {/* Management Strategy Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">{t('calculators.obgyn.ovarian_cancer_risk.results.management.title')}</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      {t('calculators.obgyn.ovarian_cancer_risk.results.management.description')}
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">{t('calculators.obgyn.ovarian_cancer_risk.results.screening.title')}</h4>
                    </div>
                    <p className="text-sm text-purple-700">
                      {result.screeningRecommendation}
                    </p>
                  </div>
              </div>

                {/* Genetic Counseling */}
                {result.prophylacticSurgeryDiscussion && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                      <FlaskConical className="w-5 h-5" />
                      {t('calculators.obgyn.ovarian_cancer_risk.results.prophylactic_surgery.title')}
                    </h4>
                    <div className="text-sm text-orange-700 flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{t('calculators.obgyn.ovarian_cancer_risk.results.prophylactic_surgery.description')}</span>
                    </div>
                  </div>
                )}

                {/* Clinical Recommendations */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {t('calculators.obgyn.ovarian_cancer_risk.results.clinical_recommendations.title')}
                  </h4>
                  <div className="space-y-2">
                    {result.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="text-sm text-green-700 flex items-start gap-3">
                        <Star className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Share Results */}
                <CalculatorResultShare
                  calculatorName={t('calculators.obgyn.ovarian_cancer_risk.results.share.calculator_name')}
                  calculatorId="ovarian-cancer-risk"
                  results={{
                    riskLevel: result.category,
                    lifetimeRisk: `${result.lifetimeRisk}%`,
                    riskMultiplier: `${result.riskMultiplier}x`,
                    screeningRecommendation: result.screeningRecommendation,
                    prophylacticSurgeryDiscussion: result.prophylacticSurgeryDiscussion ? t('calculators.obgyn.ovarian_cancer_risk.results.share.values.yes') : t('calculators.obgyn.ovarian_cancer_risk.results.share.values.no')
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
          <Card className="border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
              <CardTitle className="text-purple-800">{t('calculators.obgyn.ovarian_cancer_risk.about.title')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Clinical Purpose */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  {t('calculators.obgyn.ovarian_cancer_risk.about.clinical_purpose.title')}
                </h3>
                <div className="space-y-3 text-sm text-blue-700">
                  <p>{t('calculators.obgyn.ovarian_cancer_risk.about.clinical_purpose.description_1')}</p>
                  <p>{t('calculators.obgyn.ovarian_cancer_risk.about.clinical_purpose.description_2')}</p>
                </div>
              </div>

              <div className="grid xl:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {t('calculators.obgyn.ovarian_cancer_risk.about.risk_factors.high_risk.title')}
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {(() => {
                      const items = t('calculators.obgyn.ovarian_cancer_risk.about.risk_factors.high_risk.items', { returnObjects: true });
                      return Array.isArray(items) ? items.map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      )) : null;
                    })()}
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {t('calculators.obgyn.ovarian_cancer_risk.about.risk_factors.protective.title')}
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    {(() => {
                      const items = t('calculators.obgyn.ovarian_cancer_risk.about.risk_factors.protective.items', { returnObjects: true });
                      return Array.isArray(items) ? items.map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      )) : null;
                    })()}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t('calculators.obgyn.ovarian_cancer_risk.about.management_strategies.title')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">{t('calculators.obgyn.ovarian_cancer_risk.about.management_strategies.very_high_risk.title')}</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {(() => {
                        const strategies = t('calculators.obgyn.ovarian_cancer_risk.about.management_strategies.very_high_risk.strategies', { returnObjects: true });
                        return Array.isArray(strategies) ? strategies.map((strategy: string, index: number) => (
                          <li key={index}>• {strategy}</li>
                        )) : null;
                      })()}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">{t('calculators.obgyn.ovarian_cancer_risk.about.management_strategies.moderate_risk.title')}</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {(() => {
                        const strategies = t('calculators.obgyn.ovarian_cancer_risk.about.management_strategies.moderate_risk.strategies', { returnObjects: true });
                        return Array.isArray(strategies) ? strategies.map((strategy: string, index: number) => (
                          <li key={index}>• {strategy}</li>
                        )) : null;
                      })()}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">{t('calculators.obgyn.ovarian_cancer_risk.about.management_strategies.average_risk.title')}</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {(() => {
                        const strategies = t('calculators.obgyn.ovarian_cancer_risk.about.management_strategies.average_risk.strategies', { returnObjects: true });
                        return Array.isArray(strategies) ? strategies.map((strategy: string, index: number) => (
                          <li key={index}>• {strategy}</li>
                        )) : null;
                      })()}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  {t('calculators.obgyn.ovarian_cancer_risk.about.symptoms.title')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">{t('calculators.obgyn.ovarian_cancer_risk.about.symptoms.early_warning.title')}</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {(() => {
                        const signs = t('calculators.obgyn.ovarian_cancer_risk.about.symptoms.early_warning.signs', { returnObjects: true });
                        return Array.isArray(signs) ? signs.map((sign: string, index: number) => (
                          <li key={index}>• {sign}</li>
                        )) : null;
                      })()}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">{t('calculators.obgyn.ovarian_cancer_risk.about.symptoms.advanced_disease.title')}</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {(() => {
                        const signs = t('calculators.obgyn.ovarian_cancer_risk.about.symptoms.advanced_disease.signs', { returnObjects: true });
                        return Array.isArray(signs) ? signs.map((sign: string, index: number) => (
                          <li key={index}>• {sign}</li>
                        )) : null;
                      })()}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5" />
                  {t('calculators.obgyn.ovarian_cancer_risk.about.genetic_testing.title')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-orange-800 mb-2">{t('calculators.obgyn.ovarian_cancer_risk.about.genetic_testing.brca_testing.title')}</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {(() => {
                        const indications = t('calculators.obgyn.ovarian_cancer_risk.about.genetic_testing.brca_testing.indications', { returnObjects: true });
                        return Array.isArray(indications) ? indications.map((indication: string, index: number) => (
                          <li key={index}>• {indication}</li>
                        )) : null;
                      })()}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-orange-800 mb-2">{t('calculators.obgyn.ovarian_cancer_risk.about.genetic_testing.lynch_testing.title')}</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {(() => {
                        const indications = t('calculators.obgyn.ovarian_cancer_risk.about.genetic_testing.lynch_testing.indications', { returnObjects: true });
                        return Array.isArray(indications) ? indications.map((indication: string, index: number) => (
                          <li key={index}>• {indication}</li>
                        )) : null;
                      })()}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t('calculators.obgyn.ovarian_cancer_risk.about.guidelines.title')}
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  {(() => {
                    const references = t('calculators.obgyn.ovarian_cancer_risk.about.guidelines.references', { returnObjects: true });
                    return Array.isArray(references) ? references.map((reference: string, index: number) => (
                      <li key={index}>{reference}</li>
                    )) : null;
                  })()}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </CalculatorContainer>
  );
};

export default OvarianCancerRiskCalculator; 