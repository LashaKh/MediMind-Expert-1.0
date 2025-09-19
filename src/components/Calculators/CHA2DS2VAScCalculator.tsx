import React, { useState, useCallback, useMemo } from 'react';
import { Heart, AlertTriangle, Activity, Info, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { getCategoryIconClass, getSpecialtyGradientClass } from '../../utils/calculatorTheme';
import { MedicalSpecialty } from '../../stores/useAppStore';

interface CHA2DS2VAScFormData {
  age: string;
  sex: 'male' | 'female' | '';
  chf: boolean;
  hypertension: boolean;
  diabetes: boolean;
  stroke_tia: boolean;
  vascularDisease: boolean;
}

interface CHA2DS2VAScResult {
  score: number;
  annualStrokeRisk: number;
  systemicEmbolismRisk: number;
  riskCategory: 'low' | 'moderate' | 'high';
  recommendation: string;
}

const CHA2DS2VAScCalculatorComponent: React.FC = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<CHA2DS2VAScFormData>({
    age: '',
    sex: '',
    chf: false,
    hypertension: false,
    diabetes: false,
    stroke_tia: false,
    vascularDisease: false
  });
  
  const [result, setResult] = useState<CHA2DS2VAScResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age)) {
      newErrors.age = t('calculators.cardiology.atrial_fibrillation.validation.age_required');
    } else if (age < 18 || age > 120) {
      newErrors.age = t('calculators.cardiology.atrial_fibrillation.validation.age_range');
    }

    if (!formData.sex) {
      newErrors.sex = t('calculators.cardiology.atrial_fibrillation.validation.sex_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const calculateCHA2DS2VASc = useCallback((): CHA2DS2VAScResult => {
    const age = parseInt(formData.age);
    let score = 0;

    // Age scoring
    if (age >= 75) score += 2;
    else if (age >= 65) score += 1;

    // Sex scoring (female gets 1 point)
    if (formData.sex === 'female') score += 1;

    // Clinical conditions (1 point each)
    if (formData.chf) score += 1;
    if (formData.hypertension) score += 1;
    if (formData.diabetes) score += 1;
    if (formData.vascularDisease) score += 1;

    // Stroke/TIA (2 points)
    if (formData.stroke_tia) score += 2;

    // Annual stroke risk based on score
    const riskTable: Record<number, number> = {
      0: 0.2, 1: 0.6, 2: 2.2, 3: 3.2, 4: 4.8, 5: 7.2, 6: 9.7, 7: 11.2, 8: 10.8, 9: 12.2
    };

    // Systemic embolism risk (higher than stroke risk)
    const embolismRiskTable: Record<number, number> = {
      0: 0.3, 1: 0.9, 2: 2.9, 3: 4.6, 4: 6.5, 5: 10.0, 6: 13.6, 7: 15.7, 8: 15.2, 9: 17.4
    };

    const annualStrokeRisk = riskTable[Math.min(score, 9)] || 15;
    const systemicEmbolismRisk = embolismRiskTable[Math.min(score, 9)] || 20;

    // Risk category and recommendations
    let riskCategory: 'low' | 'moderate' | 'high';
    let recommendation: string;

    if (score === 0) {
      riskCategory = 'low';
      recommendation = t('calculators.cardiology.chads_vasc.no_anticoagulation');
    } else if (score === 1 && formData.sex === 'male') {
      riskCategory = 'low';
      recommendation = t('calculators.cardiology.chads_vasc.no_anticoagulation');
    } else if (score === 1) {
      riskCategory = 'moderate';
      recommendation = t('calculators.cardiology.chads_vasc.consider_anticoagulation');
    } else {
      riskCategory = 'high';
      recommendation = t('calculators.cardiology.chads_vasc.anticoagulation_recommended');
    }

    return {
      score,
      annualStrokeRisk,
      systemicEmbolismRisk,
      riskCategory,
      recommendation
    };
  }, [formData, t]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const calculationResult = calculateCHA2DS2VASc();
    setResult(calculationResult);
    setShowResult(true);
    setIsCalculating(false);
  }, [validateForm, calculateCHA2DS2VASc]);

  const handleReset = useCallback(() => {
    setFormData({
      age: '',
      sex: '',
      chf: false,
      hypertension: false,
      diabetes: false,
      stroke_tia: false,
      vascularDisease: false
    });
    setResult(null);
    setErrors({});
    setShowResult(false);
  }, []);

  const getRiskColor = useMemo(() => (riskCategory: string) => {
    switch (riskCategory) {
      case 'high': return 'text-calc-category-1';
      case 'moderate': return 'text-calc-category-3';
      case 'low': return 'text-calc-category-4';
      default: return 'text-gray-600';
    }
  }, []);

  return (
    <div className="max-w-2xl">
      <div className="relative overflow-hidden rounded-2xl shadow-xl backdrop-blur-xl border border-white/20 dark:border-gray-800/20 bg-gradient-to-br from-blue-50/80 via-white/90 to-indigo-50/80 dark:from-blue-900/20 dark:via-gray-900/90 dark:to-indigo-900/20">
        {/* Compact Header */}
        <div className="relative p-4 pb-3 border-b border-white/20 dark:border-gray-800/20">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="relative p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-gray-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                {t('calculators.cardiology.chads_vasc.title')}
              </h1>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Validated</span>
            </div>
          </div>
        </div>

        {/* Compact Content */}
        <div className="relative p-4">
      {!showResult ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Compact Age and Sex in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                {t('calculators.cardiology.chads_vasc.age')} *
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                min={18}
                max={120}
                className={`w-full px-3 py-2 text-sm rounded-lg border-2 transition-all duration-200 font-medium min-h-[40px] bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  errors.age ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                }`}
                placeholder="Enter age"
              />
              {errors.age && (
                <div className="flex items-center space-x-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.age}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                {t('calculators.cardiology.chads_vasc.sex')} *
              </label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as 'male' | 'female' })}
                className={`w-full px-3 py-2 text-sm rounded-lg border-2 transition-all duration-200 font-medium min-h-[40px] bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  errors.sex ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                }`}
              >
                <option value="">{t('calculators.common.select_option')}</option>
                <option value="female">{t('calculators.cardiology.chads_vasc.female')}</option>
                <option value="male">{t('calculators.cardiology.chads_vasc.male')}</option>
              </select>
              {errors.sex && (
                <div className="flex items-center space-x-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.sex}</span>
                </div>
              )}
            </div>
          </div>

          {/* Compact Clinical Conditions in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-h-[36px] touch-manipulation">
                <input
                  type="checkbox"
                  checked={formData.hypertension}
                  onChange={(e) => setFormData({ ...formData, hypertension: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-xs font-semibold text-gray-900">
                  {t('calculators.cardiology.chads_vasc.hypertension')}
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-h-[36px] touch-manipulation">
                <input
                  type="checkbox"
                  checked={formData.diabetes}
                  onChange={(e) => setFormData({ ...formData, diabetes: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-xs font-semibold text-gray-900">
                  {t('calculators.cardiology.chads_vasc.diabetes')}
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-h-[36px] touch-manipulation">
                <input
                  type="checkbox"
                  checked={formData.chf}
                  onChange={(e) => setFormData({ ...formData, chf: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-xs font-semibold text-gray-900">
                  {t('calculators.cardiology.chads_vasc.chf')}
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-h-[36px] touch-manipulation">
                <input
                  type="checkbox"
                  checked={formData.stroke_tia}
                  onChange={(e) => setFormData({ ...formData, stroke_tia: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-xs font-semibold text-gray-900">
                  {t('calculators.cardiology.chads_vasc.stroke_tia')}
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-all duration-200 min-h-[36px] touch-manipulation">
                <input
                  type="checkbox"
                  checked={formData.vascularDisease}
                  onChange={(e) => setFormData({ ...formData, vascularDisease: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-xs font-semibold text-gray-900">
                  {t('calculators.cardiology.chads_vasc.vascular_disease')}
                </span>
              </label>
            </div>
          </div>

          {/* Compact Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isCalculating}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[40px] touch-manipulation"
            >
              {isCalculating ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Calculating...
                </div>
              ) : (
                t('calculators.common.calculate')
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/30 min-h-[40px] touch-manipulation"
            >
              {t('calculators.common.reset')}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {/* Compact Score Display */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                {t('calculators.cardiology.chads_vasc.score_label')}
              </span>
              <span className="text-xl font-bold text-blue-600">
                {result!.score} {t('calculators.common.points')}
              </span>
            </div>
          </div>

          {/* Compact Risk Display */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-2 rounded-md border border-gray-200">
              <div className="flex items-center space-x-1 mb-1">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-medium text-gray-600">
                  Stroke Risk
                </span>
              </div>
              <p className={`text-lg font-bold ${getRiskColor(result!.riskCategory)}`}>
                {result!.annualStrokeRisk}%
              </p>
            </div>

            <div className="bg-white p-2 rounded-md border border-gray-200">
              <div className="flex items-center space-x-1 mb-1">
                <Activity className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-medium text-gray-600">
                  Embolism Risk
                </span>
              </div>
              <p className={`text-lg font-bold ${getRiskColor(result!.riskCategory)}`}>
                {result!.systemicEmbolismRisk}%
              </p>
            </div>
          </div>

          {/* Compact Risk Category & Recommendation */}
          <div className="grid grid-cols-1 gap-2">
            <div className={`p-2 rounded-md border text-center ${
              result!.riskCategory === 'high' 
                ? 'bg-red-50 border-red-200' 
                : result!.riskCategory === 'moderate'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <p className="text-xs font-semibold text-gray-700">
                {t('calculators.common.risk_category')}:
              </p>
              <p className={`text-sm font-bold ${getRiskColor(result!.riskCategory)}`}>
                {t(`calculators.common.risk_${result!.riskCategory}`).toUpperCase()}
              </p>
            </div>

            <div className="bg-blue-50 p-2 rounded-md border border-blue-200">
              <div className="flex items-start space-x-2">
                <Info className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">
                    {t('calculators.common.clinical_recommendation')}:
                  </p>
                  <p className="text-xs text-blue-800">{result!.recommendation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/30 min-h-[44px] touch-manipulation"
            >
              {t('calculators.common.reset')}
            </button>
          </div>

          {/* Compact Disclaimer */}
          <div className="p-2 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600">
              {t('calculators.common.disclaimer')}
            </p>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

// Memoized component to prevent unnecessary re-renders
export const CHA2DS2VAScCalculator = React.memo(CHA2DS2VAScCalculatorComponent);

export default CHA2DS2VAScCalculator;