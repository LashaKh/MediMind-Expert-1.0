import React from 'react';
import { BackgroundRenderer } from './index';

// Example of how to integrate BackgroundRenderer into your existing disease page
interface DiseasePageProps {
  markdownContent: string;
  diseaseTitle: string;
}

const DiseasePageExample: React.FC<DiseasePageProps> = ({ 
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
          Comprehensive medical information and guidelines
        </p>
      </div>

      {/* Background Section - Enhanced Rendering */}
      <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <BackgroundRenderer 
          content={markdownContent} 
          className="mb-8"
        />
      </section>

      {/* Other sections would follow here */}
      <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Clinical Presentation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Other disease sections rendered with your existing components...
        </p>
      </section>

      <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Guidelines
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Guidelines section rendered with your existing components...
        </p>
      </section>
    </div>
  );
};

export default DiseasePageExample;

// Usage example:
/*
import { DiseasePageExample } from '@/components/Diseases/Background';

function MyDiseasePage() {
  const [markdownContent, setMarkdownContent] = useState('');
  
  useEffect(() => {
    // Load your disease markdown content
    fetch('/diseases/your-disease.md')
      .then(response => response.text())
      .then(content => setMarkdownContent(content));
  }, []);

  return (
    <DiseasePageExample 
      markdownContent={markdownContent}
      diseaseTitle="Your Disease Name"
    />
  );
}
*/ 