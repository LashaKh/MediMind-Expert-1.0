-- Migration: Add knowledge_base_documents table for comprehensive document management
-- This table will store metadata for all uploaded documents in the knowledge base

-- Create the knowledge_base_documents table
CREATE TABLE IF NOT EXISTS public.knowledge_base_documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT false,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploaded', 'failed')),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  vector_store_id TEXT,
  openai_file_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_base_documents_user_id ON public.knowledge_base_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_documents_category ON public.knowledge_base_documents(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_documents_status ON public.knowledge_base_documents(upload_status, processing_status);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_documents_created_at ON public.knowledge_base_documents(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.knowledge_base_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own documents" ON public.knowledge_base_documents;
CREATE POLICY "Users can view own documents" ON public.knowledge_base_documents
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own documents" ON public.knowledge_base_documents;
CREATE POLICY "Users can insert own documents" ON public.knowledge_base_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own documents" ON public.knowledge_base_documents;
CREATE POLICY "Users can update own documents" ON public.knowledge_base_documents
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.knowledge_base_documents;
CREATE POLICY "Users can delete own documents" ON public.knowledge_base_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_knowledge_base_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_knowledge_base_documents_updated_at ON public.knowledge_base_documents;
CREATE TRIGGER update_knowledge_base_documents_updated_at
  BEFORE UPDATE ON public.knowledge_base_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_knowledge_base_documents_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.knowledge_base_documents IS 'Stores metadata for documents uploaded to the personal knowledge base';
COMMENT ON COLUMN public.knowledge_base_documents.id IS 'Unique identifier for the document';
COMMENT ON COLUMN public.knowledge_base_documents.user_id IS 'ID of the user who uploaded the document';
COMMENT ON COLUMN public.knowledge_base_documents.title IS 'User-provided title for the document';
COMMENT ON COLUMN public.knowledge_base_documents.description IS 'User-provided description of the document';
COMMENT ON COLUMN public.knowledge_base_documents.category IS 'Document category (research-papers, clinical-guidelines, etc.)';
COMMENT ON COLUMN public.knowledge_base_documents.tags IS 'Array of user-defined tags for the document';
COMMENT ON COLUMN public.knowledge_base_documents.is_private IS 'Whether the document is private to the user';
COMMENT ON COLUMN public.knowledge_base_documents.file_name IS 'Original filename of the uploaded document';
COMMENT ON COLUMN public.knowledge_base_documents.file_type IS 'MIME type of the uploaded file';
COMMENT ON COLUMN public.knowledge_base_documents.file_size IS 'Size of the file in bytes';
COMMENT ON COLUMN public.knowledge_base_documents.storage_path IS 'Path to the file in Supabase Storage';
COMMENT ON COLUMN public.knowledge_base_documents.upload_status IS 'Status of the file upload process';
COMMENT ON COLUMN public.knowledge_base_documents.processing_status IS 'Status of the document processing pipeline';
COMMENT ON COLUMN public.knowledge_base_documents.vector_store_id IS 'ID of the vector store containing this document';
COMMENT ON COLUMN public.knowledge_base_documents.openai_file_id IS 'OpenAI file ID if using OpenAI services';
COMMENT ON COLUMN public.knowledge_base_documents.error_message IS 'Error message if processing failed'; 