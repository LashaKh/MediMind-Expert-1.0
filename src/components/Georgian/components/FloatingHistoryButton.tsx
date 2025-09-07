import React from 'react';
import { History, ChevronRight } from 'lucide-react';

interface FloatingHistoryButtonProps {
  isHistoryOpen: boolean;
  onToggleHistory: () => void;
  sessionCount: number;
}

export const FloatingHistoryButton: React.FC<FloatingHistoryButtonProps> = ({
  isHistoryOpen,
  onToggleHistory,
  sessionCount
}) => {
  if (isHistoryOpen) return null; // Don't show when history is already open

  return (
    <button
      onClick={onToggleHistory}
      className="fixed top-1/2 left-0 transform -translate-y-1/2 z-50 
        bg-gradient-to-r from-blue-600 to-blue-700 
        hover:from-blue-700 hover:to-blue-800 
        text-white shadow-lg hover:shadow-xl 
        transition-all duration-300 ease-in-out
        rounded-r-xl px-4 py-6 
        group border-r border-blue-500"
      style={{
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        marginLeft: 0
      }}
      title={`Show History (${sessionCount} recordings)`}
    >
      <div className="flex flex-col items-center space-y-2">
        <History className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
        
        {/* Session count badge */}
        {sessionCount > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 min-w-6 h-6 
            flex items-center justify-center text-xs font-semibold">
            {sessionCount > 99 ? '99+' : sessionCount}
          </div>
        )}
        
        {/* Arrow indicator */}
        <ChevronRight className="w-3 h-3 opacity-60 transition-all duration-200 
          group-hover:opacity-100 group-hover:translate-x-0.5" />
      </div>
    </button>
  );
};