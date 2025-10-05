export default {
  transcriptPlaceholder: {
    default: 'Ваша транскрипция появится здесь...',
    titleRequired: 'Для начала введите название сессии выше...',
    startTyping: 'Начните печатать, вставьте текст или начните запись...',
  },
  uploadButton: {
    title: 'Загрузить аудиофайл',
    disabledTitle: 'Невозможно загрузить во время записи',
    label: 'Загрузить',
    sublabel: 'Аудиофайл',
  },
  attachButton: {
    title: 'Прикрепить файлы и документы',
    disabledTitle: 'Невозможно прикрепить во время записи',
    label: 'Прикрепить',
    sublabel: 'Файлы и документы',
  },
  recordButton: {
    startRecording: 'Начать запись',
    stopRecording: 'Остановить запись',
    record: 'Запись',
    stop: 'Стоп',
    endRecording: 'Завершить запись',
    titleRequired: 'Пожалуйста, сначала введите название сессии',
  },
  drawer: {
    title: 'Медицинская история',
    subtitle: 'Транскрипции консультаций пациентов',
    newSession: 'Новая сессия',
    searchPlaceholder: 'Поиск сессий...',
    noHistory: 'Истории пока нет',
    noHistoryDescription: 'Создайте свою первую сессию медицинской транскрипции, чтобы начать записывать консультации пациентов.',
    createFirstSession: 'Создать первую сессию',
    loading: 'Загрузка сессий...',
    editTitle: 'Редактировать название',
    saveTitle: 'Сохранить название',
    cancelEdit: 'Отменить редактирование',
    transcribed: 'Транскрибировано',
  },
  tabs: {
    record: {
      label: 'Запись',
      sublabel: 'Живая транскрипция',
    },
    aiProcessing: {
      label: 'Обработка ИИ',
      sublabel: 'Умный анализ',
    },
  },
  historyButton: {
    title: 'История сессий',
    label: 'История',
    sublabel: 'Просмотреть все сессии',
  },
  securityWarning: {
    title: 'Требуется протокол безопасности',
    description: 'Медицинская транскрипция требует безопасного HTTPS-соединения для защиты конфиденциальности пациентов и доступа к микрофону.',
    action: 'Пожалуйста, обеспечьте безопасное соединение перед продолжением',
  },
  unsupported: {
    title: 'Браузер не поддерживается',
    description: 'Ваш браузер не поддерживает запись аудио. Пожалуйста, используйте современный браузер, такой как Chrome, Firefox или Safari.',
  },
  attachedFiles: {
    title: {
      mobile: 'Файлы ({count})',
      desktop: 'Прикрепленные файлы ({count})',
    },
    readyForAnalysis: 'Готово к анализу',
  },
  emptyFields: '{count} полей не заполнено',
};
