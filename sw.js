// GrAte Apex Hub — service worker
// Bump this on every deploy that changes app-shell files (html/css/js/icons)
// so returning users get the update instead of a stale cached copy.
var CACHE_VERSION = "gahub-v6";
var SHELL_CACHE = CACHE_VERSION + "-shell";
var HUB_CACHE = CACHE_VERSION + "-hubs";

var SHELL_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function(cache){
      // Cache each file individually instead of cache.addAll(), which is
      // all-or-nothing — a single missing/failed file (e.g. a path mismatch
      // on a particular host) would otherwise silently abort caching of
      // EVERY shell file, which is what was breaking offline mode.
      return Promise.all(SHELL_FILES.map(function(url){
        return cache.add(url).catch(function(err){
          console.warn("SW: failed to precache", url, err);
        });
      }));
    })
  );
});

// Wait for the page to explicitly say "go ahead" (via the update banner)
// before this version takes over, so it never swaps out from under someone
// mid-session.
self.addEventListener("message", function(event){
  if(event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(key){
        if(key.indexOf(CACHE_VERSION) !== 0) return caches.delete(key);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// respondWith() throws "Failed to convert value to 'Response'" if it's ever
// given undefined (e.g. a cache miss with no network to fall back to) — every
// fallback path below must resolve to an actual Response, never a bare
// possibly-undefined cache lookup.
function offlineResponse(kind){
  if(kind === "script"){
    return new Response("/* offline: unavailable */", { status: 200, headers: { "Content-Type": "application/javascript" } });
  }
  if(kind === "html"){
    return new Response(
      "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Offline</title></head>"
      + "<body style='font-family:sans-serif;padding:40px;text-align:center;color:#333'>"
      + "<h2>Not downloaded yet</h2><p>Open this hub once while online to make it available offline.</p>"
      + "</body></html>",
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  }
  return new Response("", { status: 503, statusText: "Offline" });
}

self.addEventListener("fetch", function(event){
  var req = event.request;
  if(req.method !== "GET") return;

  var url = new URL(req.url);
  // Never touch cross-origin requests (Google sign-in / Drive API, fonts, etc.) —
  // let those go straight to the network untouched.
  if(url.origin !== self.location.origin) return;

  // Hub content: cache-first, then fall back to network and cache what we get,
  // so each hub only needs to download once (even across sessions/offline).
  // IMPORTANT: this must run before the top-level "navigate" check below —
  // hub pages load inside an <iframe>, so their requests also arrive with
  // req.mode === "navigate". If the generic navigate handler ran first, an
  // offline hub open would incorrectly fall back to index.html instead of
  // the actual (already-cached) hub page.
  if(url.pathname.indexOf("/hubs/") !== -1){
    event.respondWith(
      caches.match(req).then(function(cached){
        if(cached) return cached;
        return fetch(req).then(function(res){
          if(res && res.ok){
            var copy = res.clone();
            caches.open(HUB_CACHE).then(function(cache){
              return cache.put(req, copy).catch(function(err){ console.warn("SW: cache.put failed for", req.url, err); });
            });
          }
          return res;
        }).catch(function(){ return cached || offlineResponse("html"); });
      })
    );
    return;
  }

  // Full-page navigations: try the network first (so you get the latest
  // page while online), but if that fails — offline, DNS down, etc. — always
  // fall back to the cached app shell rather than the browser's dinosaur
  // offline page. This is what actually makes "open the app with no signal"
  // work.
  if(req.mode === "navigate"){
    event.respondWith(
      fetch(req).catch(function(){
        return caches.match("./index.html").then(function(cached){
          if(cached) return cached;
          return caches.match("./").then(function(root){ return root || offlineResponse("html"); });
        });
      })
    );
    return;
  }

  // firebase-init.js holds the FIREBASE_CONFIG you'll edit as you set things
  // up — always try the network first so a config change takes effect on
  // the very next load, falling back to cache only if truly offline.
  if(url.pathname.indexOf("firebase-init.js") !== -1){
    event.respondWith(
      fetch(req).then(function(res){
        if(res && res.ok){
          var copy=res.clone();
          caches.open(SHELL_CACHE).then(function(cache){
            return cache.put(req, copy).catch(function(err){ console.warn("SW: cache.put failed for", req.url, err); });
          });
        }
        return res;
      }).catch(function(){ return caches.match(req).then(function(cached){ return cached || offlineResponse("script"); }); })
    );
    return;
  }

  // App shell assets (css/js/icons/manifest): cache-first with a background
  // network refresh, so the app loads instantly while still picking up
  // updates for next time.
  event.respondWith(
    caches.match(req).then(function(cached){
      var networkFetch = fetch(req).then(function(res){
        if(res && res.ok){
          var copy = res.clone();
          caches.open(SHELL_CACHE).then(function(cache){
            return cache.put(req, copy).catch(function(err){ console.warn("SW: cache.put failed for", req.url, err); });
          });
        }
        return res;
      }).catch(function(){ return cached || offlineResponse(); });
      return cached || networkFetch;
    })
  );
});
