import React, { useCallback, useEffect, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./Text";
import { useColors } from "./theme";
import { Em } from "./components/em";

// "New version available" banner for the installed web app (PWA).
//
// How it fits together:
//  - public/sw.js no longer takes over the moment a new version is deployed. The new service worker waits.
//  - This file notices that waiting worker (and re-checks for one every 20 minutes, when the app comes back to the
//    front, and when the phone comes back online), then shows a banner.
//  - Tapping Refresh tells the waiting worker to take over, and the page reloads once it has.
//  - scripts/postbuild-web.mjs stamps the same build id into the page (window.__GA_BUILD__) and into sw.js, so a
//    waiting worker that is the SAME version as the page you are looking at never triggers a banner.

const CHECK_EVERY = 20 * 60 * 1000;
const pageBuild = (): string | undefined => (typeof window !== "undefined" ? (window as any).__GA_BUILD__ : undefined);

// Ask a service worker which build it is (sw.js answers GET_BUILD).
function workerBuild(w: ServiceWorker): Promise<string | undefined> {
  return new Promise((resolve) => {
    const ch = new MessageChannel();
    const t = setTimeout(() => resolve(undefined), 1500);
    ch.port1.onmessage = (e) => { clearTimeout(t); resolve(e.data?.build); };
    try { w.postMessage({ type: "GET_BUILD" }, [ch.port2]); } catch { clearTimeout(t); resolve(undefined); }
  });
}

export function useAppUpdate() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    let alive = true;
    let reg: ServiceWorkerRegistration | undefined;

    const consider = async (w: ServiceWorker | null) => {
      if (!w || !navigator.serviceWorker.controller) return; // very first install: there is nothing older to update from
      const b = await workerBuild(w);
      if (!alive) return;
      if (b && b === pageBuild()) { w.postMessage({ type: "SKIP_WAITING" }); return; } // same version as this page: just switch over quietly
      setWaiting(w);
    };

    navigator.serviceWorker.ready.then((r) => {
      if (!alive) return;
      reg = r;
      consider(r.waiting);
      r.addEventListener("updatefound", () => {
        const w = r.installing;
        if (!w) return;
        w.addEventListener("statechange", () => { if (w.state === "installed") consider(r.waiting ?? w); });
      });
    }).catch(() => { });

    const check = () => { reg?.update().catch(() => { }); };
    const iv = setInterval(check, CHECK_EVERY);
    const vis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("online", check);
    return () => {
      alive = false;
      clearInterval(iv);
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("online", check);
    };
  }, []);

  const apply = useCallback(() => {
    if (!waiting || refreshing) return;
    setRefreshing(true);
    let done = false;
    const go = () => { if (!done) { done = true; window.location.reload(); } };
    navigator.serviceWorker.addEventListener("controllerchange", go); // the new worker took over: load the new version
    setTimeout(go, 3000); // safety net if the browser never says so
    waiting.postMessage({ type: "SKIP_WAITING" });
  }, [waiting, refreshing]);

  const dismiss = useCallback(() => setWaiting(null), []); // "Later": asks again next time the app opens

  return { ready: !!waiting, apply, dismiss, refreshing };
}

export function UpdateBanner() {
  const COLORS = useColors();
  const insets = useSafeAreaInsets();
  const { ready, apply, dismiss, refreshing } = useAppUpdate();
  if (!ready) return null;
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", top: insets.top + 10, left: 12, right: 12, alignItems: "center", zIndex: 1000 }}>
      <View style={{ flexDirection: "row", alignItems: "center", width: "100%", maxWidth: 520, padding: 12, borderRadius: 16, backgroundColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.border }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ color: COLORS.onPrimary, fontWeight: "800", fontSize: 14 }}><Em n="sparkle" /> New version available</Text>
          <Text style={{ color: COLORS.onPrimary, opacity: 0.85, fontSize: 12, marginTop: 2 }}>Refresh to get the latest. Finish any timed round first.</Text>
        </View>
        <TouchableOpacity onPress={apply} disabled={refreshing} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: COLORS.onPrimary, opacity: refreshing ? 0.6 : 1 }}>
          <Text style={{ color: COLORS.primary, fontWeight: "800", fontSize: 13 }}>{refreshing ? "Updating…" : "Refresh"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Later" style={{ paddingLeft: 12 }}>
          <Text style={{ color: COLORS.onPrimary, opacity: 0.8, fontSize: 16 }}><Em n="close" /></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
