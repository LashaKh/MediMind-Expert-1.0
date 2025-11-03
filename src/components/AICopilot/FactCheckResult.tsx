import React from 'react';
import { FactCheckResult as FactCheckResultType } from '../../types/chat';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { MedicalMarkdownRenderer } from './MedicalMarkdownRenderer';
import { SourceReferences } from './SourceReferences';

interface FactCheckResultProps {
  result: FactCheckResultType;
}

export const FactCheckResult: React.FC<FactCheckResultProps> = ({ result }) => {
  const { verificationAnswer, sources, timestamp, status, error } = result;

  // Render loading state with progressive rendering
  if (status === 'loading') {
    return (
      <div className="mt-4 p-5 bg-gradient-to-br from-[#1a365d]/5 via-[#2b6cb0]/5 to-[#1a365d]/5 dark:from-[#1a365d]/20 dark:via-[#2b6cb0]/10 dark:to-[#1a365d]/20 border-2 border-[#1a365d]/30 dark:border-[#63b3ed]/40 rounded-xl shadow-lg">
        {/* Header with streaming indicator */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#1a365d]/20 dark:border-[#63b3ed]/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] rounded-lg shadow-md">
              <Loader className="w-5 h-5 text-white animate-spin" />
            </div>
            <div>
              <span className="text-base font-bold text-[#1a365d] dark:text-[#63b3ed] block">
                Verifying Answer...
              </span>
              <span className="text-xs text-[#2b6cb0] dark:text-[#90cdf4]">
                Streaming verification result
              </span>
            </div>
          </div>
        </div>

        {/* Progressive verification answer rendering */}
        {verificationAnswer && verificationAnswer.trim() !== '' && (
          <div className="prose prose-sm dark:prose-invert max-w-none bg-white/50 dark:bg-[#1a365d]/10 rounded-lg p-4 border border-[#63b3ed]/20 dark:border-[#2b6cb0]/30">
            <div className="text-[#1a365d] dark:text-[#90cdf4]">
              <MedicalMarkdownRenderer content={verificationAnswer} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render error state
  if (status === 'error') {
    return (
      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-lg">
        <div className="flex items-start space-x-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              Fact-Check Failed
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              {error || 'An error occurred while verifying this answer.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render success state with verification result - DISTINCT STYLING from original answer
  return (
    <div className="mt-4 p-5 bg-gradient-to-br from-[#1a365d]/5 via-[#2b6cb0]/5 to-[#1a365d]/5 dark:from-[#1a365d]/20 dark:via-[#2b6cb0]/10 dark:to-[#1a365d]/20 border-2 border-[#1a365d]/30 dark:border-[#63b3ed]/40 rounded-xl shadow-lg">
      {/* Prominent Header with Shield Icon */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#1a365d]/20 dark:border-[#63b3ed]/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] rounded-lg shadow-md">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-[#1a365d] dark:text-[#63b3ed] block">
              Verification Result
            </span>
            <span className="text-xs text-[#2b6cb0] dark:text-[#90cdf4]">
              Cross-referenced with medical knowledge base
            </span>
          </div>
        </div>
        <span className="text-xs font-medium text-[#2b6cb0] dark:text-[#63b3ed] bg-[#63b3ed]/10 dark:bg-[#2b6cb0]/20 px-2 py-1 rounded-full">
          {timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}
        </span>
      </div>

      {/* Verification Answer - Distinct background */}
      <div className="prose prose-sm dark:prose-invert max-w-none bg-white/50 dark:bg-[#1a365d]/10 rounded-lg p-4 border border-[#63b3ed]/20 dark:border-[#2b6cb0]/30">
        <div className="text-[#1a365d] dark:text-[#90cdf4]">
          <MedicalMarkdownRenderer content={verificationAnswer} />
        </div>
      </div>

      {/* Source References Section */}
      {sources && sources.length > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-[#1a365d]/20 dark:border-[#63b3ed]/20">
          <SourceReferences
            sources={sources}
            maxInitialDisplay={3}
            showExcerpts={true}
          />
        </div>
      )}

      {/* Prominent AI-Verified Badge */}
      <div className="mt-4 pt-3 border-t-2 border-[#1a365d]/20 dark:border-[#63b3ed]/20">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white text-xs font-semibold shadow-md">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>AI-Verified</span>
        </div>
      </div>
    </div>
  );
};
