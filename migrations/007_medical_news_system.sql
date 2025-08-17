-- Medical News System Database Schema
-- Creates tables for medical news collection, categorization, and user interaction tracking

-- =====================================================
-- 1. MEDICAL NEWS TABLE
-- =====================================================
-- Main table for storing medical news articles and metadata
CREATE TABLE IF NOT EXISTS public.medical_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    source_url TEXT NOT NULL UNIQUE,
    source_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('research', 'drug_approvals', 'clinical_trials', 'guidelines', 'breaking_news', 'policy_updates')),
    specialty TEXT NOT NULL CHECK (specialty IN ('cardiology', 'obgyn', 'general', 'emergency_medicine', 'internal_medicine', 'surgery')),
    published_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Engagement metrics
    click_count INTEGER DEFAULT 0 CHECK (click_count >= 0),
    engagement_score DECIMAL(8,4) DEFAULT 0.0 CHECK (engagement_score >= 0),
    
    -- Content processing fields
    content_hash TEXT UNIQUE, -- For duplicate detection
    keywords TEXT[], -- Extracted keywords for searchability
    author_name TEXT,
    author_affiliation TEXT,
    publication_name TEXT,
    
    -- Quality and relevance scoring
    relevance_score DECIMAL(8,4) DEFAULT 0.0 CHECK (relevance_score >= 0 AND relevance_score <= 1),
    credibility_score DECIMAL(8,4) DEFAULT 0.0 CHECK (credibility_score >= 0 AND credibility_score <= 1),
    
    -- Content metadata
    content_type TEXT DEFAULT 'article' CHECK (content_type IN ('article', 'study', 'guideline', 'press_release', 'editorial', 'review')),
    evidence_level TEXT CHECK (evidence_level IN ('systematic_review', 'rct', 'cohort_study', 'case_control', 'case_series', 'expert_opinion', 'guideline')),
    
    -- Processing status
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processed', 'failed', 'archived')),
    error_message TEXT,
    
    -- Indexing constraints
    CONSTRAINT medical_news_title_length CHECK (char_length(title) >= 10 AND char_length(title) <= 500),
    CONSTRAINT medical_news_summary_length CHECK (char_length(summary) >= 50 AND char_length(summary) <= 2000),
    CONSTRAINT medical_news_url_length CHECK (char_length(source_url) >= 10 AND char_length(source_url) <= 2000)
);

-- =====================================================
-- 2. NEWS USER INTERACTIONS TABLE
-- =====================================================
-- Track user engagement with news articles for analytics and personalization
CREATE TABLE IF NOT EXISTS public.news_user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    news_id UUID REFERENCES public.medical_news(id) ON DELETE CASCADE NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('click', 'read_time', 'share', 'bookmark', 'like', 'comment', 'save_later')),
    interaction_value DECIMAL(8,2), -- For numeric values like read_time in seconds
    interaction_metadata JSONB, -- For additional context like share platform, referrer, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- User session context
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    
    -- Constraints
    CONSTRAINT news_interactions_unique_user_news_type UNIQUE (user_id, news_id, interaction_type, created_at),
    CONSTRAINT news_interactions_value_positive CHECK (interaction_value IS NULL OR interaction_value >= 0)
);

