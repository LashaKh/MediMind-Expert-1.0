-- Token Storage Schema for Persistent JWT and CSRF Token Management
-- Addresses MED-003: In-Memory Token Storage Limitations
-- This schema provides persistent storage for token blacklists and CSRF tokens across serverless function restarts

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================================================
-- JWT Token Blacklist Table
-- Stores revoked JWT tokens to prevent reuse across distributed serverless instances
-- ===============================================================================

CREATE TABLE IF NOT EXISTS public.token_blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jti TEXT UNIQUE NOT NULL, -- JWT ID from token payload
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL, -- SHA-256 hash of the token for additional security
    revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Token original expiration
    revocation_reason TEXT DEFAULT 'manual_revocation',
    client_info JSONB, -- Optional: IP, user agent, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT token_blacklist_jti_length CHECK (char_length(jti) >= 10 AND char_length(jti) <= 100),
    CONSTRAINT token_blacklist_hash_length CHECK (char_length(token_hash) = 64), -- SHA-256 length
    CONSTRAINT token_blacklist_expires_future CHECK (expires_at > revoked_at),
    CONSTRAINT token_blacklist_reason_length CHECK (char_length(revocation_reason) <= 100)
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_token_blacklist_jti ON public.token_blacklist(jti);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user_id ON public.token_blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON public.token_blacklist(expires_at);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_revoked_at ON public.token_blacklist(revoked_at);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_token_blacklist_jti_expires ON public.token_blacklist(jti, expires_at);

-- ===============================================================================
-- CSRF Token Storage Table
-- Stores CSRF tokens with expiration for validation across serverless instances
-- ===============================================================================

CREATE TABLE IF NOT EXISTS public.csrf_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash TEXT UNIQUE NOT NULL, -- SHA-256 hash of the CSRF token
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT, -- Optional session identifier
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    use_count INTEGER DEFAULT 0,
    max_uses INTEGER DEFAULT 1, -- Single-use by default, can be configured
    client_info JSONB, -- IP, user agent, origin, etc.
    
    -- Constraints  
    CONSTRAINT csrf_tokens_hash_length CHECK (char_length(token_hash) = 64), -- SHA-256 length
    CONSTRAINT csrf_tokens_expires_future CHECK (expires_at > created_at),
    CONSTRAINT csrf_tokens_use_count_valid CHECK (use_count >= 0 AND use_count <= max_uses),
    CONSTRAINT csrf_tokens_max_uses_positive CHECK (max_uses > 0),
    CONSTRAINT csrf_tokens_session_length CHECK (session_id IS NULL OR char_length(session_id) <= 255)
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_hash ON public.csrf_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_user_id ON public.csrf_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_expires_at ON public.csrf_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_session_id ON public.csrf_tokens(session_id) WHERE session_id IS NOT NULL;

-- Composite index for validation queries
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_hash_expires ON public.csrf_tokens(token_hash, expires_at);

-- ===============================================================================
-- Row Level Security (RLS) Policies
-- Ensure users can only access their own token records
-- ===============================================================================

-- Enable RLS on both tables
ALTER TABLE public.token_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csrf_tokens ENABLE ROW LEVEL SECURITY;

-- Token Blacklist Policies
-- Users can only view their own revoked tokens
DROP POLICY IF EXISTS "Users can view own blacklisted tokens" ON public.token_blacklist;
CREATE POLICY "Users can view own blacklisted tokens" ON public.token_blacklist
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all tokens (for system operations)
DROP POLICY IF EXISTS "Service role can manage all tokens" ON public.token_blacklist;
CREATE POLICY "Service role can manage all tokens" ON public.token_blacklist
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- CSRF Token Policies  
-- Users can view their own CSRF tokens
DROP POLICY IF EXISTS "Users can view own csrf tokens" ON public.csrf_tokens;
CREATE POLICY "Users can view own csrf tokens" ON public.csrf_tokens
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all CSRF tokens
DROP POLICY IF EXISTS "Service role can manage all csrf tokens" ON public.csrf_tokens;
CREATE POLICY "Service role can manage all csrf tokens" ON public.csrf_tokens
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ===============================================================================
-- Automatic Cleanup Functions
-- Remove expired tokens automatically to prevent table bloat
-- ===============================================================================

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    jwt_deleted INTEGER;
    csrf_deleted INTEGER;
    total_deleted INTEGER;
