import React from 'react';
import { ClinicalActionPlanDisplay } from './ClinicalActionPlanDisplay';

// Multiple example action plans demonstrating format resilience
const sampleActionPlans = {
  hyponatremia: `# Comprehensive Action Plan

## Issue 1: Significant Hyponatremia

# Significant Hyponatremia

## 1. Introduction (Optional)
Hyponatremia with a sodium level of 124 mmol/L requires prompt evaluation to determine the underlying cause and appropriate management strategy to prevent complications such as cerebral edema or osmotic demyelination syndrome.

## 2. Immediate Action Plan

### Key Interventions

#### Fluid Restriction
- **Indication:** Euvolemic or hypervolemic hyponatremia (e.g., SIADH).
- **Restriction:** Limit to 1–1.5 L/day to increase serum sodium gradually.

#### Hypertonic Saline
- **Indication:** Severe symptomatic hyponatremia (e.g., seizures, altered mental status).
- **Administration:** 3% saline bolus, 100–150 mL over 20 minutes, repeat as necessary.
- **Goal:** Increase serum Na⁺ by 4–6 mmol/L initially, not exceeding 8 mmol/L in 24 hours.

#### Vasopressin Receptor Antagonists (Vaptans)
- **Indication:** SIADH unresponsive to fluid restriction.
- **Medication:** Tolvaptan, 15 mg orally daily, titrate based on response and sodium levels.

#### Isotonic Saline
- **Indication:** Hypovolemic hyponatremia.
- **Administration:** 0.9% saline IV to restore volume and correct sodium deficit.

## 3. Monitoring & Adjustments

### Serum Sodium
- **Frequency:** Every 2–4 hours during active correction.
- **Goal:** Avoid rapid correction; no more than 8 mmol/L increase in 24 hours.

### Urine Output and Osmolality
- **Purpose:** Assess response to treatment and adjust fluid restriction or diuretics.

### Neurological Status
- **Frequency:** Continuous monitoring in severe cases.
- **Purpose:** Detect early signs of overcorrection or cerebral edema.

### Volume Status
- **Assessment:** Adjust fluids based on clinical evaluation of volume status.

## 4. Rationale
- **Fluid restriction** addresses water retention in SIADH.
- **Hypertonic saline** rapidly corrects sodium in symptomatic cases.
- **Vaptans** enhance free water excretion in SIADH.
- **Isotonic saline** replenishes volume and sodium in hypovolemic states.

## 5. Additional Considerations

### Osmotic Demyelination Syndrome
- **Risk:** Avoid rapid correction in chronic cases; monitor for neurological signs.

### Medication Review
- **Action:** Discontinue offending drugs (e.g., thiazides, SSRIs) contributing to hyponatremia.

## 6. Summary
- **Identify Cause:** Determine etiology (e.g., SIADH, hypovolemia) and tailor therapy.
- **Controlled Correction:** Use fluid restriction, hypertonic saline, and vaptans judiciously.
- **Monitoring:** Frequent serum sodium checks to avoid complications like osmotic demyelination.`,

  alternativeFormat: `Treatment Action Plan

Problem 1: Acute Heart Failure

### Critical Interventions:
* Immediate IV furosemide 40mg bolus
* O2 therapy via nasal cannula 2-4L/min
* Monitor respiratory status continuously

### Cardiovascular Assessment:
1. 12-lead ECG within 30 minutes
2. Chest X-ray to assess pulmonary edema
3. BNP or NT-proBNP levels
4. Echocardiogram if not done recently

Problem 2: Diabetes Management

Blood glucose control:
- Check fingerstick glucose q4h
- Sliding scale insulin as per protocol
- Consider continuous glucose monitoring

Medication review:
- Hold metformin if creatinine >1.5
- Adjust insulin based on renal function
- Monitor for DKA if glucose >250mg/dL

COPD Exacerbation:

Respiratory Management:
• Nebulized albuterol/ipratropium q4h
• Prednisone 40mg PO daily x 5 days
• Oxygen to maintain SpO2 88-92%
• Consider BiPAP if pH <7.35`,

  bulletFormat: `Clinical Action Items

* Primary Issue: Sepsis

Immediate Actions:
- Blood cultures x2 before antibiotics
- Start broad-spectrum antibiotics within 1 hour
- IV fluids 30ml/kg crystalloid bolus
- Lactate levels and repeat q6h

* Secondary Issue: Acute Kidney Injury

Monitoring Required:
- Creatinine and BUN daily
- Urine output q1h (goal >0.5ml/kg/hr)
- Hold nephrotoxic medications
- Consider renal ultrasound

* Tertiary Concern: Nutritional Support

Interventions:
- Dietitian consultation
- Consider tube feeding if NPO >3 days
- Monitor albumin and prealbumin levels`
};

// For debugging - let's see what content is being parsed
const currentExample = sampleActionPlans.hyponatremia;

export const ClinicalActionPlanDemo: React.FC = () => {
  const handleActionComplete = (actionId: string) => {
    console.log('Action completed:', actionId);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Clinical Action Plan Display Demo
        </h1>
        <p className="text-gray-600">
          Demonstrating the formatted display of clinical recommendations and treatment protocols.
        </p>
      </div>
      
      <ClinicalActionPlanDisplay
        actionPlan={currentExample}
        onIssueComplete={handleActionComplete}
        editable={true}
        showProgress={true}
      />
    </div>
  );
};