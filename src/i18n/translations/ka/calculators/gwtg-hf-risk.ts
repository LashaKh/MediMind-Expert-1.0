const gwtgHfRiskTranslations = {
  title: 'GWTG-HF რისკის კალკულატორი',
  subtitle: 'გაიდლაინები მკურნალობისთვის - გულის უკმარისობის რისკის შეფასება',
  description: 'მტკიცებულებებით დამოწმებული რისკის პროგნოზირების ინსტრუმენტი',
  
  // Alert section
  alert_title: 'GWTG-HF რისკის შეფასება',
  alert_description: 'მტკიცებულებებით დამოწმებული რისკის კალკულატორი ჰოსპიტალში',
  
  // Section headers
  section_demographics: 'დემოგრაფია და თანმხლები დაავადებები',
  section_demographics_description: 'პაციენტის დემოგრაფიული ინფორმაცია',
  vital_signs_section: 'სასიცოცხლო ნიშნები',
  vital_signs_description: 'მიმდინარე ჰემოდინამიკური სტატუსი',
  laboratory_section: 'ლაბორატორიული მონაცემები',
  laboratory_description: 'მთავარი ლაბორატორიული მარკერები',
  
  // Demographics fields
  field_age: 'ასაკი',
  field_age_placeholder: 'შეიყვანეთ ასაკი',
  field_race: 'რასა/ეთნიკური კუთვნილება',
  field_race_select: 'აირჩიეთ რასა',
  field_race_black: 'შავკანიანი ან აფროამერიკელი',
  field_race_other: 'სხვა',
  field_copd: 'ქრონიკული ფილტვების დაავადება (ქფდ)',
  field_copd_description: 'ქრონიკული ობსტრუქციული ფილტვების დაავადების ისტორია',
  
  // Vital signs fields
  systolic_bp_label: 'სისტოლური არტერიული წნევა',
  systolic_bp_placeholder: 'შეიყვანეთ სისტოლური წნევა',
  heart_rate_label: 'გულისცემის სიხშირე',
  heart_rate_placeholder: 'შეიყვანეთ გულისცემის სიხშირე',
  
  // Laboratory fields
  bun_label: 'შარდოვანა ნაწილაკები (BUN)',
  bun_placeholder: 'შეიყვანეთ BUN მნიშვნელობა',
  sodium_label: 'შრატის ნატრიუმი',
  sodium_placeholder: 'შეიყვანეთ ნატრიუმის დონე',
  
  // Button labels
  button_next_vital_signs: 'შემდეგი: ვიტალური ნიშნები',
  next_laboratory: 'შემდეგი: ლაბორატორია',
  back_button: 'უკან',
  calculate_button: 'რისკის გამოთვლა',
  
  // Results section
  results_title: 'GWTG-HF რისკის შეფასების შედეგები',
  gwtg_points: 'GWTG ქულები',
  risk_score_label: 'რისკის ქულა',
  mortality_risk_label: 'სიკვდილიანობის რისკი',
  in_hospital_mortality: 'ჰოსპიტალში მოკვდავობა',
  risk_category_label: 'რისკის კატეგორია',
  risk_stratification: 'რისკის სტრატიფიკაცია',
  
  // Risk factor breakdown
  risk_factor_contribution: 'რისკ ფაქტორების წვლილი',
  age_factor: 'ასაკი',
  systolic_bp_factor: 'სწ',
  bun_factor: 'შარდოვანა',
  sodium_factor: 'ნატრიუმი',
  race_factor: 'რასა',
  copd_factor: 'ქფდ',
  heart_rate_factor: 'გს',
  
  // Clinical management
  clinical_management: 'კლინიკური მართვის რეკომენდაციები',
  
  // Risk interpretations
  interpretation_template: 'GWTG-HF რისკის ქულა: {{score}} ქულა. {{interpretation}} სავარაუდო ჰოსპიტალური სიკვდილობა: {{mortality}}%.',
  interpretation_low: 'დაბალი რისკი ჰოსპიტალური სიკვდილობისთვის',
  interpretation_intermediate: 'საშუალო რისკი ჰოსპიტალური სიკვდილობისთვის',
  interpretation_high: 'მაღალი რისკი ჰოსპიტალური სიკვდილობისთვის',
  interpretation_very_high: 'ძალიან მაღალი რისკი ჰოსპიტალური სიკვდილობისთვის',
  
  // Clinical recommendations - Base
  recommendation_guideline_therapy: 'გაიდლაინებით ნაკარნახევი სამედიცინო თერაპიის ოპტიმიზაცია',
  recommendation_fluid_monitoring: 'სითხის ბალანსისა და ყოველდღიური წონის მონიტორინგი',
  recommendation_vital_assessment: 'სასიცოცხლო ნიშნებისა და ჟანგბადის სატურაციის რეგულარული შეფასება',
  recommendation_precipitating_factors: 'მაპროვოცირებელი ფაქტორებისა და ტრიგერების შეფასება',
  
  // Clinical recommendations - Low risk
  recommendation_standard_protocols: 'გულის უკმარისობის მართვის სტანდარტული პროტოკოლები',
  recommendation_early_discharge: 'განიხილეთ ადრეული გაწერა გულის უკმარისობის განათლებით',
  recommendation_outpatient_followup: 'ამბულატორიული კარდიოლოგიური მეთვალყურეობა 7-14 დღეში',
  recommendation_medication_reconciliation: 'მედიკამენტების შეთანხმება და ოპტიმიზაცია',
  
  // Clinical recommendations - Intermediate risk
  recommendation_enhanced_monitoring: 'გაძლიერებული სტაციონარული მონიტორინგი ხშირი შეფასებებით',
  recommendation_telemetry_consideration: 'განიხილეთ ტელემეტრიული მონიტორინგი არითმიებისთვის',
  recommendation_nurse_navigator: 'გულის უკმარისობის ექთნის ჩართულობა მოვლის კოორდინაციისთვის',
  recommendation_close_followup: 'გაწერის დაგეგმვა მჭიდრო მეთვალყურეობით 3-7 დღეში',
  recommendation_biomarker_monitoring: 'განიხილეთ BNP/NT-proBNP დინამიკის მონიტორინგი',
  
  // Clinical recommendations - High risk
  recommendation_intensive_monitoring: 'ინტენსიური მონიტორინგი უწყვეტი ტელემეტრიით',
  recommendation_early_consultation: 'ადრეული კარდიოლოგიური კონსულტაცია და თანამართვა',
  recommendation_icu_consideration: 'განიხილეთ ICU მონიტორინგი კლინიკური ჩვენებისას',
  recommendation_palliative_consult: 'პალიატიური მოვლის კონსულტაცია სიმპტომების მართვისთვის',
  recommendation_advance_directive: 'წინასწარ განკარგულებების განხილვა პაციენტთან/ოჯახთან',
  recommendation_inotropic_support: 'განიხილეთ ინოტროპული მხარდაჭერა საჭიროების შემთხვევაში',
  
  // Clinical recommendations - Very high risk
  recommendation_icu_level_care: 'რეკომენდებულია ICU დონის მონიტორინგი და მოვლა',
  recommendation_immediate_hf_consult: 'დაუყოვნებელი კონსულტაცია მოწინავე გულის უკმარისობაზე',
  recommendation_mechanical_support: 'განიხილეთ მექანიკური ცირკულაციური მხარდაჭერის შეფასება',
  recommendation_goals_of_care: 'პალიატიური მოვლის კონსულტაცია მოვლის მიზნებისთვის',
  recommendation_family_meetings: 'ოჯახური შეხვედრები სიცოცხლის ბოლოს დაგეგმვისთვის',
  recommendation_hospice_consideration: 'განიხილეთ ჰოსპისის კონსულტაცია საჭიროების შემთხვევაში',
  recommendation_multidisciplinary_team: 'მულტიდისციპლინური გუნდის ჩართულობა',
  
  // Algorithm validation
  algorithm_title: 'გაძლიერებული GWTG-HF ალგორითმი',
  algorithm_description: '✓ AHA Get With The Guidelines ვალიდირებული • გაძლიერებული რისკის სტრატიფიკაცია კომპლექსური კლინიკური რეკომენდაციებით',
  
  // Risk reference ranges
  risk_reference_title: 'GWTG-HF რისკის ქულის სახელმძღვანელო',
  low_risk_range: 'დაბალი რისკი (≤25 ქულა)',
  low_mortality: '<2% სიკვდილიანობის რისკი',
  intermediate_risk_range: 'საშუალო რისკი (26-35 ქულა)',
  intermediate_mortality: '2-4% სიკვდილიანობის რისკი',
  high_risk_range: 'მაღალი რისკი (36-45 ქულა)',
  high_mortality: '4-8% სიკვდილიანობის რისკი',
  very_high_risk_range: 'ძალიან მაღალი რისკი (>45 ქულა)',
  very_high_mortality: '>8% სიკვდილიანობის რისკი',
  
  // From the Creator section
  from_creator_title: 'შემქმნელისგან',
  creator_name: 'დოქტორი გრეგ კ. ფონაროუ, MD',
  creator_title_role: 'მედიცინის პროფესორი და აჰმანსონ-UCLA კარდიომიოპათიის ცენტრის დირექტორი',
  why_developed: 'რატომ შეიქმნა GWTG-HF',
  why_developed_text: 'რისკის მოდელები ეხმარება პაციენტების ტრიაჟში და მკურნალობის გადაწყვეტილებებში. GWTG-HF ქულა შეიქმნა თითქმის 200 აშშ საავადმყოფოს მონაცემების გამოყენებით, რათა უზრუნველყოს ობიექტური პროგნოზული ინფორმაცია, რომელიც ხელს უწყობს გულის უკმარისობის პაციენტების შესაბამის მონიტორინგსა და მკურნალობას.',
  clinical_application: 'კლინიკური გამოყენება',
  clinical_application_text: 'GWTG-HF რისკის ქულა განსაზღვრავს პაციენტის რისკს მოვლის მომენტში, რაც ხელს უწყობს პაციენტების ტრიაჟს და წაახალისებს მტკიცებულებებზე დაფუძნებულ თერაპიას ყველაზე მაღალი რისკის პაციენტებში. ეს ეხმარება გაზარდოს რეკომენდებული სამედიცინო თერაპიის გამოყენება მაღალი რისკის პაციენტებში, ამავდროულად ამცირებს რესურსების გამოყენებას დაბალი რისკის პაციენტებში.',
  view_publications: 'იხილეთ დოქტორ ფონაროუს პუბლიკაციები',
  pubmed_link_text: 'PubMed',
  
  // Evidence section
  evidence_title: 'მტკიცებულებები და ვალიდაცია',
  formula_title: 'ფორმულა',
  formula_description: 'ლაბორატორიული და დემოგრაფიული მნიშვნელობების დამატება მინიჭებული ქულების მნიშვნელობებით.',
  score_interpretation_title: 'ქულის ინტერპრეტაცია',
  score_interpretation_ranges: [
    { range: '0-33', mortality: '<1%' },
    { range: '34-50', mortality: '1-5%' },
    { range: '51-57', mortality: '5-10%' },
    { range: '58-61', mortality: '10-15%' },
    { range: '62-65', mortality: '15-20%' },
    { range: '66-70', mortality: '20-30%' },
    { range: '71-74', mortality: '30-40%' },
    { range: '75-78', mortality: '40-50%' },
    { range: '≥79', mortality: '>50%' }
  ],
  validation_cohort: 'ვალიდირებულია 39,783 პაციენტზე 198 საავადმყოფოდან GWTG-HF რეესტრში (2005-2007)',
  key_predictors: 'ძირითადი პრედიქტორები: ასაკი, სისტოლური არტერიული წნევა, BUN მიღებისას, დამატებით წვლილით გულისცემის სიხშირე, შრატის ნატრიუმი, ქფდ-ს არსებობა და რასა',
  ehealthrecords_validation: 'დამატებით ვალიდირებულია 13,163 პაციენტზე ელექტრონული ჯანდაცვის ჩანაწერების მონაცემების გამოყენებით',
  funding_note: 'GWTG-HF ნაწილობრივ მხარდაჭერილი იყო GlaxoSmithKline-ის მიერ',
  original_reference: 'ორიგინალური წყარო',
  validation_reference: 'ვალიდაციის კვლევა',
  
  // Enhanced alert section
  enhanced_alert_title: 'გაძლიერებული GWTG-HF რისკის შეფასება',
  enhanced_alert_description: 'მტკიცებულებებზე დაფუძნებული ჰოსპიტალური სიკვდილობის რისკის პროგნოზირება გულის უკმარისობის პაციენტებისთვის. ვალიდირებს რისკის სტრატიფიკაციას და ხელმძღვანელობს ინტენსიური მოვლის გადაწყვეტილებებს ოპტიმალური შედეგებისთვის.',
  enhanced_alert_badge: 'AHA Get With The Guidelines ვალიდირებული - გაძლიერებული რისკის ანალიზი',
  
  // Progress step labels
  progress_demographics: 'დემოგრაფია',
  progress_vital_signs: 'ვიტალური ნიშნები',
  progress_laboratory: 'ლაბორატორია',
  
  // Action buttons
  new_assessment: 'ახალი შეფასება',
  modify_inputs: 'მონაცემების შეცვლა',
  
  // Footer validation text
  footer_validation_text: '✓ AHA Get With The Guidelines ვალიდირებული • გაძლიერებული რისკის სტრატიფიკაცია კომპლექსური კლინიკური რეკომენდაციებით',
  footer_based_on: 'დაფუძნებულია AHA Get With The Guidelines-Heart Failure (GWTG-HF) რეესტრზე • გაძლიერებული რისკის შეფასება',
  footer_guidelines_validated: 'ვალიდირებული გაიდლაინებით',
  
  // Validation messages
  validation: {
    age_required: 'ასაკი აუცილებელია',
    age_range: 'ასაკი უნდა იყოს 18-120 წლის შორის',
    race_required: 'რასა აუცილებელია',
    sbp_required: 'სისტოლური არტერიული წნევა აუცილებელია',
    sbp_range: 'სისტოლური წნევა უნდა იყოს 60-300 მმ ვან. სტ. შორის',
    bun_required: 'შარდოვანა ნაწილაკები აუცილებელია',
    bun_range: 'BUN უნდა იყოს 5-200 მგ/დლ შორის',
    sodium_required: 'შრატის ნატრიუმი აუცილებელია',
    sodium_range: 'ნატრიუმი უნდა იყოს 115-160 მეკვ/ლ შორის',
    heart_rate_required: 'გულისცემის სიხშირე აუცილებელია',
    heart_rate_range: 'გულისცემის სიხშირე უნდა იყოს 30-200 უარ/წთ შორის'
  }
};

export default gwtgHfRiskTranslations; 