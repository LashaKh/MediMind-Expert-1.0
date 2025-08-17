export const medical = {
  // Medical Specialties
  specialty: {
    cardiology: 'კარდიოლოგია',
    obgyn: 'მეანობა-გინეკოლოგია',
    neurology: 'ნევროლოგია',
    endocrinology: 'ენდოკრინოლოგია',
    general: 'ზოგადი მედიცინა'
  },

  // Patient Demographics
  patient: {
    age: 'ასაკი',
    gender: 'სქესი',
    male: 'მამრობითი',
    female: 'მდედრობითი',
    weight: 'წონა',
    height: 'სიმაღლე',
    bmi: 'BMI',
    bloodPressure: 'არტერიული წნევა',
    systolic: 'სისტოლური',
    diastolic: 'დიასტოლური',
    heartRate: 'გულისცემა',
    temperature: 'ტემპერატურა'
  },

  // Symptoms
  symptoms: {
    chestPain: 'გულმკერდის ტკივილი',
    shortnessOfBreath: 'სუნთქვის სიძნელე',
    palpitations: 'გულისცემა',
    dizziness: 'თავბრუსხვევა',
    fatigue: 'დაღლილობა',
    syncope: 'გონების დაკარგვა',
    nausea: 'გულისრევა',
    vomiting: 'ღებინება',
    headache: 'თავის ტკივილი',
    abdominalPain: 'მუცლის ტკივილი',
    backPain: 'ზურგის ტკივილი',
    jointPain: 'სახსრის ტკივილი',
    muscleWeakness: 'კუნთური სისუსტე',
    fever: 'ცხელება',
    cough: 'ხველება',
    wheezing: 'ხვრინვა'
  },

  // Diagnosis
  diagnosis: {
    primary: 'ძირითადი დიაგნოზი',
    secondary: 'მეორადი დიაგნოზი',
    differential: 'დიფერენციალური დიაგნოზი',
    provisional: 'წინასწარი დიაგნოზი',
    final: 'საბოლოო დიაგნოზი',
    ruleOut: 'გამორიცხვა',
    suspected: 'ეჭვი',
    confirmed: 'დადასტურებული',
    probable: 'სავარაუდო',
    possible: 'შესაძლო'
  },

  // Treatment
  treatment: {
    medication: 'მედიკამენტი',
    dosage: 'დოზირება',
    frequency: 'სიხშირე',
    duration: 'ხანგრძლივობა',
    instructions: 'ინსტრუქციები',
    contraindications: 'კონტრაჩვენებები',
    sideEffects: 'გვერდითი ეფექტები',
    monitoring: 'მონიტორინგი',
    followUp: 'კონტროლი',
    therapy: 'თერაპია',
    intervention: 'ჩარევა',
    management: 'მართვა'
  },

  // Medical Units
  units: {
    // Weight
    kg: 'კგ',
    g: 'გ',
    mg: 'მგ',
    lbs: 'ფუნტი',
    
    // Length
    cm: 'სმ',
    m: 'მ',
    mm: 'მმ',
    ft: 'ფუტი',
    in: 'დუიმი',
    
    // Pressure
    mmHg: 'მმ ვართხლ. სვ.',
    kPa: 'კპა',
    
    // Laboratory
    mgdL: 'მგ/დლ',
    mmolL: 'მმოლ/ლ',
    gdL: 'გ/დლ',
    IUL: 'საერთ. ერთ./ლ',
    mEqL: 'მეკვ/ლ',
    ngmL: 'ნგ/მლ',
    pgmL: 'პგ/მლ',
    mIUmL: 'მსაერთ.ერთ./მლ',
    
    // Time
    years: 'წელი',
    months: 'თვე',
    weeks: 'კვირა',
    days: 'დღე',
    hours: 'საათი',
    minutes: 'წუთი',
    
    // Volume
    mL: 'მლ',
    L: 'ლ',
    
    // Frequency
    bpm: 'ურტყმა/წთ',
    perMin: '/წთ',
    perHour: '/საათი',
    perDay: '/დღე',
    
    // Temperature
    celsius: '°C',
    fahrenheit: '°F',
    
    // Percentage
    percent: '%'
  },

  // Medical Conditions
  conditions: {
    diabetes: 'დიაბეტი',
    hypertension: 'ჰიპერტენზია',
    hyperlipidemia: 'ჰიპერლიპიდემია',
    coronaryArteryDisease: 'კორონარული არტერიის დაავადება',
    heartFailure: 'გულის უკმარისობა',
    atrialFibrillation: 'წინაპრისუბოს ფიბრილაცია',
    myocardialInfarction: 'მიოკარდიუმის ინფარქტი',
    stroke: 'ინსულტი',
    obesity: 'სიმსუქნე',
    metabolicSyndrome: 'მეტაბოლური სინდრომი',
    chronicKidneyDisease: 'თირკმლის ქრონიკული დაავადება',
    copd: 'ფილტვის ქრონიკული ობსტრუქციული დაავადება',
    asthma: 'ბრონქული ასთმა',
    depression: 'დეპრესია',
    anxiety: 'შფოთვა'
  },

  // Medical Procedures
  procedures: {
    ecg: 'ელექტროკარდიოგრამა',
    echocardiogram: 'ექოკარდიოგრამა',
    stressTest: 'სტრესტესტი',
    catheterization: 'კათეტერიზაცია',
    angioplasty: 'ანგიოპლასტიკა',
    surgery: 'ოპერაცია',
    biopsy: 'ბიოფსია',
    bloodTest: 'სისხლის ანალიზი',
    imaging: 'ვიზუალიზაცია',
    xray: 'რენტგენი',
    ct: 'კტ',
    mri: 'მრი',
    ultrasound: 'ულტრაბგერა',
    colonoscopy: 'კოლონოსკოპია',
    endoscopy: 'ენდოსკოპია'
  },

  // Risk Assessment
  risk: {
    factors: {
      age: 'ასაკი',
      gender: 'სქესი',
      smoking: 'მოწევა',
      diabetes: 'დიაბეტი',
      hypertension: 'ჰიპერტენზია',
      familyHistory: 'ოჯახური ანამნეზი',
      obesity: 'სიმსუქნე',
      inactivity: 'ფიზიკური არააქტივობა',
      cholesterol: 'მაღალი ქოლესტერინი',
      alcohol: 'ალკოჰოლის მიღება',
      stress: 'სტრესი'
    },
    levels: {
      low: 'დაბალი რისკი',
      moderate: 'ზომიერი რისკი',
      high: 'მაღალი რისკი',
      veryHigh: 'ძალიან მაღალი რისკი',
      borderline: 'საზღვრული რისკი',
      intermediate: 'შუალედური რისკი'
    },
    cardiovascular: {
      low: 'დაბალი გულ-სისხლძარღვული რისკი',
      moderate: 'ზომიერი გულ-სისხლძარღვული რისკი',
      high: 'მაღალი გულ-სისხლძარღვული რისკი',
      veryHigh: 'ძალიან მაღალი გულ-სისხლძარღვული რისკი'
    }
  },

  // Laboratory Values
  laboratory: {
    cholesterol: {
      total: 'მთლიანი ქოლესტერინი',
      ldl: 'დაბალი სიმკვრივის ლიპოპროტეინი',
      hdl: 'მაღალი სიმკვრივის ლიპოპროტეინი',
      triglycerides: 'ტრიგლიცერიდები',
      nonHdl: 'არა-მაღალი სიმკვრივის ქოლესტერინი'
    },
    glucose: {
      fasting: 'შიმშილობის გლუკოზა',
      random: 'შემთხვევითი გლუკოზა',
      hba1c: 'HbA1c',
      ogtt: 'პეროალური გლუკოზის ტოლერანტობის ტესტი',
      postprandial: 'საკვების შემდგომი გლუკოზა'
    },
    cardiac: {
      troponin: 'ტროპონინინი',
      bnp: 'BNP',
      ck: 'კრეატინკინაზა',
      ldh: 'ლდგ',
      ckMb: 'კკ-მბ',
      myoglobin: 'მიოგლობინი'
    },
    renal: {
      creatinine: 'კრეატინინი',
      bun: 'შარდოვანა',
      egfr: 'სკფ',
      albumin: 'ალბუმინი',
      protein: 'ცილა',
      urea: 'შარდოვანა'
    },
    liver: {
      alt: 'ალტ',
      ast: 'ასტ',
      bilirubin: 'ბილირუბინი',
      alkalinePhosphatase: 'ტუტე ფოსფატაზა',
      albumin: 'ალბუმინი',
      ggt: 'ггტ'
    },
    hematology: {
      hemoglobin: 'ჰემოგლობინი',
      hematocrit: 'ჰემატოკრიტი',
      wbc: 'თეთრი უჯრედები',
      rbc: 'წითელი უჯრედები',
      platelets: 'თრომბოციტები',
      mcv: 'MCV',
      mch: 'MCH',
      mchc: 'MCHC'
    }
  },

  // Medical History
  history: {
    medical: 'სამედიცინო ანამნეზი',
    family: 'ოჯახური ანამნეზი',
    social: 'სოციალური ანამნეზი',
    surgical: 'ქირურგიული ანამნეზი',
    medications: 'მიმდინარე მედიკამენტები',
    allergies: 'ალერგიები',
    immunizations: 'ვაქცინაციები',
    hospitalizations: 'წინა ჰოსპიტალიზაციები'
  },

  // Pregnancy and Obstetrics
  pregnancy: {
    trimester: 'ტრიმესტრი',
    gestationalAge: 'გესტაციური ასაკი',
    prenatal: 'დაბადებამდელი',
    postnatal: 'დაბადების შემდგომი',
    delivery: 'მშობიარობა',
    cesarean: 'საკეისროკვეთა',
    vaginal: 'ვაგინალური მშობიარობა',
    fetal: 'ნაყოფის',
    maternal: 'დედობრივი',
    gravida: 'ორსულობა',
    para: 'მშობიარობა',
    preeclampsia: 'პრეეკლამფსია',
    gestationalDiabetes: 'გესტაციური დიაბეტი'
  },

  // General Medical Terms
  general: {
    assessment: 'შეფასება',
    evaluation: 'გამოკვლევა',
    examination: 'გამოკვლევა',
    consultation: 'კონსულტაცია',
    referral: 'მიმართვა',
    recommendation: 'რეკომენდაცია',
    prognosis: 'პროგნოზი',
    etiology: 'ეტიოლოგია',
    pathophysiology: 'პათოფიზიოლოგია',
    epidemiology: 'ეპიდემიოლოგია'
  }
};

export default medical; 