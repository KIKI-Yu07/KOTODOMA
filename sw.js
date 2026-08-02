// Service Worker — PWA offline support & auto-update
// 1785677514634 is replaced by the sw-version Vite plugin at build time
const CACHE = `nihongo-1785677514634`;

// Root-level files to pre-cache for offline
const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(PRECACHE).catch(() => {
        // Some PRECACHE entries may 404 in dev — ignore
      })
    )
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

  // For navigation requests (HTML), try network first so user always gets latest
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // For static assets (JS, CSS, images), cache-first
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

// Notify user when new version is available
self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
