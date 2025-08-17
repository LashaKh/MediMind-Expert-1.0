/**
 * Debug utility to identify user access issues with case studies
 */

import { supabase } from '../supabase';
import { clearQueryCache, loadUserCasesOptimized } from './queryOptimization';

export interface UserAccessDebugResult {
  currentUser: {
    id: string | null;
    email: string | null;
  };
  casesQueryResult: {
    data: any[] | null;
    error: any;
    count: number;
  };
  cacheCleared: boolean;
  timestamp: string;
}

export async function debugUserAccess(): Promise<UserAccessDebugResult> {
  console.log('🔍 Starting user access debug...');
  
  // Step 1: Clear any cached data
  clearQueryCache();
  console.log('✅ Cache cleared');
  
  // Step 2: Get current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('👤 Current user:', { id: user?.id, email: user?.email, authError });
  
  // Step 3: Query cases with explicit user filter
  const { data: cases, error: casesError, count } = await supabase
    .from('patient_cases')
    .select('*', { count: 'exact' })
    .eq('user_id', user?.id || 'null')
    .order('created_at', { ascending: false });
    
  console.log('📋 Cases query result:', { 
    casesCount: cases?.length || 0, 
    totalCount: count,
    error: casesError,
    firstCase: cases?.[0]
  });
  
  // Step 4: Log detailed case information
  if (cases && cases.length > 0) {
    console.log('📝 Case details:');
    cases.forEach((case_, index) => {
      console.log(`  ${index + 1}. ${case_.title} (user_id: ${case_.user_id})`);
    });
  }
  
  const result: UserAccessDebugResult = {
    currentUser: {
      id: user?.id || null,
      email: user?.email || null
    },
    casesQueryResult: {
      data: cases,
      error: casesError,
      count: cases?.length || 0
    },
    cacheCleared: true,
    timestamp: new Date().toISOString()
  };
  
  console.log('🎯 Debug complete:', result);
  return result;
}

/**
 * Force refresh user session and clear all local data
 */
export async function forceUserSessionRefresh(): Promise<void> {
  console.log('🔄 Force refreshing user session...');
  
  // Clear cache
  clearQueryCache();
  
  // Clear localStorage case data
  try {
    localStorage.removeItem('chatCaseStorage');
    localStorage.removeItem('chat-state');
    localStorage.removeItem('medimind-cases'); // This is the main cases storage!
    console.log('🗑️ Cleared localStorage cache');
  } catch (error) {
    console.warn('Warning: Could not clear localStorage:', error);
  }
  
  // Refresh session
  const { data, error } = await supabase.auth.refreshSession();
  
  if (error) {
    console.error('❌ Session refresh failed:', error);
    throw error;
  }
  
  console.log('✅ Session refreshed:', { 
    user: data.user?.email,
    session: !!data.session 
  });
  
  // Force reload the page to clear all in-memory state
  console.log('🔄 Reloading page to clear all state...');
  window.location.reload();
}

/**
 * Check if RLS is properly enforced by testing with different user contexts
 */
export async function testRLSEnforcement(): Promise<void> {
  console.log('🛡️ Testing RLS enforcement...');
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('❌ No authenticated user for RLS test');
    return;
  }
  
  // Test 1: Query with proper user context (should return user's cases)
  const { data: userCases, error: userError } = await supabase
    .from('patient_cases')
    .select('id, title, user_id')
    .eq('user_id', user.id);
    
  console.log('Test 1 - User cases:', { 
    count: userCases?.length || 0, 
    error: userError,
    cases: userCases 
  });
  
  // Test 2: Query without user filter (should only return user's cases due to RLS)
  const { data: allCases, error: allError } = await supabase
    .from('patient_cases')
    .select('id, title, user_id');
    
  console.log('Test 2 - All cases (RLS filtered):', { 
    count: allCases?.length || 0, 
    error: allError,
    cases: allCases 
  });
  
  // Verify all returned cases belong to the current user
  if (allCases && allCases.length > 0) {
    const wrongUserCases = allCases.filter(case_ => case_.user_id !== user.id);
    if (wrongUserCases.length > 0) {
      console.error('🚨 RLS VIOLATION: Found cases from other users:', wrongUserCases);
    } else {
      console.log('✅ RLS working correctly: All cases belong to current user');
    }
  }
}

