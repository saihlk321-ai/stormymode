// Waypoint service worker — caches the app shell so it works offline.
// Story data itself lives in IndexedDB, not the cache, so updating this
// worker never touches saved stories.

const CACHE_NAME = "waypoint-shell-v5";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // cache.addAll() is all-or-nothing — a single failed request (a bad
      // path, a network hiccup, anything) would silently abort the whole
      // install and leave the app with NO offline cache at all. Fetch each
      // file individually instead, so one bad file can't sink the rest.
      Promise.allSettled(
        SHELL_FILES.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("[waypoint sw] failed to precache", url, err);
          })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Page loads: try the network for the freshest copy, but if there's no
  // connection, always fall back to the cached app shell so the app still
  // opens. This is what actually makes "Add to Home Screen" work offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Everything else (CSS, JS, icons, fonts): network-first, cache as a
  // fallback. Cache opaque cross-origin responses too (e.g. Google Fonts),
  // not just same-origin "basic" ones, so they survive offline once loaded.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
