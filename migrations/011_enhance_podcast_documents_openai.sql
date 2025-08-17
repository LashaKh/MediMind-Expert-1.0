-- Migration: Enhance podcast_documents table with OpenAI processing capabilities
-- This migration adds OpenAI file processing fields to podcast_documents table

-- Add OpenAI processing fields to podcast_documents table
ALTER TABLE podcast_documents 
ADD COLUMN IF NOT EXISTS openai_file_id text,
ADD COLUMN IF NOT EXISTS openai_upload_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS openai_upload_error text,
ADD COLUMN IF NOT EXISTS processing_started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS processing_completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS extracted_text text,
ADD COLUMN IF NOT EXISTS document_metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS openai_processing_retries integer DEFAULT 0;

-- Create index for efficient querying by OpenAI file ID
CREATE INDEX IF NOT EXISTS idx_podcast_documents_openai_file_id 
ON podcast_documents(openai_file_id) 
WHERE openai_file_id IS NOT NULL;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_podcast_documents_openai_status 
ON podcast_documents(openai_upload_status);

-- Create index for user documents with OpenAI files
CREATE INDEX IF NOT EXISTS idx_podcast_documents_user_openai 
ON podcast_documents(user_id, openai_upload_status) 
WHERE openai_file_id IS NOT NULL;

-- Add comment to table
COMMENT ON COLUMN podcast_documents.openai_file_id IS 'OpenAI file ID for document processing';
COMMENT ON COLUMN podcast_documents.openai_upload_status IS 'Status: pending, processing, completed, failed';
COMMENT ON COLUMN podcast_documents.openai_upload_error IS 'Error message if OpenAI upload failed';
COMMENT ON COLUMN podcast_documents.processing_started_at IS 'When OpenAI processing started';
COMMENT ON COLUMN podcast_documents.processing_completed_at IS 'When OpenAI processing completed';
COMMENT ON COLUMN podcast_documents.extracted_text IS 'Extracted text content from document';
COMMENT ON COLUMN podcast_documents.document_metadata IS 'Additional metadata about document processing';
COMMENT ON COLUMN podcast_documents.openai_processing_retries IS 'Number of retry attempts for failed processing';

-- Update existing records to have pending status
UPDATE podcast_documents 
SET openai_upload_status = 'pending' 
WHERE openai_upload_status IS NULL;