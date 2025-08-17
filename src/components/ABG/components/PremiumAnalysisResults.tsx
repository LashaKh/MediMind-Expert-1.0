import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Edit2, 
  Save, 
  X, 
  Copy, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Brain,
  Sparkles,
  BarChart3,
  Eye,
  Share2
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import { parseABGAnalysis } from '../../../services/abgVisionService';

// Format medical text for better readability with support for structured OCR output
const formatMedicalText = (text: string): React.ReactNode => {
  if (!text) return null;
  
  // Debug: Log the text being formatted
  // console.log('🎨 UI Formatting Text (first 300 chars):', text.substring(0, 300));
  
  const lines = text.split('\n').filter(line => line.trim());
  const formattedLines: React.ReactNode[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) return;
    
    // Check if this is a section header (ends with :, not a parameter)
    const isSectionHeader = (
      trimmedLine.endsWith(':') && 
      !trimmedLine.match(/^-\s/) && // not a bulleted item
      (trimmedLine.includes('Parameters') || 
       trimmedLine.includes('Values') || 
       trimmedLine.includes('Status') || 
       trimmedLine.includes('Report') || 
       trimmedLine.includes('Analysis') ||
       trimmedLine.length > 15) // likely a section header
    );
    
    // Check if this is a bulleted parameter (starts with -)
    const isBulletedParam = trimmedLine.startsWith('- ');
    
    if (isSectionHeader) {
      // Section headers
      formattedLines.push(
        <div key={index} className="font-bold text-lg text-slate-900 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg mt-4 first:mt-0 border-l-4 border-blue-500">
          {trimmedLine.replace(':', '')}
        </div>
      );
    } else if (isBulletedParam) {
      // Handle bulleted parameters from our structured OCR output
      const paramContent = trimmedLine.substring(2); // Remove "- "
      
      // Try to parse parameter: value pattern
      const paramMatch = paramContent.match(/^([^:]+):\s*(.+)$/);
      if (paramMatch) {
        const [, parameter, value] = paramMatch;
        
        // Extract units and ranges from value
        const valueMatch = value.match(/^([\d.,-]+)\s*([a-zA-Z/%]+)?(?:\s*\[([^\]]+)\])?/);
        
        formattedLines.push(
          <div key={index} className="flex flex-wrap items-center gap-2 py-2 px-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
            <span className="font-medium text-slate-800 min-w-0 flex-1">{parameter.trim()}</span>
            <div className="flex items-center gap-2">
              {valueMatch ? (
                <>
                  <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {valueMatch[1]}{valueMatch[2] ? ` ${valueMatch[2]}` : ''}
                  </span>
                  {valueMatch[3] && (
                    <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded">
                      [{valueMatch[3]}]
                    </span>
                  )}
                </>
              ) : (
                <span className="font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded">{value}</span>
              )}
            </div>
          </div>
        );
      } else {
        // Simple bulleted item
        formattedLines.push(
          <div key={index} className="py-1 px-3 text-slate-700 bg-slate-50 rounded border-l-2 border-slate-300">
            {paramContent}
          </div>
        );
      }
    } else if (trimmedLine.includes(':')) {
      // Handle other key:value pairs
      const [key, ...valueParts] = trimmedLine.split(':');
      const value = valueParts.join(':').trim();
      
      formattedLines.push(
        <div key={index} className="flex flex-wrap items-center gap-2 py-2 px-3 bg-white rounded-lg border border-slate-200">
          <span className="font-medium text-slate-800 min-w-0 flex-1">{key.trim()}</span>
          <span className="font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded">{value}</span>
        </div>
      );
    } else {
      // Handle general text and unstructured headers
      const isGeneralHeader = (
        trimmedLine.toUpperCase() === trimmedLine || 
        trimmedLine.includes('RADIOMETER') || 
        trimmedLine.includes('Patient Report') ||
        trimmedLine.includes('Blood Gas Analysis Report') ||
        trimmedLine.includes('Identifications')
      );
      
      formattedLines.push(
        <div key={index} className={cn(
          "py-1",
          isGeneralHeader 
            ? "font-bold text-xl text-slate-900 bg-gradient-to-r from-emerald-50 to-blue-50 px-3 py-3 rounded-lg border-l-4 border-emerald-500 mb-2" 
            : "text-slate-700 px-1"
        )}>
          {trimmedLine}
        </div>
      );
    }
  });
  
  return <div className="space-y-2">{formattedLines}</div>;
};

interface AnalysisResult {
  raw_analysis: string;
  gemini_confidence?: number;
  processing_time_ms?: number;
}

