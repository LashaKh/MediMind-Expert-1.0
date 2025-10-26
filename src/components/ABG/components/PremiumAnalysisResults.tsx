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

  // Loading State - Beautiful Theme-Styled Progress Indicator
  if (isLoading) {
    return (
      <div className={cn("abg-premium", className)}>
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#90cdf4]/5 to-[#63b3ed]/10 rounded-2xl border-2 border-[#63b3ed]/30 shadow-2xl">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d]/5 via-[#2b6cb0]/5 to-[#63b3ed]/5 animate-pulse" />

          {/* Subtle pattern background */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #2b6cb0 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />

          <div className="relative p-8 sm:p-10">
            {/* Icon Section */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                {/* Main brain icon with theme gradient */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] flex items-center justify-center shadow-2xl shadow-[#2b6cb0]/20">
                  <Brain className="h-10 w-10 text-white animate-pulse" />
                </div>

                {/* Pulsing ring effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#63b3ed]/30 to-[#2b6cb0]/30 rounded-2xl animate-ping" />

                {/* Sparkles accent */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#63b3ed] to-[#90cdf4] rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="text-center space-y-4 max-w-lg mx-auto">
              {/* Title with theme gradient */}
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] bg-clip-text text-transparent">
                {t('abg.analysis.loading.title', 'AI Analysis in Progress')}
              </h3>

              {/* Subtitle with better typography */}
              <p className="text-[#6c757d] text-base sm:text-lg leading-relaxed">
                {t('abg.analysis.loading.subtitle', 'Advanced AI vision technology is analyzing your blood gas report with precision.')}
              </p>

              {/* Animated dots with theme colors */}
              <div className="flex justify-center pt-2">
                <div className="flex space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] rounded-full animate-bounce shadow-lg shadow-[#1a365d]/30" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 bg-gradient-to-br from-[#2b6cb0] to-[#63b3ed] rounded-full animate-bounce shadow-lg shadow-[#2b6cb0]/30" style={{ animationDelay: '150ms' }} />
                  <div className="w-3 h-3 bg-gradient-to-br from-[#63b3ed] to-[#90cdf4] rounded-full animate-bounce shadow-lg shadow-[#63b3ed]/30" style={{ animationDelay: '300ms' }} />
                </div>
              </div>

              {/* Status text */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#90cdf4]/20 to-[#63b3ed]/20 border border-[#63b3ed]/30 rounded-full">
                  <div className="w-2 h-2 bg-[#2b6cb0] rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-[#1a365d]">{t('abg.analysis.loading.processing', 'Processing...')}</span>
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