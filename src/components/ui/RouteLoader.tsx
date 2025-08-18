import React from 'react';

interface RouteLoaderProps {
  pageName?: string;
}

export const RouteLoader: React.FC<RouteLoaderProps> = ({ pageName = 'Page' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-[300px] h-[300px] bg-gradient-to-r from-blue-400/10 via-violet-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/5 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-pink-400/8 via-rose-400/8 to-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 p-8">
        {/* Enhanced loading animation */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          
          {/* Inner rotating ring with delay */}
          <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-r-violet-600 border-b-violet-600 rounded-full animate-spin" style={{ animationDelay: '0.2s', animationDirection: 'reverse' }}></div>
          
          {/* Central pulsing dot */}
          <div className="absolute inset-1/2 w-2 h-2 -mt-1 -ml-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full animate-pulse"></div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-violet-900 dark:from-white dark:via-blue-200 dark:to-violet-300 bg-clip-text text-transparent">
            Loading {pageName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Preparing your medical workspace...
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex space-x-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* MediMind branding */}
        <div className="mt-8 text-center">
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            MediMind Expert
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Medical AI Assistant
          </div>
        </div>
      </div>
    </div>
  );
};