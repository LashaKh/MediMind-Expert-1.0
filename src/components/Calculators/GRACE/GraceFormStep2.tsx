import React from 'react';
import { 
  Stethoscope, 
  Heart, 
  AlertTriangle, 
  Zap, 
  BarChart3, 
  TrendingUp, 
  Check, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { GRACEFormData } from '../../../utils/grace2Validator';

interface GraceFormStep2Props {
  formData: GRACEFormData;
  setFormData: (data: GRACEFormData) => void;
  onBack: () => void;
  onNext: () => void;
}

export const GraceFormStep2: React.FC<GraceFormStep2Props> = ({
  formData,
  setFormData,
  onBack,
  onNext
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/25 mb-6 group hover:scale-105 transition-all duration-300">
          <Stethoscope className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-emerald-800 dark:from-white dark:to-emerald-200 bg-clip-text text-transparent mb-3">
          {t('calculators.cardiology.grace.clinical_section')}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Select clinical findings and presentation</p>
      </div>

      {/* Killip Classification */}
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
          <Heart className="w-4 h-4 mr-2 text-rose-500" />
          {t('calculators.cardiology.grace.killip_class_label')}
        </label>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[
            { value: 1, label: "Class I", description: t('calculators.cardiology.grace.killip_class_1') },
            { value: 2, label: "Class II", description: t('calculators.cardiology.grace.killip_class_2') },
            { value: 3, label: "Class III", description: t('calculators.cardiology.grace.killip_class_3') },
            { value: 4, label: "Class IV", description: t('calculators.cardiology.grace.killip_class_4') }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, killipClass: option.value })}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-105 ${
                formData.killipClass === option.value
                  ? 'border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 shadow-xl shadow-rose-500/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:border-rose-300 dark:hover:border-rose-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-bold text-lg ${
                  formData.killipClass === option.value 
                    ? 'text-rose-700 dark:text-rose-300' 
                    : 'text-gray-800 dark:text-gray-200'
                }`}>
                  {option.label}
                </h4>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  formData.killipClass === option.value
                    ? 'border-rose-500 bg-rose-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {formData.killipClass === option.value && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              <p className={`text-sm ${
                formData.killipClass === option.value 
                  ? 'text-rose-600 dark:text-rose-300' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {option.description}
              </p>
              {formData.killipClass === option.value && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 animate-pulse pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Clinical Risk Factors */}
      <div>
        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
          {t('calculators.cardiology.grace.high_risk_features')}
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Cardiac Arrest */}
          <label className="group cursor-pointer">
            <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
              formData.cardiacArrest
                ? 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 shadow-xl shadow-red-500/20'
                : 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:border-red-300 dark:hover:border-red-600'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <Zap className={`w-6 h-6 ${
                  formData.cardiacArrest ? 'text-red-600 dark:text-red-400' : 'text-gray-400'
                }`} />
                <input
                  type="checkbox"
                  checked={formData.cardiacArrest}
                  onChange={(e) => setFormData({ ...formData, cardiacArrest: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                  formData.cardiacArrest
                    ? 'border-red-500 bg-red-500 shadow-lg shadow-red-500/30'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}>
                  {formData.cardiacArrest && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              <h5 className={`font-semibold mb-2 ${
                formData.cardiacArrest ? 'text-red-800 dark:text-red-200' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {t('calculators.cardiology.grace.cardiac_arrest_label')}
              </h5>
              <p className={`text-sm ${
                formData.cardiacArrest ? 'text-red-600 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {t('calculators.cardiology.grace.at_presentation')}
              </p>
              {formData.cardiacArrest && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 animate-pulse pointer-events-none" />
              )}
            </div>
          </label>

          {/* ST Deviation */}
          <label className="group cursor-pointer">
            <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
              formData.stDeviation
                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 shadow-xl shadow-purple-500/20'
                : 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:border-purple-300 dark:hover:border-purple-600'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <BarChart3 className={`w-6 h-6 ${
                  formData.stDeviation ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'
                }`} />
                <input
                  type="checkbox"
                  checked={formData.stDeviation}
                  onChange={(e) => setFormData({ ...formData, stDeviation: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                  formData.stDeviation
                    ? 'border-purple-500 bg-purple-500 shadow-lg shadow-purple-500/30'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}>
                  {formData.stDeviation && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              <h5 className={`font-semibold mb-2 ${
                formData.stDeviation ? 'text-purple-800 dark:text-purple-200' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {t('calculators.cardiology.grace.st_deviation_label')}
              </h5>
              <p className={`text-sm ${
                formData.stDeviation ? 'text-purple-600 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {t('calculators.cardiology.grace.on_initial_ecg')}
              </p>
              {formData.stDeviation && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 animate-pulse pointer-events-none" />
              )}
            </div>
          </label>

          {/* Elevated Cardiac Markers */}
          <label className="group cursor-pointer">
            <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
              formData.elevatedMarkers
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-xl shadow-green-500/20'
                : 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:border-green-300 dark:hover:border-green-600'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className={`w-6 h-6 ${
                  formData.elevatedMarkers ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                }`} />
                <input
                  type="checkbox"
                  checked={formData.elevatedMarkers}
                  onChange={(e) => setFormData({ ...formData, elevatedMarkers: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                  formData.elevatedMarkers
                    ? 'border-green-500 bg-green-500 shadow-lg shadow-green-500/30'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}>
                  {formData.elevatedMarkers && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              <h5 className={`font-semibold mb-2 ${
                formData.elevatedMarkers ? 'text-green-800 dark:text-green-200' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {t('calculators.cardiology.grace.elevated_markers_label')}
              </h5>
              <p className={`text-sm ${
                formData.elevatedMarkers ? 'text-green-600 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {t('calculators.cardiology.grace.troponin_ck_mb')}
              </p>
              {formData.elevatedMarkers && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse pointer-events-none" />
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-8">
        <button
          onClick={onBack}
          className="group relative px-8 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:border-gray-400 dark:hover:border-gray-500 transform hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-center space-x-2">
            <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>{t('calculators.cardiology.grace.back_to_demographics')}</span>
          </div>
        </button>

        <button
          onClick={onNext}
          className="group relative px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 transform hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-center space-x-2">
            <span>{t('calculators.cardiology.grace.calculate_risk_score')}</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    </div>
  );
};