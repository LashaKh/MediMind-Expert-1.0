const abg = {
  history: {
    title: 'ABG History',
    resultsCount: '{{count}} Results',
    filteredByPatient: 'Filtered by patient',
    comprehensiveView: 'Comprehensive history view',
    updatedAt: 'Updated {{time}}',
    select: 'Select',
    newAnalysis: 'New Analysis',
    bulk: {
      selectHelp: 'Select items to delete or export',
      selectedResults: '{{count}} result(s) selected',
      allSelected: 'All Selected ({{count}})',
      selectAllCount: 'Select All ({{count}})',
      clearSelection: 'Clear Selection',
      exportSelected: 'Export Selected',
      deleteSelected: 'Delete Selected'
    },
    cards: {
      total: 'Total',
      recent: 'Recent',
      trend: 'Trend',
      weeklyAvg: 'Weekly Avg'
    },
    progress: {
      activity: 'Analysis Activity',
      vsAverage: '{{percent}}% vs avg',
      lastUpdated: 'Last updated: {{time}}'
    }
  },
  workflow: {
    aria: {
      progress: 'Blood gas analysis progress'
    },
    progressComplete: '{{percent}}% Complete',
    steps: {
      upload: {
        label: 'Upload',
        description: 'Select blood gas report'
      },
      analysis: {
        label: 'Analysis',
        description: 'AI vision processing'
      },
      interpretation: {
        label: 'Interpretation',
        description: 'Clinical analysis'
      },
      actionPlan: {
        label: 'Action Plan (Optional)',
        description: 'Treatment recommendations'
      }
    },
    subphases: {
      extraction: 'Text Extraction',
      interpretation: 'Clinical Analysis'
    },
    completeTitle: 'Analysis Complete!',
    error: 'Processing Error',
    nextSteps: 'Next Steps'
  }
  ,
  upload: {
    aria: {
      dropzone: 'Upload blood gas report'
    },
    fileReady: 'File ready for analysis',
    removeAria: 'Remove file',
    progress: 'Upload Progress',
    progressSr: '{{percent}} percent uploaded',
    processing: {
      title: 'Processing image…',
      subtitle: 'AI is analyzing the blood gas report'
    },
    title: 'Upload blood gas report',
    subtitle: 'Drag and drop an image here, or choose a file',
    drop: {
      title: 'Drop to upload',
      subtitle: 'Release to upload for AI analysis'
    },
    chooseFile: 'Choose file',
    takePhoto: 'Take photo',
    formats: 'JPEG, PNG, WebP • up to {{size}}MB',
    errors: {
      invalidType: 'Please select a valid image file ({{types}})',
      maxSize: 'File size must be less than {{size}}MB'
    },
    type: {
      title: 'Blood Gas Type',
      subtitle: 'Select the type of analysis'
    },
    types: {
      arterialDesc: 'Most comprehensive analysis',
      venousDesc: 'Alternative analysis method'
    },
    caseContext: {
      title: 'Case Context (Optional)',
      subtitle: 'Link BG analysis to a patient case'
    },
    actions: {
      startAIAnalysis: 'Start AI Analysis'
    }
  }
  ,
  delete: {
    titleOne: 'Delete ABG Result?',
    titleMany: 'Delete {{count}} ABG Results?',
    cannotUndo: 'This action cannot be undone',
    deleting: 'Deleting...',
    complete: 'Deletion Complete',
    successMany: 'Successfully deleted {{count}} results',
    failed: 'Deletion failed',
    errorsTitle: 'Errors encountered:',
    completedIn: 'Completed in {{ms}}ms',
    cannotDelete: 'Cannot Delete',
    pleaseNote: 'Please Note',
    previewTitle: 'What will be deleted:',
    preview: {
      results: 'Results',
      dataSize: 'Data Size',
      images: 'Images',
      daySpan: 'Day Span',
      listTitle: 'Results to be deleted:',
      imageTag: 'Image'
    },
    deleteOne: 'Delete Result',
    deleteMany: 'Delete {{count}} Results'
  }
  ,
  export: {
    title: 'Export ABG Results',
    format: 'Export Format',
    dateRange: 'Date Range (Optional)',
    startDate: 'Start Date',
    endDate: 'End Date',
    clearDateRange: 'Clear Date Range',
    include: 'Include in Export',
    includeFields: {
      patientInfo: 'Patient Information',
      patientInfoDesc: 'Names, DOB, MRN',
      interpretation: 'Clinical Interpretation',
      interpretationDesc: 'AI-generated clinical analysis',
      actionPlan: 'Action Plans',
      actionPlanDesc: 'Treatment recommendations',
      images: 'Image URLs',
      imagesDesc: 'Links to uploaded images'
    },
    summary: {
      title: 'Export Summary',
      results: 'Results',
      resultsOf: '{{filtered}} of {{total}} results',
      estimatedSize: 'Estimated Size',
      includedFields: 'Included Fields'
    },
    failed: 'Export Failed',
    success: 'Export Successful',
    downloaded: 'Your file has been downloaded.',
    exporting: 'Exporting...',
    export: 'Export {{format}}',
    tips: {
      json: 'JSON format includes all data with structure preservation',
      csv: 'CSV format is suitable for spreadsheet applications',
      large: 'Large exports may take a few moments to process'
    }
  }
  ,
  results: {
    title: 'ABG Results',
    export: 'Export',
    searchPlaceholder: 'Search results...',
    sort: {
      newestfirst: 'Newest First',
      oldestfirst: 'Oldest First',
      'typea-z': 'Type A-Z',
      highestconfidence: 'Highest Confidence'
    },
    filters: {
      title: 'Filters',
      button: 'Filters',
      type: 'Type',
      allTypes: 'All Types',
      types: {
        arterial: 'Arterial Blood Gas',
        venous: 'Venous Blood Gas'
      },
      dateRange: 'Date Range',
      startDate: 'Start Date',
      endDate: 'End Date',
      hasInterpretation: 'Has Interpretation',
      hasActionPlan: 'Has Action Plan'
    },
    showing: 'Showing {{count}} results',
    showingMore: 'Showing {{count}} results (scroll for more)',
    loadFailed: 'Failed to Load Results',
    loadingMore: 'Loading more results...',
    badges: {
      interpreted: 'Interpreted',
      actionPlan: 'Action Plan'
    },
    empty: {
      title: 'No Results Found',
      tips: 'Try adjusting your search or filters',
      noResults: 'No ABG results have been created yet'
    },
    end: 'End of results',
    na: 'N/A'
  }
  ,
  filtersAdvanced: {
    title: 'Advanced Filters',
    activeCount: '{{count}} active',
    clear: 'Clear',
    patient: 'Patient',
    allPatients: 'All Patients',
    analysisType: 'Analysis Type',
    quickDates: 'Quick Dates',
    selectPeriod: 'Select period...',
    datePresets: {
      1: 'Today',
      3: 'Last 3 days',
      7: 'Last week',
      30: 'Last month',
      90: 'Last 3 months'
    },
    statusFilters: 'Status Filters',
    presets: {
      recent: { name: 'Recent Analyses' },
      pending: { name: 'Pending Review' },
      completed: { name: 'Completed' },
      arterial: { name: 'Arterial Only' },
      thisMonth: { name: 'This Month' }
    },
    saveSearch: {
      title: 'Save Search',
      saveCurrent: 'Save Current',
      placeholder: 'Search name...'
    },
    savedSearches: 'Saved Searches'
  }
  ,
  analysis: {
    loading: {
      title: 'AI Analysis in Progress',
      subtitle: 'Our advanced AI is analyzing your blood gas report using state-of-the-art vision technology.'
    },
    error: {
      title: 'Analysis Failed'
    },
    empty: 'No analysis results available',
    header: {
      title: 'Analysis Complete',
      subtitle: 'AI-powered blood gas analysis results'
    },
    waitingData: 'Blood gas analysis results will appear here after processing...',
    moreValues: '... and {{count}} more values',
    edit: {
      title: 'Edit Analysis',
      reanalyzing: 'Re-analyzing...',
      save: 'Save & Re-analyze',
      placeholder: 'Enter analysis text...'
    },
    raw: {
      title: 'Raw Analysis Data',
      badge: 'AI Generated',
      reviewHint: 'Review and edit if needed'
    },
    linesTotal: '{{count}} lines total',
    parameters: {
      title: 'Blood Gas Parameters'
    },
    complete: {
      title: 'Complete Analysis'
    }
    ,
    backToUpload: 'Back to Upload',
    getInterpretation: 'Get Clinical Interpretation'
  }
  ,
  common: {
    show: 'Show',
    hide: 'Hide',
    clickToExpand: 'Click to expand'
  }
  ,
  interpretation: {
    title: 'Clinical Interpretation',
    subtitle: 'AI-generated clinical analysis',
    summary: 'Clinical Summary:',
    waiting: 'Clinical interpretation will appear here after analysis...'
  }
  ,
  trends: {
    tabs: {
      volume: 'Analysis Volume Trends',
      quality: 'Quality Metrics',
      performance: 'Performance Analytics',
      distribution: 'Analysis Distribution'
    },
    descriptions: {
      volume: 'Daily analysis count over time',
      quality: 'Confidence and success rate trends',
      performance: 'Processing time trends',
      distribution: 'Type and quality distribution'
    },
    volume: {
      dailyTitle: 'Daily Analysis Volume',
      lineTitle: 'Number of Analyses per Day',
      statsTitle: 'Volume Statistics',
      peakDaily: 'Peak Daily',
      dailyAverage: 'Daily Average',
      total: '{{count}} Total',
      subtitle: 'Analyses in selected period'
    },
    quality: {
      title: 'Quality Trends',
      confidenceTitle: 'Average Confidence Score (%)',
      successTitle: 'Success Rate',
      successLine: 'Success Rate (%)'
    },
    performance: {
      title: 'Processing Time',
      lineTitle: 'Average Processing Time (ms)',
      metrics: 'Performance Metrics',
      fastest: 'Fastest (ms)',
      slowest: 'Slowest (ms)'
    },
    distribution: {
      typesTitle: 'Analysis Types',
      typeLine: 'Analysis Type Distribution',
      confidenceTitle: 'Confidence Distribution',
      confidenceLine: 'Confidence Score Distribution'
    },
    insights: {
      title: 'Key Insights',
      volume: 'Volume Trend',
      increasing: 'Analysis volume is increasing over time',
      stable: 'Analysis volume is stable or decreasing',
      quality: 'Quality Score',
      avgConfidence: 'Average confidence: {{val}}%',
      performance: 'Performance',
      avgProcessing: 'Avg processing: {{ms}}ms'
    }
  }
  ,
  final: {
    comprehensiveInsights: 'Your ABG analysis is ready with comprehensive insights',
    premium: 'Premium',
    aiClinicalConsultation: 'AI Clinical Consultation',
    selectActionPlan: 'Select Action Plan',
    analysisComplete: 'Analysis: Complete',
    accuracy: 'Accuracy: 99.8%',
    backToResults: 'Back to Results'
  }
  ,
  actionPlan: {
    creating: 'Creating Action Plan',
    generating: 'Generating personalized treatment recommendations and care protocols based on your analysis results.',
    failed: 'Action Plan Generation Failed',
    retry: 'Retry Generation',
    none: 'No action plan available',
    title: 'Action Plan',
    subtitle: 'Personalized treatment recommendations and care protocols',
    total: 'Total Actions',
    priority: 'Priority',
    completed: 'Completed',
    progress: 'Progress',
    overallProgress: 'Overall Progress',
    clinicalGoals: 'Clinical Goals',
    clinicalGoalsSubtitle: 'Target outcomes and treatment objectives'
  }
  ,
  selector: {
    title: 'Select Action Plans for AI Consultation',
    subtitle: 'Choose which action plans to include in your AI consultation',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    selectedCount: '{{selected}} of {{total}} selected',
    noItems: 'No action plan items found',
    selectedForConsult: '{{count}} item(s) selected for AI consultation',
    selectForConsult: 'Select action plans to include in your consultation',
    aiConsult: 'AI Consult ({{count}})'
  }
  ,
  search: {
    intelligentFiltering: 'Intelligent ABG filtering with AI-powered insights',
    quickSearches: 'Quick searches:',
    clear: 'Clear search',
    categories: 'Search Categories',
    categoriesDesc: 'Explore different aspects of your ABG data',
    query: 'Search Query',
    resetAll: 'Reset All Filters',
    filtersActive: 'filter(s) active',
    noFilters: 'No filters applied',
    searching: 'Searching...',
    apply: 'Apply Search',
    quick: 'Quick Search',
    close: 'Close Modal',
    aiPowered: 'AI-Powered'
  }
  ,
  header: {
    medicalGradeAI: 'Medical‑grade AI',
    viewHistoryAria: 'View analysis history',
    viewHistory: 'View History',
    title: 'Blood Gas Analysis',
    subtitle: 'Upload a blood gas report for instant AI vision, verified interpretation, and a clinician‑ready action plan.'
  },
  context: {
    reportHeader: 'Blood Gas Analysis Report',
    laboratoryValuesHeader: 'Laboratory Values and Analysis',
    clinicalInterpretationHeader: 'Clinical Interpretation',
    recommendedActionPlanHeader: 'Recommended Action Plan',
    processingTime: 'Processing Time:',
    reportId: 'Report ID:',
    unknownPatient: 'Unknown Patient',
    casePrefix: 'Blood Gas Analysis Case - ',
    abgAnalysisPrefix: 'ABG Analysis - ',
    analysisWithInterpretationAndActionPlan: ' analysis with interpretation and action plan',
    analysis: ' analysis',
    interpretationFor: 'Blood gas analysis interpretation for ',
    medicalSpecialtyCardiology: 'cardiology',
    priorityHigh: 'high',
    priorityMedium: 'medium',
    tagBloodGasAnalysis: 'blood-gas-analysis',
    tagInterpreted: 'interpreted',
    tagActionPlan: 'action-plan',
    noResultsAvailable: 'No ABG results available.',
    summaryHeader: 'Blood Gas Analysis Summary',
    totalResults: 'Total Results:',
    dateRange: 'Date Range:',
    to: 'to',
    resultOf: '--- Result ',
    of: 'of',
    clinicalContext: 'CLINICAL CONTEXT:',
    userQuestion: 'USER QUESTION:',
    considerResultsPrompt: 'Please consider the blood gas analysis results provided above when answering this medical question. If the question is related to the ABG results, provide specific clinical insights based on the laboratory values, interpretation, and recommended actions.',
    keyValues: 'Key values:',
    interpretation: 'Interpretation:',
    clinicalConsultationRequest: 'CLINICAL CONSULTATION REQUEST:',
    consultationStagePostInterpretation: 'CONSULTATION STAGE: POST-INTERPRETATION (Pre-Action Plan)',
    availableInformation: 'Available Information:',
    laboratoryValuesCheck: '- Laboratory Values: ✓',
    clinicalInterpretationCheck: '- Clinical Interpretation: ✓',
    actionPlanNotGenerated: '- Action Plan: ❌ (Not yet generated)',
    clinicianRequest: 'CLINICIAN REQUEST:',
    consultationStageCompleteAnalysis: 'CONSULTATION STAGE: COMPLETE ANALYSIS',
    actionPlanCheck: '- Action Plan: ✓',
    reportInterpretationStage: 'Blood Gas Analysis Report (Interpretation Stage)',
    currentStageInterpretationComplete: 'Current Stage: INTERPRETATION COMPLETE',
    actionPlanStatusNotGenerated: 'Action Plan Status: Not yet generated',
    availableForAIConsultation: 'Available for AI consultation: Laboratory values + Clinical interpretation',
    selectedContentHeader: '=== SELECTED CONTENT FOR AI CONSULTATION ===',
    selectedIssues: 'Selected Issues:',
    selectedActionPlans: 'Selected Action Plans:',
    fullActionPlanNote: '(Full action plan available, showing selected content only for AI consultation)',
    interpretationStageDescription: 'INTERPRETATION STAGE - Clinical interpretation available, action plan not yet generated',
    selectiveActionPlanConsultation: 'SELECTIVE ACTION PLAN CONSULTATION - ',
    selectedItems: 'selected item(s)',
    completeActionPlanConsultation: 'COMPLETE ACTION PLAN CONSULTATION - All action plan content included',
    completeAnalysisConsultation: 'COMPLETE ANALYSIS CONSULTATION - All available information included',
    consultationType: 'CONSULTATION TYPE:',
  },
  vision: {
    unsupportedFormat: 'Please upload a JPEG, PNG, or WEBP image file',
    received: 'Received:',
    imageTooLarge: 'Image file is too large. Please upload a file smaller than 10MB',
    fileSize: 'File size:',
    imageCorruptedOrEmpty: 'Image file appears to be corrupted or empty',
    geminiApiError: 'Gemini API Error:',
    unknownError: 'Unknown error',
    noAnalysisResult: 'No analysis result returned from Gemini Vision API',
    serviceBusy: 'The analysis service is currently busy. Please try again in a few moments.',
    failedToAnalyze: 'Failed to analyze blood gas image. Please try again.',
    failedToConvertImage: 'Failed to convert image:',
    failedToReadFile: 'Failed to read file:',
    aiPrompt: 'Analyze this blood gas analysis report image and extract all relevant medical data. Focus on:\n\n1. Patient Information (if visible):\n   - Patient ID, name, age, gender\n   - Date and time of test\n   - Sample type (arterial, venous, capillary)\n\n2. Blood Gas Values:\n   - pH level\n   - pCO2 (partial pressure of CO2)\n   - pO2 (partial pressure of O2)\n   - HCO3- (bicarbonate)\n   - Base Excess (BE)\n   - O2 Saturation (SaO2)\n\n3. Electrolytes and Other Parameters:\n   - Sodium (Na+)\n   - Potassium (K+)\n   - Chloride (Cl-)\n   - Glucose\n   - Lactate\n   - Hemoglobin\n   - Any other visible parameters\n\n4. Clinical Context:\n   - Temperature correction\n   - FiO2 settings\n   - Any additional notes or flags\n   - Quality indicators or alerts\n\nPlease extract ALL visible text and numerical values exactly as shown, maintaining medical accuracy. If any values are unclear or partially obscured, note this in your response. Format your response in a clear, structured manner that a healthcare professional can easily review.',
    patientInformation: 'Patient Information (if visible):',
    patientIdNameAgeGender: '- Patient ID, name, age, gender',
    dateAndTimeOfTest: '- Date and time of test',
    sampleType: '- Sample type (arterial, venous, capillary)',
    bloodGasValues: 'Blood Gas Values:',
    pHLevel: '- pH level',
    pCO2Level: '- pCO2 (partial pressure of CO2)',
    pO2Level: '- pO2 (partial pressure of O2)',
    hco3Level: '- HCO3- (bicarbonate)',
    baseExcess: '- Base Excess (BE)',
    o2Saturation: '- O2 Saturation (SaO2)',
    electrolytesAndOtherParameters: 'Electrolytes and Other Parameters:',
    sodium: '- Sodium (Na+)',
    potassium: '- Potassium (K+)',
    chloride: '- Chloride (Cl-)',
    glucose: '- Glucose',
    lactate: '- Lactate',
    hemoglobin: '- Hemoglobin',
    anyOtherVisibleParameters: '- Any other visible parameters',
    clinicalContext: 'Clinical Context:',
    temperatureCorrection: '- Temperature correction',
    fiO2Settings: '- FiO2 settings',
    anyAdditionalNotesOrFlags: '- Any additional notes or flags',
    qualityIndicatorsOrAlerts: '- Quality indicators or alerts',
    extractAllTextPrompt: 'Please extract ALL visible text and numerical values exactly as shown, maintaining medical accuracy. If any values are unclear or partially obscured, note this in your response. Format your response in a clear, structured manner that a healthcare professional can easily review.',
  }
};

export default abg;

