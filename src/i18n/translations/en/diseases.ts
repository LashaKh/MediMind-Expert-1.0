export const diseases = {
  detailPage: {
    idNotProvided: 'Disease ID not provided',
    notFound: 'Disease not found',
    loadError: 'Failed to load disease content: {errorMessage}',
    backButton: 'Back to Diseases',
    loadingTitle: 'Loading Medical Document',
    loadingSubtext: 'Preparing clinical content...', 
    errorTitle: 'Disease Not Found',
    errorMessage: 'The requested disease could not be found in our medical database.',
    returnButton: 'Return to Disease List',
    readTime: 'Read Time',
    lastUpdated: 'Last Updated',
    prevalence: 'Prevalence',
    evidenceLevel: 'Evidence Level',
    gradeA: 'Grade A',
    bookmarked: 'Bookmarked',
    bookmark: 'Bookmark',
    share: 'Share',
    proContent: 'Professional medical content',
    contentNotAvailable: 'Content Not Available',
    contentNotAvailableMessage: 'The clinical content for this disease is not yet available. Please check back later or contact support.',
    severity: {
      critical: 'Critical Condition',
      criticalDesc: 'Requires immediate medical attention',
      moderate: 'Moderate Severity',
      moderateDesc: 'Requires careful monitoring',
      stable: 'Stable Condition',
      stableDesc: 'Generally manageable',
      unknown: 'Unknown',
      unknownDesc: 'Severity not specified'
    }
  },
  indexPage: {
    hero: {
      title: 'Disease Guidelines & Pathways',
      subtitle: 'Comprehensive medical guidelines and clinical pathways for evidence-based practice',
      knowledgeBase: 'Medical Knowledge Base'
    },
    search: {
      placeholder: 'Search diseases, symptoms, treatments, or guidelines...'
    },
    filters: {
      allCategories: 'All Categories',
      cardiomyopathy: 'Cardiomyopathy',
      electrophysiology: 'Electrophysiology',
      heartFailure: 'Heart Failure',
      valvular: 'Valvular Disease',
      emergency: 'Emergency',
      electrolyte: 'Electrolyte Disorders'
    },
    sort: {
      title: 'Title A-Z',
      severity: 'Severity',
      readTime: 'Read Time',
      updated: 'Last Updated'
    },
    results: {
      found_one: '{{count}} Disease Found',
      found_other: '{{count}} Diseases Found',
      clearSearch: 'Clear search'
    },
    empty: {
      title: 'No diseases found',
      message: 'Try adjusting your search terms or filters to find the medical guidelines you\'re looking for.',
      button: 'View All Diseases'
    },
    card: {
      more_one: '+{{count}} more',
      more_other: '+{{count}} more'
    },
    severityLabels: {
      critical: 'Critical',
      moderate: 'Moderate',
      stable: 'Stable',
      unknown: 'Unknown'
    }
  },
  registry: {
    'evidence-based-medicine-guide': {
      title: 'Evidence-Based Medicine Guide',
      category: 'Reference',
      description: 'Comprehensive guide to levels of evidence and grades of recommendation for evidence-based clinical practice.',
      tags: ['Evidence', 'Guidelines', 'Research', 'Clinical Practice']
    },
    'hypertrophic-cardiomyopathy': {
      title: 'Hypertrophic Cardiomyopathy',
      category: 'Cardiomyopathy',
      description: 'A genetic disorder characterized by left ventricular hypertrophy and preserved ejection fraction. Associated with sudden cardiac death risk.',
      tags: ['Cardiomyopathy', 'Genetic', 'Sudden Death', 'Family Screening']
    },
    'atrial-fibrillation': {
      title: 'Atrial Fibrillation',
      category: 'Electrophysiology',
      description: 'The most common sustained cardiac arrhythmia. Increases stroke risk 5-fold and requires comprehensive management.',
      tags: ['Arrhythmia', 'Stroke Prevention', 'Anticoagulation', 'Rate Control']
    },
    'heart-failure': {
      title: 'Heart Failure',
      category: 'Heart Failure',
      description: 'A clinical syndrome resulting from structural or functional cardiac abnormalities that impair ventricular function.',
      tags: ['Heart Failure', 'HFrEF', 'HFpEF', 'Medical Management']
    },
    'aortic-stenosis': {
      title: 'Aortic Stenosis',
      category: 'Valvular Heart Disease',
      description: 'A chronic fibrocalcific disease resulting in aortic valve narrowing. Severe AS has 3-year survival without intervention.',
      tags: ['Valvular Disease', 'TAVR', 'SAVR', 'Stenosis']
    },
    'cardiac-arrest': {
      title: 'Cardiac Arrest',
      category: 'Emergency Cardiology',
      description: 'Sudden cessation of cardiac activity with hemodynamic collapse. Requires immediate CPR and advanced life support.',
      tags: ['Emergency', 'CPR', 'ACLS', 'Resuscitation']
    },
    'chest-pain': {
      title: 'Chest Pain',
      category: 'Emergency Cardiology',
      description: 'A common presenting symptom requiring systematic evaluation to rule out acute coronary syndromes.',
      tags: ['Emergency', 'ACS', 'Diagnosis', 'Risk Stratification']
    },
    'hyperkalemia': {
      title: 'Hyperkalemia',
      category: 'Electrolyte Disorders',
      description: 'Elevated serum potassium levels that can cause life-threatening cardiac arrhythmias.',
      tags: ['Electrolytes', 'Arrhythmia', 'Emergency', 'Dialysis']
    },
    'hypokalemia': {
      title: 'Hypokalemia',
      category: 'Electrolyte Disorders',
      description: 'Low serum potassium levels that can cause muscle weakness and cardiac arrhythmias.',
      tags: ['Electrolytes', 'Arrhythmia', 'Muscle Weakness']
    },
    'hypernatremia': {
      title: 'Hypernatremia',
      category: 'Electrolyte Disorders',
      description: 'Elevated serum sodium levels often associated with dehydration and neurological complications.',
      tags: ['Electrolytes', 'Dehydration', 'Neurological']
    },
    'hyponatremia': {
      title: 'Hyponatremia',
      category: 'Electrolyte Disorders',
      description: 'Low serum sodium levels that can cause cerebral edema and neurological complications.',
      tags: ['Electrolytes', 'Cerebral Edema', 'Neurological']
    },
    'abdominal-aortic-aneurysm': {
      title: 'Abdominal Aortic Aneurysm',
      category: 'Vascular Disease',
      description: 'Localized dilation of the abdominal aorta with risk of rupture. Screening and surgical management guidelines.',
      tags: ['Vascular', 'Aneurysm', 'Surgery', 'Screening']
    },
    'aortic-intramural-hematoma': {
      title: 'Aortic Intramural Hematoma',
      category: 'Aortic Disease',
      description: 'Hemorrhage within the aortic wall without intimal tear. Variant of acute aortic syndrome.',
      tags: ['Aortic', 'Emergency', 'Imaging', 'Surgery']
    },
    'aortic-regurgitation': {
      title: 'Aortic Regurgitation',
      category: 'Valvular Heart Disease',
      description: 'Diastolic filling of the left ventricle due to incompetent aortic valve. Can be acute or chronic.',
      tags: ['Valvular Disease', 'Regurgitation', 'Surgery', 'Echo']
    },
    'antidromic-atrioventricular-reentrant-tachycardia': {
      title: 'Antidromic AVRT',
      category: 'Electrophysiology',
      description: 'Wide complex tachycardia using accessory pathway for antegrade conduction.',
      tags: ['Arrhythmia', 'WPW', 'Electrophysiology', 'Ablation']
    },
    'arrhythmogenic-right-ventricular-cardiomyopathy': {
      title: 'ARVC',
      category: 'Cardiomyopathy',
      description: 'Genetic cardiomyopathy with fibrofatty replacement of RV myocardium. High sudden death risk.',
      tags: ['Cardiomyopathy', 'Genetic', 'Sudden Death', 'Arrhythmia']
    },
    'aspirin-overdose': {
      title: 'Aspirin Overdose',
      category: 'Toxicology',
      description: 'Salicylate poisoning causing metabolic acidosis and altered mental status.',
      tags: ['Toxicology', 'Emergency', 'Overdose', 'Metabolic']
    },
    'atrial-flutter': {
      title: 'Atrial Flutter',
      category: 'Electrophysiology',
      description: 'Organized atrial tachycardia with characteristic sawtooth pattern. Often amenable to ablation.',
      tags: ['Arrhythmia', 'Ablation', 'Anticoagulation', 'Cardioversion']
    },
    'atrioventricular-nodal-reentrant-tachycardia': {
      title: 'AVNRT',
      category: 'Electrophysiology',
      description: 'Most common paroxysmal supraventricular tachycardia. Uses dual AV nodal pathways.',
      tags: ['Arrhythmia', 'SVT', 'Electrophysiology', 'Ablation']
    },
    'beta-blocker-toxicity': {
      title: 'Beta-Blocker Toxicity',
      category: 'Toxicology',
      description: 'Overdose causing bradycardia, hypotension, and altered mental status.',
      tags: ['Toxicology', 'Emergency', 'Overdose', 'Bradycardia']
    },
    'bicuspid-aortic-valve': {
      title: 'Bicuspid Aortic Valve',
      category: 'Congenital Heart Disease',
      description: 'Most common congenital heart defect. Associated with aortic stenosis and regurgitation.',
      tags: ['Congenital', 'Valvular Disease', 'Screening', 'Surgery']
    },
    'blood-gas-analysis': {
      title: 'Blood Gas Analysis',
      category: 'Diagnostics',
      description: 'Systematic approach to arterial blood gas interpretation in cardiac patients.',
      tags: ['Diagnostics', 'ABG', 'Acid-Base', 'Interpretation']
    },
    'blunt-cardiac-injury': {
      title: 'Blunt Cardiac Injury',
      category: 'Trauma',
      description: 'Cardiac trauma from blunt chest injury. Spectrum from contusion to rupture.',
      tags: ['Trauma', 'Emergency', 'Injury', 'Surgery']
    },
    'brugada-syndrome': {
      title: 'Brugada Syndrome',
      category: 'Electrophysiology',
      description: 'Genetic disorder with characteristic ECG pattern and sudden cardiac death risk.',
      tags: ['Genetic', 'Sudden Death', 'ICD', 'Electrophysiology']
    },
    'calcium-channel-blocker-toxicity': {
      title: 'CCB Toxicity',
      category: 'Toxicology',
      description: 'Overdose causing bradycardia, hypotension, and metabolic acidosis.',
      tags: ['Toxicology', 'Emergency', 'Overdose', 'Hypotension']
    },
    'cardiac-amyloidosis': {
      title: 'Cardiac Amyloidosis',
      category: 'Cardiomyopathy',
      description: 'Infiltrative cardiomyopathy with extracellular amyloid protein deposition.',
      tags: ['Cardiomyopathy', 'Infiltrative', 'Heart Failure', 'Diagnosis']
    },
    'cardiogenic-shock': {
      title: 'Cardiogenic Shock',
      category: 'Emergency Cardiology',
      description: 'Severe heart failure with inadequate cardiac output and tissue hypoperfusion.',
      tags: ['Emergency', 'Heart Failure', 'Shock', 'Mechanical Support']
    },
    'cardiotoxicity-of-cancer-therapy': {
      title: 'Cardiotoxicity of Cancer Therapy',
      category: 'Cardio-Oncology',
      description: 'Cardiac complications from chemotherapy, radiation, and targeted cancer therapies.',
      tags: ['Cardio-Oncology', 'Chemotherapy', 'Heart Failure', 'Monitoring']
    },
    'chagas-cardiomyopathy': {
      title: 'Chagas Cardiomyopathy',
      category: 'Cardiomyopathy',
      description: 'Chronic cardiac manifestation of Chagas disease caused by Trypanosoma cruzi.',
      tags: ['Cardiomyopathy', 'Infectious', 'Chagas', 'Heart Failure']
    },
    'chronic-thromboembolic-pulmonary-hypertension': {
      title: 'CTEPH',
      category: 'Pulmonary Hypertension',
      description: 'Pulmonary hypertension from chronic thromboembolic obstruction. Potentially curable.',
      tags: ['Pulmonary Hypertension', 'Thromboembolism', 'Surgery', 'PEA']
    },
    'coarctation-of-aorta': {
      title: 'Coarctation of Aorta',
      category: 'Congenital Heart Disease',
      description: 'Congenital narrowing of the aorta causing upper extremity hypertension.',
      tags: ['Congenital', 'Hypertension', 'Surgery', 'Intervention']
    },
    'digoxin-toxicity': {
      title: 'Digoxin Toxicity',
      category: 'Toxicology',
      description: 'Overdose of cardiac glycoside causing arrhythmias and GI symptoms.',
      tags: ['Toxicology', 'Arrhythmia', 'Emergency', 'Antidote']
    },
    'disseminated-intravascular-coagulation': {
      title: 'DIC',
      category: 'Hematology',
      description: 'Systemic coagulation disorder with bleeding and thrombosis.',
      tags: ['Hematology', 'Coagulation', 'Emergency', 'Bleeding']
    },
    'focal-atrial-tachycardia': {
      title: 'Focal Atrial Tachycardia',
      category: 'Electrophysiology',
      description: 'Atrial tachycardia from abnormal automaticity or triggered activity.',
      tags: ['Arrhythmia', 'Electrophysiology', 'Ablation', 'Tachycardia']
    },
    'heparin-induced-thrombocytopenia': {
      title: 'Heparin-Induced Thrombocytopenia (HIT)',
      category: 'Hematology',
      description: 'Immune-mediated thrombocytopenia with paradoxical thrombosis risk from heparin exposure.',
      tags: ['Hematology', 'Thrombocytopenia', 'Thrombosis', 'Anticoagulation', 'Heparin', 'HIT']
    },
    'dilated-cardiomyopathy': {
      title: 'Dilated Cardiomyopathy',
      category: 'Cardiomyopathy',
      description: 'Cardiomyopathy characterized by ventricular chamber enlargement and systolic dysfunction.',
      tags: ['Cardiomyopathy', 'Heart Failure', 'Genetic', 'Transplant']
    },
    'dyslipidemia': {
      title: 'Dyslipidemia',
      category: 'Preventive Cardiology',
      description: 'Abnormal lipid levels associated with increased cardiovascular risk.',
      tags: ['Lipids', 'Prevention', 'Statin', 'ASCVD Risk']
    },
    'hypertension': {
      title: 'Hypertension',
      category: 'Hypertension',
      description: 'Elevated blood pressure, major risk factor for cardiovascular disease.',
      tags: ['Hypertension', 'Blood Pressure', 'Prevention', 'Medication']
    },
    'hypertension-in-pregnancy': {
      title: 'Hypertension in Pregnancy',
      category: 'Maternal Cardiology',
      description: 'Hypertensive disorders complicating pregnancy including preeclampsia.',
      tags: ['Pregnancy', 'Hypertension', 'Preeclampsia', 'Maternal']
    },
    'hypoplastic-left-heart-syndrome': {
      title: 'Hypoplastic Left Heart Syndrome',
      category: 'Congenital Heart Disease',
      description: 'Complex congenital heart defect with underdeveloped left heart structures.',
      tags: ['Congenital', 'Surgery', 'Pediatric', 'Complex']
    },
    'infective-endocarditis': {
      title: 'Infective Endocarditis',
      category: 'Infectious Disease',
      description: 'Infection of the endocardium, particularly heart valves, with high morbidity.',
      tags: ['Infection', 'Valvular Disease', 'Surgery', 'Antibiotics']
    },
    'long-qt-syndrome': {
      title: 'Long QT Syndrome',
      category: 'Electrophysiology',
      description: 'Genetic or acquired condition with prolonged QT interval and sudden death risk.',
      tags: ['Genetic', 'QT Prolongation', 'Sudden Death', 'Arrhythmia']
    },
    'metabolic-acidosis': {
      title: 'Metabolic Acidosis',
      category: 'Electrolyte Disorders',
      description: 'Primary decrease in serum bicarbonate with cardiac implications.',
      tags: ['Electrolytes', 'Acid-Base', 'Emergency', 'Metabolism']
    },
    'mitral-regurgitation': {
      title: 'Mitral Regurgitation',
      category: 'Valvular Heart Disease',
      description: 'Backflow of blood from left ventricle to left atrium due to mitral valve dysfunction.',
      tags: ['Valvular Disease', 'Surgery', 'Echo', 'Repair']
    },
    'myocarditis': {
      title: 'Myocarditis',
      category: 'Inflammatory Heart Disease',
      description: 'Inflammation of the myocardium often caused by viral infections or autoimmune conditions.',
      tags: ['Inflammation', 'Viral', 'Heart Failure', 'Biopsy']
    },
    'non-st-elevation-myocardial-infarction': {
      title: 'NSTEMI',
      category: 'Acute Coronary Syndrome',
      description: 'Non-ST elevation myocardial infarction requiring urgent intervention.',
      tags: ['ACS', 'NSTEMI', 'Troponin', 'Catheterization']
    },
    'perioperative-cardiac-risk-management': {
      title: 'Perioperative Cardiac Risk Management',
      category: 'Perioperative Care',
      description: 'Assessment and management of cardiac risk in non-cardiac surgery.',
      tags: ['Surgery', 'Risk Assessment', 'Perioperative', 'Guidelines']
    },
    'periprocedural-management-antithrombotic-therapy': {
      title: 'Periprocedural Antithrombotic Management',
      category: 'Anticoagulation',
      description: 'Management of anticoagulant and antiplatelet therapy around procedures.',
      tags: ['Anticoagulation', 'Procedure', 'Bleeding Risk', 'Bridging']
    },
    'pleural-effusion': {
      title: 'Pleural Effusion',
      category: 'Pulmonary',
      description: 'Accumulation of fluid in the pleural space with cardiac causes.',
      tags: ['Pleural', 'Heart Failure', 'Drainage', 'Diagnosis']
    },
    'postural-orthostatic-tachycardia-syndrome': {
      title: 'POTS',
      category: 'Autonomic Disorders',
      description: 'Disorder of autonomic function causing orthostatic tachycardia.',
      tags: ['Autonomic', 'Tachycardia', 'Syncope', 'Orthostatic']
    },
    'prosthetic-heart-valves': {
      title: 'Prosthetic Heart Valves',
      category: 'Valvular Heart Disease',
      description: 'Comprehensive guidelines for evaluation and management of prosthetic heart valves, including anticoagulation, antiplatelet therapy, thrombosis management, infective endocarditis protocols, and perioperative care.',
      tags: ['Valvular Disease', 'Prosthetic', 'Anticoagulation', 'Surgery', 'Endocarditis', 'Thrombosis']
    },
    'pulmonary-embolism': {
      title: 'Pulmonary Embolism',
      category: 'Thromboembolism',
      description: 'Blockage of pulmonary arteries by blood clots with high mortality risk.',
      tags: ['PE', 'Anticoagulation', 'Emergency', 'Thrombolysis']
    },
    'pulmonary-hypertension': {
      title: 'Pulmonary Hypertension',
      category: 'Pulmonary Hypertension',
      description: 'Elevated pressure in pulmonary arteries with multiple etiologies.',
      tags: ['Pulmonary Hypertension', 'Right Heart', 'Vasodilators', 'Transplant']
    },
    'st-elevation-myocardial-infarction': {
      title: 'STEMI',
      category: 'Acute Coronary Syndrome',
      description: 'ST-elevation myocardial infarction requiring emergency reperfusion therapy.',
      tags: ['ACS', 'STEMI', 'Primary PCI', 'Thrombolysis']
    },
    'statin-induced-myopathy': {
      title: 'Statin-Induced Myopathy',
      category: 'Drug Toxicity',
      description: 'Muscle-related side effects from statin therapy including myalgia and rhabdomyolysis.',
      tags: ['Statin', 'Myopathy', 'Drug Toxicity', 'Rhabdomyolysis']
    },
    'subclavian-and-brachiocephalic-artery-stenosis': {
      title: 'Subclavian Artery Stenosis',
      category: 'Vascular Disease',
      description: 'Narrowing of subclavian or brachiocephalic arteries causing arm claudication.',
      tags: ['Vascular', 'Stenosis', 'Intervention', 'Surgery']
    },
    'supraventricular-tachyarrhythmias': {
      title: 'Supraventricular Tachyarrhythmias',
      category: 'Electrophysiology',
      description: 'Rapid heart rhythms originating above the ventricles.',
      tags: ['Arrhythmia', 'SVT', 'Electrophysiology', 'Ablation']
    },
    'syncope': {
      title: 'Syncope',
      category: 'Syncope',
      description: 'Transient loss of consciousness due to cerebral hypoperfusion.',
      tags: ['Syncope', 'Diagnosis', 'Risk Stratification', 'Tilt Table']
    },
    'thoracic-aortic-aneurysm': {
      title: 'Thoracic Aortic Aneurysm',
      category: 'Aortic Disease',
      description: 'Dilation of the thoracic aorta with risk of rupture or dissection.',
      tags: ['Aortic', 'Aneurysm', 'Surgery', 'Screening']
    },
    'thoracic-aortic-dissection': {
      title: 'Thoracic Aortic Dissection',
      category: 'Aortic Disease',
      description: 'Tear in the aortic intima causing false lumen formation.',
      tags: ['Aortic', 'Dissection', 'Emergency', 'Surgery']
    },
    'tobacco-use': {
      title: 'Tobacco Use and Cardiovascular Disease',
      category: 'Prevention',
      description: 'Impact of tobacco use on cardiovascular health and cessation strategies.',
      tags: ['Tobacco', 'Prevention', 'Cessation', 'Risk Factor']
    },
    'transient-ischemic-attack': {
      title: 'Transient Ischemic Attack (TIA)',
      category: 'Cerebrovascular Disease',
      description: 'Temporary neurological deficits due to focal brain ischemia.',
      tags: ['TIA', 'Stroke', 'Prevention', 'Anticoagulation']
    },
    'traumatic-thoracic-aortic-injury': {
      title: 'Traumatic Thoracic Aortic Injury',
      category: 'Trauma',
      description: 'Aortic injury from blunt chest trauma requiring emergency intervention.',
      tags: ['Trauma', 'Aortic', 'Emergency', 'Surgery']
    },
    'tricuspid-regurgitation': {
      title: 'Tricuspid Regurgitation',
      category: 'Valvular Heart Disease',
      description: 'Backflow through the tricuspid valve often secondary to left heart disease.',
      tags: ['Valvular Disease', 'Right Heart', 'Surgery', 'Echo']
    },
    'ventricular-arrhythmias': {
      title: 'Ventricular Arrhythmias',
      category: 'Electrophysiology',
      description: 'Life-threatening arrhythmias originating from the ventricles.',
      tags: ['Arrhythmia', 'VT', 'VF', 'ICD', 'Sudden Death']
    },
    'wolff-parkinson-white-syndrome': {
      title: 'Wolff-Parkinson-White Syndrome',
      category: 'Electrophysiology',
      description: 'Pre-excitation syndrome with accessory pathway and arrhythmia risk.',
      tags: ['Pre-excitation', 'WPW', 'Ablation', 'Sudden Death']
    }
  }
};

export default diseases;
