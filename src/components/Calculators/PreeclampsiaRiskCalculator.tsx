import React, { useState, useCallback, useMemo } from 'react';
import { Calculator, Info, AlertTriangle, CheckCircle, Star, User, Activity, BarChart3, Stethoscope, Award, Shield, Clock, Target, Heart, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
import { calculatePreeclampsiaRisk, validateOBGYNInput } from '../../services/obgynCalculatorService';
import { PreeclampsiaRiskInput, PreeclampsiaRiskResult } from '../../types/obgyn-calculators';
import { useTranslation } from '../../hooks/useTranslation';

interface FormData {
  maternalAge: string;
  nulliparity: boolean;
  previousPreeclampsia: boolean;
  familyHistory: boolean;
  chronicHypertension: boolean;
  diabetes: boolean;
  multipleGestation: boolean;
  bmi: string;
  meanArterialPressure: string;
  uterineArteryPI: string;
  plgf: string;
  pappA: string;
}

const PreeclampsiaRiskCalculatorComponent: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('calculator');
  const [formData, setFormData] = useState<FormData>({
    maternalAge: '',
    nulliparity: false,
    previousPreeclampsia: false,
    familyHistory: false,
    chronicHypertension: false,
    diabetes: false,
    multipleGestation: false,
    bmi: '',
    meanArterialPressure: '',
    uterineArteryPI: '',
    plgf: '',
    pappA: ''
  });
  
  const [result, setResult] = useState<PreeclampsiaRiskResult | null>(null);
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

    // Maternal age validation
    if (!formData.maternalAge) {
      newErrors.maternalAge = t('calculators.preeclampsia_risk.maternal_age_error');
    } else {
      const age = parseInt(formData.maternalAge);
      if (isNaN(age) || age < 15 || age > 50) {
        newErrors.maternalAge = t('calculators.preeclampsia_risk.maternal_age_error');
      }
    }

    // BMI validation
    if (!formData.bmi) {
      newErrors.bmi = t('calculators.preeclampsia_risk.maternal_bmi_error');
    } else {
      const bmi = parseFloat(formData.bmi);
      if (isNaN(bmi) || bmi < 15 || bmi > 50) {
        newErrors.bmi = t('calculators.preeclampsia_risk.maternal_bmi_error');
      }
    }

    // Optional parameters validation
    if (formData.meanArterialPressure) {
      const map = parseFloat(formData.meanArterialPressure);
      if (isNaN(map) || map < 60 || map > 150) {
        newErrors.meanArterialPressure = t('calculators.preeclampsia_risk.mean_arterial_pressure_error');
      }
    }

    if (formData.uterineArteryPI) {
      const pi = parseFloat(formData.uterineArteryPI);
      if (isNaN(pi) || pi < 0.5 || pi > 3.0) {
        newErrors.uterineArteryPI = t('calculators.preeclampsia_risk.uterine_artery_pi_error');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleCalculate = useCallback(() => {
    if (!validateForm()) return;

    setIsCalculating(true);
    
    // Professional preeclampsia risk calculation with loading animation
    setTimeout(() => {
      try {
        const input: PreeclampsiaRiskInput = {
          maternalAge: formData.maternalAge,
          nulliparity: formData.nulliparity,
          previousPreeclampsia: formData.previousPreeclampsia,
          familyHistory: formData.familyHistory,
          chronicHypertension: formData.chronicHypertension,
          diabetes: formData.diabetes,
          multipleGestation: formData.multipleGestation,
          bmi: formData.bmi,
          meanArterialPressure: formData.meanArterialPressure || undefined,
          uterineArteryPI: formData.uterineArteryPI || undefined,
          plgf: formData.plgf || undefined,
          pappA: formData.pappA || undefined,
          calculationDate: new Date().toISOString()
        };

        // Use the service validation
        const validation = validateOBGYNInput('preeclampsia-risk', input);
        if (!validation.isValid) {
          setErrors(validation.errors.reduce((acc, error, index) => ({ ...acc, [`error_${index}`]: error }), {}));
          setIsCalculating(false);
          return;
        }

        const calculationResult = calculatePreeclampsiaRisk(input);
        setResult(calculationResult);
        
      } catch (error) {
        setErrors({ calculation: error instanceof Error ? error.message : t('calculators.preeclampsia_risk.calculation_failed') });
      } finally {
        setIsCalculating(false);
      }
    }, 2000); // Professional OB/GYN preeclampsia calculation simulation
  }, [validateForm, formData, t]);

  const handleReset = useCallback(() => {
    setFormData({
      maternalAge: '',
      nulliparity: false,
      previousPreeclampsia: false,
      familyHistory: false,
      chronicHypertension: false,
      diabetes: false,
      multipleGestation: false,
      bmi: '',
      meanArterialPressure: '',
      uterineArteryPI: '',
      plgf: '',
      pappA: ''
    });
    setResult(null);
    setErrors({});
    setIsCalculating(false);
    setCurrentStep(1);
  }, []);

  const formatRiskPercentage = useMemo(() => (value: number): string => {
    return `${value.toFixed(1)}%`;
  }, []);

  const getConfidenceColor = useMemo(() => (category: string) => {
    switch (category) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'very-high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  const getRiskBgColor = useMemo(() => (category: string) => {
    switch (category) {
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      case 'moderate': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'very-high': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }, []);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="calculator">{t('calculators.common.calculator')}</TabsTrigger>
        <TabsTrigger value="about">{t('calculators.common.about')}</TabsTrigger>
      </TabsList>

      <TabsContent value="calculator">
        <CalculatorContainer
          title={t('calculators.preeclampsia_risk.title')}
          subtitle={t('calculators.preeclampsia_risk.subtitle')}
          icon={Heart}
          gradient="obgyn"
          className="max-w-5xl mx-auto"
        >
          <div className="space-y-8">
            {/* OB/GYN Risk Assessment Alert */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                  <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-pink-800 dark:text-pink-200 mb-2">{t('calculators.preeclampsia_risk.acog_evidence_based')}</h4>
                  <p className="text-pink-700 dark:text-pink-300 leading-relaxed">
                    {t('calculators.preeclampsia_risk.tool_description')}
                  </p>
                  <div className="mt-3 inline-flex items-center space-x-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg px-3 py-1">
                    <Star className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    <span className="text-xs font-semibold text-pink-700 dark:text-pink-300">{t('calculators.preeclampsia_risk.acog_committee_reference')}</span>
                  </div>
                </div>
              </div>
            </div>

            {!result ? (
              <>
                {/* Mobile-Responsive Progress Indicator */}
                {isMobile ? (
                  // Mobile: Compact vertical progress
                  <div className="flex flex-col items-center space-y-3 mb-8">
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Step</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep >= 1 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentStep}
                      </div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">of 3</span>
                    </div>
                    <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {currentStep === 1 && t('calculators.preeclampsia_risk.progress.step_1')}
                        {currentStep === 2 && t('calculators.preeclampsia_risk.progress.step_2')}
                        {currentStep === 3 && t('calculators.preeclampsia_risk.progress.step_3')}
                      </h3>
                    </div>
                  </div>
                ) : (
                  // Desktop: Horizontal progress indicator
                  <div className="flex items-center justify-center space-x-4 mb-8">
                    <div className="flex items-center space-x-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep >= 1 ? 'bg-pink-500 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                      }`}>
                        1
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden lg:inline">{t('calculators.preeclampsia_risk.progress.step_1')}</span>
                    </div>
                    <div className={`w-16 h-1 rounded-full transition-all duration-300 ${
                      currentStep >= 2 ? 'bg-rose-500' : 'bg-gray-200'
                    }`}></div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep >= 2 ? 'bg-rose-500 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                      }`}>
                        2
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden lg:inline">{t('calculators.preeclampsia_risk.progress.step_2')}</span>
                    </div>
                    <div className={`w-16 h-1 rounded-full transition-all duration-300 ${
                      currentStep >= 3 ? 'bg-purple-500' : 'bg-gray-200'
                    }`}></div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep >= 3 ? 'bg-purple-500 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                      }`}>
                        3
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden lg:inline">{t('calculators.preeclampsia_risk.progress.step_3')}</span>
                    </div>
                  </div>
                )}

                {/* Step 1: Risk Factor Assessment */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl border border-pink-200 dark:border-pink-800">
                        <User className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.preeclampsia_risk.risk_methods')}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.preeclampsia_risk.multiple_risk_factors')}</p>
                    </div>

                    <div className="space-y-6">
                      {/* Patient Demographics */}
                      <div className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <User className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('calculators.preeclampsia_risk.maternal_characteristics')}</h4>
                        </div>
                        
                        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                          <CalculatorInput
                            label={t('calculators.preeclampsia_risk.maternal_age_label')}
                            value={formData.maternalAge}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maternalAge: e.target.value })}
                            type="number"
                            placeholder="25"
                            min={15}
                            max={50}
                            unit={t('calculators.preeclampsia_risk.years_unit')}
                            error={errors.maternalAge}
                            helpText={t('calculators.preeclampsia_risk.maternal_age_help')}
                            icon={User}
                          />

                          <CalculatorInput
                            label={t('calculators.preeclampsia_risk.maternal_bmi_label')}
                            value={formData.bmi}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, bmi: e.target.value })}
                            type="number"
                            placeholder="24.5"
                            min={15}
                            max={50}
                            unit={t('calculators.preeclampsia_risk.kg_m2_unit')}
                            step={0.1}
                            error={errors.bmi}
                            helpText={t('calculators.preeclampsia_risk.maternal_bmi_help')}
                            icon={Activity}
                          />
                        </div>

                        <div className="mt-4">
                          <CalculatorCheckbox
                            id="nulliparity"
                            checked={formData.nulliparity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nulliparity: e.target.checked })}
                            label={t('calculators.preeclampsia_risk.nulliparity')}
                            description={t('calculators.preeclampsia_risk.nulliparity')}
                          />
                        </div>
                      </div>

                      {/* Major Risk Factors */}
                      <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <h4 className="font-semibold text-red-800 dark:text-red-200">{t('calculators.preeclampsia_risk.high_risk_factors')}</h4>
                        </div>
                        
                        <div className={`space-y-4 ${!isMobile && 'grid grid-cols-1 lg:grid-cols-2 gap-4'}`}>
                          <div className={`${isMobile ? 'bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm' : ''}`}>
                            <CalculatorCheckbox
                              id="previousPreeclampsia"
                              checked={formData.previousPreeclampsia}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, previousPreeclampsia: e.target.checked })}
                              label={t('calculators.preeclampsia_risk.previous_preeclampsia')}
                              description={t('calculators.preeclampsia_risk.previous_preeclampsia')}
                            />
                          </div>

                          <div className={`${isMobile ? 'bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm' : ''}`}>
                            <CalculatorCheckbox
                              id="chronicHypertension"
                              checked={formData.chronicHypertension}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, chronicHypertension: e.target.checked })}
                              label={t('calculators.preeclampsia_risk.chronic_hypertension')}
                              description={t('calculators.preeclampsia_risk.chronic_hypertension')}
                            />
                          </div>

                          <div className={`${isMobile ? 'bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm' : ''}`}>
                            <CalculatorCheckbox
                              id="diabetes"
                              checked={formData.diabetes}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, diabetes: e.target.checked })}
                              label={t('calculators.preeclampsia_risk.diabetes_pregestational')}
                              description={t('calculators.preeclampsia_risk.diabetes_pregestational')}
                            />
                          </div>

                          <div className={`${isMobile ? 'bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm' : ''}`}>
                            <CalculatorCheckbox
                              id="multipleGestation"
                              checked={formData.multipleGestation}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, multipleGestation: e.target.checked })}
                              label={t('calculators.preeclampsia_risk.multiple_gestation')}
                              description={t('calculators.preeclampsia_risk.multiple_gestation')}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Moderate Risk Factors */}
                      <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <Info className="w-5 h-5 text-yellow-600" />
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">{t("calculators.preeclampsia_risk.moderate_risk_factors")}</h4>
                        </div>
                        
                        <CalculatorCheckbox
                          id="familyHistory"
                          checked={formData.familyHistory}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, familyHistory: e.target.checked })}
                          label={t("calculators.preeclampsia_risk.family_history_preeclampsia")}
                          description={t("calculators.preeclampsia_risk.family_history_preeclampsia")}
                        />
                      </div>
                    </div>

                    {/* Mobile-Responsive Navigation */}
                    {isMobile ? (
                      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 -mx-8 -mb-8">
                        <CalculatorButton
                          onClick={() => setCurrentStep(2)}
                          variant="primary"
                          size="lg"
                          className="w-full min-h-[56px] text-lg font-semibold"
                        >
                          {t("calculators.preeclampsia_risk.next_clinical_review")} →
                        </CalculatorButton>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center pt-6">
                        <div className="flex-1" /> {/* Spacer */}
                        <CalculatorButton
                          onClick={() => setCurrentStep(2)}
                          variant="primary"
                          size="lg"
                          className="enhanced-calculator-button"
                        >
                          {t("calculators.preeclampsia_risk.next_clinical_review")} →
                        </CalculatorButton>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Clinical Parameters */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-900/20 dark:to-purple-900/20 rounded-2xl border border-rose-200 dark:border-rose-800">
                        <Stethoscope className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('calculators.preeclampsia_risk.clinical_parameters')}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('calculators.preeclampsia_risk.clinical_parameters_subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Basic Clinical Measurements */}
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-4">{t('calculators.preeclampsia_risk.clinical_measurements')}</h4>
                        <div className="space-y-4">
                          <CalculatorInput
                            label={t('calculators.preeclampsia_risk.mean_arterial_pressure')}
                            value={formData.meanArterialPressure}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, meanArterialPressure: e.target.value })}
                            type="number"
                            placeholder="95"
                            min={60}
                            max={150}
                            unit="mmHg"
                            step={1}
                            error={errors.meanArterialPressure}
                            helpText={t('calculators.preeclampsia_risk.mean_arterial_pressure_help')}
                            icon={Heart}
                          />

                          <CalculatorInput
                            label={t('calculators.preeclampsia_risk.uterine_artery_pi')}
                            value={formData.uterineArteryPI}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, uterineArteryPI: e.target.value })}
                            type="number"
                            placeholder="1.2"
                            min={0.5}
                            max={3.0}
                            step={0.1}
                            error={errors.uterineArteryPI}
                            helpText={t('calculators.preeclampsia_risk.uterine_artery_pi_help')}
                            icon={Activity}
                          />
                        </div>
                      </div>

                      {/* Biochemical Markers */}
                      <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-4">{t('calculators.preeclampsia_risk.biochemical_markers')}</h4>
                        <div className="space-y-4">
                          <CalculatorInput
                            label={t('calculators.preeclampsia_risk.plgf_label')}
                            value={formData.plgf}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, plgf: e.target.value })}
                            type="number"
                            placeholder="45"
                            min={1}
                            max={200}
                            unit="pg/mL"
                            step={0.1}
                            error={errors.plgf}
                            helpText={t('calculators.preeclampsia_risk.plgf_help')}
                            icon={BarChart3}
                          />

                          <CalculatorInput
                            label={t('calculators.preeclampsia_risk.papp_a_label')}
                            value={formData.pappA}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pappA: e.target.value })}
                            type="number"
                            placeholder="1.2"
                            min={0.1}
                            max={5.0}
                            unit="MoM"
                            step={0.1}
                            error={errors.pappA}
                            helpText={t('calculators.preeclampsia_risk.papp_a_help')}
                            icon={BarChart3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Information Box */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">{t('calculators.preeclampsia_risk.clinical_parameters_information')}</h4>
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                        <p>• {t('calculators.preeclampsia_risk.clinical_info_1')}</p>
                        <p>• {t('calculators.preeclampsia_risk.clinical_info_2')}</p>
                        <p>• {t('calculators.preeclampsia_risk.clinical_info_3')}</p>
                        <p>• {t('calculators.preeclampsia_risk.clinical_info_4')}</p>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <CalculatorButton
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                      >
                        {t("calculators.preeclampsia_risk.back")}
                      </CalculatorButton>
                      <CalculatorButton
                        onClick={handleCalculate}
                        loading={isCalculating}
                        icon={Calculator}
                        size="lg"
                        className="enhanced-calculator-button"
                      >
                        {t("calculators.preeclampsia_risk.calculate_risk")}
                      </CalculatorButton>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Results Display */
              <div className="space-y-8 animate-scaleIn">
                <ResultsDisplay
                  title={t("calculators.preeclampsia_risk.title")}
                  value={formatRiskPercentage(parseFloat(result.value.toString()))}
                  category={result.category === 'very-high' ? 'high' : result.category as 'low' | 'intermediate' | 'high'}
                  interpretation={result.interpretation}
                  icon={Heart}
                >
                  {/* Risk Category Display */}
                  <div className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      <span className="font-semibold text-pink-800 dark:text-pink-200">Risk Category: {result.category.charAt(0).toUpperCase() + result.category.slice(1)}</span>
                    </div>
                    <div className={`inline-flex items-center space-x-1 rounded-lg px-3 py-1 ${getConfidenceColor(result.category)}`}>
                      <span className="text-xs font-semibold">Estimated Risk: {formatRiskPercentage(parseFloat(result.value.toString()))}</span>
                    </div>
                  </div>

                  {/* Risk Assessment Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                      <div className="flex items-center space-x-3 mb-3">
                        <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">Risk Assessment</h4>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatRiskPercentage(parseFloat(result.value.toString()))}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Preeclampsia risk estimate</p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <div className="flex items-center space-x-3 mb-3">
                        <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h4 className="font-semibold text-green-800 dark:text-green-200">Aspirin Recommendation</h4>
                      </div>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {result.aspirinRecommended ? 'Recommended' : 'Not Recommended'}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">Low-dose aspirin prophylaxis</p>
                    </div>
                  </div>

                  {/* Clinical Recommendations */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Stethoscope className="w-5 h-5 text-blue-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Clinical Recommendations</h4>
                    </div>
                    <div className={`p-6 rounded-2xl border-2 ${getRiskBgColor(result.category)}`}>
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
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200">Evidence Base</h4>
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
                    {t('calculators.preeclampsia_risk.new_assessment')}
                  </CalculatorButton>
                  <CalculatorButton
                    onClick={() => setResult(null)}
                    variant="secondary"
                    size="lg"
                  >
                    {t('calculators.preeclampsia_risk.modify_inputs')}
                  </CalculatorButton>
                </div>

                {/* Result Sharing */}
                <div className="mt-6">
                  <CalculatorResultShare
                    calculatorName="Preeclampsia Risk Calculator"
                    calculatorId="preeclampsia-risk-calculator"
                    results={{
                      riskPercentage: formatRiskPercentage(parseFloat(result.value.toString())),
                      category: result.category,
                      aspirinRecommended: result.aspirinRecommended ? 'Yes' : 'No'
                    }}
                    interpretation={result.interpretation}
                    recommendations={result.recommendations}
                    riskLevel={result.category === 'low' ? 'low' : result.category === 'very-high' ? 'high' : 'intermediate'}
                  />
                </div>
              </div>
            )}

            {/* Footer Information */}
            <div className="text-center pt-8 border-t border-white/20 dark:border-gray-800/20">
              <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Info className="w-4 h-4" />
                <span>Based on ACOG Practice Bulletin No. 222 • For educational purposes only</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-pink-600" />
                  <span className="text-pink-600 font-semibold">ACOG 2020 Guidelines</span>
                </div>
              </div>
            </div>
          </div>
        </CalculatorContainer>
      </TabsContent>

      <TabsContent value="about" className="space-y-6">
        <CalculatorContainer
          title={t('calculators.preeclampsia_risk.about_preeclampsia_calculator')}
          subtitle={t('calculators.preeclampsia_risk.about_evidence_subtitle')}
          icon={Heart}
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
                  <h3 className="text-xl font-bold text-pink-800 dark:text-pink-200 mb-3">{t('calculators.preeclampsia_risk.about_clinical_purpose')}</h3>
                  <p className="text-pink-700 dark:text-pink-300 leading-relaxed">
                    {t('calculators.preeclampsia_risk.about_clinical_purpose_description')}
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

// Memoized component to prevent unnecessary re-renders
export const PreeclampsiaRiskCalculator = React.memo(PreeclampsiaRiskCalculatorComponent);

export default PreeclampsiaRiskCalculator; 