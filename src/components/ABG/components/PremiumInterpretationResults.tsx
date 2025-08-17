import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Brain,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Eye,
  BookOpen,
  Download,
  Share2,
  Lightbulb,
  Target,
  ArrowRight,
  Loader2,
  Copy,
  Edit2
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';

interface InterpretationData {
  primaryDisorder?: string;
  compensation?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  clinicalSignificance?: string;
  additionalFindings?: string[];
  recommendations?: string[];
  oxygenationStatus?: string;
  ventilationStatus?: string;
  acidBaseBalance?: {
    disorder: string;
    compensation: string;
    expectedCompensation?: string;
  };
}

interface PremiumInterpretationResultsProps {
  interpretation?: InterpretationData | string; // Allow both structured data and raw string
  isLoading?: boolean;
  error?: string;
  className?: string;
  // Analysis metrics to display at the top
  analysisMetrics?: {
    confidence?: number;
    processingTimeMs?: number;
    quality?: string;
  };
  // New props for header integration
  onCopy?: () => void;
  onShare?: () => void;
  onEdit?: (interpretation: string) => void;
  editable?: boolean;
  showHeaderActions?: boolean;
}

interface InterpretationSection {
  title: string;
  content: any;
  icon: React.ElementType;
  gradient: string;
  priority: 'high' | 'medium' | 'low';
}

