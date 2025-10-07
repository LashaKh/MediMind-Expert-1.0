# Quickstart: Performance Optimization Validation

**Feature**: Platform Performance Optimization for Low-End PCs
**Branch**: `005-my-platform-is`
**Date**: 2025-10-07

## Purpose

This quickstart guide validates that performance optimizations meet all functional requirements from the feature specification without breaking existing functionality or changing visual appearance.

---

## Prerequisites

1. **Test Environment**:
   - Low-end PC simulation: Chrome DevTools CPU throttling (4x slowdown)
   - Network throttling: 3G (400ms RTT, 400Kbps download, 400Kbps upload)
   - Memory constraints: 4GB RAM environment

2. **Baseline Measurements** (Before Optimization):
   ```
   Initial Bundle: 1.2MB gzipped
   LCP on 3G: 5.8 seconds
   CPU Usage (active): 50-70%
   Memory Usage (sustained): 150-200MB
   Re-render Count (calculator): 15-20 per interaction
   ```

3. **Target Goals** (After Optimization):
   ```
   Initial Bundle: <800KB gzipped (50% reduction)
   LCP on 3G: <3.2 seconds (45% faster)
   CPU Usage (active): <40% (50% reduction)
   Memory Usage (sustained): 80-120MB (33% reduction)
   Re-render Count (calculator): <10 per interaction (50% reduction)
   ```

---

## Validation Scenarios

### Scenario 1: Low-End PC Initial Load (FR-001)

**Requirement**: Platform MUST load initial view within 3 seconds on low-end PCs (Intel Core i3 equivalent, 4GB RAM, 3G connection)

**Setup**:
```bash
# Start dev server
npm run dev

# Open Chrome DevTools
# Network: 3G
# CPU: 4x slowdown
# Memory: Disable cache
```

**Steps**:
1. Navigate to `http://localhost:5173/expert/`
2. Open DevTools Performance tab
3. Start recording
4. Click "Login" and authenticate
5. Wait for dashboard to load
6. Stop recording

**Expected Results**:
- ✅ Login page renders within 1.5 seconds
- ✅ Dashboard (after auth) renders within 3 seconds
- ✅ Largest Contentful Paint (LCP) <3.2 seconds
- ✅ First Input Delay (FID) <200ms

**Validation**:
```javascript
// Check Performance Observer metrics
const metrics = performanceMonitor.getMetrics();
const lcpMetric = metrics.find(m => m.name === 'LCP');
console.assert(lcpMetric.value < 3200, 'LCP must be <3.2s');

const fidMetric = metrics.find(m => m.name === 'FID');
console.assert(fidMetric.value < 200, 'FID must be <200ms');
```

---

### Scenario 2: Calculator Switching Performance (FR-002)

**Requirement**: Platform MUST maintain <200ms response time for all user interactions (clicks, form inputs, navigation)

**Setup**:
```bash
# Navigate to calculators page
http://localhost:5173/expert/calculators
```

**Steps**:
1. Open DevTools Performance tab
2. Start recording
3. Click "GRACE Risk Calculator"
4. Wait for calculator to render
5. Fill in patient data (age, heart rate, etc.)
6. Click "TIMI Risk Calculator"
7. Wait for calculator switch
8. Stop recording

**Expected Results**:
- ✅ GRACE calculator renders within 500ms
- ✅ Form input response <100ms (keystroke to screen update)
- ✅ TIMI calculator switch completes within 500ms
- ✅ Zero layout shifts during transition (CLS <0.1)

**Validation**:
```javascript
// Measure React component render time
const graceRenderTime = performance.measure('grace-render', 'grace-start', 'grace-end');
console.assert(graceRenderTime.duration < 500, 'GRACE render must be <500ms');

// Validate zero unnecessary re-renders
const componentProfile = localStorage.getItem('component_performance');
const graceProfile = JSON.parse(componentProfile).find(c => c.component_name === 'GRACERiskCalculator');
console.assert(graceProfile.re_render_rate < 20, 'Re-render rate must be <20%');
```

---

### Scenario 3: Georgian Transcription Start Time (FR-003, FR-021)

