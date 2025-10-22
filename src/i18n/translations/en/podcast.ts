export const podcast = {
  title: 'AI Podcast Studio',
  subtitle: 'Transform your medical documents into captivating, professional podcasts with revolutionary AI technology and studio-quality natural voices.',

  // Coming Soon
  comingSoon: {
    title: 'Coming Soon',
    subtitle: "What's Coming:",
    features: {
      analysis: 'Intelligent medical content analysis',
      voices: 'Natural voice synthesis with expert intonation',
      languages: 'Multiple language support',
      quality: 'Professional audio quality',
      speed: 'Quick generation in minutes'
    }
  },

  // Hero Section
  hero: {
    createStunning: 'Create Stunning',
    aiPodcasts: 'AI Podcasts',
    getStarted: 'Get Started'
  },

  // Feature Pills
  pills: {
    neuralAnalysis: 'Neural Analysis',
    studioQuality: 'Studio Quality',
    lightningFast: 'Lightning Fast'
  },

  // Features Section
  featuresSection: {
    title: 'Why Choose AI Podcast Studio?',
    subtitle: 'Experience the future of medical content creation with our advanced AI technology',
    intelligentAnalysis: {
      title: 'Intelligent Content Analysis',
      description: 'Advanced AI comprehends complex medical documents and creates coherent narratives'
    },
    naturalVoices: {
      title: 'Natural Voice Synthesis',
      description: 'Professional medical experts voices with natural intonation and clarity'
    },
    fastGeneration: {
      title: 'Lightning Fast Generation',
      description: 'Get your podcast ready in minutes, not hours or days'
    }
  },
  
  // Navigation
  navigation: {
    podcastStudio: 'Podcast Studio',
    podcastStudioDesc: 'Create AI-generated medical podcasts from your documents',
    headerDesc: 'Transform your medical knowledge into engaging audio experiences'
  },
  
  // Tabs
  tabs: {
    generate: 'Generate',
    generateDescription: 'Create new AI-powered medical podcasts',
    history: 'History',
    historyDescription: 'View and manage your podcast library'
  },
  
  // Generate Section
  generate: {
    title: 'Generate Medical Podcast',
    description: 'Select your medical documents and let AI create an engaging two-host podcast conversation. Perfect for reviewing research papers, clinical guidelines, and case studies on the go.'
  },
  
  // Documents Section
  documents: {
    title: 'Select Documents',
    subtitle: 'Choose medical documents to include in your podcast',
    search: {
      placeholder: 'Search documents by title, filename, or tags...'
    },
    categories: {
      all: 'All Documents',
      research: 'Research Papers',
      guidelines: 'Clinical Guidelines',
      cases: 'Case Studies',
      reference: 'Reference Materials',
      notes: 'Personal Notes'
    },
    selected: 'Selected {{count}} document(s)',
    empty: {
      noDocuments: 'No documents found',
      noResults: 'No documents match your search',
      createFirst: 'Upload documents to your knowledge base first'
    },
    footer: {
      tip: 'Select multiple documents for comprehensive discussions'
    },
    errors: {
      fetchFailed: 'Failed to load documents'
    }
  },
  
  // Generator Section
  generator: {
    title: 'Podcast Settings',
    subtitle: 'Configure your AI-generated podcast',
    fields: {
      title: {
        label: 'Podcast Title',
        placeholder: 'Enter a descriptive title for your podcast...',
        help: 'Choose a clear title that describes the content'
      },
      description: {
        label: 'Description',
        placeholder: 'Brief description of what this podcast covers...'
      },
      style: {
        label: 'Podcast Style'
      }
    },
    styles: {
      podcast: {
        title: 'Medical Podcast',
        description: 'Conversational discussion between two medical experts'
      },
      briefing: {
        title: 'Executive Briefing',
        description: 'Concise, professional summary format'
      },
      debate: {
        title: 'Clinical Debate',
        description: 'Analytical discussion with different perspectives'
      }
    },
    autoTitle: {
      single: 'Medical Document Review',
      multiple: 'Medical Literature Review ({{count}} documents)'
    },
    estimatedDuration: 'Estimated duration: ~{{duration}} minutes',
    generating: 'Generating...',
    generate: 'Generate Podcast',
    requirements: {
      documents: 'Please select at least one document',
      title: 'Please enter a podcast title'
    }
  },
  
  // Progress Section
  progress: {
    progress: 'Progress',
    timeElapsed: 'Time Elapsed',
    estimatedWait: 'Estimated Wait',
    cancel: 'Cancel Generation',
    
    pending: {
      title: 'Preparing Generation',
      message: 'Setting up your podcast generation...'
    },
    queued: {
      title: 'In Queue',
      waiting: 'Waiting in generation queue...',
      position: 'Position #{position} in queue'
    },
    generating: {
      title: 'Generating Podcast',
      message: 'AI is creating your medical podcast...',
      active: 'Podcast generation in progress',
      details: 'This may take 5-10 minutes depending on content length'
    },
    completed: {
      title: 'Podcast Ready!',
      message: 'Your medical podcast has been generated successfully'
    },
    failed: {
      title: 'Generation Failed',
      message: 'There was an error generating your podcast'
    },
    queue: {
      position: 'You are position #{position} in the queue',
      explanation: 'Your podcast will start generating when it reaches the front'
    },
    info: {
      estimatedDuration: '~10 minutes'
    }
  },
  
  // Player Section
  player: {
    speed: 'Speed',
    duration: 'Duration',
    style: 'Style',
    sources: 'Sources',
    documents: 'documents',
    showTranscript: 'Show Transcript',
    hideTranscript: 'Hide Transcript',
    createNew: 'Create New Podcast',
    defaultDescription: 'AI-generated medical podcast',
    share: {
      defaultText: 'Check out this AI-generated medical podcast'
    }
  },
  
  // History Section
  history: {
    title: 'Podcast Library',
    subtitle: 'Your collection of AI-generated medical podcasts',
    search: {
      placeholder: 'Search podcasts by title or content...',
      results: 'Showing {{count}} of {{total}} podcasts'
    },
    filters: {
      all: 'All Podcasts',
      completed: 'Completed',
      generating: 'Generating',
      pending: 'Pending',
      failed: 'Failed'
    },
    empty: {
      noPodcasts: 'No podcasts yet',
      noResults: 'No podcasts match your filters',
      createFirst: 'Create your first AI-generated medical podcast',
      tryDifferentFilter: 'Try adjusting your search or filters',
      createButton: 'Create Podcast'
    }
  },
  
  // Podcast Card
  card: {
    duration: 'Duration',
    sources: 'Sources'
  },
  
  // Status
  status: {
    pending: 'Pending',
    generating: 'Generating',
    completed: 'Completed',
    failed: 'Failed'
  },
  
  // Styles
  styles: {
    podcast: 'Medical Podcast',
    'executive-briefing': 'Executive Briefing',
    debate: 'Clinical Debate'
  },
  
  // Actions
  actions: {
    play: 'Play Podcast',
    download: 'Download',
    share: 'Share',
    retry: 'Retry Generation',
    delete: 'Delete'
  },
  
  // Voice Selector
  voiceSelector: {
    title: 'Select Medical Voices',
    subtitle: 'Choose professional medical voices for your podcast hosts',
    host1: 'Host 1 (Primary Speaker)',
    host2: 'Host 2 (Secondary Speaker)',
    alreadySelected: 'This voice is already selected for the other host',
    selectBoth: 'Please select voices for both hosts',
    selected: '{{voice1}} and {{voice2}} selected',
    preview: {
      title: 'Voice Previews',
      description: 'Click the play button to hear voice samples'
    }
  },
  
  // Transcript
  transcript: {
    title: 'Podcast Transcript',
    download: 'Download Transcript',
    share: 'Share Transcript',
    search: {
      placeholder: 'Search transcript...',
      results: 'Found in {{count}} of {{total}} segments'
    },
    empty: {
      title: 'No transcript available',
      description: 'Transcript will appear here when the podcast is ready'
    },
    stats: {
      entries: '{{count}} segments',
      currentTime: 'Current: {{time}}'
    }
  },
  
  // Features
  features: {
    title: 'Why Use AI Podcast Studio?',
    subtitle: 'Transform your medical learning with intelligent audio content',
    intelligent: {
      title: 'Intelligent Content Analysis',
      description: 'AI understands medical terminology and creates engaging discussions'
    },
    voices: {
      title: 'Professional Medical Voices',
      description: 'Natural-sounding voices trained for clear medical communication'
    },
    efficient: {
      title: 'Learn on the Go',
      description: 'Convert complex medical documents into digestible audio format'
    }
  }
};