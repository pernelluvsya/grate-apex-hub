import { useSyncExternalStore } from 'react';

import {
  type AttemptMode,
  createLearningRecordId,
  getAuthenticatedLearningUserId,
  loadCloudQuestionAttempts,
  readLearningCache,
  saveCloudQuestionAttempts,
  subscribeToLearningAuthChanges,
  type CloudQuestionAttempt,
  writeLearningCache,
} from '@/data/learning-sync';

// Every answered question and self-rated recall, oldest first (last 5000
// kept). This log is the learner's canonical retrieval history: the
// memory model (data/learning/memory.ts) replays it to derive what is
// known, weak or due — so nothing else stores per-answer state.

export type QuestionAttempt = {
  id?: string;
  questionId: string; // question id, or recall prompt id for mode 'recall'
  topicId: string;
  lessonId: string;
  concept: string; // concept name (kept for older records and the cloud)
  conceptId?: string;
  correct: boolean;
  partial?: boolean; // self-rated "partly" recall
  attemptedAt: number;
  mode: AttemptMode;
  sessionId?: string; // quiz / review / lesson session it belonged to
};

const STORAGE_KEY = 'grateapex_question_history';
const LIMIT = 5000;
const EMPTY: QuestionAttempt[] = [];
let attempts: QuestionAttempt[] = [];
let loadPromise: Promise<void> | null = null;
let loaded = false;
const listeners = new Set<() => void>();

const MODES: AttemptMode[] = [
  'interactive',
  'interactive-retry',
  'lesson-quiz',
  'topic-quiz',
  'practice',
  'review',
  'recall',
  'apex',
  'mastery-check',
];

function notify() {
  listeners.forEach((listener) => listener());
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function isAttempt(item: unknown): item is QuestionAttempt {
  if (!item || typeof item !== 'object') return false;
  const value = item as Record<string, unknown>;
  return (
    typeof value.questionId === 'string' &&
    typeof value.lessonId === 'string' &&
    typeof value.concept === 'string' &&
    typeof value.correct === 'boolean' &&
    typeof value.attemptedAt === 'number'
  );
}

async function loadHistory() {
  try {
    const requestedUserId = await getAuthenticatedLearningUserId();
    const saved = await readLearningCache(STORAGE_KEY);
    if ((await getAuthenticatedLearningUserId()) !== requestedUserId) return;
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        attempts = parsed.filter(isAttempt).map((item) => ({
          ...item,
          mode: MODES.includes(item.mode) ? item.mode : 'practice',
          id: isUuid(item.id) ? item.id : createLearningRecordId(),
        }));
        loaded = true;
        notify();
        await saveLocalHistory();
      }
    }
  } catch (error) {
    console.log('Could not load question history:', error);
  }
  loaded = true;
  notify();

  await hydrateQuestionHistory();
}

async function saveLocalHistory() {
  try {
    await writeLearningCache(STORAGE_KEY, JSON.stringify(attempts));
  } catch (error) {
    console.log('Could not save question history:', error);
  }
}

function toCloudAttempt(attempt: QuestionAttempt): CloudQuestionAttempt {
  return {
    id: attempt.id ?? createLearningRecordId(),
    questionId: attempt.questionId,
    topicId: attempt.topicId,
    lessonId: attempt.lessonId,
    concept: attempt.concept,
    correct: attempt.correct,
    attemptedAt: attempt.attemptedAt,
    mode: attempt.mode,
  };
}

async function hydrateQuestionHistory() {
  const requestedUserId = await getAuthenticatedLearningUserId();
  if (!requestedUserId) return;
  const remote = await loadCloudQuestionAttempts();
  if ((await getAuthenticatedLearningUserId()) !== requestedUserId) return;
  if (remote.length === 0 && attempts.length === 0) return;

  // Local records win: they keep the precise mode / partial flag, which
  // an older cloud schema may have stored in a legacy form.
  const combined = new Map<string, QuestionAttempt>();
  remote.forEach((attempt) => combined.set(attempt.id, attempt));
  attempts.forEach((attempt) => {
    if (attempt.id) combined.set(attempt.id, attempt);
  });
  const localIds = new Set(attempts.map((attempt) => attempt.id));
  attempts = Array.from(combined.values())
    .sort((a, b) => a.attemptedAt - b.attemptedAt)
    .slice(-LIMIT);
  notify();
  await saveLocalHistory();
  // Upload only what the cloud did not have.
  const remoteIds = new Set(remote.map((attempt) => attempt.id));
  await saveCloudQuestionAttempts(
    attempts.filter((attempt) => attempt.id && localIds.has(attempt.id) && !remoteIds.has(attempt.id)).map(toCloudAttempt)
  );
}

export function ensureQuestionHistoryLoaded() {
  if (!loadPromise) loadPromise = loadHistory();
  return loadPromise;
}

/** Retry merging and uploading locally saved answers after reconnecting. */
export async function syncQuestionHistory() {
  await ensureQuestionHistoryLoaded();
  await hydrateQuestionHistory();
}

export function isQuestionHistoryLoaded() {
  return loaded;
}

export function getQuestionHistory() {
  return attempts;
}

export async function resetQuestionHistory() {
  await ensureQuestionHistoryLoaded();
  attempts = [];
  loaded = true;
  notify();
  await saveLocalHistory();
}

export function useQuestionHistory() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      void ensureQuestionHistoryLoaded();
      return () => listeners.delete(listener);
    },
    () => attempts,
    () => EMPTY
  );
}

export async function recordQuestionAttempts(records: QuestionAttempt[]) {
  if (records.length === 0) return;
  await ensureQuestionHistoryLoaded();
  const savedRecords = records.map((record) => ({
    ...record,
    id: isUuid(record.id) ? record.id : createLearningRecordId(),
  }));
  attempts = [...attempts, ...savedRecords].slice(-LIMIT);
  notify();
  await saveLocalHistory();
  void saveCloudQuestionAttempts(savedRecords.map(toCloudAttempt));
}

export type QuestionStats = {
  attempts: number;
  correct: number;
  lastSeenAt: number;
  lastCorrect: boolean;
  inQuiz: boolean; // has appeared in a Lesson Quiz (not just the lesson)
};

// Per-question summary. A question missing from the map is unseen.
export function summarizeQuestionHistory(history: QuestionAttempt[]) {
  const stats = new Map<string, QuestionStats>();
  for (const attempt of history) {
    const current = stats.get(attempt.questionId);
    stats.set(attempt.questionId, {
      attempts: (current?.attempts ?? 0) + 1,
      correct: (current?.correct ?? 0) + (attempt.correct ? 1 : 0),
      lastSeenAt: Math.max(current?.lastSeenAt ?? 0, attempt.attemptedAt),
      lastCorrect: attempt.correct,
      inQuiz: (current?.inQuiz ?? false) || attempt.mode === 'lesson-quiz',
    });
  }
  return stats;
}

let activeLearningUserId: string | null | undefined;
subscribeToLearningAuthChanges((userId) => {
  if (activeLearningUserId === userId) return;
  activeLearningUserId = userId;
  attempts = [];
  loaded = false;
  loadPromise = null;
  notify();
  if (userId) void ensureQuestionHistoryLoaded();
});
