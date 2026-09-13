const CACHE_NAME = 'mg-portones-v65-2-solo-diagrama';
const ASSETS = [
  './',
  './index.html',
  './manuales-apoyo.js',
  './taller/index.html',
  './taller/taller.css',
  './taller/taller.js',
  './inventario-general/index.html',
  './inventario-general/inventario.css',
  './inventario-general/inventario.js',
  './inventario-general/supabase-inventario-config.js',
  './inventario-general/supabase-inventario.js',
  './piloto-repuestos-nice-road/index.html',
  './piloto-repuestos-nice-road/nice-road-despiece.png',
  './piloto-repuestos-beninca-bull5m/index.html',
  './piloto-repuestos-beninca-bull5m/beninca-bull5m-despiece.png',
  './piloto-repuestos-came-axo/index.html',
  './piloto-repuestos-liftmaster/index.html',
  './piloto-repuestos-liftmaster/liftmaster-1240-1250-unidad-motor.png',
  './piloto-repuestos-beninca-bob50m/index.html',
  './piloto-repuestos-beninca-bob50m/beninca-bob50m-despiece.png',
  './piloto-repuestos-beninca-bill30m/index.html',
  './piloto-repuestos-beninca-bill30m/beninca-bill30m-despiece.png',
  './piloto-repuestos-genius-gbat300/index.html',
  './piloto-repuestos-genius-gbat300/genius-gbat300-despiece.png',
  './piloto-repuestos-genius-milord424/index.html',
  './piloto-repuestos-genius-milord424/genius-milord424-despiece.png',
  './piloto-repuestos-genius-blizzard400/index.html',
  './piloto-repuestos-genius-blizzard400/genius-blizzard400-despiece.png',
  './manuales/beninca-heady.pdf',
  './manuales/beninca-brainy-24.pdf',
  './manuales/ditec-vivah.pdf',
  './manuales/entrematic-lcu30h.pdf',
  './manuales/genius-sprint-383.pdf',
  './manuales/nice-pistones.pdf',
  './manuales/came-zlj24.pdf',
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

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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
