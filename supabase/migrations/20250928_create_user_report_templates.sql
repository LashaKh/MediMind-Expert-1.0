-- Create user_report_templates table for custom medical report templates
-- This migration implements the database schema for user-created templates
-- that guide AI-generated medical reports from Georgian transcripts.

-- Create the user_report_templates table
CREATE TABLE user_report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    example_structure TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints for data validation
    CONSTRAINT user_report_templates_name_length 
        CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
    CONSTRAINT user_report_templates_example_length 
        CHECK (char_length(example_structure) >= 10 AND char_length(example_structure) <= 50000),
    CONSTRAINT user_report_templates_notes_length 
        CHECK (char_length(notes) <= 10000),
    CONSTRAINT user_report_templates_usage_count_positive 
        CHECK (usage_count >= 0),
    
    -- Unique constraint for template names per user
    CONSTRAINT user_report_templates_name_unique_per_user 
        UNIQUE (user_id, name)
);

-- Create indexes for performance optimization
CREATE INDEX idx_user_report_templates_user_id 
    ON user_report_templates(user_id);

CREATE INDEX idx_user_report_templates_created_at 
    ON user_report_templates(user_id, created_at DESC);

CREATE INDEX idx_user_report_templates_usage 
    ON user_report_templates(user_id, usage_count DESC);

CREATE INDEX idx_user_report_templates_name_search 
    ON user_report_templates(user_id, name);

-- Create index for full-text search on template content
CREATE INDEX idx_user_report_templates_content_search 
    ON user_report_templates USING gin((name || ' ' || example_structure || ' ' || notes) gin_trgm_ops);

-- Add comment for table documentation
COMMENT ON TABLE user_report_templates IS 
    'Custom medical report templates created by users to guide AI-generated reports from transcripts';

COMMENT ON COLUMN user_report_templates.name IS 
    'User-defined template name (2-100 characters, unique per user)';

COMMENT ON COLUMN user_report_templates.example_structure IS 
    'Template structure example used to guide AI report generation (10-50,000 characters)';

COMMENT ON COLUMN user_report_templates.notes IS 
    'Additional guidance notes for AI prompt enhancement (0-10,000 characters)';

COMMENT ON COLUMN user_report_templates.usage_count IS 
    'Number of times this template has been used for report generation';

COMMENT ON COLUMN user_report_templates.last_used_at IS 
    'Timestamp of the most recent usage of this template';