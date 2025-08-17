export default {
  title: 'სიეტლის გულის უკმარისობის მოდელი (SHFM)',
  subtitle: 'სიცოცხლიანობის  პროგნოზი და თერაპიის ზეგავლენის ანალიზი',
  description: 'მტკიცებულებაზე დაფუძნებული სიცოცხლიანობის  პროგნოზის მოდელი გულის უკმარისობის პაციენტების მკურნალობის ოპტიმიზაციისთვის.',
  calculate_button: 'სიცოცხლიანობის  გამოთვლა',
  
  // Alert section
  alert_title: 'სიეტლის გულის უკმარისობის მოდელი',
  alert_description: 'ვალიდური სიცოცხლიანობის  პროგნოზის მოდელი, რომელიც აფასებს 1-, 2-, 3- და 5-წლიან სიცოცხლიანობის  მაჩვენებლებს გულის უკმარისობის პაციენტებში. ეს ინსტრუმენტი ასევე აანალიზებს სხვადასხვა თერაპიის პოტენციურ ზემოქმედებას მკურნალობის გადაწყვეტილებების ოპტიმიზაციისთვის.',
  
  // Progress steps
  demographics_step: 'დემოგრაფია',
  clinical_step: 'კლინიკური',
  laboratory_step: 'ლაბორატორია',
  therapy_step: 'თერაპია',
  
  // Step descriptions
  demographics_description: 'პაციენტის დემოგრაფიული მონაცემები და საწყისი მახასიათებლები სიცოცხლიანობის  პროგნოზისთვის',
  clinical_description: 'კრიტიკული კლინიკური პარამეტრები, მათ შორის ფუნქციური სტატუსი და ჰემოდინამიკა',
  laboratory_description: 'კრიტიკული ლაბორატორიული პარამეტრები სიცოცხლიანობის  პროგნოზისთვის',
  therapy_description: 'მიმდინარე მედიკამენტები და მოწყობილობები ზემოქმედების ანალიზისთვის',
  
  // Demographics section
  patient_demographics: 'პაციენტის დემოგრაფიული მონაცემები',
  age_label: 'ასაკი',
  age_placeholder: 'ჩაწერეთ ასაკი',
  gender_label: 'სქესი',
  gender_placeholder: 'აირჩიეთ სქესი',
  gender_male: 'მამრობითი',
  gender_female: 'მდედრობითი',
  
  // Clinical parameters
  clinical_parameters: 'კლინიკური პარამეტრები',
  lvef_label: 'მარცხენა პარკუჭის განდევნის ფრაქცია (ფვ)',
  lvef_placeholder: 'ჩაწერეთ ფვ (%)',
  nyha_class_label: 'NYHA ფუნქციური კლასი',
  nyha_class_placeholder: 'აირჩიეთ NYHA კლასი',
  nyha_class_1: 'კლასი I - შეზღუდვის გარეშე',
  nyha_class_2: 'კლასი II - მცირე შეზღუდვა',
  nyha_class_3: 'კლასი III - გამოხატული შეზღუდვა',
  nyha_class_4: 'კლასი IV - მძიმე შეზღუდვა',
  ischemic_etiology_label: 'იშემიური ეტიოლოგია',
  systolic_bp_label: 'სისტოლური არტერიული წნევა',
  systolic_bp_placeholder: '120',
  peak_vo2_label: 'პიკური VO₂',
  peak_vo2_placeholder: '14.0',
  
  // Laboratory values
  laboratory_values: 'ლაბორატორიული შეფასება',
  sodium_label: 'შრატის ნატრიუმი',
  sodium_placeholder: '140',
  cholesterol_label: 'მთლიანი ქოლესტერინი',
  cholesterol_placeholder: '180',
  hemoglobin_label: 'ჰემოგლობინი',
  hemoglobin_placeholder: '12.5',
  lymphocyte_percent_label: 'ლიმფოციტების პროცენტი',
  lymphocyte_percent_placeholder: '20',
  uric_acid_label: 'შარდმჟავა',
  uric_acid_placeholder: '7.0',
  
  // Therapy assessment
  therapy_assessment: 'მიმდინარე თერაპიის შეფასება',
  ace_inhibitor_label: 'ACE ინჰიბიტორი ან ARB',
  beta_blocker_label: 'ბეტა-ბლოკატორი',
  aldosterone_antagonist_label: 'ალდოსტერონის ანტაგონისტი',
  statin_label: 'სტატინი',
  allopurinol_label: 'ალოპურინოლი',
  icd_label: 'იმპლანტირებადი კარდიოვერტერ-დეფიბრილატორი (ICD)',
  crt_label: 'კარდიო რესინქრონიზაციის თერაპია (CRT)',
  
  // Navigation buttons
  next_clinical_data: 'შემდეგი: კლინიკური მონაცემები',
  next_laboratory_data: 'შემდეგი: ლაბორატორიული მონაცემები',
  next_therapy_data: 'შემდეგი: თერაპიული შეფასება',
  
  // Results and risk categories
  shfm_low_risk: 'დაბალი რისკი',
  shfm_intermediate_risk: 'საშუალო რისკი',
  shfm_high_risk: 'მაღალი რისკი',
  shfm_very_high_risk: 'ძალიან მაღალი რისკი',
  
  // Validation messages
  age_required: 'ასაკი აუცილებელია',
  age_invalid: 'ასაკი უნდა იყოს 18-დან 120 წლამდე',
  gender_required: 'სქესი აუცილებელია',
  lvef_required: 'ფვ აუცილებელია',
  lvef_invalid: 'ფვ უნდა იყოს 5%-დან 80%-მდე',
  nyha_class_required: 'NYHA კლასი აუცილებელია',
  systolic_bp_required: 'სისტოლური არტერიული წნევა აუცილებელია',
  systolic_bp_invalid: 'სისტოლური არტერიული წნევა უნდა იყოს 60-დან 250 მმ ვ.სვ.-მდე',
  peak_vo2_required: 'პიკური VO₂ აუცილებელია',
  peak_vo2_invalid: 'პიკური VO₂ უნდა იყოს 5-დან 50 მლ/კგ/წთ-მდე',
  sodium_required: 'შრატის ნატრიუმი აუცილებელია',
  sodium_invalid: 'ნატრიუმი უნდა იყოს 120-დან 160 მეკვ/ლ-მდე',
  cholesterol_required: 'მთლიანი ქოლესტერინი აუცილებელია',
  cholesterol_invalid: 'ქოლესტერინი უნდა იყოს 50-დან 500 მგ/დლ-მდე',
  hemoglobin_required: 'ჰემოგლობინი აუცილებელია',
  hemoglobin_invalid: 'ჰემოგლობინი უნდა იყოს 5-დან 20 გ/დლ-მდე',
  lymphocyte_percent_required: 'ლიმფოციტების პროცენტი აუცილებელია',
  lymphocyte_percent_invalid: 'ლიმფოციტების პროცენტი უნდა იყოს 1%-დან 50%-მდე',
  uric_acid_required: 'შარდმჟავა აუცილებელია',
  uric_acid_invalid: 'შარდმჟავა უნდა იყოს 2-დან 20 მგ/დლ-მდე'
};