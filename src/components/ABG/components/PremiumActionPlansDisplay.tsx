import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ActionPlanResult } from '../../../types/abg';

interface PremiumActionPlansDisplayProps {
  actionPlans: ActionPlanResult[];
  className?: string;
}

export const PremiumActionPlansDisplay: React.FC<PremiumActionPlansDisplayProps> = ({
  actionPlans,
  className = ''
}) => {
  const { t } = useTranslation();
  const [expandedPlanIds, setExpandedPlanIds] = useState<Set<number>>(new Set());
  const [copiedPlanId, setCopiedPlanId] = useState<number | null>(null);

  const togglePlan = (index: number) => {
    setExpandedPlanIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleCopy = async (planText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(planText);
      setCopiedPlanId(index);
      setTimeout(() => setCopiedPlanId(null), 2000);
    } catch (error) {
      console.error('Failed to copy action plan:', error);
    }
  };

  if (!actionPlans || actionPlans.length === 0) {
    return null;
  }

  const successCount = actionPlans.filter(p => p.status === 'success').length;
  const errorCount = actionPlans.filter(p => p.status === 'error').length;
  const loadingCount = actionPlans.filter(p => p.status === 'loading').length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Elegant Header with Theme Gradient */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-[#e2e8f0] shadow-xl">
        {/* Theme gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d]/5 via-[#2b6cb0]/5 to-[#63b3ed]/5"></div>

        {/* Content */}
        <div className="relative flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            {/* Icon with theme gradient background */}
            <div className="w-12 h-12 bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] bg-clip-text text-transparent">
                {t('abg.actionPlan.clinicalActionPlans', 'Clinical Action Plans')}
              </h3>
              <p className="text-sm text-[#6c757d] mt-1">
                {loadingCount > 0 && `Generating ${loadingCount} plan${loadingCount > 1 ? 's' : ''}...`}
                {loadingCount === 0 && `${successCount} ${successCount !== 1 ? t('abg.actionPlan.evidenceBasedStrategies', 'evidence-based management strategies') : t('abg.actionPlan.evidenceBasedStrategy', 'evidence-based management strategy')}`}
                {errorCount > 0 && ` • ${errorCount} unavailable`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {successCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#63b3ed]/10 text-[#2b6cb0] rounded-xl text-sm font-semibold border border-[#63b3ed]/30">
                <CheckCircle2 className="h-4 w-4" />
                <span>{successCount}</span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-semibold border border-red-200">
                <AlertCircle className="h-4 w-4" />
                <span>{errorCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Plan Cards */}
      <div className="space-y-4">
        {actionPlans.map((actionPlan, index) => {
          const isExpanded = expandedPlanIds.has(index);
          const isCopied = copiedPlanId === index;

          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                actionPlan.status === 'success'
                  ? 'bg-white border-2 border-[#e2e8f0] hover:border-[#63b3ed]/50'
                  : actionPlan.status === 'error'
                  ? 'bg-red-50 border-2 border-red-300'
                  : actionPlan.status === 'loading'
                  ? 'bg-[#90cdf4]/10 border-2 border-[#63b3ed]/30'
                  : 'bg-gray-50 border-2 border-gray-300'
              }`}
            >
              {/* Theme gradient status bar */}
              {actionPlan.status === 'success' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed]"></div>
              )}

              {/* Card Header */}
              <button
                onClick={() => togglePlan(index)}
                className={`w-full p-6 flex items-center justify-between transition-all duration-200 ${
                  actionPlan.status === 'success'
                    ? 'hover:bg-gradient-to-r hover:from-[#90cdf4]/5 hover:to-[#63b3ed]/5'
                    : ''
                }`}
                disabled={actionPlan.status === 'loading' || actionPlan.status === 'pending'}
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  {/* Status Icon with theme styling */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    actionPlan.status === 'success'
                      ? 'bg-gradient-to-br from-[#90cdf4]/30 to-[#63b3ed]/40 border border-[#63b3ed]/30'
                      : actionPlan.status === 'error'
                      ? 'bg-gradient-to-br from-red-100 to-rose-100 border border-red-200'
                      : actionPlan.status === 'loading'
                      ? 'bg-gradient-to-br from-[#63b3ed]/20 to-[#2b6cb0]/30 border border-[#2b6cb0]/30'
                      : 'bg-gray-100 border border-gray-300'
                  }`}>
                    {actionPlan.status === 'success' && (
                      <CheckCircle2 className="h-6 w-6 text-[#2b6cb0]" />
                    )}
                    {actionPlan.status === 'error' && (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                    {actionPlan.status === 'loading' && (
                      <Loader2 className="h-6 w-6 text-[#2b6cb0] animate-spin" />
                    )}
                    {actionPlan.status === 'pending' && (
                      <div className="h-6 w-6 rounded-full border-2 border-gray-400" />
                    )}
                  </div>

                  {/* Issue Title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        actionPlan.status === 'success'
                          ? 'bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] text-white'
                          : 'bg-gray-400 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <h4 className={`text-lg font-bold ${
                        actionPlan.status === 'success'
                          ? 'text-[#1a365d]'
                          : actionPlan.status === 'error'
                          ? 'text-red-900'
                          : 'text-gray-700'
                      }`}>
                        {actionPlan.issue}
                      </h4>
                    </div>
                    {actionPlan.status === 'error' && actionPlan.error && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {actionPlan.error}
                      </p>
                    )}
                    {actionPlan.status === 'loading' && (
                      <p className="text-sm text-[#2b6cb0] mt-1 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('abg.actionPlan.generatingPlan', 'Generating evidence-based action plan...')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Expand/Collapse Icon */}
                {actionPlan.status === 'success' && (
                  <div className="flex items-center gap-2 ml-4">
                    <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      <ChevronDown className="h-6 w-6 text-[#6c757d]" />
                    </div>
                  </div>
                )}
              </button>

              {/* Card Content (Expanded) - Beautiful Theme-Styled Content */}
              {isExpanded && actionPlan.status === 'success' && actionPlan.plan && (
                <div className="border-t-2 border-[#e2e8f0]">
                  <div className="p-6 sm:p-8 bg-gradient-to-br from-white via-[#90cdf4]/5 to-[#63b3ed]/5">
                    {/* Copy Button - Theme Styled */}
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => handleCopy(actionPlan.plan, index)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${
                          isCopied
                            ? 'bg-gradient-to-r from-[#63b3ed]/20 to-[#90cdf4]/20 text-[#1a365d] border border-[#63b3ed]/40'
                            : 'bg-white text-[#6c757d] border border-[#e2e8f0] hover:border-[#63b3ed]/50 hover:text-[#2b6cb0]'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="font-semibold">{t('abg.actionPlan.copied', 'Copied!')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>{t('abg.actionPlan.copyPlan', 'Copy Action Plan')}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Action Plan Content - Single Wide Column, Beautiful Typography */}
                    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
                      {/* Content container - Single column for maximum readability */}
                      <div className="p-6 sm:p-8 lg:p-10">
                        <div className="prose prose-slate max-w-none">
                          <style dangerouslySetInnerHTML={{
                            __html: `
                              /* Main Headers with Theme Gradient Backgrounds */
                              .action-plan-content h1 {
                                background: linear-gradient(to right, #1a365d, #2b6cb0);
                                color: white;
                                padding: 1rem 1.25rem;
                                border-radius: 0.75rem;
                                font-weight: 700;
                                margin-top: 2rem;
                                margin-bottom: 1.25rem;
                                font-size: 1.5rem;
                                box-shadow: 0 4px 6px -1px rgba(43, 108, 176, 0.1);
                              }

                              /* Secondary Headers with Subtle Background */
                              .action-plan-content h2 {
                                background: linear-gradient(to right, #f8f9fa, #90cdf4/10);
                                color: #1a365d;
                                padding: 0.875rem 1rem;
                                border-left: 4px solid #2b6cb0;
                                border-radius: 0.5rem;
                                font-weight: 700;
                                margin-top: 1.75rem;
                                margin-bottom: 1rem;
                                font-size: 1.25rem;
                              }

                              /* Tertiary Headers with Border Accent */
                              .action-plan-content h3 {
                                color: #2b6cb0;
                                padding: 0.5rem 0;
                                border-bottom: 2px solid #63b3ed;
                                font-weight: 700;
                                margin-top: 1.5rem;
                                margin-bottom: 0.75rem;
                                font-size: 1.125rem;
                              }

                              /* Fourth-level Headers */
                              .action-plan-content h4 {
                                color: #1a365d;
                                font-weight: 600;
                                margin-top: 1.25rem;
                                margin-bottom: 0.5rem;
                                font-size: 1rem;
                              }

                              /* Strong/Bold Text */
                              .action-plan-content strong {
                                color: #1a365d;
                                font-weight: 700;
                                background: linear-gradient(to right, #90cdf4/15, transparent);
                                padding: 0.125rem 0.25rem;
                                border-radius: 0.25rem;
                              }

                              /* Paragraphs */
                              .action-plan-content p {
                                color: #1a1b1e;
                                line-height: 1.8;
                                margin-bottom: 1rem;
                                font-size: 1rem;
                              }

                              /* Lists */
                              .action-plan-content ul,
                              .action-plan-content ol {
                                margin-left: 1.5rem;
                                margin-bottom: 1rem;
                              }

                              .action-plan-content li {
                                margin-bottom: 0.625rem;
                                line-height: 1.75;
                                color: #1a1b1e;
                              }

                              /* Medical Value Highlights */
                              .action-plan-content .medical-value {
                                background: linear-gradient(to right, #63b3ed/15, #90cdf4/10);
                                color: #1a365d;
                                padding: 0.25rem 0.5rem;
                                border-radius: 0.375rem;
                                font-weight: 600;
                                font-family: monospace;
                                border: 1px solid #63b3ed/30;
                                white-space: nowrap;
                              }

                              /* Section Dividers */
                              .action-plan-content hr {
                                border: none;
                                height: 2px;
                                background: linear-gradient(to right, transparent, #63b3ed, transparent);
                                margin: 1.5rem 0;
                              }

                              /* Code/Technical Terms */
                              .action-plan-content code {
                                background: #f8f9fa;
                                color: #2b6cb0;
                                padding: 0.25rem 0.5rem;
                                border-radius: 0.25rem;
                                font-size: 0.9em;
                                border: 1px solid #e2e8f0;
                              }
                            `
                          }} />
                          <div
                            className="action-plan-content text-base leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: actionPlan.plan
                                // Headers with theme colors (order matters - H4 first, then H3, H2, H1)
                                .replace(/^####\s+(.*$)/gim, '<h4>$1</h4>')
                                .replace(/^###\s+(.*$)/gim, '<h3>$1</h3>')
                                .replace(/^##\s+(.*$)/gim, '<h2>$1</h2>')
                                .replace(/^#\s+(.*$)/gim, '<h1>$1</h1>')
                                // Medical values (pH, pCO2, pO2, percentages, mg/dL, mmHg, etc.)
                                .replace(/\b(pH\s*:?\s*[\d.]+|pCO2?\s*:?\s*[\d.]+\s*mmHg?|pO2?\s*:?\s*[\d.]+\s*mmHg?|HCO3?\s*:?\s*[\d.]+\s*m?mol\/L?)/gi, '<span class="medical-value">$1</span>')
                                .replace(/\b([\d.]+\s*(?:mg\/kg|mg\/dL|mmol\/L|mEq\/L|mmHg|%|mL\/hr|units?\/hr))\b/gi, '<span class="medical-value">$1</span>')
                                .replace(/\b([\d.]+-[\d.]+\s*(?:mg\/kg|mg\/dL|mmol\/L|mEq\/L|mmHg|%|mL\/hr))\b/gi, '<span class="medical-value">$1</span>')
                                // Percentages and ranges
                                .replace(/\b([\d.]+%(?:\s*to\s*[\d.]+%)?)\b/g, '<span class="medical-value">$1</span>')
                                // Bold text
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                // Bullet lists with enhanced theme-colored bullets
                                .replace(/^-\s+(.*$)/gim, '<li style="position: relative; padding-left: 2rem; margin-bottom: 0.625rem;"><span style="position: absolute; left: 0.25rem; color: #2b6cb0; font-weight: bold; font-size: 1.25rem; line-height: 1;">•</span><span>$1</span></li>')
                                .replace(/^\*\s+(.*$)/gim, '<li style="position: relative; padding-left: 2rem; margin-bottom: 0.625rem;"><span style="position: absolute; left: 0.25rem; color: #2b6cb0; font-weight: bold; font-size: 1.25rem; line-height: 1;">•</span><span>$1</span></li>')
                                // Nested bullets (double bullet points)
                                .replace(/\s+•\s+•\s+/g, '<span style="margin-left: 1.5rem; color: #63b3ed;">▸</span> ')
                                // Numbered lists with beautiful theme gradient badges
                                .replace(/^(\d+)\.\s+(.*$)/gim, '<div style="display: flex; gap: 0.875rem; margin-bottom: 0.875rem; align-items: flex-start;"><span style="flex-shrink: 0; width: 2rem; height: 2rem; background: linear-gradient(135deg, #1a365d, #2b6cb0); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 700; box-shadow: 0 2px 4px rgba(43, 108, 176, 0.2);">$1</span><span style="flex: 1; padding-top: 0.25rem;">$2</span></div>')
                                // Section dividers
                                .replace(/^---+$/gm, '<hr />')
                                // Paragraphs
                                .replace(/\n\n/g, '</p><p class="mb-4">')
                                .replace(/^(?!<[^>]+>)(.+)$/gm, '<p class="mb-4">$1</p>')
                                // Clean up extra paragraphs
                                .replace(/<p class="mb-4"><\/p>/g, '')
                                .replace(/<p class="mb-4">(<(?:h[1-4]|div|li|hr)[^>]*>.*?<\/(?:h[1-4]|div|li)>)<\/p>/g, '$1')
                                .replace(/<p class="mb-4">(<hr\s*\/?>)<\/p>/g, '$1')
                            }}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
