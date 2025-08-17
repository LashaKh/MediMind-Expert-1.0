-- Feature Flags and A/B Testing System
-- Creates tables for feature flag management and A/B testing infrastructure

-- =====================================================
-- 1. FEATURE FLAGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    
    -- Targeting options
    specialty TEXT CHECK (specialty IN ('cardiology', 'obgyn', 'general', 'emergency_medicine', 'internal_medicine', 'surgery')),
    user_segment TEXT CHECK (user_segment IN ('all', 'medical_professional', 'admin', 'new_users', 'returning_users')) DEFAULT 'all',
    
    -- Time-based controls
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Configuration and metadata
    config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Management fields
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT feature_flags_name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
    CONSTRAINT feature_flags_description_length CHECK (char_length(description) >= 10 AND char_length(description) <= 500),
    CONSTRAINT feature_flags_date_range CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

-- =====================================================
-- 2. A/B TESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    feature_name TEXT NOT NULL, -- Links to feature being tested
    
    -- Test status and lifecycle
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Targeting
    specialty TEXT CHECK (specialty IN ('cardiology', 'obgyn', 'general', 'emergency_medicine', 'internal_medicine', 'surgery')),
    user_segment TEXT CHECK (user_segment IN ('all', 'medical_professional', 'admin', 'new_users', 'returning_users')) DEFAULT 'all',
    
    -- Success criteria
    success_metric TEXT NOT NULL, -- e.g., 'click_through_rate', 'engagement_rate', 'conversion_rate'
    minimum_sample_size INTEGER DEFAULT 100 CHECK (minimum_sample_size > 0),
    confidence_level INTEGER DEFAULT 95 CHECK (confidence_level >= 80 AND confidence_level <= 99),
    
    -- Test configuration
    config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Management fields
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT ab_tests_name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
    CONSTRAINT ab_tests_description_length CHECK (char_length(description) >= 10 AND char_length(description) <= 500),
    CONSTRAINT ab_tests_date_range CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

-- =====================================================
-- 3. A/B TEST VARIANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ab_test_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES public.ab_tests(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    weight INTEGER NOT NULL CHECK (weight >= 0 AND weight <= 100),
    
    -- Variant configuration
    config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Performance tracking
    participants_count INTEGER DEFAULT 0 CHECK (participants_count >= 0),
    conversions_count INTEGER DEFAULT 0 CHECK (conversions_count >= 0),
    
    -- Management fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT ab_test_variants_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 50),
    CONSTRAINT ab_test_variants_unique_name_per_test UNIQUE (test_id, name)
);

-- =====================================================
-- 4. A/B TEST EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ab_test_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES public.ab_tests(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES public.ab_test_variants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Event details
    event_type TEXT NOT NULL CHECK (event_type IN ('assignment', 'conversion', 'interaction', 'completion', 'abandonment')),
    event_value DECIMAL(10,4), -- For numeric events like time spent, revenue, etc.
    
    -- Context
    session_id TEXT,
    page_path TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    
    -- Event metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT ab_test_events_value_positive CHECK (event_value IS NULL OR event_value >= 0)
);

-- =====================================================
-- 5. FEATURE FLAG USAGE TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feature_flag_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Usage context
    enabled_for_user BOOLEAN NOT NULL,
    user_segment TEXT,
    specialty TEXT,
    
    -- Session context
    session_id TEXT,
    page_path TEXT,
    user_agent TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key to feature flags
    FOREIGN KEY (flag_name) REFERENCES public.feature_flags(name) ON DELETE CASCADE
);

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Feature Flags indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON public.feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_specialty ON public.feature_flags(specialty);
CREATE INDEX IF NOT EXISTS idx_feature_flags_user_segment ON public.feature_flags(user_segment);
CREATE INDEX IF NOT EXISTS idx_feature_flags_dates ON public.feature_flags(start_date, end_date);

-- A/B Tests indexes
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON public.ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_tests_specialty ON public.ab_tests(specialty);
CREATE INDEX IF NOT EXISTS idx_ab_tests_feature_name ON public.ab_tests(feature_name);
CREATE INDEX IF NOT EXISTS idx_ab_tests_dates ON public.ab_tests(start_date, end_date);

