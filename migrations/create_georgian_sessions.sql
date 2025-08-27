-- Create georgian_sessions table for storing Georgian speech-to-text sessions
-- This table will store user recording sessions with transcripts and metadata

CREATE TABLE IF NOT EXISTS public.georgian_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    transcript TEXT,
    duration_ms INTEGER DEFAULT 0,
    audio_file_url TEXT,
    processing_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Add RLS policies
ALTER TABLE public.georgian_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON public.georgian_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON public.georgian_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON public.georgian_sessions
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON public.georgian_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS georgian_sessions_user_id_idx ON public.georgian_sessions(user_id);
CREATE INDEX IF NOT EXISTS georgian_sessions_created_at_idx ON public.georgian_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS georgian_sessions_is_active_idx ON public.georgian_sessions(is_active);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_georgian_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_georgian_sessions_updated_at
    BEFORE UPDATE ON public.georgian_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_georgian_sessions_updated_at();

-- Grant permissions
GRANT ALL ON public.georgian_sessions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;