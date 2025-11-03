import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useRef, useMemo } from 'react';
import { Message, ChatState, Conversation, PatientCase, CaseContext, KnowledgeBaseType, ConversationType } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';
import { checkUserVectorStore, getUserDocumentStats } from '../lib/api/vectorStore';
import { supabase } from '../lib/supabase';
import { loadUserCasesOptimized } from '../lib/api/queryOptimization';
import { logger } from '../lib/logger';
import { useAppStore } from '../stores/useAppStore';

// Chat Actions
type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: string; updates: Partial<Conversation> } }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'SET_LOADING_HISTORY'; payload: boolean }
  | { type: 'SET_ACTIVE_CASE'; payload: PatientCase | null }
  | { type: 'ADD_CASE'; payload: PatientCase }
  | { type: 'UPDATE_CASE'; payload: { id: string; updates: Partial<PatientCase> } }
  | { type: 'DELETE_CASE'; payload: string }
  | { type: 'SET_CASE_HISTORY'; payload: PatientCase[] }
  | { type: 'SET_CASE_DISCUSSION'; payload: boolean }
  | { type: 'SET_KNOWLEDGE_BASE'; payload: KnowledgeBaseType }
  | { type: 'SET_PERSONAL_DOCUMENT_COUNT'; payload: number }
  | { type: 'SET_VECTOR_STORE_INFO'; payload: { vectorStoreId: string | null; documentCount: number } }
  | { type: 'UPDATE_VECTOR_STORE_STATS'; payload: { documentCount: number; totalSize: number } }
  | { type: 'SET_SELECTED_DOCUMENTS'; payload: string[] }
  | { type: 'ADD_SELECTED_DOCUMENT'; payload: string }
  | { type: 'REMOVE_SELECTED_DOCUMENT'; payload: string }
  | { type: 'CLEAR_SELECTED_DOCUMENTS' }
  | { type: 'START_STREAMING_MESSAGE'; payload: { id: string; content: string; sessionId?: string; knowledgeBase?: KnowledgeBaseType } }
  | { type: 'UPDATE_STREAMING_MESSAGE'; payload: { id: string; token: string } }
  | { type: 'COMPLETE_STREAMING_MESSAGE'; payload: { id: string; sources?: any[] } }
  | { type: 'ERROR_STREAMING_MESSAGE'; payload: { id: string; error: string } };

// Storage interfaces for type safety
interface StoredConversation {
  id: string;
  title: string;
  messages: StoredMessage[];
  createdAt: string;
  updatedAt: string;
  specialty?: 'cardiology' | 'obgyn';
  caseId?: string;
  type?: ConversationType;
  metadata?: {
    messageCount: number;
    lastActivity: string;
  };
}

interface StoredMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  sources?: unknown[];
  attachments?: unknown[];
  imageAnalysis?: string;
}

