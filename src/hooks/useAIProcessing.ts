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
      + '...',
          responseLength: r.aiResponse.length,
          timestamp: r.timestamp
        }))
      });
      setProcessingHistory(options.sessionProcessingResults);
    } else {

      setProcessingHistory([]);
    }
  }, [options?.sessionProcessingResults]);

  // Process text with AI
  const processText = useCallback(async (
    transcript: string,
    userInstruction: string,
    model = 'gpt-4o-mini'
  ): Promise<ProcessingResult | null> => {
    + '...',
      userInstruction,
      model
    });

    if (!transcript.trim() || !userInstruction.trim()) {
      console.error('❌ Validation failed:', {
        hasTranscript: !!transcript.trim(),
        hasInstruction: !!userInstruction.trim()
      });
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

    + '...',
      responseLength: response.length,
      model,
      tokensUsed,
      processingTime,
      timestamp: historyItem.timestamp
    });

    setProcessingHistory(prev => {
      const newHistory = [historyItem, ...prev];
      + '...',
          responseLength: item.aiResponse.length,
          timestamp: item.timestamp
        }))
      });
      return newHistory;
    });
  }, []);

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