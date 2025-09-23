-- Migration: Report Editing Schema
-- Created: 2025-09-22
-- Purpose: MediScribe Interactive Report Editing tables and policies

-- Report editing operations
CREATE TABLE report_edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    edit_type TEXT NOT NULL CHECK (edit_type IN ('text_instruction', 'voice_instruction', 'manual_edit')),
    instruction_text TEXT,
    voice_transcript TEXT,
    original_content TEXT NOT NULL,
    updated_content TEXT NOT NULL,
    processing_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT different_content CHECK (original_content != updated_content),
    CONSTRAINT voice_transcript_required CHECK (
        (edit_type != 'voice_instruction') OR (voice_transcript IS NOT NULL)
    )
);

-- Report version history
CREATE TABLE report_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    edit_summary TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    created_by_edit_id UUID REFERENCES report_edits(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(report_id, version_number),
    UNIQUE(report_id, is_current) WHERE is_current = TRUE
);

-- Edit session tracking
CREATE TABLE edit_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
    total_edits INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Row Level Security Policies

-- Report edits - users can only access their own edits
ALTER TABLE report_edits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own report edits" ON report_edits
    FOR ALL USING (auth.uid() = user_id);

-- Report versions - users can only access their own versions
ALTER TABLE report_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own report versions" ON report_versions
    FOR ALL USING (auth.uid() = user_id);

-- Edit sessions - users can only access their own sessions
ALTER TABLE edit_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own edit sessions" ON edit_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Indexes for Performance

-- Query optimization
CREATE INDEX idx_report_edits_report_session ON report_edits(report_id, session_id);
CREATE INDEX idx_report_edits_user_created ON report_edits(user_id, created_at);
CREATE INDEX idx_report_versions_report_current ON report_versions(report_id, is_current);
CREATE INDEX idx_edit_sessions_user_status ON edit_sessions(user_id, status);