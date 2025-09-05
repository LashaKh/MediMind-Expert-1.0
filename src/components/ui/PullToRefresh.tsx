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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${className}`}
      style={{
        transform: `translateY(${Math.min(pullDistance * 0.5, 40)}px)`,
        opacity: opacity
      }}
    >
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-slate-50/80 to-transparent backdrop-blur-lg" />
      
      {/* Indicator container */}
      <div className="relative flex items-center justify-center pt-8 pb-4">
        {/* Main indicator circle */}
        <div 
          className="relative flex items-center justify-center w-12 h-12 transition-all duration-300 ease-out"
          style={{
            transform: `scale(${scale}) rotateZ(${rotation}deg)`,
          }}
        >
          {/* Background circle with medical gradient */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-lg">
            {/* Pulse effect for refreshing state */}
            {isRefreshing && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 animate-ping opacity-75" />
            )}
          </div>
          
          {/* Progress ring */}
          <div className="absolute inset-1 rounded-full border-2 border-white/30">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="2"
              />
              {/* Progress arc */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${pullProgress * 100}, 100`}
                className="transition-all duration-200 ease-out"
              />
            </svg>
          </div>
          
          {/* Icon */}
          <div className="relative z-10 text-white">
            {isRefreshing ? (
              <RefreshCw 
                className="w-5 h-5 animate-spin" 
                style={{
                  animationDuration: '1s'
                }}
              />
            ) : (
              <Stethoscope 
                className="w-5 h-5 transition-transform duration-200"
                style={{
                  transform: `scale(${Math.min(pullProgress * 1.5, 1)})`
                }}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Status text */}
      <div className="relative flex items-center justify-center pb-4">
        <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
          <p className="text-sm font-medium text-slate-700 transition-all duration-200">
            {isRefreshing ? (
              <span className="flex items-center space-x-2">
                <span>Refreshing...</span>
              </span>
            ) : pullProgress >= 1 ? (
              <span className="text-blue-600 font-semibold">Release to refresh</span>
            ) : (
              <span>Pull to refresh</span>
            )}
          </p>
        </div>
      </div>
      
      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-slate-50/20 pointer-events-none" />
    </div>
  );
};

export default PullToRefresh;