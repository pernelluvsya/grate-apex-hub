// Shared, memoized learning state (no React). Several screens and the
// action services need the same memory model; it is computed once per
// change of history (or per minute, for "due now") and reused.
import { getLegacySchedulesSnapshot } from '@/data/review';
import { getProgressSnapshot, type ProgressData } from '@/data/progress';
import { getQuestionHistory } from '@/data/question-history';
import {
  buildMemoryModel,
  type HistoryAttempt,
  type LegacySchedule,
  type LessonCompletion,
  type MemoryModel,
} from '@/data/learning/memory';
import { DAY_MS } from '@/data/learning/time';

// Lesson completions with times. Completions saved before times were
// recorded get an approximate time (the last activity day), so their
// concepts still enter the review schedule.
let completionCache: { source: ProgressData['lessonCompletedAt'] | null; lessons: string[]; value: LessonCompletion[] } = {
  source: null,
  lessons: [],
  value: [],
};

export function completionsFromProgress(progress: Pick<ProgressData, 'completedLessons' | 'lessonCompletedAt' | 'lastActivityDate'>): LessonCompletion[] {
  if (completionCache.source === progress.lessonCompletedAt && completionCache.lessons === progress.completedLessons) {
    return completionCache.value;
  }
  let approx = Date.now() - DAY_MS;
  if (progress.lastActivityDate) {
    const [y, m, d] = progress.lastActivityDate.split('-').map(Number);
    const parsed = new Date(y, (m ?? 1) - 1, d ?? 1, 12).getTime();
    if (Number.isFinite(parsed)) approx = parsed;
  }
  const value = progress.completedLessons.map((lessonId) => ({
    lessonId,
    completedAt: progress.lessonCompletedAt[lessonId] ?? approx,
  }));
  completionCache = { source: progress.lessonCompletedAt, lessons: progress.completedLessons, value };
  return value;
}

function completionSignature(completions: readonly LessonCompletion[]) {
  return completions.map((item) => `${item.lessonId}@${item.completedAt}`).join('|');
}

let modelCache: {
  attempts: readonly HistoryAttempt[];
  completions: string;
  legacy: readonly LegacySchedule[];
  minute: number;
  model: MemoryModel;
} | null = null;

export function getMemoryModel(
  attempts: readonly HistoryAttempt[],
  completions: readonly LessonCompletion[],
  legacy: readonly LegacySchedule[],
  now: number
): MemoryModel {
  const minute = Math.floor(now / 60000);
  const signature = completionSignature(completions);
  if (
    modelCache &&
    modelCache.attempts === attempts &&
    modelCache.completions === signature &&
    modelCache.legacy === legacy &&
    modelCache.minute === minute
  ) {
    return modelCache.model;
  }
  const model = buildMemoryModel({ attempts, completions, legacy, now });
  modelCache = { attempts, completions: signature, legacy, minute, model };
  return model;
}

// The current model from the stores (for services, outside React).
export function currentMemoryModel(now = Date.now(), excludeSessionId?: string): MemoryModel {
  const progress = getProgressSnapshot();
  const history = getQuestionHistory();
  const attempts = excludeSessionId ? history.filter((attempt) => attempt.sessionId !== excludeSessionId) : history;
  if (excludeSessionId) {
    return buildMemoryModel({
      attempts,
      completions: completionsFromProgress(progress),
      legacy: getLegacySchedulesSnapshot(),
      now,
    });
  }
  return getMemoryModel(attempts, completionsFromProgress(progress), getLegacySchedulesSnapshot(), now);
}
