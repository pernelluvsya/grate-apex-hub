import { useSyncExternalStore } from 'react';

import type { Answer } from '@/data/questions';
import {
  type CloudQuizAttempt,
  type CloudQuizKind,
  createLearningRecordId,
  getAuthenticatedLearningUserId,
  loadCloudQuizAttempts,
  readLearningCache,
  saveCloudQuizAttempt,
  subscribeToLearningAuthChanges,
  writeLearningCache,
} from '@/data/learning-sync';

// One saved record per finished quiz / review / Apex run, so learners can
// revisit results (missed questions, explanations, XP) after leaving the
// Results screen, and so the engine knows quiz performance per lesson.

export type AttemptKind = 'lesson' | 'topic' | 'practice' | 'review' | 'apex' | 'mastery-check';

export type CustomQuizSettings = {
  lessonIds: string[];
  size: number;
  feedback: 'instant' | 'submit';
  secondsPerQuestion?: number;
};

export type QuizAttempt = {
  id: string;
  kind: AttemptKind;
  attemptType: CloudQuizKind; // legacy field for the cloud table
  lessonId: string; // '' when the attempt is not for one lesson
  topicId: string; // '' when not topic-scoped
  courseId: string; // topic id for older lesson attempts (legacy) or course id
  score: number;
  total: number;
  answered: number;
  percentage: number;
  timeSeconds: number;
  wrongConcepts: string[];
  wrongQuestionIds: string[];
  questionIds: string[];
  answers?: Record<string, Answer>; // local only — shown on Results
  feedbackMode?: 'instant' | 'submit' | 'timed';
  customQuiz?: CustomQuizSettings; // local-only settings used to retake a custom quiz
  practice: boolean; // true for "Practice Wrong Answers" runs
  xp?: { net: number; lines: { label: string; amount: number }[] };
  completedAt: number;
};

const STORAGE_KEY = 'grateapex_quiz_history';
const MAX_ATTEMPTS = 200;
const EMPTY: QuizAttempt[] = [];

let attempts: QuizAttempt[] = [];
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function kindFromLegacy(item: Partial<QuizAttempt> & { attemptType?: string }): AttemptKind {
  if (item.kind) return item.kind;
  if (item.attemptType === 'apex_challenge') return 'apex';
  if (item.attemptType === 'review') return 'review';
  if (item.attemptType === 'topic') return 'topic';
  if (item.practice) return 'practice';
  return 'lesson';
}

function attemptTypeFor(kind: AttemptKind): CloudQuizKind {
  switch (kind) {
    case 'apex':
      return 'apex_challenge';
    case 'topic':
      return 'topic';
    case 'review':
      return 'review';
    case 'practice':
      return 'practice';
    default:
      return 'lesson';
  }
}

function normalize(item: Record<string, unknown>): QuizAttempt | null {
  if (typeof item.percentage !== 'number' || typeof item.completedAt !== 'number') return null;
  const partial = item as Partial<QuizAttempt> & { attemptType?: string };
  const kind = kindFromLegacy(partial);
  const customQuiz = normalizeCustomQuiz(partial.customQuiz);
  return {
    id: isUuid(partial.id) ? partial.id : createLearningRecordId(),
    kind,
    attemptType: attemptTypeFor(kind),
    lessonId: typeof partial.lessonId === 'string' ? partial.lessonId : '',
    topicId: typeof partial.topicId === 'string' ? partial.topicId : '',
    courseId: typeof partial.courseId === 'string' ? partial.courseId : '',
    score: Number(partial.score) || 0,
    total: Number(partial.total) || 0,
    answered: typeof partial.answered === 'number' ? partial.answered : Number(partial.total) || 0,
    percentage: partial.percentage ?? 0,
    timeSeconds: Number(partial.timeSeconds) || 0,
    wrongConcepts: Array.isArray(partial.wrongConcepts) ? partial.wrongConcepts : [],
    wrongQuestionIds: Array.isArray(partial.wrongQuestionIds) ? partial.wrongQuestionIds : [],
    questionIds: Array.isArray(partial.questionIds) ? partial.questionIds : [],
    answers: partial.answers && typeof partial.answers === 'object' ? partial.answers : undefined,
    feedbackMode: partial.feedbackMode,
    customQuiz,
    practice: Boolean(partial.practice),
    xp: partial.xp,
    completedAt: partial.completedAt ?? Date.now(),
  };
}

function normalizeCustomQuiz(value: unknown): CustomQuizSettings | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const settings = value as Partial<CustomQuizSettings>;
  const lessonIds = Array.isArray(settings.lessonIds) ? settings.lessonIds.filter((id): id is string => typeof id === 'string') : [];
  if (!lessonIds.length || !Number.isInteger(settings.size) || !settings.size || settings.size < 1 || settings.size > 50) return undefined;
  if (settings.feedback !== 'instant' && settings.feedback !== 'submit') return undefined;
  const secondsPerQuestion = settings.secondsPerQuestion;
  return {
    lessonIds,
    size: settings.size,
    feedback: settings.feedback,
    secondsPerQuestion:
      Number.isInteger(secondsPerQuestion) && secondsPerQuestion && secondsPerQuestion >= 5 && secondsPerQuestion <= 120
        ? secondsPerQuestion
        : undefined,
  };
}

