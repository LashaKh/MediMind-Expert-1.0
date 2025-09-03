import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Stethoscope,
  FileText,
  ArrowRight,
  Copy,
  Download,
  Star,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { MedicalMarkdownRenderer } from './MedicalMarkdownRenderer';
import { useTranslation } from '../../hooks/useTranslation';

// Types for medical issues and their content
interface MedicalIssue {
  id: string;
  title: string;
  content: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  sections: IssueSection[];
  completed?: boolean;
}

interface IssueSection {
  id: string;
  title: string;
  content: string;
  type: 'introduction' | 'action_plan' | 'monitoring' | 'rationale' | 'considerations' | 'summary';
}

interface ClinicalActionPlanDisplayProps {
  actionPlan: string;
  className?: string;
  onIssueComplete?: (issueId: string) => void;
  editable?: boolean;
}

// Configuration for different medical issue priorities
const issueConfig = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-500'
  },
  high: {
    icon: Zap,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    dotColor: 'bg-orange-500'
  },
  medium: {
    icon: Stethoscope,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500'
  },
  low: {
    icon: CheckCircle2,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500'
  }
};

// Priority styling configuration
const priorityConfig = {
  critical: {
    badge: 'bg-red-100 text-red-800 border border-red-200',
    icon: AlertTriangle,
    dotColor: 'bg-red-500'
  },
  high: {
    badge: 'bg-orange-100 text-orange-800 border border-orange-200',
    icon: Zap,
    dotColor: 'bg-orange-500'
  },
  medium: {
    badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    icon: Clock,
    dotColor: 'bg-yellow-500'
  },
  low: {
    badge: 'bg-green-100 text-green-800 border border-green-200',
    icon: CheckCircle2,
    dotColor: 'bg-green-500'
  }
};

