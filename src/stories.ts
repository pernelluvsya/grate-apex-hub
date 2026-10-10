import { collection, doc, getDocs, setDoc, addDoc, deleteDoc, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebase";
import { Media, cleanMedia } from "./media";

export const STORY_MS = 24 * 60 * 60 * 1000;
export type Story = { id: string; uid: string; username: string; kind: "media" | "text"; media?: Media; text?: string; bg?: string; createdAt?: any };
export type StoryGroup = { uid: string; username: string; stories: Story[] };
export const STORY_BGS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#059669", "#0f172a"];

const ms = (t: any) => (t?.toMillis ? t.toMillis() : typeof t === "number" ? t : Date.now());
const live = (s: Story) => Date.now() - ms(s.createdAt) < STORY_MS;

export async function addStory(me: { uid: string; username: string }, s: { media?: Media; text?: string; bg?: string }) {
  const data: any = { username: me.username, kind: s.media ? "media" : "text", createdAt: serverTimestamp() };
  if (s.media) { const m = cleanMedia([s.media])[0]; if (!m) throw new Error("Upload failed."); data.media = m; }
  if (s.text?.trim()) data.text = s.text.trim().slice(0, 200);
  if (s.bg) data.bg = s.bg;
  await addDoc(collection(db, "users", me.uid, "stories"), data);
}

// Stories from the people given, newest last inside a person. Expired ones are
// hidden here, and I tidy up my own old ones.
export async function fetchStories(uids: string[], meUid: string): Promise<StoryGroup[]> {
  const per = await Promise.all(uids.slice(0, 40).map(async (uid) => {
    try {
      const snap = await getDocs(query(collection(db, "users", uid, "stories"), orderBy("createdAt", "desc"), limit(15)));
      const all = snap.docs.map((d) => ({ id: d.id, uid, ...(d.data() as any) } as Story));
      if (uid === meUid) all.filter((s) => !live(s)).forEach((s) => deleteDoc(doc(db, "users", uid, "stories", s.id)).catch(() => {}));
      const stories = all.filter(live).sort((a, b) => ms(a.createdAt) - ms(b.createdAt));
      return stories.length ? { uid, username: stories[0].username, stories } : null;
    } catch { return null; }
  }));
  return per.filter(Boolean) as StoryGroup[];
}

export const deleteStory = (uid: string, id: string) => deleteDoc(doc(db, "users", uid, "stories", id));

export async function recordView(owner: string, sid: string, me: { uid: string; username: string }) {
  try { await setDoc(doc(db, "users", owner, "stories", sid, "views", me.uid), { username: me.username, at: serverTimestamp() }); } catch { /* not important */ }
}
export async function fetchViewers(owner: string, sid: string): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, "users", owner, "stories", sid, "views"));
    return snap.docs.map((d) => (d.data() as any).username as string);
  } catch { return []; }
}

// Which stories this device has already watched (drives the ring colour).
const KEY = "ga_seen_stories";
export async function loadSeen(): Promise<Set<string>> {
  try { return new Set(JSON.parse((await AsyncStorage.getItem(KEY)) || "[]")); } catch { return new Set(); }
}
export async function markSeen(id: string) {
  try {
    const cur: string[] = JSON.parse((await AsyncStorage.getItem(KEY)) || "[]");
    if (!cur.includes(id)) await AsyncStorage.setItem(KEY, JSON.stringify([...cur, id].slice(-300)));
  } catch { /* ignore */ }
}
