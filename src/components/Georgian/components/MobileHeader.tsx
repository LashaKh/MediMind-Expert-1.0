import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Activity, Zap } from 'lucide-react';

interface AuthStatus {
  isAuthenticated: boolean;
}

interface RecordingState {
  isRecording: boolean;
}

interface MobileHeaderProps {
  authStatus: AuthStatus;
  recordingState: RecordingState;
  processing?: boolean;
  onOpenMobileSessions?: () => void;
  sessionsCount?: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  authStatus,
  recordingState,
  processing = false,
  onOpenMobileSessions,
  sessionsCount = 0,
}) => {
  const navigate = useNavigate();

  return (
    <div className="lg:hidden bg-white border-b border-[#90cdf4]/30 relative z-10">
      {/* Mobile-optimized header - 64px height for better presence */}
      <div className="px-4 py-3 flex items-center justify-between h-16">
        
        {/* Left Section - Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Back to home"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center Section - Enhanced Branding */}
        <div className="flex items-center space-x-3 flex-1 justify-center">
          <div className="w-10 h-10 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#1a365d] leading-tight">
              MediScribe
            </h1>
            <p className="text-sm text-[#2b6cb0] font-medium leading-tight">
              AI Transcription
            </p>
          </div>
        </div>

        {/* Right Section - Status & Sessions */}
        <div className="flex items-center space-x-2">
          {/* Status Indicator */}
          <div className={`relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-300 ${
            authStatus.isAuthenticated
              ? 'bg-gradient-to-r from-[#90cdf4]/10 via-[#63b3ed]/10 to-[#90cdf4]/10 border border-[#63b3ed]/50'
              : 'bg-gradient-to-r from-[#90cdf4]/10 via-[#63b3ed]/10 to-[#90cdf4]/10 border border-[#90cdf4]/50'
          }`}>
            {/* Status Light */}
            <div className="relative">
              <div className={`w-2 h-2 rounded-full ${
                authStatus.isAuthenticated 
                  ? 'bg-gradient-to-r from-[#63b3ed] to-[#2b6cb0]' 
                  : 'bg-gradient-to-r from-[#90cdf4] to-[#63b3ed]'
              }`} />
              {authStatus.isAuthenticated && (
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#63b3ed] animate-ping opacity-40" />
              )}
            </div>
            
            {/* Status Icon */}
            {processing ? (
              <Zap className="w-3 h-3 text-[#2b6cb0] animate-pulse" />
            ) : (
              <Activity className={`w-3 h-3 ${
                authStatus.isAuthenticated 
                  ? 'text-[#2b6cb0]' 
                  : 'text-[#2b6cb0]'
              }`} />
            )}
            
            {/* Recording Indicator */}
            {recordingState.isRecording && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-full animate-pulse" />
            )}
          </div>

          {/* Sessions Button */}
          {onOpenMobileSessions && (
            <button
              onClick={onOpenMobileSessions}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#90cdf4]/20 border border-[#63b3ed]/30 transition-all duration-200 hover:bg-[#90cdf4]/30 active:scale-95"
              aria-label={`Open sessions (${sessionsCount})`}
              style={{ minWidth: '44px', minHeight: '44px' }}
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
        </div>
      </div>

      {/* Subtle bottom border with shimmer effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#90cdf4]/60 to-transparent" />
    </div>
  );
};