import React from 'react';
import { Heart, Check, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

interface GraceHeaderProps {
  currentStep: number;
}

export const GraceHeader: React.FC<GraceHeaderProps> = ({ currentStep }) => {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h1 className="text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-3 tracking-tight">
        {t('calculators.cardiology.grace.title')}
      </h1>
      <h2 className="text-2xl font-semibold text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)] mb-2">
        {t('calculators.cardiology.grace.subtitle')}
      </h2>
      <p className="text-lg text-[var(--foreground-secondary)] dark:text-[var(--foreground-secondary)] max-w-3xl mx-auto leading-relaxed mb-6">
        {t('calculators.cardiology.grace.description')}
      </p>
      
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500 ${
              step === currentStep
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-[var(--foreground)] shadow-xl shadow-blue-500/30 scale-110'
                : step < currentStep
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-[var(--foreground)] shadow-lg shadow-emerald-500/25'
                : 'bg-[var(--component-card)]/60 dark:bg-[var(--background)]/60 text-[var(--foreground-secondary)] backdrop-blur-sm border border-[var(--glass-border-light)]/50 dark:border-[var(--border-strong)]/50'
            }`}>
              {step < currentStep ? (
                <Check className="w-6 h-6" />
              ) : (
                <span>{step}</span>
              )}
              {step === currentStep && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-ping opacity-20" />
              )}
            </div>
            {step < 3 && (
              <ArrowRight className={`w-6 h-6 mx-3 transition-all duration-500 ${
                step < currentStep ? 'text-emerald-500' : 'text-[var(--foreground-secondary)] dark:text-[var(--foreground-tertiary)]'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};