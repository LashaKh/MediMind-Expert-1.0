import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User, Session, SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import type { Language } from '../types/i18n';
import type { Message, Conversation, PatientCase, KnowledgeBaseType } from '../types/chat';
import type { Profile } from '../contexts/AuthContext';

// ===============================
// MEDICAL SPECIALTY TYPES & HELPERS
// ===============================
export enum MedicalSpecialty {
  CARDIOLOGY = 'cardiology',
  OBGYN = 'obstetrics_gynecology',
}

export const getSpecialtyDisplayName = (specialty: MedicalSpecialty | null): string => {
  switch (specialty) {
    case MedicalSpecialty.CARDIOLOGY:
      return 'Cardiology';
    case MedicalSpecialty.OBGYN:
      return 'Obstetrics & Gynecology';
    default:
      return 'Unknown Specialty';
  }
};

export const getSpecialtyRoute = (specialty: MedicalSpecialty | null): string => {
  switch (specialty) {
    case MedicalSpecialty.CARDIOLOGY:
      return '/workspace/cardiology';
    case MedicalSpecialty.OBGYN:
      return '/workspace/obgyn';
    default:
      return '/';
  }
};

// ===============================
// AUTH STATE SLICE
// ===============================
interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  hasCompletedOnboarding: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setOnboardingComplete: (complete: boolean) => void;
  signInWithPassword: (credentials: SignInWithPasswordCredentials) => Promise<{ user: User | null; session: Session | null }>;
  signUpWithPassword: (credentials: SignUpWithPasswordCredentials) => Promise<{ user: User | null; session: Session | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ===============================
// SPECIALTY STATE SLICE  
// ===============================
interface SpecialtyState {
  specialty: MedicalSpecialty | null;
  specialtyLoading: boolean;
  specialtyError: Error | null;
  isSpecialtyVerified: boolean;
  
  // Actions
  setSpecialty: (specialty: MedicalSpecialty) => void;
  setSpecialtyLoading: (loading: boolean) => void;
  setSpecialtyError: (error: Error | null) => void;
  setIsSpecialtyVerified: (verified: boolean) => void;
  clearSpecialty: () => void;
  refreshSpecialty: () => Promise<void>;
}

// ===============================
// LANGUAGE STATE SLICE
// ===============================
interface LanguageState {
  currentLanguage: Language;
  languageLoading: boolean;
  languageError: string | null;
  
  // Actions
  setLanguage: (language: Language) => Promise<boolean>;
  setLanguageLoading: (loading: boolean) => void;
  setLanguageError: (error: string | null) => void;
}

// ===============================
// CHAT STATE SLICE
// ===============================
interface ChatState {
  // Messages
  messages: Message[];
  isTyping: boolean;
  chatLoading: boolean;
  chatError: string | null;
  
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoadingHistory: boolean;
  
  // Cases
  activeCase: PatientCase | null;
  caseHistory: PatientCase[];
  isCaseDiscussion: boolean;
  caseContextSentForConversation: Record<string, boolean>; // Track which conversations have received case context

  // Knowledge Base
  knowledgeBase: KnowledgeBaseType;
  personalDocumentCount: number;
  vectorStoreInfo: { vectorStoreId: string | null; documentCount: number };
  selectedDocuments: string[];
  
  // Actions - Messages
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setTyping: (typing: boolean) => void;
  setChatLoading: (loading: boolean) => void;
  setChatError: (error: string | undefined) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
  
  // Actions - Conversations
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  setLoadingHistory: (loading: boolean) => void;
  createNewConversation: (title?: string) => string;
  loadConversationsFromDatabase: () => Promise<void>;
  loadMessagesForConversation: (conversationId: string) => Promise<void>;
  saveFlowiseMessage: (sessionId: string, message: Message) => Promise<void>;
  loadFlowiseMessages: (sessionId: string) => Promise<Message[]>;
  getConversationsForCase: (caseId: string) => Promise<Conversation[]>;
  deleteConversationFromCase: (conversationId: string, caseId: string) => Promise<void>;

  // Actions - Cases
  setActiveCase: (case_: PatientCase | null) => void;
  addCase: (case_: PatientCase) => void;
  updateCase: (id: string, updates: Partial<PatientCase>) => void;
  deleteCase: (id: string) => void;
  setCaseHistory: (cases: PatientCase[]) => void;
  setCaseDiscussion: (discussion: boolean) => void;
  createCase: (caseData: Omit<PatientCase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PatientCase>;
  resetCaseContext: () => void;
  markCaseContextSent: (conversationId: string) => void;
  hasCaseContextBeenSent: (conversationId: string) => boolean;
  resetCaseContextTracking: () => void;
  
  // Actions - Knowledge Base
  setKnowledgeBase: (type: KnowledgeBaseType) => void;
  setPersonalDocumentCount: (count: number) => void;
  setVectorStoreInfo: (info: { vectorStoreId: string | null; documentCount: number }) => void;
  setSelectedDocuments: (docs: string[]) => void;
  addSelectedDocument: (docId: string) => void;
  removeSelectedDocument: (docId: string) => void;
  toggleDocumentSelection: (docId: string) => void;
  selectAllDocuments: () => void;
  clearSelectedDocuments: () => void;
}

// ===============================
// TOUR STATE SLICE
// ===============================
type TourType = 'workspace' | 'chat' | 'calculators' | 'knowledge-base' | 'full';

interface TourState {
  isTourOpen: boolean;
  tourType: TourType;
  openTour: (type?: TourType) => void;
  closeTour: () => void;
}

// ===============================
// COMBINED APP STORE
// ===============================
export interface AppStore extends AuthState, SpecialtyState, LanguageState, ChatState, TourState {}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ===============================
        // AUTH STATE INITIAL VALUES
        // ===============================
        session: null,
        user: null,
        profile: null,
        isLoading: true,
        error: null,
        hasCompletedOnboarding: false,
        
        // Auth Actions
        setUser: (user) => set({ user }),
        setSession: (session) => set({ session }),
        setProfile: (profile) => set({ profile }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setOnboardingComplete: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
        
        signInWithPassword: async (credentials) => {
          set({ isLoading: true, error: null });
          try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword(credentials);
            
            if (signInError) {
              throw signInError;
            }
            
            set({ 
              user: data.user ?? null,
              session: data.session ?? null,
              isLoading: false 
            });
            
            return { user: data.user, session: data.session };
          } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error('Error signing in');
            set({ 
              error, 
              user: null, 
              session: null, 
              profile: null,
              isLoading: false 
            });
            throw e;
          }
        },
        
        signUpWithPassword: async (credentials) => {
          set({ isLoading: true, error: null });
          try {
            const { data, error: signUpError } = await supabase.auth.signUp(credentials);
            
            if (signUpError) {
              throw signUpError;
            }

            // Create a basic user profile if signup was successful
            if (data.user && data.user.email) {
              try {
                const { createUserProfile } = await import('../lib/api/user');
                await createUserProfile(data.user.id, data.user.email);
              } catch (profileError) {
                // Log profile creation error but don't fail the signup

              }
            }
            
            set({ 
              user: data.user ?? null,
              session: data.session ?? null,
              isLoading: false 
            });
            
            return { user: data.user, session: data.session };
          } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error('Error signing up');
            set({ 
              error, 
              user: null, 
              session: null, 
              profile: null,
              isLoading: false 
            });
            throw e;
          }
        },
        
        refreshProfile: async () => {
          const { user } = get();
          if (!user) return;
          
          try {
            const { data, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('user_id', user.id)
              .single();
              
            if (profileError) {
              // If profile doesn't exist, create it
              if (profileError.code === 'PGRST116' && user.email) {
                try {
                  const { createUserProfile } = await import('../lib/api/user');
                  await createUserProfile(user.id, user.email);
                  
                  // Try to fetch the profile again after creating it
                  const { data: newData, error: newError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();
                    
                  if (!newError && newData) {
                    set({ profile: newData as Profile });
                    const { refreshSpecialty } = get();
                    await refreshSpecialty();
                    return;
                  }
                } catch (createError) {

                }
              }
              
              // Log the error but don't crash the app if profile table is not accessible

              // If it's a 406 error or table doesn't exist, set profile to null but don't set error
              if (profileError.code === '406' || profileError.code === '42P01') {
                set({ profile: null });
                return;
              }
              
              // For other errors, don't throw but log them
              set({ profile: null });
              return;
            }
            
            set({ profile: data as Profile });
            
            // Automatically refresh specialty when profile is updated
            const { refreshSpecialty } = get();
            await refreshSpecialty();
          } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error('Error fetching profile');

            set({ profile: null }); // Don't set error to prevent UI issues
          }
        },
        
        signOut: async () => {
          set({ isLoading: true });
          try {
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) {
              set({ error: signOutError });
            }
            
            // Reset all state on sign out
            set({
              session: null,
              user: null,
              profile: null,
              specialty: null,
              messages: [],
              conversations: [],
              activeConversationId: null,
              activeCase: null,
              caseHistory: [],
              selectedDocuments: [],
              isLoading: false,
            });
          } catch (error) {

            set({ isLoading: false });
          }
        },
        
        // ===============================
        // SPECIALTY STATE INITIAL VALUES
        // ===============================
        specialty: null,
        specialtyLoading: false,
        specialtyError: null,
        isSpecialtyVerified: false,
        
        // Specialty Actions
        setSpecialty: (specialty) => set({ specialty }),
        setSpecialtyLoading: (specialtyLoading) => set({ specialtyLoading }),
        setSpecialtyError: (specialtyError) => set({ specialtyError }),
        setIsSpecialtyVerified: (isSpecialtyVerified) => set({ isSpecialtyVerified }),
        clearSpecialty: () => set({ 
          specialty: null, 
          isSpecialtyVerified: false, 
          specialtyError: null 
        }),
        refreshSpecialty: async () => {
          const { user, profile } = get();
          if (!user) return;
          
          set({ specialtyLoading: true, specialtyError: null });
          try {
            // If profile exists, sync specialty from it
            if (profile?.medical_specialty) {
              const medicalSpecialty = profile.medical_specialty;
              let mappedSpecialty: MedicalSpecialty | null = null;

              switch (medicalSpecialty) {
                case 'cardiology':
                  mappedSpecialty = MedicalSpecialty.CARDIOLOGY;
                  break;
                case 'obstetrics_gynecology':
                  mappedSpecialty = MedicalSpecialty.OBGYN;
                  break;
                default:
                  set({ 
                    specialtyError: new Error(`Unsupported medical specialty: ${medicalSpecialty}`),
                    specialtyLoading: false
                  });
                  return;
              }

              set({ 
                specialty: mappedSpecialty,
                isSpecialtyVerified: true,
                specialtyLoading: false
              });
            } else {
              // No specialty in profile
              set({ 
                specialty: null,
                isSpecialtyVerified: false,
                specialtyLoading: false
              });
            }
          } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error('Error refreshing specialty');
            set({ specialtyError: error, specialtyLoading: false });
          }
        },
        
        // ===============================
        // LANGUAGE STATE INITIAL VALUES
        // ===============================
        currentLanguage: 'en' as Language, // Force English as default
        languageLoading: false,
        languageError: null,
        
        // Language Actions
        setLanguage: async (newLanguage) => {
          set({ languageLoading: true, languageError: null }); 
          try {
            // Import the changeLanguage function dynamically to avoid circular imports
            const { changeLanguage } = await import('../i18n/i18n');
            const success = await changeLanguage(newLanguage);
            if (success) {
              set({ currentLanguage: newLanguage, languageLoading: false });
              return true;
            } else {
              set({ languageError: 'Failed to change language', languageLoading: false });
              return false;
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Language change failed';
            set({ languageError: errorMessage, languageLoading: false });
            return false;
          }
        },
        setLanguageLoading: (languageLoading) => set({ languageLoading }),
        setLanguageError: (languageError) => set({ languageError }),
        
        // ===============================
        // CHAT STATE INITIAL VALUES
        // ===============================
        // Messages
        messages: [],
        isTyping: false,
        chatLoading: false,
        chatError: null,
        
        // Conversations
        conversations: [],
        activeConversationId: null,
        isLoadingHistory: false,
        
        // Cases
        activeCase: null,
        caseHistory: [],
        isCaseDiscussion: false,
        caseContextSentForConversation: {},

        // Knowledge Base
        knowledgeBase: 'curated',
        personalDocumentCount: 0,
        vectorStoreInfo: { vectorStoreId: null, documentCount: 0 },
        selectedDocuments: [],
        
        // ===============================
        // CHAT ACTIONS - MESSAGES
        // ===============================
        addMessage: (message) => 
          set((state) => ({ messages: [...state.messages, message] })),
        
        updateMessage: (id, updates) =>
          set((state) => ({
            messages: state.messages.map(msg => 
              msg.id === id ? { ...msg, ...updates } : msg
            )
          })),
        
        setTyping: (isTyping) => set({ isTyping }),
        setChatLoading: (chatLoading) => set({ chatLoading }),
        setChatError: (chatError) => set({ chatError }),
        clearMessages: () => set({ messages: [] }),
        setMessages: (messages) => set({ messages }),
        
        // ===============================
        // CHAT ACTIONS - CONVERSATIONS
        // ===============================
        addConversation: (conversation) =>
          set((state) => ({ conversations: [...state.conversations, conversation] })),
        
        updateConversation: (id, updates) =>
          set((state) => ({
            conversations: state.conversations.map(conv =>
              conv.id === id ? { ...conv, ...updates } : conv
            )
          })),
        
        deleteConversation: async (id) => {
          try {
            // Get the current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {

              return;
            }

            // Delete from database (both Flowise and OpenAI conversations)
            const deletePromises = [
              // Delete Flowise conversation
              supabase
                .from('flowise_conversations')
                .delete()
                .eq('user_id', user.id)
                .eq('session_id', id),
              
              // Delete OpenAI thread
              supabase
                .from('openai_threads')
                .delete()
                .eq('user_id', user.id)
                .eq('conversation_id', id)
            ];

            const results = await Promise.allSettled(deletePromises);
            results.forEach((result, index) => {
              if (result.status === 'rejected') {

              }
            });

          } catch (error) {

          }

          // Always update local state even if database deletion fails
          const { activeConversationId } = get();
          const wasActiveConversation = activeConversationId === id;
          
          set((state) => ({
            conversations: state.conversations.filter(conv => conv.id !== id),
            activeConversationId: wasActiveConversation ? null : state.activeConversationId,
            messages: wasActiveConversation ? [] : state.messages
          }));
        },
        
        setActiveConversation: (activeConversationId) => {
          set({ activeConversationId });
          
          // Also load the messages for this conversation
          if (activeConversationId) {
            const { conversations } = get();
            const selectedConversation = conversations.find(conv => conv.id === activeConversationId);
            if (selectedConversation) {

              set({ messages: selectedConversation.messages || [] });
            }
          } else {
            // Clear messages when no conversation is active
            set({ messages: [] });
          }
        },
        setConversations: (conversations) => set({ conversations }),
        setLoadingHistory: (isLoadingHistory) => set({ isLoadingHistory }),
        createNewConversation: (title) => {
          const newId = `conv-${Date.now()}`;
          const newConversation: Conversation = {
            id: newId,
            title: title || 'New Conversation',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            type: 'general' as any
          };
          set((state) => ({
            conversations: [...state.conversations, newConversation]
          }));
          return newId;
        },
        
        loadConversationsFromDatabase: async () => {

          set({ isLoadingHistory: true });
          
          try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {

              set({ isLoadingHistory: false });
              return;
            }

            // Load from BOTH tables in parallel

            const [openaiResult, flowiseResult] = await Promise.allSettled([
              // OpenAI threads (personal knowledge base)
              supabase
                .from('openai_threads')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false }),
              
              // Flowise conversations (curated knowledge base)
              supabase
                .from('flowise_conversations')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })
            ]);

            const conversations: Conversation[] = [];

            // Process OpenAI threads
            if (openaiResult.status === 'fulfilled' && openaiResult.value.data) {
              const threads = openaiResult.value.data;

              threads.forEach((thread: any) => {
                conversations.push({
                  id: thread.conversation_id,
                  title: `OpenAI Chat ${new Date(thread.created_at).toLocaleDateString()}`,
                  messages: [],
                  createdAt: new Date(thread.created_at),
                  updatedAt: new Date(thread.updated_at),
                  type: 'general' as const,
                  metadata: {
                    messageCount: 0, // Will be updated when messages are loaded
                    lastActivity: new Date(thread.updated_at),
                    threadId: thread.thread_id,
                    knowledgeBaseType: 'personal'
                  }
                });
              });
            }

            // Process Flowise conversations
            if (flowiseResult.status === 'fulfilled' && flowiseResult.value.data) {
              const flowiseConversations = flowiseResult.value.data;

              flowiseConversations.forEach((conv: any) => {
                conversations.push({
                  id: conv.session_id,
                  title: conv.conversation_title || `Flowise Chat ${new Date(conv.created_at).toLocaleDateString()}`,
                  messages: [],
                  createdAt: new Date(conv.created_at),
                  updatedAt: new Date(conv.updated_at),
                  type: (conv.conversation_type || 'general') as 'general' | 'case-study',
                  specialty: conv.specialty as 'cardiology' | 'obgyn' | undefined,
                  caseId: conv.case_id,
                  metadata: {
                    messageCount: conv.message_count || 0, // Use the stored message count!
                    lastActivity: new Date(conv.updated_at),
                    knowledgeBaseType: conv.knowledge_base_type || 'curated',
                    lastMessagePreview: conv.last_message_preview
                  }
                });
              });
            }

            // Sort all conversations by updated date
            conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

            set({ conversations, isLoadingHistory: false });
            
          } catch (error) {

            set({ isLoadingHistory: false });
          }
        },
        
        loadMessagesForConversation: async (conversationId: string) => {

          try {
            const { user } = get();
            if (!user) {

              return;
            }

            // First, check if this is an OpenAI thread conversation
            const { data: threadData, error: threadError } = await (supabase as any)
              .from('openai_threads')
              .select('thread_id')
              .eq('conversation_id', conversationId)
              .eq('user_id', user.id)
              .maybeSingle(); // Use maybeSingle instead of single to handle no results

            if (!threadError && threadData) {
              // This is an OpenAI conversation - load messages from OpenAI

              // Call the OpenAI assistant function to get messages
              const { data: response, error: fnError } = await supabase.functions.invoke('openai-assistant', {
                body: {
                  message: '__GET_MESSAGES__', // Special flag to indicate we want to retrieve messages
                  conversationId: conversationId,
                  threadId: threadData.thread_id
                }
              });

              if (fnError || !response) {

                return;
              }

              const data = response.data || response;

              // Update the conversation with the loaded messages
              const messages = data.messages || [];
              set((state) => ({
                conversations: state.conversations.map(conv => 
                  conv.id === conversationId 
                    ? { 
                        ...conv, 
                        messages: messages,
                        metadata: {
                          ...conv.metadata,
                          messageCount: messages.length,
                          lastActivity: messages.length > 0 ? new Date(messages[messages.length - 1].timestamp) : conv.metadata?.lastActivity || new Date()
                        }
                      }
                    : conv
                ),
                // Also update current messages if this is the active conversation
                messages: state.activeConversationId === conversationId ? messages : state.messages
              }));

              return;
            }

            // Check if this is a Flowise conversation
            const { data: flowiseData, error: flowiseError } = await (supabase as any)
              .from('flowise_conversations')
              .select('*')
              .eq('session_id', conversationId)
              .eq('user_id', user.id)
              .maybeSingle(); // Use maybeSingle instead of single to handle no results

            if (!flowiseError && flowiseData) {

              // Load stored Flowise messages for this session
              const { loadFlowiseMessages } = get();
              const flowiseMessages = await loadFlowiseMessages(conversationId);
              
              set((state) => ({
                conversations: state.conversations.map(conv => 
                  conv.id === conversationId 
                    ? { 
                        ...conv, 
                        messages: flowiseMessages, // Load the stored messages
                        metadata: {
                          ...conv.metadata,
                          messageCount: flowiseMessages.length, // Use actual message count
                          lastActivity: flowiseMessages.length > 0 
                            ? new Date(flowiseMessages[flowiseMessages.length - 1].timestamp) 
                            : new Date(flowiseData.updated_at)
                        }
                      }
                    : conv
                ),
                // Load current messages if this is the active conversation
                messages: state.activeConversationId === conversationId ? flowiseMessages : state.messages
              }));

              return;
            }

            // If we get here, neither OpenAI thread nor Flowise conversation was found

          } catch (error) {

          }
        },

        saveFlowiseMessage: async (sessionId: string, message: Message) => {
          try {
            const { user } = get();
            if (!user) {

              return;
            }

            const { error } = await supabase
              .from('flowise_messages')
              .insert({
                user_id: user.id,
                session_id: sessionId,
                message_id: message.id,
                content: message.content,
                message_type: message.type,
                timestamp: message.timestamp,
                metadata: {
                  sources: message.sources || [],
                  attachments: message.attachments || [],
                  metadata: message.metadata || {},
                  factCheckResult: message.factCheckResult || null
                }
              });

            if (error) {

            } else {

            }
          } catch (error) {

          }
        },

        loadFlowiseMessages: async (sessionId: string): Promise<Message[]> => {
          try {
            const { user } = get();
            if (!user) {

              return [];
            }

            const { data, error } = await supabase
              .from('flowise_messages')
              .select('*')
              .eq('user_id', user.id)
              .eq('session_id', sessionId)
              .order('timestamp', { ascending: true });

            if (error) {

              return [];
            }

            const messages: Message[] = (data || []).map((row: any) => {
              const message: any = {
                id: row.message_id,
                content: row.content,
                type: row.message_type,
                timestamp: new Date(row.timestamp),
                sources: row.metadata?.sources || [],
                attachments: row.metadata?.attachments || [],
                metadata: row.metadata?.metadata || {}
              };

              // Restore factCheckResult if it exists, converting timestamp string back to Date
              if (row.metadata?.factCheckResult) {
                message.factCheckResult = {
                  ...row.metadata.factCheckResult,
                  timestamp: new Date(row.metadata.factCheckResult.timestamp)
                };
              }

              return message;
            });

            return messages;

          } catch (error) {

            return [];
          }
        },

        updateFlowiseMessage: async (sessionId: string, messageId: string, updates: Partial<Message>): Promise<void> => {
          try {
            const { user } = get();
            if (!user) {
              console.error('❌ updateFlowiseMessage: No user found');
              return;
            }

            console.log('📝 updateFlowiseMessage called:', {
              sessionId,
              messageId,
              hasFactCheckResult: !!updates.factCheckResult,
              factCheckResultSources: updates.factCheckResult?.sources?.length || 0
            });

            // First, get the current message to merge metadata
            const { data: existingData, error: fetchError } = await supabase
              .from('flowise_messages')
              .select('*')
              .eq('user_id', user.id)
              .eq('session_id', sessionId)
              .eq('message_id', messageId)
              .maybeSingle();

            if (fetchError) {
              console.error('❌ Error fetching existing message:', fetchError);
              return;
            }

            if (!existingData) {
              console.warn('⚠️ No existing message found - creating it first:', { sessionId, messageId });

              // Message doesn't exist - need to create it first
              // This can happen if user was in personal KB mode when message was created
              const { error: insertError } = await supabase
                .from('flowise_messages')
                .insert({
                  user_id: user.id,
                  session_id: sessionId,
                  message_id: messageId,
                  content: updates.content || '',
                  message_type: 'ai', // Fact-check only happens on AI messages
                  timestamp: new Date().toISOString(),
                  metadata: {
                    sources: updates.sources || [],
                    attachments: updates.attachments || [],
                    metadata: updates.metadata || {},
                    factCheckResult: updates.factCheckResult || null
                  }
                });

              if (insertError) {
                console.error('❌ Error creating message:', insertError);
              } else {
                console.log('✅ Message created successfully with fact-check result');
              }
              return;
            }

            console.log('📄 Existing message found:', {
              hasExistingMetadata: !!existingData.metadata,
              hasExistingFactCheck: !!existingData.metadata?.factCheckResult
            });

            // Merge existing metadata with new updates
            const existingMetadata = existingData?.metadata || {};
            const updatedMetadata = {
              ...existingMetadata,
              sources: updates.sources !== undefined ? updates.sources : existingMetadata.sources,
              attachments: updates.attachments !== undefined ? updates.attachments : existingMetadata.attachments,
              metadata: updates.metadata !== undefined ? updates.metadata : existingMetadata.metadata,
              factCheckResult: updates.factCheckResult !== undefined ? updates.factCheckResult : existingMetadata.factCheckResult
            };

            console.log('📦 Updated metadata:', {
              hasFactCheckResult: !!updatedMetadata.factCheckResult,
              factCheckSources: updatedMetadata.factCheckResult?.sources?.length || 0,
              factCheckStatus: updatedMetadata.factCheckResult?.status
            });

            // Update the message in the database
            const { error } = await supabase
              .from('flowise_messages')
              .update({
                content: updates.content !== undefined ? updates.content : undefined,
                metadata: updatedMetadata
              })
              .eq('user_id', user.id)
              .eq('session_id', sessionId)
              .eq('message_id', messageId);

            if (error) {
              console.error('❌ Error updating message in database:', error);
            } else {
              console.log('✅ Message updated successfully in database');
            }
          } catch (error) {
            console.error('❌ Error in updateFlowiseMessage:', error);
          }
        },

        getConversationsForCase: async (caseId: string): Promise<Conversation[]> => {
          try {
            const { user } = get();
            if (!user) {
              return [];
            }

            // Query flowise_conversations table for conversations linked to this case
            const { data, error } = await supabase
              .from('flowise_conversations')
              .select('*')
              .eq('user_id', user.id)
              .eq('case_id', caseId)
              .order('updated_at', { ascending: false });

            if (error) {
              console.error('Error fetching conversations for case:', error);
              return [];
            }

            // Map database rows to Conversation objects and fetch first user message for title
            const conversations: Conversation[] = await Promise.all(
              (data || []).map(async (row: any) => {
                // Fetch the first user message for this conversation
                const { data: firstMessage } = await supabase
                  .from('flowise_messages')
                  .select('content')
                  .eq('session_id', row.session_id)
                  .eq('message_type', 'user')
                  .order('timestamp', { ascending: true })
                  .limit(1)
                  .maybeSingle();

                // Use first user message as title, truncate if too long
                const firstUserMessage = firstMessage?.content || '';
                const title = firstUserMessage
                  ? (firstUserMessage.length > 60
                      ? firstUserMessage.substring(0, 60) + '...'
                      : firstUserMessage)
                  : (row.title || 'Untitled Conversation');

                return {
                  id: row.session_id, // Use session_id for Flowise conversations
                  title: title,
                  messages: [], // Messages are loaded separately when needed
                  createdAt: new Date(row.created_at),
                  updatedAt: new Date(row.updated_at),
                  specialty: row.specialty,
                  caseId: row.case_id,
                  type: 'case-study' as ConversationType,
                  metadata: {
                    messageCount: row.message_count || 0,
                    lastActivity: new Date(row.updated_at)
                  }
                };
              })
            );

            return conversations;

          } catch (error) {
            console.error('Error in getConversationsForCase:', error);
            return [];
          }
        },

        deleteConversationFromCase: async (conversationId: string, caseId: string) => {
          try {
            const { user } = get();
            if (!user) {
              return;
            }

            // Delete the conversation from flowise_conversations table
            const { error: convError } = await supabase
              .from('flowise_conversations')
              .delete()
              .eq('session_id', conversationId)
              .eq('user_id', user.id);

            if (convError) {
              console.error('Error deleting conversation:', convError);
              throw convError;
            }

            // Delete all messages associated with this conversation
            const { error: msgError } = await supabase
              .from('flowise_messages')
              .delete()
              .eq('session_id', conversationId)
              .eq('user_id', user.id);

            if (msgError) {
              console.error('Error deleting conversation messages:', msgError);
              // Continue even if message deletion fails
            }

            // Update local state - remove from conversations list
            set((state) => ({
              conversations: state.conversations.filter(conv => conv.id !== conversationId),
              // Clear active conversation if it was the one deleted
              activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId,
              messages: state.activeConversationId === conversationId ? [] : state.messages
            }));

          } catch (error) {
            console.error('Error in deleteConversationFromCase:', error);
            throw error;
          }
        },

        // ===============================
        // CHAT ACTIONS - CASES
        // ===============================
        setActiveCase: (activeCase) => set({ activeCase }),
        addCase: (case_) =>
          set((state) => ({ caseHistory: [...state.caseHistory, case_] })),
        
        updateCase: (id, updates) =>
          set((state) => ({
            caseHistory: state.caseHistory.map(case_ =>
              case_.id === id ? { ...case_, ...updates } : case_
            ),
            activeCase: state.activeCase?.id === id 
              ? { ...state.activeCase, ...updates } 
              : state.activeCase
          })),
        
        deleteCase: (id) =>
          set((state) => ({
            caseHistory: state.caseHistory.filter(case_ => case_.id !== id),
            activeCase: state.activeCase?.id === id ? null : state.activeCase
          })),
        
        setCaseHistory: (caseHistory) => set({ caseHistory }),
        setCaseDiscussion: (isCaseDiscussion) => set({ isCaseDiscussion }),
        createCase: async (caseData) => {
          // For now, create a case locally without database interaction
          const newCase: PatientCase = {
            id: `case-${Date.now()}`,
            ...caseData,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          set((state) => ({ caseHistory: [...state.caseHistory, newCase] }));
          return newCase;
        },
        resetCaseContext: () => set({ activeCase: null, caseHistory: [], caseContextSentForConversation: {} }),

        // Case context tracking actions
        markCaseContextSent: (conversationId: string) =>
          set((state) => ({
            caseContextSentForConversation: {
              ...state.caseContextSentForConversation,
              [conversationId]: true
            }
          })),

        hasCaseContextBeenSent: (conversationId: string) => {
          const state = get();
          return state.caseContextSentForConversation[conversationId] === true;
        },

        resetCaseContextTracking: () => set({ caseContextSentForConversation: {} }),

        // ===============================
        // CHAT ACTIONS - KNOWLEDGE BASE
        // ===============================
        setKnowledgeBase: (knowledgeBase) => set({ knowledgeBase }),
        setPersonalDocumentCount: (personalDocumentCount) => set({ personalDocumentCount }),
        setVectorStoreInfo: (vectorStoreInfo) => set({ vectorStoreInfo }),
        setSelectedDocuments: (selectedDocuments) => set({ selectedDocuments }),
        addSelectedDocument: (docId) =>
          set((state) => ({
            selectedDocuments: [...state.selectedDocuments, docId]
          })),
        removeSelectedDocument: (docId) =>
          set((state) => ({
            selectedDocuments: state.selectedDocuments.filter(id => id !== docId)
          })),
        toggleDocumentSelection: (docId) =>
          set((state) => ({
            selectedDocuments: state.selectedDocuments.includes(docId)
              ? state.selectedDocuments.filter(id => id !== docId)
              : [...state.selectedDocuments, docId]
          })),
        selectAllDocuments: () => set({ selectedDocuments: get().selectedDocuments }),
        clearSelectedDocuments: () => set({ selectedDocuments: [] }),

        // ===============================
        // TOUR STATE INITIAL VALUES & ACTIONS
        // ===============================
        isTourOpen: false,
        tourType: 'workspace',
        openTour: (type = 'workspace') => set({ isTourOpen: true, tourType: type }),
        closeTour: () => set({ isTourOpen: false }),
      }),
      {
        name: 'medimind-store', // Name for localStorage
        partialize: (state) => ({
          // Only persist certain parts of the state
          hasCompletedOnboarding: state.hasCompletedOnboarding,
          specialty: state.specialty,
          currentLanguage: state.currentLanguage,
          conversations: state.conversations,
          caseHistory: state.caseHistory,
          knowledgeBase: state.knowledgeBase,
          selectedDocuments: state.selectedDocuments,
          // Note: We don't persist session, user, profile as they're managed by Supabase auth
        }),
      }
    )
  )
);

