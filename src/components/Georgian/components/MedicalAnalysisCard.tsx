import React, { useState } from 'react';
import {
  Brain,
  ClipboardList,
  FileText,
  HeartHandshake,
  Stethoscope,
  Activity,
  User,
  Shield
} from 'lucide-react';
import { formatMarkdown, extractCleanText, hasMarkdownFormatting, countEmptyFields, hasEmptyFields, extractEmptyFieldNames } from '../../../utils/markdownFormatter';
import Form100Modal from '../../Form100/Form100Modal';
import { useForm100Modal } from '../../Form100/hooks/useForm100Modal';
import { Form100Service } from '../../../services/form100Service';
import { AnalysisCardHeader } from './AnalysisCardHeader';
import { AnalysisCardContent } from './AnalysisCardContent';
import { AnalysisCardEditMode } from './AnalysisCardEditMode';
import { Form100DisplayCard } from './Form100DisplayCard';
import { AnalysisCardFooter } from './AnalysisCardFooter';

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface MedicalAnalysisCardProps {
  analysis: ProcessingHistory;
  index: number;
  totalCount: number;
  onCopy?: (analysis: ProcessingHistory) => void;
  onDownload?: (analysis: ProcessingHistory) => void;
  onShare?: (analysis: ProcessingHistory) => void;
  onDelete?: (analysis: ProcessingHistory) => void;
  onEdit?: (analysis: ProcessingHistory) => void;
  enableEditing?: boolean;
  flowiseEndpoint?: string;
  sessionTitle?: string; // Add session title prop
  sessionId?: string; // Add session ID for Form 100 integration
}

const formatProcessingTime = (milliseconds: number): string => {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  return `${(milliseconds / 1000).toFixed(1)}s`;
};

