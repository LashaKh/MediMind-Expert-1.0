import React from 'react';
import { Heart, Check, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { getCategoryIconClass, getSpecialtyGradientClass } from '../../../utils/calculatorTheme';
import { MedicalSpecialty } from '../../../stores/useAppStore';

interface GraceHeaderProps {
  currentStep: number;
}

export const GraceHeader: React.FC<GraceHeaderProps> = ({ currentStep }) => {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h1 className="text-6xl font-black bg-gradient-to-r from-gray-900 via-calc-theme-primary to-calc-theme-secondary dark:from-white dark:via-calc-theme-light dark:to-calc-theme-accent bg-clip-text text-transparent mb-3 tracking-tight">
        {t('calculators.cardiology.grace.title')}
      </h1>
      <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
        {t('calculators.cardiology.grace.subtitle')}
      </h2>
      <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6">
        {t('calculators.cardiology.grace.description')}
      </p>
      
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500 ${
              step === currentStep
                ? 'bg-gradient-to-br from-calc-theme-secondary to-calc-theme-primary text-white shadow-xl shadow-calc-theme-secondary/30 scale-110'
                : step < currentStep
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-white/60 dark:bg-gray-800/60 text-gray-400 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50'
            }`}>
              {step < currentStep ? (
                <Check className="w-6 h-6" />
              ) : (
                <span>{step}</span>
              )}
              {step === currentStep && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-calc-theme-secondary to-calc-theme-primary animate-ping opacity-20" />
              )}
            </div>
            {step < 3 && (
              <ArrowRight className={`w-6 h-6 mx-3 transition-all duration-500 ${
                step < currentStep ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};