interface PremiumAnalysisResultsProps {
  result?: AnalysisResult;
  isLoading?: boolean;
  error?: string;
  onEdit?: (newAnalysis: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  editable?: boolean;
  className?: string;
  // New props for unified workflow
  isProcessingReanalysis?: boolean;
  showPreview?: boolean;
  // New props for header integration
  onCopy?: () => void;
  onShare?: () => void;
  showHeaderActions?: boolean;
}

// Confidence level mapping not currently displayed in UI

export const PremiumAnalysisResults: React.FC<PremiumAnalysisResultsProps> = ({
  result,
  isLoading = false,
  error,
  onEdit,
  onSave,
  onCancel,
  editable = false,
  className,
  isProcessingReanalysis = false,
  onCopy,
  onShare,
  showHeaderActions = false
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  // const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Parse the analysis text for better display
  const parsedAnalysis = useMemo(() => {
    if (!result?.raw_analysis) return null;
    return parseABGAnalysis(result.raw_analysis);
  }, [result?.raw_analysis]);

  // Confidence tier (currently unused in UI)
  // const confidenceData = useMemo(() => getConfidenceLevel(result?.gemini_confidence), [result?.gemini_confidence]);

  useEffect(() => {
    if (result) {
      setIsVisible(true);
    }
  }, [result]);

  // Start editing
  const handleStartEdit = () => {
    if (result) {
      setEditedText(result.raw_analysis);
      setIsEditing(true);
    }
  };

  // Save edited text and trigger re-analysis
  const handleSave = async () => {
    if (onEdit) {
      await onEdit(editedText);
    }
    if (onSave) {
      onSave();
    }
    setIsEditing(false);
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    if (onCancel) {
      onCancel();
    }
  };

  // Copy text to clipboard
  const handleCopy = async () => {
    if (result?.raw_analysis) {
      try {
        await navigator.clipboard.writeText(result.raw_analysis);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        if (onCopy) {
          onCopy();
        }
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  // Handle share action
  const handleShare = () => {
    if (onShare) {
      onShare();
    }
  };

  // Format processing time
  // const formatProcessingTime = (ms: number): string => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`);

  // Loading State
  if (isLoading) {
    return (
      <div className={cn("abg-premium", className)}>
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 rounded-2xl border border-white/20 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-emerald-400/10 animate-pulse" />
          
          <div className="relative p-6">
            <div className="flex items-center justify-center mb-5">
              <div className="relative">
                <Brain className="h-14 w-14 text-blue-500 animate-pulse" />
                <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-full animate-ping" />
                <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-purple-500 animate-pulse" />
              </div>
            </div>
            
            <div className="text-center space-y-3.5">
                <h3 className="text-xl font-bold text-slate-800">
                  {t('abg.analysis.loading.title', 'AI Analysis in Progress')}
                </h3>
              <p className="text-slate-600 max-w-md mx-auto text-sm">
                {t('abg.analysis.loading.subtitle', 'Our advanced AI is analyzing your blood gas report using state-of-the-art vision technology.')}
              </p>
              
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
          <div className="p-6">
            <div className="flex items-center justify-center mb-5">
              <div className="relative">
                <AlertCircle className="h-14 w-14 text-red-500" />
                <div className="absolute inset-0 bg-red-500 opacity-20 rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="text-center space-y-3.5">
              <h3 className="text-xl font-bold text-red-800">{t('abg.analysis.error.title', 'Analysis Failed')}</h3>
              <p className="text-red-600 max-w-md mx-auto text-sm">{error}</p>
              
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                {t('common.retry', 'Try Again')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No result state
  if (!result) {
    return (
      <div className={cn("abg-premium", className)}>
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 shadow-lg">
          <div className="p-6 text-center">
            <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">{t('abg.analysis.empty', 'No analysis results available')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("abg-premium", className)}>
      <div className={cn(
        "relative overflow-hidden transition-all duration-500 transform",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}>
        {/* Main Results Container */}
        <div className="space-y-6">
          {/* Analysis Content */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            {isEditing ? (
              /* Edit Mode */
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">{t('abg.analysis.edit.title', 'Edit Analysis')}</h3>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" disabled={isProcessingReanalysis} className="bg-gradient-to-r from-emerald-500 to-emerald-600">
                      {isProcessingReanalysis ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('abg.analysis.edit.reanalyzing', 'Re-analyzing...')}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t('abg.analysis.edit.save', 'Save & Re-analyze')}
                        </>
                      )}
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      {t('common.cancel', 'Cancel')}
                    </Button>
                  </div>
                </div>
                
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full h-56 p-3.5 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('abg.analysis.edit.placeholder', 'Enter analysis text...')}
                />
              </div>
            ) : (
              /* Display Mode */
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {t('abg.analysis.raw.title', 'Raw Analysis Data')}
                  </h3>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {t('abg.analysis.raw.badge', 'AI Generated')}
                    </Badge>
                    
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
                          {copySuccess ? t('common.copied', 'Copied!') : t('common.copy', 'Copy')}
                        </Button>
                        
                        {editable && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleStartEdit}
                            className="border-slate-300 hover:bg-slate-50"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            {t('common.edit', 'Edit')}
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShare}
                          className="border-slate-300 hover:bg-slate-50"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          {t('common.share', 'Share')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {parsedAnalysis ? (
                  /* Parsed Analysis Display */
                  <div className="space-y-5">
                    {parsedAnalysis.bloodGasValues && Object.keys(parsedAnalysis.bloodGasValues).length > 0 && (
                      <div>
                        <h4 className="text-base font-semibold text-slate-700 mb-3.5 flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          {t('abg.analysis.parameters.title', 'Blood Gas Parameters')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {Object.entries(parsedAnalysis.bloodGasValues).map(([name, value]) => (
                            <div key={name} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-700">{name}</span>
                                <span className="text-base font-bold text-blue-600">{value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Raw Text with Better Formatting */}
                    <div>
                      <h4 className="text-base font-semibold text-slate-700 mb-3.5 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        {t('abg.analysis.complete.title', 'Complete Analysis')}
                      </h4>
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                        <div className="text-sm text-slate-700">
                          {formatMedicalText(result.raw_analysis)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Fallback Raw Text Display */
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                    <div className="text-sm text-slate-700">
                      {formatMedicalText(result.raw_analysis)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};