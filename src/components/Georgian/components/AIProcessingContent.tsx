import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Crown, 
  Zap, 
  Shield, 
  Send, 
  Wand2, 
  Lightbulb, 
  MessageSquare, 
  History, 
  Trash2, 
  AlertCircle, 
  X, 
  Star, 
  HeartHandshake, 
  User, 
  Copy, 
  Clock, 
  Hash, 
  Microscope 
} from 'lucide-react';
import { MedicalButton } from '../../ui/MedicalDesignSystem';

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface AIProcessingContentProps {
  transcript: string;
  hasTranscript: boolean;
  processing: boolean;
  aiError?: string | null;
  processingHistory?: ProcessingHistory[];
  onProcessText?: (instruction: string) => void;
  onClearAIError?: () => void;
  onClearHistory?: () => void;
}

const SAMPLE_INSTRUCTIONS = [
  'Summarize this medical consultation in English',
  'Extract patient symptoms and complaints',
  'List all mentioned medications and dosages',
  'Identify medical procedures discussed',
  'Translate key medical terms to English',
  'Create a problem list from this consultation'
];

const formatProcessingTime = (ms: number) => {
  return `${(ms / 1000).toFixed(2)}s`;
};

export const AIProcessingContent: React.FC<AIProcessingContentProps> = ({
  transcript,
  hasTranscript,
  processing,
  aiError,
  processingHistory = [],
  onProcessText,
  onClearAIError,
  onClearHistory
}) => {
  const [instruction, setInstruction] = useState('');

  const handleProcessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instruction.trim() && onProcessText) {
      onProcessText(instruction.trim());
      setInstruction('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-gray-800 dark:via-gray-700/80 dark:to-blue-900/10">
      {/* Premium AI Processing Header */}
      <div className="relative bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-indigo-900/30 backdrop-blur-xl p-6 lg:p-8 border-b border-purple-200/30 dark:border-purple-700/30 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-transparent to-purple-600 animate-pulse"/>
          <Brain className="absolute top-4 right-4 w-32 h-32 text-purple-300 opacity-10 animate-pulse"/>
        </div>
        
        <div className="relative z-10 flex items-center space-x-6 mb-6">
          <div className="relative group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-500 transform group-hover:scale-110">
              <Brain className="w-7 h-7 text-white drop-shadow-lg" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl" />
            </div>
            
            {/* Processing Animation Ring */}
            {processing && (
              <div className="absolute -inset-1 border-2 border-purple-400 rounded-2xl animate-pulse opacity-60" />
            )}
            
            {/* AI Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full border-3 border-white dark:border-gray-800 shadow-lg flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-800 via-pink-700 to-indigo-800 dark:from-purple-100 dark:via-pink-100 dark:to-indigo-100 bg-clip-text text-transparent">
                AI Medical Intelligence
              </h3>
              <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border border-purple-200/50 dark:border-purple-700/30 rounded-full">
                <Crown className="w-3 h-3 text-purple-600 dark:text-purple-400"/>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Neural</span>
              </div>
            </div>
            
            <p className="text-purple-700 dark:text-purple-300 text-base font-medium mb-3">
              Advanced AI-powered medical transcript analysis with clinical intelligence
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/30 rounded-lg">
                <Zap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Real-time Processing</span>
              </div>
              
              <div className="flex items-center space-x-2 px-3 py-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/30 rounded-lg">
                <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Processing Interface */}
        {hasTranscript && (
          <form onSubmit={handleProcessSubmit} className="relative">
            <div className="relative bg-gradient-to-br from-white via-slate-50/50 to-purple-50/30 dark:from-gray-800 dark:via-gray-700/80 dark:to-purple-900/10 backdrop-blur-xl rounded-3xl border border-purple-200/30 dark:border-purple-600/30 shadow-xl shadow-purple-500/10 overflow-hidden">
              {/* Glass Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-gray-700/20 pointer-events-none rounded-3xl" />
              
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Describe what you want AI to extract or analyze from the medical transcript..."
                className="relative z-10 w-full px-8 py-6 pr-20 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-base leading-relaxed"
                rows={4}
                disabled={processing}
                style={{
                  fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
                }}
              />
              
              {/* Premium Submit Button */}
              <div className="absolute bottom-6 right-6">
                <MedicalButton
                  type="submit"
                  disabled={processing || !instruction.trim()}
                  variant="primary"
                  size="xl"
                  loading={processing}
                  leftIcon={processing ? undefined : Send}
                  rightIcon={processing ? Sparkles : Wand2}
                  className="shadow-2xl min-w-[120px] h-16"
                  aria-label="Submit AI analysis request"
                >
                  <span className="font-bold">
                    {processing ? 'Processing' : 'Analyze'}
                  </span>
                </MedicalButton>
              </div>
            </div>
          </form>
        )}

        {/* Premium Quick Actions */}
        {hasTranscript && (
          <div className="mt-8">
            <div className="flex items-center space-x-3 mb-4">
              <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h4 className="text-lg font-bold text-purple-800 dark:text-purple-200">Quick Analysis</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_INSTRUCTIONS.slice(0, 4).map((sample, index) => (
                <button
                  key={index}
                  onClick={() => setInstruction(sample)}
                  disabled={processing}
                  className="group relative flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-700/50 rounded-2xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-300 disabled:opacity-50 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-purple-800 dark:text-purple-200 leading-tight">
                      {sample.length > 35 ? sample.substring(0, 35) + '...' : sample}
                    </p>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Send className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Premium History Controls */}
        {processingHistory && processingHistory.length > 0 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-purple-200/30 dark:border-purple-700/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
                <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {processingHistory.length} Analysis Session{processingHistory.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AI-powered medical insights
                </p>
              </div>
            </div>
            
            {onClearHistory && (
              <MedicalButton
                onClick={onClearHistory}
                variant="destructive"
                size="md"
                leftIcon={Trash2}
                className="min-w-[120px] shadow-lg"
                aria-label="Clear analysis history"
              >
                Clear History
              </MedicalButton>
            )}
          </div>
        )}
      </div>

      {/* AI Error Display */}
      {aiError && (
        <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">AI Processing Error</h4>
                {onClearAIError && (
                  <MedicalButton
                    onClick={onClearAIError}
                    variant="ghost"
                    size="icon"
                    className="text-medical-error-500 hover:text-medical-error-600"
                    aria-label="Clear AI error"
                  >
                    <X className="w-4 h-4" />
                  </MedicalButton>
                )}
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{aiError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Premium Content Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {!hasTranscript ? (
          <div className="relative flex items-center justify-center h-full min-h-64 bg-gradient-to-br from-purple-50/30 via-white/50 to-pink-50/20 dark:from-purple-900/10 dark:via-gray-800/50 dark:to-pink-900/10 rounded-3xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <defs>
                  <pattern id="ai-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="0.5" fill="currentColor" opacity="0.3"/>
                    <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="0.3" opacity="0.2"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#ai-pattern)"/>
              </svg>
            </div>
            
            <div className="relative z-10 text-center max-w-md">
              <div className="relative mb-8 group">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-700 transform group-hover:scale-110">
                  <Brain className="w-12 h-12 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl" />
                </div>
                
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="w-4 h-4 text-white" />
                </div>
                
                <div className="absolute inset-0 rounded-3xl border-2 border-purple-400/20 animate-pulse" />
              </div>
              
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-800 via-pink-700 to-indigo-800 dark:from-purple-100 dark:via-pink-100 dark:to-indigo-100 bg-clip-text text-transparent mb-3">
                No Transcript Available
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">
                Start recording or upload an audio file to enable our advanced AI-powered medical analysis system.
              </p>
            </div>
          </div>
        ) : processingHistory && processingHistory.length === 0 ? (
          <div className="relative flex items-center justify-center h-full min-h-64 bg-gradient-to-br from-purple-50/30 via-white/50 to-indigo-50/20 dark:from-purple-900/10 dark:via-gray-800/50 dark:to-indigo-900/10 rounded-3xl overflow-hidden">
            <div className="relative z-10 text-center max-w-lg">
              <div className="relative mb-8 group">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-700 transform group-hover:scale-110">
                  <Lightbulb className="w-12 h-12 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl" />
                </div>
                
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-800 dark:from-indigo-100 dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent mb-4">
                AI Analysis Ready
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium mb-6">
                Your medical transcript is ready for AI analysis. Use our intelligent system to extract symptoms, diagnoses, medications, and clinical insights.
              </p>
              
              <div className="flex justify-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-600/50 rounded-xl">
                  <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Smart Analysis</span>
                </div>
                
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-purple-200/50 dark:border-purple-600/50 rounded-xl">
                  <HeartHandshake className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Medical Context</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {processingHistory && processingHistory.map((item, index) => (
              <div
                key={index}
                className="relative group bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-gray-800 dark:via-gray-700/80 dark:to-blue-900/10 backdrop-blur-xl rounded-3xl border border-slate-200/30 dark:border-gray-600/30 p-6 lg:p-8 shadow-xl shadow-slate-500/10 hover:shadow-slate-500/20 transition-all duration-500 overflow-hidden"
              >
                {/* Premium Glass Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-gray-700/20 pointer-events-none rounded-3xl" />
                
                {/* Enhanced Analysis Header */}
                <div className="relative z-10 flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <MessageSquare className="w-6 h-6 text-white drop-shadow-sm" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{processingHistory.length - index}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold bg-gradient-to-r from-purple-800 via-pink-700 to-indigo-800 dark:from-purple-100 dark:via-pink-100 dark:to-indigo-100 bg-clip-text text-transparent">
                        AI Medical Analysis #{processingHistory.length - index}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Clinical intelligence processing
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="font-semibold text-slate-600 dark:text-slate-400">{formatProcessingTime(item.processingTime)}</span>
                    </div>
                    {item.tokensUsed && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Hash className="w-3 h-3 text-blue-500" />
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{item.tokensUsed}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Premium User Instruction */}
                <div className="relative z-10 mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <p className="text-sm font-bold text-purple-700 dark:text-purple-300">Your Instruction:</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-700/50 rounded-2xl p-4">
                    <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed font-medium">
                      {item.userInstruction}
                    </p>
                  </div>
                </div>

                {/* Premium AI Response */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">AI Analysis:</p>
                    </div>
                    
                    <MedicalButton
                      onClick={() => navigator.clipboard.writeText(item.aiResponse)}
                      variant="success"
                      size="icon"
                      className="shadow-lg"
                      aria-label="Copy analysis response"
                    >
                      <Copy className="w-4 h-4" />
                    </MedicalButton>
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200/50 dark:border-emerald-700/50 rounded-2xl p-6">
                    <div className="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed whitespace-pre-wrap font-medium"
                         style={{
                           fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
                         }}>
                      {item.aiResponse}
                    </div>
                  </div>
                </div>

                {/* Premium Model Info */}
                <div className="relative z-10 mt-6 pt-4 border-t border-slate-200/30 dark:border-gray-600/30">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                        <Microscope className="w-3 h-3 text-slate-500" />
                        <span className="font-semibold text-slate-600 dark:text-slate-400">{item.model}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md">
                      <Star className="w-3 h-3" />
                      <span className="font-bold">Complete</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};