-- A/B Test Variants indexes
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_test_id ON public.ab_test_variants(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_weight ON public.ab_test_variants(weight);

-- A/B Test Events indexes (critical for analytics)
CREATE INDEX IF NOT EXISTS idx_ab_test_events_test_id ON public.ab_test_events(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_variant_id ON public.ab_test_events(variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_user_id ON public.ab_test_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_type ON public.ab_test_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_created_at ON public.ab_test_events(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ab_test_events_test_variant ON public.ab_test_events(test_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_user_created ON public.ab_test_events(user_id, created_at DESC);

-- Feature Flag Usage indexes
CREATE INDEX IF NOT EXISTS idx_feature_flag_usage_flag_name ON public.feature_flag_usage(flag_name);
CREATE INDEX IF NOT EXISTS idx_feature_flag_usage_user_id ON public.feature_flag_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_flag_usage_created_at ON public.feature_flag_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_flag_usage_specialty ON public.feature_flag_usage(specialty);

-- =====================================================
-- 7. TRIGGERS FOR AUTOMATED TIMESTAMPS
-- =====================================================

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS handle_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER handle_feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_ab_tests_updated_at ON public.ab_tests;
CREATE TRIGGER handle_ab_tests_updated_at
    BEFORE UPDATE ON public.ab_tests
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_ab_test_variants_updated_at ON public.ab_test_variants;
CREATE TRIGGER handle_ab_test_variants_updated_at
    BEFORE UPDATE ON public.ab_test_variants
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flag_usage ENABLE ROW LEVEL SECURITY;

-- Feature Flags RLS Policies (admin write, public read for enabled flags)
DROP POLICY IF EXISTS "Feature flags admin full access" ON public.feature_flags;
CREATE POLICY "Feature flags admin full access" ON public.feature_flags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE user_id = auth.uid() 
            AND (medical_specialty = 'admin' OR email LIKE '%@medimind%')
        )
    );

DROP POLICY IF EXISTS "Feature flags public read" ON public.feature_flags;
CREATE POLICY "Feature flags public read" ON public.feature_flags
    FOR SELECT USING (enabled = true);

-- A/B Tests RLS Policies (admin full access, participants can see their assignments)
DROP POLICY IF EXISTS "AB tests admin full access" ON public.ab_tests;
CREATE POLICY "AB tests admin full access" ON public.ab_tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE user_id = auth.uid() 
            AND (medical_specialty = 'admin' OR email LIKE '%@medimind%')
        )
    );

DROP POLICY IF EXISTS "AB tests participant read" ON public.ab_tests;
CREATE POLICY "AB tests participant read" ON public.ab_tests
    FOR SELECT USING (status = 'running');

-- A/B Test Variants RLS Policies
DROP POLICY IF EXISTS "AB test variants admin access" ON public.ab_test_variants;
CREATE POLICY "AB test variants admin access" ON public.ab_test_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE user_id = auth.uid() 
            AND (medical_specialty = 'admin' OR email LIKE '%@medimind%')
        )
    );

DROP POLICY IF EXISTS "AB test variants participant read" ON public.ab_test_variants;
CREATE POLICY "AB test variants participant read" ON public.ab_test_variants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ab_tests 
            WHERE id = test_id AND status = 'running'
        )
    );

-- A/B Test Events RLS Policies (users can track their own events)
DROP POLICY IF EXISTS "AB test events user access" ON public.ab_test_events;
CREATE POLICY "AB test events user access" ON public.ab_test_events
    FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "AB test events admin access" ON public.ab_test_events;
CREATE POLICY "AB test events admin access" ON public.ab_test_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE user_id = auth.uid() 
            AND (medical_specialty = 'admin' OR email LIKE '%@medimind%')
        )
    );

-- Feature Flag Usage RLS Policies
DROP POLICY IF EXISTS "Feature flag usage user access" ON public.feature_flag_usage;
CREATE POLICY "Feature flag usage user access" ON public.feature_flag_usage
    FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Feature flag usage admin access" ON public.feature_flag_usage;
CREATE POLICY "Feature flag usage admin access" ON public.feature_flag_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE user_id = auth.uid() 
            AND (medical_specialty = 'admin' OR email LIKE '%@medimind%')
        )
    );

-- =====================================================
-- 9. UTILITY FUNCTIONS
-- =====================================================

