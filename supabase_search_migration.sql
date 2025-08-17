-- =====================================================
-- MediMind Expert - Search System Database Migration
-- =====================================================
-- This script creates the database schema for the comprehensive search system
-- including monitoring, analytics, and content quality tracking

BEGIN;

-- =====================================================
-- 1. Search History and Analytics Tables
-- =====================================================

-- Store user search history for analytics and personalization
CREATE TABLE IF NOT EXISTS search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    query_hash TEXT NOT NULL, -- For privacy-preserving analytics
    providers_used TEXT[] NOT NULL DEFAULT '{}',
    result_count INTEGER NOT NULL DEFAULT 0,
    search_time_ms INTEGER NOT NULL DEFAULT 0,
    cache_hit BOOLEAN NOT NULL DEFAULT false,
    filters_applied JSONB DEFAULT '{}',
    user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
    clicked_results TEXT[] DEFAULT '{}',
    specialty VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_search_history_user_id (user_id),
    INDEX idx_search_history_created_at (created_at),
    INDEX idx_search_history_specialty (specialty),
    INDEX idx_search_history_query_hash (query_hash)
);

-- Store cached search results for improved performance
CREATE TABLE IF NOT EXISTS search_result_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key TEXT NOT NULL UNIQUE,
    query_hash TEXT NOT NULL,
    results JSONB NOT NULL,
    providers_used TEXT[] NOT NULL DEFAULT '{}',
    search_metadata JSONB DEFAULT '{}',
    access_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Indexes for performance
    INDEX idx_search_cache_key (cache_key),
    INDEX idx_search_cache_expires (expires_at),
    INDEX idx_search_cache_query_hash (query_hash)
);

-- =====================================================
-- 2. Content Quality and Medical Accuracy Tracking
-- =====================================================

-- Track quality metrics for medical content
CREATE TABLE IF NOT EXISTS content_quality_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id TEXT NOT NULL,
    content_url TEXT,
    evidence_level VARCHAR(50) NOT NULL,
    specialty VARCHAR(50) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    citation_accuracy DECIMAL(3,2) CHECK (citation_accuracy >= 0 AND citation_accuracy <= 1),
    medical_accuracy DECIMAL(3,2) CHECK (medical_accuracy >= 0 AND medical_accuracy <= 1),
    user_feedback VARCHAR(20) CHECK (user_feedback IN ('helpful', 'not_helpful', 'incorrect')),
    feedback_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    quality_reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for analytics and quality monitoring
    INDEX idx_content_quality_evidence_level (evidence_level),
    INDEX idx_content_quality_specialty (specialty),
    INDEX idx_content_quality_content_type (content_type),
    INDEX idx_content_quality_created_at (created_at)
);

-- =====================================================
-- 3. API Performance and Error Monitoring
-- =====================================================

-- Track API performance metrics
CREATE TABLE IF NOT EXISTS api_performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    function_name VARCHAR(100) NOT NULL,
    endpoint_path VARCHAR(200),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_type VARCHAR(30) DEFAULT 'standard',
    duration_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_type VARCHAR(100),
    error_message TEXT,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance monitoring
    INDEX idx_api_perf_function_name (function_name),
    INDEX idx_api_perf_created_at (created_at),
    INDEX idx_api_perf_success (success),
    INDEX idx_api_perf_user_type (user_type)
);

-- Track API errors and incidents
CREATE TABLE IF NOT EXISTS api_error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    function_name VARCHAR(100) NOT NULL,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    request_path VARCHAR(200),
    request_method VARCHAR(10),
    request_headers JSONB,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for error tracking and resolution
    INDEX idx_api_errors_function_name (function_name),
    INDEX idx_api_errors_severity (severity),
    INDEX idx_api_errors_resolved (resolved),
    INDEX idx_api_errors_created_at (created_at)
);

-- =====================================================
-- 4. Rate Limiting and Security Monitoring
-- =====================================================

-- Track rate limiting events and potential abuse
CREATE TABLE IF NOT EXISTS rate_limit_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,
    function_name VARCHAR(100) NOT NULL,
    limit_type VARCHAR(50) NOT NULL,
    current_count INTEGER NOT NULL,
    limit_threshold INTEGER NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    blocked BOOLEAN NOT NULL DEFAULT true,
    user_type VARCHAR(30) DEFAULT 'standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for security monitoring
    INDEX idx_rate_limit_user_id (user_id),
    INDEX idx_rate_limit_ip_address (ip_address),
    INDEX idx_rate_limit_created_at (created_at),
    INDEX idx_rate_limit_blocked (blocked)
);

-- Security incidents and suspicious activity
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    request_details JSONB,
    detected_by VARCHAR(100), -- System component that detected the incident
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for security monitoring
    INDEX idx_security_incidents_type (incident_type),
    INDEX idx_security_incidents_severity (severity),
    INDEX idx_security_incidents_status (status),
    INDEX idx_security_incidents_created_at (created_at)
);

