import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid';

interface DebugInfo {
  step1_document_overview: {
    timing?: number;
    success?: boolean;
    overview: {
      documents: Array<{
        title: string;
        type: string;
        structure: string[];
        keyTopics: string[];
        medicalSpecialty: string;
        evidenceLevel: string;
      }>;
      globalAnalysis: {
        primaryFocus: string;
        secondaryTopics: string[];
        medicalContext: string;
        targetAudience: string;
        complexity: 'basic' | 'intermediate' | 'advanced';
      };
      contentReadiness: {
        totalDocuments: number;
        processedSections: number;
        extractedTopics: number;
        qualityScore: number;
      };
    };
  };
  step2_content_mapping: {
    timing?: number;
    success?: boolean;
    contentMap: {
      medicalConditions: Array<{
        name: string;
        type: string;
        severity: string;
        prevalence: string;
        keyFeatures: string[];
      }>;
      diagnosticMethods: Array<{
        method: string;
        indication: string;
        reliability: string;
        procedure: string;
      }>;
      treatmentOptions: Array<{
        treatment: string;
        type: string;
        efficacy: string;
        sideEffects: string[];
        contraindications: string[];
      }>;
      clinicalGuidelines: Array<{
        source: string;
        recommendation: string;
        evidenceLevel: string;
        yearUpdated: string;
      }>;
      keyFindings: string[];
      medicalTerminology: string[];
    };
  };
  step3_comprehensive_outline: {
    timing?: number;
    success?: boolean;
    outline: {
      title: string;
      specialty: string;
      style: string;
      speakers: {
        host: { role: string; displayName: string; voiceId: string; };
        expert: { role: string; displayName: string; voiceId: string; };
      };
      chapters: Array<{
        id: string;
        title: string;
        segments: Array<{
          id: string;
          speaker: 'host' | 'expert';
          text: string;
        }>;
      }>;
      citations: Array<{
        id: string;
        sourceId: string;
        title: string;
      }>;
      metadata: {
        totalDuration: number;
        segmentCount: number;
        qualityScore: number;
        medicalAccuracy: number;
        readabilityScore: number;
      };
    };
  };
  validation: {
    allStepsCompleted: boolean;
    errors: string[];
  };
}

interface DebugTrackerProps {
  debugInfo: DebugInfo | null;
  isVisible: boolean;
  onToggle: () => void;
}

const StatusIcon: React.FC<{ success: boolean; timing?: number }> = ({ success, timing }) => {
  if (success) {
    return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
  }
  return <XCircleIcon className="h-5 w-5 text-red-500" />;
};

const ValidationIcon: React.FC<{ passed: boolean }> = ({ passed }) => {
  if (passed) {
    return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
  }
  return <XCircleIcon className="h-4 w-4 text-red-500" />;
};

