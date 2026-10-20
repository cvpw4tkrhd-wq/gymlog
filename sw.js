// Offline-cache: appen öppnas utan nät. Byt version (V) när du uppdaterar index.html.
const V = 'armpass-v13';
const ASSETS = ['./', './index.html', './kost.js', './ovningar.js', './livsmedel.json', './manifest.webmanifest', './icon-v2-192.png', './icon-v2-512.png', './icon-v2-maskable-512.png', './icon-v2-apple-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Snabbt från cache, uppdateras i bakgrunden. GitHub-API:t (backup) går aldrig via cachen.
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    caches.open(V).then(async c => {
      const hit = await c.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request)
        .then(r => { if (r.ok) c.put(e.request, r.clone()); return r; })
        .catch(() => hit);
      return hit || net;
    })
  );
});

// Vilotimer-notis: sidan skickar sluttiden, och den här filen visar en notis när vilan är slut
// (bara om appen inte är synlig, utom för testnotisen).
let restT = null, restRes = null;
function clearRest() {
  if (restT) { clearTimeout(restT); restT = null; }
  if (restRes) { restRes(); restRes = null; }
}
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type !== 'rest' && d.type !== 'rest-cancel') return;
  clearRest();
  if (d.type === 'rest-cancel') return;
  const ms = Math.max(0, (d.end || 0) - Date.now());
  e.waitUntil(new Promise(res => {
    restRes = res;
    restT = setTimeout(() => {
      restT = null; restRes = null;
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
        if (!d.force && cs.some(c => c.visibilityState === 'visible')) return;
        return self.registration.showNotification('Vilan är slut', {
          body: d.body || 'Dags för nästa set',
          tag: 'gymlog-rest', renotify: true, vibrate: [250, 120, 250],
          icon: 'icon-v2-192.png', badge: 'icon-v2-192.png'
        });
      }).then(res, res);
    }, ms);
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => 'focus' in x);
    return c ? c.focus() : self.clients.openWindow('./');
  }));
});
