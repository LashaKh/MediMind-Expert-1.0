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
  isTemporary?: boolean; // For sessions not yet saved to DB
}

interface UseSessionManagementReturn {
  sessions: GeorgianSession[];
  currentSession: GeorgianSession | null;
  loading: boolean;
  error: string | null;
  
  // Session operations
  createSession: (title?: string, initialContent?: string) => Promise<GeorgianSession | null>;
  createTemporarySession: (title?: string) => GeorgianSession;
  saveTemporarySession: (session: GeorgianSession) => Promise<GeorgianSession | null>;
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
      const formattedSessions: GeorgianSession[] = (data?.data || [])
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

  // Create new session - ONLY creates when there's actual content
  const createSession = useCallback(async (title?: string, initialContent?: string): Promise<GeorgianSession | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    const sessionTitle = title || `Session ${new Date().toLocaleString()}`;
    
    const [data, createError] = await safeAsync(
      () => (supabase as any)
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
      setError(`Failed to create session: ${createError.message}`);
      return null;
    }

    // Ensure data and data.data exist before accessing properties
    if (!data || !(data as any)?.data) {
      setError('Failed to create session: Invalid response from database');
      return null;
    }

    const sessionData = (data as any).data;
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

  // Create temporary session (in-memory only, not saved to DB)
  const createTemporarySession = useCallback((title?: string): GeorgianSession => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const sessionTitle = title || `New Recording`;
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tempSession: GeorgianSession = {
      id: tempId,
      userId: user.id,
      title: sessionTitle,
      transcript: '',
      durationMs: 0,
      audioFileUrl: undefined,
      processingResults: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      isTemporary: true
    };

    setSessions(prev => [tempSession, ...prev]);
    setCurrentSession(tempSession);
    return tempSession;
  }, [user]);

  // Save temporary session to database (only if it has content)
  const saveTemporarySession = useCallback(async (session: GeorgianSession): Promise<GeorgianSession | null> => {
    if (!session.isTemporary) {
      console.warn('Attempting to save non-temporary session');
      return session;
    }

    // Only save if session has actual content
    if (!session.transcript || session.transcript.trim() === '') {
      console.log('Skipping save of empty temporary session');
      return null;
    }

    if (!user) {
      setError('User not authenticated');
      return null;
    }
    
    const [data, createError] = await safeAsync(
      () => supabase
        .from('georgian_sessions')
        .insert({
          user_id: user.id,
          title: session.title,
          transcript: session.transcript,
          duration_ms: session.durationMs,
          processing_results: session.processingResults || []
        })
        .select()
        .single()
    );

    if (createError) {
      setError(`Failed to save session: ${createError.message}`);
      return null;
    }

    const savedSession: GeorgianSession = {
      id: data.data.id,
      userId: data.data.user_id,
      title: data.data.title,
      transcript: data.data.transcript || '',
      durationMs: data.data.duration_ms || 0,
      audioFileUrl: data.data.audio_file_url,
      processingResults: data.data.processing_results || [],
      createdAt: data.data.created_at,
      updatedAt: data.data.updated_at,
      isActive: data.data.is_active,
      isTemporary: false
    };

    // Replace temporary session with saved session
    setSessions(prev => prev.map(s => s.id === session.id ? savedSession : s));
    setCurrentSession(savedSession);
    return savedSession;
  }, [user]);

  // Select session with fresh data loading
  const selectSession = useCallback(async (sessionId: string) => {
    // First, set the session from existing data for immediate UI feedback
    const existingSession = sessions.find(s => s.id === sessionId);
    if (existingSession) {
      setCurrentSession(existingSession);
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

      if (!loadError && data?.data) {
        const sessionData = data.data;
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
      }
    }
  }, [sessions, user]);

  // Update session
  const updateSession = useCallback(async (sessionId: string, updates: Partial<GeorgianSession>): Promise<boolean> => {
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

    // Ensure data and data.data exist before accessing properties
    if (!data || !(data as any)?.data) {
      setError('Failed to update session: Invalid response from database');
      return false;
    }

    const sessionData = (data as any).data;
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
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      // Silent failure - don't show UI error for background transcript updates during recording
      console.warn(`📝 Session ${sessionId} not found for transcript append, skipping silently`);
      return false;
    }

    // Get existing transcript and append new text
    const existingTranscript = session.transcript || '';
    const separator = existingTranscript ? '\n\n' : '';
    const combinedTranscript = existingTranscript + separator + newText;
    const totalDuration = session.durationMs + duration;

    // If this is a temporary session, update it in memory and save to DB when it has content
    if (session.isTemporary) {
      const updatedSession = { 
        ...session, 
        transcript: combinedTranscript, 
        durationMs: totalDuration,
        updatedAt: new Date().toISOString()
      };
      
      // Update in memory first
      setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
      setCurrentSession(updatedSession);
      
      // Save to database now that we have content
      if (combinedTranscript.trim()) {
        await saveTemporarySession(updatedSession);
      }
      
      return true;
    }

    return await updateSession(sessionId, { 
      transcript: combinedTranscript, 
      durationMs: totalDuration 
    });
  }, [sessions, updateSession, saveTemporarySession]);

  // Add processing result
  const addProcessingResult = useCallback(async (sessionId: string, result: {
    userInstruction: string;
    aiResponse: string;
    model: string;
    tokensUsed?: number;
    processingTime: number;
  }): Promise<boolean> => {
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
    
    // If this is a temporary session, save it to the database first
    if (session.isTemporary) {
      console.log('💾 Converting temporary session to permanent before saving processing result');
      const updatedTempSession = { ...session, processingResults: updatedResults };
      const savedSession = await saveTemporarySession(updatedTempSession);
      
      if (!savedSession) {
        setError('Failed to save temporary session before adding processing result');
        return false;
      }
      
      console.log('✅ Temporary session converted to permanent successfully');
      return true;
    }
    
    return await updateSession(sessionId, { processingResults: updatedResults });
  }, [sessions, updateSession, saveTemporarySession]);

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

  // Clean up empty temporary sessions
  const cleanupEmptyTemporarySessions = useCallback(() => {
    setSessions(prev => prev.filter(session => {
      // Remove temporary sessions that don't have content
      if (session.isTemporary && (!session.transcript || session.transcript.trim() === '')) {
        console.log('🧹 Cleaning up empty temporary session:', session.id);
        return false;
      }
      return true;
    }));
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
    createTemporarySession,
    saveTemporarySession,
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