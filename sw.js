// Travel Helper service worker — offline app shell
const CACHE = 'travel-helper-v3'; // v3: share target + manage-trip links + screenshot import
const SHELL = ['./', './index.html', './airports.js', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Notification actions — lets the Galaxy Watch's mirrored notification
// drive the app: NEXT advances the phase, SAY IT repeats the voice line.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const cmd = e.action || 'focus';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length) {
        list[0].postMessage({ cmd });
        if (list[0].focus) return list[0].focus();
      } else if (cmd === 'focus') {
        return clients.openWindow('./');
      }
    })
  );
});

// App shell: network-first (so updates land), cache fallback (so it works at 35,000 ft).
// Weather API: network-only, fail silently — the app handles it.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // let API calls hit the network directly

  // Android Share Target: screenshots shared from Gmail land here,
  // get stashed in a cache, and the app picks them up on redirect.
  if (e.request.method === 'POST' && url.pathname.endsWith('/share-target/')) {
    e.respondWith((async () => {
      try {
        const form = await e.request.formData();
        const files = form.getAll('media').filter(f => f && f.size);
        const text = form.get('text') || form.get('title') || '';
        const cache = await caches.open('th-share');
        await cache.put('shared-text', new Response(text));
        await cache.put('shared-count', new Response(String(files.length)));
        for (let i = 0; i < files.length; i++) {
          await cache.put('shared-file-' + i, new Response(files[i], { headers: { 'content-type': files[i].type || 'image/png' } }));
        }
      } catch (err) {}
      return Response.redirect('./?shared=1', 303);
    })());
    return;
  }
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
