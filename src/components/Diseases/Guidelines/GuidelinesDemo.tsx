import React from 'react';
import GuidelinesRenderer from './GuidelinesRenderer';

// Demo component to showcase GuidelinesRenderer functionality
const GuidelinesDemo: React.FC = () => {
  // Test case for the user's actual content format
  const userActualContent = `## Guidelines

### Key Sources
The following summarized guidelines for the management of antidromic atrioventricular reentrant tachycardia are prepared by our editorial team based on guidelines from the **European Society of Cardiology (ESC 2020)**.

This text should now be clearly visible and readable without needing to hover over it. The content includes detailed medical recommendations and should be easily readable in both light and dark modes.

**As per European Society of Cardiology 2020 guidelines:**

**Acute Management:**
- Emergency cardioversion is recommended for hemodynamically unstable patients
- Adenosine or vagal maneuvers can be attempted first in stable patients
- (C)el B**

**Chronic Management:**
- Consider catheter ablation for recurrent episodes
- Beta-blockers may help prevent episodes
- (C)evel B**
`;

  const markdownContent = `## Guidelines

### Key Sources
The following guidelines are sourced from multiple international cardiology societies and are based on the latest evidence-based medicine practices.

**As per American Heart Association 2023 guidelines:**

**Primary Prevention:**
- Regular cardiovascular risk assessment is recommended for all adults aged 40-79 years
- (C)el A**

**Secondary Prevention:**
- Dual antiplatelet therapy should be considered for patients with established cardiovascular disease
- (C)evel B**

**As per European Society of Cardiology 2022 guidelines:**

**Risk Stratification:**
- Use validated risk calculators for cardiovascular risk assessment
- (C)el B**

**Contraindications:**
- Do not use in patients with active bleeding
- (C)evel B**

**Considerations:**
- Consider dose adjustment in elderly patients
- (C)evel C**
`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Guidelines Renderer Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Showcasing the enhanced guidelines section rendering with beautiful UI/UX
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            User's Actual Content Format (Fixed)
          </h2>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <GuidelinesRenderer content={userActualContent} />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Enhanced Guidelines Example
          </h2>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <GuidelinesRenderer content={markdownContent} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesDemo; 