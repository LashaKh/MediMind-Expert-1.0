export const abg = {
  header: {
    title: 'Анализ газов крови',
    subtitle: 'Загрузите отчет по газам крови для мгновенного анализа с помощью ИИ, проверенной интерпретации и готового к клинической практике плана действий.',
    medicalGradeAI: 'Медицинский ИИ',
    viewHistory: 'Просмотр истории',
    viewHistoryAria: 'Просмотр истории анализов'
  },
  workflow: {
    aria: {
      progress: 'Прогресс анализа газов крови'
    },
    progressComplete: '{{percent}}% Завершено',
    steps: {
      upload: {
        label: 'Загрузка',
        description: 'Выберите отчет по газам крови'
      },
      analysis: {
        label: 'Анализ',
        description: 'Обработка с помощью ИИ'
      },
      interpretation: {
        label: 'Интерпретация',
        description: 'Клинический анализ'
      },
      actionPlan: {
        label: 'План действий (необязательно)',
        description: 'Рекомендации по лечению'
      }
    }
  },
  upload: {
    aria: {
      dropzone: 'Загрузите отчет по газам крови'
    },
    title: 'Загрузите отчет по газам крови',
    subtitle: 'Перетащите изображение сюда или выберите файл',
    chooseFile: 'Выбрать файл',
    takePhoto: 'Сделать фото',
    formats: 'JPEG, PNG, WebP • до {{size}}МБ',
    type: {
      title: 'Тип анализа газов крови',
      subtitle: 'Выберите тип анализа'
    },
    types: {
      arterialDesc: 'Наиболее полный анализ',
      venousDesc: 'Альтернативный метод анализа'
    },
    caseContext: {
      title: 'Контекст случая (необязательно)',
      subtitle: 'Привяжите анализ ABG к случаю пациента'
    },
    actions: {
      startAIAnalysis: 'Начать ИИ анализ'
    }
  },
  results: {
    filters: {
      types: {
        arterial: 'Артериальная кровь',
        venous: 'Венозная кровь'
      }
    }
  }
};

export default abg;
