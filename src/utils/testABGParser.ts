/**
 * Test file for ABG Issue Parser
 * This can be used to verify that the parser correctly identifies issues
 */

import { parseABGInterpretation } from './abgIssueParser';

// Example interpretation from your logs
const sampleInterpretation = `# Acute Respiratory Acidosis with Hypoxemia and Elevated Carboxyhemoglobin

## 1. Introduction
This case involves a patient with acute respiratory acidosis due to hypoventilation, hypoxemia, anemia, and elevated carboxyhemoglobin, suggesting carbon monoxide exposure. Immediate intervention is critical to address respiratory failure and potential CO poisoning.

## 2. Acid-Base Status
- **pH: 7.25** (Normal: 7.35-7.45) - Acidemia indicating respiratory acidosis
- **PCO2: 65 mmHg** (Normal: 35-45 mmHg) - Elevated, confirming respiratory acidosis
- **HCO3: 28 mmol/L** (Normal: 22-26 mmol/L) - Slight elevation suggesting partial compensation

## 3. Oxygenation Status  
- **PO2: 55 mmHg** (Normal: 80-100 mmHg) - Hypoxemia requiring immediate attention
- **Oxygen Saturation: 85%** (Normal: >95%) - Significantly reduced

## 4. Additional Findings
- **Carboxyhemoglobin: 15%** (Normal: <2%) - Elevated, indicating carbon monoxide poisoning
- **Hemoglobin: 8.5 g/dL** (Normal: 12-16 g/dL) - Anemia affecting oxygen carrying capacity

## 5. Summary
Multiple critical issues identified requiring immediate intervention.`;

export function testABGParser() {
  console.log('🧪 Testing ABG Issue Parser...');
  
  const result = parseABGInterpretation(sampleInterpretation);
  
  console.log('📊 Parsing Results:');
  console.log(`Total Issues Found: ${result.totalIssuesFound}`);
  console.log('Issues Identified:');
  
  result.issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.title}`);
    console.log(`   - Severity: ${issue.severity}`);
    console.log(`   - Category: ${issue.category}`);
    console.log(`   - Priority Order: ${issue.priorityOrder}`);
    console.log(`   - Description: ${issue.description.substring(0, 100)}...`);
    console.log('');
  });
  
  return result;
}

// Run the test if this file is imported
if (typeof window !== 'undefined') {
  console.log('ABG Parser test function available: testABGParser()');
  // Auto-run test for debugging
  setTimeout(() => {
    console.log('🔍 Auto-running ABG Parser test...');
    testABGParser();
  }, 1000);
}