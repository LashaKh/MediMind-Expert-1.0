# Phase 1: Data Model

**Feature**: Platform Performance Optimization for Low-End PCs
**Branch**: `005-my-platform-is`
**Date**: 2025-10-07

## Overview

This document defines the data entities, relationships, and validation rules for performance optimization tracking. All entities are designed to be privacy-safe (no PII), HIPAA-compliant, and support both client-side (LocalStorage) and optional server-side (Supabase) storage.

---

## Entity Relationship Diagram

```
┌─────────────────────────┐
│  Performance Metrics    │
│  (performance_metrics)  │
├─────────────────────────┤
│ • metric_id (PK)        │
│ • user_id (FK nullable) │◄──┐
│ • metric_type           │   │
│ • value                 │   │ Optional
│ • timestamp             │   │ relationship
│ • device_profile (JSON) │   │
│ • context (JSON)        │   │
└─────────────────────────┘   │
                              │
┌─────────────────────────┐   │
│  User Profiles          │   │
│  (profiles)             │   │
├─────────────────────────┤   │
│ • id (PK)               │───┘
│ • specialty             │
│ • created_at            │
└─────────────────────────┘

┌──────────────────────────────┐
│  Component Performance       │
│  (component_performance)     │
├──────────────────────────────┤
│ • component_id (PK)          │
│ • component_name (UNIQUE)    │
│ • file_path                  │
│ • render_count               │
│ • avg_render_time            │
│ • re_render_rate             │
│ • memory_footprint           │
│ • optimization_status        │
│ • last_analyzed              │
└──────────────────────────────┘
(Development-only, no user relationship)

┌──────────────────────────────┐
│  Device Capability Profile   │
│  (device_capabilities)       │
├──────────────────────────────┤
│ • device_id (PK, client-gen) │
│ • cpu_cores                  │
│ • device_memory              │
│ • gpu_tier                   │
│ • connection_type            │
│ • prefers_reduced_motion     │
│ • supports_webgl             │
│ • created_at                 │
└──────────────────────────────┘
(Client-side LocalStorage, optional sync)
```

---

## Entities

### 1. Performance Metrics Entity

**Purpose**: Track Web Vitals and resource usage metrics for validation of optimization effectiveness.

**Storage**:
- **Primary**: LocalStorage (client-side, fast access)
- **Secondary**: Supabase `performance_metrics` table (optional aggregated sync)

**Schema**:
```typescript
interface PerformanceMetric {
  metric_id: string;              // UUID (client-generated)
  user_id?: string;               // UUID (nullable, optional for logged-in users)
  metric_type: MetricType;        // ENUM: 'lcp', 'fid', 'cls', 'ttfb', 'cpu', 'memory', 'bundle_size'
  value: number;                  // Float (metric value in appropriate units)
  timestamp: string;              // ISO 8601 timestamp (UTC)
  device_profile: DeviceProfile;  // JSON object (device capabilities)
  context: MetricContext;         // JSON object (page route, component, action)
}

type MetricType = 'lcp' | 'fid' | 'cls' | 'ttfb' | 'cpu' | 'memory' | 'bundle_size';

interface DeviceProfile {
  cpu_cores: number;
  device_memory: number;          // GB
  connection_type: string;        // '4g', '3g', '2g', 'slow-2g', 'unknown'
  user_agent: string;             // Browser identification
}

interface MetricContext {
  page_route: string;             // Current route (e.g., '/calculators/grace')
  component_name?: string;        // Component being measured (optional)
  action_type?: string;           // User action triggering metric (optional)
}
```

**Supabase Table Definition**:
```sql
CREATE TABLE performance_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('lcp', 'fid', 'cls', 'ttfb', 'cpu', 'memory', 'bundle_size')),
  value DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_profile JSONB NOT NULL,
  context JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_performance_metrics_type_timestamp ON performance_metrics(metric_type, timestamp DESC);
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id) WHERE user_id IS NOT NULL;
```

**Validation Rules**:
1. **LCP (Largest Contentful Paint)**:
   - Must be >0ms and <60000ms (60 seconds max)
   - Rating: Good (<2500ms), Needs Improvement (2500-4000ms), Poor (>4000ms)

2. **FID (First Input Delay)**:
   - Must be >=0ms and <1000ms (1 second max)
   - Rating: Good (<100ms), Needs Improvement (100-300ms), Poor (>300ms)

3. **CLS (Cumulative Layout Shift)**:
   - Must be >=0 and <5
   - Rating: Good (<0.1), Needs Improvement (0.1-0.25), Poor (>0.25)

