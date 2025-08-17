// Service Worker for MediMind Expert PWA - Enhanced for Medical News
const CACHE_NAME = 'medimind-v1.1.0';
const NEWS_CACHE = 'medimind-news-v1';
const IMAGES_CACHE = 'medimind-images-v1';
const API_CACHE = 'medimind-api-v1';
const OFFLINE_URL = '/offline.html';

// Cache duration in milliseconds
const CACHE_DURATION = {
  news: 15 * 60 * 1000, // 15 minutes for medical news
  images: 60 * 60 * 1000, // 1 hour for images
  api: 10 * 60 * 1000, // 10 minutes for API responses
  static: 24 * 60 * 60 * 1000 // 24 hours for static resources
};

// Files to cache for offline functionality
const urlsToCache = [
  '/',
  '/offline.html',
  '/medical-search',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add critical medical calculator resources
  '/calculators',
  '/static/medical-data/critical-values.json'
];

// Medical news API patterns
const NEWS_API_PATTERNS = [
  /\/api\/medical-news(\?.*)?$/,
  /\/api\/medical-news\/trending(\?.*)?$/,
  /\/api\/medical-news\/categories(\?.*)?$/,
  /\/api\/medical-news\/recommendations(\?.*)?$/,
  /\/api\/medical-news\/analytics(\?.*)?$/
];

// Background sync tags
const SYNC_TAGS = {
  NEWS_INTERACTION: 'news-interaction-sync',
  READ_LATER: 'read-later-sync',
  SEARCH_SAVE: 'search-save-sync',
  MEDIMIND_OFFLINE: 'medimind-offline-sync'
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching critical resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force activate this service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  const currentCaches = [CACHE_NAME, NEWS_CACHE, IMAGES_CACHE, API_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all pages
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If successful, cache the response
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // If offline, serve from cache or fallback page
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Serve offline fallback page
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }
  
  // Handle Medical News API requests with smart caching
  if (isNewsApiRequest(url)) {
    event.respondWith(handleNewsApiRequest(request));
    return;
  }
  
  // Handle image requests with optimized caching
  if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/')) {
    event.respondWith(
      handleApiRequest(request)
    );
    return;
  }
  
  // Handle static assets (cache first strategy)
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // Cache the asset if successful
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            });
        })
    );
    return;
  }
  
  // Default: network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Helper functions
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

function isNewsApiRequest(url) {
  return NEWS_API_PATTERNS.some(pattern => pattern.test(url.pathname + url.search));
}

function isImageRequest(url) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'];
  return imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

function isCacheableAPIRequest(pathname) {
  // Cache medical calculator data and other static medical content
  const cacheablePatterns = [
    '/api/calculators',
    '/api/medical-data',
    '/api/reference-values'
  ];
  return cacheablePatterns.some(pattern => pathname.includes(pattern));
}

// Enhanced medical news API handler with stale-while-revalidate
async function handleNewsApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Check if cached response is fresh
  if (cachedResponse) {
    const cacheTime = new Date(cachedResponse.headers.get('sw-cache-time'));
    const now = new Date();
    
    if (now - cacheTime < CACHE_DURATION.api) {
      console.log('[SW] Serving fresh cached medical news API response');
      return cachedResponse;
    }
  }
  
  try {
    // Fetch fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone and cache with timestamp
      const responseClone = networkResponse.clone();
      const responseWithTimestamp = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          'sw-cache-time': new Date().toISOString()
        }
      });
      
      cache.put(request, responseWithTimestamp);
      console.log('[SW] Cached fresh medical news API response');
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Network failed for medical news API, trying cache');
  }
  
  // Return cached response as fallback
  if (cachedResponse) {
    console.log('[SW] Serving stale cached medical news API response');
    return cachedResponse;
  }
  
  // Return offline response for medical news
  return new Response(JSON.stringify({
    error: 'Offline',
    message: 'Medical news is currently unavailable offline. Please check your connection.',
    cached: false,
    offline: true
  }), {
    status: 503,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

// Optimized image request handler
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGES_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('[SW] Serving cached image');
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('[SW] Cached new medical image');
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Medical image fetch failed');
  }
  
  // Return placeholder for failed medical images
  return new Response(createMedicalImagePlaceholder(), {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}

// Enhanced API request handler
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses for medical data
    if (networkResponse.status === 200 && isCacheableAPIRequest(new URL(request.url).pathname)) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(API_CACHE);
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving API request from cache:', request.url);
      return cachedResponse;
    }
    
    // Return appropriate offline response
    const url = new URL(request.url);
    if (url.pathname.includes('medical') || url.pathname.includes('calculator')) {
      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'Medical data is temporarily unavailable. Some cached information may be available.',
        offline: true
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Create medical-themed placeholder for failed images
function createMedicalImagePlaceholder() {
  return `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc"/>
      <rect x="10%" y="10%" width="80%" height="80%" fill="#e2e8f0" rx="8"/>
      <circle cx="30%" cy="30%" r="6%" fill="#cbd5e0"/>
      <rect x="45%" y="25%" width="35%" height="4%" fill="#cbd5e0" rx="2"/>
      <rect x="45%" y="32%" width="25%" height="3%" fill="#e2e8f0" rx="1"/>
      <rect x="20%" y="50%" width="60%" height="2%" fill="#cbd5e0" rx="1"/>
      <rect x="20%" y="55%" width="45%" height="2%" fill="#e2e8f0" rx="1"/>
      <rect x="20%" y="60%" width="35%" height="2%" fill="#e2e8f0" rx="1"/>
      <text x="50%" y="80%" text-anchor="middle" fill="#64748b" font-size="10" font-family="sans-serif">
        Medical Image Unavailable
      </text>
      <text x="50%" y="88%" text-anchor="middle" fill="#94a3b8" font-size="8" font-family="sans-serif">
        Check your connection
      </text>
    </svg>
  `;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  switch (event.tag) {
    case SYNC_TAGS.NEWS_INTERACTION:
      event.waitUntil(syncNewsInteractions());
      break;
    case SYNC_TAGS.READ_LATER:
      event.waitUntil(syncReadLaterActions());
      break;
    case SYNC_TAGS.SEARCH_SAVE:
      event.waitUntil(syncSavedSearches());
      break;
    case SYNC_TAGS.MEDIMIND_OFFLINE:
      event.waitUntil(syncOfflineActions());
      break;
    default:
      console.log('[SW] Unknown sync tag:', event.tag);
  }
});

// Sync medical news interactions when back online
async function syncNewsInteractions() {
  try {
    const pendingInteractions = await getStoredData('pendingNewsInteractions') || [];
    
    for (const interaction of pendingInteractions) {
      try {
        await fetch('/api/news/interaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(interaction)
        });
        console.log('[SW] Synced news interaction:', interaction.type);
      } catch (error) {
        console.error('[SW] Failed to sync news interaction:', error);
      }
    }
    
    // Clear synced interactions
    await clearStoredData('pendingNewsInteractions');
  } catch (error) {
    console.error('[SW] News interaction sync failed:', error);
  }
}

