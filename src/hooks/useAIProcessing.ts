import { useState, useCallback } from 'react';
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
}

export const useAIProcessing = (): UseAIProcessingReturn => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ProcessingResult | null>(null);
  const [processingHistory, setProcessingHistory] = useState<ProcessingHistory[]>([]);

  // Process text with AI
  const processText = useCallback(async (
    transcript: string,
    userInstruction: string,
    model = 'gpt-4o-mini'
  ): Promise<ProcessingResult | null> => {
    console.log('🚀 AI Processing started:', {
      hasTranscript: !!transcript,
      transcriptLength: transcript?.length || 0,
      transcriptPreview: transcript?.slice(0, 100) + '...',
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

    console.log('✅ Validation passed, starting processing...');
    setProcessing(true);
    setError(null);

    console.log('📡 Calling Supabase Edge Function...');
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
    console.log('⏱️ Function call completed:', {
      duration: callTime + 'ms',
      hasResult: !!result,
      hasError: !!processError
    });

    if (processError) {
      console.error('❌ Process error:', processError);
      setError(`Processing failed: ${processError.message}`);
      setProcessing(false);
      return null;
    }

    console.log('📊 Raw result:', result);
    
    if (result?.error) {
      console.error('❌ Result error:', result.error);
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

    console.log('✅ Processing completed successfully:', {
      resultLength: processedResult.result.length,
      model: processedResult.model,
      tokensUsed: processedResult.tokensUsed,
      processingTime: processedResult.processingTime
    });

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

    console.log('📋 Adding to processing history:', {
      instruction: instruction.slice(0, 50) + '...',
      responseLength: response.length,
      model,
      tokensUsed,
      processingTime,
      timestamp: historyItem.timestamp
    });

    setProcessingHistory(prev => {
      const newHistory = [historyItem, ...prev];
      console.log('📊 Updated processing history:', {
        newCount: newHistory.length,
        items: newHistory.map(item => ({
          instruction: item.userInstruction.slice(0, 30) + '...',
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

  return {
    processing,
    error,
    lastResult,
    processingHistory,
    
    processText,
    clearError,
    clearHistory,
    addToHistory
  };
};