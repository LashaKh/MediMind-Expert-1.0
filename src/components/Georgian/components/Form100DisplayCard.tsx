import React from 'react';
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Edit3,
  X,
  Clock,
  CheckCircle,
  Trash2,
  // Crown removed - no longer used
} from 'lucide-react';
import { MedicalButton } from '../../ui/MedicalDesignSystem';
import { formatMarkdown, hasMarkdownFormatting } from '../../../utils/markdownFormatter';
import ReportEditCard from '../../ReportEditing/ReportEditCard';

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface Form100DisplayCardProps {
  generatedForm100Content: string | null;
  form100GeneratedAt: Date | null;
  isForm100Expanded: boolean;
  isForm100EditMode: boolean;
  editedForm100Content: string | null;
  analysis: ProcessingHistory;
  analysisType: {
    type: string;
    icon: React.ElementType;
    color: string;
    isDiagnosis: boolean;
    endpoint: string;
    supportsForm100?: boolean;
  };
  sessionId?: string;
  flowiseEndpoint?: string;

  // Handlers
  onForm100ExpandToggle: () => void;
  onForm100EditToggle: () => void;
  onForm100EditComplete: (editResult: any) => void;
  onForm100EditError: (error: any) => void;
  onForm100Delete: () => void;
  // onCopy, onDownload, onShare removed per user request
}

