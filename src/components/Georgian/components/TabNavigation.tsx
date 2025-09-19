import React, { useState, useEffect } from 'react';
import { Edit3, Stethoscope, MessageSquare, Sparkles, Mic, Square, History, Zap, Brain, FileText, Play, Pause, Activity } from 'lucide-react';
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
}

const tabs = TRANSCRIPT_TABS;

// Modern blue theme tab configuration
const enhancedTabs = [
  { 
    id: 'transcript', 
    label: 'Record', 
    sublabel: 'Live transcription',
    icon: FileText, 
    activeIcon: Activity,
    className: 'transcription-tab'
  },
  { 
    id: 'context', 
    label: 'Context', 
    sublabel: 'Document analysis',
    icon: MessageSquare, 
    activeIcon: Brain,
    className: 'transcription-tab'
  },
  { 
    id: 'ai', 
    label: 'AI Processing', 
    sublabel: 'Smart analysis',
    icon: Sparkles, 
    activeIcon: Zap,
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
  sessionCount = 0
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <div className="bg-white border-b border-[#90cdf4]/30">
      <div className="px-3 sm:px-6 py-2 sm:py-3 mediscribe-mobile-tabs lg:px-6 lg:py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Modern Blue Tab System */}
          <div className="flex space-x-1 sm:space-x-2 mediscribe-mobile-tabs lg:space-x-2">
            {enhancedTabs.map((tab) => {
              const Icon = tab.icon;
              const ActiveIcon = tab.activeIcon;
              const isActive = activeTab === tab.id;
              const DisplayIcon = isActive ? ActiveIcon : Icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as TabId)}
                  className={`${tab.className} ${isActive ? 'active' : ''} mediscribe-mobile-tab group relative flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-4 py-2.5 transition-all duration-300 lg:px-4 lg:py-2.5 lg:space-x-2`}
                >
                  {/* Icon Container */}
                  <div className="w-6 h-6 sm:w-6 sm:h-6 lg:w-6 lg:h-6 rounded-md flex items-center justify-center transition-all duration-300 mediscribe-mobile-tab-icon">
                    <DisplayIcon className="w-4 h-4 sm:w-4 sm:h-4 lg:w-4 lg:h-4 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  
                  {/* Labels */}
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs sm:text-sm lg:text-sm font-bold leading-tight mediscribe-mobile-tab-label">
                      {tab.label}
                    </span>
                    <span className="text-[11px] sm:text-xs lg:text-xs font-medium leading-tight opacity-80 mediscribe-mobile-tab-sublabel">
                      {tab.sublabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Compact Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-3">
            {/* Compact History Button */}
            {onToggleHistory && (
              <button
                onClick={onToggleHistory}
                className={`
                  ${isHistoryOpen ? 'transcription-btn-primary' : 'transcription-btn-secondary'} 
                  relative hidden lg:flex items-center space-x-2 px-3 py-2 font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95
                `}
                title={`${isHistoryOpen ? 'Hide' : 'Show'} History (${sessionCount} recordings)`}
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <History className="w-3 h-3 text-white" />
                </div>
                <div className="hidden xl:flex flex-col items-start min-w-0">
                  <span className="text-xs font-bold leading-tight">History</span>
                  <span className="text-[10px] font-medium leading-tight opacity-80">
                    {sessionCount} recordings
                  </span>
                </div>
                {sessionCount > 0 && !isHistoryOpen && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                    {sessionCount > 99 ? '99' : sessionCount}
                  </div>
                )}
              </button>
            )}
            
            {/* Compact Record Button - Hidden on mobile (replaced by FAB) */}
            {activeTab === 'transcript' && (onStartRecording || onStopRecording) && (
              <button
                onClick={isRecording ? (canStop ? onStopRecording : undefined) : (canRecord ? onStartRecording : undefined)}
                disabled={isRecording ? !canStop : !canRecord}
                className={`
                  relative hidden lg:flex items-center space-x-2 px-4 py-2.5 font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 min-w-[100px] justify-center
                  ${isRecording 
                    ? (canStop 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-600/40' 
                        : 'transcription-btn-secondary opacity-60 cursor-not-allowed')
                    : (canRecord 
                        ? 'transcription-btn-primary' 
                        : 'transcription-btn-secondary opacity-60 cursor-not-allowed')
                  }
                `}
              >
                <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                  {isRecording ? (
                    <Square className="w-3 h-3 text-white" />
                  ) : (
                    <Mic className="w-3 h-3 text-white" />
                  )}
                </div>
                
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-xs font-bold leading-tight">
                    {isRecording ? 'Stop' : 'Record'}
                  </span>
                  <span className="text-[10px] font-medium leading-tight opacity-80">
                    {isRecording ? 'End session' : 'Start recording'}
                  </span>
                </div>
                
                {/* Recording pulse effect */}
                {isRecording && (
                  <div className="absolute inset-0 rounded-lg border-2 border-red-400/60 animate-pulse" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};