/**
 * Force reload case data bypassing all cache
 */
export async function forceReloadCases(): Promise<void> {
  console.log('🔄 Force reloading case data...');
  
  // Clear all caches
  clearQueryCache();
  
  // Clear localStorage cache
  try {
    localStorage.removeItem('medimind-cases'); // Main cases storage
    localStorage.removeItem('chatCaseStorage');
    localStorage.removeItem('chat-state');
    console.log('🗑️ Cleared localStorage cache in forceReloadCases');
  } catch (error) {
    console.warn('Warning: Could not clear localStorage:', error);
  }
  
  // Force reload cases without cache
  const { user, cases, error } = await loadUserCasesOptimized({
    useCache: false
  });
  
  if (error) {
    console.error('❌ Failed to reload cases:', error);
    throw new Error(error);
  }
  
  console.log('✅ Cases reloaded:', { 
    userEmail: user?.email,
    caseCount: cases?.length || 0,
    cases: cases?.map(c => ({ id: c.id, title: c.title, user_id: c.user_id }))
  });
  
  // Trigger a custom event to notify components to refresh
  window.dispatchEvent(new CustomEvent('forceCaseReload', { detail: { cases } }));
}

/**
 * Quick fix: Clear localStorage and reload page
 */
export async function clearLocalStorageAndReload(): Promise<void> {
  console.log('🧹 Clearing localStorage and reloading...');
  
  // Clear all relevant localStorage keys
  try {
    localStorage.removeItem('medimind-cases');
    localStorage.removeItem('chatCaseStorage'); 
    localStorage.removeItem('chat-state');
    console.log('✅ Cleared all localStorage');
  } catch (error) {
    console.warn('Warning: Could not clear localStorage:', error);
  }
  
  // Clear query cache
  clearQueryCache();
  
  // Reload page to start fresh
  window.location.reload();
}

/**
 * Inspect current localStorage state
 */
export function inspectLocalStorage(): void {
  console.log('🔍 Inspecting localStorage...');
  
  // Check medimind-cases specifically
  const casesData = localStorage.getItem('medimind-cases');
  console.log('medimind-cases data:', casesData);
  
  if (casesData) {
    try {
      const parsed = JSON.parse(casesData);
      console.log('Parsed cases data:', parsed);
      if (parsed.cases && Array.isArray(parsed.cases)) {
        console.log('Cases in localStorage:', parsed.cases.map(c => ({ 
          id: c.id, 
          title: c.title, 
          user_id: c.user_id 
        })));
      }
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
    }
  }
  
  // Check all localStorage keys
  console.log('All localStorage keys:', Object.keys(localStorage));
  
  // Check medimind-store specifically  
  const storeData = localStorage.getItem('medimind-store');
  if (storeData) {
    try {
      const parsed = JSON.parse(storeData);
      console.log('medimind-store data:', parsed);
      if (parsed.state && parsed.state.caseHistory) {
        console.log('Cases in medimind-store:', parsed.state.caseHistory.map(c => ({ 
          id: c.id, 
          title: c.title, 
          user_id: c.user_id || 'no user_id'
        })));
      }
    } catch (error) {
      console.error('Error parsing medimind-store:', error);
    }
  }
}

/**
 * Nuclear option: Clear everything and force hard reload
 */
export function nuclearReset(): void {
  console.log('☢️ Nuclear reset: Clearing everything...');
  
  // Clear all localStorage
  localStorage.clear();
  
  // Clear all sessionStorage  
  sessionStorage.clear();
  
  // Clear query cache
  clearQueryCache();
  
  // Force hard reload with no cache
  window.location.href = window.location.href;
}