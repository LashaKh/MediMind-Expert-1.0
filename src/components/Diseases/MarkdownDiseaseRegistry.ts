// Simple markdown-based disease registry
// This replaces the complex TypeScript disease system

export interface MarkdownDiseaseItem {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  severity: 'low' | 'medium' | 'high';
  readTime: string;
  lastUpdated: string;
  markdownFile: string; // Path to markdown file
  prevalence?: string;
  specialty: 'cardiology' | 'obgyn';
}

// Simple registry of all diseases with their markdown files
export const markdownDiseaseRegistry: MarkdownDiseaseItem[] = [
  {
    id: 'evidence-based-medicine-guide',
    title: 'Evidence-Based Medicine Guide',
    category: 'Reference',
    description: 'Comprehensive guide to levels of evidence and grades of recommendation for evidence-based clinical practice.',
    tags: ['Evidence', 'Guidelines', 'Research', 'Clinical Practice'],
    severity: 'medium',
    readTime: '15 min',
    lastUpdated: 'July 21, 2025',
    markdownFile: '/diseases/evidence-based-medicine-guide.md',
    specialty: 'cardiology'
  },
  {
    id: 'hypertrophic-cardiomyopathy',
    title: 'Hypertrophic Cardiomyopathy',
    category: 'Cardiomyopathy',
    description: 'A genetic disorder characterized by left ventricular hypertrophy and preserved ejection fraction. Associated with sudden cardiac death risk.',
    tags: ['Cardiomyopathy', 'Genetic', 'Sudden Death', 'Family Screening'],
    severity: 'high',
    readTime: '25 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/hypertrophic-cardiomyopathy.md',
    prevalence: '200 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'atrial-fibrillation',
    title: 'Atrial Fibrillation',
    category: 'Electrophysiology',
    description: 'The most common sustained cardiac arrhythmia. Increases stroke risk 5-fold and requires comprehensive management.',
    tags: ['Arrhythmia', 'Stroke Prevention', 'Anticoagulation', 'Rate Control'],
    severity: 'high',
    readTime: '20 min',
    lastUpdated: 'June 19, 2025',
    markdownFile: '/diseases/atrial-fibrillation.md',
    prevalence: '700-775 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'heart-failure',
    title: 'Heart Failure',
    category: 'Heart Failure',
    description: 'A clinical syndrome resulting from structural or functional cardiac abnormalities that impair ventricular function.',
    tags: ['Heart Failure', 'HFrEF', 'HFpEF', 'Medical Management'],
    severity: 'high',
    readTime: '30 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/heart-failure-pathway-md.md',
    prevalence: '1,000 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'aortic-stenosis',
    title: 'Aortic Stenosis',
    category: 'Valvular Heart Disease',
    description: 'A chronic fibrocalcific disease resulting in aortic valve narrowing. Severe AS has 3-year survival without intervention.',
    tags: ['Valvular Disease', 'TAVR', 'SAVR', 'Stenosis'],
    severity: 'high',
    readTime: '30 min',
    lastUpdated: 'June 13, 2025',
    markdownFile: '/diseases/aortic-stenosis.md',
    prevalence: '400 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'cardiac-arrest',
    title: 'Cardiac Arrest',
    category: 'Emergency Cardiology',
    description: 'Sudden cessation of cardiac activity with hemodynamic collapse. Requires immediate CPR and advanced life support.',
    tags: ['Emergency', 'CPR', 'ACLS', 'Resuscitation'],
    severity: 'high',
    readTime: '35 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/cardiac-arrest.md',
    prevalence: '350 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'chest-pain',
    title: 'Chest Pain',
    category: 'Emergency Cardiology',
    description: 'A common presenting symptom requiring systematic evaluation to rule out acute coronary syndromes.',
    tags: ['Emergency', 'ACS', 'Diagnosis', 'Risk Stratification'],
    severity: 'high',
    readTime: '25 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/chest-pain.md',
    prevalence: 'Common presentation',
    specialty: 'cardiology'
  },
  {
    id: 'hyperkalemia',
    title: 'Hyperkalemia',
    category: 'Electrolyte Disorders',
    description: 'Elevated serum potassium levels that can cause life-threatening cardiac arrhythmias.',
    tags: ['Electrolytes', 'Arrhythmia', 'Emergency', 'Dialysis'],
    severity: 'high',
    readTime: '20 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/hyperkalemia.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'hypokalemia',
    title: 'Hypokalemia',
    category: 'Electrolyte Disorders',
    description: 'Low serum potassium levels that can cause muscle weakness and cardiac arrhythmias.',
    tags: ['Electrolytes', 'Arrhythmia', 'Muscle Weakness'],
    severity: 'medium',
    readTime: '15 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/hypokalemia.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'hypernatremia',
    title: 'Hypernatremia',
    category: 'Electrolyte Disorders',
    description: 'Elevated serum sodium levels often associated with dehydration and neurological complications.',
    tags: ['Electrolytes', 'Dehydration', 'Neurological'],
    severity: 'medium',
    readTime: '12 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/hypernatremia.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'hyponatremia',
    title: 'Hyponatremia',
    category: 'Electrolyte Disorders',
    description: 'Low serum sodium levels that can cause cerebral edema and neurological complications.',
    tags: ['Electrolytes', 'Cerebral Edema', 'Neurological'],
    severity: 'medium',
    readTime: '18 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/hyponatremia.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  // Adding all missing diseases from public/diseases folder
  {
    id: 'abdominal-aortic-aneurysm',
    title: 'Abdominal Aortic Aneurysm',
    category: 'Vascular Disease',
    description: 'Localized dilation of the abdominal aorta with risk of rupture. Screening and surgical management guidelines.',
    tags: ['Vascular', 'Aneurysm', 'Surgery', 'Screening'],
    severity: 'high',
    readTime: '45 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/abdominal-aortic-aneurysm.md',
    prevalence: '200 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'aortic-intramural-hematoma',
    title: 'Aortic Intramural Hematoma',
    category: 'Aortic Disease',
    description: 'Hemorrhage within the aortic wall without intimal tear. Variant of acute aortic syndrome.',
    tags: ['Aortic', 'Emergency', 'Imaging', 'Surgery'],
    severity: 'high',
    readTime: '18 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/aortic-intramural-hematoma.md',
    prevalence: 'Rare',
    specialty: 'cardiology'
  },
  {
    id: 'aortic-regurgitation',
    title: 'Aortic Regurgitation',
    category: 'Valvular Heart Disease',
    description: 'Diastolic filling of the left ventricle due to incompetent aortic valve. Can be acute or chronic.',
    tags: ['Valvular Disease', 'Regurgitation', 'Surgery', 'Echo'],
    severity: 'high',
    readTime: '20 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/aortic-regurgitation.md',
    prevalence: '300 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'antidromic-atrioventricular-reentrant-tachycardia',
    title: 'Antidromic AVRT',
    category: 'Electrophysiology',
    description: 'Wide complex tachycardia using accessory pathway for antegrade conduction.',
    tags: ['Arrhythmia', 'WPW', 'Electrophysiology', 'Ablation'],
    severity: 'medium',
    readTime: '10 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/antidromic-atrioventricular-reentrant-tachycardia.md',
    prevalence: 'Rare',
    specialty: 'cardiology'
  },
  {
    id: 'arrhythmogenic-right-ventricular-cardiomyopathy',
    title: 'ARVC',
    category: 'Cardiomyopathy',
    description: 'Genetic cardiomyopathy with fibrofatty replacement of RV myocardium. High sudden death risk.',
    tags: ['Cardiomyopathy', 'Genetic', 'Sudden Death', 'Arrhythmia'],
    severity: 'high',
    readTime: '25 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/arrhythmogenic-right-ventricular-cardiomyopathy.md',
    prevalence: '100 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'aspirin-overdose',
    title: 'Aspirin Overdose',
    category: 'Toxicology',
    description: 'Salicylate poisoning causing metabolic acidosis and altered mental status.',
    tags: ['Toxicology', 'Emergency', 'Overdose', 'Metabolic'],
    severity: 'high',
    readTime: '15 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/aspirin-overdose.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'atrial-flutter',
    title: 'Atrial Flutter',
    category: 'Electrophysiology',
    description: 'Organized atrial tachycardia with characteristic sawtooth pattern. Often amenable to ablation.',
    tags: ['Arrhythmia', 'Ablation', 'Anticoagulation', 'Cardioversion'],
    severity: 'medium',
    readTime: '20 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/atrial-flutter-pathway-complete.md',
    prevalence: '200 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'atrioventricular-nodal-reentrant-tachycardia',
    title: 'AVNRT',
    category: 'Electrophysiology',
    description: 'Most common paroxysmal supraventricular tachycardia. Uses dual AV nodal pathways.',
    tags: ['Arrhythmia', 'SVT', 'Electrophysiology', 'Ablation'],
    severity: 'medium',
    readTime: '12 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/atrioventricular-nodal-reentrant-tachycardia.md',
    prevalence: '300 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'beta-blocker-toxicity',
    title: 'Beta-Blocker Toxicity',
    category: 'Toxicology',
    description: 'Overdose causing bradycardia, hypotension, and altered mental status.',
    tags: ['Toxicology', 'Emergency', 'Overdose', 'Bradycardia'],
    severity: 'high',
    readTime: '12 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/beta-blocker-toxicity.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'bicuspid-aortic-valve',
    title: 'Bicuspid Aortic Valve',
    category: 'Congenital Heart Disease',
    description: 'Most common congenital heart defect. Associated with aortic stenosis and regurgitation.',
    tags: ['Congenital', 'Valvular Disease', 'Screening', 'Surgery'],
    severity: 'medium',
    readTime: '18 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/bicuspid-aortic-valve.md',
    prevalence: '1,000 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'blood-gas-analysis',
    title: 'Blood Gas Analysis',
    category: 'Diagnostics',
    description: 'Systematic approach to arterial blood gas interpretation in cardiac patients.',
    tags: ['Diagnostics', 'ABG', 'Acid-Base', 'Interpretation'],
    severity: 'low',
    readTime: '8 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/blood-gas-analysis.md',
    prevalence: 'Diagnostic tool',
    specialty: 'cardiology'
  },
  {
    id: 'blunt-cardiac-injury',
    title: 'Blunt Cardiac Injury',
    category: 'Trauma',
    description: 'Cardiac trauma from blunt chest injury. Spectrum from contusion to rupture.',
    tags: ['Trauma', 'Emergency', 'Injury', 'Surgery'],
    severity: 'high',
    readTime: '12 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/blunt-cardiac-injury.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'brugada-syndrome',
    title: 'Brugada Syndrome',
    category: 'Electrophysiology',
    description: 'Genetic disorder with characteristic ECG pattern and sudden cardiac death risk.',
    tags: ['Genetic', 'Sudden Death', 'ICD', 'Electrophysiology'],
    severity: 'high',
    readTime: '16 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/brugada-syndrome.md',
    prevalence: '50 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'calcium-channel-blocker-toxicity',
    title: 'CCB Toxicity',
    category: 'Toxicology',
    description: 'Overdose causing bradycardia, hypotension, and metabolic acidosis.',
    tags: ['Toxicology', 'Emergency', 'Overdose', 'Hypotension'],
    severity: 'high',
    readTime: '10 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/calcium-channel-blocker-toxicity.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'cardiac-amyloidosis',
    title: 'Cardiac Amyloidosis',
    category: 'Cardiomyopathy',
    description: 'Infiltrative cardiomyopathy with extracellular amyloid protein deposition.',
    tags: ['Cardiomyopathy', 'Infiltrative', 'Heart Failure', 'Diagnosis'],
    severity: 'high',
    readTime: '20 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/cardiac-amyloidosis.md',
    prevalence: '100 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'cardiogenic-shock',
    title: 'Cardiogenic Shock',
    category: 'Emergency Cardiology',
    description: 'Severe heart failure with inadequate cardiac output and tissue hypoperfusion.',
    tags: ['Emergency', 'Heart Failure', 'Shock', 'Mechanical Support'],
    severity: 'high',
    readTime: '16 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/cardiogenic-shock.md',
    prevalence: '50 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'cardiotoxicity-of-cancer-therapy',
    title: 'Cardiotoxicity of Cancer Therapy',
    category: 'Cardio-Oncology',
    description: 'Cardiac complications from chemotherapy, radiation, and targeted cancer therapies.',
    tags: ['Cardio-Oncology', 'Chemotherapy', 'Heart Failure', 'Monitoring'],
    severity: 'high',
    readTime: '40 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/cardiotoxicity-of-cancer-therapy.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'chagas-cardiomyopathy',
    title: 'Chagas Cardiomyopathy',
    category: 'Cardiomyopathy',
    description: 'Chronic cardiac manifestation of Chagas disease caused by Trypanosoma cruzi.',
    tags: ['Cardiomyopathy', 'Infectious', 'Chagas', 'Heart Failure'],
    severity: 'high',
    readTime: '12 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/chagas-cardiomyopathy.md',
    prevalence: 'Endemic areas',
    specialty: 'cardiology'
  },
  {
    id: 'chronic-thromboembolic-pulmonary-hypertension',
    title: 'CTEPH',
    category: 'Pulmonary Hypertension',
    description: 'Pulmonary hypertension from chronic thromboembolic obstruction. Potentially curable.',
    tags: ['Pulmonary Hypertension', 'Thromboembolism', 'Surgery', 'PEA'],
    severity: 'high',
    readTime: '25 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/chronic-thromboembolic-pulmonary-hypertension.md',
    prevalence: '50 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'coarctation-of-aorta',
    title: 'Coarctation of Aorta',
    category: 'Congenital Heart Disease',
    description: 'Congenital narrowing of the aorta causing upper extremity hypertension.',
    tags: ['Congenital', 'Hypertension', 'Surgery', 'Intervention'],
    severity: 'high',
    readTime: '18 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/coarctation-of-aorta.md',
    prevalence: '40 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'digoxin-toxicity',
    title: 'Digoxin Toxicity',
    category: 'Toxicology',
    description: 'Overdose of cardiac glycoside causing arrhythmias and GI symptoms.',
    tags: ['Toxicology', 'Arrhythmia', 'Emergency', 'Antidote'],
    severity: 'high',
    readTime: '10 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/digoxin-toxicity.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'disseminated-intravascular-coagulation',
    title: 'DIC',
    category: 'Hematology',
    description: 'Systemic coagulation disorder with bleeding and thrombosis.',
    tags: ['Hematology', 'Coagulation', 'Emergency', 'Bleeding'],
    severity: 'high',
    readTime: '15 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/disseminated-intravascular-coagulation.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'focal-atrial-tachycardia',
    title: 'Focal Atrial Tachycardia',
    category: 'Electrophysiology',
    description: 'Atrial tachycardia from abnormal automaticity or triggered activity.',
    tags: ['Arrhythmia', 'Electrophysiology', 'Ablation', 'Tachycardia'],
    severity: 'medium',
    readTime: '10 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/focal-atrial-tachycardia.md',
    prevalence: '100 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'heparin-induced-thrombocytopenia',
    title: 'Heparin-Induced Thrombocytopenia (HIT)',
    category: 'Hematology',
    description: 'Immune-mediated thrombocytopenia with paradoxical thrombosis risk from heparin exposure.',
    tags: ['Hematology', 'Thrombocytopenia', 'Thrombosis', 'Anticoagulation', 'Heparin', 'HIT'],
    severity: 'high',
    readTime: '25 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/heparin-induced-thrombocytopenia.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'dilated-cardiomyopathy',
    title: 'Dilated Cardiomyopathy',
    category: 'Cardiomyopathy',
    description: 'Cardiomyopathy characterized by ventricular chamber enlargement and systolic dysfunction.',
    tags: ['Cardiomyopathy', 'Heart Failure', 'Genetic', 'Transplant'],
    severity: 'high',
    readTime: '35 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/dilated-cardiomyopathy.md',
    prevalence: '200 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'dyslipidemia',
    title: 'Dyslipidemia',
    category: 'Preventive Cardiology',
    description: 'Abnormal lipid levels associated with increased cardiovascular risk.',
    tags: ['Lipids', 'Prevention', 'Statin', 'ASCVD Risk'],
    severity: 'medium',
    readTime: '45 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/dyslipidemia.md',
    prevalence: '2,000 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'hypertension',
    title: 'Hypertension',
    category: 'Hypertension',
    description: 'Elevated blood pressure, major risk factor for cardiovascular disease.',
    tags: ['Hypertension', 'Blood Pressure', 'Prevention', 'Medication'],
    severity: 'high',
    readTime: '60 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/hypertension.md',
    prevalence: '4,500 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'hypertension-in-pregnancy',
    title: 'Hypertension in Pregnancy',
    category: 'Maternal Cardiology',
    description: 'Hypertensive disorders complicating pregnancy including preeclampsia.',
    tags: ['Pregnancy', 'Hypertension', 'Preeclampsia', 'Maternal'],
    severity: 'high',
    readTime: '30 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/hypertension-in-pregnancy.md',
    prevalence: '800 per 100,000 pregnancies',
    specialty: 'cardiology'
  },
  {
    id: 'hypoplastic-left-heart-syndrome',
    title: 'Hypoplastic Left Heart Syndrome',
    category: 'Congenital Heart Disease',
    description: 'Complex congenital heart defect with underdeveloped left heart structures.',
    tags: ['Congenital', 'Surgery', 'Pediatric', 'Complex'],
    severity: 'high',
    readTime: '15 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/hypoplastic-left-heart-syndrome.md',
    prevalence: '2 per 100,000 births',
    specialty: 'cardiology'
  },
  {
    id: 'infective-endocarditis',
    title: 'Infective Endocarditis',
    category: 'Infectious Disease',
    description: 'Infection of the endocardium, particularly heart valves, with high morbidity.',
    tags: ['Infection', 'Valvular Disease', 'Surgery', 'Antibiotics'],
    severity: 'high',
    readTime: '40 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/infective-endocarditis.md',
    prevalence: '15 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'long-qt-syndrome',
    title: 'Long QT Syndrome',
    category: 'Electrophysiology',
    description: 'Genetic or acquired condition with prolonged QT interval and sudden death risk.',
    tags: ['Genetic', 'QT Prolongation', 'Sudden Death', 'Arrhythmia'],
    severity: 'high',
    readTime: '20 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/long-qt-syndrome.md',
    prevalence: '100 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'metabolic-acidosis',
    title: 'Metabolic Acidosis',
    category: 'Electrolyte Disorders',
    description: 'Primary decrease in serum bicarbonate with cardiac implications.',
    tags: ['Electrolytes', 'Acid-Base', 'Emergency', 'Metabolism'],
    severity: 'medium',
    readTime: '12 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/metabolic-acidosis.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'mitral-regurgitation',
    title: 'Mitral Regurgitation',
    category: 'Valvular Heart Disease',
    description: 'Backflow of blood from left ventricle to left atrium due to mitral valve dysfunction.',
    tags: ['Valvular Disease', 'Surgery', 'Echo', 'Repair'],
    severity: 'high',
    readTime: '25 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/mitral-regurgitation.md',
    prevalence: '500 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'myocarditis',
    title: 'Myocarditis',
    category: 'Inflammatory Heart Disease',
    description: 'Inflammation of the myocardium often caused by viral infections or autoimmune conditions.',
    tags: ['Inflammation', 'Viral', 'Heart Failure', 'Biopsy'],
    severity: 'high',
    readTime: '30 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/myocarditis.md',
    prevalence: '50 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'non-st-elevation-myocardial-infarction',
    title: 'NSTEMI',
    category: 'Acute Coronary Syndrome',
    description: 'Non-ST elevation myocardial infarction requiring urgent intervention.',
    tags: ['ACS', 'NSTEMI', 'Troponin', 'Catheterization'],
    severity: 'high',
    readTime: '50 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/non-st-elevation-myocardial-infarction.md',
    prevalence: '200 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'perioperative-cardiac-risk-management',
    title: 'Perioperative Cardiac Risk Management',
    category: 'Perioperative Care',
    description: 'Assessment and management of cardiac risk in non-cardiac surgery.',
    tags: ['Surgery', 'Risk Assessment', 'Perioperative', 'Guidelines'],
    severity: 'medium',
    readTime: '40 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/perioperative-cardiac-risk-management.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'periprocedural-management-antithrombotic-therapy',
    title: 'Periprocedural Antithrombotic Management',
    category: 'Anticoagulation',
    description: 'Management of anticoagulant and antiplatelet therapy around procedures.',
    tags: ['Anticoagulation', 'Procedure', 'Bleeding Risk', 'Bridging'],
    severity: 'medium',
    readTime: '25 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/periprocedural-management-antithrombotic-therapy.md',
    prevalence: 'Variable',
    specialty: 'cardiology'
  },
  {
    id: 'pleural-effusion',
    title: 'Pleural Effusion',
    category: 'Pulmonary',
    description: 'Accumulation of fluid in the pleural space with cardiac causes.',
    tags: ['Pleural', 'Heart Failure', 'Drainage', 'Diagnosis'],
    severity: 'medium',
    readTime: '20 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/pleural-effusion.md',
    prevalence: '300 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'postural-orthostatic-tachycardia-syndrome',
    title: 'POTS',
    category: 'Autonomic Disorders',
    description: 'Disorder of autonomic function causing orthostatic tachycardia.',
    tags: ['Autonomic', 'Tachycardia', 'Syncope', 'Orthostatic'],
    severity: 'medium',
    readTime: '15 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/postural-orthostatic-tachycardia-syndrome.md',
    prevalence: '170 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'prosthetic-heart-valves',
    title: 'Prosthetic Heart Valves',
    category: 'Valvular Heart Disease',
    description: 'Comprehensive guidelines for evaluation and management of prosthetic heart valves, including anticoagulation, antiplatelet therapy, thrombosis management, infective endocarditis protocols, and perioperative care.',
    tags: ['Valvular Disease', 'Prosthetic', 'Anticoagulation', 'Surgery', 'Endocarditis', 'Thrombosis'],
    severity: 'high',
    readTime: '45 min',
    lastUpdated: 'January 20, 2025',
    markdownFile: '/diseases/prosthetic-heart-valves.md',
    prevalence: '50 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'pulmonary-embolism',
    title: 'Pulmonary Embolism',
    category: 'Thromboembolism',
    description: 'Blockage of pulmonary arteries by blood clots with high mortality risk.',
    tags: ['PE', 'Anticoagulation', 'Emergency', 'Thrombolysis'],
    severity: 'high',
    readTime: '40 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/pulmonary-embolism-chunk1.md',
    prevalence: '100 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'pulmonary-hypertension',
    title: 'Pulmonary Hypertension',
    category: 'Pulmonary Hypertension',
    description: 'Elevated pressure in pulmonary arteries with multiple etiologies.',
    tags: ['Pulmonary Hypertension', 'Right Heart', 'Vasodilators', 'Transplant'],
    severity: 'high',
    readTime: '45 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/pulmonary-hypertension.md',
    prevalence: '100 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'st-elevation-myocardial-infarction',
    title: 'STEMI',
    category: 'Acute Coronary Syndrome',
    description: 'ST-elevation myocardial infarction requiring emergency reperfusion therapy.',
    tags: ['ACS', 'STEMI', 'Primary PCI', 'Thrombolysis'],
    severity: 'high',
    readTime: '50 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/st-elevation-myocardial-infarction.md',
    prevalence: '150 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'statin-induced-myopathy',
    title: 'Statin-Induced Myopathy',
    category: 'Drug Toxicity',
    description: 'Muscle-related side effects from statin therapy including myalgia and rhabdomyolysis.',
    tags: ['Statin', 'Myopathy', 'Drug Toxicity', 'Rhabdomyolysis'],
    severity: 'medium',
    readTime: '15 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/statin-induced-myopathy.md',
    prevalence: '100 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'subclavian-and-brachiocephalic-artery-stenosis',
    title: 'Subclavian Artery Stenosis',
    category: 'Vascular Disease',
    description: 'Narrowing of subclavian or brachiocephalic arteries causing arm claudication.',
    tags: ['Vascular', 'Stenosis', 'Intervention', 'Surgery'],
    severity: 'medium',
    readTime: '12 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/subclavian-and-brachiocephalic-artery-stenosis.md',
    prevalence: '20 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'supraventricular-tachyarrhythmias',
    title: 'Supraventricular Tachyarrhythmias',
    category: 'Electrophysiology',
    description: 'Rapid heart rhythms originating above the ventricles.',
    tags: ['Arrhythmia', 'SVT', 'Electrophysiology', 'Ablation'],
    severity: 'medium',
    readTime: '20 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/supraventricular-tachyarrhythmias.md',
    prevalence: '400 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'syncope',
    title: 'Syncope',
    category: 'Syncope',
    description: 'Transient loss of consciousness due to cerebral hypoperfusion.',
    tags: ['Syncope', 'Diagnosis', 'Risk Stratification', 'Tilt Table'],
    severity: 'medium',
    readTime: '35 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/syncope.md',
    prevalence: '620 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'thoracic-aortic-aneurysm',
    title: 'Thoracic Aortic Aneurysm',
    category: 'Aortic Disease',
    description: 'Dilation of the thoracic aorta with risk of rupture or dissection.',
    tags: ['Aortic', 'Aneurysm', 'Surgery', 'Screening'],
    severity: 'high',
    readTime: '50 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/thoracic-aortic-aneurysm.md',
    prevalence: '60 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'thoracic-aortic-dissection',
    title: 'Thoracic Aortic Dissection',
    category: 'Aortic Disease',
    description: 'Tear in the aortic intima causing false lumen formation.',
    tags: ['Aortic', 'Dissection', 'Emergency', 'Surgery'],
    severity: 'high',
    readTime: '35 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/thoracic-aortic-dissection.md',
    prevalence: '30 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'tobacco-use',
    title: 'Tobacco Use and Cardiovascular Disease',
    category: 'Prevention',
    description: 'Impact of tobacco use on cardiovascular health and cessation strategies.',
    tags: ['Tobacco', 'Prevention', 'Cessation', 'Risk Factor'],
    severity: 'high',
    readTime: '25 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/tobacco-use.md',
    prevalence: '1,400 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'transient-ischemic-attack',
    title: 'Transient Ischemic Attack (TIA)',
    category: 'Cerebrovascular Disease',
    description: 'Temporary neurological deficits due to focal brain ischemia.',
    tags: ['TIA', 'Stroke', 'Prevention', 'Anticoagulation'],
    severity: 'high',
    readTime: '40 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/transient-ischemic-attack.md',
    prevalence: '240 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'traumatic-thoracic-aortic-injury',
    title: 'Traumatic Thoracic Aortic Injury',
    category: 'Trauma',
    description: 'Aortic injury from blunt chest trauma requiring emergency intervention.',
    tags: ['Trauma', 'Aortic', 'Emergency', 'Surgery'],
    severity: 'high',
    readTime: '20 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/traumatic-thoracic-aortic-injury.md',
    prevalence: 'Trauma-related',
    specialty: 'cardiology'
  },
  {
    id: 'tricuspid-regurgitation',
    title: 'Tricuspid Regurgitation',
    category: 'Valvular Heart Disease',
    description: 'Backflow through the tricuspid valve often secondary to left heart disease.',
    tags: ['Valvular Disease', 'Right Heart', 'Surgery', 'Echo'],
    severity: 'medium',
    readTime: '15 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/tricuspid-regurgitation.md',
    prevalence: '400 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'ventricular-arrhythmias',
    title: 'Ventricular Arrhythmias',
    category: 'Electrophysiology',
    description: 'Life-threatening arrhythmias originating from the ventricles.',
    tags: ['Arrhythmia', 'VT', 'VF', 'ICD', 'Sudden Death'],
    severity: 'high',
    readTime: '45 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/ventricular-arrhythmias.md',
    prevalence: '200 per 100,000',
    specialty: 'cardiology'
  },
  {
    id: 'wolff-parkinson-white-syndrome',
    title: 'Wolff-Parkinson-White Syndrome',
    category: 'Electrophysiology',
    description: 'Pre-excitation syndrome with accessory pathway and arrhythmia risk.',
    tags: ['Pre-excitation', 'WPW', 'Ablation', 'Sudden Death'],
    severity: 'medium',
    readTime: '12 min',
    lastUpdated: 'May 31, 2025',
    markdownFile: '/diseases/wolff-parkinson-white-syndrome.md',
    prevalence: '150 per 100,000',
    specialty: 'cardiology'
  }
];

// Helper functions
export const getDiseaseById = (id: string): MarkdownDiseaseItem | undefined => {
  return markdownDiseaseRegistry.find(disease => disease.id === id);
};

export const getDiseasesByCategory = (category: string): MarkdownDiseaseItem[] => {
  if (category === 'all') return markdownDiseaseRegistry;
  return markdownDiseaseRegistry.filter(disease => 
    disease.category.toLowerCase().includes(category.toLowerCase())
  );
};

export const getDiseasesBySpecialty = (specialty: 'cardiology' | 'obgyn'): MarkdownDiseaseItem[] => {
  return markdownDiseaseRegistry.filter(disease => disease.specialty === specialty);
};

export const searchDiseases = (query: string): MarkdownDiseaseItem[] => {
  const lowerQuery = query.toLowerCase();
  return markdownDiseaseRegistry.filter(disease =>
    disease.title.toLowerCase().includes(lowerQuery) ||
    disease.description.toLowerCase().includes(lowerQuery) ||
    disease.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getAllDiseases = (): MarkdownDiseaseItem[] => {
  return markdownDiseaseRegistry;
}; 