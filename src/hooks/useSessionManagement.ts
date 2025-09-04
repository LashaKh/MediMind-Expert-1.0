import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../stores/useAppStore';
import { safeAsync } from '../lib/utils/errorHandling';

export interface GeorgianSession {
  id: string;
  userId: string;
  title: string;
  transcript: string;
  durationMs: number;
  audioFileUrl?: string;
  processingResults?: {
    userInstruction: string;
    aiResponse: string;
    model: string;
    tokensUsed?: number;
    processingTime: number;
    timestamp: number;
  }[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface UseSessionManagementReturn {
  sessions: GeorgianSession[];
  currentSession: GeorgianSession | null;
  loading: boolean;
  error: string | null;
  
  // Session operations
  createSession: (title?: string, initialContent?: string) => Promise<GeorgianSession | null>;
  selectSession: (sessionId: string) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<GeorgianSession>) => Promise<boolean>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  duplicateSession: (sessionId: string) => Promise<GeorgianSession | null>;
  
  // Session content operations
  updateTranscript: (sessionId: string, transcript: string, duration?: number) => Promise<boolean>;
  appendToTranscript: (sessionId: string, newText: string, duration?: number) => Promise<boolean>;
  addProcessingResult: (sessionId: string, result: {
    userInstruction: string;
    aiResponse: string;
    model: string;
    tokensUsed?: number;
    processingTime: number;
  }) => Promise<boolean>;
  
  // Utility functions
  clearError: () => void;
  refreshSessions: () => Promise<void>;
  searchSessions: (query: string) => GeorgianSession[];
  cleanupEmptyTemporarySessions: () => void;
}

export const useSessionManagement = (): UseSessionManagementReturn => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GeorgianSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GeorgianSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sessions from database
  const loadSessions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const [data, loadError] = await safeAsync(
      () => (supabase as any)
        .from('georgian_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
    );

    if (loadError) {
      setError(`Failed to load sessions: ${loadError.message}`);
    } else {
      // Extract sessions array from Supabase response
      const dataArray = (data?.data || []) as any[];
      const formattedSessions: GeorgianSession[] = dataArray
        .filter((session: any) => session !== null && session !== undefined) // Filter out null sessions
        .map((session: any) => ({
          id: session.id,
          userId: session.user_id,
          title: session.title,
          transcript: session.transcript || '',
          durationMs: session.duration_ms || 0,
          audioFileUrl: session.audio_file_url,
          processingResults: session.processing_results || [],
          createdAt: session.created_at,
          updatedAt: session.updated_at,
          isActive: session.is_active
        }));
      
      // Remove duplicates by ID to prevent React key conflicts
      const uniqueSessions = formattedSessions.filter((session, index, arr) => 
        arr.findIndex(s => s.id === session.id) === index
      );

      setSessions(uniqueSessions);
    }

    setLoading(false);
  }, [user]);

  // Create new session - Creates database session immediately (allows empty transcript)
  const createSession = useCallback(async (title?: string, initialContent?: string): Promise<GeorgianSession | null> => {
    console.log('🔍 Creating session - user check:', { hasUser: !!user, userId: user?.id });
    
    if (!user) {
      console.error('❌ User not authenticated');
      setError('User not authenticated');
      return null;
    }

    // Double check authentication state with Supabase
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    console.log('🔒 Authentication check:', { 
      hasSession: !!currentSession,
      sessionUserId: currentSession?.user?.id,
      userMatches: currentSession?.user?.id === user.id,
      accessToken: currentSession?.access_token ? 'Present' : 'Missing'
    });

    if (!currentSession) {
      console.error('❌ No active session found');
      setError('No active session - please refresh and try again');
      return null;
    }

    const sessionTitle = title || `Session ${new Date().toLocaleString()}`;
    console.log('📝 Creating session with:', { title: sessionTitle, userId: user.id });
    
    const [data, createError] = await safeAsync(
      () => supabase
        .from('georgian_sessions')
        .insert({
          user_id: user.id,
          title: sessionTitle,
          transcript: initialContent || '',
          duration_ms: 0,
          processing_results: []
        })
        .select()
        .single()
    );

    if (createError) {
      console.error('❌ Database insert failed:', createError);
      setError(`Failed to create session: ${createError.message}`);
      return null;
    }

    // Handle Supabase response format (sometimes wrapped, sometimes direct)
    console.log('📊 Database response:', { data, hasData: !!data, dataKeys: data ? Object.keys(data) : 'none' });
    
    if (!data) {
      console.error('❌ No data returned from database');
      setError('Failed to create session: Invalid response from database');
      return null;
    }

    // Check if data is wrapped in Supabase response format
    const sessionData = (data as any).data || data;
    console.log('🔍 Raw session data:', sessionData);
    console.log('🔑 Session data keys:', sessionData ? Object.keys(sessionData) : 'none');
    console.log('📋 Key values:', {
      id: sessionData?.id,
      user_id: sessionData?.user_id,
      title: sessionData?.title,
      created_at: sessionData?.created_at
    });
    
    // Validate that we have the expected session data
    if (!sessionData || !sessionData.id) {
      console.error('❌ Invalid session data structure:', sessionData);
      setError('Failed to create session: Invalid session data returned');
      return null;
    }
    
    const newSession: GeorgianSession = {
      id: sessionData.id,
      userId: sessionData.user_id,
      title: sessionData.title,
      transcript: sessionData.transcript || '',
      durationMs: sessionData.duration_ms || 0,
      audioFileUrl: sessionData.audio_file_url,
      processingResults: sessionData.processing_results || [],
      createdAt: sessionData.created_at,
      updatedAt: sessionData.updated_at,
      isActive: sessionData.is_active
    };

    console.log('✨ Mapped newSession:', {
      id: newSession.id,
      userId: newSession.userId,
      title: newSession.title,
      hasId: !!newSession.id
    });

    setSessions(prev => {
      // Prevent duplicate sessions in state
      const existingIndex = prev.findIndex(s => s.id === newSession.id);
      if (existingIndex >= 0) {
        // Replace existing session if found
        const updated = [...prev];
        updated[existingIndex] = newSession;
        return updated;
      }
      return [newSession, ...prev];
    });
    setCurrentSession(newSession);
    return newSession;
  }, [user]);



  // Select session with fresh data loading
  const selectSession = useCallback(async (sessionId: string) => {
    // Safety check for undefined sessionId
    if (!sessionId) {
      console.error('❌ Cannot select session: sessionId is undefined');
      return;
    }

    // First, set the session from existing data for immediate UI feedback
    const existingSession = sessions.find(s => s.id === sessionId);
    if (existingSession) {

      setCurrentSession(existingSession);
    } else {

    }
    
    // For database sessions (not temporary), refresh the session data to ensure it's current
    if (!sessionId.startsWith('temp_') && user) {
      const [data, loadError] = await safeAsync(
        () => (supabase as any)
          .from('georgian_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()
      );

      if (!loadError && data) {
        // Handle Supabase response format
        const sessionData = (data?.data ? data.data : data) as any;

        const freshSession: GeorgianSession = {
          id: sessionData.id,
          userId: sessionData.user_id,
          title: sessionData.title,
          transcript: sessionData.transcript || '',
          durationMs: sessionData.duration_ms || 0,
          audioFileUrl: sessionData.audio_file_url,
          processingResults: sessionData.processing_results || [],
          createdAt: sessionData.created_at,
          updatedAt: sessionData.updated_at,
          isActive: sessionData.is_active
        };

        // Update the sessions array with fresh data
        setSessions(prev => prev.map(s => s.id === sessionId ? freshSession : s));
        // Update current session with fresh data
        setCurrentSession(freshSession);

      } else if (loadError) {

      }
    }
  }, [sessions, user]);

  // Update session
  const updateSession = useCallback(async (sessionId: string, updates: Partial<GeorgianSession>): Promise<boolean> => {
    // Safety check for undefined sessionId
    if (!sessionId) {
      setError('Cannot update session: Session ID is undefined');
      return false;
    }
    
    // Handle temporary sessions (in-memory only)
    if (sessionId.startsWith('temp_')) {
      // Update local state only for temporary sessions
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates, updatedAt: new Date().toISOString() }
          : session
      ));

      // Update current session if it's the one being updated
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
      }

      return true;
    }

    // Handle database sessions
    const [data, updateError] = await safeAsync(
      () => (supabase as any)
        .from('georgian_sessions')
        .update({
          title: updates.title,
          transcript: updates.transcript,
          duration_ms: updates.durationMs,
          audio_file_url: updates.audioFileUrl,
          processing_results: updates.processingResults
        })
        .eq('id', sessionId)
        .select()
        .single()
    );

    if (updateError) {
      setError(`Failed to update session: ${updateError.message}`);
      return false;
    }

    // Ensure data exists (Supabase client returns data directly)
    if (!data) {
      setError('Failed to update session: Invalid response from database');
      return false;
    }

    const sessionData = data as any;
    // Update local state
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, ...updates, updatedAt: sessionData.updated_at }
        : session
    ));

    // Update current session if it's the one being updated
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, ...updates, updatedAt: sessionData.updated_at } : null);
    }

    return true;
  }, [currentSession]);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    const [, deleteError] = await safeAsync(
      () => (supabase as any)
        .from('georgian_sessions')
        .update({ is_active: false })
        .eq('id', sessionId)
    );

    if (deleteError) {
      setError(`Failed to delete session: ${deleteError.message}`);
      return false;
    }

    setSessions(prev => prev.filter(session => session.id !== sessionId));
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }

    return true;
  }, [currentSession]);

  // Duplicate session
  const duplicateSession = useCallback(async (sessionId: string): Promise<GeorgianSession | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    const originalSession = sessions.find(s => s.id === sessionId);
    if (!originalSession) {
      setError('Session not found');
      return null;
    }

    return await createSession(`${originalSession.title} (Copy)`);
  }, [user, sessions, createSession]);

  // Update transcript (replaces existing transcript)
  const updateTranscript = useCallback(async (sessionId: string, transcript: string, duration = 0): Promise<boolean> => {
    return await updateSession(sessionId, { transcript, durationMs: duration });
  }, [updateSession]);

  // Append to transcript (adds new content to existing transcript)
  const appendToTranscript = useCallback(async (sessionId: string, newText: string, duration = 0): Promise<boolean> => {
    // First try to find in sessions array
    let session = sessions.find(s => s.id === sessionId);
    
    // If not found in sessions array, check if it's the current session
    if (!session && currentSession?.id === sessionId) {
      session = currentSession;
      console.log('🔧 Using currentSession for appendToTranscript:', sessionId);
    }
    
    // If still not found, try to fetch directly from database (session might be newly created)
    if (!session && user) {
      console.log('🔍 Session not in local state, fetching from database:', sessionId);
      
      const [dbSession, dbError] = await safeAsync(
        () => (supabase as any)
          .from('georgian_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()
      );

      if (!dbError && dbSession) {
        const sessionData = dbSession?.data ? dbSession.data : dbSession;
        session = {
          id: sessionData.id,
          userId: sessionData.user_id,
          title: sessionData.title,
          transcript: sessionData.transcript || '',
          durationMs: sessionData.duration_ms || 0,
          audioFileUrl: sessionData.audio_file_url,
          processingResults: sessionData.processing_results || [],
          createdAt: sessionData.created_at,
          updatedAt: sessionData.updated_at,
          isActive: sessionData.is_active
        };
        console.log('✅ Found session in database:', sessionId);
      }
    }
    
    if (!session) {
      console.log('❌ Session not found anywhere for appendToTranscript:', sessionId);
      console.log('🔍 Available sessions:', sessions.map(s => s.id));
      console.log('🔍 Current session ID:', currentSession?.id);
      return false;
    }

    // Fetch fresh session data from database to ensure we have the latest transcript
    const [freshData, fetchError] = await safeAsync(
      () => (supabase as any)
        .from('georgian_sessions')
        .select('transcript, duration_ms')
        .eq('id', sessionId)
        .eq('user_id', user?.id)
        .single()
    );

    let existingTranscript = session.transcript || '';
    let currentDuration = session.durationMs || 0;
    
    // Use fresh data if available (handles recent updates)
    if (!fetchError && freshData) {
      const freshSessionData = (freshData?.data ? freshData.data : freshData) as any;
      existingTranscript = freshSessionData.transcript || '';
      currentDuration = freshSessionData.duration_ms || 0;
      console.log('🔄 Using fresh database transcript:', existingTranscript.length, 'chars');
    } else {
      console.log('⚠️ Using cached session transcript:', existingTranscript.length, 'chars');
    }

    // Get existing transcript and append new text
    const separator = existingTranscript ? ' ' : ''; // Use space for continuous flow
    const combinedTranscript = existingTranscript + separator + newText;
    const totalDuration = currentDuration + duration;

    console.log('🔄 Appending to transcript:', {
      sessionId,
      existingLength: existingTranscript.length,
      newTextLength: newText.length,
      combinedLength: combinedTranscript.length
    });

    // Always update the database session directly
    console.log('📝 Updating database session with appended content');
    return await updateSession(sessionId, { 
      transcript: combinedTranscript, 
      durationMs: totalDuration 
    });
  }, [sessions, updateSession, currentSession, user]);

  // Add processing result
  const addProcessingResult = useCallback(async (sessionId: string, result: {
    userInstruction: string;
    aiResponse: string;
    model: string;
    tokensUsed?: number;
    processingTime: number;
  }): Promise<boolean> => {
    // Safety check for undefined sessionId
    if (!sessionId) {
      setError('Cannot add processing result: Session ID is undefined');
      return false;
    }
    
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      setError('Session not found');
      return false;
    }

    const newResult = {
      ...result,
      timestamp: Date.now()
    };

    const updatedResults = [...(session.processingResults || []), newResult];
    
    // Always update the database session directly
    return await updateSession(sessionId, { processingResults: updatedResults });
  }, [sessions, updateSession]);

  // Search sessions
  const searchSessions = useCallback((query: string): GeorgianSession[] => {
    if (!query.trim()) return sessions;
    
    const lowerQuery = query.toLowerCase();
    return sessions.filter(session => 
      session.title.toLowerCase().includes(lowerQuery) ||
      session.transcript.toLowerCase().includes(lowerQuery)
    );
  }, [sessions]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh sessions
  const refreshSessions = useCallback(async () => {
    await loadSessions();
  }, [loadSessions]);

  // No longer needed - all sessions are real database sessions
  const cleanupEmptyTemporarySessions = useCallback(() => {
    // No-op - all sessions are now real database sessions
  }, []);

  // Load sessions on user change
  useEffect(() => {
    if (user) {
      loadSessions();
    } else {
      setSessions([]);
      setCurrentSession(null);
    }
  }, [user, loadSessions]);

  return {
    sessions,
    currentSession,
    loading,
    error,
    
    createSession,
    selectSession,
    updateSession,
    deleteSession,
    duplicateSession,
    
    updateTranscript,
    appendToTranscript,
    addProcessingResult,
    
    clearError,
    refreshSessions,
    searchSessions,
    cleanupEmptyTemporarySessions
  };
};