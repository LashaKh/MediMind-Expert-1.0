import React, { useState, useRef } from 'react';
import {
  Send,
  Loader2,
  Copy,
  Download,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Brain,
  Clock,
  Hash,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { GeorgianSession } from '../../hooks/useSessionManagement';

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface ProcessingPanelProps {
  currentSession: GeorgianSession | null;
  transcript: string;
  processing: boolean;
  error: string | null;
  processingHistory: ProcessingHistory[];
  onProcessText: (instruction: string) => void;
  onClearError: () => void;
  onClearHistory: () => void;
}

const SAMPLE_INSTRUCTIONS = [
  'Summarize this medical consultation in English',
  'Extract patient symptoms and complaints',
  'Identify medical diagnoses mentioned',
  'List all medications discussed',
  'Create medical notes from this consultation',
  'Extract vital signs and measurements',
  'Identify any treatment plans or recommendations',
  'Translate medical terms to English'
];

export const ProcessingPanel: React.FC<ProcessingPanelProps> = ({
  currentSession,
  transcript,
  processing,
  error,
  processingHistory,
  onProcessText,
  onClearError,
  onClearHistory
}) => {
  const [instruction, setInstruction] = useState('');
  const [expandedHistory, setExpandedHistory] = useState<Set<number>>(new Set());
  const [showSamples, setShowSamples] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instruction.trim() && transcript.trim()) {
      onProcessText(instruction.trim());
      setInstruction('');
    }
  };

  const handleSampleClick = (sample: string) => {
    setInstruction(sample);
    setShowSamples(false);
    textareaRef.current?.focus();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResponse = (response: string, instruction: string) => {
    const content = `Instruction: ${instruction}\n\nResponse:\n${response}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-processing-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleHistoryExpansion = (index: number) => {
    const newExpanded = new Set(expandedHistory);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedHistory(newExpanded);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const hasTranscript = transcript.trim().length > 0;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>AI Processing</span>
          </h2>
          {processingHistory.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onClearHistory}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        {currentSession && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            AI-powered medical transcript analysis
          </p>
        )}
      </div>

      {/* Input Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Instruction Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What would you like to do with this transcript?
              </label>
              <button
                type="button"
                onClick={() => setShowSamples(!showSamples)}
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center space-x-1"
              >
                <Lightbulb className="w-3 h-3" />
                <span>Examples</span>
                {showSamples ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            
            <textarea
              ref={textareaRef}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
              placeholder="Enter medical processing instruction... (e.g., 'Extract patient symptoms', 'Summarize diagnosis', 'List medications')"
              disabled={processing || !hasTranscript}
            />
          </div>

          {/* Sample Instructions */}
          {showSamples && (
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 gap-2">
                {SAMPLE_INSTRUCTIONS.map((sample, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSampleClick(sample)}
                    className="text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={processing || !instruction.trim() || !hasTranscript}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Process with AI</span>
              </>
            )}
          </button>

          {/* Status Info */}
          {!hasTranscript && (
            <div className="flex items-center space-x-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>Record or upload medical consultation audio first</span>
            </div>
          )}
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mx-4 mt-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Processing Error</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
            <button
              onClick={onClearError}
              className="text-red-400 hover:text-red-600 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Processing History */}
      <div className="flex-1 overflow-y-auto">
        {processingHistory.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium mb-2">No processing history</h3>
              <p className="text-sm max-w-sm">
                Enter an instruction above to process your medical transcript with AI
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {processingHistory.map((item, index) => (
              <div key={index} className="p-4">
                <div className="space-y-3">
                  {/* Instruction */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Your Instruction
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        {item.userInstruction}
                      </p>
                    </div>
                  </div>

                  {/* Response */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          AI Response
                        </span>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <span>{item.model}</span>
                          </span>
                          {item.tokensUsed && (
                            <span className="flex items-center space-x-1">
                              <Hash className="w-3 h-3" />
                              <span>{item.tokensUsed} tokens</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.processingTime}ms</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => copyToClipboard(item.aiResponse)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                          title="Copy response"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => downloadResponse(item.aiResponse, item.userInstruction)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                          title="Download response"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => toggleHistoryExpansion(index)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                        >
                          {expandedHistory.has(index) ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className={`prose max-w-none text-sm text-gray-700 dark:text-gray-300 ${
                        !expandedHistory.has(index) && item.aiResponse.length > 300 ? 'line-clamp-6' : ''
                      }`}>
                        <div className="whitespace-pre-wrap">
                          {expandedHistory.has(index) || item.aiResponse.length <= 300 
                            ? item.aiResponse 
                            : item.aiResponse.substring(0, 300) + '...'
                          }
                        </div>
                      </div>
                      
                      {!expandedHistory.has(index) && item.aiResponse.length > 300 && (
                        <button
                          onClick={() => toggleHistoryExpansion(index)}
                          className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                        >
                          Show more
                        </button>
                      )}
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