/**
 * Template Creation Modal Demo Component
 * 
 * Demo showcase for the world-class template creation modal.
 * Shows the modal with all its premium features and interactions.
 */

import React, { useState } from 'react';
import { FileText, Sparkles, Play, Info } from 'lucide-react';
import { TemplateCreationModal } from './TemplateCreationModal';
import type { UserTemplate } from '../../../types/templates';

export const TemplateModalDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<UserTemplate | null>(null);

  // Demo template for editing showcase
  const demoTemplate: UserTemplate = {
    id: 'demo-template-1',
    user_id: 'demo-user',
    name: 'Emergency Cardiac Assessment Demo',
    example_structure: `# Emergency Cardiac Assessment

## Chief Complaint
Patient presents with: [Primary concern]

## Vital Signs & Initial Assessment
- Blood Pressure: ___/__ mmHg
- Heart Rate: ___ bpm (rhythm: ___)
- Respiratory Rate: ___ breaths/min
- O2 Saturation: ___%
- Temperature: ___°C
- Pain Scale: __/10

## ABCDE Assessment
### Airway
- Patent/Compromised: ___
- Intervention: ___

### Breathing
- Rate/Quality: ___
- Breath Sounds: ___
- SpO2: ___%

### Circulation
- Pulse: Strong/Weak/Absent
- Capillary Refill: ___
- Skin: ___

## Clinical Impression
1. Primary Diagnosis: ___
2. Differential Diagnoses:
   - ___
   - ___

## Immediate Management
### Medications Administered
- ___mg ___ IV/PO at ___hrs

### Procedures
- ___

## Disposition
- Admit to: ___
- Follow-up: ___`,
    notes: 'Comprehensive emergency cardiac assessment template with systematic ABCDE approach and evidence-based protocols.',
    usage_count: 15,
    last_used_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const handleTemplateCreated = (template: UserTemplate) => {
    console.log('Template created:', template);
    setIsModalOpen(false);
  };

  const handleTemplateUpdated = (template: UserTemplate) => {
    console.log('Template updated:', template);
    setIsModalOpen(false);
    setEditTemplate(null);
  };

  const openCreateModal = () => {
    setEditTemplate(null);
    setIsModalOpen(true);
  };

  const openEditModal = () => {
    setEditTemplate(demoTemplate);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] bg-clip-text text-transparent">
              Template Creation Modal
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            World-Class Design • Premium Interactions • Medical Excellence
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">
            Experience the most sophisticated template creation interface designed to impress even the most demanding designers while maintaining medical professionalism and usability.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-[#63b3ed] to-[#2b6cb0] rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Glassmorphic Design
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
              <li>• Advanced backdrop blur effects</li>
              <li>• Multi-layered glassmorphism</li>
              <li>• Animated gradient borders</li>
              <li>• Premium particle animations</li>
              <li>• Sophisticated shadow system</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] rounded-xl flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Premium Interactions
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
              <li>• Multi-step wizard with progress</li>
              <li>• Touch gesture navigation</li>
              <li>• Live template preview</li>
              <li>• Advanced keyboard shortcuts</li>
              <li>• Smart validation & suggestions</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2b6cb0] to-[#63b3ed] rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Medical Excellence
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
              <li>• Pre-built medical templates</li>
              <li>• AI-powered suggestions</li>
              <li>• Medical terminology support</li>
              <li>• ICD-10 code integration</li>
              <li>• Evidence-based structures</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-[#63b3ed] to-[#90cdf4] rounded-xl flex items-center justify-center mb-4">
              <Info className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Accessibility First
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
              <li>• WCAG 2.1 AAA compliance</li>
              <li>• Full keyboard navigation</li>
              <li>• Screen reader optimized</li>
              <li>• Reduced motion support</li>
              <li>• High contrast modes</li>
            </ul>
          </div>
        </div>

        {/* Demo Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Experience the Magic
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white rounded-xl hover:from-[#1a365d] hover:to-[#2b6cb0] transition-all duration-300 transform hover:scale-105 hover:shadow-2xl font-semibold text-lg"
            >
              <Sparkles className="w-5 h-5" />
              <span>Create New Template</span>
            </button>
            
            <button
              onClick={openEditModal}
              className="flex items-center justify-center space-x-3 px-8 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-[#2b6cb0] rounded-xl hover:bg-[#2b6cb0]/5 dark:hover:bg-[#2b6cb0]/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl font-semibold text-lg"
            >
              <FileText className="w-5 h-5" />
              <span>Edit Demo Template</span>
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-gradient-to-r from-[#63b3ed]/10 to-[#2b6cb0]/10 rounded-xl border border-[#63b3ed]/20">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              ⌨️ Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">→ ←</span>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Navigate steps</p>
              </div>
              <div>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Cmd+P</span>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Toggle preview</p>
              </div>
              <div>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Cmd+1-4</span>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Jump to step</p>
              </div>
              <div>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Esc</span>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Close modal</p>
              </div>
            </div>
          </div>

          {/* Mobile Instructions */}
          <div className="mt-4 p-6 bg-gradient-to-r from-[#90cdf4]/10 to-[#63b3ed]/10 rounded-xl border border-[#90cdf4]/20 md:hidden">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              📱 Mobile Gestures
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Swipe left/right to navigate between steps</p>
              <p>• Touch wizard steps to jump directly</p>
              <p>• Optimized for 44px touch targets</p>
            </div>
          </div>
        </div>
      </div>

      {/* The Modal */}
      <TemplateCreationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditTemplate(null);
        }}
        onTemplateCreated={handleTemplateCreated}
        editTemplate={editTemplate}
        onTemplateUpdated={handleTemplateUpdated}
      />
    </div>
  );
};