import React, { useState } from 'react';
import {
  Brain,
  Clock,
  Copy,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  FileText,
  Stethoscope,
  Activity,
  Zap,
  Hash,
  Calendar,
  User,
  Shield,
  HeartHandshake,
  Trash2,
  Edit3,
  Settings,
  Sparkles,
  Crown,
  Star,
  Award,
  Gem,
  Wand2,
  Target,
  TrendingUp,
  Layers
} from 'lucide-react';
import { MedicalButton } from '../../ui/MedicalDesignSystem';
import { formatMarkdown, extractCleanText, hasMarkdownFormatting, countEmptyFields, hasEmptyFields, extractEmptyFieldNames } from '../../../utils/markdownFormatter';
import ReportEditCard from '../../ReportEditing/ReportEditCard';

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface MedicalAnalysisCardProps {
  analysis: ProcessingHistory;
  index: number;
  totalCount: number;
  onCopy?: (analysis: ProcessingHistory) => void;
  onDownload?: (analysis: ProcessingHistory) => void;
  onShare?: (analysis: ProcessingHistory) => void;
  onDelete?: (analysis: ProcessingHistory) => void;
  onEdit?: (analysis: ProcessingHistory) => void;
  enableEditing?: boolean;
  flowiseEndpoint?: string;
  sessionTitle?: string; // Add session title prop
}

const formatProcessingTime = (milliseconds: number): string => {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  return `${(milliseconds / 1000).toFixed(1)}s`;
};

