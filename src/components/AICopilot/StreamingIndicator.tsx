import React from 'react';
import { Sparkles } from 'lucide-react';

interface StreamingIndicatorProps {
  className?: string;
  tokensReceived?: number;
  showTokenCount?: boolean;
}

/**
 * Visual indicator for streaming AI responses
 * Shows an animated pulse effect while content is being generated
 */
export const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({
  className = '',
  tokensReceived = 0,
  showTokenCount = false
}) => {
  return (
    <div className={`flex items-center space-x-2 text-blue-600 dark:text-blue-400 ${className}`}>
      {/* Animated pulsing dot */}
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse animation-delay-150" />
        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse animation-delay-300" />
      </div>

      {/* Status text */}
      <div className="flex items-center space-x-1.5">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span className="text-xs font-medium">
          Generating response...
        </span>
      </div>

      {/* Optional token count */}
      {showTokenCount && tokensReceived > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({tokensReceived} tokens)
        </span>
      )}
    </div>
  );
};

export default StreamingIndicator;
