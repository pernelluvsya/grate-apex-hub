import { useSyncExternalStore } from 'react';

import {
  createLearningRecordId,
  getAuthenticatedLearningUserId,
  loadCloudLearningEvents,
  readLearningCache,
  saveCloudLearningEvents,
  subscribeToLearningAuthChanges,
  writeLearningCache,
} from '@/data/learning-sync';

// The learning event log — a timeline of meaningful learning moments.
//
// Answered questions are NOT duplicated here: they live in the question
// history (data/question-history.ts), which is the canonical retrieval
// log. Events record everything else, and power activity feeds, profile
// history, analytics and (later) social features such as achievements.
//
// Stored locally (account-scoped) and in Supabase `learning_events` once
// the learning-engine migration has been applied.

export type LearningEventType =
  | 'LESSON_STARTED'
  | 'LESSON_COMPLETED'
  | 'QUIZ_STARTED'
  | 'QUIZ_COMPLETED'
  | 'REVIEW_STARTED'
  | 'REVIEW_COMPLETED'
  | 'CONCEPT_MASTERED'
  | 'TOPIC_COMPLETED'
  | 'APEX_CHALLENGE_STARTED'
  | 'APEX_CHALLENGE_COMPLETED';

export type LearningEvent = {
  id: string;
  type: LearningEventType;
  at: number;
  topicId: string | null;
  lessonId: string | null;
  refId: string | null; // attempt id, concept key, course id…
  data: Record<string, unknown> | null;
};

const STORAGE_KEY = 'grateapex_learning_events';
const LIMIT = 1500;
const EMPTY: LearningEvent[] = [];

let events: LearningEvent[] = []; // newest first
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

async function save() {
  try {
    await writeLearningCache(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.log('Could not save learning events:', error);
  }
}

async function load() {
  try {
    const requestedUserId = await getAuthenticatedLearningUserId();
    const saved = await readLearningCache(STORAGE_KEY);
    if ((await getAuthenticatedLearningUserId()) !== requestedUserId) return;
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        events = parsed.filter(
          (item): item is LearningEvent =>
            Boolean(item) && typeof item === 'object' && typeof item.id === 'string' && typeof item.type === 'string' && typeof item.at === 'number'
        );
        notify();
      }
    }
  } catch (error) {
    console.log('Could not load learning events:', error);
  }

  const remote = await loadCloudLearningEvents();
  const localIds = new Set(events.map((event) => event.id));
  const remoteIds = new Set(remote.map((event) => event.id));
  const byId = new Map(events.map((event) => [event.id, event]));
  for (const event of remote) {
    if (!byId.has(event.id)) byId.set(event.id, { ...event, type: event.type as LearningEventType });
  }
  events = Array.from(byId.values()).sort((a, b) => b.at - a.at).slice(0, LIMIT);
  notify();
  await save();
  // Also retry local-only events when the cloud has no rows yet.
  await saveCloudLearningEvents(events.filter((event) => localIds.has(event.id) && !remoteIds.has(event.id)));
}

export function ensureEventsLoaded() {
  if (!loadPromise) loadPromise = load();
  return loadPromise;
}

/** Retry uploading this device's learning timeline after reconnecting. */
export async function syncLearningEvents() {
  await ensureEventsLoaded();
  await load();
}

export function getLearningEvents() {
  return events;
}

export async function resetLearningEvents() {
  await ensureEventsLoaded();
  events = [];
  notify();
  await save();
}

export function useLearningEvents() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      void ensureEventsLoaded();
      return () => listeners.delete(listener);
    },
    () => events,
    () => EMPTY
  );
}

export async function logLearningEvent(
  type: LearningEventType,
  fields: { topicId?: string | null; lessonId?: string | null; refId?: string | null; data?: Record<string, unknown> | null; at?: number } = {}
): Promise<LearningEvent> {
  await ensureEventsLoaded();
  const event: LearningEvent = {
    id: createLearningRecordId(),
    type,
    at: fields.at ?? Date.now(),
    topicId: fields.topicId ?? null,
    lessonId: fields.lessonId ?? null,
    refId: fields.refId ?? null,
    data: fields.data ?? null,
  };
  events = [event, ...events].slice(0, LIMIT);
  notify();
  await save();
  await saveCloudLearningEvents([event]);
  return event;
}

let activeLearningUserId: string | null | undefined;
subscribeToLearningAuthChanges((userId) => {
  if (activeLearningUserId === userId) return;
  activeLearningUserId = userId;
  events = [];
  loadPromise = null;
  notify();
  if (userId) void ensureEventsLoaded();
});
