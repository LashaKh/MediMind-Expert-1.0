export const diseases = {
  // Disease page common terms
  common: {
    background: 'Background',
    clinicalFindings: 'Clinical Findings',
    studies: 'Studies', 
    guidelines: 'Guidelines',
    references: 'References',
    keySources: 'Key Sources',
    patientDemographics: 'Patient Demographics',
    pastMedicalHistory: 'Past Medical History',
    symptoms: 'Symptoms',
    likelihoodRatios: 'Likelihood Ratios',
    finding: 'Finding',
    lastUpdated: 'Last updated',
    notFound: {
      title: 'Disease Not Found',
      message: 'The requested disease information could not be found.',
      backButton: 'Back to Diseases'
    },
    sections: {
      definition: 'Definition',
      pathophysiology: 'Pathophysiology', 
      epidemiology: 'Epidemiology',
      diseaseCourse: 'Disease Course',
      prognosis: 'Prognosis and Risk of Recurrence',
      criticalInformation: 'Critical Information:'
    },
    actions: {
      print: 'Print',
      share: 'Share',
      bookmark: 'Bookmark'
    }
  },
  
  // Index page
  index: {
    title: 'Cardiology Disease Database',
    subtitle: 'Comprehensive, evidence-based information on cardiovascular diseases with the latest clinical guidelines and management protocols.',
    search: {
      placeholder: 'Search diseases, symptoms, or treatments...',
      filters: {
        allCategories: 'All Categories',
        allSeverity: 'All Severity Levels',
        highSeverity: 'High Severity',
        mediumSeverity: 'Medium Severity', 
        lowSeverity: 'Low Severity'
      }
    },
    results: {
      showing: 'Showing',
      of: 'of',
      diseases: 'diseases'
    },
    emptyState: {
      title: 'No diseases found',
      message: 'Try adjusting your search terms or filters to find what you\'re looking for.'
    },
    comingSoon: {
      title: 'More Diseases Coming Soon',
      message: 'We\'re continuously expanding our database with comprehensive information on cardiovascular diseases. Check back soon for updates.',
      nextUpdates: 'Next updates expected: Coronary Artery Disease, Heart Failure, Hypertrophic Cardiomyopathy'
    }
  },

  // Individual diseases - placeholders for future translation
  cardiology: {
    abdominalAorticAneurysm: {
      // Will be populated when translating individual diseases
      title: 'Abdominal Aortic Aneurysm'
    },
    atrialFibrillation: {
      // Will be populated when translating individual diseases
      title: 'Atrial Fibrillation'
    }
  },

  obgyn: {
    // Future OB/GYN diseases will be added here
  }
};