// ===============================
// CONVENIENT SELECTOR HOOKS
// ===============================

// Auth selectors
export const useAuth = () => useAppStore((state) => ({
  session: state.session,
  user: state.user,
  profile: state.profile,
  isLoading: state.isLoading,
  error: state.error,
  hasCompletedOnboarding: state.hasCompletedOnboarding,
  setUser: state.setUser,
  setSession: state.setSession,
  setProfile: state.setProfile,
  setLoading: state.setLoading,
  setError: state.setError,
  setOnboardingComplete: state.setOnboardingComplete,
  signInWithPassword: state.signInWithPassword,
  signUpWithPassword: state.signUpWithPassword,
  signOut: state.signOut,
  refreshProfile: state.refreshProfile,
}));

// Specialty selectors
export const useSpecialty = () => useAppStore((state) => ({
  specialty: state.specialty,
  isLoading: state.specialtyLoading,
  error: state.specialtyError,
  isSpecialtyVerified: state.isSpecialtyVerified,
  setSpecialty: state.setSpecialty,
  setSpecialtyLoading: state.setSpecialtyLoading,
  setSpecialtyError: state.setSpecialtyError,
  setIsSpecialtyVerified: state.setIsSpecialtyVerified,
  clearSpecialty: state.clearSpecialty,
  refreshSpecialty: state.refreshSpecialty,
}));