-- =====================================================
-- 3. NEWS COLLECTION CONFIGS TABLE
-- =====================================================
-- Configuration for automated news collection by specialty
CREATE TABLE IF NOT EXISTS public.news_collection_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialty TEXT NOT NULL UNIQUE CHECK (specialty IN ('cardiology', 'obgyn', 'general', 'emergency_medicine', 'internal_medicine', 'surgery')),
    search_queries TEXT[] NOT NULL, -- Array of search terms for this specialty
    api_preferences JSONB NOT NULL DEFAULT '{"brave": {"enabled": true, "priority": 1}, "exa": {"enabled": true, "priority": 2}, "perplexity": {"enabled": true, "priority": 3}}'::jsonb,
    update_frequency INTEGER NOT NULL DEFAULT 12 CHECK (update_frequency > 0), -- Hours between updates
    is_active BOOLEAN DEFAULT true,
    
    -- Collection settings
    max_articles_per_collection INTEGER DEFAULT 50 CHECK (max_articles_per_collection > 0),
    min_credibility_score DECIMAL(3,2) DEFAULT 0.60 CHECK (min_credibility_score >= 0 AND min_credibility_score <= 1),
    min_relevance_score DECIMAL(3,2) DEFAULT 0.70 CHECK (min_relevance_score >= 0 AND min_relevance_score <= 1),
    
    -- Time-based filters
    max_article_age_days INTEGER DEFAULT 30 CHECK (max_article_age_days > 0),
    
    -- Processing options
    enable_summarization BOOLEAN DEFAULT true,
    enable_keyword_extraction BOOLEAN DEFAULT true,
    enable_categorization BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_collection_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT news_config_queries_not_empty CHECK (array_length(search_queries, 1) > 0)
);

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Medical News indexes
CREATE INDEX IF NOT EXISTS idx_medical_news_specialty ON public.medical_news(specialty);
CREATE INDEX IF NOT EXISTS idx_medical_news_category ON public.medical_news(category);
CREATE INDEX IF NOT EXISTS idx_medical_news_published_date ON public.medical_news(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_news_engagement_score ON public.medical_news(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_medical_news_created_at ON public.medical_news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_news_processing_status ON public.medical_news(processing_status);
CREATE INDEX IF NOT EXISTS idx_medical_news_content_hash ON public.medical_news(content_hash);
CREATE INDEX IF NOT EXISTS idx_medical_news_relevance_score ON public.medical_news(relevance_score DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_medical_news_specialty_category ON public.medical_news(specialty, category);
CREATE INDEX IF NOT EXISTS idx_medical_news_specialty_published ON public.medical_news(specialty, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_news_category_engagement ON public.medical_news(category, engagement_score DESC);

-- Full-text search index for news content
CREATE INDEX IF NOT EXISTS idx_medical_news_search ON public.medical_news USING gin(to_tsvector('english', title || ' ' || summary || ' ' || coalesce(array_to_string(keywords, ' '), '')));

-- User Interactions indexes
CREATE INDEX IF NOT EXISTS idx_news_interactions_user_id ON public.news_user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_news_interactions_news_id ON public.news_user_interactions(news_id);
CREATE INDEX IF NOT EXISTS idx_news_interactions_type ON public.news_user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_news_interactions_created_at ON public.news_user_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_interactions_user_news ON public.news_user_interactions(user_id, news_id);

-- Collection Configs indexes
CREATE INDEX IF NOT EXISTS idx_news_configs_specialty ON public.news_collection_configs(specialty);
CREATE INDEX IF NOT EXISTS idx_news_configs_active ON public.news_collection_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_news_configs_last_collection ON public.news_collection_configs(last_collection_at);

-- =====================================================
-- 5. TRIGGERS FOR AUTOMATED TIMESTAMPS
-- =====================================================

-- Updated at trigger function (reusable)
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS handle_medical_news_updated_at ON public.medical_news;
CREATE TRIGGER handle_medical_news_updated_at
    BEFORE UPDATE ON public.medical_news
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_news_configs_updated_at ON public.news_collection_configs;
CREATE TRIGGER handle_news_configs_updated_at
    BEFORE UPDATE ON public.news_collection_configs
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.medical_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_collection_configs ENABLE ROW LEVEL SECURITY;

-- Medical News RLS Policies (public read, admin write)
DROP POLICY IF EXISTS "Medical news public read access" ON public.medical_news;
CREATE POLICY "Medical news public read access" ON public.medical_news
    FOR SELECT USING (processing_status = 'processed');

DROP POLICY IF EXISTS "Medical news admin full access" ON public.medical_news;
CREATE POLICY "Medical news admin full access" ON public.medical_news
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE user_id = auth.uid() 
            AND (medical_specialty = 'admin' OR email LIKE '%@medimind%')
        )
    );

-- User Interactions RLS Policies (users can manage their own interactions)
DROP POLICY IF EXISTS "Users can view own interactions" ON public.news_user_interactions;
CREATE POLICY "Users can view own interactions" ON public.news_user_interactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own interactions" ON public.news_user_interactions;
CREATE POLICY "Users can create own interactions" ON public.news_user_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own interactions" ON public.news_user_interactions;
CREATE POLICY "Users can update own interactions" ON public.news_user_interactions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own interactions" ON public.news_user_interactions;
CREATE POLICY "Users can delete own interactions" ON public.news_user_interactions
    FOR DELETE USING (auth.uid() = user_id);

-- Anonymous interaction tracking policy (for non-authenticated users)
DROP POLICY IF EXISTS "Anonymous interaction tracking" ON public.news_user_interactions;
CREATE POLICY "Anonymous interaction tracking" ON public.news_user_interactions
    FOR INSERT WITH CHECK (user_id IS NULL AND interaction_type IN ('click', 'read_time'));

-- Collection Configs RLS Policies (admin access only)
DROP POLICY IF EXISTS "Collection configs admin access" ON public.news_collection_configs;
CREATE POLICY "Collection configs admin access" ON public.news_collection_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE user_id = auth.uid() 
            AND (medical_specialty = 'admin' OR email LIKE '%@medimind%')
        )
    );

