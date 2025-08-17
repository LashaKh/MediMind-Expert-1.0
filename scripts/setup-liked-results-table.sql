-- Setup script for liked_search_results table
-- Execute this in your Supabase SQL editor to create the table and all necessary components

-- First, check if update_updated_at_column function exists, create if not
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the liked_search_results table
CREATE TABLE IF NOT EXISTS liked_search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Result identification
  result_id TEXT NOT NULL, -- Original result ID from search provider
  provider TEXT NOT NULL, -- Search provider (perplexity, exa, brave, etc.)
  
  -- Content data
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  snippet TEXT,
  source TEXT, -- Domain/source name
  
  -- Metadata
  content_type TEXT, -- journal-article, clinical-trial, etc.
  evidence_level TEXT, -- systematic-review, rct, etc.
  relevance_score DECIMAL(3,2),
  published_date DATE,
  
  -- User interaction
  notes TEXT, -- User's personal notes
  tags TEXT[], -- User-defined tags
  
  -- Search context
  original_query TEXT NOT NULL, -- The search query that found this result
  search_filters JSONB, -- The filters used in the search
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique likes per user per result
  UNIQUE(user_id, result_id, provider)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_liked_results_user_id ON liked_search_results(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_results_provider ON liked_search_results(provider);
CREATE INDEX IF NOT EXISTS idx_liked_results_content_type ON liked_search_results(content_type);
CREATE INDEX IF NOT EXISTS idx_liked_results_evidence_level ON liked_search_results(evidence_level);
CREATE INDEX IF NOT EXISTS idx_liked_results_tags ON liked_search_results USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_liked_results_created_at ON liked_search_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_liked_results_url ON liked_search_results(url);

-- Row Level Security
ALTER TABLE liked_search_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own liked results" ON liked_search_results;
DROP POLICY IF EXISTS "Users can like search results" ON liked_search_results;
DROP POLICY IF EXISTS "Users can update their liked results" ON liked_search_results;
DROP POLICY IF EXISTS "Users can unlike search results" ON liked_search_results;

-- RLS Policies
CREATE POLICY "Users can view their own liked results" ON liked_search_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can like search results" ON liked_search_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their liked results" ON liked_search_results
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can unlike search results" ON liked_search_results
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
DROP TRIGGER IF EXISTS update_liked_results_updated_at ON liked_search_results;
CREATE TRIGGER update_liked_results_updated_at 
  BEFORE UPDATE ON liked_search_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created successfully
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'liked_search_results' 
ORDER BY ordinal_position;

-- Show all indexes on the table
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'liked_search_results';

-- Show RLS policies
SELECT 
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'liked_search_results';