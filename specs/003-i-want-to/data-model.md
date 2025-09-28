# Data Model: Custom Report Templates

## Core Entities

### UserReportTemplate

**Purpose**: Represents a user-created template for medical report generation

**Attributes**:
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to profiles.id)
- `name`: Text (2-100 characters, unique per user)
- `example_structure`: Text (10-50,000 characters)
- `notes`: Text (0-10,000 characters, optional)
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone
- `usage_count`: Integer (default 0)
- `last_used_at`: Timestamp with timezone (nullable)

**Validation Rules**:
- Name must be unique per user_id
- Name must match pattern: `^[a-zA-Z0-9\s\-_.,()]+$`
- Example structure minimum 10 characters to ensure meaningful content
- Notes are optional but if provided, must be non-empty after trimming
- User can have maximum 50 templates

**Relationships**:
- Belongs to User (profiles table) via user_id
- One-to-many relationship (User has many UserReportTemplates)

**State Transitions**:
- Created → Active (immediately upon creation)
- Active → Updated (when modified)
- Active → Used (when selected for report generation, increments usage_count)

## Database Schema

### Table: user_report_templates

```sql
CREATE TABLE user_report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    example_structure TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT user_report_templates_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
    CONSTRAINT user_report_templates_example_length CHECK (char_length(example_structure) >= 10 AND char_length(example_structure) <= 50000),
    CONSTRAINT user_report_templates_notes_length CHECK (char_length(notes) <= 10000),
    CONSTRAINT user_report_templates_name_unique_per_user UNIQUE (user_id, name)
);

-- Indexes for performance
CREATE INDEX idx_user_report_templates_user_id ON user_report_templates(user_id);
CREATE INDEX idx_user_report_templates_created_at ON user_report_templates(user_id, created_at DESC);
CREATE INDEX idx_user_report_templates_usage ON user_report_templates(user_id, usage_count DESC);

-- RLS Policies
ALTER TABLE user_report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates" ON user_report_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON user_report_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON user_report_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON user_report_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Function to enforce template limit per user
CREATE OR REPLACE FUNCTION check_user_template_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM user_report_templates WHERE user_id = NEW.user_id) >= 50 THEN
        RAISE EXCEPTION 'User cannot have more than 50 templates';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_template_limit
    BEFORE INSERT ON user_report_templates
    FOR EACH ROW
    EXECUTE FUNCTION check_user_template_limit();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_report_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_timestamp
    BEFORE UPDATE ON user_report_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_user_report_template_updated_at();
```

## TypeScript Types

### Core Types

```typescript
export interface UserReportTemplate {
  id: string;
  user_id: string;
  name: string;
  example_structure: string;
  notes: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
  last_used_at: string | null;
}

export interface CreateTemplateRequest {
  name: string;
  example_structure: string;
  notes?: string;
}

export interface UpdateTemplateRequest {
  name?: string;
  example_structure?: string;
  notes?: string;
}

export interface TemplateUsageRequest {
  template_id: string;
}
```

### Validation Schemas (Zod)

```typescript
import { z } from 'zod';

export const templateNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Name contains invalid characters');

export const exampleStructureSchema = z
  .string()
  .min(10, 'Example structure must be at least 10 characters')
  .max(50000, 'Example structure must be less than 50,000 characters');

export const notesSchema = z
  .string()
  .max(10000, 'Notes must be less than 10,000 characters')
  .optional()
  .default('');

export const createTemplateSchema = z.object({
  name: templateNameSchema,
  example_structure: exampleStructureSchema,
  notes: notesSchema,
});

export const updateTemplateSchema = z.object({
  name: templateNameSchema.optional(),
  example_structure: exampleStructureSchema.optional(),
  notes: notesSchema,
}).refine(data => 
  Object.values(data).some(value => value !== undefined),
  'At least one field must be updated'
);
```

## Data Access Patterns

### Common Queries

1. **List user templates** (ordered by most recent):
   ```sql
   SELECT * FROM user_report_templates 
   WHERE user_id = $1 
   ORDER BY created_at DESC;
   ```

2. **Search user templates**:
   ```sql
   SELECT * FROM user_report_templates 
   WHERE user_id = $1 
   AND (name ILIKE $2 OR notes ILIKE $2)
   ORDER BY usage_count DESC, created_at DESC;
   ```

3. **Get template usage statistics**:
   ```sql
   SELECT COUNT(*) as total_templates,
          AVG(usage_count) as avg_usage,
          MAX(last_used_at) as last_activity
   FROM user_report_templates 
   WHERE user_id = $1;
   ```

### Performance Considerations

- **Caching Strategy**: Client-side caching of user templates with invalidation on CRUD operations
- **Pagination**: Not initially required due to 50 template limit
- **Search**: Client-side search for template names, server-side full-text search for content if needed
- **Indexing**: Compound indexes on (user_id, created_at) and (user_id, usage_count) for common access patterns

## Integration Points

### Existing Systems

1. **Profiles Table**: Foreign key relationship ensures data integrity and RLS compliance
2. **Georgian Transcription**: Template selection will enhance AI prompts in existing flow
3. **Flowise Service**: Template data passed as additional context in prompt construction

### Future Considerations

1. **Template Categories**: Could add `category` field for user-defined organization
2. **Template Sharing**: Could add `is_public` flag and sharing permissions
3. **Template Versioning**: Could add `version` field and `parent_template_id` for history
4. **Usage Analytics**: Could expand tracking for template effectiveness metrics

This data model provides a solid foundation for the custom report templates feature while maintaining consistency with existing architecture patterns and constitutional requirements for medical data privacy and security.