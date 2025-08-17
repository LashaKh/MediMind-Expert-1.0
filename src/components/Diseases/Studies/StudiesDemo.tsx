import React from 'react';
import StudiesRenderer from './StudiesRenderer';

const StudiesDemo: React.FC = () => {
  const sampleMarkdownContent = `
# Hypertrophic Cardiomyopathy

## Background
This is some background content...

## Studies

### 2025 • [TRAVERSE](https://pubmed.ncbi.nlm.nih.gov/38619467/)
In adult patients with LV arrhythmias undergoing catheter ablation procedures, transseptal puncture approach was superior to retrograde aortic approach with respect to acute brain lesion on postprocedural MRI.

*Gregory M Marcus et al. Circulation. 2025 Apr 15.*

### 2024 • [SEQUOIA-HCM (original research)](https://pubmed.ncbi.nlm.nih.gov/38813861/)
In patients with symptomatic obstructive HCM, aficamten was superior to placebo with respect to mean improvement in the peak oxygen uptake by cardiopulmonary exercise testing at week 24.

*Martin S Maron et al. N Engl J Med. 2024 May 30.*

### 2022 • [PAUSE-SCD](https://pubmed.ncbi.nlm.nih.gov/35658079/)
In patients with cardiomyopathy and monomorphic VT with an indication for ICD implantation, ablation therapy was superior to conventional therapy with respect to the composite outcome of VT recurrence, cardiovascular hospitalization or death.

*Roderick Tung et al. Circulation. 2022 Jun 21.*

### 2020 • [EXPLORER-HCM](https://pubmed.ncbi.nlm.nih.gov/32871100/)
In patients with HCM with LVOT gradient ≥ 50 mmHg and NYHA class II-III symptoms, mavacamten was superior to placebo with respect to clinical response at week 30.

*Iacopo Olivotto et al. Lancet. 2020 Sep 12.*

### 2018 • ATTR-ACT
In patients with transthyretin amyloid cardiomyopathy, tafamidis was superior to placebo with respect to a all-cause death.
*Maurer MS et al. N Engl J Med. 2018 Sep 13.* [PubMed](https://pubmed.ncbi.nlm.nih.gov/30145929/)

## Clinical Findings
This is some clinical findings content...
`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Studies Renderer Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            This demo shows how the StudiesRenderer component identifies and displays 
            research studies from disease markdown content.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Rendered Studies Section
          </h2>
          
          <StudiesRenderer 
            content={sampleMarkdownContent} 
            showHeader={true}
          />
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Features Demonstrated
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Automatic parsing of study entries with year, title, and description</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Color-coded year badges (green for 2024+, blue for 2020+, orange for 2015+)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Automatic extraction of author, journal, and date information</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>PubMed links detection and display</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Professional medical interface with research summary statistics</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Responsive design with hover effects and professional styling</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudiesDemo; 