import React, { useState, useCallback } from 'react';
import {
  Brain,
  HeartHandshake,
  Sparkles,
  Target,
  User
} from 'lucide-react';
import { formatMarkdown, extractCleanText, hasMarkdownFormatting } from '../../../utils/markdownFormatter';
import { applyMultipleEdits } from '../../../utils/inlineEditReplacer';
import { supabase } from '../../../lib/supabase';

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface AnalysisType {
  type: string;
  icon: React.ElementType;
  color: string;
  isDiagnosis: boolean;
  endpoint: string;
  supportsForm100?: boolean;
}

interface AnalysisCardContentProps {
  analysis: ProcessingHistory;
  analysisType: AnalysisType;
  editedContent: string | null;
  isExpanded: boolean;
  onContentEdit?: (updatedContent: string) => void;
  sessionId?: string; // For saving to database
  onReloadSession?: () => Promise<void>; // Callback to reload session after save
}

export const AnalysisCardContent: React.FC<AnalysisCardContentProps> = ({
  analysis,
  analysisType,
  editedContent,
  isExpanded,
  onContentEdit,
  sessionId
}) => {
  // State for tracking inline edits - MUST be called before any early returns
  const [inlineEdits, setInlineEdits] = useState<Record<string, string>>({});

  // Save inline edit to Supabase database
  const saveInlineEditToDatabase = useCallback(async (updatedContent: string) => {
    if (!sessionId) {
      console.warn('No sessionId provided, skipping database save');
      return;
    }

    try {
      console.log('💾 Saving inline edit to database:', { sessionId, timestamp: analysis.timestamp });

      // Fetch current session data
      const { data: sessionData, error: fetchError } = await supabase
        .from('georgian_sessions')
        .select('processing_results')
        .eq('id', sessionId)
        .single();

      if (fetchError) {
        console.error('Error fetching session:', fetchError);
        return;
      }

      // Update the specific analysis in processing_results array
      const processingResults = sessionData?.processing_results || [];
      const updatedResults = processingResults.map((item: ProcessingHistory) => {
        if (item.timestamp === analysis.timestamp) {
          return {
            ...item,
            aiResponse: updatedContent
          };
        }
        return item;
      });

      // Save back to database
      const { error: updateError } = await supabase
        .from('georgian_sessions')
        .update({
          processing_results: updatedResults,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating session:', updateError);
      } else {
        console.log('✅ Successfully saved inline edit to database');
      }
    } catch (error) {
      console.error('Error in saveInlineEditToDatabase:', error);
    }
  }, [sessionId, analysis.timestamp]);

  // Handler for inline field edits - MUST be called before any early returns
  const handleInlineEdit = useCallback((fieldId: string, value: string) => {
    console.log('AnalysisCardContent handleInlineEdit called:', { fieldId, value });

    // Update inline edits state
    const newEdits = {
      ...inlineEdits,
      [fieldId]: value
    };
    setInlineEdits(newEdits);

    // CRITICAL: Always apply ALL edits to the ORIGINAL content, not to already-edited content
    // This prevents index shifting when multiple fields are edited
    const originalContent = analysis.aiResponse;
    const updatedContent = applyMultipleEdits(originalContent, newEdits);

    console.log('Applied edits:', {
      originalLength: originalContent.length,
      updatedLength: updatedContent.length,
      totalEdits: Object.keys(newEdits).length
    });

    // Notify parent component of the edit
    if (onContentEdit) {
      onContentEdit(updatedContent);
    }

    // Save to database
    saveInlineEditToDatabase(updatedContent);
  }, [inlineEdits, analysis.aiResponse, onContentEdit, saveInlineEditToDatabase]);

  // Get the display content with inline edits applied
  const getDisplayContent = (): string => {
    // CRITICAL: Always apply edits to ORIGINAL content to maintain correct indices
    const originalContent = analysis.aiResponse;

    // If there are inline edits, apply them to original content
    if (Object.keys(inlineEdits).length > 0) {
      const result = applyMultipleEdits(originalContent, inlineEdits);
      console.log('📊 getDisplayContent with inline edits:', {
        editsCount: Object.keys(inlineEdits).length,
        edits: inlineEdits,
        hasValueToFill: result.includes('Value_to_be_filled')
      });
      return result;
    }

    // Otherwise, use editedContent (from full Edit mode) or original
    console.log('📊 getDisplayContent fallback:', {
      hasEditedContent: !!editedContent,
      editedContentHasValueToFill: editedContent?.includes('Value_to_be_filled'),
      originalHasValueToFill: originalContent.includes('Value_to_be_filled')
    });
    return editedContent || originalContent;
  };

  // Early return AFTER all hooks
  if (!isExpanded) {
    return null;
  }

  return (
    <div className="relative p-3 sm:p-8 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
      {/* Premium User Request Section - Hidden for cleaner UI */}
      {/* Note: User request section disabled for cleaner UI */}
      {false && (
        <div className="relative overflow-hidden">
          {/* Request Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 via-[#90cdf4]/15 to-[#63b3ed]/10 dark:from-slate-800/80 dark:via-[#2b6cb0]/20 dark:to-[#1a365d]/15 rounded-3xl" />
          
          <div className="relative p-6">
            <div className="flex items-start space-x-4">
              {/* Enhanced User Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl blur-md opacity-30" />
                <div className="relative bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl p-3 shadow-xl shadow-[#2b6cb0]/25">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Analysis Request
                  </h4>
                  <div className="px-3 py-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/40 dark:border-slate-700/40">
                    <span className="text-xs font-bold text-[#2b6cb0] dark:text-[#63b3ed]">USER INPUT</span>
                  </div>
                </div>
                
                <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {analysis.userInstruction}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium AI Response Section */}
      <div className="relative overflow-hidden">
        {/* Response Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#90cdf4]/20 via-[#63b3ed]/15 to-[#2b6cb0]/10 dark:from-[#2b6cb0]/25 dark:via-[#1a365d]/20 dark:to-[#63b3ed]/15 rounded-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(43,108,176,0.1),transparent_70%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(43,108,176,0.2),transparent_70%)]" />
        
        <div className="relative p-6">
          <div className="flex items-start space-x-4">
            {/* Enhanced AI Icon - Hidden on mobile */}
            <div className="relative hidden sm:block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl blur-md opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl p-3 shadow-xl shadow-[#2b6cb0]/25">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                {analysisType.isDiagnosis ? (
                  <HeartHandshake className="w-6 h-6 text-white relative z-10" />
                ) : (
                  <Brain className="w-6 h-6 text-white relative z-10" />
                )}
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#90cdf4] to-[#63b3ed] rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h4 className="hidden sm:block text-xl font-bold text-slate-900 dark:text-slate-100">
                  {analysisType.isDiagnosis ? 'Medical Report' : 'AI Clinical Analysis'}
                </h4>
                
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="px-3 py-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full border border-white/50 dark:border-slate-700/50">
                    <span className="text-xs font-bold text-[#2b6cb0] dark:text-[#63b3ed]">AI GENERATED</span>
                  </div>
                  
                  {analysisType.isDiagnosis && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 dark:from-[#2b6cb0]/30 dark:to-[#63b3ed]/30 rounded-full">
                      <Target className="w-3 h-3 text-[#2b6cb0] dark:text-[#63b3ed]" />
                      <span className="text-xs font-bold text-[#1a365d] dark:text-[#90cdf4]">CLINICAL</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Content Display */}
              <div className="relative -mx-3 sm:mx-0" style={{ width: '100%', maxWidth: '100%', margin: 0, boxSizing: 'border-box' }}>
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-inner" />
                <div className="relative px-4 py-2 sm:p-6 w-full" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: '16px', boxSizing: 'border-box' }}>
                  {(() => {
                    const displayContent = getDisplayContent();
                    return hasMarkdownFormatting(displayContent) ? (
                      <div className="w-full markdown-content text-slate-800 dark:text-slate-200" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0, boxSizing: 'border-box' }}>
                        {formatMarkdown(displayContent, { onFieldEdit: handleInlineEdit })}
                      </div>
                    ) : (
                      <div className="w-full text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0, boxSizing: 'border-box' }}>
                        {displayContent}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};