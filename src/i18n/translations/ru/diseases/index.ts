export const diseases = {
  // Disease page common terms
  common: {
    background: 'Справочная информация',
    clinicalFindings: 'Клинические находки',
    studies: 'Исследования', 
    guidelines: 'Рекомендации',
    references: 'Литература',
    keySources: 'Основные источники',
    patientDemographics: 'Демография пациентов',
    pastMedicalHistory: 'Анамнез',
    symptoms: 'Симптомы',
    likelihoodRatios: 'Отношения правдоподобия',
    finding: 'Находка',
    lastUpdated: 'Последнее обновление',
    notFound: {
      title: 'Заболевание не найдено',
      message: 'Запрашиваемая информация о заболевании не найдена.',
      backButton: 'Вернуться к заболеваниям'
    },
    sections: {
      definition: 'Определение',
      pathophysiology: 'Патофизиология', 
      epidemiology: 'Эпидемиология',
      diseaseCourse: 'Течение заболевания',
      prognosis: 'Прогноз и риск рецидива',
      criticalInformation: 'Критическая информация:'
    },
    actions: {
      print: 'Печать',
      share: 'Поделиться',
      bookmark: 'Закладка'
    }
  },
  
  // Index page
  index: {
    title: 'База данных кардиологических заболеваний',
    subtitle: 'Комплексная, основанная на доказательствах информация о сердечно-сосудистых заболеваниях с новейшими клиническими рекомендациями и протоколами лечения.',
    search: {
      placeholder: 'Поиск заболеваний, симптомов или лечения...',
      filters: {
        allCategories: 'Все категории',
        allSeverity: 'Все уровни тяжести',
        highSeverity: 'Высокая тяжесть',
        mediumSeverity: 'Средняя тяжесть', 
        lowSeverity: 'Низкая тяжесть'
      }
    },
    results: {
      showing: 'Показано',
      of: 'из',
      diseases: 'заболеваний'
    },
    emptyState: {
      title: 'Заболевания не найдены',
      message: 'Попробуйте изменить условия поиска или фильтры, чтобы найти то, что вы ищете.'
    },
    comingSoon: {
      title: 'Скоро больше заболеваний',
      message: 'Мы постоянно расширяем нашу базу данных комплексной информацией о сердечно-сосудистых заболеваниях. Вскоре проверьте обновления.',
      nextUpdates: 'Ожидаемые следующие обновления: Ишемическая болезнь сердца, Сердечная недостаточность, Гипертрофическая кардиомиопатия'
    }
  },

  // Individual diseases - placeholders for future translation
  cardiology: {
    abdominalAorticAneurysm: {
      // Will be populated when translating individual diseases
      title: 'Аневризма брюшной аорты'
    },
    atrialFibrillation: {
      // Will be populated when translating individual diseases
      title: 'Фибрилляция предсердий'
    }
  },

  obgyn: {
    // Future OB/GYN diseases will be added here
  }
};