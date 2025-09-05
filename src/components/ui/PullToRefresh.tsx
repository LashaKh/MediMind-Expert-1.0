import React from 'react';
import { RefreshCw, Stethoscope } from 'lucide-react';

interface PullToRefreshProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  pullProgress: number;
  className?: string;
}

/**
 * Production-ready pull-to-refresh visual indicator with medical theming.
 * Features smooth animations, haptic feedback, and professional medical design.
 */
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  isPulling,
  isRefreshing,
  pullDistance,
  pullProgress,
  className = ''
}) => {
  const isVisible = isPulling || isRefreshing;
  const scale = Math.min(pullProgress * 1.2, 1);
  const rotation = isRefreshing ? 360 : pullProgress * 180;
  const opacity = Math.min(pullProgress * 2, 1);

  if (!isVisible && pullDistance === 0) return null;

  return (
    <div 
      className={`absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-300 ease-out ${className}`}
      style={{
        height: `${Math.max(pullDistance, 0)}px`,
        opacity: opacity,
        transform: `translateY(-${Math.max(pullDistance - 60, 0)}px)` // Keep indicator visible
      }}
    >
      {/* Simple indicator that appears as page is pulled down */}
      <div className="flex flex-col items-center justify-center">
        {/* Main indicator circle */}
        <div 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 shadow-lg transition-all duration-300 ease-out"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
          }}
        >
          {/* Icon */}
          <div className="text-white">
            {isRefreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Stethoscope className="w-4 h-4" />
            )}
          </div>
        </div>
        
        {/* Status text */}
        {pullDistance > 30 && (
          <p className="text-xs font-medium text-slate-600 mt-2">
            {isRefreshing ? 'Refreshing...' : pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
          </p>
        )}
      </div>
    </div>
  );
};

export default PullToRefresh;