# ClinicalActionPlanDisplay Component

A production-ready React component for displaying clinical action plans and treatment protocols with beautiful formatting and interactive features.

## Features

- **Smart Markdown Parsing**: Automatically detects and categorizes clinical sections
- **Priority-Based Color Coding**: Visual hierarchy (Critical: Red, High: Orange, Medium: Blue, Low: Green)  
- **Interactive Elements**: Expandable sections, action completion tracking, progress indicators
- **Medical-First Design**: Professional medical interface with clinical icons and terminology
- **Responsive Layout**: Mobile-optimized for healthcare professionals
- **Export Options**: Copy, download, and print functionality

## Usage

### Basic Usage

```tsx
import { ClinicalActionPlanDisplay } from '@/components/AICopilot';

const MyComponent = () => {
  const actionPlan = `
# Treatment Action Plan

## Immediate Interventions
- Administer 3% saline bolus 100-150 mL over 20 minutes
- Monitor neurological status continuously
- Restrict fluid intake to 1-1.5 L/day

## Monitoring & Assessment
- Check serum sodium every 2-4 hours
- Monitor urine output and osmolality
- Assess volume status regularly

## Medications
- Tolvaptan 15 mg orally daily
- Discontinue thiazide diuretics
  `;

  return (
    <ClinicalActionPlanDisplay
      actionPlan={actionPlan}
      onActionComplete={(actionId) => console.log('Completed:', actionId)}
      showProgress={true}
      editable={true}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actionPlan` | `string` | - | The markdown-formatted action plan text |
| `className` | `string` | - | Additional CSS classes |
| `onActionComplete` | `(actionId: string) => void` | - | Callback when action is marked complete |
| `editable` | `boolean` | `false` | Allow marking actions as complete |
| `showProgress` | `boolean` | `true` | Show progress statistics and bars |

## Smart Parsing

The component automatically detects and categorizes sections based on keywords:

### Section Types
- **Immediate Interventions** (Critical): Keywords like "immediate", "urgent", "critical", "emergent"
- **Monitoring & Assessment** (High): Keywords like "monitor", "assess", "check", "evaluate"
- **Medications & Treatments** (High): Keywords like "medication", "drug", "therapy", "treatment"
- **Laboratory & Diagnostics** (Medium): Keywords like "lab", "test", "diagnostic", "investigation"
- **Follow-up Care** (Medium): Keywords like "follow-up", "discharge", "clinic", "referral"
- **General Interventions** (Medium): All other clinical actions

### Priority Detection
- **Critical**: "immediate", "stat", "urgent", "critical", "emergent"
- **High**: "high", "priority", "important", "asap"
- **Medium**: Default for most actions
- **Low**: "routine", "standard", "low"

## Styling

The component uses a medical-first color scheme:

- **Critical Actions**: Red (`bg-red-50`, `text-red-700`)
- **High Priority**: Orange (`bg-orange-50`, `text-orange-700`) 
- **Medium Priority**: Blue (`bg-blue-50`, `text-blue-700`)
- **Low Priority**: Green (`bg-green-50`, `text-green-700`)

## Medical Icons

Each section type has appropriate medical icons:
- 🚨 **Immediate**: AlertTriangle (Critical interventions)
- 📊 **Monitoring**: Monitor (Ongoing assessment)
- 💊 **Medications**: Pill (Drug therapy)
- 🔬 **Diagnostics**: Activity (Lab tests)
- 📅 **Follow-up**: Calendar (Continued care)
- 🩺 **Interventions**: Stethoscope (Clinical procedures)

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- High contrast color scheme
- Touch-friendly mobile interface
- WCAG 2.1 AA compliant

## Integration

Works seamlessly with existing medical UI components:
- Uses existing `Card`, `Button`, `Badge` components
- Supports dark/light theme switching
- Mobile-first responsive design
- Professional medical styling

## Example Use Cases

1. **AI-Generated Treatment Plans**: Display AI-generated clinical recommendations
2. **Clinical Protocols**: Show standardized treatment protocols
3. **Care Plans**: Display comprehensive patient care plans
4. **Discharge Instructions**: Format discharge planning documents
5. **Emergency Protocols**: Show critical care action plans

## Dependencies

- React 18+
- Lucide React (for icons)
- Tailwind CSS (for styling)
- Existing UI components (Card, Button, Badge)