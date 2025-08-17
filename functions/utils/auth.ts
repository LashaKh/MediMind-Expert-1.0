import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { getAuthToken, parseRequest } from './request';
import { AuthenticationError, AuthorizationError } from './errors';
import { ENV_VARS } from './constants';
import { 
  verifyJWTSecure, 
  decodeJWTSecure, 
  createSecureJWT, 
  revokeToken,
  isTokenRevoked,
  refreshToken,
  getTokenExpirationInfo,
  UserPayload 
} from './jwt';

// Re-export UserPayload for backward compatibility
export type { UserPayload } from './jwt';

// Decode Supabase JWT token (DEPRECATED - use decodeJWTSecure)
export function decodeSupabaseJWT(token: string): UserPayload | null {
  console.warn('decodeSupabaseJWT is deprecated. Use decodeJWTSecure for secure token handling.');
  return decodeJWTSecure(token);
}

// Verify Supabase JWT token with proper security checks (DEPRECATED - use verifyJWTSecure)
export function verifySupabaseJWT(token: string): UserPayload {
  console.warn('verifySupabaseJWT is deprecated. Use verifyJWTSecure for secure token verification.');
  return verifyJWTSecure(token);
}

// Fetch user profile from Supabase to get specialty information
async function fetchUserProfile(userId: string): Promise<{ specialty?: string; role?: string }> {
  try {
    // Create Supabase client for server-side use
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      ENV_VARS.SUPABASE_URL,
      ENV_VARS.SUPABASE_SERVICE_ROLE_KEY
    );

    // Try multiple possible table names and column formats (same as flowise-auth.js)
    const possibleTables = ['profiles', 'users', 'user_profiles'];
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('medical_specialty, role, specialty')
          .eq('id', userId)
          .single();

        if (!error && data) {
          return {
            specialty: data?.medical_specialty || data?.specialty,
            role: data?.role
          };
        }
      } catch (tableError) {
        console.log(`Table '${tableName}' not accessible, trying next...`);
        continue;
      }
    }

    return {};
  } catch (error) {
    return {};
  }
}

// Extract user from request with profile data
export async function extractUser(event: HandlerEvent): Promise<UserPayload> {
  const { headers } = parseRequest(event);
  const token = getAuthToken(headers);
  
  if (!token) {
    throw new AuthenticationError('Authentication required');
  }

  const user = await verifyJWTSecure(token);
  
  // Fetch additional profile data from database
  const profile = await fetchUserProfile(user.id);
  
  // Merge profile data with JWT data
  return {
    ...user,
    specialty: profile.specialty || user.specialty,
    role: profile.role || user.role
  };
}

// Use secure JWT functions from ./jwt module

// Check if user has required role
export function requireRole(user: UserPayload, requiredRole: string): void {
  if (!user.role || user.role !== requiredRole) {
    throw new AuthorizationError(`Access denied. Required role: ${requiredRole}`);
  }
}

// Check if user has one of the required roles
export function requireAnyRole(user: UserPayload, requiredRoles: string[]): void {
  if (!user.role || !requiredRoles.includes(user.role)) {
    throw new AuthorizationError(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
  }
}

// Authentication middleware wrapper
export function withAuth(
  handler: (event: HandlerEvent, user: UserPayload) => Promise<HandlerResponse>
) {
  return async (event: HandlerEvent): Promise<HandlerResponse> => {
    try {
      const user = await extractUser(event);
      return await handler(event, user);
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error;
      }
      throw new AuthenticationError('Authentication failed');
    }
  };
}

// Role-based authentication middleware
export function withRoleAuth(
  requiredRole: string,
  handler: (event: HandlerEvent, user: UserPayload) => Promise<HandlerResponse>
) {
  return withAuth(async (event: HandlerEvent, user: UserPayload) => {
    requireRole(user, requiredRole);
    return await handler(event, user);
  });
}

// Multiple roles authentication middleware
export function withAnyRoleAuth(
  requiredRoles: string[],
  handler: (event: HandlerEvent, user: UserPayload) => Promise<HandlerResponse>
) {
  return withAuth(async (event: HandlerEvent, user: UserPayload) => {
    requireAnyRole(user, requiredRoles);
    return await handler(event, user);
  });
}

// Use createSecureJWT from ./jwt module

// Enhanced authentication utilities with security features
export { 
  revokeToken, 
  isTokenRevoked, 
  refreshToken, 
  getTokenExpirationInfo,
  createSecureJWT,
  verifyJWTSecure,
  decodeJWTSecure
} from './jwt'; 