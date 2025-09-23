import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Brain,
  Sparkles,
  Send,
  AlertCircle,
  X,
  Plus,
  FileText,
  Stethoscope,
  Search,
  Grid3X3,
  List,
  Zap,
  HeartHandshake,
  Activity
} from 'lucide-react';
import { MedicalButton } from '../../ui/MedicalDesignSystem';
import { isDiagnosisTemplate, extractDiagnosisFromInstruction } from '../../../services/diagnosisFlowiseService';

// Import new components
import { MedicalAnalysisCard } from './MedicalAnalysisCard';
import { QuickActionTemplates } from './QuickActionTemplates';
import { PremiumTemplatesSection } from './PremiumTemplatesSection';

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface AIProcessingContentProps {
  transcript: string;
  hasTranscript: boolean;
  processing: boolean;
  aiError?: string | null;
  processingHistory?: ProcessingHistory[];
  onProcessText?: (instruction: string) => void;
  onClearAIError?: () => void;
  onClearHistory?: () => void;
  onDeleteReport?: (analysis: ProcessingHistory) => void;
  onSwitchToHistory?: () => void; // New callback for switching tabs
  onExpandChat?: (expandFunction: () => void) => void; // Pass expand function to parent
  onCloseChat?: (closeFunction: () => void) => void; // New callback to pass close function to parent
}

type ViewMode = 'templates' | 'history';
type LayoutMode = 'grid' | 'list';

