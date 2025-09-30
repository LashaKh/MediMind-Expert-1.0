import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Share2,
  Edit3,
  Settings,
  AlertCircle,
  Calendar,
  Hash,
  Trash2,
  Wand2
} from 'lucide-react';
import { MedicalButton } from '../../ui/MedicalDesignSystem';
import Form100Button from '../../Form100/Form100Button';

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface AnalysisType {
  type: string;
  icon: React.ElementType;
  color: string;
  isDiagnosis: boolean;
  endpoint: string;
  supportsForm100?: boolean;
}

interface AnalysisCardHeaderProps {
  analysis: ProcessingHistory;
  analysisType: AnalysisType;
  index: number;
  totalCount: number;
  sessionTitle?: string;
  sessionId?: string;
  isExpanded: boolean;
  isEditMode: boolean;
  enableEditing?: boolean;
  hasEmptyFieldsPresent: boolean;
  emptyFieldsCount: number;
  
  // Handlers
  onCopy: () => void;
  onDownload: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onExpandToggle: () => void;
  onForm100Generation: () => void;
}

export const AnalysisCardHeader: React.FC<AnalysisCardHeaderProps> = ({
  analysis,
  analysisType,
  index,
  totalCount,
  sessionTitle,
  sessionId,
  isExpanded,
  isEditMode,
  enableEditing = false,
  hasEmptyFieldsPresent,
  emptyFieldsCount,
  onCopy,
  onDownload,
  onShare,
  onDelete,
  onEdit,
  onCancelEdit,
  onExpandToggle,
  onForm100Generation
}) => {
  const IconComponent = analysisType.icon;

  return (
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
                onClick={onDelete}
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
            onClick={onDelete}
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
                  <div className="w-3 h-3 text-white" />
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
                    onClick={onCopy}
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
                    onClick={onDownload}
                    className="relative text-slate-600 dark:text-slate-400 hover:text-[#2b6cb0] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 hover:shadow-lg min-h-[36px]"
                  >
                    <span className="text-sm">Export</span>
                  </MedicalButton>
                </div>
                
                {/* Enhanced Share Button */}
                {navigator.share && onShare && (
                  <div className="relative group flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d]/20 to-[#2b6cb0]/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <MedicalButton
                      variant="ghost"
                      size="sm"
                      leftIcon={Share2}
                      onClick={onShare}
                      className="relative text-slate-600 dark:text-slate-400 hover:text-[#1a365d] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 hover:shadow-lg min-h-[36px]"
                    >
                      <span className="text-sm">Share</span>
                    </MedicalButton>
                  </div>
                )}
              </div>
              
              {/* Second Row: Edit, Form 100, and Expand Actions */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Premium Edit Button */}
                  {enableEditing && analysisType.isDiagnosis && (
                    <div className="relative group flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/30 to-[#1a365d]/30 rounded-xl blur-md opacity-70 animate-pulse" />
                      <MedicalButton
                        variant={isEditMode ? "primary" : "ghost"}
                        size="sm"
                        leftIcon={isEditMode ? Settings : Edit3}
                        onClick={isEditMode ? onCancelEdit : onEdit}
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

                  {/* Premium Form 100 Button */}
                  {analysisType.supportsForm100 && (
                    <div className="relative group flex-shrink-0">
                      {/* Premium ambient glow container */}
                      <div className="absolute -inset-2 bg-gradient-to-r from-[#63b3ed]/20 via-[#2b6cb0]/30 to-[#1a365d]/20 
                                      rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out
                                      animate-pulse group-hover:animate-none" />
                      
                      {/* Premium inner glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#90cdf4]/40 to-[#63b3ed]/40 
                                      rounded-xl opacity-0 group-hover:opacity-60 transition-all duration-500" />
                      
                      {/* Premium importance indicator */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-[#63b3ed] to-[#2b6cb0] 
                                      rounded-full opacity-80 animate-pulse z-10">
                        <div className="absolute inset-0.5 bg-white rounded-full" />
                        <div className="absolute inset-1 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] rounded-full animate-ping" />
                      </div>
                      
                      <Form100Button
                        sessionId={sessionId}
                        variant="secondary"
                        size="sm"
                        onClick={onForm100Generation}
                        className="relative min-h-[36px] text-sm px-4 font-semibold
                                   shadow-lg hover:shadow-xl
                                   transform hover:scale-105 active:scale-95
                                   transition-all duration-300 ease-out
                                   border-2 border-[#63b3ed]/40 hover:border-[#2b6cb0]/70
                                   bg-gradient-to-r from-white/95 to-[#90cdf4]/10 
                                   hover:from-[#90cdf4]/20 hover:to-[#63b3ed]/20
                                   backdrop-blur-xl"
                      />
                    </div>
                  )}
                </div>
                
                {/* Enhanced Expand/Collapse */}
                <div className="relative group flex-shrink-0">
                  <MedicalButton
                    variant="ghost"
                    size="sm"
                    rightIcon={isExpanded ? ChevronUp : ChevronDown}
                    onClick={onExpandToggle}
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
                    onClick={onCopy}
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
                    onClick={onDownload}
                    className="relative text-slate-600 dark:text-slate-400 hover:text-[#2b6cb0] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 hover:shadow-lg"
                  >
                    Export
                  </MedicalButton>
                </div>
                
                {/* Enhanced Share Button */}
                {navigator.share && onShare && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d]/20 to-[#2b6cb0]/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <MedicalButton
                      variant="ghost"
                      size="sm"
                      leftIcon={Share2}
                      onClick={onShare}
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
                      onClick={isEditMode ? onCancelEdit : onEdit}
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
                
                {/* Premium Form 100 Button - Desktop */}
                {analysisType.supportsForm100 && (
                  <div className="relative group">
                    {/* Premium desktop ambient glow */}
                    <div className="absolute -inset-3 bg-gradient-to-r from-[#63b3ed]/15 via-[#2b6cb0]/25 to-[#1a365d]/15 
                                    rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-out
                                    animate-pulse group-hover:animate-none" />
                    
                    {/* Premium desktop shimmer effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-[#90cdf4]/30 to-transparent 
                                    rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-600" />
                    
                    {/* Premium desktop importance badge */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-[#63b3ed] to-[#2b6cb0] 
                                    rounded-full shadow-lg opacity-90 animate-pulse z-10">
                      <div className="absolute inset-0.5 bg-white rounded-full" />
                      <div className="absolute inset-1 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] rounded-full 
                                      animate-ping opacity-80" />
                      <div className="absolute inset-1.5 bg-[#63b3ed] rounded-full animate-pulse" />
                    </div>
                    
                    <Form100Button
                      sessionId={sessionId}
                      variant="secondary"
                      size="md"
                      onClick={onForm100Generation}
                      className="relative font-bold shadow-xl hover:shadow-2xl
                                 transform hover:scale-110 active:scale-95
                                 transition-all duration-400 ease-out
                                 border-2 border-[#63b3ed]/50 hover:border-[#2b6cb0]/80
                                 bg-gradient-to-r from-white/98 via-[#90cdf4]/5 to-white/98
                                 hover:from-[#90cdf4]/15 hover:via-[#63b3ed]/20 hover:to-[#90cdf4]/15
                                 backdrop-blur-xl text-[#1a365d] hover:text-[#2b6cb0]
                                 hover:-translate-y-1 hover:rotate-1"
                    />
                  </div>
                )}
              </div>
              
              {/* Enhanced Expand/Collapse */}
              <div className="relative group">
                <MedicalButton
                  variant="ghost"
                  size="sm"
                  rightIcon={isExpanded ? ChevronUp : ChevronDown}
                  onClick={onExpandToggle}
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
  );
};