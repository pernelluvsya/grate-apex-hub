// GRATEAPEX review scheduler — the spaced-repetition algorithm.
//
// Standalone and pure: it takes a memory record and ONE event, and returns
// the updated record. Screens never schedule anything themselves; the
// learning engine (data/learning/memory.ts) replays the learner's history
// through these functions. Because the memory model is always DERIVED
// from history, this algorithm can be improved later and every learner's
// schedule simply recomputes — no data migration, no UI changes.
//
// ── The algorithm (practical, SM-2 inspired) ──────────────────────────
//
// Each concept (and each question) keeps:
//   intervalDays  the current gap between reviews
//   ease          how fast the gap grows (1.3 – 2.8; starts by difficulty)
//   dueAt         when it should next be retrieved
//   reviews       successful spaced reviews since the last lapse
//   lapses        times it was forgotten after being known
//
// 1. First contact (learning a lesson, or a first answer): due in 1 day.
// 2. A CORRECT answer counts as a spaced review only once at least half
//    of the scheduled gap has passed (cramming guard: answering again a
//    minute later does not skip the wait). A counted review grows the gap:
//      1st review → 3 days, then gap × ease
//    Remembering an OVERDUE item stretches the next gap a little (up to
//    ×1.3) — it survived a longer delay. Hard questions answered
//    correctly raise ease slightly. Self-rated "partly" recall grows the
//    gap only half as much.
// 3. A WRONG answer is a lapse (if the concept had been known): the gap
//    resets, ease drops by 0.2, the review ladder restarts, and the
//    concept is due again tomorrow. Repeated failures therefore keep it
//    returning daily and pull its ease down, so it comes back sooner even
//    after it is relearned.
// 4. Apex Challenge misses (10 s per question) are weak evidence of
//    forgetting: they bring the next review forward to ≤ 1 day and nudge
//    ease down, but do not reset the gap. Timeouts are not recorded.
//
// Memory states (shown to learners):
//   new         never practised or taught
//   learning    taught / practised, gap under 3 days
//   struggling  2+ misses in a row, or under 50% of recent answers right
//   remembered  gap of 3–20 days
//   mastered    gap of 21+ days, last answer right, ≥ 80% recent accuracy
//   (due for review is a separate flag: dueAt has passed)
//
// The mastery estimate (0–1) is a transparent blend of recent accuracy
// and how far along the spacing ladder the concept is — an estimate, not
// a measurement. It is labelled "estimate" wherever it is shown.
import type { DifficultyLevel } from '@/data/lesson-types';
import { DAY_MS } from '@/data/learning/time';

export const SCHEDULER = {
  version: 1,
  firstIntervalDays: 1,
  secondIntervalDays: 3,
  maxIntervalDays: 180,
  minEase: 1.3,
  maxEase: 2.8,
  startEase: { introductory: 2.5, intermediate: 2.3, advanced: 2.1 } as Record<DifficultyLevel, number>,
  lapseEasePenalty: 0.2,
  softFailEasePenalty: 0.05,
  correctEaseBonus: { introductory: 0, intermediate: 0.02, advanced: 0.05 } as Record<DifficultyLevel, number>,
  earlyReviewFraction: 0.5,
  overdueBonusCap: 1.3,
  partialGrowth: 0.5,
  recentWindow: 6,
  rememberedDays: 3,
  masteredDays: 21,
  masteredAccuracy: 0.8,
  strugglingFailStreak: 2,
  strugglingAccuracy: 0.5,
} as const;

export type MemoryState = 'new' | 'learning' | 'struggling' | 'remembered' | 'mastered';

export const MEMORY_STATE_ORDER: MemoryState[] = [
  'new',
  'learning',
  'struggling',
  'remembered',
  'mastered',
];

export type RetrievalMode =
  | 'interactive'
  | 'interactive-retry'
  | 'lesson-quiz'
  | 'topic-quiz'
  | 'practice'
  | 'review'
  | 'recall'
  | 'apex'
  | 'mastery-check';

export type RetrievalEvent = {
  at: number;
  correct: boolean;
  mode: RetrievalMode | string;
  difficulty?: DifficultyLevel;
  partial?: boolean; // self-rated "partly" recall
};