-- Function to get active feature flags for a user
CREATE OR REPLACE FUNCTION get_user_feature_flags(
    user_id_param UUID,
    specialty_param TEXT DEFAULT NULL,
    user_segment_param TEXT DEFAULT 'all'
)
RETURNS TABLE (
    flag_name TEXT,
    enabled BOOLEAN,
    config JSONB,
    should_show BOOLEAN
) AS $$
DECLARE
    user_hash INTEGER;
BEGIN
    -- Generate consistent hash for user
    user_hash := abs(hashtext(user_id_param::text)) % 100;
    
    RETURN QUERY
    SELECT 
        ff.name as flag_name,
        ff.enabled,
        ff.config,
        CASE 
            WHEN ff.enabled = false THEN false
            WHEN ff.specialty IS NOT NULL AND ff.specialty != specialty_param THEN false
            WHEN ff.user_segment != 'all' AND ff.user_segment != user_segment_param THEN false
            WHEN ff.start_date IS NOT NULL AND ff.start_date > NOW() THEN false
            WHEN ff.end_date IS NOT NULL AND ff.end_date < NOW() THEN false
            WHEN user_hash >= ff.rollout_percentage THEN false
            ELSE true
        END as should_show
    FROM public.feature_flags ff
    WHERE ff.enabled = true
       OR EXISTS (
           SELECT 1 FROM public.users 
           WHERE user_id = auth.uid() 
           AND (medical_specialty = 'admin' OR email LIKE '%@medimind%')
       );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign user to A/B test variant
CREATE OR REPLACE FUNCTION get_user_ab_test_variant(
    test_name_param TEXT,
    user_id_param UUID,
    specialty_param TEXT DEFAULT NULL,
    user_segment_param TEXT DEFAULT 'all'
)
RETURNS TABLE (
    variant_id UUID,
    variant_name TEXT,
    variant_config JSONB
) AS $$
DECLARE
    test_record RECORD;
    user_hash INTEGER;
    cumulative_weight INTEGER := 0;
    variant_record RECORD;
BEGIN
    -- Get test details
    SELECT * INTO test_record
    FROM public.ab_tests 
    WHERE name = test_name_param AND status = 'running';
    
    -- Return null if test not found or not running
    IF test_record IS NULL THEN
        RETURN;
    END IF;
    
    -- Check eligibility
    IF test_record.specialty IS NOT NULL AND test_record.specialty != specialty_param THEN
        RETURN;
    END IF;
    
    IF test_record.user_segment != 'all' AND test_record.user_segment != user_segment_param THEN
        RETURN;
    END IF;
    
    -- Check date range
    IF test_record.start_date IS NOT NULL AND test_record.start_date > NOW() THEN
        RETURN;
    END IF;
    
    IF test_record.end_date IS NOT NULL AND test_record.end_date < NOW() THEN
        RETURN;
    END IF;
    
    -- Generate consistent hash for user
    user_hash := abs(hashtext(user_id_param::text)) % 100;
    
    -- Find variant based on weighted distribution
    FOR variant_record IN 
        SELECT * FROM public.ab_test_variants 
        WHERE test_id = test_record.id 
        ORDER BY weight DESC
    LOOP
        cumulative_weight := cumulative_weight + variant_record.weight;
        
        IF user_hash < cumulative_weight THEN
            RETURN QUERY
            SELECT 
                variant_record.id,
                variant_record.name,
                variant_record.config;
            RETURN;
        END IF;
    END LOOP;
    
    -- If no variant assigned, return null
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate A/B test results
CREATE OR REPLACE FUNCTION calculate_ab_test_results(test_id_param UUID)
RETURNS TABLE (
    variant_id UUID,
    variant_name TEXT,
    participants INTEGER,
    conversions INTEGER,
    conversion_rate DECIMAL,
    confidence_interval_lower DECIMAL,
    confidence_interval_upper DECIMAL,
    statistical_significance BOOLEAN
) AS $$
DECLARE
    control_conversion_rate DECIMAL := 0;
    total_participants INTEGER := 0;
