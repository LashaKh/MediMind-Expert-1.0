-- OpenAI Vector Store Integration Schema
-- This migration creates tables for managing OpenAI Vector Stores and documents

-- Table to store user's OpenAI Vector Store information
CREATE TABLE IF NOT EXISTS public.user_vector_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    openai_vector_store_id TEXT UNIQUE NOT NULL, -- e.g., vs_abc123
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'deleting')),
    document_count INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_accessed_at TIMESTAMPTZ,
    openai_metadata JSONB, -- Store additional OpenAI Vector Store metadata
    
    -- Constraints
    CONSTRAINT user_vector_stores_user_id_unique UNIQUE (user_id), -- One Vector Store per user for now
    CONSTRAINT user_vector_stores_name_length CHECK (char_length(name) <= 100),
    CONSTRAINT user_vector_stores_description_length CHECK (char_length(description) <= 500)
);

-- Table to store metadata for documents uploaded to OpenAI Vector Stores
CREATE TABLE IF NOT EXISTS public.user_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vector_store_id UUID REFERENCES public.user_vector_stores(id) ON DELETE CASCADE NOT NULL,
    
    -- OpenAI identifiers
    openai_file_id TEXT UNIQUE NOT NULL, -- e.g., file_xyz789
    openai_vector_store_file_id TEXT, -- ID of the file within the vector store
    
    -- Document metadata
    title TEXT NOT NULL,
    description TEXT,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    
    -- Categories and organization
    category TEXT DEFAULT 'other' CHECK (category IN (
        'research-papers', 'clinical-guidelines', 'case-studies', 
        'medical-images', 'lab-results', 'patient-education',
        'protocols', 'reference-materials', 'personal-notes', 'other'
    )),
    tags TEXT[] DEFAULT '{}',
    is_private BOOLEAN DEFAULT true,
    
    -- Processing status
    upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    uploaded_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    
    -- OpenAI metadata
    openai_metadata JSONB, -- Store additional OpenAI file metadata
    
    -- Constraints
    CONSTRAINT user_documents_title_length CHECK (char_length(title) <= 200),
    CONSTRAINT user_documents_description_length CHECK (char_length(description) <= 1000),
    CONSTRAINT user_documents_file_name_length CHECK (char_length(file_name) <= 255),
    CONSTRAINT user_documents_file_size_positive CHECK (file_size > 0),
    CONSTRAINT user_documents_tags_limit CHECK (array_length(tags, 1) <= 10)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_vector_stores_user_id ON public.user_vector_stores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vector_stores_openai_id ON public.user_vector_stores(openai_vector_store_id);
CREATE INDEX IF NOT EXISTS idx_user_vector_stores_status ON public.user_vector_stores(status);

CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON public.user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_vector_store_id ON public.user_documents(vector_store_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_openai_file_id ON public.user_documents(openai_file_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_category ON public.user_documents(category);
CREATE INDEX IF NOT EXISTS idx_user_documents_upload_status ON public.user_documents(upload_status);
CREATE INDEX IF NOT EXISTS idx_user_documents_processing_status ON public.user_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_user_documents_created_at ON public.user_documents(created_at DESC);

-- GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_user_documents_tags ON public.user_documents USING GIN(tags);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update timestamps
CREATE TRIGGER handle_user_vector_stores_updated_at
    BEFORE UPDATE ON public.user_vector_stores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER handle_user_documents_updated_at
    BEFORE UPDATE ON public.user_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update document count in vector store
CREATE OR REPLACE FUNCTION public.update_vector_store_document_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update document count and total size for the vector store
    UPDATE public.user_vector_stores
    SET 
        document_count = (
            SELECT COUNT(*)
            FROM public.user_documents
            WHERE vector_store_id = COALESCE(NEW.vector_store_id, OLD.vector_store_id)
            AND upload_status = 'completed'
        ),
        total_size_bytes = (
            SELECT COALESCE(SUM(file_size), 0)
            FROM public.user_documents
            WHERE vector_store_id = COALESCE(NEW.vector_store_id, OLD.vector_store_id)
            AND upload_status = 'completed'
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.vector_store_id, OLD.vector_store_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update document count when documents are added/updated/deleted
CREATE TRIGGER handle_user_documents_count_update
    AFTER INSERT OR UPDATE OR DELETE ON public.user_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_vector_store_document_count();

-- Row Level Security (RLS) Policies

-- Enable RLS on both tables
ALTER TABLE public.user_vector_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

-- Policies for user_vector_stores table
CREATE POLICY "Users can view their own vector stores"
    ON public.user_vector_stores FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vector stores"
    ON public.user_vector_stores FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vector stores"
    ON public.user_vector_stores FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vector stores"
    ON public.user_vector_stores FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Policies for user_documents table
CREATE POLICY "Users can view their own documents"
    ON public.user_documents FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
    ON public.user_documents FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
    ON public.user_documents FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
    ON public.user_documents FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Service role policies for backend operations
CREATE POLICY "Service role can manage all vector stores"
    ON public.user_vector_stores FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can manage all documents"
    ON public.user_documents FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE public.user_vector_stores IS 'Stores OpenAI Vector Store metadata for each user';
COMMENT ON TABLE public.user_documents IS 'Stores metadata for documents uploaded to OpenAI Vector Stores';

COMMENT ON COLUMN public.user_vector_stores.openai_vector_store_id IS 'OpenAI Vector Store ID (e.g., vs_abc123)';
COMMENT ON COLUMN public.user_vector_stores.document_count IS 'Number of successfully uploaded documents';
COMMENT ON COLUMN public.user_vector_stores.total_size_bytes IS 'Total size of all documents in bytes';

COMMENT ON COLUMN public.user_documents.openai_file_id IS 'OpenAI File ID (e.g., file_xyz789)';
COMMENT ON COLUMN public.user_documents.openai_vector_store_file_id IS 'ID of the file within the OpenAI Vector Store';
COMMENT ON COLUMN public.user_documents.upload_status IS 'Status of file upload to OpenAI';
COMMENT ON COLUMN public.user_documents.processing_status IS 'Status of document processing and vector storage'; 