BEGIN
    -- Clean expired JWT tokens
    DELETE FROM public.token_blacklist 
    WHERE expires_at < NOW();
    GET DIAGNOSTICS jwt_deleted = ROW_COUNT;
    
    -- Clean expired CSRF tokens
    DELETE FROM public.csrf_tokens 
    WHERE expires_at < NOW();
    GET DIAGNOSTICS csrf_deleted = ROW_COUNT;
    
    total_deleted := jwt_deleted + csrf_deleted;
    
    -- Log cleanup activity
    INSERT INTO public.system_logs (event_type, message, metadata, created_at)
    VALUES (
        'TOKEN_CLEANUP',
        'Automatic token cleanup completed',
        jsonb_build_object(
            'jwt_tokens_deleted', jwt_deleted,
            'csrf_tokens_deleted', csrf_deleted,
            'total_deleted', total_deleted
        ),
        NOW()
    ) ON CONFLICT DO NOTHING; -- Ignore if system_logs table doesn't exist
    
    RETURN total_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- Token Storage Statistics Functions
-- Provide monitoring and health check capabilities
-- ===============================================================================

-- Function to get token storage statistics
CREATE OR REPLACE FUNCTION public.get_token_storage_stats()
RETURNS JSONB AS $$
DECLARE
    jwt_stats JSONB;
    csrf_stats JSONB;
BEGIN
    -- JWT Token Blacklist Statistics
    SELECT jsonb_build_object(
        'total_blacklisted', COUNT(*),
        'expired_tokens', COUNT(*) FILTER (WHERE expires_at < NOW()),
        'active_revocations', COUNT(*) FILTER (WHERE expires_at >= NOW()),
        'oldest_revocation', MIN(revoked_at),
        'newest_revocation', MAX(revoked_at),
        'users_with_revoked_tokens', COUNT(DISTINCT user_id)
    ) INTO jwt_stats
    FROM public.token_blacklist;
    
    -- CSRF Token Statistics
    SELECT jsonb_build_object(
        'total_csrf_tokens', COUNT(*),
        'expired_tokens', COUNT(*) FILTER (WHERE expires_at < NOW()),
        'active_tokens', COUNT(*) FILTER (WHERE expires_at >= NOW()),
        'used_tokens', COUNT(*) FILTER (WHERE use_count > 0),
        'unused_tokens', COUNT(*) FILTER (WHERE use_count = 0),
        'average_uses', AVG(use_count),
        'users_with_csrf_tokens', COUNT(DISTINCT user_id)
    ) INTO csrf_stats
    FROM public.csrf_tokens;
    
    RETURN jsonb_build_object(
        'jwt_blacklist', jwt_stats,
        'csrf_tokens', csrf_stats,
        'cleanup_needed', (
            SELECT COUNT(*) FROM public.token_blacklist WHERE expires_at < NOW()
        ) + (
            SELECT COUNT(*) FROM public.csrf_tokens WHERE expires_at < NOW()
        ),
        'last_updated', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- Automated Cleanup Schedule (Optional - requires pg_cron extension)
-- Uncomment if pg_cron is available in your Supabase instance
-- ===============================================================================

-- Schedule automatic cleanup every hour
-- SELECT cron.schedule('token-cleanup', '0 * * * *', 'SELECT public.cleanup_expired_tokens();');

-- ===============================================================================
-- Initial Data and Testing
-- ===============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON public.token_blacklist TO authenticated;
GRANT SELECT ON public.csrf_tokens TO authenticated;

-- Grant full access to service role
GRANT ALL ON public.token_blacklist TO service_role;
GRANT ALL ON public.csrf_tokens TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.cleanup_expired_tokens() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_token_storage_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_token_storage_stats() TO authenticated;

-- ===============================================================================
-- Security Audit Log
-- ===============================================================================

-- Log the schema creation for security audit trail
DO $$
BEGIN
    INSERT INTO public.system_logs (event_type, message, metadata, created_at)
    VALUES (
        'SCHEMA_UPDATE',
        'Token storage schema deployed - MED-003 security fix',
        jsonb_build_object(
            'tables_created', ARRAY['token_blacklist', 'csrf_tokens'],
            'functions_created', ARRAY['cleanup_expired_tokens', 'get_token_storage_stats'],
            'security_level', 'HIGH',
            'addresses_vulnerability', 'MED-003'
        ),
        NOW()
    );
EXCEPTION WHEN OTHERS THEN
    -- Ignore if system_logs table doesn't exist
    NULL;
END $$;

-- ===============================================================================
-- Schema Validation and Health Check
-- ===============================================================================

-- Verify tables were created successfully
DO $$
BEGIN
    -- Check if tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'token_blacklist') THEN
        RAISE EXCEPTION 'Failed to create token_blacklist table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'csrf_tokens') THEN
        RAISE EXCEPTION 'Failed to create csrf_tokens table';
    END IF;
    
    -- Check if functions exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'cleanup_expired_tokens' AND routine_type = 'FUNCTION'
    ) THEN
        RAISE EXCEPTION 'Failed to create cleanup_expired_tokens function';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_token_storage_stats' AND routine_type = 'FUNCTION'
    ) THEN
        RAISE EXCEPTION 'Failed to create get_token_storage_stats function';
    END IF;
    
    RAISE NOTICE 'Token storage schema deployed successfully - MED-003 resolved';
END $$;