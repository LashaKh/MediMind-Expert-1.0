import React, { useState } from 'react';
import { 
  ChevronDown, 
  Stethoscope, 
  Clock, 
  Activity,
  Pulse,
  RadioIcon,
  Waves,
  Zap,
  Sparkles,
  Shield,
  Crown,
  CheckCircle2,
  Mic,
  StopCircle,
  PauseCircle,
  PlayCircle,
  BarChart3
} from 'lucide-react';
import { MedicalButton } from '../../ui/MedicalDesignSystem';

interface Session {
  id: string;
  title: string;
  transcript: string;
  createdAt: number;
  updatedAt: number;
  duration: number;
}

interface MobileSessionHeaderProps {
  currentSession: Session | null;
  sessions: Session[];
  recordingDuration: number;
  onOpenDrawer: () => void;
  formatTime: (ms: number) => string;
}

export const MobileSessionHeader: React.FC<MobileSessionHeaderProps> = ({
  currentSession,
  sessions,
  recordingDuration,
  onOpenDrawer,
  formatTime
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [rippleStyle, setRippleStyle] = useState<{ left: number; top: number } | null>(null);

  const handleButtonPress = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const left = e.clientX - rect.left;
    const top = e.clientY - rect.top;
    
    setRippleStyle({ left, top });
    setIsPressed(true);
    
    setTimeout(() => {
      setRippleStyle(null);
      setIsPressed(false);
    }, 600);
    
    onOpenDrawer();
  };

  return (
    <div className="lg:hidden relative overflow-hidden">
      {currentSession ? (
        // Active session header with premium animations and micro-interactions
        <div className="relative h-16 bg-white/95 dark:bg-medical-gray-800/95 backdrop-blur-2xl border-b border-medical-gray-200/50 dark:border-medical-gray-700/50 shadow-lg">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-medical-blue-500/10 via-purple-500/5 to-medical-blue-500/10 animate-pulse" />
          
          {/* Recording pulse indicator */}
          {recordingDuration > 0 && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-red-500 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          )}

          <div className="relative p-4 flex items-center justify-between">
            {/* Session info with enhanced styling */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Dynamic session icon with status indicators */}
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-medical-blue-600 to-medical-blue-700 flex items-center justify-center shadow-lg shadow-medical-blue-500/30">
                  <Stethoscope className="w-6 h-6 text-white" />
                  
                  {/* Active recording indicator */}
                  {recordingDuration > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full border-2 border-white dark:border-medical-gray-800 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                  
                  {/* Quality indicator */}
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full border-2 border-white dark:border-medical-gray-800 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                
                {/* Pulsing ring for active sessions */}
                {recordingDuration > 0 && (
                  <div className="absolute inset-0 w-12 h-12 rounded-2xl border-2 border-red-400/50 animate-ping" />
                )}
              </div>

              {/* Session details with animations */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-bold text-medical-gray-900 dark:text-white truncate animate-in slide-in-from-left-3 duration-300">
                    {currentSession.title}
                  </h3>
                  
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  {/* Status indicator with animation */}
                  <div className="flex items-center space-x-2">
                    {recordingDuration > 0 ? (
                      <>
                        <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <span className="font-semibold">Recording</span>
                        </div>
                        <div className="text-red-600 dark:text-red-400 font-mono font-bold">
                          {formatTime(recordingDuration)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                          <Shield className="w-3 h-3" />
                          <span className="font-medium">Active Session</span>
                        </div>
                        {currentSession.transcript && (
                          <div className="flex items-center space-x-1 text-medical-blue-600 dark:text-medical-blue-400">
                            <BarChart3 className="w-3 h-3" />
                            <span className="font-medium">{currentSession.transcript.split(' ').length} words</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced drawer toggle button */}
            <button
              onClick={handleButtonPress}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              onMouseLeave={() => setIsPressed(false)}
              className={`
                relative overflow-hidden w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg
                ${isPressed 
                  ? 'scale-95 bg-gradient-to-br from-medical-blue-700 to-medical-blue-800 shadow-xl shadow-medical-blue-500/40' 
                  : 'scale-100 bg-gradient-to-br from-medical-blue-600 to-medical-blue-700 shadow-medical-blue-500/30 hover:shadow-xl hover:shadow-medical-blue-500/40 hover:scale-105'
                }
              `}
              aria-label="Open session history"
            >
              {/* Ripple effect */}
              {rippleStyle && (
                <span 
                  className="absolute w-0 h-0 bg-white/30 rounded-full animate-ping"
                  style={{ 
                    left: rippleStyle.left, 
                    top: rippleStyle.top,
                    animation: 'ripple 0.6s linear'
                  }} 
                />
              )}
              
              {/* Button icon with micro-animation */}
              <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${isPressed ? 'rotate-180 scale-90' : 'rotate-0 scale-100'}`} />
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-200" />
            </button>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-medical-blue-500/50 to-transparent" />
        </div>
      ) : (
        // No active session - premium empty state
        <div className="relative h-16 bg-white/95 dark:bg-medical-gray-800/95 backdrop-blur-2xl border-b border-medical-gray-200/50 dark:border-medical-gray-700/50 shadow-lg">
          {/* Subtle background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-medical-gray-500/5 via-medical-blue-500/5 to-medical-gray-500/5" />
          
          <div className="relative p-4 flex items-center justify-between">
            {/* Empty state with enhanced styling */}
            <div className="flex items-center space-x-4">
              {/* Elegant empty state icon */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-medical-gray-200 to-medical-gray-300 dark:from-medical-gray-600 dark:to-medical-gray-700 flex items-center justify-center shadow-lg relative overflow-hidden">
                <Stethoscope className="w-6 h-6 text-medical-gray-500 dark:text-medical-gray-400" />
                
                {/* Subtle shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-medical-gray-900 dark:text-white">
                  Ready to Begin
                </h3>
                <p className="text-sm text-medical-gray-600 dark:text-medical-gray-400 flex items-center space-x-2">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    <span>{sessions.length} sessions available</span>
                  </span>
                  <span className="w-1 h-1 bg-medical-gray-400 rounded-full" />
                  <span className="flex items-center space-x-1">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <span>Secure</span>
                  </span>
                </p>
              </div>
            </div>

            {/* Premium sessions button */}
            <button
              onClick={handleButtonPress}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              onMouseLeave={() => setIsPressed(false)}
              className={`
                relative overflow-hidden px-6 h-12 rounded-2xl flex items-center space-x-2 transition-all duration-200 shadow-lg font-semibold
                ${isPressed 
                  ? 'scale-95 bg-gradient-to-r from-medical-blue-700 via-medical-blue-800 to-purple-700 shadow-xl shadow-medical-blue-500/40' 
                  : 'scale-100 bg-gradient-to-r from-medical-blue-600 via-medical-blue-700 to-purple-600 shadow-medical-blue-500/30 hover:shadow-xl hover:shadow-medical-blue-500/40 hover:scale-105'
                }
              `}
              aria-label="View sessions"
            >
              {/* Ripple effect */}
              {rippleStyle && (
                <span 
                  className="absolute w-0 h-0 bg-white/30 rounded-full animate-ping"
                  style={{ 
                    left: rippleStyle.left, 
                    top: rippleStyle.top,
                    animation: 'ripple 0.6s linear'
                  }} 
                />
              )}
              
              {/* Button content */}
              <Stethoscope className={`w-4 h-4 text-white transition-transform duration-200 ${isPressed ? 'scale-90' : 'scale-100'}`} />
              <span className="text-white text-sm">Sessions</span>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-200" />
              
              {/* Premium shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </button>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-medical-gray-300/50 dark:via-medical-gray-600/50 to-transparent" />
        </div>
      )}

      {/* Custom CSS animations */}
      <style>{`
        @keyframes ripple {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 40px;
            height: 40px;
            opacity: 0;
            margin-left: -20px;
            margin-top: -20px;
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-10px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .slide-in-from-left-3 {
          animation: slideInFromLeft 0.3s ease-out;
        }

        /* Hover effect for buttons */
        button:hover .hover-glow {
          opacity: 1;
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};