const CACHE_NAME = "flash-math-cache-v1";
const urlsToCache = [
    ".",
    "index.html",
    "manifest.json",
    "icon-512.png",
];

// Install event: Caching static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Activates the new service worker immediately
});

// Activate event: Cleaning up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  clients.claim(); // Makes the service worker control all clients in its scope immediately
});

self.addEventListener("fetch", event => {
  event.respondWith(
    // Look for a match in the cache, ignoring query parameters
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      // If a cached response is found, return it.
      // Otherwise, try to fetch from the network.
      return response || fetch(event.request);
    })
  );
});