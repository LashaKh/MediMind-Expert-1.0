import React from 'react';
import { Shield, Activity, Sparkles, Zap, Mic, Square, Stethoscope } from 'lucide-react';

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
  canRecord?: boolean;
  canStop?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  authStatus,
  recordingState,
  processing = false,
  activeTab,
  canRecord = false,
  canStop = false,
  onStartRecording,
  onStopRecording
}) => {
  return (
    <div className="relative overflow-hidden">
      {/* Sophisticated Background with Layered Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-white/98 to-blue-50/95 dark:from-slate-900/95 dark:via-gray-900/98 dark:to-blue-950/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent dark:from-blue-900/10" />
      <div className="absolute inset-0 backdrop-blur-xl" />
      
      {/* Subtle Border with Shimmer Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200/60 to-transparent dark:via-blue-800/40" />
      
      <div className="relative px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Branding Excellence */}
          <div className="flex items-center space-x-8">
            {/* Brand Identity with Sophisticated Typography */}
            <div className="flex items-center space-x-4">
              {/* Premium Logo Area - Medical Stethoscope Icon */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-medical-blue-600 via-medical-blue-700 to-medical-blue-800 rounded-2xl flex items-center justify-center shadow-xl shadow-medical-blue-500/25 dark:shadow-medical-blue-900/50 transition-all duration-300 hover:scale-105">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                {/* Subtle glow animation when active */}
                {authStatus.isAuthenticated && (
                  <div className="absolute inset-0 w-12 h-12 bg-blue-400/20 rounded-2xl animate-pulse" />
                )}
              </div>
              
              {/* Typography Hierarchy */}
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent tracking-tight">
                    MediScribe
                  </h1>
                  {/* Premium Badge */}
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/50 dark:border-amber-700/30 rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 tracking-wide">PRO</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium tracking-wide">
                  AI Medical Transcription
                </p>
              </div>
            </div>
            
          </div>

          {/* Right Section - Status & Controls */}
          <div className="flex items-center space-x-4">
            {/* Recording Controls - Only show when transcript tab is active */}
            {activeTab === 'transcript' && (
              <div className="flex items-center space-x-2">
                {!recordingState.isRecording ? (
                  <button
                    onClick={canRecord ? onStartRecording : undefined}
                    disabled={!canRecord}
                    className={`
                      relative flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg
                      ${canRecord 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40' 
                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400 shadow-none'
                      }
                    `}
                  >
                    {canRecord && (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-green-500/30 animate-pulse rounded-xl" />
                    )}
                    <div className="relative flex items-center space-x-2">
                      <Mic className="w-4 h-4" />
                      <span>Record</span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={canStop ? onStopRecording : undefined}
                    disabled={!canStop}
                    className="relative flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-red-500/25 hover:shadow-red-500/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 to-rose-500/30 animate-pulse rounded-xl" />
                    <div className="relative flex items-center space-x-2">
                      <Square className="w-4 h-4" />
                      <span>Stop</span>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Security Status */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-700/30 rounded-xl">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 tracking-wide">HIPAA</span>
            </div>

            {/* Connection Status - Premium Design */}
            <div className={`relative flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg ${
              authStatus.isAuthenticated
                ? 'bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 border border-emerald-300/50 dark:border-emerald-600/50 hover:shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/50 dark:border-amber-600/50 hover:shadow-amber-500/20'
            }`}>
              {/* Status Light with Advanced Animation */}
              <div className="relative">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  authStatus.isAuthenticated 
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30' 
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30'
                }`} />
                {authStatus.isAuthenticated && (
                  <>
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-40" />
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse opacity-60" />
                  </>
                )}
              </div>
              
              {/* Status Icon with Processing Animation */}
              <div className="relative">
                {processing ? (
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                ) : (
                  <Activity className={`w-4 h-4 ${
                    authStatus.isAuthenticated 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`} />
                )}
              </div>
              
              {/* Status Text */}
              <span className={`text-sm font-semibold tracking-wide ${
                authStatus.isAuthenticated
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-amber-700 dark:text-amber-300'
              }`}>
                {processing ? 'Processing' : authStatus.isAuthenticated ? 'Ready' : 'Connecting'}
              </span>
              
              {/* Recording Indicator */}
              {recordingState.isRecording && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-full shadow-lg shadow-red-500/40 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};