const ExpandableSection: React.FC<{ 
  title: string; 
  children: React.ReactNode; 
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
}> = ({ title, children, defaultExpanded = false, icon }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 rounded-lg mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

const DebugTracker: React.FC<DebugTrackerProps> = ({ debugInfo, isVisible, onToggle }) => {
  // Debug logging to see what's being passed to the component
  React.useEffect(() => {
    : []
    });
  }, [debugInfo, isVisible]);

  if (!isVisible) {
    const hasDebugData = debugInfo && (
      debugInfo.step1_document_overview ||
      debugInfo.step2_content_mapping ||
      debugInfo.step3_comprehensive_outline ||
      debugInfo.validation?.allStepsCompleted
    );
    
    return (
      <button
        onClick={onToggle}
        className={`
          fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 z-50 flex items-center space-x-2
          ${hasDebugData 
            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-xl animate-pulse' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        <span>{hasDebugData ? 'Comprehensive Debug Data Available' : 'Show Debug Info'}</span>
        {hasDebugData && (
          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
        )}
      </button>
    );
  }

  if (!debugInfo) {
    return (
      <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Debug Tracker</h3>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="text-center text-gray-500 py-8">
          <InformationCircleIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No debug information available</p>
          <p className="text-sm text-gray-400 mt-1">Generate a podcast to see debug data</p>
        </div>
      </div>
    );
  }

  const totalTime = (debugInfo.step1_document_overview?.timing || 0) + 
                   (debugInfo.step2_content_mapping?.timing || 0) + 
                   (debugInfo.step3_comprehensive_outline?.timing || 0);

  return (
    <div className="fixed bottom-4 right-4 w-[600px] max-h-[80vh] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
        <h3 className="text-lg font-semibold text-gray-900">Comprehensive 3-Step Debug Tracker</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Total: {totalTime}ms</span>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4 space-y-4">
        {/* Step 1: Document Overview */}
        <ExpandableSection 
          title={`Step 1: Document Overview (${debugInfo.step1_document_overview?.timing || 0}ms)`}
          icon={<StatusIcon success={!!debugInfo.step1_document_overview?.overview} timing={debugInfo.step1_document_overview?.timing} />}
          defaultExpanded={true}
        >
          <div className="space-y-2 mt-2">
            {debugInfo.step1_document_overview?.overview && (
              <>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-blue-900">
                    Primary Focus: <span className="text-blue-700">{debugInfo.step1_document_overview.overview.globalAnalysis?.primaryFocus}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Medical Context: {debugInfo.step1_document_overview.overview.globalAnalysis?.medicalContext}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <strong>Documents:</strong> {debugInfo.step1_document_overview.overview.contentReadiness?.totalDocuments || 0}
                  </div>
                  <div>
                    <strong>Sections:</strong> {debugInfo.step1_document_overview.overview.contentReadiness?.processedSections || 0}
                  </div>
                  <div>
                    <strong>Topics:</strong> {debugInfo.step1_document_overview.overview.contentReadiness?.extractedTopics || 0}
                  </div>
                  <div>
                    <strong>Quality:</strong> {Math.round((debugInfo.step1_document_overview.overview.contentReadiness?.qualityScore || 0) * 100)}%
                  </div>
                </div>

                {debugInfo.step1_document_overview.overview.documents && (
                  <details className="mt-2">
                    <summary className="text-xs font-medium cursor-pointer">Documents ({debugInfo.step1_document_overview.overview.documents.length})</summary>
                    <div className="mt-1 space-y-1">
                      {debugInfo.step1_document_overview.overview.documents.map((doc, i) => (
                        <div key={i} className="bg-gray-50 p-2 rounded text-xs">
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-gray-600">Type: {doc.type} | Specialty: {doc.medicalSpecialty}</p>
                          {doc.keyTopics?.length > 0 && (
                            <p className="text-blue-600">Topics: {doc.keyTopics.slice(0, 3).join(', ')}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </>
            )}
          </div>
        </ExpandableSection>

        {/* Step 2: Content Mapping */}
        <ExpandableSection 
          title={`Step 2: Content Mapping (${debugInfo.step2_content_mapping?.timing || 0}ms)`}
          icon={<StatusIcon success={!!debugInfo.step2_content_mapping?.contentMap} timing={debugInfo.step2_content_mapping?.timing} />}
          defaultExpanded={true}
        >
          <div className="space-y-2 mt-2">
            {debugInfo.step2_content_mapping?.contentMap && (
              <>                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <strong>Medical Conditions:</strong> {debugInfo.step2_content_mapping.contentMap.medicalConditions?.length || 0}
                  </div>
                  <div>
                    <strong>Diagnostic Methods:</strong> {debugInfo.step2_content_mapping.contentMap.diagnosticMethods?.length || 0}
                  </div>
                  <div>
                    <strong>Treatments:</strong> {debugInfo.step2_content_mapping.contentMap.treatmentOptions?.length || 0}
                  </div>
                  <div>
                    <strong>Guidelines:</strong> {debugInfo.step2_content_mapping.contentMap.clinicalGuidelines?.length || 0}
                  </div>
                </div>

                {debugInfo.step2_content_mapping.contentMap.medicalConditions?.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs font-medium cursor-pointer">Medical Conditions ({debugInfo.step2_content_mapping.contentMap.medicalConditions.length})</summary>
                    <div className="mt-1 space-y-1">
                      {debugInfo.step2_content_mapping.contentMap.medicalConditions.slice(0, 5).map((condition, i) => (
                        <div key={i} className="bg-gray-50 p-2 rounded text-xs">
                          <p className="font-medium">{condition.name}</p>
                          <p className="text-gray-600">Type: {condition.type} | Severity: {condition.severity}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {debugInfo.step2_content_mapping.contentMap.treatmentOptions?.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs font-medium cursor-pointer">Treatment Options ({debugInfo.step2_content_mapping.contentMap.treatmentOptions.length})</summary>
                    <div className="mt-1 space-y-1">
                      {debugInfo.step2_content_mapping.contentMap.treatmentOptions.slice(0, 5).map((treatment, i) => (
                        <div key={i} className="bg-gray-50 p-2 rounded text-xs">
                          <p className="font-medium">{treatment.treatment}</p>
                          <p className="text-gray-600">Type: {treatment.type} | Efficacy: {treatment.efficacy}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {debugInfo.step2_content_mapping.contentMap.keyFindings?.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs font-medium cursor-pointer">Key Findings ({debugInfo.step2_content_mapping.contentMap.keyFindings.length})</summary>
                    <ul className="text-xs text-gray-600 mt-1 ml-4">
                      {debugInfo.step2_content_mapping.contentMap.keyFindings.slice(0, 5).map((finding, i) => (
                        <li key={i}>• {finding}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </>
            )}
          </div>
        </ExpandableSection>

        {/* Step 3: Comprehensive Outline */}
        <ExpandableSection 
          title={`Step 3: Comprehensive Outline (${debugInfo.step3_comprehensive_outline?.timing || 0}ms)`}
          icon={<StatusIcon success={!!debugInfo.step3_comprehensive_outline?.outline} timing={debugInfo.step3_comprehensive_outline?.timing} />}
        >
          <div className="space-y-2 mt-2">
            {debugInfo.step3_comprehensive_outline?.outline && (
              <>
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-green-900">
                    {debugInfo.step3_comprehensive_outline.outline.title}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Specialty: {debugInfo.step3_comprehensive_outline.outline.specialty} | 
                    Style: {debugInfo.step3_comprehensive_outline.outline.style}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <strong>Chapters:</strong> {debugInfo.step3_comprehensive_outline.outline.chapters?.length || 0}
                  </div>
                  <div>
                    <strong>Segments:</strong> {debugInfo.step3_comprehensive_outline.outline.metadata?.segmentCount || 0}
                  </div>
                  <div>
                    <strong>Quality Score:</strong> {Math.round((debugInfo.step3_comprehensive_outline.outline.metadata?.qualityScore || 0) * 100)}%
                  </div>
                  <div>
                    <strong>Medical Accuracy:</strong> {Math.round((debugInfo.step3_comprehensive_outline.outline.metadata?.medicalAccuracy || 0) * 100)}%
                  </div>
                </div>
                
                {debugInfo.step3_comprehensive_outline.outline.chapters?.map((chapter, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded-md">
                    <p className="text-xs font-medium">{index + 1}. {chapter.title}</p>
                    <p className="text-xs text-gray-600">
                      Segments: {chapter.segments?.length || 0}
                    </p>
                    {chapter.segments?.length > 0 && (
                      <details className="mt-1">
                        <summary className="text-xs cursor-pointer">View Segments</summary>
                        <div className="mt-1 space-y-1">
                          {chapter.segments.slice(0, 3).map((segment, i) => (
                            <div key={i} className="bg-white p-1 rounded text-xs">
                              <span className="font-medium">{segment.speaker}:</span> {segment.text.substring(0, 100)}...
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ))}

                {debugInfo.step3_comprehensive_outline.outline.citations?.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs font-medium cursor-pointer">Citations ({debugInfo.step3_comprehensive_outline.outline.citations.length})</summary>
                    <div className="mt-1 space-y-1">
                      {debugInfo.step3_comprehensive_outline.outline.citations.map((citation, i) => (
                        <div key={i} className="bg-blue-50 p-2 rounded text-xs">
                          <p className="font-medium">{citation.title}</p>
                          <p className="text-gray-600">ID: {citation.id} | Source: {citation.sourceId}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </>
            )}
          </div>
        </ExpandableSection>

        {/* Validation Results */}
        <ExpandableSection 
          title="Comprehensive Generation Validation"
          icon={<ValidationIcon passed={debugInfo.validation?.allStepsCompleted || false} />}
          defaultExpanded={true}
        >
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <ValidationIcon passed={debugInfo.validation?.allStepsCompleted || false} />
              <span className="text-sm font-medium">
                {debugInfo.validation?.allStepsCompleted ? 'All 3 Steps Completed Successfully' : 'Steps Still Processing'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 mt-3">
              <div className="flex items-center space-x-2">
                <ValidationIcon passed={!!debugInfo.step1_document_overview?.overview} />
                <span className="text-sm">Document Overview Analysis</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <ValidationIcon passed={!!debugInfo.step2_content_mapping?.contentMap} />
                <span className="text-sm">Content Mapping Extraction</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <ValidationIcon passed={!!debugInfo.step3_comprehensive_outline?.outline} />
                <span className="text-sm">Comprehensive Outline Generation</span>
              </div>
            </div>

            {debugInfo.validation?.errors && debugInfo.validation.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-red-700 mb-2">Errors Encountered:</p>
                {debugInfo.validation.errors.map((error, i) => (
                  <div key={i} className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-700">
                      ⚠️ <strong>Error {i + 1}:</strong> {error}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {debugInfo.validation?.allStepsCompleted && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-xs text-green-700">
                  ✅ <strong>Success:</strong> Comprehensive 3-step outline generation completed successfully! 
                  The new approach provides deeper document analysis, systematic content mapping, and complete outline generation without additional vector store queries.
                </p>
              </div>
            )}
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
};

export default DebugTracker;