async function loadHistory() {
  try {
    const requestedUserId = await getAuthenticatedLearningUserId();
    const saved = await readLearningCache(STORAGE_KEY);
    if ((await getAuthenticatedLearningUserId()) !== requestedUserId) return;
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        attempts = parsed
          .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
          .map(normalize)
          .filter((item): item is QuizAttempt => item !== null);
        notify();
        await saveLocalHistory();
      }
    }
  } catch (error) {
    console.log('Could not load quiz history:', error);
  }

  // Start cloud hydration after local loading so a network problem never
  // prevents the quiz/history screens from using their local data.
  await hydrateQuizHistory();
}

async function saveLocalHistory() {
  try {
    await writeLearningCache(STORAGE_KEY, JSON.stringify(attempts));
  } catch (error) {
    console.log('Could not save quiz history:', error);
  }
}

function toCloudAttempt(attempt: QuizAttempt): CloudQuizAttempt {
  return {
    id: attempt.id,
    attemptType: attempt.attemptType,
    courseId: attempt.courseId || attempt.topicId || null,
    lessonId: attempt.lessonId || null,
    score: attempt.score,
    total: attempt.total,
    percentage: attempt.percentage,
    timeSeconds: attempt.timeSeconds,
    wrongConcepts: attempt.wrongConcepts,
    wrongQuestionIds: attempt.wrongQuestionIds,
    practice: attempt.practice,
    completedAt: attempt.completedAt,
  };
}

async function hydrateQuizHistory() {
  const requestedUserId = await getAuthenticatedLearningUserId();
  if (!requestedUserId) return;
  const remote = await loadCloudQuizAttempts();
  if ((await getAuthenticatedLearningUserId()) !== requestedUserId) return;
  if (remote.length === 0 && attempts.length === 0) return;

  const combined = new Map<string, QuizAttempt>();
  remote.forEach((attempt) => {
    const normalized = normalize({
      ...attempt,
      lessonId: attempt.lessonId ?? '',
      courseId: attempt.courseId ?? '',
      kind: kindFromLegacy({ attemptType: attempt.attemptType, practice: attempt.practice }),
    });
    if (normalized) combined.set(attempt.id, normalized);
  });
  // Local records win: they carry answers, questions and XP lines.
  attempts.forEach((attempt) => combined.set(attempt.id, attempt));
  const remoteIds = new Set(remote.map((attempt) => attempt.id));
  attempts = Array.from(combined.values())
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, MAX_ATTEMPTS);
  notify();
  await saveLocalHistory();

  for (const attempt of attempts) {
    if (!remoteIds.has(attempt.id)) await saveCloudQuizAttempt(toCloudAttempt(attempt));
  }
}

function ensureLoaded() {
  if (!loadPromise) loadPromise = loadHistory();
  return loadPromise;
}

export function ensureQuizHistoryLoaded() {
  return ensureLoaded();
}

/** Retry merging and uploading locally saved quiz results after reconnecting. */
export async function syncQuizHistory() {
  await ensureLoaded();
  await hydrateQuizHistory();
}

export function getQuizHistory() {
  return attempts;
}

export async function resetQuizHistory() {
  await ensureQuizHistoryLoaded();
  attempts = [];
  notify();
  await saveLocalHistory();
}

// Newest attempt first.
export function useQuizHistory() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      void ensureLoaded();
      return () => listeners.delete(listener);
    },
    () => attempts,
    () => EMPTY
  );
}

export function findQuizAttempt(id: string | undefined | null) {
  return id ? attempts.find((attempt) => attempt.id === id) : undefined;
}

export async function recordQuizAttempt(
  attempt: Omit<QuizAttempt, 'id' | 'completedAt' | 'attemptType'> & { id?: string; completedAt?: number }
): Promise<QuizAttempt> {
  await ensureLoaded();
  const savedAttempt: QuizAttempt = {
    ...attempt,
    id: isUuid(attempt.id) ? attempt.id : createLearningRecordId(),
    attemptType: attemptTypeFor(attempt.kind),
    completedAt: attempt.completedAt ?? Date.now(),
  };
  attempts = [savedAttempt, ...attempts.filter((item) => item.id !== savedAttempt.id)].slice(0, MAX_ATTEMPTS);
  notify();
  await saveLocalHistory();
  void saveCloudQuizAttempt(toCloudAttempt(savedAttempt));
  return savedAttempt;
}

/** Await the cloud row when a follow-up server operation requires it. */
export function syncQuizAttemptToCloud(attempt: QuizAttempt) {
  return saveCloudQuizAttempt(toCloudAttempt(attempt));
}

let activeLearningUserId: string | null | undefined;
subscribeToLearningAuthChanges((userId) => {
  if (activeLearningUserId === userId) return;
  activeLearningUserId = userId;
  attempts = [];
  loadPromise = null;
  notify();
  if (userId) void ensureLoaded();
});
