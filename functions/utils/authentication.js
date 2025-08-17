/**
 * Authentication utilities wrapper for JavaScript imports
 * Re-exports from auth.ts for compatibility
 */

// Import TypeScript utilities
import { 
  extractUser, 
  requireRole, 
  requireAnyRole, 
  withAuth, 
  withRoleAuth, 
  withAnyRoleAuth,
  verifyJWTSecure,
  decodeJWTSecure
} from './auth.js';

// Simple validation function for basic auth checks
export function validateAuth(token) {
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    return verifyJWTSecure(token);
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
}

// Re-export all authentication utilities
export {
  extractUser,
  requireRole,
  requireAnyRole,
  withAuth,
  withRoleAuth,
  withAnyRoleAuth,
  verifyJWTSecure,
  decodeJWTSecure
};