-- Public read access for active collection configs
DROP POLICY IF EXISTS "Collection configs public read" ON public.news_collection_configs;
CREATE POLICY "Collection configs public read" ON public.news_collection_configs
    FOR SELECT USING (is_active = true);

-- =====================================================
-- 7. UTILITY FUNCTIONS
-- =====================================================

-- Function to calculate engagement score based on interactions
CREATE OR REPLACE FUNCTION calculate_engagement_score(news_id_param UUID)
RETURNS DECIMAL(8,4) AS $$
DECLARE
    click_weight DECIMAL := 1.0;
    read_time_weight DECIMAL := 2.0;
    share_weight DECIMAL := 5.0;
    bookmark_weight DECIMAL := 3.0;
    like_weight DECIMAL := 2.0;
    
    total_score DECIMAL := 0.0;
    days_since_published INTEGER;
    decay_factor DECIMAL := 1.0;
BEGIN
    -- Calculate days since published for decay factor
    SELECT EXTRACT(days FROM (NOW() - published_date))::INTEGER
    INTO days_since_published
    FROM public.medical_news
    WHERE id = news_id_param;
    
    -- Apply time-based decay (articles lose relevance over time)
    IF days_since_published > 0 THEN
        decay_factor := 1.0 / (1.0 + (days_since_published::DECIMAL / 30.0));
    END IF;
    
    -- Calculate weighted engagement score
    SELECT COALESCE(
        SUM(
            CASE interaction_type
                WHEN 'click' THEN click_weight
                WHEN 'read_time' THEN read_time_weight * LEAST(COALESCE(interaction_value, 0) / 60.0, 10.0) -- Max 10 points for read time
                WHEN 'share' THEN share_weight
                WHEN 'bookmark' THEN bookmark_weight
                WHEN 'like' THEN like_weight
                ELSE 0
            END
        ) * decay_factor, 0.0
    )
    INTO total_score
    FROM public.news_user_interactions
    WHERE news_id = news_id_param;
    
    RETURN LEAST(total_score, 9999.0); -- Cap at 9999 to fit decimal(8,4)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update engagement scores (can be called by scheduled jobs)
CREATE OR REPLACE FUNCTION update_all_engagement_scores()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    news_record RECORD;
BEGIN
    FOR news_record IN 
        SELECT id FROM public.medical_news 
        WHERE processing_status = 'processed'
        AND published_date > NOW() - INTERVAL '90 days' -- Only update recent articles
    LOOP
        UPDATE public.medical_news 
        SET engagement_score = calculate_engagement_score(news_record.id),
            updated_at = NOW()
        WHERE id = news_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. INITIAL DATA - CARDIOLOGY COLLECTION CONFIG
-- =====================================================

