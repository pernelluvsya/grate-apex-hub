import { useMemo } from "react";
import { useProgress, streakOf, rankProgress } from "@/progress";
import type { ConceptMemory, HistoryAttempt, MemoryModel } from "@/data/learning/memory-types";

// Home's data comes from the hub's own progress (Firestore progress/{uid}), so the rank card, the
// week calendar and the notifications agree with every other tab. The calendar was written for a
// "concept memory" model; this builds the same shape from the hub's flashcard schedule.
export type HomeLearning = {
  xp: number; streak: number; lastActivityDate: string | null; lessonsDone: number;
  memory: MemoryModel; attempts: HistoryAttempt[]; now: number;
  answersThisWeek: number; reviewsThisWeek: number;
};

const DAY = 86400000;
const startOfDay = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const parseDay = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1).getTime(); };

export function useHomeLearning(): HomeLearning {
  const { progress } = useProgress();
  return useMemo(() => {
    const now = Date.now();
    const concepts = new Map<string, ConceptMemory>();
    for (const [id, c] of Object.entries(progress.terms ?? {})) {
      const dueAt = typeof c.t === "number" && c.s !== 2 ? c.t : parseDay(c.d);
      const ivl = c.i ?? 0;
      const state = c.s === 3 || (c.l ?? 0) >= 3 ? "struggling" : c.s === 1 || !c.s ? "learning" : ivl >= 21 ? "mastered" : "remembered";
      const mastery = Math.max(0.05, Math.min(1, ivl / 30));
      concepts.set(id, {
        key: id, topicId: "", lessonId: id.split(":")[0] ?? "", conceptId: id, name: "Flashcard", state, due: dueAt <= now, mastery,
        priority: (1 - mastery) + (dueAt < startOfDay(now) ? 0.5 : 0), dueAt,
        subtitle: `${state === "struggling" ? "Needs work" : state === "learning" ? "Learning" : state === "mastered" ? "Mastered" : "Remembered"} · ${ivl ? `${ivl}d interval` : "new"}`,
      } as any);
    }
    // Per-day review counts become that many answers (the hub stores counts, not each answer).
    const attempts: HistoryAttempt[] = [];
    for (const [day, n] of Object.entries(progress.termDays ?? {})) {
      const at = parseDay(day) + 12 * 3600000;
      for (let i = 0; i < Math.min(n, 200); i++) attempts.push({ questionId: `${day}-${i}`, lessonId: "", concept: "", correct: true, attemptedAt: at, mode: "review" });
    }
    const weekStart = startOfDay(now) - 6 * DAY;
    let answersThisWeek = 0, reviewsThisWeek = 0;
    for (const [day, n] of Object.entries(progress.days ?? {})) if (parseDay(day) >= weekStart) answersThisWeek += n;
    for (const [day, n] of Object.entries(progress.termDays ?? {})) if (parseDay(day) >= weekStart) reviewsThisWeek += n;
    const days = Object.keys(progress.days ?? {}).filter((d) => progress.days[d] > 0).sort();
    return {
      xp: progress.xp, streak: streakOf(progress.days ?? {}), lastActivityDate: days.length ? days[days.length - 1] : null,
      lessonsDone: Object.values(progress.lessons ?? {}).filter((n) => n > 0).length,
      memory: { concepts, questions: new Map(), computedAt: now } as MemoryModel, attempts, now, answersThisWeek, reviewsThisWeek,
    };
  }, [progress]);
}

export { rankProgress };
