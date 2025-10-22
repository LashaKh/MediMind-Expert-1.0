export const news = {
  // Main title
  title: 'Medical News',

  // Section headers
  section: {
    title: 'Medical News & Updates',
    subtitle: 'Stay informed with the latest medical research and guidelines'
  },

  // End of results
  endOfResults: 'You\'ve reached the end of the news feed',

  // Empty states
  empty: {
    title: 'No Medical News Found',
    description: 'No news articles match your current filters. Try adjusting your search criteria or check back later for new content.',
    suggestions: {
      title: 'Search Tips',
      items: [
        'Try different medical specialties',
        'Adjust date range filters',
        'Remove category restrictions',
        'Check back for breaking news'
      ]
    }
  },

  // Filter labels
  filters: {
    title: 'Filter Medical News',
    specialty: 'Medical Specialty',
    timeFrame: 'Time Frame',
    source: 'Source',
    contentType: 'Content Type',
    contentTypes: 'Content Types',
    categories: 'Categories',
    dateRange: 'Date Range',
    evidenceLevel: 'Evidence Level',
    evidenceLevels: 'Evidence Levels',
    recency: 'Recency',
    search: 'Search Terms',
    searchPlaceholder: 'Search news titles and summaries...',
    quality: 'Quality Thresholds',
    apply: 'Apply Filters'
  },

  // Loading states
  loading: 'Loading medical news...',
  loadingMore: 'Loading more articles...',
  updating: 'Updating...',
  article: 'article',
  articles: 'articles',
  total: 'total',
  view: { grid: 'Grid', list: 'List' },
  refresh: 'Refresh',

  // General labels
  readMore: 'Read More',
  viewArticle: 'View Article',
  publishedOn: 'Published on',
  source: 'Source',
  category: 'Category',
  summary: 'Summary',
  latest: 'Latest News',

  // UI labels
  filtersLabel: 'Filters',
  advancedFilters: 'Advanced Filters',

  // Trending section
  trending: {
    title: 'Trending Now',
    subtitle: 'Most engaging medical news right now',
    label: 'Trending',
    empty: 'No Trending News',
    emptyDesc: 'Check back soon for trending medical news',  
    viewAll: 'View All Trending',
    refreshing: 'Refreshing...',
    lastUpdated: 'Last updated',
    liveUpdate: 'Updates every 15 minutes',
    error: 'Unable to Load Trending'
  },

  // Quick filters
  quickFilters: 'Quick filters:',

  // Statistics
  stats: {
    totalArticles: 'Total Articles',
    todayArticles: 'Today\'s Articles',
    bookmarked: 'Bookmarked',
    liked: 'Liked'
  }
};

// Bookmarked section
export const bookmarked = {
  title: 'Bookmarked News',
  countLabel: '{count} bookmarked articles available',
  loading: 'Loading your bookmarked news...',
  emptyTitle: 'No bookmarked news yet',
  emptyDesc: 'Start bookmarking interesting news articles by clicking the bookmark icon',
  removeBookmark: 'Remove bookmark',
  readArticle: 'Read article',
  show: 'Show',
  hide: 'Hide',
  showingOf: 'Showing {shown} of {total} bookmarked articles'
};

// Merge for default export
Object.assign(news, { bookmarked });

// Share modal
export const share = {
  title: 'Share Article',
  native: 'Share via Device',
  nativeDesc: "Use your device's native sharing",
  copy: 'Copy Link',
  copied: 'Copied!',
  copiedDesc: 'Link copied to clipboard',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  email: 'Email'
};

Object.assign(news, { share });

export default news;