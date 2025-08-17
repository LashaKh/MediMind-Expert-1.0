export const apgarScoreCalculator = {
  title: 'APGAR Score Calculator',
  subtitle: 'Neonatal Assessment Tool for Immediate Postnatal Evaluation',
  system_title: 'APGAR Scoring System',
  system_description: 'The APGAR score is a standardized assessment tool used to evaluate the condition of newborns immediately after birth, helping healthcare providers identify babies who may need immediate medical attention.',
  guidelines: 'AAP Guidelines',
  
  // Time Point Selection
  time_point_title: 'Assessment Time Point',
  time_point_description: 'Select the specific time point for APGAR score assessment',
  time_points: {
    one_minute: {
      label: '1 Minute',
      description: 'Initial assessment'
    },
    five_minutes: {
      label: '5 Minutes',
      description: 'Standard assessment'
    },
    ten_minutes: {
      label: '10 Minutes',
      description: 'Extended assessment'
    }
  },
  
  // Parameters Section
  parameters_title: 'Assessment Parameters',
  parameters_description: 'Evaluate each of the five APGAR components and assign appropriate scores',
  
  // Heart Rate Assessment
  heart_rate: {
    title: 'Heart Rate (Pulse)',
    label: 'Select heart rate category',
    select: 'Select heart rate...',
    options: {
      absent: 'Absent (0 points)',
      slow: 'Slow (<100 bpm) (1 point)',
      normal: 'Normal (≥100 bpm) (2 points)'
    },
    help: 'Assess the infant\'s heart rate using auscultation or palpation',
    guide_title: 'Heart Rate Assessment Guide',
    guide: {
      absent: 'No detectable heart rate (0 points)',
      slow: 'Heart rate below 100 beats per minute (1 point)',
      normal: 'Heart rate 100 beats per minute or higher (2 points)'
    }
  },
  
  // Respiratory Effort Assessment
  respiratory_effort: {
    title: 'Respiratory Effort',
    label: 'Select respiratory effort category',
    select: 'Select respiratory effort...',
    options: {
      absent: 'Absent (0 points)',
      weak: 'Weak/Irregular (1 point)',
      strong: 'Strong/Good cry (2 points)'
    },
    help: 'Evaluate the strength and quality of the infant\'s breathing efforts',
    guide_title: 'Respiratory Effort Assessment Guide',
    guide: {
      absent: 'No spontaneous breathing efforts (0 points)',
      weak: 'Weak, irregular breathing or slow gasping (1 point)',
      strong: 'Strong cry with good respiratory effort (2 points)'
    }
  },
  
  // Muscle Tone Assessment
  muscle_tone: {
    title: 'Muscle Tone',
    label: 'Select muscle tone category',
    select: 'Select muscle tone...',
    options: {
      limp: 'Limp/Flaccid (0 points)',
      some_flexion: 'Some flexion (1 point)',
      active: 'Active motion (2 points)'
    },
    help: 'Assess the infant\'s muscle tone and spontaneous movement',
    guide_title: 'Muscle Tone Assessment Guide',
    guide: {
      limp: 'Completely flaccid, no muscle tone (0 points)',
      some_flexion: 'Some flexion of extremities (1 point)',
      active: 'Active motion, well-flexed extremities (2 points)'
    }
  },
  
  // Reflex Response Assessment
  reflex_response: {
    title: 'Reflex Response (Grimace)',
    label: 'Select reflex response category',
    select: 'Select reflex response...',
    options: {
      no_response: 'No response (0 points)',
      grimace: 'Grimace (1 point)',
      cry: 'Vigorous cry (2 points)'
    },
    help: 'Evaluate reflex irritability response to stimulation',
    guide_title: 'Reflex Response Assessment Guide',
    guide: {
      no_response: 'No response to stimulation (0 points)',
      grimace: 'Facial grimace or weak cry to stimulation (1 point)',
      cry: 'Vigorous cry or active withdrawal to stimulation (2 points)'
    }
  },
  
  // Color Appearance Assessment
  color_appearance: {
    title: 'Color (Appearance)',
    label: 'Select color appearance category',
    select: 'Select color appearance...',
    options: {
      blue_pale: 'Blue/Pale (0 points)',
      acrocyanotic: 'Acrocyanotic (1 point)',
      pink: 'Completely pink (2 points)'
    },
    help: 'Assess the infant\'s overall color and circulation',
    guide_title: 'Color Appearance Assessment Guide',
    guide: {
      blue_pale: 'Blue or pale all over (0 points)',
      acrocyanotic: 'Pink body with blue extremities (1 point)',
      pink: 'Completely pink, good color all over (2 points)'
    }
  },
  
  // Actions
  calculate_button: 'Calculate APGAR Score',
  new_assessment: 'New Assessment',
  modify_assessment: 'Modify Assessment',
  
  // Results
  results: {
    title: 'APGAR Score Results',
    total_score: 'Total APGAR Score'
  },
  
  // Footer
  footer: {
    clinical_use: 'For clinical use only - Professional medical assessment required',
    guidelines: 'AAP/ACOG Guidelines'
  },
  
  // About Section
  about: {
    title: 'About APGAR Score',
    subtitle: 'Comprehensive Guide to Neonatal Assessment',
    clinical_purpose: {
      title: 'Clinical Purpose',
      description: 'The APGAR score provides a standardized method for assessing newborn vitality and the need for immediate medical intervention. Named after Dr. Virginia Apgar, this scoring system evaluates five key physiological parameters to determine neonatal well-being.'
    },
    components: {
      title: 'APGAR Components',
      mnemonic: {
        title: 'APGAR Mnemonic',
        appearance: 'Appearance (skin color)',
        pulse: 'Pulse (heart rate)',
        grimace: 'Grimace (reflex irritability)',
        activity: 'Activity (muscle tone)',
        respiration: 'Respiration (breathing effort)'
      },
      scoring: {
        title: 'Scoring System',
        scale: 'Each component scored 0, 1, or 2 points',
        total: 'Total possible score: 0-10 points',
        higher: 'Higher scores indicate better neonatal condition',
        timing: 'Assessed at 1 and 5 minutes after birth (10 minutes if low)'
      }
    },
    considerations: {
      title: 'Important Clinical Considerations',
      resuscitation: 'APGAR scores should not delay resuscitation efforts if clinically indicated',
      factors: 'Scores may be affected by gestational age, medications, and congenital anomalies',
      serial: 'Serial assessments provide better clinical information than single measurements',
      investigation: 'Persistently low scores (≤3 at 5+ minutes) warrant further investigation'
    }
  },
  
  // Error Messages
  heart_rate_required: 'Heart rate assessment is required',
  respiratory_effort_required: 'Respiratory effort assessment is required',
  muscle_tone_required: 'Muscle tone assessment is required',
  reflex_response_required: 'Reflex response assessment is required',
  color_appearance_required: 'Color appearance assessment is required',
  calculation_error: 'An error occurred during calculation. Please try again.',
  
  actions: 'Clinical Actions',
  
  // Result interpretation templates
  result_interpretations: {
    excellent: 'excellent neonatal condition with normal adaptation to extrauterine life',
    mild_depression: 'mildly depressed neonate requiring observation and minimal intervention',
    moderate_depression: 'moderate neonatal depression requiring resuscitation and close monitoring', 
    severe_depression: 'severe neonatal depression requiring immediate aggressive resuscitation'
  },
  
  // Interpretation message templates
  interpretation_templates: {
    score_template: 'Apgar score of {{score}}/10 at {{time}} indicates {{condition}}.',
    followup_one_min: ' Five-minute reassessment is required for all neonates.',
    followup_five_min_low: ' Ten-minute assessment should be considered.',
    time_display: {
      '1_min': '1-minute',
      '5_min': '5-minute', 
      '10_min': '10-minute'
    }
  },
  
  // Categories
  categories: {
    excellent: 'Excellent',
    high: 'High'
  }
}; 