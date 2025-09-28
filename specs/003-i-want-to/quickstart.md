# Quickstart: Custom Report Templates Feature

## Feature Overview

This feature enables cardiologists to create personalized report templates that guide AI-generated medical reports from Georgian transcripts. Templates appear in a "My Templates" section above the existing "Cardiologist Consults" section.

## User Journey Validation

### Story 1: Create First Template
**Given**: User is on the Templates page with an active transcript  
**When**: User clicks "Add Template" button in "My Templates" section  
**Then**: Modal opens with template creation form

**Expected Elements**:
- "My Templates" section header with "Add Template" button
- Modal with fields: name, example structure (textarea), notes (textarea)
- Form validation preventing empty required fields
- Save/Cancel actions

### Story 2: Use Custom Template
**Given**: User has created custom templates and has an active transcript  
**When**: User selects their custom template for report generation  
**Then**: AI generates report following the template structure

**Expected Flow**:
- Custom templates appear as cards in "My Templates" section
- Template selection triggers AI processing with enhanced prompt
- Generated report reflects template structure and includes guidance from notes

### Story 3: Manage Templates
**Given**: User has multiple custom templates  
**When**: User views Templates page  
**Then**: Templates are displayed with management options

**Expected Features**:
- Search functionality across template names and notes
- Edit template capability (reopens modal with current data)
- Delete template with confirmation
- Usage statistics visible on template cards

## Technical Validation Checklist

### Database Operations
- [ ] Create `user_report_templates` table with proper RLS policies
- [ ] Verify foreign key constraint to `profiles` table
- [ ] Test template name uniqueness per user
- [ ] Validate character limits and constraints
- [ ] Confirm 50 template limit enforcement

### API Endpoints
- [ ] GET /user-templates returns user's templates
- [ ] POST /user-templates creates new template with validation
- [ ] PUT /user-templates/:id updates existing template
- [ ] DELETE /user-templates/:id removes template
- [ ] POST /user-templates/:id/use tracks usage statistics

### Frontend Components
- [ ] "My Templates" section renders above "Cardiologist Consults"
- [ ] "Add Template" button opens modal with form
- [ ] Template cards display name, preview, and action buttons
- [ ] Search functionality filters templates in real-time
- [ ] Edit modal pre-populates with existing template data
- [ ] Delete confirmation prevents accidental removal

### Integration Points
- [ ] Template selection enhances Flowise AI prompts
- [ ] Generated reports reflect template structure
- [ ] Template notes guide AI behavior appropriately
- [ ] Mobile responsive design maintains 44px touch targets
- [ ] Performance meets <200ms response time requirement

### Security & Privacy
- [ ] Row Level Security prevents cross-user template access
- [ ] Input validation prevents XSS attacks
- [ ] Template content sanitization maintains functionality
- [ ] HIPAA compliance maintained for medical template data

## Test Data Setup

### Sample Templates for Testing

```json
{
  "templates": [
    {
      "name": "Emergency Cardiology Assessment",
      "example_structure": "# Emergency Cardiac Assessment\n\n## Chief Complaint\n[Patient's primary concern]\n\n## Vital Signs\n- Blood Pressure: [value] mmHg\n- Heart Rate: [value] bpm\n- O2 Saturation: [value]%\n\n## ECG Findings\n[12-lead ECG interpretation]\n\n## Assessment & Plan\n[Clinical impression and treatment plan]",
      "notes": "Focus on time-sensitive interventions. Include STEMI criteria if relevant. Emphasize door-to-balloon time considerations."
    },
    {
      "name": "Follow-up Consultation",
      "example_structure": "# Cardiology Follow-up\n\n## Interval History\n[Changes since last visit]\n\n## Current Medications\n[List with dosages and compliance]\n\n## Physical Examination\n[Cardiovascular findings]\n\n## Diagnostic Studies\n[Recent tests and results]\n\n## Plan\n[Ongoing management and next steps]",
      "notes": "Focus on medication compliance and lifestyle modifications. Include any adjustments to therapy."
    }
  ]
}
```

### Test Scenarios

1. **Template Creation Flow**:
   - Navigate to Templates page with active transcript
   - Click "Add Template" 
   - Fill form with sample data above
   - Verify template appears in "My Templates" section

2. **Template Usage Flow**:
   - Select created template from "My Templates"
   - Verify AI prompt includes template structure and notes
   - Confirm generated report follows template format

3. **Template Management Flow**:
   - Edit existing template (change name/structure/notes)
   - Search for templates using partial name match
   - Delete template with confirmation

## Performance Benchmarks

### Response Time Targets
- Template list loading: <100ms
- Template creation: <200ms
- Template search: <50ms (client-side)
- Modal open/close: <100ms

### Data Limits
- Maximum 50 templates per user
- Template names: 2-100 characters
- Example structure: 10-50,000 characters
- Notes: 0-10,000 characters

## Mobile Testing Requirements

### Viewport Testing
- 320px (iPhone SE)
- 375px (iPhone 12/13 Mini)
- 414px (iPhone 12/13 Pro Max)

### Touch Target Validation
- All buttons minimum 44px touch target
- Modal close actions easily accessible
- Form inputs sized appropriately for mobile keyboards

### Mobile-Specific Behaviors
- Modal sizing adapts to viewport
- Textarea resizing works on mobile devices
- Keyboard appearance doesn't break layout
- Scroll behavior maintained within modal

## Error Handling Scenarios

### User Errors
- Duplicate template names → Show validation error
- Empty required fields → Highlight missing data
- Character limit exceeded → Show character count and limit
- Maximum templates reached → Show upgrade/cleanup message

### System Errors
- Network failure during save → Show retry option
- Database constraint violation → User-friendly error message
- Authentication expiry → Redirect to login with return URL

## Success Metrics

### Feature Adoption
- Percentage of users creating custom templates
- Average number of templates per active user
- Template usage frequency vs. default templates

### User Experience
- Template creation completion rate
- Time to first successful template use
- User satisfaction scores for template feature

### Technical Performance
- API response times within targets
- Database query performance for template operations
- UI responsiveness on mobile devices

This quickstart provides a comprehensive validation framework for ensuring the custom report templates feature meets all functional, technical, and constitutional requirements while delivering an excellent user experience for medical professionals.