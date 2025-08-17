import React, { useState } from 'react';
import { Calculator, Info, AlertTriangle, CheckCircle, TrendingUp, Heart, User, Activity, Baby, Target, Stethoscope, Award, Shield, Clock, Zap, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
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
import { useTranslation } from '../../hooks/useTranslation';
import { calculateVBACSuccess } from '../../services/obgynCalculatorService';
import { VBACSuccessInput, VBACSuccessResult } from '../../types/obgyn-calculators';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface FormData {
  maternalAge: string;
  bmi: string;
  gestationalAge: string;
  previousVaginalDelivery: boolean;
  indicationForPreviousCD: 'non-recurring' | 'recurring' | 'unknown';
  cervicalDilation: string;
  estimatedFetalWeight: string;
}

const VBACSuccessCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'calculator' | 'about'>('calculator');
  const [formData, setFormData] = useState<FormData>({
    maternalAge: '',
    bmi: '',
    gestationalAge: '',
    previousVaginalDelivery: false,
    indicationForPreviousCD: 'unknown',
    cervicalDilation: '',
    estimatedFetalWeight: ''
  });
  
  const [result, setResult] = useState<VBACSuccessResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.maternalAge) {
      newErrors.maternalAge = t('calculators.vbac_success.maternal_age_error');
    } else {
      const age = parseInt(formData.maternalAge);
      if (isNaN(age) || age < 15 || age > 55) {
        newErrors.maternalAge = t('calculators.vbac_success.maternal_age_error');
      }
    }

    if (!formData.bmi) {
      newErrors.bmi = t('calculators.vbac_success.bmi_error');
    } else {
      const bmi = parseFloat(formData.bmi);
      if (isNaN(bmi) || bmi < 15 || bmi > 60) {
        newErrors.bmi = t('calculators.vbac_success.bmi_error');
      }
    }

    if (!formData.gestationalAge) {
      newErrors.gestationalAge = t('calculators.vbac_success.gestational_age_error');
    } else {
      const ga = parseFloat(formData.gestationalAge);
      if (isNaN(ga) || ga < 34 || ga > 42) {
        newErrors.gestationalAge = t('calculators.vbac_success.gestational_age_error');
      }
    }

    if (formData.cervicalDilation) {
      const dilation = parseFloat(formData.cervicalDilation);
      if (isNaN(dilation) || dilation < 0 || dilation > 10) {
        newErrors.cervicalDilation = t('calculators.vbac_success.cervical_dilation_error');
      }
    }

    if (formData.estimatedFetalWeight) {
      const weight = parseFloat(formData.estimatedFetalWeight);
      if (isNaN(weight) || weight < 1000 || weight > 6000) {
        newErrors.estimatedFetalWeight = t('calculators.vbac_success.estimated_fetal_weight_error');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = async () => {
    if (!validateForm()) return;
    
    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const [result, error] = await safeAsync(async () => {
      const input: VBACSuccessInput = {
        maternalAge: formData.maternalAge,
        bmi: formData.bmi,
        gestationalAge: formData.gestationalAge,
        previousVaginalDelivery: formData.previousVaginalDelivery,
        indicationForPreviousCD: formData.indicationForPreviousCD,
        cervicalDilation: formData.cervicalDilation,
        estimatedFetalWeight: formData.estimatedFetalWeight
      };
      
      const calculationResult = calculateVBACSuccess(input, t);
      setResult(calculationResult);
      setShowResults(true);
      return calculationResult;
    }, {
      context: 'VBAC success prediction calculation',
      severity: ErrorSeverity.HIGH,
      showToast: true
    });

    if (error) {
      setErrors({ general: t('common.calculation_failed') });
    }

    setIsCalculating(false);
  };

  const handleReset = () => {
    setFormData({
      maternalAge: '',
      bmi: '',
      gestationalAge: '',
      previousVaginalDelivery: false,
      indicationForPreviousCD: 'unknown',
      cervicalDilation: '',
      estimatedFetalWeight: ''
    });
    setErrors({});
    setResult(null);
    setShowResults(false);
    setCurrentStep(1);
  };

  const getSuccessColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessIcon = (percentage: number) => {
    if (percentage >= 70) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (percentage >= 50) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getTranslatedCategory = (category: 'low' | 'moderate' | 'high' | 'very-high') => {
    const categoryMap = {
      'low': t('calculators.vbac_success.low'),
      'moderate': t('calculators.vbac_success.moderate'), 
      'high': t('calculators.vbac_success.high'),
      'very-high': t('calculators.vbac_success.high') // Map very-high to high for translation
    };
    return categoryMap[category] || category;
  };

  return (
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'calculator' | 'about')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">{t('common.calculator')}</TabsTrigger>
          <TabsTrigger value="about">{t('common.about')}</TabsTrigger>
        </TabsList>

      <TabsContent value="calculator">
        <CalculatorContainer
          title={t('calculators.vbac_success.title')}
          subtitle={t('calculators.vbac_success.subtitle')}
          icon={Heart}
          gradient="obgyn"
          className="max-w-5xl mx-auto"
        >
          <div className="space-y-8">
            {/* OB/GYN VBAC Alert */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                  <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-pink-800 dark:text-pink-200 mb-2">{t('calculators.vbac_success.title')}</h4>
                  <p className="text-pink-700 dark:text-pink-300 leading-relaxed">
                    {t('calculators.vbac_success.tool_description')}
                  </p>
                  <div className="mt-3 inline-flex items-center space-x-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg px-3 py-1">
                    <Award className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    <span className="text-xs font-semibold text-pink-700 dark:text-pink-300">{t('calculators.vbac_success.based_on_acog')}</span>
                </div>
                </div>
                </div>
              </div>

            {!showResults ? (
              <>
                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      currentStep >= 1 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      1
                    </div>
                    <span className={`text-sm font-medium transition-all duration-300 ${
                      currentStep >= 1 ? 'text-pink-600' : 'text-gray-500'
                    }`}>
                      {t('calculators.vbac_success.maternal_demographics')}
                    </span>
                  </div>
                  <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
                    currentStep >= 2 ? 'bg-pink-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      currentStep >= 2 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      2
                    </div>
                    <span className={`text-sm font-medium transition-all duration-300 ${
                      currentStep >= 2 ? 'text-pink-600' : 'text-gray-500'
                    }`}>
                      {t('calculators.vbac_success.obstetric_history')}
                    </span>
                  </div>
                  <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
                    currentStep >= 3 ? 'bg-pink-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      currentStep >= 3 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      3
                    </div>
                    <span className={`text-sm font-medium transition-all duration-300 ${
                      currentStep >= 3 ? 'text-pink-600' : 'text-gray-500'
                    }`}>
                      {t('calculators.vbac_success.current_pregnancy')}
                    </span>
                  </div>
                </div>

                {/* Step 1: Maternal Demographics */}
                {currentStep === 1 && (
                  <Card className="border-pink-200 dark:border-pink-800">
                    <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-b border-pink-200 dark:border-pink-800">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                          <User className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                          <CardTitle className="text-pink-800 dark:text-pink-200">{t('calculators.vbac_success.maternal_demographics')}</CardTitle>
                          <CardDescription className="text-pink-600 dark:text-pink-400">
                            {t('calculators.vbac_success.maternal_age_help')}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <CalculatorInput
                          label={t('calculators.vbac_success.maternal_age_label')}
                          type="number"
                          placeholder={t('calculators.vbac_success.maternal_age_placeholder')}
                          value={formData.maternalAge}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, maternalAge: e.target.value }))}
                          error={errors.maternalAge}
                          min={15}
                          max={55}
                          unit={t('calculators.vbac_success.maternal_age_unit')}
                          helpText={t('calculators.vbac_success.maternal_age_help')}
                          icon={User}
                        />
                        
                        <CalculatorInput
                          label={t('calculators.vbac_success.bmi_label')}
                          type="number"
                          placeholder={t('calculators.vbac_success.bmi_placeholder')}
                          value={formData.bmi}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, bmi: e.target.value }))}
                          error={errors.bmi}
                          min={15}
                          max={60}
                          step={0.1}
                          unit={t('calculators.vbac_success.bmi_unit')}
                          helpText={t('calculators.vbac_success.bmi_help')}
                          icon={Activity}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-4">
                        <CalculatorButton 
                          onClick={() => setCurrentStep(2)}
                          disabled={!formData.maternalAge || !formData.bmi}
                          icon={TrendingUp}
                        >
                          {t('common.next')}
                        </CalculatorButton>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Obstetric History */}
                {currentStep === 2 && (
                  <Card className="border-pink-200 dark:border-pink-800">
                    <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-b border-pink-200 dark:border-pink-800">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                          <Stethoscope className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                          <CardTitle className="text-pink-800 dark:text-pink-200">{t('calculators.vbac_success.obstetric_history')}</CardTitle>
                          <CardDescription className="text-pink-600 dark:text-pink-400">
                            {t('calculators.vbac_success.previous_vaginal_delivery_help')}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-6">
                        <CalculatorCheckbox
                          label={t('calculators.vbac_success.previous_vaginal_delivery_label')}
                          checked={formData.previousVaginalDelivery}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, previousVaginalDelivery: e.target.checked }))}
                          description={t('calculators.vbac_success.previous_vaginal_delivery_help')}
                          icon={Baby}
                        />
                        
                        <CalculatorSelect
                          label={t('calculators.vbac_success.indication_previous_cd_label')}
                          value={formData.indicationForPreviousCD}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, indicationForPreviousCD: e.target.value as 'non-recurring' | 'recurring' | 'unknown' }))}
                          options={[
                            { value: 'non-recurring', label: t('calculators.vbac_success.indication_non_recurring') },
                            { value: 'recurring', label: t('calculators.vbac_success.indication_recurring') },
                            { value: 'unknown', label: t('calculators.vbac_success.indication_unknown') }
                          ]}
                          helpText={t('calculators.vbac_success.indication_previous_cd_help')}
                          icon={Shield}
                        />
                      </div>
                      
                      <div className="flex justify-between space-x-4">
                        <CalculatorButton 
                          onClick={() => setCurrentStep(1)}
                          variant="outline"
                          icon={TrendingUp}
                        >
                          {t('common.previous')}
                        </CalculatorButton>
                        <CalculatorButton 
                          onClick={() => setCurrentStep(3)}
                          icon={TrendingUp}
                        >
                          {t('common.next')}
                        </CalculatorButton>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Current Pregnancy */}
                {currentStep === 3 && (
                  <Card className="border-pink-200 dark:border-pink-800">
                    <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-b border-pink-200 dark:border-pink-800">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                          <Baby className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                          <CardTitle className="text-pink-800 dark:text-pink-200">{t('calculators.vbac_success.current_pregnancy')}</CardTitle>
                          <CardDescription className="text-pink-600 dark:text-pink-400">
                            {t('calculators.vbac_success.gestational_age_help')}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <CalculatorInput
                          label={t('calculators.vbac_success.gestational_age_label')}
                          type="number"
                          placeholder={t('calculators.vbac_success.gestational_age_placeholder')}
                          value={formData.gestationalAge}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, gestationalAge: e.target.value }))}
                          error={errors.gestationalAge}
                          min={34}
                          max={42}
                          step={0.1}
                          unit={t('calculators.vbac_success.gestational_age_unit')}
                          helpText={t('calculators.vbac_success.gestational_age_help')}
                          icon={Clock}
                        />
                        
                        <CalculatorInput
                          label={t('calculators.vbac_success.cervical_dilation_label') + ' (' + t('common.optional') + ')'}
                          type="number"
                          placeholder={t('calculators.vbac_success.cervical_dilation_placeholder')}
                          value={formData.cervicalDilation}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, cervicalDilation: e.target.value }))}
                          error={errors.cervicalDilation}
                          min={0}
                          max={10}
                          step={0.5}
                          unit={t('calculators.vbac_success.cervical_dilation_unit')}
                          helpText={t('calculators.vbac_success.cervical_dilation_help')}
                          icon={Target}
                        />
                      </div>
                      
                        <CalculatorInput
                          label={t('calculators.vbac_success.estimated_fetal_weight_label') + ' (' + t('common.optional') + ')'}
                          type="number"
                          placeholder={t('calculators.vbac_success.estimated_fetal_weight_placeholder')}
                          value={formData.estimatedFetalWeight}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, estimatedFetalWeight: e.target.value }))}
                          error={errors.estimatedFetalWeight}
                          min={1000}
                          max={6000}
                          unit={t('calculators.vbac_success.estimated_fetal_weight_unit')}
                          helpText={t('calculators.vbac_success.estimated_fetal_weight_help')}
                          icon={Baby}
                        />
                      
                      <div className="flex justify-between space-x-4">
                        <CalculatorButton 
                          onClick={() => setCurrentStep(2)}
                          variant="outline"
                          icon={TrendingUp}
                        >
                          {t('common.previous')}
                        </CalculatorButton>
                        <CalculatorButton 
                          onClick={handleCalculate}
                          disabled={!formData.gestationalAge || isCalculating}
                          icon={isCalculating ? Clock : Calculator}
                          loading={isCalculating}
                        >
                          {isCalculating ? t('common.calculating') : t('calculators.vbac_success.calculate_button')}
                        </CalculatorButton>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <>
                {/* Results */}
                {result && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Success Probability */}
                      <Card className="p-6">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t('calculators.vbac_success.success_probability')}
                          </span>
                          <span className={`font-medium ${getSuccessColor(result.successProbability)}`}>
                            {getTranslatedCategory(result.category)}
                          </span>
                        </div>
                        <div className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                          {result.successProbability}%
                        </div>
                      </Card>
                      
                      {/* Uterine Rupture Risk */}
                      <Card className="p-6">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {t('calculators.vbac_success.uterine_rupture_risk')}
                        </div>
                        <div className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                          {result.uterineRuptureRisk}%
                        </div>
                      </Card>
                    </div>

                    {/* Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                          {t('calculators.vbac_success.recommendations')}
                        </h3>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {/* Calculator Result Share */}
                    <CalculatorResultShare 
                      calculatorName="VBAC Success Calculator"
                      calculatorId="vbac-success"
                      results={{
                        successProbability: result.successProbability,
                        uterineRuptureRisk: result.uterineRuptureRisk,
                        category: getTranslatedCategory(result.category),
                        recommendation: result.recommendation
                      }}
                      interpretation={result.interpretation}
                      recommendations={result.recommendations}
                      riskLevel={result.category === 'low' ? 'low' : result.category === 'high' || result.category === 'very-high' ? 'high' : 'intermediate'}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </CalculatorContainer>
      </TabsContent>

      <TabsContent value="about">
        <CalculatorContainer
          title={t('calculators.vbac_success.title')}
          subtitle={t('common.about_calculator')}
          icon={Info}
          gradient="obgyn"
          className="max-w-4xl mx-auto"
        >
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed mb-6">
              {t('calculators.vbac_success.tool_description')}
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-pink-800 dark:text-pink-200">
              {t('calculators.vbac_success.clinical_applications')}
            </h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>{t('calculators.vbac_success.application_1')}</li>
              <li>{t('calculators.vbac_success.application_2')}</li>
              <li>{t('calculators.vbac_success.application_3')}</li>
              <li>{t('calculators.vbac_success.application_4')}</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-4 text-pink-800 dark:text-pink-200">
              {t('calculators.vbac_success.evidence_base')}
            </h3>
            <p className="mb-4">
              {t('calculators.vbac_success.evidence_description')}
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-pink-800 dark:text-pink-200">
              {t('calculators.vbac_success.clinical_considerations')}
            </h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>{t('calculators.vbac_success.consideration_1')}</li>
              <li>{t('calculators.vbac_success.consideration_2')}</li>
              <li>{t('calculators.vbac_success.consideration_3')}</li>
              <li>{t('calculators.vbac_success.consideration_4')}</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-4 text-pink-800 dark:text-pink-200">
              {t('calculators.vbac_success.professional_guidelines')}
            </h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>{t('calculators.vbac_success.acog_practice_bulletin')}</li>
              <li>{t('calculators.vbac_success.maternal_fetal_medicine')}</li>
              <li>{t('calculators.vbac_success.validation_studies')}</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-4 text-pink-800 dark:text-pink-200">
              {t('calculators.vbac_success.clinical_validation')}
            </h3>
            <p className="mb-4">
              {t('calculators.vbac_success.clinical_validation_description')}
            </p>
          </div>
        </CalculatorContainer>
      </TabsContent>
    </Tabs>
  );
};

export default VBACSuccessCalculator; 