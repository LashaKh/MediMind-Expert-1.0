import React, { useState } from 'react';
import InteractiveMarkdownViewer from './InteractiveMarkdownViewer';
import { FileText, Upload, Link, Code } from 'lucide-react';

// Demo markdown files (you can add more here)
const DEMO_FILES = {
  'hypertrophic-cardiomyopathy': {
    title: 'Hypertrophic Cardiomyopathy - Clinical Guidelines',
    content: `# Hypertrophic Cardiomyopathy

*Source: [Pathway.md - Hypertrophic Cardiomyopathy](https://www.pathway.md/diseases/hypertrophic-cardiomyopathy-recp2rCpGQe4lzw9C)*

## Overview

### Definition
HCM is a genetic disorder characterized by LVH and a non-dilated left ventricle with preserved or increased ejection fraction.

### Pathophysiology
HCM is most frequently caused by genetic mutations in genes (β-myosin heavy chain [MYH7] and myosin binding protein C [MYBPC3]) encoding sarcomere proteins.

### Epidemiology
The prevalence of HCM in the US is low, with an estimated 200 cases per 100,000 population.

## Clinical Findings

### Symptoms
- **Chest pain** - Most common presenting symptom
- **Dyspnea** - Due to increased LV end-diastolic pressure
- **Exercise intolerance** - Related to outflow obstruction
- **Syncope** - May indicate arrhythmic risk
- **Palpitations** - Often due to atrial fibrillation

### Physical Examination
- **Cardiac murmur** - Harsh systolic murmur at left sternal border
- **S4 gallop** - Due to reduced ventricular compliance
- **Bifid pulse** - Characteristic arterial waveform

## Diagnostic Investigations

### Echocardiography
- **Wall thickness** ≥15 mm in adults (≥13 mm with family history)
- **Systolic anterior motion** of mitral valve
- **LV outflow obstruction** - Gradient ≥30 mmHg

### ECG Findings
- **LVH criteria** - Voltage criteria positive
- **ST-T changes** - Lateral leads commonly affected
- **Q waves** - May be prominent in lateral leads

### Cardiac MRI
- **Late gadolinium enhancement** - Indicates fibrosis
- **Apical aneurysms** - High-risk feature
- **Accurate wall thickness** - Especially in difficult acoustic windows

## Risk Stratification

### High-Risk Features
1. **Family history** of premature SCD
2. **Massive LVH** (≥30 mm)
3. **Non-sustained VT** on Holter monitoring
4. **Unexplained syncope**
5. **LV apical aneurysm**

### SCD Risk Calculators
- **HCM Risk-SCD** - 5-year risk calculator
- **Enhanced American model** - Additional risk factors

## Management

### Medical Therapy
- **Beta-blockers** - First-line for symptoms
- **Calcium channel blockers** - Alternative if beta-blockers contraindicated
- **Disopyramide** - For refractory obstruction

### Advanced Therapies
- **Septal myectomy** - Gold standard for severe obstruction
- **Alcohol septal ablation** - Alternative in selected patients
- **ICD implantation** - For high SCD risk

### Lifestyle Modifications
- **Activity restriction** - Avoid competitive sports
- **Family screening** - Genetic counseling recommended
- **Regular follow-up** - Annual assessment minimum

## Prognosis

### Overall Mortality
- **Annual mortality rate** - 0.5% in adults
- **Pediatric cases** - Higher mortality risk
- **SCD prevention** - ICD therapy effective

### Disease Progression
- **End-stage HF** - May develop over time
- **Atrial fibrillation** - Common complication
- **Stroke risk** - Increased with AF

> **Clinical Pearl**: Early identification and appropriate risk stratification are crucial for preventing sudden cardiac death in HCM patients.

## References

1. Maron MS, et al. Clinical course and quality of life in high-risk patients with hypertrophic cardiomyopathy. Am J Cardiol. 2018.
2. Elliott PM, et al. 2014 ESC Guidelines on diagnosis and management of hypertrophic cardiomyopathy. Eur Heart J. 2014.
3. Ommen SR, et al. 2020 AHA/ACC Guideline for the Diagnosis and Treatment of Patients With Hypertrophic Cardiomyopathy. J Am Coll Cardiol. 2020.`
  },
  'heart-failure': {
    title: 'Heart Failure - Clinical Management',
    content: `# Heart Failure

## Overview

Heart Failure (HF) is a clinical syndrome resulting from structural or functional cardiac abnormalities that impair ventricular filling or ejection of blood.

## Classification

### By Ejection Fraction
- **HFrEF** - Heart Failure with reduced Ejection Fraction (≤40%)
- **HFmrEF** - Heart Failure with mildly reduced Ejection Fraction (41-49%)  
- **HFpEF** - Heart Failure with preserved Ejection Fraction (≥50%)

### NYHA Functional Classification
- **Class I** - No limitation of physical activity
- **Class II** - Slight limitation of physical activity
- **Class III** - Marked limitation of physical activity
- **Class IV** - Unable to carry on any physical activity

## Diagnosis

### Clinical Presentation
- **Symptoms**: Dyspnea, fatigue, fluid retention, reduced exercise tolerance
- **Signs**: Elevated JVP, pulmonary rales, peripheral edema, S3 gallop

### Diagnostic Tests
- **BNP/NT-proBNP** - Elevated levels support diagnosis
- **Echocardiography** - Assess structure and function
- **ECG** - May show underlying cardiac abnormalities
- **Chest X-ray** - Pulmonary congestion, cardiomegaly

## Management

### Pharmacological Treatment

#### ACE Inhibitors/ARBs/ARNIs
- **First-line therapy** for HFrEF
- **Benefits**: Mortality reduction, symptom improvement
- **Monitoring**: Renal function, potassium levels

#### Beta-blockers
- **Evidence-based therapy** for HFrEF
- **Agents**: Metoprolol, carvedilol, bisoprolol
- **Titration**: Start low, go slow

#### Diuretics  
- **Loop diuretics** - For volume overload
- **Thiazides** - May be added for resistant cases
- **Monitoring**: Electrolytes, renal function

### Device Therapy
- **ICD** - For primary/secondary SCD prevention
- **CRT** - For selected patients with wide QRS
- **LVAD** - Bridge to transplant or destination therapy

### Advanced Therapies
- **Heart transplantation** - End-stage HF
- **Palliative care** - Symptom management in advanced disease

## Prognosis

Varies widely based on:
- **Ejection fraction**
- **Functional class**  
- **Comorbidities**
- **Response to therapy**

> **Key Point**: Early diagnosis and evidence-based treatment can significantly improve outcomes in heart failure patients.`
  },
  'atrial-fibrillation': {
    title: 'Atrial Fibrillation - Management Guidelines',
    content: `# Atrial Fibrillation

## Overview

Atrial Fibrillation (AF) is the most common sustained cardiac arrhythmia characterized by rapid, irregular atrial activity.

## Classification

### Duration-based
- **Paroxysmal** - Self-terminating within 7 days
- **Persistent** - Sustained >7 days or requiring cardioversion
- **Long-standing persistent** - Continuous AF >12 months
- **Permanent** - AF accepted, no further attempts at rhythm control

## Risk Assessment

### CHA₂DS₂-VASc Score
- (C) - Congestive heart failure (1 point)
- **H** - Hypertension (1 point)
- **A₂** - Age ≥75 years (2 points)
- (D) - Diabetes mellitus (1 point)
- **S₂** - Stroke/TIA/thromboembolism (2 points)
- **V** - Vascular disease (1 point)
- (A)el:** (A) - Age 65-74 years (1 point)
- **Sc** - Sex category (female) (1 point)

### Bleeding Risk - HAS-BLED
- **H** - Hypertension (1 point)
- (A)el:** (A) - Abnormal renal/liver function (1-2 points)
- **S** - Stroke (1 point)
- (B) - Bleeding history (1 point)
- **L** - Labile INR (1 point)
- (E) - Elderly >65 years (1 point)
- (D) - Drugs/alcohol (1-2 points)

## Management Strategy

### Rate vs Rhythm Control

#### Rate Control
- **Target**: <110 bpm at rest (lenient control)
- **Agents**: Beta-blockers, calcium channel blockers, digoxin
- **Monitoring**: Regular heart rate assessment

#### Rhythm Control
- **Cardioversion**: Electrical or pharmacological
- **Antiarrhythmic drugs**: Class I, III agents
- **Catheter ablation**: For selected patients
- **Surgical options**: Maze procedure, left atrial appendage closure

### Anticoagulation

#### Indications
- **CHA₂DS₂-VASc ≥2** in males, ≥3 in females: Oral anticoagulation recommended
- **CHA₂DS₂-VASc = 1** in males, = 2 in females: Consider oral anticoagulation

#### Anticoagulant Options
- **DOACs** - Preferred over warfarin (dabigatran, rivaroxaban, apixaban, edoxaban)
- **Warfarin** - Alternative option, requires INR monitoring (target 2.0-3.0)

## Special Situations

### Acute Management
- **Hemodynamically unstable** - Immediate cardioversion
- **Rate control** - For stable patients
- **Anticoagulation** - Consider based on risk factors

### Perioperative Management
- **Continue anticoagulation** when bleeding risk is low
- **Bridge therapy** may be considered in high-risk patients

## Follow-up and Monitoring

### Regular Assessment
- **Symptoms** - Quality of life, exercise tolerance  
- **Heart rate/rhythm** - Clinical examination, ECG
- **Anticoagulation** - Adherence, bleeding events
- **Comorbidities** - Heart failure, hypertension

> **Clinical Reminder**: The main goals in AF management are stroke prevention and symptom control through appropriate rate or rhythm control strategies.`
  }
};

