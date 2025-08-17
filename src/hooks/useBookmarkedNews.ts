/**
 * useBookmarkedNews Hook
 * Manages bookmarked medical news articles for authenticated users
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth, useSpecialty } from '../stores/useAppStore';
import { safeAsync, ErrorSeverity } from '../lib/utils/errorHandling';
import type { MedicalNewsArticle } from '../types/medicalNews';

interface BookmarkedNewsState {
  bookmarkedArticles: MedicalNewsArticle[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

interface BookmarkedNewsStats {
  totalCount: number;
  cardiology: number;
  obgyn: number;
  general: number;
}

export function useBookmarkedNews() {
  const { user, session } = useAuth();
  const { specialty } = useSpecialty();
  
  // Use ref to track if initial load has been triggered
  const hasInitiallyLoadedRef = useRef(false);
  
  const [state, setState] = useState<BookmarkedNewsState>({
    bookmarkedArticles: [],
    isLoading: false,
    error: null,
    totalCount: 0,
  });

  const [stats, setStats] = useState<BookmarkedNewsStats>({
    totalCount: 0,
    cardiology: 0,
    obgyn: 0,
    general: 0,
  });

  // Hook initialized - removed console.log to prevent infinite loops

  // Load bookmarked news articles
  const loadBookmarkedNews = useCallback(async () => {
    if (!user?.id || !session?.access_token) {
      console.log('🔐 [loadBookmarkedNews] No user/session, skipping load');
      return;
    }

    console.log('🔄 [loadBookmarkedNews] Loading bookmarked news');
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const [response, error] = await safeAsync(async () => {
      const res = await fetch('/.netlify/functions/news-interaction', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 [loadBookmarkedNews] API Response Status:', res.status, res.statusText);

      if (!res.ok) {
        throw new Error(`Failed to fetch bookmarked news: ${res.status} ${res.statusText}`);
      }

      const jsonResponse = await res.json();
      console.log('📊 [loadBookmarkedNews] Raw API Response:', jsonResponse);
      
      return jsonResponse.data || jsonResponse;
    }, {
      context: 'fetching bookmarked news articles',
      severity: ErrorSeverity.MEDIUM,
      showToast: true,
    });

    if (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.userMessage || 'Failed to load bookmarked news' 
      }));
    } else {
      // Filter for bookmarked articles only
      const bookmarkedArticles = response.bookmarkedArticles || [];
      
      // Calculate stats
      const newStats: BookmarkedNewsStats = {
        totalCount: bookmarkedArticles.length,
        cardiology: bookmarkedArticles.filter((article: MedicalNewsArticle) => 
          article.specialty === 'cardiology'
        ).length,
        obgyn: bookmarkedArticles.filter((article: MedicalNewsArticle) => 
          article.specialty === 'obgyn'
        ).length,
        general: bookmarkedArticles.filter((article: MedicalNewsArticle) => 
          article.specialty === 'general'
        ).length,
      };

      setState({
        bookmarkedArticles,
        isLoading: false,
        error: null,
        totalCount: bookmarkedArticles.length,
      });

      setStats(newStats);
      console.log('✅ [loadBookmarkedNews] Successfully loaded bookmarked news', newStats);
    }
  }, [user?.id, session?.access_token]);

  // Add bookmark
  const addBookmark = useCallback(async (article: MedicalNewsArticle) => {
    if (!user || !session) {
      console.log('🔐 [addBookmark] No user/session, cannot bookmark');
      return false;
    }

    console.log('➕ [addBookmark] Adding bookmark for article:', article.id);

    const [success, error] = await safeAsync(async () => {
      const res = await fetch('/.netlify/functions/news-interaction', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsId: article.id,
          interactionType: 'bookmark',
          interactionMetadata: {
            action: 'add',
            title: article.title,
            specialty: article.specialty,
            category: article.category,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to bookmark news: ${res.status} ${res.statusText}`);
      }

      return true;
    }, {
      context: 'adding news bookmark',
      severity: ErrorSeverity.MEDIUM,
      showToast: true,
    });

    if (success) {
      // Update local state optimistically
      setState(prev => ({
        ...prev,
        bookmarkedArticles: [...prev.bookmarkedArticles, article],
        totalCount: prev.totalCount + 1,
      }));

      // Update stats
      setStats(prev => ({
        ...prev,
        totalCount: prev.totalCount + 1,
        [article.specialty as keyof typeof prev]: (prev[article.specialty as keyof typeof prev] || 0) + 1,
      }));

      console.log('✅ [addBookmark] Successfully added bookmark');
      return true;
    }

    return false;
  }, [user?.id, session?.access_token]);

  // Remove bookmark
  const removeBookmark = useCallback(async (articleId: string) => {
    if (!user || !session) {
      console.log('🔐 [removeBookmark] No user/session, cannot remove bookmark');
      return false;
    }

    console.log('➖ [removeBookmark] Removing bookmark for article:', articleId);

    const [success, error] = await safeAsync(async () => {
      const res = await fetch('/.netlify/functions/news-interaction', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsId: articleId,
          interactionType: 'bookmark',
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to remove bookmark: ${res.status} ${res.statusText}`);
      }

      return true;
    }, {
      context: 'removing news bookmark',
      severity: ErrorSeverity.MEDIUM,
      showToast: true,
    });

    if (success) {
      // Update local state optimistically
      const removedArticle = state.bookmarkedArticles.find(article => article.id === articleId);
      
      setState(prev => ({
        ...prev,
        bookmarkedArticles: prev.bookmarkedArticles.filter(article => article.id !== articleId),
        totalCount: prev.totalCount - 1,
      }));

      // Update stats
      if (removedArticle) {
        setStats(prev => ({
          ...prev,
          totalCount: prev.totalCount - 1,
          [removedArticle.specialty as keyof typeof prev]: Math.max(0, (prev[removedArticle.specialty as keyof typeof prev] || 0) - 1),
        }));
      }

      console.log('✅ [removeBookmark] Successfully removed bookmark');
      return true;
    }

    return false;
  }, [user?.id, session?.access_token, state.bookmarkedArticles]);

  // Toggle bookmark
  const toggleBookmark = useCallback(async (article: MedicalNewsArticle) => {
    const isBookmarked = state.bookmarkedArticles.some(bookmarked => bookmarked.id === article.id);
    
    if (isBookmarked) {
      return await removeBookmark(article.id);
    } else {
      return await addBookmark(article);
    }
  }, [state.bookmarkedArticles, addBookmark, removeBookmark]);

  // Check if article is bookmarked
  const isArticleBookmarked = useCallback((articleId: string) => {
    return state.bookmarkedArticles.some(article => article.id === articleId);
  }, [state.bookmarkedArticles]);

  // Refresh bookmarked news
  const refreshBookmarkedNews = useCallback(() => {
    loadBookmarkedNews();
  }, [loadBookmarkedNews]);

  // Load bookmarked news on mount and user change
  useEffect(() => {
    // Auto-load effect triggered - removed console.log to prevent infinite loops
    
    if (user?.id && session?.access_token && !hasInitiallyLoadedRef.current) {
      loadBookmarkedNews();
      hasInitiallyLoadedRef.current = true;
    } else if (!user?.id || !session?.access_token) {
      // Clear state when no user
      setState({
        bookmarkedArticles: [],
        isLoading: false,
        error: null,
        totalCount: 0,
      });
      setStats({
        totalCount: 0,
        cardiology: 0,
        obgyn: 0,
        general: 0,
      });
      hasInitiallyLoadedRef.current = false;
    }
  }, [user?.id, session?.access_token]); // Remove function dependency to prevent infinite loops

  return {
    // State
    ...state,
    stats,
    
    // Actions
    loadBookmarkedNews,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isArticleBookmarked,
    refreshBookmarkedNews,
  };
}

export default useBookmarkedNews;