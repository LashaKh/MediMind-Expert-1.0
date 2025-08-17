import React from 'react';
import { 
  Calculator,
  FileText,
  User,
  Activity,
  Droplets,
  AlertTriangle,
  Zap,
  BarChart3,
  TrendingUp,
  Check,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { GRACEFormData } from '../../../utils/grace2Validator';

interface GraceFormStep3Props {
  formData: GRACEFormData;
  isCalculating: boolean;
  onBack: () => void;
  onReset: () => void;
  onCalculate: () => void;
}

export const GraceFormStep3: React.FC<GraceFormStep3Props> = ({
  formData,
  isCalculating,
  onBack,
  onReset,
  onCalculate
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/25 mb-6 group hover:scale-105 transition-all duration-300">
          <Calculator className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-800 dark:from-white dark:to-purple-200 bg-clip-text text-transparent mb-3">
          Calculate Risk Score
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          {t('calculators.cardiology.grace.review_data_assessment')}
        </p>
      </div>

      {/* Data Summary */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-indigo-500/5" />
        <div className="relative p-8">
          <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400" />
            {t('calculators.cardiology.grace.patient_summary')}
          </h4>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Demographics */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h5 className="font-semibold text-blue-800 dark:text-blue-200">
                  {t('calculators.cardiology.grace.demographics')}
                </h5>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Age:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.age} years</span>
                </div>
              </div>
            </div>

            {/* Vitals */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-red-50/80 to-orange-50/80 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200/50 dark:border-red-700/50 hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center mr-3">
                  <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h5 className="font-semibold text-red-800 dark:text-red-200">
                  {t('calculators.cardiology.grace.vital_signs')}
                </h5>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('calculators.cardiology.grace.hr_label')}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.heartRate} bpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('calculators.cardiology.grace.sbp_label')}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.systolicBP} mmHg</span>
                </div>
              </div>
            </div>

            {/* Labs & Clinical */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-700/50 hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mr-3">
                  <Droplets className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h5 className="font-semibold text-emerald-800 dark:text-emerald-200">
                  {t('calculators.cardiology.grace.labs_clinical')}
                </h5>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('calculators.cardiology.grace.creatinine_short')}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.creatinine} mg/dL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('calculators.cardiology.grace.killip_short')}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Class {formData.killipClass}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="mt-8">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
              {t('calculators.cardiology.grace.high_risk_features_present')}
            </h5>
            <div className="flex flex-wrap gap-3">
              {formData.cardiacArrest && (
                <div className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-300/50 dark:border-red-600/50">
                  <Zap className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    {t('calculators.cardiology.grace.cardiac_arrest')}
                  </span>
                </div>
              )}
              {formData.stDeviation && (
                <div className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-300/50 dark:border-purple-600/50">
                  <BarChart3 className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    {t('calculators.cardiology.grace.st_deviation')}
                  </span>
                </div>
              )}
              {formData.elevatedMarkers && (
                <div className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-300/50 dark:border-green-600/50">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    {t('calculators.cardiology.grace.elevated_markers')}
                  </span>
                </div>
              )}
              {!formData.cardiacArrest && !formData.stDeviation && !formData.elevatedMarkers && (
                <div className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-gray-500/20 to-slate-500/20 border border-gray-300/50 dark:border-gray-600/50">
                  <Check className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {t('calculators.cardiology.grace.no_additional_risk_factors')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8">
        <button
          onClick={onBack}
          className="group relative px-8 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:border-gray-400 dark:hover:border-gray-500 transform hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-center space-x-2">
            <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>{t('calculators.cardiology.grace.back_to_clinical')}</span>
          </div>
        </button>

        <div className="flex space-x-4">
          <button
            onClick={onReset}
            className="group relative px-8 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:border-gray-400 dark:hover:border-gray-500 transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>{t('calculators.cardiology.grace.reset')}</span>
            </div>
          </button>

          <button
            onClick={onCalculate}
            disabled={isCalculating}
            className="group relative px-12 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center space-x-3">
              {isCalculating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('calculators.cardiology.grace.calculating')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                  <span>{t('calculators.cardiology.grace.calculate_button')}</span>
                </>
              )}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};