BEGIN
    -- Calculate basic metrics for each variant
    RETURN QUERY
    WITH variant_stats AS (
        SELECT 
            v.id as variant_id,
            v.name as variant_name,
            COUNT(DISTINCT e.user_id) as participants,
            COUNT(CASE WHEN e.event_type = 'conversion' THEN 1 END) as conversions,
            CASE 
                WHEN COUNT(DISTINCT e.user_id) > 0 
                THEN COUNT(CASE WHEN e.event_type = 'conversion' THEN 1 END)::DECIMAL / COUNT(DISTINCT e.user_id)
                ELSE 0
            END as conversion_rate
        FROM public.ab_test_variants v
        LEFT JOIN public.ab_test_events e ON v.id = e.variant_id
        WHERE v.test_id = test_id_param
        GROUP BY v.id, v.name
    ),
    control_stats AS (
        SELECT conversion_rate as control_rate
        FROM variant_stats
        WHERE variant_name = 'control' OR variant_name ILIKE '%control%'
        LIMIT 1
    )
    SELECT 
        vs.variant_id,
        vs.variant_name,
        vs.participants::INTEGER,
        vs.conversions::INTEGER,
        vs.conversion_rate,
        -- Simplified confidence intervals (would use proper statistical methods in production)
        GREATEST(vs.conversion_rate - 0.05, 0)::DECIMAL as confidence_interval_lower,
        LEAST(vs.conversion_rate + 0.05, 1)::DECIMAL as confidence_interval_upper,
        -- Simplified significance test (would use proper statistical tests in production)
        (vs.participants >= 100 AND ABS(vs.conversion_rate - COALESCE(cs.control_rate, 0)) > 0.05)::BOOLEAN as statistical_significance
    FROM variant_stats vs
    LEFT JOIN control_stats cs ON true
    ORDER BY vs.conversion_rate DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. INITIAL DATA - SAMPLE FEATURE FLAGS
-- =====================================================

-- Insert sample feature flags for medical news system
INSERT INTO public.feature_flags (
    name,
    description,
    enabled,
    rollout_percentage,
    specialty,
    user_segment,
    config,
    metadata
) VALUES 
(
    'enhanced_news_layout',
    'New card-based layout for medical news with improved visual hierarchy',
    true,
    50,
    NULL,
    'all',
    '{"layout": "enhanced", "showImages": true, "cardElevation": "medium"}'::jsonb,
    '{"version": "1.0", "designer": "UX Team", "testStartDate": "2024-01-15"}'::jsonb
),
(
    'ai_content_recommendations',
    'AI-powered content recommendations in medical news feed',
    true,
    75,
    'cardiology',
    'medical_professional',
    '{"modelVersion": "v1.2", "recommendationEngine": "collaborative", "maxRecommendations": 5}'::jsonb,
    '{"mlModelAccuracy": 0.87, "trainingDataSize": 50000}'::jsonb
),
(
    'advanced_search_filters',
    'Additional filtering options for medical literature search',
    true,
    100,
    NULL,
    'medical_professional',
    '{"filters": ["evidence_level", "publication_date", "study_type", "author_affiliation"]}'::jsonb,
    '{"userFeedbackScore": 4.2, "adoptionRate": 0.68}'::jsonb
),
(
    'real_time_collaboration',
    'Real-time collaboration features for medical case discussions',
    false,
    10,
    NULL,
    'medical_professional',
    '{"maxCollaborators": 5, "syncInterval": 1000}'::jsonb,
    '{"status": "beta", "technicalReview": "pending"}'::jsonb
) ON CONFLICT (name) DO NOTHING;

-- Sample A/B test
INSERT INTO public.ab_tests (
    name,
    description,
    feature_name,
    status,
    specialty,
    user_segment,
    success_metric,
    minimum_sample_size,
    confidence_level,
    config
) VALUES (
    'news_card_design_test',
    'Testing different news card layouts for improved engagement',
    'news_layout',
    'running',
    NULL,
    'all',
    'click_through_rate',
    1000,
    95,
    '{"testType": "layout", "primaryKPI": "engagement", "secondaryKPIs": ["time_on_page", "share_rate"]}'::jsonb
) ON CONFLICT (name) DO NOTHING;

-- Sample A/B test variants
INSERT INTO public.ab_test_variants (
    test_id,
    name,
    description,
    weight,
    config
) VALUES 
(
    (SELECT id FROM public.ab_tests WHERE name = 'news_card_design_test'),
    'control',
    'Current news card layout',
    50,
    '{"layout": "current", "showImages": true, "cardPadding": "normal"}'::jsonb
),
(
    (SELECT id FROM public.ab_tests WHERE name = 'news_card_design_test'),
    'enhanced',
    'Enhanced card layout with better visual hierarchy',
    50,
    '{"layout": "enhanced", "showImages": true, "cardPadding": "large", "showEngagement": true, "enhancedTypography": true}'::jsonb
) ON CONFLICT (test_id, name) DO NOTHING;

