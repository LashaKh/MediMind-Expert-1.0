export const diseases = {
  // Disease page common terms
  common: {
    background: 'ფონი',
    clinicalFindings: 'კლინიკური მოძიებები',
    studies: 'კვლევები', 
    guidelines: 'მითითებები',
    references: 'ლიტერატურა',
    keySources: 'მთავარი წყაროები',
    patientDemographics: 'პაციენტის დემოგრაფია',
    pastMedicalHistory: 'წარსული სამედიცინო ისტორია',
    symptoms: 'სიმპტომები',
    likelihoodRatios: 'ალბათობის კოეფიციენტები',
    finding: 'მოძიებული',
    lastUpdated: 'ბოლოს განახლებული',
    notFound: {
      title: 'დაავადება ვერ მოიძებნა',
      message: 'მოთხოვნილი დაავადების ინფორმაცია ვერ მოიძებნა.',
      backButton: 'დაბრუნება დაავადებებზე'
    },
    sections: {
      definition: 'განმარტება',
      pathophysiology: 'პათოფიზიოლოგია', 
      epidemiology: 'ეპიდემიოლოგია',
      diseaseCourse: 'დაავადების მსვლელობა',
      prognosis: 'პროგნოზი და განმეორების რისკი',
      criticalInformation: 'კრიტიკული ინფორმაცია:'
    },
    actions: {
      print: 'ბეჭდვა',
      share: 'გაზიარება',
      bookmark: 'ჩანიშვნა'
    }
  },
  
  // Index page
  index: {
    title: 'კარდიოლოგიის დაავადებების ბაზა',
    subtitle: 'ყოვლისმომცველი, მტკიცებულებებზე დაფუძნებული ინფორმაცია გულ-სისხლძარღვთა დაავადებების შესახებ უახლესი კლინიკური რეკომენდაციებითა და მართვის პროტოკოლებით.',
    search: {
      placeholder: 'ძებნა დაავადებები, სიმპტომები ან მკურნალობა...',
      filters: {
        allCategories: 'ყველა კატეგორია',
        allSeverity: 'ყველა სიმძიმის დონე',
        highSeverity: 'მძიმე სიმძიმე',
        mediumSeverity: 'საშუალო სიმძიმე', 
        lowSeverity: 'მსუბუქი სიმძიმე'
      }
    },
    results: {
      showing: 'ნაჩვენებია',
      of: 'დან',
      diseases: 'დაავადება'
    },
    emptyState: {
      title: 'დაავადებები ვერ მოიძებნა',
      message: 'სცადეთ ძებნის პირობების ან ფილტრების შეცვლა საძიებლის პოვნისთვის.'
    },
    comingSoon: {
      title: 'მალე მეტი დაავადება',
      message: 'ჩვენ უწყვეტად ვავრცელებთ ჩვენს მონაცემთა ბაზას გულ-სისხლძარღვთა დაავადებების ყოვლისმომცველი ინფორმაციით. მალე შეამოწმეთ განახლებები.',
      nextUpdates: 'მომდევნო განახლებები მოსალოდნელია: კორონარული არტერიის დაავადება, გულის უკმარისობა, ჰიპერტროფული კარდიომიოპათია'
    }
  },

  // Individual diseases - placeholders for future translation
  cardiology: {
    abdominalAorticAneurysm: {
      // Will be populated when translating individual diseases
      title: 'მუცლის აორტის ანევრიზმა'
    },
    atrialFibrillation: {
      // Will be populated when translating individual diseases
      title: 'წინაგულების ფიბრილაცია'
    }
  },

  obgyn: {
    // Future OB/GYN diseases will be added here
  }
};