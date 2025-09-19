import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Upload, 
  Search, 
  Brain, 
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  Activity
} from 'lucide-react';
import { WorkflowStep } from '../../../types/abg';
import { cn } from '../../../lib/utils';

interface PremiumWorkflowProgressProps {
  currentStep: WorkflowStep;
  progress: number;
  error?: boolean;
  processingStatus?: string;
  className?: string;
}

interface StepConfig {
  step: WorkflowStep;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  gradient: string;
}

const steps: StepConfig[] = [
  {
    step: WorkflowStep.UPLOAD,
    label: 'Upload',
    icon: Upload,
    description: 'Select blood gas report',
    color: 'from-[#2b6cb0] to-[#90cdf4]',
    gradient: 'bg-gradient-to-br from-[#2b6cb0] to-[#90cdf4]'
  },
  {
    step: WorkflowStep.ANALYSIS,
    label: 'Analysis',
    icon: Search,
    description: 'AI vision processing',
    color: 'from-[#1a365d] to-[#63b3ed]',
    gradient: 'bg-gradient-to-br from-[#1a365d] to-[#63b3ed]'
  },
  {
    step: WorkflowStep.INTERPRETATION,
    label: 'Interpretation',
    icon: Brain,
    description: 'Clinical analysis',
    color: 'from-[#63b3ed] to-[#90cdf4]',
    gradient: 'bg-gradient-to-br from-[#63b3ed] to-[#90cdf4]'
  },
  {
    step: WorkflowStep.ACTION_PLAN,
    label: 'Action Plan',
    icon: ClipboardList,
    description: 'Treatment recommendations',
    color: 'from-[#2b6cb0] to-[#1a365d]',
    gradient: 'bg-gradient-to-br from-[#2b6cb0] to-[#1a365d]'
  }
];

