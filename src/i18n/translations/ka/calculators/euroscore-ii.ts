export default {
  title: 'EuroSCORE II რისკის კალკულატორი',
  subtitle: 'ევროპული კარდიოქირურგიული რისკის შეფასების სისტემა • ვერსია 2 • 30-დღიანი მოკვდაობის პროგნოზირება',
  description: 'განახლებული ევროპული კარდიოქირურგიული რისკის შეფასების სისტემა, რომელიც უზრუნველყოფს 30-დღიანი მოკვდაობის პროგნოზირებას. ვალიდირებულია ევროპულ ცენტრებში გაუმჯობესებული კალიბრაციით ორიგინალურ EuroSCORE მოდელთან შედარებით.',
  
  // Validation messages
  validation: {
    age_required: 'ასაკი აუცილებელია',
    age_range: 'ასაკი უნდა იყოს 18-დან 120 წლამდე',
    gender_required: 'სქესი აუცილებელია',
    urgency_required: 'სასწრაფოება აუცილებელია',
    nyha_required: 'NYHA კლასი აუცილებელია',
    procedure_weight_required: 'პროცედურის წონა/სირთულე აუცილებელია',
    creatinine_required: 'კრეატინინი აუცილებელია',
    creatinine_range: 'კრეატინინი უნდა იყოს 0.5-დან 15 მგ/დლ-მდე'
  },
  
  // Alert section
  alert_title: 'EuroSCORE II - ევროპული კარდიოქირურგიული რისკის მოდელი',
  alert_description: 'განახლებული ევროპული კარდიოქირურგიული რისკის შეფასების სისტემა, რომელიც უზრუნველყოფს 30-დღიანი მოკვდაობის პროგნოზირებას. ვალიდირებულია ევროპულ ცენტრებში გაუმჯობესებული კალიბრაციით ორიგინალურ EuroSCORE მოდელთან შედარებით.',
  alert_validation: 'Nashef და სხვები - ევროპული ვალიდაცია - განახლებული ალგორითმი',
  
  // Progress steps
  step_patient_factors: 'პაციენტის ფაქტორები',
  step_cardiac_status: 'გულის მდგომარეობა',
  step_operative_factors: 'ოპერაციული ფაქტორები',
  step_procedures: 'პროცედურები',
  
  // Section headers
  section_patient_demographics: 'პაციენტის დემოგრაფია და ძირითადი ფაქტორები',
  section_patient_description: 'პაციენტის ძირითადი მახასიათებლები და ლაბორატორიული მნიშვნელობები',
  section_cardiac_factors: 'გულთან დაკავშირებული ფაქტორები',
  section_cardiac_description: 'გულის ანამნეზი, სიმპტომები და ფუნქციური მდგომარეობა',
  section_operative_factors: 'ოპერაციული ფაქტორები',
  section_operative_description: 'პროცედურის სირთულე და კრიტიკული პრეოპერაციული მდგომარეობები',
  section_valve_procedures: 'სარქვლოვანი პროცედურები',
  section_specific_cardiac_procedures: 'სპეციფიკური გულის პროცედურები',
  section_specific_procedures_description: 'ინდივიდუალური სარქვლოვანი და ქირურგიული პროცედურების სპეციფიკაციები',
  
  // Demographics fields
  age_label: 'ასაკი',
  age_placeholder: '65',
  age_unit: 'წელი',
  gender_label: 'სქესი',
  gender_placeholder: 'აირჩიეთ სქესი...',
  gender_male: 'მამრობითი',
  gender_female: 'მდედრობითი',
  creatinine_label: 'შრატის კრეატინინი',
  creatinine_placeholder: '1.0',
  creatinine_unit: 'მგ/დლ',
  
  // Additional risk factors section
  additional_risk_factors: 'დამატებითი პაციენტის რისკის ფაქტორები',
  poor_mobility_label: 'გაუარესებული მობილობა',
  poor_mobility_description: 'გაუარესებული მობილობა ყოველდღიური აქტივობების დროს',
  diabetes_insulin_label: 'შაქრიანი დიაბეტი ინსულინზე',
  diabetes_insulin_description: 'შაქრიანი დიაბეტი ინსულინური თერაპიის საჭიროებით',
  chronic_pulmonary_label: 'ქრონიკული ფილტვის დაავადება',
  chronic_pulmonary_description: 'COPD ან სხვა ქრონიკული ფილტვის მდგომარეობები',
  pvd_label: 'პერიფერიული სისხლძარღვოვანი დაავადება',
  pvd_description: 'პერიფერიული არტერიული დაავადება ან კლაუდიკაცია',
  
  // NYHA and cardiac factors
  nyha_label: 'NYHA ფუნქციური კლასი',
  nyha_placeholder: 'აირჩიეთ NYHA კლასი...',
  nyha_class_1: 'კლასი I - სიმპტომები არ არის',
  nyha_class_2: 'კლასი II - მცირე შეზღუდვა',
  nyha_class_3: 'კლასი III - მნიშვნელოვანი შეზღუდვა',
  nyha_class_4: 'კლასი IV - მძიმე შეზღუდვა',
  nyha_description: 'ნიუ-იორკის გულის ასოციაციის ფუნქციური კლასიფიკაცია',
  nyha_class_1_full: 'კლასი I: სიმპტომები არ არის ზომიერ ფიზიკურ დატვირთვაზე',
  nyha_class_2_full: 'კლასი II: სიმპტომები ზომიერ ფიზიკურ დატვირთვაზე',
  nyha_class_3_full: 'კლასი III: სიმპტომები მცირე ფიზიკურ დატვირთვაზე',
  nyha_class_4_full: 'კლასი IV: სიმპტომები მოსვენების დროს',
  nyha_class_1_description: 'ფიზიკური აქტივობის შეზღუდვა არ არის',
  nyha_class_2_description: 'ფიზიკური აქტივობის მცირე შეზღუდვა',
  nyha_class_3_description: 'ფიზიკური აქტივობის მნიშვნელოვანი შეზღუდვა',
  nyha_class_4_description: 'ყოველგვარი ფიზიკური აქტივობის გარეშე დისკომფორტის გარეშე ვერ ახერხებს',
  
  urgency_label: 'სასწრაფოება',
  urgency_placeholder: 'აირჩიეთ სასწრაფოების დონე...',
  urgency_elective: 'ჩვეულებრივი',
  urgency_urgent: 'სასწრაფო',
  urgency_emergency: 'გადაუდებელი',
  
  // Cardiac conditions
  cardiac_history_title: 'გულის ანამნეზი და მდგომარეობები',
  recent_mi_label: 'ბოლოდროინდელი MI (90 დღის განმავლობაში)',
  recent_mi_description: 'მიოკარდიუმის ინფარქტი 90 დღის განმავლობაში',
  unstable_angina_label: 'არასტაბილური ანგინა',
  unstable_angina_description: 'მოსვენების ანგინა IV ნიტრატების საჭიროებით',
  pulmonary_hypertension_label: 'ფილტვის ჰიპერტენზია',
  pulmonary_hypertension_description: 'სისტოლური PA წნევა > 60 მმ ვარდ.სვ.',
  extracardiac_arteriopathy_label: 'ექსტრაკარდიული არტერიოპათია',
  extracardiac_arteriopathy_description: 'კლაუდიკაცია, კაროტიდული ოკლუზია, ან ინსულტი',
  neurological_dysfunction_label: 'ნევროლოგიური დისფუნქცია',
  neurological_dysfunction_description: 'დაავადება რომელიც მძიმედ აზიანებს მოძრაობას ან ყოველდღიურ ფუნქციონირებას',
  previous_cardiac_surgery_label: 'ადრინდელი გულის ქირურგია',
  previous_cardiac_surgery_description: 'ადრინდელი გულის ქირურგიული პროცედურა',
  active_endocarditis_label: 'აქტიური ენდოკარდიტი',
  active_endocarditis_description: 'პაციენტი ჯერ კიდევ იღებს ანტიბიოტიკურ მკურნალობას ენდოკარდიტისთვის',
  
  // Operative factors
  procedure_weight_label: 'პროცედურის წონა/სირთულე',
  procedure_weight_placeholder: 'აირჩიეთ პროცედურის სირთულე...',
  procedure_weight_low: 'დაბალი სირთულე (მხოლოდ CABG, ერთი სარქველი)',
  procedure_weight_medium: 'საშუალო სირთულე (CABG + სარქველი, ორმაგი სარქველი)',
  procedure_weight_high: 'მაღალი სირთულე (მრავალი პროცედურა, რთული რეპარაცია)',
  
  critical_preoperative_label: 'კრიტიკული პრეოპერაციული მდგომარეობა',
  critical_preoperative_description: 'ვენტრიკულური ტაქიკარდია ან ვენტრიკულური ფიბრილაცია ან შეწყვეტილი უეცარი სიკვდილი, პრეოპერაციული გულის მასაჟი, პრეოპერაციული ვენტილაცია ანესთეზიის ოთახამდე, პრეოპერაციული ინოტროპული მხარდაჭერა, ინტრა-აორტული ბალონური კონტრაპულსაცია ან პრეოპერაციული მწვავე თირკმლის უკმარისობა (ანურია ან ოლიგურია < 10 მლ/საათი)',
  
  critical_conditions_header: 'კრიტიკული პრეოპერაციული მდგომარეობები',
  
  // Procedure complexity info box
  complexity_info_title: 'EuroSCORE II პროცედურის სირთულე',
  complexity_low_info: '• დაბალი: ერთი სარქვლის ჩანაცვლება, მხოლოდ CABG',
  complexity_medium_info: '• საშუალო: CABG + სარქველი, ორმაგი სარქვლოვანი პროცედურები',
  complexity_high_info: '• მაღალი: მრავალი სარქველი + CABG, რთული აორტული ქირურგია, საგადარებო პროცედურები',
  
  // Valve procedures
  aortic_surgery_label: 'აორტული ქირურგია',
  aortic_surgery_description: 'აორტული სარქვლის ჩანაცვლება ან რეპარაცია',
  mitral_surgery_label: 'მიტრალური ქირურგია',
  mitral_surgery_description: 'მიტრალური სარქვლის ჩანაცვლება ან რეპარაცია',
  tricuspid_surgery_label: 'ტრიკუსპიდალური ქირურგია',
  tricuspid_surgery_description: 'ტრიკუსპიდალური სარქვლის ჩანაცვლება ან რეპარაცია',
  pulmonary_surgery_label: 'ფილტვის სარქვლის ქირურგია',
  pulmonary_surgery_description: 'ფილტვის სარქვლის ჩანაცვლება ან რეპარაცია',
  
  // Risk assessment info
  risk_assessment_title: 'EuroSCORE II რისკის შეფასება',
  risk_assessment_complexity: '• ყოველი სპეციფიკური პროცედურა ამატებს საერთო ქირურგიულ სირთულეს',
  risk_assessment_multiple: '• მრავალი სარქვლოვანი პროცედურა მნიშვნელოვნად ზრდის ოპერაციულ რისკს',
  risk_assessment_combined: '• განიხილეთ კომბინირებული პროცედურები საბოლოო რისკის გამოთვლისას',
  
  // Navigation buttons
  next_cardiac_status: 'შემდეგი: გულის მდგომარეობა',
  next_operative_factors: 'შემდეგი: ოპერაციული ფაქტორები',
  next_specific_procedures: 'შემდეგი: სპეციფიკური პროცედურები',
  back_button: 'უკან',
  calculate_euroscore_ii: 'EuroSCORE II-ის გამოთვლა',
  
  // Results section
  results_title: 'EuroSCORE II შეფასების შედეგები',
  mortality_risk_30day: '30-დღიანი მოკვდაობის რისკი',
  predicted_mortality: 'პროგნოზირებული 30-დღიანი მოკვდაობა',
  risk_stratification: 'EuroSCORE II რისკის სტრატიფიკაცია',
  
  // Risk categories and interpretations
  risk_low: 'დაბალი რისკი',
  risk_intermediate: 'საშუალო',
  risk_high: 'მაღალი რისკი',
  risk_very_high: 'ძალიან მაღალი',
  
  mortality_low: '< 2% მოკვდაობა',
  mortality_intermediate: '2-5% მოკვდაობა',
  mortality_high: '5-10% მოკვდაობა',
  mortality_very_high: '> 10% მოკვდაობა',
  
  interpretation_low: 'დაბალი ოპერაციული რისკი (EuroSCORE II <2%)',
  interpretation_intermediate: 'საშუალო ოპერაციული რისკი (EuroSCORE II 2-5%)',
  interpretation_high: 'მაღალი ოპერაციული რისკი (EuroSCORE II 5-10%)',
  interpretation_very_high: 'ძალიან მაღალი ოპერაციული რისკი (EuroSCORE II >10%)',
  
  // STS Comparison
  sts_comparison_title: 'STS რისკის მოდელებთან შედარება',
  sts_comparison_low: 'ზოგადად კორელირებს STS დაბალ რისკთან (<2%). ორივე მოდელი მხარს უჭერს სტანდარტულ ქირურგიულ მიდგომას.',
  sts_comparison_intermediate: 'STS საშუალო რისკის მსგავსი (2-5%). გაძლიერებული მონიტორინგი და ოპტიმიზაცია რეკომენდირებულია.',
  sts_comparison_high: 'STS მაღალ რისკთან შედარებადი (5-10%). განიხილეთ გულის გუნდის შეფასება და ალტერნატივები.',
  sts_comparison_very_high: 'STS ძალიან მაღალ რისკთან შესაბამისი (>10%). ძლიერი მიზეზი არაქირურგიული ვარიანტებისთვის.',
  sts_comparison_default: 'რისკის შეფასების შედარება STS მოდელებთან რეკომენდირებულია.',
  
  // Clinical recommendations
  clinical_recommendations: 'კლინიკური მართვის რეკომენდაციები',
  
  // Base recommendations
  recommendation_team_evaluation: 'მულტიდისციპლინარული გულის გუნდის შეფასება',
  recommendation_preop_optimization: 'პრეოპერაციული ოპტიმიზაცია როგორც ნაჩვენებია',
  recommendation_counseling: 'პაციენტისა და ოჯახის კონსულტაცია რისკებზე',
  
  // Low risk recommendations
  recommendation_standard_approach: 'სტანდარტული ქირურგიული მიდგომა მისაღებია',
  recommendation_fast_track: 'განიხილეთ სწრაფი ტრეკის პროტოკოლები',
  recommendation_routine_care: 'რუტინული პოსტოპერაციული მზრუნველობა',
  
  // Intermediate risk recommendations
  recommendation_enhanced_assessment: 'გაძლიერებული პრეოპერაციული შეფასება',
  recommendation_additional_imaging: 'განიხილეთ დამატებითი ვიზუალიზაციის კვლევები',
  recommendation_standard_icu: 'სტანდარტული ICU მონიტორინგი',
  recommendation_risk_modification: 'რისკის ფაქტორების მოდიფიკაციის განხილვა',
  
  // High risk recommendations
  recommendation_alternative_approaches: 'განიხილეთ ალტერნატიული მიდგომები (TAVI, მედიკამენტური თერაპია)',
  recommendation_extensive_optimization: 'ვრცელი პრეოპერაციული ოპტიმიზაცია',
  recommendation_extended_icu: 'გახანგრძლივებული ICU მონიტორინგი დაგეგმილია',
  recommendation_informed_consent: 'დეტალური ინფორმირებული თანხმობის განხილვა',
  recommendation_less_invasive: 'განიხილეთ ნაკლებად ინვაზიური ალტერნატივები',
  
  // Very high risk recommendations
  recommendation_non_surgical: 'მტკიცედ განიხილეთ არაქირურგიული ალტერნატივები',
  recommendation_palliative_care: 'პალიატიური მკურნალობის კონსულტაცია',
  recommendation_goals_care: 'მკურნალობის მიზნების განხილვა',
  recommendation_high_risk_protocols: 'თუ ქირურგია იხმარება, მაღალი რისკის პროტოკოლები',
  recommendation_transcatheter: 'განიხილეთ ტრანსკათეტერული მიდგომები',
  recommendation_family_meeting: 'ოჯახური შეხვედრა აუცილებელია',
  
  // Validation status
  validation_status_title: 'EuroSCORE II ვალიდაციის სტატუსი',
  validation_status_text: '✓ ევროპული ვალიდაცია • Nashef და სხვები 2012 • განახლებული ალგორითმი • გაუმჯობესებული კალიბრაცია',
  
  // Action buttons
  new_assessment: 'ახალი შეფასება',
  modify_inputs: 'შესატანი მონაცემების შეცვლა',
  calculate_button: 'EuroSCORE II-ის გამოთვლა',
  new_assessment_button: 'ახალი შეფასება',
  modify_inputs_button: 'შესატანი მონაცემების შეცვლა',
  
  // Results display labels
  mortality_risk_title: '30-დღიანი მოკვდაობის რისკი',
  risk_stratification_title: 'EuroSCORE II რისკის სტრატიფიკაცია',
  clinical_recommendations_title: 'კლინიკური მართვის რეკომენდაციები',
  predicted_mortality_label: 'პროგნოზირებული 30-დღიანი მოკვდაობა',
  risk_label: 'რისკი',
  
  // Risk category labels for display
  low_risk_label: 'დაბალი რისკი',
  intermediate_risk_label: 'საშუალო რისკი',
  high_risk_label: 'მაღალი რისკი',
  very_high_risk_label: 'ძალიან მაღალი რისკი',
  
  // Risk category ranges
  low_risk_range: '< 2%',
  intermediate_risk_range: '2-5%',
  high_risk_range: '5-10%',
  very_high_risk_range: '> 10%',
  
  // Validation status
  validation_badge: 'ევროპული ვალიდაცია',
  footer_info: 'დაფუძნებულია EuroSCORE II Nashef და სხვების მიერ • მხოლოდ საგანმანათლებლო მიზნებისთვის',
  
  // Footer
  footer_text: 'დაფუძნებულია EuroSCORE II Nashef და სხვების მიერ • მხოლოდ საგანმანათლებლო მიზნებისთვის',
  european_validation: 'ევროპული ვალიდაცია',
  
  // Creator section
  creator: {
    title: 'შემქმნელის შესახებ',
    name: 'დოქტორი სამერ ა. მ. ნაშეფი',
    about: 'დოქტორი სამერ ა. მ. ნაშეფი, MB ChB, FRCS, PhD, არის კარდიოთორაკალური ქირურგი პაპვორთის საავადმყოფოში, კემბრიჯში, დიდ ბრიტანეთში.',
    research: 'დოქტორ ნაშეფის ძირითადი კვლევა ფოკუსირებულია წინაგულების ფიბრილაციაზე და რისკის სტრატიფიკაციაზე გულის ქირურგიაში.',
    view_publications: 'პუბლიკაციების ნახვა PubMed-ზე'
  },
  
  // Evidence section
  evidence: {
    title: 'მტკიცებულებები',
    formula_title: 'ფორმულა',
    coefficients_note: 'კოეფიციენტების ცხრილი',
    coefficients_description: 'EuroSCORE II მოდელი იყენებს პაციენტის მრავალ ფაქტორს, გულის და პროცედურულ ფაქტორებს კონკრეტული კოეფიციენტებით პროგნოზირებული მოკვდაობის რისკის გამოსათვლელად.',
    literature_title: 'ლიტერატურა',
    original_reference: 'ორიგინალური/პირველადი წყარო',
    validation_studies: 'ვალიდაცია'
  },
  
  validation_status_description: '✓ ევროპული ვალიდაცია • Nashef და სხვები 2012 • განახლებული ალგორითმი • გაუმჯობესებული კალიბრაცია',

  // Missing pulmonary artery pressure keys
  pa_pressure_label: 'ფილტვის არტერიის სისტოლური წნევა',
  pa_pressure_placeholder: 'აირჩიეთ PA წნევა...',
  pa_pressure_description: 'ფილტვის არტერიის სისტოლური წნევის გაზომვა',
  pa_pressure_normal: 'ნორმალური ფილტვის არტერიის წნევა',
  pa_pressure_mild: 'მსუბუქად მომატებული ფილტვის არტერიის წნევა',
  pa_pressure_severe: 'მკვეთრად მომატებული ფილტვის არტერიის წნევა',
  pa_pressure_lt31: '<31 მმ ვარდ.სვ.',
  pa_pressure_31_54: '31-54 მმ ვარდ.სვ.',
  pa_pressure_ge55: '≥55 მმ ვარდ.სვ.',

  // Missing CCS and detailed cardiac descriptions
  ccs_class4_label: 'CCS კლასი 4 ანგინა',
  ccs_class4_description: 'შეუძლებელია ყველა აქტივობის შესრულება ანგინის გარეშე ან ანგინა მოსვენების დროს',
  extracardiac_arteriopathy_description_detailed: '≥1: კლაუდიკაცია; კაროტიდული ოკლუზია ან >50% სტენოზი; ამპუტაცია არტერიული დაავადების გამო; ადრინდელი/დაგეგმილი ინტერვენცია მუცლის აორტაზე, ხელფეხის არტერიებზე ან კაროტიდებზე',
  previous_cardiac_surgery_description_detailed: '≥1 ადრინდელი მთავარი გულის ოპერაცია პერიკარდის გაღებით',
  active_endocarditis_description_detailed: 'ანტიბიოტიკები ენდოკარდიტისთვის ოპერაციის დროს',
  recent_mi_description_detailed: 'მიოკარდიუმის ინფარქტი ≤90 დღე ოპერაციამდე',

  // Missing urgency detailed descriptions
  urgency_description: 'ქირურგიული სასწრაფოების კლასიფიკაცია',
  urgency_elective_description: 'დაგეგმილი ქირურგია ოპტიმალური დროით',
  urgency_urgent_description: 'ქირურგია საჭიროა მიმდინარე ჰოსპიტალიზაციის დროს',
  urgency_emergency_description: 'ქირურგია საჭიროა 24 საათის განმავლობაში',
  urgency_salvage_description: 'პაციენტები რომლებიც საჭიროებენ CPR-ს ქირურგიამდე ან მის დროს',
  urgency_elective_full: 'ჩვეულებრივი: რუტინული მიღება ოპერაციისთვის',
  urgency_urgent_full: 'სასწრაფო: არ არის ჩვეულებრივად მიღებული მაგრამ საჭიროებს ქირურგიას მიმდინარე მიღებისას',
  urgency_emergency_full: 'გადაუდებელი: ოპერაცია შემდეგი სამუშაო დღის დაწყებამდე',
  urgency_salvage_full: 'გადარჩენა: პაციენტები რომლებიც საჭიროებენ CPR-ს OR-მდე მისვლისას ან ინდუქციამდე',

  // Missing critical preoperative state
  critical_preoperative_state_label: 'კრიტიკული პრეოპერაციული მდგომარეობა',
  critical_preoperative_state_description_detailed: '≥1: წამრუხი ტაქიკარდია ან ფიბრილაცია ან შეწყვეტილი უეცარი სიკვდილი; გულის მასაჟი; ვენტილაცია OR-ში ჩასვლამდე; ინოტროპები; IABP ან VAD OR-ში ჩასვლამდე; მწვავე თირკმლის უკმარისობა (ანურია ან ოლიგურია <10 მლ/სთ)',

  // Missing thoracic aorta
  thoracic_aorta_label: 'მკერდის აორტის ქირურგია',
  thoracic_aorta_description: 'ქირურგია რომელიც მოიცავს მკერდის აორტას',

  // Missing creatinine clearance fields
  creatinine_clearance_label: 'კრეატინინის კლირენსი (Cockcroft-Gault)',
  creatinine_clearance_placeholder: 'აირჩიეთ კრეატინინის კლირენსი...',
  creatinine_clearance_description: 'თირკმლის ფუნქციის შეფასება Cockcroft-Gault ფორმულით',
  creatinine_normal: 'ნორმალური თირკმლის ფუნქცია',
  creatinine_mild: 'მსუბუქად შემცირებული თირკმლის ფუნქცია',
  creatinine_moderate: 'ზომიერად ან მძიმედ შემცირებული თირკმლის ფუნქცია',
  creatinine_dialysis: 'პაციენტი საჭიროებს დიალიზის მკურნალობას',
  creatinine_clearance_gt85: '>85 მლ/წთ',
  creatinine_clearance_51_85: '51-85 მლ/წთ',
  creatinine_clearance_le50: '≤50 მლ/წთ',
  creatinine_clearance_dialysis: 'დიალიზზე (შრატის კრეატინინის მიუხედავად)',

  // Missing LV function fields
  lv_function_label: 'მარცხენა პარკუჭის ფუნქცია ან LVEF',
  lv_function_placeholder: 'აირჩიეთ მარცხენა პარკუჭის ფუნქცია...',
  lv_function_description: 'აირჩიეთ მარცხენა პარკუჭის განდევნის ფრაქციის კატეგორია',
  lv_function_good: 'კარგი (LVEF ≥51%)',
  lv_function_good_description: 'ნორმალური მარცხენა პარკუჭის სისტოლური ფუნქცია',
  lv_function_moderate: 'ზომიერი (LVEF 31-50%)',
  lv_function_moderate_description: 'მსუბუქად შემცირებული მარცხენა პარკუჭის ფუნქცია',
  lv_function_poor: 'ცუდი (LVEF 21-30%)',
  lv_function_poor_description: 'ზომიერად შემცირებული მარცხენა პარკუჭის ფუნქცია',
  lv_function_very_poor: 'ძალიან ცუდი (LVEF ≤20%)',
  lv_function_very_poor_description: 'მძიმედ შემცირებული მარცხენა პარკუჭის ფუნქცია',

  // Missing gender descriptions  
  gender_description: 'აირჩიეთ პაციენტის სქესი',
  gender_male_description: 'მამრობითი სქესის პაციენტი',
  gender_female_description: 'მდედრობითი სქესის პაციენტი',

  // Missing procedure weight fields
  weight_of_procedure_label: 'პროცედურის წონა',
  weight_of_procedure_placeholder: 'აირჩიეთ პროცედურის წონა...',
  procedure_complexity_classification: 'ქირურგიული სირთულის კლასიფიკაცია',
  isolated_cabg: 'იზოლირებული CABG',
  isolated_cabg_description: 'მხოლოდ კორონარული არტერიების შუნტირება',
  isolated_non_cabg: 'იზოლირებული არა-CABG მთავარი პროცედურა (მაგ. ერთი სარქველი)',
  isolated_non_cabg_description: 'ერთი მთავარი გულის პროცედურა CABG-ის გარდა',
  two_major: '2 მთავარი პროცედურა (მაგ. CABG და AVR)',
  two_major_description: 'ორი მთავარი გულის პროცედურა ერთად',
  three_plus_major: '≥3 მთავარი პროცედურა (მაგ. AVR, MVR და CABG)',
  three_plus_major_description: 'სამი ან მეტი მთავარი გულის პროცედურა',

  // Missing validation keys
  creatinine_clearance_required: 'კრეატინინის კლირენსი საჭიროა',
  lv_function_required: 'მარცხენა პარკუჭის ფუნქცია საჭიროა',
  pa_pressure_required: 'ფილტვის არტერიის წნევა საჭიროა',

  // Missing live risk preview
  live_risk_preview: 'რისკის პირდაპირი გადახედვა',
  updates_as_complete: 'განახლდება ფორმის შევსების პროცესში',

  // Missing progress indicators
  completion_progress: 'შევსების პროგრესი',
  sections_completed: 'სექცია დასრულებულია',
  patient_section: 'პაციენტი',
  cardiac_section: 'გული',
  operative_section: 'ოპერაციული',

  // Missing progress steps detailed
  patient_factors: 'პაციენტის ფაქტორები',
  cardiac_factors: 'გულის ფაქტორები', 
  operative_factors: 'ოპერაციული ფაქტორები',
  next_operative_factors_full: 'შემდეგი: ოპერაციული ფაქტორები',

  // Missing calculation messages
  calculating: 'რისკის შეფასების გამოთვლა',
  analyzing_patient_factors: 'პაციენტის რისკ-ფაქტორების ანალიზი...',
  calculating_cardiac_indices: 'გულის რისკის ინდექსების გამოთვლა...',
  applying_euroscore_algorithm: 'EuroSCORE II ალგორითმის გამოყენება...',
  generating_recommendations: 'კლინიკური რეკომენდაციების შედგენა...',
  initializing_assessment: 'შეფასების ინიციალიზაცია...',

  // Missing risk category full labels
  risk_low_full: 'დაბალი რისკი',
  risk_intermediate_full: 'საშუალო რისკი',
  risk_high_full: 'მაღალი რისკი',
  risk_very_high_full: 'ძალიან მაღალი რისკი',

  // Missing risk level descriptions
  good_surgical_candidate: 'კარგი ქირურგიული კანდიდატი',
  requires_careful_evaluation: 'საჭიროებს ფრთხილ შეფასებას',
  extensive_risk_benefit_analysis: 'საჭიროებს ისე რისკის და სარგებლის ანალიზს',

  // Missing results section detailed
  clinical_grade_assessment: 'კლინიკური ხარისხის შეფასება',
  risk_stratification_analysis: 'რისკის სტრატიფიკაციის ანალიზი',
  population_based_categorization: 'პოპულაციაზე დაფუძნებული კატეგორიზაცია',
  excellent_surgical_candidate: 'შესანიშნავი ქირურგიული კანდიდატი',
  moderate_surgical_risk: 'ზომიერი ქირურგიული რისკი',
  enhanced_perioperative_care: 'გაძლიერებული პერიოპერაციული მზრუნველობა',
  multidisciplinary_evaluation: 'მულტიდისციპლინური შეფასება',

  // Missing results subtitle
  results_subtitle: 'EuroSCORE II რისკის შეფასება • პროფესიონალური კლინიკური ანალიზი',

  // Missing comparative analysis
  comparative_risk_analysis: 'შედარებითი რისკის ანალიზი',
  euroscore_vs_population: 'EuroSCORE II vs პოპულაციური ნიშნები',
  risk_comparison_chart: 'რისკის შედარების დიაგრამა',
  mortality_risk_percent: '30-დღიანი მოკვდაობის რისკი (%)',
  population_average: 'პოპულაციის საშუალო',
  your_patient: 'თქვენი პაციენტი',
  low_risk_cohort: 'დაბალი რისკის ჯგუფი',
  high_risk_cohort: 'მაღალი რისკის ჯგუფი',

  // Missing risk model comparison
  risk_model_comparison: 'რისკის მოდელების შედარება',
  euroscore_ii_current: 'EuroSCORE II',
  current_label: 'მიმდინარე',
  sts_risk_score: 'STS რისკის ქულა',
  reference_label: 'სამიზნე',
  mortality_risk_result: '30-დღიანი მოკვდაობის რისკი',
  latest_european_algorithm: 'უახლესი ევროპული ალგორითმი (2012), დადასტურებული 22,381 პაციენტზე',
  north_american_standard: 'ჩრდილოეთ ამერიკის სტანდარტი, მკერდის ქირურგთა საზოგადოების მონაცემთა ბაზა',

  // Missing clinical significance
  clinical_significance: 'კლინიკური მნიშვნელობა',
  excellent_surgical_candidate_full: 'შესანიშნავი ქირურგიული კანდიდატი მინიმალური პერიოპერაციული რისკით',
  standard_surgical_risk: 'სტანდარტული ქირურგიული რისკი რომელიც საჭიროებს რუტინულ პერიოპერაციულ მონიტორინგს',
  elevated_risk_enhanced_care: 'მომატებული რისკი რომელიც საჭიროებს გაძლიერებულ პერიოპერაციულ მზრუნველობას და მონიტორინგს',
  high_risk_specialized_care: 'მაღალი რისკის პაციენტი რომელიც საჭიროებს სპეციალიზებულ მულტიდისციპლინურ მზრუნველობას',

  // Missing scientific foundation
  scientific_foundation: 'მეცნიერული საფუძველი',
  evidence_based_validation: 'მტკიცებულებაზე დაფუძნებული ალგორითმის ვალიდაცია',
  algorithm_validation: 'ალგორითმის ვალიდაცია',
  validated_on_patients: 'დადასტურებული 22,381 პაციენტზე',
  c_index_excellent: 'C-ინდექსი: 0.8095 (შესანიშნავი დისკრიმინაცია)',
  multiple_international_validations: 'მრავალი საერთაშორისო ვალიდაცია',
  key_validation_studies: 'ძირითადი ვალიდაციური კვლევები',
  original_development: 'ორიგინალური განვითარება (2012)',
  international_validation: 'საერთაშორისო ვალიდაცია (2013)',
  nashef_reference: 'Nashef SA, et al. EuroSCORE II. Eur J Cardiothorac Surg. 2012;41(4):734-44.',
  chalmers_reference: 'Chalmers J, et al. Validation of EuroSCORE II in a modern cohort. Eur J Cardiothorac Surg. 2013;43(4):688-94.',

  // Missing professional actions
  new_assessment_action: 'ახალი შეფასება',
  print_results: 'შედეგების დაბეჭდვა',

  // Missing formula text
  formula_prediction: 'პროგნოზირებული მოკვდაობა = e^y / (1 + e^y)',
  formula_where_y: 'სადაც y = -5.324537 + Σ βᵢxᵢ'
}; 