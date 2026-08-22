/* StudentVerse Service Worker - Offline Caching Engine */
const CACHE_NAME = 'studentverse-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './dashboard.html',
  './academics.html',
  './timetable.html',
  './goals.html',
  './wellness.html',
  './profile.html',
  './assets/icons/favicon.svg',
  './manifest.json',
  './css/base.css',
  './css/sidebar.css',
  './css/components.css',
  './css/dashboard.css',
  './css/academics.css',
  './css/timetable.css',
  './css/goals.css',
  './css/wellness.css',
  './css/profile.css',
  './js/store.js',
  './js/audio.js',
  './js/app.js',
  './js/dashboard.js',
  './js/academics.js',
  './js/timetable.js',
  './js/goals.js',
  './js/wellness.js',
  './js/profile.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Pre-caching partial error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Navigation & network first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request) || caches.match('./dashboard.html');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cache and update in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