// Sync read later actions
async function syncReadLaterActions() {
  try {
    const pendingActions = await getStoredData('pendingReadLaterActions') || [];
    
    for (const action of pendingActions) {
      try {
        await fetch('/api/read-later', {
          method: action.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        console.log('[SW] Synced read later action:', action.method);
      } catch (error) {
        console.error('[SW] Failed to sync read later action:', error);
      }
    }
    
    await clearStoredData('pendingReadLaterActions');
  } catch (error) {
    console.error('[SW] Read later sync failed:', error);
  }
}

// Sync saved searches
async function syncSavedSearches() {
  try {
    const pendingSearches = await getStoredData('pendingSavedSearches') || [];
    
    for (const search of pendingSearches) {
      try {
        await fetch('/api/saved-searches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(search)
        });
        console.log('[SW] Synced saved search');
      } catch (error) {
        console.error('[SW] Failed to sync saved search:', error);
      }
    }
    
    await clearStoredData('pendingSavedSearches');
  } catch (error) {
    console.error('[SW] Saved search sync failed:', error);
  }
}

async function syncOfflineActions() {
  try {
    // Get queued actions from IndexedDB or localStorage
    const queuedActions = await getQueuedActions();
    
    for (const action of queuedActions) {
      try {
        await processQueuedAction(action);
        await removeQueuedAction(action.id);
        console.log('[SW] Successfully synced action:', action.type);
      } catch (error) {
        console.error('[SW] Failed to sync action:', action.type, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function getQueuedActions() {
  // This would integrate with the OfflineActionQueue from the React app
  // For now, return empty array
  return [];
}

async function processQueuedAction(action) {
  // Process the queued action by making the appropriate API call
  console.log('[SW] Processing queued action:', action);
}

async function removeQueuedAction(actionId) {
  // Remove the action from the queue
  console.log('[SW] Removing queued action:', actionId);
}

// IndexedDB helper functions for medical news caching
async function storeData(key, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MediMindSW', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['medicalData'], 'readwrite');
      const store = transaction.objectStore('medicalData');
      
      store.put({ key, data, timestamp: Date.now() });
      
      transaction.oncomplete = () => resolve(data);
      transaction.onerror = () => reject(transaction.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('medicalData')) {
        db.createObjectStore('medicalData', { keyPath: 'key' });
      }
    };
  });
}

async function getStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MediMindSW', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['medicalData'], 'readonly');
      const store = transaction.objectStore('medicalData');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result?.data || null);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('medicalData')) {
        db.createObjectStore('medicalData', { keyPath: 'key' });
      }
    };
  });
}

async function clearStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MediMindSW', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['medicalData'], 'readwrite');
      const store = transaction.objectStore('medicalData');
      
      store.delete(key);
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push event:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from MediMind Expert',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('MediMind Expert', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker loaded successfully'); 