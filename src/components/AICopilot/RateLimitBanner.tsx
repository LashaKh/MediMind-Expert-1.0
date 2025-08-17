import React from 'react';
import { AlertTriangle, Clock, RefreshCw, ExternalLink, X } from 'lucide-react';

interface RateLimitBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  onRetry?: () => void;
}

export const RateLimitBanner: React.FC<RateLimitBannerProps> = ({ 
  isVisible, 
  onDismiss, 
  onRetry 
}) => {
  if (!isVisible) return null;

  return (
    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">
            AI Service Rate Limit Reached
          </h3>
          <p className="text-sm text-amber-700 mb-3">
            Your AI assistant has reached its message limit. This is a temporary restriction 
            that helps ensure fair usage for all users.
          </p>
          
          <div className="text-sm text-amber-700 space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Please wait a few minutes before sending new messages</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>The limit will reset automatically</span>
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Try Again
              </button>
            )}
            <button
              onClick={onDismiss}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
            >
              Dismiss
            </button>
            <a
              href="https://flowise.ai/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Upgrade Plan
            </a>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-amber-500 hover:text-amber-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}; 