import React from 'react';
import { Copy, Download, Edit3, Stethoscope, MessageSquare, Sparkles } from 'lucide-react';
import { MedicalButton } from '../../ui/MedicalDesignSystem';
import { TRANSCRIPT_TABS, TabId } from '../utils/uiConstants';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  hasTranscript: boolean;
  onCopy?: () => void;
  onDownload?: () => void;
  onEdit?: () => void;
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
  onCopy,
  onDownload,
  onEdit
}) => {
  return (
    <div className="relative overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50/98 via-white/99 to-blue-50/98 dark:from-slate-900/98 dark:via-gray-900/99 dark:to-blue-950/98" />
      <div className="absolute inset-0 backdrop-blur-sm" />
      
      {/* Subtle Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/40 to-transparent dark:via-slate-700/40" />
      
      <div className="relative px-6 py-4">
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
                        relative flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group
                        ${isActive
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 transition-all duration-300 ${
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
          
          {/* Action Buttons - Premium Design */}
          {activeTab === 'transcript' && hasTranscript && (
            <div className="flex items-center space-x-2">
              {/* Action Button Group */}
              <div className="flex items-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-1 shadow-lg">
                {onCopy && (
                  <button
                    onClick={onCopy}
                    className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 text-sm font-medium group"
                  >
                    <Copy className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Copy</span>
                  </button>
                )}
                
                {onDownload && (
                  <button
                    onClick={onDownload}
                    className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200 text-sm font-medium group"
                  >
                    <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Download</span>
                  </button>
                )}
                
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 rounded-lg transition-all duration-200 text-sm font-medium group"
                  >
                    <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};