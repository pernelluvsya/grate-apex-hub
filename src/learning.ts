// The learning engine: no AI, just rules. Everything here is plain functions
// so it is easy to test and to change.
import { Course, Q, COURSES } from "./data/catalog";
import PAST_TOPICS from "./data/pastTopics.json";

// ---------- question bank with stable ids ----------
export type BankQ = Q & { id: string; course: string; topic: string; set: string; diff: 1 | 2 | 3; past?: boolean; papers?: string[] };

// A short fingerprint of a question, so we can remember it between sessions.
export function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36);
}

// ---- answering: multiple choice (option index) or type-the-answer (text) ----
export const isTyped = (q: { kind?: string }) => q.kind === "input";

// Accepts a number within the precision the expected answer was given to (e.g. 171.3 accepts 171.25..171.35),
// or an exact match (ranges like 6.775-6.785 must be typed as written, after tidying spaces and dashes).
export function gradeTyped(user: string, correct: string): boolean {
  const norm = (s: string) => String(s).trim().toLowerCase()
    .replace(/[\u2013\u2014]/g, "-").replace(/\s*\bto\b\s*/g, "-").replace(/\s+/g, "").replace(/\u00b1/g, "+-").replace(/%/g, "");
  const u = norm(user), c = norm(correct);
  if (u === "") return false;
  const uBare = u.replace(/^\+/, ""), cBare = c.replace(/^\+/, "");
  const num = /^-?\d+(\.\d+)?$/;
  if (num.test(uBare) && num.test(cBare)) {
    const decimals = (cBare.split(".")[1] || "").length;
    return Math.abs(parseFloat(uBare) - parseFloat(cBare)) <= 0.5 * Math.pow(10, -decimals) + 1e-9;
  }
  return u === c;
}

// Is the given answer right? v is the option index for multiple choice, the typed text for input questions.
export function isRightAnswer(q: { a: number; kind?: string; ans?: string }, v: number | string | null | undefined): boolean {
  if (v === null || v === undefined) return false;
  if (isTyped(q as { kind?: string })) return typeof v === "string" && gradeTyped(v, q.ans ?? "");
  return v === q.a;
}

// Estimated difficulty (1 easy, 2 medium, 3 hard) from how the question is built.
// This is a guess from the wording. Real difficulty (how many students get it
// wrong) can replace it later once enough students have answered.
export function difficultyOf(q: Q): 1 | 2 | 3 {
  let s = 0;
  const text = q.q;
  const avgOpt = q.o.reduce((n, o) => n + o.length, 0) / Math.max(1, q.o.length);
  if (/assertion|reason/i.test(text)) s += 2;
  if (/\bI\.|\bII\.|\bIII\./.test(text) || q.o.some((o) => /\b(I|II|III) and (I|II|III)\b/.test(o))) s += 1;
  if (/\b(EXCEPT|NOT|LEAST|FALSE)\b/.test(text)) s += 1;
  if (text.length > 180) s += 1;
  if (avgOpt > 60) s += 1;
  if (q.o.length === 2) s -= 1; // true/false
  if ((q.e || "").length > 220) s += 1;  // needs a long explanation
  if (text.length > 110) s += 1;
  if (avgOpt > 30) s += 1;
  if (/\d/.test(text) && /calculat|how many|value|ratio/i.test(text)) s += 1;
  return s >= 3 ? 3 : s >= 1 ? 2 : 1;
}

// Sets called "Predicted ..." (e.g. "Predicted Paper 1") count as past questions, and each one is also a paper of its own.
export const isPredictedSet = (name: string) => /^predicted/i.test(name.trim());

const bankCache = new Map<string, BankQ[]>();
export function bankFor(course: Course): BankQ[] {
  const hit = bankCache.get(course.id);
  if (hit) return hit;
  const data = course.load();
  const out: BankQ[] = [];
  const byId = new Map<string, BankQ>(); // the same question can sit in several source sets: keep one copy
  for (const set of data.sets) {
    for (const q of set.questions) {
      const id = hash(course.id + "|" + q.q + "|" + q.o.join("|"));
      const papers = isPredictedSet(set.name) ? Array.from(new Set([...(q.p ?? []), set.name])) : q.p ?? [];
      const past = papers.length > 0;
      const had = byId.get(id);
      if (had) { if (past) { had.past = true; had.papers = Array.from(new Set([...(had.papers ?? []), ...papers])); } continue; }
      const b: BankQ = { ...q, id, course: course.id, topic: q.t || set.name, set: set.name, diff: difficultyOf(q), past, papers };
      byId.set(id, b); out.push(b);
    }
  }
  bankCache.set(course.id, out);
  return out;
}
export function banksFor(courses: Course[]): BankQ[] { return courses.flatMap(bankFor); }
export const courseOf = (id: string) => COURSES.find((c) => c.id === id);

