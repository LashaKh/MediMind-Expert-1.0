import React from 'react';
import GuidelinesRenderer from './GuidelinesRenderer';

// Example of how to integrate GuidelinesRenderer into your existing disease page
interface DiseasePageWithGuidelinesProps {
  markdownContent: string;
  diseaseTitle: string;
}

const DiseasePageWithGuidelinesExample: React.FC<DiseasePageWithGuidelinesProps> = ({ 
  markdownContent, 
  diseaseTitle 
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Disease Title */}
      <div className="text-center border-b pb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {diseaseTitle}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive medical information and evidence-based guidelines
        </p>
      </div>

      {/* Background Section */}
      <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Background
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Background section rendered with BackgroundRenderer...
        </p>
      </section>

      {/* Guidelines Section - Enhanced Rendering */}
      <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <GuidelinesRenderer 
          content={markdownContent} 
          className="mb-8"
        />
      </section>

      {/* Clinical Findings Section */}
      <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Clinical Findings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Clinical findings section rendered with existing components...
        </p>
      </section>
    </div>
  );
};

export default DiseasePageWithGuidelinesExample;

// Usage example:
/*
import { DiseasePageWithGuidelinesExample } from '@/components/Diseases/Guidelines';

function MyDiseasePageWithGuidelines() {
  const [markdownContent, setMarkdownContent] = useState('');
  
  useEffect(() => {
    // Load your disease markdown content
    fetch('/diseases/your-disease.md')
      .then(response => response.text())
      .then(content => setMarkdownContent(content));
  }, []);

  return (
    <DiseasePageWithGuidelinesExample 
      markdownContent={markdownContent}
      diseaseTitle="Your Disease Name"
    />
  );
}
*/ 