-- Insert initial configuration for Cardiology specialty
INSERT INTO public.news_collection_configs (
    specialty,
    search_queries,
    api_preferences,
    update_frequency,
    is_active,
    max_articles_per_collection,
    min_credibility_score,
    min_relevance_score,
    max_article_age_days,
    enable_summarization,
    enable_keyword_extraction,
    enable_categorization
) VALUES (
    'cardiology',
    ARRAY[
        'cardiology clinical trials',
        'heart disease research',
        'cardiovascular guidelines',
        'cardiac surgery outcomes',
        'hypertension treatment',
        'heart failure management',
        'atrial fibrillation',
        'myocardial infarction',
        'coronary artery disease',
        'cardiac catheterization',
        'echocardiography advances',
        'cardiac electrophysiology'
    ],
    '{
        "brave": {"enabled": true, "priority": 1, "medical_filter": true},
        "exa": {"enabled": true, "priority": 2, "academic_bias": 0.8},
        "perplexity": {"enabled": true, "priority": 3, "pro_search": true}
    }'::jsonb,
    12, -- Every 12 hours
    true,
    30, -- Max 30 articles per collection
    0.65, -- Minimum 65% credibility score
    0.75, -- Minimum 75% relevance score
    14, -- Only articles from last 14 days
    true,
    true,
    true
) ON CONFLICT (specialty) DO NOTHING;

-- Insert configuration for General medicine (for cross-specialty content)
INSERT INTO public.news_collection_configs (
    specialty,
    search_queries,
    api_preferences,
    update_frequency,
    is_active,
    max_articles_per_collection,
    min_credibility_score,
    min_relevance_score,
    max_article_age_days
) VALUES (
    'general',
    ARRAY[
        'medical breakthrough',
        'FDA drug approval',
        'clinical practice guidelines',
        'medical research',
        'healthcare policy',
        'medical technology',
        'public health',
        'medical education'
    ],
    '{
        "brave": {"enabled": true, "priority": 1},
        "exa": {"enabled": true, "priority": 2},
        "perplexity": {"enabled": true, "priority": 3}
    }'::jsonb,
    24, -- Every 24 hours
    true,
    20, -- Max 20 general articles per collection
    0.70, -- Higher credibility threshold for general content
    0.70,
    7 -- Only very recent general news
) ON CONFLICT (specialty) DO NOTHING;

-- =====================================================
-- 9. PERFORMANCE AND MAINTENANCE
-- =====================================================

-- Create view for trending news (commonly used aggregation)
CREATE OR REPLACE VIEW trending_medical_news AS
SELECT 
    mn.*,
    COALESCE(interaction_counts.total_interactions, 0) as total_interactions,
    COALESCE(interaction_counts.recent_interactions, 0) as recent_interactions
FROM public.medical_news mn
LEFT JOIN (
    SELECT 
        news_id,
        COUNT(*) as total_interactions,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as recent_interactions
    FROM public.news_user_interactions
    GROUP BY news_id
) interaction_counts ON mn.id = interaction_counts.news_id
WHERE mn.processing_status = 'processed'
  AND mn.published_date > NOW() - INTERVAL '30 days'
ORDER BY 
    mn.engagement_score DESC,
    interaction_counts.recent_interactions DESC,
    mn.published_date DESC;

-- Grant appropriate permissions
GRANT SELECT ON trending_medical_news TO authenticated;
GRANT SELECT ON trending_medical_news TO anon;

-- =====================================================
-- 10. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.medical_news IS 'Stores medical news articles with metadata, categorization, and engagement metrics';
COMMENT ON TABLE public.news_user_interactions IS 'Tracks user interactions with news articles for analytics and personalization';
COMMENT ON TABLE public.news_collection_configs IS 'Configuration settings for automated news collection by medical specialty';

COMMENT ON COLUMN public.medical_news.engagement_score IS 'Calculated score based on user interactions, decayed by time';
COMMENT ON COLUMN public.medical_news.relevance_score IS 'AI-determined relevance to the medical specialty (0.0-1.0)';
COMMENT ON COLUMN public.medical_news.credibility_score IS 'Source credibility score based on publication and author (0.0-1.0)';
COMMENT ON COLUMN public.medical_news.content_hash IS 'SHA-256 hash of title+content for duplicate detection';

COMMENT ON FUNCTION calculate_engagement_score(UUID) IS 'Calculates engagement score with time decay for a news article';
COMMENT ON FUNCTION update_all_engagement_scores() IS 'Batch updates engagement scores for all recent articles';

-- Migration completed successfully
DO $$
BEGIN
    RAISE NOTICE 'Medical News System migration completed successfully';
    RAISE NOTICE 'Tables created: medical_news, news_user_interactions, news_collection_configs';
    RAISE NOTICE 'Initial specialty configurations: cardiology, general';
    RAISE NOTICE 'Views created: trending_medical_news';
END $$;