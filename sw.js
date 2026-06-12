/* Service worker — offline support for Čtecí ZOO.
 *
 * Strategy:
 *   - install: precache the app shell + content JSONs, then every animal
 *     image listed in the manifest (≈3.5 MB total, one-time).
 *   - fetch: images are cache-first (they never change for a given id);
 *     everything else is network-first with cache fallback, so code and
 *     content updates arrive on the next online launch while the app
 *     still works fully offline.
 *
 * Bump VERSION on releases that should force a clean re-cache.
 */
const VERSION = 'reading-zoo-v1';

const CORE = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './js/data.js',
  './js/state.js',
  './js/speech.js',
  './js/lessons.js',
  './js/tasks.js',
  './js/views.js',
  './js/app.js',
  './data/content/curriculum_v2.json',
  './data/content/animals_50_seed.json',
  './data/content/stories_25.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(CORE);
    // Animal images come from the manifest so the list never drifts.
    try {
      const res = await cache.match('./data/content/animals_50_seed.json');
      const doc = await res.json();
      const images = (doc.animals || []).map((a) => './' + a.imagePath);
      await cache.addAll(images);
    } catch (err) {
      // Offline images are best-effort; the app still works without them.
      console.warn('[SW] animal image precache failed', err);
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n !== VERSION).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isImage = /\.(png|svg|jpg|webp|ico)$/.test(url.pathname);

  event.respondWith((async () => {
    const cache = await caches.open(VERSION);

    if (isImage) {
      // cache-first
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    }

    // network-first with cache fallback (keeps code/content fresh online)
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      const hit = await cache.match(req)
        || (req.mode === 'navigate' ? await cache.match('./index.html') : null);
      if (hit) return hit;
      throw err;
    }
  })());
});
