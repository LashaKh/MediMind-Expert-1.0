export const preeclampsiaRiskCalculator = {
  // Basic Information
  title: "პრეეკლამფსიის რისკის კალკულატორი",
  subtitle: "ორსულობის ადრეული პერიოდის პრეეკლამფსიის რისკის შეფასება",
  description: "მტკიცებულებაზე დაფუძნებული პრეეკლამფსიის რისკის შეფასება დედის ანამნეზის, კლინიკური ფაქტორების და ბიომარკერების გამოყენებით ადრეული იდენტიფიკაციისა და პრევენციული სტრატეგიებისთვის",
  acog_evidence_based: "ACOG-ის მტკიცებულებაზე დაფუძნებული რისკის შეფასება",
  tool_description: "პროფესიონალური პრეეკლამფსიის რისკის კალკულატორი, რომელიც იყენებს ვალიდირებულ სკრინინგის ალგორითმებს მაღალი რისკის ორსულობების იდენტიფიკაციისა და მიზნობრივი პრევენციისა და მონიტორინგისთვის.",
  acog_committee_reference: "ACOG კომიტეტის მოსაზრება #743 - დაბალი დოზის ასპირინის გამოყენება ორსულობის პერიოდში",
  
  // Clinical Purpose
  clinical_purpose: "კლინიკური მიზანი",
  clinical_purpose_description: "ეს კალკულატორი უზრუნველყოფს მტკიცებულებაზე დაფუძნებულ პრეეკლამფსიის რისკის შეფასებას ვალიდირებული სკრინინგის ალგორითმების გამოყენებით. იგი მიჰყვება ACOG კომიტეტის მოსაზრებას #743 და საერთაშორისო რეკომენდაციებს მაღალი რისკის ორსულობების ადრეული იდენტიფიკაციისა და მიზნობრივი დაბალი დოზის ასპირინით პროფილაქტიკისთვის.",
  
  // Risk Assessment Methods
  risk_methods: "რისკის შეფასების მეთოდები",
  multiple_risk_factors: "აირჩიეთ ყველა შესაბამისი რისკ-ფაქტორი ყოვლისმომცველი შეფასებისთვის",
  next_clinical_review: "შემდეგი: კლინიკური შეფასება",
  clinical_data_review: "კლინიკური მონაცემების მიმოხილვა",
  review_risk_parameters: "გადახედეთ თქვენს არჩეულ პარამეტრებს და გამოთვლილ რისკის შეფასებას",
  back: "უკან",
  calculate_risk: "პრეეკლამფსიის რისკის გამოთვლა",
  
  // Risk Categories
  high_risk_factors: "მაღალი რისკის ფაქტორები",
  moderate_risk_factors: "საშუალო რისკის ფაქტორები",
  low_risk_baseline: "დაბალი რისკი (საბაზისო)",
  
  // High Risk Factors
  previous_preeclampsia: "წინა პრეეკლამფსია",
  chronic_hypertension: "ქრონიკული ჰიპერტენზია",
  diabetes_pregestational: "ორსულობამდელი დიაბეტი (ტიპი 1 ან 2)",
  chronic_kidney_disease: "ქრონიკული თირკმლის დაავადება",
  autoimmune_disease: "ავტოიმუნური დაავადება (SLE, APS)",
  multiple_gestation: "მრავალნაყოფიანი ორსულობა (ტყუპები/სამეული)",
  
  // Moderate Risk Factors
  nulliparity: "პირველმშობიარე (პირველი ორსულობა)",
  maternal_age_35: "დედის ასაკი ≥35 წელი",
  family_history_preeclampsia: "პრეეკლამფსიის ოჯახური ანამნეზი",
  obesity_bmi_30: "სიმსუქნე (BMI ≥30 კგ/მ²)",
  previous_adverse_outcome: "წინა გართულებული ორსულობა",
  interpregnancy_interval: "ორსულობებს შორის ინტერვალი >10 წელი",
  ivf_pregnancy: "IVF რეპროდუქციით ორსულობა",
  
  // Maternal Characteristics
  maternal_characteristics: "დედის მახასიათებლები",
  maternal_age_label: "დედის ასაკი",
  maternal_age_unit: "წელი",
  maternal_age_help: "დედის მიმდინარე ასაკი (15-50 წელი)",
  
  maternal_bmi_label: "ორსულობამდელი BMI",
  maternal_bmi_unit: "კგ/მ²",
  maternal_bmi_help: "ორსულობამდელი სხეულის მასის ინდექსი (15-50 კგ/მ²)",
  
  gestational_age_label: "მიმდინარე ორსულობის ასაკი",
  gestational_age_unit: "კვირა",
  gestational_age_help: "მიმდინარე ორსულობის ასაკი დროის შეფასებისთვის (6-20 კვირა)",
  
  // Medical History
  medical_history: "სამედიცინო ანამნეზი",
  obstetric_history: "მენა-გინეკოლოგიური ანამნეზი",
  current_pregnancy: "მიმდინარე ორსულობის ფაქტორები",
  
  // Risk Assessment Results
  selected_risk_factors: "არჩეული რისკ-ფაქტორები",
  calculated_risk_level: "გამოთვლილი რისკის დონე",
  high_risk_category: "მაღალი რისკი",
  moderate_risk_category: "საშუალო რისკი", 
  low_risk_category: "დაბალი რისკი",
  
  risk_percentage: "სავარაუდო რისკი",
  aspirin_recommendation: "რეკომენდაცია დაბალი დოზის ასპირინის მიღებასთან დაკავშირებით",
  monitoring_recommendations: "რეკომენდაცია მონიტორინგთან დაკავშირებით",
  
  // Clinical Recommendations
  clinical_recommendations: "კლინიკური რეკომენდაციები",
  evidence_base: "მტკიცებულების ბაზა",
  
  // Risk Level Descriptions
  high_risk_description: "პრეეკლამფსიის განვითარების მაღალი რისკი. ძლიერი რეკომენდაცია დაბალი დოზის ასპირინის პროფილაქტიკისა და გაძლიერებულ მონიტორინგზე.",
  moderate_risk_description: "საშუალო რისკი მრავალი ფაქტორის საფუძველზე. განიხილეთ დაბალი დოზის ასპირინის პროფილაქტიკა და სტანდარტული გაძლიერებული მონიტორინგი.",
  low_risk_description: "დაბალი საბაზისო რისკი. სტანდარტული ანტენატალური მოვლა რუტინული მონიტორინგით.",
  
  // Aspirin Recommendations
  aspirin_indicated: "რეკომენდებულია დაბალი დოზის ასპირინი (81მგ დღეში)",
  aspirin_consider: "განიხილეთ დაბალი დოზის ასპირინი (81მგ დღეში)",
  aspirin_not_indicated: "დაბალი დოზის ასპირინი რუტინულად არ არის ნაჩვენები",
  
  aspirin_timing: "დაიწყეთ 12-28 კვირას შორის (იდეალურად 16 კვირამდე)",
  aspirin_continuation: "გააგრძელეთ მშობიარობამდე",
  aspirin_contraindications: "განიხილეთ უკუჩვენებები და სისხლდენის რისკები",
  
  // Monitoring Recommendations
  enhanced_monitoring: "გაძლიერებული მონიტორინგი",
  standard_monitoring: "სტანდარტული მონიტორინგი",
  
  enhanced_monitoring_details: "უფრო ხშირი ვიზიტები, არტერიული წნევის მონიტორინგი, პროტეინურიის შეფასება და ნაყოფის ზედამხედველობა",
  standard_monitoring_details: "რუტინული ანტენატალური მოვლა სტანდარტული პრეეკლამფსიის სკრინინგით",
  
  // ACOG Guidelines
  acog_guidelines: "ACOG-ის რეკომენდაციები",
  acog_guideline_1: "ერთი მაღალი რისკის ფაქტორი ან ორი საშუალო რისკის ფაქტორი ნიშნავს ასპირინის პროფილაქტიკას",
  acog_guideline_2: "დაბალი დოზის ასპირინი (81მგ დღეში) უნდა დაიწყოს 12-28 კვირას შორის",
  acog_guideline_3: "გააგრძელეთ ასპირინი მშობიარობამდე მაქსიმალური სარგებლისთვის",
  acog_guideline_4: "გაძლიერებული მონიტორინგი რეკომენდებულია მაღალი რისკის ორსულობებისთვის",
  
  // Evidence Base
  evidence_based_medicine: "მტკიცებულებაზე დაფუძნებული მედიცინა",
  uspstf_recommendation: "USPSTF კლასი A რეკომენდაცია ასპირინის პროფილაქტიკისთვის",
  cochrane_review: "კოქრანის მიმოხილვა: 24% შემცირება პრეეკლამფსიაში ასპირინით",
  meta_analysis_data: "მეტა-ანალიზი აჩვენებს მძიმე პრეეკლამფსიის მნიშვნელოვან შემცირებას",
  
  // Risk Analysis
  risk_analysis: "რისკის ანალიზი",
  risk_factors_count: "იდენტიფიცირებული რისკ-ფაქტორები:",
  high_risk_count: "მაღალი რისკის ფაქტორები:",
  moderate_risk_count: "საშუალო რისკის ფაქტორები:",
  
  // Assessment Summary
  assessment_summary: "შეფასების შეჯამება",
  recommendation_strength: "რეკომენდაციის სიძლიერე:",
  strong_recommendation: "ძლიერი რეკომენდაცია",
  moderate_recommendation: "საშუალო რეკომენდაცია", 
  no_specific_recommendation: "კონკრეტული რეკომენდაცია არ არსებობს",
  
  // Buttons
  new_assessment: "ახალი შეფასება",
  modify_inputs: "შეცვალე მონაცემები",
  
  // Footer
  based_on_acog_743: "დაფუძნებულია ACOG კომიტეტის მოსაზრებაზე #743",
  educational_purposes_only: "მხოლოდ საგანმანათლებლო მიზნებისთვის",
  acog_2018_guidelines: "ACOG 2018 რეკომენდაციები",
  
  // About Section
  about_preeclampsia_calculator: "პრეეკლამფსიის რისკის კალკულატორის შესახებ",
  about_subtitle: "მტკიცებულებაზე დაფუძნებული სკრინინგი ორსულობის გართულებებისთვის",
  
  // Clinical Parameters Section
  clinical_parameters: "კლინიკური პარამეტრები",
  clinical_parameters_subtitle: "დამატებითი ბიომარკერები და კლინიკური გაზომვები (11-13+6 კვირა)",
  clinical_measurements: "კლინიკური გაზომვები",
  biochemical_markers: "ბიოქიმიური მარკერები",
  clinical_parameters_information: "კლინიკური პარამეტრების ინფორმაცია",
  
  // Clinical Measurements Labels
  mean_arterial_pressure: "საშუალო არტერიული წნევა (MAP)",
  mean_arterial_pressure_help: "დამატებითი: პირველი ტრიმესტრის MAP გაზომვა",
  uterine_artery_pi: "საშვილოსნოს არტერიის პულსაციის ინდექსი",
  uterine_artery_pi_help: "დამატებითი: დოპლერული შეფასება 11-13+6 კვირაზე",
  
  // Biochemical Markers Labels
  plgf_label: "PlGF (პლაცენტარული ზრდის ფაქტორი)",
  plgf_help: "დამატებითი: პირველი ტრიმესტრის PlGF დონე",
  papp_a_label: "PAPP-A",
  papp_a_help: "დამატებითი: PAPP-A დონე (მედიანის ჯერადი)",
  
  // Clinical Parameters Information
  clinical_info_1: "ეს პარამეტრები არასავალდებულოა, მაგრამ შეუძლია გააუმჯობესოს რისკის შეფასების სიზუსტე",
  clinical_info_2: "შეფასების ოპტიმალური დრო არის ორსულობის 11-13+6 კვირა",
  clinical_info_3: "კომბინირებული სკრინინგის ალგორითმები იყენებს ამ პარამეტრებს გაუმჯობესებული რისკის სტრატიფიკაციისთვის",
  clinical_info_4: "მხოლოდ კლინიკური რისკის ფაქტორები საკმარისია ძირითადი რისკის შეფასებისთვის",
  
  // About Page Content
  about_clinical_purpose: "კლინიკური დანიშნულება",
  about_clinical_purpose_description: "პრეეკლამფსიის რისკის კალკულატორი უზრუნველყოფს მტკიცებულებაზე დაფუძნებულ პრეეკლამფსიის რისკის შეფასებას, კლინიკური რისკის ფაქტორებისა და დამატებითი ბიომარკერების გამოყენებით. გამოიყენება ასპირინის პროფილაქტიკურ დანიშვნასთან დაკავშიებით გადაწყვეტილების მიღებაში, USPSTF და ACOG რეკომენდაციებზე დაყრდნობით.",
  about_evidence_subtitle: "მტკიცებულებაზე დაფუძნებული რისკის შეფასება • ACOG მითითებები • კლინიკური დოკუმენტაცია",
  
  evidence_based_screening: "მტკიცებულებაზე დაფუძნებული სკრინინგის მეთოდები",
  validated_risk_algorithms: "ვალიდირებული ალგორითმები მაღალი რისკის ორსულობების ადრეული იდენტიფიკაციისთვის",
  
  prevention_strategies: "პრევენციული სტრატეგიები",
  aspirin_prophylaxis_effective: "დაბალი დოზის ასპირინის პროფილაქტიკა ამცირებს პრეეკლამფსიის რისკს 24%-ით მაღალი რისკის ორსულობებში",
  
  // Clinical Applications
  clinical_applications: "კლინიკური გამოყენება",
  early_risk_identification: "• რისკის ადრეული იდენტიფიკაცია (12-20 კვირა)",
  targeted_prophylaxis: "• მიზნობრივი ასპირინის პროფილაქტიკა",
  enhanced_surveillance: "• გაძლიერებული ანტენატალური ზედამხედველობა",
  resource_allocation: "• შესაბამისი რესურსების განაწილება",
  
  // Important Considerations
  important_clinical_considerations: "მნიშვნელოვანი კლინიკური მოსაზრებები",
  clinical_calculator_notice: "ეს კალკულატორი უზრუნველყოფს მტკიცებულებაზე დაფუძნებულ რისკის შეფასებას კლინიკური გადაწყვეტილების მისაღებად. ყოველთვის გაითვალისწინეთ ინდივიდუალური პაციენტის ფაქტორები, უკუჩვენებები და კლინიკური კონტექსტი.",
  
  // Validation and Errors
  general_error: "გთხოვთ, აირჩიოთ მინიმუმ ერთი რისკ-ფაქტორი ან შეიყვანოთ დედის მახასიათებლები",
  maternal_age_error: "დედის ასაკი უნდა იყოს 15-50 წლის შორის",
  maternal_bmi_error: "BMI უნდა იყოს 15-50 კგ/მ²-ს შორის",
  gestational_age_error: "ორსულობის ასაკი უნდა იყოს 6-20 კვირას შორის",
  calculation_failed: "რისკის გამოთვლა ვერ განხორციელდა. გთხოვთ, გადაამოწმოთ შეყვანილი მონაცემები და სცადოთ ხელახლა.",
  
  // Progress Steps
  progress: {
    step_1: "რისკ-ფაქტორები",
    step_2: "დედის მონაცემები",
    step_3: "შედეგები"
  },
  
  // Display Labels
  high_risk_display: "მაღალი",
  moderate_risk_display: "საშუალო",
  low_risk_display: "დაბალი",
  
  // Units
  years_unit: "წელი",
  weeks_unit: "კვირა",
  kg_m2_unit: "კგ/მ²",
  mg_unit: "მგ",
  daily_unit: "დღეში",
  
  // Risk Statistics
  baseline_risk: "საბაზისო პოპულაციური რისკი: 2-8%",
  high_risk_statistics: "მაღალი რისკის ორსულობები: 15-25% რისკი",
  aspirin_efficacy: "ასპირინი ამცირებს რისკს 24%-ით (95% CI: 18-28%)"
}; 