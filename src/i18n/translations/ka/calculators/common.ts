export const calculatorCommon = {
  title: 'სამედიცინო კალკულატორები',
  back_to: 'უკან კალკულატორებთან',
  categories_label: 'კატეგორიები',
  tools_count: '{{count}} ხელსაწყო | {{count}} ხელსაწყოები',
  
  // Common UI elements (these are the missing keys)
  about: 'კალკულატორის შესახებ',
  calculator: 'კალკულატორი',
  validated: 'ვალიდირებული',

  calculate: 'გამოთვლა',
  calculating: 'მიმდინარეობს გამოთვლა...',
  result: 'შედეგი',
  results: 'შედეგები',
  interpretation: 'ინტერპრეტაცია',
  recommendations: 'რეკომენდაციები',
  riskLevel: 'რისკის დონე',
  lifetime_risk: 'სიცოცხლისგანმანძლობელი რისკი',
  annual_risk: 'წლიური რისკი',
  risk_multiplier: 'რისკის მულტიპლიკატორი',
  screening_recommendation: 'სკრინინგის რეკომენდაცია',
  protective_factors: 'დამცავი ფაქტორები',
  prophylactic_surgery_discussion: 'პროფილაქტიკური ოპერაციის განხილვა',
  score: 'ქულა',
  points: 'ქულა',
  low: 'დაბალი',
  moderate: 'ზომიერი',
  high: 'მაღალი',
  veryHigh: 'ძალიან მაღალი',
  normal: 'ნორმალური',
  abnormal: 'პათოლოგიური',
  positive: 'დადებითი',
  negative: 'უარყოფითი',
  
  // Main interface translations
  calculator_categories: 'კალკულატორის კატეგორიები',
  view_grid: 'ბადე',
  view_list: 'სია',
  
  // Statistics labels
  stats: {
    calculators: 'კალკულატორები',
    validated: 'ვალიდირებული',
    categories: 'კატეგორიები'
  },
  
  // Navigation common
  next: 'შემდეგი',
  back: 'უკან',
  new_calculation: 'ახალი გამოთვლა',
  modify_inputs: 'შეცვლა',
  
  patient: {
    age: 'ასაკი',
    gender: 'სქესი',
    male: 'მამრობითი',
    female: 'მდედრობითი',
    weight: 'წონა (კგ)',
    height: 'სიმაღლე (სმ)',
    bmi: 'BMI'
  },
  vitals: {
    systolicBP: 'სისტოლური წნევა (მმ ვერცხლისწყლისა)',
    diastolicBP: 'დიასტოლური წნევა (მმ ვერცხლისწყლისა)',
    heartRate: 'გულისცემა (წუთში)',
    temperature: 'ტემპერატურა (°C)',
    respiratoryRate: 'სუნთქვის სიხშირე (წუთში)',
    oxygenSaturation: 'ჟანგბადის გაჯერება (%)'
  },
  laboratory: {
    glucose: 'გლუკოზა (მგ/დლ)',
    cholesterol: 'ქოლესტეროლი (მგ/დლ)',
    hdl: 'HDL ქოლესტეროლი (მგ/დლ)',
    ldl: 'LDL ქოლესტეროლი (მგ/დლ)',
    triglycerides: 'ტრიგლიცერიდები (მგ/დლ)',
    creatinine: 'კრეატინინი (მგ/დლ)',
    hemoglobin: 'ჰემოგლობინი (გ/დლ)',
    hematocrit: 'ჰემატოკრიტი (%)',
    plateletCount: 'თრომბოციტები (ათასი/მკლ)',
    whiteBloodCell: 'ლეიკოციტები (ათასი/მკლ)'
  },
  medications: {
    aspirin: 'ასპირინი',
    statin: 'სტატინი',
    betaBlocker: 'ბეტა-ბლოკერი',
    aceInhibitor: 'ACE ინჰიბიტორი',
    diuretic: 'შარდმდენი',
    anticoagulant: 'ანტიკოაგულანტი'
  },
  conditions: {
    diabetes: 'დიაბეტი',
    hypertension: 'ჰიპერტენზია',
    smoking: 'მოწევა',
    familyHistory: 'ოჯახური ანამნეზი',
    previousMI: 'წინა ინფარქტი',
    heartFailure: 'გულის უკმარისობა',
    stroke: 'ინსულტი',
    peripheralArtery: 'პერიფერიული არტერიების დაავადება'
  },
  buttons: {
    calculate: 'გამოთვლა',
    reset: 'განულება',
    clear: 'გასუფთავება',
    save: 'შენახვა',
    print: 'ბეჭდვა',
    share: 'გაზიარება',
    export: 'ექსპორტი'
  },
  validation: {
    required: 'აუცილებელი ველი',
    invalidNumber: 'არასწორი რიცხვი',
    outOfRange: 'დიაპაზონს გარეთ',
    selectOption: 'აირჩიეთ ვარიანტი'
  },
  units: {
    years: 'წელი',
    months: 'თვე',
    days: 'დღე',
    kg: 'კგ',
    lbs: 'ფუნტი',
    cm: 'სმ',
    inches: 'ინჩი',
    mmHg: 'მმ ვერცხლისწყლისა',
    bpm: 'წუთში',
    celsius: '°C',
    fahrenheit: '°F',
    percent: '%',
    mgDl: 'მგ/დლ',
    mmolL: 'მმოლ/ლ'
  },
  categories: {
    risk_assessment: 'რისკის შეფასება',
    acute_care: 'მწვავე მდგომარეობა',
    therapy_management: 'თერაპიული მენეჯმენტი',
    heart_failure: 'გულის უკმარისობა',
    surgical_risk: 'ქირურგიული რისკი',
    cardiomyopathy: 'კარდიომიოპათია',
    pregnancy_dating: 'ორსულობის დათარიღება',
    antenatal_risk: 'ანტენატალური რისკი',
    labor_management: 'მშობიარობის მენეჯმენტი',
    assessment_tools: 'შეფასების ინსტრუმენტები',
    gynecologic_oncology: 'გინეკოლოგიური ონკოლოგია',
    reproductive_endocrinology: 'რეპროდუქციული ენდოკრინოლოგია'
  },
  
  // Specialty section translations
  specialty: {
    cardiology: {
      title: 'კარდიოლოგიის სამედიცინო კალკულატორები',
      description: 'ACC/AHA კლინიკური პრაქტიკის სახელმძღვანელოების მიხედვით დამტკიცებული კალკულატორები',
      status: 'ყველა ფაზა დასრულებულია: 16 პროფესიონალური კალკულატორი (100% ვალიდირებული)',
      message: '✅ ყველა ფაზა დასრულებულია: 16 პროფესიონალური კალკულატორი (100% ვალიდირებული)'
    },
    obgyn: {
      title: 'მეანობა-გინეკოლოგიის სამედიცინო კალკულატორები',
      description: 'ყოვლისმომცველი მენა-გინეკოლოგიური და გინეკოლოგიური კლინიკური გადაწყვეტილების ინსტრუმენტები',
      status: 'ყველა ფაზა დასრულებულია: 14 პროფესიონალური კალკულატორი (100% ვალიდირებული)',
      message: '✅ ყველა ფაზა დასრულებულია: 14 პროფესიონალური კალკულატორი (100% ვალიდირებული)'
    }
  },
  miscellaneous: "სხვა",
  
  // Calculator Result Share Component
  calculator_results_summary: "კალკულატორის შედეგების რეზიუმე",
  shared: "გაზიარებულია",
  sharing: "გაზიარება...",
  share_with_ai: "AI-თან გაზიარება",
  key_results: "ძირითადი შედეგები:",
  clinical_interpretation_label: "კლინიკური ინტერპრეტაცია:",
  recommendations_label: "რეკომენდაციები:",
  more_recommendations: "მეტი რეკომენდაცია",
  universal_recommendations: "უნივერსალური რეკომენდაციები",
  share_results_description: "გაზიარეთ ეს შედეგები თქვენს AI თანაშემწე-თან დეტალური ანალიზისა და შემდეგი ნაბიჯებისთვის",
  
  // Common risk levels
  risk_levels: {
    low: 'დაბალი',
    moderate: 'ზომიერი',
    intermediate: 'შუალედური',
    high: 'მაღალი',
    very_high: 'ძალიან მაღალი'
  },
};

export default calculatorCommon; 