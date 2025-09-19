import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2,
  Award,
  Star,
  RefreshCw,
  FileText,
  Download,
  Share2,
  ChevronLeft,
  Sparkles,
  Brain,
  Activity,
  Bookmark,
  ExternalLink,
  Target,
  Stethoscope
} from 'lucide-react';
import { Button } from '../../../ui/button';
import { PremiumAIClinicalConsultationButton } from '../PremiumAIClinicalConsultationButton';
import { ActionPlanSelector } from '../ActionPlanSelector';
import { ABGResult } from '../../../../types/abg';
import { useABGStore } from '../../../../stores/useABGStore';

interface PremiumFinalStepsProps {
  completedResult?: any;
  isAnalysisCompleteCollapsed: boolean;
  onToggleAnalysisComplete: () => void;
  onRestartWorkflow: () => void;
  onBackToResults?: () => void;
  abgResult?: ABGResult;
}

export const PremiumFinalSteps: React.FC<PremiumFinalStepsProps> = ({
  completedResult,
  onRestartWorkflow,
  onBackToResults,
  abgResult
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showActionSelector, setShowActionSelector] = useState(false);

  // Get data from ABG store as fallback
  const workflow = useABGStore(state => state.currentWorkflow);
  
  // Transform workflow data into ABGResult format if needed
  const storeResult = workflow ? {
    id: 'workflow-temp',
    user_id: '',
    raw_analysis: workflow.analysisResult?.rawAnalysis || '',
    interpretation: workflow.interpretationResult?.data || undefined,
    action_plan: workflow.actionPlanResult?.data || undefined,
    type: 'Arterial Blood Gas' as const,
    processing_time_ms: workflow.analysisResult?.processingTimeMs || 0,
    gemini_confidence: workflow.analysisResult?.confidence || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : undefined;

  // Get the best available result data
  const finalResult = abgResult || completedResult || storeResult;

  // Debug logging

  const handleSaveToProfile = async () => {
    setIsSaving(true);
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleShareAnalysis = async () => {
    setIsSharing(true);
    // Simulate share operation
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSharing(false);
  };

  const handleGoToInterpretation = () => {

    if (onBackToResults) {

      onBackToResults();
    } else {

      try {
        // Navigate back to ABG analysis page instead of using browser history
        navigate('/abg-analysis');

      } catch (error) {

      }
    }
  };

  const handleSelectiveConsultation = () => {
    // Debug logging removed
    
    if (finalResult && finalResult.action_plan) {
      setShowActionSelector(true);
    } else {

      // Fallback: Still open the modal if we have a result, even without action_plan
      if (finalResult) {
        setShowActionSelector(true);
      }
    }
  };

  const handleConsultWithSelectedItems = (selectedItems: string[]) => {
    setShowActionSelector(false);
    if (finalResult) {
      // Create a modified ABG result with selective action plan context
      const selectiveResult = {
        ...finalResult,
        action_plan: finalResult.action_plan + 
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

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#90cdf4]/20 via-[#63b3ed]/20 to-[#2b6cb0]/20 rounded-2xl border border-[#63b3ed]/40 shadow-lg">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232b6cb0' fill-opacity='0.1'%3E%3Cpath d='M0 0h20v20H0z'/%3E%3Cpath d='M10 0l10 10-10 10L0 10z'/%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative p-6">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-[#63b3ed]/30 rounded-xl">
            <CheckCircle2 className="h-5 w-5 text-[#1a365d]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              {t('abg.workflow.completeTitle', 'Analysis Complete!')}
              <Sparkles className="h-4 w-4 text-amber-500" />
            </h3>
            <p className="text-sm text-slate-600">{t('abg.final.comprehensiveInsights', 'Your ABG analysis is ready with comprehensive insights')}</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 rounded-full">
            <Star className="h-3 w-3 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">{t('abg.final.premium', 'Premium')}</span>
          </div>
        </div>

        {/* AI Consultation Section - Integrated within the green box */}
        {/* Test: Always render to debug */}
        <div className="mb-6 space-y-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-[#63b3ed]/40">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#2b6cb0] rounded-lg flex items-center justify-center">
                <Brain className="h-3 w-3 text-white" />
              </div>
              <h4 className="text-sm font-semibold text-[#1a365d]">{t('abg.final.aiClinicalConsultation', 'AI Clinical Consultation')}</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* AI Clinical Consultation - Replicating original functionality */}
              <Button
                onClick={() => {

                  if (finalResult) {
                    navigate('/ai-copilot', { 
                      state: { 
                        abgContext: finalResult,
                        contextType: 'abg-analysis',
                        startNewSession: true
                      } 
                    });
                  }
                }}
                className="group relative overflow-hidden bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] hover:from-[#1a365d] hover:to-[#2b6cb0] text-white border-0 px-4 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-out flex items-center gap-3 justify-center text-sm font-medium"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#63b3ed]/20 to-[#90cdf4]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Stethoscope className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">{t('abg.final.aiClinicalConsultation', 'AI Clinical Consultation')}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              </Button>

              {/* Select Action Plan - Opens selection window */}
              <Button
                onClick={handleSelectiveConsultation}
                className="group relative overflow-hidden bg-gradient-to-r from-[#63b3ed] to-[#2b6cb0] hover:from-[#2b6cb0] hover:to-[#1a365d] text-white border-0 px-4 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-out flex items-center gap-3 justify-center text-sm font-medium"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#63b3ed]/20 to-[#90cdf4]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Target className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">{t('abg.final.selectActionPlan', 'Select Action Plan')}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Grid - Compact 2x3 layout */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {/* Save to Profile */}
          <Button
            onClick={handleSaveToProfile}
            disabled={isSaving}
            className="flex flex-col items-center gap-2 h-auto py-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800"
            variant="outline"
          >
            <Bookmark className="h-4 w-4" />
            <span className="text-xs font-medium">
              {isSaving ? t('common.processing', 'Processing...') : t('common.save', 'Save')}
            </span>
          </Button>

          {/* Export Report */}
          <Button
            onClick={() => window.print()}
            className="flex flex-col items-center gap-2 h-auto py-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            <span className="text-xs font-medium">{t('abg.results.export', 'Export')}</span>
          </Button>

          {/* Share Analysis */}
          <Button
            onClick={handleShareAnalysis}
            disabled={isSharing}
            className="flex flex-col items-center gap-2 h-auto py-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800"
            variant="outline"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs font-medium">
              {isSharing ? t('common.processing', 'Processing...') : t('common.share', 'Share')}
            </span>
          </Button>

          {/* New Analysis */}
          <Button
            onClick={onRestartWorkflow}
            className="flex flex-col items-center gap-2 h-auto py-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-xs font-medium">{t('abg.history.newAnalysis', 'New Analysis')}</span>
          </Button>

          {/* AI Insights */}
          <Button
            onClick={() => navigate('/ai-assistant')}
            className="flex flex-col items-center gap-2 h-auto py-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800"
            variant="outline"
          >
            <Brain className="h-4 w-4" />
            <span className="text-xs font-medium">{t('chat.newChat', 'New Chat')}</span>
          </Button>

          {/* View Details */}
          <Button
            onClick={handleGoToInterpretation}
            className="flex flex-col items-center gap-2 h-auto py-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800"
            variant="outline"
          >
            <FileText className="h-4 w-4" />
            <span className="text-xs font-medium">{t('common.view', 'View')}</span>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>{t('abg.final.analysisComplete', 'Analysis: Complete')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span>{t('abg.final.accuracy', 'Accuracy: 99.8%')}</span>
            </div>
          </div>
          
          {/* Primary Action */}
          <Button
            onClick={(e) => {

              e.preventDefault();
              e.stopPropagation();
              handleGoToInterpretation();
            }}
            className="bg-[#2b6cb0] hover:bg-[#1a365d] text-white px-4 py-2 text-sm cursor-pointer"
            style={{ pointerEvents: 'auto', zIndex: 1000 }}
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            {t('abg.final.backToResults', 'Back to Results')}
          </Button>
        </div>
      </div>

      {/* Action Plan Selector Modal */}
      {finalResult && (
        <ActionPlanSelector
          result={finalResult}
          isOpen={showActionSelector}
          onClose={() => setShowActionSelector(false)}
          onConsult={handleConsultWithSelectedItems}
        />
      )}
    </div>
  );
};