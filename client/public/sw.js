const CACHE_NAME = "nfood-shell-v3";
const SHELL = [
  "/",
  "/manifest.webmanifest",
  "/manifest.admin.webmanifest",
  "/manifest.restaurant_admin.webmanifest",
  "/manifest.kitchen.webmanifest",
  "/manifest.bar.webmanifest",
  "/manifest.waiter.webmanifest",
  "/manifest.cashier.webmanifest",
  "/manifest.driver.webmanifest",
  "/manifest.customer.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "REQUEST_SYNC") self.registration.sync?.register("nfood-data-sync").catch(() => undefined);
});

self.addEventListener("sync", (event) => {
  if (event.tag !== "nfood-data-sync") return;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => clients.forEach((client) => client.postMessage({ type: "NFOOD_SYNC_REQUEST" }))));
});

self.addEventListener("push", (event) => {
  let data = { title: "NFOOD", body: "لديك تحديث جديد في مساحة العمل." };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch { /* fallback */ }
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
