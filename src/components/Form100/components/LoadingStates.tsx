// Loading States and Progress Indicators for Form 100
// Medical-themed loading animations with progress tracking
// Optimized for mobile with accessibility support
// Performance-aware animations with device capability detection

import React from 'react';
import {
  Loader2,
  FileText,
  Stethoscope,
  Heart,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { usePerformanceMode } from '../../../contexts/PerformanceModeContext';

// Loading state types
interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

interface ProgressIndicatorProps extends LoadingStateProps {
  progress: number; // 0-100
  stage?: string;
  showPercentage?: boolean;
}

interface FormGenerationProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
  isGenerating: boolean;
  error?: string;
  className?: string;
}

// Basic loading spinner with medical theme - Performance aware
export const MedicalLoadingSpinner: React.FC<LoadingStateProps> = ({
  size = 'md',
  className,
  message = 'Loading...'
}) => {
  const { performanceMode } = usePerformanceMode();

  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  // Performance-aware animation classes
  const shouldShowPingEffect = performanceMode === 'full';
  const shouldAnimateText = performanceMode !== 'lite';

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <div className="relative">
        {/* Spinner always animates - essential UX feedback */}
        <Loader2 className={cn('animate-spin text-blue-600', sizeStyles[size])} />
        {/* Ping effect only on high-performance devices */}
        {shouldShowPingEffect && (
          <div className="absolute inset-0 animate-ping">
            <div className={cn('rounded-full bg-blue-400/30', sizeStyles[size])} />
          </div>
        )}
      </div>
      {message && (
        <p className={cn(
          'text-sm text-gray-600 font-medium',
          shouldAnimateText && 'animate-pulse'
        )}>
          {message}
        </p>
      )}
    </div>
  );
};

// Form 100 generation specific loader - Performance aware
export const Form100GenerationLoader: React.FC<LoadingStateProps> = ({
  size = 'md',
  className,
  message = 'Generating Form 100...'
}) => {
  const { performanceMode } = usePerformanceMode();

  // Performance-aware features
  const shouldShowIconAnimation = performanceMode !== 'lite';
  const shouldShowDots = performanceMode !== 'lite';
  const shouldAnimateSparkles = performanceMode === 'full';

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 p-6', className)}>
      {/* Medical icon animation - spinner always works */}
      <div className="relative">
        <div className="absolute inset-0 animate-spin">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full" />
        </div>
        <div className="w-16 h-16 flex items-center justify-center">
          <FileText className={cn(
            'w-8 h-8 text-blue-600',
            shouldShowIconAnimation && 'animate-pulse'
          )} />
        </div>
      </div>

      {/* Status message */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center space-x-2">
          <Sparkles className={cn(
            'w-5 h-5 text-blue-500',
            shouldAnimateSparkles && 'animate-bounce'
          )} />
          <span>AI Processing</span>
        </h3>
        <p className="text-sm text-gray-600">{message}</p>
      </div>

      {/* Animated dots - optional on low-end devices */}
      {shouldShowDots && (
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Progress indicator with stages
export const Form100ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  stage = 'Processing...',
  showPercentage = true,
  className
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {/* Shimmer effect */}
        <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
      
      {/* Status info */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 font-medium">{stage}</span>
        {showPercentage && (
          <span className="text-blue-600 font-bold">{Math.round(progress)}%</span>
        )}
      </div>
    </div>
  );
};

// Comprehensive form generation progress tracker
export const FormGenerationProgress: React.FC<FormGenerationProgressProps> = ({
  currentStep,
  totalSteps,
  stepNames,
  isGenerating,
  error,
  className
}) => {
  const progressPercentage = ((currentStep - 1) / totalSteps) * 100;

  return (
    <div className={cn('space-y-6 p-6 bg-gray-50 rounded-lg border', className)}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        {error ? (
          <AlertCircle className="w-6 h-6 text-red-500" />
        ) : isGenerating ? (
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        ) : (
          <CheckCircle className="w-6 h-6 text-green-500" />
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {error ? 'Generation Failed' : isGenerating ? 'Generating Form 100' : 'Generation Complete'}
          </h3>
          <p className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Progress steps */}
      <div className="space-y-4">
        {stepNames.map((stepName, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex items-center space-x-3">
              {/* Step indicator */}
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200',
                isCompleted && 'bg-green-500 text-white',
                isCurrent && isGenerating && 'bg-blue-500 text-white animate-pulse',
                isCurrent && !isGenerating && !error && 'bg-blue-500 text-white',
                isCurrent && error && 'bg-red-500 text-white',
                isUpcoming && 'bg-gray-200 text-gray-500'
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isCurrent && isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrent && error ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </div>

              {/* Step name */}
              <div className="flex-1">
                <p className={cn(
                  'text-sm font-medium',
                  isCompleted && 'text-green-700',
                  isCurrent && 'text-blue-700',
                  isUpcoming && 'text-gray-500'
                )}>
                  {stepName}
                </p>
              </div>

              {/* Step status icon */}
              <div className="w-5 h-5">
                {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                {isCurrent && isGenerating && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                {isCurrent && error && <AlertCircle className="w-5 h-5 text-red-500" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Overall Progress</span>
          <span className="text-blue-600 font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Medical-themed skeleton loader
export const Form100SkeletonLoader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-4 animate-pulse', className)}>
      {/* Header skeleton */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-48" />
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
      </div>

      {/* Form fields skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Button skeleton */}
      <div className="flex space-x-3">
        <div className="h-10 bg-gray-200 rounded w-24" />
        <div className="h-10 bg-gray-200 rounded w-32" />
      </div>
    </div>
  );
};

// Loading overlay for form interactions - Performance aware
export const Form100LoadingOverlay: React.FC<{
  isVisible: boolean;
  message?: string;
  progress?: number;
  onCancel?: () => void;
}> = ({ isVisible, message = 'Processing...', progress, onCancel }) => {
  const { performanceMode } = usePerformanceMode();

  if (!isVisible) return null;

  // Performance-aware features
  const shouldUseBackdropBlur = performanceMode === 'full';
  const shouldAnimateHeart = performanceMode !== 'lite';

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      shouldUseBackdropBlur ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/70'
    )}>
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4 space-y-6 shadow-xl">
        {/* Medical animation - spinner always works */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className={cn(
                'w-6 h-6 text-blue-600',
                shouldAnimateHeart && 'animate-pulse'
              )} />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{Math.round(progress)}% complete</p>
            </div>
          )}
        </div>

        {/* Cancel button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// Export all loading components
export {
  MedicalLoadingSpinner,
  Form100GenerationLoader,
  Form100ProgressIndicator,
  FormGenerationProgress,
  Form100SkeletonLoader,
  Form100LoadingOverlay
};