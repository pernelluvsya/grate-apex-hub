import { Platform, Vibration } from "react-native";

// Sound (plus a little vibration where the device has it) when an answer is right or wrong.
//
// Sound is made with the browser's Web Audio API, so there are no audio files to load and it works in the PWA on
// Android and iPhone. Vibration is an add-on: Android Chrome only (iPhones don't support it), silently skipped elsewhere.
//
// Call it from a tap handler where you can (browsers only start audio after a tap); after the first tap it keeps working.
// `enabled` is the profile setting (You > Answer feedback).

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx!.state === "suspended") ctx!.resume().catch(() => { });
  return ctx;
}

// One short note with a quick fade in/out (so it never clicks).
function note(c: AudioContext, freq: number, at: number, dur: number, type: OscillatorType, vol: number, endFreq?: number) {
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function sound(kind: "right" | "wrong") {
  const c = audio();
  if (!c) return;
  if (kind === "right") { // bright rising two-note chime
    note(c, 659, 0, 0.14, "sine", 0.22);
    note(c, 988, 0.11, 0.26, "sine", 0.22);
  } else { // low, short, falling buzz
    note(c, 220, 0, 0.3, "sawtooth", 0.12, 110);
  }
}

function vibrate(kind: "right" | "wrong") {
  if (Platform.OS === "web" && !(typeof navigator !== "undefined" && typeof (navigator as any).vibrate === "function")) return;
  try { Vibration.vibrate(kind === "right" ? 30 : ([0, 70, 60, 70] as number[])); } catch { /* never let feedback break an answer */ }
}

export function answerFeedback(kind: "right" | "wrong", enabled = true) {
  if (!enabled) return;
  try { sound(kind); } catch { /* ignore */ }
  vibrate(kind);
}