**Requirement**: Recording MUST start within 200ms and maintain real-time transcription without CPU spikes above 40%

**Setup**:
```bash
# Navigate to Georgian transcription
http://localhost:5173/expert/georgian-transcription
```

**Steps**:
1. Open DevTools Performance tab
2. Start recording
3. Click "Start Recording" button
4. Wait for microphone initialization
5. Speak for 30 seconds
6. Check CPU usage in Performance tab
7. Stop recording

**Expected Results**:
- ✅ Recording starts within 200ms (microphone pre-initialization)
- ✅ Real-time transcription displays within 500ms of speech
- ✅ CPU usage remains <40% during transcription
- ✅ No audio dropouts or lag during 30-second recording

**Validation**:
```javascript
// Measure recording start latency
const recordingLatency = performance.measure('recording-start', 'button-click', 'recording-active');
console.assert(recordingLatency.duration < 200, 'Recording start must be <200ms');

// Check CPU usage
const cpuMetrics = performanceMonitor.getMetrics().filter(m => m.name === 'CPU');
const avgCPU = cpuMetrics.reduce((sum, m) => sum + m.value, 0) / cpuMetrics.length;
console.assert(avgCPU < 40, 'Average CPU must be <40%');
```

---

### Scenario 4: Background Application Responsiveness (FR-004)

**Requirement**: Platform MUST remain responsive with <200ms input latency and <30% CPU usage when user runs background applications

**Setup**:
```bash
# Simulate background load:
# - Open 10 browser tabs
# - Run CPU-intensive task (e.g., video encoding)
# - Navigate to calculator
```

**Steps**:
1. Open 10 additional Chrome tabs (simulate EMR system, multiple docs)
2. Start CPU-intensive task in background
3. Navigate to `http://localhost:5173/expert/calculators/grace`
4. Fill in GRACE calculator form
5. Submit and view results
6. Monitor CPU and memory usage

**Expected Results**:
- ✅ Calculator form remains responsive (<200ms input delay)
- ✅ Platform CPU usage <30% (while background tasks run)
- ✅ No UI freezing or stuttering
- ✅ Results calculate and display within 1 second

**Validation**:
```javascript
// Validate input responsiveness
const inputDelays = performanceMonitor.getMetrics().filter(m => m.name === 'FID');
const maxInputDelay = Math.max(...inputDelays.map(m => m.value));
console.assert(maxInputDelay < 200, 'Max input delay must be <200ms');

// Check platform CPU usage (not including background tasks)
const platformCPU = measurePlatformCPUUsage(); // Custom profiling
console.assert(platformCPU < 30, 'Platform CPU must be <30%');
```

---

### Scenario 5: Long Session Memory Stability (FR-005)

**Requirement**: Platform MUST maintain responsiveness for 4+ hour sessions without requiring page refresh, and memory usage MUST NOT exceed 150MB

**Setup**:
```bash
# Start long session test
npm run dev

# Navigate to platform
http://localhost:5173/expert/
```

**Steps**:
1. Login and navigate to dashboard
2. Use calculators (10 different calculators, 5 calculations each)
3. Open AI chat and send 20 messages
4. Upload 5 documents to knowledge base
5. Use Georgian transcription for 3 sessions (5 minutes each)
6. Let platform idle for 2 hours
7. Return and interact with calculators again
8. Monitor memory usage throughout

**Expected Results**:
- ✅ Memory usage stays below 150MB throughout session
- ✅ No memory leaks (memory returns to baseline after idle)
- ✅ Platform remains responsive after 4-hour session
- ✅ No page refresh required to maintain performance

**Validation**:
```javascript
// Monitor memory over time
const memoryMetrics = performanceMonitor.getMetrics().filter(m => m.name === 'Memory');
const maxMemory = Math.max(...memoryMetrics.map(m => m.value));
console.assert(maxMemory < 150, 'Max memory must be <150MB');

// Check for memory leaks (memory should return to baseline)
const initialMemory = memoryMetrics[0].value;
const finalMemory = memoryMetrics[memoryMetrics.length - 1].value;
const memoryIncrease = finalMemory - initialMemory;
console.assert(memoryIncrease < 50, 'Memory increase must be <50MB over 4 hours');
```

