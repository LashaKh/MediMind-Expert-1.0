export default {
  title: 'MAGGIC რისკის კალკულატორი',
  subtitle: '1-წლიანი და 3-წლიანი სიკვდილობის პროგნოზი',
  description: 'გულის უკმარისობის რისკის შეფასების ვალიდური მოდელი',
  
  // Alert section
  alert_title: 'MAGGIC რისკის შეფასების ინსტრუმენტი',
  alert_description: 'მეტა-ანალიზი გლობალური ჯგუფისა ქრონიკული გულის უკმარისობისთვის (MAGGIC) რისკის კალკულატორი უზრუნველყოფს მტკიცებულებაზე დაფუძნებულ სიკვდილობის პროგნოზს ქრონიკული გულის უკმარისობიან პაციენტებისთვის.',
  
  // Step labels
  demographics_step: 'დემოგრაფია',
  clinical_step: 'კლინიკური შეფასება',
  therapy_step: 'თერაპიის შეფასება',
  
  // Section headers
  patient_demographics: 'პაციენტის დემოგრაფია',
  demographics_description: 'პაციენტის ძირითადი დემოგრაფიული და კლინიკური მახასიათებლები',
  clinical_assessment: 'კლინიკური შეფასება',
  clinical_description: 'მიმდინარე ვიტალური ნიშნები, ლაბორატორიული მნიშვნელობები და თანმხლები დაავადებების სტატუსი',
  therapy_assessment: 'მიმდინარე თერაპიის შეფასება',
  therapy_description: 'მიმდინარე გაიდლანებზე დაფუძნებული მედიკამენტური თერაპიის სტატუსი',
  
  // Demographics section
  age_label: 'ასაკი',
  age_placeholder: 'ჩაწერეთ ასაკი წლებში',
  gender_label: 'სქესი',
  gender_placeholder: 'აირჩიეთ სქესი',
  gender_male: 'მამრობითი',
  gender_female: 'მდედრობითი',
  
  // Form field labels
  lvef_label: 'მარცხენა პარკუჭის განდევნის ფრაქცია (LVEF)',
  lvef_placeholder: 'ჩაწერეთ LVEF პროცენტი',
  nyha_class_label: 'NYHA ფუნქციური კლასი',
  nyha_class_placeholder: 'აირჩიეთ NYHA კლასი',
  nyha_class_1: 'კლასი I - შეზღუდვის გარეშე',
  nyha_class_2: 'კლასი II - მცირე შეზღუდვა',
  nyha_class_3: 'კლასი III - გამოხატული შეზღუდვა',
  nyha_class_4: 'კლასი IV - მძიმე შეზღუდვა',
  systolic_bp_label: 'სისტოლური არტერიული წნევა',
  systolic_bp_placeholder: 'ჩაწერეთ სისტოლური არტერიული წნევა',
  bmi_label: 'სხეულის მასის ინდექსი (BMI)',
  bmi_placeholder: 'ჩაწერეთ BMI',
  creatinine_label: 'შრატის კრეატინინი',
  creatinine_placeholder: 'ჩაწერეთ კრეატინინის დონე',
  diabetes_label: 'შაქრიანი დიაბეტი',
  copd_label: 'ქრონიკული ობსტრუქციული ფილტვის დაავადება (COPD)',
  first_diagnosis_label: 'გულის უკმარისობის პირველი დიაგნოზი (18 თვის განმავლობაში)',
  beta_blocker_label: 'ბეტა-ბლოკატორი თერაპია',
  ace_inhibitor_label: 'ACE ინჰიბიტორი ან ARB თერაპია',
  
  // Button labels
  next_clinical_assessment: 'შემდეგი: კლინიკური შეფასება',
  next_therapy_assessment: 'შემდეგი: თერაპიის შეფასება',
  calculate_maggic_risk: 'MAGGIC რისკის გამოთვლა',
  calculate_button: 'MAGGIC რისკის გამოთვლა',
  new_assessment_button: 'ახალი შეფასება',
  
  // Validation messages
  validation_age_required: 'ასაკი აუცილებელია',
  validation_age_range: 'ასაკი უნდა იყოს 18-დან 100 წლამდე',
  validation_gender_required: 'სქესი აუცილებელია',
  validation_nyha_class: 'NYHA კლასი აუცილებელია',
  validation_lvef: 'LVEF უნდა იყოს 10%-დან 80%-მდე',
  validation_systolic_bp: 'სისტოლური არტერიული წნევა უნდა იყოს 70-დან 250 მმ ვარდ.სვ.-მდე',
  validation_bmi: 'BMI უნდა იყოს 15-დან 50 კგ/მ²-მდე',
  validation_creatinine: 'კრეატინინი უნდა იყოს 0,5-დან 10,0 მგ/დლ-მდე',
  
  // Results section
  results_title: 'MAGGIC რისკის შეფასების შედეგები',
  one_year_mortality: '1-წლიანი სიკვდილობის რისკი',
  three_year_mortality: '3-წლიანი სიკვდილობის რისკი',
  risk_stratification_title: 'რისკის სტრატიფიკაციის კატეგორიები',
  low_risk_category: 'დაბალი რისკი (<10% 1 წელი)',
  intermediate_risk_category: 'საშუალო რისკი (10-20% 1 წელი)',
  high_risk_category: 'მაღალი რისკი (20-35% 1 წელი)',
  very_high_risk_category: 'ძალიან მაღალი რისკი (>35% 1 წელი)',
  mortality_rates_note: '* სიკვდილობის მაჩვენებლები დაფუძნებულია MAGGIC კონსორციუმის მეტა-ანალიზზე >39,000 პაციენტისთვის',
  recommendations_title: 'კლინიკური მენეჯმენტის რეკომენდაციები',
  algorithm_validation_title: 'MAGGIC ალგორითმის ვალიდაცია',
  algorithm_validation_text: '✓ ვალიდირებული >39,000 HF პაციენტზე • მეტა-ანალიზისგან მიღებული • ყოვლისმომცველი რისკის შეფასება',
  
  // Risk interpretations
  interpretation_very_high: 'ძალიან მაღალი რისკი (>35% 1-წლიანი სიკვდილიანობა) - სპეციალიზებული მკურნალობა საჭიროა',
  
  // Clinical recommendations
  recommendation_optimal: 'ოპტიმალური მკურნალობა - სრული გაიდლაინ-განპირობებული თერაპია და რეგულარული მონიტორინგი',
  recommendation_intensive: 'ინტენსიური მკურნალობა - მაქსიმალური მედიკამენტური თერაპია და ხშირი შეფასება',
  recommendation_frequent_monitoring: 'ხშირი მონიტორინგი - რეგულარული კლინიკური შეფასება და ლაბორატორიული კონტროლი',
  recommendation_advanced_therapies: 'მოწინავე თერაპიული მეთოდები - განიხილეთ ICD, CRT ან გულის ტრანსპლანტაცია',
  
  // Badge for meta-analysis validation
  badge_meta_analysis: 'მეტა-ანალიზით ვალიდირებული - >39,000 პაციენტი',
  
  // About Creator section
  about_creator_title: 'შემქმნელის შესახებ',
  creator_name: 'დ-რი სტიუარტ პოკოკი',
  creator_description: 'სტიუარტ პოკოკი, PhD, არის სამედიცინო სტატისტიკის პროფესორი ლონდონის ჰიგიენისა და ტროპიკული მედიცინის სკოლაში. დ-რი პოკოკი არის რამდენიმე კვლევითი ჯგუფის დირექტორი, რომლებიც სწავლობენ ეპიდემიოლოგიასა და ფარმაკოეპიდემიოლოგიას. მან გამოაქვეყნა მრავალი სტატია მსხვილი კლინიკური კვლევებისთვის, რომლებიც მან ჩაატარა, განსაკუთრებით გულ-სისხლძარღვთა დაავადებების სფეროში.',
  view_publications: 'იხილეთ დ-რი სტიუარტ პოკოკის პუბლიკაციები',
  pubmed_link_text: 'PubMed',
  
  // Evidence section
  evidence_title: 'მტკიცებულებები',
  formula_title: 'ფორმულა',
  formula_description: 'შერჩეული ქულების დამატება.',
  facts_figures_title: 'ფაქტები და ციფრები',
  
  // Risk factor tables
  risk_factor_title: 'რისკის ფაქტორი',
  points_title: 'ქულები',
  
  // Basic risk factors
  male_factor: 'მამრობითი სქესი',
  smoker_factor: 'მწეველი',
  diabetic_factor: 'დიაბეტიკი',
  copd_factor: 'COPD',
  heart_failure_18_months: 'გულის უკმარისობის პირველი დიაგნოზი ≥18 თვის წინ',
  not_on_beta_blocker: 'ბეტა-ბლოკატორზე არ არის',
  not_on_ace_arb: 'ACE-I/ARB-ზე არ არის',
  
  // Ejection fraction ranges
  ejection_fraction_title: 'განდევნის ფრაქცია (EF)',
  ef_less_than_20: '<20',
  ef_20_24: '20-24',
  ef_25_29: '25-29',
  ef_30_34: '30-34',
  ef_35_39: '35-39',
  ef_40_plus: '≥40',
  
  // NYHA class
  nyha_class_title: 'NYHA კლასი',
  nyha_1: '1',
  nyha_2: '2',
  nyha_3: '3',
  nyha_4: '4',
  
  // Creatinine ranges
  creatinine_title: 'კრეატინინი*',
  creatinine_less_90: '<90',
  creatinine_90_109: '90-109',
  creatinine_110_129: '110-129',
  creatinine_130_149: '130-149',
  creatinine_150_169: '150-169',
  creatinine_170_209: '170-209',
  creatinine_210_249: '210-249',
  creatinine_250_plus: '≥250',
  
  // BMI ranges
  bmi_title: 'BMI',
  bmi_less_15: '<15',
  bmi_15_19: '15-19',
  bmi_20_24: '20-24',
  bmi_25_29: '25-29',
  bmi_30_plus: '≥30',
  
  // Systolic BP extra points for different EF ranges
  systolic_bp_ef_less_30_title: 'დამატებითი ქულები სისტოლური წნევისთვის (მმ ვარდ.სვ.) თუ EF <30',
  systolic_bp_ef_30_39_title: 'დამატებითი ქულები სისტოლური წნევისთვის (მმ ვარდ.სვ.) თუ EF 30-39',
  systolic_bp_ef_40_plus_title: 'დამატებითი ქულები სისტოლური წნევისთვის (მმ ვარდ.სვ.) თუ EF ≥40',
  
  // BP ranges
  bp_less_110: '<110',
  bp_110_119: '110-119',
  bp_120_129: '120-129',
  bp_130_139: '130-139',
  bp_140_149: '140-149',
  bp_150_plus: '≥150',
  
  // Age extra points for different EF ranges
  age_ef_less_30_title: 'დამატებითი ქულები ასაკისთვის (წლები) თუ EF <30',
  age_ef_30_39_title: 'დამატებითი ქულები ასაკისთვის (წლები) თუ EF 30-39',
  age_ef_40_plus_title: 'დამატებითი ქულები ასაკისთვის (წლები) თუ EF ≥40',
  
  // Age ranges
  age_less_55: '<55',
  age_55_59: '55-59',
  age_60_64: '60-64',
  age_65_69: '65-69',
  age_70_74: '70-74',
  age_75_79: '75-79',
  age_80_plus: '≥80',
  
  // Creatinine note
  creatinine_note: '*შენიშვნა: მიუხედავად იმისა, რომ ეს ქულა იყენებს კრეატინინს, როგორც თირკმლის ფუნქციის ინდიკატორს, eGFR ზოგადად ითვლება უფრო ზუსტ ინდიკატორად.',
  
  // Evidence Appraisal section
  evidence_appraisal_title: 'მტკიცებულებების შეფასება',
  evidence_appraisal_description: 'ქრონიკული გულის უკმარისობის მეტა-ანალიზის გლობალური ჯგუფის (MAGGIC) რისკის კალკულატორი შეიქმნა პოკოკისა და სხვების მიერ ხელმძღვანელი საერთაშორისო მკვლევარების ჯგუფის მიერ 39,372 პაციენტის მონაცემთა ბაზის საფუძველზე 30 კოჰორტული კვლევიდან (რომელთაგან 6 იყო რანდომიზებული კლინიკური კვლევები, რომლებიც მოიცავდა დაახლოებით 24,000 პაციენტს).',
  poisson_regression_description: 'პუაზონის რეგრესიის მოდელი აშენდა 13 რისკის ფაქტორის იდენტიფიკაციისთვის, რომლებიც ხელს უწყობენ გულის უკმარისობის პაციენტებში სიკვდილობას. დაკვირვებული და მოსალოდნელი 3-წლიანი სიკვდილობის მაჩვენებლების შედარება ყველა 30 კვლევაში აჩვენებს მისაღებ შესაბამისობას. ორი ცალკე მოდელი გამოიყენებოდა შენარჩუნებული წინააღმდეგ შემცირებული განდევნის ფრაქციისთვის (EF).',
  subsequent_study_description: 'მომდევნო კვლევა ფრიდისა და სხვების მიერ (2016) აჩვენა, რომ 308 პაციენტისთვის შენარჩუნებული EF-ით გულის უკმარისობით, მაღალი MAGGIC რისკის ქულა ასოცირდებოდა უფრო მეტ არახელსაყრელ მოვლენებთან.',
  validation_note: 'მონაცემები ჯერ კიდევ არ არის გარედან ვალიდირებული შემცირებული EF-ისთვის.',
  
  // Literature section
  literature_title: 'ლიტერატურა',
  original_reference_title: 'ორიგინალური/პირველადი წყარო',
  validation_title: 'ვალიდაცია',
  other_references_title: 'სხვა წყაროები',
  
  // Primary reference
  primary_reference_title: 'საკვლევი ნაშრომი',
  primary_reference_citation: 'Pocock SJ et al. Predicting survival in heart failure: a risk score based on 39 372 patients from 30 studies. Eur Heart J. 2013 May;34(19):1404-13. doi: 10.1093/eurheartj/ehs337. Epub 2012 Oct 24.',
  
  // Validation reference
  validation_reference_title: 'საკვლევი ნაშრომი',
  validation_reference_citation: 'Freed BH, Daruwalla V, Cheng JY, Aguilar FG, Beussink L, Choi A, Klein DA, Dixon D, Baldridge A, Rasmussen-Torvik LJ, Maganti K, Shah SJ. Prognostic Utility and Clinical Significance of Cardiac Mechanics in Heart Failure With Preserved Ejection Fraction: Importance of Left Atrial Strain. Circ Cardiovasc Imaging. 2016 Mar;9(3). pii: e003754. doi: 10.1161/CIRCIMAGING.115.003754.',
  
  // Other references
  other_reference_1_title: 'საკვლევი ნაშრომი',
  other_reference_1_citation: 'Meta-analysis Global Group in Chronic Heart Failure (MAGGIC). The survival of patients with heart failure with preserved or reduced left ventricular ejection fraction: an individual patient data meta-analysis. Eur Heart J. 2012 Jul;33(14):1750-7. doi: 10.1093/eurheartj/ehr254. Epub 2011 Aug 6.',
  
  other_reference_2_title: 'საკვლევი ნაშრომი',
  other_reference_2_citation: 'Nanayakkara S, Kaye DM. Management of heart failure with preserved ejection fraction: a review. Clin Ther. 2015 Oct 1;37(10):2186-98. doi: 10.1016/j.clinthera.2015.08.005. Epub 2015 Sep 16.',
  
  other_reference_3_title: 'საკვლევი ნაშრომი',
  other_reference_3_citation: 'Chapter 1: Definition and classification of CKD. Kidney Int Suppl (2011). 2013;3(1):19-62.',
  
  // Additional UI elements
  reset_calculator: 'კალკულატორის გადატვირთვა',
  about_title: 'MAGGIC კალკულატორის შესახებ',
  about_subtitle: 'MAGGIC რისკის მოდელის გაგება',
  about_description: 'MAGGIC რისკის კალკულატორი არის ვალიდირებული ინსტრუმენტი ქრონიკული გულის უკმარისობიანი პაციენტებისთვის სიკვდილობის რისკის პროგნოზირებისთვის. ეს კალკულატორი დაფუძნებულია ყოვლისმომცველ მეტა-ანალიზზე 30 კვლევიდან 39,000-ზე მეტი პაციენტისთვის.',
  feature_1: 'ვალიდირებული 30 კვლევიდან 39,372 პაციენტში',
  feature_2: 'პროგნოზირებს 1-წლიანი და 3-წლიანი სიკვდილობის რისკს',
  feature_3: 'ყოვლისმომცველი რისკ-ფაქტორების შეფასება',
  feature_4: 'მტკიცებულებაზე დაფუძნებული კლინიკური რეკომენდაციები',
  tables_title: 'რისკ-ფაქტორების ცხრილები',
  formula_note: 'ფორმულა დაფუძნებულია რისკ-ფაქტორების და პაციენტის მახასიათებლების ქულების შეკრებაზე',
  secondary_reference_title: 'მეორადი ცნობა',
  
  // Step labels
  step_1_label: 'ნაბიჯი 1',
  step_2_label: 'ნაბიჯი 2',
  step_3_label: 'ნაბიჯი 3',
  
  // UI labels
  diabetes_label_description: 'შაქრიანი დიაბეტის ისტორია',
  copd_label_description: 'ფილტვების ქრონიკული ობსტრუქციული დაავადება ან მძიმე ფილტვის დაავადება',
  smoker_label_text: 'მწეველი',
  smoker_label_description: 'მიმდინარე ან ყოფილი მწეველი',
  first_diagnosis_label_description: 'ქრონიკული გულის უკმარისობა (>18 თვის წინ)',
  
  // Ejection Fraction Table
  ef_title: 'ამოფრქვევითი ფრაქცია (%)',
  ef_less_20: '<20',
  
  // NYHA Class descriptions
  nyha_1_description: 'შეზღუდვის გარეშე',
  nyha_2_description: 'მცირე შეზღუდვა',
  nyha_3_description: 'მნიშვნელოვანი შეზღუდვა',
  nyha_4_description: 'მძიმე შეზღუდვა',
  
  // Research validation texts
  foundational_research: 'საფუძვლური კვლევა და ვალიდაციის კვლევები.',
  rigorous_validation: 'კოჰორტებისთვის მკაცრი ვალიდაცია'
}; 