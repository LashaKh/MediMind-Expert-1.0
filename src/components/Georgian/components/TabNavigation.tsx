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

// Compact vibrant tab configuration with solid colors
const enhancedTabs = [
  { 
    id: 'transcript', 
    label: 'Record', 
    sublabel: 'Live transcription',
    icon: FileText, 
    activeIcon: Activity,
    activeBg: 'bg-emerald-600',
    hoverBg: 'bg-emerald-500',
    inactiveBg: 'bg-slate-100 dark:bg-slate-700',
    activeText: 'text-white',
    inactiveText: 'text-slate-700 dark:text-slate-300',
    iconBg: 'bg-emerald-500',
    shadowColor: 'shadow-emerald-500/40'
  },
  { 
    id: 'context', 
    label: 'Context', 
    sublabel: 'Document analysis',
    icon: MessageSquare, 
    activeIcon: Brain,
    activeBg: 'bg-violet-600',
    hoverBg: 'bg-violet-500',
    inactiveBg: 'bg-slate-100 dark:bg-slate-700',
    activeText: 'text-white',
    inactiveText: 'text-slate-700 dark:text-slate-300',
    iconBg: 'bg-violet-500',
    shadowColor: 'shadow-violet-500/40'
  },
  { 
    id: 'ai', 
    label: 'AI Processing', 
    sublabel: 'Smart analysis',
    icon: Sparkles, 
    activeIcon: Zap,
    activeBg: 'bg-orange-600',
    hoverBg: 'bg-orange-500',
    inactiveBg: 'bg-slate-100 dark:bg-slate-700',
    activeText: 'text-white',
    inactiveText: 'text-slate-700 dark:text-slate-300',
    iconBg: 'bg-orange-500',
    shadowColor: 'shadow-orange-500/40'
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
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="px-3 sm:px-6 py-2 sm:py-3 mediscribe-mobile-tabs lg:px-6 lg:py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Compact Vibrant Tab System */}
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
                  className={`
                    group relative flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-4 py-2.5 sm:py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg mediscribe-mobile-tab mediscribe-haptic-feedback lg:px-4 lg:py-2.5 lg:space-x-2
                    ${isActive 
                      ? `${tab.activeBg} ${tab.activeText} ${tab.shadowColor}` 
                      : `${tab.inactiveBg} ${tab.inactiveText} hover:${tab.hoverBg} hover:text-white shadow-slate-300/40 dark:shadow-slate-700/40`
                    }
                  `}
                >
                  {/* Icon Container */}
                  <div className={`
                    w-6 h-6 sm:w-6 sm:h-6 lg:w-6 lg:h-6 rounded-md flex items-center justify-center transition-all duration-300 mediscribe-mobile-tab-icon
                    ${isActive 
                      ? 'bg-white/20' 
                      : 'bg-slate-200 dark:bg-slate-600 group-hover:bg-white/20'
                    }
                  `}>
                    <DisplayIcon className="w-4 h-4 sm:w-4 sm:h-4 lg:w-4 lg:h-4 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  
                  {/* Labels */}
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs sm:text-sm lg:text-sm font-bold leading-tight mediscribe-mobile-tab-label">
                      {tab.label}
                    </span>
                    <span className={`text-[11px] sm:text-xs lg:text-xs font-medium leading-tight opacity-80 mediscribe-mobile-tab-sublabel ${
                      isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                    }`}>
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
                  relative hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg
                  ${isHistoryOpen 
                    ? 'bg-blue-600 text-white shadow-blue-600/40' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-500 hover:text-white shadow-slate-300/40 dark:shadow-slate-700/40'
                  }
                `}
                title={`${isHistoryOpen ? 'Hide' : 'Show'} History (${sessionCount} recordings)`}
              >
                <div className={`
                  w-5 h-5 rounded-md flex items-center justify-center
                  ${isHistoryOpen 
                    ? 'bg-white/20' 
                    : 'bg-slate-200 dark:bg-slate-600'
                  }
                `}>
                  <History className="w-3 h-3" />
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
                  relative hidden lg:flex items-center space-x-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg min-w-[100px] justify-center
                  ${isRecording 
                    ? (canStop 
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/40' 
                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400')
                    : (canRecord 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/40' 
                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400')
                  }
                `}
              >
                <div className={`
                  w-5 h-5 rounded-md flex items-center justify-center
                  ${(isRecording ? canStop : canRecord) 
                    ? 'bg-white/20' 
                    : 'bg-gray-400/20'
                  }
                `}>
                  {isRecording ? (
                    <Square className="w-3 h-3" />
                  ) : (
                    <Mic className="w-3 h-3" />
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