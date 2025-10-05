export default {
  // Risk Assessment Category
  riskAssessment: 'რისკის შეფასება',
  ascvdTitle: 'ᲐᲡᲖᲓ რისკის კალკულატორი',
  framinghamTitle: 'ფრამინგჰემის რისკის ქულა',
  reyonldsTitle: 'რეინოლდსის რისკის ქულა',

  // ASCVD Risk Calculator
  ascvd: {
    title: 'ᲐᲡᲖᲓ რისკის კალკულატორი',
    subtitle: '10-წლიანი ათეროსკლეროზული გულ-სისხლძარღვთა დაავადების რისკის შეფასება',
    description: 'ACC/AHA გაერთიანებული კოჰორტის განტოლებები 10-წლიანი რისკის გამოსათვლელად.',
    calculate_button: "ᲐᲡᲖᲓ რისკის გამოთვლა",
    risk_category: "რისკის კატეგორია",
    recommendations: "კლინიკური რეკომენდაციები",
    low_risk: "დაბალი რისკი (<5%)",
    high_risk: "მაღალი რისკი (≥20%)",
    intermediate_risk: "საშუალო რისკი (5-20%)",
    
    age_label: 'ასაკი (წლები)',
    age_placeholder: '20-79',
    sex_label: 'სქესი',
    sex_placeholder: 'აირჩიეთ სქესი...',
    sex_male: 'მამრობითი',
    sex_female: 'მდედრობითი',
    race_label: 'რასა/ეთნიკური კუთვნილება',
    race_placeholder: 'აირჩიეთ რასა...',
    race_white: 'თეთრი',
    race_african_american: 'აფროამერიკელი',
    race_other: 'სხვა',
    total_cholesterol_label: 'საერთო ქოლესტერინი (მგ/დლ)',
    total_cholesterol_placeholder: '130-320',
    hdl_cholesterol_label: 'HDL ქოლესტერინი (მგ/დლ)',
    hdl_cholesterol_placeholder: '20-100',
    systolic_bp_label: 'სისტოლური არტერიული წნევა (მმ ვარდ.სვ.)',
    systolic_bp_placeholder: '90-200',
    on_htn_meds_label: 'ამჟამად იღებს არტერიული წნევის პრეპარატებს',
    diabetes_label: 'შაქრიანი დიაბეტი',
    smoker_label: 'ამჟამინდელი მწეველი',
    validation_age: 'ასაკი უნდა იყოს 20-79 წელი ᲐᲡᲖᲓ რისკის გამოსათვლელად',
    validation_sex: 'სქესი აუცილებელია',
    validation_race: 'რასა აუცილებელია ზუსტი რისკის გამოსათვლელად',
    validation_total_cholesterol: 'საერთო ქოლესტერინი უნდა იყოს 130-320 მგ/დლ-ს შორის',
    validation_hdl_cholesterol: 'HDL ქოლესტერინი უნდა იყოს 20-100 მგ/დლ-ს შორის',
    validation_systolic_bp: 'სისტოლური არტერიული წნევა უნდა იყოს 90-200 მმ ვარდ.სვ.-ს შორის',
    ten_year_risk: '10-წლიანი ᲐᲡᲖᲓ რისკი',
    lifetime_risk: 'სიცოცხლის განმავლობაში რისკი',
    statin_benefit: 'სტატინური თერაპიის სარგებელი',
    bp_control_benefit: 'არტერიული წნევის კონტროლის სარგებელი',
    smoking_cessation_benefit: 'მოწევის შეწყვეტის სარგებელი',
    aspirin_benefit: 'ასპირინის თერაპიის სარგებელი',
    demographics_section: "დემოგრაფია",
    lab_values_section: "ლაბორატორიული მონაცემები",
    risk_factors_section: "რისკის ფაქტორები",
    evidence_title: "მტკიცებულებები",
    evidence_description: "ეს კალკულატორი დაფუძნებულია 2013 წლის ACC/AHA სახელმძღვანელოზე კარდიოვასკულური რისკის შეფასების შესახებ და გაერთიანებულ კოჰორტულ განტოლებებზე.",
    evidence_link_text: "ნახეთ ორიგინალი კვლევითი პუბლიკაცია",
    about_creator_title: "შემქმნელის შესახებ",
    creator_name: "დოქტორი დევიდ კ. გოფ უმცროსი, MD, PhD",
    creator_bio: "დევიდ კ. გოფ უმცროსი, MD, PhD, არის ეპიდემიოლოგიის პროფესორი კოლორადოს უნივერსიტეტში და კოლორადოს საზოგადოებრივი ჯანმრთელობის სკოლის დეკანი. ის არის საჯარო პოლიტიკის ჯილდოს ყოფილი მიმღები გულის დაავადებებისა და ინსულტის პრევენციის ეროვნული ფორუმიდან და ამჟამად არის ASPPH აკრედიტაციისა და სერთიფიცირების კომიტეტის დროებითი თავმჯდომარე. მისი კვლევითი ინტერესები მოიცავს გულის დაავადებებისა და ინსულტის პრევენციას და გაგებას.",
    // დეტალური ანალიზის განყოფილება
    lifetime_risk_title: "სიცოცხლის განმავლობაში რისკი",
    lifetime_risk_description: "სავარაუდო კარდიოვასკულური რისკი სიცოცხლის განმავლობაში 20-59 წლის პაციენტებისთვის",
    risk_classification_title: "რისკის კლასიფიკაცია",
    risk_classification_low: "რისკი < 5% - ფოკუსი ცხოვრების წესის მოდიფიკაციაზე",
    risk_classification_borderline: "რისკი 5-7.4% - განიხილეთ რისკის გამაძლიერებელი ფაქტორები",
    risk_classification_intermediate: "რისკი 7.5-19.9% - სტატინური თერაპია გონივრულია",
    risk_classification_high: "რისკი ≥ 20% - რეკომენდებულია მაღალი ინტენსივობის სტატინური თერაპია",
    therapy_reduction_title: "სავარაუდო რისკის შემცირება თერაპიით",
    statin_therapy: "სტატინური თერაპია",
    bp_control: "არტერიული წნევის კონტროლი",
    smoking_cessation: "მოწევის შეწყვეტა",
    aspirin_therapy: "ასპირინი (საჭიროების შემთხვევაში)",
    // ინტერპრეტაციის შეტყობინებები
    interpretation_low: "დაბალი კარდიოვასკულური რისკი. ფოკუსირება ცხოვრების წესის მოდიფიკაციაზე და რუტინულ პრევენციულ მოვლაზე.",
    interpretation_borderline: "ზღვრული რისკი. განიხილეთ რისკის გამაძლიერებელი ფაქტორები და ერთობლივი გადაწყვეტილების მიღება პრევენციული თერაპიისთვის.",
    interpretation_intermediate: "საშუალო რისკი. საშუალო ინტენსივობის სტატინური თერაპია გონივრულია ცხოვრების წესის მოდიფიკაციასთან ერთად.",
    interpretation_high: "მაღალი კარდიოვასკულური რისკი. რეკომენდებულია მაღალი ინტენსივობის სტატინური თერაპია, თუ არ არის უკუჩვენება.",
    // ვალიდაციის შეტყობინება
    calibration_applied: "კალიბრაცია გამოყენებულია",
    // ქვედა კოლონტიტულის ტექსტი
    footer_guidelines: "დაფუძნებულია ACC/AHA 2019 პირველადი პრევენციის სახელმძღვანელოზე და გაერთიანებულ კოჰორტულ განტოლებებზე",
    footer_validated: "100% ვალიდირებული"
  },

  // Atrial Fibrillation Risk Assessment
  atrial_fibrillation: {
    title: 'წინაგულების ფიბრილაციის რისკის შეფასება',
    subtitle: 'CHA₂DS₂-VASc ინსულტის რისკი და HAS-BLED სისხლდენის რისკი • კომპლექსური AF მენეჯმენტი',
    
    // Component header and description
    component_title: 'წინაგულების ფიბრილაციის რისკის შეფასება',
    component_subtitle: 'CHA₂DS₂-VASc ინსულტის რისკი და HAS-BLED სისხლდენის რისკი • კომპლექსური AF მენეჯმენტი',
    
    // Alert section
    alert_title: 'კომპლექსური წინაგულების ფიბრილაციის რისკის შეფასება',
    alert_description: 'მტკიცებულებებით დამოწმებული ინსულტისა და სისხლდენის რისკის შეფასება არავარქვლოვანი წინაგულების ფიბრილაციის მქონე პაციენტებისთვის. ანტიკოაგულაციური თერაპიის გადაწყვეტილებების მიღება დაბალანსებული სარგებელი-რისკის ანალიზით.',
    alert_badge: 'ვალიდირებული ACC/AHA/ESC გაიდლაინებით - გაუმჯობესებული რისკის ანალიზი',
    
    // Tab labels
    tab_cha2ds2vasc: 'CHA₂DS₂-VASc',
    tab_cha2ds2vasc_subtitle: '(ინსულტის რისკი)',
    tab_hasbled: 'HAS-BLED',
    tab_hasbled_subtitle: '(სისხლდენის რისკი)',
    
    // CHA₂DS₂-VASc section
    cha2ds2vasc: {
      title: 'CHA₂DS₂-VASc ქულა',
      description: 'ინსულტის რისკის შეფასება არავარქვლოვანი წინაგულების ფიბრილაციისას',
      
      // Form fields
      age_label: 'ასაკი (წლები)',
      age_placeholder: '65',
      age_tooltip: 'ასაკი 65-74 = 1 ქულა, ასაკი ≥75 = 2 ქულა',
      
      sex_label: 'სქესი',
      sex_placeholder: 'აირჩიეთ...',
      sex_tooltip: 'მდედრობითი სქესი = 1 ქულა',
      sex_male: 'მამრობითი',
      sex_female: 'მდედრობითი',
      
      // Risk factors
      risk_factors_title: 'რისკის ფაქტორები (თითოეული 1 ქულა)',
      chf_label: 'შეგუბებითი გულის უკმარისობა/მარცხენა კუთხოვნის დისფუნქცია',
      hypertension_label: 'ჰიპერტენზია',
      diabetes_label: 'შაქრიანი დიაბეტი',
      vascular_disease_label: 'ვასკულარული დაავადება (MI, PAD, აორტის ფოლაქები)',
      
      // High-risk factors
      high_risk_title: 'მაღალი რისკის ფაქტორი (2 ქულა)',
      stroke_tia_label: 'წინა ინსულტი, TIA, ან თრომბოემბოლია',
      
      // Buttons
      calculate_button: 'ქულის გამოთვლა',
      reset_button: 'გადატვირთვა',
      
      // Results
      score_label: 'CHA₂DS₂-VASc ქულა',
      annual_stroke_risk: 'წლიური ინსულტის რისკი',
      risk_category: 'რისკის კატეგორია',
      recommendation: 'რეკომენდაცია',
      
      // Evidence section
      evidence_title: 'მტკიცებულება და ვალიდაცია',
      evidence_origin_title: 'ქულის შემუშავება',
      evidence_origin_description: 'CHA₂DS₂-VASc ქულა შემუშავდა 2010 წელს როგორც CHADS₂ ქულის გაუმჯობესება, დამატებითი ინსულტის რისკ ფაქტორების ჩართვით. იგი მიღებული იყო Euro Heart Survey კოჰორტისგან 5,333 პაციენტისგან წინაგულების ფიბრილაციით.',
      evidence_validation_title: 'ვალიდაციის კვლევები',
      evidence_validation_description: 'ქულა ვრცლად არის ვალიდირებული მრავალ დიდ კოჰორტში მსოფლიო მაშტაბით, თანმიმდევრულად აჩვენებს CHADS₂-ზე უკეთეს შედეგს ნამდვილად დაბალი რისკის პაციენტების გამოვლენაში და უკეთესი ინსულტის რისკის სტრატიფიკაციის უზრუნველყოფაში.',
      evidence_guidelines_title: 'გაიდლაინების რეკომენდაციები',
      evidence_guidelines_description: 'CHA₂DS₂-VASc ქულა რეკომენდირებულია ძირითადი საერთაშორისო გაიდლაინებით, მათ შორის 2023 ACC/AHA/ACCP/HRS, 2020 ESC, და 2021 NICE გაიდლაინებით არავარქვლოვანი წინაგულების ფიბრილაციაში ინსულტის რისკის შეფასებისთვის.',
      evidence_link_guidelines: '2023 ACC/AHA/ACCP/HRS გაიდლაინი AF მენეჯმენტისთვის',
      evidence_link_original: 'ორიგინალური CHA₂DS₂-VASc ვალიდაციის კვლევა (Lip და სხვ., 2010)',
      
      // Clinical pearls
      clinical_pearls_title: 'კლინიკური მახასიათებლები',
      clinical_pearl_1: 'მდედრობითი სქესი ინსულტის რისკს წარმოქმნის მხოლოდ ≥1 სხვა ინსულტის რისკ ფაქტორის არსებობისას. CHA₂DS₂-VASc ქულა 1 ქალებში (მხოლოდ სქესის კატეგორია) ითვლება დაბალ რისკად.',
      clinical_pearl_2: 'ქულა საუკეთესოდ მუშაობს ნამდვილად დაბალი რისკის პაციენტების გამოსავლენად (ქულა 0 მამაკაცებში, 1 ქალებში), რომლებსაც შეიძლება არ ჭირდებოდეთ ანტიკოაგულაცია.',
      clinical_pearl_3: 'წლიური ინსულტის რისკი პროგრესულად იზრდება მაღალი ქულის შემთხვევაში, 0.2%-დან ქულა 0-ზე, >10%-მდე ქულებზე ≥7.',
      clinical_pearl_4: 'პირდაპირი ორალური ანტიკოაგულანტები (DOAC-ები) უპირატესია ვარფარინზე AF-ის მქონე პაციენტების უმრავლესობისთვის, რომლებსაც ესაჭიროებათ ანტიკოაგულაცია, თუ უკუჩვენება არ არის.'
    },
    
    // HAS-BLED section
    hasbled: {
      title: 'HAS-BLED ქულა',
      description: 'სისხლდენის რისკის შეფასება ანტიკოაგულაციური თერაპიის დროს',
      
      // Risk factors
      risk_factors_title: 'სისხლდენის რისკის ფაქტორები (თითოეული 1 ქულა)',
      hypertension_label: 'არაკონტროლირებადი ჰიპერტენზია (სისტოლური BP >160 mmHg)',
      abnormal_renal_label: 'პათოლოგიური თირკმლის ფუნქცია (დიალიზი, ტრანსპლანტაცია, კრეატინინი >200 μmol/L)',
      abnormal_liver_label: 'პათოლოგიური ღვიძლის ფუნქცია (ციროზი, ბილირუბინი >2x ნორმალური, ALT/AST >3x ნორმალური)',
      stroke_label: 'ინსულტის ისტორია',
      bleeding_label: 'სისხლდენის ისტორია ან მიდრეკილება',
      labile_inr_label: 'არასტაბილური INR (არასტაბილური/მაღალი INR, <60% დრო თერაპიულ დიაპაზონში)',
      elderly_label: 'ხანდაზმულობა (>65 წელი)',
      drugs_label: 'წამლები ან ალკოჰოლი (ანტიაგრეგანტული აგენტები, NSAID-ები)',
      alcohol_label: 'ალკოჰოლი (≥8 სმა კვირაში)',
      
      // Buttons
      calculate_button: 'ქულის გამოთვლა',
      reset_button: 'გადატვირთვა',
      
      // Results
      score_label: 'HAS-BLED ქულა',
      annual_bleeding_risk: 'წლიური სისხლდენის რისკი',
      risk_category: 'რისკის კატეგორია',
      recommendation: 'რეკომენდაცია',

      // Author Information
      author_title: 'შემქმნელისგან',
      author_name: 'დოქტორი რონ პისტერსი, MD, PhD',
      author_bio: 'დოქტორი რონ პისტერსი არის კარდიოლოგი Rijnstate საავადმყოფოში, ნიდერლანდები, სპეციალიზირებული წინაგულების ფიბრილაციისა და ანტითრომბოტული მენეჯმენტის მიმართულებით.',
      author_key_message_title: 'მთავარი კლინიკური შეტყობინება',
      author_key_message: 'HAS-BLED უნდა გამოიყენებოდეს როგორც კლინიკური ინსტრუმენტი მოდიფიცირებადი სისხლდენის რისკ ფაქტორების გამოსავლენად და მოსაგვარებლად, არა როგორც ანტიკოაგულაციის აბსოლუტური უკუჩვენება. გახსოვდეთ: AF-ის მქონე პაციენტების უმეტესობაში ინსულტის რისკი აღემატება სისხლდენის რისკს.',
      author_pubmed_link: 'იხილეთ დოქტორ რონ პისტერსის პუბლიკაციები PubMed-ზე',
      
      // Formula Section
      formula_title: 'ფორმულა',
      formula_description: 'არჩეული ქულების შეკრება:',
      formula_note: 'HAS-BLED არის აკრონიმი Hypertension (ჰიპერტენზია), Abnormal liver/renal function (ღვიძლის/თირკმლის პათოლოგიური ფუნქცია), Stroke history (ინსულტის ისტორია), Bleeding predisposition (სისხლდენისადმი მიდრეკილება), Labile INR (არასტაბილური INR), Elderly (ხანდაზმულობა), Drug/alcohol usage (წამლების/ალკოჰოლის გამოყენება).',
      
      // Risk Table
      facts_figures_title: 'ფაქტები და ციფრები',
      risk_table_title: 'HAS-BLED ქულის რისკის შეფასება',
      risk_table_score: 'ქულა',
      risk_table_group: 'რისკის ჯგუფი',
      risk_table_major_bleeding: 'დიდი სისხლდენის რისკი**',
      risk_table_bleeds_per_100: 'სისხლდენები 100 პაციენტ-წელზე***',
      risk_table_recommendation: 'რეკომენდაცია',
      
      // Risk Groups
      risk_low: 'დაბალი',
      risk_moderate: 'საშუალო', 
      risk_high: 'მაღალი',
      risk_very_high: 'ძალიან მაღალი',
      
      // Risk Recommendations
      risk_rec_0_1: 'ანტიკოაგულაცია უნდა განიხილებოდეს',
      risk_rec_2: 'ანტიკოაგულაცია შეიძლება განიხილებოდეს',
      risk_rec_3_4: 'ანტიკოაგულაციის ალტერნატივები უნდა განიხილებოდეს',
      risk_rec_5_plus: '5-ზე მეტი ქულები იყო ძალიან იშვიათი რისკის განსასაზღვრად, მაგრამ სავარაუდოდ აღემატება 10%-ს',
      
      // Evidence Section
      evidence_title: 'მტკიცებულებების შეფასება',
      evidence_development: 'HAS-BLED ქულა შემუშავდა 2010 წელს, როგორც პრაქტიკული რისკის ქულა წინაგულების ფიბრილაციის (AF) მქონე პაციენტებში 1-წლიანი დიდი სისხლდენის რისკის შესაფასებლად. ორიგინალური კვლევა იყენებდა პროსპექტიული Euro Heart Survey on AF-ის მონაცემებს და მოიცავდა 3456 ამბულატორ და ჰოსპიტალიზებულ პაციენტს AF-ით და ერთწლიანი მიდევნების სტატუსით დიდი სისხლდენის მიმართ, და მიტრალური სარქვლის სტენოზის ან სარქვლის ქირურგიის გარეშე.',
      evidence_validation: 'HAS-BLED ქულის მრავალი გარე ვალიდაცია იქნა გამოქვეყნებული. 2020 წლის ქსელური მეტა-ანალიზმა 18 კვლევისა აჩვენა, რომ HAS-BLED არის ყველაზე დაბალანსებული პროგნოსტიკული ქულა დიდი სისხლდენისთვის მგრძნობელობისა და სპეციფიკურობის თვალსაზრისით, სხვა თანამედროვე ქულებთან შედარებით.',
      evidence_guidelines: 'HAS-BLED ქულის სიმარტივემ და ვრცელმა გარე ვალიდაციებმა გამოიწვია ფართო კლინიკური მიღება, ESC 2020 წლის გაიდლაინები სპეციალურად რეკომენდებას უწევენ HAS-BLED-ს AF პაციენტებში სისხლდენის რისკის შესაფასებლად.',
      evidence_limitations: 'ასეთი თავშეკავება, სულ მცირე ნაწილობრივ, განპირობებული იყო იმ ფაქტით, რომ HAS-BLED ქულა შემუშავდა მაშინ, როდესაც DOAC-ები ახლად შემოდიოდა გამოყენებაში, რაც ეჭვქვეშ აყენებს HAS-BLED-ის პროგნოზულ სიზუსტეს თანამედროვე, DOAC-ების მომხმარებელ პაციენტთა ჯგუფებში.',
      
      // Reference Links
      reference_original: 'ორიგინალური კვლევა: Pisters და სხვ. (2010)',
      reference_validation: 'ვალიდაციის კვლევა: Lip და სხვ. (2011)',
      reference_guidelines_2020: '2020 ESC გაიდლაინები',
      reference_guidelines_2023: '2023 ACC/AHA/ACCP/HRS გაიდლაინები'
    },
    
    // Common labels
    score_points: '{{score}} ქულა',
    risk_percentage: '{{risk}}% წელიწადში',
    
    // Validation messages
    validation: {
      age_required: 'ასაკი აუცილებელია',
      age_range: 'ასაკი უნდა იყოს 18-120 წლის შორის',
      sex_required: 'სქესის მითითება აუცილებელია'
    }
  },

  // CHA2DS2-VASc Calculator - UPDATED TO PATTERN COMPLIANCE
  chads_vasc: {
    title: "CHA2DS2-VASc კალკულატორი",
    subtitle: "ინსულტის რისკის შეფასება წინაგულების ფიბრილაციისას",
    description: "რისკის სტრატიფიკაცია ინსულტისთვის არავარქვლოვანი წინაგულების ფიბრილაციის მქონე პაციენტებში.",
    calculate_button: "CHA2DS2-VASc-ის გამოთვლა",
    risk_category: "რისკის კატეგორია",
    recommendations: "კლინიკური რეკომენდაციები",
    low_risk: "დაბალი რისკი (0 ქულა)",
    high_risk: "მაღალი რისკი (≥2 ქულა)",
    
    // Risk factors
    congestive_heart_failure_label: "შეგუბებითი გულის უკმარისობა",
    hypertension_label: "ჰიპერტენზია",
    age_75_label: "ასაკი ≥75 წელი",
    diabetes_label: "შაქრიანი დიაბეტი",
    stroke_tia_label: "წინა ინსულტი/TIA",
    vascular_disease_label: "ვასკულარული დაავადება",
    age_65_74_label: "ასაკი 65-74 წელი",
    female_sex_label: "მდედრობითი სქესი",
    
    // Section headers
    risk_factors: "რისკის ფაქტორები",
    
    // Results
    chads_vasc_score: "CHA2DS2-VASc ქულა",
    annual_stroke_risk: "წლიური ინსულტის რისკი",
    anticoagulation_recommendation: "ანტიკოაგულაციის რეკომენდაცია",
    
    // Recommendations
    no_anticoagulation: "ანტიკოაგულაცია არ არის ნაჩვენები. გააგრძელეთ რისკის ფაქტორების წლიური მონიტორინგი.",
    consider_anticoagulation: "განიხილეთ ორალური ანტიკოაგულაცია ინდივიდუალური პაციენტის მახასიათებლებისა და ერთობლივი გადაწყვეტილების მიღების საფუძველზე.",
    anticoagulation_recommended: "ორალური ანტიკოაგულაცია რეკომენდირებულია, თუ უკუჩვენება არ არის. უმეტეს პაციენტებში DOAC-ებს ვარფარინზე უპირატესობა ენიჭება."
  },

  // HAS-BLED Calculator - UPDATED TO PATTERN COMPLIANCE
  has_bled: {
    title: "HAS-BLED კალკულატორი",
    subtitle: "სისხლდენის რისკის შეფასება ანტიკოაგულაციური თერაპიის დროს",
    description: "დიდი სისხლდენის რისკის შეფასება AF პაციენტებში, რომლებიც იღებენ ანტიკოაგულანტებს.",
    calculate_button: "HAS-BLED-ის გამოთვლა",
    risk_category: "რისკის კატეგორია",
    recommendations: "კლინიკური რეკომენდაციები",
    low_risk: "დაბალი რისკი (0-2 ქულა)",
    high_risk: "მაღალი რისკი (≥3 ქულა)",
    
    // Risk factors
    hypertension_label: "არაკონტროლირებადი ჰიპერტენზია",
    abnormal_renal_function_label: "პათოლოგიური თირკმლის ფუნქცია",
    abnormal_liver_function_label: "პათოლოგიური ღვიძლის ფუნქცია",
    stroke_label: "წინა ინსულტი",
    bleeding_history_label: "სისხლდენის ისტორია",
    labile_inr_label: "არასტაბილური INR",
    elderly_label: "ხანდაზმული (>65 წელი)",
    drugs_alcohol_label: "წამლები/ალკოჰოლი",
    
    // Section headers
    risk_factors: "რისკის ფაქტორები",
    
    // Results
    has_bled_score: "HAS-BLED ქულა",
    annual_bleeding_risk: "წლიური სისხლდენის რისკი",
    clinical_recommendation: "კლინიკური რეკომენდაციები"
  },

  // CHADS2 Calculator - UPDATED TO PATTERN COMPLIANCE
  chads2: {
    title: "CHADS2 კალკულატორი",
    subtitle: "კლასიკური ინსულტის რისკის შეფასება წინაგულების ფიბრილაციისას",
    description: "ორიგინალური ინსულტის რისკის სტრატიფიკაციის სკალა არავარქვლოვანი AF-ისთვის.",
    calculate_button: "CHADS2-ის გამოთვლა",
    risk_category: "რისკის კატეგორია",
    recommendations: "კლინიკური რეკომენდაციები",
    low_risk: "დაბალი რისკი (0 ქულა)",
    high_risk: "მაღალი რისკი (≥2 ქულა)",
    
    // Risk factors
    congestive_heart_failure_label: "შეგუბებითი გულის უკმარისობა",
    hypertension_label: "ჰიპერტენზია",
    age_75_label: "ასაკი ≥75 წელი",
    diabetes_label: "შაქრიანი დიაბეტი",
    stroke_tia_label: "წინა ინსულტი/TIA",
    
    // Section headers
    risk_factors: "რისკის ფაქტორები",
    
    // Results
    chads2_score: "CHADS2 ქულა",
    annual_stroke_risk: "წლიური ინსულტის რისკი",
    anticoagulation_recommendation: "ანტიკოაგულაციის რეკომენდაცია"
  }
}; 