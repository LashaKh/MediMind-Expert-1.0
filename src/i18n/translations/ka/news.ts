export const news = {
  // Main title
  title: 'სამედიცინო სიახლეები',

  // Section headers
  section: {
    title: 'სამედიცინო სიახლეები და განახლებები',
    subtitle: 'იყავით ინფორმირებული უახლესი სამედიცინო კვლევებისა და მითითებების შესახებ'
  },

  // End of results
  endOfResults: 'თქვენ მიაღწიეთ სიახლეების ლენტის ბოლოს',

  // Empty states
  empty: {
    title: 'სამედიცინო სიახლეები ვერ მოიძებნა',
    description: 'თქვენს მიმდინარე ფილტრებს არ შეესაბამება სიახლეების სტატიები. სცადეთ ძიების კრიტერიუმების შეცვლა ან შეამოწმეთ მოგვიანებით ახალი კონტენტისთვის.',
    suggestions: {
      title: 'ძიების რჩევები',
      items: [
        'სცადეთ სხვადასხვა სამედიცინო სპეციალობები',
        'შეცვალეთ თარიღის დიაპაზონის ფილტრები',
        'კატეგორიის შეზღუდვების მოხსნა',
        'შეამოწმეთ ახალი ამბები'
      ]
    }
  },

  // Filter labels
  filters: {
    title: 'სამედიცინო სიახლეების ფილტრები',
    specialty: 'სამედიცინო სპეციალობა',
    timeFrame: 'დროის ჩარჩო',
    source: 'წყარო',
    contentType: 'კონტენტის ტიპი',
    contentTypes: 'კონტენტის ტიპები',
    categories: 'კატეგორიები',
    dateRange: 'თარიღების დიაპაზონი',
    evidenceLevel: 'მტკიცებულების დონე',
    evidenceLevels: 'მტკიცებულების დონეები',
    recency: 'სიახლე',
    search: 'საძიებო ტერმინები',
    searchPlaceholder: 'ძიება სიახლეების სათაურებსა და რეზიუმეებში...',
    quality: 'ხარისხის ზღვრები',
    apply: 'ფილტრების გამოყენება'
  },

  // Loading states
  loading: 'სამედიცინო სიახლეების ჩატვირთვა...',
  loadingMore: 'დამატებითი სტატიების ჩატვირთვა...',
  updating: 'განახლება...',
  article: 'სტატია',
  articles: 'სტატია',
  total: 'სულ',
  view: { grid: 'ბადე', list: 'სია' },
  refresh: 'განახლება',

  // General labels
  readMore: 'მეტის წაკითხვა',
  viewArticle: 'სტატიის ნახვა',
  publishedOn: 'გამოქვეყნებულია',
  source: 'წყარო',
   category: 'კატეგორია',
   summary: 'რეზიუმე',
  latest: 'უახლესი სიახლეები',

  // UI labels
  filtersLabel: 'ფილტრები',
  advancedFilters: 'დამატებითი ფილტრები',

  // Trending section
  trending: {
    title: 'პოპულარული ახლა',
    subtitle: 'ყველაზე საინტერესო სამედიცინო სიახლეები',
    label: 'პოპულარული',
    empty: 'პოპულარული სიახლეები არ არის',
    emptyDesc: 'შეამოწმეთ მალე პოპულარული სამედიცინო სიახლეებისთვის',
    viewAll: 'ყველა პოპულარულის ნახვა',
    refreshing: 'განახლება...',
    lastUpdated: 'ბოლო განახლება',
    liveUpdate: 'განახლდება ყოველ 15 წუთში',
    error: 'პოპულარულის ჩატვირთვა ვერ მოხერხდა'
  },

  // Quick filters
  quickFilters: 'სწრაფი ფილტრები:',

  // Statistics
  stats: {
    totalArticles: 'სულ სტატიები',
    todayArticles: 'დღევანდელი სტატიები',
    bookmarked: 'ნიშნულები',
    liked: 'მოწონებული'
  }
};

// Bookmarked section
export const bookmarked = {
  title: 'ნიშნული სიახლეები',
  countLabel: '{count} მონიშნული სტატია ხელმისაწვდომია',
  loading: 'თქვენი მონიშნული სიახლეების ჩატვირთვა...',
  emptyTitle: 'ჯერ არ გაქვთ მონიშნული სიახლეები',
  emptyDesc: 'დაიწყეთ საინტერესო სიახლეების მონიშვნა სანიშნის ღილაკზე დაჭერით',
  removeBookmark: 'ნიშნულის მოხსნა',
  readArticle: 'სტატიის კითხვა',
  show: 'ჩვენება',
  hide: 'დამალვა',
  showingOf: 'ნაჩვენებია {shown} {total}-დან'
};

Object.assign(news, { bookmarked });

export const share = {
  title: 'სტატიის გაზიარება',
  native: 'გაზიარება მოწყობილობით',
  nativeDesc: 'გამოიყენეთ მოწყობილობის ნატიური გაზიარება',
  copy: 'ბმულის კოპირება',
  copied: 'დაკოპირებულია!',
  copiedDesc: 'ბმული დაკოპირდა კლიპბორდში',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  email: 'Email'
};

Object.assign(news, { share });

export default news;