import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { AiCard } from "./ai";
import { hash } from "./learning";
import { Term } from "./lessons";

// AI flashcard sets are kept in the student's account (users/{uid}/aiDecks), with a copy on the device
// so they still open if the rules aren't published yet. Every set shows up in every lesson's
// "AI generated" tab, and all of their cards share one spaced-review schedule (progress.terms).
export type Deck = { id: string; lessonId: string; sectionId: string; title: string; lessonTitle: string; course: string; cards: AiCard[]; at: number };

export const deckId = (lessonId: string, sectionId: string) => `${lessonId}__${sectionId}`.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 150);
export const cardId = (lessonId: string, sectionId: string, front: string) => "ai:" + hash(lessonId + sectionId + front); // same ids as before
export const deckTerms = (d: Deck): Term[] => d.cards.map((c) => ({ id: cardId(d.lessonId, d.sectionId, c.f), name: c.f, def: c.b }));

const idxKey = (uid: string) => `aidecks:${uid}`;
const valid = (d: any): d is Deck => d && typeof d.id === "string" && Array.isArray(d.cards) && d.cards.length > 0;

async function localAll(uid: string): Promise<Deck[]> {
  try { const raw = await AsyncStorage.getItem(idxKey(uid)); const a = raw ? JSON.parse(raw) : []; return Array.isArray(a) ? a.filter(valid) : []; } catch { return []; }
}

export async function listDecks(uid: string): Promise<Deck[]> {
  const byId = new Map<string, Deck>();
  (await localAll(uid)).forEach((d) => byId.set(d.id, d));
  try {
    const snap = await getDocs(collection(db, "users", uid, "aiDecks"));
    snap.forEach((s) => { const d = { id: s.id, ...(s.data() as any) }; if (valid(d)) { const o = byId.get(d.id); if (!o || (d.at ?? 0) >= (o.at ?? 0)) byId.set(d.id, d); } });
  } catch { /* offline or rules not published: the device copy is enough */ }
  return [...byId.values()].sort((a, b) => b.at - a.at);
}

export async function saveDeck(uid: string, d: Deck): Promise<void> {
  const all = (await localAll(uid)).filter((x) => x.id !== d.id);
  AsyncStorage.setItem(idxKey(uid), JSON.stringify([d, ...all].slice(0, 200))).catch(() => {});
  const { id, ...rest } = d;
  await setDoc(doc(db, "users", uid, "aiDecks", id), rest).catch(() => {});
}
