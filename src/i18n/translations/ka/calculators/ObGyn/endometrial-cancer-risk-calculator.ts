export const endometrialCancerRiskCalculator = {
  title: 'ენდომეტრიუმის კიბოს რისკის კალკულატორი',
  subtitle: 'ენდომეტრიუმის კიბოს სიცოცხლისგან რისკის შეფასება',
  
  // Tab Labels
  calculate_button: 'კალკულატორი',
  about_title: 'კალკულატორის შესახებ',
  
  // Progress Section
  risk_assessment: 'რისკის შეფასება',
  step_indicator: 'ნაბიჯი {{step}} 3-დან',
  
  // Step Descriptions
  demographics: 'დემოგრაფია',
  physical_characteristics: 'ფიზიკური მახასიათებლები',
  medical_history: 'სამედიცინო ისტორია',
  risk_factors: 'რისკის ფაქტორები',
  risk_factors_analysis: 'რისკის ფაქტორების ანალიზი',
  calculate_risk: 'რისკის გაანგარიშება',
  
  // Step 1: Demographics & Physical Characteristics
  age_label: 'ასაკი',
  age_placeholder: 'შეიყვანეთ თქვენი ასაკი',
  age_help: 'ამჟამინდელი ასაკი წლებში (18-100)',
  age_error: 'შეიყვანეთ სწორი ასაკი 18-დან 100 წლამდე',
  
  bmi_label: 'BMI (სხეულის მასის ინდექსი)',
  bmi_placeholder: 'შეიყვანეთ თქვენი BMI',
  bmi_help: 'სხეულის მასის ინდექსი კგ/მ²-ში (15-60)',
  bmi_error: 'შეიყვანეთ სწორი BMI 15-დან 60 კგ/მ²-მდე',
  
  // Units
  years: 'წელი',
  kg_m2: 'კგ/მ²',
  
  // BMI Categories
  bmi_categories: 'BMI რისკის კატეგორიები',
  bmi_normal: 'ნორმა (18.5-24.9)',
  baseline_risk: 'საბაზისო რისკი',
  bmi_overweight: 'ზედმეტი წონა (25-29.9)',
  moderate_risk: 'მცირედ გაზრდილი რისკი',
  bmi_obese_i: 'სიმსუქნე I ხარისხი (30-34.9)',
  high_risk_2_3x: '2-3-ჯერ გაზრდილი რისკი',
  bmi_obese_ii: 'სიმსუქნე II+ ხარისხი (≥35)',
  very_high_risk_3_6x: '3-6-ჯერ გაზრდილი რისკი',
  
  // Navigation Buttons
  next_medical_history: 'შემდეგი: სამედიცინო ისტორია',
  previous: 'წინა',
  next_calculate_risk: 'შემდეგი: რისკის გამოთვლა',
  
  // Step 2: Medical History & Risk Factors
  medical_conditions: 'სამედიცინო მდგომარეობები',
  reproductive_history: 'რეპროდუქციული ისტორია',
  medication_history: 'მედიკამენტების ისტორია',
  
  // Medical Conditions
  diabetes_label: 'მე-2 ტიპის დიაბეტი',
  diabetes_description: 'მე-2 ტიპის შაქრიანი დიაბეტის ამჟამინდელი დიაგნოზი',
  lynch_syndrome_label: 'ლინჩის სინდრომი',
  lynch_syndrome_description: 'მემკვიდრეობითი არაპოლიპოზური კოლორექტალური კიბო',
  family_history_label: 'ენდომეტრიუმის კიბოს ოჯახური ისტორია',
  family_history_description: 'პირველი ხაზის ნათესავების ენდომეტრიუმის კიბო',
  
  // Reproductive History
  nulliparity_label: 'ნულიპარობა (წინა ორსულობების არარსებობა)',
  nulliparity_description: 'არასდროს ყოფილა ორსული (არცერთი ორსულობა არ არის მიყვანილი სიცოცხლისუნარიანობამდე)',
  late_menopause_label: 'გვიანი მენოპაუზა (52 წლის შემდეგ)',
  late_menopause_description: 'ბუნებრივი მენოპაუზა 52 წლის შემდეგ',
  
  // Medication History
  tamoxifen_label: 'ტამოქსიფენის გამოყენება',
  tamoxifen_description: 'ამჟამინდელი ან წინა ტამოქსიფენის თერაპია',
  unopposed_estrogen_label: 'უოპოზიციო ესტროგენული თერაპია',
  unopposed_estrogen_description: 'ესტროგენული თერაპია პროგესტერონის გარეშე',
  
  // Step 3: Assessment Review
  risk_assessment_review: 'რისკის შეფასების მიმოხილვა',
  assessment_summary: 'შეფასების რეზიუმე',
  
  // Summary Labels (Short forms)
  diabetes_short: 'დიაბეტი',
  nulliparity_short: 'ნულიპარობა',
  late_menopause_short: 'გვიანი მენოპაუზა',
  tamoxifen_short: 'ტამოქსიფენი',
  unopposed_estrogen_short: 'უოპოზიციო ესტროგენი',
  lynch_syndrome_short: 'ლინჩის სინდრომი',
  yes: 'დიახ',
  no: 'არა',
  
  // Calculation Buttons
  calculating: 'რისკის გამოთვლა...',
  calculate_risk_assessment: 'რისკის შეფასების გამოთვლა',
  reset_all_fields: 'ყველა ველის გასუფთავება',
  
  // Results Section
  risk: 'რისკი',
  risk_level: 'რისკის დონე',
  lifetime_risk: 'მთელი ცხოვრების განმავლობაში არსებული რისკი',
  management_recommendation: 'მართვის რეკომენდაციები',
  management_description: 'კვლევებზე დაფუძნებული მართვის სტრატეგიები თქვენი რისკის პროფილისთვის',
  screening_recommendation: 'სკრინინგის რეკომენდაციები',
  protective_factors: 'დამცავი ფაქტორები',
  clinical_recommendations: 'კლინიკური რეკომენდაციები',
  
  // About Section
  clinical_purpose: 'კლინიკური დანიშნულება',
  clinical_purpose_desc: 'ეს კალკულატორი უზრუნველყოფს ენდომეტრიუმის კიბოს რისკის კომპლექსურ შეფასებას დადგენილი კლინიკური რისკის ფაქტორებისა და ეპიდემიოლოგიური მონაცემების საფუძველზე.',
  clinical_purpose_details: 'ენდომეტრიუმის კიბო არის ყველაზე გავრცელებული გინეკოლოგიური ავთვისებიანი ნეოპლაზმა განვითარებულ ქვეყნებში. რისკზე დაფუძნებული შეფასება საშუალებას იძლევა შეიქმნას პერსონალიზებული სკრინინგისა და პრევენციის სტრატეგიები.',
  
  // High Risk Factors
  high_risk_factors: 'მაღალი რისკის ფაქტორები',
  obesity_risk: 'სიმსუქნე (BMI ≥30 კგ/მ²)',
  diabetes_risk: 'მე-2 ტიპის შაქრიანი დიაბეტი',
  nulliparity_risk: 'ნულიპარობა (არასდროს ყოფილა ორსული)',
  late_menopause_risk: 'გვიანი მენოპაუზა (>52 წელი)',
  lynch_syndrome_risk: 'ლინჩის სინდრომი (მემკვიდრეობითი)',
  unopposed_estrogen_risk: 'უოპოზიციო ესტროგენული თერაპია',
  tamoxifen_risk: 'ტამოქსიფენის თერაპია',
  pcos_risk: 'პოლიკისტოზური ოვარიუმების სინდრომი (PCOS)',
  irregular_cycles_risk: 'ქრონიკული ანოვულაცია/არარეგულარული ციკლები',
  hyperplasia_risk: 'ენდომეტრიუმის ჰიპერპლაზია',
  family_history_risk: 'ენდომეტრიუმის კიბოს ოჯახური ისტორია',
  breast_ovarian_history_risk: 'მკერდის ძუძუს/საკვერცეების კიბოს პირადი ისტორია',
  
  // Protective Factors
  multiparity_protective: 'მულტიპარობა (მრავალი ორსულობა)',
  oral_contraceptive_protective: 'ორალური კონტრაცეპტივების ხანგრძლივი გამოყენება',
  physical_activity_protective: 'რეგულარული ფიზიკური აქტივობა',
  normal_bmi_protective: 'ნორმალური BMI (18.5-24.9 კგ/მ²)',
  combined_hrt_protective: 'კომბინირებული ესტროგენ-პროგესტაგენული თერაპია',
  breastfeeding_protective: 'ხანგრძლივი ძუძუთი კვება',
  progestin_iud_protective: 'პროგესტინის გამანთავისუფლებელი IUD',
  smoking_cessation_protective: 'მოწევის შეწყვეტა',
  mediterranean_diet_protective: 'ხმელთაშუაზღვისპირა დიეტა',
  regular_cycles_protective: 'რეგულარული ოვულატორული ციკლები',
  early_menopause_protective: 'ადრეული მენოპაუზა (<45 წელი)',
  
  // Risk-Based Management
  risk_based_management: 'რისკზე დაფუძნებული მართვის სტრატეგიები',
  
  // Very High Risk (Lynch Syndrome)
  very_high_risk_lynch: 'ძალიან მაღალი რისკი (ლინჩის სინდრომი)',
  annual_biopsy_lynch: 'ყოველწლიური ენდომეტრიუმის ბიოფსია 35 წლიდან',
  tv_ultrasound_lynch: 'ყოველწლიური ტრანსვაგინალური ულტრაბგერა',
  prophylactic_hysterectomy_lynch: 'პროფილაქტიკური ჰისტერექტომიის განხილვა შვილოსნობის შემდეგ',
  genetic_counseling_lynch: 'გენეტიკური კონსულტირება და ოჯახური სკრინინგი',
  enhanced_surveillance_lynch: 'გაძლიერებული ზედამხედველობის პროტოკოლები',
  
  // High Risk (Multiple Factors)
  high_risk_multiple: 'მაღალი რისკი (მრავალი რისკის ფაქტორი)',
  enhanced_surveillance_high: 'გაძლიერებული კლინიკური ზედამხედველობა',
  endometrial_sampling_high: 'ენდომეტრიუმის ბიოფსიის განხილვა სიმპტომების დროს',
  weight_management_high: 'აგრესიული წონის მართვის კონსულტირება',
  hormonal_risk_reduction_high: 'ჰორმონალური რისკის შემცირების სტრატეგიები',
  patient_education_high: 'კომპლექსური პაციენტის განათლება საყურადღებო ნიშნებზე',
  
  // Average Risk (General Population)
  average_risk_general: 'საშუალო რისკი (ზოგადი პოპულაცია)',
  no_routine_screening_average: 'რუტინული სკრინინგი არ არის რეკომენდებული',
  prompt_evaluation_average: 'პათოლოგიური სისხლდენის სწრაფი შეფასება',
  annual_pelvic_exam_average: 'ყოველწლიური გინეკოლოგიური გამოკვლევა',
  lifestyle_counseling_average: 'ცხოვრების წესის ცვლილების კონსულტირება',
  symptom_awareness_average: 'საყურადღებო სიმპტომებზე განათლება',
  
  // Warning Signs
  warning_signs: 'საყურადღებოი ნიშნები და სიმპტომები',
  primary_warning_signs: 'ძირითადი საყურადღებოი ნიშნები',
  postmenopausal_bleeding_warning: 'პოსტმენოპაუზური სისხლდენა (ყოველგვარი რაოდენობა)',
  abnormal_uterine_bleeding_warning: 'საშვილოსნოს აბნორმალური სისხლდენის ნიშნები',
  intermenstrual_bleeding_warning: 'ინტერმენსტრუალური სისხლდენა',
  heavy_prolonged_periods_warning: 'მძიმე ან ხანგრძლივი მენსტრუალური პერიოდები',
  unusual_vaginal_discharge_warning: 'უჩვეულო ვაგინალური გამონადენი',
  
  // Advanced Disease Symptoms
  advanced_disease_symptoms: 'განვითარებული დაავადების სიმპტომები',
  pelvic_pain_advanced: 'მუდმივი ბოქვენის ტკივილი',
  abdominal_distension_advanced: 'მუცლის გაბერვა',
  early_satiety_advanced: 'ადრეული დანაყრება და გაბერვა',
  unexplained_weight_loss_advanced: 'აუხსნელი წონის კლება',
  urinary_frequency_advanced: 'შარდვის სიხშირე ან სისწრაფე',
  bowel_symptoms_advanced: 'ახალი ნაწლავის სიმპტომები',
  
  // Clinical Pearl
  clinical_pearl: 'მნიშვნელოვანი კლინიკური ინფორმაცია',
  clinical_pearl_desc: 'პოსტმენოპაუზურ სისხლდენას აქვს 10-15% ენდომეტრიუმის კიბოს რისკი და საჭიროებს ენდომეტრიუმის ბიოფსიით დაუყოვნებელ შეფასებას.',
  
  // Diagnostic Evaluation
  diagnostic_evaluation: 'დიაგნოსტიკური შეფასება',
  first_line_diagnostic: 'პირველი ხაზის დიაგნოსტიკური ტესტები',
  endometrial_biopsy_diagnostic: 'ენდომეტრიუმის ბიოფსია (ამბულატორიული)',
  tv_ultrasound_diagnostic: 'ტრანსვაგინალური ულტრაბგერა',
  saline_sonography_diagnostic: 'მარილიანი ინფუზიის სონოგრაფია',
  hysteroscopy_diagnostic: 'ჰისტეროსკოპია ბიოფსიით',
  
  // Endometrial Thickness Thresholds
  endometrial_thickness_thresholds: 'ენდომეტრიუმის სისქის ზღვრები',
  postmenopausal_threshold: 'პოსტმენოპაუზა: >4მმ საჭიროებს შეფასებას',
  premenopausal_threshold: 'პრემენოპაუზა: იცვლება ციკლის ფაზის მიხედვით',
  hrt_threshold: 'HRT მომხმარებლები: >5მმ საჭიროებს შეფასებას',
  tamoxifen_threshold: 'ტამოქსიფენის მომხმარებლები: >8მმ საჭიროებს შეფასებას',
  
  // High-Risk Screening Protocols
  high_risk_screening_protocols: 'მაღალი რისკის სკრინინგის პროტოკოლები',
  lynch_screening: 'ლინჩის სინდრომი: ყოველწლიური სკრინინგი 35 წლიდან',
  tamoxifen_screening: 'ტამოქსიფენის მომხმარებლები: ყოველწლიური გინეკოლოგიური გამოკვლევა',
  unopposed_estrogen_screening: 'უოპოზიციო ესტროგენი: ხანგრძლივობის მინიმიზება',
  pcos_screening: 'PCOS: რეგულარული ციკლის რეგულირება და სკრინინგი',
  
  // Clinical Guidelines & Evidence
  clinical_guidelines_evidence: 'კლინიკური გაიდლაინები და მტკიცებულებითი ბაზა',
  nccn_guidelines_v2024: 'NCCN გაიდლაინები ვერსია 2024.1: საშვილოსნოს ნეოპლაზმები',
  sgo_clinical_statement: 'SGO კლინიკური განცხადება ენდომეტრიუმის კიბოზე',
  acog_bulletin_147: 'ACOG პრაქტიკის ბიულეტენი №147: ლინჩის სინდრომი',
  uspstf_2023: 'USPSTF 2023: გინეკოლოგიური მდგომარეობების სკრინინგი',
  esmo_guidelines: 'ESMO კლინიკური პრაქტიკის გაიდლაინები: ენდომეტრიუმის კიბო',
  nice_guidelines_ng12: 'NICE სახელმძღვანელო NG12: ეჭვმიტანილი კიბოს აღმოჩენა',
  rcog_green_top: 'RCOG Green-top სახელმძღვანელო #67: ენდომეტრიუმის კიბო',
  asco_sso_guidelines: 'ASCO/SSO სახელმძღვანელო: ენდომეტრიუმის კიბოს მკურნალობა',
  
  // Service strings for calculations (results, risk factors, recommendations)
  service: {
    // Risk factor descriptions
    peak_incidence_age: 'პიკური ინციდენტობის ასაკობრივი ჯგუფი (55-69 წელი)',
    advanced_age: 'მოწინავე ასაკი',
    severe_obesity: 'მძიმე სიმსუქნე (BMI ≥35) - რისკი 5-6-ჯერ გაზრდილი',
    obesity: 'სიმსუქნე (BMI 30-34.9) - რისკი 3-ჯერ გაზრდილი',
    overweight: 'ზედმეტი წონა (BMI 25-29.9) - ზომიერად გაზრდილი რისკი',
    normal_bmi_baseline: 'ნორმალური BMI (18.5-24.9) - ბაზისური რისკი',
    type_2_diabetes_risk: 'ტიპ 2 შაქრიანი დიაბეტი - რისკი 2-4-ჯერ გაზრდილი',
    lynch_syndrome_risk: 'ლინჩის სინდრომი - მთელი ცხოვრების განმავლობაში არსებული რისკი 40-60%',
    family_history_cancer: 'ოჯახური ანამნეზი ენდომეტრიუმის/საკვერცხეების/კოლონის კიბოსა',
    nulliparity_risk: 'უშვილობა - რისკი 2-3-ჯერ გაზრდილი',
    parity_protective: 'მშობიარობა - დამცავი ფაქტორი ენდომეტრიუმის კიბოს წინააღმდეგ',
    late_menopause_estrogen: 'გვიანი მენოპაუზა (>52 წელი) - ხანგრძლივი ესტროგენული ზემოქმედება',
    tamoxifen_risk: 'ტამოქსიფენის გამოყენება - რისკი 2-7-ჯერ გაზრდილი',
    unopposed_estrogen_risk: 'უოპოზიციო ესტროგენული თერაპია - რისკი 8-15-ჯერ გაზრდილი',
    pregnancy_history: 'ორსულობის ისტორია',
    normal_body_weight: 'ნორმალური სხეულის წონა',
    no_risk_factors: 'მნიშვნელოვანი რისკის ფაქტორები არ გამოვლენილა',

    // Interpretation text parts
    lifetime_endometrial_cancer_risk: 'მთელი ცხოვრების განმავლობაში არსებული ენდომეტრიუმის კიბოს რისკი',
    population_average: 'პოპულაციური საშუალო',
    primary_risk_factors: 'ძირითადი რისკის ფაქტორები:',

    // Screening recommendations by category
    screening_very_high: 'ყოველწლიური ენდომეტრიუმის ბიოფსია 35 წლის ასაკიდან. განიხილეთ პროფილაქტიკური ჰისტერექტომია შვილოსნობის შემდეგ.',
    screening_high: 'გაძლიერებული ზედამხედველობა ყოველწლიური შეფასებით. განიხილეთ ენდომეტრიუმის ნიმუშის აღება აბნორმალური სისხლდენისას.',
    screening_moderate: 'გაზრდილი ყურადღება სიმპტომებზე. სწრაფი შეფასება ნებისმიერი აბნორმალური სისხლდენისას.',
    screening_low: 'სტანდარტული მზრუნველობა. სწრაფი შეფასება ნებისმიერი მენოპაუზის შემდგომი სისხლდენისას.',

    // Clinical recommendations
    genetic_counseling: 'გენეტიკური კონსულტაცია და ოჯახური კასკადური ტესტირება',
    prophylactic_surgery: 'განიხილეთ პროფილაქტიკური ჰისტერექტომია და ორმხრივი სალპინგოოფორექტომია შვილოსნობის შემდეგ',
    enhanced_surveillance: 'გაძლიერებული ზედამხედველობა ლინჩის სინდრომთან ასოცირებულ კიბოებზე',
    weight_management: 'წონის მართვა დიეტისა და ვარჯიშის მეშვეობით',
    bariatric_surgery: 'განიხილეთ ბარიატრიული ქირურგია მძიმე სიმსუქნისას',
    glycemic_control: 'გლიკემიური კონტროლის ოპტიმიზაცია HbA1c მიზნით <7%',
    metformin_consideration: 'განიხილეთ მეტფორმინი, რომელსაც შეიძლება ჰქონდეს დამცავი ეფექტები',
    progestin_addition: 'განიხილეთ პროგესტინის დამატება ესტროგენულ თერაპიაში',
    hormone_alternatives: 'შეაფასეთ ჰორმონული თერაპიის ალტერნატიული ვარიანტები',
    healthy_lifestyle: 'შეინარჩუნეთ ჯანსაღი ცხოვრების წესი: რეგულარული ვარჯიში, დაბალანსებული დიეტა',
    postmenopausal_bleeding_evaluation: 'მენოპაექოს შემდგომი სისხლდენის დაუყოვნებელი შეფასება',
    annual_gynecologic_exam: 'ყოველწლიური გინეკოლოგიური გამოკვლევა მუცლის ღრუს გამოკვლევით',

    // Risk categories (for translation)
    risk_low: 'დაბალი',
    risk_moderate: 'ზომიერი',  
    risk_high: 'მაღალი',
    risk_very_high: 'ძალიან მაღალი'
  }
}; 