/**
 * UPSC Pro - Production Service Worker
 * Version: 2.0.0 (Cache Buster)
 * Strategy: Stale-While-Revalidate for UI, Network-First for Quiz Data.
 */

// CHANGED: Incremented version to force all users to get new files
const CACHE_NAME = 'upsc-pro-v2';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './assets/js/config.js',
    './assets/js/store.js',
    './assets/js/adapter.js',
    './assets/js/engine.js',
    './assets/js/ui.js',
    './assets/js/main.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 1. Install Event: Precache static UI assets
self.addEventListener('install', (event) => {
    self.skipWaiting(); // CHANGED: Force new worker to take over immediately
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_ASSETS))
    );
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete ANY cache that isn't v2
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Control all tabs immediately
    );
});

// 3. Fetch Event: Smart Routing
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Strategy A: Network-First for Quiz Data (.json files)
    if (url.pathname.endsWith('.json')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const resClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, resClone);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Strategy B: Stale-While-Revalidate for UI Assets
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});


