export const pretermBirthRiskCalculator = {
  // Basic Info
  title: "ადრეული მშობიარობის რისკის კალკულატორი",
  subtitle: "მტკიცებულებაზე დაფუძნებული რისკის სტრატიფიკაცია • ACOG გაიდლაინები • საშვილოსნოს ყელის სიგრძის შეფასება • კლინიკური გადაწყვეტილებების მხარდაჭერა",
  
  // Main Interface
  acog_evidence_based: "ACOG-ის მტკიცებულებაზე დაფუძნებული ადრეული მშობიარობის რისკის შეფასება",
  tool_description: "სპონტანური ადრეული მშობიარობის კომპლექსური რისკის სტრატიფიკაცია კლინიკური რისკის ფაქტორების, საშვილოსნოს ყელის სიგრძის შეფასების და ბიომარკერების გამოყენებით. განსაზღვრავს პრევენციულ ჩარევებს და მონიტორინგის პროტოკოლებს.",
  acog_practice_bulletin: "ACOG პრაქტიკული ბიულეტენი №234 - ადრეული მშობიარობის რისკის შეფასება",
  
  // Progress Steps
  clinical_assessment: "კლინიკური შეფასება",
  clinical_assessment_description: "მიმდინარე ორსულობის პარამეტრები და საშვილოსნოს ყელის შეფასება",
  risk_factors: "რისკის ფაქტორები", 
  risk_factors_description: "ისტორიული და ანატომიური რისკის ფაქტორები ადრეული მშობიარობისთვის",
  assessment: "შეფასება",
  
  // Navigation
  next_risk_factors: "შემდეგი: რისკის ფაქტორები",
  back: "უკან",
  calculate_risk: "რისკის გამოთვლა",
  
  // Form Labels - Clinical Assessment
  current_pregnancy: "მიმდინარე ორსულობა",
  current_gestational_age: "მიმდინარე გესტაციური ასაკი",
  current_gestational_age_help: "შეფასება ჩვეულებრივ ტარდება 16-36 კვირებს შორის",
  weeks_unit: "კვირა",
  
  body_mass_index: "სხეულის მასის ინდექსი (BMI)",
  bmi_help: "BMI ორსულობამდე ან ორსულობის დასაწყისში",
  kg_m2_unit: "კგ/მ²",
  
  // Cervical Assessment
  cervical_length_assessment: "საშვილოსნოს ყელის სიგრძის შეფასება",
  cervical_length: "საშვილოსნოს ყელის სიგრძე",
  cervical_length_help: "ტრანსვაგინალური ულტრაბგერითი გაზომვა (ნორმა: ≥25მმ)",
  mm_unit: "მმ",
  
  // Cervical Length Reference Values
  cervical_length_reference: "საშვილოსნოს ყელის სიგრძის რეფერენსული მნიშვნელობები",
  normal_length: "ნორმალური: ≥25მმ",
  short_length: "მოკლე: 15-24მმ", 
  very_short_length: "ძალიან მოკლე: <15მმ",
  
  // Biomarker Assessment
  biomarker_assessment: "ბიომარკერების შეფასება",
  positive_ffn: "პოზიტიური ფეტალური ფიბრონექტინი (fFN)",
  ffn_help: "fFN პოზიტიური ტესტის შედეგი (≥50 ნგ/მლ ან ხარისხობრივად პოზიტიური)",
  
  // Fetal Fibronectin Information
  ffn_information: "ფეტალური ფიბრონექტინის ინფორმაცია",
  ffn_info_1: "მაღალი უარყოფითი პროგნოსტიკური ღირებულება (>95%) 7-14 დღეში მშობიარობისთვის",
  ffn_info_2: "უმჯობესია გომოყენებული იქნას საშვილოსნოს ყელის სიგრძის შეფასებასთან ერთად",
  ffn_info_3: "ოპტიმალური დრო: 22-34 კვირა ორსულობისა სიმპტომური პაციენტებისთვის",
  
  // Risk Factors Section
  historical_risk_factors: "ისტორიული რისკ-ფაქტორები",
  previous_preterm_birth: "წინა სპონტანური ადრეული მშობიარობა",
  previous_preterm_birth_help: "წინა მშობიარობა 16-36+6 კვირა ორსულობის ვადაზე",
  multiple_gestation: "მრავალტყუპიანი ორსულობა",
  multiple_gestation_help: "მიმდინარე ორსულობა ტყუპებით, სამეულებით ან უფრო მაღალი რიგის მრავალტყუპიანი ორსულობით",
  
  // High-Impact Risk Factors
  high_impact_risk_factors: "მაღალი ზემოქმედების რისკის ფაქტორები",
  high_impact_info_1: "წინა ადრეული მშობიარობა ზრდის რისკს 2.5-ჯერ",
  high_impact_info_2: "უფრო ადრეული გესტაციური ასაკი წინა მშობიარობისას = უფრო მაღალი განმეორების რისკი",
  high_impact_info_3: "მრავალტყუპიანი ორსულობა შეადგენს ადრეული მშობიარობის ~15% ",
  
  // Anatomical & Lifestyle Factors
  anatomical_lifestyle_factors: "ანატომიური და ცხოვრების წესის ფაქტორები",
  uterine_anomalies: "საშვილოსნოს ანომალიები",
  uterine_anomalies_help: "თანდაყოლილი საშვილოსნოს მალფორმაციები ან შეძენილი დეფექტები",
  smoking: "მოწევა ორსულობის დროს",
  smoking_help: "აქტიური თამბაქოს მოხმარება მიმდინარე ორსულობის დროს",
  
  // Modifiable Risk Factors
  modifiable_risk_factors: "მოდიფიცირებადი რისკის ფაქტორები",
  modifiable_info_1: "მოწევის შეწყვეტა ამცირებს ადრეული მშობიარობის რისკს",
  modifiable_info_2: "საშვილოსნოს ანომალიებმა შეიძლება საჭიროებდეს სპეციალიზებულ მონიტორინგს",
  modifiable_info_3: "განიხილეთ საშვილოსნოს ყელის ცერკლაჟი (Cerclage) სპეციფიკური ანატომიური რისკებისთვის",
  
  // Risk Assessment Framework
  risk_assessment_framework: "რისკის შეფასების ჩარჩო",
  framework_info_1: "რისკის სტრატიფიკაცია განსაზღვრავს პრევენციულ ჩარევებს და მონიტორინგის ინტენსივობას",
  framework_info_2: "აერთიანებს კლინიკურ რისკ-ფაქტორებს, საშვილოსნოს ყელის სიგრძისა და ბიომარკერების შეფასებით",
  framework_info_3: "მტკიცებულებაზე დაფუძნებული მიდგომა პროგესტერონული თერაპიისა და გაძლიერებული ზედამხედველობის დანიშვნასთან დაკავშირებით",
  framework_info_4: "ინდივიდუალური მოვლის გეგმები კომპლექსური რისკის შეფასების საფუძველზე",
  
  // Results Section
  preterm_birth_risk_assessment: "ადრეული მშობიარობის რისკის შეფასება",
  risk_category: "რისკის კატეგორია:",
  preterm_birth_risk: "ადრეული მშობიარობის რისკი:",
  risk_assessment: "რისკის შეფასება",
  spontaneous_preterm_birth_risk: "სპონტანური ადრეული მშობიარობის რისკი",
  monitoring_level: "მონიტორინგის დონე", 
  recommended_surveillance_intensity: "რეკომენდებული ზედამხედველობის ინტენსივობა",
  standard_monitoring: "სტანდარტული",
  
  // Clinical Recommendations
  clinical_recommendations: "კლინიკური რეკომენდაციები",
  evidence_base: "მტკიცებულების ბაზა",
  
  // Risk Categories (these come from the result object)
  low: "დაბალი",
  moderate: "ზომიერი", 
  high: "მაღალი",
  very_high: "ძალიან მაღალი",
  
  // Action Buttons
  new_assessment: "ახალი შეფასება",
  modify_inputs: "შეყვანილი მონაცემების შეცვლა",
  
  // Footer
  acog_guidelines_footer: "ACOG პრაქტიკული ბიულეტენი №234-ის საფუძველზე",
  educational_purposes: "მხოლოდ საგანმანათლებლო მიზნებისთვის",
  acog_2021_guidelines: "ACOG 2021 გაიდლაინები",
  
  // About Section
  about_preterm_birth_calculator: "ადრეული მშობიარობის რისკის კალკულატორის შესახებ",
  about_subtitle: "მტკიცებულებაზე დაფუძნებული რისკის სტრატიფიკაცია • ACOG გაიდლაინები • კლინიკური დოკუმენტაცია",
  about_clinical_purpose: "კლინიკური დანიშნულება",
  about_clinical_purpose_description: "ადრეული მშობიარობის რისკის კალკულატორი უზრუნველყოფს მტკიცებულებაზე დაფუძნებულ სპონტანური ადრეული მშობიარობის რისკის სტრატიფიკაციას კლინიკური რისკის ფაქტორების, საშვილოსნოს ყელის სიგრძის შეფასების და ბიომარკერების გამოყენებით. ის მართავს პრევენციულ ჩარევებს და მონიტორინგის პროტოკოლებს ACOG გაიდლაინების მიხედვით.",
  
  // Error Messages
  gestational_age_required: "მიმდინარე გესტაციური ასაკი აუცილებელია",
  gestational_age_range: "გესტაციური ასაკი უნდა იყოს 16-36 კვირებს შორის რისკის შეფასებისთვის",
  cervical_length_required: "საშვილოსნოს ყელის სიგრძის გაზომვა აუცილებელია",
  cervical_length_range: "საშვილოსნოს ყელის სიგრძე უნდა იყოს 5-60მმ შორის",
  bmi_required: "BMI აუცილებელია",
  bmi_range: "BMI უნდა იყოს 15-60 კგ/მ² შორის",
  calculation_failed: "გამოთვლა ვერ მოხერხდა"
}; 