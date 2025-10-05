// TIMI Risk Score Calculator - Georgian Translations
// Extracted from cardiology.ts for improved maintainability

export const timiRiskScoreTranslations = {
  title: 'TIMI რისკის კალკულატორი',
  subtitle: 'არასტაბილური ანგინა/NSTEMI • რისკის შეფასება',
  description: 'რისკის სტრატიფიკაცია არასტაბილური სტენოკარდიისა და NSTEMI-ს მქონე პაციენტებისთვის.',
  
  // Emergency alert - MISSING KEYS ADDED
  emergency_tool: 'საგანგებო რისკის შეფასების ინსტრუმენტი',
  tool_description: 'TIMI რისკის ქულა არასტაბილური სტენოკარდიისა და NSTEMI-ს მქონე პაციენტების სწრაფი შეფასებისთვის. ეს ინსტრუმენტი გვეხმარება საგანგებო პირობებში რისკის სტრატიფიკაციასა და მართვის გადაწყვეტილებების მიღებაში.',
  
  // Step navigation - MISSING KEYS ADDED
  patient_info: 'პაციენტის ინფორმაცია',
  clinical_factors: 'კლინიკური ფაქტორები',
  
  alert_title: 'TIMI რისკის შეფასება',
  alert_description: 'მტკიცებულებებით დამოწმებული რისკის ქულა მწვავე კორონარული სინდრომების დროს',
  
  demographics_section: 'პაციენტის დემოგრაფია',
  demographics_description: 'ძირითადი პაციენტის ინფორმაცია',
  
  // Clinical Assessment section - MISSING KEYS ADDED
  clinical_assessment: 'კლინიკური შეფასება',
  clinical_assessment_description: 'აირჩიეთ ყველა კლინიკური ფაქტორი, რომელიც ერგება ამ პაციენტს:',
  
  age_label: 'ასაკი',
  age_help: 'პაციენტის ასაკი წლებში',
  age_error: 'ასაკი უნდა იყოს 18-120 წლის შუალედში',
  
  clinical_section: 'კლინიკური რისკ ფაქტორები',
  clinical_description: 'კორონარული დაავადების რისკ ფაქტორები',
  cad_risk_factors: 'CAD რისკ ფაქტორები (≥3)',
  cad_risk_factors_desc: 'ოჯახური ანამნეზი, ჰიპერტენზია, ჰიპერქოლესტერინემია, დიაბეტი, ან მოწევა',
  
  // Risk factors detail explanation - MISSING KEY ADDED
  risk_factors_detail: 'რისკ ფაქტორები მოიცავს: CAD-ის ოჯახურ ანამნეზს, ჰიპერტენზიას, ჰიპერქოლესტერინემიას, შაქრიან დიაბეტს, ამჟამინდელ მოწევას',
  
  known_cad: 'ცნობილი CAD (≥50% სტენოზი)',
  known_cad_desc: 'კორონარული არტერიის დაავადება ≥50% სტენოზით',
  aspirin_use: 'ასპირინის გამოყენება ბოლო 7 დღეში',
  aspirin_use_desc: 'ასპირინის გამოყენება წინა კვირის განმავლობაში',
  severe_angina: 'მძიმე ანგინა (≥2 ეპიზოდი 24 საათში)',
  severe_angina_desc: 'მძიმე სტენოკარდიის ორი ან მეტი ეპიზოდი ბოლო 24 საათში',
  st_deviation: 'ST გადახრა ≥0.5მმ',
  st_deviation_desc: 'ST სეგმენტის გადახრა ≥0.5მმ',
  elevated_markers: 'მომატებული გულის მარკერები',
  elevated_markers_desc: 'ტროპონინი ან CK-MB მომატებული',
  
  // Additional biomarkers key - MISSING KEY ADDED
  elevated_biomarkers: 'მომატებული გულის ბიომარკერები',
  elevated_biomarkers_desc: 'მომატებული ტროპონინი, CK-MB, ან სხვა გულის მარკერები',
  
  // Navigation - MISSING KEYS ADDED
  next_clinical_factors: 'შემდეგი: კლინიკური ფაქტორები',
  
  // Results section - MISSING KEYS ADDED
  calculate_button: 'TIMI რისკის გამოთვლა',
  score_analysis: 'TIMI რისკის ანალიზი',
  timi_score: 'TIMI ქულა',
  fourteen_day_breakdown: '14-დღიანი რისკის გაანალიზება',
  fourteen_day_risk: '14-დღიანი რისკი',
  mortality: 'სიკვდილობა',
  myocardial_infarction: 'მიოკარდიუმის ინფარქტი',
  urgent_revascularization: 'სასწრაფო რევასკულარიზაცია',
  
  composite_endpoint: 'კომბინირებული ბოლო წერტილი',
  death_mi_revascularization: 'სიკვდილი, MI ან სასწრაფო რევასკულარიზაცია',
  risk_category: 'რისკის კატეგორია',
  management_strategy: 'მართვის სტრატეგია',
  management_urgency: 'მართვის სისწრაფე',
  recommended_timeframe: 'რეკომენდირებული დროის ჩარჩო:',
  
  // Time frames - MISSING KEYS ADDED
  timeframe_under_24: '< 24 საათი',
  timeframe_24_48: '24-48 საათი',
  timeframe_24_72: '24-72 საათი',
  
  // Risk categories
  low_risk: 'დაბალი რისკი (0-2 ქულა)',
  intermediate_risk: 'საშუალო რისკი (3-4 ქულა)',
  high_risk: 'მაღალი რისკი (5-7 ქულა)',
  
  // Management recommendations - MISSING KEYS ADDED
  conservative_management: 'კონსერვატული მართვა',
  routine_management: 'რუტინული მართვა',
  early_invasive_strategy: 'ადრეული ინვაზიური სტრატეგია',
  early_intervention: 'ადრეული ჩარევა',
  urgent_invasive_strategy: 'სასწრაფო ინვაზიური სტრატეგია',
  urgent_management: 'სასწრაფო მართვა',
  
  // Score components - MISSING KEYS ADDED
  score_components: 'ქულის კომპონენტები',
  age_component: 'ასაკი ≥65 წელი',
  cad_risk_factors_component: '≥3 CAD რისკ ფაქტორი',
  known_cad_component: 'ცნობილი CAD (≥50% სტენოზი)',
  aspirin_component: 'ასპირინი (წინა 7 დღე)',
  angina_component: 'მძიმე ანგინა (≥2 ეპიზოდი/24სთ)',
  st_component: 'ST გადახრა ≥0.5მმ',
  biomarkers_component: 'მომატებული გულის მარკერები',
  
  // Clinical strategy - MISSING KEY ADDED
  clinical_strategy: 'კლინიკური მართვის სტრატეგია',
  
  // Footer - MISSING KEYS ADDED
  based_on_timi: 'TIMI რისკის ქულაზე დაფუძნებული',
  clinically_validated: 'კლინიკურად ვალიდირებული რისკის შეფასების ინსტრუმენტი',
  
  // Interpretations (dynamic) - MISSING KEYS ADDED
  interpretation_low: 'დაბალი რისკის პაციენტი {{risk}}%-იანი 14-დღიანი არახელსაყრელი შედეგების რისკით',
  interpretation_intermediate: 'საშუალო რისკის პაციენტი {{risk}}%-იანი 14-დღიანი არახელსაყრელი შედეგების რისკით',
  interpretation_high: 'მაღალი რისკის პაციენტი {{risk}}%-იანი 14-დღიანი არახელსაყრელი შედეგების რისკით',
  
  // Recommendations (dynamic) - MISSING KEYS ADDED
  recommendation_low_0: 'კონსერვატული მართვა მედიკამენტური თერაპიით',
  recommendation_low_1: 'კონსერვატული მართვა მედიკამენტური თერაპიით',
  recommendation_low_2: 'კონსერვატული მართვა მჭიდრო მონიტორინგით',
  recommendation_intermediate_3: 'განიხილეთ ადრეული ინვაზიური სტრატეგია 24-48 საათის განმავლობაში',
  recommendation_intermediate_4: 'ადრეული ინვაზიური სტრატეგია რეკომენდირებულია 24 საათის განმავლობაში',
  recommendation_high_5: 'სასწრაფო ინვაზიური სტრატეგია 24 საათის განმავლობაში',
  recommendation_high_6: 'სასწრაფო ინვაზიური სტრატეგია 12-24 საათის განმავლობაში',
  recommendation_high_7: 'დაუყოვნებლივი ინვაზიური სტრატეგია - ყველაზე მაღალი რისკი',
  
  // Simplified category recommendations
  recommendation_low: 'კონსერვატული მართვა მედიკამენტური თერაპიითა და მჭიდრო მონიტორინგით. განიხილეთ ადრეული გაწერა ამბულატორიული თვალყურის დევნებით.',
  recommendation_intermediate: 'ადრეული ინვაზიური სტრატეგია 24-48 საათის განმავლობაში რეკომენდირებულია. ჰოსპიტალიზაცია კარდიოლოგის კონსულტაციით რეკომენდებულია.',
  recommendation_high: 'სასწრაფო ინვაზიური სტრატეგია 24 საათის განმავლობაში აუცილებელია. დაუყოვნებელი კარდიოლოგიური კონსულტაცია და აგრესიული მედიკამენტური თერაპია მითითებულია.',
  
  // Risk factor descriptions - MISSING KEYS ADDED
  coronary_risk_factors: 'კორონარული არტერიის დაავადების რისკ ფაქტორები',
  risk_factors_help: 'CAD რისკ ფაქტორების რაოდენობა (0-3+)',
  cad_risk_factors_label: '≥3 CAD რისკ ფაქტორი',
  known_cad_label: 'ცნობილი CAD (სტენოზი ≥50%)',
  aspirin_use_label: 'ასპირინის გამოყენება წინა 7 დღეში',
  severe_angina_label: 'მძიმე ანგინა (≥2 ეპიზოდი 24 საათში)',
  st_deviation_label: 'ST გადახრა ≥0.5მმ',
  elevated_markers_label: 'მომატებული გულის მარკერები',
  
  // Algorithm validation
  algorithm_validation: 'TIMI რისკის ქულა მტკიცებულებებით დამოწმებულია რანდომიზებულ კონტროლირებად ცდებში და ვალიდირებულია მრავალ პოპულაციაში NSTEMI/UA შეფასებისთვის.',
  
  // About the Creator
  about_creator_title: 'შემქმნელის შესახებ',
  creator_name: 'დ-რ ელიოტ მ. ანტმანი',
  creator_description: 'ელიოტ მ. ანტმანი, M.D., არის პროფესორი და ასოცირებული დეკანი კლინიკური/ტრანსლაციური კვლევების მიმართულებით ჰარვარდის სამედიცინო სკოლაში. ის ასევე არის უფროსი ექიმი მასაჩუსეტსის ბრიგამისა და ქალების ჰოსპიტალის კარდიოვასკულარულ განყოფილებაში და ამერიკული გულის ასოციაციის პრეზიდენტი (2014-2015). როგორც TIMI კვლევითი ჯგუფის უფროსი მკვლევარი, დ-რ ანტმანმა გამოაქვეყნა ნაშრომები შრატის გულის მარკერების გამოყენების შესახებ არასტაბილური ანგინისა და მწვავე მიოკარდიუმის ინფარქტის მქონე პაციენტების დიაგნოზისა და პროგნოზისთვის, ციკლოოქსიგენაზისა და კარდიოვასკულარული რისკის შესახებ, და მწვავე კორონარული სინდრომების ანტითრომბოტული თერაპიის შესახებ.',
  creator_publications: 'დ-რ ელიოტ მ. ანტმანის პუბლიკაციების სანახავად, იხილეთ',
  
  // Evidence Section
  evidence_title: 'მტკიცებულება',
  formula_title: 'ფორმულა',
  formula_description: 'არჩეული ქულების დამატება:',
  variable_age: 'ასაკი ≥65',
  variable_risk_factors: '≥3 CAD რისკ ფაქტორი*',
  variable_known_cad: 'ცნობილი CAD (სტენოზი ≥50%)',
  variable_aspirin: 'ASA გამოყენება წინა 7 დღეში',
  variable_angina: 'მძიმე ანგინა (≥2 ეპიზოდი 24 საათში)',
  variable_st_changes: 'EKG ST ცვლილებები ≥0.5მმ',
  variable_st_deviation: 'ST გადახრა ≥0.5მმ',
  variable_biomarkers: 'დადებითი გულის მარკერი',
  risk_factors_note: '*CAD რისკ ფაქტორები: CAD-ის ოჯახური ანამნეზი, ჰიპერტენზია, ჰიპერქოლესტერინემია, დიაბეტი, ან ამჟამინდელი მოწევა',
  
  // Evidence Appraisal
  evidence_appraisal_title: 'მტკიცებულების შეფასება',
  evidence_appraisal_description: 'ანტმანმა და თანაავტორებმა (2000) გამოიყენეს გაერთიანებული მონაცემთა ბაზა 7,081 UA/NSTEMI პაციენტისგან TIMI 11B და ESSENCE კვლევებში ამ TIMI რისკის ქულის თავდაპირველი წარმოებისა და ვალიდაციისთვის UA/NSTEMI-სთვის. რისკის ქულა თავდაპირველად წარმოიშვა 1,957 UA/NSTEMI პაციენტისგან, რომლებიც იღებდნენ ნეფრაქციონირებულ ჰეპარინს TIMI 11B კვლევაში და შინაგანად ვალიდირდა 3 კოჰორტაში გაერთიანებული მონაცემების დანარჩენი ნაწილიდან: 1,953 პაციენტი, რომლებიც იღებდნენ ენოქსაპარინს TIMI 11B კვლევაში, 1,564 პაციენტი, რომლებიც იღებდნენ ნეფრაქციონირებულ ჰეპარინს ESSENCE კვლევაში, და 1,607 პაციენტი, რომლებიც იღებდნენ ენოქსაპარინს ESSENCE კვლევაში.',
  validation_studies: '14 დღის ბოლოს, წარმოების ჯგუფის 16.7% გარდაიცვალა, განიცადა მიოკარდიუმის ინფარქტი ან საჭიროებდა ფსიალ რევასკულარიზაციას. TIMI ქულის ზრდა კორელირებდა საერთო სიკვდილიანობის, MI ან სასწრაფო რევასკულარიზაციის ზრდასთან. იგივე მოდელი ჩანდა შინაგანად ვალიდირებულ ჯგუფებში. მისი წარმოების მომენტიდან ჩატარდა მრავალი გარე ვალიდაციური კვლევა.',
  validation_studies_title: 'ვალიდაციის კვლევები',
  external_validation: 'გარე ვალიდაციური კვლევები შირიკასა და თანაავტორების (2002), პოლაკისა და თანაავტორების (2006), და ჩეისისა და თანაავტორების (2006) მიერ მუდმივად აჩვენებს TIMI რისკის ქულის პროგნოსტულ ღირებულებას მრავალფეროვან პაციენტთა პოპულაციებში, მათ შორის განურჩევადი მკერდის ტკივილის მქონე პაციენტებში საგანგებო დახმარების განყოფილების პირობებში.',
  
  // Literature
  literature_title: 'ლიტერატურა',
  original_reference_title: 'ორიგინალური/პირველადი ცნობა',
  original_reference: 'Antman EM, Cohen M, Bernink PJLM, McCabe CH, Hoacek T, Papuchis G, Mautner B, Corbalan R, Radley D, Braunwald E. TIMI რისკის ქულა არასტაბილური ანგინა/არა-ST ასასვლელი MI-სთვის: პროგნოზირებისა და თერაპიული გადაწყვეტილების მიღების მეთოდი JAMA. 2000;284(7):835-42.',
  validation_title: 'ვალიდაცია',
  validation_pollack: 'Pollack CV, Sites FD, Shofer FS, Sease KL, Hollander JE. TIMI რისკის ქულის გამოყენება არასტაბილური ანგინისა და არა-ST ასასვლელი მწვავე კორონარული სინდრომისთვის არაგადარჩეული საგანგებო დახმარების განყოფილების მკერდის ტკივილის პოპულაციაში. Acad Emerg Med. 2006;13(1):13-18.',
  validation_scirica: 'Scirica BM, Cannon CP, Antman EM, Murphy SA, Morrow DA, Sabatine MS, McCabe CH, Gibson CM, Braunwald E. თრომბოლიზისის მიოკარდიუმის ინფარქტში (TIMI) რისკის ქულის ვალიდაცია არასტაბილური ანგინა პექტორისისა და არა-ST ასასვლელი მიოკარდიუმის ინფარქტისთვის TIMI III რეგისტრში. Am J Cardiol. 2002;90(3):303-5.',
  validation_chase: 'Chase M, Robey JL, Zogby KE, Sease KL, Shofer FS, Hollander JE. თრომბოლიზისის მიოკარდიუმის ინფარქტში რისკის ქულის პროსპექტული ვალიდაცია საგანგებო დახმარების განყოფილების მკერდის ტკივილის პოპულაციაში. Ann Emerg Med. 2006;48(3):252-9.',
  other_references_title: 'სხვა ცნობები',
  other_reference: 'Than M, Cullen L, Aldous S, et al. 2-საათიანი დაჩქარებული დიაგნოსტიკური პროტოკოლი მკერდის ტკივილის სიმპტომების მქონე პაციენტების შესაფასებლად თანამედროვე ტროპონინების გამოყენებით როგორც ერთადერთი ბიომარკერი: ADAPT კვლევა. J Am Coll Cardiol. 2012;59(23):2091-8.',
  
  new_assessment: 'ახალი შეფასება',
  modify_inputs: 'შეცვალეთ მონაცემები'
}; 