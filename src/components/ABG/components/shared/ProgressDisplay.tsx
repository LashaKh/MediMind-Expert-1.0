import React from 'react';
import { Loader2, FileText, Brain } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface UnifiedProgressInfo {
  currentTask?: string;
  stageDescription: string;
  overallProgress: number;
  phase: string;
}

interface ProgressDisplayProps {
  progress: UnifiedProgressInfo;
  className?: string;
}

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({
  progress,
  className
}) => {
  return (
    <div className={cn("abg-card abg-glass p-5", className)}>
      <div className="flex items-center gap-4 mb-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <div className="flex-1">
          <div className="text-base font-semibold text-slate-800">{progress.currentTask}</div>
          <div className="text-xs text-slate-600">{progress.stageDescription}</div>
        </div>
        <div className="text-base font-mono font-bold text-blue-600">{progress.overallProgress}%</div>
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${progress.overallProgress}%` }}
        />
      </div>
      
      <div className="flex gap-4 justify-center">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
          progress.phase === 'extraction' ? "bg-blue-100 text-blue-800 shadow-md" : "bg-slate-100 text-slate-600"
        )}>
          <FileText className="h-4 w-4" />
          Text Extraction
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
          progress.phase === 'interpretation' ? "bg-green-100 text-green-800 shadow-md" : "bg-slate-100 text-slate-600"
        )}>
          <Brain className="h-4 w-4" />
          Clinical Analysis
        </div>
      </div>
    </div>
  );
};