import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatMsg } from "./ai";

// Saves each lesson's Ask AI chat on the device (per account), so it survives switching tabs,
// closing the lesson and restarting the app. A small in-memory copy keeps open screens in sync.
const PREFIX = "ga:aichat:";
const MAX = 40; // keep the last 40 messages per lesson

const mem = new Map<string, ChatMsg[]>();
const subs = new Map<string, Set<(m: ChatMsg[]) => void>>();
const epochs = new Map<string, number>();

export const chatKey = (uid: string | undefined, lessonId: string) => `${PREFIX}${uid ?? "anon"}:${lessonId}`;
// Goes up every time the chat is cleared, so a reply that was still loading can tell it should be thrown away.
export const epochOf = (k: string) => epochs.get(k) ?? 0;
export const getChat = (k: string) => mem.get(k) ?? [];

const valid = (m: any): m is ChatMsg => !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string";
const tell = (k: string, m: ChatMsg[]) => subs.get(k)?.forEach((f) => f(m));

export async function loadChat(k: string): Promise<ChatMsg[]> {
    if (mem.has(k)) return mem.get(k)!;
    let list: ChatMsg[] = [];
    try { const raw = await AsyncStorage.getItem(k); const v = raw ? JSON.parse(raw) : []; list = Array.isArray(v) ? v.filter(valid) : []; } catch { /* start empty */ }
    if (!mem.has(k)) mem.set(k, list); // don't overwrite something saved while we were loading
    return mem.get(k)!;
}

export function saveChat(k: string, msgs: ChatMsg[]) {
    const m = msgs.slice(-MAX);
    while (m.length && m[0].role !== "user") m.shift(); // a chat always starts with the student's question
    mem.set(k, m); tell(k, m);
    (m.length ? AsyncStorage.setItem(k, JSON.stringify(m)) : AsyncStorage.removeItem(k)).catch(() => { });
}

export function clearChat(k: string) {
    epochs.set(k, epochOf(k) + 1);
    saveChat(k, []);
}

export function subscribeChat(k: string, f: (m: ChatMsg[]) => void) {
    let set = subs.get(k); if (!set) { set = new Set(); subs.set(k, set); }
    set.add(f);
    return () => { set!.delete(f); };
}
// Delete every saved Ask AI chat for this account (used by "Clear my data").
export async function clearAllChats(uid: string) {
    const prefix = `${PREFIX}${uid}:`;
    try { const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(prefix)); await Promise.all(keys.map((k) => AsyncStorage.removeItem(k))); } catch { /* ignore */ }
    [...mem.keys()].filter((k) => k.startsWith(prefix)).forEach(clearChat); // also empties any chat that is open right now
}