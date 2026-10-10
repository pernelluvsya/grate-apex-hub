// Flashcard scheduling, modelled on Anki's classic (v2, SM-2 based) scheduler. Plain functions, no UI.
//
//   New card     -> learning steps (1 min, 10 min) -> graduates to review with a 1 day interval
//   Review card  -> Again / Hard / Good / Easy change the interval and the card's "ease"
//   Lapse (Again on a review card) -> relearning step (10 min), ease drops, interval resets
//
// A card remembers: its state, interval in days, ease (2500 = 250%), lapses, and when it is due.
import { addDays, dayStr, daysBetween, shuffle } from "./learning";

export type Rating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy
export const RATING_NAMES: Record<Rating, string> = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" };

// b = answers in a row that were not "Again", d = day it is due, u = last changed (used to merge devices).
// s = 1 learning, 2 review, 3 relearning (missing = an older card, see norm()).
// i = interval in days, e = ease x1000, l = lapses, st = step number, t = exact due time (learning only), f = day first seen.
export type TermCard = { b: number; d: string; u: number; s?: 1 | 2 | 3; i?: number; e?: number; l?: number; st?: number; t?: number; f?: string };

// ---- Anki's default settings (change them here) ----
export const LEARN_STEPS = [1, 10];   // minutes
export const RELEARN_STEPS = [10];    // minutes, after forgetting a review card
export const GRAD_IVL = 1;            // days, after the last learning step with "Good"
export const EASY_IVL = 4;            // days, when a new card is answered "Easy"
export const START_EASE = 2500;
export const MIN_EASE = 1300;
export const HARD_MULT = 1.2;
export const EASY_BONUS = 1.3;
export const MAX_IVL = 36500;
export const LEECH = 8;               // lapses before a card is flagged as a leech
export const NEW_PER_DAY = 20;
export const REVIEWS_PER_DAY = 200;

// The old fixed schedule (1, 3, 7, 14, 30 days). Cards saved under it are carried over, see norm().
export const LEGACY_INTERVALS = [1, 3, 7, 14, 30];

// Bring an older saved card into the new shape.
export function norm(c?: TermCard): TermCard | undefined {
  if (!c) return undefined;
  if (c.s) return c;
  const i = c.b > 0 ? LEGACY_INTERVALS[Math.min(c.b - 1, LEGACY_INTERVALS.length - 1)] : 1;
  return { ...c, s: 2, i, e: START_EASE, l: 0 };
}

