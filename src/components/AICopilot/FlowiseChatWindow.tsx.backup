import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { History, Plus, FileText, Sparkles, Stethoscope, Heart, AlertCircle, X, Calculator, TestTube2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { useChat as useChatContext } from '../../contexts/ChatContext';
import { useAppStore } from '../../stores/useAppStore';
import { useFlowiseChat } from '../../hooks/chat/useFlowiseChat';
import { useCalculatorIntegration } from '../../hooks/useCalculatorIntegration';
import { useMobileOptimization, optimizeClasses, getOptimizedDelay } from '../../hooks/useMobileOptimization';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';
import { listUserDocuments } from '../../lib/api/vectorStore';
import { v4 as uuidv4 } from 'uuid';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ConversationList } from './ConversationList';
import { KnowledgeBaseSelector } from './KnowledgeBaseSelector';
import { usePersonalKBPlaceholder } from './PersonalKBGuidance';
import { NewCaseButton } from './NewCaseButton';
import { CaseCreationModal } from './CaseCreationModal';
import { EnhancedTooltip } from '../ui/EnhancedTooltip';
import { HeaderCaseIndicator } from './HeaderCaseIndicator';
import { CaseListModal } from './CaseListModal';
import { CalculatorSuggestions } from './CalculatorSuggestions';
import { CaseContextProvider } from './CaseContextProvider';
import { ClinicalDashboard } from './ClinicalDashboard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Message, PatientCase, Attachment } from '../../types/chat';
import { ABGResult } from '../../types/abg';
import { buildContextAwarePrompt, buildEnhancedContextAwarePrompt } from '../../services/abgContextService';

interface FlowiseChatWindowProps {
  className?: string;
  isDisabled?: boolean;
  placeholder?: string;
  allowAttachments?: boolean;
}

