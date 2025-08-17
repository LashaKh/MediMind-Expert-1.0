import { useState, useEffect, useCallback } from 'react';
import { useChatSafe } from '../contexts/ChatContext';
import { 
  analyzeMessageForCalculators, 
  getContextualCalculators,
  CalculatorSuggestion,
  CalculatorRecommendation 
} from '../services/calculatorRecommendation';
import { Message } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';

interface CalculatorIntegrationState {
  suggestions: CalculatorSuggestion | null;
  showSuggestions: boolean;
  isAnalyzing: boolean;
  dismissedSuggestions: Set<string>;
}

export interface CalculatorResult {
  calculatorId: string;
  calculatorName: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  interpretation: string;
  recommendations: string[];
  timestamp: Date;
}

export const useCalculatorIntegration = () => {
  const chatContext = useChatSafe();
  const chatState = chatContext?.state;
  const addMessage = chatContext?.addMessage;
  const [integrationState, setIntegrationState] = useState<CalculatorIntegrationState>({
    suggestions: null,
    showSuggestions: false,
    isAnalyzing: false,
    dismissedSuggestions: new Set()
  });

  // Analyze messages for calculator suggestions
  const analyzeForSuggestions = useCallback((messages: Message[]) => {
    if (messages.length === 0) return;

    setIntegrationState(prev => ({ ...prev, isAnalyzing: true }));

    // Get contextual suggestions
    const suggestions = getContextualCalculators(messages);
    
    // Filter out dismissed suggestions
    const filteredRecommendations = suggestions.recommendations.filter(
      rec => !integrationState.dismissedSuggestions.has(rec.id)
    );

    const filteredSuggestions = {
      ...suggestions,
      recommendations: filteredRecommendations
    };

    setIntegrationState(prev => ({
      ...prev,
      suggestions: filteredSuggestions,
      showSuggestions: filteredSuggestions.recommendations.length > 0 && filteredSuggestions.confidence >= 0.3,
      isAnalyzing: false
    }));
  }, [integrationState.dismissedSuggestions]);

  // Analyze when new messages are added
  useEffect(() => {
    if (chatState && chatState.messages.length > 0) {
      // Debounce analysis to avoid excessive processing
      const timeoutId = setTimeout(() => {
        analyzeForSuggestions(chatState.messages);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [chatState?.messages, analyzeForSuggestions]);

  // Dismiss calculator suggestions
  const dismissSuggestions = useCallback(() => {
    if (integrationState.suggestions) {
      const newDismissed = new Set(integrationState.dismissedSuggestions);
      integrationState.suggestions.recommendations.forEach(rec => {
        newDismissed.add(rec.id);
      });

      setIntegrationState(prev => ({
        ...prev,
        showSuggestions: false,
        dismissedSuggestions: newDismissed
      }));
    }
  }, [integrationState.suggestions, integrationState.dismissedSuggestions]);

  // Handle calculator selection
  const handleCalculatorSelect = useCallback((calculatorId: string) => {
    // Dismiss current suggestions
    dismissSuggestions();

    // Add a message about calculator selection
    const calculatorInfo = integrationState.suggestions?.recommendations.find(
      rec => rec.id === calculatorId
    );

    if (calculatorInfo) {
      const selectionMessage: Message = {
        id: uuidv4(),
        content: `🧮 Opening ${calculatorInfo.name} calculator for ${calculatorInfo.description.toLowerCase()}.`,
        type: 'ai',
        timestamp: new Date()
      };

      addMessage?.(selectionMessage);
    }

    // Return the calculator ID for routing/navigation
    return calculatorId;
  }, [integrationState.suggestions, dismissSuggestions, addMessage]);

  // Share calculator results with AI
  const shareCalculatorResults = useCallback((result: CalculatorResult) => {
    const resultMessage: Message = {
      id: uuidv4(),
      content: `I've completed the ${result.calculatorName} calculation. Here are the results:

**Calculator**: ${result.calculatorName}
**Results**: ${JSON.stringify(result.results, null, 2)}
**Clinical Interpretation**: ${result.interpretation}

**Recommendations**:
${result.recommendations.map(rec => `• ${rec}`).join('\n')}

Please provide your clinical analysis and any additional recommendations based on these results.`,
      type: 'user',
      timestamp: new Date()
    };

    addMessage?.(resultMessage);

    // Also add an AI confirmation message
    const contextMessage: Message = {
      id: uuidv4(),
      content: `📊 Calculator results received: ${result.calculatorName}. Let me analyze these findings and provide clinical recommendations.`,
      type: 'ai',
      timestamp: new Date()
    };

    addMessage?.(contextMessage);
  }, [addMessage]);

  // Get workflow suggestions based on current calculator results
  const getWorkflowSuggestions = useCallback((calculatorId: string, results: any): CalculatorRecommendation[] => {
    // This would be expanded to provide intelligent workflow suggestions
    // based on the specific calculator results and clinical guidelines
    return [];
  }, []);

  // Reset suggestions (e.g., when starting new conversation)
  const resetSuggestions = useCallback(() => {
    setIntegrationState({
      suggestions: null,
      showSuggestions: false,
      isAnalyzing: false,
      dismissedSuggestions: new Set()
    });
  }, []);

  return {
    // State
    suggestions: integrationState.suggestions,
    showSuggestions: integrationState.showSuggestions,
    isAnalyzing: integrationState.isAnalyzing,

    // Actions
    dismissSuggestions,
    handleCalculatorSelect,
    shareCalculatorResults,
    getWorkflowSuggestions,
    resetSuggestions,

    // Utilities
    analyzeMessage: analyzeMessageForCalculators
  };
}; 