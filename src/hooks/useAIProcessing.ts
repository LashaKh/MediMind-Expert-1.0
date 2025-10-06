import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { safeAsync } from '../lib/utils/errorHandling';

interface ProcessingResult {
  result: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
}

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface UseAIProcessingReturn {
  processing: boolean;
  error: string | null;
  lastResult: ProcessingResult | null;
  processingHistory: ProcessingHistory[];
  
  // Processing operations
  processText: (transcript: string, userInstruction: string, model?: string) => Promise<ProcessingResult | null>;
  clearError: () => void;
  clearHistory: () => void;
  addToHistory: (instruction: string, response: string, model: string, tokensUsed?: number, processingTime?: number) => void;
  setProcessingHistory: (history: ProcessingHistory[]) => void;
  deleteFromHistory: (timestamp: number) => void;
  setProcessing: (processing: boolean) => void; // Add manual processing control
}

interface UseAIProcessingOptions {
  sessionProcessingResults?: {
    userInstruction: string;
    aiResponse: string;
    model: string;
    tokensUsed?: number;
    processingTime: number;
    timestamp: number;
  }[];
}

export const useAIProcessing = (options?: UseAIProcessingOptions): UseAIProcessingReturn => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ProcessingResult | null>(null);
  const [processingHistory, setProcessingHistory] = useState<ProcessingHistory[]>([]);

  // Sync with session processing results when they change
  useEffect(() => {
    if (options?.sessionProcessingResults) {
      setProcessingHistory(options.sessionProcessingResults);
    }
    // Don't reset to empty array when sessionProcessingResults is undefined
    // This preserves dynamically added items like diagnosis reports
  }, [options?.sessionProcessingResults]);

  // Process text with AI
  const processText = useCallback(async (
    transcript: string,
    userInstruction: string,
    model = 'gpt-4o-mini'
  ): Promise<ProcessingResult | null> => {

    if (!transcript.trim() || !userInstruction.trim()) {
      setError('Both transcript and instruction are required');
      return null;
    }

    setProcessing(true);
    setError(null);

    const startTime = Date.now();
    
    const [result, processError] = await safeAsync(
      () => supabase.functions.invoke('process-georgian-text', {
        body: {
          transcript,
          userInstruction,
          model
        }
      })
    );
    
    const callTime = Date.now() - startTime;

    if (processError) {

      setError(`Processing failed: ${processError.message}`);
      setProcessing(false);
      return null;
    }

    if (result?.error) {

      setError(`Processing error: ${result.error.message || result.error}`);
      setProcessing(false);
      return null;
    }

    const processedResult: ProcessingResult = {
      result: result.data?.result || 'No result',
      model: result.data?.model || model,
      tokensUsed: result.data?.tokensUsed,
      processingTime: result.data?.processingTime || callTime
    };

    setLastResult(processedResult);
    
    // Add to history
    addToHistory(
      userInstruction,
      processedResult.result,
      processedResult.model,
      processedResult.tokensUsed,
      processedResult.processingTime
    );

    setProcessing(false);
    return processedResult;
  }, []);

  // Add to processing history
  const addToHistory = useCallback((
    instruction: string,
    response: string,
    model: string,
    tokensUsed?: number,
    processingTime?: number
  ) => {
    const historyItem: ProcessingHistory = {
      userInstruction: instruction,
      aiResponse: response,
      model,
      tokensUsed,
      processingTime: processingTime || 0,
      timestamp: Date.now()
    };

    setProcessingHistory(prev => [historyItem, ...prev]);
  }, [processingHistory.length]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setProcessingHistory([]);
    setLastResult(null);
  }, []);

  // Delete specific item from history
  const deleteFromHistory = useCallback((timestamp: number) => {
    setProcessingHistory(prev => {
      const updated = prev.filter(item => item.timestamp !== timestamp);

      return updated;
    });
  }, []);

  return {
    processing,
    error,
    lastResult,
    processingHistory,
    
    processText,
    clearError,
    clearHistory,
    addToHistory,
    setProcessingHistory,
    deleteFromHistory,
    setProcessing
  };
};