export const MarkdownFileLoader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [customContent, setCustomContent] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [inputMethod, setInputMethod] = useState<'demo' | 'paste' | 'file'>('demo');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/markdown' || file.name.endsWith('.md'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCustomContent(content);
        setCustomTitle(file.name.replace('.md', ''));
      };
      reader.readAsText(file);
    }
  };

  const renderContent = () => {
    if (inputMethod === 'demo' && selectedFile && DEMO_FILES[selectedFile as keyof typeof DEMO_FILES]) {
      const demo = DEMO_FILES[selectedFile as keyof typeof DEMO_FILES];
      return (
        <InteractiveMarkdownViewer
          markdownContent={demo.content}
          title={demo.title}
        />
      );
    }

    if (inputMethod === 'paste' && customContent) {
      return (
        <InteractiveMarkdownViewer
          markdownContent={customContent}
          title={customTitle || 'Custom Markdown Document'}
        />
      );
    }

    if (inputMethod === 'file' && customContent) {
      return (
        <InteractiveMarkdownViewer
          markdownContent={customContent}
          title={customTitle || 'Uploaded Markdown Document'}
        />
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <FileText className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Markdown Source</h2>
          <p className="text-gray-600">Choose a demo file, paste content, or upload a markdown file to get started.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Control Panel */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Interactive Markdown Viewer</h1>
          
          {/* Input Method Selection */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setInputMethod('demo')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                inputMethod === 'demo' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Demo Files
            </button>
            <button
              onClick={() => setInputMethod('paste')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                inputMethod === 'paste' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Code className="w-4 h-4 mr-2" />
              Paste Content
            </button>
            <button
              onClick={() => setInputMethod('file')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                inputMethod === 'file' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </button>
          </div>

          {/* Input Controls */}
          {inputMethod === 'demo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(DEMO_FILES).map(([key, file]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFile(key)}
                  className={`p-4 rounded-lg text-left transition-colors ${
                    selectedFile === key
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-white border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{file.title}</h3>
                  <p className="text-sm text-gray-600">
                    {file.content.substring(0, 100)}...
                  </p>
                </button>
              ))}
            </div>
          )}

          {inputMethod === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title (optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter document title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Markdown Content
                </label>
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Paste your markdown content here..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
          )}

          {inputMethod === 'file' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept=".md,.markdown,text/markdown"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-600">
                Select a markdown (.md) file to upload and display
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content Display */}
      {renderContent()}
    </div>
  );
};

export default MarkdownFileLoader;