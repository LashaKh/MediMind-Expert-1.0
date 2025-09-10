import React from 'react';
import { StudiesRenderer } from './index';

// Example of how to integrate StudiesRenderer into your existing disease page
const StudiesIntegrationExample: React.FC = () => {
  // Example markdown content that would come from your disease file
  const exampleMarkdownWithStudies = `
# Cardiac Amyloidosis

## Background
Cardiac amyloidosis is a progressive cardiomyopathy caused by the deposition of misfolded protein fibrils in the myocardium...

## Studies

### 2025 • HELIOS-B
In adult patients with transthyretin amyloidosis with cardiomyopathy, vutrisiran was superior to placebo with respect to death from any cause and recurrent cardiovascular events.
*Marianna Fontana et al. N Engl J Med. 2025 Jan 2.* [PubMed](https://pubmed.ncbi.nlm.nih.gov/39758272/)

### 2024 • ATTRibute-CM
In patients with transthyretin amyloid cardiomyopathy, acoramidis was superior to placebo with respect to favorable pairwise comparisons in a hierarchical outcome of death from any cause, cardiovascular-related hospitalization, change from baseline in the NT-proBNP level, and change from baseline in the 6-minute walk distance at month 30.
*Julian D Gillmore et al. N Engl J Med. 2024 Jan 11.* [PubMed](https://pubmed.ncbi.nlm.nih.gov/38163658/)

### 2018 • ATTR-ACT
In patients with transthyretin amyloid cardiomyopathy, tafamidis was superior to placebo with respect to a all-cause death.
*Maurer MS et al. N Engl J Med. 2018 Sep 13.* [PubMed](https://pubmed.ncbi.nlm.nih.gov/30145929/)

## Clinical Findings
...rest of the disease content...
`;

  return (
    <div className="min-h-screen bg-[var(--component-surface-primary)] dark:bg-[var(--background-dark)] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] dark:text-[var(--foreground)] mb-4">
            Studies Integration Example
          </h1>
          <p className="text-lg text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)]">
            This example shows how to integrate the StudiesRenderer into your existing disease pages.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Example 1: With Header */}
          <div className="bg-[var(--component-card)] dark:bg-[var(--background)] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)] dark:text-[var(--foreground)] mb-4">
              Option 1: With Header (showHeader=true)
            </h2>
            <div className="text-sm text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)] mb-4">
              Best for standalone use or when Studies is the main focus
            </div>
            
            <StudiesRenderer 
              content={exampleMarkdownWithStudies} 
              showHeader={true}
            />
          </div>

          {/* Example 2: Without Header */}
          <div className="bg-[var(--component-card)] dark:bg-[var(--background)] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)] dark:text-[var(--foreground)] mb-4">
              Option 2: Without Header (showHeader=false)
            </h2>
            <div className="text-sm text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)] mb-4">
              Best for integration into existing disease pages with custom headers
            </div>
            
            <StudiesRenderer 
              content={exampleMarkdownWithStudies} 
              showHeader={false}
            />
          </div>

          {/* Integration Code Example */}
          <div className="bg-[var(--component-card)] dark:bg-[var(--background)] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)] dark:text-[var(--foreground)] mb-4">
              Integration Code Example
            </h2>
            <pre className="bg-[var(--component-surface-secondary)] dark:bg-[var(--card)] p-4 rounded-lg overflow-x-auto text-sm">
              <code className="text-[var(--foreground)] dark:text-[var(--foreground)]">
{`// Import the StudiesRenderer
import { StudiesRenderer } from '../components/Diseases/Studies';

// In your disease page component
const YourDiseasePage: React.FC = ({ markdownContent }) => {
  return (
    <div className="disease-page">
      {/* Other disease content */}
      
      {/* Studies Section */}
      <section className="studies-section">
        <StudiesRenderer 
          content={markdownContent} 
          showHeader={false}  // or true if you want the header
          className="my-6"    // optional custom styling
        />
      </section>
      
      {/* More disease content */}
    </div>
  );
};`}
              </code>
            </pre>
          </div>

          {/* Features Overview */}
          <div className="bg-[var(--component-card)] dark:bg-[var(--background)] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)] dark:text-[var(--foreground)] mb-4">
              Features & Benefits
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] dark:text-[var(--foreground)] mb-2">
                  Automatic Parsing
                </h3>
                <ul className="text-sm text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)] space-y-1">
                  <li>• Detects ## Studies sections</li>
                  <li>• Extracts year, title, and description</li>
                  <li>• Parses author, journal, and date</li>
                  <li>• Identifies PubMed links</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] dark:text-[var(--foreground)] mb-2">
                  Professional UI
                </h3>
                <ul className="text-sm text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)] space-y-1">
                  <li>• Color-coded year badges</li>
                  <li>• Hover effects and transitions</li>
                  <li>• Responsive design</li>
                  <li>• Medical-grade styling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudiesIntegrationExample; 