import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Activity,
  Stethoscope,
  Pill,
  Monitor,
  TrendingUp,
  Target,
  Calendar,
  Bell,
  ArrowRight,
  Download,
  Share2,
  Printer,
  Loader2,
  Zap,
  Star,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ClinicalActionPlanDisplay } from '../../AICopilot/ClinicalActionPlanDisplay';
import { ActionPlanSelector } from './ActionPlanSelector';
import { PremiumAIClinicalConsultationButton } from './PremiumAIClinicalConsultationButton';
import { ABGResult } from '../../../types/abg';

interface ActionItem {
  id: string;
  category: 'immediate' | 'monitoring' | 'medication' | 'diagnostic' | 'followup';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeframe: string;
  responsible?: string;
  completed?: boolean;
}

interface ActionPlanData {
  immediateActions?: ActionItem[];
  monitoringPlan?: ActionItem[];
  medications?: ActionItem[];
  diagnosticTests?: ActionItem[];
  followupCare?: ActionItem[];
  overallPriority?: 'critical' | 'high' | 'medium' | 'low';
  estimatedDuration?: string;
  clinicalGoals?: string[];
}

interface PremiumActionPlanResultsProps {
  actionPlan?: ActionPlanData | string; // Allow both structured data and raw string
  isLoading?: boolean;
  error?: string;
  onActionComplete?: (actionId: string) => void;
  className?: string;
  // ABG Result for AI consultation
  abgResult?: ABGResult;
}

const categoryConfig = {
  immediate: {
    label: 'Immediate Actions',
    icon: AlertTriangle,
    gradient: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Critical interventions requiring immediate attention'
  },
  monitoring: {
    label: 'Monitoring Plan',
    icon: Monitor,
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Ongoing monitoring and assessment requirements'
  },
  medication: {
    label: 'Medications',
    icon: Pill,
    gradient: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Pharmaceutical interventions and adjustments'
  },
  diagnostic: {
    label: 'Diagnostic Tests',
    icon: Activity,
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Additional testing and laboratory work'
  },
  followup: {
    label: 'Follow-up Care',
    icon: Calendar,
    gradient: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Long-term care planning and follow-up'
  }
};

const priorityConfig = {
  critical: {
    label: 'Critical',
    gradient: 'from-red-500 to-red-600',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: AlertCircle
  },
  high: {
    label: 'High',
    gradient: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: AlertTriangle
  },
  medium: {
    label: 'Medium',
    gradient: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    icon: Clock
  },
  low: {
    label: 'Low',
    gradient: 'from-green-500 to-green-600',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: CheckCircle2
  }
};

