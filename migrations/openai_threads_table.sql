-- Create openai_threads table for OpenAI Assistant conversation management
CREATE TABLE IF NOT EXISTS public.openai_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_id TEXT NOT NULL,
    thread_id TEXT UNIQUE NOT NULL, -- OpenAI thread ID (thread_abc123)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT openai_threads_conversation_user_unique UNIQUE (conversation_id, user_id),
    CONSTRAINT openai_threads_thread_id_length CHECK (char_length(thread_id) >= 10 AND char_length(thread_id) <= 100),
    CONSTRAINT openai_threads_conversation_id_length CHECK (char_length(conversation_id) >= 1 AND char_length(conversation_id) <= 255)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_openai_threads_user_id ON public.openai_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_openai_threads_conversation_id ON public.openai_threads(conversation_id);
CREATE INDEX IF NOT EXISTS idx_openai_threads_thread_id ON public.openai_threads(thread_id);
CREATE INDEX IF NOT EXISTS idx_openai_threads_created_at ON public.openai_threads(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_openai_threads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_openai_threads_updated_at
    BEFORE UPDATE ON public.openai_threads
    FOR EACH ROW
    EXECUTE FUNCTION handle_openai_threads_updated_at();

-- Enable Row Level Security
ALTER TABLE public.openai_threads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own threads" 
    ON public.openai_threads FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own threads" 
    ON public.openai_threads FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads" 
    ON public.openai_threads FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads" 
    ON public.openai_threads FOR DELETE 
    USING (auth.uid() = user_id); 