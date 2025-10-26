import React from 'react';
import { AlertTriangle, Zap, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { FlowiseIdentifiedIssue } from '../../../types/abg';
import { cn } from '../../../lib/utils';

interface IdentifiedIssuesPanelProps {
  issues: FlowiseIdentifiedIssue[];
  onGenerateActionPlans: () => void;
  isGenerating?: boolean;
  className?: string;
}

export const IdentifiedIssuesPanel: React.FC<IdentifiedIssuesPanelProps> = ({
  issues,
  onGenerateActionPlans,
  isGenerating = false,
  className
}) => {
  // Don't render if no issues
  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "mt-6 p-6 border-2 border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md",
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-amber-100 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Identified Clinical Issues
          </h3>
          <p className="text-sm text-gray-600">
            {issues.length} {issues.length === 1 ? 'issue' : 'issues'} requiring clinical attention
          </p>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3 mb-5">
        {issues.map((issue, index) => (
          <div
            key={index}
            className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Issue Title */}
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-700">{index + 1}</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-base">
                  {issue.issue}
                </h4>
              </div>
            </div>

            {/* Issue Description */}
            <p className="text-sm text-gray-700 leading-relaxed ml-8 mb-2">
              {issue.description}
            </p>

            {/* Clinical Question */}
            <div className="ml-8 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
              <p className="text-xs font-medium text-blue-800">
                <span className="font-semibold">Clinical Question:</span> {issue.question}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <Button
        onClick={onGenerateActionPlans}
        disabled={isGenerating}
        className={cn(
          "w-full py-6 text-base font-semibold shadow-lg",
          "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
          "text-white transition-all duration-200",
          isGenerating && "opacity-75 cursor-not-allowed"
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating Action Plans for {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'}...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            Generate Evidence-Based Action Plans
          </>
        )}
      </Button>

      {/* Info Note */}
      <div className="mt-4 flex items-start gap-2 p-3 bg-blue-100 rounded border border-blue-200">
        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          Action plans will be generated using evidence-based medical guidelines and clinical protocols
          tailored to each identified issue.
        </p>
      </div>
    </div>
  );
};
