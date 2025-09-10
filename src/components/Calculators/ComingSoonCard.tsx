import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from '../../hooks/useTranslation';

interface ComingSoonCardProps {
  title: string;
  description: string;
  phase: string;
}

export const ComingSoonCard = React.memo<ComingSoonCardProps>(({
  title,
  description,
  phase
}) => {
  const { t } = useTranslation();

  return (
    <Card className="relative opacity-75 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/30 border-2 border-dashed border-[var(--glass-border-medium)] dark:border-[var(--border-strong)] rounded-2xl overflow-hidden hover:opacity-90 transition-opacity duration-300 cursor-default">
      {/* Mobile-first responsive header */}
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center space-x-3 text-base sm:text-lg">
          <div className="p-2 sm:p-3 bg-[var(--component-surface-tertiary)] dark:bg-[var(--card)] rounded-xl">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--foreground-secondary)]" />
          </div>
          <span className="text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)] font-bold leading-tight">{title}</span>
        </CardTitle>
        <CardDescription className="text-sm text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)] leading-relaxed mt-2">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0">
        {/* Mobile-optimized layout */}
        <div className="space-y-4">
          {/* Phase and status indicators */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center px-3 py-2 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 min-h-[44px]">
              <Clock className="w-3 h-3 mr-1" />
              {phase}
            </div>
            <div className="flex items-center text-sm text-[var(--foreground-secondary)] dark:text-[var(--foreground-secondary)] min-h-[44px]">
              <span className="font-semibold">{t('calculators.coming_soon')}</span>
              <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />
            </div>
          </div>
          
          {/* Enhanced info section with better mobile spacing */}
          <div className="p-4 bg-gradient-to-r from-gray-100/80 to-gray-200/50 dark:from-gray-700/50 dark:to-gray-600/30 rounded-xl border border-[var(--glass-border-light)]/50 dark:border-[var(--border-strong)]/30">
            <p className="text-sm text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)] leading-relaxed">
              {t('calculators.coming_soon_description')}
            </p>
          </div>
          
          {/* Visual indicator for development progress */}
          <div className="flex items-center justify-center py-2">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-[var(--cardiology-accent-blue)] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[var(--cardiology-accent-blue)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-[var(--cardiology-accent-blue)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Add display name for better debugging
ComingSoonCard.displayName = 'ComingSoonCard'; 