4. **TTFB (Time to First Byte)**:
   - Must be >0ms and <10000ms (10 seconds max)
   - Rating: Good (<800ms), Needs Improvement (800-1800ms), Poor (>1800ms)

5. **CPU Usage**:
   - Must be 0-100 (percentage)
   - Target: <40% during active use

6. **Memory Usage**:
   - Must be >0MB and <4096MB (4GB max)
   - Target: <150MB sustained

**State Transitions**:
```
Initial → Collecting → Stored (LocalStorage) → [Optional] Synced (Supabase)
```

**Privacy Considerations**:
- No medical data included in metrics
- User ID optional (supports anonymous metrics)
- Device profile aggregated (no unique identifiers)
- HIPAA-compliant (no PHI)

---

### 2. Component Performance Profile Entity

**Purpose**: Track React component rendering performance for optimization prioritization (development/debugging use).

**Storage**:
- **Development**: In-memory + LocalStorage (developer tools)
- **Production**: Disabled (zero overhead)

**Schema**:
```typescript
interface ComponentPerformanceProfile {
  component_id: string;              // UUID
  component_name: string;            // e.g., 'GRACERiskCalculator'
  file_path: string;                 // e.g., 'src/components/Calculators/GRACERiskCalculator.tsx'
  render_count: number;              // Total renders in session
  avg_render_time: number;           // Average render duration (ms)
  re_render_rate: number;            // Percentage of unnecessary re-renders (0-100)
  memory_footprint: number;          // MB per component instance
  optimization_status: OptimizationStatus; // ENUM
  last_analyzed: string;             // ISO 8601 timestamp
}

type OptimizationStatus = 'unoptimized' | 'memo' | 'callback' | 'virtualized';
```

**Supabase Table Definition** (Development only):
```sql
CREATE TABLE component_performance (
  component_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name TEXT NOT NULL UNIQUE,
  file_path TEXT NOT NULL,
  render_count INTEGER NOT NULL DEFAULT 0 CHECK (render_count >= 0),
  avg_render_time DOUBLE PRECISION NOT NULL CHECK (avg_render_time > 0),
  re_render_rate DOUBLE PRECISION NOT NULL CHECK (re_render_rate >= 0 AND re_render_rate <= 100),
  memory_footprint DOUBLE PRECISION NOT NULL CHECK (memory_footprint > 0),
  optimization_status TEXT NOT NULL CHECK (optimization_status IN ('unoptimized', 'memo', 'callback', 'virtualized')),
  last_analyzed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying unoptimized components
CREATE INDEX idx_component_optimization_status ON component_performance(optimization_status);
CREATE INDEX idx_component_re_render_rate ON component_performance(re_render_rate DESC);
```

**Validation Rules**:
1. `render_count` must be >=0
2. `avg_render_time` must be >0ms (cannot be zero if component rendered)
3. `re_render_rate` must be 0-100% (percentage of unnecessary re-renders)
4. `memory_footprint` must be >0MB
5. `component_name` must be unique (one profile per component)

**Optimization Priority**:
```typescript
function calculateOptimizationPriority(profile: ComponentPerformanceProfile): 'critical' | 'high' | 'medium' | 'low' {
  // Critical: >100 renders, >50% unnecessary re-renders
  if (profile.render_count > 100 && profile.re_render_rate > 50) {
    return 'critical';
  }

  // High: >50 renders, >30% unnecessary re-renders OR >100ms avg render time
  if ((profile.render_count > 50 && profile.re_render_rate > 30) || profile.avg_render_time > 100) {
    return 'high';
  }

  // Medium: >20 renders, >20% unnecessary re-renders
  if (profile.render_count > 20 && profile.re_render_rate > 20) {
    return 'medium';
  }

  // Low: Everything else
  return 'low';
}
```

**State Transitions**:
```
Unoptimized → Memo Applied → Callback Applied → Virtualized (if list component)
```

---

### 3. Device Capability Profile Entity

**Purpose**: Detect and store device hardware capabilities for automatic performance mode adjustment.

**Storage**:
- **Primary**: LocalStorage (`deviceCapabilities` key)
- **Secondary**: Optional Supabase sync for analytics