interface StoredCase {
  id: string;
  userId: string;
  title: string;
  description: string;
  anonymizedInfo: string;
  specialty: 'cardiology' | 'obgyn';
  status: 'active' | 'archived';
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Chat Reducer
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      const updatedConversations = state.activeConversationId
        ? state.conversations.map(conv =>
            conv.id === state.activeConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, action.payload],
                  updatedAt: new Date(),
                  metadata: {
                    ...conv.metadata,
                    messageCount: conv.messages.length + 1,
                    lastActivity: new Date()
                  }
                }
              : conv
          )
        : state.conversations;

      return {
        ...state,
        messages: [...state.messages, action.payload],
        conversations: updatedConversations,
        error: undefined
      };
    
    case 'UPDATE_MESSAGE':
      console.log('📬 UPDATE_MESSAGE reducer triggered:', {
        messageId: action.payload.id,
        hasFactCheckResult: !!action.payload.updates.factCheckResult,
        factCheckStatus: action.payload.updates.factCheckResult?.status
      });

      // Persist fact-check results to Supabase ONLY when complete (not during streaming)
      const updatedMsg = state.messages.find(m => m.id === action.payload.id);
      if (updatedMsg && action.payload.updates.factCheckResult) {
        const factCheckResult = action.payload.updates.factCheckResult;

        // Only persist when fact-check is complete (success or error), not during streaming (loading)
        if (factCheckResult.status === 'success' || factCheckResult.status === 'error') {
          // Get the sessionId from the message metadata (where it was stored when created)
          // This ensures we save to the SAME session as the original message
          const messageSessionId = updatedMsg.metadata?.sessionId || state.currentSessionId;

          console.log('💾 Persisting fact-check result to database:', {
            messageId: action.payload.id,
            sessionId: messageSessionId,
            currentSessionId: state.currentSessionId,
            sessionIdMatch: messageSessionId === state.currentSessionId,
            status: factCheckResult.status,
            hasSourcesInFactCheckResult: !!factCheckResult.sources,
            sourceCount: factCheckResult.sources?.length || 0
          });

          // Call updateFlowiseMessage asynchronously (fire and forget)
          import('../stores/useAppStore').then(({ useAppStore }) => {
            const { updateFlowiseMessage } = useAppStore.getState();
            if (updateFlowiseMessage && messageSessionId) {
              console.log('✅ Calling updateFlowiseMessage with:', {
                sessionId: messageSessionId,
                messageId: action.payload.id,
                hasFactCheckResult: !!action.payload.updates.factCheckResult
              });

              // Pass the complete message data including content
              // This allows updateFlowiseMessage to create the message if it doesn't exist
              const completeUpdates = {
                ...action.payload.updates,
                content: updatedMsg.content, // Include original message content
                sources: updatedMsg.sources, // Include original sources
                attachments: updatedMsg.attachments, // Include original attachments
                metadata: updatedMsg.metadata // Include original metadata
              };

              updateFlowiseMessage(messageSessionId, action.payload.id, completeUpdates);
            } else {
              console.error('❌ Cannot persist fact-check: missing updateFlowiseMessage or sessionId');
            }
          }).catch(error => {
            console.error('❌ Error importing useAppStore:', error);
          });
        }
      }

      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      };
    
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isTyping: false
      };
    
    case 'CLEAR_MESSAGES':
      const newSessionId = uuidv4();
      return {
        ...state,
        messages: [],
        error: undefined,
        currentSessionId: newSessionId // Generate new session ID for fresh chat session
      };
    
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
        error: undefined
      };

    case 'SET_CONVERSATIONS':
      // Setting conversations in state
      return {
        ...state,
        conversations: action.payload
      };

    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [...state.conversations, action.payload]
      };

    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id
            ? { ...conv, ...action.payload.updates }
            : conv
        )
      };

    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        activeConversationId: state.activeConversationId === action.payload ? null : state.activeConversationId,
        messages: state.activeConversationId === action.payload ? [] : state.messages
      };

    case 'SET_ACTIVE_CONVERSATION':
      const activeConv = action.payload
        ? state.conversations.find(conv => conv.id === action.payload)
        : null;

      const activeSessionId = uuidv4();

      return {
        ...state,
        activeConversationId: action.payload,
        // Don't clear messages here - let loadMessagesForConversation handle it
        // This prevents the blank screen issue when switching conversations
        messages: action.payload ? state.messages : [],
        currentSessionId: activeSessionId // Always generate a new session ID for fresh chat session
      };

    case 'SET_LOADING_HISTORY':
      return {
        ...state,
        isLoadingHistory: action.payload
      };

    // Case management actions
    case 'SET_ACTIVE_CASE':
      return {
        ...state,
        caseContext: {
          ...state.caseContext,
          activeCase: action.payload,
          isInCaseDiscussion: !!action.payload
        }
      };

    case 'ADD_CASE':
      return {
        ...state,
        caseContext: {
          ...state.caseContext,
          caseHistory: [...state.caseContext.caseHistory, action.payload]
        }
      };

    case 'UPDATE_CASE':
      const updatedCaseHistory = state.caseContext.caseHistory.map(caseItem =>
        caseItem.id === action.payload.id
          ? { ...caseItem, ...action.payload.updates }
          : caseItem
      );
      
      return {
        ...state,
        caseContext: {
          ...state.caseContext,
          caseHistory: updatedCaseHistory,
          activeCase: state.caseContext.activeCase?.id === action.payload.id
            ? { ...state.caseContext.activeCase, ...action.payload.updates }
            : state.caseContext.activeCase
        }
      };

    case 'DELETE_CASE':
      return {
        ...state,
        caseContext: {
          ...state.caseContext,
          caseHistory: state.caseContext.caseHistory.filter(caseItem => caseItem.id !== action.payload),
          activeCase: state.caseContext.activeCase?.id === action.payload ? null : state.caseContext.activeCase,
          isInCaseDiscussion: state.caseContext.activeCase?.id === action.payload ? false : state.caseContext.isInCaseDiscussion
        }
      };

    case 'SET_CASE_HISTORY':
      return {
        ...state,
        caseContext: {
          ...state.caseContext,
          caseHistory: action.payload
        }
      };

    case 'SET_CASE_DISCUSSION':
      return {
        ...state,
        caseContext: {
          ...state.caseContext,
          isInCaseDiscussion: action.payload
        }
      };
    
    case 'SET_KNOWLEDGE_BASE':
      return {
        ...state,
        selectedKnowledgeBase: action.payload
      };

    case 'SET_PERSONAL_DOCUMENT_COUNT':
      return {
        ...state,
        personalDocumentCount: action.payload
      };
    
    case 'SET_VECTOR_STORE_INFO':
      return {
        ...state,
        vectorStoreInfo: action.payload
      };

    case 'UPDATE_VECTOR_STORE_STATS':
      return {
        ...state,
        vectorStoreStats: action.payload
      };
    
    case 'SET_SELECTED_DOCUMENTS':
      return {
        ...state,
        caseContext: {
          ...state.caseContext,
          selectedDocuments: action.payload
        }
      };
    
    case 'ADD_SELECTED_DOCUMENT':
      return {
        ...state,
        caseContext: {
          ...state.caseContext,
          selectedDocuments: [...state.caseContext.selectedDocuments, action.payload]
        }
      };
    
    case 'REMOVE_SELECTED_DOCUMENT':
      return {
        ...state,
        caseContext: {
          ...state.caseContext,
          selectedDocuments: state.caseContext.selectedDocuments.filter(id => id !== action.payload)
        }
      };
    
    case 'CLEAR_SELECTED_DOCUMENTS':
      return {
        ...state,
        caseContext: {
          ...state.caseContext,
          selectedDocuments: []
        }
      };

    case 'START_STREAMING_MESSAGE':
      // Create a new streaming message with metadata
      const streamingMessage: Message = {
        id: action.payload.id,
        content: action.payload.content,
        type: 'ai',
        timestamp: new Date(),
        isStreaming: true,
        metadata: {
          sessionId: action.payload.sessionId || state.currentSessionId,
          knowledgeBase: action.payload.knowledgeBase
        }
      };

      return {
        ...state,
        messages: [...state.messages, streamingMessage],
        streamingState: {
          isActive: true,
          messageId: action.payload.id,
          content: action.payload.content,
          tokensReceived: 0,
          startTime: Date.now()
        }
      };

    case 'UPDATE_STREAMING_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, content: msg.content + action.payload.token }
            : msg
        ),
        streamingState: {
          ...state.streamingState,
          content: state.streamingState.content + action.payload.token,
          tokensReceived: state.streamingState.tokensReceived + 1
        }
      };

    case 'COMPLETE_STREAMING_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? {
                ...msg,
                isStreaming: false,
                sources: action.payload.sources || msg.sources
              }
            : msg
        ),
        streamingState: {
          isActive: false,
          messageId: null,
          content: '',
          tokensReceived: 0,
          startTime: null
        }
      };

    case 'ERROR_STREAMING_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? {
                ...msg,
                isStreaming: false,
                status: 'error',
                content: msg.content || action.payload.error
              }
            : msg
        ),
        streamingState: {
          isActive: false,
          messageId: null,
          content: '',
          tokensReceived: 0,
          startTime: null
        },
        error: action.payload.error
      };

    default:
      return state;
  }
};

