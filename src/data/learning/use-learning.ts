import { useMemo, useSyncExternalStore } from 'react';

import { useLessonSessions } from '@/data/learning/lesson-sessions';
import type { MemoryModel } from '@/data/learning/memory';
import type { LearningInputs } from '@/data/learning/progress-model';
import { completionsFromProgress, getMemoryModel } from '@/data/learning/state';
import { type ProgressData, useProgress } from '@/data/progress';
import { isQuestionHistoryLoaded, type QuestionAttempt, useQuestionHistory } from '@/data/question-history';
import { type QuizAttempt, useQuizHistory } from '@/data/quiz-history';
import { useLegacySchedules } from '@/data/review';

// ─── A shared minute clock ───────────────────────────────────────────
// "Due now" changes with time; one interval serves every screen.
let now = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;
const clockListeners = new Set<() => void>();

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now();
      clockListeners.forEach((fn) => fn());
    }, 60 * 1000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function useNow(): number {
  return useSyncExternalStore(
    subscribeClock,
    () => now,
    () => now
  );
}

// Called after the learner acts, so derived "due" states refresh at once.
export function touchClock() {
  now = Date.now();
  clockListeners.forEach((fn) => fn());
}

export type LearningSnapshot = {
  progress: ProgressData;
  attempts: readonly QuestionAttempt[];
  quizzes: readonly QuizAttempt[];
  memory: MemoryModel;
  inputs: LearningInputs;
  now: number;
  historyReady: boolean;
};

// Everything a learning screen needs, from the canonical stores.
export function useLearning(): LearningSnapshot {
  const progress = useProgress();
  const attempts = useQuestionHistory();
  const quizzes = useQuizHistory();
  const sessions = useLessonSessions();
  const legacy = useLegacySchedules();
  const current = useNow();

  const completions = completionsFromProgress(progress);
  const memory = getMemoryModel(attempts, completions, legacy, current);

  const inputs = useMemo<LearningInputs>(
    () => ({
      completedAt: Object.fromEntries(completions.map((item) => [item.lessonId, item.completedAt])),
      memory,
      quizzes,
      sessions,
      now: current,
    }),
    [completions, memory, quizzes, sessions, current]
  );

  return {
    progress,
    attempts,
    quizzes,
    memory,
    inputs,
    now: current,
    historyReady: isQuestionHistoryLoaded(),
  };
}
