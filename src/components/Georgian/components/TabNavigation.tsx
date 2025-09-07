import React from 'react';
import { Edit3, Stethoscope, MessageSquare, Sparkles, Mic, Square, History } from 'lucide-react';
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

// Enhanced tab configuration with sophisticated icons
const enhancedTabs = [
  { id: 'transcript', label: 'Transcript', icon: Stethoscope },
  { id: 'context', label: 'Context', icon: MessageSquare },
  { id: 'ai', label: 'AI Processing', icon: Sparkles }
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
  return (
    <div className="relative overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50/98 via-white/99 to-blue-50/98 dark:from-slate-900/98 dark:via-gray-900/99 dark:to-blue-950/98" />
      <div className="absolute inset-0 backdrop-blur-sm" />
      
      {/* Subtle Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/40 to-transparent dark:via-slate-700/40" />
      
      <div className="relative px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Premium Tab System */}
          <div className="relative">
            {/* Tab Container with Glass Effect */}
            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-1.5 shadow-lg shadow-slate-900/5 dark:shadow-black/20">
              {/* Tab Buttons with Individual Active States */}
              <div className="relative flex">
                {enhancedTabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id as TabId)}
                      className={`
                        relative flex items-center space-x-1.5 sm:space-x-2.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 group
                        medical-touch-target medical-nav-item
                        ${isActive
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'
                        }
                      `}
                    >
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 flex-shrink-0 ${
                        isActive 
                          ? 'text-white drop-shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                      }`} />
                      <span className={`tracking-wide transition-all duration-300 whitespace-nowrap ${
                        isActive 
                          ? 'text-white font-bold drop-shadow-sm' 
                          : 'font-medium'
                      }`}>
                        {tab.label}
                      </span>
                      
                      {/* Active Glow Effect */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-xl blur-sm -z-10" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Right Side Actions - Mobile Optimized */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* History Toggle Button - Desktop only */}
            {onToggleHistory && (
              <button
                onClick={onToggleHistory}
                className={`
                  group relative hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 
                  ${isHistoryOpen 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'
                  }
                `}
                title={`${isHistoryOpen ? 'Hide' : 'Show'} History (${sessionCount} recordings)`}
              >
                <History className="w-4 h-4" />
                <span className="hidden xl:inline">History</span>
                {sessionCount > 0 && !isHistoryOpen && (
                  <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold min-w-5">
                    {sessionCount > 99 ? '99+' : sessionCount}
                  </div>
                )}
              </button>
            )}
            
            {/* Premium Record Button - Mobile Optimized */}
            {activeTab === 'transcript' && (onStartRecording || onStopRecording) && (
              <button
                onClick={isRecording ? (canStop ? onStopRecording : undefined) : (canRecord ? onStartRecording : undefined)}
                disabled={isRecording ? !canStop : !canRecord}
                className={`
                  group relative overflow-hidden px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl flex items-center space-x-1 sm:space-x-2.5 min-w-[80px] sm:min-w-[120px] justify-center
                  medical-primary-action medical-touch-target
                  ${isRecording 
                    ? (canStop 
                        ? 'bg-gradient-to-r from-red-500 via-rose-600 to-red-600 hover:from-red-600 hover:via-rose-700 hover:to-red-700 text-white shadow-red-500/40' 
                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400 shadow-none')
                    : (canRecord 
                        ? 'bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 hover:from-emerald-600 hover:via-green-700 hover:to-emerald-700 text-white shadow-emerald-500/40' 
                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400 shadow-none')
                  }
                `}
              >
                {(isRecording ? canStop : canRecord) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse opacity-60" />
                )}
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Record</span>
                  </>
                )}
                
                {/* Pulsing ring for recording state */}
                {isRecording && (
                  <div className="absolute inset-0 rounded-xl border-2 border-red-400/60 animate-pulse" />
                )}
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};