---

### Scenario 6: Slow Connection Progressive Loading (FR-006, FR-008)

**Requirement**: Platform MUST show cached content immediately and load new data progressively without blocking the UI

**Setup**:
```bash
# Network: Slow 3G (200ms RTT, 200Kbps download)
# Start dev server
npm run dev
```

**Steps**:
1. Navigate to platform and login (first visit, no cache)
2. Navigate to medical news page
3. Wait for news to load
4. Navigate away and return
5. News should show cached content immediately
6. New news loads progressively in background

**Expected Results**:
- ✅ Cached news displays instantly (<100ms)
- ✅ Skeleton loaders show for new content loading
- ✅ UI remains interactive during progressive load
- ✅ New news items append without layout shift

**Validation**:
```javascript
// Check cache hit rate
const cacheHitRate = calculateCacheHitRate();
console.assert(cacheHitRate > 80, 'Cache hit rate must be >80%');

// Validate progressive loading (no UI blocking)
const interactionDuringLoad = measureInteractionResponsiveness();
console.assert(interactionDuringLoad < 200, 'UI must remain responsive during loading');
```

---

## Visual Consistency Validation (FR-011, FR-012)

**Requirement**: Platform MUST maintain exact visual appearance of all UI components during optimization (zero visual changes)

### Visual Regression Testing

**Setup**:
```bash
# Install visual regression tool
npm install --save-dev percy-cli

# Capture baseline screenshots (before optimization)
npx percy snapshot baseline/
```

**Steps**:
1. Capture screenshots of all major pages:
   - Dashboard
   - Calculators (GRACE, TIMI, CHA2DS2-VASc)
   - Georgian transcription
   - AI chat interface
   - Medical news
   - Knowledge base

2. Apply performance optimizations

3. Capture post-optimization screenshots

4. Compare with baseline using Percy

**Expected Results**:
- ✅ Zero visual differences in all screenshots (pixel-perfect match)
- ✅ Blue theme preserved across all components
- ✅ Medical iconography unchanged
- ✅ Touch targets remain 44px minimum
- ✅ Responsive layouts unchanged at 320px, 768px, 1024px breakpoints

**Validation**:
```bash
# Run visual regression tests
npx percy snapshot optimized/
npx percy compare baseline/ optimized/

# Expected: 100% match rate
```

---

## Medical Calculator Accuracy Validation (FR-020, FR-025)

**Requirement**: Platform MUST maintain 100% of existing medical calculator accuracy and validation

### Test Suite Execution

**Setup**:
```bash
# Run existing medical calculator test suite
npm run test:medical
```

**Expected Results**:
- ✅ All medical calculator tests pass (100% success rate)
- ✅ GRACE risk calculator: Validates all test cases
- ✅ TIMI risk calculator: Validates all test cases
- ✅ CHA2DS2-VASc: Validates all test cases
- ✅ Evidence-based validation preserved

**Validation**:
```bash
# Expected output:
# ✓ GRACE Risk Calculator (24 tests)
# ✓ TIMI Risk Calculator (18 tests)
# ✓ CHA2DS2-VASc Calculator (12 tests)
# ... (all calculators)
# Test Suites: 16 passed, 16 total
# Tests: 240 passed, 240 total
```

---

## Bundle Size Validation (FR-006)

**Requirement**: Platform MUST reduce initial bundle size to <800KB gzipped for first meaningful paint

### Build Analysis

**Setup**:
```bash
# Build production bundle
npm run build

# Analyze bundle size
npx vite-bundle-visualizer
```

**Expected Results**:
- ✅ Initial bundle (index.js): <800KB gzipped
- ✅ Vendor chunks: <300KB each
- ✅ Lazy-loaded features: PDF export, OCR, Analytics
- ✅ Total bundle reduction: 50% (from 1.2MB to <800KB)

**Validation**:
```bash
# Check bundle sizes
ls -lh dist/assets/*.js | grep index

# Expected:
# index.js: ~750KB gzipped (was 1.2MB)
```

---

## Accessibility Validation (FR-014, FR-025)

**Requirement**: Platform MUST retain all accessibility features (WCAG compliance, screen reader support, keyboard navigation)

