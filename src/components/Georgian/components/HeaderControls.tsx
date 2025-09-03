import React from 'react';
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
  return (
    <div className="relative overflow-hidden">
      {/* Sophisticated Background with Layered Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-white/98 to-blue-50/95 dark:from-slate-900/95 dark:via-gray-900/98 dark:to-blue-950/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent dark:from-blue-900/10" />
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
                className="lg:hidden flex items-center justify-center w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-blue-200/50 dark:border-gray-600/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
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
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-medical-blue-600 via-medical-blue-700 to-medical-blue-800 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-medical-blue-500/25 dark:shadow-medical-blue-900/50 transition-all duration-300">
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
                  <h1 className="text-lg sm:text-xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent tracking-tight truncate">
                    MediScribe
                  </h1>
                  {/* Compact Premium Badge */}
                  <div className="hidden sm:flex items-center space-x-1 sm:space-x-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/50 dark:border-amber-700/30 rounded-full flex-shrink-0">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 tracking-wide">PRO</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium tracking-wide truncate">
                  AI Medical Transcription
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Mobile-Optimized Status */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {/* STT Model Selector */}
            {onModelChange && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-400" />
                <select
                  value={selectedSTTModel}
                  onChange={(e) => onModelChange(e.target.value as 'STT1' | 'STT2' | 'STT3')}
                  className="text-xs sm:text-sm font-medium bg-white/90 dark:bg-gray-800/90 border border-slate-300 dark:border-gray-600 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                  disabled={recordingState.isRecording}
                  title={recordingState.isRecording ? "Cannot change model during recording" : "Select STT model"}
                >
                  <option value="STT1">STT1 (Fast)</option>
                  <option value="STT2">STT2 (Balanced)</option>
                  <option value="STT3">STT3 (Accurate)</option>
                </select>
              </div>
            )}
            {/* Mobile Record Button - Only show on mobile when recording functions are available */}
            {activeTab === 'transcript' && (onStartRecording || onStopRecording) && (
              <button
                onClick={recordingState.isRecording ? (canStop ? onStopRecording : undefined) : (canRecord ? onStartRecording : undefined)}
                disabled={recordingState.isRecording ? !canStop : !canRecord}
                className={`
                  lg:hidden relative flex items-center justify-center w-12 h-12 rounded-2xl transform transition-all duration-300 
                  premium-hover-lift active:scale-95 shadow-xl overflow-hidden
                  medical-touch-target-lg
                  ${recordingState.isRecording 
                    ? (canStop 
                        ? 'bg-gradient-to-br from-red-500 via-rose-600 to-red-600 hover:from-red-600 hover:via-rose-700 hover:to-red-700 text-white shadow-red-500/40' 
                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400 shadow-none')
                    : (canRecord 
                        ? 'bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-600 hover:from-emerald-600 hover:via-green-700 hover:to-emerald-700 text-white shadow-emerald-500/40' 
                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400 shadow-none')
                  }
                `}
                style={{ minHeight: '48px', minWidth: '48px' }}
              >
                {(recordingState.isRecording ? canStop : canRecord) && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-premium-gradient" />
                )}
                {recordingState.isRecording ? (
                  <Square className="w-6 h-6 relative z-10" />
                ) : (
                  <Mic className="w-6 h-6 relative z-10" />
                )}
                
                {/* Pulsing ring animation for recording state */}
                {recordingState.isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-2xl border-4 border-red-400/60 animate-premium-pulse-ring" />
                    <div className="absolute inset-0 rounded-2xl border-2 border-red-300/40 animate-premium-pulse-ring" style={{ animationDelay: '0.5s' }} />
                  </>
                )}
              </button>
            )}
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