import { Platform } from "react-native";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Web push: a notification appears on the phone/computer even when the app is closed.
// Needs the public VAPID key in EXPO_PUBLIC_VAPID_PUBLIC (see README).
const KEY = process.env.EXPO_PUBLIC_VAPID_PUBLIC || "";
import { API_BASE as BASE } from "./apiBase";

export type PushState = "unsupported" | "needs-install" | "not-configured" | "blocked" | "off" | "on";

const isWeb = Platform.OS === "web" && typeof window !== "undefined";
const standalone = () => isWeb && ((window.matchMedia?.("(display-mode: standalone)").matches) || (navigator as any).standalone === true);
const iOS = () => isWeb && /iphone|ipad|ipod/i.test(navigator.userAgent);

const b64 = (s: string) => { const p = "=".repeat((4 - (s.length % 4)) % 4); const r = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...r].map((c) => c.charCodeAt(0))); };
// a short stable id from the endpoint, so subscribing twice doesn't duplicate
const idOf = (endpoint: string) => { let h = 5381; for (let i = 0; i < endpoint.length; i++) h = ((h * 33) ^ endpoint.charCodeAt(i)) >>> 0; return h.toString(36) + endpoint.slice(-12).replace(/[^a-z0-9]/gi, ""); };

async function registration() {
  if (!("serviceWorker" in navigator)) return null;
  return (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.register("/sw.js"));
}

export async function pushState(): Promise<PushState> {
  if (!isWeb || !("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return iOS() && !standalone() ? "needs-install" : "unsupported";
  }
  if (!KEY) return "not-configured";
  if (Notification.permission === "denied") return "blocked";
  if (Notification.permission !== "granted") return "off";
  try { const r = await registration(); return (await r?.pushManager.getSubscription()) ? "on" : "off"; } catch { return "off"; }
}

export async function enablePush(uid: string): Promise<void> {
  if (!KEY) throw new Error("Push isn't set up yet (the app owner needs to add the VAPID key).");
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Notifications are blocked. Allow them in your browser's site settings, then try again.");
  const reg = await registration();
  if (!reg) throw new Error("This browser can't do push notifications.");
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(KEY) });
  const j: any = sub.toJSON();
  await setDoc(doc(db, "users", uid, "pushSubs", idOf(sub.endpoint)), { endpoint: sub.endpoint, keys: { p256dh: j.keys.p256dh, auth: j.keys.auth }, createdAt: Date.now() });
}

export async function disablePush(uid: string): Promise<void> {
  const reg = await registration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) { await deleteDoc(doc(db, "users", uid, "pushSubs", idOf(sub.endpoint))).catch(() => {}); await sub.unsubscribe().catch(() => {}); }
  // clear any other saved devices-of-this-browser entries is unnecessary: stale ones are removed when a send fails
}

// Ask the server to send the push for a notification we just created. Best effort.
export async function pushFor(to: string, id: string) {
  try {
    const tok = await auth.currentUser?.getIdToken(); if (!tok) return;
    await fetch(`${BASE}/api/push`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${tok}` }, body: JSON.stringify({ to, id }) });
  } catch { /* nice to have */ }
}

// Ring (or stop ringing) a friend's phone for an audio call, even when their app is closed. Best effort.
export async function pushCall(to: string, callId: string, kind: "ring" | "cancel") {
  try {
    const tok = await auth.currentUser?.getIdToken(); if (!tok) return;
    await fetch(`${BASE}/api/callpush`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${tok}` }, body: JSON.stringify({ to, callId, kind }) });
  } catch { /* nice to have */ }
}