**Schema**:
```typescript
interface DeviceCapabilityProfile {
  device_id: string;                    // UUID (client-generated, stable across sessions)
  cpu_cores: number;                    // navigator.hardwareConcurrency (1-128)
  device_memory: number;                // navigator.deviceMemory (GB, 0.25-8+)
  gpu_tier: GPUTier;                    // Detected via WebGL context
  connection_type: ConnectionType;      // navigator.connection.effectiveType
  prefers_reduced_motion: boolean;      // matchMedia('prefers-reduced-motion')
  supports_webgl: boolean;              // WebGL context creation test
  created_at: string;                   // ISO 8601 timestamp
}

type GPUTier = 'high' | 'medium' | 'low' | 'unknown';
type ConnectionType = '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
```

**Supabase Table Definition** (Optional):
```sql
CREATE TABLE device_capabilities (
  device_id UUID PRIMARY KEY,
  cpu_cores INTEGER NOT NULL CHECK (cpu_cores >= 1 AND cpu_cores <= 128),
  device_memory DOUBLE PRECISION NOT NULL CHECK (device_memory > 0),
  gpu_tier TEXT NOT NULL CHECK (gpu_tier IN ('high', 'medium', 'low', 'unknown')),
  connection_type TEXT NOT NULL CHECK (connection_type IN ('4g', '3g', '2g', 'slow-2g', 'unknown')),
  prefers_reduced_motion BOOLEAN NOT NULL DEFAULT false,
  supports_webgl BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX idx_device_gpu_tier ON device_capabilities(gpu_tier);
CREATE INDEX idx_device_connection_type ON device_capabilities(connection_type);
```

**Validation Rules**:
1. `cpu_cores` must be 1-128 (realistic range for consumer devices)
2. `device_memory` must be >0GB (0.25GB minimum for web browsers)
3. `gpu_tier` must be one of: 'high', 'medium', 'low', 'unknown'
4. `connection_type` must be valid network type or 'unknown'
5. `device_id` generated once and persisted (stable across sessions)

**Performance Mode Decision Logic**:
```typescript
function determinePerformanceMode(profile: DeviceCapabilityProfile): 'full' | 'balanced' | 'lite' {
  // Lite mode: Low-end device
  if (
    profile.cpu_cores <= 2 ||
    profile.device_memory < 2 ||
    profile.connection_type === '2g' ||
    profile.connection_type === 'slow-2g' ||
    profile.gpu_tier === 'low'
  ) {
    return 'lite';
  }

  // Full mode: High-end device
  if (
    profile.cpu_cores >= 4 &&
    profile.device_memory >= 4 &&
    profile.gpu_tier === 'high' &&
    (profile.connection_type === '4g' || profile.connection_type === 'unknown')
  ) {
    return 'full';
  }

  // Balanced mode: Mid-range device (default)
  return 'balanced';
}
```

**Feature Enablement Matrix**:
| Feature | Lite Mode | Balanced Mode | Full Mode |
|---------|-----------|---------------|-----------|
| CSS Animations | None | Basic (opacity, transform) | All (backdrop-filter, 3D) |
| Real-time Updates | Disabled | Throttled (30s interval) | Full (3s interval) |
| Lazy Loading | Aggressive | Standard | Standard |
| Image Quality | Low (WebP) | Medium | High |
| Background Processes | Paused | Throttled | Full |

---

## Aggregated Metrics Entity (Analytics)

**Purpose**: Store aggregated performance metrics for trend analysis without storing individual measurements.

**Storage**: Supabase `performance_metrics_aggregated` table

**Schema**:
```typescript
interface AggregatedPerformanceMetrics {
  aggregate_id: string;           // UUID
  time_period: string;            // '1h', '24h', '7d', '30d'
  lcp_p95: number;                // 95th percentile LCP (ms)
  lcp_avg: number;                // Average LCP (ms)
  fid_p95: number;                // 95th percentile FID (ms)
  fid_avg: number;                // Average FID (ms)
  cls_median: number;             // Median CLS
  cls_avg: number;                // Average CLS
  ttfb_p95: number;               // 95th percentile TTFB (ms)
  cpu_avg: number;                // Average CPU usage (%)
  memory_avg: number;             // Average memory usage (MB)
  memory_max: number;             // Maximum memory usage (MB)
  device_profile_summary: JSON;   // Aggregated device capabilities
  sample_count: number;           // Number of metrics aggregated
  created_at: string;             // ISO 8601 timestamp
}
```

