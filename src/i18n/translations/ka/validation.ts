export const validation = {
  required: 'აუცილებელია',
  email: 'შეიყვანეთ სწორი ელექტრონული ფოსტის მისამართი',
  password: {
    tooShort: 'პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს',
    tooWeak: 'პაროლი ძალიან სუსტია',
    noMatch: 'პაროლები არ ემთხვევა'
  },
  number: {
    invalid: 'შეიყვანეთ მოქმედი რიცხვი',
    min: 'მნიშვნელობა უნდა იყოს მინიმუმ {{min}}',
    max: 'მნიშვნელობა უნდა იყოს მაქსიმუმ {{max}}',
    range: 'მნიშვნელობა უნდა იყოს {{min}}-სა და {{max}}-ს შორის'
  },
  text: {
    tooShort: 'ძალიან მოკლე (მინიმუმ {{min}} სიმბოლო)',
    tooLong: 'ძალიან გრძელი (მაქსიმუმ {{max}} სიმბოლო)',
    pattern: 'არასწორი ფორმატი'
  },
  date: {
    invalid: 'არასწორი თარიღი',
    future: 'თარიღი არ შეიძლება იყოს მომავალში',
    past: 'თარიღი არ შეიძლება იყოს წარსულში',
    range: 'თარიღი უნდა იყოს {{start}}-სა და {{end}}-ს შორის'
  },
  file: {
    size: 'ფაილის ზომა ძალიან დიდია',
    type: 'ფაილის ტიპი არ არის მხარდაჭერილი',
    required: 'ფაილი აუცილებელია'
  },
  // Medical specific validations
  medical: {
    age: {
      invalid: 'შეიყვანეთ მოქმედი ასაკი',
      range: 'ასაკი უნდა იყოს {{min}}-{{max}} წლის შორის'
    },
    weight: {
      invalid: 'შეიყვანეთ მოქმედი წონა',
      range: 'წონა უნდა იყოს {{min}}-{{max}} კგ შორის'
    },
    height: {
      invalid: 'შეიყვანეთ მოქმედი სიმაღლე',
      range: 'სიმაღლე უნდა იყოს {{min}}-{{max}} სმ შორის'
    },
    bloodPressure: {
      invalid: 'შეიყვანეთ მოქმედი არტერიული წნევა',
      systolic: 'სისტოლური წნევა უნდა იყოს {{min}}-{{max}} შორის',
      diastolic: 'დიასტოლური წნევა უნდა იყოს {{min}}-{{max}} შორის'
    },
    heartRate: {
      invalid: 'შეიყვანეთ მოქმედი გულისცემა',
      range: 'გულისცემა უნდა იყოს {{min}}-{{max}} დარტყმა წუთში'
    },
    temperature: {
      invalid: 'შეიყვანეთ მოქმედი ტემპერატურა',
      range: 'ტემპერატურა უნდა იყოს {{min}}-{{max}}°C შორის'
    },
    glucose: {
      invalid: 'შეიყვანეთ მოქმედი გლუკოზის დონე',
      range: 'გლუკოზა უნდა იყოს {{min}}-{{max}} მგ/დლ შორის'
    },
    cholesterol: {
      invalid: 'შეიყვანეთ მოქმედი ქოლესტეროლის დონე',
      range: 'ქოლესტეროლი უნდა იყოს {{min}}-{{max}} მგ/დლ შორის'
    }
  },
  // Form specific validations
  forms: {
    selectRequired: 'გთხოვთ აირჩიოთ ვარიანტი',
    checkboxRequired: 'გთხოვთ მონიშნოთ ეს ველი',
    agreementRequired: 'გთხოვთ დაეთანხმოთ პირობებს',
    confirmAction: 'გთხოვთ დაადასტუროთ ეს მოქმედება'
  },
  // Custom error messages
  custom: {
    invalidInput: 'შეიყვანეთ მოქმედი მონაცემები',
    networkError: 'ქსელის შეცდომა, სცადეთ მოგვიანებით',
    serverError: 'სერვერის შეცდომა, სცადეთ მოგვიანებით',
    timeout: 'მოთხოვნის დრო ამოიწურა',
    unauthorized: 'თქვენ არ გაქვთ ამ მოქმედების უფლება',
    forbidden: 'ნებადართული არ არის',
    notFound: 'მონაცემები ვერ მოიძებნა'
  }
};

export default validation; 