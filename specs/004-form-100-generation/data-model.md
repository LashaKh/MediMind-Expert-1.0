# Data Model: Form 100 Generation System

## Core Entities

### DiagnosisCode
```typescript
interface DiagnosisCode {
  code: string;           // ICD-10 code (e.g., "I20.0")
  georgianName: string;   // Georgian description
  englishName: string;    // English description  
  category: DiagnosisCategory;
  flowiseEndpoint: string | null; // Live endpoint URL or null for mock
}
```

**Validation Rules**:
- `code` must match ICD-10 format pattern
- `georgianName` and `englishName` are required, non-empty strings
- `flowiseEndpoint` must be valid URL format when not null

**Relationships**:
- Belongs to one `DiagnosisCategory`
- Referenced by `Form100Request` for processing

### DiagnosisCategory  
```typescript
interface DiagnosisCategory {
  primaryCode: string;    // Primary diagnosis code (I24.9, I26.0, I50.0)
  name: string;          // Category display name
  diagnoses: DiagnosisCode[]; // Available diagnosis options
}
```

**Validation Rules**:
- `primaryCode` must be valid ICD-10 code
- `diagnoses` array must contain 1-10 items
- Each category requires at least one diagnosis with live endpoint

**Relationships**:
- Has many `DiagnosisCode` entities
- Determined by primary diagnosis in ER consultation report

### Form100Request
```typescript
interface Form100Request {
  erConsultReport: string;      // Original ER consultation text
  selectedDiagnosis: DiagnosisCode; // Chosen final diagnosis
  doctorTranscript?: string;    // Optional voice transcript
  angiographyReport?: string;   // Optional angiography findings
  sessionId: string;           // Session isolation identifier
  timestamp: number;           // Request creation time
}
```

**Validation Rules**:
- `erConsultReport` is required, minimum 100 characters
- `selectedDiagnosis` must be valid `DiagnosisCode` entity
- `doctorTranscript` and `angiographyReport` are optional but recommended
- `sessionId` must be unique identifier format
- `timestamp` must be valid Unix timestamp

**State Transitions**:
1. **Draft**: Initial state with ER report loaded
2. **DiagnosisSelected**: User selected diagnosis from dropdown
3. **InputsProvided**: Optional fields completed (transcript/angiography)
4. **Processing**: Request sent to Flowise endpoint
5. **Completed**: Form 100 content generated successfully
6. **Failed**: Processing failed, error state with retry option

### Form100Response
```typescript
interface Form100Response {
  requestId: string;           // Reference to original request
  form100Content: string;      // Generated Form 100 document
  processingTime: number;      // Generation time in milliseconds
  endpoint: string;           // Flowise endpoint used
  isMockResponse: boolean;    // True for mock endpoints
  generatedAt: number;        // Response timestamp
}
```

**Validation Rules**:
- `form100Content` must be non-empty string with medical format
- `processingTime` must be positive number
- `endpoint` must match valid Flowise URL pattern
- `generatedAt` must be after request timestamp

**Relationships**:
- One-to-one with `Form100Request`
- Used for display, export, and audit trail

## Component State Models

### Form100ModalState
```typescript
interface Form100ModalState {
  isOpen: boolean;
  currentStep: 'diagnosis' | 'inputs' | 'processing' | 'completed';
  selectedCategory: DiagnosisCategory | null;
  selectedDiagnosis: DiagnosisCode | null;
  doctorTranscript: string;
  angiographyReport: string;
  isProcessing: boolean;
  generatedForm: Form100Response | null;
  error: string | null;
}
```

### VoiceTranscriptState
```typescript
interface VoiceTranscriptState {
  isRecording: boolean;
  transcript: string;
  isTranscribing: boolean;
  recordingDuration: number;
  audioLevel: number;
  error: string | null;
}
```

## Data Persistence

### Local Storage
- Selected diagnosis preferences by user
- Draft transcript content for session recovery
- Form 100 generation history (last 5 requests)

### Session Storage  
- Current modal state during Form 100 workflow
- Voice recording session data
- Temporary angiography report content

### Database (Future Enhancement)
- Form 100 audit trail for compliance
- User-specific diagnosis selection patterns
- Performance metrics for endpoint optimization

## Configuration Data

### Diagnosis Mappings
```typescript
const DIAGNOSIS_CATEGORIES: DiagnosisCategory[] = [
  {
    primaryCode: "I24.9",
    name: "გულის მწვავე იშემიური ავადმყოფობა, დაუზუსტებელი",
    diagnoses: [
      {
        code: "I20.0",
        georgianName: "არასტაბილური სტენოკარდია Braunwald III Troponin +",
        englishName: "Unstable Angina Braunwald III Troponin +",
        category: "I24.9",
        flowiseEndpoint: "https://flowise-2-0.onrender.com/api/v1/prediction/6dc8bb6d-ce79-4a40-9561-9108ba05e7c7"
      },
      {
        code: "I21.4",
        georgianName: "მიოკარდიუმის მწვავე სუბენდოკარდიული ინფარქტი",
        englishName: "Acute Subendocardial Myocardial Infarction",
        category: "I24.9",
        flowiseEndpoint: null // Mock endpoint
      },
      // ... additional I24.9 diagnoses
    ]
  },
  {
    primaryCode: "I26.0", 
    name: "ფილტვის არტერიის ემბოლია მწვავე ფილტვისმიერი გულის დროს",
    diagnoses: [
      // Mock diagnoses for pulmonary embolism
    ]
  },
  {
    primaryCode: "I50.0",
    name: "გულის შეგუბებითი უკმარისობა", 
    diagnoses: [
      // Mock diagnoses for heart failure
    ]
  }
];
```

### Endpoint Configuration
```typescript
const FLOWISE_ENDPOINTS = {
  live: {
    "I20.0": "https://flowise-2-0.onrender.com/api/v1/prediction/6dc8bb6d-ce79-4a40-9561-9108ba05e7c7"
  },
  mock: {
    baseUrl: "https://mock-flowise-api.example.com",
    fallbackResponse: "Form 100 mock content generated successfully"
  }
};
```

## Error States & Recovery

### Validation Errors
- Invalid diagnosis selection
- Empty required fields
- Malformed input data

### Processing Errors  
- Flowise endpoint unavailable
- Network connectivity issues
- Invalid API response format

### Recovery Strategies
- Automatic retry with exponential backoff
- Fallback to mock endpoints for development
- Session state preservation for manual retry
- Clear error messaging with action recommendations