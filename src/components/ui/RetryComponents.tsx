import React, { useState } from 'react';
import { retryWithBackoff, RetryConfig, RetryState, RetryResult, DEFAULT_RETRY_CONFIG } from '../../lib/api/retryMechanism';

// Manual retry component
export interface ManualRetryProps {
  onRetry: () => void;
  isRetrying?: boolean;
  disabled?: boolean;
  error?: Error | unknown;
  className?: string;
}

export const ManualRetryButton: React.FC<ManualRetryProps> = ({
  onRetry,
  isRetrying = false,
  disabled = false,
  error,
  className = ""
}) => {
  return (
    <button
      onClick={onRetry}
      disabled={disabled || isRetrying}
      className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isRetrying ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Retrying...
        </>
      ) : (
        <>
          <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </>
      )}
    </button>
  );
};

// Retry indicator component
export interface RetryIndicatorProps {
  retryState: RetryState;
  className?: string;
}

export const RetryIndicator: React.FC<RetryIndicatorProps> = ({
  retryState,
  className = ""
}) => {
  if (!retryState.isRetrying) return null;
  
  const timeUntilRetry = retryState.nextRetryAt ? Math.max(0, retryState.nextRetryAt - Date.now()) : 0;
  const secondsUntilRetry = Math.ceil(timeUntilRetry / 1000);
  
  return (
    <div className={`flex items-center text-sm text-gray-600 ${className}`}>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>
        Retrying in {secondsUntilRetry} second{secondsUntilRetry !== 1 ? 's' : ''}...
        (Attempt {retryState.attempt} of {retryState.totalAttempts})
      </span>
    </div>
  );
};

// Retry hook for React components
export const useRetry = (config: RetryConfig = DEFAULT_RETRY_CONFIG) => {
  const [retryState, setRetryState] = useState<RetryState | null>(null);
  
  const executeWithRetry = async <T,>(
    operation: () => Promise<T>
  ): Promise<RetryResult<T>> => {
    return retryWithBackoff(
      operation,
      config,
      (state) => setRetryState(state)
    );
  };
  
  const clearRetryState = () => setRetryState(null);
  
  return {
    executeWithRetry,
    retryState,
    clearRetryState,
    isRetrying: retryState?.isRetrying || false
  };
}; 