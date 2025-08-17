export const bishopScoreCalculator = {
  title: 'ბიშოპის ქულის კალკულატორი',
  subtitle: 'საშვილოსნოს ყელის მზაობის შეფასება მშობიარობის ინდუქციისთვის',
  assessment_tool: 'შეფასების ინსტრუმენტი',
  tool_description: 'ბიშოპის ქულა არის საშვილოსნოს ყელის მზაობის შეფასების სტანდარტიზებული მეთოდი მშობიარობის ინდუქციისთვის, რომელიც აფასებს საშვილოსნოს ყელისა და ნაყოფის ხუთ ძირითად პარამეტრს ინდუქციის წარმატების ალბათობის პროგნოზირებისთვის.',
  based_on_bishop: 'დაფუძნებულია ბიშოპის (1964) მოდიფიცირებულ ქულების სისტემაზე',
  obstetric_safety_validated: 'მეან უსაფრთხოება დადასტურებულია',
  about_title: 'ბიშოპის ქულების შესახებ',
  
  // Form Labels and Help Text
  cervical_dilation_label: 'საშვილოსნოს ყელის გაშლა',
  cervical_dilation_unit: 'სმ',
  cervical_dilation_help: 'გაზომეთ საშვილოსნოს ყელის გაშლა სანტიმეტრებში (0-10 სმ)',
  cervical_dilation_error: 'გთხოვთ, შეიყვანოთ კორექტული გაშლა 0-10 სმ-ის შუალედში',
  
  cervical_effacement_label: 'საშვილოსნოს ყელის განცხილება',
  cervical_effacement_unit: '%',
  cervical_effacement_help: 'საშვილოსნოს ყელის გახდომის პროცენტი (0-100%)',
  cervical_effacement_error: 'გთხოვთ, შეიყვანოთ სწორი ყელის გაბრტყელების მაჩვენებელი 0-100%-ის შუალედში',
  
  cervical_consistency_label: 'საშვილოსნოს ყელის კონსისტენცია',
  cervical_consistency_help: 'საშვილოსნოს ყელის სიმტკიცის შეფასება პალპაციით',
  cervical_consistency_firm: 'მყარი',
  cervical_consistency_medium: 'საშუალო',
  cervical_consistency_soft: 'რბილი',
  
  cervical_position_label: 'საშვილოსნოს ყელის პოზიცია',
  cervical_position_help: 'საშვილოსნოს ყელის ანატომიური პოზიცია ნაყოფის თავის მიმართ',
  cervical_position_posterior: 'უკანა',
  cervical_position_mid: 'შუა პოზიცია',
  cervical_position_anterior: 'წინა',
  
  fetal_station_label: 'ნაყოფის სიმაღლე',
  fetal_station_help: 'ნაყოფის თავის პოზიცია მენჯის ძვლების მიმართ (-3-დან +3-მდე)',
  fetal_station_error: 'გთხოვთ, შეიყვანოთ კორექტული სიმაღლე -3-დან +3-მდე',
  
  // Sections
  cervical_assessment: 'საშვილოსნოს ყელის შეფასება',
  cervical_parameters_section: 'საშვილოსნოს ყელის პარამეტრები',
  cervical_parameters_description: 'შეაფასეთ საშვილოსნოს ყელის გაშლა, გაბრტყელება, კონსისტენცია და პოზიცია',
  
  // Scoring System
  scoring_system: 'ქულების სისტემა',
  clinical_assessment: 'კლინიკური შეფასება',
  position_assessment: 'პოზიციის შეფასება',
  
  // Results
  bishop_score_analysis: 'ბიშოპის ქულის ანალიზი',
  total_score: 'მთლიანი ქულა',
  induction_success: 'ინდუქციის წარმატება',
  labor_likelihood: 'მშობიარობის ალბათობა',
  cesarean_risk: 'საკეისროკვეთის რისკი',
  clinical_recommendation: 'კლინიკური რეკომენდაცია',
  evidence_base: 'მტკიცებულების ბაზა',
  
  // Buttons
  calculate_button: 'ბიშოპის ქულების გამოთვლა',
  new_assessment: 'ახალი შეფასება',
  modify_inputs: 'მონაცემების შეცვლა',
  
  // Hardcoded text replacements
  reference_text: 'საცნობარო ტექსტი',
  high_station: 'მაღალი დგომა',
  high_station_description_1: '-3, -2: 0 ქულა',
  high_station_description_2: 'თავი ზემოთ ძვლებზე',
  high_station_description_3: 'უფრო რთული მშობიარობა',
  
  mid_station: 'საშუალო სიმაღლე',
  mid_station_description_1: '-1: 1 ქულა',
  mid_station_description_2: 'თავი ახლოვდება ძვლებს',
  mid_station_description_3: 'ხელსაყრელი პოზიცია',
  
  low_station: 'დაბალი სიმაღლე',
  low_station_description_1: '0, +1, +2, +3: 2-3 ქულა',
  low_station_description_2: 'თავი ძვლების დონეზე ან ქვემოთ',
  low_station_description_3: 'ძალიან ხელსაყრელი',
  
  // Scoring descriptions
  dilation_score_0: 'დახურული (0 სმ): 0 ქულა',
  dilation_score_1: '1-2 სმ: 1 ქულა',
  dilation_score_2: '3-4 სმ: 2 ქულა',
  dilation_score_3: '≥5 სმ: 3 ქულა',
  
  effacement_score_0: '0-30%: 0 ქულა',
  effacement_score_1: '40-50%: 1 ქულა',
  effacement_score_2: '60-70%: 2 ქულა',
  effacement_score_3: '≥80%: 3 ქულა',
  
  consistency_descriptions_firm: 'მყარი: ცხვირის წვერის მსგავსი',
  consistency_descriptions_medium: 'საშუალო: ნიკაპის მსგავსი',
  consistency_descriptions_soft: 'რბილი: ტუჩებისა ან ყურის ბოლოს მსგავსი',
  
  position_descriptions_posterior: 'უკანა: საშვილოსნოს ყელი მიმართულია ზურგისკენ',
  position_descriptions_mid: 'შუა პოზიცია: საშვილოსნოს ყელი ნეიტრალურ პოზიციაშია',
  position_descriptions_anterior: 'წინა: საშვილოსნოს ყელი მიმართულია ბოქვენისკენ',
  
  cesarean_delivery_risk: 'საკეისრო კვეთის რისკი',
  
  // About page content
  scoring_parameters: 'შეფასების პარამეტრები',
  five_assessment_parameters: 'ხუთი შეფასების პარამეტრი:',
  cervical_dilation_points: 'საშვილოსნოს ყელის გაშლა (0-3 ქულა)',
  cervical_effacement_points: 'საშვილოსნოს ყელის განცხილება (0-3 ქულა)',
  cervical_consistency_points: 'საშვილოსნოს ყელის კონსისტენცია (0-2 ქულა)',
  cervical_position_points: 'საშვილოსნოს ყელის პოზიცია (0-2 ქულა)',
  fetal_station_points: 'ნაყოფის სიმაღლე (0-3 ქულა)',
  
  score_interpretation: 'ქულების ინტერპრეტაცია',
  induction_success_prediction: 'ინდუქციის წარმატების პროგნოზი:',
  score_unfavorable: 'ქულა ≤3: არახელსაყრელი ყელი',
  score_intermediate: 'ქულა 4-6: შუალედური წარმატება',
  score_favorable: 'ქულა 7-8: ხელსაყრელი ყელი',
  score_very_favorable: 'ქულა ≥9: ძალიან ხელსაყრელი ყელი',
  
  clinical_applications: 'კლინიკური გამოყენება',
  labor_induction_planning: 'მშობიარობის ინდუქციის დაგეგმვა',
  labor_induction_description: 'განსაზღვრავს მშობიარობის ინდუქციის ოპტიმალურ დროსა და მეთოდს საშვილოსნოს ყელის მზაობის საფუძველზე',
  delivery_planning: 'მშობიარობის დაგეგმვა',
  delivery_planning_description: 'ეხმარება პაციენტებს ვაგინალური მშობიარობის წარმატების ალბათობის შესახებ კონსულტაციაში',
  clinical_documentation: 'კლინიკური დოკუმენტაცია',
  clinical_documentation_description: 'სტანდარტიზებული შეფასების ინსტრუმენტი სამედიცინო დოკუმენტაციისა და ხარისხის მეტრიკებისთვის',
  
  professional_guidelines: 'პროფესიული მითითებები',
  acog_practice_bulletin: 'ACOG-ის პრაქტიკული ბიულეტენი №107: მშობიარობის ინდუქცია',
  maternal_fetal_medicine: 'დედის და ნაყოფის მედიცინის საზოგადოების რეკომენდაციები',
  validation_studies: 'ბიშოპის მოდიფიცირებული ქულების ვალიდაციის კვლევები',
  
  clinical_validation: 'კლინიკური ვალიდაცია',
  clinical_validation_description: 'ყოვლისმომცველად ვალიდირებული შეფასების სისტემა, რომელსაც აქვს დამტკიცებული პროგნოსტიკური სიზუსტე მშობიარობის ინდუქციის წარმატების მიმართ სხვადასხვა პაციენტთა ჯგუფებსა და კლინიკურ გარემოში.',
  
  clinical_considerations: 'კლინიკური მოსაზრებები',
  consideration_1: 'შეფასება უნდა ჩატარდეს გამოცდილი კლინიცისტების მიერ, რომლებიც იცნობენ საშვილოსნოს ყელის გამოკვლევის ტექნიკას',
  consideration_2: 'ქულების ინტერპრეტაცია უნდა გაითვალისწინებდეს პაციენტის ინდივიდუალურ ფაქტორებსა და კლინიკურ კონტექსტს',
  consideration_3: 'შესაძლოა საჭირო იყოს მრავალჯერადი შეფასება, რადგან საშვილოსნოს ყელის მდგომარეობა შეიძლება სწრაფად შეიცვალოს',
  consideration_4: 'ეს ინსტრუმენტი მხარს უჭერს, მაგრამ არ ანაცვლებს კლინიკურ განსჯას და პაციენტის ყოვლისმომცველ შეფასებას',
  
  // Station option labels
  station_high_label: 'მაღალი',
  station_mid_label: 'საშუალო',
  station_low_label: 'დაბალი',
  station_at_spines: 'ძვლების დონეზე',
  
  // Points indicators
  zero_points: '0 ქულა',
  one_point: '1 ქულა',
  two_points: '2 ქულა',
  three_points: '3 ქულა',

  // Service layer interpretations and recommendations
  interpretation_unfavorable: 'არახელსაყრელი საშვილოსნოს ყელი ინდუქციის ამარცხების მაღალი რისკით',
  interpretation_partially_favorable: 'ნაწილობრივ ხელსაყრელი საშვილოსნოს ყელი ინდუქციის ზომიერი წარმატების სიხშირით',
  interpretation_favorable: 'ხელსაყრელი საშვილოსნოს ყელი ინდუქციის კარგი წარმატების სიხშირით',
  interpretation_very_favorable: 'ძალიან ხელსაყრელი საშვილოსნოს ყელი ინდუქციის შესანიშნავი წარმატების სიხშირით',
  
  // Detailed Analysis label
  detailed_analysis: 'დეტალური ანალიზი',
  
  // Induction recommendations by score
  induction_recommendation_unfavorable: 'არახელსაყრელი საშვილოსნოს ყელი - განიხილეთ საშვილოსნოს ყელის მომწიფება ან ალტერნატიული მშობიარობის მეთოდი',
  induction_recommendation_partially: 'ნაწილობრივ ხელსაყრელი - სიფრთხილით და ყურადღებით მონიტორინგით',
  induction_recommendation_favorable: 'ხელსაყრელი საშვილოსნოს ყელი - სტანდარტული ინდუქციის პროტოკოლი სავარაუდოდ წარმატებული იქნება',
  induction_recommendation_very_favorable: 'ძალიან ხელსაყრელი საშვილოსნოს ყელი - წარმატებული ვაგინალური მშობიარობის მაღალი ალბათობა',
  
  // Individual recommendations
  rec_cervical_ripening_agents: 'განიხილეთ საშვილოსნოს ყელის მომწიფების საშუალებები ინდუქციამდე',
  rec_alternative_methods: 'ალტერნატიული მეთოდები: მექანიკური გაფართოება ან პროსტაგლანდინები',
  rec_discuss_risks_benefits: 'განიხილეთ ინდუქციის რისკები და სარგებელი კეისრიანი კვეთის წინააღმდეგ',
  rec_induction_caution: 'ინდუქცია შეიძლება სცადოთ სიფრთხილით',
  rec_cervical_ripening_unfavorable: 'განიხილეთ საშვილოსნოს ყელის მომწიფება არახელსაყრელი ნიშნების არსებობისას',
  rec_monitor_failed_induction: 'დააკვირდით ამარცხებული ინდუქციის ნიშნებს',
  rec_favorable_conditions: 'ხელსაყრელი პირობები შრომის ინდუქციისთვის',
  rec_standard_protocols: 'სტანდარტული ინდუქციის პროტოკოლები სავარაუდოდ წარმატებული იქნება',
  rec_institutional_guidelines: 'პროგრესის მონიტორინგი ინსტიტუციური გაიდლაინების მიხედვით',
  rec_continuous_monitoring: 'ინდუქციის დროს ნაყოფის უწყვეტი მონიტორინგი',
  rec_pain_management: 'ადეკვატური ტკივილის მართვის ვარიანტები',
  rec_delivery_plan: 'მშობიარობის მკაფიო გეგმა და კეისრიანი კვეთის სარეზერვო გეგმა',
  
  // References
  ref_acog_bulletin: 'ACOG პრაქტიკული ბიულეტენი #107: შრომის ინდუქცია',
  ref_bishop_original: 'Bishop EH. კუდის შეფასება ელექტიური ინდუქციისთვის. Obstet Gynecol. 1964;24:266-8',
  ref_who_recommendations: 'WHO რეკომენდაციები: შრომის ინდუქცია ვადაზე ან ვადის შემდეგ',
  ref_cochrane_review: 'კოქრეინის მიმოხილვა: შრომის ინდუქციის მექანიკური მეთოდები',
  
  // Result field labels (for UI display)
  bishop_score_label: 'ბიშოპის ქულა',
  induction_success_label: 'ინდუქციის წარმატება',
  cesarean_risk_label: 'საკეისრო კვეთის რისკი',
  
  // Induction success values
  unlikely: 'ნაკლებ სავარაუდო',
  possible: 'შესაძლო', 
  likely: 'სავარაუდო',
  very_likely: 'ძალიან სავარაუდო',
}; 