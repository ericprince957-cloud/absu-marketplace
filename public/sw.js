const CACHE_NAME = "absu-marketplace-shell-v1";
const OFFLINE_URL = "/offline";
const APP_SHELL = [OFFLINE_URL, "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Never cache account, seller, admin, auth, API or Supabase data.
  if (/^\/(dashboard|seller|admin|login|register|verify-email|reset-password|api)(\/|$)/.test(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(async () => {
      const cached = await caches.match(OFFLINE_URL);
      return cached || Response.error();
    }));
    return;
  }

  if (["style", "script", "font", "image"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
        return cached || network;
      })
    );
  }
});
