/**
 * Supabase Client for Netlify Functions
 * Server-side Supabase client with admin privileges
 */

import { createClient } from '@supabase/supabase-js';
import { ENV_VARS } from './constants';

// Create Supabase client with service role key for admin operations
export const supabase = createClient(
  ENV_VARS.SUPABASE_URL,
  ENV_VARS.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default supabase;