// The learner's memory model — DERIVED, never edited directly.
//
//   history (answered questions + recall ratings + completed lessons)
//     → replayed in time order through data/learning/scheduler.ts
//     → one MemoryRecord per concept and per question
//
// Answering "what does this learner know, what are they forgetting, what
// is due?" is therefore deterministic: the same history always gives the
// same answer, on any device, and changing the scheduler needs no data
// migration. Pure — no React, no storage.
import {
  conceptKeyForItem,
  findLesson,
  getConceptEntry,
  getQuestion,
  isTrackableConcept,
} from '@/data/curriculum';
import type { DifficultyLevel } from '@/data/lesson-types';
import {
  applyAnswer,
  applyLearned,
  classify,
  emptyMemory,
  isDue,
  masteryEstimate,
  type MemoryRecord,
  type MemoryState,
  questionRestUntil,
  reviewPriority,
} from '@/data/learning/scheduler';
import { DAY_MS } from '@/data/learning/time';

export type HistoryAttempt = {
  questionId: string;
  lessonId: string;
  concept: string; // concept NAME (older history has no concept id)
  correct: boolean;
  attemptedAt: number;
  mode: string;
  partial?: boolean;
};

export type LessonCompletion = { lessonId: string; completedAt: number };

// A schedule carried over from the earlier review system (local or the
// Supabase review_schedule table). Used only for concepts that have no
// answer history of their own, so nothing is counted twice.
export type LegacySchedule = {
  lessonId: string;
  concept: string; // name
  stage: number; // 0–4 → 1, 3, 7, 14, 30 days
  dueAt: number;
  misses: number;
  lastReviewedAt: number;
  firstTrackedAt?: number;
};

const LEGACY_INTERVALS = [1, 3, 7, 14, 30];

export type ConceptMemory = MemoryRecord & {
  key: string;
  topicId: string;
  lessonId: string;
  conceptId: string;
  name: string;
  state: MemoryState;
  due: boolean;
  mastery: number; // 0–1 estimate
  priority: number;
};

export type QuestionMemory = {
  questionId: string;
  attempts: number;
  correct: number;
  lastSeenAt: number;
  lastCorrect: boolean;
  correctStreak: number;
  wrongCount: number;
  seenIn: string[]; // modes it has appeared in
  restUntil: number; // answered correctly → rests until then
};

export type MemoryModel = {
  concepts: Map<string, ConceptMemory>;
  questions: Map<string, QuestionMemory>;
  computedAt: number;
};

type Event =
  | { kind: 'answer'; at: number; attempt: HistoryAttempt }
  | { kind: 'learned'; at: number; lessonId: string };

function conceptDifficulty(key: string): DifficultyLevel {
  return getConceptEntry(key)?.concept.difficulty ?? 'introductory';
}

