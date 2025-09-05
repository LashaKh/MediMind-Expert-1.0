import React, { ReactNode, useCallback } from 'react';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { PullToRefresh } from './PullToRefresh';

interface PullToRefreshContainerProps {
  children: ReactNode;
  onRefresh?: () => Promise<void> | void;
  enabled?: boolean;
  className?: string;
}

/**
 * Container component that adds pull-to-refresh functionality to its children.
 * Designed with no circular dependencies and safe fallbacks.
 */
export const PullToRefreshContainer: React.FC<PullToRefreshContainerProps> = ({
  children,
  onRefresh,
  enabled = true,
  className = ''
}) => {
  // Default refresh handler that reloads the page
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      // Default behavior: reload the page after a small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  }, [onRefresh]);

  // Use the pull-to-refresh hook
  const pullToRefreshState = usePullToRefresh({
    onRefresh: handleRefresh,
    enabled,
    threshold: 80,
    resistance: 2.5,
    refreshingTimeout: 2000
  });

  return (
    <div className={`relative ${className}`}>
      {/* Pull-to-refresh indicator */}
      <PullToRefresh {...pullToRefreshState} />
      
      {/* Main content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default PullToRefreshContainer;