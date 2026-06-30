const CACHE_NAME = 'mg-portones-v59-3';
const ASSETS = [
  './',
  './index.html',
  './manuales-apoyo.js',
  './manuales/beninca-heady.pdf',
  './manuales/beninca-brainy-24.pdf',
  './manuales/ditec-vivah.pdf',
  './manuales/entrematic-lcu30h.pdf',
  './manuales/genius-sprint-383.pdf',
  './manuales/nice-pistones.pdf',
  './manuales/came-zlj24.pdf',
  './manuales/ditec-e2h-ip1967es.pdf',
  './manuales/allmatic-b1ee-ermes-new.pdf',
  './manuales/beninca-cpb24esa.pdf',
  './manuales/bft-b-alcor-n.pdf',
  './manuales/beninca-cpbull8.pdf',
  './manuales/liftmaster-csw24ul.pdf',
  './manuales/beninca-head-gbr3.pdf',
  './manuales/ja388.pdf',
  './manuales/liftmaster-la350.pdf',
  './manuales/euro24-m1.pdf',
  './manuales/nice-road-corredera.pdf',
  './manuales/beninca-bull624.pdf',
  './manuales/beninca-matrix-cpbull.pdf',
  './manuales/allmatic-pistones.pdf',
  './manuales/porton-sts.pdf',
  './manuales/q80s-es.pdf',
  './conocimiento/index.html',
  './conocimiento/conocimiento.css',
  './conocimiento/conocimiento.js',
  './conocimiento/casos-ejemplo.json',
  './manifest.webmanifest',
  './mg-logo.jpg',
  './mg-icon-192.png',
  './mg-icon-512.png',
  './supabase-config.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
