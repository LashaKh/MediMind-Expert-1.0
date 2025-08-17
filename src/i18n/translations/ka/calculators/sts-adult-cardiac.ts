export const stsAdultCardiacTranslations = {
  title: 'STS ზრდასრული კარდიოქირურგიული რისკის კალკულატორი',
  subtitle: 'პერიოპერაციული რისკის შეფასება • მტკიცებულებაზე დაფუძნებული ქირურგიული დაგეგმვა',
  description: 'გულისა და მისი გარშემო ორგანოების ქირურგების საზოგადოების რისკის შეფასება პერიოპერაციული სიკვდილიანობისა და მორბიდობისთვის გულის ქირურგიაში.',
  
  // Alert section
  alert_title: 'STS ეროვნული მონაცემთა ბაზა - მტკიცებულებაზე დაფუძნებული რისკის შეფასება',
  alert_description: 'ვალიდირებული რისკის პროგნოზირების მოდელი, რომელიც დაფუძნებულია STS ეროვნული მონაცემთა ბაზიდან >4 მილიონ კარდიოქირურგიულ პროცედურაზე.',
  
  // Step navigation
  step1_title: 'ნაბიჯი 1: ზოგადი ინფორმაცია',
  step2_title: 'ნაბიჯი 2: თანმხლები დაავადებები',
  step3_title: 'ნაბიჯი 3: ლაბორატორიული',
  step4_title: 'ნაბიჯი 4: პროცედურა',
  step5_title: 'ნაბიჯი 5: შედეგები',
  
  // Step 1: General Information
  step1: {
    age: 'ასაკი',
    age_help: 'პაციენტის ასაკი ქირურგიის დროს (წლებში)',
    gender: 'სქესი',
    gender_help: 'პაციენტის სქესი',
    male: 'მამრობითი',
    female: 'მდედრობითი',
    race: 'რასა',
    race_help: 'პაციენტის რასობრივი ეთნიკური კუთვნილება',
    white: 'თეთრი',
    black: 'შავი',
    hispanic: 'ისპანური',
    asian: 'აზიური',
    other: 'სხვა',
    height: 'სიმაღლე (სმ)',
    height_help: 'პაციენტის სიმაღლე სანტიმეტრებში',
    weight: 'წონა (კგ)',
    weight_help: 'პაციენტის წონა კილოგრამებში',
    bmi: 'სხეულის მასის ინდექსი',
    bmi_calculated: 'გამოთვლილი BMI: {{bmi}}',
    bmi_help: 'სხეულის მასის ინდექსი (ავტომატურად გამოთვლილი)'
  },
  
  // Step 2: Comorbidities
  step2: {
    diabetes: 'დიაბეტი',
    diabetes_help: 'პაციენტს აქვს შაქრიანი დიაბეტი',
    hypertension: 'ჰიპერტენზია',
    hypertension_help: 'პაციენტს აქვს მაღალი არტერიული წნევა',
    dyslipidemia: 'დისლიპიდემია',
    dyslipidemia_help: 'პაციენტს აქვს ლიპიდების დისორდერი',
    cerebrovascular_disease: 'ცერებროვასკულარული დაავადება',
    cerebrovascular_disease_help: 'ინსულტის ანამნეზი ან TIA',
    peripheral_vascular_disease: 'პერიფერიული სისხლძარღვთა დაავადება',
    peripheral_vascular_disease_help: 'პერიფერიული არტერიების დაავადება',
    chronic_lung_disease: 'ქრონიკული ფილტვების დაავადება',
    chronic_lung_disease_help: 'COPD ან ქრონიკული ფილტვების დაავადება',
    dialysis: 'დიალიზი',
    dialysis_help: 'ქრონიკული დიალიზის მკურნალობა',
    immunocompromised: 'იმუნოკომპრომეტირებული',
    immunocompromised_help: 'იმუნოსუპრესული მდგომარეობა',
    endocarditis: 'ენდოკარდიტი',
    endocarditis_help: 'აქტიური ან თვეების განმავლობაში მკურნალობა',
    previous_cardiac_surgery: 'წინა კარდიოქირურგია',
    previous_cardiac_surgery_help: 'წინა კარდიოქირურგიული ოპერაციები',
    none: 'არ არის',
    one: 'ერთი',
    two_or_more: 'ორი ან მეტი'
  },
  
  // Step 3: Laboratory
  step3: {
    creatinine: 'კრეატინინი (მგ/დლ)',
    creatinine_help: 'შრატის კრეატინინის დონე',
    hematocrit: 'ჰემატოკრიტი (%)',
    hematocrit_help: 'ჰემატოკრიტის პროცენტი',
    albumin: 'ალბუმინი (გ/დლ)',
    albumin_help: 'შრატის ალბუმინის დონე (არასავალდებულო)',
    bun: 'BUN (მგ/დლ)',
    bun_help: 'სისხლის შარდოვანა აზოტი (არასავალდებულო)',
    wbc: 'WBC (×10³/μL)',
    wbc_help: 'თეთრი უჯრედების რაოდენობა (არასავალდებულო)',
    platelets: 'თრომბოციტები (×10³/μL)',
    platelets_help: 'თრომბოციტების რაოდენობა (არასავალდებულო)'
  },
  
  // Step 4: Procedure
  step4: {
    procedure_type: 'პროცედურის ტიპი',
    procedure_type_help: 'ქირურგიული პროცედურის ტიპი',
    isolated_cabg: 'იზოლირებული CABG',
    isolated_valve: 'იზოლირებული კარიბჭე',
    cabg_valve: 'CABG + კარიბჭე',
    two_valve: 'ორი კარიბჭე',
    other_cardiac: 'სხვა კარდიური',
    urgency: 'გადაუდებლობა',
    urgency_help: 'ქირურგიული ავადმყოფობის გადაუდებლობა',
    elective: 'ელექტიური',
    urgent: 'გადაუდებელი',
    emergent: 'ექსტრენული',
    emergent_salvage: 'ექსტრენული გადარჩენა',
    incidence_endocarditis: 'ენდოკარდიტის შემთხვევა',
    incidence_endocarditis_help: 'აქტიური ენდოკარდიტი ქირურგიის დროს',
    cardiogenic_shock: 'კარდიოგენური შოკი',
    cardiogenic_shock_help: 'კარდიოგენური შოკი 24 საათის განმავლობაში',
    mechanical_support: 'მექანიკური მხარდაჭერა',
    mechanical_support_help: 'IABP, ECMO, ან VAD მხარდაჭერა'
  },
  
  // Step 5: Results
  step5: {
    results_title: 'STS რისკის შეფასების შედეგები',
    mortality_risk: 'სიკვდილიანობის რისკი',
    morbidity_risk: 'მორბიდობის რისკი',
    predicted_mortality: 'პროგნოზირებული სიკვდილიანობა',
    predicted_morbidity: 'პროგნოზირებული მორბიდობა',
    risk_interpretation: 'რისკის ინტერპრეტაცია',
    low_risk: 'დაბალი რისკი',
    moderate_risk: 'საშუალო რისკი',
    high_risk: 'მაღალი რისკი',
    very_high_risk: 'ძალიან მაღალი რისკი',
    risk_factors: 'ძირითადი რისკ-ფაქტორები',
    recommendations: 'რეკომენდაციები',
    low_risk_rec: 'სტანდარტული პერიოპერაციული მხარდაჭერა შესაბამისია.',
    moderate_risk_rec: 'განხილეთ გაძლიერებული მონიტორინგი და ოპტიმიზაცია.',
    high_risk_rec: 'მულტიდისციპლინური გუნდის მიდგომა და განსაკუთრებული ზრუნვა საჭიროა.',
    very_high_risk_rec: 'ალტერნატიული მკურნალობის ვარიანტები უნდა იყოს განხილული.'
  },
  
  // Common buttons and actions
  calculate: 'გამოთვლა',
  reset: 'გადატვირთვა',
  next: 'შემდეგი',
  previous: 'წინა',
  
  // Validation messages
  validation: {
    age_required: 'ასაკი აუცილებელია',
    age_range: 'ასაკი უნდა იყოს 18-დან 120 წლამდე',
    height_required: 'სიმაღლე აუცილებელია',
    height_range: 'სიმაღლე უნდა იყოს 100-დან 250 სმ-მდე',
    weight_required: 'წონა აუცილებელია',
    weight_range: 'წონა უნდა იყოს 30-დან 300 კგ-მდე',
    creatinine_required: 'კრეატინინი აუცილებელია',
    creatinine_range: 'კრეატინინი უნდა იყოს 0.3-დან 15.0 მგ/დლ-მდე',
    hematocrit_required: 'ჰემატოკრიტი აუცილებელია',
    hematocrit_range: 'ჰემატოკრიტი უნდა იყოს 15-დან 65%-მდე'
  },
  
  // Risk categories
  risk_categories: {
    very_low: 'ძალიან დაბალი (<1%)',
    low: 'დაბალი (1-3%)',
    moderate: 'საშუალო (3-8%)',
    high: 'მაღალი (8-15%)',
    very_high: 'ძალიან მაღალი (>15%)'
  },
  
  // Clinical notes
  clinical_notes: {
    note_title: 'კლინიკური შენიშვნები',
    database_info: 'STS ეროვნული მონაცემთა ბაზა მოიცავს >4 მილიონ პროცედურას 1000-ზე მეტი ცენტრიდან.',
    validation_info: 'მოდელი ვალიდირებულია მრავალ ცენტრში და რეგულარულად განახლებულია.',
    limitations: 'ლიმიტაციები: ლოკალური ცენტრის ფაქტორები და განსაკუთრებული შემთხვევები შეიძლება არ იყოს სრულად ასახული.'
  }
}; 