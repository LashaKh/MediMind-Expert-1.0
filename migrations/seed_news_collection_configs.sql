-- Seed News Collection Configurations
-- This script initializes the news collection configurations for each medical specialty

-- Cardiology configuration
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
        'cardiology clinical trials 2025',
        'cardiovascular disease breakthrough research',
        'heart failure treatment guidelines',
        'interventional cardiology innovations',
        'cardiac imaging advances',
        'ACC AHA guidelines update',
        'atrial fibrillation management',
        'myocardial infarction prevention',
        'heart valve disease treatment',
        'cardiac surgery outcomes'
    ],
    '{"brave": {"enabled": true, "priority": 1, "medical_filter": true}, "exa": {"enabled": true, "priority": 2, "academic_bias": 0.8}, "perplexity": {"enabled": true, "priority": 3, "pro_search": true}}'::jsonb,
    12, -- Update every 12 hours
    true,
    30, -- Max 30 articles per collection
    0.70, -- Min credibility score
    0.75, -- Min relevance score
    7, -- Articles from last 7 days
    true,
    true,
    true
) ON CONFLICT (specialty) DO UPDATE SET
    search_queries = EXCLUDED.search_queries,
    api_preferences = EXCLUDED.api_preferences,
    update_frequency = EXCLUDED.update_frequency,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- OB/GYN configuration
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
    'obgyn',
    ARRAY[
        'obstetrics gynecology clinical trials 2025',
        'maternal fetal medicine research',
        'pregnancy complications management',
        'gynecologic oncology advances',
        'reproductive endocrinology updates',
        'ACOG practice bulletins',
        'prenatal screening innovations',
        'minimally invasive gynecologic surgery',
        'contraception new developments',
        'menopause management guidelines'
    ],
    '{"brave": {"enabled": true, "priority": 1, "medical_filter": true}, "exa": {"enabled": true, "priority": 2, "academic_bias": 0.8}, "perplexity": {"enabled": true, "priority": 3, "pro_search": true}}'::jsonb,
    12, -- Update every 12 hours
    true,
    30, -- Max 30 articles per collection
    0.70, -- Min credibility score
    0.75, -- Min relevance score
    7, -- Articles from last 7 days
    true,
    true,
    true
) ON CONFLICT (specialty) DO UPDATE SET
    search_queries = EXCLUDED.search_queries,
    api_preferences = EXCLUDED.api_preferences,
    update_frequency = EXCLUDED.update_frequency,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- General/Other specialties (for future expansion)
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
    'general',
    ARRAY[
        'medical breakthrough 2025',
        'healthcare innovation research',
        'clinical guidelines update',
        'medical technology advances',
        'public health initiatives',
        'FDA drug approvals',
        'medical device innovations',
        'healthcare policy changes',
        'medical education updates',
        'evidence-based medicine'
    ],
    '{"brave": {"enabled": true, "priority": 1, "medical_filter": true}, "exa": {"enabled": true, "priority": 2, "academic_bias": 0.7}, "perplexity": {"enabled": true, "priority": 3, "pro_search": false}}'::jsonb,
    24, -- Update every 24 hours
    true,
    20, -- Max 20 articles per collection
    0.65, -- Min credibility score
    0.70, -- Min relevance score
    14, -- Articles from last 14 days
    true,
    true,
    true
) ON CONFLICT (specialty) DO UPDATE SET
    search_queries = EXCLUDED.search_queries,
    api_preferences = EXCLUDED.api_preferences,
    update_frequency = EXCLUDED.update_frequency,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verify the configurations were inserted
SELECT 
    specialty,
    array_length(search_queries, 1) as num_queries,
    is_active,
    update_frequency,
    max_articles_per_collection
FROM public.news_collection_configs
ORDER BY specialty;