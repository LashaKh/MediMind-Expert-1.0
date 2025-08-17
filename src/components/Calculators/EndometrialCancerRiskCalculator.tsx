import React, { useState } from 'react';
import { Shield, AlertTriangle, Info, CheckCircle, Star, User, FileText, Activity, Clock, Target, Calculator, TrendingUp, Stethoscope, Award, ArrowRight, Users, Calendar, AlertCircle, Scale, Pill, Heart, FlaskConical, Baby, Zap, Microscope } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip } from '../ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
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
import { calculateOBGYN, validateOBGYNInput } from '../../services/obgynCalculatorService';
import { EndometrialCancerRiskInput, EndometrialCancerRiskResult } from '../../types/obgyn-calculators';
import { useTranslation } from '../../hooks/useTranslation';

interface FormData {
  age: string;
  bmi: string;
  diabetes: boolean;
  nulliparity: boolean;
  lateMenupause: boolean;
  unopposedEstrogen: boolean;
  tamoxifenUse: boolean;
  lynchSyndrome: boolean;
  familyHistory: boolean;
}

interface Errors {
  age?: string;
  bmi?: string;
}

const EndometrialCancerRiskCalculator: React.FC = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<FormData>({
    age: '',
    bmi: '',
    diabetes: false,
    nulliparity: false,
    lateMenupause: false,
    unopposedEstrogen: false,
    tamoxifenUse: false,
    lynchSyndrome: false,
    familyHistory: false
  });
  
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<EndometrialCancerRiskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'about'>('calculator');

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
        newErrors.age = t('calculators.obgyn.endometrial_cancer_risk.age_error');
      } else if (Number(formData.age) < 18 || Number(formData.age) > 100) {
        newErrors.age = t('calculators.obgyn.endometrial_cancer_risk.age_error');
    }

    if (!formData.bmi) {
        newErrors.bmi = t('calculators.obgyn.endometrial_cancer_risk.bmi_error');
      } else if (Number(formData.bmi) < 15 || Number(formData.bmi) > 60) {
        newErrors.bmi = t('calculators.obgyn.endometrial_cancer_risk.bmi_error');
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

    const [calculationResult, error] = await safeAsync(
      async () => {
        const input: EndometrialCancerRiskInput = {
          age: formData.age,
          bmi: formData.bmi,
          diabetes: formData.diabetes,
          nulliparity: formData.nulliparity,
          lateMenupause: formData.lateMenupause,
          unopposedEstrogen: formData.unopposedEstrogen,
          tamoxifenUse: formData.tamoxifenUse,
          lynchSyndrome: formData.lynchSyndrome,
          familyHistory: formData.familyHistory,
          calculationDate: new Date().toISOString()
        };

        // Validate input
        const validation = validateOBGYNInput('endometrial-cancer-risk', input);
        if (!validation.isValid) {
          const fieldErrors: Errors = {};
          validation.errors.forEach(error => {
            if (error.includes('age')) fieldErrors.age = error;
            if (error.includes('BMI') || error.includes('bmi')) fieldErrors.bmi = error;
          });
          setErrors(fieldErrors);
          throw new Error('Validation failed');
        }

        return calculateOBGYN('endometrial-cancer-risk', input, t) as EndometrialCancerRiskResult;
      },
      {
        context: 'calculate endometrial cancer risk',
        showToast: true,
        severity: ErrorSeverity.HIGH
      }
    );

    if (error) {
      setErrors({ age: 'An error occurred during calculation. Please try again.' });
    } else {
      setResult(calculationResult);
      setShowResult(true);
      
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('endometrial-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    
    setIsLoading(false);
  };

  const handleReset = () => {
    setFormData({
      age: '',
      bmi: '',
      diabetes: false,
      nulliparity: false,
      lateMenupause: false,
      unopposedEstrogen: false,
      tamoxifenUse: false,
      lynchSyndrome: false,
      familyHistory: false
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
        return <Heart className="w-5 h-5" />;
      case 3:
        return <Activity className="w-5 h-5" />;
      default:
        return <Calculator className="w-5 h-5" />;
    }
  };

  return (
    <CalculatorContainer
      title={t('calculators.obgyn.endometrial_cancer_risk.title')}
      subtitle={t('calculators.obgyn.endometrial_cancer_risk.subtitle')}
      icon={Shield}
      gradient="obgyn"
    >
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'calculator' | 'about')} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-purple-50 border border-purple-200">
          <TabsTrigger value="calculator" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Calculator className="w-4 h-4 mr-2" />
            {t('calculators.obgyn.endometrial_cancer_risk.calculate_button')}
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Info className="w-4 h-4 mr-2" />
            {t('calculators.obgyn.endometrial_cancer_risk.about_title')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-8">
          {/* Progress Indicator */}
          <div className="w-full bg-purple-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-800">{t('calculators.obgyn.endometrial_cancer_risk.risk_assessment')}</h3>
              <span className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                {t('calculators.obgyn.endometrial_cancer_risk.step_indicator', { step })}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((I) => (
                <div key={i} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${step >= i 
                      ? 'bg-purple-600 border-purple-600 text-white' 
                      : 'bg-white border-purple-300 text-purple-400'
                    }
                  `}>
                    {getStepIcon(I)}
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
                <p className="text-sm font-medium text-purple-800">{t('calculators.obgyn.endometrial_cancer_risk.demographics')}</p>
                <p className="text-xs text-purple-600">{t('calculators.obgyn.endometrial_cancer_risk.age_label')} & BMI</p>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">{t('calculators.obgyn.endometrial_cancer_risk.medical_history')}</p>
                <p className="text-xs text-purple-600">{t('calculators.obgyn.endometrial_cancer_risk.risk_factors_analysis')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">{t('calculators.obgyn.endometrial_cancer_risk.risk_assessment')}</p>
                <p className="text-xs text-purple-600">{t('calculators.obgyn.endometrial_cancer_risk.calculate_risk')}</p>
              </div>
            </div>
          </div>

          {/* Step 1: Demographics & BMI */}
          {step === 1 && (
            <Card className="border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                <CardTitle className="flex items-center gap-3 text-purple-800">
                  <User className="w-6 h-6 text-purple-600" />
                  {t('calculators.obgyn.endometrial_cancer_risk.demographics')} & {t('calculators.obgyn.endometrial_cancer_risk.physical_characteristics')}
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-auto">
                    {t('calculators.obgyn.endometrial_cancer_risk.step_indicator', { step: 1 })}
                  </span>
              </CardTitle>
            </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <CalculatorInput
                    label={t('calculators.obgyn.endometrial_cancer_risk.age_label')}
                    value={formData.age}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('age', e.target.value)}
                    type="number"
                    placeholder={t('calculators.obgyn.endometrial_cancer_risk.age_placeholder')}
                    min={18}
                    max={100}
                    unit={t('calculators.obgyn.endometrial_cancer_risk.years')}
                    error={errors.age}
                    helpText={t('calculators.obgyn.endometrial_cancer_risk.age_help')}
                    icon={User}
                    required
                  />

                  <CalculatorInput
                    label={t('calculators.obgyn.endometrial_cancer_risk.bmi_label')}
                    value={formData.bmi}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('bmi', e.target.value)}
                    type="number"
                    placeholder={t('calculators.obgyn.endometrial_cancer_risk.bmi_placeholder')}
                    min={15}
                    max={60}
                    step={0.1}
                    unit={t('calculators.obgyn.endometrial_cancer_risk.kg_m2')}
                    error={errors.bmi}
                    helpText={t('calculators.obgyn.endometrial_cancer_risk.bmi_help')}
                    icon={Scale}
                    required
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    {t('calculators.obgyn.endometrial_cancer_risk.bmi_categories')}
                  </h4>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700"><strong>{t('calculators.obgyn.endometrial_cancer_risk.bmi_normal')}:</strong> {t('calculators.obgyn.endometrial_cancer_risk.baseline_risk')}</p>
                      <p className="text-blue-700"><strong>{t('calculators.obgyn.endometrial_cancer_risk.bmi_overweight')}:</strong> {t('calculators.obgyn.endometrial_cancer_risk.moderate_risk')}</p>
                    </div>
                    <div>
                      <p className="text-blue-700"><strong>{t('calculators.obgyn.endometrial_cancer_risk.bmi_obese_i')}:</strong> {t('calculators.obgyn.endometrial_cancer_risk.high_risk_2_3x')}</p>
                      <p className="text-blue-700"><strong>{t('calculators.obgyn.endometrial_cancer_risk.bmi_obese_ii')}:</strong> {t('calculators.obgyn.endometrial_cancer_risk.very_high_risk_3_6x')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <CalculatorButton
                    onClick={handleNext}
                    disabled={!formData.age || !formData.bmi}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                  >
                    {t('calculators.obgyn.endometrial_cancer_risk.next_medical_history')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </CalculatorButton>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Medical History & Risk Factors */}
          {step === 2 && (
            <Card className="border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                <CardTitle className="flex items-center gap-3 text-purple-800">
                  <Heart className="w-6 h-6 text-purple-600" />
                  {t('calculators.obgyn.endometrial_cancer_risk.medical_history')} & {t('calculators.obgyn.endometrial_cancer_risk.risk_factors')}
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-auto">
                    {t('calculators.obgyn.endometrial_cancer_risk.step_indicator', { step: 2 })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Medical Conditions */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    {t('calculators.obgyn.endometrial_cancer_risk.medical_conditions')}
                  </h4>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.endometrial_cancer_risk.diabetes_label')}
                      checked={formData.diabetes}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('diabetes', e.target.checked)}
                      description={t('calculators.obgyn.endometrial_cancer_risk.diabetes_description')}
                    />
                    
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.endometrial_cancer_risk.lynch_syndrome_label')}
                      checked={formData.lynchSyndrome}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lynchSyndrome', e.target.checked)}
                      description={t('calculators.obgyn.endometrial_cancer_risk.lynch_syndrome_description')}
                    />

                    <CalculatorCheckbox
                      label={t('calculators.obgyn.endometrial_cancer_risk.family_history_label')}
                      checked={formData.familyHistory}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('familyHistory', e.target.checked)}
                      description={t('calculators.obgyn.endometrial_cancer_risk.family_history_description')}
                    />
                </div>
              </div>

              {/* Reproductive History */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <Baby className="w-5 h-5" />
                    {t('calculators.obgyn.endometrial_cancer_risk.reproductive_history')}
                  </h4>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.endometrial_cancer_risk.nulliparity_label')}
                      checked={formData.nulliparity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('nulliparity', e.target.checked)}
                      description={t('calculators.obgyn.endometrial_cancer_risk.nulliparity_description')}
                    />

                    <CalculatorCheckbox
                      label={t('calculators.obgyn.endometrial_cancer_risk.late_menopause_label')}
                      checked={formData.lateMenupause}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lateMenupause', e.target.checked)}
                      description={t('calculators.obgyn.endometrial_cancer_risk.late_menopause_description')}
                    />
                </div>
              </div>

              {/* Medication History */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    {t('calculators.obgyn.endometrial_cancer_risk.medication_history')}
                  </h4>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <CalculatorCheckbox
                      label={t('calculators.obgyn.endometrial_cancer_risk.tamoxifen_label')}
                      checked={formData.tamoxifenUse}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tamoxifenUse', e.target.checked)}
                      description={t('calculators.obgyn.endometrial_cancer_risk.tamoxifen_description')}
                    />

                    <CalculatorCheckbox
                      label={t('calculators.obgyn.endometrial_cancer_risk.unopposed_estrogen_label')}
                      checked={formData.unopposedEstrogen}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('unopposedEstrogen', e.target.checked)}
                      description={t('calculators.obgyn.endometrial_cancer_risk.unopposed_estrogen_description')}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <CalculatorButton
                    onClick={handlePrevious}
                    variant="outline"
                    className="px-8"
                  >
                    {t('calculators.obgyn.endometrial_cancer_risk.previous')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={handleNext}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 flex-1"
                  >
                    {t('calculators.obgyn.endometrial_cancer_risk.next_calculate_risk')}
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
                  {t('calculators.obgyn.endometrial_cancer_risk.risk_assessment_review')}
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-auto">
                    {t('calculators.obgyn.endometrial_cancer_risk.step_indicator', { step })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Summary of inputs */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {t('calculators.obgyn.endometrial_cancer_risk.assessment_summary')}
                  </h4>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>{t('calculators.obgyn.endometrial_cancer_risk.age_label')}:</strong> {formData.age} {t('calculators.obgyn.endometrial_cancer_risk.years')}</p>
                      <p><strong>{t('calculators.obgyn.endometrial_cancer_risk.bmi_label')}:</strong> {formData.bmi} {t('calculators.obgyn.endometrial_cancer_risk.kg_m2')}</p>
                      <p><strong>{t('calculators.obgyn.endometrial_cancer_risk.diabetes_short')}:</strong> {formData.diabetes ? t('calculators.obgyn.endometrial_cancer_risk.yes') : t('calculators.obgyn.endometrial_cancer_risk.no')}</p>
                      <p><strong>{t('calculators.obgyn.endometrial_cancer_risk.nulliparity_short')}:</strong> {formData.nulliparity ? t('calculators.obgyn.endometrial_cancer_risk.yes') : t('calculators.obgyn.endometrial_cancer_risk.no')}</p>
                    </div>
                    <div>
                      <p><strong>{t('calculators.obgyn.endometrial_cancer_risk.late_menopause_short')}:</strong> {formData.lateMenupause ? t('calculators.obgyn.endometrial_cancer_risk.yes') : t('calculators.obgyn.endometrial_cancer_risk.no')}</p>
                      <p><strong>{t('calculators.obgyn.endometrial_cancer_risk.tamoxifen_short')}:</strong> {formData.tamoxifenUse ? t('calculators.obgyn.endometrial_cancer_risk.yes') : t('calculators.obgyn.endometrial_cancer_risk.no')}</p>
                      <p><strong>{t('calculators.obgyn.endometrial_cancer_risk.unopposed_estrogen_short')}:</strong> {formData.unopposedEstrogen ? t('calculators.obgyn.endometrial_cancer_risk.yes') : t('calculators.obgyn.endometrial_cancer_risk.no')}</p>
                      <p><strong>{t('calculators.obgyn.endometrial_cancer_risk.lynch_syndrome_short')}:</strong> {formData.lynchSyndrome ? t('calculators.obgyn.endometrial_cancer_risk.yes') : t('calculators.obgyn.endometrial_cancer_risk.no')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CalculatorButton
                    onClick={handlePrevious}
                    variant="outline"
                    className="px-8"
                  >
                    {t('calculators.obgyn.endometrial_cancer_risk.previous')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={handleCalculate}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 flex-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('calculators.obgyn.endometrial_cancer_risk.calculating')}
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        {t('calculators.obgyn.endometrial_cancer_risk.calculate_risk_assessment')}
                      </>
                    )}
                  </CalculatorButton>
                </div>

                <CalculatorButton
                  onClick={handleReset}
                  variant="outline"
                  className="w-full mt-4"
                >
                  {t('calculators.obgyn.endometrial_cancer_risk.reset_all_fields')}
                </CalculatorButton>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {showResult && result && (
            <div id="endometrial-results">
              <ResultsDisplay
                title={t('calculators.obgyn.endometrial_cancer_risk.title')}
                value={`${t(`calculators.obgyn.endometrial_cancer_risk.service.risk_${result.category.replace('-', '_')}`)} ${t('calculators.obgyn.endometrial_cancer_risk.risk_level')}`}
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
                        {t(`calculators.obgyn.endometrial_cancer_risk.service.risk_${result.category.replace('-', '_')}`)} {t('calculators.obgyn.endometrial_cancer_risk.risk_level')}
                      </h3>
                      <p className="text-sm font-medium">{t('calculators.obgyn.endometrial_cancer_risk.lifetime_risk')}: {result.lifetimeRisk}%</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{result.interpretation}</p>
                </div>

                {/* Management Strategy Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">{t('calculators.obgyn.endometrial_cancer_risk.management_recommendation')}</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      {t('calculators.obgyn.endometrial_cancer_risk.management_description')}
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">{t('calculators.obgyn.endometrial_cancer_risk.screening_recommendation')}</h4>
                    </div>
                    <p className="text-sm text-purple-700">
                      {result.screeningRecommendation}
                    </p>
                  </div>
              </div>

                {/* Protective Factors */}
                {result.protectiveFactors.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {t('calculators.obgyn.endometrial_cancer_risk.protective_factors')}
                    </h4>
                    <div className="space-y-2">
                      {result.protectiveFactors.map((factor: string, index: number) => (
                        <div key={index} className="text-sm text-green-700 flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Recommendations */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {t('calculators.obgyn.endometrial_cancer_risk.clinical_recommendations')}
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
                  calculatorName={t('calculators.obgyn.endometrial_cancer_risk.title')}
                  calculatorId="endometrial-cancer-risk"
                  results={{
                    [t('calculators.common.riskLevel')]: t(`calculators.obgyn.endometrial_cancer_risk.service.risk_${result.category.replace('-', '_')}`),
                    [t('calculators.common.lifetime_risk')]: `${result.lifetimeRisk}%`,
                    [t('calculators.common.annual_risk')]: `${result.annualRisk}%`,
                    [t('calculators.common.screening_recommendation')]: result.screeningRecommendation,
                    [t('calculators.common.protective_factors')]: result.protectiveFactors.join(', ')
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
          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
              <CardTitle className="flex items-center gap-3 text-purple-800">
                <Info className="w-6 h-6 text-purple-600" />
                {t('calculators.obgyn.endometrial_cancer_risk.about_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {t('calculators.obgyn.endometrial_cancer_risk.clinical_purpose')}
                </h3>
                <p className="text-purple-700 mb-3">
                  {t('calculators.obgyn.endometrial_cancer_risk.clinical_purpose_desc')}
                </p>
                <p className="text-purple-700">
                  {t('calculators.obgyn.endometrial_cancer_risk.clinical_purpose_details')}
                </p>
              </div>

              <div className="grid xl:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {t('calculators.obgyn.endometrial_cancer_risk.high_risk_factors')}
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.obesity_risk')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.diabetes_risk')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.nulliparity_risk')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.late_menopause_risk')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.lynch_syndrome_risk')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.unopposed_estrogen_risk')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.tamoxifen_risk')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.pcos_risk')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.irregular_cycles_risk')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.hyperplasia_risk')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.family_history_risk')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.breast_ovarian_history_risk')}</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {t('calculators.obgyn.endometrial_cancer_risk.protective_factors')}
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.multiparity_protective')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.oral_contraceptive_protective')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.physical_activity_protective')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.normal_bmi_protective')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.combined_hrt_protective')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.breastfeeding_protective')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.progestin_iud_protective')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.smoking_cessation_protective')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.mediterranean_diet_protective')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.regular_cycles_protective')}</li>
                    <li>• {t('calculators.obgyn.endometrial_cancer_risk.early_menopause_protective')}</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  {t('calculators.obgyn.endometrial_cancer_risk.risk_based_management')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">{t('calculators.obgyn.endometrial_cancer_risk.very_high_risk_lynch')}</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.annual_biopsy_lynch')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.tv_ultrasound_lynch')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.prophylactic_hysterectomy_lynch')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.genetic_counseling_lynch')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.enhanced_surveillance_lynch')}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">{t('calculators.obgyn.endometrial_cancer_risk.high_risk_multiple')}</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.enhanced_surveillance_high')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.endometrial_sampling_high')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.weight_management_high')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.hormonal_risk_reduction_high')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.patient_education_high')}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">{t('calculators.obgyn.endometrial_cancer_risk.average_risk_general')}</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.no_routine_screening_average')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.prompt_evaluation_average')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.annual_pelvic_exam_average')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.lifestyle_counseling_average')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.symptom_awareness_average')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {t('calculators.obgyn.endometrial_cancer_risk.warning_signs')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">{t('calculators.obgyn.endometrial_cancer_risk.primary_warning_signs')}</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• <strong>{t('calculators.obgyn.endometrial_cancer_risk.postmenopausal_bleeding_warning')}</strong></li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.abnormal_uterine_bleeding_warning')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.intermenstrual_bleeding_warning')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.heavy_prolonged_periods_warning')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.unusual_vaginal_discharge_warning')}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">{t('calculators.obgyn.endometrial_cancer_risk.advanced_disease_symptoms')}</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.pelvic_pain_advanced')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.abdominal_distension_advanced')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.early_satiety_advanced')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.unexplained_weight_loss_advanced')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.urinary_frequency_advanced')}</li>
                      <li>• {t('calculators.obgyn.endometrial_cancer_risk.bowel_symptoms_advanced')}</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-100 p-3 rounded-lg mt-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      <strong>{t('calculators.obgyn.endometrial_cancer_risk.clinical_pearl')}:</strong> {t('calculators.obgyn.endometrial_cancer_risk.clinical_pearl_desc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5" />
                  {t('calculators.obgyn.endometrial_cancer_risk.diagnostic_evaluation')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-orange-800 mb-2">{t('calculators.obgyn.endometrial_cancer_risk.first_line_diagnostic')}</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• <strong>{t('calculators.obgyn.endometrial_cancer_risk.endometrial_biopsy_diagnostic')}</strong></li>
                      <li>• <strong>{t('calculators.obgyn.endometrial_cancer_risk.tv_ultrasound_diagnostic')}</strong></li>
                      <li>• <strong>{t('calculators.obgyn.endometrial_cancer_risk.saline_sonography_diagnostic')}</strong></li>
                      <li>• <strong>{t('calculators.obgyn.endometrial_cancer_risk.hysteroscopy_diagnostic')}</strong></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-orange-800 mb-2">{t('calculators.obgyn.endometrial_cancer_risk.endometrial_thickness_thresholds')}</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• <strong>{t('calculators.obgyn.endometrial_cancer_risk.postmenopausal_threshold')}</strong></li>
                      <li>• <strong>{t('calculators.obgyn.endometrial_cancer_risk.premenopausal_threshold')}</strong></li>
                      <li>• <strong>{t('calculators.obgyn.endometrial_cancer_risk.hrt_threshold')}</strong></li>
                      <li>• <strong>{t('calculators.obgyn.endometrial_cancer_risk.tamoxifen_threshold')}</strong></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-orange-800 mb-2">{t('calculators.obgyn.endometrial_cancer_risk.high_risk_screening_protocols')}</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• <strong>{t('calculators.obgyn.endometrial_cancer_risk.lynch_screening')}</strong></li>
                      <li>• <strong>{t('calculators.obgyn.endometrial_cancer_risk.tamoxifen_screening')}</strong></li>
                      <li>• <strong>{t('calculators.obgyn.endometrial_cancer_risk.unopposed_estrogen_screening')}</strong></li>
                      <li>• <strong>{t('calculators.obgyn.endometrial_cancer_risk.pcos_screening')}</strong></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t('calculators.obgyn.endometrial_cancer_risk.clinical_guidelines_evidence')}
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>{t('calculators.obgyn.endometrial_cancer_risk.nccn_guidelines_v2024')}</strong></li>
                  <li><strong>{t('calculators.obgyn.endometrial_cancer_risk.sgo_clinical_statement')}</strong></li>
                  <li><strong>{t('calculators.obgyn.endometrial_cancer_risk.acog_bulletin_147')}</strong></li>
                  <li><strong>{t('calculators.obgyn.endometrial_cancer_risk.uspstf_2023')}</strong></li>
                  <li><strong>{t('calculators.obgyn.endometrial_cancer_risk.esmo_guidelines')}</strong></li>
                  <li><strong>{t('calculators.obgyn.endometrial_cancer_risk.nice_guidelines_ng12')}</strong></li>
                  <li><strong>{t('calculators.obgyn.endometrial_cancer_risk.rcog_green_top')}</strong></li>
                  <li><strong>{t('calculators.obgyn.endometrial_cancer_risk.asco_sso_guidelines')}</strong></li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </CalculatorContainer>
  );
};

export default EndometrialCancerRiskCalculator; 