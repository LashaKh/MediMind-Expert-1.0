import { useState, useCallback } from 'react';

interface UseABGUIActionsProps {
  extractedText: string;
  interpretation: string;
  completedResult?: any;
  onTextReAnalysis: (editedText: string) => Promise<void>;
}

interface UseABGUIActionsReturn {
  // State
  copySuccess: boolean;
  
  // Actions
  handleCopyResults: () => Promise<void>;
  handleShareResults: () => void;
  handleEditResults: (editedText: string) => void;
}

export const useABGUIActions = ({
  extractedText,
  interpretation,
  completedResult,
  onTextReAnalysis
}: UseABGUIActionsProps): UseABGUIActionsReturn => {
  const [copySuccess, setCopySuccess] = useState(false);

  // Action button handlers for the main header
  const handleCopyResults = useCallback(async () => {
    const textToCopy = interpretation || extractedText || completedResult?.raw_analysis || '';
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  }, [interpretation, extractedText, completedResult]);

  const handleShareResults = useCallback(() => {
    // For now, just copy to clipboard. Could be extended to actual sharing
    handleCopyResults();
  }, [handleCopyResults]);

  const handleEditResults = useCallback((editedText: string) => {
    if (editedText && editedText !== extractedText) {
      onTextReAnalysis(editedText);
    }
  }, [extractedText, onTextReAnalysis]);

  return {
    copySuccess,
    handleCopyResults,
    handleShareResults,
    handleEditResults
  };
};