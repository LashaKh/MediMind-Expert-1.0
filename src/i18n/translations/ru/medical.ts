export const medical = {
  // Medical Specialties
  specialty: {
    cardiology: 'Кардиология',
    obgyn: 'Акушерство и гинекология',
    neurology: 'Неврология',
    endocrinology: 'Эндокринология',
    general: 'Общая медицина'
  },

  // Patient Demographics
  patient: {
    age: 'Возраст',
    gender: 'Пол',
    male: 'Мужской',
    female: 'Женский',
    weight: 'Вес',
    height: 'Рост',
    bmi: 'ИМТ',
    bloodPressure: 'Артериальное давление',
    systolic: 'Систолическое',
    diastolic: 'Диастолическое',
    heartRate: 'Частота сердечных сокращений',
    temperature: 'Температура'
  },

  // Symptoms
  symptoms: {
    chestPain: 'Боль в груди',
    shortnessOfBreath: 'Одышка',
    palpitations: 'Сердцебиение',
    dizziness: 'Головокружение',
    fatigue: 'Усталость',
    syncope: 'Обморок',
    nausea: 'Тошнота',
    vomiting: 'Рвота',
    headache: 'Головная боль',
    abdominalPain: 'Боль в животе',
    backPain: 'Боль в спине',
    jointPain: 'Боль в суставах',
    muscleWeakness: 'Мышечная слабость',
    fever: 'Лихорадка',
    cough: 'Кашель',
    wheezing: 'Хрипы'
  },

  // Diagnosis
  diagnosis: {
    primary: 'Основной диагноз',
    secondary: 'Вторичный диагноз',
    differential: 'Дифференциальный диагноз',
    provisional: 'Предварительный диагноз',
    final: 'Окончательный диагноз',
    ruleOut: 'Исключить',
    suspected: 'Подозрение на',
    confirmed: 'Подтвержденный',
    probable: 'Вероятный',
    possible: 'Возможный'
  },

  // Treatment
  treatment: {
    medication: 'Лекарство',
    dosage: 'Дозировка',
    frequency: 'Частота',
    duration: 'Продолжительность',
    instructions: 'Инструкции',
    contraindications: 'Противопоказания',
    sideEffects: 'Побочные эффекты',
    monitoring: 'Мониторинг',
    followUp: 'Наблюдение',
    therapy: 'Терапия',
    intervention: 'Вмешательство',
    management: 'Ведение'
  },

  // Medical Units
  units: {
    // Weight
    kg: 'кг',
    g: 'г',
    mg: 'мг',
    lbs: 'фунты',
    
    // Length
    cm: 'см',
    m: 'м',
    mm: 'мм',
    ft: 'футы',
    in: 'дюймы',
    
    // Pressure
    mmHg: 'мм рт. ст.',
    kPa: 'кПа',
    
    // Laboratory
    mgdL: 'мг/дл',
    mmolL: 'ммоль/л',
    gdL: 'г/дл',
    IUL: 'МЕ/л',
    mEqL: 'мЭкв/л',
    ngmL: 'нг/мл',
    pgmL: 'пг/мл',
    mIUmL: 'мМЕ/мл',
    
    // Time
    years: 'лет',
    months: 'месяцев',
    weeks: 'недель',
    days: 'дней',
    hours: 'часов',
    minutes: 'минут',
    
    // Volume
    mL: 'мл',
    L: 'л',
    
    // Frequency
    bpm: 'уд/мин',
    perMin: '/мин',
    perHour: '/час',
    perDay: '/день',
    
    // Temperature
    celsius: '°C',
    fahrenheit: '°F',
    
    // Percentage
    percent: '%'
  },

  // Medical Conditions
  conditions: {
    diabetes: 'Сахарный диабет',
    hypertension: 'Артериальная гипертензия',
    hyperlipidemia: 'Гиперлипидемия',
    coronaryArteryDisease: 'Ишемическая болезнь сердца',
    heartFailure: 'Сердечная недостаточность',
    atrialFibrillation: 'Фибрилляция предсердий',
    myocardialInfarction: 'Инфаркт миокарда',
    stroke: 'Инсульт',
    obesity: 'Ожирение',
    metabolicSyndrome: 'Метаболический синдром',
    chronicKidneyDisease: 'Хроническая болезнь почек',
    copd: 'ХОБЛ',
    asthma: 'Бронхиальная астма',
    depression: 'Депрессия',
    anxiety: 'Тревожность'
  },

  // Medical Procedures
  procedures: {
    ecg: 'ЭКГ',
    echocardiogram: 'Эхокардиография',
    stressTest: 'Стресс-тест',
    catheterization: 'Катетеризация',
    angioplasty: 'Ангиопластика',
    surgery: 'Хирургия',
    biopsy: 'Биопсия',
    bloodTest: 'Анализ крови',
    imaging: 'Визуализация',
    xray: 'Рентген',
    ct: 'КТ',
    mri: 'МРТ',
    ultrasound: 'УЗИ',
    colonoscopy: 'Колоноскопия',
    endoscopy: 'Эндоскопия'
  },

  // Risk Assessment
  risk: {
    factors: {
      age: 'Возраст',
      gender: 'Пол',
      smoking: 'Курение',
      diabetes: 'Сахарный диабет',
      hypertension: 'Артериальная гипертензия',
      familyHistory: 'Семейный анамнез',
      obesity: 'Ожирение',
      inactivity: 'Физическая неактивность',
      cholesterol: 'Высокий холестерин',
      alcohol: 'Употребление алкоголя',
      stress: 'Стресс'
    },
    levels: {
      low: 'Низкий риск',
      moderate: 'Умеренный риск',
      high: 'Высокий риск',
      veryHigh: 'Очень высокий риск',
      borderline: 'Пограничный риск',
      intermediate: 'Промежуточный риск'
    },
    cardiovascular: {
      low: 'Низкий сердечно-сосудистый риск',
      moderate: 'Умеренный сердечно-сосудистый риск',
      high: 'Высокий сердечно-сосудистый риск',
      veryHigh: 'Очень высокий сердечно-сосудистый риск'
    }
  },

  // Laboratory Values
  laboratory: {
    cholesterol: {
      total: 'Общий холестерин',
      ldl: 'Холестерин ЛПНП',
      hdl: 'Холестерин ЛПВП',
      triglycerides: 'Триглицериды',
      nonHdl: 'Не-ЛПВП холестерин'
    },
    glucose: {
      fasting: 'Глюкоза натощак',
      random: 'Случайная глюкоза',
      hba1c: 'HbA1c',
      ogtt: 'Пероральный тест толерантности к глюкозе',
      postprandial: 'Постпрандиальная глюкоза'
    },
    cardiac: {
      troponin: 'Тропонин',
      bnp: 'BNP',
      ck: 'Креатинкиназа',
      ldh: 'ЛДГ',
      ckMb: 'КК-МВ',
      myoglobin: 'Миоглобин'
    },
    renal: {
      creatinine: 'Креатинин',
      bun: 'Мочевина',
      egfr: 'СКФ',
      albumin: 'Альбумин',
      protein: 'Белок',
      urea: 'Мочевина'
    },
    liver: {
      alt: 'АЛТ',
      ast: 'АСТ',
      bilirubin: 'Билирубин',
      alkalinePhosphatase: 'Щелочная фосфатаза',
      albumin: 'Альбумин',
      ggt: 'ГГТ'
    },
    hematology: {
      hemoglobin: 'Гемоглобин',
      hematocrit: 'Гематокрит',
      wbc: 'Лейкоциты',
      rbc: 'Эритроциты',
      platelets: 'Тромбоциты',
      mcv: 'MCV',
      mch: 'MCH',
      mchc: 'MCHC'
    }
  },

  // Medical History
  history: {
    medical: 'Медицинский анамнез',
    family: 'Семейный анамнез',
    social: 'Социальный анамнез',
    surgical: 'Хирургический анамнез',
    medications: 'Текущие лекарства',
    allergies: 'Аллергии',
    immunizations: 'Прививки',
    hospitalizations: 'Предыдущие госпитализации'
  },

  // Pregnancy and Obstetrics
  pregnancy: {
    trimester: 'Триместр',
    gestationalAge: 'Гестационный возраст',
    prenatal: 'Дородовой',
    postnatal: 'Послеродовой',
    delivery: 'Роды',
    cesarean: 'Кесарево сечение',
    vaginal: 'Вагинальные роды',
    fetal: 'Плодный',
    maternal: 'Материнский',
    gravida: 'Беременность',
    para: 'Роды',
    preeclampsia: 'Преэклампсия',
    gestationalDiabetes: 'Гестационный диабет'
  },

  // General Medical Terms
  general: {
    assessment: 'Оценка',
    evaluation: 'Обследование',
    examination: 'Осмотр',
    consultation: 'Консультация',
    referral: 'Направление',
    recommendation: 'Рекомендация',
    prognosis: 'Прогноз',
    etiology: 'Этиология',
    pathophysiology: 'Патофизиология',
    epidemiology: 'Эпидемиология'
  }
};

export default medical; 