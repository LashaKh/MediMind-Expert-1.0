export const news = {
  // Main title
  title: 'Медицинские новости',

  // Section headers
  section: {
    title: 'Медицинские новости и обновления',
    subtitle: 'Будьте в курсе последних медицинских исследований и рекомендаций'
  },

  // End of results
  endOfResults: 'Вы достигли конца ленты новостей',

  // Empty states
  empty: {
    title: 'Медицинские новости не найдены',
    description: 'Нет статей новостей, соответствующих вашим текущим фильтрам. Попробуйте изменить критерии поиска или проверьте позже для нового контента.',
    suggestions: {
      title: 'Советы по поиску',
      items: [
        'Попробуйте более широкие поисковые термины',
        'Удалите некоторые фильтры',
        'Проверьте другие временные периоды',
        'Просмотрите по специальности'
      ]
    }
  },

  // Filter labels
  filters: {
    title: 'Фильтры медицинских новостей',
    specialty: 'Медицинская специальность',
    timeFrame: 'Временной период',
    source: 'Источник',
    contentType: 'Тип контента',
    contentTypes: 'Типы контента',
    categories: 'Категории',
    dateRange: 'Диапазон дат',
    evidenceLevel: 'Уровень доказательности',
    evidenceLevels: 'Уровни доказательности',
    recency: 'Новизна',
    search: 'Поисковые термины',
    searchPlaceholder: 'Поиск в заголовках и резюме новостей...',
    quality: 'Пороги качества',
    apply: 'Применить фильтры'
  },

  // Loading states
  loading: 'Загрузка медицинских новостей...',
  loadingMore: 'Загрузка дополнительных статей...',
  updating: 'Обновление...',
  article: 'статья',
  articles: 'статей',
  total: 'всего',
  view: { grid: 'Сетка', list: 'Список' },
  refresh: 'Обновить',

  // General labels
  readMore: 'Читать далее',
  viewArticle: 'Просмотреть статью',
  publishedOn: 'Опубликовано',
  source: 'Источник',
   category: 'Категория',
   summary: 'Резюме',
  latest: 'Последние новости',

  // UI labels
  filtersLabel: 'Фильтры',
  advancedFilters: 'Расширенные фильтры',

  // Trending section
  trending: {
    title: 'Популярное сейчас',
    subtitle: 'Самые актуальные медицинские новости',
    label: 'Популярное',
    empty: 'Нет популярных новостей',
    emptyDesc: 'Проверьте позже для популярных медицинских новостей',
    viewAll: 'Просмотреть все популярное',
    refreshing: 'Обновление...',
    lastUpdated: 'Последнее обновление',
    liveUpdate: 'Обновляется каждые 15 минут',
    error: 'Не удалось загрузить популярное'
  },

  // Quick filters
  quickFilters: 'Быстрые фильтры:',

  // Statistics
  stats: {
    totalArticles: 'Всего статей',
    todayArticles: 'Статьи сегодня',
    bookmarked: 'В закладках',
    liked: 'Понравившиеся'
  }
};

// Bookmarked section
export const bookmarked = {
  title: 'Закладки новостей',
  countLabel: 'Доступно закладок: {count}',
  loading: 'Загрузка ваших закладок новостей...',
  emptyTitle: 'Закладок пока нет',
  emptyDesc: 'Начните добавлять в закладки интересные новости, нажимая на значок закладки',
  removeBookmark: 'Убрать из закладок',
  readArticle: 'Читать статью',
  show: 'Показать',
  hide: 'Скрыть',
  showingOf: 'Показано {shown} из {total}'
};

Object.assign(news, { bookmarked });

export const share = {
  title: 'Поделиться статьёй',
  native: 'Поделиться через устройство',
  nativeDesc: 'Используйте системное меню общего доступа',
  copy: 'Копировать ссылку',
  copied: 'Скопировано!',
  copiedDesc: 'Ссылка скопирована в буфер обмена',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  email: 'Email'
};

Object.assign(news, { share });

export default news;