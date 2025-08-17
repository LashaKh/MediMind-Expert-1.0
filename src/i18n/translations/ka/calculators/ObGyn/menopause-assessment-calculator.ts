export const menopauseAssessmentCalculatorKa = {
  title: "მენოპაუზის შეფასების ხელსაწყო",
  subtitle: "მენოპაუზის სტატუსის კომპლექსური შეფასება კლინიკური სიმპტომებისა და ბიომარკერების გამოყენებით",
  
  // Sections
  sections_menstrualHistory: "მენსტრუალური ანამნეზი",
  sections_vasomotorSymptoms: "ვაზომოტორული სიმპტომები", 
  sections_associatedSymptoms: "თანმხლები სიმპტომები",
  sections_laboratoryValues: "ლაბორატორიული მაჩვენებლები (არასავალდებულო)",

  // Form fields
  fields_age: "ასაკი (წლები) *",
  fields_lastMenstrualPeriod: "ბოლო მენსტრუაცია *",
  fields_menstrualPattern: "მენსტრუალური ციკლი",
  fields_hotFlashFrequency: "ჰოტ ფლეშების სიხშირე დღეში *",
  fields_vasomotorSymptomSeverity: "ვაზომოტორული სიმპტომების სიმძიმე",
  fields_fsh: "FSH (mIU/mL)",
  fields_estradiol: "ესტრადიოლი (pg/mL)",

  // Placeholders
  placeholders_age: "მაგ., 48",
  placeholders_hotFlashFrequency: "მაგ., 5",
  placeholders_fsh: "მაგ., 35",
  placeholders_estradiol: "მაგ., 15",

  // Descriptions
  descriptions_fsh: "ფოლიკულისტიმულირებადი ჰორმონი",
  descriptions_estradiol: "ესტრადიოლის დონე",

  // Options - Menstrual Pattern
  options_menstrualPattern_regular: "რეგულარული (ყოველთვიური ციკლები)",
  options_menstrualPattern_irregular: "არარეგულარული (ცვალებადი ციკლის ხანგრძლივობა)", 
  options_menstrualPattern_absent: "არ არის (მენსტრუაცია არ ყოფილა > 3 თვე)",

  // Options - Vasomotor Symptoms
  options_vasomotorSymptoms_none: "არ არის",
  options_vasomotorSymptoms_mild: "მსუბუქი (მინიმალური ჩარევა)",
  options_vasomotorSymptoms_moderate: "ზომიერი (გარკვეული ჩარევა)",
  options_vasomotorSymptoms_severe: "მძიმე (მნიშვნელოვანი ჩარევა)",

  // Symptoms
  symptoms_sleepDisturbance_label: "ძილის დარღვევა",
  symptoms_sleepDisturbance_description: "ძილის დაწყება ან შენარჩუნება რთულია",
  symptoms_moodChanges_label: "ხასიათის ცვლილება",
  symptoms_moodChanges_description: "გაღიზიანება, შფოთვა ან დეპრესია",
  symptoms_vaginalDryness_label: "ვაგინალური სისხლძარღვა",
  symptoms_vaginalDryness_description: "სასქესო-შარდმდენი სიმპტომები",

  // Buttons
  buttons_assess: "მენოპაუზის სტატუსის შეფასება",

  // Validation
  validation_ageRequired: "ასაკი აუცილებელია",
  validation_ageRange: "ასაკი უნდა იყოს 35-70 წლის შორის",
  validation_lastMenstrualPeriodRequired: "ბოლო მენსტრუაციის თარიღი აუცილებელია",
  validation_hotFlashFrequencyRequired: "ჰოტ ფლეშების სიხშირე აუცილებელია",
  validation_hotFlashFrequencyRange: "ჰოტ ფლეშების სიხშირე უნდა იყოს 0-50-ს შორის დღეში",

  // Errors
  errors_calculationFailed: "გამოთვლა ვერ მოხერხდა",

  // Coming Soon
  comingSoon_title: "მალე იქნება",
  comingSoon_description: "ეს კალკულატორი ამჟამად მუშავდება.",
  comingSoon_details: "მენოპაუზის სტატუსის კომპლექსური შეფასება და მკურნალობის რეკომენდაციები მალე იქნება ხელმისაწვდომი.",

  // About
  about_title: "მენოპაუზის შეფასების შესახებ",
  
  // Clinical Purpose
  about_clinicalPurpose_title: "კლინიკური დანიშნულება",
  about_clinicalPurpose_description1: "მენოპაუზის შეფასების ხელსაწყო აფასებს მენოპაუზის სტატუსს და სიმპტომების სიმძიმეს, რათა მიუთითოს შესაბამისი მკურნალობა და ცხოვრების წესის ცვლილებები ქალებისთვის შუალედურ გარდამავალ პერიოდში.",
  about_clinicalPurpose_description2: "ეს შეფასება ეხმარება კლინიცისტებს განსაზღვრონ მენოპაუზის სიმპტომების და გრძელვადიანი ჯანმრთელობის ოპტიმიზაციის ყველაზე შესაბამისი მართვის სტრატეგიები.",

  // Stages
  about_stages_premenopausal_title: "პრემენოპაუზალური",
  about_stages_premenopausal_features_regularCycles: "რეგულარული ციკლები",
  about_stages_premenopausal_features_normalHormones: "ნორმალური ჰორმონების დონე",
  about_stages_premenopausal_features_minimalSymptoms: "მინიმალური სიმპტომები",
  about_stages_premenopausal_features_reproductivePotential: "რეპროდუქციული პოტენციალი",

  about_stages_perimenopausal_title: "პერიმენოპაუზალური",
  about_stages_perimenopausal_features_irregularCycles: "არარეგულარული ციკლები",
  about_stages_perimenopausal_features_fluctuatingHormones: "ცვალებადი ჰორმონები",
  about_stages_perimenopausal_features_vasomotorSymptoms: "ვაზომოტორული სიმპტომები",
  about_stages_perimenopausal_features_variableDuration: "ცვალებადი ხანგრძლივობა",

  about_stages_postmenopausal_title: "პოსტმენოპაუზალური",
  about_stages_postmenopausal_features_noPeriods: "მენსტრუაცია არ ყოფილა > 12 თვე",
  about_stages_postmenopausal_features_lowEstrogen: "დაბალი ესტროგენის დონე",
  about_stages_postmenopausal_features_stableHormones: "სტაბილური ჰორმონალური მდგომარეობა",
  about_stages_postmenopausal_features_longTermHealth: "გრძელვადიან ჯანმრთელობაზე ფოკუსი",

  // Symptoms
  about_symptoms_title: "ყველაზე ხშირი სიმპტომები",
  about_symptoms_vasomotor_title: "ვაზომოტორული სიმპტომები",
  about_symptoms_vasomotor_hotFlashes: "ჰოტ ფლეშები",
  about_symptoms_vasomotor_nightSweats: "ღამის ოფლიანობა",
  about_symptoms_vasomotor_palpitations: "გულისცემა",
  about_symptoms_vasomotor_chills: "შეცივნება",

  about_symptoms_other_title: "სხვა სიმპტომები",
  about_symptoms_other_sleepDisturbances: "ძილის დარღვევები",
  about_symptoms_other_moodChanges: "ხასიათის ცვლილებები",
  about_symptoms_other_vaginalDryness: "ვაგინალური სიმშრალე",
  about_symptoms_other_cognitiveChanges: "კოგნიტური ცვლილებები",

  // Management
  about_management_title: "მართვის სტრატეგიები",
  about_management_hormoneTherapy_title: "ჰორმონალური თერაპია",
  about_management_hormoneTherapy_systemicEstrogen: "სისტემური ესტროგენული თერაპია",
  about_management_hormoneTherapy_combinedTherapy: "კომბინირებული ესტროგენ-პროგესტინი",
  about_management_hormoneTherapy_localVaginal: "ლოკალური ვაგინალური თერაპია",
  about_management_hormoneTherapy_riskBenefit: "რისკ-სარგებლის შეფასება",

  about_management_nonHormonal_title: "არაჰორმონალური ვარიანტები",
  about_management_nonHormonal_ssriSnri: "SSRI/SNRI ჰოტ ფლეშებისთვის",
  about_management_nonHormonal_gabapentin: "გაბაპენტინი ღამის ოფლიანობისთვის",
  about_management_nonHormonal_cbt: "კოგნიტურ-ქცევითი თერაპია",
  about_management_nonHormonal_lifestyle: "ცხოვრების წესის მოდიფიკაცია",

  // Laboratory
  about_laboratory_title: "ლაბორატორიული შეფასება",
  about_laboratory_recommendedTests_title: "რეკომენდებული ტესტები",
  about_laboratory_recommendedTests_fsh: "FSH (ჩვენების მიხედვით)",
  about_laboratory_recommendedTests_estradiol: "ესტრადიოლი",
  about_laboratory_recommendedTests_tsh: "TSH",
  about_laboratory_recommendedTests_lipidProfile: "ლიპიდური პროფილი",

  about_laboratory_typicalValues_title: "ტიპიური მაჩვენებლები",
  about_laboratory_typicalValues_postmenopausalFsh: "პოსტმენოპაუზალური FSH > 25",
  about_laboratory_typicalValues_estradiol: "ესტრადიოლი < 30 pg/mL",
  about_laboratory_typicalValues_variablePerimenopausal: "ცვალებადი პერიმენოპაუზაში",
  about_laboratory_typicalValues_clinicalDiagnosis: "კლინიკური დიაგნოზი პირველადია",

  // Guidelines
  about_guidelines_title: "კლინიკური გაიდლაინები",
  about_guidelines_nams_title: "NAMS პოზიციის განცხადებები",
  about_guidelines_nams_description: "მენოპაუზის ჰორმონალური თერაპია",
  about_guidelines_acog_title: "ACOG პრაქტიკული ბიულეტენი",
  about_guidelines_acog_description: "მენოპაუზის სიმპტომების მართვა",
  about_guidelines_ims_title: "IMS რეკომენდაციები",
  about_guidelines_ims_description: "გლობალური კონსენსუსი მენოპაუზაზე",
  about_guidelines_endocrine_title: "ენდოკრინული საზოგადოება",
  about_guidelines_endocrine_description: "პოსტმენოპაუზალური ჰორმონალური თერაპია",
  about_guidelines_rcog_title: "RCOG გაიდლაინები",
  about_guidelines_rcog_description: "მენოპაუზის მართვა"
};