// The card after one answer. Never leaves a field undefined (Firestore rejects that).
export function schedule(card: TermCard | undefined, rating: Rating, now: number = Date.now()): TermCard {
  const today = dayStr(new Date(now));
  const c = norm(card);
  const b = rating === 1 ? 0 : (c?.b ?? 0) + 1;
  const f = c?.f ?? today;
  const e0 = c?.e ?? START_EASE, l0 = c?.l ?? 0;

  const wait = (s: 1 | 3, st: number, mins: number, i: number, e: number, l: number): TermCard => {
    const t = now + Math.round(mins * 60000);
    return { b, u: now, s, st, t, d: dayStr(new Date(t)), i, e, l, f };
  };
  const review = (days: number, e: number, l: number): TermCard => {
    const i = Math.min(MAX_IVL, Math.max(1, Math.round(days)));
    return { b, u: now, s: 2, i, e, l, d: addDays(today, i), f };
  };

  // New or learning
  if (!c || c.s === 1) {
    const st = c?.st ?? 0, steps = LEARN_STEPS;
    if (rating === 1) return wait(1, 0, steps[0], 0, e0, l0);
    if (rating === 2) {
      const mins = st === 0 ? (steps.length > 1 ? (steps[0] + steps[1]) / 2 : Math.min(steps[0] * 1.5, 1440)) : steps[Math.min(st, steps.length - 1)];
      return wait(1, st, mins, 0, e0, l0);
    }
    if (rating === 3) return st + 1 < steps.length ? wait(1, st + 1, steps[st + 1], 0, e0, l0) : review(GRAD_IVL, e0, l0);
    return review(EASY_IVL, e0, l0);
  }

  // Relearning (forgotten, working back to review)
  if (c.s === 3) {
    const st = c.st ?? 0, steps = RELEARN_STEPS, i = c.i ?? 1;
    if (rating === 1) return wait(3, 0, steps[0], i, e0, l0);
    if (rating === 2) return wait(3, st, steps[Math.min(st, steps.length - 1)], i, e0, l0);
    if (rating === 3) return st + 1 < steps.length ? wait(3, st + 1, steps[st + 1], i, e0, l0) : review(i, e0, l0);
    return review(i + 1, e0, l0);
  }

  // Review
  const i = c.i ?? 1;
  const late = Math.max(0, daysBetween(c.d, today)); // days overdue: a card you remembered after a long wait earns more
  const hard = Math.max(i * HARD_MULT, i + 1);
  const good = Math.max((i + late / 2) * (e0 / 1000), hard + 1);
  const easy = Math.max((i + late) * (e0 / 1000) * EASY_BONUS, good + 1);
  if (rating === 1) return wait(3, 0, RELEARN_STEPS[0], 1, Math.max(MIN_EASE, e0 - 200), l0 + 1);
  if (rating === 2) return review(hard, Math.max(MIN_EASE, e0 - 150), l0);
  if (rating === 3) return review(good, e0, l0);
  return review(easy, e0 + 150, l0);
}

// "10m", "1d", "1.3mo": what the button will do.
export function previewLabel(card: TermCard | undefined, rating: Rating, now: number = Date.now()): string {
  const n = schedule(card, rating, now);
  if (n.s !== 2) { const m = Math.max(1, Math.round(((n.t ?? now) - now) / 60000)); return m < 60 ? `${m}m` : `${Math.round(m / 60)}h`; }
  const d = n.i ?? 1;
  if (d < 30) return `${d}d`;
  if (d < 365) return `${Math.round((d / 30) * 10) / 10}mo`;
  return `${Math.round((d / 365) * 10) / 10}y`;
}

export const isLeech = (c?: TermCard) => (c?.l ?? 0) >= LEECH;

// ---- what to study today ----
export const newToday = (cards: Record<string, TermCard>, today: string) => Object.values(cards).filter((c) => c.f === today).length;

export function queueCounts(terms: { id: string }[], cards: Record<string, TermCard>, now: number = Date.now()) {
  const today = dayStr(new Date(now));
  let learn = 0, review = 0, unseen = 0;
  for (const t of terms) {
    const c = norm(cards[t.id]);
    if (!c) { unseen++; continue; }
    if (c.d <= today) { if (c.s === 2) review++; else learn++; }
  }
  const newN = Math.min(unseen, Math.max(0, NEW_PER_DAY - newToday(cards, today)));
  review = Math.min(review, REVIEWS_PER_DAY);
  return { learn, review, newN, unseen, limited: unseen > newN, total: learn + review + newN };
}

// Learning cards first, then reviews, then new cards (Anki's default order).
export function buildQueue<T extends { id: string }>(terms: T[], cards: Record<string, TermCard>, now: number = Date.now()): T[] {
  const today = dayStr(new Date(now));
  const learn: { t: T; at: number }[] = [], review: T[] = [], fresh: T[] = [];
  for (const t of terms) {
    const c = norm(cards[t.id]);
    if (!c) { fresh.push(t); continue; }
    if (c.d > today) continue;
    if (c.s === 2) review.push(t); else learn.push({ t, at: c.t ?? 0 });
  }
  const left = Math.max(0, NEW_PER_DAY - newToday(cards, today));
  return [
    ...learn.sort((a, b) => a.at - b.at).map((x) => x.t),
    ...shuffle(review).slice(0, REVIEWS_PER_DAY),
    ...fresh.slice(0, left),
  ];
}
