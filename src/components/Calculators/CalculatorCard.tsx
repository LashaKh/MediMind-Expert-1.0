import React, { memo } from 'react';
import { Calculator, Sparkles, Activity, CheckCircle, BookOpen, Play } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface CalculatorCardProps {
  id: string;
  name: string;
  description: string;
  onClick: (id: string) => void;
  index: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isMobile?: boolean;
}

export const CalculatorCard = memo<CalculatorCardProps>(({ 
  id, 
  name, 
  description, 
  onClick, 
  index, 
  onMouseEnter,
  onMouseLeave,
  isMobile = false 
}) => {
  const handleClick = () => onClick(id);

  return (
    <Card 
      className="group relative cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-blue-900/10 dark:to-gray-800 backdrop-blur-sm overflow-hidden rounded-2xl md:hover:-translate-y-3 h-[280px] sm:h-[320px] flex flex-col"
      onClick={handleClick}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Animated background - desktop only */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating orb effect - desktop only */}
      <div className="hidden md:block absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:animate-pulse"></div>
      
      <CardHeader className={`relative flex-1 flex flex-col ${isMobile ? 'p-4 space-y-4' : 'p-6 lg:p-8 space-y-4 lg:space-y-6'}`}>
        {/* Top row with icon and status - responsive layout */}
        <div className="flex items-start justify-between">
          {/* Calculator icon with responsive sizing */}
          <div className="relative">
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className={`relative bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg ${isMobile ? 'p-3' : 'p-3 lg:p-4'}`}>
              <Calculator className={`text-blue-600 dark:text-blue-400 ${isMobile ? 'w-5 h-5' : 'w-6 h-6 lg:w-8 lg:h-8'}`} />
            </div>
            {/* Floating sparkle - desktop only */}
            <Sparkles className="hidden md:block absolute -top-1 -right-1 w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 animate-spin transition-opacity duration-300" />
          </div>
          
          {/* Validation badge - responsive sizing */}
          <div className={`flex items-center space-x-1 lg:space-x-2 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg lg:rounded-xl border border-emerald-200 dark:border-emerald-700 shadow-lg min-h-[44px] ${isMobile ? 'px-3 py-2' : 'px-3 py-2 lg:px-4 lg:py-3'}`}>
            <CheckCircle className={`text-emerald-600 dark:text-emerald-400 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span className={`font-bold text-emerald-600 dark:text-emerald-400 ${isMobile ? 'text-xs' : 'text-xs lg:text-sm'}`}>
              {isMobile ? '✓' : 'VALIDATED'}
            </span>
          </div>
        </div>

        {/* Title and description - responsive typography */}
        <div className="flex-1 space-y-2 lg:space-y-4">
          <CardTitle className={`font-bold text-gray-900 dark:text-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 leading-tight ${isMobile ? 'text-lg' : 'text-lg lg:text-xl'}`}>
            {name}
          </CardTitle>
          <CardDescription className={`text-gray-600 dark:text-gray-300 leading-relaxed ${isMobile ? 'text-sm line-clamp-3' : 'text-sm line-clamp-3'}`}>
            {description}
          </CardDescription>
        </div>

        {/* Enhanced bottom row - responsive layout */}
        <div className={`flex items-center justify-between pt-4 ${!isMobile ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}>
          {/* Clinical grade indicator - hidden on mobile to save space */}
          <div className={`items-center space-x-2 ${isMobile ? 'hidden' : 'flex'}`}>
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Clinical Grade</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Evidence-Based</span>
            </div>
          </div>
          
          {/* Action button - responsive sizing with proper touch targets */}
          <div className={`flex items-center text-blue-600 dark:text-blue-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-all duration-300 min-h-[44px] min-w-[44px] ${isMobile ? 'ml-auto group-hover:translate-x-1' : 'space-x-2 group-hover:translate-x-2'}`}>
            <span className={`font-bold ${isMobile ? 'text-sm' : 'text-sm'}`}>Launch</span>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors duration-300">
              <Play className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
});

CalculatorCard.displayName = 'CalculatorCard';