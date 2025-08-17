export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  ka: {
    code: 'ka',
    name: 'Georgian',
    nativeName: 'ქართული',
    flag: '🇬🇪'
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺'
  }
} as const;

export const DEFAULT_LANGUAGE = 'en';

export const DATE_FORMATS = {
  en: {
    short: 'MM/dd/yyyy',
    long: 'MMMM d, yyyy',
    time: 'HH:mm'
  },
  ka: {
    short: 'dd.MM.yyyy',
    long: 'd MMMM, yyyy',
    time: 'HH:mm'
  },
  ru: {
    short: 'dd.MM.yyyy',
    long: 'd MMMM yyyy г.',
    time: 'HH:mm'
  }
};

export const NUMBER_FORMATS = {
  en: {
    decimal: '.',
    thousands: ',',
    currency: 'USD'
  },
  ka: {
    decimal: ',',
    thousands: ' ',
    currency: 'GEL'
  },
  ru: {
    decimal: ',',
    thousands: ' ',
    currency: 'RUB'
  }
};

// Medical units formatting per locale
export const MEDICAL_UNITS = {
  en: {
    weight: 'kg',
    height: 'cm',
    bloodPressure: 'mmHg',
    temperature: '°F',
    glucose: 'mg/dL'
  },
  ka: {
    weight: 'კგ',
    height: 'სმ',
    bloodPressure: 'mmHg',
    temperature: '°C',
    glucose: 'mg/dL'
  },
  ru: {
    weight: 'кг',
    height: 'см',
    bloodPressure: 'мм рт. ст.',
    temperature: '°C',
    glucose: 'мг/дл'
  }
};