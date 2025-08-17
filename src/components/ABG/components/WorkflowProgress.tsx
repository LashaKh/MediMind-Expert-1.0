import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Upload, 
  Search, 
  Brain, 
  ClipboardList,
  CheckCircle2,
  Circle,
  AlertCircle,
  FileText,
  Stethoscope
} from 'lucide-react';
import { WorkflowStep } from '../../../types/abg';
import { cn } from '../../../lib/utils';

interface WorkflowProgressProps {
  currentStep: WorkflowStep;
  progress: number;
  error?: boolean;
  // New props for unified workflow
  unifiedPhase?: 'extraction' | 'interpretation' | 'complete' | null;
  currentTask?: string;
  showSubPhases?: boolean;
}

interface StepConfig {
  step: WorkflowStep;
  label: string;
  icon: React.ElementType;
  description: string;
}

const steps: StepConfig[] = [
  {
    step: WorkflowStep.UPLOAD,
    label: 'Upload',
    icon: Upload,
    description: 'Select blood gas report image'
  },
  {
    step: WorkflowStep.ANALYSIS,
    label: 'Analysis',
    icon: Search,
    description: 'Extract data from image'
  },
  {
    step: WorkflowStep.INTERPRETATION,
    label: 'Interpretation',
    icon: Brain,
    description: 'Clinical interpretation'
  },
  {
    step: WorkflowStep.ACTION_PLAN,
    label: 'Action Plan',
    icon: ClipboardList,
    description: 'Treatment recommendations'
  }
];

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  currentStep,
  progress,
  error,
  unifiedPhase,
  currentTask,
  showSubPhases = false
}) => {
  const { t } = useTranslation();
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

  const getStepIcon = (step: StepConfig, status: string) => {
    const Icon = step.icon;
    
    if (status === 'completed') {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    
    if (status === 'error') {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
    
    return (
      <div className={cn(
        "relative flex items-center justify-center",
        status === 'current' && "animate-pulse"
      )}>
        <Circle className={cn(
          "h-8 w-8 absolute",
          status === 'current' ? "text-primary" : "text-gray-300"
        )} />
        <Icon className={cn(
          "h-4 w-4 z-10",
          status === 'current' ? "text-primary" : "text-gray-400"
        )} />
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Progress Bar Background */}
      <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full" />
      
      {/* Progress Bar Fill */}
      <div 
        className="absolute top-8 left-0 h-1 bg-primary rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const label =
            step.step === WorkflowStep.UPLOAD ? t('abg.workflow.steps.upload.label', 'Upload') :
            step.step === WorkflowStep.ANALYSIS ? t('abg.workflow.steps.analysis.label', 'Analysis') :
            step.step === WorkflowStep.INTERPRETATION ? t('abg.workflow.steps.interpretation.label', 'Interpretation') :
            step.step === WorkflowStep.ACTION_PLAN ? t('abg.workflow.steps.actionPlan.label', 'Action Plan') : step.label;
          const description =
            step.step === WorkflowStep.UPLOAD ? t('abg.workflow.steps.upload.description', 'Select blood gas report image') :
            step.step === WorkflowStep.ANALYSIS ? t('abg.workflow.steps.analysis.description', 'Extract data from image') :
            step.step === WorkflowStep.INTERPRETATION ? t('abg.workflow.steps.interpretation.description', 'Clinical interpretation') :
            step.step === WorkflowStep.ACTION_PLAN ? t('abg.workflow.steps.actionPlan.description', 'Treatment recommendations') : step.description;
          
          return (
            <div 
              key={step.step}
              className={cn(
                "flex flex-col items-center",
                "flex-1",
                index === 0 && "items-start",
                index === steps.length - 1 && "items-end"
              )}
            >
              {/* Step Icon */}
              <div className={cn(
                "relative z-10 flex items-center justify-center w-16 h-16 rounded-full",
                "bg-background border-2 transition-colors duration-300",
                status === 'completed' && "border-green-600 bg-green-50",
                status === 'current' && "border-primary bg-primary/10",
                status === 'upcoming' && "border-gray-300",
                status === 'error' && "border-red-600 bg-red-50"
              )}>
                {getStepIcon(step, status)}
              </div>

              {/* Step Label */}
              <div className={cn(
                "mt-3 text-center",
                index === 0 && "text-left",
                index === steps.length - 1 && "text-right"
              )}>
                <h4 className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  status === 'completed' && "text-green-700",
                  status === 'current' && "text-primary",
                  status === 'upcoming' && "text-gray-400",
                  status === 'error' && "text-red-700"
                )}>
                  {label}
                </h4>
                <p className={cn(
                  "text-xs mt-0.5 max-w-[120px]",
                  status === 'completed' && "text-green-600",
                  status === 'current' && "text-muted-foreground",
                  status === 'upcoming' && "text-gray-400",
                  status === 'error' && "text-red-600"
                  )}>
                    {description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified Workflow Sub-phases */}
      {showSubPhases && unifiedPhase && currentStep === WorkflowStep.ANALYSIS && (
        <div className="mt-6 bg-muted/30 p-4 rounded-lg">
          <div className="flex items-center justify-center gap-6">
            {/* Extraction Phase */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                unifiedPhase === 'extraction' ? "border-primary bg-primary/10" : 
                unifiedPhase === 'interpretation' || unifiedPhase === 'complete' ? "border-green-600 bg-green-50" : "border-gray-300"
              )}>
                {unifiedPhase === 'interpretation' || unifiedPhase === 'complete' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <FileText className={cn(
                    "h-4 w-4",
                    unifiedPhase === 'extraction' ? "text-primary" : "text-gray-400"
                  )} />
                )}
              </div>
              <span className={cn(
                "text-sm font-medium",
                unifiedPhase === 'extraction' ? "text-primary" :
                unifiedPhase === 'interpretation' || unifiedPhase === 'complete' ? "text-green-700" : "text-gray-400"
              )}>
                {t('abg.workflow.subphases.extraction', 'Text Extraction')}
              </span>
            </div>

            {/* Progress Arrow */}
            <div className="flex-1 h-px bg-gray-300 relative">
              <div 
                className="absolute left-0 top-0 h-px bg-primary transition-all duration-300"
                style={{ width: unifiedPhase === 'extraction' ? '50%' : unifiedPhase === 'interpretation' || unifiedPhase === 'complete' ? '100%' : '0%' }}
              />
            </div>

            {/* Interpretation Phase */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                unifiedPhase === 'interpretation' ? "border-primary bg-primary/10" :
                unifiedPhase === 'complete' ? "border-green-600 bg-green-50" : "border-gray-300"
              )}>
                {unifiedPhase === 'complete' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Stethoscope className={cn(
                    "h-4 w-4",
                    unifiedPhase === 'interpretation' ? "text-primary" : "text-gray-400"
                  )} />
                )}
              </div>
              <span className={cn(
                "text-sm font-medium",
                unifiedPhase === 'interpretation' ? "text-primary" :
                unifiedPhase === 'complete' ? "text-green-700" : "text-gray-400"
              )}>
                {t('abg.workflow.subphases.interpretation', 'Clinical Analysis')}
              </span>
            </div>
          </div>
          
          {/* Current Task Display */}
          {currentTask && (
            <div className="mt-3 text-center">
              <span className="text-xs text-muted-foreground">{currentTask}</span>
            </div>
          )}
        </div>
      )}

      {/* Completed State */}
      {currentStep === WorkflowStep.COMPLETED && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            <span className="font-medium">{t('abg.workflow.completeTitle', 'Analysis Complete!')}</span>
          </div>
        </div>
      )}
    </div>
  );
};