const getAnalysisType = (instruction: string, model?: string): { type: string; icon: React.ElementType; color: string; isDiagnosis: boolean; endpoint: string; supportsForm100?: boolean } => {
  const lower = instruction.toLowerCase();
  
  // Check if this is a Form 100 eligible consultation
  const isForm100Eligible = lower.includes('form 100') ||
                           lower.includes('form100') ||
                           lower.includes('emergency consultation') ||
                           lower.includes('er consultation') ||
                           lower.includes('emergency room') ||
                           lower.includes('medical consultation') ||
                           lower.includes('emergency report') ||
                           lower.includes('emergency medicine') ||
                           lower.includes('სასწრაფო კონსულტაცია') ||
                           lower.includes('სამედიცინო კონსულტაცია');
  
  // Check if this is a diagnosis report (by instruction content or custom template)
  const isDiagnosis = lower.includes('i50.0') || 
                      lower.includes('i24.9') ||
                      lower.includes('i26.0') ||
                      lower.includes('heart failure') ||
                      lower.includes('nstemi') ||
                      lower.includes('pulmonary embolism') ||
                      lower.includes('გულის შეგუბებითი უკმარისობა') ||
                      lower.includes('გულის მწვავე იშემიური ავადმყოფობა') ||
                      lower.includes('ფილტვის არტერიის ემბოლია') ||
                      (lower.includes('diagnosis') && lower.includes('emergency room')) ||
                      lower.includes('template:') || // Add support for custom templates
                      lower.includes('medical report') || // Add support for general medical reports
                      lower.includes('er report') || // Add support for ER reports
                      lower.includes('notes er report') || // Add support for specific ER note reports
                      isForm100Eligible;
  
  // Handle Form 100 specific reports first
  if (isForm100Eligible) {
    return {
      type: 'Form 100 Emergency Consultation Report',
      icon: ClipboardList,
      color: 'from-[#2b6cb0] to-[#1a365d]',
      isDiagnosis: true,
      endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy',
      supportsForm100: true
    };
  }

  if (isDiagnosis) {
    if (lower.includes('i50.0') || lower.includes('heart failure') || lower.includes('გულის შეგუბებითი უკმარისობა')) {
      return { 
        type: 'Heart Failure ER Report (I50.0)', 
        icon: HeartHandshake, 
        color: 'from-[#2b6cb0] to-[#1a365d]', 
        isDiagnosis: true,
        endpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/89920f52-74cb-46bc-bf6c-b9099746dfe9',
        supportsForm100: true
      };
    }
    if (lower.includes('i24.9') || lower.includes('nstemi') || lower.includes('გულის მწვავე იშემიური ავადმყოფობა')) {
      return { 
        type: 'NSTEMI ER Report (I24.9)', 
        icon: HeartHandshake, 
        color: 'from-[#1a365d] to-[#2b6cb0]', 
        isDiagnosis: true,
        endpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/3db46c83-334b-4ffc-9112-5d30e43f7cf4',
        supportsForm100: true
      };
    }
    if (lower.includes('i26.0') || lower.includes('pulmonary embolism') || lower.includes('ფილტვის არტერიის ემბოლია')) {
      return { 
        type: 'Pulmonary Embolism ER Report (I26.0)', 
        icon: HeartHandshake, 
        color: 'from-[#2b6cb0] to-[#1a365d]', 
        isDiagnosis: true,
        endpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/3602b392-65e5-4dbd-a649-cac18280bea5',
        supportsForm100: true
      };
    }
    if (lower.includes('i21.0') || lower.includes('stemi') || lower.includes('st elevation') || lower.includes('st ელევაციური მიოკარდიუმის ინფარქტი')) {
      return { 
        type: 'STEMI ER Report (I21.0)', 
        icon: HeartHandshake, 
        color: 'from-[#dc2626] to-[#991b1b]', 
        isDiagnosis: true,
        endpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/a18d5e28-05a5-4991-af4a-186ceb558383',
        supportsForm100: true
      };
    }
    if (lower.includes('template:')) {
      // Extract template name from instruction like "Template: test 3"
      const templateName = instruction.split(':')[1]?.trim() || 'Custom Template';
      return { 
        type: `Custom Template Report: ${templateName}`, 
        icon: FileText, 
        color: 'from-[#63b3ed] to-[#90cdf4]', 
        isDiagnosis: true,
        endpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/f27756ae-aa35-4af3-afd1-f6912f9103cf',
        supportsForm100: true
      };
    }
    return { 
      type: 'Diagnosis ER Report', 
      icon: HeartHandshake, 
      color: 'from-[#63b3ed] to-[#90cdf4]', 
      isDiagnosis: true,
      endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy',
      supportsForm100: true
    };
  }
  
  if (lower.includes('symptom') || lower.includes('diagnos')) {
    return { type: 'Clinical Assessment', icon: Stethoscope, color: 'from-[#63b3ed] to-[#2b6cb0]', isDiagnosis: false, endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy', supportsForm100: true };
  }
  if (lower.includes('medication') || lower.includes('drug') || lower.includes('dosage')) {
    return { type: 'Medication Review', icon: Shield, color: 'from-[#2b6cb0] to-[#1a365d]', isDiagnosis: false, endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy', supportsForm100: true };
  }
  if (lower.includes('summary') || lower.includes('summarize')) {
    return { type: 'Clinical Summary', icon: FileText, color: 'from-[#90cdf4] to-[#63b3ed]', isDiagnosis: false, endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy', supportsForm100: true };
  }
  if (lower.includes('procedure') || lower.includes('treatment')) {
    return { type: 'Treatment Plan', icon: Activity, color: 'from-[#1a365d] to-[#63b3ed]', isDiagnosis: false, endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy', supportsForm100: true };
  }
  if (lower.includes('demographic') || lower.includes('history')) {
    return { type: 'Patient History', icon: User, color: 'from-[#90cdf4] to-[#2b6cb0]', isDiagnosis: false, endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy', supportsForm100: false };
  }
  
  return { type: 'General Analysis', icon: Brain, color: 'from-[#2b6cb0] to-[#90cdf4]', isDiagnosis: false, endpoint: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/flowise-proxy', supportsForm100: true };
};

const copyToClipboard = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content);
  } catch (error) {

  }
};

const downloadAsFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const MedicalAnalysisCard: React.FC<MedicalAnalysisCardProps> = ({
  analysis,
  index,
  totalCount,
  onCopy,
  onDownload,
  onShare,
  onDelete,
  onEdit,
  enableEditing = false,
  flowiseEndpoint = '',
  sessionTitle = '',
  sessionId
}) => {
  const [isExpanded, setIsExpanded] = useState(index === 0); // First card expanded by default
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<string | null>(null);
  const [isGeneratingForm100, setIsGeneratingForm100] = useState(false);
  const [form100Error, setForm100Error] = useState<string | null>(null);
  
  // State for generated Form 100 content
  const [generatedForm100Content, setGeneratedForm100Content] = useState<string | null>(null);
  const [form100GeneratedAt, setForm100GeneratedAt] = useState<Date | null>(null);
  
  // State for Form 100 editing functionality
  const [isForm100Expanded, setIsForm100Expanded] = useState(true);
  const [isForm100EditMode, setIsForm100EditMode] = useState(false);
  const [editedForm100Content, setEditedForm100Content] = useState<string | null>(null);
  const analysisType = getAnalysisType(analysis.userInstruction, analysis.model);
  const IconComponent = analysisType.icon;

  // Form 100 modal integration
  const form100Modal = useForm100Modal({
    sessionId,
    department: 'Emergency',
    priority: 'normal'
  });

  // Analysis type and icon setup

  // Calculate empty fields count
  const emptyFieldsCount = countEmptyFields(analysis.aiResponse);
  const hasEmptyFieldsPresent = hasEmptyFields(analysis.aiResponse);
  const emptyFieldNames = extractEmptyFieldNames(analysis.aiResponse);

  const handleCopy = async () => {
    // Debug: Log the actual content being processed
    
    let content: string;
    
    if (analysisType.isDiagnosis) {
      // For diagnosis reports, copy only the clean response text
      content = extractCleanText(analysis.aiResponse);
    } else {
      // For regular reports, copy full content
      content = `Medical Analysis Report
Generated: ${new Date(analysis.timestamp).toLocaleString()}
Analysis Type: ${analysisType.type}

Request: ${analysis.userInstruction}

AI Response:
${analysis.aiResponse}

Processing Details:

---
Generated by MediMind Expert AI Processing System`;
    }
    
    await copyToClipboard(content);
    onCopy?.(analysis);
  };

  const handleDownload = () => {
    const content = `Medical Analysis Report
Generated: ${new Date(analysis.timestamp).toLocaleString()}
Analysis Type: ${analysisType.type}

REQUEST:
${analysis.userInstruction}

AI ANALYSIS:
${analysis.aiResponse}

PROCESSING METADATA:

---
Generated by MediMind Expert
Medical AI Processing System`;
    
    const filename = `medical-analysis-${new Date(analysis.timestamp).toISOString().slice(0, 10)}-${index + 1}.txt`;
    downloadAsFile(content, filename);
    onDownload?.(analysis);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Medical Analysis - ${analysisType.type}`,
          text: `${analysis.userInstruction}\n\n${analysis.aiResponse}`,
        });
        onShare?.(analysis);
      } catch (error) {

      }
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this medical report? This action cannot be undone.')) {
      onDelete?.(analysis);
    }
  };

  const handleEdit = () => {
    if (enableEditing) {
      setIsEditMode(true);
      setIsExpanded(true);
      onEdit?.(analysis);
    }
  };

  const handleEditComplete = (editResult: any) => {
    // Handle successful edit
    setIsEditMode(false);
    
    // Update the local content state with the edited content
    if (editResult?.updatedContent) {
      setEditedContent(editResult.updatedContent);
      setIsExpanded(true); // Keep card expanded to show the changes
    }
  };

  const handleEditError = (error: Error) => {
    // You might want to show an error message to the user
  };
  
  // Form 100 edit handlers
  const handleForm100EditComplete = (editResult: any) => {
    // Handle successful Form 100 edit
    setIsForm100EditMode(false);
    
    // Update the local content state with the edited content
    if (editResult?.updatedContent) {
      setEditedForm100Content(editResult.updatedContent);
      setIsForm100Expanded(true); // Keep card expanded to show the changes
    }
  };

  const handleForm100EditError = (error: any) => {
    setIsForm100EditMode(false);
    console.error('Form 100 edit error:', error);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  // Handle Form 100 generation
  const handleForm100Generation = () => {
    form100Modal.openModal({
      sessionId,
      additionalNotes: `Analysis from: ${analysisType.type}\nGenerated: ${new Date(analysis.timestamp).toLocaleString()}`,
      department: 'Emergency',
      priority: 'normal',
      existingERReport: analysis.aiResponse || '' // Store ER report separately for generation
    });
  };

  // Safety check for analysis data
  if (!analysis || !analysis.userInstruction || !analysis.aiResponse) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
        <p className="text-red-600 dark:text-red-400 text-sm">
          ⚠️ Invalid analysis data: {JSON.stringify({
            hasAnalysis: !!analysis,
            hasInstruction: !!analysis?.userInstruction,
            hasResponse: !!analysis?.aiResponse,
            timestamp: analysis?.timestamp
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden w-full max-w-full">
      {/* Simplified Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-slate-800" />
      
      {/* Subtle Border Glow - Reduced animation */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
      
      {/* Standardized Container with Fixed Height */}
      <div className="relative bg-white/98 dark:bg-slate-900/98 backdrop-blur-sm rounded-2xl border border-blue-200/40 dark:border-slate-700/40 shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 min-h-[180px] flex flex-col">
        
        {/* Header Section */}
        <AnalysisCardHeader
          analysis={analysis}
          analysisType={analysisType}
          index={index}
          totalCount={totalCount}
          sessionTitle={sessionTitle}
          sessionId={sessionId}
          isExpanded={isExpanded}
          isEditMode={isEditMode}
          enableEditing={enableEditing}
          hasEmptyFieldsPresent={hasEmptyFieldsPresent}
          emptyFieldsCount={emptyFieldsCount}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onShare={handleShare}
          onDelete={onDelete ? handleDelete : undefined}
          onEdit={handleEdit}
          onCancelEdit={handleCancelEdit}
          onExpandToggle={() => setIsExpanded(!isExpanded)}
          onForm100Generation={handleForm100Generation}
        />

        {/* Collapsible Content */}
        <div className={`transition-all duration-500 ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          {/* Edit Mode Section */}
          <AnalysisCardEditMode
            analysis={analysis}
            analysisType={analysisType}
            isEditMode={isEditMode}
            enableEditing={enableEditing}
            flowiseEndpoint={flowiseEndpoint}
            onEditComplete={handleEditComplete}
            onEditError={handleEditError}
          />

          {/* Main Content Section */}
          <AnalysisCardContent
            analysis={analysis}
            analysisType={analysisType}
            editedContent={editedContent}
            isExpanded={isExpanded}
          />

          {/* Footer Section */}
          <AnalysisCardFooter
            analysis={analysis}
            isExpanded={isExpanded}
          />
        </div>
      </div>

      {/* Form 100 Display Card */}
      <Form100DisplayCard
        generatedForm100Content={generatedForm100Content}
        form100GeneratedAt={form100GeneratedAt}
        isForm100Expanded={isForm100Expanded}
        isForm100EditMode={isForm100EditMode}
        editedForm100Content={editedForm100Content}
        analysis={analysis}
        sessionId={sessionId}
        flowiseEndpoint={flowiseEndpoint}
        onForm100ExpandToggle={() => setIsForm100Expanded(!isForm100Expanded)}
        onForm100EditToggle={() => setIsForm100EditMode(!isForm100EditMode)}
        onForm100EditComplete={handleForm100EditComplete}
        onForm100EditError={handleForm100EditError}
        onCopy={onCopy}
        onDownload={onDownload}
        onShare={onShare}
      />

      {/* Form 100 Modal Integration */}
      <Form100Modal
        isOpen={form100Modal.isOpen}
        onClose={form100Modal.closeModal}
        sessionId={sessionId}
        initialData={form100Modal.modalData}
        reportType={analysisType.type}
        onSubmit={(formData) => {
          form100Modal.closeModal();
        }}
        onGenerate={async (formData) => {
          setIsGeneratingForm100(true);
          setForm100Error(null);
          
          try {
            // Prepare form data with the existing ER report
            const form100Request = {
              ...formData,
              userId: sessionId,
              existingERReport: analysis.aiResponse,
              additionalNotes: formData.additionalNotes || `Analysis from: ${analysisType.type}\nGenerated: ${new Date(analysis.timestamp).toLocaleString()}`,
              department: 'Emergency',
              priority: formData.priority || 'normal'
            };

            // Call the Form100Service to generate the report
            const result = await Form100Service.generateForm100(form100Request);
            
            if (result.success && result.data) {
              // Store the generated Form 100 content locally
              setGeneratedForm100Content(result.data.generatedForm);
              setForm100GeneratedAt(new Date());
              
              // Return the generated form to the modal
              return result.data.generatedForm;
            } else {
              throw new Error(result.error?.message || 'Form 100 generation failed');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setForm100Error(errorMessage);
            console.error('Form 100 generation error:', error);
            throw error;
          } finally {
            setIsGeneratingForm100(false);
          }
        }}
      />
    </div>
  );
};

// Enhanced animations and effects (to be added to global styles)
// Additional premium visual enhancements complete