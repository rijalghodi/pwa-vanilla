const CACHE_NAME = "pwa-vanilla-cache";
const OFFLINE_URL = "/";
const ASSETS_TO_CACHE = [
  "images/192.png",
  "images/512.png",
  "images/favicon.ico",
];

// Install event to cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event to clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Fetch assets from cache or network
self.addEventListener("fetch", (event) => {
  // Always fetch HTML, CSS, and JS from the network
  if (
    event.request.destination === "document" ||
    event.request.destination === "style" ||
    event.request.destination === "script"
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return; // Exit early for HTML, CSS, and JS
  }

  // Use cache for other resources and update cache when online
  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse) => {
        // If found in cache, return it
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request).then((networkResponse) => {
          // Cache the new asset if it’s a request for posts
          if (event.request.url.includes("/posts")) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse; // Return the network response
            });
          }
          return networkResponse; // Return the network response for other assets
        });
      })
      .catch(() => {
        // Fallback to offline URL for failed requests
        return caches.match(OFFLINE_URL);
      })
  );
});