export type MemoryRecord = {
  firstSeenAt: number | null;
  learnedAt: number | null; // taught in a completed lesson
  lastReviewedAt: number | null; // last retrieval attempt
  lastResult: 'correct' | 'incorrect' | null;
  attempts: number;
  correct: number;
  incorrect: number;
  reviews: number; // successful spaced reviews since the last lapse
  totalReviews: number; // all counted spaced reviews
  lapses: number;
  successStreak: number;
  failStreak: number;
  ease: number;
  intervalDays: number;
  dueAt: number | null;
  recent: boolean[]; // last results, newest last
};

export function emptyMemory(difficulty: DifficultyLevel = 'introductory'): MemoryRecord {
  return {
    firstSeenAt: null,
    learnedAt: null,
    lastReviewedAt: null,
    lastResult: null,
    attempts: 0,
    correct: 0,
    incorrect: 0,
    reviews: 0,
    totalReviews: 0,
    lapses: 0,
    successStreak: 0,
    failStreak: 0,
    ease: SCHEDULER.startEase[difficulty],
    intervalDays: 0,
    dueAt: null,
    recent: [],
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// The concept was taught in a completed lesson: schedule its first
// reinforcement for tomorrow (unless answers already scheduled it).
export function applyLearned(record: MemoryRecord, at: number): MemoryRecord {
  const next = { ...record, recent: record.recent };
  if (next.firstSeenAt === null) next.firstSeenAt = at;
  if (next.learnedAt === null) next.learnedAt = at;
  if (next.dueAt === null) {
    next.intervalDays = SCHEDULER.firstIntervalDays;
    next.dueAt = at + SCHEDULER.firstIntervalDays * DAY_MS;
  }
  return next;
}

// One retrieval attempt (an answered question or a self-rated recall).
export function applyAnswer(record: MemoryRecord, event: RetrievalEvent): MemoryRecord {
  const next: MemoryRecord = { ...record, recent: [...record.recent, event.correct] };
  if (next.recent.length > SCHEDULER.recentWindow) next.recent.shift();
  if (next.firstSeenAt === null) next.firstSeenAt = event.at;

  const previousReviewAt = record.lastReviewedAt;
  const scheduledGapMs = Math.max(record.intervalDays, SCHEDULER.firstIntervalDays) * DAY_MS;

  next.attempts += 1;
  next.lastReviewedAt = event.at;
  next.lastResult = event.correct ? 'correct' : 'incorrect';

  if (!event.correct) {
    next.incorrect += 1;
    next.failStreak += 1;
    next.successStreak = 0;

    if (event.mode === 'apex') {
      next.ease = clamp(next.ease - SCHEDULER.softFailEasePenalty, SCHEDULER.minEase, SCHEDULER.maxEase);
      const soon = event.at + SCHEDULER.firstIntervalDays * DAY_MS;
      next.dueAt = next.dueAt === null ? soon : Math.min(next.dueAt, soon);
      return next;
    }

    const wasKnown = record.reviews > 0 || record.intervalDays >= SCHEDULER.secondIntervalDays;
    if (wasKnown) next.lapses += 1;
    next.ease = clamp(next.ease - SCHEDULER.lapseEasePenalty, SCHEDULER.minEase, SCHEDULER.maxEase);
    next.reviews = 0;
    next.intervalDays = 0;
    next.dueAt = event.at + SCHEDULER.firstIntervalDays * DAY_MS;
    return next;
  }

  next.correct += 1;
  next.successStreak += 1;
  next.failStreak = 0;

  // First contact: start the ladder.
  if (record.dueAt === null) {
    next.intervalDays = SCHEDULER.firstIntervalDays;
    next.dueAt = event.at + SCHEDULER.firstIntervalDays * DAY_MS;
    return next;
  }

  // Cramming guard: too soon after the last retrieval to count.
  const since = previousReviewAt === null ? Infinity : event.at - previousReviewAt;
  const sinceLearned = record.learnedAt === null ? Infinity : event.at - record.learnedAt;
  const elapsed = Math.min(since, sinceLearned);
  if (elapsed < SCHEDULER.earlyReviewFraction * scheduledGapMs) {
    return next;
  }

  next.reviews += 1;
  next.totalReviews += 1;
  const previousInterval = Math.max(record.intervalDays, SCHEDULER.firstIntervalDays);
  let target =
    next.reviews === 1 ? SCHEDULER.secondIntervalDays : previousInterval * next.ease;
  const overdueFactor = clamp(elapsed / scheduledGapMs, 1, SCHEDULER.overdueBonusCap);
  target *= overdueFactor;
  if (event.partial) {
    target = previousInterval + (target - previousInterval) * SCHEDULER.partialGrowth;
  }
  next.intervalDays = clamp(Math.round(target), SCHEDULER.firstIntervalDays, SCHEDULER.maxIntervalDays);
  const difficulty = event.difficulty ?? 'introductory';
  next.ease = clamp(next.ease + SCHEDULER.correctEaseBonus[difficulty], SCHEDULER.minEase, SCHEDULER.maxEase);
  next.dueAt = event.at + next.intervalDays * DAY_MS;
  return next;
}

export function recentAccuracy(record: MemoryRecord): number | null {
  if (record.recent.length === 0) return null;
  return record.recent.filter(Boolean).length / record.recent.length;
}

export function isDue(record: MemoryRecord, now: number) {
  return record.dueAt !== null && record.dueAt <= now;
}

export function classify(record: MemoryRecord): MemoryState {
  if (record.attempts === 0 && record.learnedAt === null) return 'new';
  const accuracy = recentAccuracy(record);

  if (
    record.failStreak >= SCHEDULER.strugglingFailStreak ||
    (record.recent.length >= 3 && accuracy !== null && accuracy < SCHEDULER.strugglingAccuracy)
  ) {
    return 'struggling';
  }

  if (
    record.intervalDays >= SCHEDULER.masteredDays &&
    record.lastResult === 'correct' &&
    (accuracy ?? 0) >= SCHEDULER.masteredAccuracy
  ) {
    return 'mastered';
  }

  if (record.intervalDays >= SCHEDULER.rememberedDays) return 'remembered';
  return 'learning';
}

// 0–1. A blend of recent accuracy and progress along the spacing ladder,
// reduced while the concept is well overdue. An estimate, not a test.
export function masteryEstimate(record: MemoryRecord, now: number): number {
  if (record.attempts === 0 && record.learnedAt === null) return 0;
  const accuracy = recentAccuracy(record) ?? 0.5;
  const spacing = Math.min(1, record.intervalDays / SCHEDULER.masteredDays);
  let estimate = 0.55 * accuracy + 0.45 * spacing;
  if (record.dueAt !== null && record.dueAt < now) {
    const overdueDays = (now - record.dueAt) / DAY_MS;
    if (overdueDays > Math.max(1, record.intervalDays)) estimate *= 0.85;
  }
  return clamp(estimate, 0, 1);
}

// Higher = review sooner. Used to order Review sessions and Home tasks.
export function reviewPriority(record: MemoryRecord, now: number): number {
  if (record.dueAt === null) return 0;
  const state = classify(record);
  const overdueDays = (now - record.dueAt) / DAY_MS;
  let priority = 0;

  if (overdueDays >= 0) {
    priority += 10 + Math.min(10, (overdueDays / Math.max(1, record.intervalDays)) * 5);
  } else {
    // Approaching its review date: a little priority in the last 3 days.
    priority += Math.max(0, 3 + overdueDays);
  }

  if (state === 'struggling') priority += 8;
  else if (state === 'learning') priority += 4;
  else if (state === 'remembered') priority += 1;

  if (record.lastResult === 'incorrect') priority += 5;
  priority += Math.min(4, record.lapses);
  return priority;
}

// ── Question-level spacing ────────────────────────────────────────────
// Lighter than concepts: a question answered correctly rests for a while
// so quizzes and reviews vary; a question answered wrongly is eligible
// again immediately.
export const QUESTION_REST_DAYS = [2, 7, 21] as const;

export function questionRestUntil(lastSeenAt: number, correctStreak: number) {
  if (correctStreak <= 0) return lastSeenAt;
  const days = QUESTION_REST_DAYS[Math.min(correctStreak, QUESTION_REST_DAYS.length) - 1];
  return lastSeenAt + days * DAY_MS;
}
