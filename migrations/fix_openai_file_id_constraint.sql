-- Migration: Fix openai_file_id NOT NULL constraint
-- This migration allows openai_file_id to be NULL initially during the upload process
-- Date: 2025-01-18
-- Issue: Document upload fails because we create DB record before OpenAI upload

-- Step 1: Alter the user_documents table to allow NULL values for openai_file_id
-- This allows us to create the document record before uploading to OpenAI
ALTER TABLE public.user_documents 
ALTER COLUMN openai_file_id DROP NOT NULL;

-- Step 2: Add a check constraint to ensure openai_file_id is set when upload is completed
-- This ensures data integrity while allowing the upload workflow
ALTER TABLE public.user_documents 
ADD CONSTRAINT check_openai_file_id_when_completed 
CHECK (
  (upload_status != 'completed') OR 
  (upload_status = 'completed' AND openai_file_id IS NOT NULL)
);

-- Step 3: Update the unique constraint to handle NULL values properly
-- Drop the existing unique constraint
ALTER TABLE public.user_documents 
DROP CONSTRAINT IF EXISTS user_documents_openai_file_id_key;

-- Add a partial unique index that only applies to non-NULL values
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_user_documents_openai_file_id_unique 
ON public.user_documents(openai_file_id) 
WHERE openai_file_id IS NOT NULL;

-- Step 4: Add comments to document the change
COMMENT ON COLUMN public.user_documents.openai_file_id IS 'OpenAI File ID (e.g., file_xyz789). Can be NULL during upload process, but must be set when upload_status = completed';

-- Step 5: Verify the changes
-- This query should show that openai_file_id is now nullable
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'user_documents' 
  AND table_schema = 'public' 
  AND column_name = 'openai_file_id'; 