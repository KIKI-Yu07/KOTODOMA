// Service Worker — PWA offline support & auto-update
const CACHE = "nihongo-v1";

// Files to cache for offline use
const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for static assets, network-first for everything else
self.addEventListener("fetch", (e) => {
  // Don't cache API calls
  if (e.request.url.includes("/api/")) return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

// Notify user when new version is available
self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
