import React, { useState, useEffect } from 'react';
import { Edit3, Stethoscope, MessageSquare, Sparkles, Mic, Square, History, Zap, Brain, FileText, Play, Pause, Activity, Upload, Paperclip, Plus } from 'lucide-react';
import { MedicalButton } from '../../ui/MedicalDesignSystem';
import { TRANSCRIPT_TABS, TabId } from '../utils/uiConstants';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  hasTranscript: boolean;
  // Recording controls
  canRecord?: boolean;
  canStop?: boolean;
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  // History controls
  isHistoryOpen?: boolean;
  onToggleHistory?: () => void;
  sessionCount?: number;
  // Upload controls
  onFileUpload?: (file: File) => void;
  // Attachment controls
  onAttachFiles?: (files: File[]) => void;
}

const tabs = TRANSCRIPT_TABS;

// Modern blue theme tab configuration
const enhancedTabs = [
  { 
    id: 'transcript', 
    label: 'Record', 
    sublabel: 'Live transcription',
    icon: FileText, 
    className: 'transcription-tab'
  },
  { 
    id: 'ai', 
    label: 'AI Processing', 
    sublabel: 'Smart analysis',
    icon: Sparkles, 
    className: 'transcription-tab'
  }
] as const;

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  hasTranscript,
  canRecord = false,
  canStop = false,
  isRecording = false,
  onStartRecording,
  onStopRecording,
  isHistoryOpen = false,
  onToggleHistory,
  sessionCount = 0,
  onFileUpload,
  onAttachFiles
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const attachmentInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAttachmentClick = () => {
    attachmentInputRef.current?.click();
  };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && onAttachFiles) {
      onAttachFiles(files);
    }
    // Reset file input to allow selecting the same files again
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white border-b border-[#90cdf4]/30 mediscribe-mobile-header lg:relative lg:top-auto">
      <div className="px-3 sm:px-6 py-3 sm:py-4 mediscribe-mobile-tabs lg:px-6 lg:py-4">
        <div className="flex items-center justify-between lg:justify-between max-w-7xl mx-auto w-full">
          
          {/* PRIMARY NAVIGATION - Left Side */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Navigation Tabs - Prominent Design */}
            <div className="flex bg-gray-50 rounded-2xl p-1 sm:p-1.5 border border-gray-200/50">
              {enhancedTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id as TabId)}
                    className={`
                      group relative flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 font-semibold text-xs sm:text-sm min-w-0
                      ${isActive 
                        ? 'bg-white text-[#1a365d] shadow-lg shadow-black/10 border border-gray-200/50' 
                        : 'text-gray-500 hover:text-[#2b6cb0] hover:bg-white/50'
                      }
                    `}
                  >
                    {/* Icon with enhanced styling */}
                    <div className={`
                      w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0
                      ${isActive 
                        ? 'bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] text-white' 
                        : 'bg-gray-100 group-hover:bg-[#63b3ed]/10'
                      }
                    `}>
                      <Icon className={`
                        w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110
                        ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#2b6cb0]'}
                      `} />
                    </div>
                    
                    {/* Labels with enhanced hierarchy - Hidden on mobile, visible on tablet+ */}
                    <div className="hidden md:flex flex-col items-start min-w-0">
                      <span className={`
                        font-bold text-sm leading-tight
                        ${isActive ? 'text-[#1a365d]' : 'text-gray-600 group-hover:text-[#2b6cb0]'}
                      `}>
                        {tab.label}
                      </span>
                      <span className={`
                        text-xs font-medium leading-tight
                        ${isActive ? 'text-[#2b6cb0]' : 'text-gray-400 group-hover:text-[#2b6cb0]'}
                      `}>
                        {tab.sublabel}
                      </span>
                    </div>
                    
                    {/* Mobile label - Only icon label on small screens */}
                    <span className={`
                      md:hidden text-xs font-bold
                      ${isActive ? 'text-[#1a365d]' : 'text-gray-600 group-hover:text-[#2b6cb0]'}
                    `}>
                      {tab.label}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-0.5 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* SECONDARY ACTIONS - Right Side */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Action Buttons - Smaller, Subtle Design */}
            <div className="hidden sm:flex items-center space-x-1.5">
              
              {/* History Button - Enhanced Production Design */}
              {onToggleHistory && (
                <button
                  onClick={onToggleHistory}
                  className={`
                    group relative flex items-center space-x-1.5 px-2 lg:px-3 py-2 rounded-xl transition-all duration-300 text-xs font-medium overflow-hidden
                    ${isHistoryOpen
                      ? 'bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] text-white shadow-lg shadow-[#2b6cb0]/30 border border-[#2b6cb0]/50'
                      : 'bg-gradient-to-br from-[#90cdf4]/10 to-[#63b3ed]/10 hover:from-[#90cdf4]/20 hover:to-[#63b3ed]/20 text-[#1a365d] border border-[#90cdf4]/30 hover:border-[#63b3ed]/50 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95'
                    }
                  `}
                  title={`${isHistoryOpen ? 'Hide' : 'Show'} History (${sessionCount} recordings)`}
                >
                  {/* Gradient Background Effect */}
                  {!isHistoryOpen && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}

                  {/* Icon Container with Enhanced Styling */}
                  <div className={`
                    relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300
                    ${isHistoryOpen
                      ? 'bg-white/20 shadow-inner'
                      : 'bg-gradient-to-br from-[#63b3ed] to-[#90cdf4] shadow-inner group-hover:shadow-lg group-hover:scale-110'
                    }
                  `}>
                    <History className={`w-4 h-4 ${isHistoryOpen ? 'text-white' : 'text-white'}`} />
                  </div>

                  {/* Text Content */}
                  <div className="hidden xl:flex flex-col items-start relative z-10">
                    <span className={`font-bold text-sm ${isHistoryOpen ? 'text-white' : 'text-[#1a365d] group-hover:text-[#2b6cb0]'}`}>
                      History
                    </span>
                    <span className={`text-[10px] font-medium ${isHistoryOpen ? 'text-white/80' : 'text-[#2b6cb0]/70 group-hover:text-[#2b6cb0]'}`}>
                      {sessionCount} recordings
                    </span>
                  </div>

                  {/* Enhanced Notification Badge */}
                  {sessionCount > 0 && !isHistoryOpen && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full min-w-[22px] h-[22px] px-1.5 flex items-center justify-center text-[10px] font-bold shadow-lg shadow-red-500/40 ring-2 ring-white animate-pulse z-10">
                      {sessionCount > 99 ? '99+' : sessionCount}
                    </div>
                  )}

                  {/* Active State Indicator */}
                  {isHistoryOpen && (
                    <div className="absolute inset-0 bg-white/5 rounded-xl animate-pulse" />
                  )}
                </button>
              )}

              {/* Upload Button - Enhanced Production Design */}
              {onFileUpload && (
                <button
                  onClick={handleFileUploadClick}
                  disabled={isRecording}
                  className={`
                    group relative flex items-center space-x-1.5 px-2 lg:px-3 py-2 rounded-xl transition-all duration-300 text-xs font-medium overflow-hidden
                    ${isRecording
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-br from-[#63b3ed]/10 to-[#90cdf4]/10 hover:from-[#63b3ed]/20 hover:to-[#90cdf4]/20 text-[#1a365d] border border-[#90cdf4]/30 hover:border-[#63b3ed]/50 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95'
                    }
                  `}
                  title={isRecording ? "Cannot upload during recording" : "Upload audio file"}
                >
                  {/* Gradient Background Effect */}
                  {!isRecording && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}

                  {/* Icon Container with Enhanced Styling */}
                  <div className={`
                    relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300
                    ${isRecording
                      ? 'bg-gray-200'
                      : 'bg-gradient-to-br from-[#63b3ed] to-[#2b6cb0] shadow-inner group-hover:shadow-lg group-hover:scale-110'
                    }
                  `}>
                    <Upload className={`w-4 h-4 ${isRecording ? 'text-gray-400' : 'text-white'}`} />
                  </div>

                  {/* Text Content */}
                  <div className="hidden xl:flex flex-col items-start relative z-10">
                    <span className={`font-bold text-sm ${isRecording ? 'text-gray-400' : 'text-[#1a365d] group-hover:text-[#2b6cb0]'}`}>
                      Upload
                    </span>
                    <span className={`text-[10px] font-medium ${isRecording ? 'text-gray-400' : 'text-[#2b6cb0]/70 group-hover:text-[#2b6cb0]'}`}>
                      Audio file
                    </span>
                  </div>
                </button>
              )}

              {/* Attach Button - Enhanced Production Design */}
              {onAttachFiles && (
                <button
                  onClick={handleAttachmentClick}
                  disabled={isRecording}
                  className={`
                    group relative flex items-center space-x-1.5 px-2 lg:px-3 py-2 rounded-xl transition-all duration-300 text-xs font-medium overflow-hidden
                    ${isRecording
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-br from-[#90cdf4]/10 to-[#63b3ed]/10 hover:from-[#90cdf4]/20 hover:to-[#63b3ed]/20 text-[#1a365d] border border-[#90cdf4]/30 hover:border-[#63b3ed]/50 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95'
                    }
                  `}
                  title={isRecording ? "Cannot attach during recording" : "Attach files & documents"}
                >
                  {/* Gradient Background Effect */}
                  {!isRecording && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}

                  {/* Icon Container with Enhanced Styling */}
                  <div className={`
                    relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300
                    ${isRecording
                      ? 'bg-gray-200'
                      : 'bg-gradient-to-br from-[#90cdf4] to-[#63b3ed] shadow-inner group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-12'
                    }
                  `}>
                    <Paperclip className={`w-4 h-4 ${isRecording ? 'text-gray-400' : 'text-white'}`} />
                  </div>

                  {/* Text Content */}
                  <div className="hidden xl:flex flex-col items-start relative z-10">
                    <span className={`font-bold text-sm ${isRecording ? 'text-gray-400' : 'text-[#1a365d] group-hover:text-[#2b6cb0]'}`}>
                      Attach
                    </span>
                    <span className={`text-[10px] font-medium ${isRecording ? 'text-gray-400' : 'text-[#2b6cb0]/70 group-hover:text-[#2b6cb0]'}`}>
                      Files & docs
                    </span>
                  </div>
                </button>
              )}
            </div>
            
            {/* Divider - Only on larger screens */}
            <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1 lg:mx-2" />
            
            {/* Primary Record Button - Most Prominent */}
            {activeTab === 'transcript' && (onStartRecording || onStopRecording) && (
              <button
                onClick={isRecording ? (canStop ? onStopRecording : undefined) : (canRecord ? onStartRecording : undefined)}
                disabled={isRecording ? !canStop : !canRecord}
                className={`
                  relative flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 min-w-[100px] sm:min-w-[120px] justify-center
                  ${isRecording 
                    ? (canStop 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                    : (canRecord 
                        ? 'bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] hover:from-[#2b6cb0] hover:to-[#1a365d] text-white shadow-lg shadow-[#2b6cb0]/30' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                  }
                `}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/20 flex items-center justify-center">
                  {isRecording ? (
                    <Square className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  ) : (
                    <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  )}
                </div>
                
                <div className="hidden sm:flex flex-col items-start">
                  <span className="font-bold text-sm leading-tight">
                    {isRecording ? 'Stop' : 'Record'}
                  </span>
                  <span className="text-xs opacity-90 leading-tight">
                    {isRecording ? 'End recording' : 'Start recording'}
                  </span>
                </div>
                
                {/* Mobile label */}
                <span className="sm:hidden font-bold text-xs">
                  {isRecording ? 'Stop' : 'Record'}
                </span>
                
                {/* Recording pulse effect */}
                {isRecording && (
                  <div className="absolute inset-0 rounded-xl bg-red-400/20 animate-pulse" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm"
        onChange={handleFileChange}
        className="hidden"
        multiple={false}
      />
      <input
        ref={attachmentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp3,.wav"
        onChange={handleAttachmentChange}
        className="hidden"
        multiple={true}
      />
    </div>
  );
};