export const caseManagement = {
  // Modal Header
  createNewCase: 'ახალი შემთხვევის შექმნა',
  editCaseStudy: 'შემთხვევის რედაქტირება',
  cardiologyCase: 'კარდიოლოგიის შემთხვევა',
  obgynCase: 'აკუშერობა-გინეკოლოგიის შემთხვევა',
  medicalCase: 'სამედიცინო შემთხვევა',

  // Step Headers
  caseOverview: 'შემთხვევის მიმოხილვა',
  caseOverviewDesc: 'ძირითადი ინფორმაცია',
  patientDetails: 'პაციენტის დეტალები',
  patientDetailsDesc: 'ანონიმური პაციენტის მონაცემები',
  attachments: 'დანართები',
  attachmentsDesc: 'სამედიცინო ფაილები და სურათები',
  classification: 'კლასიფიკაცია',
  classificationDesc: 'კატეგორია და სირთულე',

  // Step 1: Case Overview
  letsStartBasics: 'დავიწყოთ საფუძვლებით',
  provideOverview: 'მიუთითეთ შემთხვევის მკაფიო სათაური და მოკლე მიმოხილვა',
  caseTitle: 'შემთხვევის სათაური',
  caseTitleRequired: 'შემთხვევის სათაური *',
  caseTitlePlaceholder: 'შემთხვევის მოკლე აღწერითი სათაური',
  briefDescription: 'მოკლე აღწერა',
  briefDescriptionRequired: 'მოკლე აღწერა *',
  briefDescriptionPlaceholder: 'მიუთითეთ შემთხვევის ყოვლისმომცველი მიმოხილვა, მათ შორის: მთავარი საჩივარი, შესაბამისი ისტორია, გამოკვლევის მონაცემები, საწყისი შთაბეჭდილება, განსახილველი ძირითადი შეკითხვები და რა კონკრეტული რეკომენდაციები გჭირდებათ...',
  charactersCount: '({count}/1000 სიმბოლო)',
  charactersCountMin: '({count} სიმბოლო, მინიმუმ 50)',
  makeDescriptionEffective: 'გახადეთ თქვენი შემთხვევის აღწერა უფრო ეფექტური:',
  includeChiefComplaint: '• ჩართეთ მთავარი საჩივარი და სიმპტომები',
  mentionHistory: '• მიუთითეთ შესაბამისი სამედიცინო ისტორია და მედიკამენტები',
  describeFindings: '• აღწერეთ გამოკვლევის ან დიაგნოსტიკური მონაცემები',
  stateWorkingDiagnosis: '• მიუთითეთ თქვენი სამუშაო დიაგნოზი ან დიფერენციალური',
  specifyGuidance: '• დააკონკრეტეთ რა რეკომენდაცია ან განხილვა გჭირდებათ',

  // Step 2: Patient Details
  patientInformation: 'პაციენტის ინფორმაცია',
  provideAnonymizedDetails: 'მიუთითეთ პაციენტის ანონიმური დეტალები განსახილველად',
  privacyProtectionRequired: 'საჭიროა კონფიდენციალურობის დაცვა',
  ensureAnonymized: 'გთხოვთ დარწმუნდეთ, რომ პაციენტის ყველა ინფორმაცია სრულად ანონიმურია.',
  removeNames: '• წაშალეთ ყველა სახელი, თარიღი და კონკრეტული ადგილმდებარეობა',
  useGeneralTerms: '• გამოიყენეთ ზოგადი ტერმინები (მაგ., "50 წლის ქალი")',
  removeIdentifyingNumbers: '• წაშალეთ ნებისმიერი იდენტიფიკაციის ნომერი ან კოდი',
  anonymizedPatientInfo: 'ანონიმური პაციენტის ინფორმაცია',
  anonymizedPatientInfoRequired: 'ანონიმური პაციენტის ინფორმაცია *',
  anonymizedPatientInfoPlaceholder: 'პაციენტის ასაკი, სქესი, წარმოდგენილი სიმპტომები, სამედიცინო ისტორია, ტესტის შედეგები და ა.შ. (სრულად ანონიმური)',
  minimumLengthMet: '✓ მინიმალური სიგრძე დაკმაყოფილებულია',
  needMoreCharacters: 'საჭიროა კიდევ {count} სიმბოლო',

  // Step 3: Attachments
  medicalDocuments: 'სამედიცინო დოკუმენტები',
  attachRelevantFiles: 'დაამატეთ შესაბამისი სამედიცინო ფაილები, სურათები და ანგარიშები',
  filesAttached: '{count} ფაილი დამატებულია',
  fileAttached: '{count} ფაილი დამატებულია',
  filesWillBeAnalyzed: 'ეს ფაილები გაანალიზდება თქვენი შემთხვევის უკეთესი კონტექსტის უზრუნველსაყოფად',

  // Step 4: Classification
  caseClassification: 'შემთხვევის კლასიფიკაცია',
  helpOrganize: 'დაეხმარეთ თქვენი შემთხვევის ორგანიზებასა და პრიორიტეტიზაციას',
  category: 'კატეგორია',
  complexityLevel: 'სირთულის დონე',
  complexityLevelRequired: 'სირთულის დონე *',

  // Complexity Levels
  lowComplexity: 'დაბალი სირთულე',
  lowComplexityDesc: 'რუტინული შემთხვევა, მკაფიო წარმოდგენა',
  mediumComplexity: 'საშუალო სირთულე',
  mediumComplexityDesc: 'გარკვეული სირთულე, მრავალი ფაქტორი',
  highComplexity: 'მაღალი სირთულე',
  highComplexityDesc: 'რთული შემთხვევა, მრავალი სპეციალობა',

  // Tags
  tags: 'თეგები',
  tagsOptional: 'თეგები (არასავალდებულო)',
  tagsPlaceholder: 'ჰიპერტენზია, დიაბეტი, გადაუდებელი (მძიმით გამოყოფილი)',
  tagsHelp: 'დაამატეთ შესაბამისი საკვანძო სიტყვები ამ შემთხვევის მოგვიანებით ორგანიზებისა და პოვნის მიზნით',

  // Categories - Cardiology
  diagnosisAssessment: 'დიაგნოზი და შეფასება',
  interventionalCardiology: 'ინტერვენციული კარდიოლოგია',
  electrophysiology: 'ელექტროფიზიოლოგია',
  heartFailure: 'გულის უკმარისობა',
  preventiveCardiology: 'პრევენციული კარდიოლოგია',
  acuteCardiacCare: 'მწვავე კარდიული მოვლა',

  // Categories - OB/GYN
  obstetrics: 'აკუშერობა',
  gynecology: 'გინეკოლოგია',
  reproductiveHealth: 'რეპროდუქციული ჯანმრთელობა',
  maternalFetal: 'დედა-ნაყოფის მედიცინა',
  gynecologicOncology: 'გინეკოლოგიური ონკოლოგია',
  fertilityEndocrinology: 'ფერტილურობა და რეპროდუქციული ენდოკრინოლოგია',

  // Categories - General
  diagnosis: 'დიაგნოზი',
  treatment: 'მკურნალობა',
  consultation: 'კონსულტაცია',

  // Buttons
  previous: 'წინა',
  next: 'შემდეგი',
  createCase: 'შემთხვევის შექმნა',
  updateCase: 'შემთხვევის განახლება',
  creatingCase: 'იქმნება შემთხვევა...',
  updatingCase: 'ახლდება შემთხვევა...',

  // Validation Errors
  caseTitleRequired: 'შემთხვევის სათაური აუცილებელია',
  briefDescriptionRequired: 'მოკლე აღწერა აუცილებელია',
  patientInfoRequired: 'პაციენტის ინფორმაცია აუცილებელია',
  provideDetailedInfo: 'გთხოვთ მიუთითოთ უფრო დეტალური ინფორმაცია (მინიმუმ 50 სიმბოლო)',
  selectComplexity: 'გთხოვთ აირჩიოთ სირთულის დონე'
};

export default caseManagement;
