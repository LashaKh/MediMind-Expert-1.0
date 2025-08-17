import React, { useState } from 'react';
import { Calculator, Info, AlertTriangle, CheckCircle, TestTube, Calendar, Star, User, Activity, BarChart3, Stethoscope, Award, Shield, Clock, Target, Heart, Zap } from 'lucide-react';
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
import { calculateOBGYN, validateOBGYNInput } from '../../services/obgynCalculatorService';
import { GDMScreeningInput, GDMScreeningResult } from '../../types/obgyn-calculators';
import { useTranslation } from '../../hooks/useTranslation';

interface FormData {
  maternalAge: string;
  bmi: string;
  race: 'white' | 'hispanic' | 'african-american' | 'asian' | 'native-american' | 'other';
  familyHistoryDM: boolean;
  previousGDM: boolean;
  previousMacrosomia: boolean;
  pcos: boolean;
}

const GDMScreeningCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'calculator' | 'about'>('calculator');
  const [formData, setFormData] = useState<FormData>({
    maternalAge: '',
    bmi: '',
    race: 'white',
    familyHistoryDM: false,
    previousGDM: false,
    previousMacrosomia: false,
    pcos: false
  });
  
  const [result, setResult] = useState<GDMScreeningResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.maternalAge) {
      newErrors.maternalAge = t('calculators.gdm_screening.maternal_age_required');
    } else {
      const age = parseInt(formData.maternalAge);
      if (isNaN(age) || age < 15 || age > 55) {
        newErrors.maternalAge = t('calculators.gdm_screening.maternal_age_range_error');
      }
    }

    if (!formData.bmi) {
      newErrors.bmi = t('calculators.gdm_screening.pre_pregnancy_bmi_required');
    } else {
      const bmi = parseFloat(formData.bmi);
      if (isNaN(bmi) || bmi < 15 || bmi > 60) {
        newErrors.bmi = t('calculators.gdm_screening.pre_pregnancy_bmi_range_error');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validateForm()) return;

    setIsCalculating(true);
    
    // Professional GDM screening calculation with loading animation
    setTimeout(() => {
      try {
        const input: GDMScreeningInput = {
          maternalAge: formData.maternalAge,
          bmi: formData.bmi,
          race: formData.race,
          familyHistoryDM: formData.familyHistoryDM,
          previousGDM: formData.previousGDM,
          previousMacrosomia: formData.previousMacrosomia,
          pcos: formData.pcos,
          calculationDate: new Date().toISOString()
        };

        // Use the service validation
        const validation = validateOBGYNInput('gdm-screening', input);
        if (!validation.isValid) {
          setErrors(validation.errors.reduce((acc, error, index) => ({ ...acc, [`error_${index}`]: error }), {}));
          setIsCalculating(false);
          return;
        }

        const calculationResult = calculateOBGYN('gdm-screening', input) as GDMScreeningResult;
        setResult(calculationResult);
        
      } catch (error) {
        setErrors({ calculation: error instanceof Error ? error.message : t('calculators.gdm_screening.calculation_failed') });
      } finally {
        setIsCalculating(false);
      }
    }, 2200); // Professional OB/GYN GDM screening calculation simulation
  };

  const handleReset = () => {
    setFormData({
      maternalAge: '',
      bmi: '',
      race: 'white',
      familyHistoryDM: false,
      previousGDM: false,
      previousMacrosomia: false,
      pcos: false
    });
    setResult(null);
    setErrors({});
    setIsCalculating(false);
    setCurrentStep(1);
    setShowAllRecommendations(false);
  };

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'low': return 'text-green-700 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'very-high': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getRiskBgColor = (category: string) => {
    switch (category) {
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      case 'moderate': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'very-high': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatRiskPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'calculator' | 'about')} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="calculator">{t('calculators.gdm_screening.calculator')}</TabsTrigger>
        <TabsTrigger value="about">{t('calculators.gdm_screening.about')}</TabsTrigger>
      </TabsList>

      <TabsContent value="calculator">
        <CalculatorContainer
          title={t('calculators.gdm_screening.title')}
          subtitle={t('calculators.gdm_screening.subtitle')}
          icon={TestTube}
          gradient="obgyn"
          className="max-w-5xl mx-auto"
        >
          <div className="space-y-8">
            {/* OB/GYN GDM Screening Alert */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                  <TestTube className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-pink-800 dark:text-pink-200 mb-2">{t('calculators.gdm_screening.acog_evidence_based_title')}</h4>
                  <p className="text-pink-700 dark:text-pink-300 leading-relaxed">
                    {t('calculators.gdm_screening.acog_description')}
                  </p>
                  <div className="mt-3 inline-flex items-center space-x-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg px-3 py-1">
                    <Star className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    <span className="text-xs font-semibold text-pink-700 dark:text-pink-300">{t('calculators.gdm_screening.acog_reference')}</span>
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
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('calculators.gdm_screening.risk_assessment')}</span>
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
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('calculators.gdm_screening.demographics_history')}</span>
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
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('calculators.gdm_screening.screening_recommendations')}</span>
                  </div>
                </div>

                {/* Step 1: Patient Demographics */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl border border-pink-200 dark:border-pink-800">
                        <User className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.gdm_screening.patient_demographics')}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.gdm_screening.basic_demographics_description')}</p>
                    </div>

                    <div className="space-y-6">
                      {/* Patient Demographics */}
                      <div className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <User className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.gdm_screening.basic_demographics')}</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <CalculatorInput
                            label={t('calculators.gdm_screening.maternal_age')}
                            value={formData.maternalAge}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maternalAge: e.target.value })}
                            type="number"
                            placeholder={t('calculators.gdm_screening.maternal_age_placeholder')}
                            min={15}
                            max={55}
                            unit={t('calculators.gdm_screening.maternal_age_unit')}
                            error={errors.maternalAge}
                            helpText={t('calculators.gdm_screening.maternal_age_help')}
                            icon={User}
                          />

                          <CalculatorInput
                            label={t('calculators.gdm_screening.pre_pregnancy_bmi')}
                            value={formData.bmi}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, bmi: e.target.value })}
                            type="number"
                            placeholder={t('calculators.gdm_screening.pre_pregnancy_bmi_placeholder')}
                            min={15}
                            max={60}
                            unit={t('calculators.gdm_screening.pre_pregnancy_bmi_unit')}
                            step={0.1}
                            error={errors.bmi}
                            helpText={t('calculators.gdm_screening.pre_pregnancy_bmi_help')}
                            icon={Activity}
                          />
                        </div>
                      </div>

                      {/* Race/Ethnicity Assessment */}
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200">{t('calculators.gdm_screening.race_ethnicity')}</h4>
                        </div>
                        
                        <CalculatorSelect
                          label={t('calculators.gdm_screening.race_ethnicity_label')}
                          value={formData.race}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, race: e.target.value as typeof formData.race })}
                          options={[
                            { value: 'white', label: t('calculators.gdm_screening.white_caucasian') },
                            { value: 'hispanic', label: t('calculators.gdm_screening.hispanic_latino') },
                            { value: 'african-american', label: t('calculators.gdm_screening.african_american') },
                            { value: 'asian', label: t('calculators.gdm_screening.asian') },
                            { value: 'native-american', label: t('calculators.gdm_screening.native_american') },
                            { value: 'other', label: t('calculators.gdm_screening.other_mixed') }
                          ]}
                          helpText={t('calculators.gdm_screening.race_ethnicity_help')}
                          icon={BarChart3}
                        />

                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                          <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">{t('calculators.gdm_screening.high_risk_ethnic_groups')}</h5>
                          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <p>{t('calculators.gdm_screening.hispanic_risk')}</p>
                            <p>{t('calculators.gdm_screening.asian_risk')}</p>
                            <p>{t('calculators.gdm_screening.african_american_risk')}</p>
                            <p>{t('calculators.gdm_screening.native_american_risk')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <CalculatorButton
                        onClick={() => setCurrentStep(2)}
                        className="enhanced-calculator-button"
                      >
                        {t('calculators.gdm_screening.next_clinical_history')}
                      </CalculatorButton>
                    </div>
                  </div>
                )}

                {/* Step 2: Demographics & History */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-900/20 dark:to-purple-900/20 rounded-2xl border border-rose-200 dark:border-rose-800">
                        <Calendar className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.gdm_screening.clinical_history')}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.gdm_screening.clinical_history_description')}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Family History */}
                      <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <Heart className="w-5 h-5 text-yellow-600" />
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">{t('calculators.gdm_screening.family_history')}</h4>
                        </div>
                        
                        <CalculatorCheckbox
                          id="familyHistoryDM"
                          checked={formData.familyHistoryDM}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, familyHistoryDM: e.target.checked })}
                          label={t('calculators.gdm_screening.family_history_diabetes')}
                          description={t('calculators.gdm_screening.family_history_description')}
                        />

                        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                          <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">{t('calculators.gdm_screening.family_history_impact')}</h5>
                          <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            <p>{t('calculators.gdm_screening.family_history_first_degree')}</p>
                            <p>{t('calculators.gdm_screening.family_history_type2_parents')}</p>
                            <p>{t('calculators.gdm_screening.family_history_multiple')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Obstetric History */}
                      <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <Calendar className="w-5 h-5 text-red-600" />
                          <h4 className="font-semibold text-red-800 dark:text-red-200">{t('calculators.gdm_screening.obstetric_history')}</h4>
                        </div>
                        
                        <div className="space-y-4">
                          <CalculatorCheckbox
                            id="previousGDM"
                            checked={formData.previousGDM}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, previousGDM: e.target.checked })}
                            label={t('calculators.gdm_screening.previous_gdm')}
                            description={t('calculators.gdm_screening.previous_gdm_description')}
                          />

                          <CalculatorCheckbox
                            id="previousMacrosomia"
                            checked={formData.previousMacrosomia}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, previousMacrosomia: e.target.checked })}
                            label={t('calculators.gdm_screening.previous_macrosomia')}
                            description={t('calculators.gdm_screening.previous_macrosomia_description')}
                          />
                        </div>

                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                          <h5 className="font-semibold text-red-800 dark:text-red-200 mb-2">{t('calculators.gdm_screening.major_risk_factors')}</h5>
                          <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                            <p>{t('calculators.gdm_screening.previous_gdm_recurrence')}</p>
                            <p>{t('calculators.gdm_screening.macrosomic_association')}</p>
                            <p>{t('calculators.gdm_screening.combined_factors')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Medical History */}
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                      <div className="flex items-center space-x-3 mb-4">
                        <Stethoscope className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-green-800 dark:text-green-200">{t('calculators.gdm_screening.medical_history')}</h4>
                      </div>
                      
                      <CalculatorCheckbox
                        id="pcos"
                        checked={formData.pcos}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pcos: e.target.checked })}
                        label={t('calculators.gdm_screening.pcos_label')}
                        description={t('calculators.gdm_screening.pcos_description')}
                      />

                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                        <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">{t('calculators.gdm_screening.pcos_gdm_risk')}</h5>
                        <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          <p>{t('calculators.gdm_screening.pcos_increased_risk')}</p>
                          <p>{t('calculators.gdm_screening.pcos_insulin_resistance')}</p>
                          <p>{t('calculators.gdm_screening.pcos_early_screening')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <CalculatorButton
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                      >
                        {t('calculators.gdm_screening.back')}
                      </CalculatorButton>
                      <CalculatorButton
                        onClick={handleCalculate}
                        loading={isCalculating}
                        icon={Calculator}
                        size="lg"
                        className="enhanced-calculator-button"
                      >
                        {t('calculators.gdm_screening.generate_screening_plan')}
                      </CalculatorButton>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Results Display */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.gdm_screening.gdm_screening_assessment')}</h3>
                  <div className="flex items-center space-x-4">
                    <div className={`inline-flex items-center space-x-1 rounded-lg px-3 py-1 ${getRiskColor(result.riskLevel)}`}>
                      <span className="text-xs font-semibold">{t('calculators.gdm_screening.risk_level')} {t(`calculators.gdm_screening.result_values.risk_levels.${result.riskLevel}`)}</span>
                    </div>
                    
                    <div className={`inline-flex items-center space-x-1 rounded-lg px-3 py-1 ${getRiskColor(result.riskLevel)}`}>
                      <span className="text-xs font-semibold">{t('calculators.gdm_screening.screening')} {t(`calculators.gdm_screening.result_values.screening_recommendations.${result.screeningRecommendation}`)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Screening Timing Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">{t('calculators.gdm_screening.screening_timing')}</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">{t('calculators.gdm_screening.recommended_timing')}</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{t(`calculators.gdm_screening.result_values.screening_recommendations.${result.screeningRecommendation}`)}</p>
                  </div>

                  {/* Testing Protocol Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-700">
                    <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">{t('calculators.gdm_screening.testing_protocol')}</h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">{t('calculators.gdm_screening.recommended_approach')}</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{t(`calculators.gdm_screening.result_values.testing_protocols.${result.testingProtocol}`)}</p>
                  </div>
                </div>

                {/* Clinical Interpretation */}
                <div className={`p-6 rounded-2xl border-2 ${getRiskBgColor(result.riskLevel)}`}>
                  <h4 className="text-lg font-semibold mb-3">{t('calculators.gdm_screening.clinical_recommendations')}</h4>
                  <div className="space-y-3">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {t(`calculators.gdm_screening.interpretations.${result.riskLevel}`).replace('{score}', String(result.value))}
                    </p>
                    
                    <div className="space-y-2">
                      {/* Use translated recommendations based on risk level with indexed structure */}
                      {(() => {
                        const riskRecommendations: string[] = [];
                        const universalRecommendations: string[] = [];
                        
                        // Get risk-specific recommendations using indexed keys
                        for (let i = 0; i < 10; i++) {
                          const recKey = `calculators.gdm_screening.recommendations.${result.riskLevel}.${i}`;
                          const recText = t(recKey);
                          if (recText && recText !== recKey) {
                            riskRecommendations.push(recText);
                          } else {
                            break; // Stop when no more translations available
                          }
                        }
                        
                        // Get universal recommendations using indexed keys
                        for (let i = 0; i < 10; i++) {
                          const uniKey = `calculators.gdm_screening.recommendations.universal.${i}`;
                          const uniText = t(uniKey);
                          if (uniText && uniText !== uniKey) {
                            universalRecommendations.push(uniText);
                          } else {
                            break; // Stop when no more translations available
                          }
                        }
                        
                        // Combine all recommendations
                        const allRecommendations = [...riskRecommendations, ...universalRecommendations];
                        
                        return allRecommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2">
                            <span className="text-gray-500 dark:text-gray-400 mt-1.5">•</span>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{rec}</p>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {/* Evidence Base */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('calculators.gdm_screening.evidence_base')}</h4>
                  <div className="space-y-2">
                    {/* Use translated references */}
                    {(() => {
                      const references: string[] = [];
                      
                      // Build references dynamically from translations
                      for (let i = 0; i < 10; i++) {
                        const refKey = `calculators.gdm_screening.references.${i}`;
                        const refText = t(refKey);
                        if (refText && refText !== refKey) {
                          references.push(refText);
                        } else {
                          break;
                        }
                      }
                      
                      return references.map((ref: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-gray-500 dark:text-gray-400 mt-1.5">•</span>
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{ref}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {t('calculators.gdm_screening.new_assessment')}
                  </button>
                  
                  <button
                    onClick={() => setResult(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    {t('calculators.gdm_screening.modify_inputs')}
                  </button>
                </div>

                {/* Share Results */}
                <CalculatorResultShare
                  calculatorName={t('calculators.gdm_screening.title')}
                  calculatorId="gdm-screening-calculator"
                  results={{
                    screeningTiming: t(`calculators.gdm_screening.result_values.screening_recommendations.${result.screeningRecommendation}`),
                    riskLevel: t(`calculators.gdm_screening.result_values.risk_levels.${result.riskLevel}`),
                    testingProtocol: t(`calculators.gdm_screening.result_values.testing_protocols.${result.testingProtocol}`)
                  }}
                  interpretation={t(`calculators.gdm_screening.interpretations.${result.riskLevel}`).replace('{score}', String(result.value))}
                  recommendations={(() => {
                    // Build translated recommendations array for CalculatorResultShare
                    const translatedRecommendations: string[] = [];
                    
                    // Get risk-specific recommendations using indexed keys
                    for (let i = 0; i < 10; i++) {
                      const recKey = `calculators.gdm_screening.recommendations.${result.riskLevel}.${i}`;
                      const recText = t(recKey);
                      if (recText && recText !== recKey) {
                        translatedRecommendations.push(recText);
                      } else {
                        break;
                      }
                    }
                    
                    // Get universal recommendations using indexed keys
                    for (let i = 0; i < 10; i++) {
                      const uniKey = `calculators.gdm_screening.recommendations.universal.${i}`;
                      const uniText = t(uniKey);
                      if (uniText && uniText !== uniKey) {
                        translatedRecommendations.push(uniText);
                      } else {
                        break;
                      }
                    }
                    
                    return translatedRecommendations;
                  })()}
                  riskLevel={result.riskLevel === 'low' ? 'low' : result.riskLevel === 'high' ? 'high' : 'intermediate'}
                />
              </div>
            )}

            {/* Footer Information */}
            <div className="text-center pt-8 border-t border-white/20 dark:border-gray-800/20">
              <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Info className="w-4 h-4" />
                <span>{t('calculators.gdm_screening.footer_info')}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-pink-600" />
                  <span className="text-pink-600 font-semibold">{t('calculators.gdm_screening.acog_2022_guidelines')}</span>
                </div>
              </div>
            </div>
          </div>
        </CalculatorContainer>
      </TabsContent>

      <TabsContent value="about" className="space-y-6">
        <CalculatorContainer
          title={t('calculators.gdm_screening.about_title')}
          subtitle={t('calculators.gdm_screening.about_subtitle')}
          icon={TestTube}
          gradient="obgyn"
          className="max-w-5xl mx-auto"
        >
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                  <Stethoscope className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-pink-800 dark:text-pink-200 mb-3">{t('calculators.gdm_screening.clinical_purpose')}</h3>
                  <p className="text-pink-700 dark:text-pink-300 leading-relaxed">
                    {t('calculators.gdm_screening.clinical_purpose_description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CalculatorContainer>
      </TabsContent>
    </Tabs>
  );
};

export default GDMScreeningCalculator; 