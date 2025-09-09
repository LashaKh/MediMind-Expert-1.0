import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Sparkles, Zap, Mic, Square, Stethoscope, FileText, Clock, Settings } from 'lucide-react';

interface AuthStatus {
  isAuthenticated: boolean;
}

interface RecordingState {
  isRecording: boolean;
}

interface HeaderControlsProps {
  authStatus: AuthStatus;
  recordingState: RecordingState;
  processing?: boolean;
  activeTab?: 'transcript' | 'context' | 'ai';
  onOpenMobileSessions?: () => void;
  sessionsCount?: number;
  // Recording controls
  canRecord?: boolean;
  canStop?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  // STT model selection
  selectedSTTModel?: 'STT1' | 'STT2' | 'STT3';
  onModelChange?: (model: 'STT1' | 'STT2' | 'STT3') => void;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  authStatus,
  recordingState,
  processing = false,
  activeTab,
  onOpenMobileSessions,
  sessionsCount = 0,
  canRecord = false,
  canStop = false,
  onStartRecording,
  onStopRecording,
  selectedSTTModel = 'STT3',
  onModelChange
}) => {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden">
      {/* Transcription Theme Background */}
      <div className="absolute inset-0 transcription-header-bg" />
      <div className="absolute inset-0 backdrop-blur-xl" />
      
      {/* Subtle Border with Shimmer Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200/60 to-transparent dark:via-blue-800/40" />
      
      <div className="relative px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Mobile-Optimized Branding */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8 min-w-0 flex-1">
            {/* Mobile Sessions Button - Only visible on mobile */}
            {onOpenMobileSessions && (
              <button
                onClick={onOpenMobileSessions}
                className="lg:hidden transcription-btn-secondary flex items-center justify-center w-10 h-10 flex-shrink-0"
                aria-label={`Open sessions (${sessionsCount})`}
                style={{ minWidth: 'var(--medical-mobile-touch-md)', minHeight: 'var(--medical-mobile-touch-md)' }}
              >
                <div className="flex flex-col items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-0.5" />
                  {sessionsCount > 0 && (
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 leading-none">
                      {sessionsCount > 99 ? '99+' : sessionsCount}
                    </span>
                  )}
                </div>
              </button>
            )}
            
            {/* Mobile-Optimized Brand Identity */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
              {/* Compact Logo Area */}
              <div 
                className="relative flex-shrink-0 cursor-pointer"
                onClick={() => navigate('/')}
                role="button"
                aria-label="Navigate to home"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 transcription-primary-gradient rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                {/* Subtle glow animation when active */}
                {authStatus.isAuthenticated && (
                  <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-400/20 rounded-xl sm:rounded-2xl animate-pulse" />
                )}
              </div>
              
              {/* Mobile-Optimized Typography */}
              <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <h1 
                    className="text-lg sm:text-xl lg:text-3xl font-bold text-white tracking-tight truncate cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    onClick={() => navigate('/')}
                    role="button"
                    aria-label="Navigate to home"
                  >
                    MediScribe
                  </h1>
                  {/* Compact Premium Badge */}
                  <div className="hidden sm:flex items-center space-x-1 sm:space-x-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/50 dark:border-amber-700/30 rounded-full flex-shrink-0">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 tracking-wide">PRO</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-white/80 font-medium tracking-wide truncate">
                  AI Medical Transcription
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Mobile-Optimized Status */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {/* Mobile PRO Badge - Only show on smallest screens */}
            <div className="sm:hidden flex items-center space-x-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/50 dark:border-amber-700/30 rounded-full">
              <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">PRO</span>
            </div>

            {/* Compact Connection Status */}
            <div className={`relative flex items-center space-x-1.5 sm:space-x-2 lg:space-x-3 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 shadow-md ${
              authStatus.isAuthenticated
                ? 'bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 border border-emerald-300/50 dark:border-emerald-600/50'
                : 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/50 dark:border-amber-600/50'
            }`}>
              {/* Compact Status Light */}
              <div className="relative">
                <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                  authStatus.isAuthenticated 
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-sm shadow-emerald-500/30' 
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm shadow-amber-500/30'
                }`} />
                {authStatus.isAuthenticated && (
                  <div className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-ping opacity-40" />
                )}
              </div>
              
              {/* Status Text - Hidden on smallest screens, icon only on mobile */}
              <span className={`hidden sm:inline text-xs sm:text-sm font-semibold tracking-wide ${
                authStatus.isAuthenticated
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-amber-700 dark:text-amber-300'
              }`}>
                {processing ? 'Processing' : authStatus.isAuthenticated ? 'Ready' : 'Connecting'}
              </span>
              
              {/* Mobile Status Icon - Only show on mobile */}
              <div className="sm:hidden">
                {processing ? (
                  <Zap className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" />
                ) : (
                  <Activity className={`w-3 h-3 ${
                    authStatus.isAuthenticated 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`} />
                )}
              </div>
              
              {/* Recording Indicator */}
              {recordingState.isRecording && (
                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-full shadow-sm shadow-red-500/40 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};