// Offline support: the app shell comes from the cache right away and is refreshed
// in the background, so a new version shows up on the next launch. caltrain.com
// requests go straight to the network; the page keeps its own saved timetable.
const CACHE = "commute-v2";
const SHELL = [
  "./", "manifest.webmanifest", "apple-touch-icon.png", "icon-192.png", "icon-512.png",
  "fonts/overpass-latin-400.woff2", "fonts/overpass-latin-600.woff2", "fonts/overpass-latin-800.woff2",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const key = e.request.mode === "navigate" ? "./" : e.request;
  const cache = caches.open(CACHE);
  const fresh = cache.then(c => fetch(e.request).then(res => {
    if (res.ok) c.put(key, res.clone());
    return res;
  }));
  e.respondWith(cache.then(c => c.match(key, { ignoreSearch: true })).then(cached => cached || fresh));
  e.waitUntil(fresh.catch(() => {}));
});
