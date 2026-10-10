// The review calendar — when reinforcement is due, straight from the
// scheduler's due dates (never decorative). Pure.
import type { ConceptMemory, HistoryAttempt, MemoryModel } from '@/data/learning/memory-types';
import { addDays, DAY_MS, endOfDay, shortDayLabel, startOfDay } from '@/data/learning/time';

export type ReviewDay = {
  start: number;
  label: string;
  isToday: boolean;
  count: number;
  concepts: ConceptMemory[];
};

export type ReviewAgenda = {
  overdue: ConceptMemory[]; // due before today
  dueToday: ConceptMemory[]; // due today (including overdue)
  days: ReviewDay[]; // today + the next days
  laterCount: number; // due after the window
  recentlyReviewed: { at: number; correct: number; total: number }[]; // per day, last 7 days
  scheduledTotal: number;
};

export function reviewAgenda(
  memory: MemoryModel,
  attempts: readonly HistoryAttempt[],
  now: number,
  windowDays = 14
): ReviewAgenda {
  const today = startOfDay(now);
  const endToday = endOfDay(now);
  const scheduled = Array.from(memory.concepts.values()).filter((concept) => concept.dueAt !== null);

  const overdue = scheduled.filter((concept) => concept.dueAt! < today).sort((a, b) => b.priority - a.priority);
  const dueToday = scheduled.filter((concept) => concept.dueAt! <= endToday).sort((a, b) => b.priority - a.priority);

  const days: ReviewDay[] = [];
  for (let i = 0; i < windowDays; i++) {
    const start = addDays(today, i);
    const end = i === windowDays - 1 ? start + DAY_MS - 1 : addDays(today, i + 1) - 1;
    const concepts =
      i === 0
        ? dueToday
        : scheduled.filter((concept) => concept.dueAt! >= start && concept.dueAt! <= end);
    days.push({ start, label: shortDayLabel(start), isToday: i === 0, count: concepts.length, concepts });
  }
  const windowEnd = addDays(today, windowDays);
  const laterCount = scheduled.filter((concept) => concept.dueAt! >= windowEnd).length;

  const reviewModes = new Set(['review', 'recall']);
  const recentlyReviewed: ReviewAgenda['recentlyReviewed'] = [];
  for (let i = 6; i >= 0; i--) {
    const start = addDays(today, -i);
    const end = addDays(today, -i + 1);
    const dayAttempts = attempts.filter(
      (attempt) => reviewModes.has(attempt.mode) && attempt.attemptedAt >= start && attempt.attemptedAt < end
    );
    recentlyReviewed.push({
      at: start,
      correct: dayAttempts.filter((attempt) => attempt.correct).length,
      total: dayAttempts.length,
    });
  }

  return { overdue, dueToday, days, laterCount, recentlyReviewed, scheduledTotal: scheduled.length };
}

// Days in the last `days` with at least one review answer.
export function reviewConsistency(attempts: readonly HistoryAttempt[], now: number, days = 14) {
  const today = startOfDay(now);
  let active = 0;
  for (let i = 0; i < days; i++) {
    const start = addDays(today, -i);
    const end = addDays(today, -i + 1);
    if (attempts.some((attempt) => (attempt.mode === 'review' || attempt.mode === 'recall') && attempt.attemptedAt >= start && attempt.attemptedAt < end)) {
      active += 1;
    }
  }
  return { activeDays: active, days };
}

// ── Calendar views (month grid on desktop, day strip on phones) ──────

const REVIEW_MODES = new Set(['review', 'recall']);

export type CalendarDay = {
  start: number; // local midnight
  date: number; // day of the month
  month: number; // 0–11
  inMonth: boolean; // part of the month being shown (month grid only)
  isToday: boolean;
  isPast: boolean;
  due: ConceptMemory[]; // coming due this day (today also carries overdue), weakest first
  overdue: number; // today only: how many of `due` are past their date
  weak: number; // struggling concepts among `due`
  reviewed: { correct: number; total: number }; // review/recall answers given that day
};

function buildDay(
  start: number,
  now: number,
  scheduled: ConceptMemory[],
  attempts: readonly HistoryAttempt[],
  month: number | null
): CalendarDay {
  const today = startOfDay(now);
  const end = addDays(start, 1) - 1;
  const isToday = start === today;
  const isPast = start < today;
  const due = isPast
    ? []
    : scheduled
        .filter((concept) => (isToday ? concept.dueAt! <= end : concept.dueAt! >= start && concept.dueAt! <= end))
        .sort((a, b) => b.priority - a.priority);
  const dayAttempts = start <= now ? attempts.filter((attempt) => REVIEW_MODES.has(attempt.mode) && attempt.attemptedAt >= start && attempt.attemptedAt <= end) : [];
  const date = new Date(start);
  return {
    start,
    date: date.getDate(),
    month: date.getMonth(),
    inMonth: month === null ? true : date.getMonth() === month,
    isToday,
    isPast,
    due,
    overdue: isToday ? due.filter((concept) => concept.dueAt! < today).length : 0,
    weak: due.filter((concept) => concept.state === 'struggling').length,
    reviewed: { correct: dayAttempts.filter((attempt) => attempt.correct).length, total: dayAttempts.length },
  };
}

function scheduledConcepts(memory: MemoryModel) {
  return Array.from(memory.concepts.values()).filter((concept) => concept.dueAt !== null);
}

export type ReviewMonth = {
  year: number;
  month: number; // 0–11
  label: string; // "October 2026"
  weeks: CalendarDay[][]; // 6 rows × 7 days, Monday first
  totals: { dueThisMonth: number; reviewedThisMonth: number; activeDays: number; overdue: number; scheduled: number };
};

// A Monday-first month grid, `offset` months from the current one.
export function reviewMonth(memory: MemoryModel, attempts: readonly HistoryAttempt[], now: number, offset = 0): ReviewMonth {
  const anchor = new Date(now);
  anchor.setDate(1);
  anchor.setHours(0, 0, 0, 0);
  anchor.setMonth(anchor.getMonth() + offset);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const mondayIndex = (anchor.getDay() + 6) % 7; // Mon = 0 … Sun = 6
  const gridStart = addDays(anchor.getTime(), -mondayIndex);
  const scheduled = scheduledConcepts(memory);

  const weeks: CalendarDay[][] = [];
  for (let week = 0; week < 6; week++) {
    const row: CalendarDay[] = [];
    for (let day = 0; day < 7; day++) {
      row.push(buildDay(addDays(gridStart, week * 7 + day), now, scheduled, attempts, month));
    }
    weeks.push(row);
  }

  const inMonth = weeks.flat().filter((day) => day.inMonth);
  const today = startOfDay(now);
  return {
    year,
    month,
    label: anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    weeks,
    totals: {
      dueThisMonth: inMonth.reduce((sum, day) => sum + day.due.length, 0),
      reviewedThisMonth: inMonth.reduce((sum, day) => sum + day.reviewed.total, 0),
      activeDays: inMonth.filter((day) => day.reviewed.total > 0).length,
      overdue: scheduled.filter((concept) => concept.dueAt! < today).length,
      scheduled: scheduled.length,
    },
  };
}

// A run of days for the phone strip: a few days back, then ahead.
export function reviewStrip(memory: MemoryModel, attempts: readonly HistoryAttempt[], now: number, back = 3, ahead = 27): CalendarDay[] {
  const today = startOfDay(now);
  const scheduled = scheduledConcepts(memory);
  const days: CalendarDay[] = [];
  for (let i = -back; i <= ahead; i++) days.push(buildDay(addDays(today, i), now, scheduled, attempts, null));
  return days;
}
