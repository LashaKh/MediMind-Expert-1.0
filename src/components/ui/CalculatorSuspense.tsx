import React from 'react';
import { Calculator, Loader2, Sparkles, Activity } from 'lucide-react';

interface CalculatorSuspenseProps {
  calculatorName?: string;
  className?: string;
}

export const CalculatorLoadingFallback: React.FC<CalculatorSuspenseProps> = ({ 
  calculatorName = "Medical Calculator",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] p-8 space-y-6 ${className}`}>
      {/* Animated loading icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
        <div className="relative p-6 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl shadow-lg">
          <Calculator className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-bounce" />
          {/* Floating sparkles */}
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-spin" />
          <Activity className="absolute -bottom-1 -left-1 w-5 h-5 text-purple-500 animate-pulse" />
        </div>
      </div>

      {/* Loading text with gradient */}
      <div className="text-center space-y-3">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Loading {calculatorName}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
          Preparing evidence-based clinical calculations...
        </p>
      </div>

      {/* Animated loading bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse-slow"></div>
        </div>
      </div>

      {/* Loading spinner with dots */}
      <div className="flex items-center space-x-2">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export const CalculatorErrorBoundary: React.FC<{ 
  children: React.ReactNode;
  calculatorName?: string;
}> = ({ children, calculatorName = "Calculator" }) => {
  return (
    <React.Suspense 
      fallback={<CalculatorLoadingFallback calculatorName={calculatorName} />}
    >
      {children}
    </React.Suspense>
  );
};