-- =====================================================
-- 5. Medical Professional Verification and Compliance
-- =====================================================

-- Track medical professional verification status
CREATE TABLE IF NOT EXISTS medical_professional_verification (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) NOT NULL, -- 'license', 'degree', 'certification'
    license_number VARCHAR(100),
    issuing_authority VARCHAR(200),
    specialty VARCHAR(50),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
    verification_documents TEXT[], -- File paths or IDs
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verification_date TIMESTAMP WITH TIME ZONE,
    expiration_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one primary verification per user
    UNIQUE(user_id, verification_type),
    
    -- Indexes for verification management
    INDEX idx_med_prof_user_id (user_id),
    INDEX idx_med_prof_status (verification_status),
    INDEX idx_med_prof_specialty (specialty),
    INDEX idx_med_prof_expiration (expiration_date)
);

-- =====================================================
-- 6. Compliance and Audit Logging
-- =====================================================

-- Audit log for compliance tracking
CREATE TABLE IF NOT EXISTS compliance_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL, -- 'data_access', 'data_export', 'data_deletion', etc.
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    affected_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For admin actions
    resource_type VARCHAR(50), -- 'search_history', 'user_data', etc.
    resource_id UUID,
    action_performed VARCHAR(100) NOT NULL,
    justification TEXT,
    ip_address INET,
    user_agent TEXT,
    compliance_framework VARCHAR(50), -- 'GDPR', 'HIPAA', 'CCPA', etc.
    retention_period_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for compliance reporting
    INDEX idx_compliance_event_type (event_type),
    INDEX idx_compliance_user_id (user_id),
    INDEX idx_compliance_framework (compliance_framework),
    INDEX idx_compliance_created_at (created_at)
);

-- =====================================================
-- 7. Views for Analytics and Monitoring
-- =====================================================

-- Search analytics view for performance monitoring
CREATE OR REPLACE VIEW search_analytics_summary AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as total_searches,
    AVG(search_time_ms) as avg_search_time_ms,
    AVG(result_count) as avg_result_count,
    COUNT(*) FILTER (WHERE cache_hit = true) as cache_hits,
    COUNT(*) FILTER (WHERE cache_hit = false) as cache_misses,
    ROUND(COUNT(*) FILTER (WHERE cache_hit = true) * 100.0 / COUNT(*), 2) as cache_hit_rate,
    specialty,
    array_agg(DISTINCT unnest(providers_used)) as providers_used
FROM search_history 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), specialty
ORDER BY hour DESC;

-- API performance summary view
CREATE OR REPLACE VIEW api_performance_summary AS
SELECT 
    function_name,
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as total_requests,
    AVG(duration_ms) as avg_duration_ms,
    COUNT(*) FILTER (WHERE success = true) as successful_requests,
    COUNT(*) FILTER (WHERE success = false) as failed_requests,
    ROUND(COUNT(*) FILTER (WHERE success = true) * 100.0 / COUNT(*), 2) as success_rate,
    user_type
FROM api_performance_metrics 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY function_name, DATE_TRUNC('hour', created_at), user_type
ORDER BY hour DESC, function_name;

-- Content quality summary view
CREATE OR REPLACE VIEW content_quality_summary AS
SELECT 
    specialty,
    evidence_level,
    content_type,
    COUNT(*) as total_content_items,
    AVG(citation_accuracy) as avg_citation_accuracy,
    AVG(medical_accuracy) as avg_medical_accuracy,
    AVG((citation_accuracy + medical_accuracy) / 2) as overall_quality_score,
    COUNT(*) FILTER (WHERE user_feedback = 'helpful') as helpful_feedback,
    COUNT(*) FILTER (WHERE user_feedback = 'not_helpful') as not_helpful_feedback,
    COUNT(*) FILTER (WHERE user_feedback = 'incorrect') as incorrect_feedback
FROM content_quality_metrics 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY specialty, evidence_level, content_type
ORDER BY specialty, evidence_level;

-- =====================================================
-- 8. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_result_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_professional_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only access their own search history
CREATE POLICY "Users can view own search history" ON search_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history" ON search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Search cache is accessible by all authenticated users (for performance)
CREATE POLICY "Authenticated users can read search cache" ON search_result_cache
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage search cache" ON search_result_cache
    FOR ALL USING (current_setting('role') = 'service_role');

-- Content quality metrics - users can provide feedback, admins can review
CREATE POLICY "Users can insert content feedback" ON content_quality_metrics
    FOR INSERT WITH CHECK (auth.uid() = feedback_user_id);

CREATE POLICY "Users can view content quality data" ON content_quality_metrics
    FOR SELECT USING (true); -- Public for transparency

