import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Sparkles, Zap, Mic, Square, Stethoscope, FileText, Clock, Settings, Plus } from 'lucide-react';

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
  // New Session control
  onCreateSession?: () => void;
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
  onModelChange,
  onCreateSession
}) => {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden">
      {/* Light Theme Background */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Subtle Border with Shimmer Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#90cdf4]/60 to-transparent dark:via-[#1a365d]/40" />
      
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
                  <FileText className="w-4 h-4 text-[#1a365d] mb-0.5" />
                  {sessionsCount > 0 && (
                    <span className="text-xs font-bold text-[#1a365d] leading-none">
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
                  <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-[#63b3ed]/20 rounded-xl sm:rounded-2xl animate-pulse" />
                )}
              </div>
              
              {/* Mobile-Optimized Typography */}
              <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <h1 
                    className="text-lg sm:text-xl lg:text-3xl font-bold text-[#1a365d] tracking-tight truncate cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    onClick={() => navigate('/')}
                    role="button"
                    aria-label="Navigate to home"
                  >
                    MediScribe
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-[#2b6cb0] font-medium tracking-wide truncate">
                  AI Medical Transcription
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - New Session Button */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">

            {/* New Session Button - Mobile Optimized */}
            {onCreateSession && authStatus.isAuthenticated && (
              <button
                onClick={() => onCreateSession?.()}
                disabled={recordingState.isRecording || processing}
                className={`
                  group relative flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-bold text-xs sm:text-sm transform hover:scale-105 active:scale-95 shadow-lg
                  ${recordingState.isRecording || processing
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-gray-200/30' 
                    : 'bg-gradient-to-r from-[#63b3ed] to-[#2b6cb0] hover:from-[#2b6cb0] hover:to-[#1a365d] text-white shadow-[#2b6cb0]/30'
                  }
                `}
                title={recordingState.isRecording ? "Cannot create new session during recording" : processing ? "Please wait for current process to complete" : "Create new recording session"}
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  {processing ? (
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-pulse" />
                  ) : (
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  )}
                </div>
                
                {/* Desktop label */}
                <div className="hidden lg:flex flex-col items-start">
                  <span className="font-bold text-sm leading-tight">
                    {processing ? 'Processing' : 'New'}
                  </span>
                  <span className="text-xs opacity-90 leading-tight">
                    {processing ? 'Please wait' : 'Session'}
                  </span>
                </div>
                
                {/* Tablet/Mobile label */}
                <span className="lg:hidden font-bold text-xs sm:text-sm">
                  {processing ? 'Processing' : 'New'}
                </span>
                
                {/* Recording Indicator */}
                {recordingState.isRecording && (
                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-full shadow-sm shadow-red-500/40 animate-pulse" />
                )}
              </button>
            )}

            {/* Fallback Status - Only show when not authenticated */}
            {!authStatus.isAuthenticated && (
              <div className="relative flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#90cdf4]/10 via-[#63b3ed]/10 to-[#90cdf4]/10 border border-[#90cdf4]/50">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-r from-[#90cdf4] to-[#63b3ed]" />
                <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-[#2b6cb0]">Connecting</span>
                <Activity className="sm:hidden w-3 h-3 text-[#2b6cb0]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};