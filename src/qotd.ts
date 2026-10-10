import { doc, getDoc, getDocs, collection, writeBatch, limit, query, increment } from "firebase/firestore";
import { db } from "./firebase";
import { COURSES, accessibleCourses } from "./data/catalog";
import { BankQ, bankFor, hash } from "./learning";

// Question of the Day: everyone in the same class gets the same question each day.
export const QOTD_XP = { right: 20, wrong: 5 };

const FIGURE = /\b(figure|image|diagram|picture|photograph|shown|illustrat|above|below|arrow|labell?ed)\b/i;
export const dayKey = () => new Date().toISOString().slice(0, 10); // UTC = Ghana time

export function todaysQuestion(hall?: string, semester?: number): BankQ | null {
  const courses = accessibleCourses(hall, semester);
  const pool = (courses.length ? courses : COURSES).flatMap(bankFor).filter((q) => !FIGURE.test(q.q) && q.q.length < 400 && q.o.length >= 2);
  if (!pool.length) return null;
  const idx = parseInt(hash(dayKey() + "|" + (hall ?? "") + (semester ?? "")), 36) % pool.length;
  return pool[idx];
}
export const classKey = (hall?: string, semester?: number) => `${dayKey()}_${hall ?? "x"}${semester ?? 0}`;

export type Answer = { ok: boolean; pick: number };
export type Stats = { total: number; correct: number };

export async function myAnswer(uid: string): Promise<Answer | null> {
  const s = await getDoc(doc(db, "users", uid, "qotd", dayKey()));
  return s.exists() ? (s.data() as Answer) : null;
}
export async function todayStats(hall?: string, semester?: number): Promise<Stats | null> {
  const s = await getDoc(doc(db, "qotd", classKey(hall, semester)));
  return s.exists() ? (s.data() as Stats) : null;
}

// Saves my answer and bumps the class tally in one step (the rules make sure it only counts once).
export async function saveAnswer(uid: string, hall: string | undefined, semester: number | undefined, a: Answer) {
  const b = writeBatch(db);
  b.set(doc(db, "users", uid, "qotd", dayKey()), { ok: a.ok, pick: a.pick, at: Date.now() });
  b.set(doc(db, "qotd", classKey(hall, semester)), { total: increment(1), correct: increment(a.ok ? 1 : 0) }, { merge: true });
  await b.commit();
}

// Consecutive days answered, counting back from today (or yesterday if today isn't done yet).
export async function qotdStreak(uid: string): Promise<number> {
  const snap = await getDocs(query(collection(db, "users", uid, "qotd"), limit(400)));
  const days = new Set(snap.docs.map((d) => d.id));
  const d = new Date(); if (!days.has(d.toISOString().slice(0, 10))) d.setUTCDate(d.getUTCDate() - 1);
  let n = 0;
  while (days.has(d.toISOString().slice(0, 10))) { n++; d.setUTCDate(d.getUTCDate() - 1); }
  return n;
}
