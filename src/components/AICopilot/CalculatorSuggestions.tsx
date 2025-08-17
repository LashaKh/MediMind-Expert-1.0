import React, { useState } from 'react';
import { Calculator, ChevronRight, Sparkles, X, TrendingUp, ArrowRight, Zap, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { CalculatorRecommendation } from '../../services/calculatorRecommendation';

interface CalculatorSuggestionsProps {
  recommendations: CalculatorRecommendation[];
  matchedKeywords: string[];
  confidence: number;
  onCalculatorSelect: (calculatorId: string) => void;
  onDismiss: () => void;
  className?: string;
}

export const CalculatorSuggestions: React.FC<CalculatorSuggestionsProps> = ({
  recommendations,
  matchedKeywords,
  confidence,
  onCalculatorSelect,
  onDismiss,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  
  if (recommendations.length === 0 || confidence < 0.3) {
    return null;
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return 'bg-gradient-to-r from-emerald-500 to-green-500';
    if (score >= 0.5) return 'bg-gradient-to-r from-amber-500 to-orange-500';
    return 'bg-gradient-to-r from-blue-500 to-indigo-500';
  };

  const topRecommendation = recommendations[0];
  const remainingCount = recommendations.length - 1;

  // Ultra-compact inline design
  return (
    <div className={`relative flex items-center gap-2 p-2 mb-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 calculator-suggestion-compact ${className}`}>
      {/* Icon with animation */}
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm zap-icon-pulse">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center notification-badge">
          <span className="text-[8px] text-white font-bold">{recommendations.length}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Found calculator:
          </span>
          <button
            onClick={() => onCalculatorSelect(topRecommendation.id)}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate max-w-[200px] transition-colors calculator-pill"
          >
            {topRecommendation.name}
          </button>
          <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium ${getConfidenceColor(topRecommendation.relevanceScore)}`}>
            {Math.round(topRecommendation.relevanceScore * 100)}%
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {remainingCount > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all compact-button"
          >
            <Plus className="w-3 h-3" />
            <span>{remainingCount}</span>
          </button>
        )}
        <button
          onClick={onDismiss}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors compact-button"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded view */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 glass-dropdown rounded-lg shadow-lg z-50 calculator-dropdown">
          <div className="space-y-1">
            {recommendations.slice(1).map((calc) => (
              <button
                key={calc.id}
                onClick={() => onCalculatorSelect(calc.id)}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-left transition-colors group"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {calc.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(calc.relevanceScore * 100)}%
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => onCalculatorSelect('all')}
            className="w-full mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            View all calculators
          </button>
        </div>
      )}
    </div>
  );
}; 