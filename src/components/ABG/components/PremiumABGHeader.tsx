import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles,
  Brain,
  FileText
} from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

interface PremiumABGHeaderProps {
  // Optional className
  className?: string;
}

export const PremiumABGHeader: React.FC<PremiumABGHeaderProps> = ({
  className
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={cn("relative mb-6", className)}>
      {/* Aurora background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <div className="abg-hero-aurora" />
      </div>

      <div className="abg-card p-6 sm:p-8 rounded-2xl" data-tour="abg-header">
        {/* Top row: context + history button */}
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center gap-2 abg-hero-badge" data-tour="abg-ai-badge">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-medium text-slate-700">{t('abg.header.medicalGradeAI', 'Medical‑grade AI')}</span>
          </div>
          
          <Button
            onClick={() => navigate('/abg-history')}
            variant="outline"
            size="sm"
            data-tour="abg-history-button"
            className="
              relative group overflow-hidden
              bg-gradient-to-r from-blue-500 to-purple-600 
              hover:from-blue-600 hover:to-purple-700
              border-0 text-white
              shadow-lg hover:shadow-xl hover:shadow-blue-500/25
              transition-all duration-300 ease-in-out
              transform hover:scale-105 hover:-translate-y-0.5
              font-semibold tracking-wide
              px-4 py-2.5
              rounded-xl
              before:absolute before:inset-0 before:bg-gradient-to-r 
              before:from-white/20 before:to-transparent 
              before:opacity-0 before:transition-opacity before:duration-300
              hover:before:opacity-100
              after:absolute after:inset-0 after:rounded-xl 
              after:shadow-inner after:shadow-white/10
              focus:ring-2 focus:ring-purple-300 focus:ring-offset-2
              focus:outline-none
            "
            aria-label={t('abg.header.viewHistoryAria', 'View analysis history')}
          >
            <div className="relative z-10 flex items-center">
              <FileText className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
              <span className="relative">
                {t('abg.header.viewHistory', 'View History')}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-500 
                               transform translate-x-[-100%] group-hover:translate-x-[200%] 
                               transition-transform duration-700 ease-in-out skew-x-12 h-full w-8"></div>
              </span>
            </div>
          </Button>
        </div>

        {/* Title block */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-5">
          <div className="relative">
            <div className="abg-hero-icon">
              <Brain className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-purple-700 to-emerald-600 bg-clip-text text-transparent">
              {t('abg.header.title', 'Blood Gas Analysis')}
            </h1>
            <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {t('abg.header.subtitle', 'Upload a blood gas report for instant AI vision, verified interpretation, and a clinician‑ready action plan.')}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};