export const FlowiseChatWindow: React.FC<FlowiseChatWindowProps> = ({
  className = '',
  isDisabled = false,
  placeholder,
  allowAttachments = true
}) => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const location = useLocation();
  
  // Mobile optimization for GPU-intensive effects
  const { shouldOptimize, animationClasses } = useMobileOptimization();
  
  // ABG Context from navigation state
  const [abgContext, setAbgContext] = useState<ABGResult | null>(null);
  const [abgContextType, setAbgContextType] = useState<string | null>(null);
  
  // Generate and maintain sessionId for Flowise conversations - allow regeneration on case reset
  const [sessionId, setSessionId] = useState(() => uuidv4());
  
  // Debug the profile object

  const {
    messages,
    isTyping,
    isLoading,
    error,
    addMessage,
    updateMessage,
    setTyping,
    setChatLoading,
    setChatError,
    clearMessages,
    createNewConversation,
    conversations,
    activeConversationId,
    setActiveConversation,
    updateCase,
    activeCase,
    setActiveCase,
    resetCaseContext,
    caseHistory,
    knowledgeBase,
    setKnowledgeBase,
    personalDocumentCount,
    setPersonalDocumentCount,
    toggleDocumentSelection,
    selectAllDocuments,
    clearSelectedDocuments,
    selectedDocuments,
    setSelectedDocuments,
    saveFlowiseMessage,
    loadFlowiseMessages
  } = useAppStore();

  // Get Flowise metadata functions and case management from ChatContext
  const { saveFlowiseConversationMetadata, incrementFlowiseMessageCount, loadCases, createCase } = useChatContext();

  const navigate = useNavigate();
  const [showConversationList, setShowConversationList] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showCaseListModal, setShowCaseListModal] = useState(false);
  const [editingCase, setEditingCase] = useState<PatientCase | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPulsing, setIsPulsing] = useState(false);
  
  // Track context loading state (no auto-send, just passive context loading)
  const [isContextLoading, setIsContextLoading] = useState(false);

  // Handle ABG context from navigation - Passive loading only
  useEffect(() => {
    const state = location.state as { 
      abgContext?: ABGResult; 
      contextType?: string; 
      startNewSession?: boolean;
    } | null;
    
    let timeoutId: NodeJS.Timeout;
    
    if (state?.abgContext) {

      setIsContextLoading(true);
      setAbgContext(state.abgContext);
      setAbgContextType(state.contextType || 'abg-analysis');
      
      // Auto-select curated knowledge base for ABG consultations
      setKnowledgeBase('curated');

      // Create new conversation if requested
      if (state.startNewSession) {
        const newConversationId = createNewConversation(
          `ABG Consultation - ${new Date().toLocaleDateString()}`,
          profile?.medical_specialty as 'cardiology' | 'obgyn'
        );
        setActiveConversation(newConversationId);
      }
      
      // Show visual feedback that context is loaded and ready
      setIsPulsing(true);
      timeoutId = setTimeout(() => {
        setIsPulsing(false);
        setIsContextLoading(false);
      }, 2000);
      
      // Clear the state to prevent re-applying on future navigation
      navigate(location.pathname, { replace: true, state: undefined });
    }
    
    // Cleanup timeout on unmount to prevent memory leaks
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [location, navigate, setKnowledgeBase, createNewConversation, setActiveConversation, profile]);

  // Handle knowledge base changes with automatic new chat
  const handleKnowledgeBaseChange = useCallback((newKnowledgeBase: 'personal' | 'curated') => {
    // Only start new chat if there are existing messages and KB is actually changing
    if (messages.length > 0 && newKnowledgeBase !== knowledgeBase) {
      // Start a new conversation to avoid mixing contexts
      const newConversationId = createNewConversation(
        'Chat', 
        profile?.medical_specialty as 'cardiology' | 'obgyn'
      );
      
      // Set the new conversation as active
      setActiveConversation(newConversationId);
      
      // Clear current messages for the new context
      clearMessages();

    }
    
    // Update the knowledge base
    setKnowledgeBase(newKnowledgeBase);
  }, [knowledgeBase, messages.length, createNewConversation, setActiveConversation, profile, clearMessages, setKnowledgeBase]);

  // Check if we need to create a conversation when user sends first message
  const ensureConversationExists = useCallback(() => {
    if (!activeConversationId) {
      // Determine conversation type based on current context
      const conversationType = activeCase ? 'case-study' : 'general';
      const title = activeCase 
        ? `Case: ${activeCase.title}` 
        : `Conversation ${new Date().toLocaleDateString()}`;
      
      const newConversationId = createNewConversation(
        title,
        profile?.medical_specialty as 'cardiology' | 'obgyn',
        activeCase?.id,
        conversationType
      );
      setActiveConversation(newConversationId);
      return newConversationId;
    }
    return activeConversationId;
  }, [activeConversationId, createNewConversation, setActiveConversation, profile, activeCase]);

  // Enhanced animations and interactions - Further optimized for instant navigation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 600000); // Update every 10 minutes (optimized for battery life)

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Load cases when component mounts
  useEffect(() => {
    if (profile?.user_id) {
      loadCases();
    }
  }, [profile?.user_id, loadCases]);

  // Load personal document count when component mounts
  useEffect(() => {

    if (profile?.user_id) {

      const loadPersonalDocumentCount = async () => {

        // Make the test function available globally for debugging
        (window as any).testPersonalKB = async () => {

          try {
            const result = await listUserDocuments({ limit: 1 });

            return result;
          } catch (error) {

            return { error };
          }
        };
        
        const [result, error] = await safeAsync(
          async () => {
            return await listUserDocuments({ limit: 1 }); // Just get count, not all documents
          },
          {
            context: 'loading personal document count',
            severity: ErrorSeverity.LOW
          }
        );

        if (!error && result) {

          setPersonalDocumentCount(result.total);
        } else {

        }
      };

      loadPersonalDocumentCount();
    } else {

    }
  }, [profile?.user_id, setPersonalDocumentCount]);

  // Pulse effect for AI readiness - Battery-optimized for mobile performance
  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000); // Shorter pulse duration
    }, 120000); // 2 minutes - significant battery improvement

    return () => clearInterval(pulseTimer);
  }, []);

  // Calculator integration
  const {
    suggestions,
    showSuggestions,
    isAnalyzing,
    dismissSuggestions,
    handleCalculatorSelect
  } = useCalculatorIntegration();

  // Personal KB guidance and placeholder
  const personalKBPlaceholder = usePersonalKBPlaceholder(knowledgeBase === 'personal');

  // Initialize Flowise chat with context integration - will be enhanced with CaseContextProvider
  const {
    sendMessage: sendToFlowise,
    isLoading: flowiseLoading,
    error: flowiseError
  } = useFlowiseChat({
    sessionId, // Pass the sessionId to maintain consistency
    onMessageReceived: (message: Message) => {
      addMessage(message);
      // Save Flowise message to database for persistence
      if (sessionId && knowledgeBase === 'curated') {
        saveFlowiseMessage(sessionId, message);
      }
    },
    onError: (error: string) => {
      setChatError(error);
    },
    onTypingStart: () => {
      setTyping(true);
    },
    onTypingEnd: () => {
      setTyping(false);
    },
    caseContext: activeCase,
    knowledgeBaseType: knowledgeBase,
    // For personal knowledge base, the backend automatically finds user's Vector Store
    // No need to pass document IDs - OpenAI Vector Store handles document retrieval
    personalDocumentIds: undefined
  });

  // Update loading state based on Flowise status
  useEffect(() => {
    setChatLoading(flowiseLoading);
  }, [flowiseLoading]);

  // Update error state based on Flowise errors
  useEffect(() => {
    if (flowiseError) {
      setChatError(flowiseError);
    }
  }, [flowiseError]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (
    content: string, 
    attachments?: Attachment[],
    enhancedContent?: string
  ) => {
    ensureConversationExists();
    
    // Enhance content with ABG context if available - prioritize ABG context over other enhancements
    let finalEnhancedContent = enhancedContent;

    if (abgContext) {
      // Use enhanced context function based on context type
      const consultationType = abgContextType === 'interpretation-only' 
        ? 'interpretation-only' 
        : abgContextType === 'selective-action-plan'
          ? 'selective-action-plan'
          : 'auto';
      
      finalEnhancedContent = buildEnhancedContextAwarePrompt(
        content, 
        abgContext, 
        consultationType
      );
      
    } else {

    }
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      type: 'user',
      timestamp: new Date(),
      attachments,
      metadata: {
        sessionId: sessionId,
        knowledgeBase: knowledgeBase,
        caseId: activeCase?.id,
        abgContext: abgContext ? { id: abgContext.id, type: abgContext.type } : undefined
      }
    };

    addMessage(userMessage);
    
    // Save user message to database for Flowise conversations
    if (sessionId && knowledgeBase === 'curated') {
      saveFlowiseMessage(sessionId, userMessage);
    }
    
    setChatLoading(true);

    const [, error] = await safeAsync(
      async () => {
        // Send enhanced content (with ABG context or PDF text) to AI, but display original content in UI
        const messageToSend = finalEnhancedContent || content;
        
        // If we have enhanced content, don't send attachments (text already extracted)
        const attachmentsToSend = finalEnhancedContent ? undefined : attachments;
        
        await sendToFlowise(
          messageToSend, 
          attachmentsToSend, 
          activeCase, 
          knowledgeBase, 
          undefined, // personalDocumentIds - handled automatically by backend
          finalEnhancedContent // Pass enhanced content as the sixth parameter
        );

        // Save Flowise conversation metadata for curated knowledge base conversations
        if (knowledgeBase === 'curated') {
          // Determine conversation type based on whether there's an active case
          const conversationType = activeCase ? 'case-study' : 'general';
          
          await saveFlowiseConversationMetadata(
            sessionId, // Use the generated sessionId instead of activeConversationId
            content, // Save original content, not enhanced
            knowledgeBase,
            activeCase?.specialty,
            activeCase?.id,
            conversationType
          );
          
          // Increment message count (user message + AI response = 2)
          await incrementFlowiseMessageCount(sessionId);
        }
      },
      {
        context: 'send message to AI copilot',
        showToast: true,
        severity: ErrorSeverity.HIGH
      }
    );

    if (error) {
      setChatError(t('chat.messageSendFailed'));
    }
    
    setChatLoading(false);
  }, [addMessage, sendToFlowise, activeConversationId, knowledgeBase, activeCase, setChatLoading, setChatError, ensureConversationExists, abgContext]);

  // Context is now loaded passively - no auto-send functionality
  // Users must type their own questions to engage AI with the loaded context

  // Handle sending a new message with enhanced case context including attachments
  const handleSendMessageWithEnhancedContext = useCallback(async (
    content: string, 
    messageAttachments?: Attachment[], 
    enhancedCaseContext?: string,
    caseAttachmentUploads?: any[],
    enhancedMessage?: string
  ) => {
    const conversationId = ensureConversationExists();
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      type: 'user',
      timestamp: new Date(),
      attachments: messageAttachments,
      metadata: {
        sessionId: sessionId,
        knowledgeBase: knowledgeBase,
        caseId: activeCase?.id
      }
    };

    addMessage(userMessage);
    
    // Save user message to database for Flowise conversations
    if (sessionId && knowledgeBase === 'curated') {
      saveFlowiseMessage(sessionId, userMessage);
    }
    
    setChatLoading(true);

    const [, error] = await safeAsync(
      async () => {
        // Create enhanced case object with enriched context
        const enhancedCase = activeCase ? {
          ...activeCase,
          // Add enhancedContext field that includes attachment content
          enhancedContext: enhancedCaseContext
        } : null;

        // Combine message attachments with case attachment uploads
        const allAttachments = [
          ...(messageAttachments || []),
          ...(caseAttachmentUploads || []).map(upload => ({
            id: uuidv4(),
            name: upload.name,
            type: upload.mime,
            url: upload.data,
            uploadType: (upload.type === 'url' ? 'url' : 'file') as 'file' | 'url',
            size: upload.size || 0 // Add missing size property
          }))
        ];

        // Pass the enhanced case context and combined attachments to the API
        await sendToFlowise(
          content, 
          allAttachments, 
          enhancedCase as any, // Cast to PatientCase for compatibility
          knowledgeBase, 
          undefined, // personalDocumentIds - handled automatically by backend
          enhancedMessage // Pass the enhanced message with extracted text
        );

        // Save Flowise conversation metadata for curated knowledge base conversations
        if (knowledgeBase === 'curated') {
          // Determine conversation type based on whether there's an active case
          const conversationType = activeCase ? 'case-study' : 'general';
          
          await saveFlowiseConversationMetadata(
            sessionId, // Use the generated sessionId instead of activeConversationId
            content, // Save original content
            knowledgeBase,
            activeCase?.specialty,
            activeCase?.id,
            conversationType
          );
          
          // Increment message count (user message + AI response = 2)
          await incrementFlowiseMessageCount(sessionId);
        }
      },
      {
        context: 'send message with enhanced case context',
        showToast: true,
        severity: ErrorSeverity.HIGH
      }
    );

    if (error) {
      setChatError('Failed to send message. Please try again.');
    }
    
    setChatLoading(false);
  }, [addMessage, sendToFlowise, activeConversationId, knowledgeBase, activeCase, setChatLoading, setChatError, ensureConversationExists, abgContext]);

  // Handle case creation
  const handleCaseCreate = async (caseData: Omit<PatientCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientCase> => {
    try {
      console.log('Creating case with data:', caseData);
      console.log('🔍 DEBUG: createCase function is:', createCase);
      console.log('🔍 DEBUG: typeof createCase:', typeof createCase);
      const newCase = await createCase(caseData);
      console.log('Case created successfully:', newCase);
      
      // Reload cases to ensure the list is up-to-date
      await loadCases();
      
      // Create a new conversation for this case with proper type
      const newConversationId = createNewConversation(
        `Case: ${newCase.title}`, 
        profile?.medical_specialty as 'cardiology' | 'obgyn',
        newCase.id,
        'case-study'
      );
      
      // Set the new conversation as active
      setActiveConversation(newConversationId);
      
      // Add an initial AI message with case context
      const caseIntroMessage: Message = {
        id: uuidv4(),
        content: t('chat.caseReceived', { title: newCase.title }) + 
                '\n\n' + t('chat.caseSummary') + 
                `\n${newCase.description}` +
                '\n\n' + t('chat.caseDiscussionPrompt'),
        type: 'ai',
        timestamp: new Date(),
        sources: [], // Explicitly set empty sources to avoid inheriting from previous messages
      };
      
      addMessage(caseIntroMessage);
      
      return newCase;
    } catch (error) {
      console.error('Failed to create case:', error);
      setChatError('Failed to create case. Please try again.');
      throw error; // Re-throw so the modal can handle it
    }
  };

  // Handle case update
  const handleCaseUpdate = async (caseId: string, caseData: Omit<PatientCase, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateCase(caseId, caseData);
    
    // Reload cases to ensure the list is up-to-date
    await loadCases();
    
    // Return the updated case (the store should handle this)
    const updatedCase = caseHistory.find(c => c.id === caseId);
    if (updatedCase) {
      // Update the case data with the new information
      Object.assign(updatedCase, caseData);
      return updatedCase;
    }
    
    // Fallback - create a minimal updated case object
    return {
      id: caseId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...caseData
    } as PatientCase;
  };

  // Handle edit case
  const handleEditCase = (caseItem: PatientCase) => {
    setEditingCase(caseItem);
    setShowCaseModal(true);
    setShowCaseListModal(false); // Close the case list modal
  };

  // Handle case reset - Enhanced with better debugging
  const handleResetCase = async () => {
    const [, error] = await safeAsync(
      async () => {
        // Step 1: Clear the active case first
        resetCaseContext();
        
        // Step 2: Clear current messages
        clearMessages();
        
        // Step 3: Clear active conversation to force new conversation creation
        // This ensures when user sends next message, a separate general conversation is created
        setActiveConversation(null);
        
        // Step 3.5: Generate a new sessionId to ensure completely separate conversation
        setSessionId(uuidv4());
        
        // Step 4: Force clear any lingering case references in localStorage
        const [, localStorageError] = await safeAsync(
          async () => {
            const conversationsData = localStorage.getItem('medimind-conversations');
            if (conversationsData) {
              const conversations = JSON.parse(conversationsData);
              if (Array.isArray(conversations)) {
                const updatedConversations = conversations.map((conv: any) => ({
                  ...conv,
                  caseId: undefined,
                  title: conv.title?.startsWith('Case:') ? 'General Discussion' : conv.title
                }));
                localStorage.setItem('medimind-conversations', JSON.stringify(updatedConversations));
              }
            }
          },
          {
            context: 'clear case references from localStorage',
            severity: ErrorSeverity.MEDIUM
          }
        );

        // Step 4: Create a completely new conversation without any case context
        const newConversationId = createNewConversation(
          'Fresh Conversation', 
          profile?.medical_specialty as 'cardiology' | 'obgyn',
          undefined // explicitly no case ID
        );
        
        // Step 5: Set the new conversation as active
        setActiveConversation(newConversationId);
        
        // Step 6: Add a welcoming AI message for the fresh start
        setTimeout(() => {
          const welcomeMessage = {
            id: `msg-${Date.now()}`,
            content: `Hello! I've cleared the previous case context and we're starting fresh. How can I assist you with your ${profile?.medical_specialty || 'medical'} practice today?`,
            type: 'ai' as const,
            timestamp: new Date(),
            sources: [], // Explicitly set empty sources to avoid inheriting from previous messages
          };
          addMessage(welcomeMessage);
        }, 100);
        
        // Step 7: Reload cases to ensure case list is up-to-date
        await loadCases();
        
        // Step 8: Force re-render by clearing error state
        setChatError(undefined);
      },
      {
        context: 'reset case context',
        showToast: true,
        severity: ErrorSeverity.MEDIUM
      }
    );

    if (error) {
      setChatError('Failed to reset case. Please try again.');
    }
  };

  // Handle viewing case details (could expand to show full case modal later)
  const handleViewCase = async () => {
    // Reload cases before showing the modal to ensure fresh data
    await loadCases();
    // For now, we'll show the case list modal to allow case switching
    setShowCaseListModal(true);
  };

  // Handle case selection from list
  const handleCaseSelect = (selectedCase: PatientCase) => {
    // Set the selected case as active
    setActiveCase(selectedCase);
    
    // Clear current messages to start fresh with the new case
    clearMessages();
    
    // Create a new conversation for the selected case with proper type
    const newConversationId = createNewConversation(
      `Case: ${selectedCase.title}`, 
      profile?.medical_specialty as 'cardiology' | 'obgyn',
      selectedCase.id,
      'case-study'
    );
    
    // Set the new conversation as active
    setActiveConversation(newConversationId);
    
    // Case context will be automatically included when user sends their first message
    // No automatic AI response - user must initiate the conversation
    
    // Close the case list modal
    setShowCaseListModal(false);
  };

  // Calculator integration for AI suggestions
  const onCalculatorSelect = useCallback((calculatorId: string) => {
    handleCalculatorSelect(calculatorId);
  }, [handleCalculatorSelect]);

  // Handle new conversation - Enhanced
  const handleNewConversation = () => {
    // Clear current messages
    clearMessages();
    
    // Reset any active case context
    resetCaseContext();
    
    // Create a completely fresh conversation
    const newConversationId = createNewConversation(
      undefined, 
      profile?.medical_specialty as 'cardiology' | 'obgyn'
    );
    
    // Set the new conversation as active
    setActiveConversation(newConversationId);
    
    // Optional: Show success feedback
  };

  // Connection status
  const isConnected = !flowiseError;

  // Get specialty configuration
  const getSpecialtyConfig = () => {
    if (profile?.medical_specialty === 'cardiology') {
      return {
        icon: <Heart className="w-5 h-5" />,
        title: 'Cardiology Expert',
        gradient: 'from-rose-500 via-pink-500 to-red-500',
        bgGradient: 'from-rose-50/80 via-pink-50/80 to-red-50/80',
        borderColor: 'border-rose-200/60',
        accentColor: 'rose',
        glowColor: 'rose-500'
      };
    } else if (profile?.medical_specialty === 'obgyn') {
      return {
        icon: <Stethoscope className="w-5 h-5" />,
        title: 'OB/GYN Expert',
        gradient: 'from-violet-500 via-purple-500 to-indigo-500',
        bgGradient: 'from-violet-50/80 via-purple-50/80 to-indigo-50/80',
        borderColor: 'border-violet-200/60',
        accentColor: 'violet',
        glowColor: 'violet-500'
      };
    } else {
      return {
        icon: <Sparkles className="w-5 h-5" />,
        title: 'Medical AI Expert',
        gradient: 'from-blue-500 via-indigo-500 to-purple-500',
        bgGradient: 'from-blue-50/80 via-indigo-50/80 to-purple-50/80',
        borderColor: 'border-blue-200/60',
        accentColor: 'blue',
        glowColor: 'blue-500'
      };
    }
  };

  const specialtyConfig = getSpecialtyConfig();

  return (
    <div className={`h-full w-full flex flex-col relative overflow-hidden chat-window-container ${className}`}>
      {/* Revolutionary Background System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary ambient gradient - Optimized for mobile */}
        <div className={optimizeClasses(
          `absolute inset-0 bg-gradient-to-br from-white via-slate-50/30 to-${specialtyConfig.accentColor}-50/20`,
          `absolute inset-0 bg-gradient-to-br from-white/95 to-slate-50/40`,
          shouldOptimize
        )} />
        
        {/* Dynamic floating orbs - Optimized for mobile performance */}
        {animationClasses.orbCount >= 1 && (
          <div 
            className={optimizeClasses(
              `absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-${specialtyConfig.glowColor}/8 via-${specialtyConfig.glowColor}/4 to-transparent rounded-full ${animationClasses.blur} ${animationClasses.animations}`,
              `absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-${specialtyConfig.glowColor}/4 to-transparent rounded-full ${animationClasses.blur}`,
              shouldOptimize
            )}
          />
        )}
        {animationClasses.orbCount >= 2 && (
          <div 
            className={optimizeClasses(
              `absolute bottom-0 right-0 w-80 h-80 bg-gradient-radial from-blue-500/6 via-indigo-500/3 to-transparent rounded-full ${animationClasses.blur} ${animationClasses.animations}`,
              `absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/3 to-transparent rounded-full ${animationClasses.blur}`,
              shouldOptimize
            )}
            style={getOptimizedDelay('-3s', shouldOptimize)}
          />
        )}
        {animationClasses.orbCount >= 3 && (
          <div 
            className={optimizeClasses(
              `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-emerald-500/5 via-teal-500/2 to-transparent rounded-full ${animationClasses.blur} ${animationClasses.animations}`,
              `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-emerald-500/3 to-transparent rounded-full ${animationClasses.blur}`,
              shouldOptimize
            )}
            style={getOptimizedDelay('-6s', shouldOptimize)}
          />
        )}
        
        {/* Luxury mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/40 to-transparent" />
        </div>

      {/* Mobile-Optimized Premium Header */}
      <div className="relative z-20" data-tour="chat-window">
        {/* Mobile-first glass morphism header container */}
        <div className={`relative chat-header-area ${animationClasses.backdropBlur} bg-gradient-to-r from-white/95 via-white/98 to-white/95 border-b border-gradient-to-r from-white/20 via-white/40 to-white/20 shadow-2xl shadow-slate-900/8`}>
          {/* Simplified animated background for mobile performance */}
          <div className="absolute inset-0 overflow-hidden">
            {!shouldOptimize && (
              <>
                <div className={`absolute -top-16 -left-16 w-32 h-32 bg-gradient-radial from-${specialtyConfig.glowColor}/8 via-${specialtyConfig.glowColor}/4 to-transparent rounded-full ${animationClasses.blur} ${animationClasses.animations} opacity-60`} />
                <div 
                  className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-radial from-indigo-500/6 via-blue-500/3 to-transparent rounded-full ${animationClasses.blur} ${animationClasses.animations} opacity-40`}
                  style={getOptimizedDelay('-4s', shouldOptimize)}
                />
              </>
            )}
            {/* Subtle mesh overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>

          {/* Mobile-optimized header content */}
            <div className="relative px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4" data-tour="ai-copilot">
            {/* Main header row - Redesigned for better UX distribution */}
            <div className="flex items-center justify-between gap-4">
              
              {/* Left: Brand Identity */}
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                {/* Mobile-optimized AI avatar with 44px touch target */}
                <div 
                  className="relative group cursor-pointer flex-shrink-0"
                  onClick={() => navigate('/')}
                  role="button"
                  aria-label="Navigate to home"
                >
                  <div className={`
                    relative p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl
                    min-w-[44px] min-h-[44px] flex items-center justify-center
                    bg-gradient-to-br ${specialtyConfig.gradient}
                    shadow-lg sm:shadow-xl shadow-${specialtyConfig.glowColor}/20
                    transform transition-all duration-500 hover:scale-105 active:scale-95
                    border border-white/30 ${optimizeClasses('backdrop-blur-xl', 'backdrop-blur-sm', shouldOptimize)}
                    ${isPulsing ? 'animate-pulse' : ''}
                  `}>
                    {React.cloneElement(specialtyConfig.icon, { 
                      className: "w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" 
                    })}
                    
                    {/* Mobile-optimized shine effect */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-white/25 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Performance-optimized ambient glow */}
                    <div className={`absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-br ${specialtyConfig.gradient} opacity-15 group-hover:opacity-25 transition-opacity duration-500 blur-lg`} />
                  </div>
                  
                  {/* Mobile-optimized status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <div className={`
                      w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full border-2 border-white shadow-md
                      ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}
                      transition-all duration-300
                    `}>
                      <div className={`
                        absolute inset-0 rounded-full
                        ${isConnected ? 'bg-emerald-400 animate-ping opacity-20' : 'bg-rose-400 animate-pulse opacity-40'}
                      `} />
                    </div>
                  </div>
                </div>

                {/* Mobile-first responsive typography */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h1 className={`
                    text-base sm:text-xl lg:text-2xl font-black tracking-tight
                    bg-gradient-to-r ${specialtyConfig.gradient} bg-clip-text text-transparent
                    drop-shadow-sm truncate
                  `}>
                    MediMind AI
                  </h1>
                  <div className="flex items-center space-x-1.5 sm:space-x-3">
                    <span className={`
                      px-1.5 sm:px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                      bg-gradient-to-r from-${specialtyConfig.accentColor}-50/90 to-${specialtyConfig.accentColor}-100/90
                      text-${specialtyConfig.accentColor}-700 border border-${specialtyConfig.accentColor}-200/40
                      ${optimizeClasses('backdrop-blur-sm', '', shouldOptimize)} shadow-sm whitespace-nowrap truncate max-w-[120px] sm:max-w-none
                    `}>
                      {profile?.medical_specialty === 'cardiology' ? 'Cardiology' : 
                       profile?.medical_specialty === 'obgyn' ? 'OB/GYN' : 'Medical AI'}
                    </span>
                    <div className="flex items-center space-x-1 hidden sm:flex">
                      <div className={`
                        w-1.5 h-1.5 rounded-full
                        ${isConnected ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-rose-500 shadow-rose-500/40'}
                        ${isConnected ? 'animate-pulse shadow-sm' : 'animate-bounce shadow-sm'}
                      `} />
                      <span className="text-xs font-medium text-slate-600">
                        {isConnected ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center: Knowledge Base Selector - Better UX positioning */}
              <div className="hidden lg:flex flex-1 justify-center max-w-md mx-4" data-tour="knowledge-base">
                <KnowledgeBaseSelector
                  selectedKnowledgeBase={knowledgeBase}
                  onKnowledgeBaseChange={handleKnowledgeBaseChange}
                  personalDocumentCount={personalDocumentCount}
                  disabled={isLoading}
                  className={`w-full bg-white/95 ${animationClasses.backdropBlur} border-white/60 shadow-lg rounded-xl`}
                />
              </div>

              {/* Right: Action Buttons Group */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Mobile knowledge base - compact version */}
                <div className="lg:hidden" data-tour="knowledge-base">
                  <KnowledgeBaseSelector
                    selectedKnowledgeBase={knowledgeBase}
                    onKnowledgeBaseChange={handleKnowledgeBaseChange}
                    personalDocumentCount={personalDocumentCount}
                    disabled={isLoading}
                    className="w-auto"
                  />
                </div>

                {/* Case management section - Mobile optimized */}
                {activeCase && (
                  <div className="hidden sm:block">
                    <HeaderCaseIndicator
                      activeCase={activeCase}
                      onViewCase={handleViewCase}
                      onResetCase={handleResetCase}
                    />
                  </div>
                )}
                
                {/* ABG Context Indicator - Mobile optimized */}
                {abgContext && (
                  <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg sm:rounded-xl border border-red-200/40 shadow-sm">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-md sm:rounded-lg flex items-center justify-center">
                      <TestTube2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div className="hidden md:flex flex-col min-w-0">
                      <span className="text-sm font-medium text-red-900 truncate">{t('chat.abg.active', 'ABG Analysis Active')}</span>
                      <span className="text-xs text-red-600 truncate">{abgContext.type}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-red-100 text-red-800 border-red-200 hidden sm:inline-flex">
                      Context
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAbgContext(null)}
                      className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                {!activeCase && (
                  <>
                    {/* Primary Chat Actions Group */}
                    <div className="flex items-center space-x-1 bg-white/40 backdrop-blur-sm rounded-xl p-1 border border-white/60 shadow-sm">
                      
                      {/* Mobile-optimized New chat button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNewConversation}
                        disabled={isDisabled || !isConnected}
                        className={`
                          group relative min-h-[44px] min-w-[44px] sm:px-4 p-0 sm:p-2 rounded-lg font-medium text-sm
                          bg-white/80 hover:bg-white/90 text-slate-700
                          border border-transparent hover:border-slate-200/60
                          hover:shadow-md hover:scale-105 active:scale-95
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                          transition-all duration-200
                        `}
                        title={t('chat.newChat')}
                      >
                        <Plus className="w-4 h-4 sm:mr-1.5 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="hidden sm:inline">{t('chat.newChat')}</span>
                      </Button>

                      {/* Mobile-optimized History button */}
                      <EnhancedTooltip
                        title="Chat History"
                        description="View and manage all your previous AI conversations."
                        icon={History}
                        gradient="from-emerald-500 to-teal-600"
                        badge="Browse"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConversationList(true)}
                          className={`
                            group relative min-h-[44px] min-w-[44px] p-0 rounded-lg
                            bg-white/80 hover:bg-white/90
                            border border-transparent hover:border-slate-200/60
                            hover:shadow-md hover:scale-105 active:scale-95
                            transition-all duration-200
                          `}
                          title={t('chat.conversationHistory', 'Conversation History')}
                        >
                          <History className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors duration-200" />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-slate-500/0 to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Button>
                      </EnhancedTooltip>

                    </div>

                    {/* Case Management Actions Group */}
                    <div className="flex items-center space-x-1 bg-violet-50/40 backdrop-blur-sm rounded-xl p-1 border border-violet-200/60 shadow-sm">
                      {/* Mobile-optimized Cases button with badge */}
                      <EnhancedTooltip
                        title="My Cases"
                        description="View and switch between your saved clinical cases."
                        icon={FileText}
                        gradient="from-violet-500 to-purple-600"
                        badge="Switch Cases"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await loadCases();
                            setShowCaseListModal(true);
                          }}
                          className={`
                            group relative min-h-[44px] min-w-[44px] p-0 rounded-lg
                            bg-white/80 hover:bg-violet-50/80
                            border border-transparent hover:border-violet-200/60
                            hover:shadow-md hover:scale-105 active:scale-95
                            transition-all duration-200
                          `}
                          title={`${t('chat.patientCases', 'Patient Cases')}: ${caseHistory.length}`}
                        >
                          <FileText className="w-4 h-4 text-violet-600 group-hover:text-violet-800 transition-colors duration-200" />
                          {caseHistory.length > 0 && (
                            <div className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-violet-500/30">
                              {caseHistory.length > 9 ? '9+' : caseHistory.length}
                            </div>
                          )}
                        </Button>
                      </EnhancedTooltip>

                      {/* Mobile-optimized New case button - Only show on larger screens */}
                      <div className="hidden sm:block">
                        <NewCaseButton
                          onClick={() => setShowCaseModal(true)}
                          disabled={isDisabled || !isConnected}
                          variant="ghost"
                          size="sm"
                          className={`
                            group relative min-h-[44px] px-4 rounded-lg font-medium text-sm
                            bg-white/80 hover:bg-violet-50/80 text-violet-700
                            border border-transparent hover:border-violet-200/60
                            hover:shadow-md hover:scale-105 active:scale-95
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                            transition-all duration-200
                          `}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile-only case management section */}
            {activeCase && (
              <div className="sm:hidden mt-1.5 pt-1.5 border-t border-white/30">
                <HeaderCaseIndicator
                  activeCase={activeCase}
                  onViewCase={handleViewCase}
                  onResetCase={handleResetCase}
                />
              </div>
            )}
          </div>

          {/* Refined progress indicator */}
          {(isLoading || isAnalyzing) && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${specialtyConfig.gradient} shadow-sm`}
                style={{ 
                  width: '35%',
                  animation: 'elegantSlide 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite',
                  filter: `drop-shadow(0 0 6px rgb(var(--${specialtyConfig.glowColor}-500) / 0.4))`
                }} 
              />
            </div>
          )}

          {/* Subtle bottom glow */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-1/2 h-3 bg-gradient-to-r from-transparent via-slate-200/20 to-transparent blur-lg rounded-full" />
        </div>
      </div>

      {/* ABG Context Banner - Prominent display when context is active */}
      {abgContext && (
        <div className="relative z-20 mx-3 sm:mx-4 -mb-1">
          <div className={`bg-gradient-to-r from-red-50 via-rose-50 to-red-50 border border-red-200/50 rounded-xl p-3 sm:p-4 shadow-lg ${optimizeClasses('backdrop-blur-sm', '', shouldOptimize)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TestTube2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-red-900">{t('chat.abg.contextActive', 'Blood Gas Analysis Context Active')}</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                      {abgContext.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    {isContextLoading ? 
                      t('chat.abg.loading', 'Context is being loaded...') : 
                      t('chat.abg.loaded', 'Context loaded! Ask questions about this ABG analysis, interpretation, or treatment recommendations.')
                    }
                  </p>
                  {abgContext.patient && (
                    <div className="flex items-center space-x-2 text-xs text-red-600 mt-2">
                      <span>{t('chat.patient', 'Patient')}: {abgContext.patient.first_name} {abgContext.patient.last_name}</span>
                      <span>•</span>
                      <span>{new Date(abgContext.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAbgContext(null)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Optimized Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        {/* Mobile-Enhanced Messages Display */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {messages.length === 0 ? (
            // Clinical Dashboard - Professional medical workflow interface
            <div className="flex-1 overflow-y-auto">
              <ClinicalDashboard 
                recentCases={caseHistory}
                onCreateCase={() => setShowCaseModal(true)}
                specialtyConfig={specialtyConfig}
              />
            </div>
          ) : (
            // Mobile-enhanced Messages with optimized styling
            <div className="flex-1 flex flex-col min-h-0 relative chat-messages-area">
              <MessageList 
                messages={messages} 
                isTyping={isTyping}
                className="flex-1 bg-gradient-to-b from-transparent via-white/20 to-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile-Optimized Error Display */}
      {error && (
        <div className="flex-shrink-0 mx-3 sm:mx-4 lg:mx-6 mb-3 sm:mb-4 relative">
        <div className={`
            p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl ${animationClasses.backdropBlur}
            bg-gradient-to-r from-red-50/90 via-rose-50/90 to-red-50/90
            border border-red-200/60 shadow-xl shadow-red-500/20
            relative overflow-hidden
          `}>
            {/* Animated error background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-rose-500/10 to-red-500/5 animate-pulse" />
            
            <div className="relative flex items-start space-x-3 sm:space-x-4">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-red-500/10 backdrop-blur-sm flex-shrink-0">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-red-800 mb-1 text-sm sm:text-base">{t('chat.connectionIssue', 'Connection Issue')}</h4>
                <p className="text-sm text-red-700 break-words">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChatError(undefined)}
                className="p-2 h-auto min-h-[36px] min-w-[36px] text-red-600 hover:text-red-800 hover:bg-red-100/50 rounded-lg sm:rounded-xl transition-all duration-200 flex-shrink-0"
            >
                <X className="w-4 h-4" />
            </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Optimized Calculator Suggestions */}
      {showSuggestions && suggestions && suggestions.recommendations && suggestions.recommendations.length > 0 && (
        <div className="flex-shrink-0 px-3 sm:px-4 lg:px-6 mb-3 sm:mb-4" data-tour="calculator-suggestions">
          <CalculatorSuggestions
            recommendations={suggestions.recommendations}
            matchedKeywords={suggestions.matchedKeywords}
            confidence={suggestions.confidence}
            onCalculatorSelect={onCalculatorSelect}
            onDismiss={dismissSuggestions}
            className={`${animationClasses.backdropBlur} bg-gradient-to-r from-white/95 to-white/90 border border-white/60 rounded-xl sm:rounded-2xl shadow-2xl shadow-slate-900/10`}
          />
        </div>
      )}

      {/* Desktop Input Area - Only show on desktop and when case modal is not open */}
      <div className={`desktop-input-wrapper flex-shrink-0 relative z-20 ${shouldOptimize ? 'hidden md:hidden lg:hidden xl:hidden' : (showCaseModal ? 'hidden' : 'block')}`}>
        {/* Mobile-first glass morphism container */}
        <div className={`relative ${animationClasses.backdropBlur} bg-gradient-to-t from-white/95 via-white/90 to-white/95 border-t border-white/60 shadow-2xl shadow-slate-900/10`}>
          {/* Performance-optimized ambient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent" />
          <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 w-2/3 h-6 sm:h-8 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent blur-2xl rounded-full" />
          
          <div className="relative">
          {activeCase ? (
            <CaseContextProvider 
              activeCase={activeCase}
              selectedDocuments={selectedDocuments}
            >
              {({ caseContext, attachmentUploads, attachments }) => (
                <MessageInput
                  onSendMessage={(content, messageAttachments, enhancedMessage) => 
                    handleSendMessageWithEnhancedContext(content, messageAttachments, caseContext, attachmentUploads, enhancedMessage)
                  }
                  disabled={isDisabled || isLoading || !isConnected}
                  placeholder={
                    personalKBPlaceholder || 
                    placeholder || 
                      (isConnected ? t('chat.typeMessage') : t('chat.connectToStartChatting'))
                  }
                  allowAttachments={allowAttachments}
                  maxFileSize={10}
                  maxFiles={5}
                  selectedKnowledgeBase={knowledgeBase}
                  personalDocumentCount={personalDocumentCount}
                    className="border-0 bg-transparent backdrop-blur-none"
                  caseDocuments={attachments}
                  selectedDocuments={selectedDocuments}
                  onDocumentToggle={toggleDocumentSelection}
                  onSelectAllDocuments={selectAllDocuments}
                  onClearSelectedDocuments={clearSelectedDocuments}
                  showDocumentSelector={true}
                  disableInternalMobilePositioning={true}
                />
              )}
            </CaseContextProvider>
          ) : (
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={isDisabled || isLoading || !isConnected}
              placeholder={
                abgContext 
                  ? t('chat.abg.placeholder', 'Ask about the blood gas analysis, clinical interpretation, or get treatment recommendations...')
                  : personalKBPlaceholder || 
                  placeholder || 
                  (isConnected ? t('chat.typeMessage') : t('chat.connectToStartChatting'))
              }
              allowAttachments={allowAttachments}
              maxFileSize={10}
              maxFiles={5}
              selectedKnowledgeBase={knowledgeBase}
              personalDocumentCount={personalDocumentCount}
                className="border-0 bg-transparent backdrop-blur-none"
              disableInternalMobilePositioning={true}
            />
          )}
        </div>
        </div>
      </div>

      {/* Mobile Input Area - Fixed positioned for mobile only and when case modal is not open */}
      {shouldOptimize && !showCaseModal && (
        <>
          {activeCase ? (
            <CaseContextProvider 
              activeCase={activeCase}
              selectedDocuments={selectedDocuments}
            >
              {({ caseContext, attachmentUploads, attachments }) => (
                <MessageInput
                  key={`mobile-case-input-${activeCase?.id || 'default'}-${Date.now()}`}
                  onSendMessage={(content, messageAttachments, enhancedMessage) => 
                    handleSendMessageWithEnhancedContext(content, messageAttachments, caseContext, attachmentUploads, enhancedMessage)
                  }
                  disabled={isDisabled || isLoading || !isConnected}
                  placeholder={
                    personalKBPlaceholder || 
                    placeholder || 
                      (isConnected ? t('chat.typeMessage') : t('chat.connectToStartChatting'))
                  }
                  allowAttachments={allowAttachments}
                  maxFileSize={10}
                  maxFiles={5}
                  selectedKnowledgeBase={knowledgeBase}
                  personalDocumentCount={personalDocumentCount}
                  className="border-0 bg-transparent backdrop-blur-none"
                  caseDocuments={attachments}
                  selectedDocuments={selectedDocuments}
                  onDocumentToggle={toggleDocumentSelection}
                  onSelectAllDocuments={selectAllDocuments}
                  onClearSelectedDocuments={clearSelectedDocuments}
                  showDocumentSelector={true}
                  forceMobileLayout={true}
                />
              )}
            </CaseContextProvider>
          ) : (
            <MessageInput
              key={`mobile-general-input-${sessionId || 'default'}`}
              onSendMessage={handleSendMessage}
              disabled={isDisabled || isLoading || !isConnected}
              placeholder={
                abgContext 
                  ? t('chat.abg.placeholder', 'Ask about the blood gas analysis, clinical interpretation, or get treatment recommendations...')
                  : personalKBPlaceholder || 
                  placeholder || 
                  (isConnected ? t('chat.typeMessage') : t('chat.connectToStartChatting'))
              }
              allowAttachments={allowAttachments}
              maxFileSize={10}
              maxFiles={5}
              selectedKnowledgeBase={knowledgeBase}
              personalDocumentCount={personalDocumentCount}
              className="border-0 bg-transparent backdrop-blur-none"
              forceMobileLayout={true}
            />
          )}
        </>
      )}

      {/* Modal Components */}
      <ConversationList
        isOpen={showConversationList}
        onClose={() => setShowConversationList(false)}
      />

      <CaseCreationModal
        isOpen={showCaseModal}
        onClose={() => {
          setShowCaseModal(false);
          setEditingCase(null); // Reset editing case when modal closes
        }}
        onCaseCreate={handleCaseCreate}
        onCaseUpdate={handleCaseUpdate}
        editingCase={editingCase}
        specialty={profile?.medical_specialty as 'cardiology' | 'obgyn'}
      />

      <CaseListModal
        isOpen={showCaseListModal}
        onClose={() => setShowCaseListModal(false)}
        cases={caseHistory}
        onCaseSelect={handleCaseSelect}
        onEditCase={handleEditCase}
        activeCase={activeCase}
      />

      {/* Revolutionary CSS Animations */}
      <style>{`
        @keyframes elegantSlide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes animate-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        @keyframes animate-spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-float {
          animation: animate-float 12s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: animate-spin-slow 20s linear infinite;
        }
        
        .animate-shimmer {
          background-size: 200% 200%;
          animation: shimmer 2s linear infinite;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        
        .bg-gradient-conic {
          background: conic-gradient(var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};

export default FlowiseChatWindow;