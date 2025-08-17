-- ==========================================================================
-- Query Optimization RPC Functions
-- Created: $(date)
-- Purpose: Reduce database round trips with complex operations
-- ==========================================================================

-- Function to get comprehensive user data in one call
CREATE OR REPLACE FUNCTION get_user_data_batch(
  p_user_id UUID,
  p_include_profile BOOLEAN DEFAULT true,
  p_include_vector_store BOOLEAN DEFAULT false,
  p_include_documents BOOLEAN DEFAULT false,
  p_include_cases BOOLEAN DEFAULT false,  
  p_include_consents BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON := '{}';
  profile_data JSON;
  vector_store_data JSON;
  documents_data JSON;
  cases_data JSON;
  consents_data JSON;
BEGIN
  -- Verify user has access to this data
  IF NOT (auth.uid() = p_user_id OR auth.jwt() ->> 'role' = 'admin') THEN
    RAISE EXCEPTION 'Access denied: You can only access your own data';
  END IF;

  -- Get profile data
  IF p_include_profile THEN
    SELECT to_json(p.*) INTO profile_data
    FROM profiles p
    WHERE p.id = p_user_id;
    
    result := jsonb_set(result::jsonb, '{profile}', COALESCE(profile_data, 'null'::json))::json;
  END IF;

  -- Get vector store data
  IF p_include_vector_store THEN
    SELECT json_build_object(
      'id', id,
      'openai_vector_store_id', openai_vector_store_id,
      'status', status,
      'created_at', created_at,
      'document_count', (
        SELECT COUNT(*) 
        FROM user_documents ud 
        WHERE ud.user_id = p_user_id AND ud.status = 'completed'
      )
    ) INTO vector_store_data
    FROM user_vector_stores uvs
    WHERE uvs.user_id = p_user_id;
    
    result := jsonb_set(result::jsonb, '{vectorStore}', COALESCE(vector_store_data, 'null'::json))::json;
  END IF;

  -- Get documents data
  IF p_include_documents THEN
    SELECT json_agg(
      json_build_object(
        'id', id,
        'filename', filename,
        'openai_file_id', openai_file_id,
        'status', status,
        'file_size', file_size,
        'created_at', created_at
      )
    ) INTO documents_data
    FROM user_documents
    WHERE user_id = p_user_id AND status = 'completed';
    
    result := jsonb_set(result::jsonb, '{documents}', COALESCE(documents_data, '[]'::json))::json;
  END IF;

  -- Get cases data
  IF p_include_cases THEN
    SELECT json_agg(
      json_build_object(
        'id', id,
        'title', title,
        'description', description,
        'specialty', specialty,
        'status', status,
        'metadata', metadata,
        'created_at', created_at,
        'updated_at', updated_at
      ) ORDER BY created_at DESC
    ) INTO cases_data
    FROM patient_cases
    WHERE user_id = p_user_id;
    
    result := jsonb_set(result::jsonb, '{cases}', COALESCE(cases_data, '[]'::json))::json;
  END IF;

  -- Get consents data
  IF p_include_consents THEN
    SELECT json_agg(
      json_build_object(
        'id', id,
        'consent_type', consent_type,
        'status', status,
        'granted_at', granted_at,
        'expires_at', expires_at
      )
    ) INTO consents_data
    FROM user_consent_records
    WHERE user_id = p_user_id;
    
    result := jsonb_set(result::jsonb, '{consents}', COALESCE(consents_data, '[]'::json))::json;
  END IF;

  RETURN result;
END;
$$;

-- Function to get podcast queue status efficiently
CREATE OR REPLACE FUNCTION get_podcast_queue_status(
  p_user_id UUID DEFAULT NULL,
  p_include_user_queue BOOLEAN DEFAULT true,
  p_include_global_stats BOOLEAN DEFAULT true
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON := '{}';
  user_queue_data JSON;
  global_stats JSON;
BEGIN
  -- Get user's queue status
  IF p_include_user_queue AND p_user_id IS NOT NULL THEN
    SELECT json_build_object(
      'id', pq.id,
      'position', pq.position,
      'status', pq.status,
      'created_at', pq.created_at,
      'podcast', json_build_object(
        'id', ap.id,
        'title', ap.title,
        'status', ap.status
      )
    ) INTO user_queue_data
    FROM podcast_queue pq
    LEFT JOIN ai_podcasts ap ON pq.podcast_id = ap.id
    WHERE pq.user_id = p_user_id 
      AND pq.status IN ('waiting', 'processing')
    ORDER BY pq.position
    LIMIT 1;
    
    result := jsonb_set(result::jsonb, '{userQueue}', COALESCE(user_queue_data, 'null'::json))::json;
  END IF;

  -- Get global queue statistics
  IF p_include_global_stats THEN
    SELECT json_build_object(
      'waiting', COALESCE(SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END), 0),
      'processing', COALESCE(SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END), 0),
      'total', COALESCE(COUNT(*), 0),
      'estimatedWaitTime', CASE 
        WHEN SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) > 0 
        THEN SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) * 180 -- 3 minutes per item
        ELSE 0 
      END
    ) INTO global_stats
    FROM podcast_queue
    WHERE status IN ('waiting', 'processing');
    
    result := jsonb_set(result::jsonb, '{globalStats}', COALESCE(global_stats, 'null'::json))::json;
  END IF;

  RETURN result;