// ---------- dates ----------
const pad = (n: number) => String(n).padStart(2, "0");
export const dayStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayKey = () => dayStr(new Date());
export function addDays(day: string, n: number) { const d = new Date(day + "T00:00:00"); d.setDate(d.getDate() + n); return dayStr(d); }
export function daysBetween(a: string, b: string) { return Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000); }
export const validDay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + "T00:00:00").getTime());

// ---------- spaced repetition (Leitner boxes) ----------
// A wrong answer becomes a "card". It comes back after 2 days; get it right
// and the wait grows: 2, 4, 7, 14, 30 days. Get it wrong and it starts over.
export const INTERVALS = [2, 4, 7, 14, 30];
export type Card = { c: string; b: number; d: string; w: string; n: number; u: number; g?: 1 };

export function dueIds(cards: Record<string, Card>, today: string, course?: string): string[] {
  return Object.entries(cards)
    .filter(([, c]) => !c.g && c.d <= today && (!course || c.c === course))
    .sort((a, b) => a[1].d.localeCompare(b[1].d))
    .map(([id]) => id);
}

export function afterAnswer(card: Card | undefined, course: string, correct: boolean, today: string, now: number): Card | undefined {
  if (!correct) {
    return { c: course, b: 0, d: addDays(today, INTERVALS[0]), w: card?.w ?? today, n: (card?.n ?? 0) + 1, u: now };
  }
  if (!card || card.g || card.d > today) return card; // only a card that is due can move up
  const b = card.b + 1;
  if (b >= INTERVALS.length) return { ...card, b, g: 1, u: now }; // learned!
  return { ...card, b, d: addDays(today, INTERVALS[b]), u: now };
}

// ---------- picking questions for each kind of round ----------
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const ROUND = 25;

export function reviewRound(all: BankQ[], cards: Record<string, Card>, today: string, course?: string): BankQ[] {
  const byId = new Map(all.map((q) => [q.id, q]));
  return dueIds(cards, today, course).map((id) => byId.get(id)).filter(Boolean).slice(0, ROUND) as BankQ[];
}

// Adaptive: mostly questions at the student's current level, preferring ones not seen before.
export function adaptiveRound(bank: BankQ[], level: number, seen: Set<string>): BankQ[] {
  const pick = (pool: BankQ[], n: number) => {
    const fresh = shuffle(pool.filter((q) => !seen.has(q.id)));
    const old = shuffle(pool.filter((q) => seen.has(q.id)));
    return [...fresh, ...old].slice(0, n);
  };
  const at = (d: number) => bank.filter((q) => q.diff === d);
  const main = pick(at(level), Math.round(ROUND * 0.6));
  const near = pick([...at(level - 1), ...at(level + 1)], ROUND - main.length);
  let out = [...main, ...near];
  if (out.length < ROUND) { const have = new Set(out.map((q) => q.id)); out = out.concat(pick(bank.filter((q) => !have.has(q.id)), ROUND - out.length)); }
  return shuffle(out).slice(0, ROUND);
}
export const levelName = (n: number) => (n <= 1 ? "Easy" : n === 2 ? "Medium" : "Hard");

export function testRound(bank: BankQ[], exclude: string[] = [], count = 10): BankQ[] {
  const ex = new Set(exclude);
  const fresh = shuffle(bank.filter((q) => !ex.has(q.id)));
  return (fresh.length >= count ? fresh : shuffle(bank)).slice(0, count);
}

// ---------- weak topics ----------
export type TopicStats = Record<string, Record<string, [number, number]>>; // course -> topic -> [answered, correct]
export type Weak = { course: string; topic: string; answered: number; pct: number };

export function weakTopics(topics: TopicStats, courseIds: string[], minAnswered = 4, below = 75): Weak[] {
  const out: Weak[] = [];
  for (const cid of courseIds) {
    for (const [topic, [a, c]] of Object.entries(topics[cid] || {})) {
      if (a >= minAnswered && (c / a) * 100 < below) out.push({ course: cid, topic, answered: a, pct: Math.round((c / a) * 100) });
    }
  }
  return out.sort((x, y) => x.pct - y.pct || y.answered - x.answered);
}