export const PremiumActionPlanResults: React.FC<PremiumActionPlanResultsProps> = ({
  actionPlan,
  isLoading = false,
  error,
  onActionComplete,
  className,
  abgResult
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['immediate']));
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [showActionSelector, setShowActionSelector] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (actionPlan || isLoading) {
      setIsVisible(true);
      // For raw string action plan, expand first few sections by default
      if (typeof actionPlan === 'string') {
        setExpandedCategories(new Set(['action-section-0', 'action-section-1', 'action-section-2']));
      }
    }
  }, [actionPlan, isLoading]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleActionComplete = (actionId: string) => {
    setCompletedActions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(actionId)) {
        newSet.delete(actionId);
      } else {
        newSet.add(actionId);
      }
      return newSet;
    });
    
    if (onActionComplete) {
      onActionComplete(actionId);
    }
  };

  const handleSelectiveConsultation = () => {
    if (abgResult && abgResult.action_plan) {
      setShowActionSelector(true);
    }
  };

  const handleConsultWithSelectedItems = (selectedItems: string[]) => {
    setShowActionSelector(false);
    if (abgResult) {
      // Create a modified ABG result with selective action plan context
      const selectiveResult = {
        ...abgResult,
        action_plan: abgResult.action_plan + 
          `\n\n=== SELECTED FOR AI CONSULTATION ===\n` +
          `Selected Action Plans: ${selectedItems.join(', ')}\n` +
          `(Note: Full action plan available, consultation focused on selected items)`
      };

      // Navigate to AI Copilot in same tab with selective context and new session flag
      navigate('/ai-copilot', {
        state: {
          abgContext: selectiveResult,
          contextType: 'selective-action-plan',
          startNewSession: true // Flag to indicate we want a fresh chat session
        }
      });
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className={cn("abg-premium", className)}>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 rounded-2xl border border-white/20 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-blue-400/10 to-purple-400/10 animate-pulse" />
          
          <div className="relative p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <ClipboardList className="h-16 w-16 text-emerald-500 animate-pulse" />
                <div className="absolute inset-0 bg-emerald-500 opacity-20 rounded-full animate-ping" />
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-slate-800">
                {t('abg.actionPlan.creating', 'Creating Action Plan')}
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                {t('abg.actionPlan.generating', 'Generating personalized treatment recommendations and care protocols based on your analysis results.')}
              </p>
              
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={cn("abg-premium", className)}>
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200 shadow-xl">
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-red-800">Action Plan Generation Failed</h3>
              <p className="text-red-600 max-w-md mx-auto">{error}</p>
              
              <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
                <Loader2 className="h-4 w-4 mr-2" />
                Retry Generation
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No action plan state
  if (!actionPlan) {
    return (
      <div className={cn("abg-premium", className)}>
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 shadow-lg">
          <div className="p-8 text-center">
            <ClipboardList className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">{t('abg.actionPlan.none', 'No action plan available')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle raw string action plan (from webhooks)
  if (typeof actionPlan === 'string') {
    console.log('🔍 DEBUG: Full action plan string:', actionPlan);
    console.log('🔍 DEBUG: Action plan length:', actionPlan.length);
    
    return (
      <div className={cn(
        "abg-premium transition-all duration-700 transform",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className
      )}>
        {/* Clinical Action Plan Display Component */}
        <ClinicalActionPlanDisplay
          actionPlan={actionPlan}
          onIssueComplete={onActionComplete}
          editable={true}
          showProgress={true}
        />

        {/* Premium AI Clinical Consultation */}
        {abgResult && (
          <div className="mt-8 space-y-4">
            <div className="flex justify-center gap-4 flex-wrap">
              <PremiumAIClinicalConsultationButton
                result={abgResult}
                mode="action-plan"
                size="compact"
              />
            </div>
          </div>
        )}

        {/* Action Plan Selector Modal */}
        {abgResult && (
          <ActionPlanSelector
            result={abgResult}
            isOpen={showActionSelector}
            onClose={() => setShowActionSelector(false)}
            onConsult={handleConsultWithSelectedItems}
          />
        )}
      </div>
    );
  }

  // Get all actions by category (for structured data)
  const actionsByCategory: Record<string, ActionItem[]> = {
    immediate: actionPlan.immediateActions || [],
    monitoring: actionPlan.monitoringPlan || [],
    medication: actionPlan.medications || [],
    diagnostic: actionPlan.diagnosticTests || [],
    followup: actionPlan.followupCare || []
  };

  // Calculate overall statistics
  const totalActions = Object.values(actionsByCategory).flat().length;
  const completedCount = completedActions.size;
  const progressPercentage = totalActions > 0 ? (completedCount / totalActions) * 100 : 0;

  const overallPriorityConfig = priorityConfig[actionPlan.overallPriority || 'medium'];

  return (
    <div className={cn(
      "abg-premium transition-all duration-700 transform",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      className
    )}>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <ClipboardList className="h-8 w-8 text-white" />
                  </div>
                  <CheckCircle2 className="absolute -top-2 -right-2 h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Action Plan</h2>
                  <p className="text-white/80">Personalized treatment recommendations and care protocols</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 border border-white/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 border border-white/20"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 border border-white/20"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Total Actions</p>
                    <p className="text-2xl font-bold">{totalActions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${overallPriorityConfig.gradient} rounded-xl flex items-center justify-center`}>
                    <overallPriorityConfig.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Priority</p>
                    <p className="text-2xl font-bold">{overallPriorityConfig.label}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Completed</p>
                    <p className="text-2xl font-bold">{completedCount}/{totalActions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Progress</p>
                    <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {totalActions > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-white/80 mb-2">
                  <span>Overall Progress</span>
                  <span>{completedCount} of {totalActions} completed</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500 relative"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Goals */}
        {actionPlan.clinicalGoals && actionPlan.clinicalGoals.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Clinical Goals</h3>
                <p className="text-slate-600">Target outcomes and treatment objectives</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actionPlan.clinicalGoals.map((goal, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Target className="h-3 w-3 text-indigo-600" />
                  </div>
                  <p className="text-indigo-700 font-medium leading-relaxed">{goal}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Categories */}
        <div className="space-y-6">
          {Object.entries(actionsByCategory).map(([categoryKey, actions]) => {
            if (actions.length === 0) return null;
            
            const config = categoryConfig[categoryKey as keyof typeof categoryConfig];
            const categoryCompletedCount = actions.filter(action => completedActions.has(action.id)).length;
            const categoryProgress = (categoryCompletedCount / actions.length) * 100;
            
            return (
              <div key={categoryKey} className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                <div 
                  className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleCategory(categoryKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center`}>
                        <config.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{config.label}</h3>
                        <p className="text-slate-600">{config.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-600">{categoryCompletedCount}/{actions.length} completed</p>
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-300`}
                            style={{ width: `${categoryProgress}%` }}
                          />
                        </div>
                      </div>
                      <ArrowRight className={cn(
                        "h-5 w-5 text-slate-400 transition-transform",
                        expandedCategories.has(categoryKey) && "rotate-90"
                      )} />
                    </div>
                  </div>
                </div>

                {expandedCategories.has(categoryKey) && (
                  <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2">
                    {actions.map((action, index) => {
                      const isCompleted = completedActions.has(action.id);
                      const priorityConfig = priorityConfig[action.priority];
                      
                      return (
                        <div
                          key={action.id}
                          className={cn(
                            "p-5 rounded-xl border-2 transition-all duration-300",
                            isCompleted ? "bg-green-50 border-green-200" : "bg-white border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleActionComplete(action.id)}
                                className={cn(
                                  "w-8 h-8 p-0 rounded-full border-2 transition-all",
                                  isCompleted 
                                    ? "bg-green-500 border-green-500 text-white hover:bg-green-600" 
                                    : "border-slate-300 hover:border-green-400"
                                )}
                              >
                                {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                              </Button>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className={cn(
                                    "font-semibold text-slate-800",
                                    isCompleted && "line-through text-slate-500"
                                  )}>
                                    {action.title}
                                  </h4>
                                  <Badge className={cn("text-xs", priorityConfig.bgColor, priorityConfig.textColor)}>
                                    {priorityConfig.label}
                                  </Badge>
                                </div>
                                
                                <p className={cn(
                                  "text-slate-600 leading-relaxed mb-3",
                                  isCompleted && "line-through text-slate-400"
                                )}>
                                  {action.description}
                                </p>
                                
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600">{action.timeframe}</span>
                                  </div>
                                  {action.responsible && (
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-slate-400" />
                                      <span className="text-slate-600">{action.responsible}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="text-xs">
                                <Bell className="h-3 w-3 mr-1" />
                                Remind
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Premium AI Clinical Consultation */}
        {abgResult && (
          <div className="mt-8 space-y-4">
            <div className="flex justify-center gap-4 flex-wrap">
              <PremiumAIClinicalConsultationButton
                result={abgResult}
                mode="action-plan"
                size="compact"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};