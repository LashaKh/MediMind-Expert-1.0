import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

interface TourProgressProps {
  currentStep: number;
  totalSteps: number;
  variant?: 'dots' | 'line' | 'ring' | 'steps';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export const TourProgress: React.FC<TourProgressProps> = ({
  currentStep,
  totalSteps,
  variant = 'dots',
  size = 'md',
  showLabels = false,
  className = ''
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const sizeClasses = {
    sm: {
      dot: 'w-2 h-2',
      activeDot: 'w-3 h-3',
      text: 'text-xs',
      line: 'h-1',
      ring: 'w-12 h-12',
      strokeWidth: '2'
    },
    md: {
      dot: 'w-3 h-3',
      activeDot: 'w-4 h-4',
      text: 'text-sm',
      line: 'h-2',
      ring: 'w-16 h-16',
      strokeWidth: '3'
    },
    lg: {
      dot: 'w-4 h-4',
      activeDot: 'w-5 h-5',
      text: 'text-base',
      line: 'h-3',
      ring: 'w-20 h-20',
      strokeWidth: '4'
    }
  };

  const sizes = sizeClasses[size];

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ 
              scale: i <= currentStep ? 1 : 0.7,
              backgroundColor: i < currentStep 
                ? '#10b981' 
                : i === currentStep 
                  ? '#3b82f6' 
                  : '#d1d5db'
            }}
            transition={{
              duration: 0.3,
              delay: i * 0.1,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className={`
              ${i === currentStep ? sizes.activeDot : sizes.dot}
              rounded-full transition-all duration-300
              ${i < currentStep 
                ? 'bg-green-500 shadow-lg shadow-green-500/30' 
                : i === currentStep 
                  ? 'bg-blue-500 shadow-lg shadow-blue-500/30' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }
            `}
          />
        ))}
      </div>
    );
  }

  if (variant === 'line') {
    return (
      <div className={`w-full ${className}`}>
        {showLabels && (
          <div className={`flex justify-between items-center mb-2 ${sizes.text} text-gray-600 dark:text-gray-400`}>
            <span>Progress</span>
            <span className="font-semibold">{Math.round(progress)}%</span>
          </div>
        )}
        <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${sizes.line} overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ 
              duration: 0.8, 
              ease: [0.4, 0.0, 0.2, 1] 
            }}
            className={`${sizes.line} bg-gradient-to-r from-blue-500 to-blue-600 rounded-full relative`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
      </div>
    );
  }

  if (variant === 'ring') {
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className={`relative ${sizes.ring} ${className}`}>
        <svg className="transform -rotate-90 w-full h-full">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth={sizes.strokeWidth}
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="url(#progressGradient)"
            strokeWidth={sizes.strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: [0.4, 0.0, 0.2, 1] }}
            style={{
              strokeDasharray: circumference,
            }}
            className="tour-progress-ring"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold text-gray-900 dark:text-white ${sizes.text}`}>
              {Math.round(progress)}%
            </div>
            {showLabels && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {currentStep + 1}/{totalSteps}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'steps') {
    return (
      <div className={`flex items-center ${className}`}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <React.Fragment key={i}>
            {/* Step circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.3,
                delay: i * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              className={`
                relative flex items-center justify-center
                ${sizes.activeDot} rounded-full border-2 transition-all duration-300
                ${i < currentStep 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : i === currentStep 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                }
              `}
            >
              {i < currentStep ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <Circle className="w-3 h-3" />
              )}
            </motion.div>

            {/* Connecting line */}
            {i < totalSteps - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.1 + 0.2
                }}
                className={`
                  flex-1 h-0.5 mx-2 origin-left transition-all duration-300
                  ${i < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return null;
};