CREATE POLICY "Quality reviewers can update metrics" ON content_quality_metrics
    FOR UPDATE USING (auth.uid() = quality_reviewer_id OR current_setting('role') = 'service_role');

-- Performance metrics - service role only
CREATE POLICY "Service role can manage performance metrics" ON api_performance_metrics
    FOR ALL USING (current_setting('role') = 'service_role');

-- Error logs - service role and admins only
CREATE POLICY "Service role can manage error logs" ON api_error_logs
    FOR ALL USING (current_setting('role') = 'service_role');

-- Rate limit events - users can see their own, service role can manage all
CREATE POLICY "Users can view own rate limit events" ON rate_limit_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage rate limit events" ON rate_limit_events
    FOR ALL USING (current_setting('role') = 'service_role');

-- Security incidents - service role only
CREATE POLICY "Service role can manage security incidents" ON security_incidents
    FOR ALL USING (current_setting('role') = 'service_role');

-- Medical verification - users can view/update own, service role can manage all
CREATE POLICY "Users can view own verification" ON medical_professional_verification
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own verification" ON medical_professional_verification
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage verifications" ON medical_professional_verification
    FOR ALL USING (current_setting('role') = 'service_role');

-- Compliance audit log - service role only
CREATE POLICY "Service role can manage compliance logs" ON compliance_audit_log
    FOR ALL USING (current_setting('role') = 'service_role');

-- =====================================================
-- 9. Functions for Data Cleanup and Maintenance
-- =====================================================

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_search_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM search_result_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO compliance_audit_log (
        event_type, action_performed, resource_type, 
        justification, compliance_framework
    ) VALUES (
        'data_cleanup', 'expired_cache_deletion', 'search_result_cache',
        'Automated cleanup of expired search cache entries', 'data_retention'
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old search history (GDPR compliant)
CREATE OR REPLACE FUNCTION cleanup_old_search_history(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM search_history 
    WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO compliance_audit_log (
        event_type, action_performed, resource_type,
        justification, compliance_framework, retention_period_days
    ) VALUES (
        'data_cleanup', 'old_search_history_deletion', 'search_history',
        'Automated cleanup of old search history per retention policy', 'GDPR', retention_days
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. Scheduled Cleanup Jobs (via pg_cron if available)
-- =====================================================

-- Clean up expired cache entries every hour
-- SELECT cron.schedule('cleanup-search-cache', '0 * * * *', 'SELECT cleanup_expired_search_cache();');

-- Clean up old search history daily (keeping 1 year of data)
-- SELECT cron.schedule('cleanup-search-history', '0 2 * * *', 'SELECT cleanup_old_search_history(365);');

-- =====================================================
-- 11. Initial Data and Configuration
-- =====================================================

-- Insert default content quality standards
INSERT INTO content_quality_metrics (
    content_id, evidence_level, specialty, content_type,
    citation_accuracy, medical_accuracy, quality_reviewer_id
) VALUES 
    ('sample-guideline-1', 'clinical_guideline', 'cardiology', 'clinical_guideline', 0.95, 0.98, NULL),
    ('sample-research-1', 'research_paper', 'obgyn', 'research_paper', 0.92, 0.89, NULL),
    ('sample-drug-info-1', 'drug_reference', 'general', 'drug_info', 0.98, 0.96, NULL)
ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================
-- Migration Complete
-- =====================================================

-- Create a record of this migration
INSERT INTO compliance_audit_log (
    event_type, action_performed, resource_type,
    justification, compliance_framework
) VALUES (
    'schema_migration', 'search_system_deployment', 'database_schema',
    'Deployed comprehensive search system with monitoring and compliance features', 'system_deployment'
);

-- Display migration summary
DO $$
BEGIN
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'MediMind Expert Search System Migration Complete';
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'Created tables:';
    RAISE NOTICE '- search_history (user search tracking)';
    RAISE NOTICE '- search_result_cache (performance optimization)';
    RAISE NOTICE '- content_quality_metrics (medical accuracy)';
    RAISE NOTICE '- api_performance_metrics (performance monitoring)';
    RAISE NOTICE '- api_error_logs (error tracking)';
    RAISE NOTICE '- rate_limit_events (security monitoring)';
    RAISE NOTICE '- security_incidents (security tracking)';
    RAISE NOTICE '- medical_professional_verification (compliance)';
    RAISE NOTICE '- compliance_audit_log (audit trail)';
    RAISE NOTICE '';
    RAISE NOTICE 'Created views:';
    RAISE NOTICE '- search_analytics_summary';
    RAISE NOTICE '- api_performance_summary';
    RAISE NOTICE '- content_quality_summary';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS policies enabled for data protection';
    RAISE NOTICE 'Cleanup functions created for data retention';
    RAISE NOTICE '===============================================';
END $$;