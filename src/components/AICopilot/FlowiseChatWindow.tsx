import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { History, Plus, FileText, Sparkles, Stethoscope, Heart, AlertCircle, X, Calculator, TestTube2, MessageSquarePlus, FilePlus2, Home } from 'lucide-react';
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
  openCaseModalOnMount?: boolean;
}

const FlowiseChatWindowComponent: React.FC<FlowiseChatWindowProps> = ({
  className = '',
  isDisabled = false,
  placeholder,
  allowAttachments = true,
  openCaseModalOnMount = false
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
  const [sessionId, setSessionId] = useState(() => {
    const id = uuidv4();
    console.log('🆔 Initial sessionId created:', id);
    return id;
  });

  // Debug: Log whenever sessionId changes
  React.useEffect(() => {
    console.log('📝 SessionId state changed to:', sessionId);
  }, [sessionId]);
  
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
    loadFlowiseMessages,
    markCaseContextSent,
    hasCaseContextBeenSent,
    resetCaseContextTracking
  } = useAppStore();

  // Get Flowise metadata functions and case management from ChatContext
  const { saveFlowiseConversationMetadata, incrementFlowiseMessageCount, loadCases, createCase, updateCase } = useChatContext();

  const navigate = useNavigate();
  const [showConversationList, setShowConversationList] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showCaseListModal, setShowCaseListModal] = useState(false);
  const [editingCase, setEditingCase] = useState<PatientCase | null>(null);
  const [caseListKey, setCaseListKey] = useState(0); // Force re-render of case list
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

  // Regenerate sessionId ONLY when switching between conversations (not when creating first)
  // Use useRef to track the previous conversationId
  const prevConversationIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    // Only regenerate if:
    // 1. We have an activeConversationId
    // 2. We had a previous conversationId (not first-time creation)
    // 3. The IDs are different (actual switch)
    if (activeConversationId &&
        prevConversationIdRef.current !== null &&
        activeConversationId !== prevConversationIdRef.current) {
      console.log('🔄 Switching conversations - regenerating sessionId');
      setSessionId(uuidv4());
    }

    // Always update the ref to track the current conversation
    prevConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Handle opening case modal on mount
  useEffect(() => {
    if (openCaseModalOnMount) {
      setShowCaseModal(true);
    }
  }, [openCaseModalOnMount]);

  // Handle knowledge base changes with automatic new chat
  const handleKnowledgeBaseChange = useCallback((newKnowledgeBase: 'personal' | 'curated') => {
    // Only start new chat if there are existing messages and KB is actually changing
    if (messages.length > 0 && newKnowledgeBase !== knowledgeBase) {
      // Start a new conversation to avoid mixing contexts
      const newConversationId = createNewConversation(
        t('chat.defaultChatTitle', 'Chat'), 
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

  // Update editingCase when caseHistory changes (after case updates)
  useEffect(() => {
    if (editingCase && caseHistory.length > 0) {
      const freshCase = caseHistory.find(c => c.id === editingCase.id);
      if (freshCase && JSON.stringify(freshCase) !== JSON.stringify(editingCase)) {
        setEditingCase(freshCase);
      }
    }
  }, [caseHistory, editingCase]);

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

    // Check if case context has already been sent for this conversation
    const shouldSendCaseContext = activeCase && !hasCaseContextBeenSent(conversationId);

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
        // Determine what case context to send:
        // - First message: Full case context with enhanced context
        // - Subsequent messages: Marker-only case for Flowise routing
        let enhancedCase: any = null;

        if (activeCase) {
          if (shouldSendCaseContext) {
            // First message: Include full case context
            enhancedCase = {
              ...activeCase,
              enhancedContext: enhancedCaseContext
            };
          } else {
            // Subsequent messages: Include marker-only flag for routing
            // This ensures ACTIVE CASE CONTEXT marker is included without full context
            enhancedCase = {
              id: activeCase.id,
              markerOnly: true // Special flag for Flowise routing
            };
          }
        }

        // ONLY include case attachments on first message
        // For subsequent messages, only send new message-specific attachments
        let allAttachments: Attachment[] = messageAttachments || [];

        if (shouldSendCaseContext && caseAttachmentUploads) {
          // First message: Convert and include case attachment uploads
          const caseAttachments: Attachment[] = caseAttachmentUploads.map(upload => {
            if (upload.type === 'url') {
              // Image URL attachments
              return {
                id: uuidv4(),
                name: upload.name,
                type: upload.mime,
                url: upload.data,
                uploadType: 'url',
                size: 0
              };
            } else {
              // Text content from documents - create a proper base64 text file
              const textContent = upload.data;
              const base64Text = btoa(unescape(encodeURIComponent(textContent)));
              const dataUrl = `data:text/plain;base64,${base64Text}`;

              return {
                id: uuidv4(),
                name: upload.name,
                type: 'text/plain',
                base64Data: dataUrl,
                uploadType: 'file',
                size: textContent.length
              };
            }
          });

          allAttachments = [
            ...(messageAttachments || []),
            ...caseAttachments
          ];
        }

        // Pass the case context and attachments to the API
        // First message: enhancedCase contains full context
        // Subsequent messages: enhancedCase contains markerOnly flag for Flowise routing
        await sendToFlowise(
          content,
          allAttachments,
          enhancedCase as any,
          knowledgeBase,
          undefined, // personalDocumentIds - handled automatically by backend
          enhancedMessage // Pass the enhanced message with extracted text
        );

        // Mark case context as sent for this conversation (only on first message)
        if (shouldSendCaseContext) {
          markCaseContextSent(conversationId);
        }

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
      setChatError(t('chat.messageSendFailed', 'Failed to send message. Please try again.'));
    }

    setChatLoading(false);
  }, [addMessage, sendToFlowise, activeConversationId, knowledgeBase, activeCase, setChatLoading, setChatError, ensureConversationExists, abgContext, hasCaseContextBeenSent, markCaseContextSent, sessionId, saveFlowiseMessage, saveFlowiseConversationMetadata, incrementFlowiseMessageCount, t]);

  // Handle case creation
  const handleCaseCreate = async (caseData: Omit<PatientCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientCase> => {
    try {
      console.log('[CaseCreation] Starting case creation...', { caseData });
      const newCase = await createCase(caseData);
      console.log('[CaseCreation] Case created in database:', { caseId: newCase.id, title: newCase.title });

      // CRITICAL FIX: Explicitly set as active case BEFORE loading cases
      // This ensures the case context is available for the first message
      setActiveCase(newCase);
      console.log('[CaseCreation] Active case set:', { caseId: newCase.id });

      // Reload cases to ensure the list is up-to-date
      await loadCases();
      console.log('[CaseCreation] Cases reloaded from database');

      // Force re-render of case list modal to show new case
      setCaseListKey(prev => prev + 1);
      console.log('[CaseCreation] Case list refresh triggered');

      // Create a new conversation for this case with proper type
      const newConversationId = createNewConversation(
        `Case: ${newCase.title}`,
        profile?.medical_specialty as 'cardiology' | 'obgyn',
        newCase.id,
        'case-study'
      );
      console.log('[CaseCreation] New conversation created:', { conversationId: newConversationId });

      // Set the new conversation as active
      setActiveConversation(newConversationId);

      // Add an initial AI message with case context
      const caseIntroMessage: Message = {
        id: uuidv4(),
      content: t('chat.caseReadyMessage', { title: newCase.title }),
        type: 'ai',
        timestamp: new Date(),
        sources: [], // Explicitly set empty sources to avoid inheriting from previous messages
      };

      addMessage(caseIntroMessage);
      console.log('[CaseCreation] Case creation complete - ready for first message');

      return newCase;
    } catch (error) {
      console.error('[CaseCreation] Case creation failed:', error);
      setChatError(t('chat.caseCreateFailed', 'Failed to create case. Please try again.'));
      throw error; // Re-throw so the modal can handle it
    }
  };

  // Handle case update
  const handleCaseUpdate = async (caseId: string, caseData: Omit<PatientCase, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (caseData.metadata?.attachments) {
    }
    
    try {
      const updatedCase = await updateCase(caseId, caseData);
      
      // The updateCase function now returns the exact data from the database
      // This ensures we have the most up-to-date case information
      return updatedCase;
      
    } catch (error) {
      throw error;
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
          t('chat.freshConversation', 'Fresh Conversation'), 
          profile?.medical_specialty as 'cardiology' | 'obgyn',
          undefined // explicitly no case ID
        );
        
        // Step 5: Set the new conversation as active
        setActiveConversation(newConversationId);
        
        // Step 6: Don't add any messages - let the clinical dashboard show
        // This ensures a clean state with the welcome screen visible
        
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
      setChatError(t('chat.caseResetFailed', 'Failed to reset case. Please try again.'));
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
    
    // Add an initial AI message with case context (similar to case creation)
    const caseIntroMessage: Message = {
      id: uuidv4(),
      content: t('chat.caseReadyMessage', { title: selectedCase.title }),
      type: 'ai',
      timestamp: new Date(),
      sources: [], // Explicitly set empty sources to avoid inheriting from previous messages
    };
    
    addMessage(caseIntroMessage);
    
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

    // Generate a new sessionId to ensure completely separate conversation in Flowise
    setSessionId(uuidv4());

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

  // Get specialty configuration - memoized to prevent recreation on every render
  const specialtyConfig = useMemo(() => {
    if (profile?.medical_specialty === 'cardiology') {
      return {
        icon: <Heart className="w-5 h-5" />,
        title: t('chat.specialtyTitles.cardiologyExpert', 'Cardiology Expert'),
        gradient: 'from-[#1a365d] via-[#2b6cb0] to-[#63b3ed]',
        bgGradient: 'from-[#90cdf4]/20 via-[#63b3ed]/10 to-transparent',
        borderColor: 'border-[#63b3ed]/60',
        accentColor: '[#2b6cb0]',
        glowColor: '[#63b3ed]'
      };
    } else if (profile?.medical_specialty === 'obgyn') {
      return {
        icon: <Stethoscope className="w-5 h-5" />,
        title: t('chat.specialtyTitles.obgynExpert', 'OB/GYN Expert'),
        gradient: 'from-[#2b6cb0] via-[#63b3ed] to-[#90cdf4]',
        bgGradient: 'from-[#90cdf4]/20 via-[#63b3ed]/10 to-transparent',
        borderColor: 'border-[#63b3ed]/60',
        accentColor: '[#63b3ed]',
        glowColor: '[#90cdf4]'
      };
    } else {
      return {
        icon: <Sparkles className="w-5 h-5" />,
        title: t('chat.specialtyTitles.medicalExpert', 'Medical AI Expert'),
        gradient: 'from-[#1a365d] via-[#2b6cb0] to-[#63b3ed]',
        bgGradient: 'from-[#90cdf4]/20 via-[#63b3ed]/10 to-transparent',
        borderColor: 'border-[#2b6cb0]/60',
        accentColor: '[#2b6cb0]',
        glowColor: '[#63b3ed]'
      };
    }
  }, [profile?.medical_specialty]);

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
              `absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-[#63b3ed]/8 via-[#63b3ed]/4 to-transparent rounded-full ${animationClasses.blur} ${animationClasses.animations}`,
              `absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#63b3ed]/4 to-transparent rounded-full ${animationClasses.blur}`,
              shouldOptimize
            )}
          />
        )}
        {animationClasses.orbCount >= 2 && (
          <div 
            className={optimizeClasses(
              `absolute bottom-0 right-0 w-80 h-80 bg-gradient-radial from-[#2b6cb0]/6 via-[#90cdf4]/3 to-transparent rounded-full ${animationClasses.blur} ${animationClasses.animations}`,
              `absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-[#2b6cb0]/3 to-transparent rounded-full ${animationClasses.blur}`,
              shouldOptimize
            )}
            style={getOptimizedDelay('-3s', shouldOptimize)}
          />
        )}
        {animationClasses.orbCount >= 3 && (
          <div 
            className={optimizeClasses(
              `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-[#90cdf4]/5 via-[#63b3ed]/2 to-transparent rounded-full ${animationClasses.blur} ${animationClasses.animations}`,
              `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-[#90cdf4]/3 to-transparent rounded-full ${animationClasses.blur}`,
              shouldOptimize
            )}
            style={getOptimizedDelay('-6s', shouldOptimize)}
          />
        )}
        
        {/* Luxury mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/40 to-transparent" />
        </div>

      {/* Clean Premium Header */}
      <div className="relative z-20" data-tour="chat-window">
        {/* Minimalist glass morphism header container with refined borders */}
        <div className={`relative chat-header-area ${animationClasses.backdropBlur} bg-white/98 border-b-2 border-slate-100/80 shadow-sm`}>
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/30 via-transparent to-transparent" />
            {!shouldOptimize && (
              <>
                <div className={`absolute -top-20 -left-20 w-40 h-40 bg-gradient-radial from-blue-50 via-blue-50/20 to-transparent rounded-full ${animationClasses.blur} ${animationClasses.animations} opacity-40`} />
                <div
                  className={`absolute -top-16 -right-16 w-32 h-32 bg-gradient-radial from-indigo-50 via-indigo-50/10 to-transparent rounded-full ${animationClasses.blur} ${animationClasses.animations} opacity-30`}
                  style={getOptimizedDelay('-4s', shouldOptimize)}
                />
              </>
            )}
          </div>

          {/* Mobile-optimized header content */}
            <div className="relative px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4" data-tour="ai-copilot">
            {/* Main header row - Optimized for user-centric UI/UX */}
            <div className="flex items-center lg:justify-between gap-3 sm:gap-4 lg:gap-8 w-full">

              {/* Left: Knowledge Base Selector - User-friendly positioning */}
              <div className="hidden lg:flex flex-shrink-0" data-tour="knowledge-base">
                <KnowledgeBaseSelector
                  selectedKnowledgeBase={knowledgeBase}
                  onKnowledgeBaseChange={handleKnowledgeBaseChange}
                  personalDocumentCount={personalDocumentCount}
                  disabled={isLoading}
                  className={`w-auto bg-white ${animationClasses.backdropBlur} border border-slate-200/80 shadow-sm rounded-xl hover:shadow-md transition-shadow duration-200`}
                />
              </div>

              {/* Mobile: Full-width distributed layout */}
              <div className="flex lg:hidden items-center justify-between gap-2 sm:gap-3 w-full">
                {/* Left Group: Home + KB Selector */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Mobile home button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
                    title={t('navigation.home', 'Home')}
                    aria-label="Navigate to home"
                  >
                    <Home className="w-5 h-5 text-slate-700" />
                  </Button>

                  {/* Mobile knowledge base */}
                  <div data-tour="knowledge-base">
                    <KnowledgeBaseSelector
                      selectedKnowledgeBase={knowledgeBase}
                      onKnowledgeBaseChange={handleKnowledgeBaseChange}
                      personalDocumentCount={personalDocumentCount}
                      disabled={isLoading}
                      className="w-auto"
                    />
                  </div>
                </div>

                {/* Right Group: Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Case management section - Mobile optimized */}
                  {activeCase && (
                    <div className="hidden sm:block">
                      <HeaderCaseIndicator
                        activeCase={activeCase}
                        onViewCase={handleViewCase}
                        onEditCase={handleEditCase}
                        onResetCase={handleResetCase}
                      />
                    </div>
                  )}

                  {!activeCase && (
                  <>
                    {/* Group 1: Creation Actions - Premium Design */}
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-50/80 via-white to-slate-50/50 backdrop-blur-xl rounded-2xl p-1.5 border border-slate-200/60 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100/50">

                      {/* Premium New Chat Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNewConversation}
                        disabled={isDisabled || !isConnected}
                        className={`
                          group relative min-h-[44px] min-w-[44px] sm:px-5 px-3 py-2.5 rounded-xl font-semibold text-sm
                          bg-gradient-to-br from-white via-white to-slate-50/30
                          text-slate-700 hover:text-slate-900
                          border border-slate-200/80 hover:border-slate-300/90
                          shadow-md shadow-slate-200/60 hover:shadow-lg hover:shadow-slate-300/70
                          ring-1 ring-white/60 hover:ring-white
                          hover:scale-[1.03] active:scale-[0.98]
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                          transition-all duration-300 ease-out
                          backdrop-blur-sm
                        `}
                        title={t('chat.newChat')}
                      >
                        {/* Icon container with glow effect */}
                        <div className="relative">
                          {/* Show MessageSquarePlus on mobile, Plus on desktop */}
                          <MessageSquarePlus className="w-4 h-4 sm:hidden relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-sm" />
                          <Plus className="w-4 h-4 hidden sm:block sm:mr-2 relative z-10 group-hover:rotate-90 transition-transform duration-500 ease-out drop-shadow-sm" />
                          {/* Icon glow on hover */}
                          <div className="absolute inset-0 blur-md opacity-0 group-hover:opacity-100 bg-gradient-to-r from-slate-400 to-slate-500 transition-opacity duration-300" />
                        </div>
                        <span className="hidden sm:inline relative z-10 tracking-wide">{t('chat.newChat')}</span>

                        {/* Premium shine effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Subtle inner glow */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-slate-100/30 via-transparent to-blue-50/20 transition-opacity duration-300" />
                      </Button>

                      {/* Premium New Case Button */}
                      <NewCaseButton
                        onClick={() => setShowCaseModal(true)}
                        disabled={isDisabled || !isConnected}
                        variant="ghost"
                        size="sm"
                        className={`
                          group relative min-h-[44px] min-w-[44px] sm:px-5 px-3 py-2.5 rounded-xl font-semibold text-sm
                          bg-gradient-to-br from-white via-white to-slate-50/30
                          text-slate-700 hover:text-slate-900
                          border border-slate-200/80 hover:border-slate-300/90
                          shadow-md shadow-slate-200/60 hover:shadow-lg hover:shadow-slate-300/70
                          ring-1 ring-white/60 hover:ring-white
                          hover:scale-[1.03] active:scale-[0.98]
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                          transition-all duration-300 ease-out
                          backdrop-blur-sm
                        `}
                      />

                    </div>

                    {/* Premium Separator with gradient */}
                    <div className="relative h-10 w-[2px] mx-2 hidden sm:block">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-300/80 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-200/40 to-transparent blur-[1px]" />
                    </div>

                    {/* Group 2: Library/Browse Actions - Premium Blue Theme */}
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/50 backdrop-blur-xl rounded-2xl p-1.5 border border-blue-200/70 shadow-lg shadow-blue-200/50 ring-1 ring-blue-100/60">

                      {/* Premium History Button */}
                      <EnhancedTooltip
                        title={t('chat.tooltip.chatHistoryTitle', 'Chat History')}
                        description={t('chat.tooltip.chatHistoryDescription', 'View and manage all your previous AI conversations.')}
                        icon={History}
                        gradient="from-[#1a365d] to-[#2b6cb0]"
                        badge={t('chat.tooltip.browse', 'Browse')}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConversationList(true)}
                          className={`
                            group relative min-h-[44px] min-w-[44px] sm:px-5 px-3 py-2.5 rounded-xl font-semibold text-sm
                            bg-gradient-to-br from-white via-blue-50/50 to-blue-50/30
                            text-blue-600 hover:text-blue-700
                            border border-blue-200/80 hover:border-blue-400/90
                            shadow-md shadow-blue-200/60 hover:shadow-lg hover:shadow-blue-300/70
                            ring-1 ring-blue-100/60 hover:ring-blue-200/80
                            hover:scale-[1.03] active:scale-[0.98]
                            transition-all duration-300 ease-out
                            backdrop-blur-sm
                          `}
                          title={t('chat.conversationHistory', 'Conversation History')}
                        >
                          {/* Icon container with glow effect */}
                          <div className="relative">
                            <History className="w-4 h-4 sm:mr-2 relative z-10 group-hover:rotate-[-5deg] transition-transform duration-500 ease-out drop-shadow-sm" />
                            {/* Icon glow on hover */}
                            <div className="absolute inset-0 blur-md opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-400 to-blue-500 transition-opacity duration-300" />
                          </div>
                          <span className="hidden sm:inline relative z-10 tracking-wide">History</span>

                          {/* Premium shine effect */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-50/0 via-white/50 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {/* Subtle inner glow */}
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-100/40 via-transparent to-indigo-50/30 transition-opacity duration-300" />
                        </Button>
                      </EnhancedTooltip>

                      {/* Premium Cases Button with Badge */}
                      <EnhancedTooltip
                        title={t('chat.tooltip.myCasesTitle', 'My Cases')}
                        description={t('chat.tooltip.myCasesDescription', 'View and switch between your saved clinical cases.')}
                        icon={FileText}
                        gradient="from-[#2b6cb0] to-[#63b3ed]"
                        badge={t('chat.tooltip.switchCases', 'Switch Cases')}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await loadCases();
                            setShowCaseListModal(true);
                          }}
                          className={`
                            group relative min-h-[44px] min-w-[44px] sm:px-5 px-3 py-2.5 rounded-xl font-semibold text-sm
                            bg-gradient-to-br from-white via-blue-50/50 to-blue-50/30
                            text-blue-600 hover:text-blue-700
                            border border-blue-200/80 hover:border-blue-400/90
                            shadow-md shadow-blue-200/60 hover:shadow-lg hover:shadow-blue-300/70
                            ring-1 ring-blue-100/60 hover:ring-blue-200/80
                            hover:scale-[1.03] active:scale-[0.98]
                            transition-all duration-300 ease-out
                            backdrop-blur-sm
                          `}
                          title={`${t('chat.patientCases', 'Patient Cases')}: ${caseHistory.length}`}
                        >
                          {/* Icon container with glow effect */}
                          <div className="relative">
                            <FileText className="w-4 h-4 sm:mr-2 relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-sm" />
                            {/* Icon glow on hover */}
                            <div className="absolute inset-0 blur-md opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-400 to-blue-500 transition-opacity duration-300" />
                          </div>
                          <span className="hidden sm:inline relative z-10 tracking-wide">Cases</span>

                          {/* Premium Badge */}
                          {caseHistory.length > 0 && (
                            <div className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xl shadow-blue-500/60 border-2 border-white ring-2 ring-blue-100/50 animate-pulse">
                              <span className="relative z-10">{caseHistory.length > 9 ? '9+' : caseHistory.length}</span>
                              {/* Badge glow */}
                              <div className="absolute inset-0 rounded-full bg-blue-400 blur-sm opacity-50" />
                            </div>
                          )}

                          {/* Premium shine effect */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-50/0 via-white/50 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {/* Subtle inner glow */}
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-100/40 via-transparent to-indigo-50/30 transition-opacity duration-300" />
                        </Button>
                      </EnhancedTooltip>

                    </div>
                  </>
                  )}
                </div>
              </div>

              {/* Desktop: Action Buttons Group - Right positioned */}
              <div className="hidden lg:flex items-center gap-3 lg:gap-4 flex-shrink-0">
                {/* Case management section - Desktop */}
                {activeCase && (
                  <HeaderCaseIndicator
                    activeCase={activeCase}
                    onViewCase={handleViewCase}
                    onEditCase={handleEditCase}
                    onResetCase={handleResetCase}
                  />
                )}

                {!activeCase && (
                  <>
                    {/* Group 1: Creation Actions - Premium Design */}
                    <div className="flex items-center gap-2 bg-gradient-to-br from-slate-50/80 via-white to-slate-50/50 backdrop-blur-xl rounded-2xl p-1.5 border border-slate-200/60 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100/50">
                      {/* Premium New Chat Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNewConversation}
                        disabled={isDisabled || !isConnected}
                        className={`
                          group relative min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-xl font-semibold text-sm
                          bg-gradient-to-br from-white via-white to-slate-50/30
                          text-slate-700 hover:text-slate-900
                          border border-slate-200/80 hover:border-slate-300/90
                          shadow-md shadow-slate-200/60 hover:shadow-lg hover:shadow-slate-300/70
                          ring-1 ring-white/60 hover:ring-white
                          hover:scale-[1.03] active:scale-[0.98]
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                          transition-all duration-300 ease-out
                          backdrop-blur-sm
                        `}
                        title={t('chat.newChat')}
                      >
                        <div className="relative">
                          <Plus className="w-4 h-4 mr-2 relative z-10 group-hover:rotate-90 transition-transform duration-500 ease-out drop-shadow-sm" />
                          <div className="absolute inset-0 blur-md opacity-0 group-hover:opacity-100 bg-gradient-to-r from-slate-400 to-slate-500 transition-opacity duration-300" />
                        </div>
                        <span className="relative z-10 tracking-wide">{t('chat.newChat')}</span>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-slate-100/30 via-transparent to-blue-50/20 transition-opacity duration-300" />
                      </Button>

                      {/* Premium New Case Button */}
                      <NewCaseButton
                        onClick={() => setShowCaseModal(true)}
                        disabled={isDisabled || !isConnected}
                        variant="ghost"
                        size="sm"
                        className={`
                          group relative min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-xl font-semibold text-sm
                          bg-gradient-to-br from-white via-white to-slate-50/30
                          text-slate-700 hover:text-slate-900
                          border border-slate-200/80 hover:border-slate-300/90
                          shadow-md shadow-slate-200/60 hover:shadow-lg hover:shadow-slate-300/70
                          ring-1 ring-white/60 hover:ring-white
                          hover:scale-[1.03] active:scale-[0.98]
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                          transition-all duration-300 ease-out
                          backdrop-blur-sm
                        `}
                      />
                    </div>

                    {/* Premium Separator with gradient */}
                    <div className="relative h-10 w-[2px] mx-2">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-300/80 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-200/40 to-transparent blur-[1px]" />
                    </div>

                    {/* Group 2: Library/Browse Actions - Premium Blue Theme */}
                    <div className="flex items-center gap-2 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/50 backdrop-blur-xl rounded-2xl p-1.5 border border-blue-200/70 shadow-lg shadow-blue-200/50 ring-1 ring-blue-100/60">
                      {/* Premium History Button */}
                      <EnhancedTooltip
                        title={t('chat.tooltip.chatHistoryTitle', 'Chat History')}
                        description={t('chat.tooltip.chatHistoryDescription', 'View and manage all your previous AI conversations.')}
                        icon={History}
                        gradient="from-[#1a365d] to-[#2b6cb0]"
                        badge={t('chat.tooltip.browse', 'Browse')}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConversationList(true)}
                          className={`
                            group relative min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-xl font-semibold text-sm
                            bg-gradient-to-br from-white via-blue-50/50 to-blue-50/30
                            text-blue-600 hover:text-blue-700
                            border border-blue-200/80 hover:border-blue-400/90
                            shadow-md shadow-blue-200/60 hover:shadow-lg hover:shadow-blue-300/70
                            ring-1 ring-blue-100/60 hover:ring-blue-200/80
                            hover:scale-[1.03] active:scale-[0.98]
                            transition-all duration-300 ease-out
                            backdrop-blur-sm
                          `}
                          title={t('chat.conversationHistory', 'Conversation History')}
                        >
                          <div className="relative">
                            <History className="w-4 h-4 mr-2 relative z-10 group-hover:rotate-[-5deg] transition-transform duration-500 ease-out drop-shadow-sm" />
                            <div className="absolute inset-0 blur-md opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-400 to-blue-500 transition-opacity duration-300" />
                          </div>
                          <span className="relative z-10 tracking-wide">History</span>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-50/0 via-white/50 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-100/40 via-transparent to-indigo-50/30 transition-opacity duration-300" />
                        </Button>
                      </EnhancedTooltip>

                      {/* Premium Cases Button with Badge */}
                      <EnhancedTooltip
                        title={t('chat.tooltip.myCasesTitle', 'My Cases')}
                        description={t('chat.tooltip.myCasesDescription', 'View and switch between your saved clinical cases.')}
                        icon={FileText}
                        gradient="from-[#2b6cb0] to-[#63b3ed]"
                        badge={t('chat.tooltip.switchCases', 'Switch Cases')}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await loadCases();
                            setShowCaseListModal(true);
                          }}
                          className={`
                            group relative min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-xl font-semibold text-sm
                            bg-gradient-to-br from-white via-blue-50/50 to-blue-50/30
                            text-blue-600 hover:text-blue-700
                            border border-blue-200/80 hover:border-blue-400/90
                            shadow-md shadow-blue-200/60 hover:shadow-lg hover:shadow-blue-300/70
                            ring-1 ring-blue-100/60 hover:ring-blue-200/80
                            hover:scale-[1.03] active:scale-[0.98]
                            transition-all duration-300 ease-out
                            backdrop-blur-sm
                          `}
                          title={`${t('chat.patientCases', 'Patient Cases')}: ${caseHistory.length}`}
                        >
                          <div className="relative">
                            <FileText className="w-4 h-4 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-sm" />
                            <div className="absolute inset-0 blur-md opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-400 to-blue-500 transition-opacity duration-300" />
                          </div>
                          <span className="relative z-10 tracking-wide">Cases</span>

                          {/* Premium Badge */}
                          {caseHistory.length > 0 && (
                            <div className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xl shadow-blue-500/60 border-2 border-white ring-2 ring-blue-100/50 animate-pulse">
                              <span className="relative z-10">{caseHistory.length > 9 ? '9+' : caseHistory.length}</span>
                              <div className="absolute inset-0 rounded-full bg-blue-400 blur-sm opacity-50" />
                            </div>
                          )}

                          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-50/0 via-white/50 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-100/40 via-transparent to-indigo-50/30 transition-opacity duration-300" />
                        </Button>
                      </EnhancedTooltip>
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
                  onEditCase={handleEditCase}
                  onResetCase={handleResetCase}
                />
              </div>
            )}
          </div>

          {/* Clean progress indicator */}
          {(isLoading || isAnalyzing) && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/50 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500`}
                style={{
                  width: '40%',
                  animation: 'elegantSlide 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                  boxShadow: '0 0 12px rgba(59, 130, 246, 0.5)'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ABG Context Banner - Prominent display when context is active */}
      {abgContext && (
        <div className="relative z-20 mx-3 sm:mx-4 -mb-1">
          <div className={`bg-gradient-to-r from-[#90cdf4]/20 via-[#63b3ed]/20 to-[#90cdf4]/20 border border-[#63b3ed]/40 rounded-xl p-3 sm:p-4 shadow-lg ${optimizeClasses('backdrop-blur-sm', '', shouldOptimize)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TestTube2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-[#1a365d]">{t('chat.abg.contextActive', 'Blood Gas Analysis Context Active')}</span>
                    <Badge variant="secondary" className="bg-[#90cdf4]/30 text-red-600 border-[#63b3ed]/40">
                      {abgContext.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#2b6cb0] mt-1">
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
                className="text-[#2b6cb0] hover:text-[#1a365d] hover:bg-[#90cdf4]/20 p-2"
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
                activeCase={activeCase}
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
          
          // If we were editing a case, briefly show the case list again to see the updated case
          if (editingCase) {
            setTimeout(() => {
              
              // Force refresh cases from database before showing modal
              loadCases(true).then(() => {
                setShowCaseListModal(true);
              });
            }, 300);
          }
        }}
        onCaseCreate={handleCaseCreate}
        onCaseUpdate={handleCaseUpdate}
        editingCase={editingCase}
        specialty={profile?.medical_specialty as 'cardiology' | 'obgyn'}
      />

      <CaseListModal
        key={`cases-modal-${caseListKey}-${showCaseListModal ? Date.now() : 'closed'}`}
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

// Memoize component to prevent unnecessary re-renders
export const FlowiseChatWindow = React.memo(FlowiseChatWindowComponent);

export default FlowiseChatWindow;