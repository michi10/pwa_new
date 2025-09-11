// Minimaler offline-Cache (stabil auf schwachen Geräten)
const NAME = 'cws-v1';
const ASSETS = [
  './', './index.html', './styles.css', './app.js',
  './data/demo.js',
  './widgets/dashboard.html','./widgets/dashboard.css','./widgets/dashboard.js',
  './widgets/map.html','./widgets/map.css','./widgets/map.js',
  './widgets/calendar.html','./widgets/calendar.css','./widgets/calendar.js',
  './widgets/rain.html','./widgets/rain.css','./widgets/rain.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(NAME).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==NAME).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
