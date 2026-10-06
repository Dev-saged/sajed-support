const V = 'app-v1.0.0';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (u.origin !== location.origin && !/^fonts\.(googleapis|gstatic)\.com$/.test(u.host)) return;
  e.respondWith(
    caches.match(r).then(hit => {
      const net = fetch(r).then(res => {
        if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); }
        return res;
      }).catch(() => hit || caches.match('index.html'));
      return hit || net;
    })
  );
});