export const ClinicalActionPlanDisplay: React.FC<ClinicalActionPlanDisplayProps> = ({
  actionPlan,
  className,
  onIssueComplete,
  editable = false
}) => {
  const { t } = useTranslation();
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [completedIssues, setCompletedIssues] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);
  const [showRawContent, setShowRawContent] = useState(false);

  // Parse the action plan markdown into medical issues
  // Enhanced parser with resilience to various markdown formats and AI response variations
  const medicalIssues = useMemo((): MedicalIssue[] => {
    if (!actionPlan) return [];

    const lines = actionPlan.split('\n');
    const issues: MedicalIssue[] = [];
    let currentIssue: MedicalIssue | null = null;
    let currentContent: string[] = [];
    let issueCounter = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Check if this line starts a new medical issue - focus on ## level headers and clear medical conditions
      const headerMatch = trimmedLine.match(/^(#{1,3})\s*(.+)$/);
      
      if (headerMatch) {
        const headingText = headerMatch[2].trim();
        
        // Skip empty or very short headings
        if (!headingText || headingText.length < 3) {
          if (currentIssue) {
            currentContent.push(line);
          }
          continue;
        }
        
        // Skip generic document headers that don't represent medical issues
        if (/^(comprehensive\s+action\s+plan|action\s+plan|treatment\s+plan|recommendations?|summary|conclusion|introduction|overview|background|rationale|additional\s+considerations?)$/i.test(headingText)) {
          if (currentIssue) {
            currentContent.push(line);
          }
          continue;
        }

        // Match actual AI-generated patterns including emojis
        const isMainMedicalIssue = (
          // Numbered issues with emojis: "🚨 Issue 1:", "⚠️ Issue 2:", "Issue 4: Metabolic Alkalosis"  
          /^[🚨⚠️🔥⭐💀❗🟥🟨🟦🟩\s]*Issue\s+\d+\s*:\s*/i.test(headingText) ||
          
          // Problem/Condition patterns with numbers
          /^[🚨⚠️🔥⭐💀❗🟥🟨🟦🟩\s]*(Problem|Condition|Diagnosis)\s+\d+\s*:\s*/i.test(headingText) ||
          
          // Direct pattern matches for the exact AI format
          /^[#\s]*[🚨⚠️🔥⭐💀❗🟥🟨🟦🟩]+\s*Issue\s+\d+\s*:/i.test(headingText)
        );

        // Explicitly exclude management, treatment, and intervention sections
        const isManagementSection = (
          /\s+(Management|Treatment|Therapy|Care|Plan|Protocol|Approach|Strategy)$/i.test(headingText) ||
          /^(Management|Treatment|Therapy|Care|Plan|Protocol|Approach|Strategy)\s+/i.test(headingText) ||
          /^(Key\s+Interventions?|Immediate\s+Actions?|Action\s+Plan|Treatment\s+Plan)$/i.test(headingText)
        );

        if (isMainMedicalIssue && !isManagementSection) {
          // Save previous issue if exists
          if (currentIssue && currentContent.length > 0) {
            currentIssue.content = currentContent.join('\n');
            issues.push(currentIssue);
          }

          // Enhanced title cleaning with multiple patterns
          let cleanTitle = headingText
            .replace(/^(Issue|Problem|Condition|Diagnosis)\s*\d*\s*:\s*/i, '')
            .replace(/^(Significant|Severe|Acute|Chronic)\s+/i, '')
            .replace(/^(Primary|Secondary|Main)\s+/i, '')
            .trim();
          
          // If title is empty after cleaning, use original
          if (!cleanTitle || cleanTitle.length < 3) {
            cleanTitle = headingText;
          }

          // Enhanced priority detection with more comprehensive keywords
          let priority: MedicalIssue['priority'] = 'medium';
          const contextWindow = lines.slice(Math.max(0, i-2), Math.min(lines.length, i + 25)).join(' ').toLowerCase();
          const titleLower = cleanTitle.toLowerCase();
          
          // Critical priority indicators - enhanced with common medical conditions and badges
          if (/(critical|severe|life.?threatening|emergent|immediate|urgent|stat|code\s+(blue|red)|arrest|shock|failure|acidosis|hypoxemia|respiratory\s+failure|cardiac\s+arrest|sepsis|stroke)/i.test(contextWindow) ||
              /\b(acidosis|hypoxemia|respiratory\s+failure|cardiac\s+arrest|sepsis|stroke|shock|arrest)\b/i.test(titleLower) ||
              /(carbon\s+monoxide|co\s+poisoning|poisoning)/i.test(titleLower) ||
              /\*\*critical\*\*|\[critical\]|#critical|priority:\s*critical/i.test(contextWindow)) {
            priority = 'critical';
          }
          // High priority indicators  
          else if (/(high|priority|important|significant|acute|unstable|deteriorating)/i.test(contextWindow)) {
            priority = 'high';
          }
          // Low priority indicators
          else if (/(low|minor|routine|stable|chronic|maintenance|follow.?up)/i.test(contextWindow)) {
            priority = 'low';
          }
          // Default remains 'medium'

          // Create new issue
          currentIssue = {
            id: `issue-${issueCounter++}`,
            title: cleanTitle,
            content: '',
            priority,
            sections: [],
            completed: false
          };
          
          currentContent = [];
          continue;
        } else {
          // This is a header but not a medical issue - include it in current issue content
          if (currentIssue) {
            currentContent.push(line);
          }
          continue;
        }
      }

      // Check non-header lines for emoji patterns and strict issue patterns
      if (trimmedLine && /^[🚨⚠️🔥⭐💀❗🟥🟨🟦🟩\s]*(Issue|Problem|Condition|Diagnosis)\s+\d+\s*:\s*.+$/i.test(trimmedLine)) {
        // This is a numbered issue line that's not formatted as a header
        const issueMatch = trimmedLine.match(/^[🚨⚠️🔥⭐💀❗🟥🟨🟦🟩\s]*(Issue|Problem|Condition|Diagnosis)\s+\d+\s*:\s*(.+)$/i);
        if (issueMatch) {
          // Save previous issue if exists
          if (currentIssue && currentContent.length > 0) {
            currentIssue.content = currentContent.join('\n');
            issues.push(currentIssue);
          }

          // Clean up the title - remove management suffixes (group 2 is now the title)
          const cleanTitle = issueMatch[2].trim();
          
          // Skip if it's a management section
          if (/\s+(Management|Treatment|Therapy|Care|Plan|Protocol|Approach|Strategy)$/i.test(cleanTitle)) {
            if (currentIssue) {
              currentContent.push(line);
            }
            continue;
          }

          // Enhanced priority detection with more comprehensive keywords
          let priority: MedicalIssue['priority'] = 'medium';
          const contextWindow = lines.slice(Math.max(0, i-2), Math.min(lines.length, i + 25)).join(' ').toLowerCase();
          const titleLower = cleanTitle.toLowerCase();
          
          // Critical priority indicators - enhanced with common medical conditions and badges
          if (/(critical|severe|life.?threatening|emergent|immediate|urgent|stat|code\s+(blue|red)|arrest|shock|failure|acidosis|hypoxemia|respiratory\s+failure|cardiac\s+arrest|sepsis|stroke)/i.test(contextWindow) ||
              /\b(acidosis|hypoxemia|respiratory\s+failure|cardiac\s+arrest|sepsis|stroke|shock|arrest)\b/i.test(titleLower) ||
              /(carbon\s+monoxide|co\s+poisoning|poisoning)/i.test(titleLower) ||
              /\*\*critical\*\*|\[critical\]|#critical|priority:\s*critical/i.test(contextWindow)) {
            priority = 'critical';
          }
          // High priority indicators  
          else if (/(high|priority|important|significant|acute|unstable|deteriorating)/i.test(contextWindow)) {
            priority = 'high';
          }
          // Low priority indicators
          else if (/(low|minor|routine|stable|chronic|maintenance|follow.?up)/i.test(contextWindow)) {
            priority = 'low';
          }

          // Create new issue
          currentIssue = {
            id: `issue-${issueCounter++}`,
            title: cleanTitle,
            content: '',
            priority,
            sections: [],
            completed: false
          };
          
          currentContent = [];
          continue;
        }
      }

      // Add all other content to current issue only if we have one
      if (currentIssue) {
        currentContent.push(line);
      }
      // NO fallback - only display what AI actually provides
    }

    // Add the final issue
    if (currentIssue && currentContent.length > 0) {
      currentIssue.content = currentContent.join('\n');
      issues.push(currentIssue);
    }

    // Enhanced filtering - more flexible content validation
    const validIssues = issues.filter(issue => {
      const contentLength = issue.content ? issue.content.trim().length : 0;
      const hasSubstantialContent = contentLength > 30; // Reduced from 50 for flexibility
      const hasActionableContent = /\b(monitor|administer|check|assess|consider|review|discontinue|start|stop|increase|decrease|titrate)\b/i.test(issue.content || '');
      
      return hasSubstantialContent || hasActionableContent;
    });

    // Keep all issues collapsed by default
    // validIssues.forEach(issue => {
    //   if (issue.priority === 'critical' || issue.priority === 'high') {
    //     setExpandedIssues(prev => new Set([...prev, issue.id]));
    //   }
    // });

    // Debug logging for parsed issues

    return validIssues;
  }, [actionPlan]);

  // Debug logging for medical issues
  useEffect(() => {
    if (medicalIssues.length > 0) {
      // Debug logging removed
    }
  }, [medicalIssues]);

  // Toggle issue expansion
  const toggleIssue = (issueId: string) => {
    setExpandedIssues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      return newSet;
    });
  };

  // Toggle issue completion
  const toggleIssueCompletion = (issueId: string) => {
    setCompletedIssues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      return newSet;
    });
    
    if (onIssueComplete) {
      onIssueComplete(issueId);
    }
  };

  // Copy action plan to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(actionPlan);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {

    }
  };

  if (!actionPlan || medicalIssues.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">{t('chat.actionPlan.noActionPlan')}</h3>
        <p className="text-sm text-gray-500">{t('chat.actionPlan.noActionPlanDesc')}</p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Premium Header with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-2xl shadow-2xl">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3Cpath d='M15 15l15 15-15 15-15-15z'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        {/* Floating Gradient Orbs */}
        <div className="absolute top-4 right-8 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-6 left-12 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-lg animate-bounce" style={{ animationDuration: '3s' }} />
        
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            {/* Left Section - Icon and Title */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                {/* Success indicator */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  {t('chat.actionPlan.title')}
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-400/20 rounded-full border border-amber-300/30">
                    <Star className="h-3 w-3 text-amber-200" />
                    <span className="text-xs font-medium text-amber-100">{t('chat.actionPlan.aiEnhanced')}</span>
                  </div>
                </h2>
                <p className="text-blue-100 text-sm">
                  {t('chat.actionPlan.subtitle')}
                </p>
              </div>
            </div>
            
            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCopy}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-200 h-9 px-4"
                size="sm"
              >
                {copySuccess ? (
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-300" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                <span className="text-sm font-medium">
                  {copySuccess ? t('chat.actionPlan.copied') : t('chat.actionPlan.copy')}
                </span>
              </Button>

              <Button
                onClick={() => window.print()}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-200 h-9 px-4"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">{t('chat.actionPlan.export')}</span>
              </Button>
              
              <Button
                onClick={() => setShowRawContent(!showRawContent)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-200 h-9 px-4"
                size="sm"
              >
                {showRawContent ? (
                  <EyeOff className="h-4 w-4 mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                <span className="text-sm font-medium">
                  {showRawContent ? t('chat.actionPlan.hideRaw') : t('chat.actionPlan.showRaw')}
                </span>
              </Button>
            </div>
          </div>
          
        </div>
      </div>

      {/* Raw Content Display (toggle) */}
      {showRawContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('chat.actionPlan.rawContentTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                {actionPlan}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical Issues */}
      <div className="space-y-4">
        {medicalIssues.map((issue) => {
          const isExpanded = expandedIssues.has(issue.id);
          const isCompleted = completedIssues.has(issue.id);
          const config = issueConfig[issue.priority];
          const Icon = config.icon;
          
          return (
            <Card key={issue.id} className={cn("overflow-hidden", config.borderColor, isCompleted && "opacity-75")}>
              {/* Issue Header */}
              <CardHeader 
                className={cn("cursor-pointer hover:bg-gray-50 transition-colors", config.bgColor)}
                onClick={() => toggleIssue(issue.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Priority Icon */}
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", 
                      issue.priority === 'critical' ? 'bg-red-500' :
                      issue.priority === 'high' ? 'bg-orange-500' :
                      issue.priority === 'medium' ? 'bg-blue-500' : 'bg-green-500'
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    {/* Issue Title and Priority */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className={cn("text-lg", config.color, isCompleted && "line-through")}>
                          {issue.title}
                        </CardTitle>
                        <Badge className={cn("text-xs", priorityConfig[issue.priority].badge)}>
                          {t(`chat.actionPlan.priority.${issue.priority}`)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {isCompleted ? t('chat.actionPlan.issueAddressed') : t('chat.actionPlan.clickToViewDetails')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Completion Toggle */}
                    {editable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleIssueCompletion(issue.id);
                        }}
                        className={cn(
                          "w-8 h-8 p-0 rounded-full border-2 transition-all",
                          isCompleted 
                            ? "bg-green-500 border-green-500 text-white hover:bg-green-600" 
                            : "border-gray-300 hover:border-green-400"
                        )}
                      >
                        {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                      </Button>
                    )}
                    
                    {/* Expand Arrow */}
                    <ArrowRight className={cn(
                      "h-5 w-5 transition-transform",
                      isExpanded && "rotate-90"
                    )} />
                  </div>
                </div>
              </CardHeader>

              {/* Issue Content */}
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className={cn(
                    "rounded-lg border-l-4 pl-6 py-4",
                    issue.priority === 'critical' ? 'border-red-500 bg-red-50/50' :
                    issue.priority === 'high' ? 'border-orange-500 bg-orange-50/50' :
                    issue.priority === 'medium' ? 'border-blue-500 bg-blue-50/50' : 'border-green-500 bg-green-50/50',
                    isCompleted && "opacity-75"
                  )}>
                    <MedicalMarkdownRenderer 
                      content={issue.content}
                      className="max-w-none"
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

    </div>
  );
};