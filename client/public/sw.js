const CACHE_NAME = "nfood-shell-v1";
const SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "NFOOD", body: "لديك تحديث جديد في مساحة العمل." };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch { /* fallback text intentionally omitted */ }
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, dir: "rtl", lang: "ar", tag: "nfood-update" }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => { const first = clients[0]; if (first) return first.focus(); return self.clients.openWindow("/"); }));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  event.respondWith(fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match("/"))));
});