export const PremiumWorkflowProgress: React.FC<PremiumWorkflowProgressProps> = ({
  currentStep,
  progress,
  error,
  processingStatus,
  className
}) => {
  const { t } = useTranslation();
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([]);
  const [isHovering, setIsHovering] = useState<number | null>(null);

  useEffect(() => {
    // Animate progress bar
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  useEffect(() => {
    // Stagger step animations
    steps.forEach((_, index) => {
      setTimeout(() => {
        setVisibleSteps(prev => {
          const updated = [...prev];
          updated[index] = true;
          return updated;
        });
      }, index * 150);
    });
  }, []);

  const getStepIndex = (step: WorkflowStep): number => {
    if (step === WorkflowStep.COMPLETED) return steps.length;
    return steps.findIndex(s => s.step === step);
  };

  const currentStepIndex = getStepIndex(currentStep);

  const getStepStatus = (index: number): 'completed' | 'current' | 'upcoming' | 'error' => {
    if (error && index === currentStepIndex) return 'error';
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'upcoming';
  };

  const renderStepIcon = (step: StepConfig, status: string) => {
    const Icon = step.icon;
    
    if (status === 'completed') {
      return (
        <div className="relative">
          <CheckCircle2 className="h-6 w-6 text-white drop-shadow-sm" />
          <div className="absolute inset-0 rounded-full bg-[#63b3ed] opacity-20 animate-ping" />
        </div>
      );
    }
    
    if (status === 'error') {
      return (
        <div className="relative">
          <AlertCircle className="h-6 w-6 text-white drop-shadow-sm" />
          <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-pulse" />
        </div>
      );
    }

    if (status === 'current') {
      return (
        <div className="relative">
          <Icon className="h-6 w-6 text-white drop-shadow-sm animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping" />
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse" />
        </div>
      );
    }
    
    return (
      <Icon className="h-6 w-6 text-slate-400 transition-colors duration-300" />
    );
  };

  const getStepText = (step: WorkflowStep): { label: string; description: string } => {
    switch (step) {
      case WorkflowStep.UPLOAD:
        return {
          label: t('abg.workflow.steps.upload.label', 'Upload'),
          description: t('abg.workflow.steps.upload.description', 'Select blood gas report')
        };
      case WorkflowStep.ANALYSIS:
        return {
          label: t('abg.workflow.steps.analysis.label', 'Analysis'),
          description: t('abg.workflow.steps.analysis.description', 'AI vision processing')
        };
      case WorkflowStep.INTERPRETATION:
        return {
          label: t('abg.workflow.steps.interpretation.label', 'Interpretation'),
          description: t('abg.workflow.steps.interpretation.description', 'Clinical analysis')
        };
      case WorkflowStep.ACTION_PLAN:
        return {
          label: t('abg.workflow.steps.actionPlan.label', 'Action Plan (Optional)'),
          description: t('abg.workflow.steps.actionPlan.description', '')
        };
      default:
        return { label: '', description: '' };
    }
  };

  const getConnectorStatus = (index: number): string => {
    if (index >= currentStepIndex) return 'upcoming';
    if (index === currentStepIndex - 1) return 'current';
    return 'completed';
  };

  return (
    <div className={cn("abg-premium relative py-6", className)} data-tour="abg-workflow">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(1200px_200px_at_50%_-20%,rgba(43,108,176,0.08),transparent),radial-gradient(1200px_200px_at_50%_100%,rgba(99,179,237,0.06),transparent)]" />
      
      {/* Main Progress Container */}
      <div className="relative" aria-live="polite" data-tour="abg-progress-tracker">
        {/* Accessible progress semantics */}
        <div role="progressbar" aria-valuenow={Math.round(animatedProgress)} aria-valuemin={0} aria-valuemax={100} aria-label={t('abg.workflow.aria.progress', 'Blood gas analysis progress')} className="sr-only">
          {t('abg.workflow.progressComplete', '{{percent}}% Complete', { percent: Math.round(animatedProgress) })}
        </div>

        {/* Overall Progress Track */}
        <div className="absolute top-14 left-6 right-6 h-2 rounded-full backdrop-blur supports-[backdrop-filter]:bg-white/40 bg-white/70 border border-white/50 shadow-sm">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-200/60 via-slate-200/40 to-slate-200/60" />

          {/* Filled portion */}
          <div
            className={cn(
              "relative h-full rounded-full transition-all duration-1000 ease-out",
              "bg-gradient-to-r from-[#2b6cb0] via-[#1a365d] to-[#63b3ed]"
            )}
            style={{ width: `${animatedProgress}%` }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/50 to-white/0 opacity-40 motion-safe:animate-pulse" />
          </div>

          {/* Progress orb */}
          <div
            className={cn(
              "absolute -top-1.5 h-5 w-5 rounded-full shadow-lg",
              "bg-white ring-4 ring-white/70",
              "transition-all duration-700 ease-out"
            )}
            style={{ left: `calc(${animatedProgress}% - 10px)` }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2b6cb0] via-[#1a365d] to-[#63b3ed]" />
            <div className="pointer-events-none absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping bg-[#90cdf4]" />
          </div>
        </div>

        {/* Steps Container */}
        <div className="relative flex justify-between items-start px-6">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isVisible = visibleSteps[index];
            
            return (
              <div 
                key={step.step}
                className={cn(
                  "flex flex-col items-center transition-all duration-500 transform",
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                  status === 'current' && "scale-105"
                )}
                style={{ transitionDelay: `${index * 150}ms` }}
                onMouseEnter={() => setIsHovering(index)}
                onMouseLeave={() => setIsHovering(null)}
              >
                {/* Step Circle */}
                <div className={cn(
                  "relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl",
                  "border-2 backdrop-blur supports-[backdrop-filter]:bg-white/40 bg-white/70",
                  status === 'completed' && "bg-gradient-to-br from-[#63b3ed] to-[#2b6cb0] border-[#90cdf4] shadow-[#90cdf4]/30",
                  status === 'current' && `${step.gradient} border-white shadow-2xl`,
                  status === 'upcoming' && "border-slate-300 shadow-slate-200",
                  status === 'error' && "bg-gradient-to-br from-red-500 to-red-600 border-red-300 shadow-red-200",
                  status === 'current' && "animate-pulse"
                )}>
                  <span className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-white shadow-md bg-slate-900/70">{index + 1}</span>
                  {renderStepIcon(step, status)}
                  
                  {/* Glow Effect for Current Step */}
                  {status === 'current' && (
                    <div className={cn(
                      "absolute inset-0 rounded-2xl opacity-30 animate-pulse",
                      step.gradient
                    )} />
                  )}

                  {/* Hover highlight */}
                  {isHovering === index && status === 'upcoming' && (
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-slate-300/70" />
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "absolute top-8 left-16 w-full h-0.5 transition-all duration-500",
                    getConnectorStatus(index) === 'completed' && "bg-gradient-to-r from-[#63b3ed] to-[#2b6cb0]",
                    getConnectorStatus(index) === 'current' && "bg-gradient-to-r from-[#2b6cb0] to-slate-300",
                    getConnectorStatus(index) === 'upcoming' && "bg-slate-300"
                  )} />
                )}

                {/* Step Content */}
                <div className="mt-3 text-center max-w-[130px]">
                  <h4 className={cn(
                    "text-[13px] font-semibold transition-colors duration-300 mb-1",
                    status === 'completed' && "text-[#2b6cb0]",
                    status === 'current' && "text-slate-900",
                    status === 'upcoming' && "text-slate-500",
                    status === 'error' && "text-red-700"
                  )}>
                    {getStepText(step.step).label}
                  </h4>
                  <p className={cn(
                    "text-[11px] transition-colors duration-300 leading-relaxed",
                    status === 'completed' && "text-[#63b3ed]",
                    status === 'current' && "text-slate-600",
                    status === 'upcoming' && "text-slate-400",
                    status === 'error' && "text-red-600"
                  )}>
                    {getStepText(step.step).description}
                  </p>
                </div>

                {/* Status Indicator */}
                {status === 'current' && processingStatus && (
                  <div className="mt-2 px-3 py-1 bg-white/80 backdrop-blur-sm border border-white/20 rounded-full">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-[#2b6cb0] animate-pulse" />
                      <span className="text-xs font-medium text-slate-700">
                        {processingStatus}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion State */}
        {currentStep === WorkflowStep.COMPLETED && (
            <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#63b3ed] to-[#2b6cb0] text-white rounded-2xl shadow-lg">
              <CheckCircle2 className="h-6 w-6" />
                <span className="font-semibold">{t('abg.workflow.completeTitle', 'Analysis Complete!')}</span>
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
            <div className="mt-5 flex justify-center">
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-lg">
              <AlertCircle className="h-6 w-6" />
                <span className="font-semibold">{t('abg.workflow.error', 'Processing Error')}</span>
            </div>
          </div>
        )}

        {/* Progress Percentage */}
        <div className="mt-5 flex justify-center">
          <div className="px-3.5 py-1.5 bg-white/80 backdrop-blur-sm supports-[backdrop-filter]:bg-white/60 border border-white/40 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] rounded-full animate-pulse" />
              <span className="text-[13px] font-medium text-slate-700">
                {t('abg.workflow.progressComplete', '{{percent}}% Complete', { percent: Math.round(animatedProgress) })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};