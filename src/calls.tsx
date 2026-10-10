import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Platform, ScrollView, TouchableOpacity, View } from "react-native";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";
import { Text } from "./Text";
import { useAuth } from "./auth";
import { useColors } from "./theme";
import { Avatar } from "./MediaUI";
import { UserHit } from "./social";
import { fetchFriends, logCall } from "./messages";
import { pushCall } from "./push";
import { usePhotos } from "./photos";
import { fmt } from "./voice";
import { CallOverlay } from "./CallOverlay";
import { Em } from "./components/em";

// Free audio calls between friends, WhatsApp style: ring someone, then add more people while you talk (up to 6).
// WebRTC mesh: every person connects straight to every other person; Firestore (calls/{id}) only carries the hand-shake.
// STUN is Google's free server. Strict networks may need a TURN relay: set EXPO_PUBLIC_TURN_URL / _USER / _CRED to add one.
const RTC = () => (globalThis as any).RTCPeerConnection;
export const callsSupported = () => Platform.OS === "web" && !!RTC() && typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
const RING_MS = 45000;
const MAX_PEOPLE = 6;

const iceServers = () => {
  const s: any[] = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];
  const url = process.env.EXPO_PUBLIC_TURN_URL;
  if (url) s.push({ urls: url.split(","), username: process.env.EXPO_PUBLIC_TURN_USER, credential: process.env.EXPO_PUBLIC_TURN_CRED });
  return s;
};

type Invite = { callId: string; from: string; fromName: string; names: Record<string, string> };
type Peer = { state: "joined" | "left" | "declined"; busy?: boolean };
const Ctx = createContext<{ call: (peer: UserHit) => Promise<void>; busy: boolean; status: string }>({ call: async () => { }, busy: false, status: "" });
export const useCall = () => useContext(Ctx);