export const Form100DisplayCard: React.FC<Form100DisplayCardProps> = ({
  generatedForm100Content,
  form100GeneratedAt,
  isForm100Expanded,
  isForm100EditMode,
  editedForm100Content,
  analysis,
  analysisType,
  sessionId,
  flowiseEndpoint,
  onForm100ExpandToggle,
  onForm100EditToggle,
  onForm100EditComplete,
  onForm100EditError,
  onForm100Delete
  // onCopy, onDownload, onShare removed
}) => {
  if (!generatedForm100Content) {
    return null;
  }

  // Extract ICD code from diagnosis type string
  // "STEMI ER Report (I21.x)" → "I21.x"
  const extractICDCode = (typeString: string): string => {
    const match = typeString.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  };

  const icdCode = extractICDCode(analysisType.type);

  return (
    <>
      {/* Visual Connector */}
      <div className="flex justify-center py-3">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-px bg-[#63b3ed]" />
          <div className="p-1 bg-[#63b3ed] rounded-full">
            <ChevronDown className="w-2 h-2 text-white" />
          </div>
          <div className="w-4 h-px bg-[#63b3ed]" />
        </div>
      </div>

      {/* Form 100 Display Card */}
      <div className="relative mt-4">
        {/* Enhanced Premium Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a365d]/10 via-[#2b6cb0]/5 to-[#1a365d]/15 dark:from-[#1a365d]/20 dark:via-[#2b6cb0]/10 dark:to-[#1a365d]/25 rounded-3xl blur-sm" />
        
        <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-[#63b3ed]/30 dark:border-[#2b6cb0]/30 shadow-xl dark:shadow-2xl overflow-hidden">
          {/* Form 100 Header */}
          <div className="relative cursor-pointer" onClick={onForm100ExpandToggle}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] opacity-95" />

            <div className="relative p-4 sm:p-6">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                {/* Form 100 Title */}
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm" />
                    <div className="relative p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide truncate">
                      Form 100 - {analysisType.type}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80 mt-1">
                      Generated from {icdCode} Consult Report
                    </p>
                  </div>
                </div>
                
                {/* Form 100 Actions */}
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Mobile: Action Buttons Row */}
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {/* Edit Button */}
                    <MedicalButton
                      variant="secondary"
                      size="sm"
                      leftIcon={isForm100EditMode ? X : Edit3}
                      onClick={onForm100EditToggle}
                      className="bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/40 text-white hover:text-white backdrop-blur-sm min-h-[44px] sm:min-h-[36px]"
                    >
                      <span className="text-xs sm:text-sm font-medium">
                        {isForm100EditMode ? 'Cancel' : 'Edit'}
                      </span>
                    </MedicalButton>

                    {/* Delete Button */}
                    <MedicalButton
                      variant="secondary"
                      size="sm"
                      leftIcon={Trash2}
                      onClick={onForm100Delete}
                      className="bg-red-500/20 hover:bg-red-500/30 border-red-400/30 hover:border-red-400/50 text-white hover:text-white backdrop-blur-sm min-h-[44px] sm:min-h-[36px]"
                    >
                      <span className="text-xs sm:text-sm font-medium">Delete</span>
                    </MedicalButton>

                    {/* Collapse Button */}
                    <MedicalButton
                      variant="ghost"
                      size="sm"
                      rightIcon={isForm100Expanded ? ChevronUp : ChevronDown}
                      onClick={onForm100ExpandToggle}
                      className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 min-h-[44px] sm:min-h-[36px]"
                    >
                      <span className="text-xs sm:text-sm">{isForm100Expanded ? 'Minimize' : 'Expand'}</span>
                    </MedicalButton>
                  </div>
                  
                  {/* Timestamp */}
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {form100GeneratedAt && (
                      <div className="flex items-center space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white/80" />
                        <span className="text-xs sm:text-sm font-medium text-white/90">
                          {form100GeneratedAt.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form 100 Edit Mode */}
          {isForm100EditMode && (
            <div className="relative p-4 sm:p-6">
              <div className="relative">
                {/* Enhanced Premium Background for Edit Mode */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a365d]/10 via-[#2b6cb0]/5 to-[#1a365d]/15 dark:from-[#1a365d]/20 dark:via-[#2b6cb0]/10 dark:to-[#1a365d]/25 rounded-3xl blur-sm" />
                
                <div className="relative">
                  {/* Header section removed - content starts directly */}
                  
                  {/* Enhanced Report Edit Card */}
                  <div className="relative">
                    <ReportEditCard
                      reportId={`form100-${form100GeneratedAt?.getTime() || Date.now()}`}
                      initialContent={editedForm100Content || generatedForm100Content || ''}
                      sessionId={`form100-edit-${sessionId}`}
                      flowiseEndpoint={flowiseEndpoint}
                      onEditComplete={onForm100EditComplete}
                      onError={onForm100EditError}
                      className="border-2 border-[#2b6cb0]/50 dark:border-[#1a365d]/50 shadow-2xl shadow-[#2b6cb0]/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form 100 Content */}
          {isForm100Expanded && !isForm100EditMode && (
            <div className="relative p-4 sm:p-6" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
              <div className="relative -mx-3 sm:mx-0" style={{ width: '100%', maxWidth: '100%', margin: 0, boxSizing: 'border-box' }}>
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-inner" />
                <div className="relative px-4 py-2 sm:p-6 w-full" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: '16px', boxSizing: 'border-box' }}>
                  {(() => {
                    const displayContent = editedForm100Content || generatedForm100Content;
                    return hasMarkdownFormatting(displayContent) ? (
                      <div className="w-full markdown-content text-slate-800 dark:text-slate-200" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0, boxSizing: 'border-box' }}>
                        {formatMarkdown(displayContent)}
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
          )}

          {/* Form 100 Footer with Actions */}
          {isForm100Expanded && !isForm100EditMode && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 to-[#1a365d]/15 dark:from-slate-800/60 dark:to-[#2b6cb0]/20 rounded-3xl" />
              
              <div className="relative p-4 sm:p-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  {/* Form 100 Actions - Copy, Export, Share buttons removed per user request */}
                  <div className="flex flex-wrap items-center gap-2 sm:space-x-3">
                    {/* Actions removed */}
                  </div>
                  
                  {/* Form 100 Status */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#63b3ed]/20 to-[#2b6cb0]/20 rounded-2xl blur-md opacity-70 animate-pulse" />
                    <div className="relative flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-[#63b3ed]/20 to-[#2b6cb0]/20 dark:from-[#2b6cb0]/30 dark:to-[#1a365d]/30 backdrop-blur-sm rounded-2xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/30 shadow-lg">
                      <div className="relative">
                        <div className="w-3 h-3 bg-[#2b6cb0] rounded-full animate-pulse" />
                        <div className="absolute inset-0 w-3 h-3 bg-[#63b3ed] rounded-full animate-ping" />
                      </div>
                      <span className="text-sm font-bold text-[#1a365d] dark:text-[#63b3ed] tracking-wide">
                        FORM 100 GENERATED
                      </span>
                      <CheckCircle className="w-4 h-4 text-[#2b6cb0] dark:text-[#63b3ed]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};