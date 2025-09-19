import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Activity,
  Target,
  Bell
} from 'lucide-react';
import { ABGType, WorkflowStep } from '../../../../types/abg';
import { PremiumAnalysisResults } from '../PremiumAnalysisResults';
import { PremiumInterpretationResults } from '../PremiumInterpretationResults';
import { PremiumAIClinicalConsultationButton } from '../PremiumAIClinicalConsultationButton';
import { Button } from '../../../ui/button';

interface InterpretationStepProps {
  // Results data
  extractedText: string;
  interpretation: string;
  showResults: boolean;
  abgType: ABGType;
  completedResult?: any;
  
  // Workflow state
  workflow?: any;
  
  // UI state
  isExtractedTextCollapsed: boolean;
  isClinicalInterpretationCollapsed: boolean;
  onToggleExtractedText: () => void;
  onToggleClinicalInterpretation: () => void;
  
  // Processing state
  isProcessing: boolean;
  unifiedProgress?: {
    phase: string;
  } | null;
  
  // Actions
  onTextReAnalysis: (text: string) => Promise<void>;
  onProcessActionPlan: () => void;
  onCompleteAnalysis?: () => void;
  onGoToStep: (step: WorkflowStep) => void;
}

export const InterpretationStep: React.FC<InterpretationStepProps> = ({
  extractedText,
  interpretation,
  showResults,
  abgType,
  completedResult,
  workflow,
  isExtractedTextCollapsed,
  isClinicalInterpretationCollapsed,
  onToggleExtractedText,
  onToggleClinicalInterpretation,
  isProcessing,
  unifiedProgress,
  onTextReAnalysis,
  onProcessActionPlan,
  onCompleteAnalysis,
  onGoToStep
}) => {
  const { t } = useTranslation();
  const renderExtractedTextPreview = () => {
    if (!extractedText) return t('abg.analysis.waitingData', 'Blood gas analysis results will appear here after processing...');
    
    return (
      <div>
        {/* Show first few key medical values */}
        {extractedText.split('\n')
          .filter(line => line.trim() && (line.includes('pH') || line.includes('pCO2') || line.includes('pO2') || line.includes('HCO3')))
          .slice(0, 3)
          .map((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine.includes(':')) {
              const [key, value] = trimmedLine.split(':');
              return (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="font-medium">{key.trim()}:</span>
                  <span className="font-mono text-[#2b6cb0]">{value.trim()}</span>
                </div>
              );
            }
            return <div key={index} className="py-1">{trimmedLine}</div>;
          })
        }
        {extractedText.split('\n').filter(line => line.trim()).length > 3 && (
          <div className="text-slate-400 text-xs mt-2">
            {t('abg.analysis.moreValues', '... and {{count}} more values', { count: extractedText.split('\n').filter(line => line.trim()).length - 3 })}
          </div>
        )}
      </div>
    );
  };

  const hasValidResults = !!(interpretation || workflow?.interpretationResult?.data);

  // Determine if we should show unified results or fallback content
  const shouldShowUnifiedResults = showResults && extractedText && interpretation;
  const shouldShowFallbackResults = !shouldShowUnifiedResults && (interpretation || workflow?.interpretationResult?.data);

  return (
    <div className="space-y-6">
      {/* Show unified results if available */}
      {shouldShowUnifiedResults && (
        <div className="space-y-6">
          {/* Extracted Text Panel - Collapsible */}
          <div className="abg-card abg-glass p-5" data-testid="extracted-text-section">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => onToggleExtractedText(!isExtractedTextCollapsed)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{t('abg.analysis.raw.title', 'Raw Analysis Data')}</h3>
                  <p className="text-xs text-slate-600">{t('abg.analysis.raw.reviewHint', 'Review and edit if needed')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {isExtractedTextCollapsed ? t('abg.common.show', 'Show') : t('abg.common.hide', 'Hide')}
                </span>
                {isExtractedTextCollapsed ? 
                  <ChevronDown className="h-4 w-4 text-slate-400" /> : 
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                }
              </div>
            </div>
            
            {!isExtractedTextCollapsed ? (
              <PremiumAnalysisResults
                result={{
                  raw_analysis: extractedText,
                  processing_time_ms: workflow?.progress || 0
                }}
                editable={true}
                onEdit={onTextReAnalysis}
                isProcessingReanalysis={isProcessing && unifiedProgress?.phase === 'interpretation'}
                showPreview={true}
              />
            ) : (
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm text-slate-600 leading-relaxed">
                  {renderExtractedTextPreview()}
                </div>
                <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                  <span>
                    {extractedText.length > 0 
                      ? t('abg.analysis.linesTotal', '{{count}} lines total', { count: extractedText.split('\n').filter(line => line.trim()).length })
                      : t('abg.analysis.waitingData', 'Waiting for data')
                    }
                  </span>
                  <span className="text-[#2b6cb0] font-medium">{t('abg.common.clickToExpand', 'Click to expand')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Clinical Interpretation Panel - Collapsible */}
          <div className="abg-card abg-glass p-5">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => onToggleClinicalInterpretation(!isClinicalInterpretationCollapsed)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[#63b3ed] to-[#2b6cb0] rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{t('abg.interpretation.title', 'Clinical Interpretation')}</h3>
                  <p className="text-xs text-slate-600">{t('abg.interpretation.subtitle', 'AI-generated clinical analysis')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {isClinicalInterpretationCollapsed ? t('abg.common.show', 'Show') : t('abg.common.hide', 'Hide')}
                </span>
                {isClinicalInterpretationCollapsed ? 
                  <ChevronDown className="h-4 w-4 text-slate-400" /> : 
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                }
              </div>
            </div>
            
            {!isClinicalInterpretationCollapsed ? (
              <PremiumInterpretationResults
                interpretation={interpretation}
                isLoading={false}
              />
            ) : (
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm text-slate-600 leading-relaxed">
                  {interpretation ? (
                    <div>
                      <div className="font-medium text-slate-700 mb-2">{t('abg.interpretation.summary', 'Clinical Summary:')}</div>
                      <p className="line-clamp-3">
                        {interpretation
                          // Clean markdown formatting for preview
                          .replace(/\*\*(.*?)\*\*/g, '$1')
                          .replace(/•?\s*\[RED\]\s*([^:]+):/gi, '🔴 $1:')
                          .replace(/•?\s*\[YELLOW\]\s*([^:]+):/gi, '🟡 $1:')
                          .replace(/•?\s*\[GREEN\]\s*([^:]+):/gi, '🟢 $1:')
                          .replace(/•?\s*Red\s*\(([^)]+)\):/gi, '🔴 $1:')
                          .replace(/•?\s*Yellow\s*\(([^)]+)\):/gi, '🟡 $1:')
                          .replace(/•?\s*Green\s*\(([^)]+)\):/gi, '🟢 $1:')
                          .replace(/•?\s*\*\*\[Red\]\s*([^*]+)\*\*:/gi, '🔴 $1:')
                          .replace(/•?\s*\*\*\[Yellow\]\s*([^*]+)\*\*:/gi, '🟡 $1:')
                          .replace(/•?\s*\*\*\[Green\]\s*([^*]+)\*\*:/gi, '🟢 $1:')
                          // Clean up ALL dash-based bullet points
                          .replace(/^\s*-\s+/gm, '• ')
                          .replace(/^\s*\*\s+/gm, '• ')
                          .replace(/^\s*•\s+/gm, '• ')
                          // Remove standalone dashes
                          .replace(/^\s*-\s*$/gm, '')
                          // Clean up markdown headers
                          .replace(/^#{1,6}\s+/gm, '')
                          .replace(/\n\s*\n/g, '\n')
                          .replace(/\n\s+/g, '\n')
                          .trim()
                          .substring(0, 200)
                        }...
                      </p>
                    </div>
                  ) : (
                    <span>{t('abg.interpretation.waiting', 'Clinical interpretation will appear here after analysis...')}</span>
                  )}
                </div>
                <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                  <span>{t('abg.interpretation.subtitle', 'AI-generated clinical analysis')}</span>
                  <span className="text-[#2b6cb0] font-medium">{t('abg.common.clickToExpand', 'Click to expand')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fallback: Show standard interpretation results if unified results not available */}
      {shouldShowFallbackResults && (
        <PremiumInterpretationResults
          interpretation={interpretation || workflow?.interpretationResult?.data}
          isLoading={isProcessing}
          error={workflow?.error}
          abgResult={completedResult || (workflow?.interpretationResult ? {
            id: 'temp-interpretation',
            user_id: workflow?.sessionId || '',
            raw_analysis: extractedText || workflow?.analysisResult?.extractedText || '',
            interpretation: interpretation || workflow?.interpretationResult?.data || '',
            action_plan: workflow?.actionPlanResult?.data || '',
            type: abgType,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            processing_time_ms: workflow?.interpretationResult?.processingTimeMs || 0,
            gemini_confidence: workflow?.analysisResult?.confidence || 0.9,
            patient_id: null,
            patient: null
          } : undefined)}
        />
      )}
      
      {workflow?.canProceed && (
        <div className="mt-8 space-y-6">
          {/* AI Clinical Consultation Button */}
          {(completedResult || (extractedText && interpretation)) && (
            <div className="flex justify-center">
              <PremiumAIClinicalConsultationButton
                result={completedResult || {
                  id: 'temp-interpretation',
                  user_id: workflow?.sessionId || '',
                  raw_analysis: extractedText,
                  interpretation: interpretation,
                  type: abgType,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  processing_time_ms: 0,
                  gemini_confidence: 0.9,
                  patient_id: null,
                  patient: null
                }}
                mode="interpretation"
                size="compact"
              />
            </div>
          )}
          
          {/* Premium Next Steps Interface */}
          <div className="abg-next-steps-container relative">
            {/* Background gradient with glass morphism */}
            <div className="abg-next-steps-bg"></div>
            
            {/* Main content */}
            <div className="relative p-4">
              {/* Header with icon and subtitle */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="abg-next-steps-header-icon w-8 h-8 rounded-xl flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div className="abg-next-steps-badge absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"></div>
                </div>
                <div>
                  <h4 className="abg-next-steps-title text-lg font-bold leading-tight">
                    {t('abg.workflow.nextSteps', 'Next Steps')}
                  </h4>
                </div>
              </div>

              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Edit Analysis Data Card */}
                <div className="abg-action-card group relative">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Toggle the extracted text section to show editing capability
                      if (isExtractedTextCollapsed) {
                        onToggleExtractedText();
                      }
                      // Scroll to the extracted text section
                      setTimeout(() => {
                        const extractedTextElement = document.querySelector('[data-testid="extracted-text-section"]');
                        if (extractedTextElement) {
                          extractedTextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className="relative w-full h-auto p-0 overflow-hidden border-0 bg-transparent hover:bg-transparent"
                    disabled={isProcessing}
                  >
                    <div className="relative w-full bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-500 group-hover:border-slate-300/80">
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Shine effect */}
                      <div className="abg-action-card-shine"></div>
                      
                      {/* Content */}
                      <div className="relative p-4 text-center">
                        <div className="abg-action-card-icon w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg">
                          <FileText className="h-5 w-5 text-slate-600 group-hover:text-slate-700 transition-colors duration-300" />
                        </div>
                        <h5 className="font-bold text-slate-700 mb-1 group-hover:text-slate-800 transition-colors duration-300 text-sm">{t('abg.analysis.edit.title', 'Edit Analysis Data')}</h5>
                        
                        {/* Subtle accent line */}
                        <div className="abg-action-card-accent-line text-slate-300"></div>
                      </div>
                    </div>
                  </Button>
                </div>

                {/* Complete Analysis Card (Primary) */}
                {onCompleteAnalysis && (
                  <div className="abg-action-card group relative">
                    <Button
                      onClick={onCompleteAnalysis}
                      className="relative w-full h-auto p-0 overflow-hidden border-0 bg-transparent hover:bg-transparent"
                      disabled={isProcessing}
                    >
                      <div className="abg-action-card-primary relative w-full rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500">
                        {/* Shine effect */}
                        <div className="abg-action-card-shine"></div>
                        
                        {/* Content */}
                        <div className="relative p-4 text-center">
                          <div className="abg-action-card-icon w-10 h-10 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl">
                            {isProcessing ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <h5 className="font-bold text-white mb-1 text-sm">{isProcessing ? t('common.processing', 'Processing...') : t('abg.analysis.complete.title', 'Complete Analysis')}</h5>
                          
                          {/* Progress indicator for processing */}
                          {isProcessing && (
                            <div className="abg-processing-indicator">
                              <div className="abg-processing-bar"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  </div>
                )}

                {/* Get Action Plan Card */}
                <div className="abg-action-card group relative">
                  <Button
                    onClick={onProcessActionPlan}
                    variant="secondary"
                    className="relative w-full h-auto p-0 overflow-hidden border-0 bg-transparent hover:bg-transparent"
                    disabled={isProcessing}
                  >
                    <div className="relative w-full bg-gradient-to-br from-[#90cdf4]/20 via-[#63b3ed]/20 to-[#2b6cb0]/20 rounded-2xl border border-[#63b3ed]/40 shadow-lg shadow-[#63b3ed]/20 hover:shadow-xl hover:shadow-[#2b6cb0]/30 transition-all duration-500 group-hover:border-[#2b6cb0]/60">
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#63b3ed]/30 via-[#90cdf4]/30 to-[#2b6cb0]/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Shine effect */}
                      <div className="abg-action-card-shine"></div>
                      
                      {/* Content */}
                      <div className="relative p-4 text-center">
                        <div className="abg-action-card-icon w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-[#90cdf4]/40 to-[#63b3ed]/60 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg">
                          {isProcessing ? (
                            <Activity className="h-5 w-5 text-[#2b6cb0] animate-pulse" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-[#2b6cb0] group-hover:text-[#1a365d] transition-all duration-300 group-hover:translate-x-0.5" />
                          )}
                        </div>
                        <h5 className="font-bold text-[#1a365d] mb-1 group-hover:text-[#2b6cb0] transition-colors duration-300 text-sm">
                          {isProcessing ? t('common.processing', 'Processing...') : t('abg.workflow.steps.actionPlan.label', 'Get Action Plan')}
                        </h5>
                        
                        {/* Subtle accent line */}
                        <div className="abg-action-card-accent-line text-[#63b3ed]"></div>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};