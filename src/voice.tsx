import React, { useEffect, useRef, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { useVideoPlayer } from "expo-video";
import { Text } from "./Text";
import { useColors } from "./theme";
import { CLOUDINARY } from "./config";
import { safeUrl, uploadsReady } from "./media";

// Voice messages: record in the browser (MediaRecorder), upload to Cloudinary, play back with a small player.
export type Voice = { url: string; d: number }; // d = length in seconds
export const MAX_VOICE_SECONDS = 120;
export const voiceSupported = () => Platform.OS === "web" && typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof (globalThis as any).MediaRecorder !== "undefined";
// Cloudinary converts on the fly, so every browser gets an mp3 even if the recording was webm.
export const audioSrc = (url: string) => url.replace(/\.[a-z0-9]+$/i, ".mp3");
export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const rec = useRef<any>(null), chunks = useRef<Blob[]>([]), stream = useRef<MediaStream | null>(null), t0 = useRef(0), timer = useRef<any>(null);
  const cleanup = () => { clearInterval(timer.current); stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; setRecording(false); };
  useEffect(() => () => { try { rec.current?.stop(); } catch { /* not recording */ } cleanup(); }, []);

  const start = async () => {
    if (!voiceSupported()) throw new Error("Voice messages work in the web version of the app for now.");
    const s = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => { throw new Error("Allow microphone access to record a voice message."); });
    stream.current = s; chunks.current = [];
    const MR = (globalThis as any).MediaRecorder;
    const type = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => MR.isTypeSupported?.(t));
    const r = new MR(s, type ? { mimeType: type } : undefined);
    r.ondataavailable = (e: any) => { if (e.data?.size) chunks.current.push(e.data); };
    rec.current = r; r.start();
    t0.current = Date.now(); setSecs(0); setRecording(true);
    timer.current = setInterval(() => { const x = (Date.now() - t0.current) / 1000; setSecs(x); if (x >= MAX_VOICE_SECONDS) finishRef.current?.(); }, 250);
  };
  const finishRef = useRef<null | (() => void)>(null);
  // Stops and returns the recording (null if cancelled or too short).
  const stop = (keep: boolean) => new Promise<{ blob: Blob; d: number } | null>((resolve) => {
    const r = rec.current;
    if (!r || r.state === "inactive") { cleanup(); resolve(null); return; }
    const d = (Date.now() - t0.current) / 1000;
    r.onstop = () => { const blob = new Blob(chunks.current, { type: r.mimeType || "audio/webm" }); cleanup(); resolve(keep && d >= 1 ? { blob, d: Math.round(d) } : null); };
    r.stop();
  });
  finishRef.current = () => { stop(false); };
  return { recording, secs, start, send: () => stop(true), cancel: () => stop(false) };
}

// Browsers record in different formats (Chrome: webm, Safari: mp4) and not every browser can play the other's.
// Converting to plain 16 kHz mono WAV makes the message playable everywhere, with no server-side conversion.
async function toWav(blob: Blob): Promise<Blob> {
  const G: any = globalThis;
  const AC = G.AudioContext || G.webkitAudioContext, OAC = G.OfflineAudioContext || G.webkitOfflineAudioContext;
  const buf = await blob.arrayBuffer();
  const ctx = new AC();
  const decoded: AudioBuffer = await new Promise((res, rej) => { const p = ctx.decodeAudioData(buf, res, rej); p?.catch?.(rej); });
  ctx.close?.();
  const rate = 16000, n = Math.max(1, Math.ceil(decoded.duration * rate));
  const off = new OAC(1, n, rate);
  const src = off.createBufferSource(); src.buffer = decoded; src.connect(off.destination); src.start();
  const pcm: Float32Array = (await off.startRendering()).getChannelData(0);
  const v = new DataView(new ArrayBuffer(44 + n * 2));
  const w = (o: number, t: string) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, pcm[i] || 0)) * 0x7fff, true);
  return new Blob([v], { type: "audio/wav" });
}

