-- Add temp_file_path column to ai_podcasts table for tracking temporary files
-- This allows proper cleanup after PlayAI processing completes

ALTER TABLE ai_podcasts 
ADD COLUMN temp_file_path TEXT;

-- Add comment to explain the column purpose
COMMENT ON COLUMN ai_podcasts.temp_file_path IS 'Path to temporary document file in Supabase Storage, cleaned up after generation completes'; 