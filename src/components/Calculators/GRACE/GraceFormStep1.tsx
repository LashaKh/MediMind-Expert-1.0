import React, { useCallback, useMemo } from 'react';
import { User, Activity, Thermometer, Droplets, AlertCircle, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { GRACEFormData } from '../../../utils/grace2Validator';

interface GraceFormStep1Props {
  formData: GRACEFormData;
  setFormData: (data: GRACEFormData) => void;
  errors: Record<string, string>;
  onNext: () => void;
}

const GraceFormStep1Component: React.FC<GraceFormStep1Props> = ({
  formData,
  setFormData,
  errors,
  onNext
}) => {
  const { t } = useTranslation();

  const isStepComplete = useMemo(
    () => formData.age && formData.heartRate && formData.systolicBP && formData.creatinine,
    [formData.age, formData.heartRate, formData.systolicBP, formData.creatinine]
  );

  const handleAgeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, age: e.target.value });
    },
    [formData, setFormData]
  );

  const handleHeartRateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, heartRate: e.target.value });
    },
    [formData, setFormData]
  );

  const handleSystolicBPChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, systolicBP: e.target.value });
    },
    [formData, setFormData]
  );

  const handleCreatinineChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, creatinine: e.target.value });
    },
    [formData, setFormData]
  );

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/25 mb-6 group hover:scale-105 transition-all duration-300">
          <User className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-3">
          {t('calculators.cardiology.grace.demographics_section')}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          {t('calculators.cardiology.grace.baseline_patient_info')}
        </p>
      </div>

      {/* Advanced Input Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Age Input */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <User className="w-4 h-4 mr-2 text-blue-500" />
            {t('calculators.cardiology.grace.age_label')}
          </label>
          <div className="relative">
            <input
              type="number"
              min={18}
              max={120}
              value={formData.age}
              onChange={handleAgeChange}
              className="w-full px-6 py-4 text-lg font-semibold bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500 hover:bg-white/80 dark:hover:bg-gray-800/80 group-hover:shadow-lg"
              placeholder={t('calculators.cardiology.grace.age_placeholder')}
            />
            {errors.age && (
              <div className="absolute inset-0 rounded-2xl border-2 border-red-500 animate-pulse pointer-events-none" />
            )}
          </div>
          {errors.age && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.age}
            </p>
          )}
        </div>

        {/* Heart Rate Input */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-red-500" />
            {t('calculators.cardiology.grace.heart_rate_label')}
          </label>
          <div className="relative">
            <input
              type="number"
              min={30}
              max={300}
              value={formData.heartRate}
              onChange={handleHeartRateChange}
              className="w-full px-6 py-4 text-lg font-semibold bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500 hover:bg-white/80 dark:hover:bg-gray-800/80 group-hover:shadow-lg"
              placeholder={t('calculators.cardiology.grace.heart_rate_placeholder')}
            />
            {errors.heartRate && (
              <div className="absolute inset-0 rounded-2xl border-2 border-red-500 animate-pulse pointer-events-none" />
            )}
          </div>
          {errors.heartRate && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.heartRate}
            </p>
          )}
        </div>

        {/* Systolic BP Input */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Thermometer className="w-4 h-4 mr-2 text-orange-500" />
            {t('calculators.cardiology.grace.systolic_bp_label')}
          </label>
          <div className="relative">
            <input
              type="number"
              min={60}
              max={300}
              value={formData.systolicBP}
              onChange={handleSystolicBPChange}
              className="w-full px-6 py-4 text-lg font-semibold bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500 hover:bg-white/80 dark:hover:bg-gray-800/80 group-hover:shadow-lg"
              placeholder={t('calculators.cardiology.grace.systolic_bp_placeholder')}
            />
            {errors.systolicBP && (
              <div className="absolute inset-0 rounded-2xl border-2 border-red-500 animate-pulse pointer-events-none" />
            )}
          </div>
          {errors.systolicBP && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.systolicBP}
            </p>
          )}
        </div>

        {/* Creatinine Input */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Droplets className="w-4 h-4 mr-2 text-cyan-500" />
            {t('calculators.cardiology.grace.creatinine_label')}
          </label>
          <div className="relative">
            <input
              type="number"
              step={0.1}
              min={0.3}
              max={15.0}
              value={formData.creatinine}
              onChange={handleCreatinineChange}
              className="w-full px-6 py-4 text-lg font-semibold bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500 hover:bg-white/80 dark:hover:bg-gray-800/80 group-hover:shadow-lg"
              placeholder={t('calculators.cardiology.grace.creatinine_placeholder')}
            />
            {errors.creatinine && (
              <div className="absolute inset-0 rounded-2xl border-2 border-red-500 animate-pulse pointer-events-none" />
            )}
          </div>
          {errors.creatinine && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.creatinine}
            </p>
          )}
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-center pt-8">
        <button
          onClick={onNext}
          disabled={!isStepComplete}
          className="group relative px-12 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <div className="flex items-center space-x-2">
            <span>{t('calculators.cardiology.grace.continue_to_clinical_data')}</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const GraceFormStep1 = React.memo(GraceFormStep1Component, (prevProps, nextProps) => {
  // Custom comparison for medical data precision
  return (
    prevProps.formData.age === nextProps.formData.age &&
    prevProps.formData.heartRate === nextProps.formData.heartRate &&
    prevProps.formData.systolicBP === nextProps.formData.systolicBP &&
    prevProps.formData.creatinine === nextProps.formData.creatinine &&
    JSON.stringify(prevProps.errors) === JSON.stringify(nextProps.errors)
  );
});