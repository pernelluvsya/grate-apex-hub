import { useSyncExternalStore } from 'react';

import {
  getAuthenticatedLearningUserId,
  readLearningCache,
  subscribeToLearningAuthChanges,
  writeLearningCache,
} from '@/data/learning-sync';

// Resume state for lessons in progress, so a learner who leaves halfway
// never loses their place: which layer they are in, the position in the
// interactive steps (including retries queued for the end), what they
// got right on the first try and which concepts they missed.
//
// Stored on this device (account-scoped). Cross-device resume is a
// planned extension (see the learning-engine migration notes).

export type LessonPhase = 'interactive' | 'reading' | 'complete';

export type QueueEntry = { step: number; retry: boolean };

export type LessonSession = {
  lessonId: string;
  contentVersion: number;
  startedAt: number;
  updatedAt: number;
  phase: LessonPhase;
  queue: QueueEntry[];
  position: number; // index into queue
  firstTryCorrect: number;
  checkpoints: number; // first-try checkpoints answered
  missed: string[]; // concept names missed in the interactive layer
  recalled: Record<string, 'yes' | 'partial' | 'no'>;
};

const STORAGE_KEY = 'grateapex_lesson_sessions';
const EMPTY: Record<string, LessonSession> = {};

let sessions: Record<string, LessonSession> = {};
let loadPromise: Promise<void> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

async function load() {
  try {
    const requestedUserId = await getAuthenticatedLearningUserId();
    const saved = await readLearningCache(STORAGE_KEY);
    if ((await getAuthenticatedLearningUserId()) !== requestedUserId) return;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        sessions = parsed;
        notify();
      }
    }
  } catch (error) {
    console.log('Could not load lesson sessions:', error);
  }
}

function persistSoon() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void writeLearningCache(STORAGE_KEY, JSON.stringify(sessions)).catch((error) =>
      console.log('Could not save lesson sessions:', error)
    );
  }, 300);
}

export function ensureLessonSessionsLoaded() {
  if (!loadPromise) loadPromise = load();
  return loadPromise;
}

export function useLessonSessions(): Record<string, LessonSession> {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      void ensureLessonSessionsLoaded();
      return () => listeners.delete(listener);
    },
    () => sessions,
    () => EMPTY
  );
}

export function getLessonSession(lessonId: string): LessonSession | undefined {
  return sessions[lessonId];
}

export function saveLessonSession(session: LessonSession) {
  sessions = { ...sessions, [session.lessonId]: { ...session, updatedAt: Date.now() } };
  notify();
  persistSoon();
}

export function clearLessonSession(lessonId: string) {
  if (!sessions[lessonId]) return;
  const next = { ...sessions };
  delete next[lessonId];
  sessions = next;
  notify();
  persistSoon();
}

export async function resetLessonSessions() {
  await ensureLessonSessionsLoaded();
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
  sessions = {};
  notify();
  await writeLearningCache(STORAGE_KEY, JSON.stringify(sessions));
}

export function newLessonSession(lessonId: string, stepCount: number, contentVersion: number): LessonSession {
  const now = Date.now();
  return {
    lessonId,
    contentVersion,
    startedAt: now,
    updatedAt: now,
    phase: stepCount > 0 ? 'interactive' : 'reading',
    queue: Array.from({ length: stepCount }, (_, step) => ({ step, retry: false })),
    position: 0,
    firstTryCorrect: 0,
    checkpoints: 0,
    missed: [],
    recalled: {},
  };
}

let activeLearningUserId: string | null | undefined;
subscribeToLearningAuthChanges((userId) => {
  if (activeLearningUserId === userId) return;
  activeLearningUserId = userId;
  sessions = {};
  loadPromise = null;
  notify();
  if (userId) void ensureLessonSessionsLoaded();
});