// Context Interface
interface ChatContextType {
  state: ChatState;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setTyping: (isTyping: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | undefined) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
  // New conversation management methods
  createNewConversation: (title?: string, specialty?: 'cardiology' | 'obgyn', caseId?: string, type?: ConversationType) => string;
  setActiveConversation: (conversationId: string | null) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  saveConversationsToStorage: () => void;
  getConversationSummaries: () => Array<{
    id: string;
    title: string;
    lastMessage?: string;
    messageCount: number;
    updatedAt: Date;
    specialty?: 'cardiology' | 'obgyn';
    caseId?: string;
    type: ConversationType;
  }>;
  // Case management methods
  createCase: (caseData: Omit<PatientCase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PatientCase>;
  setActiveCase: (caseItem: PatientCase | null) => void;
  updateCase: (id: string, updates: Partial<PatientCase>) => Promise<void>;
  deleteCase: (caseId: string) => Promise<void>;
  getCaseHistory: () => PatientCase[];
  resetCaseContext: () => void;
  saveCasesToStorage: () => void;
  loadCases: () => Promise<void>;
  // Knowledge base management methods
  setKnowledgeBase: (type: KnowledgeBaseType) => void;
  setPersonalDocumentCount: (count: number) => void;
  // Vector Store management methods
  setVectorStoreInfo: (info: { vectorStoreId: string | null; documentCount: number }) => void;
  updateVectorStoreStats: (stats: { documentCount: number; totalSize: number }) => void;
  clearCachedData: () => boolean;
  // Document selection methods
  setSelectedDocuments: (documentIds: string[]) => void;
  addSelectedDocument: (documentId: string) => void;
  removeSelectedDocument: (documentId: string) => void;
  clearSelectedDocuments: () => void;
  toggleDocumentSelection: (documentId: string) => void;
  selectAllDocuments: () => void;
  // Flowise conversation metadata methods
  saveFlowiseConversationMetadata: (sessionId: string, messageText: string, knowledgeBaseType?: KnowledgeBaseType, specialty?: string, caseId?: string, conversationType?: 'general' | 'case-study') => Promise<void>;
  incrementFlowiseMessageCount: (sessionId: string) => Promise<void>;
  // Streaming methods
  startStreamingMessage: (content?: string, sessionId?: string, knowledgeBase?: KnowledgeBaseType) => string;
  updateStreamingMessage: (id: string, token: string) => void;
  completeStreamingMessage: (id: string, sources?: any[]) => void;
  errorStreamingMessage: (id: string, error: string) => void;
}

// Create Context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Initial State
const initialState: ChatState = {
  messages: [],
  isTyping: false,
  currentSessionId: uuidv4(),
  isLoading: false,
  error: undefined,
  conversations: [],
  activeConversationId: null,
  isLoadingHistory: false,
  caseContext: {
    activeCase: null,
    isInCaseDiscussion: false,
    caseHistory: [],
    selectedDocuments: []
  },
  selectedKnowledgeBase: 'curated',
  personalDocumentCount: 0,
  vectorStoreInfo: { vectorStoreId: null, documentCount: 0 },
  vectorStoreStats: { documentCount: 0, totalSize: 0 },
  streamingState: {
    isActive: false,
    messageId: null,
    content: '',
    tokensReceived: 0,
    startTime: null
  }
};

// Provider Component
interface ChatProviderProps {
  children: ReactNode;
  initialMessages?: Message[];
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ 
  children, 
  initialMessages = [] 
}) => {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    messages: initialMessages
  });

  // Hook to update useAppStore with case history
  const { setCaseHistory } = useAppStore();

  // Use refs to track initialization state without causing re-renders
  const hasLoadedInitialData = useRef(false);
  const isInitializing = useRef(true);
  const isInitializingVectorStore = useRef(false);

  // Vector Store initialization
  const initializeVectorStore = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isInitializingVectorStore.current) {
      return;
    }

    try {
      isInitializingVectorStore.current = true;
      const { hasVectorStore, vectorStore } = await checkUserVectorStore();
      
      if (hasVectorStore && vectorStore) {
        dispatch({ 
          type: 'SET_VECTOR_STORE_INFO', 
          payload: { 
            vectorStoreId: vectorStore.openai_vector_store_id,
            documentCount: vectorStore.document_count || 0
          }
        });

        // Get detailed document stats
        const stats = await getUserDocumentStats();
        dispatch({
          type: 'UPDATE_VECTOR_STORE_STATS',
          payload: {
            documentCount: stats.totalDocuments,
            totalSize: stats.totalSize
          }
        });

        // Update personal document count for knowledge base selection
        dispatch({ type: 'SET_PERSONAL_DOCUMENT_COUNT', payload: stats.totalDocuments });
      } else {
        // No Vector Store yet
        dispatch({ 
          type: 'SET_VECTOR_STORE_INFO', 
          payload: { vectorStoreId: null, documentCount: 0 }
        });
        dispatch({ type: 'SET_PERSONAL_DOCUMENT_COUNT', payload: 0 });
      }
    } catch (error) {
      logger.error('Error initializing Vector Store in ChatContext', error, { component: 'ChatContext', action: 'initializeVectorStore' });
      
      // Handle rate limiting specifically
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        // Don't set error state for rate limiting, just use default values
        dispatch({ 
          type: 'SET_VECTOR_STORE_INFO', 
          payload: { vectorStoreId: null, documentCount: 0 }
        });
        dispatch({ type: 'SET_PERSONAL_DOCUMENT_COUNT', payload: 0 });
      } else {
        // Don't fail completely, just set empty state
        dispatch({ 
          type: 'SET_VECTOR_STORE_INFO', 
          payload: { vectorStoreId: null, documentCount: 0 }
        });
        dispatch({ type: 'SET_PERSONAL_DOCUMENT_COUNT', payload: 0 });
      }
    } finally {
      isInitializingVectorStore.current = false;
    }
  }, []);

  // Initialize Vector Store on mount
  useEffect(() => {
    initializeVectorStore();
  }, [initializeVectorStore]);

  // Memoized function to save conversations to localStorage
  const saveConversationsToStorage = useCallback(() => {
    // Only save if we've finished initialization and have loaded initial data
    if (!isInitializing.current && hasLoadedInitialData.current) {
      try {
        // Filter out conversations with 0 messages before saving
        const conversationsWithMessages = state.conversations.filter(conv => conv.messages.length > 0);
        
        const dataToStore = {
          conversations: conversationsWithMessages,
          lastUpdated: new Date().toISOString(),
          version: '1.1' // Updated version to support conversation types
        };
        localStorage.setItem('medimind-conversations', JSON.stringify(dataToStore));
      } catch (error) {
        logger.error('Failed to save conversations to localStorage', error, { component: 'ChatContext', action: 'saveConversations' });
        
        // If quota exceeded, try to clean up old conversations and retry
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          try {
            
            // Keep only the most recent 5 conversations that have messages
            const sortedConversations = [...state.conversations]
              .filter(conv => conv.messages.length > 0)
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 5);
            
            const cleanedDataToStore = {
              conversations: sortedConversations,
              lastUpdated: new Date().toISOString(),
              version: '1.1'
            };
            
            localStorage.setItem('medimind-conversations', JSON.stringify(cleanedDataToStore));
            
            // Update state to reflect the cleanup
            dispatch({
              type: 'SET_CONVERSATIONS',
              payload: sortedConversations
            });
            
          } catch (retryError) {
            logger.error('Failed to save conversations even after cleanup', retryError, { component: 'ChatContext', action: 'saveConversations' });
            // Clear localStorage completely if still failing
            localStorage.removeItem('medimind-conversations');
          }
        }
      }
    }
  }, [state.conversations]);

  // Load conversations from Supabase database
  const loadConversationsFromDatabase = useCallback(async (): Promise<Conversation[]> => {
    try {
      // Starting database conversation load
      
      // Get current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      // Loading conversations for current user
      
      if (!user) {
        // No authenticated user found
        logger.warn('No authenticated user found for loading conversations', undefined, { component: 'ChatContext', action: 'loadConversationsFromDatabase' });
        return [];
      }

      // Query both openai_threads and flowise_conversations tables for user's conversations
      // Querying conversation tables
      
      // Load OpenAI conversations (personal knowledge base)
      const { data: threads, error: threadsError } = await (supabase as any)
        .from('openai_threads')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      // Load Flowise conversations (curated knowledge base)  
      const { data: flowiseConversations, error: flowiseError } = await (supabase as any)
        .from('flowise_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      // Query results retrieved

      if (threadsError && flowiseError) {
        // Database query errors encountered
        logger.error('Error loading conversations from both tables', { threadsError, flowiseError }, { component: 'ChatContext', action: 'loadConversationsFromDatabase' });
        return [];
      }

      // Convert database threads to Conversation format
      // Converting conversations to unified format
      const conversations: Conversation[] = [];

      // Add OpenAI conversations
      if (threads && threads.length > 0) {
        const openaiConversations = threads.map((thread: any) => ({
          id: thread.conversation_id,
          title: `Personal KB - ${new Date(thread.created_at).toLocaleDateString()}`,
          messages: [], // Messages are loaded separately when needed
          createdAt: new Date(thread.created_at),
          updatedAt: new Date(thread.updated_at),
          type: 'general' as const,
          knowledgeBaseType: 'personal' as const,
          metadata: {
            messageCount: 0,
            lastActivity: new Date(thread.updated_at),
            threadId: thread.thread_id,
            backend: 'openai'
          }
        }));
        conversations.push(...openaiConversations);
      }

      // Add Flowise conversations
      if (flowiseConversations && flowiseConversations.length > 0) {
        const curatedConversations = flowiseConversations
          .map((conv: any) => {
            const conversationType = (conv.conversation_type || 'general') as ConversationType;
            
            return {
              id: conv.session_id,
              title: conv.conversation_title || `Curated KB - ${new Date(conv.created_at).toLocaleDateString()}`,
              messages: [], // Messages are not stored locally for Flowise
              createdAt: new Date(conv.created_at),
              updatedAt: new Date(conv.updated_at),
              type: conversationType,
              knowledgeBaseType: conv.knowledge_base_type || 'curated',
              specialty: conv.specialty,
              caseId: conv.case_id,
              metadata: {
                messageCount: conv.message_count || 0,
                lastActivity: new Date(conv.updated_at),
                sessionId: conv.session_id,
                backend: 'flowise',
                lastMessagePreview: conv.last_message_preview
              }
            };
          });
        conversations.push(...curatedConversations);
      }

      // Sort all conversations by updated date
      conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      // Successfully converted conversations
      logger.info(`Loaded ${conversations.length} conversations from database`, undefined, { component: 'ChatContext', action: 'loadConversationsFromDatabase' });
      return conversations;
    } catch (error) {
      logger.error('Failed to load conversations from database', error, { component: 'ChatContext', action: 'loadConversationsFromDatabase' });
      return [];
    }
  }, []);

  // Memoized function to load conversations (tries database first, then localStorage)
  const loadConversations = useCallback(async (): Promise<void> => {
    // Starting conversation load process
    dispatch({ type: 'SET_LOADING_HISTORY', payload: true });
    
    try {
      // First, try to load from database
      // Attempting database load
      const dbConversations = await loadConversationsFromDatabase();
      
      // Database conversations loaded
      
      if (dbConversations.length > 0) {
        // Setting conversations in state
        dispatch({ type: 'SET_CONVERSATIONS', payload: dbConversations });
        
        // Mark that we've loaded initial data
        hasLoadedInitialData.current = true;
        
        // Allow auto-saving after a short delay
        setTimeout(() => {
          isInitializing.current = false;
        }, 100);
        
        // Save to localStorage for offline access
        try {
          const dataToStore = {
            conversations: dbConversations,
            lastUpdated: new Date().toISOString(),
            version: '1.1'
          };
          localStorage.setItem('medimind-conversations', JSON.stringify(dataToStore));
        } catch (storageError) {
          logger.warn('Failed to save conversations to localStorage', storageError, { component: 'ChatContext', action: 'loadConversations' });
        }
        
        return;
      }

      // Fallback to localStorage if no database conversations found
      const stored = localStorage.getItem('medimind-conversations');
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Validate that parsed data has conversations property and it's an array
        if (parsed && Array.isArray(parsed.conversations)) {
          
          // Check if migration is needed (version < 1.1 or no version)
          const needsMigration = !parsed.version || parsed.version === '1.0';
          
          // Convert date strings back to Date objects and handle migration
          const conversations = parsed.conversations.map((conv: StoredConversation) => {
            const baseConv = {
              ...conv,
              createdAt: new Date(conv.createdAt),
              updatedAt: new Date(conv.updatedAt),
              messages: conv.messages.map((msg: StoredMessage) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              })),
              metadata: conv.metadata ? {
                ...conv.metadata,
                lastActivity: new Date(conv.metadata.lastActivity)
              } : undefined
            };
            
            // Migration: Add type field if missing
            if (needsMigration && !conv.type) {
              // Determine type based on existing data
              if (conv.caseId) {
                baseConv.type = 'case-study';
              } else {
                baseConv.type = 'general';
              }
            }
            
            return baseConv;
          });
          
          dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
          
          // If migration was performed, save the updated data
          if (needsMigration) {
            // Mark that we've loaded initial data so saving is allowed
            hasLoadedInitialData.current = true;
            // Save the migrated data with a slight delay to ensure state is updated
            setTimeout(() => {
              try {
                const dataToStore = {
                  conversations: conversations,
                  lastUpdated: new Date(),
                  version: '1.1'
                };
                localStorage.setItem('medimind-conversations', JSON.stringify(dataToStore));
              } catch (error) {
                logger.error('Failed to save migrated conversations', error, { component: 'ChatContext', action: 'migrateConversations' });
              }
            }, 100);
          }
        } else {
          logger.warn('Invalid conversation data structure in localStorage, clearing...', undefined, { component: 'ChatContext', action: 'loadConversations' });
          localStorage.removeItem('medimind-conversations');
        }
      }
      
      // Mark that we've loaded initial data
      hasLoadedInitialData.current = true;
      
      // Allow auto-saving after a short delay to ensure all initialization is complete
      setTimeout(() => {
        isInitializing.current = false;
      }, 100);
      
    } catch (error) {
      logger.error('Failed to load conversations from localStorage', error, { component: 'ChatContext', action: 'loadConversations' });
      // Clear corrupted data
      localStorage.removeItem('medimind-conversations');
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load conversation history' });
      hasLoadedInitialData.current = true;
      isInitializing.current = false;
    } finally {
      dispatch({ type: 'SET_LOADING_HISTORY', payload: false });
    }
  }, []);

  // Load conversations from localStorage on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Auto-save conversations to localStorage when they change
  // Note: saveConversationsToStorage is intentionally NOT in the dependency array
  // to prevent infinite loops when the callback reference changes
  useEffect(() => {
    // Only trigger save if we have conversations with messages
    // saveConversationsToStorage already filters out empty conversations
    const hasConversationsWithMessages = state.conversations.some(conv => conv.messages.length > 0);
    if (hasConversationsWithMessages) {
      saveConversationsToStorage();
    }
  }, [state.conversations]); // Only react to conversation changes, not callback changes

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const fullMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: fullMessage });
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
  };

  const setTyping = (isTyping: boolean) => {
    dispatch({ type: 'SET_TYPING', payload: isTyping });
  };

  const setLoading = (isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  };

  const setError = (error: string | undefined) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  const setMessages = (messages: Message[]) => {
    dispatch({ type: 'SET_MESSAGES', payload: messages });
  };

  const createNewConversation = (title?: string, specialty?: 'cardiology' | 'obgyn', caseId?: string, type?: ConversationType): string => {
    const conversationId = uuidv4();
    const now = new Date();
    
    // Determine conversation type based on context
    let conversationType: ConversationType;
    if (type) {
      conversationType = type;
    } else if (caseId) {
      conversationType = 'case-study';
    } else {
      conversationType = 'general';
    }
    
    const newConversation: Conversation = {
      id: conversationId,
      title: title || `New Conversation ${now.toLocaleDateString()}`,
      messages: [],
      createdAt: now,
      updatedAt: now,
      specialty,
      caseId,
      type: conversationType,
      metadata: {
        messageCount: 0,
        lastActivity: now
      }
    };

    dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId });
    
    return conversationId;
  };

  const setActiveConversation = (conversationId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId });
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    dispatch({ type: 'UPDATE_CONVERSATION', payload: { id, updates } });
  };

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.error('No authenticated user for conversation deletion');
        return;
      }

      // Delete from database (both Flowise and OpenAI conversations)
      const deletePromises = [
        // Delete Flowise conversation
        supabase
          .from('flowise_conversations')
          .delete()
          .eq('user_id', user.id)
          .eq('session_id', conversationId),
        
        // Delete OpenAI thread
        supabase
          .from('openai_threads')
          .delete()
          .eq('user_id', user.id)
          .eq('conversation_id', conversationId)
      ];

      const results = await Promise.allSettled(deletePromises);
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          logger.error(`Failed to delete from ${index === 0 ? 'flowise_conversations' : 'openai_threads'}:`, result.reason);
        }
      });

      // Remove from local state
      dispatch({ type: 'DELETE_CONVERSATION', payload: conversationId });
      
      // Force clear from localStorage if this is the last conversation
      setTimeout(() => {
        const stored = localStorage.getItem('medimind-conversations');
        if (stored) {
          const parsed = JSON.parse(stored);
          const filtered = parsed.conversations.filter((conv: StoredConversation) => conv.id !== conversationId);
          if (filtered.length === 0) {
            // If no conversations left, clear the storage entirely
            localStorage.removeItem('medimind-conversations');
          } else {
            // Otherwise, save the filtered list
            const dataToStore = {
              conversations: filtered,
              lastUpdated: new Date(),
              version: '1.1'
            };
            localStorage.setItem('medimind-conversations', JSON.stringify(dataToStore));
          }
        }
      }, 200);

      logger.debug('Conversation deleted successfully:', { conversationId });
    } catch (error) {
      logger.error('Error deleting conversation:', error);
    }
  }, []);

  const getConversationSummaries = () => {
    return state.conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      lastMessage: conv.messages.length > 0 
        ? conv.messages[conv.messages.length - 1].content.substring(0, 100) + '...'
        : undefined,
      messageCount: conv.messages.length,
      updatedAt: conv.updatedAt,
      specialty: conv.specialty,
      caseId: conv.caseId,
      type: conv.type || 'general' // Default to 'general' for existing conversations without type
    }));
  };

  // Case management methods
  const createCase = async (caseData: Omit<PatientCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientCase> => {
    const now = new Date();
    const caseId = uuidv4();
    
    try {
      // Get current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found for case creation');
      }

      const newCase: PatientCase = {
        ...caseData,
        id: caseId,
        userId: user.id, // Set the user ID from auth
        createdAt: now,
        updatedAt: now
      };

      // Save to Supabase database
      
      const { data, error } = await (supabase as any)
        .from('patient_cases')
        .insert({
          id: caseId,
          user_id: user.id, // Use the authenticated user ID
          title: caseData.title,
          description: caseData.description,
          anonymized_info: caseData.anonymizedInfo,
          specialty: caseData.specialty,
          status: caseData.status || 'active',
          metadata: caseData.metadata || {}
        })
        .select()
        .single();


      if (error) {
        logger.error('Error saving case to database', error, { component: 'ChatContext', action: 'saveCase' });
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from database insert');
      }

      // Use the data returned from database instead of local newCase
      const savedCase: PatientCase = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        anonymizedInfo: data.anonymized_info,
        specialty: data.specialty,
        status: data.status,
        metadata: data.metadata,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Update local state
      dispatch({ type: 'ADD_CASE', payload: savedCase });
      dispatch({ type: 'SET_ACTIVE_CASE', payload: savedCase });
      
      return savedCase;
    } catch (error) {
      logger.error('Failed to create case', error, { component: 'ChatContext', action: 'createCase' });
      throw error;
    }
  };

  const setActiveCase = (caseItem: PatientCase | null) => {
    dispatch({ type: 'SET_ACTIVE_CASE', payload: caseItem });
  };

  const updateCase = async (id: string, updates: Partial<PatientCase>) => {
    const updatedCase = {
      ...updates,
      updated_at: new Date()
    };
    
    // Debug logging for attachment removal
    if (updatedCase.metadata?.attachments) {
    }
    
    try {
      // Update in Supabase database and return the updated row
      const { data: dbResult, error } = await (supabase as any)
        .from('patient_cases')
        .update(updatedCase)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Map the database result back to PatientCase format for consistent state
      const dbUpdatedCase: PatientCase = {
        id: dbResult.id,
        user_id: dbResult.user_id,
        title: dbResult.title,
        description: dbResult.description,
        anonymized_info: dbResult.anonymized_info,
        specialty: dbResult.specialty,
        status: dbResult.status,
        metadata: dbResult.metadata ? JSON.parse(JSON.stringify(dbResult.metadata)) : {}, // Deep clone to ensure new object reference
        created_at: new Date(dbResult.created_at),
        updated_at: new Date(dbResult.updated_at)
      };
      

      // Update local state with the exact data from database
      
      // Force a completely new object reference by creating a fresh case object
      const freshCaseUpdate = {
        ...dbUpdatedCase,
        // Force new object reference by adding a timestamp
        _lastUpdated: Date.now()
      };
      
      dispatch({ type: 'UPDATE_CASE', payload: { id, updates: freshCaseUpdate } });
      
      return dbUpdatedCase;
    } catch (error) {
      throw error;
    }
  };

  const deleteCase = async (caseId: string): Promise<void> => {
    try {
      // Delete from Supabase database
      const { error } = await (supabase as any)
        .from('patient_cases')
        .delete()
        .eq('id', caseId);

      if (error) {
        logger.error('Error deleting case from database', error, { component: 'ChatContext', action: 'deleteCase' });
        throw error;
      }

      // Update local state immediately
      dispatch({ type: 'DELETE_CASE', payload: caseId });
      
      // Immediately clear localStorage to prevent old data from being restored
      localStorage.removeItem('medimind-cases');
      
    } catch (error) {
      logger.error('Failed to delete case', error, { component: 'ChatContext', action: 'deleteCase' });
      throw error;
    }
  };

  const getCaseHistory = (): PatientCase[] => {
    return state.caseContext.caseHistory;
  };

  const resetCaseContext = () => {
    dispatch({ type: 'SET_ACTIVE_CASE', payload: null });
    dispatch({ type: 'SET_CASE_DISCUSSION', payload: false });
  };

  // Helper function to save/update Flowise conversation metadata
  const saveFlowiseConversationMetadata = useCallback(async (
    sessionId: string,
    messageText: string,
    knowledgeBaseType: KnowledgeBaseType = 'curated',
    specialty?: string,
    caseId?: string,
    conversationType?: 'general' | 'case-study'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create conversation title from first message (truncated)
      const title = messageText.length > 50 
        ? `${messageText.substring(0, 50)}...` 
        : messageText;

      // Determine conversation type from context if not explicitly provided
      const type = conversationType || (caseId ? 'case-study' : 'general');

      // Use upsert to insert or update conversation metadata
      const { error } = await (supabase as any)
        .from('flowise_conversations')
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          conversation_title: title,
          knowledge_base_type: knowledgeBaseType,
          specialty: specialty,
          case_id: caseId,
          conversation_type: type, // Add conversation type to metadata
          message_count: 1, // This will be updated by increment function later
          last_message_preview: messageText.substring(0, 100),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,session_id'
        });

      if (error) {
        logger.error('Failed to save Flowise conversation metadata:', error);
      } else {
        logger.debug('Saved Flowise conversation metadata:', { sessionId, title });
      }
    } catch (error) {
      logger.error('Error saving Flowise conversation metadata:', error);
    }
  }, []);

  // Helper function to increment message count for Flowise conversations
  const incrementFlowiseMessageCount = useCallback(async (sessionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('increment_flowise_message_count', {
        p_user_id: user.id,
        p_session_id: sessionId
      });

      if (error) {
        logger.error('Failed to increment Flowise message count:', error);
      }
    } catch (error) {
      logger.error('Error incrementing Flowise message count:', error);
    }
  }, []);

  // Case storage methods
  const saveCasesToStorage = useCallback(() => {
    if (!isInitializing.current && hasLoadedInitialData.current) {
      try {
        const dataToStore = {
          cases: state.caseContext.caseHistory,
          activeCase: state.caseContext.activeCase,
          lastUpdated: new Date(),
          version: '1.1'
        };
        localStorage.setItem('medimind-cases', JSON.stringify(dataToStore));
      } catch (error) {
        logger.error('Failed to save cases to localStorage', error, { component: 'ChatContext', action: 'saveCases' });
      }
    }
  }, [state.caseContext.caseHistory, state.caseContext.activeCase]);

  const loadCases = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    try {
      // Use the optimized version that batches user auth and case loading
      const { user, cases, error } = await loadUserCasesOptimized({
        useCache: !forceRefresh, // Bypass cache if forceRefresh is true
        cacheTTL: 5 * 60 * 1000 // 5 minutes cache
      });

      if (error) {
        logger.error('Error loading cases from database', error, { component: 'ChatContext', action: 'loadCasesFromDatabase' });
        // Fall back to localStorage if database fails
        await loadCasesFromLocalStorage();
        return;
      }

      if (!user) {
        return;
      }

      // Convert database cases to PatientCase format
      if (cases && cases.length > 0) {
        const formattedCases: PatientCase[] = cases.map((dbCase: any) => ({
          id: dbCase.id,
          user_id: dbCase.user_id,
          title: dbCase.title,
          description: dbCase.description,
          anonymized_info: dbCase.anonymized_info || dbCase.description,
          specialty: dbCase.specialty as 'cardiology' | 'obgyn',
          status: (dbCase.status as 'active' | 'archived') || 'active',
          metadata: dbCase.metadata || {},
          created_at: new Date(dbCase.created_at),
          updated_at: new Date(dbCase.updated_at)
        }));

        dispatch({ type: 'SET_CASE_HISTORY', payload: formattedCases });
        
        // Also update useAppStore with the loaded cases
        setCaseHistory(formattedCases);
        
        // Update localStorage to match database
        saveCasesToStorage();
      } else {
        // No cases in database, try localStorage as fallback
        await loadCasesFromLocalStorage();
      }
    } catch (error) {
      logger.error('Failed to load cases from database', error, { component: 'ChatContext', action: 'loadCasesFromDatabase' });
      // Fall back to localStorage
      await loadCasesFromLocalStorage();
    }
  }, []);

  const loadCasesFromLocalStorage = useCallback(async (): Promise<void> => {
    try {
      const stored = localStorage.getItem('medimind-cases');
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Validate that parsed data has cases property and it's an array
        if (parsed && Array.isArray(parsed.cases)) {
          // Convert date strings back to Date objects
          const cases = parsed.cases.map((caseItem: StoredCase) => ({
            ...caseItem,
            createdAt: new Date(caseItem.createdAt),
            updatedAt: new Date(caseItem.updatedAt)
          }));
          
          dispatch({ type: 'SET_CASE_HISTORY', payload: cases });
          
          // Also update useAppStore with the loaded cases
          setCaseHistory(cases);
        } else {
          logger.warn('Invalid case data structure in localStorage, clearing...', undefined, { component: 'ChatContext', action: 'loadCases' });
          localStorage.removeItem('medimind-cases');
        }
      }
    } catch (error) {
      logger.error('Failed to load cases from localStorage', error, { component: 'ChatContext', action: 'loadCases' });
      // Clear corrupted data
      localStorage.removeItem('medimind-cases');
    }
  }, []);

  // Load cases from localStorage on mount
  useEffect(() => {
    loadCases();
  }, [loadCases]);

  // Auto-save cases to localStorage when they change
  useEffect(() => {
    if (state.caseContext.caseHistory.length > 0 || state.caseContext.activeCase) {
      saveCasesToStorage();
    }
  }, [state.caseContext.caseHistory, state.caseContext.activeCase, saveCasesToStorage]);

  // Add function to clear cached data
  const clearCachedData = useCallback(() => {
    try {
      // Clear conversation localStorage
      localStorage.removeItem('medimind_conversation');
      localStorage.removeItem('medimind_conversation_metadata');

      // Clear any other PPH calculator related cache
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('pph') ||
          key.includes('calculator') ||
          key.includes('obgyn') ||
          key.includes('medimind_')
        )) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Reset chat state
      dispatch({ type: 'CLEAR_MESSAGES' });

      return true;
    } catch (error) {
      logger.error('Error clearing cached data', error, { component: 'ChatContext', action: 'clearCachedData' });
      return false;
    }
  }, []);

  // Streaming methods for real-time AI response rendering
  const startStreamingMessage = useCallback((content: string = '', sessionId?: string, knowledgeBase?: KnowledgeBaseType): string => {
    const messageId = uuidv4();
    dispatch({
      type: 'START_STREAMING_MESSAGE',
      payload: { id: messageId, content, sessionId, knowledgeBase }
    });
    logger.debug('Started streaming message', { messageId, sessionId, knowledgeBase });
    return messageId;
  }, []);

  const updateStreamingMessage = useCallback((id: string, token: string) => {
    dispatch({
      type: 'UPDATE_STREAMING_MESSAGE',
      payload: { id, token }
    });
  }, []);

  const completeStreamingMessage = useCallback((id: string, sources?: any[]) => {
    dispatch({
      type: 'COMPLETE_STREAMING_MESSAGE',
      payload: { id, sources }
    });
    logger.debug('Completed streaming message', { messageId: id, sourceCount: sources?.length || 0 });
  }, []);

  const errorStreamingMessage = useCallback((id: string, error: string) => {
    dispatch({
      type: 'ERROR_STREAMING_MESSAGE',
      payload: { id, error }
    });
    logger.error('Streaming message error', { messageId: id, error });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value: ChatContextType = useMemo(() => ({
    state,
    addMessage,
    updateMessage,
    setTyping,
    setLoading,
    setError,
    clearMessages,
    setMessages,
    createNewConversation,
    setActiveConversation,
    updateConversation,
    deleteConversation,
    loadConversations,
    saveConversationsToStorage,
    getConversationSummaries,
    // Case management methods
    createCase,
    setActiveCase,
    updateCase,
    deleteCase,
    getCaseHistory,
    resetCaseContext,
    saveCasesToStorage,
    loadCases,
    // Knowledge base management methods
    setKnowledgeBase: (type: KnowledgeBaseType) => dispatch({ type: 'SET_KNOWLEDGE_BASE', payload: type }),
    setPersonalDocumentCount: (count: number) => dispatch({ type: 'SET_PERSONAL_DOCUMENT_COUNT', payload: count }),
    // Vector store management methods
    setVectorStoreInfo: (info: { vectorStoreId: string | null; documentCount: number }) => dispatch({ type: 'SET_VECTOR_STORE_INFO', payload: info }),
    updateVectorStoreStats: (stats: { documentCount: number; totalSize: number }) => dispatch({ type: 'UPDATE_VECTOR_STORE_STATS', payload: stats }),
    clearCachedData,
    // Flowise conversation metadata methods
    saveFlowiseConversationMetadata,
    incrementFlowiseMessageCount,
    // Document selection methods
    setSelectedDocuments: (documentIds: string[]) => dispatch({ type: 'SET_SELECTED_DOCUMENTS', payload: documentIds }),
    addSelectedDocument: (documentId: string) => dispatch({ type: 'ADD_SELECTED_DOCUMENT', payload: documentId }),
    removeSelectedDocument: (documentId: string) => dispatch({ type: 'REMOVE_SELECTED_DOCUMENT', payload: documentId }),
    clearSelectedDocuments: () => dispatch({ type: 'CLEAR_SELECTED_DOCUMENTS' }),
    toggleDocumentSelection: (documentId: string) => {
      const isSelected = state.caseContext.selectedDocuments.includes(documentId);
      if (isSelected) {
        dispatch({ type: 'REMOVE_SELECTED_DOCUMENT', payload: documentId });
      } else {
        dispatch({ type: 'ADD_SELECTED_DOCUMENT', payload: documentId });
      }
    },
    selectAllDocuments: () => {
      if (state.caseContext.activeCase?.metadata?.attachments) {
        const allDocumentIds = state.caseContext.activeCase.metadata.attachments.map((_, index) => `attachment-${index}`);
        dispatch({ type: 'SET_SELECTED_DOCUMENTS', payload: allDocumentIds });
      }
    },
    // Streaming methods
    startStreamingMessage,
    updateStreamingMessage,
    completeStreamingMessage,
    errorStreamingMessage
  }), [
    state,
    addMessage,
    updateMessage,
    setTyping,
    setLoading,
    setError,
    clearMessages,
    setMessages,
    createNewConversation,
    setActiveConversation,
    updateConversation,
    deleteConversation,
    loadConversations,
    saveConversationsToStorage,
    getConversationSummaries,
    createCase,
    setActiveCase,
    updateCase,
    deleteCase,
    getCaseHistory,
    resetCaseContext,
    saveCasesToStorage,
    loadCases,
    clearCachedData,
    saveFlowiseConversationMetadata,
    incrementFlowiseMessageCount,
    startStreamingMessage,
    updateStreamingMessage,
    completeStreamingMessage,
    errorStreamingMessage
  ]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook to use Chat Context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Safe hook that returns null if not within a ChatProvider
export const useChatSafe = (): ChatContextType | null => {
  const context = useContext(ChatContext);
  return context || null;
};

export default ChatContext; 