### Accessibility Test Suite

**Setup**:
```bash
# Run accessibility tests
npm run test:accessibility
```

**Expected Results**:
- ✅ All WCAG 2.1 AA tests pass
- ✅ Screen reader navigation functional
- ✅ Keyboard navigation preserved
- ✅ Color contrast ratios maintained
- ✅ ARIA labels unchanged

**Validation**:
```bash
# Expected output:
# ✓ Accessibility Tests (45 tests)
# ✓ WCAG 2.1 AA Compliance
# ✓ Keyboard Navigation
# ✓ Screen Reader Support
# Test Suites: 1 passed, 1 total
# Tests: 45 passed, 45 total
```

---

## Performance Dashboard Validation

**Requirement**: Validate that performance monitoring infrastructure accurately tracks metrics

### Dashboard Verification

**Setup**:
```bash
# Navigate to performance dashboard
http://localhost:5173/expert/performance
```

**Expected Results**:
- ✅ LCP metric displays and updates
- ✅ FID metric displays and updates
- ✅ CLS metric displays and updates
- ✅ CPU usage chart shows real-time data
- ✅ Memory usage chart shows real-time data
- ✅ Device capability profile displays correctly

**Validation**:
```javascript
// Check performance dashboard metrics
const dashboard = document.querySelector('.performance-dashboard');
console.assert(dashboard !== null, 'Performance dashboard must render');

const lcpCard = dashboard.querySelector('[data-metric="lcp"]');
console.assert(lcpCard.textContent.includes('ms'), 'LCP metric must display');

const memoryChart = dashboard.querySelector('[data-chart="memory"]');
console.assert(memoryChart !== null, 'Memory chart must render');
```

---

## Automated Test Execution

### Run All Validation Tests

```bash
# 1. Medical calculator accuracy (100% required)
npm run test:medical

# 2. Performance benchmarks
npm run test:performance

# 3. Accessibility compliance
npm run test:accessibility

# 4. Integration tests (user workflows)
npm run test:integration

# 5. Visual regression tests
npx percy snapshot
npx percy compare

# 6. Build and bundle analysis
npm run build
npx vite-bundle-visualizer
```

### Expected Final Results

**All Tests Pass**:
```
✓ Medical Calculator Tests: 240/240 passed
✓ Performance Tests: 18/18 passed
✓ Accessibility Tests: 45/45 passed
✓ Integration Tests: 32/32 passed
✓ Visual Regression: 100% match
✓ Bundle Size: 750KB (target: <800KB)
```

**Performance Improvements Validated**:
```
✓ Load Time: 3.1s (target: <3.2s) - 45% faster
✓ CPU Usage: 38% (target: <40%) - 50% reduction
✓ Memory Usage: 110MB (target: <150MB) - 33% reduction
✓ Bundle Size: 750KB (target: <800KB) - 50% reduction
✓ Re-render Rate: 18% (target: <20%) - 50% reduction
```

---

## Troubleshooting

### Issue: LCP exceeds 3.2 seconds

**Diagnosis**:
- Check bundle size: `ls -lh dist/assets/*.js`
- Verify lazy loading: Inspect network tab for on-demand loads
- Check font loading: Ensure font-display: swap

**Fix**:
- Increase lazy loading coverage
- Optimize font loading with font-display
- Reduce critical CSS size

### Issue: CPU usage above 40%

**Diagnosis**:
- Profile React components: Use React DevTools Profiler
- Check real-time subscriptions: Verify connection pooling
- Monitor animations: Check GPU fallback activation

**Fix**:
- Apply more React.memo patterns
- Throttle real-time updates
- Enable GPU fallback for integrated graphics

### Issue: Memory leak detected

**Diagnosis**:
- Check useEffect cleanup: Verify all subscriptions cleaned up
- Profile heap snapshots: Chrome DevTools Memory tab
- Monitor component unmounts: Check for lingering listeners

**Fix**:
- Add cleanup functions to useEffect hooks
- Remove event listeners on unmount
- Close Supabase channels when unused

---

**Quickstart Completed**: 2025-10-07
**Ready for**: Task Generation (Phase 2)