export function buildMemoryModel(input: {
  attempts: readonly HistoryAttempt[];
  completions: readonly LessonCompletion[];
  legacy?: readonly LegacySchedule[];
  now: number;
}): MemoryModel {
  const { now } = input;
  const records = new Map<string, MemoryRecord>();
  const questions = new Map<string, QuestionMemory>();

  const events: Event[] = [
    ...input.attempts.map((attempt): Event => ({ kind: 'answer', at: attempt.attemptedAt, attempt })),
    ...input.completions.map((completion): Event => ({
      kind: 'learned',
      at: completion.completedAt,
      lessonId: completion.lessonId,
    })),
  ].sort((a, b) => a.at - b.at || (a.kind === 'learned' ? -1 : 1));

  const recordFor = (key: string) => {
    let record = records.get(key);
    if (!record) {
      record = emptyMemory(conceptDifficulty(key));
      records.set(key, record);
    }
    return record;
  };

  for (const event of events) {
    if (event.kind === 'learned') {
      const found = findLesson(event.lessonId);
      if (!found) continue;
      for (const concept of found.lesson.concepts) {
        if (!isTrackableConcept(concept)) continue;
        const key = `${found.topic.id}/${concept.id}`;
        records.set(key, applyLearned(recordFor(key), event.at));
      }
      continue;
    }

    const { attempt } = event;
    const key = conceptKeyForItem(attempt.questionId, {
      lessonId: attempt.lessonId,
      concept: attempt.concept,
    });
    const question = getQuestion(attempt.questionId);

    // Question-level memory (also for questions whose concept is gone).
    const previous = questions.get(attempt.questionId);
    const correctStreak = attempt.correct ? (previous?.correctStreak ?? 0) + 1 : 0;
    const seenIn = previous?.seenIn.includes(attempt.mode)
      ? previous.seenIn
      : [...(previous?.seenIn ?? []), attempt.mode];
    questions.set(attempt.questionId, {
      questionId: attempt.questionId,
      attempts: (previous?.attempts ?? 0) + 1,
      correct: (previous?.correct ?? 0) + (attempt.correct ? 1 : 0),
      lastSeenAt: attempt.attemptedAt,
      lastCorrect: attempt.correct,
      correctStreak,
      wrongCount: (previous?.wrongCount ?? 0) + (attempt.correct ? 0 : 1),
      seenIn,
      restUntil: questionRestUntil(attempt.attemptedAt, correctStreak),
    });

    if (!key) continue;
    const entry = getConceptEntry(key);
    if (!entry || !isTrackableConcept(entry.concept)) continue;
    records.set(
      key,
      applyAnswer(recordFor(key), {
        at: attempt.attemptedAt,
        correct: attempt.correct,
        mode: attempt.mode,
        difficulty: question?.difficulty,
        partial: attempt.partial,
      })
    );
  }

  // Carry over earlier schedules for concepts with no history here.
  for (const item of input.legacy ?? []) {
    const key = conceptKeyForItem('', { lessonId: item.lessonId, concept: item.concept });
    if (!key || records.has(key)) continue;
    const entry = getConceptEntry(key);
    if (!entry || !isTrackableConcept(entry.concept)) continue;
    const stage = Math.max(0, Math.min(LEGACY_INTERVALS.length - 1, item.stage));
    const base = emptyMemory(entry.concept.difficulty ?? 'introductory');
    records.set(key, {
      ...base,
      firstSeenAt: item.firstTrackedAt ?? item.lastReviewedAt,
      learnedAt: item.firstTrackedAt ?? item.lastReviewedAt,
      lastReviewedAt: item.lastReviewedAt,
      lastResult: item.misses > 0 && stage === 0 ? 'incorrect' : null,
      attempts: 0,
      lapses: item.misses,
      reviews: stage,
      totalReviews: stage,
      intervalDays: LEGACY_INTERVALS[stage],
      dueAt: item.dueAt,
    });
  }

  const concepts = new Map<string, ConceptMemory>();
  for (const [key, record] of records) {
    const entry = getConceptEntry(key);
    if (!entry) continue;
    concepts.set(key, {
      ...record,
      key,
      topicId: entry.topic.id,
      lessonId: entry.lesson.id,
      conceptId: entry.concept.id,
      name: entry.concept.name,
      state: classify(record),
      due: isDue(record, now),
      mastery: masteryEstimate(record, now),
      priority: reviewPriority(record, now),
    });
  }

  return { concepts, questions, computedAt: now };
}

// ─── Selectors over a model ──────────────────────────────────────────

export type MemoryCounts = Record<MemoryState, number> & { due: number; tracked: number };

export function countStates(list: Iterable<ConceptMemory>): MemoryCounts {
  const counts: MemoryCounts = {
    new: 0,
    learning: 0,
    struggling: 0,
    remembered: 0,
    mastered: 0,
    due: 0,
    tracked: 0,
  };
  for (const concept of list) {
    counts[concept.state] += 1;
    counts.tracked += 1;
    if (concept.due) counts.due += 1;
  }
  return counts;
}

export function dueConcepts(model: MemoryModel): ConceptMemory[] {
  return Array.from(model.concepts.values())
    .filter((concept) => concept.due)
    .sort((a, b) => b.priority - a.priority);
}

export function weakConcepts(model: MemoryModel, limit = 8): ConceptMemory[] {
  return Array.from(model.concepts.values())
    .filter((concept) => concept.state === 'struggling' || concept.lastResult === 'incorrect')
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

export function conceptsForTopic(model: MemoryModel, topicId: string): ConceptMemory[] {
  return Array.from(model.concepts.values()).filter((concept) => concept.topicId === topicId);
}

export function conceptsForLesson(model: MemoryModel, lessonId: string): ConceptMemory[] {
  return Array.from(model.concepts.values()).filter((concept) => concept.lessonId === lessonId);
}

// When was this topic (or lesson) last retrieved/revised?
export function lastRevisedAt(list: Iterable<ConceptMemory>): number | null {
  let latest: number | null = null;
  for (const concept of list) {
    if (concept.lastReviewedAt !== null && (latest === null || concept.lastReviewedAt > latest)) {
      latest = concept.lastReviewedAt;
    }
  }
  return latest;
}

export function averageMastery(list: Iterable<ConceptMemory>, totalConcepts: number): number {
  if (totalConcepts <= 0) return 0;
  let sum = 0;
  for (const concept of list) sum += concept.mastery;
  return Math.max(0, Math.min(1, sum / totalConcepts));
}

export const MEMORY_STATE_LABEL: Record<MemoryState, string> = {
  new: 'New',
  learning: 'Learning',
  struggling: 'Struggling',
  remembered: 'Remembered',
  mastered: 'Mastered',
};

export function masteryLabel(mastery: number) {
  if (mastery >= 0.7) return 'Strong';
  if (mastery >= 0.35) return 'Fair';
  if (mastery > 0) return 'Weak';
  return 'Not started';
}

export function isOverdueBy(concept: ConceptMemory, now: number) {
  return concept.dueAt === null ? 0 : Math.max(0, (now - concept.dueAt) / DAY_MS);
}
