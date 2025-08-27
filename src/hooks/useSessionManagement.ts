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
  createSession: (title?: string) => Promise<GeorgianSession | null>;
  selectSession: (sessionId: string) => void;
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
      () => supabase
        .from('georgian_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
    );

    if (loadError) {
      setError(`Failed to load sessions: ${loadError.message}`);
    } else {
      const formattedSessions: GeorgianSession[] = (data?.data || []).map(session => ({
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

  // Create new session
  const createSession = useCallback(async (title?: string): Promise<GeorgianSession | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    const sessionTitle = title || `Session ${new Date().toLocaleString()}`;
    
    const [data, createError] = await safeAsync(
      () => supabase
        .from('georgian_sessions')
        .insert({
          user_id: user.id,
          title: sessionTitle,
          transcript: '',
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

    const newSession: GeorgianSession = {
      id: data.data.id,
      userId: data.data.user_id,
      title: data.data.title,
      transcript: data.data.transcript || '',
      durationMs: data.data.duration_ms || 0,
      audioFileUrl: data.data.audio_file_url,
      processingResults: data.data.processing_results || [],
      createdAt: data.data.created_at,
      updatedAt: data.data.updated_at,
      isActive: data.data.is_active
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

  // Select session
  const selectSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  }, [sessions]);

  // Update session
  const updateSession = useCallback(async (sessionId: string, updates: Partial<GeorgianSession>): Promise<boolean> => {
    const [data, updateError] = await safeAsync(
      () => supabase
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

    // Update local state
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, ...updates, updatedAt: data.data.updated_at }
        : session
    ));

    // Update current session if it's the one being updated
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, ...updates, updatedAt: data.data.updated_at } : null);
    }

    return true;
  }, [currentSession]);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    const [, deleteError] = await safeAsync(
      () => supabase
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
      setError('Session not found');
      return false;
    }

    // Get existing transcript and append new text
    const existingTranscript = session.transcript || '';
    const separator = existingTranscript ? '\n\n' : '';
    const combinedTranscript = existingTranscript + separator + newText;
    const totalDuration = session.durationMs + duration;

    return await updateSession(sessionId, { 
      transcript: combinedTranscript, 
      durationMs: totalDuration 
    });
  }, [sessions, updateSession]);

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
    searchSessions
  };
};