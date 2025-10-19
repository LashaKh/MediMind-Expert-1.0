export const abg = {
  header: {
    title: 'სისხლის აირების ანალიზი',
    subtitle: 'ატვირთეთ სისხლის აირების ანგარიში მყისიერი AI ხედვისთვის, გადამოწმებული ინტერპრეტაციისა და კლინიკური მოქმედების გეგმისთვის.',
    medicalGradeAI: 'სამედიცინო დონის AI',
    viewHistory: 'ისტორიის ნახვა',
    viewHistoryAria: 'ანალიზის ისტორიის ნახვა'
  },
  workflow: {
    aria: {
      progress: 'სისხლის აირების ანალიზის პროგრესი'
    },
    progressComplete: '{{percent}}% დასრულებულია',
    steps: {
      upload: {
        label: 'ატვირთვა',
        description: 'აირჩიეთ სისხლის აირების ანგარიში'
      },
      analysis: {
        label: 'ანალიზი',
        description: 'AI ვიზუალური დამუშავება'
      },
      interpretation: {
        label: 'ინტერპრეტაცია',
        description: 'კლინიკური ანალიზი'
      },
      actionPlan: {
        label: 'მოქმედების გეგმა (არასავალდებულო)',
        description: 'მკურნალობის რეკომენდაციები'
      }
    }
  },
  upload: {
    aria: {
      dropzone: 'ატვირთეთ სისხლის აირების ანგარიში'
    },
    title: 'ატვირთეთ სისხლის აირების ანგარიში',
    subtitle: 'გადმოიტანეთ სურათი აქ ან აირჩიეთ ფაილი',
    chooseFile: 'აირჩიეთ ფაილი',
    takePhoto: 'გადაიღეთ ფოტო',
    formats: 'JPEG, PNG, WebP • {{size}}MB-მდე',
    type: {
      title: 'სისხლის აირების ტიპი',
      subtitle: 'აირჩიეთ ანალიზის ტიპი'
    },
    types: {
      arterialDesc: 'ყველაზე ყოვლისმომცველი ანალიზი',
      venousDesc: 'ალტერნატიული ანალიზის მეთოდი'
    },
    caseContext: {
      title: 'შემთხვევის კონტექსტი (არასავალდებულო)',
      subtitle: 'დაუკავშირეთ ABG ანალიზი პაციენტის შემთხვევას'
    },
    actions: {
      startAIAnalysis: 'დაიწყეთ AI ანალიზი'
    }
  },
  results: {
    filters: {
      types: {
        arterial: 'არტერიული სისხლის აირი',
        venous: 'ვენური სისხლის აირი'
      }
    }
  }
};

export default abg;
