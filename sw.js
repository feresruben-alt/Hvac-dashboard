// Service worker HVAC Finanzas: abre la app aunque no haya red. Los datos (Google Apps Script) NUNCA se guardan aquí.
const CACHE = 'hvac-finanzas-v1';
const SHELL = ['dashboard.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  // Solo archivos de esta misma página; todo lo demás (Apps Script, tipo de cambio) va directo a la red.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  // Primero la red (siempre la versión más nueva); si no hay red, la copia guardada.
  e.respondWith(fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match('dashboard.html'))));
});
