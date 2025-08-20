import React, { useState, useCallback, useMemo } from 'react';
import { Calculator, Info, AlertTriangle, CheckCircle, Shield, Thermometer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CalculatorResultShare } from './CalculatorResultShare';
import { calculateOBGYN, validateOBGYNInput } from '../../services/obgynCalculatorService';
import { MenopauseAssessmentInput, MenopauseAssessmentResult } from '../../types/obgyn-calculators';
import { useTranslation } from '../../hooks/useTranslation';

interface FormData {
  age: string;
  lastMenstrualPeriod: string;
  menstrualPattern: 'regular' | 'irregular' | 'absent';
  vasomotorSymptoms: 'none' | 'mild' | 'moderate' | 'severe';
  sleepDisturbance: boolean;
  moodChanges: boolean;
  vaginalDryness: boolean;
  hotFlashFrequency: string;
  fsh: string;
  estradiol: string;
}

const MenopauseAssessmentCalculatorComponent: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'calculator' | 'about'>('calculator');
  const [formData, setFormData] = useState<FormData>({
    age: '',
    lastMenstrualPeriod: '',
    menstrualPattern: 'regular',
    vasomotorSymptoms: 'none',
    sleepDisturbance: false,
    moodChanges: false,
    vaginalDryness: false,
    hotFlashFrequency: '',
    fsh: '',
    estradiol: ''
  });
  
  const [result, setResult] = useState<MenopauseAssessmentResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) {
      setErrors([]);
    }
  }, [errors.length]);

  const validateForm = useCallback((): boolean => {
    const newErrors: string[] = [];

    if (!formData.age) {
      newErrors.push(t('calculators.menopause_assessment.validation_ageRequired'));
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 35 || age > 70) {
        newErrors.push(t('calculators.menopause_assessment.validation_ageRange'));
      }
    }

    if (!formData.lastMenstrualPeriod) {
      newErrors.push(t('calculators.menopause_assessment.validation_lastMenstrualPeriodRequired'));
    }

    if (!formData.hotFlashFrequency) {
      newErrors.push(t('calculators.menopause_assessment.validation_hotFlashFrequencyRequired'));
    } else {
      const frequency = parseInt(formData.hotFlashFrequency);
      if (isNaN(frequency) || frequency < 0 || frequency > 50) {
        newErrors.push(t('calculators.menopause_assessment.validation_hotFlashFrequencyRange'));
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [formData, t]);

  const handleCalculate = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const input: MenopauseAssessmentInput = {
        age: formData.age,
        lastMenstrualPeriod: formData.lastMenstrualPeriod,
        menstrualPattern: formData.menstrualPattern,
        vasomotorSymptoms: formData.vasomotorSymptoms,
        sleepDisturbance: formData.sleepDisturbance,
        moodChanges: formData.moodChanges,
        vaginalDryness: formData.vaginalDryness,
        hotFlashFrequency: formData.hotFlashFrequency,
        fsh: formData.fsh || undefined,
        estradiol: formData.estradiol || undefined,
        calculationDate: new Date().toISOString()
      };

      // Use the service validation
      const validation = validateOBGYNInput('menopause-assessment', input);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      const calculationResult = calculateOBGYN('menopause-assessment', input) as MenopauseAssessmentResult;
      setResult(calculationResult);
      
    } catch (error) {
      setErrors([error instanceof Error ? error.message : t('calculators.menopause_assessment.errors_calculationFailed')]);
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, formData, t]);

  const handleReset = useCallback(() => {
    setFormData({
      age: '',
      lastMenstrualPeriod: '',
      menstrualPattern: 'regular',
      vasomotorSymptoms: 'none',
      sleepDisturbance: false,
      moodChanges: false,
      vaginalDryness: false,
      hotFlashFrequency: '',
      fsh: '',
      estradiol: ''
    });
    setResult(null);
    setErrors([]);
  }, []);

  const getStatusColor = useMemo(() => (status: string) => {
    switch (status) {
      case 'premenopausal': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'perimenopausal': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'postmenopausal': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  }, []);

  const getStatusIcon = useMemo(() => (status: string) => {
    switch (status) {
      case 'premenopausal': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'perimenopausal': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'postmenopausal': return <Info className="w-5 h-5 text-purple-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'calculator' | 'about')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">{t('calculators.common.calculator')}</TabsTrigger>
          <TabsTrigger value="about">{t('calculators.common.about')}</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Thermometer className="w-5 h-5 text-orange-600" />
                <span>{t('calculators.menopause_assessment.title')}</span>
              </CardTitle>
              <CardDescription>
                {t('calculators.menopause_assessment.subtitle')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Demographics */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('calculators.menopause_assessment.fields_age')}
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(E) => handleInputChange('age', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('calculators.menopause_assessment.placeholders_age')}
                    min="35"
                    max="70"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('calculators.menopause_assessment.fields_lastMenstrualPeriod')}
                  </label>
                  <input
                    type="date"
                    value={formData.lastMenstrualPeriod}
                    onChange={(E) => handleInputChange('lastMenstrualPeriod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Menstrual History */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('calculators.menopause_assessment.sections_menstrualHistory')}</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('calculators.menopause_assessment.fields_menstrualPattern')}
                    </label>
                    <select
                      value={formData.menstrualPattern}
                      onChange={(E) => handleInputChange('menstrualPattern', e.target.value as 'regular' | 'irregular' | 'absent')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="regular">{t('calculators.menopause_assessment.options_menstrualPattern_regular')}</option>
                      <option value="irregular">{t('calculators.menopause_assessment.options_menstrualPattern_irregular')}</option>
                      <option value="absent">{t('calculators.menopause_assessment.options_menstrualPattern_absent')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('calculators.menopause_assessment.fields_hotFlashFrequency')}
                    </label>
                    <input
                      type="number"
                      value={formData.hotFlashFrequency}
                      onChange={(E) => handleInputChange('hotFlashFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('calculators.menopause_assessment.placeholders_hotFlashFrequency')}
                      min="0"
                      max="50"
                    />
                  </div>
                </div>
              </div>

              {/* Vasomotor Symptoms */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('calculators.menopause_assessment.sections_vasomotorSymptoms')}</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('calculators.menopause_assessment.fields_vasomotorSymptomSeverity')}
                    </label>
                    <select
                      value={formData.vasomotorSymptoms}
                      onChange={(E) => handleInputChange('vasomotorSymptoms', e.target.value as 'none' | 'mild' | 'moderate' | 'severe')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">{t('calculators.menopause_assessment.options_vasomotorSymptoms_none')}</option>
                      <option value="mild">{t('calculators.menopause_assessment.options_vasomotorSymptoms_mild')}</option>
                      <option value="moderate">{t('calculators.menopause_assessment.options_vasomotorSymptoms_moderate')}</option>
                      <option value="severe">{t('calculators.menopause_assessment.options_vasomotorSymptoms_severe')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Associated Symptoms */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('calculators.menopause_assessment.sections_associatedSymptoms')}</h3>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white">
                    <input
                      type="checkbox"
                      checked={formData.sleepDisturbance}
                      onChange={(E) => handleInputChange('sleepDisturbance', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">{t('calculators.menopause_assessment.symptoms_sleepDisturbance_label')}</span>
                      <p className="text-xs text-gray-500">{t('calculators.menopause_assessment.symptoms_sleepDisturbance_description')}</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white">
                    <input
                      type="checkbox"
                      checked={formData.moodChanges}
                      onChange={(E) => handleInputChange('moodChanges', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">{t('calculators.menopause_assessment.symptoms_moodChanges_label')}</span>
                      <p className="text-xs text-gray-500">{t('calculators.menopause_assessment.symptoms_moodChanges_description')}</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white">
                    <input
                      type="checkbox"
                      checked={formData.vaginalDryness}
                      onChange={(E) => handleInputChange('vaginalDryness', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">{t('calculators.menopause_assessment.symptoms_vaginalDryness_label')}</span>
                      <p className="text-xs text-gray-500">{t('calculators.menopause_assessment.symptoms_vaginalDryness_description')}</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Laboratory Values */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('calculators.menopause_assessment.sections_laboratoryValues')}</h3>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('calculators.menopause_assessment.fields_fsh')}
                    </label>
                    <input
                      type="number"
                      value={formData.fsh}
                      onChange={(E) => handleInputChange('fsh', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('calculators.menopause_assessment.placeholders_fsh')}
                      min="0"
                      max="200"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500">{t('calculators.menopause_assessment.descriptions_fsh')}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('calculators.menopause_assessment.fields_estradiol')}
                    </label>
                    <input
                      type="number"
                      value={formData.estradiol}
                      onChange={(E) => handleInputChange('estradiol', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('calculators.menopause_assessment.placeholders_estradiol')}
                      min="0"
                      max="500"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500">{t('calculators.menopause_assessment.descriptions_estradiol')}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCalculate}
                  disabled={isLoading || !formData.age || !formData.lastMenstrualPeriod || !formData.hotFlashFrequency}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? t('calculators.common.calculating') : t('calculators.menopause_assessment.buttons_assess')}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  {t('calculators.common.reset')}
                </button>
              </div>

              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <ul className="text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results - Coming Soon placeholder for now */}
          <Card>
            <CardHeader>
              <CardTitle>{t('calculators.menopause_assessment.comingSoon_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('calculators.menopause_assessment.title')}</h3>
                <p className="text-gray-600 mb-4">{t('calculators.menopause_assessment.comingSoon_description')}</p>
                <p className="text-sm text-gray-500">
                  {t('calculators.menopause_assessment.comingSoon_details')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('calculators.menopause_assessment.about_title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">{t('calculators.menopause_assessment.about_clinicalPurpose_title')}</h3>
                <p className="text-orange-700 mb-2">
                  {t('calculators.menopause_assessment.about_clinicalPurpose_description1')}
                </p>
                <p className="text-orange-700">
                  {t('calculators.menopause_assessment.about_clinicalPurpose_description2')}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">{t('calculators.menopause_assessment.about_stages_premenopausal_title')}</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• {t('calculators.menopause_assessment.about_stages_premenopausal_features_regularCycles')}</li>
                    <li>• {t('calculators.menopause_assessment.about_stages_premenopausal_features_normalHormones')}</li>
                    <li>• {t('calculators.menopause_assessment.about_stages_premenopausal_features_minimalSymptoms')}</li>
                    <li>• {t('calculators.menopause_assessment.about_stages_premenopausal_features_reproductivePotential')}</li>
                  </ul>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-3">{t('calculators.menopause_assessment.about_stages_perimenopausal_title')}</h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• {t('calculators.menopause_assessment.about_stages_perimenopausal_features_irregularCycles')}</li>
                    <li>• {t('calculators.menopause_assessment.about_stages_perimenopausal_features_fluctuatingHormones')}</li>
                    <li>• {t('calculators.menopause_assessment.about_stages_perimenopausal_features_vasomotorSymptoms')}</li>
                    <li>• {t('calculators.menopause_assessment.about_stages_perimenopausal_features_variableDuration')}</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">{t('calculators.menopause_assessment.about_stages_postmenopausal_title')}</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• {t('calculators.menopause_assessment.about_stages_postmenopausal_features_noPeriods')}</li>
                    <li>• {t('calculators.menopause_assessment.about_stages_postmenopausal_features_lowEstrogen')}</li>
                    <li>• {t('calculators.menopause_assessment.about_stages_postmenopausal_features_stableHormones')}</li>
                    <li>• {t('calculators.menopause_assessment.about_stages_postmenopausal_features_longTermHealth')}</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-3">{t('calculators.menopause_assessment.about_symptoms_title')}</h3>
                
                <div className="grid xl:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">{t('calculators.menopause_assessment.about_symptoms_vasomotor_title')}</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• {t('calculators.menopause_assessment.about_symptoms_vasomotor_hotFlashes')}</li>
                      <li>• {t('calculators.menopause_assessment.about_symptoms_vasomotor_nightSweats')}</li>
                      <li>• {t('calculators.menopause_assessment.about_symptoms_vasomotor_palpitations')}</li>
                      <li>• {t('calculators.menopause_assessment.about_symptoms_vasomotor_chills')}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">{t('calculators.menopause_assessment.about_symptoms_other_title')}</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• {t('calculators.menopause_assessment.about_symptoms_other_sleepDisturbances')}</li>
                      <li>• {t('calculators.menopause_assessment.about_symptoms_other_moodChanges')}</li>
                      <li>• {t('calculators.menopause_assessment.about_symptoms_other_vaginalDryness')}</li>
                      <li>• {t('calculators.menopause_assessment.about_symptoms_other_cognitiveChanges')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3">{t('calculators.menopause_assessment.about_management_title')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-800">{t('calculators.menopause_assessment.about_management_hormoneTherapy_title')}</h4>
                    <ul className="text-sm text-green-700 mt-1 space-y-1">
                      <li>• {t('calculators.menopause_assessment.about_management_hormoneTherapy_systemicEstrogen')}</li>
                      <li>• {t('calculators.menopause_assessment.about_management_hormoneTherapy_combinedTherapy')}</li>
                      <li>• {t('calculators.menopause_assessment.about_management_hormoneTherapy_localVaginal')}</li>
                      <li>• {t('calculators.menopause_assessment.about_management_hormoneTherapy_riskBenefit')}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-green-800">{t('calculators.menopause_assessment.about_management_nonHormonal_title')}</h4>
                    <ul className="text-sm text-green-700 mt-1 space-y-1">
                      <li>• {t('calculators.menopause_assessment.about_management_nonHormonal_ssriSnri')}</li>
                      <li>• {t('calculators.menopause_assessment.about_management_nonHormonal_gabapentin')}</li>
                      <li>• {t('calculators.menopause_assessment.about_management_nonHormonal_cbt')}</li>
                      <li>• {t('calculators.menopause_assessment.about_management_nonHormonal_lifestyle')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">{t('calculators.menopause_assessment.about_laboratory_title')}</h3>
                
                <div className="grid xl:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">{t('calculators.menopause_assessment.about_laboratory_recommendedTests_title')}</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• {t('calculators.menopause_assessment.about_laboratory_recommendedTests_fsh')}</li>
                      <li>• {t('calculators.menopause_assessment.about_laboratory_recommendedTests_estradiol')}</li>
                      <li>• {t('calculators.menopause_assessment.about_laboratory_recommendedTests_tsh')}</li>
                      <li>• {t('calculators.menopause_assessment.about_laboratory_recommendedTests_lipidProfile')}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">{t('calculators.menopause_assessment.about_laboratory_typicalValues_title')}</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• {t('calculators.menopause_assessment.about_laboratory_typicalValues_postmenopausalFsh')}</li>
                      <li>• {t('calculators.menopause_assessment.about_laboratory_typicalValues_estradiol')}</li>
                      <li>• {t('calculators.menopause_assessment.about_laboratory_typicalValues_variablePerimenopausal')}</li>
                      <li>• {t('calculators.menopause_assessment.about_laboratory_typicalValues_clinicalDiagnosis')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('calculators.menopause_assessment.about_guidelines_title')}</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>{t('calculators.menopause_assessment.about_guidelines_nams_title')}:</strong> {t('calculators.menopause_assessment.about_guidelines_nams_description')}</li>
                  <li><strong>{t('calculators.menopause_assessment.about_guidelines_acog_title')}:</strong> {t('calculators.menopause_assessment.about_guidelines_acog_description')}</li>
                  <li><strong>{t('calculators.menopause_assessment.about_guidelines_ims_title')}:</strong> {t('calculators.menopause_assessment.about_guidelines_ims_description')}</li>
                  <li><strong>{t('calculators.menopause_assessment.about_guidelines_endocrine_title')}:</strong> {t('calculators.menopause_assessment.about_guidelines_endocrine_description')}</li>
                  <li><strong>{t('calculators.menopause_assessment.about_guidelines_rcog_title')}:</strong> {t('calculators.menopause_assessment.about_guidelines_rcog_description')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Memoized component to prevent unnecessary re-renders
export const MenopauseAssessmentCalculator = React.memo(MenopauseAssessmentCalculatorComponent);

export default MenopauseAssessmentCalculator; 