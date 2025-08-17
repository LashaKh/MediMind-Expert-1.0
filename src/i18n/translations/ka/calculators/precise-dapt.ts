export const preciseDaptTranslations = {
  title: 'PRECISE-DAPT სისხლდენის რისკის კალკულატორი',
  subtitle: 'სისხლდენის რისკის შეფასება • DAPT ხანგრძლივობის განსაზღვრა',
  description: 'ორმაგ ანტიაგრეგანტულ თერაპიასთან დაკავშირებული სისხლდენის რისკის პროგნოზირება PCI-ის შემდეგ ოპტიმალური ხანგრძლივობის განსასაზღვრათ.',
  
  // Tool description
  bleeding_assessment_tool: 'სისხლდენის რისკის შეფასების ინსტრუმენტი',
  tool_description: 'PRECISE-DAPT კალკულატორი, პროგნოზირებს ორმაგ ანტიაგრეგანტულ თერაპიასთან (DAPT) დაკავშირებულ სისხლდენის რისკებს და განსაზღვრავს PCI-ის შემდეგ ოპტიმალური DAPT თერაპიის ხანგრძლივობას. ეს ვალიდირებული ინსტრუმენტი აბალანსებს სისხლდენის უსაფრთხოებას და იშემიის რისკებს.',
  
  // Step navigation
  patient_labs: 'პაციენტის ლაბორატორიული მონაცემები',
  bleeding_history: 'სისხლდენის ანამნეზი',
  
  // Step 1: Demographics & Lab Values
  demographics_labs_section: 'პაციენტის დემოგრაფია და ლაბორატორიული მონაცემები',
  laboratory_description: 'შეიყვანეთ პაციენტის ასაკი და მთავარი ლაბორატორიული პარამეტრები, რომლებიც გავლენას ახდენენ სისხლდენის რისკზე',
  
  // Form fields
  age_label: 'ასაკი',
  age_error: 'ასაკი უნდა იყოს 18-120 წლის შორის',
  
  creatinine_label: 'შრატის კრეატინინი',
  creatinine_unit: 'მგ/დლ',
  creatinine_error: 'კრეატინინი უნდა იყოს 0.5-15.0 მგ/დლ-ს შორის',
  
  hemoglobin_label: 'ჰემოგლობინი',
  hemoglobin_unit: 'გ/დლ',
  hemoglobin_error: 'ჰემოგლობინი უნდა იყოს 5.0-20.0 გ/დლ-ს შორის',
  
  white_blood_count_label: 'თეთრი უჯრედების რაოდენობა',
  white_blood_count_unit: '×10³/μL',
  white_blood_count_error: 'თეთრი უჯრედების რაოდენობა უნდა იყოს 1.0-50.0 ×10³/μL-ს შორის',
  
  // Step 2: Bleeding History
  bleeding_history_section: 'სისხლდენის ანამნეზის შეფასება',
  bleeding_history_description: 'სისხლდენის ადრინდელი ანამნეზი არის მომავალი სისხლდენის რისკის პროგნოზის ძლიერი მანჩვენებელი',
  
  previous_bleed: 'სისხლდენის ადრინდელი ანამნეზი',
  previous_bleed_desc: 'მნიშვნელოვანი სისხლდენის ანამნეზი, რომელიც საჭიროებდა ჰოსპიტალიზაცის, ტრანსფუზიას ან ქირურგიას',
  
  // Navigation buttons
  next_bleeding_history: 'შემდეგი: სისხლდენის ანამნეზი',
  calculate_button: 'PRECISE-DAPT ქულის გამოთვლა',
  
  // Results section
  bleeding_risk_analysis: 'PRECISE-DAPT სისხლდენის რისკის ანალიზი',
  score_points: '{score} ქულა',
  
  // Risk categories and interpretations
  bleeding_risk: 'სისხლდენის რისკი',
  major_bleeding: 'მნიშვნელოვანი სისხლდენის რისკი',
  safe_duration: 'უსაფრთხო ხანგრძლივობა',
  annual_major_bleeding: 'წლიური მნიშვნელოვანი სისხლდენის რისკი',
  overall_bleeding_risk: 'საერთო სისხლდენის რისკი 12 თვეში: {{risk}}%',
  recommended_dapt_duration: 'რეკომენდირებული DAPT ხანგრძლივობა',
  
  // Risk levels
  low_risk: 'დაბალი რისკი',
  intermediate_risk: 'საშუალო რისკი',
  high_risk: 'მაღალი რისკი',
  
  // Interpretation messages
  interpretation_low: 'დაბალი სისხლდენის რისკი ({{risk}}% 12 თვეში) - შეიძლება განიხილული იქნას ხანგრძლივი DAPT-ი',
  interpretation_intermediate: 'საშუალო სისხლდენის რისკი ({{risk}}% 12 თვეში) - სტანდარტული DAPT-ი ფრთხილი მონიტორინგით',
  interpretation_high: 'მაღალი სისხლდენის რისკი ({{risk}}% 12 თვეში) - განიხილეთ მოკლე DAPT-ის ხანგრძლივობა',
  
  // Risk factors
  contributing_risk_factors: 'ხელის შემწყობი რისკის ფაქტორები',
  risk_factor_advanced_age: 'ხანდაზმულობის ასაკი (≥75 წელი) - მნიშვნელოვნად გაზრდილი სისხლდენის რისკი',
  risk_factor_elderly_age: 'ხანდაზმულობის ასაკი (65-74 წელი) - ზომიერად გაზრდილი სისხლდენის რისკი',
  risk_factor_severe_renal: 'მძიმე თირკმლის უკმარისობა (კრეატინინი ≥2.0 მგ/დლ) - მაღალი სისხლდენის რისკი',
  risk_factor_moderate_renal: 'საშუალო თირკმლის უკმარისობა (კრეატინინი 1.5-1.9 მგ/დლ) - გაზრდილი სისხლდენის რისკი',
  risk_factor_mild_renal: 'მსუბუქი თირკმლის უკმარისობა (კრეატინინი 1.2-1.4 მგ/დლ) - უმნიშვნელოდ გაზრდილი სისხლდენის რისკი',
  risk_factor_severe_anemia: 'მძიმე ანემია (ჰემოგლობინი <10 გ/დლ) - მნიშვნელოვნად გაზრდილი სისხლდენის რისკი და გართულებები',
  risk_factor_moderate_anemia: 'საშუალო ანემია (ჰემოგლობინი 10-11.9 გ/დლ) - გაზრდილი სისხლდენის რისკი',
  risk_factor_low_hemoglobin: 'დაბალი ჰემოგლობინი (ჰემოგლობინი 12-12.9 გ/დლ) - უმნიშვნელოდ გაზრდილი სისხლდენის რისკი',
  risk_factor_elevated_wbc: 'მომატებული თეთრი უჯრედების რაოდენობა (>12 ×10³/μL) - ანთების მარკერი, გაზრდილი სისხლდენის რისკი',
  risk_factor_low_wbc: 'დაბალი თეთრი უჯრედების რაოდენობა (<4 ×10³/μL) - გაზრდილი სისხლდენისა და ინფექციის რისკი',
  risk_factor_previous_bleeding: 'ადრინდელი მნიშვნელოვანი სისხლდენა - მომავალი სისხლდენის მოვლენების ყველაზე ძლიერი მაპროგნოზირებელი ფაქტორი',
  
  // Recommendations by risk level
  recommendation_low: 'ხანგრძლივი DAPT (12-30 თვე) შეიძლება უზრუნველყოს იშემიური სარგებელი მისაღები სისხლდენის რისკით',
  recommendation_intermediate: 'სტანდარტული DAPT ხანგრძლივობა (12 თვე) გაძლიერებული სისხლდენის მონიტორინგითა და რისკ ფაქტორების მოდიფიკაციით',
  recommendation_high: 'განიხილეთ მოკლე DAPT ხანგრძლივობა (3-6 თვე) მომატებული სისხლდენის რისკის გამო, მაგრამ უზრუნველყავით ადეკვატური იშემიური დაცვა',
  
  // Duration guidance
  duration_low: '12-30 თვე მონიტორინგით',
  duration_intermediate: '12 თვე ზედამხედველობით',
  duration_high: '3-6 თვე შეფასებით',
  
  // Clinical guidance
  guidance_low: 'დაბალი სისხლდენის რისკი იძლევა გახანგრძლივებული DAPT-ის განხილვის საშუალებას მაღალი იშემიური რისკის პაციენტებში',
  guidance_intermediate: 'დაბალანსეთ სისხლდენისა და იშემიური რისკები ინდივიდუალური ხანგრძლივობის შეფასებით',
  guidance_high: 'მაღალი სისხლდენის რისკი საჭიროებს მოკლე DAPT ხანგრძლივობისა და სისხლდენის რისკის მოდიფიკაციის განხილვას',
  
  // Clinical benefit
  benefit_low: 'ხელსაყრელი სისხლდენის უსაფრთხოების პროფილი მხარს უჭერს გახანგრძლივებული DAPT-ის განხილვას იშემიური სარგებლისთვის',
  benefit_intermediate: 'ზომიერი სისხლდენის რისკი საჭიროებს ფრთხილ ბალანსს იშემიური დაცვის საჭიროებებთან',
  benefit_high: 'მომატებული სისხლდენის რისკმა შეიძლება შეზღუდოს გახანგრძლივებული DAPT-ის სარგებელი, განიხილეთ ალტერნატიული ანტითრომბოციტული სტრატეგიები',
  
  // Safe duration recommendations
  safe_duration_low: '12-30 თვე მონიტორინგით',
  safe_duration_intermediate: '12 თვე ზედამხედველობით',
  safe_duration_high: '3-6 თვე შეფასებით',
  
  // Clinical sections
  clinical_recommendation: 'კლინიკური რეკომენდაცია',
  clinical_benefit_analysis: 'კლინიკური სარგებლის ანალიზი',
  
  // Score interpretation guide
  score_interpretation: 'PRECISE-DAPT ქულის ინტერპრეტაციის გზამკვლევი',
  score_low_range: 'დაბალი რისკი (<25 ქულა)',
  score_low_description: 'გახანგრძლივებული DAPT შეიძლება იყოს სასარგებლო მისაღები სისხლდენის რისკით',
  score_intermediate_range: 'საშუალო რისკი (25-35 ქულა)',
  score_intermediate_description: 'სტანდარტული DAPT გაძლიერებული მონიტორინგით რეკომენდირებულია',
  score_high_range: 'მაღალი რისკი (≥35 ქულა)',
  score_high_description: 'განიხილეთ მოკლე DAPT მომატებული სისხლდენის რისკის გამო',
  
  // Algorithm validation
  enhanced_algorithm: 'გაძლიერებული PRECISE-DAPT ალგორითმი',
  algorithm_validation: '✓ PRECISE-DAPT კვლევით ვალიდირებული • გაძლიერებული სისხლდენის რისკის შეფასება რაოდენობრივი უსაფრთხოების ანალიზით',
  based_on_precise_dapt: 'PRECISE-DAPT კვლევის საფუძველზე • სისხლდენის რისკის შეფასება DAPT ხანგრძლივობის მიმართულებისთვის',
  bleeding_safety_validated: 'სისხლდენის უსაფრთხოება ვალიდირებული',
  
  // Action buttons
  new_assessment: 'ახალი შეფასება',
  modify_inputs: 'შეცვალეთ მონაცემები'
};

export default preciseDaptTranslations; 