END;
$$;

-- Function to update podcast queue and podcast status atomically
CREATE OR REPLACE FUNCTION update_podcast_status_batch(
  p_queue_id UUID DEFAULT NULL,
  p_podcast_id UUID DEFAULT NULL,
  p_queue_status TEXT DEFAULT NULL,
  p_podcast_status TEXT DEFAULT NULL,
  p_podcast_error TEXT DEFAULT NULL,
  p_playai_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON := '{}';
  queue_updated BOOLEAN := false;
  podcast_updated BOOLEAN := false;
BEGIN
  -- Update queue status if provided
  IF p_queue_id IS NOT NULL AND p_queue_status IS NOT NULL THEN
    UPDATE podcast_queue 
    SET status = p_queue_status,
        updated_at = NOW()
    WHERE id = p_queue_id;
    
    queue_updated := FOUND;
  END IF;

  -- Update podcast status if provided
  IF p_podcast_id IS NOT NULL THEN
    UPDATE ai_podcasts
    SET status = COALESCE(p_podcast_status, status),
        error_message = COALESCE(p_podcast_error, error_message),
        playai_id = COALESCE(p_playai_id, playai_id),
        updated_at = NOW()
    WHERE id = p_podcast_id;
    
    podcast_updated := FOUND;
  END IF;

  -- Return update status
  result := json_build_object(
    'queueUpdated', queue_updated,
    'podcastUpdated', podcast_updated,
    'timestamp', NOW()
  );

  RETURN result;
END;
$$;

-- Function to clean up expired podcast processing items
CREATE OR REPLACE FUNCTION cleanup_expired_podcast_processing(
  p_timeout_minutes INTEGER DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER := 0;
  cleanup_result JSON;
BEGIN
  -- Update expired processing items to failed
  UPDATE podcast_queue 
  SET status = 'failed',
      updated_at = NOW()
  WHERE status = 'processing' 
    AND created_at < NOW() - INTERVAL '1 minute' * p_timeout_minutes;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;

  -- Update corresponding podcasts to failed
  UPDATE ai_podcasts
  SET status = 'failed',
      error_message = 'Generation timeout - please try again',
      updated_at = NOW()
  WHERE id IN (
    SELECT podcast_id 
    FROM podcast_queue 
    WHERE status = 'failed' 
      AND updated_at >= NOW() - INTERVAL '1 minute'
  );

  cleanup_result := json_build_object(
    'expiredItems', expired_count,
    'cleanupTime', NOW()
  );

  RETURN cleanup_result;
END;
$$;

-- Function to get knowledge base documents with vector store info
CREATE OR REPLACE FUNCTION get_user_knowledge_base_summary(
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Verify access
  IF NOT (auth.uid() = p_user_id OR auth.jwt() ->> 'role' = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'vectorStore', (
      SELECT json_build_object(
        'id', uvs.id,
        'openai_vector_store_id', uvs.openai_vector_store_id,
        'status', uvs.status,
        'created_at', uvs.created_at
      )
      FROM user_vector_stores uvs
      WHERE uvs.user_id = p_user_id
    ),
    'documents', (
      SELECT json_agg(
        json_build_object(
          'id', ud.id,
          'filename', ud.filename,
          'status', ud.status,
          'file_size', ud.file_size,
          'openai_file_id', ud.openai_file_id,
          'created_at', ud.created_at
        ) ORDER BY ud.created_at DESC
      )
      FROM user_documents ud
      WHERE ud.user_id = p_user_id
    ),
    'stats', (
      SELECT json_build_object(
        'totalDocuments', COUNT(*),
        'completedDocuments', SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END),
        'processingDocuments', SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END),
        'failedDocuments', SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END),
        'totalSize', COALESCE(SUM(file_size), 0)
      )
      FROM user_documents
      WHERE user_id = p_user_id
    )
  ) INTO result;

  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- Function to search and filter user documents efficiently