export const AIProcessingContent: React.FC<AIProcessingContentProps> = ({
  transcript,
  hasTranscript,
  processing,
  aiError,
  processingHistory = [],
  onProcessText,
  onClearAIError,
  onClearHistory,
  onDeleteReport,
  onSwitchToHistory,
  onExpandChat,
  onCloseChat
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('templates');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [customInstruction, setCustomInstruction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'processing-time'>('newest');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const switchToHistoryRef = useRef<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debug logging (disabled in production)
  // + '...',
  //   isChatExpanded,
  //   processing,
  //   shouldShowButton: hasTranscript && !isChatExpanded && !processing
  // });

  // Auto-switch to history when processing completes for diagnosis
  useEffect(() => {
    if (switchToHistoryRef.current && !processing) {
      console.log('🔄 Auto-switch check:', {
        switchToHistoryRef: switchToHistoryRef.current,
        processing,
        historyLength: processingHistory.length,
        shouldSwitch: processingHistory.length > 0
      });
      
      if (processingHistory.length > 0) {
        console.log('🎯 Auto-switching to history view after diagnosis completion');
        setViewMode('history');
        switchToHistoryRef.current = false;
      } else {
        // Wait a bit for processingHistory to update, then try again
        console.log('⏳ Waiting for processingHistory to update...');
        setTimeout(() => {
          if (switchToHistoryRef.current && processingHistory.length > 0) {
            console.log('🎯 Auto-switching to history view (delayed)');
            setViewMode('history');
            switchToHistoryRef.current = false;
          }
        }, 100);
      }
    }
  }, [processing, processingHistory.length]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInstruction.trim() && onProcessText) {
      onProcessText(customInstruction.trim());
      setCustomInstruction('');
    }
  };

  // Enhanced keyboard shortcuts handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (customInstruction.trim() && onProcessText && !processing) {
        onProcessText(customInstruction.trim());
        setCustomInstruction('');
        setIsChatExpanded(false);
      }
    }
    if (e.key === 'Escape') {
      setIsChatExpanded(false);
    }
  };

  // Handle chat expansion
  const handleExpandChat = useCallback(() => {

    setIsChatExpanded(true);
    // Debug viewport and elements

    // Focus textarea after animation completes
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 200);
  }, [hasTranscript]);

  const handleCloseChat = () => {
    setIsChatExpanded(false);
  };

  // Pass expand chat function to parent on mount
  useEffect(() => {
    if (onExpandChat) {

      onExpandChat(handleExpandChat);
    }
  }, [onExpandChat, handleExpandChat]);

  // Pass close chat function to parent as well
  useEffect(() => {
    if (onCloseChat) {
      // Pass the close function to parent
      onCloseChat(() => {
        setIsChatExpanded(false);
      });
    }
  }, [onCloseChat]);

  const handleSubmitAndClose = () => {
    if (customInstruction.trim() && onProcessText && !processing) {
      onProcessText(customInstruction.trim());
      setCustomInstruction('');
      setIsChatExpanded(false);
    }
  };

  const handleTemplateSelect = (instruction: string) => {
    if (onProcessText) {
      // Check if this is a diagnosis template for special handling
      const diagnosisInfo = extractDiagnosisFromInstruction(instruction);
      if (diagnosisInfo) {

        // Set flag to auto-switch to history after processing completes
        switchToHistoryRef.current = true;
      }
      
      onProcessText(instruction);
    }
  };

  // Filter and sort history
  const filteredHistory = processingHistory
    .filter(item => {
      if (!searchQuery) return true;
      return (
        item.userInstruction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.aiResponse.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'processing-time':
          return b.processingTime - a.processingTime;
        default:
          return b.timestamp - a.timestamp;
      }
    });

  return (
    <>
    <div className="relative flex flex-col h-full max-h-full bg-gradient-to-br from-[#90cdf4]/20 via-white/90 to-[#63b3ed]/10 dark:from-[#1a365d]/80 dark:via-[#2b6cb0]/60 dark:to-[#1a365d]/40 overflow-hidden">
      
      {/* Compact Header */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-[#63b3ed]/50 dark:border-[#2b6cb0]/50">
        <div className="px-4 py-3">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex bg-[#90cdf4]/20 dark:bg-[#1a365d]/60 rounded-xl p-1.5 shadow-inner">
              <button
                onClick={() => setViewMode('templates')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'templates'
                    ? 'bg-white dark:bg-[#2b6cb0] text-[#1a365d] dark:text-white shadow-sm'
                    : 'text-[#2b6cb0] dark:text-[#63b3ed] hover:text-[#1a365d] dark:hover:text-[#90cdf4]'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Templates</span>
              </button>
              <button
                onClick={() => setViewMode('history')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'history'
                    ? 'bg-white dark:bg-[#2b6cb0] text-[#1a365d] dark:text-white shadow-sm'
                    : 'text-[#2b6cb0] dark:text-[#63b3ed] hover:text-[#1a365d] dark:hover:text-[#90cdf4]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Generated Reports ({processingHistory.length})</span>
              </button>
            </div>

            {/* History View Controls */}
            {viewMode === 'history' && processingHistory.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="flex bg-[#90cdf4]/20 dark:bg-[#1a365d]/60 rounded-lg p-1">
                  <button
                    onClick={() => setLayoutMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${
                      layoutMode === 'grid'
                        ? 'bg-white dark:bg-[#2b6cb0] text-[#1a365d] dark:text-white shadow-sm'
                        : 'text-[#2b6cb0] dark:text-[#63b3ed] hover:text-[#1a365d] dark:hover:text-[#90cdf4]'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLayoutMode('list')}
                    className={`p-1.5 rounded-md transition-all ${
                      layoutMode === 'list'
                        ? 'bg-white dark:bg-[#2b6cb0] text-[#1a365d] dark:text-white shadow-sm'
                        : 'text-[#2b6cb0] dark:text-[#63b3ed] hover:text-[#1a365d] dark:hover:text-[#90cdf4]'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#63b3ed]" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-32 pl-9 pr-3 py-1.5 text-sm border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent text-[#1a365d] dark:text-[#90cdf4]"
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2 py-1.5 text-sm border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent text-[#1a365d] dark:text-[#90cdf4]"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="processing-time">Time</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Error Display */}
      {aiError && (
        <div className="flex-shrink-0 mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">
                  AI Processing Error
                </h4>
                {onClearAIError && (
                  <MedicalButton
                    onClick={onClearAIError}
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </MedicalButton>
                )}
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{aiError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-4 pb-32 md:px-6 md:py-6 md:pb-32">
          
          {/* Templates View */}
          {viewMode === 'templates' && (
            <div className="space-y-6">

              {/* Premium Templates Section */}
              <PremiumTemplatesSection
                onSelectTemplate={handleTemplateSelect}
                disabled={processing}
                hasTranscript={hasTranscript}
              />
            </div>
          )}

          {/* History View */}
          {viewMode === 'history' && (
            <>
              {filteredHistory.length > 0 ? (
                <div className={`${layoutMode === 'grid' ? 'space-y-4 md:space-y-6' : 'space-y-3 md:space-y-4'} max-w-full`}>
                  {filteredHistory.map((analysis, index) => (
                    <MedicalAnalysisCard
                      key={`analysis-${analysis.timestamp}-${index}`}
                      analysis={analysis}
                      index={index}
                      totalCount={processingHistory.length}
                      onDelete={onDeleteReport}
                      enableEditing={true}
                      flowiseEndpoint={(() => {
                        const lower = analysis.userInstruction.toLowerCase();
                        if ((lower.includes('i50.0') || lower.includes('heart failure') || lower.includes('გულის შეგუბებითი უკმარისობა')) && analysis.model === 'flowise-diagnosis-agent') {
                          return 'https://flowise-2-0.onrender.com/api/v1/prediction/89920f52-74cb-46bc-bf6c-b9099746dfe9';
                        }
                        if ((lower.includes('i24.9') || lower.includes('nstemi') || lower.includes('გულის მწვავე იშემიური ავადმყოფობა')) && analysis.model === 'flowise-diagnosis-agent') {
                          return 'https://flowise-2-0.onrender.com/api/v1/prediction/3db46c83-334b-4ffc-9112-5d30e43f7cf4';
                        }
                        return 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy';
                      })()}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#90cdf4]/20 to-[#63b3ed]/20 dark:from-[#1a365d]/60 dark:to-[#2b6cb0]/60 rounded-3xl flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-[#63b3ed] dark:text-[#90cdf4]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a365d] dark:text-[#90cdf4] mb-3">
                    {searchQuery ? 'No matching analyses found' : 'No analysis history yet'}
                  </h3>
                  <p className="text-[#2b6cb0] dark:text-[#63b3ed] max-w-md">
                    {searchQuery 
                      ? 'Try adjusting your search terms or filters.'
                      : hasTranscript 
                        ? 'Start by selecting a medical analysis template or create a custom analysis.'
                        : 'Record or upload a medical transcript to begin AI analysis.'
                    }
                  </p>
                  {searchQuery && (
                    <MedicalButton
                      variant="outline"
                      size="md"
                      onClick={() => setSearchQuery('')}
                      className="mt-4"
                    >
                      Clear Search
                    </MedicalButton>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>

    </div>

      {/* Floating Chat Interface - Rendered as Portal */}
      {hasTranscript && isChatExpanded && createPortal(
        <div 
          className="fixed"
          style={{
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999999
          }}
        >
          {/* Backdrop */}
          <div 
            className="absolute bg-black/20 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            style={{
              top: '0',
              left: '0',
              right: '0',
              bottom: '0'
            }}
            onClick={handleCloseChat}
          />
          
          {/* Chat Container */}
          <div 
            className="relative animate-in slide-in-from-bottom-4 duration-300 ease-out"
            style={{
              width: '100%',
              maxWidth: '32rem',
              maxHeight: '80vh'
            }}
          >
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#63b3ed]/50 dark:border-[#2b6cb0]/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a365d] dark:text-[#90cdf4]">AI Medical Assistant</h3>
                    <p className="text-xs text-[#2b6cb0] dark:text-[#63b3ed]">Ask me anything about your transcript</p>
                  </div>
                </div>
                
                <button
                  onClick={handleCloseChat}
                  className="w-8 h-8 rounded-full bg-[#90cdf4]/20 dark:bg-[#1a365d]/60 hover:bg-[#63b3ed]/30 dark:hover:bg-[#2b6cb0]/60 transition-colors duration-200 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[#1a365d] dark:text-[#90cdf4]" />
                </button>
              </div>
              
              {/* Input Area */}
              <form onSubmit={handleCustomSubmit} className="p-6">
                <div className="relative">
                  <div className="relative bg-[#90cdf4]/10 dark:bg-[#1a365d]/50 rounded-2xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 focus-within:border-[#2b6cb0] dark:focus-within:border-[#63b3ed] transition-all duration-200">
                    <textarea
                      ref={textareaRef}
                      value={customInstruction}
                      onChange={(e) => setCustomInstruction(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="✨ What would you like to know about this medical case?"
                      disabled={processing}
                      rows={4}
                      className="w-full resize-none bg-transparent px-4 py-3 pr-20 text-sm text-[#1a365d] dark:text-[#90cdf4] placeholder-[#2b6cb0]/60 dark:placeholder-[#63b3ed]/60 focus:outline-none disabled:opacity-60 font-medium leading-relaxed"
                      maxLength={500}
                    />
                    
                    {/* Controls */}
                    <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                      {/* Character Counter */}
                      <div className={`text-xs transition-colors duration-200 ${
                        customInstruction.length > 450 ? 'text-red-500' : 
                        customInstruction.length > 400 ? 'text-[#90cdf4]' : 
                        'text-[#2b6cb0]/60 dark:text-[#63b3ed]/60'
                      }`}>
                        <span className="tabular-nums">{customInstruction.length}</span>
                        <span className="opacity-60">/500</span>
                      </div>
                      
                      {/* Send Button */}
                      <button
                        type="submit"
                        disabled={processing || !customInstruction.trim()}
                        className="group/send relative flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] hover:from-[#1a365d] hover:to-[#2b6cb0] disabled:from-[#63b3ed]/50 disabled:to-[#90cdf4]/50 rounded-xl shadow-md hover:shadow-lg disabled:shadow-sm transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                      >
                        {processing ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 text-white transform group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 transition-transform duration-200" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Keyboard Shortcut */}
                  <div className="flex items-center justify-between mt-3 text-xs text-[#2b6cb0]/60 dark:text-[#63b3ed]/60">
                    <div>Press <kbd className="px-1.5 py-0.5 bg-[#90cdf4]/30 dark:bg-[#1a365d]/60 rounded text-xs">Esc</kbd> to close</div>
                    <div><kbd className="px-1.5 py-0.5 bg-[#90cdf4]/30 dark:bg-[#1a365d]/60 rounded text-xs">⌘ Enter</kbd> to send</div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Enhanced Processing Indicator */}
      {processing && (
        <>
          {/* Full-screen processing overlay for major visual feedback */}
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 shadow-2xl p-8 mx-4 max-w-sm w-full text-center animate-in slide-in-from-bottom-4 duration-500">
              {/* Animated medical icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse">
                <HeartHandshake className="w-8 h-8 text-white animate-bounce" />
              </div>
              
              {/* Processing text */}
              <h3 className="text-lg font-bold text-[#1a365d] dark:text-[#90cdf4] mb-2">
                Generating Medical Report
              </h3>
              <p className="text-sm text-[#2b6cb0] dark:text-[#63b3ed] mb-4">
                Our specialized AI is analyzing your transcript and preparing a comprehensive medical report...
              </p>
              
              {/* Progress indicator */}
              <div className="flex items-center justify-center space-x-2 text-xs text-[#2b6cb0]/60 dark:text-[#63b3ed]/60">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#2b6cb0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#2b6cb0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#2b6cb0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="ml-2">Processing...</span>
              </div>
              
              {/* Estimated time */}
              <div className="mt-3 text-xs text-[#2b6cb0]/60 dark:text-[#63b3ed]/60">
                Estimated time: 30-45 seconds
              </div>
            </div>
          </div>
          
          {/* Alternative: Bottom notification for less intrusive feedback */}
          {/* <div className="fixed bottom-6 right-6" style={{ zIndex: 9999998 }}>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-sm animate-in slide-in-from-right duration-300">
              <div className="animate-pulse">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Generating medical report...</span>
                <span className="text-xs text-blue-200">Consulting specialized AI agent</span>
              </div>
            </div>
          </div> */}
        </>
      )}
    </>
  );
};