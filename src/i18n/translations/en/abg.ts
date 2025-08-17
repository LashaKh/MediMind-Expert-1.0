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
  }
};

export default abg;


