// GrAte Apex service worker: lets the app open and lessons be read with no signal.
// __BUILD__ is replaced on every deploy, so a new deploy swaps the cache cleanly.
// A new version waits until the app asks it to take over (the "New version available" banner, src/updatePrompt.tsx),
// so the page you are using is never switched under you half-way through a quiz.
const BUILD = "__BUILD__";
const CACHE = "ga-" + BUILD;
const SHELL = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/favicon.ico"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type === "SKIP_WAITING") self.skipWaiting(); // the student tapped Refresh
  else if (d.type === "GET_BUILD" && e.ports && e.ports[0]) e.ports[0].postMessage({ build: BUILD }); // lets the page tell if this is a newer version
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("ga-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const put = (req, res) => { if (res && res.ok && res.type === "basic") { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; };

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // Firebase and Google go straight to the network
  if (url.pathname === "/sw.js") return;

  // Pages: network first (so deploys show up), fall back to the saved app.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then((r) => put(req, r)).catch(() => caches.match(req).then((r) => r || caches.match("/")))
    );
    return;
  }
  // Built files have fingerprinted names: safe to serve from the cache forever.
  if (url.pathname.startsWith("/_expo/") || url.pathname.startsWith("/assets/")) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((n) => put(req, n))));
    return;
  }
  // Everything else (icons, manifest): show the saved copy, refresh it in the background.
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((n) => put(req, n)).catch(() => hit);
      return hit || net;
    })
  );
});

// ---- Push notifications ----
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : "" }; }

  // Incoming call: stays on screen and vibrates like a ring until answered, declined or cancelled.
  if (d.type === "call") {
    e.waitUntil(self.registration.showNotification(d.title || "Incoming call", {
      body: d.body || "Incoming audio call", icon: "/icon-192.png", badge: "/icon-192.png", tag: d.tag || "call",
      renotify: true, requireInteraction: true, silent: false, vibrate: [800, 400, 800, 400, 800, 400, 800],
      actions: [{ action: "answer", title: "Answer" }, { action: "decline", title: "Decline" }],
      data: { url: d.url || "/", call: d.callId },
    }));
    return;
  }
  // The caller hung up before it was answered: stop the ringing and leave a "Missed call".
  if (d.type === "call-cancel") {
    e.waitUntil((async () => {
      (await self.registration.getNotifications({ tag: d.tag })).forEach((n) => n.close());
      await self.registration.showNotification(d.title || "Missed call", {
        body: d.body || "You missed a call", icon: "/icon-192.png", badge: "/icon-192.png", tag: (d.tag || "call") + "-missed", data: { url: d.url || "/" },
      });
    })());
    return;
  }

  e.waitUntil(self.registration.showNotification(d.title || "GrAte Apex", {
    body: d.body || "You have a new notification",
    icon: "/icon-192.png", badge: "/icon-192.png", tag: d.tag, data: { url: d.url || "/" },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const data = e.notification.data || {};
  if (e.action === "decline") return; // the invite stops ringing on its own; the caller sees "No answer"
  const answer = !!data.call && e.action === "answer"; // "Answer" button = pick up straight away; tapping the body just opens the ring screen
  const url = data.url || "/";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    for (const c of cs) {
      if ("focus" in c) { if (answer) c.postMessage({ type: "call-answer", callId: data.call }); return c.focus(); }
    }
    return self.clients.openWindow(answer ? `${url}${url.includes("?") ? "&" : "?"}answer=${encodeURIComponent(data.call)}` : url);
  }));
});