export const PremiumInterpretationResults: React.FC<PremiumInterpretationResultsProps> = ({
  interpretation,
  isLoading = false,
  error,
  className,
  analysisMetrics,
  onCopy,
  onShare,
  onEdit,
  editable = false,
  showHeaderActions = false
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['primary']));
  const [copySuccess, setCopySuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  useEffect(() => {
    if (interpretation || isLoading) {
      setIsVisible(true);
      // For raw string interpretation, expand all sections by default
      if (typeof interpretation === 'string') {
        // Expand all sections to show complete interpretation immediately
        const sectionCount = interpretation.split(/^#{2,3}\s+/gm).filter(section => section.trim()).length;
        const allSections = Array.from({ length: sectionCount }, (_, i) => `section-${i}`);
        setExpandedSections(new Set(allSections));
      }
    }
  }, [interpretation, isLoading]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Get confidence level styling
  const getConfidenceLevel = (confidence?: number) => {
    if (!confidence) return { level: 'Unknown', color: 'text-slate-500', gradient: 'from-slate-400 to-slate-500', description: 'Confidence not available' };
    
    if (confidence >= 0.9) return { 
      level: 'Excellent', 
      color: 'text-emerald-700', 
      gradient: 'from-emerald-500 to-emerald-600',
      description: 'Very high confidence in analysis'
    };
    if (confidence >= 0.8) return { 
      level: 'High', 
      color: 'text-blue-700', 
      gradient: 'from-blue-500 to-blue-600',
      description: 'High confidence in analysis'
    };
    if (confidence >= 0.7) return { 
      level: 'Good', 
      color: 'text-yellow-700', 
      gradient: 'from-yellow-500 to-yellow-600',
      description: 'Good confidence in analysis'
    };
    return { 
      level: 'Moderate', 
      color: 'text-orange-700', 
      gradient: 'from-orange-500 to-orange-600',
      description: 'Moderate confidence - review recommended'
    };
  };

  // Format processing time
  const formatProcessingTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Action button handlers
  const handleCopy = async () => {
    const textToCopy = typeof interpretation === 'string' ? interpretation : JSON.stringify(interpretation, null, 2);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      if (onCopy) {
        onCopy();
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    }
  };

  const handleStartEdit = () => {
    if (interpretation && typeof interpretation === 'string') {
      setEditedText(interpretation);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(editedText);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Get severity styling
  const getSeverityConfig = (severity?: string) => {
    switch (severity) {
      case 'mild':
        return {
          gradient: 'from-emerald-500 to-teal-500',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          textColor: 'text-emerald-700'
        };
      case 'moderate':
        return {
          gradient: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700'
        };
      case 'severe':
        return {
          gradient: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700'
        };
      default:
        return {
          gradient: 'from-blue-500 to-purple-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700'
        };
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className={cn("abg-premium", className)}>
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50 rounded-2xl border border-white/20 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-blue-400/10 to-emerald-400/10 animate-pulse" />
          
          <div className="relative p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Brain className="h-16 w-16 text-purple-500 animate-pulse" />
                <div className="absolute inset-0 bg-purple-500 opacity-20 rounded-full animate-ping" />
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-slate-800">
                Generating Clinical Interpretation
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Our advanced AI is analyzing the blood gas parameters and generating a comprehensive clinical interpretation.
              </p>
              
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={cn("abg-premium", className)}>
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200 shadow-xl">
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-red-800">Interpretation Failed</h3>
              <p className="text-red-600 max-w-md mx-auto">{error}</p>
              
              <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
                <Loader2 className="h-4 w-4 mr-2" />
                Retry Interpretation
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No interpretation state
  if (!interpretation) {
    return (
      <div className={cn("abg-premium", className)}>
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 shadow-lg">
          <div className="p-8 text-center">
            <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No clinical interpretation available</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle raw string interpretation (from webhooks)
  if (typeof interpretation === 'string') {
    return (
      <div className={cn(
        "abg-premium transition-all duration-700 transform",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className
      )}>
        <div className="space-y-6">

          {/* Analysis Metrics Section */}
          {analysisMetrics && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  {t('abg.interpretation.metrics', 'Analysis Metrics')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Confidence Score */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getConfidenceLevel(analysisMetrics.confidence).gradient} rounded-xl flex items-center justify-center`}>
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm font-medium">{t('abg.interpretation.confidence', 'Confidence')}</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {analysisMetrics.confidence ? `${Math.round(analysisMetrics.confidence * 100)}%` : 'N/A'}
                      </p>
                      <p className="text-slate-500 text-xs">{getConfidenceLevel(analysisMetrics.confidence).level}</p>
                    </div>
                  </div>

                  {/* Processing Time */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm font-medium">{t('abg.interpretation.processingTime', 'Processing Time')}</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {analysisMetrics.processingTimeMs ? formatProcessingTime(analysisMetrics.processingTimeMs) : 'N/A'}
                      </p>
                      <p className="text-slate-500 text-xs">{t('abg.interpretation.lightningFast', 'Lightning fast')}</p>
                    </div>
                  </div>

                  {/* Analysis Quality */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm font-medium">{t('abg.interpretation.quality', 'Quality')}</p>
                      <p className="text-2xl font-bold text-slate-800">{analysisMetrics.quality || 'Premium'}</p>
                      <p className="text-slate-500 text-xs">{t('abg.search.aiPowered', 'AI-Powered')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Professional Interpretation Content */}
          <div className="space-y-6">
            {interpretation.split(/^#{2,3}\s+/gm).filter(section => section.trim()).map((section, index) => {
              const lines = section.trim().split('\n');
              let title = lines[0];
              
              // Clean up the title - remove any remaining markdown
              title = title.replace(/\*\*.*$/, '').replace(/^#+\s*/, '').trim();
              
              // Skip the main header - check for # Blood Gas Analysis Report 
              if (title.includes('Blood Gas Analysis Report') || title.includes('Blood Gas Interpretation') || title === 'Arterial Blood Gas Interpretation') {
                return null;
              }
              
              const content = lines.slice(1).join('\n').trim();
              
              if (!title || !content) return null;

              // Determine section type and styling
              let sectionConfig = {
                icon: Activity,
                gradient: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200'
              };

              if (title.includes('Acid-Base')) {
                sectionConfig = { icon: Zap, gradient: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' };
              } else if (title.includes('Oxygenation')) {
                sectionConfig = { icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' };
              } else if (title.includes('Electrolyte') || title.includes('Metabolite')) {
                sectionConfig = { icon: Target, gradient: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
              } else if (title.includes('Summary') || title.includes('Important') || title.includes('Most Important Details')) {
                sectionConfig = { icon: AlertTriangle, gradient: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' };
              }

              const IconComponent = sectionConfig.icon;

              return (
                <div key={index} className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                  <div className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                       onClick={() => toggleSection(`section-${index}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${sectionConfig.gradient} rounded-xl flex items-center justify-center`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                          <p className="text-slate-600">Clinical findings and analysis</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {!showHeaderActions && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                              className="border-slate-300 hover:bg-slate-50"
                            >
                              {copySuccess ? (
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                              ) : (
                                <Copy className="h-4 w-4 mr-2" />
                              )}
                              {copySuccess ? 'Copied!' : 'Copy'}
                            </Button>
                            
                            {editable && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
                                className="border-slate-300 hover:bg-slate-50"
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleShare(); }}
                              className="border-slate-300 hover:bg-slate-50"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </>
                        )}
                        <ArrowRight className={cn(
                          "h-5 w-5 text-slate-400 transition-transform",
                          expandedSections.has(`section-${index}`) && "rotate-90"
                        )} />
                      </div>
                    </div>
                  </div>

                  {expandedSections.has(`section-${index}`) && (
                    <div className="px-6 pb-6 animate-in slide-in-from-top-2">
                      <div className={cn("p-6 rounded-xl border", sectionConfig.bgColor, sectionConfig.borderColor)}>
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: content
                              // FIRST: Remove file paths that start with /var/folders/, /tmp/, or contain TemporaryItems
                              .replace(/\/var\/folders\/[^\s]+/g, '')
                              .replace(/\/tmp\/[^\s]+/g, '')
                              .replace(/\/Users\/[^\/]+\/[^\s]*TemporaryItems[^\s]*/g, '')
                              .replace(/\/[A-Za-z0-9_\-]+\/TemporaryItems\/[^\s]+/g, '')
                              // Remove any standalone file path patterns
                              .replace(/^[^\n]*\/[A-Za-z0-9_\-]+\/[A-Za-z0-9_\-]+\/[A-Za-z0-9_\-\.\/]+\.png[^\n]*$/gm, '')
                              // Format priority alerts - handle multiple AI output formats
                              // Format 1: [RED] Urgent Concern:
                              .replace(/•?\s*\[RED\]\s*([^:]+):/gi, 
                                '<div class="flex items-center gap-3 mb-3 p-3 rounded-lg border bg-red-100 text-red-800 border-red-200"><div class="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"><span class="text-xs font-bold text-white">!</span></div><strong class="font-semibold text-red-800">$1:</strong></div>')
                              .replace(/•?\s*\[YELLOW\]\s*([^:]+):/gi, 
                                '<div class="flex items-center gap-3 mb-3 p-3 rounded-lg border bg-yellow-100 text-yellow-800 border-yellow-200"><div class="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0"><span class="text-xs font-bold text-white">!</span></div><strong class="font-semibold text-yellow-800">$1:</strong></div>')
                              .replace(/•?\s*\[GREEN\]\s*([^:]+):/gi, 
                                '<div class="flex items-center gap-3 mb-3 p-3 rounded-lg border bg-emerald-100 text-emerald-800 border-emerald-200"><div class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><span class="text-xs font-bold text-white">✓</span></div><strong class="font-semibold text-emerald-800">$1:</strong></div>')
                              // Format 2: Red (Urgent Concern):
                              .replace(/•?\s*Red\s*\(([^)]+)\):/gi, 
                                '<div class="flex items-center gap-3 mb-3 p-3 rounded-lg border bg-red-100 text-red-800 border-red-200"><div class="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"><span class="text-xs font-bold text-white">!</span></div><strong class="font-semibold text-red-800">$1:</strong></div>')
                              .replace(/•?\s*Yellow\s*\(([^)]+)\):/gi, 
                                '<div class="flex items-center gap-3 mb-3 p-3 rounded-lg border bg-yellow-100 text-yellow-800 border-yellow-200"><div class="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0"><span class="text-xs font-bold text-white">!</span></div><strong class="font-semibold text-yellow-800">$1:</strong></div>')
                              .replace(/•?\s*Green\s*\(([^)]+)\):/gi, 
                                '<div class="flex items-center gap-3 mb-3 p-3 rounded-lg border bg-emerald-100 text-emerald-800 border-emerald-200"><div class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><span class="text-xs font-bold text-white">✓</span></div><strong class="font-semibold text-emerald-800">$1:</strong></div>')
                              // Format 3: **[Red] Urgent Concern:**
                              .replace(/•?\s*\*\*\[Red\]\s*([^*]+)\*\*:/gi, 
                                '<div class="flex items-center gap-3 mb-3 p-3 rounded-lg border bg-red-100 text-red-800 border-red-200"><div class="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"><span class="text-xs font-bold text-white">!</span></div><strong class="font-semibold text-red-800">$1:</strong></div>')
                              .replace(/•?\s*\*\*\[Yellow\]\s*([^*]+)\*\*:/gi, 
                                '<div class="flex items-center gap-3 mb-3 p-3 rounded-lg border bg-yellow-100 text-yellow-800 border-yellow-200"><div class="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0"><span class="text-xs font-bold text-white">!</span></div><strong class="font-semibold text-yellow-800">$1:</strong></div>')
                              .replace(/•?\s*\*\*\[Green\]\s*([^*]+)\*\*:/gi, 
                                '<div class="flex items-center gap-3 mb-3 p-3 rounded-lg border bg-emerald-100 text-emerald-800 border-emerald-200"><div class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><span class="text-xs font-bold text-white">✓</span></div><strong class="font-semibold text-emerald-800">$1:</strong></div>')
                              // Format medical values with units and ions
                              .replace(/\*\*([0-9\.]+\s*(?:mmHg|mmol\/L|g\/dL|kPa|%))\*\*/g, 
                                '<span class="inline-flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-md font-mono text-sm font-semibold text-slate-800">$1</span>')
                              // Format ion values like Na⁺: 124 mmol/L, Ca²⁺: 1.06 mmol/L
                              .replace(/([A-Za-z]+[⁺²⁻]+):\s*([0-9\.]+\s*mmol\/L)/g, 
                                '<span class="inline-flex items-center gap-2 px-2 py-1 bg-blue-100 rounded-md font-mono text-sm font-semibold text-blue-800">$1: $2</span>')
                              // Format regular medical values without asterisks
                              .replace(/\b([0-9\.]+\s*(?:mmHg|mmol\/L|g\/dL|kPa|%))\b/g, 
                                '<span class="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 rounded text-sm font-mono text-slate-700">$1</span>')
                              // Format other bold text
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
                              // Format bullet points with bold headers
                              .replace(/^-\s+\*\*(.*?)\*\*:\s*(.*?)$/gm, 
                                '<div class="flex items-start gap-3 mb-3 p-3 bg-white rounded-lg border border-slate-200"><div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div><div><strong class="font-semibold text-slate-900">$1:</strong> <span class="text-slate-700">$2</span></div></div>')
                              // Remove standalone bullet points that were processed as priority badges
                              .replace(/^\s*•\s*$/gm, '')
                              // Format regular bullet points (but skip ones that are now badges)
                              .replace(/^-\s+(.*?)$/gm, 
                                '<div class="flex items-start gap-3 mb-2"><div class="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div><span class="text-slate-700">$1</span></div>')
                              // Handle any remaining ### headers that might be within content
                              .replace(/^###\s+(.*?)$/gm, '<h4 class="text-lg font-bold text-slate-800 mb-3 mt-6">$1</h4>')
                              // Format paragraphs properly
                              .replace(/\n\n+/g, '</p><p class="mb-4 text-slate-700 leading-relaxed">')
                              .replace(/^/, '<p class="mb-4 text-slate-700 leading-relaxed">')
                              .replace(/$/, '</p>')
                              // Clean up empty paragraphs
                              .replace(/<p class="mb-4 text-slate-700 leading-relaxed"><\/p>/g, '')
                              // Clean up paragraphs that only contain div elements
                              .replace(/<p class="mb-4 text-slate-700 leading-relaxed">(<div.*?<\/div>)<\/p>/g, '$1')
                              // Final cleanup: remove any remaining unwanted file paths
                              .replace(/\/[A-Za-z0-9_\-\.\/]*[Tt]emporary[A-Za-z0-9_\-\.\/]*/g, '')
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const severityConfig = getSeverityConfig((interpretation as InterpretationData).severity);

  return (
    <div className={cn(
      "abg-premium transition-all duration-700 transform",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      className
    )}>
      <div className="space-y-6">
        {/* Detailed Sections */}
        <div className="space-y-6">
          {/* Primary Analysis */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div 
              className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleSection('primary')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${severityConfig.gradient} rounded-xl flex items-center justify-center`}>
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Primary Analysis</h3>
                    <p className="text-slate-600">Core disorder identification and clinical significance</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!showHeaderActions && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="border-slate-300 hover:bg-slate-50"
                      >
                        {copySuccess ? (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copySuccess ? 'Copied!' : 'Copy'}
                      </Button>
                      
                      {editable && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStartEdit}
                          className="border-slate-300 hover:bg-slate-50"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="border-slate-300 hover:bg-slate-50"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </>
                  )}
                  <ArrowRight className={cn(
                    "h-5 w-5 text-slate-400 transition-transform",
                    expandedSections.has('primary') && "rotate-90"
                  )} />
                </div>
              </div>
            </div>

            {expandedSections.has('primary') && (
              <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {interpretation.primaryDisorder && (
                    <div className={cn("p-4 rounded-xl border", severityConfig.bgColor, severityConfig.borderColor)}>
                      <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                        Primary Disorder
                      </h4>
                      <p className={cn("font-medium", severityConfig.textColor)}>{interpretation.primaryDisorder}</p>
                    </div>
                  )}

                  {interpretation.clinicalSignificance && (
                    <div className="p-4 rounded-xl border bg-blue-50 border-blue-200">
                      <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        Clinical Significance
                      </h4>
                      <p className="text-blue-700">{interpretation.clinicalSignificance}</p>
                    </div>
                  )}
                </div>

                {interpretation.severity && (
                  <div className={cn("p-6 rounded-xl border", severityConfig.bgColor, severityConfig.borderColor)}>
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className={cn("h-6 w-6", severityConfig.textColor)} />
                      <h4 className="font-semibold text-slate-800">Severity Assessment</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={cn(
                        "px-4 py-2 text-sm font-semibold",
                        interpretation.severity === 'mild' && "bg-emerald-100 text-emerald-700",
                        interpretation.severity === 'moderate' && "bg-yellow-100 text-yellow-700",
                        interpretation.severity === 'severe' && "bg-red-100 text-red-700"
                      )}>
                        {interpretation.severity.charAt(0).toUpperCase() + interpretation.severity.slice(1)} Severity
                      </Badge>
                      <span className="text-slate-600">Requires appropriate clinical attention</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* System Status */}
          {(interpretation.oxygenationStatus || interpretation.ventilationStatus || interpretation.acidBaseBalance) && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleSection('systems')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Physiological Systems</h3>
                      <p className="text-slate-600">Oxygenation, ventilation, and acid-base status</p>
                    </div>
                  </div>
                  <ArrowRight className={cn(
                    "h-5 w-5 text-slate-400 transition-transform",
                    expandedSections.has('systems') && "rotate-90"
                  )} />
                </div>
              </div>

              {expandedSections.has('systems') && (
                <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {interpretation.oxygenationStatus && (
                      <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200">
                        <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-emerald-600" />
                          Oxygenation
                        </h4>
                        <p className="text-emerald-700 font-medium">{interpretation.oxygenationStatus}</p>
                      </div>
                    )}

                    {interpretation.ventilationStatus && (
                      <div className="p-4 rounded-xl border bg-blue-50 border-blue-200">
                        <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                          <Activity className="h-5 w-5 text-blue-600" />
                          Ventilation
                        </h4>
                        <p className="text-blue-700 font-medium">{interpretation.ventilationStatus}</p>
                      </div>
                    )}

                    {interpretation.acidBaseBalance && (
                      <div className="p-4 rounded-xl border bg-purple-50 border-purple-200">
                        <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                          <Zap className="h-5 w-5 text-purple-600" />
                          Acid-Base Balance
                        </h4>
                        <p className="text-purple-700 font-medium">{interpretation.acidBaseBalance.disorder}</p>
                        <p className="text-sm text-purple-600 mt-1">{interpretation.acidBaseBalance.compensation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Additional Findings */}
          {interpretation.additionalFindings && interpretation.additionalFindings.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleSection('findings')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Additional Findings</h3>
                      <p className="text-slate-600">Secondary observations and clinical correlations</p>
                    </div>
                  </div>
                  <ArrowRight className={cn(
                    "h-5 w-5 text-slate-400 transition-transform",
                    expandedSections.has('findings') && "rotate-90"
                  )} />
                </div>
              </div>

              {expandedSections.has('findings') && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2">
                  <div className="space-y-3">
                    {interpretation.additionalFindings.map((finding, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{finding}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clinical Recommendations */}
          {interpretation.recommendations && interpretation.recommendations.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleSection('recommendations')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Clinical Recommendations</h3>
                      <p className="text-slate-600">Suggested actions and monitoring considerations</p>
                    </div>
                  </div>
                  <ArrowRight className={cn(
                    "h-5 w-5 text-slate-400 transition-transform",
                    expandedSections.has('recommendations') && "rotate-90"
                  )} />
                </div>
              </div>

              {expandedSections.has('recommendations') && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2">
                  <div className="space-y-3">
                    {interpretation.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Lightbulb className="h-3 w-3 text-indigo-600" />
                        </div>
                        <p className="text-indigo-700 leading-relaxed font-medium">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};