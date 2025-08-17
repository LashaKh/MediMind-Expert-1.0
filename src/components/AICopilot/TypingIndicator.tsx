import React from 'react';
import { Bot } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface TypingIndicatorProps {
  className?: string;
  showAvatar?: boolean;
  message?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  className = '',
  showAvatar = true,
  message
}) => {
  const { t } = useTranslation();

  return (
    <div 
      className={`flex justify-start animate-in slide-in-from-bottom-2 duration-300 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message || t('chat.aiTyping')}
    >
      <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
        {/* AI avatar */}
        {showAvatar && (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </div>
        )}
        
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 shadow-sm">
          {/* Custom message or dots animation */}
          {message ? (
            <div className="text-sm text-gray-600 dark:text-gray-300 italic">
              {message}
            </div>
          ) : (
            <div className="flex space-x-1" aria-hidden="true">
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]"></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]"></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced typing indicator with pulse effect
export const PulseTypingIndicator: React.FC<TypingIndicatorProps> = ({
  className = '',
  showAvatar = true,
  message
}) => {
  const { t } = useTranslation();

  return (
    <div 
      className={`flex justify-start animate-in slide-in-from-bottom-2 duration-300 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message || t('chat.aiTyping')}
    >
      <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
        {/* AI avatar with pulse */}
        {showAvatar && (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center relative">
            <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </div>
        )}
        
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 shadow-sm relative overflow-hidden">
          {message ? (
            <div className="text-sm text-gray-600 dark:text-gray-300 italic">
              {message}
            </div>
          ) : (
            <>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
              <div className="flex space-x-1" aria-hidden="true">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]"></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator; 