export function CallHost({ children }: { children: React.ReactNode }) {
  const COLORS = useColors();
  const { user, profile } = useAuth();
  const me = user && profile ? { uid: user.uid, username: profile.username } : null;
  const meRef = useRef(me); meRef.current = me;

  const [incoming, setIncoming] = useState<Invite | null>(null);
  const [callId, setCallId] = useState("");                       // the call I'm in (empty = not in one)
  const [members, setMembers] = useState<string[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [peers, setPeers] = useState<Record<string, Peer>>({});
  const [linked, setLinked] = useState<Record<string, boolean>>({}); // peers whose audio is connected
  const [muted, setMuted] = useState(false);
  const [secs, setSecs] = useState(0);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [adding, setAdding] = useState(false);
  const [friends, setFriends] = useState<UserHit[]>([]);

  const pcs = useRef<Map<string, { pc: any; queue: any[]; audio?: any }>>(new Map());
  const local = useRef<MediaStream | null>(null);
  const unsubs = useRef<(() => void)[]>([]);
  const idRef = useRef(""), incomingRef = useRef<Invite | null>(null), ringT = useRef<any>(null), waitT = useRef<any>(null);
  const membersRef = useRef<string[]>([]), peersRef = useRef<Record<string, Peer>>({}), namesRef = useRef<Record<string, string>>({});
  const joinedOnce = useRef(false);
  const accepting = useRef(false);                 // true while I am picking up (mic prompt open), so a second tap or a second ring is ignored
  const dialed = useRef<UserHit | null>(null);   // who I rang (only set when I am the caller)
  const connectedAt = useRef(0);                   // when the audio first connected, for "how long did we talk"
  const wasLinked = useRef<Set<string>>(new Set()); // peers that were connected at some point (so a drop reads "Reconnecting…")
  const autoAnswer = useRef("");                    // set when the person tapped "Answer" on the call notification

  // ---- tear-down -------------------------------------------------------------------------------------------------
  const closeAll = useCallback(() => {
    // The caller leaves a line in the chat: missed, declined, or answered (+ how long). Runs once, before the state is cleared.
    const m = meRef.current, d = dialed.current;
    if (m && d && idRef.current) {
      const st = peersRef.current[d.uid]?.state;
      const secs = connectedAt.current ? (Date.now() - connectedAt.current) / 1000 : 0;
      const status = connectedAt.current || st === "joined" || st === "left" ? "answered" : st === "declined" ? "declined" : "missed";
      logCall(m, d, { status, secs }).catch((e) => console.warn("call log not saved:", e?.code ?? e));
    }
    // Anyone who was rung but never answered or declined: stop their phone ringing and leave them a "Missed call".
    // (Only when the call is really ending: if someone is still on it, the others keep ringing.)
    const stillOn = Object.entries(peersRef.current).some(([u, p]) => m && u !== m.uid && p.state === "joined");
    if (m && idRef.current && !stillOn) membersRef.current.filter((u) => u !== m.uid && !peersRef.current[u]).forEach((u) => pushCall(u, idRef.current, "cancel"));
    dialed.current = null; connectedAt.current = 0; wasLinked.current.clear();
    unsubs.current.forEach((u) => u()); unsubs.current = [];
    clearTimeout(ringT.current); clearTimeout(waitT.current);
    pcs.current.forEach((p) => { try { p.pc.close(); } catch { /* closed */ } if (p.audio) p.audio.srcObject = null; });
    pcs.current.clear();
    local.current?.getTracks().forEach((t) => t.stop()); local.current = null;
    idRef.current = ""; joinedOnce.current = false;
    membersRef.current = []; peersRef.current = {}; namesRef.current = {};
    setCallId(""); setMembers([]); setNames({}); setPeers({}); setLinked({}); setMuted(false); setSecs(0); setAdding(false);
  }, []);
  useEffect(() => closeAll, [closeAll]);

  const dropPeer = (uid: string) => {
    const p = pcs.current.get(uid); if (!p) return;
    try { p.pc.close(); } catch { /* closed */ } if (p.audio) p.audio.srcObject = null;
    pcs.current.delete(uid); setLinked((l) => ({ ...l, [uid]: false }));
  };

  // Leave. If nobody else is on the call any more, end it for everyone (and cancel invites that were never answered).
  const leave = (why = "") => {
    const id = idRef.current, m = meRef.current;
    if (id && m) {
      const othersJoined = Object.entries(peersRef.current).some(([u, p]) => u !== m.uid && p.state === "joined");
      setDoc(doc(db, "calls", id, "peers", m.uid), { state: "left" }).catch(() => { });
      if (!othersJoined) {
        updateDoc(doc(db, "calls", id), { state: "ended" }).catch(() => { });
        membersRef.current.filter((u) => u !== m.uid && !peersRef.current[u]).forEach((u) => deleteDoc(doc(db, "users", u, "callInvites", id)).catch(() => { }));
      }
    }
    if (why) setNote(why);
    closeAll();
  };

  // ---- one peer connection ---------------------------------------------------------------------------------------
  const signal = (to: string, kind: "offer" | "answer" | "candidate", data: any) =>
    addDoc(collection(db, "calls", idRef.current, "signals"), { from: meRef.current!.uid, to, kind, data, at: Date.now() }).catch(() => { });

  const ensure = (uid: string) => {
    let p = pcs.current.get(uid);
    if (p) return p;
    const pc = new (RTC())({ iceServers: iceServers() });
    p = { pc, queue: [] as any[] };
    pcs.current.set(uid, p);
    local.current?.getTracks().forEach((t) => pc.addTrack(t, local.current!));
    pc.ontrack = (e: any) => {
      if (!p!.audio) { p!.audio = new (globalThis as any).Audio(); p!.audio.autoplay = true; }
      p!.audio.srcObject = e.streams[0]; p!.audio.play?.().catch(() => { });
    };
    pc.onicecandidate = (e: any) => { if (e.candidate) signal(uid, "candidate", e.candidate.toJSON()); };
    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === "connected") { wasLinked.current.add(uid); setLinked((l) => ({ ...l, [uid]: true })); }
      if (st === "failed" || st === "disconnected" || st === "closed") setLinked((l) => ({ ...l, [uid]: false }));
      // a weak or switching network (wifi <-> mobile data): try to reconnect instead of dropping the call
      if (st === "failed") restart(uid);
      if (st === "disconnected") setTimeout(() => { if (pcs.current.get(uid)?.pc === pc && pc.connectionState === "disconnected") restart(uid); }, 4000);
    };
    return p;
  };
  const flush = (p: { pc: any; queue: any[] }) => p.queue.splice(0).forEach((c) => p.pc.addIceCandidate(c).catch(() => { }));

  const handleSignal = async (s: any) => {
    const p = ensure(s.from);
    try {
      if (s.kind === "offer") {
        await p.pc.setRemoteDescription(s.data); flush(p);
        const ans = await p.pc.createAnswer(); await p.pc.setLocalDescription(ans);
        signal(s.from, "answer", { type: ans.type, sdp: ans.sdp });
      } else if (s.kind === "answer") {
        await p.pc.setRemoteDescription(s.data); flush(p);
      } else if (p.pc.remoteDescription) p.pc.addIceCandidate(s.data).catch(() => { });
      else p.queue.push(s.data);
    } catch { /* a stale or duplicate message: ignore */ }
  };
  // Only the lower uid of a pair makes offers (so two people never offer at once), so only that side restarts the connection.
  const restart = async (uid: string) => {
    const p = pcs.current.get(uid), m = meRef.current; if (!p || !m || m.uid > uid) return;
    try { const o = await p.pc.createOffer({ iceRestart: true }); await p.pc.setLocalDescription(o); signal(uid, "offer", { type: o.type, sdp: o.sdp }); } catch { /* try again on the next change */ }
  };
  const startOffer = async (uid: string) => {
    const p = ensure(uid);
    try { const o = await p.pc.createOffer({ offerToReceiveAudio: true }); await p.pc.setLocalDescription(o); signal(uid, "offer", { type: o.type, sdp: o.sdp }); } catch { /* retry on next change */ }
  };

  // ---- joining a call (caller and answerers both use this) -------------------------------------------------------
  const watchCall = (id: string) => {
    const m = meRef.current!;
    // the call document: members and names grow when someone is added
    unsubs.current.push(onSnapshot(doc(db, "calls", id), (d) => {
      const c: any = d.data(); if (!c) return;
      membersRef.current = c.members; namesRef.current = c.names ?? {};
      setMembers(c.members); setNames(c.names ?? {});
      if (c.state === "ended" && idRef.current === id) { setNote("The call ended."); closeAll(); }
    }));
    // who is on the call right now. The lower uid of each pair makes the offer, so two people can never offer at once.
    unsubs.current.push(onSnapshot(collection(db, "calls", id, "peers"), (s) => {
      const now: Record<string, Peer> = {};
      s.docs.forEach((d) => { now[d.id] = d.data() as Peer; });
      peersRef.current = now; setPeers(now);
      Object.entries(now).forEach(([u, p]) => {
        if (u === m.uid) return;
        if (p.state === "joined") { joinedOnce.current = true; if (!pcs.current.has(u) && m.uid < u) startOffer(u); }
        else dropPeer(u);
      });
      const others = Object.entries(now).filter(([u, p]) => u !== m.uid && p.state === "joined").length;
      const pending = membersRef.current.filter((u) => u !== m.uid && !now[u]).length;
      if (now[m.uid]?.state === "joined" && membersRef.current.length > 0 && others === 0 && pending === 0) {
        const others = Object.entries(now).filter(([u]) => u !== m.uid);
        const busy = others.some(([, p]) => p.state === "declined" && p.busy), declined = others.some(([, p]) => p.state === "declined");
        leave(busy ? "They're on another call." : declined ? "They declined the call." : "The call ended.");
      }
    }));
    // hand-shake messages for me
    unsubs.current.push(onSnapshot(query(collection(db, "calls", id, "signals"), where("to", "==", m.uid)), (s) => {
      s.docChanges().forEach((ch) => { if (ch.type === "added") handleSignal(ch.doc.data()); });
    }));
    // nobody answers: give up after a while
    waitT.current = setTimeout(() => {
      const anyone = Object.entries(peersRef.current).some(([u, p]) => u !== m.uid && p.state === "joined");
      if (!anyone && idRef.current === id) leave("No answer.");
    }, RING_MS);
  };

  const getMic = async () => {
    local.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      .catch(() => { throw new Error("Allow microphone access to make or take calls."); });
  };
  const invite = async (to: UserHit, id: string, nm: Record<string, string>) => {
    const m = meRef.current!;
    await setDoc(doc(db, "users", to.uid, "callInvites", id), { callId: id, from: m.uid, fromName: m.username, names: nm, at: Date.now() });
    pushCall(to.uid, id, "ring"); // rings their phone/browser even if the app is closed
  };

  const call = async (peer: UserHit) => {
    const m = meRef.current;
    if (!m) return;
    if (idRef.current || incomingRef.current || accepting.current) { setNote(incomingRef.current ? "Answer or decline the incoming call first." : "You're already on a call."); return; }
    setNote("");
    if (!callsSupported()) { setNote("Calls work in the web version of the app for now."); return; }
    // Show the call screen the instant the button is tapped (the id is made here, not by the server), so a slow network or the
    // microphone prompt never leaves the caller looking at nothing. The call document is written right after.
    const ref = doc(collection(db, "calls"));
    const nm = { [m.uid]: m.username, [peer.uid]: peer.username };
    idRef.current = ref.id; setCallId(ref.id); setMembers([m.uid, peer.uid]); setNames(nm); membersRef.current = [m.uid, peer.uid]; namesRef.current = nm;
    try {
      await getMic();
      if (idRef.current !== ref.id) { local.current?.getTracks().forEach((t) => t.stop()); local.current = null; return; } // hung up while the mic prompt was open
      await setDoc(ref, { host: m.uid, members: [m.uid, peer.uid], names: nm, state: "active", createdAt: Date.now() });
      await setDoc(doc(db, "calls", ref.id, "peers", m.uid), { state: "joined" });
      if (idRef.current !== ref.id) { updateDoc(ref, { state: "ended" }).catch(() => { }); return; } // hung up while the call was being set up
      watchCall(ref.id);
      dialed.current = peer;
      await invite(peer, ref.id, nm);
    } catch (e: any) { dialed.current = null; if (idRef.current === ref.id) { setNote(e?.message ?? "Couldn't start the call. You can only call friends."); closeAll(); } }
  };

  const addPerson = async (f: UserHit) => {
    const m = meRef.current; const id = idRef.current;
    if (!m || !id || membersRef.current.includes(f.uid) || membersRef.current.length >= MAX_PEOPLE) return;
    try {
      const nm = { ...namesRef.current, [f.uid]: f.username };
      await updateDoc(doc(db, "calls", id), { members: [...membersRef.current, f.uid], names: nm, state: "active" });
      await invite(f, id, nm);
      setAdding(false);
    } catch (e: any) { setNote(`Couldn't add @${f.username} (${e?.code ?? "error"}). You can only add friends.`); }
  };

  // ---- ringing for me --------------------------------------------------------------------------------------------
  useEffect(() => {
    if (!me) return;
    if (!callsSupported()) { setStatus("This browser can't take calls (needs WebRTC and a secure page)."); return; }
    setStatus("connecting");
    let dead = false, retryT: any, unsub: (() => void) | undefined, fails = 0;
    const gone = new Set<string>(); // invites that were withdrawn while I was still checking them

    const ring = async (ref: any, d: any) => {
      const busyNow = () => !!(incomingRef.current || idRef.current || accepting.current);
      const turnAway = () => {
        // already on another call (or another one is ringing): tell the caller "Busy" instead of leaving them to ring out
        if (incomingRef.current?.callId !== d.callId && idRef.current !== d.callId) {
          setDoc(doc(db, "calls", d.callId, "peers", me.uid), { state: "declined", busy: true }).catch(() => { });
          deleteDoc(ref).catch(() => { });
        }
      };
      if (busyNow()) { turnAway(); return; }
      // Is that call still on? (Checked against the call itself, not the clock: a phone whose clock is a few minutes off used to
      // throw real calls away as "old".) If we can't check, ring anyway unless the invite is very old.
      let live = true;
      try { const c = await getDoc(doc(db, "calls", d.callId)); live = c.exists() && (c.data() as any).state !== "ended"; }
      catch { live = Date.now() - (d.at ?? 0) < 10 * 60000; }
      if (dead || gone.has(ref.id)) return;
      if (!live) { deleteDoc(ref).catch(() => { }); return; }
      if (busyNow()) { turnAway(); return; } // something else started while I was checking
      const inv: Invite = { callId: d.callId, from: d.from, fromName: d.fromName, names: d.names ?? {} };
      // opened from the "Answer" button on the call notification: pick up straight away
      if (autoAnswer.current && (autoAnswer.current === inv.callId || autoAnswer.current === "1")) { autoAnswer.current = ""; accept(inv); return; }
      incomingRef.current = inv; setIncoming(inv);
      clearTimeout(ringT.current);
      ringT.current = setTimeout(() => { if (incomingRef.current?.callId === inv.callId) { incomingRef.current = null; setIncoming(null); deleteDoc(ref).catch(() => { }); } }, RING_MS);
    };

    const listen = () => {
      unsub = onSnapshot(collection(db, "users", me.uid, "callInvites"), (s) => {
        fails = 0; setStatus("on");
        s.docChanges().forEach((ch) => {
          if (ch.type === "removed") {
            gone.add(ch.doc.id);
            if (incomingRef.current?.callId === ch.doc.id) { incomingRef.current = null; setIncoming(null); clearTimeout(ringT.current); }
            return;
          }
          if (ch.type !== "added") return;
          gone.delete(ch.doc.id);
          ring(ch.doc.ref, ch.doc.data());
        });
      }, (e) => {
        // A listener that errors is dead for good, so open a new one (otherwise this person never rings again until they reload)
        setStatus(`off (${e?.code ?? "error"})`);
        if (e?.code === "permission-denied") setNote(`Incoming calls are off (${e?.code}). Publish the latest Firestore rules.`);
        if (!dead) retryT = setTimeout(listen, Math.min(30000, 2000 * 2 ** fails++));
      });
    };
    listen();
    return () => { dead = true; clearTimeout(retryT); unsub?.(); };
  }, [me?.uid]);

  const dismissInvite = (inv: Invite) => {
    clearTimeout(ringT.current); incomingRef.current = null; setIncoming(null);
    if (meRef.current) deleteDoc(doc(db, "users", meRef.current.uid, "callInvites", inv.callId)).catch(() => { });
  };
  const accept = async (given?: Invite) => {
    const inv = given ?? incomingRef.current ?? incoming, m = meRef.current;
    if (!inv || !m || accepting.current || idRef.current) return;
    accepting.current = true;
    try {
      // Ask for the microphone BEFORE hiding the ring screen, so the person is never left with an empty screen while the browser asks.
      await getMic();
      dismissInvite(inv);
      idRef.current = inv.callId; setCallId(inv.callId);
      watchCall(inv.callId);
      await setDoc(doc(db, "calls", inv.callId, "peers", m.uid), { state: "joined" });
    } catch (e: any) {
      dismissInvite(inv);
      setNote(e?.message ?? "Couldn't answer the call.");
      setDoc(doc(db, "calls", inv.callId, "peers", m.uid), { state: "declined" }).catch(() => { });
      closeAll();
    } finally { accepting.current = false; }
  };
  const decline = () => {
    const inv = incoming, m = meRef.current; if (!inv || !m) return;
    setDoc(doc(db, "calls", inv.callId, "peers", m.uid), { state: "declined" }).catch(() => { });
    dismissInvite(inv);
  };
  const toggleMute = () => { const x = !muted; local.current?.getAudioTracks().forEach((t) => (t.enabled = !x)); setMuted(x); };

  // The "Answer" button on the call notification: either it opened the app with ?answer=<callId>, or the app was already open and the service worker told it.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    try {
      const q = new URLSearchParams(window.location.search), a = q.get("answer");
      if (a) { autoAnswer.current = a; q.delete("answer"); const rest = q.toString(); window.history.replaceState(null, "", window.location.pathname + (rest ? `?${rest}` : "") + window.location.hash); setTimeout(() => { autoAnswer.current = ""; }, 20000); }
    } catch { /* ignore */ }
    const sw: any = (navigator as any).serviceWorker; if (!sw) return;
    const h = (e: any) => {
      if (e.data?.type !== "call-answer") return;
      const inv = incomingRef.current;
      if (inv && (!e.data.callId || inv.callId === e.data.callId)) accept(inv);
      else if (!idRef.current) { autoAnswer.current = e.data.callId || "1"; setTimeout(() => { autoAnswer.current = ""; }, 20000); }
    };
    sw.addEventListener("message", h);
    return () => sw.removeEventListener("message", h);
  }, []);

  // hang up if the tab is closed
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const h = () => { if (idRef.current) leave(); else if (incomingRef.current) decline(); };
    window.addEventListener("pagehide", h);
    return () => window.removeEventListener("pagehide", h);
  }, [incoming]);

  // timer starts when the first person is actually connected
  const anyLinked = Object.values(linked).some(Boolean);
  useEffect(() => {
    if (!anyLinked) return; // keep counting from the first connection, so a short reconnect doesn't reset the timer
    if (!connectedAt.current) connectedAt.current = Date.now();
    const t0 = connectedAt.current, t = setInterval(() => setSecs((Date.now() - t0) / 1000), 500);
    return () => clearInterval(t);
  }, [anyLinked]);

  // ringtone + flashing title while it rings
  useEffect(() => {
    if (!incoming || Platform.OS !== "web") return;
    const G: any = globalThis, title = document.title;
    let ctx: any, beep: any, flash: any, n: any;
    try {
      ctx = new (G.AudioContext || G.webkitAudioContext)();
      const play = () => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 480; g.gain.value = 0.15; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.35); };
      ctx.resume?.(); play(); beep = setInterval(play, 1400);
    } catch { /* no audio allowed */ }
    try { navigator.vibrate?.([700, 500, 700, 500, 700, 500, 700, 500, 700]); } catch { /* not on this device */ }
    let on = false; flash = setInterval(() => { on = !on; document.title = on ? `📞 @${incoming.fromName} is calling` : title; }, 800);
    try { if (document.hidden && G.Notification?.permission === "granted") n = new G.Notification(`📞 @${incoming.fromName} is calling you`, { tag: "call", requireInteraction: true }); } catch { /* ignore */ }
    return () => { clearInterval(beep); clearInterval(flash); document.title = title; try { ctx?.close(); n?.close(); navigator.vibrate?.(0); } catch { /* ignore */ } };
  }, [incoming?.callId]);

  // What the caller hears while it rings (like WhatsApp's "ringing" tone), until they answer or it ends.
  const answered = members.some((u) => u !== me?.uid && peers[u]?.state === "joined");
  const ringback = !!callId && !anyLinked && !answered;
  useEffect(() => {
    if (!ringback || Platform.OS !== "web") return;
    const G: any = globalThis; let ctx: any, t: any;
    try {
      ctx = new (G.AudioContext || G.webkitAudioContext)();
      const tone = () => [440, 480].forEach((f) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; g.gain.value = 0.06; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 1.8); });
      ctx.resume?.(); tone(); t = setInterval(tone, 5000);
    } catch { /* no audio allowed */ }
    return () => { clearInterval(t); try { ctx?.close(); } catch { /* ignore */ } };
  }, [ringback]);

  // keep the screen awake during a call (re-asked when the person comes back to the tab, because the browser lets go when it is hidden)
  useEffect(() => {
    if (!callId || Platform.OS !== "web") return;
    const nav: any = navigator; let lock: any, dead = false;
    const get = () => { if (!document.hidden) nav.wakeLock?.request?.("screen").then((l: any) => { if (dead) l.release?.(); else lock = l; }).catch(() => { }); };
    get(); document.addEventListener("visibilitychange", get);
    return () => { dead = true; document.removeEventListener("visibilitychange", get); try { lock?.release?.(); } catch { /* ignore */ } };
  }, [callId]);

  useEffect(() => { if (adding && me) fetchFriends(me.uid).then(setFriends).catch(() => { }); }, [adding]);

  // ---- screens ---------------------------------------------------------------------------------------------------
  const inCall = !!callId;
  const others = members.filter((u) => u !== me?.uid);
  const photos = usePhotos(inCall ? others : incoming ? [incoming.from] : []);
  const friendPhotos = usePhotos(adding ? friends.map((f) => f.uid) : []);
  const label = (u: string) => (linked[u] ? "Connected" : peers[u]?.state === "joined" ? (wasLinked.current.has(u) ? "Reconnecting…" : "Connecting…") : peers[u]?.state === "declined" ? (peers[u]?.busy ? "Busy" : "Declined") : peers[u]?.state === "left" ? "Left" : "Calling…");
  const title = others.length === 1 ? `@${names[others[0]] ?? ""}` : `${others.length + 1} people`;
  const header = !anyLinked ? (others.some((u) => peers[u]?.state === "joined") ? (wasLinked.current.size ? "Reconnecting…" : "Connecting…") : "Calling…") : fmt(secs);
  const round = (bg: string, size = 64) => ({ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center" as const, justifyContent: "center" as const });
  const fullBg = { flex: 1, backgroundColor: "#0b141a", alignItems: "center" as const, paddingTop: 70, paddingBottom: 40, paddingHorizontal: 20 };
  const canAdd = friends.filter((f) => !members.includes(f.uid));

  return (
    <Ctx.Provider value={{ call, busy: inCall || !!incoming, status }}>
      {children}
      <CallOverlay visible={!!note && !inCall && !incoming} passThrough>
        <TouchableOpacity onPress={() => setNote("")} style={{ position: "absolute", top: 50, left: 16, right: 16, backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 12, zIndex: 99, pointerEvents: "auto" }}>
          <Text style={{ color: COLORS.text, textAlign: "center" }}>📞 {note}</Text>
        </TouchableOpacity>
      </CallOverlay>

      {/* incoming */}
      <CallOverlay visible={!!incoming && !inCall} onRequestClose={decline}>
        <View style={[fullBg, { justifyContent: "space-between" }]}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#fff", opacity: 0.7, fontSize: 14, letterSpacing: 0.5 }}>GRATE APEX AUDIO CALL</Text>
            <View style={{ marginTop: 40 }}>{incoming && <Avatar name={incoming.fromName} photo={photos[incoming.from]} size={130} />}</View>
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 22 }}>@{incoming?.fromName}</Text>
            <Text style={{ color: "#fff", opacity: 0.7, marginTop: 6, fontSize: 16 }}>
              {incoming && Object.keys(incoming.names).length > 2 ? `Group call · ${Object.keys(incoming.names).length} people` : "is calling you…"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", maxWidth: 360 }}>
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity onPress={decline} style={round("#ef4444", 72)}><Text style={{ fontSize: 30 }}><Em n="phoneOff" /></Text></TouchableOpacity>
              <Text style={{ color: "#fff", marginTop: 8, opacity: 0.8 }}>Decline</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity onPress={() => accept()} style={round("#22c55e", 72)}><Text style={{ fontSize: 30 }}><Em n="phone" /></Text></TouchableOpacity>
              <Text style={{ color: "#fff", marginTop: 8, opacity: 0.8 }}>Accept</Text>
            </View>
          </View>
        </View>
      </CallOverlay>

      {/* in a call */}
      <CallOverlay visible={inCall} onRequestClose={() => leave()}>
        <View style={fullBg}>
          <Text style={{ color: "#fff", opacity: 0.7, fontSize: 13, letterSpacing: 0.5 }}><Em n="lock" /> GRATE APEX AUDIO CALL</Text>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 8 }}>{title}</Text>
          <Text style={{ color: "#fff", opacity: 0.75, marginTop: 4, fontSize: 16 }}>{header}</Text>

          <ScrollView style={{ flex: 1, width: "100%" }} contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", flexDirection: "row", flexWrap: "wrap", paddingVertical: 20 }}>
            {others.length === 1
              ? (
                <View style={{ alignItems: "center" }}>
                  <Avatar name={names[others[0]] ?? "?"} photo={photos[others[0]]} size={150} />
                  <Text style={{ color: "#fff", opacity: 0.7, marginTop: 14 }}>{label(others[0])}</Text>
                </View>
              )
              : others.map((u) => (
                <View key={u} style={{ alignItems: "center", margin: 12, width: 110 }}>
                  <View style={{ borderWidth: 3, borderColor: linked[u] ? "#22c55e" : "transparent", borderRadius: 60, padding: 2 }}><Avatar name={names[u] ?? "?"} photo={photos[u]} size={84} /></View>
                  <Text style={{ color: "#fff", fontWeight: "700", marginTop: 8 }} numberOfLines={1}>@{names[u]}</Text>
                  <Text style={{ color: "#fff", opacity: 0.6, fontSize: 12 }}>{label(u)}</Text>
                </View>
              ))}
          </ScrollView>

          {adding && (
            <View style={{ width: "100%", maxWidth: 420, maxHeight: 260, backgroundColor: "#1f2c34", borderRadius: 18, padding: 12, marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ color: "#fff", fontWeight: "800", flex: 1 }}>Add to call</Text>
                <TouchableOpacity onPress={() => setAdding(false)}><Text style={{ color: "#fff", opacity: 0.7 }}>Close</Text></TouchableOpacity>
              </View>
              <ScrollView>
                {members.length >= MAX_PEOPLE && <Text style={{ color: "#fff", opacity: 0.7 }}>A call can have up to {MAX_PEOPLE} people.</Text>}
                {members.length < MAX_PEOPLE && canAdd.length === 0 && <Text style={{ color: "#fff", opacity: 0.7 }}>No more friends to add. Friends are people you follow who follow you back.</Text>}
                {members.length < MAX_PEOPLE && canAdd.map((f) => (
                  <TouchableOpacity key={f.uid} onPress={() => addPerson(f)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
                    <Avatar name={f.username} photo={friendPhotos[f.uid]} size={34} /><Text style={{ color: "#fff", flex: 1, marginLeft: 10, fontWeight: "700" }}>@{f.username}</Text>
                    <Text style={{ color: "#22c55e", fontWeight: "800" }}>Add</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ flexDirection: "row", backgroundColor: "#1f2c34", borderRadius: 40, paddingVertical: 14, paddingHorizontal: 18, alignItems: "center" }}>
            <TouchableOpacity onPress={() => setAdding(!adding)} style={{ alignItems: "center", marginHorizontal: 14 }}>
              <View style={round("rgba(255,255,255,0.14)", 56)}><Text style={{ fontSize: 24 }}><Em n="plus" /></Text></View>
              <Text style={{ color: "#fff", opacity: 0.7, fontSize: 11, marginTop: 4 }}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleMute} style={{ alignItems: "center", marginHorizontal: 14 }}>
              <View style={round(muted ? "#fff" : "rgba(255,255,255,0.14)", 56)}><Text style={{ fontSize: 24 }}>{muted ? "🔇" : "🎙️"}</Text></View>
              <Text style={{ color: "#fff", opacity: 0.7, fontSize: 11, marginTop: 4 }}>{muted ? "Unmute" : "Mute"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => leave()} style={{ alignItems: "center", marginHorizontal: 14 }}>
              <View style={round("#ef4444", 56)}><Text style={{ fontSize: 24 }}><Em n="phoneOff" /></Text></View>
              <Text style={{ color: "#fff", opacity: 0.7, fontSize: 11, marginTop: 4 }}>End</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CallOverlay>
    </Ctx.Provider>
  );
}