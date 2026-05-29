const CACHE_NAME = 'simplex-pl-v1';
const PYODIDE_CACHE = 'pyodide-cache-v1';

const STATIC_ASSETS = ['./', './index.html', './logo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter(n => n !== CACHE_NAME && n !== PYODIDE_CACHE).map(n => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (url.includes('cdn.jsdelivr.net/pyodide') || url.includes('pyodide')) {
    event.respondWith(
      caches.open(PYODIDE_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) {
            // Notificar que viene del caché
            return cached;
          }
          return fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  if (url.includes('katex') || url.includes('tailwindcss')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
