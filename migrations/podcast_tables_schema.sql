-- Podcast System Database Schema
-- Creates tables and functions for AI podcast generation functionality

-- Create ai_podcasts table
CREATE TABLE IF NOT EXISTS ai_podcasts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    synthesis_style text NOT NULL CHECK (synthesis_style IN ('podcast', 'executive-briefing', 'debate')),
    specialty text NOT NULL,
    source_documents jsonb NOT NULL DEFAULT '[]'::jsonb,
    voice_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    playnote_id text,
    audio_url text,
    duration integer, -- duration in seconds
    transcript text,
    error_message text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create podcast_queue table
CREATE TABLE IF NOT EXISTS podcast_queue (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    podcast_id uuid REFERENCES ai_podcasts(id) ON DELETE CASCADE NOT NULL,
    position integer NOT NULL,
    status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'processing', 'completed', 'failed')),
    document_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
    generation_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create podcast_favorites table
CREATE TABLE IF NOT EXISTS podcast_favorites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    podcast_id uuid REFERENCES ai_podcasts(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, podcast_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_podcasts_user_id ON ai_podcasts(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_podcasts_status ON ai_podcasts(status);
CREATE INDEX IF NOT EXISTS idx_ai_podcasts_created_at ON ai_podcasts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_podcast_queue_user_id ON podcast_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_queue_status ON podcast_queue(status);
CREATE INDEX IF NOT EXISTS idx_podcast_queue_position ON podcast_queue(position);
CREATE INDEX IF NOT EXISTS idx_podcast_queue_podcast_id ON podcast_queue(podcast_id);

CREATE INDEX IF NOT EXISTS idx_podcast_favorites_user_id ON podcast_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_favorites_podcast_id ON podcast_favorites(podcast_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_ai_podcasts_updated_at 
    BEFORE UPDATE ON ai_podcasts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_podcast_queue_updated_at 
    BEFORE UPDATE ON podcast_queue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC function to get next queue position
CREATE OR REPLACE FUNCTION get_next_queue_position()
RETURNS integer AS $$
DECLARE
    next_position integer;
BEGIN
    SELECT COALESCE(MAX(position), 0) + 1
    INTO next_position
    FROM podcast_queue
    WHERE status IN ('waiting', 'processing');
    
    RETURN next_position;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE ai_podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_podcasts
CREATE POLICY "Users can view their own podcasts" ON ai_podcasts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own podcasts" ON ai_podcasts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcasts" ON ai_podcasts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own podcasts" ON ai_podcasts
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for podcast_queue
CREATE POLICY "Users can view their own queue items" ON podcast_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own queue items" ON podcast_queue
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queue items" ON podcast_queue
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queue items" ON podcast_queue
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for podcast_favorites
CREATE POLICY "Users can view their own favorites" ON podcast_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON podcast_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON podcast_favorites
    FOR DELETE USING (auth.uid() = user_id);