export async function uploadVoice(blob: Blob, d: number, onProgress?: (p: number) => void): Promise<Voice> {
  if (!uploadsReady()) throw new Error("Uploads aren't set up yet. The app owner needs to add the Cloudinary details (see README).");
  let file = blob, name = blob.type.includes("mp4") ? "voice.m4a" : "voice.webm";
  try { file = await toWav(blob); name = "voice.wav"; } catch (e) { console.warn("voice: wav conversion failed, sending the original", e); }
  if (file.size > 6 * 1024 * 1024) throw new Error("That recording is too big.");
  const form = new FormData();
  form.append("file", file, name);
  form.append("upload_preset", CLOUDINARY.uploadPreset);
  const data: any = await new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/auto/upload`);
    x.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
    x.onload = () => { try { const j = JSON.parse(x.responseText); x.status < 300 ? resolve(j) : reject(new Error(j?.error?.message || "Upload failed.")); } catch { reject(new Error("Upload failed.")); } };
    x.onerror = () => reject(new Error("Couldn't reach the upload server. Check your connection."));
    x.send(form);
  });
  if (!safeUrl(data.secure_url)) throw new Error("Upload failed.");
  return { url: data.secure_url, d };
}
export const cleanVoice = (v?: Voice) => (v && safeUrl(v.url) ? { url: v.url, d: Math.max(1, Math.min(MAX_VOICE_SECONDS, Math.round(v.d))) } : undefined);

// ▶ ───●────  0:12
// Web uses a plain <audio> element (tries the original recording, then Cloudinary's mp3 conversion for browsers that can't play it);
// phones use expo-video.
export function VoiceBubble(p: { v: Voice; mine?: boolean }) {
  return Platform.OS === "web" ? <WebVoice {...p} /> : <NativeVoice {...p} />;
}

function Bubble({ v, mine, playing, pos, err, toggle }: { v: Voice; mine?: boolean; playing: boolean; pos: number; err?: boolean; toggle: () => void }) {
  const COLORS = useColors();
  const fg = mine ? COLORS.onPrimary : COLORS.text;
  const frac = Math.max(0, Math.min(1, v.d ? pos / v.d : 0));
  return (
    <View style={{ flexDirection: "row", alignItems: "center", width: 200, paddingVertical: 2 }}>
      <TouchableOpacity onPress={toggle} accessibilityLabel={playing ? "Pause" : "Play voice message"} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: mine ? "rgba(255,255,255,0.25)" : COLORS.primary, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: COLORS.onPrimary, fontSize: 14 }}>{playing ? "❚❚" : "▶"}</Text>
      </TouchableOpacity>
      <View style={{ flex: 1, marginHorizontal: 10 }}>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: mine ? "rgba(255,255,255,0.3)" : COLORS.border }}>
          <View style={{ width: `${frac * 100}%`, height: 4, borderRadius: 2, backgroundColor: mine ? COLORS.onPrimary : COLORS.accent }} />
        </View>
      </View>
      <Text style={{ color: err ? COLORS.danger : fg, fontSize: 12, opacity: 0.8 }}>{err ? "can't play" : fmt(playing || pos > 0 ? pos : v.d)}</Text>
    </View>
  );
}

function WebVoice({ v, mine }: { v: Voice; mine?: boolean }) {
  const el = useRef<any>(null);
  const tried = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [err, setErr] = useState(false);
  const sources = [v.url, audioSrc(v.url)];
  const make = (n: number) => {
    const a = new (globalThis as any).Audio(sources[n]);
    a.preload = "none";
    a.onplay = () => setPlaying(true);
    a.onpause = () => setPlaying(false);
    a.onended = () => { setPlaying(false); setPos(0); };
    a.ontimeupdate = () => setPos(a.currentTime || 0);
    a.onerror = () => {
      if (tried.current < sources.length - 1) { tried.current += 1; el.current = make(tried.current); el.current.play().catch(() => setErr(true)); }
      else { setErr(true); setPlaying(false); }
    };
    return a;
  };
  useEffect(() => () => { try { el.current?.pause(); } catch { /* gone */ } el.current = null; }, []);
  const toggle = () => {
    setErr(false);
    if (!el.current) el.current = make(tried.current);
    const a = el.current;
    if (!a.paused) { a.pause(); return; }
    if (v.d && pos >= v.d - 0.3) a.currentTime = 0;
    a.play().catch(() => { /* onerror handles fallback; autoplay blocks can't happen on a tap */ });
  };
  return <Bubble v={v} mine={mine} playing={playing} pos={pos} err={err} toggle={toggle} />;
}

function NativeVoice({ v, mine }: { v: Voice; mine?: boolean }) {
  const player = useVideoPlayer(audioSrc(v.url), (p) => { p.loop = false; p.muted = false; });
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  useEffect(() => {
    const a = player.addListener("playingChange", (e: any) => setPlaying(!!(e?.isPlaying ?? player.playing)));
    const b = setInterval(() => { try { setPos(player.currentTime || 0); if (!player.playing) setPlaying(false); } catch { /* released */ } }, 250);
    return () => { a.remove(); clearInterval(b); };
  }, [player]);
  const toggle = () => { if (playing) player.pause(); else { if (v.d && pos >= v.d - 0.3) player.currentTime = 0; player.play(); } };
  return <Bubble v={v} mine={mine} playing={playing} pos={pos} toggle={toggle} />;
}
