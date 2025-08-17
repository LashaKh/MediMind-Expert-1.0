export const ovarianReserveCalculator = {
  // Tab labels
  calculatorTab: 'კალკულატორი',
  aboutTab: 'შესახებ',
  
  // Main content
  title: 'საკვერცხის რეზერვის შეფასება',
  description: 'კომპლექსური ნაყოფიერების შეფასება და მკურნალობის დაგეგმვა',
  
  // Form fields
  ageLabel: 'ასაკი (წლები)',
  agePlaceholder: 'მაგ., 32',
  ageDescription: 'ყველაზე მნიშვნელოვანი ფაქტორი ოოციტების ხარისხისა და რაოდენობაზე',
  
  amhLabel: 'AMH (ნგ/მლ)',
  amhPlaceholder: 'მაგ., 2.5',
  amhDescription: 'ანტიმიულერული ჰორმონი - ფოლიკულური აუზის პირდაპირი ინდიკატორი',
  
  antralFollicleCountLabel: 'ანტრალური ფოლიკულების რაოდენობა (AFC)',
  antralFollicleCountPlaceholder: 'მაგ., 12',
  antralFollicleCountDescription: 'საკვერცხის რეზერვის ექოგრაფიული მარკერი',
  
  fshLabel: 'FSH (mIU/მლ)',
  fshPlaceholder: 'მაგ., 7.5',
  fshDescription: 'ფოლიკულმასტიმულირებელი ჰორმონი ციკლის მე-3 დღეს',
  
  estradiolLabel: 'ესტრადიოლი (პგ/მლ)',
  estradiolPlaceholder: 'მაგ., 50',
  estradiolDescription: 'ბაზალური დონე ციკლის მე-3 დღეს',
  
  inhibinBLabel: 'ინჰიბინი B (პგ/მლ)',
  inhibinBPlaceholder: 'მაგ., 45',
  inhibinBDescription: 'საკვერცხის ფუნქციის დამატებითი მარკერი',
  
  // Section titles
  primaryMarkersTitle: 'ძირითადი მარკერები',
  secondaryMarkersTitle: 'დამატებითი მარკერები',
  
  // Buttons
  calculateButton: 'გამოთვლა',
  resetButton: 'გადატვირთვა',
  calculating: 'ითვლება...',
  
  // Validation errors
  validationErrors: 'ვალიდაციის შეცდომები',
  errorAge: 'შეიყვანეთ ასაკი',
  errorAgeRange: 'ასაკი უნდა იყოს 18-დან 50 წლამდე',
  errorAmh: 'შეიყვანეთ AMH დონე',
  errorAmhRange: 'AMH უნდა იყოს 0-დან 50 ნგ/მლ-მდე',
  calculationError: 'გამოთვლის შეცდომა. სცადეთ ხელახლა.',
  
  // Results
  resultsTitle: 'შეფასების შედეგები',
  amhLevel: 'AMH დონე',
  reserveCategory: 'რეზერვის კატეგორია',
  reproductivePotential: 'რეპროდუქციული პოტენციალი',
  interpretationTitle: 'ინტერპრეტაცია',
  treatmentOptionsTitle: 'მკურნალობის ვარიანტები',
  recommendationsTitle: 'რეკომენდაციები',
  
  // Reserve categories
  low: 'დაბალი',
  normal: 'ნორმალური',
  high: 'მაღალი',
  
  // Interpretations
  lowInterpretation: 'დაბალი საკვერცხის რეზერვი მიუთითებს ოოციტების რაოდენობისა და ხარისხის შემცირებაზე',
  normalInterpretation: 'ნორმალური საკვერცხის რეზერვი შეესაბამება ასაკობრივ ნორმებს',
  highInterpretation: 'მაღალი საკვერცხის რეზერვი შეიძლება მიუთითებდეს PCOS-ზე ან სხვა მდგომარეობებზე',
  
  // Treatment options and details arrays
  lowReserveDetails: [
    'განიხილეთ ექსტრაკორპორული განაყოფიერება (IVF)',
    'რეპროდუქტოლოგთან კონსულტაცია უმოკლეს ვადაში',
    'ოოციტების კრიოკონსერვაციის შესაძლებლობა',
    'სტიმულაციის პროტოკოლების შეფასება'
  ],
  
  normalReserveDetails: [
    'ბუნებრივი ორსულობა სავარაუდოა',
    'დაგეგმილი ორსულობის მცდელობები',
    'სტანდარტული მონიტორინგი',
    'ზოგადი რეკომენდაციები დაგეგმვისთვის'
  ],
  
  highReserveDetails: [
    'პოლიკისტოზური საკვერცხების სინდრომის გამორიცხვა',
    'ჰიპერსტიმულაციის მონიტორინგი',
    'კონტროლირებადი სტიმულაცია IVF-ისას',
    'ჰიპერსტიმულაციის სინდრომის პროფილაქტიკა'
  ],
  
  // Recommendations
  lowRecommendations: [
    'გადაუდებელი კონსულტაცია რეპროდუქტოლოგთან',
    'IVF პროტოკოლების განხილვა',
    'პარტნიორის გამოკვლევა',
    'გენეტიკური კონსულტირება'
  ],
  
  normalRecommendations: [
    'ორსულობის დაგეგმვა ერთი წლის განმავლობაში',
    'ჯანსაღი ცხოვრების წესი',
    'ფოლიუმის მჟავა 400 მკგ/დღეში',
    'რეგულარული დაკვირვება'
  ],
  
  highRecommendations: [
    'PCOS-ის გამორიცხვა',
    'მეტაბოლური პარამეტრების კონტროლი',
    'სპეციალიზირებული IVF პროტოკოლები',
    'გართულებების პროფილაქტიკა'
  ],
  
  // About section
  aboutTitle: 'საკვერცხის რეზერვის კალკულატორის შესახებ',
  purposeTitle: 'დანიშნულება',
  purposeText: 'ეს კალკულატორი განკუთვნილია რეპროდუქციული ასაკის ქალებში საკვერცხის რეზერვის შეფასებისთვის უნაყოფობის მკურნალობის დაგეგმვისა და რეპროდუქციული პოტენციალის პროგნოზირების მიზნით.',
  
  parametersTitle: 'შეფასების პარამეტრები',
  parameters: [
    'ასაკი - ძირითადი ფაქტორი, რომელიც მოქმედებს საკვერცხის რეზერვზე',
    'AMH (ანტიმიულერული ჰორმონი) - ყველაზე ზუსტი მარკერი',
    'ანტრალური ფოლიკულების რაოდენობა - ექოგრაფიული ინდიკატორი',
    'FSH - საკვერცხის ფუნქციის ჰორმონალური მარკერი',
    'ესტრადიოლი - ბაზალური დონე ციკლის მე-3 დღეს',
    'ინჰიბინი B - დამატებითი მარკერი'
  ],
  
  interpretationGuideTitle: 'ინტერპრეტაციის სახელმძღვანელო',
  
  lowReserveTitle: 'დაბალი რეზერვი',
  lowReserveDescription: 'AMH < 1.0 ნგ/მლ, AFC < 7, FSH > 10 mIU/მლ. საჭიროა სპეციალისტთან გადაუდებელი კონსულტაცია.',
  
  normalReserveTitle: 'ნორმალური რეზერვი',
  normalReserveDescription: 'AMH 1.0-3.0 ნგ/მლ, AFC 7-15, FSH 5-10 mIU/მლ. ხელსაყრელი პროგნოზი ბუნებრივი ორსულობისთვის.',
  
  highReserveTitle: 'მაღალი რეზერვი',
  highReserveDescription: 'AMH > 3.0 ნგ/მლ, AFC > 15. გამორიცხეთ PCOS, კონტროლი ჰიპერსტიმულაციის რისკზე.',
  
  limitationsTitle: 'შეზღუდვები',
  limitations: [
    'კალკულატორი არ ცვლის ექიმის კონსულტაციას',
    'შედეგები უნდა იქნეს ინტერპრეტირებული კლინიკური სურათის კონტექსტში',
    'საჭიროა ნაყოფიერების სხვა ფაქტორების გათვალისწინება',
    'მხოლოდ რეპროდუქციული ასაკის ქალებისთვის'
  ],
  
  referencesTitle: 'ლიტერატურა',
  references: [
    'ASRM Practice Committee. Testing and interpreting measures of ovarian reserve. Fertil Steril 2015;103:e9-e17',
    'La Marca A, et al. Anti-Müllerian hormone (AMH) as a predictive marker in ART. Hum Reprod Update 2010;16:113-130',
    'Broer SL, et al. AMH and AFC as predictors of excessive response in COS. Hum Reprod 2011;26:2648-2653',
    'ESHRE Working Group. Revised 2003 consensus on diagnostic criteria and long-term health risks related to PCOS'
  ]
}; 