CREATE OR REPLACE FUNCTION search_user_documents(
  p_user_id UUID,
  p_search_term TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  total_count INTEGER;
BEGIN
  -- Verify access
  IF NOT (auth.uid() = p_user_id OR auth.jwt() ->> 'role' = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Get total count for pagination
  SELECT COUNT(*) INTO total_count
  FROM user_documents
  WHERE user_id = p_user_id
    AND (p_search_term IS NULL OR filename ILIKE '%' || p_search_term || '%')
    AND (p_status IS NULL OR status = p_status);

  -- Get filtered documents
  SELECT json_build_object(
    'documents', json_agg(
      json_build_object(
        'id', id,
        'filename', filename,
        'status', status,
        'file_size', file_size,
        'openai_file_id', openai_file_id,
        'error_message', error_message,
        'created_at', created_at,
        'updated_at', updated_at
      ) ORDER BY created_at DESC
    ),
    'pagination', json_build_object(
      'total', total_count,
      'limit', p_limit,
      'offset', p_offset,
      'hasMore', total_count > (p_offset + p_limit)
    )
  ) INTO result
  FROM user_documents
  WHERE user_id = p_user_id
    AND (p_search_term IS NULL OR filename ILIKE '%' || p_search_term || '%')
    AND (p_status IS NULL OR status = p_status)
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;

  RETURN COALESCE(result, '{"documents": [], "pagination": {"total": 0, "hasMore": false}}'::json);
END;
$$;

-- Add RLS policies for the new functions
ALTER FUNCTION get_user_data_batch(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN) OWNER TO postgres;
ALTER FUNCTION get_podcast_queue_status(UUID, BOOLEAN, BOOLEAN) OWNER TO postgres;
ALTER FUNCTION update_podcast_status_batch(UUID, UUID, TEXT, TEXT, TEXT, TEXT) OWNER TO postgres;
ALTER FUNCTION cleanup_expired_podcast_processing(INTEGER) OWNER TO postgres;
ALTER FUNCTION get_user_knowledge_base_summary(UUID) OWNER TO postgres;
ALTER FUNCTION search_user_documents(UUID, TEXT, TEXT, INTEGER, INTEGER) OWNER TO postgres;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_data_batch(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_podcast_queue_status(UUID, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_podcast_status_batch(UUID, UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_podcast_processing(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_knowledge_base_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_user_documents(UUID, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_podcast_queue_user_status ON podcast_queue(user_id, status) WHERE status IN ('waiting', 'processing');
CREATE INDEX IF NOT EXISTS idx_user_documents_user_status ON user_documents(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_documents_filename_search ON user_documents USING gin(filename gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_patient_cases_user_created ON patient_cases(user_id, created_at DESC);

-- Enable pg_trgm extension for text search if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm; 