export function weakRound(all: BankQ[], weak: Weak[], seen: Record<string, string[]>): BankQ[] {
  const keys = new Set(weak.slice(0, 5).map((w) => w.course + "::" + w.topic));
  const pool = all.filter((q) => keys.has(q.course + "::" + q.topic));
  const seenSet = new Set(Object.values(seen).flat());
  const fresh = shuffle(pool.filter((q) => !seenSet.has(q.id)));
  const old = shuffle(pool.filter((q) => seenSet.has(q.id)));
  return [...fresh, ...old].slice(0, ROUND);
}

// ---------- "on this day" ----------
// An old mistake (at least a week ago) to try again, to see how far you've come.
export function onThisDay(cards: Record<string, Card>, all: BankQ[], today: string, seed: string): { q: BankQ; card: Card } | null {
  const byId = new Map(all.map((q) => [q.id, q]));
  const old = Object.entries(cards).filter(([id, c]) => c.w <= addDays(today, -7) && byId.has(id)).sort((a, b) => a[0].localeCompare(b[0]));
  if (!old.length) return null;
  const pick = old[parseInt(hash(seed + today), 36) % old.length]; // same one all day
  return { q: byId.get(pick[0])!, card: pick[1] };
}

// ---------- study plan ----------
export type Plan = { daysLeft: number; total: number; seen: number; unseen: number; newPerDay: number; reviews: number; todayTarget: number; doneToday: number };
export function studyPlan(args: { examDate: string; today: string; totalQuestions: number; seenCount: number; reviewsDue: number; answeredToday: number }): Plan {
  const daysLeft = Math.max(0, daysBetween(args.today, args.examDate));
  const unseen = Math.max(0, args.totalQuestions - args.seenCount);
  const studyDays = Math.max(1, daysLeft - 3); // keep the last 3 days for revision
  const newPerDay = Math.ceil(unseen / studyDays);
  const todayTarget = newPerDay + args.reviewsDue;
  return { daysLeft, total: args.totalQuestions, seen: args.seenCount, unseen, newPerDay, reviews: args.reviewsDue, todayTarget, doneToday: args.answeredToday };
}


// ---------- Practice Center ----------
// Predicted tests: five fixed mock exams per course. The bank is shuffled once with a fixed seed
// and cut into five slices, so Test 3 is the same for everyone and the tests don't overlap.
function seeded(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export const MOCK_COUNT = 5;
export const mockSize = (bank: BankQ[]) => Math.min(70, Math.max(15, Math.floor(bank.length / MOCK_COUNT)));
export function mockExam(bank: BankQ[], n: number, courseId: string): BankQ[] {
  const rnd = seeded(parseInt(hash("mock|" + courseId), 36));
  const a = [...bank].sort((x, y) => (x.id < y.id ? -1 : 1)); // stable order first, so a bank edit doesn't scramble everything
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  const size = mockSize(bank), out: BankQ[] = [];
  for (let k = 0; k < size; k++) out.push(a[(n * size + k) % a.length]);
  return out;
}
export const pastQuestions = (bank: BankQ[]) => bank.filter((q) => q.past);
// The past questions that belong to one lesson: the ones the lesson already lists, plus the ones
// scripts/map_past_questions.py tied to it (so a topic does not leave most past papers out).
export function pastIdsForLesson(bank: BankQ[], courseId: string, lessonId: string, qids: string[] = []): string[] {
  const map = ((PAST_TOPICS as Record<string, Record<string, string>>)[courseId]) ?? {};
  const own = new Set(qids), out: string[] = [];
  for (const q of bank) if (q.past && (own.has(q.id) || map[q.id] === lessonId)) out.push(q.id);
  return out;
}
// The past papers of a course, as the old hub had them (Past Questions 1, 2, 3 ...).
export function pastPapers(bank: BankQ[]): { name: string; qs: BankQ[] }[] {
  const m = new Map<string, BankQ[]>();
  for (const q of bank) for (const n of q.papers ?? []) { if (!m.has(n)) m.set(n, []); m.get(n)!.push(q); }
  return Array.from(m, ([name, qs]) => ({ name, qs })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}