const getAnalysisType = (instruction: string, model?: string): { type: string; icon: React.ElementType; color: string; isDiagnosis: boolean; endpoint: string } => {
  const lower = instruction.toLowerCase();
  
  // Check if this is a diagnosis report (by instruction content or custom template)
  const isDiagnosis = lower.includes('i50.0') || 
                      lower.includes('i24.9') ||
                      lower.includes('heart failure') ||
                      lower.includes('nstemi') ||
                      lower.includes('გულის შეგუბებითი უკმარისობა') ||
                      lower.includes('გულის მწვავე იშემიური ავადმყოფობა') ||
                      (lower.includes('diagnosis') && lower.includes('emergency room')) ||
                      lower.includes('template:'); // Add support for custom templates
  
  if (isDiagnosis) {
    if (lower.includes('i50.0') || lower.includes('heart failure') || lower.includes('გულის შეგუბებითი უკმარისობა')) {
      return { 
        type: 'Heart Failure ER Report (I50.0)', 
        icon: HeartHandshake, 
        color: 'from-[#2b6cb0] to-[#1a365d]', 
        isDiagnosis: true,
        endpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/89920f52-74cb-46bc-bf6c-b9099746dfe9'
      };
    }
    if (lower.includes('i24.9') || lower.includes('nstemi') || lower.includes('გულის მწვავე იშემიური ავადმყოფობა')) {
      return { 
        type: 'NSTEMI ER Report (I24.9)', 
        icon: HeartHandshake, 
        color: 'from-[#1a365d] to-[#2b6cb0]', 
        isDiagnosis: true,
        endpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/3db46c83-334b-4ffc-9112-5d30e43f7cf4'
      };
    }
    if (lower.includes('template:')) {
      // Extract template name from instruction like "Template: test 3"
      const templateName = instruction.split(':')[1]?.trim() || 'Custom Template';
      return { 
        type: `Custom Template Report: ${templateName}`, 
        icon: FileText, 
        color: 'from-[#63b3ed] to-[#90cdf4]', 
        isDiagnosis: true,
        endpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/f27756ae-aa35-4af3-afd1-f6912f9103cf'
      };
    }
    return { 
      type: 'Diagnosis ER Report', 
      icon: HeartHandshake, 
      color: 'from-[#63b3ed] to-[#90cdf4]', 
      isDiagnosis: true,
      endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy'
    };
  }
  
  if (lower.includes('symptom') || lower.includes('diagnos')) {
    return { type: 'Clinical Assessment', icon: Stethoscope, color: 'from-[#63b3ed] to-[#2b6cb0]', isDiagnosis: false, endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy' };
  }
  if (lower.includes('medication') || lower.includes('drug') || lower.includes('dosage')) {
    return { type: 'Medication Review', icon: Shield, color: 'from-[#2b6cb0] to-[#1a365d]', isDiagnosis: false, endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy' };
  }
  if (lower.includes('summary') || lower.includes('summarize')) {
    return { type: 'Clinical Summary', icon: FileText, color: 'from-[#90cdf4] to-[#63b3ed]', isDiagnosis: false, endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy' };
  }
  if (lower.includes('procedure') || lower.includes('treatment')) {
    return { type: 'Treatment Plan', icon: Activity, color: 'from-[#1a365d] to-[#63b3ed]', isDiagnosis: false, endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy' };
  }
  if (lower.includes('demographic') || lower.includes('history')) {
    return { type: 'Patient History', icon: User, color: 'from-[#90cdf4] to-[#2b6cb0]', isDiagnosis: false, endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy' };
  }
  
  return { type: 'General Analysis', icon: Brain, color: 'from-[#2b6cb0] to-[#90cdf4]', isDiagnosis: false, endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy' };
};

const copyToClipboard = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content);
  } catch (error) {

  }
};

const downloadAsFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const MedicalAnalysisCard: React.FC<MedicalAnalysisCardProps> = ({
  analysis,
  index,
  totalCount,
  onCopy,
  onDownload,
  onShare,
  onDelete,
  onEdit,
  enableEditing = false,
  flowiseEndpoint = '',
  sessionTitle = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(index === 0); // First card expanded by default
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<string | null>(null);
  const analysisType = getAnalysisType(analysis.userInstruction, analysis.model);
  const IconComponent = analysisType.icon;

  // Analysis type and icon setup

  // Calculate empty fields count
  const emptyFieldsCount = countEmptyFields(analysis.aiResponse);
  const hasEmptyFieldsPresent = hasEmptyFields(analysis.aiResponse);
  const emptyFieldNames = extractEmptyFieldNames(analysis.aiResponse);

  const handleCopy = async () => {
    // Debug: Log the actual content being processed
    
    let content: string;
    
    if (analysisType.isDiagnosis) {
      // For diagnosis reports, copy only the clean response text
      content = extractCleanText(analysis.aiResponse);
    } else {
      // For regular reports, copy full content
      content = `Medical Analysis Report
Generated: ${new Date(analysis.timestamp).toLocaleString()}
Analysis Type: ${analysisType.type}

Request: ${analysis.userInstruction}

AI Response:
${analysis.aiResponse}

Processing Details:

---
Generated by MediMind Expert AI Processing System`;
    }
    
    await copyToClipboard(content);
    onCopy?.(analysis);
  };

  const handleDownload = () => {
    const content = `Medical Analysis Report
Generated: ${new Date(analysis.timestamp).toLocaleString()}
Analysis Type: ${analysisType.type}

REQUEST:
${analysis.userInstruction}

AI ANALYSIS:
${analysis.aiResponse}

PROCESSING METADATA:

---
Generated by MediMind Expert
Medical AI Processing System`;
    
    const filename = `medical-analysis-${new Date(analysis.timestamp).toISOString().slice(0, 10)}-${index + 1}.txt`;
    downloadAsFile(content, filename);
    onDownload?.(analysis);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Medical Analysis - ${analysisType.type}`,
          text: `${analysis.userInstruction}\n\n${analysis.aiResponse}`,
        });
        onShare?.(analysis);
      } catch (error) {

      }
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this medical report? This action cannot be undone.')) {
      onDelete?.(analysis);
    }
  };

  const handleEdit = () => {
    if (enableEditing) {
      setIsEditMode(true);
      setIsExpanded(true);
      onEdit?.(analysis);
    }
  };

  const handleEditComplete = (editResult: any) => {
    // Handle successful edit
    setIsEditMode(false);
    
    // Update the local content state with the edited content
    if (editResult?.updatedContent) {
      setEditedContent(editResult.updatedContent);
      setIsExpanded(true); // Keep card expanded to show the changes
    }
  };

  const handleEditError = (error: Error) => {
    // You might want to show an error message to the user
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  // Safety check for analysis data
  if (!analysis || !analysis.userInstruction || !analysis.aiResponse) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
        <p className="text-red-600 dark:text-red-400 text-sm">
          ⚠️ Invalid analysis data: {JSON.stringify({
            hasAnalysis: !!analysis,
            hasInstruction: !!analysis?.userInstruction,
            hasResponse: !!analysis?.aiResponse,
            timestamp: analysis?.timestamp
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden w-full max-w-full">
      {/* Simplified Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-slate-800" />
      
      {/* Subtle Border Glow - Reduced animation */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
      
      {/* Standardized Container with Fixed Height */}
      <div className="relative bg-white/98 dark:bg-slate-900/98 backdrop-blur-sm rounded-2xl border border-blue-200/40 dark:border-slate-700/40 shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 min-h-[180px] flex flex-col">
        
        {/* Luxury Header */}
        <div className="relative overflow-hidden">
          {/* Header Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/5 via-[#63b3ed]/3 to-[#1a365d]/5 dark:from-[#2b6cb0]/10 dark:via-[#63b3ed]/5 dark:to-[#1a365d]/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white/90 dark:via-slate-900/50 dark:to-slate-900/90" />
          
          {/* Animated Particles Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-3 left-6 w-1.5 h-1.5 bg-[#63b3ed]/30 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '3s' }} />
            <div className="absolute top-6 right-8 w-1 h-1 bg-[#90cdf4]/20 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '4s' }} />
            <div className="absolute bottom-4 left-12 w-0.5 h-0.5 bg-[#2b6cb0]/25 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '5s' }} />
          </div>
          
          {/* Premium Priority Badge and Controls - Desktop Only */}
          <div className="absolute top-6 right-6 z-20 hidden md:flex">
            <div className="flex items-center space-x-3">
              {/* Enhanced Priority Badge */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-400/20 to-slate-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/50 dark:border-slate-700/50 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {totalCount - index}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Delete Button */}
              {onDelete && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <button
                    onClick={handleDelete}
                    className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl p-3 border border-white/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
                    title="Delete Report"
                  >
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-200" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile-Only Delete Button */}
          {onDelete && (
            <div className="absolute top-4 right-4 z-20 md:hidden">
              <button
                onClick={handleDelete}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl p-2 border border-white/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                title="Delete Report"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          )}

          <div className="relative p-8 pr-32">
            {/* Premium Analysis Type & Status */}
            <div className="space-y-6">
              {/* Main Title Section */}
              <div className="flex items-center space-x-6">
                {/* Enhanced Analysis Icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-3xl blur-lg opacity-30 animate-pulse" />
                  <div className={`relative bg-gradient-to-br ${analysisType.color} rounded-3xl p-4 shadow-2xl shadow-[#2b6cb0]/25`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
                    <IconComponent className="w-8 h-8 text-white relative z-10" />
                  </div>
                  {analysisType.isDiagnosis && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#63b3ed] to-[#2b6cb0] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  {/* Standardized Title */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight">
                      {analysisType.type}
                      {sessionTitle && (
                        <span className="block md:inline md:ml-2 text-sm font-medium text-[#2b6cb0] dark:text-[#63b3ed] opacity-75">
                          • {sessionTitle}
                        </span>
                      )}
                    </h3>
                    
                    {/* Desktop Only Badges */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                      {isEditMode && (
                        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 dark:from-[#2b6cb0]/30 dark:to-[#1a365d]/30 rounded-2xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 shadow-lg">
                          <Edit3 className="w-4 h-4 text-[#2b6cb0] dark:text-[#63b3ed]" />
                          <span className="text-sm font-bold text-[#1a365d] dark:text-[#90cdf4] tracking-wide">
                            EDIT MODE
                          </span>
                        </div>
                      )}
                      
                      {hasEmptyFieldsPresent && (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-amber-100/50 to-yellow-100/50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-full border border-amber-300/50 dark:border-amber-600/50 animate-pulse">
                          <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
                            {emptyFieldsCount} FIELD{emptyFieldsCount !== 1 ? 'S' : ''} INCOMPLETE
                          </span>
                        </div>
                      )}
                      
                    </div>
                  </div>
                  
                  {/* Premium Status Information */}
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/40 dark:border-slate-700/40 shadow-sm">
                        <div className="p-1 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] rounded-lg shadow-lg">
                          <Calendar className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {new Date(analysis.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Mobile Empty Fields Indicator */}
                      {hasEmptyFieldsPresent && (
                        <div className="md:hidden flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-amber-100/70 to-yellow-100/70 dark:from-amber-900/40 dark:to-yellow-900/40 rounded-xl border border-amber-300/60 dark:border-amber-600/40">
                          <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
                            {emptyFieldsCount} Missing
                          </span>
                        </div>
                      )}
                    </div>
                    
                  </div>
                </div>
              </div>

              {/* Premium Quick Actions - Mobile-First Layout */}
              <div className="space-y-4 pt-4">
                {/* Mobile Layout - Stacked Rows */}
                <div className="block md:hidden">
                  {/* First Row: Main Actions */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {/* Enhanced Copy Button */}
                    <div className="relative group flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/20 to-[#63b3ed]/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      <MedicalButton
                        variant="ghost"
                        size="sm"
                        leftIcon={Copy}
                        onClick={handleCopy}
                        className="relative text-slate-600 dark:text-slate-400 hover:text-[#2b6cb0] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 hover:shadow-lg min-h-[36px]"
                      >
                        <span className="text-sm">Copy</span>
                      </MedicalButton>
                    </div>
                    
                    {/* Enhanced Export Button */}
                    <div className="relative group flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/20 to-[#1a365d]/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      <MedicalButton
                        variant="ghost"
                        size="sm"
                        leftIcon={Download}
                        onClick={handleDownload}
                        className="relative text-slate-600 dark:text-slate-400 hover:text-[#2b6cb0] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 hover:shadow-lg min-h-[36px]"
                      >
                        <span className="text-sm">Export</span>
                      </MedicalButton>
                    </div>
                    
                    {/* Enhanced Share Button */}
                    {navigator.share && (
                      <div className="relative group flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d]/20 to-[#2b6cb0]/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        <MedicalButton
                          variant="ghost"
                          size="sm"
                          leftIcon={Share2}
                          onClick={handleShare}
                          className="relative text-slate-600 dark:text-slate-400 hover:text-[#1a365d] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 hover:shadow-lg min-h-[36px]"
                        >
                          <span className="text-sm">Share</span>
                        </MedicalButton>
                      </div>
                    )}
                  </div>
                  
                  {/* Second Row: Edit and Expand Actions */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Premium Edit Button */}
                    {enableEditing && analysisType.isDiagnosis && (
                      <div className="relative group flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/30 to-[#1a365d]/30 rounded-xl blur-md opacity-70 animate-pulse" />
                        <MedicalButton
                          variant={isEditMode ? "primary" : "ghost"}
                          size="sm"
                          leftIcon={isEditMode ? Settings : Edit3}
                          onClick={isEditMode ? handleCancelEdit : handleEdit}
                          className={isEditMode 
                            ? "relative bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white shadow-xl shadow-[#2b6cb0]/25 hover:shadow-2xl hover:shadow-[#2b6cb0]/30 transform hover:scale-105 transition-all duration-200 min-h-[36px]" 
                            : "relative text-slate-600 dark:text-slate-400 hover:text-[#2b6cb0] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 hover:shadow-lg min-h-[36px]"
                          }
                        >
                          <span className="text-sm font-medium">
                            {isEditMode ? 'Cancel Edit' : 'Edit Report'}
                          </span>
                        </MedicalButton>
                      </div>
                    )}
                    
                    {/* Enhanced Expand/Collapse */}
                    <div className="relative group flex-shrink-0">
                      <MedicalButton
                        variant="ghost"
                        size="sm"
                        rightIcon={isExpanded ? ChevronUp : ChevronDown}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 hover:shadow-lg min-h-[36px]"
                      >
                        <span className="text-sm">{isExpanded ? 'Minimize' : 'Expand'}</span>
                      </MedicalButton>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout - Single Row */}
                <div className="hidden md:flex md:items-center md:justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Enhanced Copy Button */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/20 to-[#63b3ed]/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      <MedicalButton
                        variant="ghost"
                        size="sm"
                        leftIcon={Copy}
                        onClick={handleCopy}
                        className="relative text-slate-600 dark:text-slate-400 hover:text-[#2b6cb0] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 hover:shadow-lg"
                      >
                        Copy
                      </MedicalButton>
                    </div>
                    
                    {/* Enhanced Export Button */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/20 to-[#1a365d]/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      <MedicalButton
                        variant="ghost"
                        size="sm"
                        leftIcon={Download}
                        onClick={handleDownload}
                        className="relative text-slate-600 dark:text-slate-400 hover:text-[#2b6cb0] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 hover:shadow-lg"
                      >
                        Export
                      </MedicalButton>
                    </div>
                    
                    {/* Enhanced Share Button */}
                    {navigator.share && (
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d]/20 to-[#2b6cb0]/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        <MedicalButton
                          variant="ghost"
                          size="sm"
                          leftIcon={Share2}
                          onClick={handleShare}
                          className="relative text-slate-600 dark:text-slate-400 hover:text-[#1a365d] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 hover:shadow-lg"
                        >
                          Share
                        </MedicalButton>
                      </div>
                    )}
                    
                    {/* Premium Edit Button */}
                    {enableEditing && analysisType.isDiagnosis && (
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/30 to-[#1a365d]/30 rounded-xl blur-md opacity-70 animate-pulse" />
                        <MedicalButton
                          variant={isEditMode ? "primary" : "ghost"}
                          size="sm"
                          leftIcon={isEditMode ? Settings : Edit3}
                          onClick={isEditMode ? handleCancelEdit : handleEdit}
                          className={isEditMode 
                            ? "relative bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white shadow-xl shadow-[#2b6cb0]/25 hover:shadow-2xl hover:shadow-[#2b6cb0]/30 transform hover:scale-105 transition-all duration-200" 
                            : "relative text-slate-600 dark:text-slate-400 hover:text-[#2b6cb0] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 hover:shadow-lg"
                          }
                        >
                          <span className="flex items-center space-x-2">
                            <span>{isEditMode ? 'Cancel Edit' : 'Edit Report'}</span>
                            {isEditMode && <Wand2 className="w-4 h-4" />}
                          </span>
                        </MedicalButton>
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced Expand/Collapse */}
                  <div className="relative group">
                    <MedicalButton
                      variant="ghost"
                      size="sm"
                      rightIcon={isExpanded ? ChevronUp : ChevronDown}
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 hover:shadow-lg"
                    >
                      {isExpanded ? 'Minimize' : 'Expand Details'}
                    </MedicalButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Collapsible Content */}
        <div className={`transition-all duration-500 ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="relative p-8 pt-6 space-y-8">
            {/* Premium Interactive Report Editor */}
            {isEditMode && enableEditing && analysisType.isDiagnosis && flowiseEndpoint && (
              <div className="relative overflow-hidden">
                {/* Luxury Editor Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#90cdf4]/20 via-[#63b3ed]/15 to-[#2b6cb0]/10 dark:from-[#2b6cb0]/20 dark:via-[#1a365d]/15 dark:to-[#63b3ed]/20 rounded-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,108,176,0.1),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(43,108,176,0.2),transparent_70%)]" />
                
                <div className="relative p-6">
                  {/* Editor Header */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl blur-md opacity-30 animate-pulse" />
                      <div className="relative bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl p-3 shadow-xl shadow-[#2b6cb0]/25">
                        <Edit3 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                        <span>AI Report Editor</span>
                        <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 dark:from-[#2b6cb0]/30 dark:to-[#63b3ed]/30 rounded-full">
                          <Crown className="w-3 h-3 text-[#2b6cb0] dark:text-[#90cdf4]" />
                          <span className="text-xs font-bold text-[#1a365d] dark:text-[#90cdf4]">STUDIO</span>
                        </div>
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Advanced medical report editing with AI assistance
                      </p>
                    </div>
                  </div>
                  
                  {/* Enhanced Report Edit Card */}
                  <div className="relative">
                    <ReportEditCard
                      reportId={analysis.timestamp.toString()}
                      initialContent={analysis.aiResponse}
                      sessionId={`edit-${analysis.timestamp}`}
                      flowiseEndpoint={analysisType.endpoint}
                      onEditComplete={handleEditComplete}
                      onError={handleEditError}
                      className="border-2 border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 shadow-2xl shadow-[#2b6cb0]/10"
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Premium User Request Section - Hide for diagnosis reports */}
            {!analysisType.isDiagnosis && (
              <div className="relative overflow-hidden">
                {/* Request Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 via-[#90cdf4]/15 to-[#63b3ed]/10 dark:from-slate-800/80 dark:via-[#2b6cb0]/20 dark:to-[#1a365d]/15 rounded-3xl" />
                
                <div className="relative p-6">
                  <div className="flex items-start space-x-4">
                    {/* Enhanced User Icon */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl blur-md opacity-30" />
                      <div className="relative bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl p-3 shadow-xl shadow-[#2b6cb0]/25">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          Analysis Request
                        </h4>
                        <div className="px-3 py-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/40 dark:border-slate-700/40">
                          <span className="text-xs font-bold text-[#2b6cb0] dark:text-[#63b3ed]">USER INPUT</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {analysis.userInstruction}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Premium AI Response Section */}
            <div className="relative overflow-hidden">
              {/* Response Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#90cdf4]/20 via-[#63b3ed]/15 to-[#2b6cb0]/10 dark:from-[#2b6cb0]/25 dark:via-[#1a365d]/20 dark:to-[#63b3ed]/15 rounded-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(43,108,176,0.1),transparent_70%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(43,108,176,0.2),transparent_70%)]" />
              
              <div className="relative p-6">
                <div className="flex items-start space-x-4">
                  {/* Enhanced AI Icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl blur-md opacity-30 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl p-3 shadow-xl shadow-[#2b6cb0]/25">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                      {analysisType.isDiagnosis ? (
                        <HeartHandshake className="w-6 h-6 text-white relative z-10" />
                      ) : (
                        <Brain className="w-6 h-6 text-white relative z-10" />
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#90cdf4] to-[#63b3ed] rounded-full flex items-center justify-center animate-bounce">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {analysisType.isDiagnosis ? 'Medical Report' : 'AI Clinical Analysis'}
                      </h4>
                      
                      <div className="flex items-center space-x-2">
                        <div className="px-3 py-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full border border-white/50 dark:border-slate-700/50">
                          <span className="text-xs font-bold text-[#2b6cb0] dark:text-[#63b3ed]">AI GENERATED</span>
                        </div>
                        
                        {analysisType.isDiagnosis && (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 dark:from-[#2b6cb0]/30 dark:to-[#63b3ed]/30 rounded-full">
                            <Target className="w-3 h-3 text-[#2b6cb0] dark:text-[#63b3ed]" />
                            <span className="text-xs font-bold text-[#1a365d] dark:text-[#90cdf4]">CLINICAL</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Enhanced Content Display */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-inner" />
                      <div className="relative p-6 prose prose-sm dark:prose-invert max-w-none">
                        {(() => {
                          const displayContent = editedContent || analysis.aiResponse;
                          return hasMarkdownFormatting(displayContent) ? (
                            formatMarkdown(displayContent)
                          ) : (
                            <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                              {displayContent}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Metadata Footer */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 to-[#90cdf4]/15 dark:from-slate-800/60 dark:to-[#2b6cb0]/20 rounded-3xl" />
              
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  {/* Enhanced Metadata */}
                  <div className="flex items-center space-x-6">
                    
                    <div className="flex items-center space-x-3 px-4 py-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-white/50 dark:border-slate-700/50 shadow-sm">
                      <div className="p-1 bg-gradient-to-r from-[#63b3ed] to-red-600 rounded-lg shadow-lg">
                        <Clock className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {new Date(analysis.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Premium Status Indicator */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/20 to-[#63b3ed]/20 rounded-2xl blur-md opacity-70 animate-pulse" />
                    <div className="relative flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-[#90cdf4]/20 to-[#63b3ed]/20 dark:from-[#2b6cb0]/30 dark:to-[#63b3ed]/30 backdrop-blur-sm rounded-2xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/30 shadow-lg">
                      <div className="relative">
                        <div className="w-3 h-3 bg-[#2b6cb0] rounded-full animate-pulse" />
                        <div className="absolute inset-0 w-3 h-3 bg-[#63b3ed] rounded-full animate-ping" />
                      </div>
                      <span className="text-sm font-bold text-[#1a365d] dark:text-[#90cdf4] tracking-wide">
                        ANALYSIS COMPLETE
                      </span>
                      <Award className="w-4 h-4 text-[#2b6cb0] dark:text-[#63b3ed]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced animations and effects (to be added to global styles)
// Additional premium visual enhancements complete