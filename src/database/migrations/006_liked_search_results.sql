-- Liked Search Results Database Schema
-- This migration adds a table for saving liked search results across all providers

-- Liked search results table
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
CREATE INDEX idx_liked_results_user_id ON liked_search_results(user_id);
CREATE INDEX idx_liked_results_provider ON liked_search_results(provider);
CREATE INDEX idx_liked_results_content_type ON liked_search_results(content_type);
CREATE INDEX idx_liked_results_evidence_level ON liked_search_results(evidence_level);
CREATE INDEX idx_liked_results_tags ON liked_search_results USING GIN(tags);
CREATE INDEX idx_liked_results_created_at ON liked_search_results(created_at DESC);
CREATE INDEX idx_liked_results_url ON liked_search_results(url);

-- Row Level Security
ALTER TABLE liked_search_results ENABLE ROW LEVEL SECURITY;

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
CREATE TRIGGER update_liked_results_updated_at BEFORE UPDATE ON liked_search_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();