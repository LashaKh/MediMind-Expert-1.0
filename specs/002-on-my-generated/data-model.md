# Data Model: MediScribe Interactive Report Editing

## Core Entities

### ReportEdit
**Purpose**: Tracks individual edit operations on medical reports
**Fields**:
- `id`: UUID (Primary Key)
- `report_id`: String (References ProcessingHistory.id)
- `user_id`: UUID (Foreign Key to profiles table)
- `session_id`: String (For session isolation)
- `edit_type`: Enum ['text_instruction', 'voice_instruction', 'manual_edit']
- `instruction_text`: Text (Original instruction or edit content)
- `voice_transcript`: Text (Nullable - transcribed voice instruction)
- `original_content`: Text (Report content before edit)
- `updated_content`: Text (Report content after edit)
- `processing_metadata`: JSONB (AI processing details, tokens used, etc.)
- `created_at`: Timestamp
- `processed_at`: Timestamp (Nullable - when AI processing completed)

**Relationships**:
- Belongs to User (user_id → profiles.id)
- References Medical Report (report_id → ProcessingHistory index)
- Self-referential for edit chains (parent_edit_id)

**Validation Rules**:
- `edit_type` must be one of: 'text_instruction', 'voice_instruction', 'manual_edit'
- `voice_transcript` required when edit_type = 'voice_instruction'
- `instruction_text` required for instruction types, optional for manual edits
- `original_content` and `updated_content` cannot be identical
- `session_id` must match existing georgian_sessions.session_id pattern

### ReportVersion
**Purpose**: Maintains complete version history of medical reports
**Fields**:
- `id`: UUID (Primary Key)
- `report_id`: String (References ProcessingHistory.id)
- `user_id`: UUID (Foreign Key to profiles table)
- `version_number`: Integer (Sequential version counter)
- `content`: Text (Complete report content at this version)
- `edit_summary`: Text (Summary of changes in this version)
- `is_current`: Boolean (Marks the active version)
- `created_by_edit_id`: UUID (Foreign Key to ReportEdit.id)
- `created_at`: Timestamp

**Relationships**:
- Belongs to User (user_id → profiles.id)
- References Medical Report (report_id → ProcessingHistory index)
- Created by Edit (created_by_edit_id → ReportEdit.id)

**Validation Rules**:
- Only one version per report_id can have is_current = true
- `version_number` must be sequential and unique per report_id
- `content` cannot be empty or null
- `edit_summary` required for versions created by edits

### EditSession
**Purpose**: Groups related edit operations for workflow tracking
**Fields**:
- `id`: UUID (Primary Key)
- `report_id`: String (References ProcessingHistory.id)
- `user_id`: UUID (Foreign Key to profiles table)
- `session_id`: String (Links to georgian_sessions for voice operations)
- `status`: Enum ['active', 'completed', 'cancelled']
- `total_edits`: Integer (Count of edits in this session)
- `started_at`: Timestamp
- `completed_at`: Timestamp (Nullable)

**Relationships**:
- Belongs to User (user_id → profiles.id)
- Has many Edits (ReportEdit.session_id → EditSession.session_id)
- Links to Georgian Session (session_id → georgian_sessions.session_id)

**Validation Rules**:
- `status` must be one of: 'active', 'completed', 'cancelled'
- `completed_at` required when status != 'active'
- `total_edits` must match actual count of related ReportEdit records

## State Transitions

### Edit Operation Lifecycle
```
1. User expands report → Create EditSession (status: 'active')
2. User inputs instruction → Create ReportEdit (processing state)
3. Voice transcription (if applicable) → Update ReportEdit.voice_transcript
4. AI processing → Update ReportEdit.processing_metadata
5. Content update → Create ReportVersion, update ReportEdit.updated_content
6. User saves/completes → Update EditSession (status: 'completed')
```

### Report Version Flow
```
Original Report (v1) → Edit Instructions → Updated Report (v2)
Each edit creates new version with complete content snapshot
is_current flag moves from previous to new version
Version history preserves complete audit trail
```

### Session Management
```
Session Start → EditSession.active + georgian_sessions (for voice)
Multiple Edits → ReportEdit records linked to session
Session End → EditSession.completed + cleanup temporary data
```

## Database Schema Extensions

### New Tables

```sql
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
```

### Row Level Security Policies

```sql
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
```

### Indexes for Performance

```sql
-- Query optimization
CREATE INDEX idx_report_edits_report_session ON report_edits(report_id, session_id);
CREATE INDEX idx_report_edits_user_created ON report_edits(user_id, created_at);
CREATE INDEX idx_report_versions_report_current ON report_versions(report_id, is_current);
CREATE INDEX idx_edit_sessions_user_status ON edit_sessions(user_id, status);
```

## Integration Points

### Existing georgian_sessions Table
- `session_id` field links EditSession to voice transcription sessions
- No schema changes needed - use existing session isolation patterns
- Voice instructions leverage existing TTS infrastructure

### ProcessingHistory Integration
- `report_id` references existing medical analysis records
- Maintain compatibility with current MedicalAnalysisCard structure
- Preserve existing report metadata and timestamps

### User Profile Integration
- All tables reference existing `auth.users(id)` for user ownership
- Maintain existing Row Level Security patterns
- Support specialty-aware data access (Cardiology vs OB/GYN)

## Data Access Patterns

### Report Loading
- Fetch current version: `SELECT * FROM report_versions WHERE report_id = ? AND is_current = true`
- Load edit history: `SELECT * FROM report_edits WHERE report_id = ? ORDER BY created_at DESC`

### Version Management
- Create new version: Insert report_versions with incremented version_number
- Update current flag: Transaction to unset old current, set new current

### Session Tracking
- Active sessions: `SELECT * FROM edit_sessions WHERE user_id = ? AND status = 'active'`
- Session cleanup: Update status and completed_at timestamp