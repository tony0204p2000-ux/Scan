/* 工單點交核對（手機版）離線快取：先用網路最新版，沒網路時用快取 */
const CACHE = 'wo-check-v11';
const FILES = ['./', './index.html', './zxing-wasm.js', './zxing_reader.wasm', './zxing.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('wo-check-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { if(r.ok){ const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; })
      .catch(() => caches.match(e.request, {ignoreSearch:true}).then(r => r || caches.match('./index.html')))
  );
});
