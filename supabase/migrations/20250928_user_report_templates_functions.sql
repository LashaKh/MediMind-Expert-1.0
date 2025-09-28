-- Database functions and triggers for user_report_templates
-- Implements business logic for template limits and automatic timestamp updates

-- Function to enforce the 50 template limit per user
CREATE OR REPLACE FUNCTION check_user_template_limit()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    template_count INTEGER;
    max_templates INTEGER := 50;
BEGIN
    -- Count existing templates for this user
    SELECT COUNT(*) 
    INTO template_count 
    FROM user_report_templates 
    WHERE user_id = NEW.user_id;
    
    -- Check if limit would be exceeded
    IF template_count >= max_templates THEN
        RAISE EXCEPTION 'User cannot have more than % templates. Current count: %', 
            max_templates, template_count
            USING ERRCODE = 'P0001', -- Custom error code
                  DETAIL = 'Template limit exceeded',
                  HINT = 'Delete existing templates before creating new ones';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to enforce template limit on INSERT
CREATE TRIGGER trigger_check_template_limit
    BEFORE INSERT ON user_report_templates
    FOR EACH ROW
    EXECUTE FUNCTION check_user_template_limit();

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_report_template_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create trigger to update timestamp on UPDATE
CREATE TRIGGER trigger_update_template_timestamp
    BEFORE UPDATE ON user_report_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_user_report_template_updated_at();

-- Function to safely increment usage count and update last_used_at
CREATE OR REPLACE FUNCTION increment_template_usage(template_uuid UUID)
RETURNS TABLE (
    usage_count INTEGER,
    last_used_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    result_usage_count INTEGER;
    result_last_used_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Update usage statistics atomically
    UPDATE user_report_templates 
    SET 
        usage_count = usage_count + 1,
        last_used_at = now()
    WHERE id = template_uuid 
        AND user_id = auth.uid() -- Ensure user owns the template
    RETURNING 
        user_report_templates.usage_count,
        user_report_templates.last_used_at
    INTO result_usage_count, result_last_used_at;
    
    -- Check if template was found and updated
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template not found or access denied'
            USING ERRCODE = 'P0002',
                  DETAIL = 'Template with ID % not found for current user', template_uuid;
    END IF;
    
    -- Return the updated values
    RETURN QUERY SELECT result_usage_count, result_last_used_at;
END;
$$;

-- Function to get user template statistics
CREATE OR REPLACE FUNCTION get_user_template_stats(target_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    total_templates INTEGER,
    templates_remaining INTEGER,
    most_used_template_id UUID,
    most_used_template_name TEXT,
    total_usage_count INTEGER,
    last_activity TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    max_templates INTEGER := 50;
    user_template_count INTEGER;
    most_used_id UUID;
    most_used_name TEXT;
    total_usage INTEGER;
    last_used TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Ensure user can only access their own stats
    IF target_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied. Can only view own template statistics'
            USING ERRCODE = 'P0003';
    END IF;
    
    -- Get template statistics
    SELECT 
        COUNT(*)::INTEGER,
        COALESCE(SUM(urt.usage_count), 0)::INTEGER,
        MAX(urt.last_used_at)
    INTO user_template_count, total_usage, last_used
    FROM user_report_templates urt
    WHERE urt.user_id = target_user_id;
    
    -- Get most used template
    SELECT urt.id, urt.name
    INTO most_used_id, most_used_name
    FROM user_report_templates urt
    WHERE urt.user_id = target_user_id
    ORDER BY urt.usage_count DESC, urt.created_at DESC
    LIMIT 1;
    
    -- Return statistics
    RETURN QUERY SELECT 
        user_template_count,
        max_templates - user_template_count,
        most_used_id,
        most_used_name,
        total_usage,
        last_used;
END;
$$;

-- Function to search templates with full-text search capabilities
CREATE OR REPLACE FUNCTION search_user_templates(
    search_query TEXT DEFAULT '',
    order_by_field TEXT DEFAULT 'created_at',
    order_direction TEXT DEFAULT 'DESC',
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    example_structure TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER,
    last_used_at TIMESTAMP WITH TIME ZONE,
    search_rank REAL
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    search_condition TEXT;
    order_clause TEXT;
    query_sql TEXT;
BEGIN
    -- Validate order_by_field
    IF order_by_field NOT IN ('created_at', 'updated_at', 'usage_count', 'name') THEN
        order_by_field := 'created_at';
    END IF;
    
    -- Validate order_direction
    IF UPPER(order_direction) NOT IN ('ASC', 'DESC') THEN
        order_direction := 'DESC';
    END IF;
    
    -- Build search condition
    IF search_query = '' OR search_query IS NULL THEN
        search_condition := 'TRUE';
    ELSE
        search_condition := format(
            '(name ILIKE ''%%%s%%'' OR example_structure ILIKE ''%%%s%%'' OR notes ILIKE ''%%%s%%'')',
            replace(search_query, '''', ''''''),
            replace(search_query, '''', ''''''),
            replace(search_query, '''', '''''')
        );
    END IF;
    
    -- Build order clause
    order_clause := format('%I %s, created_at DESC', order_by_field, order_direction);
    
    -- Execute search query
    query_sql := format('
        SELECT 
            urt.id,
            urt.name,
            urt.example_structure,
            urt.notes,
            urt.created_at,
            urt.updated_at,
            urt.usage_count,
            urt.last_used_at,
            CASE 
                WHEN $1 = '''' THEN 1.0
                ELSE similarity(urt.name || '' '' || urt.example_structure || '' '' || urt.notes, $1)
            END as search_rank
        FROM user_report_templates urt
        WHERE urt.user_id = auth.uid()
            AND %s
        ORDER BY %s
        LIMIT $2 OFFSET $3',
        search_condition,
        order_clause
    );
    
    RETURN QUERY EXECUTE query_sql USING search_query, limit_count, offset_count;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_template_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_template_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_user_templates(TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;

-- Add function comments for documentation
COMMENT ON FUNCTION check_user_template_limit() IS 
    'Trigger function that enforces the 50 template limit per user on INSERT operations';

COMMENT ON FUNCTION update_user_report_template_updated_at() IS 
    'Trigger function that automatically updates the updated_at timestamp on UPDATE operations';

COMMENT ON FUNCTION increment_template_usage(UUID) IS 
    'Safely increments template usage count and updates last_used_at timestamp';

COMMENT ON FUNCTION get_user_template_stats(UUID) IS 
    'Returns comprehensive template statistics for a user including usage metrics';

COMMENT ON FUNCTION search_user_templates(TEXT, TEXT, TEXT, INTEGER, INTEGER) IS 
    'Full-text search function for user templates with sorting and pagination support';