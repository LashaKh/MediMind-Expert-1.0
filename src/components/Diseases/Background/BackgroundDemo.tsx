import React, { useState, useEffect } from 'react';
import { BackgroundRenderer } from './index';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { safeAsync, ErrorSeverity } from '../../../lib/utils/errorHandling';

const BackgroundDemo: React.FC = () => {
  const [selectedDisease, setSelectedDisease] = useState<string>('antidromic-avrt');
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showRawMarkdown, setShowRawMarkdown] = useState<boolean>(false);

  const sampleDiseases = [
    {
      id: 'antidromic-avrt',
      name: 'Antidromic AVRT',
      file: 'antidromic-atrioventricular-reentrant-tachycardia.md'
    },
    {
      id: 'aaa',
      name: 'Abdominal Aortic Aneurysm',
      file: 'abdominal-aortic-aneurysm.md'
    },
    {
      id: 'aortic-hematoma',
      name: 'Aortic Intramural Hematoma',
      file: 'aortic-intramural-hematoma.md'
    }
  ];

  useEffect(() => {
    const loadDiseaseContent = async () => {
      setLoading(true);
      
      const [content, error] = await safeAsync(
        async () => {
          const disease = sampleDiseases.find(d => d.id === selectedDisease);
          if (disease) {
            const response = await fetch(`/diseases/${disease.file}`);
            if (!response.ok) {
              throw new Error(`Failed to load disease file: ${response.statusText}`);
            }
            return await response.text();
          }
          return '';
        },
        { 
          context: 'load disease markdown content',
          severity: ErrorSeverity.MEDIUM,
          showToast: true
        }
      );

      if (error) {
        setMarkdownContent('Error loading content');
      } else {
        setMarkdownContent(content);
      }
      
      setLoading(false);
    };

    loadDiseaseContent();
  }, [selectedDisease]);

  const extractBackgroundSection = (content: string): string => {
    const backgroundMatch = content.match(/## Background\s*\n([\s\S]*?)(?=\n## |$)/);
    return backgroundMatch ? `## Background\n${backgroundMatch[1]}` : '';
  };

  const backgroundSection = extractBackgroundSection(markdownContent);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Background Renderer Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Beautiful rendering of disease background sections from markdown
        </p>
      </div>

      {/* Disease Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Select Disease</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sampleDiseases.map((disease) => (
              <Button
                key={disease.id}
                variant={selectedDisease === disease.id ? "default" : "outline"}
                onClick={() => setSelectedDisease(disease.id)}
                className="transition-all duration-200"
              >
                {disease.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading disease content...</span>
          </CardContent>
        </Card>
      )}

      {/* Background Renderer */}
      {!loading && markdownContent && backgroundSection && (
        <div className="space-y-6">
          {/* Rendered Background */}
          <Card>
            <CardHeader>
              <CardTitle>Rendered Background Section</CardTitle>
            </CardHeader>
            <CardContent>
              <BackgroundRenderer content={markdownContent} />
            </CardContent>
          </Card>

          {/* Raw Markdown Toggle */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => setShowRawMarkdown(!showRawMarkdown)}>
              <CardTitle className="flex items-center justify-between">
                <span>Raw Markdown Source</span>
                {showRawMarkdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CardTitle>
            </CardHeader>
            {showRawMarkdown && (
              <CardContent>
                <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                  <code className="text-gray-800 dark:text-gray-200">
                    {backgroundSection}
                  </code>
                </pre>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* No Background Found */}
      {!loading && markdownContent && !backgroundSection && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No background section found in the selected disease file.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BackgroundDemo; 