**Supabase Table Definition**:
```sql
CREATE TABLE performance_metrics_aggregated (
  aggregate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_period TEXT NOT NULL CHECK (time_period IN ('1h', '24h', '7d', '30d')),
  lcp_p95 DOUBLE PRECISION NOT NULL,
  lcp_avg DOUBLE PRECISION NOT NULL,
  fid_p95 DOUBLE PRECISION NOT NULL,
  fid_avg DOUBLE PRECISION NOT NULL,
  cls_median DOUBLE PRECISION NOT NULL,
  cls_avg DOUBLE PRECISION NOT NULL,
  ttfb_p95 DOUBLE PRECISION NOT NULL,
  cpu_avg DOUBLE PRECISION NOT NULL,
  memory_avg DOUBLE PRECISION NOT NULL,
  memory_max DOUBLE PRECISION NOT NULL,
  device_profile_summary JSONB NOT NULL,
  sample_count INTEGER NOT NULL CHECK (sample_count > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for time-series queries
CREATE INDEX idx_aggregated_time_period_created ON performance_metrics_aggregated(time_period, created_at DESC);
```

**Aggregation Logic**:
```typescript
// Run hourly via cron job or Supabase Edge Function
async function aggregateMetrics(timePeriod: '1h' | '24h' | '7d' | '30d') {
  const startTime = getStartTime(timePeriod); // e.g., now - 1 hour
  const metrics = await fetchMetricsSince(startTime);

  const aggregated = {
    time_period: timePeriod,
    lcp_p95: percentile(metrics.filter(m => m.metric_type === 'lcp').map(m => m.value), 95),
    lcp_avg: average(metrics.filter(m => m.metric_type === 'lcp').map(m => m.value)),
    fid_p95: percentile(metrics.filter(m => m.metric_type === 'fid').map(m => m.value), 95),
    fid_avg: average(metrics.filter(m => m.metric_type === 'fid').map(m => m.value)),
    cls_median: percentile(metrics.filter(m => m.metric_type === 'cls').map(m => m.value), 50),
    cls_avg: average(metrics.filter(m => m.metric_type === 'cls').map(m => m.value)),
    ttfb_p95: percentile(metrics.filter(m => m.metric_type === 'ttfb').map(m => m.value), 95),
    cpu_avg: average(metrics.filter(m => m.metric_type === 'cpu').map(m => m.value)),
    memory_avg: average(metrics.filter(m => m.metric_type === 'memory').map(m => m.value)),
    memory_max: Math.max(...metrics.filter(m => m.metric_type === 'memory').map(m => m.value)),
    device_profile_summary: aggregateDeviceProfiles(metrics),
    sample_count: metrics.length,
    created_at: new Date().toISOString()
  };

  await supabase.from('performance_metrics_aggregated').insert(aggregated);
}
```

---

## Data Flow

### Client-Side Performance Monitoring
```
1. Page Load
   ↓
2. Performance Observer API collects Web Vitals (LCP, FID, CLS, TTFB)
   ↓
3. Resource Monitoring collects CPU/Memory every 10 seconds
   ↓
4. Metrics stored in LocalStorage (PerformanceMetric[])
   ↓
5. [Optional] Aggregated metrics sent to Supabase (privacy-safe)
```

### Device Capability Detection
```
1. App Initialization
   ↓
2. Detect capabilities via Navigator APIs
   ↓
3. Generate stable device_id (UUID)
   ↓
4. Store in LocalStorage (`deviceCapabilities` key)
   ↓
5. Determine performance mode ('full', 'balanced', 'lite')
   ↓
6. Apply performance mode class to document.documentElement
   ↓
7. [Optional] Sync capabilities to Supabase for analytics
```

### Component Performance Profiling (Development Only)
```
1. React DevTools Profiler records component renders
   ↓
2. Calculate render_count, avg_render_time, re_render_rate
   ↓
3. Store in LocalStorage (ComponentPerformanceProfile[])
   ↓
4. Developer accesses via `/performance` dashboard
   ↓
5. Prioritize optimization based on re_render_rate and render_count
```

---

## Privacy & Security Considerations

1. **No PII**: All metrics aggregated, no personally identifiable information
2. **Optional User Linkage**: `user_id` nullable, supports anonymous metrics
3. **HIPAA Compliance**: No medical data in performance metrics
4. **LocalStorage First**: Client-side storage primary, server sync optional
5. **Aggregation Only**: Supabase stores aggregated metrics, not individual
6. **Row Level Security**: RLS policies on Supabase tables

**RLS Policies**:
```sql
-- Performance metrics: Users can only insert their own metrics
CREATE POLICY "Users can insert their own performance metrics"
  ON performance_metrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Aggregated metrics: Read-only for all authenticated users
CREATE POLICY "All users can read aggregated metrics"
  ON performance_metrics_aggregated
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

---

**Data Model Completed**: 2025-10-07
**Ready for**: Contract Generation (Phase 1 continued)
