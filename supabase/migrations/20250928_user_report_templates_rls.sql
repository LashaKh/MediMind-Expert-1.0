-- Row Level Security (RLS) policies for user_report_templates
-- Implements HIPAA-compliant security ensuring users can only access their own templates

-- Enable Row Level Security on the table
ALTER TABLE user_report_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own templates
CREATE POLICY "Users can view their own templates" 
    ON user_report_templates
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own templates
CREATE POLICY "Users can insert their own templates" 
    ON user_report_templates
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own templates
CREATE POLICY "Users can update their own templates" 
    ON user_report_templates
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own templates
CREATE POLICY "Users can delete their own templates" 
    ON user_report_templates
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Create a security-definer function for admin access (if needed for support/analytics)
-- This allows specific admin operations while maintaining security
CREATE OR REPLACE FUNCTION admin_get_template_stats()
RETURNS TABLE (
    total_templates BIGINT,
    total_users_with_templates BIGINT,
    avg_templates_per_user NUMERIC,
    most_used_template_name TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only allow admin users to execute this function
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND email IN ('admin@medimind.com', 'support@medimind.com')
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_templates,
        COUNT(DISTINCT user_id)::BIGINT as total_users_with_templates,
        ROUND(COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT user_id), 0), 2) as avg_templates_per_user,
        (SELECT name FROM user_report_templates ORDER BY usage_count DESC LIMIT 1) as most_used_template_name
    FROM user_report_templates;
END;
$$;

-- Add RLS policy comments for documentation
COMMENT ON POLICY "Users can view their own templates" ON user_report_templates IS 
    'Allows users to SELECT only their own templates based on user_id matching auth.uid()';

COMMENT ON POLICY "Users can insert their own templates" ON user_report_templates IS 
    'Allows users to INSERT templates only with their own user_id';

COMMENT ON POLICY "Users can update their own templates" ON user_report_templates IS 
    'Allows users to UPDATE only their own templates, preventing modification of user_id';

COMMENT ON POLICY "Users can delete their own templates" ON user_report_templates IS 
    'Allows users to DELETE only their own templates based on user_id matching auth.uid()';

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_report_templates TO authenticated;
GRANT USAGE ON SEQUENCE user_report_templates_id_seq TO authenticated;

-- Ensure the profiles table reference exists (should already exist in the system)
-- This is a safety check to ensure referential integrity
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles' AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'Profiles table not found. Ensure user profiles are set up before creating template tables.';
    END IF;
END;
$$;