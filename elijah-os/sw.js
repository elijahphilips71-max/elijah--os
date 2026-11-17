// Elijah OS service worker: lets the app open offline.
// Bump VERSION whenever you change files, so phones pick up the new version.
const VERSION = 'elijah-os-v22';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/nocturne.css',
  './css/app.css',
  './js/schedule.js',
  './js/questions.js',
  './js/updates.js',
  './js/cal.js',
  './js/planner.js',
  './js/config.js',
  './js/store.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-192.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Tapping a reminder opens (or focuses) the app.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const open = list.find(c => c.url.startsWith(self.registration.scope));
    return open ? open.focus() : self.clients.openWindow(self.registration.scope);
  }));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Never cache Supabase API or auth calls.
  if (url.hostname.endsWith('supabase.co') || url.hostname.endsWith('supabase.in')) return;

  // Network first (so edits show up), falling back to the cache when offline.
  e.respondWith(
    fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: url.origin === location.origin }).then(r => r || caches.match('./index.html')))
  );
});
