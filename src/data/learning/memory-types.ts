// The shapes the Home calendar and notifications read. Kept apart from the scheduler so Home
// needs none of the old lesson data.
export type MemoryState = "new" | "learning" | "struggling" | "remembered" | "mastered";
export type ConceptMemory = {
  key: string; topicId: string; lessonId: string; conceptId: string; name: string;
  state: MemoryState; due: boolean; mastery: number; priority: number; dueAt: number | null;
  subtitle?: string;
};
export type HistoryAttempt = { questionId: string; lessonId: string; concept: string; correct: boolean; attemptedAt: number; mode: string; partial?: boolean };
export type MemoryModel = { concepts: Map<string, ConceptMemory>; questions: Map<string, unknown>; computedAt: number };
export type MemoryCounts = Record<MemoryState, number> & { due: number };
export const MEMORY_STATE_LABEL: Record<MemoryState, string> = {
  new: "New", learning: "Learning", struggling: "Struggling", remembered: "Remembered", mastered: "Mastered",
};