-- =====================================================
-- 11. VIEWS FOR ANALYTICS
-- =====================================================

-- A/B test performance view
CREATE OR REPLACE VIEW ab_test_performance AS
SELECT 
    t.name as test_name,
    t.status,
    t.specialty,
    t.success_metric,
    v.name as variant_name,
    v.weight,
    COUNT(DISTINCT e.user_id) as participants,
    COUNT(CASE WHEN e.event_type = 'conversion' THEN 1 END) as conversions,
    CASE 
        WHEN COUNT(DISTINCT e.user_id) > 0 
        THEN COUNT(CASE WHEN e.event_type = 'conversion' THEN 1 END)::DECIMAL / COUNT(DISTINCT e.user_id)
        ELSE 0
    END as conversion_rate,
    AVG(e.event_value) FILTER (WHERE e.event_value IS NOT NULL) as avg_event_value
FROM public.ab_tests t
JOIN public.ab_test_variants v ON t.id = v.test_id
LEFT JOIN public.ab_test_events e ON v.id = e.variant_id
WHERE t.status IN ('running', 'completed')
GROUP BY t.id, t.name, t.status, t.specialty, t.success_metric, v.id, v.name, v.weight
ORDER BY t.name, v.weight DESC;

-- Feature flag usage analytics view
CREATE OR REPLACE VIEW feature_flag_analytics AS
SELECT 
    ff.name as flag_name,
    ff.description,
    ff.enabled,
    ff.rollout_percentage,
    ff.specialty,
    ff.user_segment,
    COUNT(DISTINCT ffu.user_id) as unique_users_exposed,
    COUNT(ffu.id) as total_exposures,
    COUNT(CASE WHEN ffu.enabled_for_user THEN 1 END) as users_saw_feature,
    CASE 
        WHEN COUNT(DISTINCT ffu.user_id) > 0 
        THEN COUNT(CASE WHEN ffu.enabled_for_user THEN 1 END)::DECIMAL / COUNT(DISTINCT ffu.user_id)
        ELSE 0
    END as feature_adoption_rate
FROM public.feature_flags ff
LEFT JOIN public.feature_flag_usage ffu ON ff.name = ffu.flag_name
WHERE ff.created_at >= NOW() - INTERVAL '90 days'
GROUP BY ff.id, ff.name, ff.description, ff.enabled, ff.rollout_percentage, ff.specialty, ff.user_segment
ORDER BY ff.created_at DESC;

-- Grant permissions for authenticated users
GRANT SELECT ON ab_test_performance TO authenticated;
GRANT SELECT ON feature_flag_analytics TO authenticated;

-- =====================================================
-- 12. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.feature_flags IS 'Feature flags for gradual rollout and A/B testing of new features';
COMMENT ON TABLE public.ab_tests IS 'A/B test definitions and configurations';
COMMENT ON TABLE public.ab_test_variants IS 'Variants for A/B tests with specific configurations';
COMMENT ON TABLE public.ab_test_events IS 'User events and interactions tracked for A/B tests';
COMMENT ON TABLE public.feature_flag_usage IS 'Tracking of feature flag usage and exposure';

COMMENT ON FUNCTION get_user_feature_flags(UUID, TEXT, TEXT) IS 'Returns feature flags that should be enabled for a specific user';
COMMENT ON FUNCTION get_user_ab_test_variant(TEXT, UUID, TEXT, TEXT) IS 'Returns the A/B test variant assigned to a specific user';
COMMENT ON FUNCTION calculate_ab_test_results(UUID) IS 'Calculates statistical results for an A/B test';

-- Migration completed successfully
DO $$
BEGIN
    RAISE NOTICE 'Feature Flags and A/B Testing migration completed successfully';
    RAISE NOTICE 'Tables created: feature_flags, ab_tests, ab_test_variants, ab_test_events, feature_flag_usage';
    RAISE NOTICE 'Views created: ab_test_performance, feature_flag_analytics';
    RAISE NOTICE 'Sample data inserted: enhanced_news_layout, ai_content_recommendations features';
END $$;