// Language selectors
export const useLanguage = () => useAppStore((state) => ({
  currentLanguage: state.currentLanguage,
  isLoading: state.languageLoading,
  error: state.languageError,
  setLanguage: state.setLanguage,
  setLanguageLoading: state.setLanguageLoading,
  setLanguageError: state.setLanguageError,
}));

// Chat selectors
export const useChat = () => useAppStore((state) => ({
  // Messages
  messages: state.messages,
  isTyping: state.isTyping,
  isLoading: state.chatLoading,
  error: state.chatError,
  addMessage: state.addMessage,
  updateMessage: state.updateMessage,
  setTyping: state.setTyping,
  setChatLoading: state.setChatLoading,
  setChatError: state.setChatError,
  clearMessages: state.clearMessages,
  setMessages: state.setMessages,
  
  // Conversations
  conversations: state.conversations,
  activeConversationId: state.activeConversationId,
  isLoadingHistory: state.isLoadingHistory,
  addConversation: state.addConversation,
  updateConversation: state.updateConversation,
  deleteConversation: state.deleteConversation,
  setActiveConversation: state.setActiveConversation,
  setConversations: state.setConversations,
  setLoadingHistory: state.setLoadingHistory,
  createNewConversation: state.createNewConversation,
  loadConversationsFromDatabase: state.loadConversationsFromDatabase,
  loadMessagesForConversation: state.loadMessagesForConversation,
  saveFlowiseMessage: state.saveFlowiseMessage,
  loadFlowiseMessages: state.loadFlowiseMessages,
  getConversationsForCase: state.getConversationsForCase,
  deleteConversationFromCase: state.deleteConversationFromCase,

  // Cases
  activeCase: state.activeCase,
  caseHistory: state.caseHistory,
  isCaseDiscussion: state.isCaseDiscussion,
  setActiveCase: state.setActiveCase,
  addCase: state.addCase,
  updateCase: state.updateCase,
  deleteCase: state.deleteCase,
  setCaseHistory: state.setCaseHistory,
  setCaseDiscussion: state.setCaseDiscussion,
  createCase: state.createCase,
  resetCaseContext: state.resetCaseContext,
  
  // Knowledge Base
  knowledgeBase: state.knowledgeBase,
  personalDocumentCount: state.personalDocumentCount,
  vectorStoreInfo: state.vectorStoreInfo,
  selectedDocuments: state.selectedDocuments,
  setKnowledgeBase: state.setKnowledgeBase,
  setPersonalDocumentCount: state.setPersonalDocumentCount,
  setVectorStoreInfo: state.setVectorStoreInfo,
  setSelectedDocuments: state.setSelectedDocuments,
  addSelectedDocument: state.addSelectedDocument,
  removeSelectedDocument: state.removeSelectedDocument,
  toggleDocumentSelection: state.toggleDocumentSelection,
  selectAllDocuments: state.selectAllDocuments,
  clearSelectedDocuments: state.clearSelectedDocuments,
})); 

// Tour selectors
export const useTour = () => useAppStore((state) => ({
  isTourOpen: state.isTourOpen,
  tourType: state.tourType,
  openTour: state.openTour,
  closeTour: state.closeTour,
}));