export const ovarianReserveCalculator = {
  // Tab labels
  calculatorTab: 'Calculator',
  aboutTab: 'About',
  
  // Main content
  title: 'Ovarian Reserve Assessment',
  description: 'Comprehensive fertility evaluation and treatment planning tool',
  
  // Form fields
  ageLabel: 'Age (years)',
  agePlaceholder: 'e.g., 32',
  ageDescription: 'The most significant factor influencing oocyte quality and quantity',
  
  amhLabel: 'AMH (ng/mL)',
  amhPlaceholder: 'e.g., 2.5',
  amhDescription: 'Anti-Müllerian Hormone - A direct indicator of the follicular pool',
  
  antralFollicleCountLabel: 'Antral Follicle Count (AFC)',
  antralFollicleCountPlaceholder: 'e.g., 12',
  antralFollicleCountDescription: 'A sonographic marker of the ovarian reserve',
  
  fshLabel: 'FSH (mIU/mL)',
  fshPlaceholder: 'e.g., 8.0',
  fshDescription: 'Follicle-Stimulating Hormone - Reflects gonadotropic stimulation of the ovaries',
  
  estradiolLabel: 'Estradiol (pg/mL)',
  estradiolPlaceholder: 'e.g., 50',
  estradiolDescription: 'Provides context for FSH levels',
  
  inhibinBLabel: 'Inhibin B (pg/mL)',
  inhibinBPlaceholder: 'e.g., 100',
  inhibinBDescription: 'A product of granulosa cells, reflects follicular activity',
  
  // Section titles
  primaryMarkersTitle: 'Primary Markers',
  secondaryMarkersTitle: 'Secondary Markers',
  
  // Buttons
  calculateButton: 'Calculate Assessment',
  resetButton: 'Reset Form',
  calculating: 'Calculating...',
  
  // Results
  resultsTitle: 'Assessment Results',
  ovarianReserveStatus: 'Ovarian Reserve Status',
  
  // Reserve categories
  low: 'Low Reserve',
  normal: 'Normal Reserve', 
  high: 'High Reserve',
  lowReserve: 'Low Ovarian Reserve',
  normalReserve: 'Normal Ovarian Reserve',
  highReserve: 'High Ovarian Reserve',
  
  // Interpretation details
  lowReserveDetails: [
    'AMH < 1.0 ng/mL',
    'AFC < 7 follicles',
    'FSH > 10 mIU/mL',
    'Poor response to stimulation expected',
    'Consider expedited fertility treatment'
  ],
  normalReserveDetails: [
    'AMH 1.0-3.0 ng/mL',
    'AFC 7-15 follicles', 
    'FSH < 10 mIU/mL',
    'Good response to stimulation expected',
    'Normal fertility potential for age'
  ],
  highReserveDetails: [
    'AMH > 3.0 ng/mL',
    'AFC > 15 follicles',
    'PCOS should be considered',
    'OHSS risk increased with stimulation',
    'Careful protocol selection needed'
  ],
  
  // About section
  aboutTitle: 'About Ovarian Reserve Assessment',
  fertilityPotential: 'Fertility Potential Assessment',
  clinicalPurposeTitle: 'Clinical Purpose',
  clinicalPurposeDescription: 'This comprehensive tool assesses ovarian reserve, a key indicator of female fertility potential. It combines multiple hormonal markers and patient age to predict reproductive capacity and guide personalized fertility treatment strategies.',
  
  interpretationTitle: 'Clinical Interpretation',
  
  // Clinical applications
  clinicalApplicationsTitle: 'Clinical Applications',
  application1Title: 'Fertility Counseling & Planning',
  application1Content: [
    'Reproductive lifespan prediction',
    'Optimal timing for family planning',
    'Egg freezing counseling and timing',
    'Contraception counseling decisions',
    'Career and fertility planning integration'
  ],
  application2Title: 'IVF Treatment Optimization',
  application2Content: [
    'Stimulation protocol customization',
    'OHSS risk assessment and prevention',
    'Cycle cancellation risk prediction',
    'Donor consideration timing',
    'Expected outcome counseling'
  ],
  
  // Recommendations
  recommendationsTitle: 'Clinical Recommendations',
  recommendationsContent: [
    'Low reserve: Consider expedited fertility treatment or immediate oocyte cryopreservation consultation',
    'Normal reserve: Plan conception according to personal and professional goals with regular monitoring',
    'High reserve: Investigate for PCOS if clinically indicated and use cautious stimulation protocols',
    'All patients: Regular follow-up assessments recommended as ovarian reserve declines with age',
    'Consider genetic counseling if family history suggests premature ovarian insufficiency'
  ],
  
  // Error messages
  errorAge: 'Patient age is required',
  errorAgeRange: 'Age must be between 18-50 years',
  errorAmh: 'AMH level is required for assessment',
  errorAmhRange: 'AMH must be between 0-50 ng/mL',
  calculationError: 'Assessment calculation failed - please check input values',
  
  // Disclaimer
  disclaimer: 'This assessment tool is intended for use by qualified healthcare professionals and should not replace clinical judgment. Results must be interpreted within the complete clinical context including patient history, physical examination, and other relevant factors.'
}; 