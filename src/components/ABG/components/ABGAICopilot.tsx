import React, { useState, useEffect } from 'react';
import { MessageSquare, TestTube2, User, Calendar, Sparkles, X, ArrowUpRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { AICopilot } from '../../AICopilot/AICopilot';
import { ChatProvider } from '../../../contexts/ChatContext';
import { FlowiseChatWindow } from '../../AICopilot/FlowiseChatWindow';
import { ABGResult, PatientInfo } from '../../../types/abg';
import { 
  formatABGForAIContext, 
  createPatientCaseFromABG, 
  enhancePromptWithABGContext,
  getABGSummary 
} from '../../../services/abgContextService';
import { cn } from '../../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface ABGAICopilotProps {
  /** ABG result to provide as context */
  abgResult?: ABGResult;
  /** Multiple ABG results for comparison context */
  abgResults?: ABGResult[];
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Whether to show ABG context summary */
  showContextSummary?: boolean;
  /** Callback when user wants to exit ABG context */
  onExitContext?: () => void;
  /** Custom CSS classes */
  className?: string;
}

export const ABGAICopilot: React.FC<ABGAICopilotProps> = ({
  abgResult,
  abgResults = [],
  compact = false,
  placeholder,
  showContextSummary = true,
  onExitContext,
  className
}) => {
  const navigate = useNavigate();
  const [contextMode, setContextMode] = useState<'single' | 'multiple' | 'none'>('none');
  const [enhancedPlaceholder, setEnhancedPlaceholder] = useState(
    placeholder || 'Ask me about medical guidelines, case analysis, or clinical decisions...'
  );

  // Determine context mode and setup
  useEffect(() => {
    if (abgResult) {
      setContextMode('single');
      setEnhancedPlaceholder(
        'Ask about this blood gas analysis, clinical interpretation, or related medical guidance...'
      );
    } else if (abgResults.length > 1) {
      setContextMode('multiple');
      setEnhancedPlaceholder(
        'Ask about these ABG results, compare trends, or get clinical guidance...'
      );
    } else if (abgResults.length === 1) {
      setContextMode('single');
      setEnhancedPlaceholder(
        'Ask about this blood gas analysis, clinical interpretation, or related medical guidance...'
      );
    } else {
      setContextMode('none');
      setEnhancedPlaceholder(
        placeholder || 'Ask me about medical guidelines, case analysis, or clinical decisions...'
      );
    }
  }, [abgResult, abgResults, placeholder]);

  // Get the active ABG result for context
  const activeResult = abgResult || abgResults[0];
  const allResults = abgResult ? [abgResult] : abgResults;

  // Create patient case for AI context
  const patientCase = activeResult ? createPatientCaseFromABG(activeResult) : undefined;

  // Handle message enhancement with ABG context
  const handleMessageSend = (message: string) => {
    if (contextMode !== 'none' && allResults.length > 0) {
      return enhancePromptWithABGContext(message, allResults, contextMode);
    }
    return message;
  };

  // Custom chat window with ABG context
  const ABGFlowiseChatWindow = () => {
    return (
      <div className="h-full flex flex-col">
        {/* Context Header */}
        {showContextSummary && contextMode !== 'none' && (
          <div className="flex-shrink-0 p-4 bg-gradient-to-r from-[#90cdf4]/20 to-[#63b3ed]/20 border-b border-[#2b6cb0]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-xl flex items-center justify-center">
                  <TestTube2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1a365d]">ABG Analysis Context</span>
                    <Badge variant="secondary" className="text-xs">
                      {contextMode === 'multiple' ? `${allResults.length} results` : '1 result'}
                    </Badge>
                  </div>
                  <div className="text-sm text-[#2b6cb0]">
                    {activeResult && getABGSummary(activeResult)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/ai-copilot')}
                  className="text-red-700 hover:text-red-800"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Full AI Chat</span>
                </Button>
                {onExitContext && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onExitContext}
                    className="text-red-700 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Patient info if available */}
            {activeResult?.patient && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <User className="h-3 w-3" />
                <span>
                  {activeResult.patient.first_name} {activeResult.patient.last_name}
                </span>
                {activeResult.patient.medical_record_number && (
                  <>
                    <span className="text-red-400">•</span>
                    <span>MRN: {activeResult.patient.medical_record_number}</span>
                  </>
                )}
                <span className="text-red-400">•</span>
                <Calendar className="h-3 w-3" />
                <span>{new Date(activeResult.created_at).toLocaleDateString()}</span>
              </div>
            )}

            {/* Quick context actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white/50 border-red-200 text-red-700 hover:bg-red-100"
                onClick={() => {
                  // This would trigger a pre-filled message
                  const contextMessage = "Please provide a clinical interpretation of these ABG results.";
                  // Implementation would depend on the chat system's API
                }}
              >
                Interpret Results
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white/50 border-red-200 text-red-700 hover:bg-red-100"
                onClick={() => {
                  const contextMessage = "What are the next steps based on this ABG analysis?";
                  // Implementation would depend on the chat system's API
                }}
              >
                Next Steps
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white/50 border-red-200 text-red-700 hover:bg-red-100"
                onClick={() => {
                  const contextMessage = "Are there any concerning findings in this blood gas analysis?";
                  // Implementation would depend on the chat system's API
                }}
              >
                Review Findings
              </Button>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="flex-1 min-h-0">
          <FlowiseChatWindow
            placeholder={enhancedPlaceholder}
            allowAttachments={true}
            className="h-full"
          />
        </div>
      </div>
    );
  };

  return (
    <div className={cn("h-full", className)}>
      <ChatProvider>
        <ABGFlowiseChatWindow />
      </ChatProvider>
    </div>
  );
};

// Standalone ABG AI Chat component for integration
export const ABGAIChat: React.FC<{
  results: ABGResult[];
  onClose?: () => void;
  className?: string;
}> = ({ results, onClose, className }) => {
  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <TestTube2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="font-semibold mb-2">No ABG Results</h3>
        <p className="text-muted-foreground">
          No blood gas analysis results available for AI consultation.
        </p>
      </Card>
    );
  }

  return (
    <div className={cn("h-[600px] border rounded-lg overflow-hidden", className)}>
      <ABGAICopilot
        abgResults={results}
        showContextSummary={true}
        onExitContext={onClose}
        className="h-full"
      />
    </div>
  );
};

// Quick AI consultation button for ABG results
export const ABGAIConsultButton: React.FC<{
  result: ABGResult;
  variant?: 'button' | 'card';
  onOpen?: () => void;
  contextType?: string;
}> = ({ result, variant = 'button', onOpen, contextType = 'abg-analysis' }) => {
  const navigate = useNavigate();
  
  const handleConsult = () => {
    onOpen?.();
    
    // Navigate to AI Copilot in same tab with ABG context and new session flag
    navigate('/ai-copilot', { 
      state: { 
        abgContext: result,
        contextType: contextType,
        startNewSession: true // Flag to indicate we want a fresh chat session
      } 
    });
  };

  if (variant === 'card') {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={handleConsult}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-medium">
              {contextType === 'interpretation-only' 
                ? 'AI Consultation - Interpretation' 
                : 'AI Clinical Consultation'
              }
            </div>
            <div className="text-sm text-muted-foreground">
              {contextType === 'interpretation-only'
                ? 'Get AI insights about the interpretation findings'
                : 'Get AI insights about this ABG analysis'
              }
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Button
      onClick={handleConsult}
      className="bg-white hover:bg-gray-50 text-indigo-700 hover:text-indigo-800 border-2 border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-6 py-3 text-base flex items-center gap-2"
    >
      <MessageSquare className="h-5 w-5" />
      AI Consult
    </Button>
  );
};